import api from './api.js';
import { mockService } from '../mocks/mockService.js';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export const parcelApi = {
  getParcels: (params) =>
    USE_MOCKS ? mockService.getParcels(params) : api.get('/parcels', { params }),
  getParcel: (id) =>
    USE_MOCKS ? mockService.getParcel(id) : api.get(`/parcels/${id}`),
  getGisProject: (projectId) =>
    USE_MOCKS ? mockService.getGisProject(projectId) : api.get(`/gis/projects/${projectId}`),
  getGisParcels: (params) =>
    USE_MOCKS ? mockService.getGisParcels(params) : api.get('/gis/parcels', { params }),
};
