/**
 * POST /api/auth/login
 * GET  /api/auth/me
 * POST /api/auth/logout
 */
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const db = require('../config/db');
const jwtConfig = require('../config/jwt');
const { authMiddleware } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Email and password are required.' },
      });
    }

    // Find user
    const { rows } = await db.query(
      'SELECT id, name, email, password_hash, role, state, district FROM users WHERE email = $1 AND is_active = true',
      [email.toLowerCase()]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
      });
    }

    const user = rows[0];

    // Check password
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
      });
    }

    // Sign JWT
    const payload = {
      id:       user.id,
      name:     user.name,
      email:    user.email,
      role:     user.role,
      state:    user.state,
      district: user.district,
    };

    const accessToken = jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });

    // Log login in audit
    await db.query(
      'INSERT INTO audit_logs (entity_type, entity_id, action, actor_id, new_value) VALUES ($1,$2,$3,$4,$5)',
      ['USER', user.id, 'USER_LOGIN', user.id, JSON.stringify({ email: user.email })]
    ).catch(() => {}); // non-critical

    res.json({
      success: true,
      data: {
        accessToken,
        user: payload,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT id, name, email, role, state, district FROM users WHERE id = $1',
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found.' } });
    }
    res.json({ success: true, data: { accessToken: null, user: rows[0] } });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout  (stateless JWT — just acknowledge)
router.post('/logout', authMiddleware, (req, res) => {
  res.json({ success: true, data: { message: 'Logged out successfully.' } });
});

module.exports = router;
