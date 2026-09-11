/**
 * GET  /api/analytics/dashboard  — summary stats + charts data for the dashboard
 */
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/dashboard', async (req, res, next) => {
  try {
    // Build scope filter based on user role
    let scopeWhere = '1=1';
    let scopeParams = [];
    if (req.user.role === 'STATE_OFFICER' && req.user.state) {
      scopeWhere = 'state = $1'; scopeParams = [req.user.state];
    } else if (req.user.role === 'DISTRICT_OFFICER' && req.user.district) {
      scopeWhere = 'district = $1'; scopeParams = [req.user.district];
    }

    const [summaryRes, statusRes, stateRes, compRes, rnrRes, criticalRes] = await Promise.all([
      // Summary
      db.query(`
        SELECT
          COUNT(*) AS total_projects,
          COALESCE(SUM(required_area), 0) AS land_proposed,
          COALESCE(SUM(acquired_area), 0) AS land_acquired,
          COALESCE(SUM(affected_families), 0) AS affected_families
        FROM projects WHERE ${scopeWhere}
      `, scopeParams),

      // Status breakdown
      db.query(`
        SELECT status, COUNT(*) AS count
        FROM projects WHERE ${scopeWhere}
        GROUP BY status ORDER BY status
      `, scopeParams),

      // State-wise acquisition (top 8)
      db.query(`
        SELECT state,
          COALESCE(SUM(required_area), 0) AS proposed,
          COALESCE(SUM(acquired_area), 0) AS acquired
        FROM projects WHERE ${scopeWhere}
        GROUP BY state ORDER BY proposed DESC LIMIT 8
      `, scopeParams),

      // Compensation summary
      db.query(`
        SELECT
          COALESCE(SUM(c.assessed), 0) AS assessed,
          COALESCE(SUM(c.approved), 0) AS approved,
          COALESCE(SUM(c.disbursed), 0) AS disbursed
        FROM compensation c
        JOIN parcels p ON p.id = c.parcel_id
        JOIN projects pr ON pr.id = p.project_id
        WHERE ${scopeWhere.replace(/(\w+)\s*=/g, 'pr.$1 =')}
      `, scopeParams),

      // R&R summary
      db.query(`
        SELECT
          COUNT(*) AS total,
          SUM(CASE WHEN rehabilitation_status = 'COMPLETED' THEN 1 ELSE 0 END) AS rehabilitation,
          SUM(CASE WHEN resettlement_status = 'COMPLETED' THEN 1 ELSE 0 END) AS resettlement
        FROM rnr r
        JOIN parcels p ON p.id = r.parcel_id
        JOIN projects pr ON pr.id = p.project_id
        WHERE ${scopeWhere.replace(/(\w+)\s*=/g, 'pr.$1 =')}
      `, scopeParams),

      // Critical projects (high objections or low progress)
      db.query(`
        SELECT
          p.id, p.name, p.code, p.state, p.status, p.progress,
          (SELECT COUNT(*) FROM objections o WHERE o.project_id = p.id AND o.status = 'OPEN') AS open_objections
        FROM projects p
        WHERE ${scopeWhere} AND (p.progress < 50 OR p.status = 'DISPUTED')
        ORDER BY open_objections DESC, p.progress ASC
        LIMIT 5
      `, scopeParams),
    ]);

    const s = summaryRes.rows[0];
    const c = compRes.rows[0];
    const r = rnrRes.rows[0];

    const landProposed  = parseFloat(s.land_proposed);
    const landAcquired  = parseFloat(s.land_acquired);
    const compAssessed  = parseFloat(c.assessed);
    const compDisbursed = parseFloat(c.disbursed);
    const rnrTotal      = parseInt(r.total);
    const rnrRehab      = parseInt(r.rehabilitation);
    const rnrReset      = parseInt(r.resettlement);

    res.json({
      success: true,
      data: {
        summary: {
          totalProjects:           parseInt(s.total_projects),
          landProposed:            landProposed,
          landAcquired:            landAcquired,
          acquisitionPercent:      landProposed > 0 ? parseFloat(((landAcquired / landProposed) * 100).toFixed(1)) : 0,
          compensationAssessed:    compAssessed,
          compensationDisbursed:   compDisbursed,
          affectedFamilies:        parseInt(s.affected_families),
          rnrProgress:             rnrTotal > 0 ? parseFloat(((rnrRehab / rnrTotal) * 100).toFixed(1)) : 0,
        },
        stateWiseAcquisition: stateRes.rows.map(r => ({
          state:    r.state,
          proposed: parseFloat(r.proposed),
          acquired: parseFloat(r.acquired),
        })),
        projectProgress: statusRes.rows.map(r => ({
          name:  r.status,
          count: parseInt(r.count),
        })),
        compensationSummary: {
          assessed:  compAssessed,
          approved:  parseFloat(c.approved),
          disbursed: compDisbursed,
          pending:   compAssessed - compDisbursed,
        },
        rnrSummary: {
          total:          rnrTotal,
          rehabilitation: rnrRehab,
          resettlement:   rnrReset,
          pending:        rnrTotal - Math.max(rnrRehab, rnrReset),
        },
        criticalProjects: criticalRes.rows.map(p => ({
          id:            p.id,
          name:          p.name,
          code:          p.code,
          state:         p.state,
          status:        p.status,
          progress:      p.progress,
          openObjections: parseInt(p.open_objections),
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
