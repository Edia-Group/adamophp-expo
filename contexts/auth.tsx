import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = 'https://api.carl.com';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On startup, if the token is already present we load it
  useEffect(() => {
    const loadToken = async () => {
      try {
        const savedToken = await SecureStore.getItemAsync('auth_token');
        if (savedToken) {
          setToken(savedToken);
          const userData = await fetchUserData(savedToken);
          setUser(userData);
        } else {
            // handle anonymous user
        }
      } catch (error) {
        console.error('Failed to load auth token', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();
  }, []);



  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Errore durante il login');
      }
      
      // Save token if succesful and then fetch user data
      const accessToken = data.access_token;
      await SecureStore.setItemAsync('auth_token', accessToken);
      setToken(accessToken);
      
      const userData = await fetchUserData(accessToken);
      setUser(userData);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('auth_token');
      setToken(null);
      setUser(null);
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const fetchUserData = async (token: string): Promise<User> => {
    const response = await fetch(`${API_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }
    
    return await response.json();
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    logout,
    isAuthenticated: !!token
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