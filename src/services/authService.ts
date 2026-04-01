import api from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

// 2. The Login Function
export const loginUser = async (credentials: LoginRequest): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/login', credentials);

    // Save the token
    if (response.data.token) {
      sessionStorage.setItem('portfolio_token', response.data.token);
    }

    return response.data;
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};

// 3. The Logout Function
export const logoutUser = () => {
  sessionStorage.removeItem('portfolio_token');
  window.location.href = '/';
};