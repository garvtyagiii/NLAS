/**
 * Mock service — returns synthetic data when VITE_USE_MOCKS=true
 * Simulates network delay to make it feel real.
 */
import {
  mockAuthResponse, mockDashboard, mockProjectsList, mockProject,
  mockWorkflow, mockParcels, mockParcelDetail, mockGeoJSON,
  mockCompensation, mockRnR, mockDocuments, mockObjections,
  mockAuditLogs, mockAlerts,
} from './data.js';

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));

const respond = (data) => ({ data });

export const mockService = {
  // Auth
  login: async ({ email, name, role, state }) => {
    await delay(600);
    // Accept any credentials in mock mode and use the entered identity.
    const response = JSON.parse(JSON.stringify(mockAuthResponse));
    response.data.user.name = name.trim();
    response.data.user.email = email;
    response.data.user.state = state || null;
    if (role) response.data.user.role = role;
    else if (email.includes('state')) response.data.user.role = 'STATE_OFFICER';
    else if (email.includes('district')) response.data.user.role = 'DISTRICT_OFFICER';
    else if (email.includes('field')) response.data.user.role = 'FIELD_OFFICER';
    return respond(response);
  },
  me: async () => {
    await delay(200);
    return respond(mockAuthResponse);
  },

  // Dashboard
  getDashboard: async () => {
    await delay(500);
    return respond(mockDashboard);
  },

  // Projects
  getProjects: async (params = {}) => {
    await delay(400);
    const result = JSON.parse(JSON.stringify(mockProjectsList));
    const { search, state, district, status, type } = params;
    let projects = result.data.projects;
    if (search) projects = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase()));
    if (state) projects = projects.filter(p => p.state === state);
    if (district) projects = projects.filter(p => p.district === district);
    if (status) projects = projects.filter(p => p.status === status);
    if (type) projects = projects.filter(p => p.type === type);
    result.data.projects = projects;
    result.data.pagination.total = projects.length;
    result.data.pagination.totalPages = Math.max(1, Math.ceil(projects.length / (params.limit || 20)));
    result.data.pagination.page = Number(params.page || 1);
    return respond(result);
  },
  getProject: async (id) => {
    await delay(350);
    return respond(mockProject);
  },
  createProject: async (payload) => {
    await delay(700);
    return respond({ success: true, data: { ...payload, id: 'PRJ-NEW', code: 'PRJ-NEW', status: 'DRAFT', progress: 0, createdAt: new Date().toISOString() } });
  },
  updateProject: async (id, payload) => {
    await delay(500);
    return respond({ success: true, data: { id, ...payload } });
  },

  // Workflow
  getWorkflow: async (projectId) => {
    await delay(350);
    return respond(mockWorkflow);
  },
  transitionWorkflow: async ({ projectId, nextStatus, comment }) => {
    await delay(700);
    const updated = JSON.parse(JSON.stringify(mockWorkflow));
    updated.data.currentStatus = nextStatus;
    updated.data.transitions.push({ status: nextStatus, timestamp: new Date().toISOString(), officer: 'Rajesh Kumar Sharma', comment: comment || '' });
    return respond(updated);
  },

  // Parcels
  getParcels: async (params = {}) => {
    await delay(400);
    return respond(mockParcels);
  },
  getParcel: async (id) => {
    await delay(300);
    const data = JSON.parse(JSON.stringify(mockParcelDetail));
    if (id !== 'P-003') {
      const parcel = mockParcels.data.find(p => p.id === id) || mockParcelDetail.data;
      data.data = { ...data.data, ...parcel };
    }
    return respond(data);
  },

  // GIS
  getGisProject: async (projectId) => {
    await delay(600);
    return respond({ success: true, data: mockGeoJSON });
  },
  getGisParcels: async (params = {}) => {
    await delay(500);
    return respond({ success: true, data: mockGeoJSON });
  },

  // Compensation
  getCompensation: async (projectId) => {
    await delay(400);
    return respond(mockCompensation);
  },
  recordPayment: async (payload) => {
    await delay(700);
    return respond({ success: true, data: { id: 'PAY-' + Date.now(), ...payload, recordedAt: new Date().toISOString() } });
  },

  // R&R
  getRnR: async (projectId) => {
    await delay(400);
    return respond(mockRnR);
  },
  updateRnR: async (id, payload) => {
    await delay(500);
    return respond({ success: true, data: { id, ...payload } });
  },

  // Documents
  getDocuments: async (projectId) => {
    await delay(400);
    return respond(mockDocuments);
  },
  uploadDocument: async (formData) => {
    await delay(1200);
    return respond({ success: true, data: { id: 'DOC-' + Date.now(), filename: 'uploaded_document.pdf', type: 'OTHER', uploadedBy: 'Rajesh Kumar Sharma', timestamp: new Date().toISOString(), version: 1 } });
  },

  // Objections
  getObjections: async (params = {}) => {
    await delay(400);
    return respond(mockObjections);
  },
  resolveObjection: async (id, payload) => {
    await delay(600);
    const objection = mockObjections.data.find(item => item.id === id);
    if (objection) {
      const wasOpen = objection.status === 'OPEN';
      Object.assign(objection, { ...payload, status: 'RESOLVED' });
      if (wasOpen && mockProject.data.openObjections > 0) mockProject.data.openObjections -= 1;
    }
    return respond({ success: true, data: objection || { id, status: 'RESOLVED', ...payload } });
  },

  // Audit
  getAuditLogs: async (params = {}) => {
    await delay(400);
    return respond(mockAuditLogs);
  },

  // Alerts
  getAlerts: async () => {
    await delay(300);
    return respond(mockAlerts);
  },
};
