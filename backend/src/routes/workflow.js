/**
 * GET  /api/workflow/:projectId      — get workflow history
 * POST /api/workflow/transition      — move project to next status
 */
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware);

// Valid workflow transitions (state machine)
const TRANSITIONS = {
  DRAFT:          'SUBMITTED',
  SUBMITTED:      'UNDER_SCRUTINY',
  UNDER_SCRUTINY: 'APPROVED',
  APPROVED:       'NOTIFICATION',
  NOTIFICATION:   'AWARD',
  AWARD:          'COMPENSATION',
  COMPENSATION:   'POSSESSION',
  POSSESSION:     'RNR',
  RNR:            'CLOSED',
};

// Who can trigger transitions
const TRANSITION_ROLES = ['CENTRAL_OFFICER', 'STATE_OFFICER', 'DISTRICT_OFFICER'];

// ── GET /api/workflow/:projectId ───────────────────────────────────────────────
router.get('/:projectId', async (req, res, next) => {
  try {
    // Current status from project
    const projRes = await db.query('SELECT id, status FROM projects WHERE id = $1', [req.params.projectId]);
    if (projRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found.' } });
    }

    // Workflow history
    const { rows } = await db.query(`
      SELECT wh.status, wh.comment, wh.created_at AS timestamp, u.name AS officer
      FROM workflow_history wh
      LEFT JOIN users u ON u.id = wh.actor_id
      WHERE wh.project_id = $1
      ORDER BY wh.created_at ASC
    `, [req.params.projectId]);

    res.json({
      success: true,
      data: {
        projectId:     req.params.projectId,
        currentStatus: projRes.rows[0].status,
        transitions:   rows.map(r => ({
          status:    r.status,
          timestamp: r.timestamp,
          officer:   r.officer,
          comment:   r.comment,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/workflow/transition ─────────────────────────────────────────────
router.post('/transition', requireRole(...TRANSITION_ROLES), async (req, res, next) => {
  const client = await db.pool.connect();
  try {
    const { projectId, nextStatus, comment } = req.body;

    if (!projectId || !nextStatus) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'projectId and nextStatus are required.' },
      });
    }

    // Get current status
    const projRes = await client.query('SELECT status FROM projects WHERE id = $1 FOR UPDATE', [projectId]);
    if (projRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found.' } });
    }

    const currentStatus = projRes.rows[0].status;

    // Validate transition
    if (TRANSITIONS[currentStatus] !== nextStatus) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'INVALID_WORKFLOW_TRANSITION',
          message: `Cannot transition from ${currentStatus} to ${nextStatus}.`,
        },
      });
    }

    await client.query('BEGIN');

    // Update project status
    await client.query(
      'UPDATE projects SET status = $1, updated_at = NOW() WHERE id = $2',
      [nextStatus, projectId]
    );

    // Record transition in history
    await client.query(
      'INSERT INTO workflow_history (project_id, status, actor_id, comment) VALUES ($1,$2,$3,$4)',
      [projectId, nextStatus, req.user.id, comment || null]
    );

    // Audit log
    await client.query(
      `INSERT INTO audit_logs (entity_type, entity_id, action, actor_id, old_value, new_value, comment)
       VALUES ('PROJECT',$1,'STATUS_TRANSITION',$2,$3,$4,$5)`,
      [projectId, req.user.id, JSON.stringify({ status: currentStatus }), JSON.stringify({ status: nextStatus }), comment || null]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      data: {
        projectId,
        previousStatus: currentStatus,
        currentStatus:  nextStatus,
        transitionedBy: req.user.name,
        timestamp:      new Date().toISOString(),
      },
    });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    next(err);
  } finally {
    client.release();
  }
});

module.exports = router;
