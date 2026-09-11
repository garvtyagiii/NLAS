import api from './api.js';
import { mockService } from '../mocks/mockService.js';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export const rnrApi = {
  getRnR: (projectId) =>
    USE_MOCKS ? mockService.getRnR(projectId) : api.get(`/rnr/project/${projectId}`),
  updateRnR: (id, data) =>
    USE_MOCKS ? mockService.updateRnR(id, data) : api.patch(`/rnr/${id}`, data),
};
