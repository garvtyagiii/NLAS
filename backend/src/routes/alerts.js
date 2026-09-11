/** GET /api/alerts — system alerts and notifications for the logged-in user */
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', async (req, res, next) => {
  try {
    // Scope alerts to the user's role/state/district
    let scopeWhere = '1=1';
    const params = [req.user.id];
    let i = 2;

    if (req.user.role === 'STATE_OFFICER' && req.user.state) {
      scopeWhere = `(a.target_user_id = $1 OR a.target_state = $${i++})`;
      params.push(req.user.state);
    } else if (req.user.role === 'DISTRICT_OFFICER' && req.user.district) {
      scopeWhere = `(a.target_user_id = $1 OR a.target_district = $${i++})`;
      params.push(req.user.district);
    } else {
      scopeWhere = `(a.target_user_id = $1 OR a.target_user_id IS NULL)`;
    }

    const { rows } = await db.query(`
      SELECT
        a.id, a.title, a.message, a.severity, a.project_id, a.is_read, a.created_at AS timestamp
      FROM alerts a
      WHERE ${scopeWhere}
      ORDER BY a.severity DESC, a.created_at DESC
      LIMIT 50
    `, params);

    const unreadCount = rows.filter(r => !r.is_read).length;

    res.json({
      success: true,
      data: {
        unreadCount,
        alerts: rows.map(a => ({
          id:        a.id,
          title:     a.title,
          message:   a.message,
          severity:  a.severity,
          projectId: a.project_id,
          read:      a.is_read,
          timestamp: a.timestamp,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
