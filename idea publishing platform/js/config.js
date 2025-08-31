// API configuration
const API_URL = '/api';

// Auth token management
const getToken = () => localStorage.getItem('token');
const setToken = (token) => localStorage.setItem('token', token);
const removeToken = () => localStorage.removeItem('token');

// Check if user is authenticated
const isAuthenticated = () => !!getToken();

// API request helper with auth token
const apiRequest = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (isAuthenticated()) {
    headers['x-auth-token'] = getToken();
  }
  
  const config = {
    ...options,
    headers
  };
  
  try {
    console.log('Making API request to:', `${API_URL}${endpoint}`);
    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    console.log('Response status:', response.status);
    
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { msg: text };
    }
    
    if (!response.ok) {
      console.error('API Error Response:', data);
      throw new Error(data.msg || `Server error: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API request error:', error);
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Cannot connect to server. Please try again.');
    }
    throw error;
  }
};