import api from './api.js';
import { mockService } from '../mocks/mockService.js';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export const workflowApi = {
  getWorkflow: (projectId) =>
    USE_MOCKS ? mockService.getWorkflow(projectId) : api.get(`/workflow/${projectId}`),
  transition: (payload) =>
    USE_MOCKS ? mockService.transitionWorkflow(payload) : api.post('/workflow/transition', payload),
};
