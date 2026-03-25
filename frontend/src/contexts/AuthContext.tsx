import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const AUTH_USER_STORAGE_KEY = 'auth_user';
const AUTH_TOKEN_STORAGE_KEY = 'token';
const LEGACY_AUTH_TOKEN_STORAGE_KEY = 'auth_token';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  profile_image?: string;
  class?: string;
  student_id?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string>;
  logout: () => Promise<void>;
  register: (token: string, name: string, password: string) => Promise<string>;
  getCurrentUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const getStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem(AUTH_USER_STORAGE_KEY);
    if (!raw) return null;

    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

const getStoredToken = (): string => (
  localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
  || localStorage.getItem(LEGACY_AUTH_TOKEN_STORAGE_KEY)
  || ''
);

const generateRequestInit = (
  credentials: RequestCredentials = 'include',
  includeAuthToken = true,
): RequestInit => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = includeAuthToken ? getStoredToken() : '';

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return {
    credentials,
    headers,
  };
};

const persistAuthState = (nextUser: User | null, token?: string) => {
  if (nextUser) {
    localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(nextUser));
  } else {
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
  }

  if (token) {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    localStorage.setItem(LEGACY_AUTH_TOKEN_STORAGE_KEY, token);
  }
};

const clearStoredAuthState = () => {
  localStorage.removeItem(AUTH_USER_STORAGE_KEY);
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  localStorage.removeItem(LEGACY_AUTH_TOKEN_STORAGE_KEY);
};

const resolveUserPayload = (payload: unknown): User | null => {
  if (!payload || typeof payload !== 'object') return null;

  const record = payload as Record<string, unknown>;
  if (record.user && typeof record.user === 'object') {
    return record.user as User;
  }

  if (typeof record.id === 'number' || typeof record.id === 'string') {
    return record as unknown as User;
  }

  return null;
};

const getDefaultRedirectPath = (role?: string) => {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'teacher') return '/teacher/dashboard';
  return '/dashboard';
};

const getErrorMessage = async (response: Response, fallbackMessage: string) => {
  try {
    const payload = await response.json();
    return payload?.error || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getCurrentUser = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, generateRequestInit());
      if (response.ok) {
        const payload = await response.json();
        const nextUser = resolveUserPayload(payload);
        setUser(nextUser);
        persistAuthState(nextUser, typeof payload?.token === 'string' ? payload.token : undefined);
        return nextUser;
      } else if (response.status === 401) {
        setUser(null);
        clearStoredAuthState();
      }
      return null;
    } catch {
      const storedUser = getStoredUser();
      setUser(storedUser);
      return storedUser;
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      ...generateRequestInit('include', false),
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response, 'Login failed'));
    }

    const payload = await response.json();
    const nextUser = resolveUserPayload(payload);

    if (nextUser) {
      setUser(nextUser);
      persistAuthState(nextUser, typeof payload?.token === 'string' ? payload.token : undefined);
    } else {
      await getCurrentUser();
    }

    return payload?.redirectPath || getDefaultRedirectPath(nextUser?.role);
  };

  const register = async (token: string, name: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/users/invite/complete`, {
      ...generateRequestInit('include', false),
      method: 'POST',
      body: JSON.stringify({ token, name, password }),
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response, 'Registration failed'));
    }

    const payload = await response.json();
    const nextUser = resolveUserPayload(payload);

    if (nextUser) {
      setUser(nextUser);
      persistAuthState(nextUser, typeof payload?.token === 'string' ? payload.token : undefined);
    } else {
      await getCurrentUser();
    }

    return payload?.redirectPath || getDefaultRedirectPath(nextUser?.role);
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/users/logout`, {
        method: 'POST', 
        credentials: 'include' 
      });
    } catch {}

    clearStoredAuthState();
    setUser(null);
    navigate('/');
  };

  useEffect(() => {
    getCurrentUser().finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, getCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

