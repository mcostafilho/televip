const API_BASE = 'http://localhost:4000/api';

export const useApi = () => {
  const call = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  const request = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('televip_token');
    
    return call(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      }
    });
  };

  return {
    // Auth
    register: (userData: any) => call('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
    
    login: (credentials: any) => call('/auth/login', {
      method: 'POST', 
      body: JSON.stringify(credentials)
    }),
    
    me: () => request('/auth/me'),
    
    // Dashboard
    getDashboard: () => request('/dashboard'),
    
    // Groups
    getGroups: () => request('/groups'),
    getGroup: (id: string) => request(`/groups/${id}`),
    
    // Withdrawals
    requestWithdrawal: (data: any) => request('/withdrawals', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

    // Generic request function
    request
  };
};