import type { LoginRequest, AuthResponse, AuthUser } from '../types';

const AUTH_USER_STORAGE_KEY = 'vocab-weaver-auth-user';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7195';

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthUser> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Login failed');
      }

      const data: AuthResponse = await response.json();
      
      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      };

      // Store auth user in localStorage
      localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(authUser));
      
      return authUser;
    } catch (error) {
      console.error('Login error:', error);
      throw error instanceof Error ? error : new Error('An error occurred during login');
    }
  },

  logout(): void {
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
  },

  getStoredUser(): AuthUser | null {
    const storedUser = localStorage.getItem(AUTH_USER_STORAGE_KEY);
    if (!storedUser) return null;
    
    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return this.getStoredUser() !== null;
  },

  getAuthHeader(): { Authorization: string } | {} {
    const user = this.getStoredUser();
    if (!user) return {};
    
    return {
      Authorization: `Bearer ${user.accessToken}`,
    };
  },
};
