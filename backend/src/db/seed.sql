-- ============================================================
-- NLAS Demo Seed Data — matches the frontend golden demo exactly
-- Run AFTER schema.sql: psql -U postgres -d nlas_db -f seed.sql
-- ============================================================

-- ─── USERS (passwords are bcrypt of 'password123') ────────────────────────────
INSERT INTO users (id, name, email, password_hash, role, state, district) VALUES
  ('11111111-0000-0000-0000-000000000001',
   'Rajesh Kumar Sharma',
   'rajesh.sharma@nlas.gov.in',
   '$2b$10$Y1VrOfNpFHgGgJbsOlsHXubNp3NxYBa8RcIqFm/AqEKkLcBnRVH7C',
   'CENTRAL_OFFICER', NULL, NULL),

  ('11111111-0000-0000-0000-000000000002',
   'Priya Singh',
   'priya.singh@nlas.gov.in',
   '$2b$10$Y1VrOfNpFHgGgJbsOlsHXubNp3NxYBa8RcIqFm/AqEKkLcBnRVH7C',
   'STATE_OFFICER', 'Uttar Pradesh', NULL),

  ('11111111-0000-0000-0000-000000000003',
   'Amit Verma',
   'amit.verma@nlas.gov.in',
   '$2b$10$Y1VrOfNpFHgGgJbsOlsHXubNp3NxYBa8RcIqFm/AqEKkLcBnRVH7C',
   'DISTRICT_OFFICER', 'Uttar Pradesh', 'Ghaziabad'),

  ('11111111-0000-0000-0000-000000000004',
   'Suresh Patel',
   'suresh.patel@nlas.gov.in',
   '$2b$10$Y1VrOfNpFHgGgJbsOlsHXubNp3NxYBa8RcIqFm/AqEKkLcBnRVH7C',
   'FIELD_OFFICER', 'Uttar Pradesh', 'Ghaziabad')
ON CONFLICT (email) DO NOTHING;

-- ─── PROJECT PRJ-001 ──────────────────────────────────────────────────────────
INSERT INTO projects (
  id, name, code, type, department, state, district,
  status, progress, required_area, acquired_area, target_date, start_date,
  affected_families, description, current_milestone, next_action,
  boundary_geom, created_by, created_at
) VALUES (
  'PRJ-001-0000-0000-0000-000000000001',
  'Delhi-Meerut Expressway Expansion',
  'PRJ-001',
  'HIGHWAY',
  'Ministry of Road Transport & Highways',
  'Uttar Pradesh', 'Ghaziabad',
  'COMPENSATION', 72,
  1240.5, 892.8,
  '2026-12-31', '2023-04-01',
  2840,
  'Expansion of the Delhi-Meerut Expressway from 6-lane to 14-lane carriageway spanning 82 km through Ghaziabad and Hapur districts.',
  'Disbursement of compensation to eligible families',
  'Record payment for 142 pending families in Phase 2',
  -- PostGIS boundary polygon (corridor outline)
  ST_GeomFromText('POLYGON((77.41 28.71, 77.45 28.71, 77.50 28.72, 77.56 28.73,
    77.60 28.74, 77.64 28.75, 77.68 28.77, 77.70 28.78,
    77.70 28.79, 77.68 28.79, 77.64 28.77, 77.60 28.76,
    77.56 28.75, 77.50 28.74, 77.45 28.73, 77.41 28.73, 77.41 28.71))', 4326),
  '11111111-0000-0000-0000-000000000001',
  '2023-03-15T09:00:00Z'
) ON CONFLICT (code) DO NOTHING;

-- ─── WORKFLOW HISTORY ─────────────────────────────────────────────────────────
INSERT INTO workflow_history (project_id, status, actor_id, comment, created_at) VALUES
  ('PRJ-001-0000-0000-0000-000000000001','DRAFT',          '11111111-0000-0000-0000-000000000001','Project initiated','2023-03-15T09:00:00Z'),
  ('PRJ-001-0000-0000-0000-000000000001','SUBMITTED',       '11111111-0000-0000-0000-000000000001','All documents submitted for review','2023-04-02T10:15:00Z'),
  ('PRJ-001-0000-0000-0000-000000000001','UNDER_SCRUTINY',  '11111111-0000-0000-0000-000000000002','Scrutiny initiated by State desk','2023-04-18T14:00:00Z'),
  ('PRJ-001-0000-0000-0000-000000000001','APPROVED',        '11111111-0000-0000-0000-000000000001','Approved with conditions','2023-06-05T11:30:00Z'),
  ('PRJ-001-0000-0000-0000-000000000001','NOTIFICATION',    '11111111-0000-0000-0000-000000000001','Section 11 notifications issued','2023-08-20T09:00:00Z'),
  ('PRJ-001-0000-0000-0000-000000000001','AWARD',           '11111111-0000-0000-0000-000000000001','Awards declared for 312 of 387 parcels','2024-02-14T10:00:00Z'),
  ('PRJ-001-0000-0000-0000-000000000001','COMPENSATION',    '11111111-0000-0000-0000-000000000001','Compensation disbursement commenced','2024-06-01T09:00:00Z');

-- ─── PARCELS (with PostGIS geometry) ──────────────────────────────────────────
INSERT INTO parcels (id, project_id, khasra_no, village, district, state, area, status, owners_count, affected_families, geom) VALUES
  ('P-001-0000-0000-0000-000000000001','PRJ-001-0000-0000-0000-000000000001','K-87/3','Muradnagar','Ghaziabad','Uttar Pradesh',1.85,'ACQUIRED',2,1,
   ST_GeomFromText('POLYGON((77.427 28.718,77.431 28.718,77.431 28.721,77.427 28.721,77.427 28.718))',4326)),
  ('P-002-0000-0000-0000-000000000002','PRJ-001-0000-0000-0000-000000000001','K-92/1','Muradnagar','Ghaziabad','Uttar Pradesh',3.20,'ACQUIRED',1,2,
   ST_GeomFromText('POLYGON((77.435 28.718,77.440 28.718,77.440 28.722,77.435 28.722,77.435 28.718))',4326)),
  ('P-003-0000-0000-0000-000000000003','PRJ-001-0000-0000-0000-000000000001','K-102/1','Duhai','Ghaziabad','Uttar Pradesh',2.45,'DISPUTED',4,3,
   ST_GeomFromText('POLYGON((77.478 28.724,77.484 28.724,77.484 28.728,77.478 28.728,77.478 28.724))',4326)),
  ('P-004-0000-0000-0000-000000000004','PRJ-001-0000-0000-0000-000000000001','K-115/2','Duhai','Ghaziabad','Uttar Pradesh',0.95,'PENDING',2,1,
   ST_GeomFromText('POLYGON((77.488 28.725,77.492 28.725,77.492 28.727,77.488 28.727,77.488 28.725))',4326)),
  ('P-005-0000-0000-0000-000000000005','PRJ-001-0000-0000-0000-000000000001','K-128/4','Arthala','Ghaziabad','Uttar Pradesh',4.10,'POSSESSION_TAKEN',3,5,
   ST_GeomFromText('POLYGON((77.510 28.727,77.517 28.727,77.517 28.732,77.510 28.732,77.510 28.727))',4326)),
  ('P-006-0000-0000-0000-000000000006','PRJ-001-0000-0000-0000-000000000001','K-143/1','Arthala','Ghaziabad','Uttar Pradesh',1.60,'NOTIFIED',2,2,
   ST_GeomFromText('POLYGON((77.521 28.728,77.525 28.728,77.525 28.731,77.521 28.731,77.521 28.728))',4326)),
  ('P-007-0000-0000-0000-000000000007','PRJ-001-0000-0000-0000-000000000001','K-156/3','Modinagar','Ghaziabad','Uttar Pradesh',2.80,'PENDING',1,1,
   ST_GeomFromText('POLYGON((77.558 28.732,77.564 28.732,77.564 28.736,77.558 28.736,77.558 28.732))',4326)),
  ('P-008-0000-0000-0000-000000000008','PRJ-001-0000-0000-0000-000000000001','K-167/2','Modinagar','Ghaziabad','Uttar Pradesh',5.20,'ACQUIRED',6,8,
   ST_GeomFromText('POLYGON((77.568 28.731,77.576 28.731,77.576 28.737,77.568 28.737,77.568 28.731))',4326));

-- ─── PARCEL OWNERS ────────────────────────────────────────────────────────────
INSERT INTO parcel_owners (parcel_id, name, share) VALUES
  ('P-003-0000-0000-0000-000000000003','Ram Prasad Verma', 0.4),
  ('P-003-0000-0000-0000-000000000003','Shyam Lal Verma',  0.3),
  ('P-003-0000-0000-0000-000000000003','Kamla Devi',       0.2),
  ('P-003-0000-0000-0000-000000000003','Ratan Singh',      0.1);

-- ─── COMPENSATION ─────────────────────────────────────────────────────────────
INSERT INTO compensation (parcel_id, assessed, approved, disbursed, status) VALUES
  ('P-001-0000-0000-0000-000000000001', 2775000, 2775000, 2775000, 'PAID'),
  ('P-002-0000-0000-0000-000000000002', 4800000, 4800000, 4800000, 'PAID'),
  ('P-003-0000-0000-0000-000000000003', 3675000, 3675000,       0, 'PENDING_PAYMENT'),
  ('P-004-0000-0000-0000-000000000004', 1425000,       0,       0, 'PENDING_PAYMENT'),
  ('P-005-0000-0000-0000-000000000005', 6150000, 6150000, 6150000, 'PAID'),
  ('P-006-0000-0000-0000-000000000006', 2400000, 2400000, 1200000, 'PARTIAL'),
  ('P-007-0000-0000-0000-000000000007', 4200000,       0,       0, 'PENDING_PAYMENT'),
  ('P-008-0000-0000-0000-000000000008', 7800000, 7800000, 7800000, 'PAID');

-- ─── R&R RECORDS ──────────────────────────────────────────────────────────────
INSERT INTO rnr (parcel_id, head_name, village, displacement, affected_families,
                 compensation_status, rehabilitation_status, resettlement_status, benefits) VALUES
  ('P-003-0000-0000-0000-000000000003','Ram Prasad Verma','Duhai','FULL',3,
   'PENDING','PENDING','PENDING',
   '["House Construction Grant","Livelihood Allowance","Transportation Allowance"]'),
  ('P-005-0000-0000-0000-000000000005','Suresh Bhatt','Arthala','FULL',5,
   'COMPLETED','COMPLETED','COMPLETED',
   '["House Construction Grant","Livelihood Allowance"]'),
  ('P-008-0000-0000-0000-000000000008','Meena Agarwal','Modinagar','PARTIAL',8,
   'COMPLETED','COMPLETED','COMPLETED',
   '["Transportation Allowance"]');

-- ─── OBJECTIONS ───────────────────────────────────────────────────────────────
INSERT INTO objections (project_id, parcel_id, raised_by, reason, status, created_at) VALUES
  ('PRJ-001-0000-0000-0000-000000000001','P-003-0000-0000-0000-000000000003',
   'Ram Prasad Verma','Compensation amount disputed — market rate underestimated','OPEN','2025-03-12'),
  ('PRJ-001-0000-0000-0000-000000000001','P-003-0000-0000-0000-000000000003',
   'Shyam Lal Verma','Co-owner not notified before award declaration','RESOLVED','2024-11-05'),
  ('PRJ-001-0000-0000-0000-000000000001','P-004-0000-0000-0000-000000000004',
   'Rajan Yadav','Area measurement incorrect — actual area larger','OPEN','2025-06-10'),
  ('PRJ-001-0000-0000-0000-000000000001','P-007-0000-0000-0000-000000000007',
   'Geeta Sharma','Religious structure on land — requires high court permission','OPEN','2025-07-22');

UPDATE objections SET resolution='Notice re-served. Award confirmed as valid.', resolved_by='11111111-0000-0000-0000-000000000003', resolved_at=NOW()
WHERE raised_by='Shyam Lal Verma';

-- ─── ALERTS ───────────────────────────────────────────────────────────────────
INSERT INTO alerts (title, message, severity, project_id, target_state, created_at) VALUES
  ('4 Open Objections', 'Delhi-Meerut Expressway has 4 unresolved objections blocking compensation disbursement.',
   'HIGH','PRJ-001-0000-0000-0000-000000000001','Uttar Pradesh','2026-09-01'),
  ('Compensation Delayed', '142 families in Phase 2 of PRJ-001 have not received payment. Deadline: 30 Sep.',
   'CRITICAL','PRJ-001-0000-0000-0000-000000000001','Uttar Pradesh','2026-09-03'),
  ('R&R Plan Pending Approval', 'R&R plan for Duhai cluster requires state-level sign-off before resettlement can proceed.',
   'MEDIUM','PRJ-001-0000-0000-0000-000000000001','Uttar Pradesh','2026-09-05');

-- ─── AUDIT LOGS (initial) ─────────────────────────────────────────────────────
INSERT INTO audit_logs (entity_type, entity_id, action, actor_id, new_value, created_at) VALUES
  ('PROJECT','PRJ-001-0000-0000-0000-000000000001','PROJECT_CREATED',
   '11111111-0000-0000-0000-000000000001',
   '{"name":"Delhi-Meerut Expressway Expansion","type":"HIGHWAY","state":"Uttar Pradesh"}',
   '2023-03-15T09:00:00Z'),
  ('PROJECT','PRJ-001-0000-0000-0000-000000000001','STATUS_TRANSITION',
   '11111111-0000-0000-0000-000000000001',
   '{"status":"COMPENSATION"}','2024-06-01T09:00:00Z');
