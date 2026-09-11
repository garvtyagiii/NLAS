/** GET /api/audit-logs — read-only audit trail */
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', async (req, res, next) => {
  try {
    const { projectId, entityId, entityType, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let conditions = ['1=1'];
    let params = [];
    let i = 1;

    if (projectId)   { conditions.push(`al.entity_id = $${i++}`);   params.push(projectId); }
    if (entityId)    { conditions.push(`al.entity_id = $${i++}`);   params.push(entityId); }
    if (entityType)  { conditions.push(`al.entity_type = $${i++}`); params.push(entityType); }

    const { rows } = await db.query(`
      SELECT
        al.id, al.entity_type, al.entity_id, al.action,
        al.old_value, al.new_value, al.comment,
        al.created_at AS timestamp,
        u.name AS officer
      FROM audit_logs al
      LEFT JOIN users u ON u.id = al.actor_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY al.created_at DESC
      LIMIT $${i} OFFSET $${i+1}
    `, [...params, parseInt(limit), offset]);

    res.json({
      success: true,
      data: rows.map(r => ({
        id:         r.id,
        entityType: r.entity_type,
        entityId:   r.entity_id,
        action:     r.action,
        oldValue:   r.old_value,
        newValue:   r.new_value,
        comment:    r.comment,
        timestamp:  r.timestamp,
        officer:    r.officer,
      })),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
