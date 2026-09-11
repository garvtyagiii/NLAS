import api from './api.js';
import { mockService } from '../mocks/mockService.js';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export const projectApi = {
  getProjects: (params) =>
    USE_MOCKS ? mockService.getProjects(params) : api.get('/projects', { params }),
  getProject: (id) =>
    USE_MOCKS ? mockService.getProject(id) : api.get(`/projects/${id}`),
  createProject: (data) =>
    USE_MOCKS ? mockService.createProject(data) : api.post('/projects', data),
  updateProject: (id, data) =>
    USE_MOCKS ? mockService.updateProject(id, data) : api.patch(`/projects/${id}`, data),
};
