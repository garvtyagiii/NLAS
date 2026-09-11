import api from './api.js';
import { mockService } from '../mocks/mockService.js';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export const authApi = {
  login: (credentials) =>
    USE_MOCKS ? mockService.login(credentials) : api.post('/auth/login', credentials),
  me: () =>
    USE_MOCKS ? mockService.me() : api.get('/auth/me'),
  logout: () =>
    USE_MOCKS ? Promise.resolve() : api.post('/auth/logout'),
};
