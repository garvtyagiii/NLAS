/**
 * GET   /api/rnr/project/:projectId  — project-level R&R summary + family records
 * PATCH /api/rnr/:id                  — update a family's R&R status
 */
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware);

// ── GET /api/rnr/project/:projectId ─────────────────────────────────────────────
router.get('/project/:projectId', async (req, res, next) => {
  try {
    const { projectId } = req.params;

    // Summary counts
    const summaryRes = await db.query(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN rehabilitation_status = 'COMPLETED' THEN 1 ELSE 0 END) AS rehabilitation_completed,
        SUM(CASE WHEN resettlement_status   = 'COMPLETED' THEN 1 ELSE 0 END) AS resettlement_completed
      FROM rnr r
      JOIN parcels p ON p.id = r.parcel_id
      WHERE p.project_id = $1
    `, [projectId]);

    // Family-level records
    const familiesRes = await db.query(`
      SELECT
        r.id, r.head_name, r.village, r.displacement,
        r.compensation_status, r.rehabilitation_status, r.resettlement_status,
        r.benefits, r.affected_families,
        p.khasra_no
      FROM rnr r
      JOIN parcels p ON p.id = r.parcel_id
      WHERE p.project_id = $1
      ORDER BY r.head_name
    `, [projectId]);

    const s = summaryRes.rows[0];
    const total = parseInt(s.total);
    const rehab = parseInt(s.rehabilitation_completed);
    const reset = parseInt(s.resettlement_completed);

    res.json({
      success: true,
      data: {
        projectId,
        summary: {
          totalFamilies:             total,
          rehabilitationCompleted:   rehab,
          resettlementCompleted:     reset,
          pending:                   total - Math.max(rehab, reset),
        },
        families: familiesRes.rows.map(r => ({
          id:                   r.id,
          headName:             r.head_name,
          village:              r.village,
          displacement:         r.displacement,
          compensationStatus:   r.compensation_status,
          rehabilitationStatus: r.rehabilitation_status,
          resettlementStatus:   r.resettlement_status,
          benefits:             r.benefits || [],
          affectedFamilies:     r.affected_families,
          khasraNo:             r.khasra_no,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/rnr/:id ───────────────────────────────────────────────────────────
router.patch('/:id', requireRole('CENTRAL_OFFICER', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'FIELD_OFFICER'), async (req, res, next) => {
  try {
    const { rehabilitationStatus, resettlementStatus, compensationStatus, benefits } = req.body;

    const fields = [];
    const values = [];
    let i = 1;

    if (rehabilitationStatus) { fields.push(`rehabilitation_status = $${i++}`); values.push(rehabilitationStatus); }
    if (resettlementStatus)   { fields.push(`resettlement_status = $${i++}`);   values.push(resettlementStatus); }
    if (compensationStatus)   { fields.push(`compensation_status = $${i++}`);   values.push(compensationStatus); }
    if (benefits)             { fields.push(`benefits = $${i++}`);              values.push(JSON.stringify(benefits)); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'No fields to update.' } });
    }

    fields.push(`updated_at = NOW()`);
    values.push(req.params.id);

    const { rows } = await db.query(
      `UPDATE rnr SET ${fields.join(', ')} WHERE id = $${i} RETURNING id`,
      values
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'R&R record not found.' } });
    }

    await db.query(
      `INSERT INTO audit_logs (entity_type, entity_id, action, actor_id, new_value)
       VALUES ('RNR',$1,'RNR_UPDATED',$2,$3)`,
      [req.params.id, req.user.id, JSON.stringify(req.body)]
    ).catch(() => {});

    res.json({ success: true, data: { id: req.params.id, ...req.body } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
