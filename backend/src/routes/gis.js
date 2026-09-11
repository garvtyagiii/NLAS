/**
 * GET /api/gis/projects/:id   — project boundary + all parcel polygons as GeoJSON
 * GET /api/gis/parcels        — parcels GeoJSON filtered by projectId, status, etc.
 *
 * Requires PostGIS. Uses ST_AsGeoJSON to return geometry.
 * Frontend NEVER touches PostGIS directly — always via this API.
 */
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// ── GET /api/gis/projects/:id ──────────────────────────────────────────────────
// Returns a FeatureCollection with:
//   - 1 boundary feature (project corridor)
//   - N parcel features (lightweight: id, khasraNo, area, status, village)
router.get('/projects/:id', async (req, res, next) => {
  try {
    const projectId = req.params.id;

    // Project boundary
    const boundaryRes = await db.query(`
      SELECT
        name,
        ST_AsGeoJSON(boundary_geom)::json AS geometry
      FROM projects
      WHERE id = $1 AND boundary_geom IS NOT NULL
    `, [projectId]);

    // Parcel polygons (lightweight — no full detail, just what map needs)
    const parcelsRes = await db.query(`
      SELECT
        p.id,
        p.khasra_no,
        p.area,
        p.status,
        p.village,
        ST_AsGeoJSON(p.geom)::json AS geometry
      FROM parcels p
      WHERE p.project_id = $1 AND p.geom IS NOT NULL
      ORDER BY p.khasra_no
    `, [projectId]);

    const features = [];

    // Add boundary if exists
    if (boundaryRes.rows.length > 0) {
      const b = boundaryRes.rows[0];
      features.push({
        type: 'Feature',
        properties: { type: 'boundary', name: b.name },
        geometry: b.geometry,
      });
    }

    // Add parcel features
    for (const p of parcelsRes.rows) {
      features.push({
        type: 'Feature',
        properties: {
          id:       p.id,
          khasraNo: p.khasra_no,
          area:     parseFloat(p.area),
          status:   p.status,
          village:  p.village,
        },
        geometry: p.geometry,
      });
    }

    res.json({
      success: true,
      data: {
        type: 'FeatureCollection',
        features,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/gis/parcels ───────────────────────────────────────────────────────
// Filtered parcel GeoJSON (for search / filter use cases)
router.get('/parcels', async (req, res, next) => {
  try {
    const { projectId, status, village } = req.query;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'projectId is required.' },
      });
    }

    let conditions = ['p.project_id = $1'];
    let params = [projectId];
    let i = 2;

    if (status)  { conditions.push(`p.status = $${i++}`);          params.push(status); }
    if (village) { conditions.push(`p.village ILIKE $${i++}`);     params.push(`%${village}%`); }

    const { rows } = await db.query(`
      SELECT
        p.id, p.khasra_no, p.area, p.status, p.village,
        ST_AsGeoJSON(p.geom)::json AS geometry
      FROM parcels p
      WHERE ${conditions.join(' AND ')} AND p.geom IS NOT NULL
      ORDER BY p.khasra_no
    `, params);

    const features = rows.map(p => ({
      type: 'Feature',
      properties: {
        id: p.id, khasraNo: p.khasra_no,
        area: parseFloat(p.area), status: p.status, village: p.village,
      },
      geometry: p.geometry,
    }));

    res.json({
      success: true,
      data: { type: 'FeatureCollection', features },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
