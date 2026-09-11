import api from './api.js';
import { mockService } from '../mocks/mockService.js';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export const compensationApi = {
  getCompensation: (projectId) =>
    USE_MOCKS ? mockService.getCompensation(projectId) : api.get(`/compensation/project/${projectId}`),
  recordPayment: (payload) =>
    USE_MOCKS ? mockService.recordPayment(payload) : api.post('/compensation/payment', payload),
};
