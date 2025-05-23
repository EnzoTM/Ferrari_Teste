/**
 * API utility functions for fetching data from the backend
 */

// Changed to use port 5000 where the backend is actually running
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Product types constants
export const PRODUCT_TYPES = {
  CAR: 'car',
  FORMULA1: 'formula1',
  HELMET: 'helmet',
};

// Endpoints updated to correspond to the backend
export const API_ENDPOINTS = {
  // Usuários
  login: `${API_URL}/api/users/login`,
  register: `${API_URL}/api/users/register`,
  adminRegister: `${API_URL}/api/users/admin/register`, // Updated to use the admin registration endpoint
  checkUser: `${API_URL}/api/users/check`, // Fixed to match the backend route name
  users: `${API_URL}/api/users`,
  userById: (id: string) => `${API_URL}/api/users/${id}`,
  
  // Address and payment method (single approach)
  address: `${API_URL}/api/users/address`,
  paymentMethod: `${API_URL}/api/users/payment-method`,
  
  // Produtos
  products: `${API_URL}/api/products`,
  product: (id: string) => `${API_URL}/api/products/${id}`,
  productsByType: (type: string) => `${API_URL}/api/products/type/${type}`,
  featuredProducts: `${API_URL}/api/products/featured`,
  
  // Outras rotas
  cart: `${API_URL}/api/users/cart`,
  orders: `${API_URL}/api/users/orders`,
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  // Check if we're in the browser
  if (typeof window === 'undefined') {
    return false;
  }
  
  // Check for token
  const token = localStorage.getItem('token');
  return !!token;
};

/**
 * Check if user is an admin
 */
export const isAdmin = () => {
  // Check if we're in the browser
  if (typeof window === 'undefined') {
    return false;
  }
  
  return localStorage.getItem('isAdmin') === 'true';
};

/**
 * Get user ID from localStorage
 */
export const getUserId = () => {
  // Check if we're in the browser
  if (typeof window === 'undefined') {
    return null;
  }
  
  return localStorage.getItem('userId');
};

/**
 * Get current user data using token
 */
export const getCurrentUser = async () => {
  try {
    // First check if we have a token
    if (!isAuthenticated()) {
      return null;
    }
    
    const userId = getUserId();
    if (!userId) {
      return null;
    }
    
    // Fetch user data from API
    const response = await fetch(`${API_ENDPOINTS.userById(userId)}`, authFetchConfig());
    
    if (!response.ok) {
      // If response is not ok, clear the token and return null
      logout();
      return null;
    }
    
    const data = await response.json();
    return data.user || data;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Logout user
 */
export const logout = () => {
  // Check if we're in the browser
  if (typeof window === 'undefined') {
    return;
  }
  
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('isAdmin');
};

/**
 * Create a fetch config with auth token for authenticated requests
 */
export const authFetchConfig = (method = 'GET', body = null) => {
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  };
  
  return config;
};

/**
 * Fetch with authentication
 */
export const fetchWithAuth = (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`
  };
  
  return fetch(url, {
    ...options,
    headers
  });
};