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
        throw new Error('Database connection failed');
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
        }
        console.error('Error loading user profile:', error);
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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: 'student' | 'teacher') => {
    try {
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
            const { error: studentError } = await supabase
              .from('student_profiles')
              .insert({
                user_id: data.user.id,
                level: 1,
                xp: 0,
                streak_days: 0,
                last_activity: new Date().toISOString(),
                total_study_time: 0,
                achievements: [],
                wellness_streak: 0
              });

            if (studentError) {
              console.error('Error creating student profile:', studentError);
            }
          } else if (role === 'teacher') {
            const { error: teacherError } = await supabase
              .from('teacher_profiles')
              .insert({
                user_id: data.user.id,
                school: '',
                subjects: [],
                verified: false,
                bio: ''
              });

            if (teacherError) {
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
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear local state
      setUser(null);
      setSupabaseUser(null);
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!user) throw new Error('No user logged in');

      const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      setUser(data);
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