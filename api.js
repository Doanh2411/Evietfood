// API Configuration

const BASE_URL = 'http://192.168.1.10:8000';
// API Endpoints
const API_ENDPOINTS = {
    // Auth endpoints
    LOGIN: `${BASE_URL}/auth/login`,
    REGISTER: `${BASE_URL}/auth/register`,
    LOGOUT: `${BASE_URL}/auth/logout`,
    
    // User endpoints
    USER_PROFILE: `${BASE_URL}/user/profile`,
    UPDATE_PROFILE: `${BASE_URL}/user/update`,
    
    // Add more endpoints as needed
};

// API Configuration object
const API_CONFIG = {
    BASE_URL,
    API_ENDPOINTS,
    // Add more configuration as needed
};

export default API_CONFIG; 