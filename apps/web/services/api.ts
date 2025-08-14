import axios from 'axios';
import Cookies from 'js-cookie';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (token expired)
    if (error.response && error.response.status === 401) {
      Cookies.remove('auth_token');
      // Redirect to login page if we're in the browser
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API services
export const authService = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  getProfile: () => 
    api.get('/auth/profile'),
};

export const storeService = {
  getStores: () => 
    api.get('/stores'),
  getStoreById: (id: string) => 
    api.get(`/stores/${id}`),
};

export const receiptService = {
  getReceipts: (params: any) => 
    api.get('/receipts', { params }),
  getReceiptById: (id: string) => 
    api.get(`/receipts/${id}`),
  getDailySales: (params: any) => 
    api.get('/receipts/reports/daily-sales', { params }),
  getPaymentMethodTotals: (params: any) => 
    api.get('/receipts/reports/payment-methods', { params }),
};

export const shiftService = {
  getShifts: (params: any) => 
    api.get('/shifts', { params }),
  getShiftById: (id: string) => 
    api.get(`/shifts/${id}`),
  recalculateShift: (id: string) => 
    api.post(`/shifts/${id}/recalculate`),
  getShiftSummary: (params: any) => 
    api.get('/shifts/reports/summary', { params }),
};

export const reportService = {
  getSalesSummary: (params: any) => 
    api.get('/reports/sales', { params }),
  getShiftSummary: (params: any) => 
    api.get('/reports/shifts', { params }),
  getDashboardSummary: (params: any) => 
    api.get('/reports/dashboard', { params }),
};

export const loyverseService = {
  getWebhooks: () => 
    api.get('/integrations/loyverse/webhooks'),
  createWebhook: (data: any) => 
    api.post('/integrations/loyverse/webhooks', data),
  deleteWebhook: (id: string) => 
    api.delete(`/integrations/loyverse/webhooks/${id}`),
  syncStores: () => 
    api.post('/integrations/loyverse/sync/stores'),
  syncEmployees: () => 
    api.post('/integrations/loyverse/sync/employees'),
  syncItems: () => 
    api.post('/integrations/loyverse/sync/items'),
  syncReceipts: (data: any) => 
    api.post('/integrations/loyverse/sync/receipts', data),
  syncShifts: (data: any) => 
    api.post('/integrations/loyverse/sync/shifts', data),
};

export default api;
