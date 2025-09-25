import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, checkSupabaseConnection, db } from '../lib/supabase';
import { User } from '../types';
import { toast } from 'sonner';

interface AuthContextType {
  supabaseUser: SupabaseUser | null;
  loading: boolean;
  connectionStatus: { connected: boolean; error: string | null };
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: 'student' | 'teacher') => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshConnection: () => Promise<{
    connected: boolean;
    error: string | null;
  }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthProvider() {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<{connected: boolean, error: string | null}>({ connected: false, error: null });

  const refreshConnection = async () => {
    const status = await checkSupabaseConnection();
    setConnectionStatus(status);
    return status;
  };

  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      // Check connection first
      const status = await refreshConnection();
      if (!status.connected) {
        console.warn('Database connection failed, using cached data');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // User not found in profiles table, this might be expected for new users
          console.warn('User profile not found, user might need to complete setup');
          setLoading(false);
          return;
        }
        console.error('Error loading user profile:', error);
        setLoading(false);
        return;
      }

      setSupabaseUser(data);

    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      refreshConnection();
      // Get initial session
      console.log("calling")
      const { data: { session } } = await supabase.auth.getSession();
      console.log(session);

      if (session?.user) {
        setSupabaseUser(session?.user);
        loadUserProfile(session.user.id);
        setLoading(false);
      } else {
        setLoading(false);
      }
    })()
  }, [loadUserProfile]);



  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        setSupabaseUser(data.user); // ✅ Update context state
      }

    } catch (error: unknown) {
      console.error('Sign in error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: 'student' | 'teacher' = 'student') => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          }
        }
      });

      if (error) throw error;

      // Create user profile
      if (data.user) {
        try {
          const { error: profileError } = await db.updateUser(data.user.id, {
            email: data.user.email!,
            full_name: fullName,
            role: role,
            preferences: {
              language: 'en',
              theme: 'light',
              dyslexic_font: false,
              high_contrast: false,
              reduced_motion: false,
              text_size: 'medium',
              voice_enabled: true
            }
          });

          if (profileError) {
            console.error('Error creating user profile:', profileError);
            // Don't throw here, as auth user was created successfully
          }

          // Create role-specific profile
          if (role === 'student') {
            try {
              await db.createStudentProfile(data.user.id);
            } catch (studentError) {
              console.error('Error creating student profile:', studentError);
            }
          } else if (role === 'teacher') {
            try {
              await db.createTeacherProfile(data.user.id);
            } catch (teacherError) {
              console.error('Error creating teacher profile:', teacherError);
            }
          } else if (role === 'admin') {
            try {
              await db.createAdminProfile(data.user.id);
            } catch (adminError) {
              console.error('Error creating admin profile:', adminError);
            }
          }
        } catch (profileCreationError) {
          console.error('Error in profile creation:', profileCreationError);
          // Show warning but don't prevent signup completion
          toast.warning('Account created but profile setup incomplete. Please refresh the page.');
        }
      }
    } catch (error: unknown) {
      console.error('Sign up error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create account';
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear local state
              setSupabaseUser(null);

      setSupabaseUser(null);
    } catch (error: unknown) {
      console.error('Sign out error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign out';
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!supabaseUser) throw new Error('No user logged in');

      const updatedUser = await db.updateUser(supabaseUser.id, updates);
      setSupabaseUser(updatedUser);
    } catch (error: unknown) {
      console.error('Update profile error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      throw new Error(errorMessage);
    }
  };

  return {
    supabaseUser,
    loading,
    connectionStatus,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshConnection,
  };
}