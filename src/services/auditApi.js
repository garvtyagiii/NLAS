import api from './api.js';
import { mockService } from '../mocks/mockService.js';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export const auditApi = {
  getAuditLogs: (params) =>
    USE_MOCKS ? mockService.getAuditLogs(params) : api.get('/audit-logs', { params }),
};
