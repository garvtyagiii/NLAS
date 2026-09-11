import api from './api.js';
import { mockService } from '../mocks/mockService.js';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export const dashboardApi = {
  getDashboard: () =>
    USE_MOCKS ? mockService.getDashboard() : api.get('/analytics/dashboard'),
};
