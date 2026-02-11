const API_BASE_URL = 'http://localhost:5000/api';

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
  };
}

export interface AuthError {
  error: string;
}

export async function signup(email: string, password: string): Promise<AuthResponse> {
  try {
    console.log('🔄 Attempting signup for:', email);
    
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    console.log('📥 Response status:', response.status);

    if (!response.ok) {
      const error = await response.json() as AuthError;
      throw new Error(error.error || `Signup failed with status ${response.status}`);
    }

    const data = await response.json() as AuthResponse;
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    console.log('✅ Signup successful');
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch - Backend may not be running';
    console.error('❌ Signup error:', errorMessage);
    throw new Error(errorMessage);
  }
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  try {
    console.log('🔄 Attempting login for:', email);
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    console.log('📥 Response status:', response.status);

    if (!response.ok) {
      const error = await response.json() as AuthError;
      throw new Error(error.error || `Login failed with status ${response.status}`);
    }

    const data = await response.json() as AuthResponse;
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    console.log('✅ Login successful');
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch - Backend may not be running';
    console.error('❌ Login error:', errorMessage);
    throw new Error(errorMessage);
  }
}

export function logout(): void {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
}

export function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

export function getCurrentUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}
