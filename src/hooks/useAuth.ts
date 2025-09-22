import { useState, useEffect, createContext, useContext } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, checkSupabaseConnection } from '../lib/supabase';
import { User } from '../types';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  loading: boolean;
  connectionStatus: { connected: boolean; error: string | null };
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: 'student' | 'teacher') => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshConnection: () => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState({ connected: false, error: null });

  const refreshConnection = async () => {
    const status = await checkSupabaseConnection();
    setConnectionStatus(status);
    return status;
  };

  useEffect(() => {
    refreshConnection();
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSupabaseUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
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

      setUser(data);
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: 'student' | 'teacher') => {
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
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
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
          }
        } catch (profileCreationError) {
          console.error('Error in profile creation:', profileCreationError);
          // Show warning but don't prevent signup completion
          toast.warning('Account created but profile setup incomplete. Please refresh the page.');
        }
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(error.message || 'Failed to create account');
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
      setUser(null);
      setSupabaseUser(null);
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error(error.message || 'Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!user) throw new Error('No user logged in');

      const updatedUser = await db.updateUser(user.id, updates);
      setUser(updatedUser);
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  };

  return {
    user,
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