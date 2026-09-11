/**
 * GET  /api/projects          — list with search/filter/pagination
 * POST /api/projects          — create
 * GET  /api/projects/:id      — detail
 * PATCH /api/projects/:id     — update
 */
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware, requireRole } = require('../middleware/auth');

// All project routes require auth
router.use(authMiddleware);

// ── GET /api/projects ──────────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const { search, state, status, type, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let conditions = ['1=1'];
    let params = [];
    let i = 1;

    // Role-based filter: state/district officers see only their scope
    if (req.user.role === 'STATE_OFFICER' && req.user.state) {
      conditions.push(`p.state = $${i++}`);
      params.push(req.user.state);
    } else if (req.user.role === 'DISTRICT_OFFICER' && req.user.district) {
      conditions.push(`p.district = $${i++}`);
      params.push(req.user.district);
    }

    if (search) {
      conditions.push(`(p.name ILIKE $${i} OR p.code ILIKE $${i})`);
      params.push(`%${search}%`);
      i++;
    }
    if (state) { conditions.push(`p.state = $${i++}`); params.push(state); }
    if (status) { conditions.push(`p.status = $${i++}`); params.push(status); }
    if (type)   { conditions.push(`p.type = $${i++}`);   params.push(type); }

    const where = conditions.join(' AND ');

    const countRes = await db.query(`SELECT COUNT(*) FROM projects p WHERE ${where}`, params);
    const total = parseInt(countRes.rows[0].count);

    const { rows } = await db.query(`
      SELECT
        p.id, p.name, p.code, p.type, p.department, p.state, p.district,
        p.status, p.progress, p.required_area, p.acquired_area,
        p.target_date, p.affected_families,
        (SELECT COUNT(*) FROM objections o WHERE o.project_id = p.id AND o.status = 'OPEN') AS open_objections
      FROM projects p
      WHERE ${where}
      ORDER BY p.updated_at DESC
      LIMIT $${i} OFFSET $${i+1}
    `, [...params, parseInt(limit), offset]);

    res.json({
      success: true,
      data: {
        projects: rows.map(r => ({
          id:              r.id,
          name:            r.name,
          code:            r.code,
          type:            r.type,
          department:      r.department,
          state:           r.state,
          district:        r.district,
          status:          r.status,
          progress:        r.progress,
          requiredArea:    parseFloat(r.required_area),
          acquiredArea:    parseFloat(r.acquired_area),
          targetDate:      r.target_date,
          affectedFamilies: r.affected_families,
          openObjections:  parseInt(r.open_objections),
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/projects ─────────────────────────────────────────────────────────
router.post('/', requireRole('CENTRAL_OFFICER', 'STATE_OFFICER'), async (req, res, next) => {
  try {
    const { name, type, department, state, district, requiredArea, targetDate } = req.body;

    if (!name || !type || !state || !district || !requiredArea || !targetDate) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Missing required fields.' },
      });
    }

    const id   = uuidv4();
    const code = 'PRJ-' + Date.now().toString().slice(-6);

    const { rows } = await db.query(`
      INSERT INTO projects (id, name, code, type, department, state, district, required_area, target_date, status, created_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'DRAFT',$10)
      RETURNING *
    `, [id, name, code, type, department, state, district, requiredArea, targetDate, req.user.id]);

    const p = rows[0];

    // Audit
    await db.query(
      'INSERT INTO audit_logs (entity_type, entity_id, action, actor_id, new_value) VALUES ($1,$2,$3,$4,$5)',
      ['PROJECT', p.id, 'PROJECT_CREATED', req.user.id, JSON.stringify({ name, type, state })]
    ).catch(() => {});

    res.status(201).json({
      success: true,
      data: {
        id: p.id, name: p.name, code: p.code, type: p.type,
        department: p.department, state: p.state, district: p.district,
        status: p.status, progress: 0, requiredArea: parseFloat(p.required_area),
        targetDate: p.target_date, createdAt: p.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/projects/:id ──────────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await db.query(`
      SELECT
        p.*,
        u.name AS created_by_name,
        (SELECT COUNT(*) FROM parcels pc WHERE pc.project_id = p.id) AS parcel_count,
        (SELECT COUNT(*) FROM objections o WHERE o.project_id = p.id AND o.status = 'OPEN') AS open_objections
      FROM projects p
      LEFT JOIN users u ON u.id = p.created_by
      WHERE p.id = $1
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found.' } });
    }

    const p = rows[0];
    res.json({
      success: true,
      data: {
        id:              p.id,
        name:            p.name,
        code:            p.code,
        type:            p.type,
        department:      p.department,
        state:           p.state,
        district:        p.district,
        status:          p.status,
        progress:        p.progress,
        requiredArea:    parseFloat(p.required_area),
        acquiredArea:    parseFloat(p.acquired_area || 0),
        targetDate:      p.target_date,
        startDate:       p.start_date,
        affectedFamilies: p.affected_families,
        parcelCount:     parseInt(p.parcel_count),
        openObjections:  parseInt(p.open_objections),
        description:     p.description,
        currentMilestone: p.current_milestone,
        nextAction:      p.next_action,
        createdAt:       p.created_at,
        updatedAt:       p.updated_at,
        createdBy:       { id: p.created_by, name: p.created_by_name },
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/projects/:id ────────────────────────────────────────────────────
router.patch('/:id', requireRole('CENTRAL_OFFICER', 'STATE_OFFICER', 'DISTRICT_OFFICER'), async (req, res, next) => {
  try {
    const { name, type, department, state, district, requiredArea, targetDate, description } = req.body;

    const fields = [];
    const values = [];
    let i = 1;

    if (name)         { fields.push(`name = $${i++}`);          values.push(name); }
    if (type)         { fields.push(`type = $${i++}`);          values.push(type); }
    if (department)   { fields.push(`department = $${i++}`);    values.push(department); }
    if (state)        { fields.push(`state = $${i++}`);         values.push(state); }
    if (district)     { fields.push(`district = $${i++}`);      values.push(district); }
    if (requiredArea) { fields.push(`required_area = $${i++}`); values.push(requiredArea); }
    if (targetDate)   { fields.push(`target_date = $${i++}`);   values.push(targetDate); }
    if (description)  { fields.push(`description = $${i++}`);   values.push(description); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'No fields to update.' } });
    }

    fields.push(`updated_at = NOW()`);
    values.push(req.params.id);

    const { rows } = await db.query(
      `UPDATE projects SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found.' } });
    }

    await db.query(
      'INSERT INTO audit_logs (entity_type, entity_id, action, actor_id, new_value) VALUES ($1,$2,$3,$4,$5)',
      ['PROJECT', req.params.id, 'PROJECT_UPDATED', req.user.id, JSON.stringify(req.body)]
    ).catch(() => {});

    res.json({ success: true, data: { id: rows[0].id, ...req.body } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
