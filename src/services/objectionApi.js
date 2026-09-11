import api from './api.js';
import { mockService } from '../mocks/mockService.js';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export const objectionApi = {
  getObjections: (params) =>
    USE_MOCKS ? mockService.getObjections(params) : api.get('/objections', { params }),
  resolveObjection: (id, data) =>
    USE_MOCKS ? mockService.resolveObjection(id, data) : api.patch(`/objections/${id}`, data),
};
