import api from './api.js';
import { mockService } from '../mocks/mockService.js';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export const documentApi = {
  getDocuments: (projectId) =>
    USE_MOCKS ? mockService.getDocuments(projectId) : api.get(`/documents/project/${projectId}`),
  uploadDocument: (formData) =>
    USE_MOCKS ? mockService.uploadDocument(formData) : api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
