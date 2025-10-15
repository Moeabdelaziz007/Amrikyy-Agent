import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { AuthService } from '../../lib/auth';
import authAPI, { AuthUser } from '../../api/authService';

// Use backend API or Supabase based on environment
const USE_BACKEND_API = import.meta.env.VITE_USE_BACKEND_AUTH === 'true';

interface AuthContextType {
  user: User | AuthUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ data: any; error: any }>;
  signInWithGitHub: () => Promise<{ data: any; error: any }>;
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
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      if (USE_BACKEND_API) {
        // Use backend API
        const { user: apiUser } = await authAPI.getCurrentUser();
        setUser(apiUser);
        setSession(null); // Backend API doesn't use Supabase sessions
        setLoading(false);
      } else {
        // Use Supabase
        const { session } = await AuthService.getCurrentSession();
        setSession(session as any);
        setUser(session?.user as any ?? null);
        setLoading(false);
      }
    };

    getInitialSession();

    if (!USE_BACKEND_API) {
      // Listen for auth changes (Supabase only)
      const { data: { subscription } } = AuthService.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state change:', event, session?.user?.email);
          
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          
          // Handle email confirmation
          if (event === 'SIGNED_IN' && session?.user) {
            console.log('User signed in successfully:', session.user.email);
          }
          
          // Handle email confirmation
          if (event === 'TOKEN_REFRESHED' && session?.user) {
            console.log('Token refreshed for user:', session.user.email);
          }
        }
      );

      return () => subscription.unsubscribe();
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    if (USE_BACKEND_API) {
      const response = await authAPI.signIn(email, password);
      if (response.success && response.user) {
        setUser(response.user);
        return { data: response, error: null };
      }
      return { data: null, error: { message: response.error || 'Login failed' } };
    }
    return await AuthService.signIn(email, password);
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    if (USE_BACKEND_API) {
      const response = await authAPI.signUp(email, password, fullName);
      if (response.success && response.user) {
        setUser(response.user);
        return { data: response, error: null };
      }
      return { data: null, error: { message: response.error || 'Signup failed' } };
    }
    return await AuthService.signUp(email, password, fullName);
  };

  const signOut = async () => {
    if (USE_BACKEND_API) {
      const response = await authAPI.signOut();
      setUser(null);
      return { error: response.success ? null : { message: response.error } };
    }
    return await AuthService.signOut();
  };

  const signInWithGoogle = async () => {
    if (USE_BACKEND_API) {
      return { data: null, error: { message: 'OAuth not supported with backend API yet' } };
    }
    return await AuthService.signInWithGoogle();
  };

  const signInWithGitHub = async () => {
    if (USE_BACKEND_API) {
      return { data: null, error: { message: 'OAuth not supported with backend API yet' } };
    }
    return await AuthService.signInWithGitHub();
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithGitHub,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
