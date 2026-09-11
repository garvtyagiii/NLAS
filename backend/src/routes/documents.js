/**
 * GET  /api/documents/project/:projectId  — list documents
 * POST /api/documents/upload              — upload a document (multipart/form-data)
 */
const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const router  = express.Router();
const db      = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware);

// ── Multer config ──────────────────────────────────────────────────────────────
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE_MB || '20') * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.xlsx', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('File type not allowed.'));
  },
});

// ── GET /api/documents/project/:projectId ─────────────────────────────────────
router.get('/project/:projectId', async (req, res, next) => {
  try {
    const { rows } = await db.query(`
      SELECT d.id, d.filename, d.type, d.version, d.file_size, d.created_at AS timestamp,
             u.name AS uploaded_by
      FROM documents d
      LEFT JOIN users u ON u.id = d.uploaded_by
      WHERE d.project_id = $1
      ORDER BY d.created_at DESC
    `, [req.params.projectId]);

    res.json({
      success: true,
      data: rows.map(d => ({
        id:         d.id,
        filename:   d.filename,
        type:       d.type,
        version:    d.version,
        size:       d.file_size,
        uploadedBy: d.uploaded_by,
        timestamp:  d.timestamp,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/documents/upload ─────────────────────────────────────────────────
router.post(
  '/upload',
  requireRole('CENTRAL_OFFICER', 'STATE_OFFICER', 'DISTRICT_OFFICER'),
  upload.single('file'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'No file uploaded.' } });
      }

      const { projectId, type = 'OTHER' } = req.body;
      if (!projectId) {
        fs.unlink(req.file.path, () => {});
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'projectId is required.' } });
      }

      // Get next version for same project+type
      const verRes = await db.query(
        'SELECT COALESCE(MAX(version), 0) + 1 AS next_ver FROM documents WHERE project_id = $1 AND type = $2',
        [projectId, type]
      );

      const { rows } = await db.query(`
        INSERT INTO documents (id, project_id, filename, file_path, type, version, file_size, uploaded_by)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        RETURNING *
      `, [
        uuidv4(), projectId,
        req.file.originalname, req.file.filename,
        type, verRes.rows[0].next_ver,
        req.file.size, req.user.id,
      ]);

      await db.query(
        `INSERT INTO audit_logs (entity_type, entity_id, action, actor_id, new_value)
         VALUES ('PROJECT',$1,'DOCUMENT_UPLOADED',$2,$3)`,
        [projectId, req.user.id, JSON.stringify({ filename: req.file.originalname, type })]
      ).catch(() => {});

      res.status(201).json({
        success: true,
        data: {
          id:       rows[0].id,
          filename: rows[0].filename,
          type:     rows[0].type,
          version:  rows[0].version,
          size:     rows[0].file_size,
        },
      });
    } catch (err) {
      if (req.file) fs.unlink(req.file.path, () => {});
      next(err);
    }
  }
);

module.exports = router;
