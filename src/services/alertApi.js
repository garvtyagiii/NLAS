import api from './api.js';
import { mockService } from '../mocks/mockService.js';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export const alertApi = {
  getAlerts: () =>
    USE_MOCKS ? mockService.getAlerts() : api.get('/alerts'),
};
