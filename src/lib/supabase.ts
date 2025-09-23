import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';
import { toast } from 'sonner';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
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
      .maybeSingle();
    
    if (error && !['PGRST116', 'PGRST118'].includes(error.code)) {
      throw error;
    }
    
    return { connected: true, error: null };
  } catch (error: unknown) {
    console.error('Supabase connection error:', error);
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Connection failed'
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

  async updateUser(userId: string, updates: Partial<{
    email: string;
    full_name: string;
    role: 'student' | 'teacher' | 'admin';
    avatar_url: string | null;
    preferences: {
      language: string;
      theme: 'light' | 'dark' | 'auto';
      dyslexic_font: boolean;
      high_contrast: boolean;
      reduced_motion: boolean;
      text_size: 'small' | 'medium' | 'large';
      voice_enabled: boolean;
    };
  }>) {
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
          student_achievements(
            achievements(*)
          )
        `)
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error fetching student profile:', error);
      // If profile doesn't exist, return null instead of throwing
      if (error.code === 'PGRST116') {
        return null;
      }
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
      // Fallback to manual update if function fails
      try {
        const profile = await this.getStudentProfile(userId);
        if (profile) {
          const newXP = profile.xp + xpAmount;
          const newLevel = Math.floor(newXP / 1000) + 1;
          
          const { data: updatedData, error: updateError } = await supabase
            .from('student_profiles')
            .update({
              xp: newXP,
              level: newLevel,
              last_activity: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .select()
            .single();
          
          if (updateError) throw updateError;
          return updatedData;
        }
      } catch (fallbackError) {
        console.error('Fallback XP update failed:', fallbackError);
      }
      throw new Error('Failed to update XP');
    }
  },

  // Teacher profile operations
  async getTeacherProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('teacher_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code === 'PGRST116') {
        return null;
      }
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error fetching teacher profile:', error);
      throw new Error('Failed to fetch teacher profile');
    }
  },

  async createTeacherProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('teacher_profiles')
        .insert({
          user_id: userId,
          school: '',
          subjects: [],
          verified: false,
          bio: ''
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error creating teacher profile:', error);
      throw new Error('Failed to create teacher profile');
    }
  },

  // Quiz operations
  async getQuizzes(filters: {
    subject?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
  } = {}) {
    try {
      let query = supabase
        .from('quizzes')
        .select(`
          *,
          quiz_questions(*),
          teacher:users!teacher_id(full_name)
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
      return [];
    }
  },

  async submitQuizAttempt(attempt: {
    quiz_id: string;
    student_id: string;
    answers: Record<string, string | string[]>;
    score: number;
    max_score: number;
    percentage: number;
    time_taken?: number | null;
    xp_earned: number;
  }) {
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
  async addWellnessEntry(entry: {
    student_id: string;
    date?: string;
    mood: number;
    stress_level: number;
    energy_level: number;
    notes?: string;
    activities?: string[];
  }) {
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
      return [];
    }
  },

  // AI Tutor operations
  async addAITutorSession(session: {
    student_id: string;
    question: string;
    answer: string;
    subject: string;
    difficulty_level: string;
    satisfaction_rating?: number | null;
    follow_up_questions: string[];
  }) {
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
      // Don't throw error for AI sessions, just log it
      return null;
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
      // Don't throw for achievements, just log
      return null;
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
          lessons(count),
          teacher:users!teacher_id(full_name)
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
          class_students(
            users!student_id(id, full_name, avatar_url)
          )
        `)
        .eq('teacher_id', teacherId)
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Array<{
        id: string;
        name: string;
        subject: string;
        teacher_id: string;
        description: string;
        class_code: string;
        active: boolean;
        created_at: string;
        updated_at: string;
        class_students?: Array<{
          users?: {
            id: string;
            full_name: string;
            avatar_url?: string;
          };
        }>;
      }>;
    } catch (error: any) {
      console.error('Error fetching classes:', error);
      return [];
    }
  },

  // Daily quest operations
  async getDailyQuests(studentId: string) {
    try {
      const { data, error } = await supabase
        .from('daily_quests')
        .select('*')
        .eq('student_id', studentId)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching daily quests:', error);
      return [];
    }
  },

  async completeQuest(questId: string, studentId: string) {
    try {
      const { data, error } = await supabase
        .from('daily_quests')
        .update({
          completed: true,
          current_progress: supabase.raw('target_value')
        })
        .eq('id', questId)
        .eq('student_id', studentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: unknown) {
      console.error('Error completing quest:', error);
      throw new Error('Failed to complete quest');
    }
  },

  // Achievement operations
  async getAchievements() {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('rarity', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching achievements:', error);
      return [];
    }
  },

  async getStudentAchievements(studentId: string) {
    try {
      const { data, error } = await supabase
        .from('student_achievements')
        .select(`
          *,
          achievements(*)
        `)
        .eq('student_id', studentId)
        .order('unlocked_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching student achievements:', error);
      return [];
    }
  }
};

// Real-time subscriptions helper
export const subscribeToTable = (
  table: string,
  callback: (payload: {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    new: Record<string, unknown>;
    old: Record<string, unknown>;
  }) => void,
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
  } catch (error: unknown) {
    console.error(`${errorMessage}:`, error);
    toast.error(errorMessage);
    throw error;
  }
};
