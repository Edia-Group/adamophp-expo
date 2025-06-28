import { router, useSegments } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

interface User {
  id: string;
  cfisc: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAnonymous: boolean;
  login: (cfisc: string, password: string) => Promise<boolean>;
  loginAnon: () => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const backendHost = process.env.EXPO_PUBLIC_BACKEND_URL || '';
const API_URL = `https://adamotest.carlsrl.it`;

const AUTH_TOKEN_KEY = 'auth_token';
const ANON_TOKEN_KEY = 'anon_auth_token';

const storage = {
  async setItem(key: string, value: string) {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.error('Failed to save to localStorage', e);
      }
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  async getItem(key: string) {
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        console.error('Failed to get from localStorage', e);
        return null;
      }
    } else {
      return await SecureStore.getItemAsync(key);
    }
  },
  async deleteItem(key: string) {
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error('Failed to remove from localStorage', e);
      }
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

export const getToken = async (): Promise<string | null> => {
  const token = await storage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    return token;
  }
  return await storage.getItem(ANON_TOKEN_KEY);
};


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);


  useEffect(() => {
    const loadStateFromStorage = async () => {
      try {
        const savedAuthToken = await storage.getItem(AUTH_TOKEN_KEY);
        const savedAnonToken = await storage.getItem(ANON_TOKEN_KEY);

        if (savedAuthToken) {
          const userData = await fetchUserData(savedAuthToken);
          setToken(savedAuthToken);
          setUser(userData);
          setIsAnonymous(false);
          setIsFirstLaunch(false);
        } else if (savedAnonToken) {
          setToken(savedAnonToken);
          setUser(null);
          setIsAnonymous(true);
          setIsFirstLaunch(false);
        } else {
          setIsFirstLaunch(true);
        }
      } catch (error) {
        console.error('Failed to load auth state, logging out.', error);
        await logout();
      } finally {
        setIsLoading(false);
      }
    };

    loadStateFromStorage();
  }, []);

  const login = async (cfisc: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cfisc, passwd: password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      const accessToken = data.access_token;

      await storage.setItem(AUTH_TOKEN_KEY, accessToken);
      await storage.deleteItem(ANON_TOKEN_KEY);

      setToken(accessToken);
      const userData = await fetchUserData(accessToken);
      setUser(userData);
      setIsAnonymous(false);
      return true;

    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAnon = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/auth/login-anon`);

      if (!response.ok) {
        throw new Error('Failed to get anonymous token');
      }

      const data = await response.json();
      const anonToken = data.access_token;

      await storage.setItem(ANON_TOKEN_KEY, anonToken);
      await storage.deleteItem(AUTH_TOKEN_KEY);

      setToken(anonToken);
      setUser(null);
      setIsAnonymous(true);
      router.replace('/');
      return true;
    } catch (error) {
      console.error('Anonymous login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await storage.deleteItem(AUTH_TOKEN_KEY);
      await storage.deleteItem(ANON_TOKEN_KEY);
      setToken(null);
      setUser(null);
      setIsAnonymous(false);
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const fetchUserData = async (authToken: string): Promise<User> => {
    const response = await fetch(`${API_URL}/api/user/me`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    const data = await response.json();
    return { id: data.cfisc, cfisc: data.cfisc, name: data.nome };
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    logout,
    loginAnon,
    isAuthenticated: !!token,
    isAnonymous,
    isFirstLaunch: isFirstLaunch === true,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}