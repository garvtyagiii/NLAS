/**
 * GET  /api/parcels           — list parcels for a project
 * GET  /api/parcels/:id       — single parcel detail (owners, compensation, rnr, objections)
 */
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// ── GET /api/parcels ───────────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const { projectId, status, village, search, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'projectId is required.' },
      });
    }

    let conditions = ['p.project_id = $1'];
    let params = [projectId];
    let i = 2;

    if (status)  { conditions.push(`p.status = $${i++}`);                    params.push(status); }
    if (village) { conditions.push(`p.village ILIKE $${i++}`);               params.push(`%${village}%`); }
    if (search)  { conditions.push(`(p.khasra_no ILIKE $${i} OR p.id ILIKE $${i} OR p.village ILIKE $${i})`); params.push(`%${search}%`); i++; }

    const where = conditions.join(' AND ');
    const countRes = await db.query(`SELECT COUNT(*) FROM parcels p WHERE ${where}`, params);

    const { rows } = await db.query(`
      SELECT
        p.id, p.khasra_no, p.village, p.district, p.area, p.status,
        p.owners_count, p.affected_families, p.land_type
      FROM parcels p
      WHERE ${where}
      ORDER BY p.khasra_no
      LIMIT $${i} OFFSET $${i+1}
    `, [...params, parseInt(limit), offset]);

    res.json({
      success: true,
      data: rows.map(r => ({
        id:              r.id,
        khasraNo:        r.khasra_no,
        village:         r.village,
        district:        r.district,
        area:            parseFloat(r.area),
        status:          r.status,
        ownersCount:     r.owners_count,
        affectedFamilies: r.affected_families,
        landType:        r.land_type,
      })),
      pagination: {
        page: parseInt(page),
        total: parseInt(countRes.rows[0].count),
        totalPages: Math.ceil(parseInt(countRes.rows[0].count) / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/parcels/:id ───────────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await db.query(`
      SELECT
        p.id, p.khasra_no, p.village, p.district, p.state,
        p.area, p.status, p.owners_count, p.affected_families,
        p.land_type, p.project_id
      FROM parcels p
      WHERE p.id = $1
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Parcel not found.' } });
    }
    const p = rows[0];

    // Owners
    const ownersRes = await db.query(
      'SELECT id, name, share FROM parcel_owners WHERE parcel_id = $1 ORDER BY share DESC',
      [p.id]
    );

    // Compensation
    const compRes = await db.query(
      'SELECT assessed, approved, disbursed, status FROM compensation WHERE parcel_id = $1',
      [p.id]
    );
    const comp = compRes.rows[0] || null;

    // R&R
    const rnrRes = await db.query(`
      SELECT affected_families, displacement, rehabilitation_status, resettlement_status, benefits
      FROM rnr WHERE parcel_id = $1
    `, [p.id]);
    const rnr = rnrRes.rows[0] || null;

    // Objections (last 5)
    const objRes = await db.query(`
      SELECT id, raised_by, reason, status, resolution, created_at AS date
      FROM objections WHERE parcel_id = $1
      ORDER BY created_at DESC LIMIT 5
    `, [p.id]);

    res.json({
      success: true,
      data: {
        id:              p.id,
        khasraNo:        p.khasra_no,
        village:         p.village,
        district:        p.district,
        state:           p.state,
        area:            parseFloat(p.area),
        status:          p.status,
        ownersCount:     p.owners_count,
        affectedFamilies: p.affected_families,
        landType:        p.land_type,
        projectId:       p.project_id,
        owners:          ownersRes.rows.map(o => ({ id: o.id, name: o.name, share: parseFloat(o.share) })),
        compensation:    comp ? {
          assessed:  parseFloat(comp.assessed),
          approved:  parseFloat(comp.approved),
          disbursed: parseFloat(comp.disbursed),
          pending:   parseFloat(comp.assessed) - parseFloat(comp.disbursed),
          status:    comp.status,
        } : null,
        rnr: rnr ? {
          affectedFamilies:    rnr.affected_families,
          displacement:        rnr.displacement,
          rehabilitationStatus: rnr.rehabilitation_status,
          resettlementStatus:  rnr.resettlement_status,
          benefits:            rnr.benefits || [],
        } : null,
        objections: objRes.rows.map(o => ({
          id:         o.id,
          raisedBy:   o.raised_by,
          reason:     o.reason,
          status:     o.status,
          resolution: o.resolution,
          date:       o.date,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
