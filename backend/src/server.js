/**
 * NLAS Backend — National Land Acquisition System
 * Express REST API server
 */
require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');
const path      = require('path');

const errorHandler = require('./middleware/errorHandler');

// ── Route imports ──────────────────────────────────────────────────────────────
const authRoutes         = require('./routes/auth');
const projectRoutes      = require('./routes/projects');
const workflowRoutes     = require('./routes/workflow');
const parcelRoutes       = require('./routes/parcels');
const gisRoutes          = require('./routes/gis');
const analyticsRoutes    = require('./routes/analytics');
const compensationRoutes = require('./routes/compensation');
const rnrRoutes          = require('./routes/rnr');
const documentRoutes     = require('./routes/documents');
const objectionRoutes    = require('./routes/objections');
const auditRoutes        = require('./routes/audit');
const alertRoutes        = require('./routes/alerts');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Security middleware ────────────────────────────────────────────────────────
app.use(helmet());

app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting — 200 requests per 15 minutes per IP
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      200,
  message:  { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later.' } },
}));

// ── Body parsing ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static file serving (uploaded documents) ───────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads')));

// ── Health check (no auth required) ───────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status:    'ok',
    service:   'NLAS Backend',
    timestamp: new Date().toISOString(),
    version:   '1.0.0',
  });
});

// ── API Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/projects',     projectRoutes);
app.use('/api/workflow',     workflowRoutes);
app.use('/api/parcels',      parcelRoutes);
app.use('/api/gis',          gisRoutes);
app.use('/api/analytics',    analyticsRoutes);
app.use('/api/compensation',  compensationRoutes);
app.use('/api/rnr',          rnrRoutes);
app.use('/api/documents',    documentRoutes);
app.use('/api/objections',   objectionRoutes);
app.use('/api/audit-logs',   auditRoutes);
app.use('/api/alerts',       alertRoutes);

// ── 404 handler ────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.path} not found.` },
  });
});

// ── Global error handler ───────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start server ───────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀  NLAS Backend running on http://localhost:${PORT}`);
  console.log(`📋  Health check: http://localhost:${PORT}/health`);
  console.log(`🌍  Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;
