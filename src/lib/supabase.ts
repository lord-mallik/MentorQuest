import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';
import { toast } from 'sonner';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);

// Connection health check
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return { connected: true, error: null };
  } catch (error: any) {
    console.error('Supabase connection error:', error);
    return { 
      connected: false, 
      error: error.message || 'Connection failed' 
    };
  }
};

// Database helper functions with error handling
export const db = {
  // User operations
  async getUser(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error fetching user:', error);
      throw new Error('Failed to fetch user data');
    }
  },

  async updateUser(userId: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  },

  // Student profile operations
  async getStudentProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('student_profiles')
        .select(`
          *,
          achievements:student_achievements(
            achievement:achievements(*)
          )
        `)
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error fetching student profile:', error);
      throw new Error('Failed to fetch student profile');
    }
  },

  async createStudentProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('student_profiles')
        .insert({
          user_id: userId,
          level: 1,
          xp: 0,
          streak_days: 0,
          last_activity: new Date().toISOString(),
          total_study_time: 0,
          achievements: [],
          wellness_streak: 0
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error creating student profile:', error);
      throw new Error('Failed to create student profile');
    }
  },

  async updateStudentXP(userId: string, xpAmount: number) {
    try {
      const { data, error } = await supabase
        .rpc('add_student_xp', {
          student_user_id: userId,
          xp_amount: xpAmount
        });
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error updating student XP:', error);
      throw new Error('Failed to update XP');
    }
  },

  // Quiz operations
  async getQuizzes(filters: any = {}) {
    try {
      let query = supabase
        .from('quizzes')
        .select(`
          *,
          questions:quiz_questions(*),
          teacher:users!quizzes_teacher_id_fkey(full_name)
        `)
        .eq('active', true);

      if (filters.subject) {
        query = query.eq('subject', filters.subject);
      }
      
      if (filters.difficulty) {
        query = query.eq('difficulty_level', filters.difficulty);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching quizzes:', error);
      throw new Error('Failed to fetch quizzes');
    }
  },

  async submitQuizAttempt(attempt: any) {
    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .insert(attempt)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error submitting quiz attempt:', error);
      throw new Error('Failed to submit quiz attempt');
    }
  },

  // Wellness operations
  async addWellnessEntry(entry: any) {
    try {
      const { data, error } = await supabase
        .from('wellness_entries')
        .upsert(entry, { onConflict: 'student_id,date' })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error adding wellness entry:', error);
      throw new Error('Failed to record wellness data');
    }
  },

  async getWellnessEntries(userId: string, limit: number = 30) {
    try {
      const { data, error } = await supabase
        .from('wellness_entries')
        .select('*')
        .eq('student_id', userId)
        .order('date', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching wellness entries:', error);
      throw new Error('Failed to fetch wellness data');
    }
  },

  // AI Tutor operations
  async addAITutorSession(session: any) {
    try {
      const { data, error } = await supabase
        .from('ai_tutor_sessions')
        .insert(session)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error adding AI tutor session:', error);
      throw new Error('Failed to save AI tutor session');
    }
  },

  // Achievement operations
  async unlockAchievement(studentId: string, achievementId: string) {
    try {
      const { data, error } = await supabase
        .from('student_achievements')
        .insert({
          student_id: studentId,
          achievement_id: achievementId,
          unlocked_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error unlocking achievement:', error);
      throw new Error('Failed to unlock achievement');
    }
  },

  // Notification operations
  async getNotifications(userId: string, limit: number = 20) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  async markNotificationRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
    }
  },

  // Leaderboard operations
  async getLeaderboard(classId?: string, timeFrame: string = 'all') {
    try {
      const { data, error } = await supabase
        .rpc('get_leaderboard', {
          class_id_param: classId || null,
          time_frame: timeFrame
        });
      
      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  },

  // Course operations
  async getCourses(teacherId?: string) {
    try {
      let query = supabase
        .from('courses')
        .select(`
          *,
          lessons:lessons(count),
          teacher:users!courses_teacher_id_fkey(full_name)
        `)
        .eq('active', true);

      if (teacherId) {
        query = query.eq('teacher_id', teacherId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      return [];
    }
  },

  // Class operations
  async getClasses(teacherId: string) {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select(`
          *,
          students:class_students(
            student:users!class_students_student_id_fkey(id, full_name, avatar_url)
          )
        `)
        .eq('teacher_id', teacherId)
        .eq('active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching classes:', error);
      return [];
    }
  }
};

// Real-time subscriptions helper
export const subscribeToTable = (
  table: string,
  callback: (payload: any) => void,
  filter?: string
) => {
  const channel = supabase
    .channel(`${table}_changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: table,
        filter: filter
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// Error handling wrapper
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  errorMessage: string = 'Operation failed'
): Promise<T> => {
  try {
    return await operation();
  } catch (error: any) {
    console.error(`${errorMessage}:`, error);
    toast.error(errorMessage);
    throw error;
  }
};