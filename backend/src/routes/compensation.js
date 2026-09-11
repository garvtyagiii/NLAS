/**
 * GET  /api/compensation/project/:projectId  — project-level compensation summary + records
 * POST /api/compensation/payment             — record a disbursement
 */
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware);

// ── GET /api/compensation/project/:projectId ────────────────────────────────────
router.get('/project/:projectId', async (req, res, next) => {
  try {
    const { projectId } = req.params;

    // Summary across all parcels
    const summaryRes = await db.query(`
      SELECT
        COALESCE(SUM(c.assessed), 0)  AS assessed,
        COALESCE(SUM(c.approved), 0)  AS approved,
        COALESCE(SUM(c.disbursed), 0) AS disbursed
      FROM compensation c
      JOIN parcels p ON p.id = c.parcel_id
      WHERE p.project_id = $1
    `, [projectId]);

    // Parcel-level records
    const recordsRes = await db.query(`
      SELECT
        c.parcel_id, c.assessed, c.approved, c.disbursed, c.status,
        p.khasra_no, p.village, p.affected_families AS families
      FROM compensation c
      JOIN parcels p ON p.id = c.parcel_id
      WHERE p.project_id = $1
      ORDER BY p.khasra_no
    `, [projectId]);

    const s = summaryRes.rows[0];
    const assessed  = parseFloat(s.assessed);
    const disbursed = parseFloat(s.disbursed);

    res.json({
      success: true,
      data: {
        projectId,
        summary: {
          assessed,
          approved:  parseFloat(s.approved),
          disbursed,
          pending:   assessed - disbursed,
        },
        records: recordsRes.rows.map(r => ({
          parcelId:  r.parcel_id,
          khasraNo:  r.khasra_no,
          village:   r.village,
          families:  r.families,
          assessed:  parseFloat(r.assessed),
          approved:  parseFloat(r.approved),
          disbursed: parseFloat(r.disbursed),
          pending:   parseFloat(r.assessed) - parseFloat(r.disbursed),
          status:    r.status,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/compensation/payment ─────────────────────────────────────────────
router.post('/payment', requireRole('CENTRAL_OFFICER', 'STATE_OFFICER', 'DISTRICT_OFFICER'), async (req, res, next) => {
  const client = await db.pool.connect();
  try {
    const { parcelId, amount, paymentDate, paymentReference } = req.body;

    if (!parcelId || !amount || !paymentDate || !paymentReference) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'parcelId, amount, paymentDate, and paymentReference are required.' },
      });
    }

    // Get current compensation record
    const compRes = await client.query(
      'SELECT * FROM compensation WHERE parcel_id = $1 FOR UPDATE',
      [parcelId]
    );

    if (compRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'No compensation record for this parcel.' } });
    }

    const comp = compRes.rows[0];
    const newDisbursed = parseFloat(comp.disbursed) + parseFloat(amount);

    if (newDisbursed > parseFloat(comp.assessed)) {
      return res.status(422).json({
        success: false,
        error: { code: 'EXCEEDS_ASSESSED', message: 'Payment amount exceeds assessed compensation.' },
      });
    }

    const newStatus = newDisbursed >= parseFloat(comp.assessed) ? 'PAID' : 'PARTIAL';

    await client.query('BEGIN');

    await client.query(
      'UPDATE compensation SET disbursed = $1, status = $2, updated_at = NOW() WHERE parcel_id = $3',
      [newDisbursed, newStatus, parcelId]
    );

    // Payment record
    await client.query(`
      INSERT INTO payment_records (parcel_id, amount, payment_date, payment_reference, recorded_by)
      VALUES ($1, $2, $3, $4, $5)
    `, [parcelId, amount, paymentDate, paymentReference, req.user.id]);

    // Audit
    await client.query(
      `INSERT INTO audit_logs (entity_type, entity_id, action, actor_id, new_value)
       VALUES ('PARCEL',$1,'COMPENSATION_RECORDED',$2,$3)`,
      [parcelId, req.user.id, JSON.stringify({ amount, paymentReference, newStatus })]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      data: {
        parcelId,
        disbursed: newDisbursed,
        status:    newStatus,
        paymentReference,
        recordedBy: req.user.name,
        timestamp:  new Date().toISOString(),
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
