/**
 * Golden demo synthetic data for NLAS MVP
 * PRJ-001: Delhi-Meerut Expressway Expansion
 */

// ─── AUTH ────────────────────────────────────────────────────────────────────
export const mockAuthResponse = {
  success: true,
  data: {
    accessToken: 'mock-jwt-token-central-officer',
    user: {
      id: 'USR-001',
      name: 'Rajesh Kumar Sharma',
      email: 'rajesh.sharma@nlas.gov.in',
      role: 'CENTRAL_OFFICER',
      state: null,
      district: null,
    },
  },
};

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
export const mockDashboard = {
  success: true,
  data: {
    summary: {
      totalProjects: 47,
      landProposed: 18450.5,
      landAcquired: 11230.8,
      acquisitionPercent: 60.9,
      compensationAssessed: 4850000000,
      compensationDisbursed: 2910000000,
      affectedFamilies: 14820,
      rnrProgress: 48.2,
    },
    stateWiseAcquisition: [
      { state: 'Uttar Pradesh', proposed: 4200, acquired: 2850 },
      { state: 'Rajasthan', proposed: 3100, acquired: 1950 },
      { state: 'Maharashtra', proposed: 2800, acquired: 1820 },
      { state: 'Madhya Pradesh', proposed: 2400, acquired: 1340 },
      { state: 'Gujarat', proposed: 1950, acquired: 1410 },
      { state: 'Bihar', proposed: 1600, acquired: 820 },
      { state: 'Karnataka', proposed: 1400, acquired: 980 },
      { state: 'Haryana', proposed: 1000, acquired: 840 + 60 },
    ],
    projectProgress: [
      { name: 'DRAFT', count: 5 },
      { name: 'SUBMITTED', count: 4 },
      { name: 'UNDER_SCRUTINY', count: 6 },
      { name: 'APPROVED', count: 8 },
      { name: 'NOTIFICATION', count: 5 },
      { name: 'AWARD', count: 7 },
      { name: 'COMPENSATION', count: 6 },
      { name: 'POSSESSION', count: 4 },
      { name: 'R&R', count: 2 },
    ],
    compensationSummary: {
      assessed: 4850000000,
      approved: 3950000000,
      disbursed: 2910000000,
      pending: 1040000000,
    },
    rnrSummary: {
      total: 14820,
      rehabilitation: 4230,
      resettlement: 2910,
      pending: 7680,
    },
    criticalProjects: [
      {
        id: 'PRJ-001',
        name: 'Delhi-Meerut Expressway Expansion',
        code: 'PRJ-001',
        state: 'Uttar Pradesh',
        status: 'COMPENSATION',
        progress: 72,
        risk: 'HIGH',
        daysDelayed: 45,
      },
      {
        id: 'PRJ-007',
        name: 'Mumbai Coastal Road Phase 2',
        code: 'PRJ-007',
        state: 'Maharashtra',
        status: 'AWARD',
        progress: 58,
        risk: 'CRITICAL',
        daysDelayed: 120,
      },
      {
        id: 'PRJ-015',
        name: 'Rajasthan Solar Corridor',
        code: 'PRJ-015',
        state: 'Rajasthan',
        status: 'NOTIFICATION',
        progress: 41,
        risk: 'HIGH',
        daysDelayed: 30,
      },
    ],
    delayedProjects: [
      { id: 'PRJ-007', name: 'Mumbai Coastal Road Phase 2', daysDelayed: 120, status: 'AWARD' },
      { id: 'PRJ-023', name: 'Bengaluru Metro Corridor C', daysDelayed: 95, status: 'APPROVED' },
      { id: 'PRJ-001', name: 'Delhi-Meerut Expressway Expansion', daysDelayed: 45, status: 'COMPENSATION' },
      { id: 'PRJ-031', name: 'Chennai Port Expansion', daysDelayed: 38, status: 'POSSESSION' },
      { id: 'PRJ-015', name: 'Rajasthan Solar Corridor', daysDelayed: 30, status: 'NOTIFICATION' },
    ],
    recentAlerts: [
      {
        id: 'ALT-001',
        severity: 'CRITICAL',
        title: 'Payment Deadline Breach',
        message: 'PRJ-001: 3 families missed compensation deadline',
        projectId: 'PRJ-001',
        timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
      },
      {
        id: 'ALT-002',
        severity: 'HIGH',
        title: 'New Objection Filed',
        message: 'PRJ-007: 2 new court objections filed by landowners',
        projectId: 'PRJ-007',
        timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
      },
      {
        id: 'ALT-003',
        severity: 'MEDIUM',
        title: 'R&R Milestone Delayed',
        message: 'PRJ-015: Rehabilitation camp not set up within timeline',
        projectId: 'PRJ-015',
        timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
      },
    ],
  },
};

// ─── PROJECTS LIST ────────────────────────────────────────────────────────────
export const mockProjectsList = {
  success: true,
  data: {
    projects: [
      {
        id: 'PRJ-001',
        name: 'Delhi-Meerut Expressway Expansion',
        code: 'PRJ-001',
        type: 'HIGHWAY',
        department: 'Ministry of Road Transport',
        state: 'Uttar Pradesh',
        district: 'Ghaziabad',
        status: 'COMPENSATION',
        progress: 72,
        requiredArea: 1240.5,
        acquiredArea: 892.8,
        targetDate: '2026-12-31',
        affectedFamilies: 2840,
        openObjections: 4,
      },
      {
        id: 'PRJ-002',
        name: 'Yamuna Expressway Industrial Corridor',
        code: 'PRJ-002',
        type: 'INDUSTRIAL',
        department: 'Ministry of Commerce & Industry',
        state: 'Uttar Pradesh',
        district: 'Agra',
        status: 'AWARD',
        progress: 58,
        requiredArea: 3200.0,
        acquiredArea: 1856.5,
        targetDate: '2027-06-30',
        affectedFamilies: 5620,
        openObjections: 12,
      },
      {
        id: 'PRJ-007',
        name: 'Mumbai Coastal Road Phase 2',
        code: 'PRJ-007',
        type: 'HIGHWAY',
        department: 'Ministry of Road Transport',
        state: 'Maharashtra',
        district: 'Mumbai',
        status: 'AWARD',
        progress: 58,
        requiredArea: 420.0,
        acquiredArea: 243.6,
        targetDate: '2025-03-31',
        affectedFamilies: 890,
        openObjections: 7,
      },
      {
        id: 'PRJ-015',
        name: 'Rajasthan Solar Corridor',
        code: 'PRJ-015',
        type: 'POWER',
        department: 'Ministry of New & Renewable Energy',
        state: 'Rajasthan',
        district: 'Jaisalmer',
        status: 'NOTIFICATION',
        progress: 41,
        requiredArea: 5800.0,
        acquiredArea: 2378.0,
        targetDate: '2027-09-30',
        affectedFamilies: 420,
        openObjections: 2,
      },
      {
        id: 'PRJ-023',
        name: 'Bengaluru Metro Corridor C',
        code: 'PRJ-023',
        type: 'RAILWAY',
        department: 'Ministry of Housing & Urban Affairs',
        state: 'Karnataka',
        district: 'Bengaluru Urban',
        status: 'APPROVED',
        progress: 35,
        requiredArea: 180.5,
        acquiredArea: 63.2,
        targetDate: '2025-06-30',
        affectedFamilies: 1240,
        openObjections: 18,
      },
      {
        id: 'PRJ-031',
        name: 'Chennai Port Expansion',
        code: 'PRJ-031',
        type: 'PORT',
        department: 'Ministry of Ports, Shipping',
        state: 'Tamil Nadu',
        district: 'Chennai',
        status: 'POSSESSION',
        progress: 85,
        requiredArea: 640.0,
        acquiredArea: 544.0,
        targetDate: '2025-12-31',
        affectedFamilies: 680,
        openObjections: 1,
      },
    ],
    pagination: {
      page: 1,
      limit: 20,
      total: 6,
      totalPages: 1,
    },
  },
};

// ─── PROJECT DETAIL: PRJ-001 ──────────────────────────────────────────────────
export const mockProject = {
  success: true,
  data: {
    id: 'PRJ-001',
    name: 'Delhi-Meerut Expressway Expansion',
    code: 'PRJ-001',
    type: 'HIGHWAY',
    department: 'Ministry of Road Transport & Highways',
    state: 'Uttar Pradesh',
    district: 'Ghaziabad',
    status: 'COMPENSATION',
    progress: 72,
    requiredArea: 1240.5,
    acquiredArea: 892.8,
    targetDate: '2026-12-31',
    startDate: '2023-04-01',
    affectedFamilies: 2840,
    parcelCount: 387,
    openObjections: 4,
    description: 'Expansion of the Delhi-Meerut Expressway from 6-lane to 14-lane carriageway spanning 82 km through Ghaziabad and Hapur districts. The project involves acquisition of agricultural, residential, and commercial land parcels across 24 villages.',
    currentMilestone: 'Disbursement of compensation to eligible families',
    nextAction: 'Record payment for 142 pending families in Phase 2',
    createdAt: '2023-03-15T09:00:00Z',
    updatedAt: '2026-08-28T14:30:00Z',
    createdBy: { id: 'USR-001', name: 'Rajesh Kumar Sharma' },
  },
};

// ─── WORKFLOW ─────────────────────────────────────────────────────────────────
export const mockWorkflow = {
  success: true,
  data: {
    projectId: 'PRJ-001',
    currentStatus: 'COMPENSATION',
    transitions: [
      { status: 'DRAFT', timestamp: '2023-03-15T09:00:00Z', officer: 'Rajesh Kumar Sharma', comment: 'Project initiated' },
      { status: 'SUBMITTED', timestamp: '2023-04-02T10:15:00Z', officer: 'Rajesh Kumar Sharma', comment: 'All documents submitted for review' },
      { status: 'UNDER_SCRUTINY', timestamp: '2023-04-18T14:00:00Z', officer: 'Priya Singh', comment: 'Scrutiny initiated by State desk' },
      { status: 'APPROVED', timestamp: '2023-06-05T11:30:00Z', officer: 'V.K. Nair (Secretary)', comment: 'Approved with conditions. Social impact mitigation plan accepted.' },
      { status: 'NOTIFICATION', timestamp: '2023-08-20T09:00:00Z', officer: 'Rajesh Kumar Sharma', comment: 'Section 11 notifications issued for all 24 villages' },
      { status: 'AWARD', timestamp: '2024-02-14T10:00:00Z', officer: 'Rajesh Kumar Sharma', comment: 'Awards declared for 312 of 387 parcels' },
      { status: 'COMPENSATION', timestamp: '2024-06-01T09:00:00Z', officer: 'Rajesh Kumar Sharma', comment: 'Compensation disbursement phase commenced' },
    ],
  },
};

// ─── PARCELS / GIS ───────────────────────────────────────────────────────────
export const mockParcels = {
  success: true,
  data: [
    {
      id: 'P-001', khasraNo: 'K-87/3', village: 'Muradnagar', district: 'Ghaziabad',
      area: 1.85, status: 'ACQUIRED', ownersCount: 2, affectedFamilies: 1,
      compensation: { assessed: 2775000, approved: 2775000, disbursed: 2775000, status: 'PAID' },
    },
    {
      id: 'P-002', khasraNo: 'K-92/1', village: 'Muradnagar', district: 'Ghaziabad',
      area: 3.20, status: 'ACQUIRED', ownersCount: 1, affectedFamilies: 2,
      compensation: { assessed: 4800000, approved: 4800000, disbursed: 4800000, status: 'PAID' },
    },
    {
      id: 'P-003', khasraNo: 'K-102/1', village: 'Duhai', district: 'Ghaziabad',
      area: 2.45, status: 'DISPUTED', ownersCount: 4, affectedFamilies: 3,
      compensation: { assessed: 3675000, approved: 3675000, disbursed: 0, status: 'PENDING_PAYMENT' },
    },
    {
      id: 'P-004', khasraNo: 'K-115/2', village: 'Duhai', district: 'Ghaziabad',
      area: 0.95, status: 'PENDING', ownersCount: 1, affectedFamilies: 1,
      compensation: { assessed: 1425000, approved: 0, disbursed: 0, status: 'PENDING_PAYMENT' },
    },
    {
      id: 'P-005', khasraNo: 'K-128/4', village: 'Arthala', district: 'Ghaziabad',
      area: 4.10, status: 'POSSESSION_TAKEN', ownersCount: 3, affectedFamilies: 5,
      compensation: { assessed: 6150000, approved: 6150000, disbursed: 6150000, status: 'PAID' },
    },
    {
      id: 'P-006', khasraNo: 'K-143/1', village: 'Arthala', district: 'Ghaziabad',
      area: 1.60, status: 'NOTIFIED', ownersCount: 2, affectedFamilies: 2,
      compensation: { assessed: 2400000, approved: 2400000, disbursed: 1200000, status: 'PARTIAL' },
    },
    {
      id: 'P-007', khasraNo: 'K-156/3', village: 'Modinagar', district: 'Ghaziabad',
      area: 2.80, status: 'PENDING', ownersCount: 1, affectedFamilies: 1,
      compensation: { assessed: 4200000, approved: 0, disbursed: 0, status: 'PENDING_PAYMENT' },
    },
    {
      id: 'P-008', khasraNo: 'K-167/2', village: 'Modinagar', district: 'Ghaziabad',
      area: 5.20, status: 'ACQUIRED', ownersCount: 6, affectedFamilies: 8,
      compensation: { assessed: 7800000, approved: 7800000, disbursed: 7800000, status: 'PAID' },
    },
  ],
};

// Single parcel detail
export const mockParcelDetail = {
  success: true,
  data: {
    id: 'P-003',
    khasraNo: 'K-102/1',
    village: 'Duhai',
    district: 'Ghaziabad',
    state: 'Uttar Pradesh',
    area: 2.45,
    landType: 'Agricultural',
    status: 'DISPUTED',
    ownersCount: 4,
    affectedFamilies: 3,
    projectId: 'PRJ-001',
    owners: [
      { id: 'OWN-001', name: 'Ram Prasad Verma', share: 0.4 },
      { id: 'OWN-002', name: 'Shyam Lal Verma', share: 0.3 },
      { id: 'OWN-003', name: 'Kamla Devi', share: 0.2 },
      { id: 'OWN-004', name: 'Ratan Singh', share: 0.1 },
    ],
    compensation: {
      assessed: 3675000,
      approved: 3675000,
      disbursed: 0,
      pending: 3675000,
      status: 'PENDING_PAYMENT',
    },
    objections: [
      {
        id: 'OBJ-005',
        raisedBy: 'Ram Prasad Verma',
        reason: 'Compensation amount disputed — market rate underestimated',
        date: '2025-03-12',
        status: 'OPEN',
      },
    ],
  },
};

// ─── GIS GEOJSON ─────────────────────────────────────────────────────────────
export const mockGeoJSON = {
  type: 'FeatureCollection',
  features: [
    // Project boundary
    {
      type: 'Feature',
      properties: { type: 'boundary', name: 'Delhi-Meerut Expressway Corridor' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.41, 28.71], [77.45, 28.71], [77.50, 28.72], [77.56, 28.73],
          [77.60, 28.74], [77.64, 28.75], [77.68, 28.77], [77.70, 28.78],
          [77.70, 28.79], [77.68, 28.79], [77.64, 28.77], [77.60, 28.76],
          [77.56, 28.75], [77.50, 28.74], [77.45, 28.73], [77.41, 28.73],
          [77.41, 28.71],
        ]],
      },
    },
    // Parcels
    { type: 'Feature', properties: { id: 'P-001', khasraNo: 'K-87/3', status: 'ACQUIRED', area: 1.85, village: 'Muradnagar' },
      geometry: { type: 'Polygon', coordinates: [[[77.427, 28.718], [77.431, 28.718], [77.431, 28.721], [77.427, 28.721], [77.427, 28.718]]] } },
    { type: 'Feature', properties: { id: 'P-002', khasraNo: 'K-92/1', status: 'ACQUIRED', area: 3.20, village: 'Muradnagar' },
      geometry: { type: 'Polygon', coordinates: [[[77.435, 28.718], [77.440, 28.718], [77.440, 28.722], [77.435, 28.722], [77.435, 28.718]]] } },
    { type: 'Feature', properties: { id: 'P-003', khasraNo: 'K-102/1', status: 'DISPUTED', area: 2.45, village: 'Duhai' },
      geometry: { type: 'Polygon', coordinates: [[[77.478, 28.724], [77.484, 28.724], [77.484, 28.728], [77.478, 28.728], [77.478, 28.724]]] } },
    { type: 'Feature', properties: { id: 'P-004', khasraNo: 'K-115/2', status: 'PENDING', area: 0.95, village: 'Duhai' },
      geometry: { type: 'Polygon', coordinates: [[[77.488, 28.725], [77.492, 28.725], [77.492, 28.727], [77.488, 28.727], [77.488, 28.725]]] } },
    { type: 'Feature', properties: { id: 'P-005', khasraNo: 'K-128/4', status: 'POSSESSION_TAKEN', area: 4.10, village: 'Arthala' },
      geometry: { type: 'Polygon', coordinates: [[[77.510, 28.727], [77.517, 28.727], [77.517, 28.732], [77.510, 28.732], [77.510, 28.727]]] } },
    { type: 'Feature', properties: { id: 'P-006', khasraNo: 'K-143/1', status: 'NOTIFIED', area: 1.60, village: 'Arthala' },
      geometry: { type: 'Polygon', coordinates: [[[77.521, 28.728], [77.525, 28.728], [77.525, 28.731], [77.521, 28.731], [77.521, 28.728]]] } },
    { type: 'Feature', properties: { id: 'P-007', khasraNo: 'K-156/3', status: 'PENDING', area: 2.80, village: 'Modinagar' },
      geometry: { type: 'Polygon', coordinates: [[[77.558, 28.732], [77.564, 28.732], [77.564, 28.736], [77.558, 28.736], [77.558, 28.732]]] } },
    { type: 'Feature', properties: { id: 'P-008', khasraNo: 'K-167/2', status: 'ACQUIRED', area: 5.20, village: 'Modinagar' },
      geometry: { type: 'Polygon', coordinates: [[[77.568, 28.731], [77.576, 28.731], [77.576, 28.737], [77.568, 28.737], [77.568, 28.731]]] } },
  ],
};

// ─── COMPENSATION ────────────────────────────────────────────────────────────
export const mockCompensation = {
  success: true,
  data: {
    projectId: 'PRJ-001',
    summary: {
      assessed: 185000000,
      approved: 185000000,
      disbursed: 112500000,
      pending: 72500000,
    },
    records: [
      { parcelId: 'P-001', khasraNo: 'K-87/3', village: 'Muradnagar', families: 1, assessed: 2775000, approved: 2775000, disbursed: 2775000, pending: 0, status: 'PAID' },
      { parcelId: 'P-002', khasraNo: 'K-92/1', village: 'Muradnagar', families: 2, assessed: 4800000, approved: 4800000, disbursed: 4800000, pending: 0, status: 'PAID' },
      { parcelId: 'P-003', khasraNo: 'K-102/1', village: 'Duhai', families: 3, assessed: 3675000, approved: 3675000, disbursed: 0, pending: 3675000, status: 'PENDING_PAYMENT' },
      { parcelId: 'P-004', khasraNo: 'K-115/2', village: 'Duhai', families: 1, assessed: 1425000, approved: 0, disbursed: 0, pending: 1425000, status: 'PENDING_PAYMENT' },
      { parcelId: 'P-005', khasraNo: 'K-128/4', village: 'Arthala', families: 5, assessed: 6150000, approved: 6150000, disbursed: 6150000, pending: 0, status: 'PAID' },
      { parcelId: 'P-006', khasraNo: 'K-143/1', village: 'Arthala', families: 2, assessed: 2400000, approved: 2400000, disbursed: 1200000, pending: 1200000, status: 'PARTIAL' },
      { parcelId: 'P-007', khasraNo: 'K-156/3', village: 'Modinagar', families: 1, assessed: 4200000, approved: 0, disbursed: 0, pending: 4200000, status: 'PENDING_PAYMENT' },
      { parcelId: 'P-008', khasraNo: 'K-167/2', village: 'Modinagar', families: 8, assessed: 7800000, approved: 7800000, disbursed: 7800000, pending: 0, status: 'PAID' },
    ],
  },
};

// ─── R&R ────────────────────────────────────────────────────────────────────
export const mockRnR = {
  success: true,
  data: {
    projectId: 'PRJ-001',
    summary: {
      totalFamilies: 2840,
      rehabilitationCompleted: 820,
      resettlementCompleted: 640,
      pending: 1380,
    },
    families: [
      { id: 'FAM-001', headName: 'Ram Prasad Verma', village: 'Duhai', affectedArea: 2.45, displacement: 'FULL', compensationStatus: 'PENDING', rehabilitationStatus: 'PENDING', resettlementStatus: 'PENDING', benefits: ['Livelihood Grant', 'House Construction Grant'] },
      { id: 'FAM-002', headName: 'Sunita Sharma', village: 'Muradnagar', affectedArea: 1.85, displacement: 'PARTIAL', compensationStatus: 'PAID', rehabilitationStatus: 'COMPLETED', resettlementStatus: 'PENDING', benefits: ['Livelihood Grant'] },
      { id: 'FAM-003', headName: 'Abdul Rahman', village: 'Arthala', affectedArea: 4.10, displacement: 'FULL', compensationStatus: 'PAID', rehabilitationStatus: 'COMPLETED', resettlementStatus: 'COMPLETED', benefits: ['House Construction Grant', 'Transportation Allowance'] },
      { id: 'FAM-004', headName: 'Geeta Devi', village: 'Modinagar', affectedArea: 0.95, displacement: 'PARTIAL', compensationStatus: 'PENDING', rehabilitationStatus: 'PENDING', resettlementStatus: 'PENDING', benefits: [] },
      { id: 'FAM-005', headName: 'Harish Chandra', village: 'Duhai', affectedArea: 3.20, displacement: 'FULL', compensationStatus: 'PAID', rehabilitationStatus: 'IN_PROGRESS', resettlementStatus: 'PENDING', benefits: ['House Construction Grant'] },
    ],
  },
};

// ─── DOCUMENTS ───────────────────────────────────────────────────────────────
export const mockDocuments = {
  success: true,
  data: [
    { id: 'DOC-001', filename: 'SIA_Report_PRJ001_v2.pdf', type: 'SIA_REPORT', uploadedBy: 'Rajesh Kumar Sharma', timestamp: '2023-05-12T10:00:00Z', version: 2, size: 4500000 },
    { id: 'DOC-002', filename: 'Section11_Notification_Gazette.pdf', type: 'NOTIFICATION', uploadedBy: 'Priya Singh', timestamp: '2023-08-20T09:30:00Z', version: 1, size: 1200000 },
    { id: 'DOC-003', filename: 'Award_Declaration_PRJ001.pdf', type: 'AWARD_ORDER', uploadedBy: 'Rajesh Kumar Sharma', timestamp: '2024-02-14T11:00:00Z', version: 1, size: 2800000 },
    { id: 'DOC-004', filename: 'CompensationMatrix_Phase1.xlsx', type: 'COMPENSATION_MATRIX', uploadedBy: 'Anita Gupta', timestamp: '2024-05-20T14:00:00Z', version: 3, size: 890000 },
    { id: 'DOC-005', filename: 'RnR_Action_Plan.pdf', type: 'RNR_PLAN', uploadedBy: 'Vijay Kumar', timestamp: '2024-07-01T09:00:00Z', version: 1, size: 3200000 },
  ],
};

// ─── OBJECTIONS ───────────────────────────────────────────────────────────────
export const mockObjections = {
  success: true,
  data: [
    { id: 'OBJ-001', parcelId: 'P-002', khasraNo: 'K-92/1', raisedBy: 'Mohan Lal', reason: 'Wrong land measurement in award order', date: '2024-03-10', status: 'RESOLVED', resolution: 'Re-measurement confirmed. Award revised upward by 2%.' },
    { id: 'OBJ-002', parcelId: 'P-003', khasraNo: 'K-102/1', raisedBy: 'Ram Prasad Verma', reason: 'Compensation amount disputed — market rate underestimated', date: '2025-03-12', status: 'OPEN', resolution: null },
    { id: 'OBJ-003', parcelId: 'P-007', khasraNo: 'K-156/3', raisedBy: 'Chandra Pal', reason: 'Notice not served to all co-owners before award', date: '2025-05-18', status: 'OPEN', resolution: null },
    { id: 'OBJ-004', parcelId: 'P-004', khasraNo: 'K-115/2', raisedBy: 'Sarita Devi', reason: 'Livelihood loss not included in compensation', date: '2025-06-01', status: 'OPEN', resolution: null },
    { id: 'OBJ-005', parcelId: 'P-006', khasraNo: 'K-143/1', raisedBy: 'Kuldeep Singh', reason: 'Delay in disbursement — family in hardship', date: '2025-07-15', status: 'OPEN', resolution: null },
  ],
};

// ─── AUDIT ───────────────────────────────────────────────────────────────────
export const mockAuditLogs = {
  success: true,
  data: [
    { id: 'AUD-001', timestamp: '2026-08-28T14:30:00Z', officer: 'Rajesh Kumar Sharma', action: 'COMPENSATION_RECORDED', oldValue: null, newValue: { amount: 2775000, parcel: 'P-001', ref: 'NEFT/2026/08/28/112233' }, comment: 'Phase 1 payment recorded' },
    { id: 'AUD-002', timestamp: '2026-08-25T11:00:00Z', officer: 'Anita Gupta', action: 'DOCUMENT_UPLOADED', oldValue: null, newValue: { filename: 'CompensationMatrix_Phase1.xlsx', version: 3 }, comment: 'Updated compensation matrix v3' },
    { id: 'AUD-003', timestamp: '2026-06-01T09:00:00Z', officer: 'Rajesh Kumar Sharma', action: 'STATUS_TRANSITION', oldValue: { status: 'AWARD' }, newValue: { status: 'COMPENSATION' }, comment: 'Compensation disbursement phase commenced' },
    { id: 'AUD-004', timestamp: '2025-03-12T15:00:00Z', officer: 'Ram Prasad Verma', action: 'OBJECTION_FILED', oldValue: null, newValue: { objectionId: 'OBJ-002', reason: 'Compensation dispute' }, comment: 'Objection filed by landowner' },
    { id: 'AUD-005', timestamp: '2024-06-10T10:00:00Z', officer: 'Priya Singh', action: 'OBJECTION_RESOLVED', oldValue: { status: 'OPEN' }, newValue: { status: 'RESOLVED' }, comment: 'Re-measurement confirmed. Award revised.' },
    { id: 'AUD-006', timestamp: '2024-02-14T10:00:00Z', officer: 'Rajesh Kumar Sharma', action: 'STATUS_TRANSITION', oldValue: { status: 'NOTIFICATION' }, newValue: { status: 'AWARD' }, comment: 'Awards declared for 312 of 387 parcels' },
  ],
};

// ─── ALERTS ──────────────────────────────────────────────────────────────────
export const mockAlerts = {
  success: true,
  data: {
    alerts: [
      { id: 'ALT-001', severity: 'CRITICAL', title: 'Payment Deadline Breach', message: 'PRJ-001: 3 families missed compensation deadline. Immediate action required.', projectId: 'PRJ-001', timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), read: false },
      { id: 'ALT-002', severity: 'HIGH', title: 'New Objection Filed', message: 'PRJ-007: 2 new court objections filed by landowners in Mumbai Coastal Road project.', projectId: 'PRJ-007', timestamp: new Date(Date.now() - 5 * 3600000).toISOString(), read: false },
      { id: 'ALT-003', severity: 'MEDIUM', title: 'R&R Milestone Delayed', message: 'PRJ-015: Rehabilitation camp not set up within agreed timeline.', projectId: 'PRJ-015', timestamp: new Date(Date.now() - 12 * 3600000).toISOString(), read: false },
      { id: 'ALT-004', severity: 'HIGH', title: 'Acquisition Progress Stalled', message: 'PRJ-023: Bengaluru Metro Corridor C — no land acquisition progress in 30 days.', projectId: 'PRJ-023', timestamp: new Date(Date.now() - 24 * 3600000).toISOString(), read: true },
      { id: 'ALT-005', severity: 'LOW', title: 'Document Verification Pending', message: 'PRJ-031: Chennai Port Expansion documents awaiting verification.', projectId: 'PRJ-031', timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), read: true },
    ],
    unreadCount: 3,
  },
};
