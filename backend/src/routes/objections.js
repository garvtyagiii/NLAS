/**
 * GET   /api/objections           — list objections (filter by projectId, status)
 * PATCH /api/objections/:id       — resolve an objection
 */
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware);

// ── GET /api/objections ────────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const { projectId, status, parcelId } = req.query;

    let conditions = ['1=1'];
    let params = [];
    let i = 1;

    if (projectId) { conditions.push(`o.project_id = $${i++}`); params.push(projectId); }
    if (parcelId)  { conditions.push(`o.parcel_id = $${i++}`);  params.push(parcelId); }
    if (status)    { conditions.push(`o.status = $${i++}`);     params.push(status); }

    const { rows } = await db.query(`
      SELECT
        o.id, o.raised_by, o.reason, o.status, o.resolution,
        o.created_at AS date,
        p.khasra_no, o.project_id, o.parcel_id
      FROM objections o
      LEFT JOIN parcels p ON p.id = o.parcel_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY o.created_at DESC
    `, params);

    res.json({
      success: true,
      data: rows.map(o => ({
        id:        o.id,
        raisedBy:  o.raised_by,
        reason:    o.reason,
        status:    o.status,
        resolution: o.resolution,
        date:      o.date,
        khasraNo:  o.khasra_no,
        projectId: o.project_id,
        parcelId:  o.parcel_id,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/objections/:id ─────────────────────────────────────────────────
router.patch('/:id', requireRole('CENTRAL_OFFICER', 'STATE_OFFICER', 'DISTRICT_OFFICER'), async (req, res, next) => {
  try {
    const { status, resolutionNote } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'status is required.' } });
    }
    if (status === 'RESOLVED' && !resolutionNote) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'resolutionNote is required when resolving.' } });
    }

    const { rows } = await db.query(`
      UPDATE objections
      SET status = $1, resolution = $2, resolved_by = $3, resolved_at = NOW(), updated_at = NOW()
      WHERE id = $4
      RETURNING id, project_id
    `, [status, resolutionNote || null, req.user.id, req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Objection not found.' } });
    }

    await db.query(
      `INSERT INTO audit_logs (entity_type, entity_id, action, actor_id, new_value)
       VALUES ('PROJECT',$1,'OBJECTION_RESOLVED',$2,$3)`,
      [rows[0].project_id, req.user.id, JSON.stringify({ objectionId: req.params.id, status, resolutionNote })]
    ).catch(() => {});

    res.json({ success: true, data: { id: req.params.id, status, resolutionNote } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
