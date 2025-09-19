import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'mentorquest-web'
    }
  }
});

// Connection health check
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) throw error;
    return { connected: true, error: null };
  } catch (error) {
    console.error('Supabase connection error:', error);
    return { connected: false, error: error.message };
  }
};

// Database helper functions
export const db = {
  // Users
  async getUser(id: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
  },

  async updateUser(id: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error(`Failed to update user: ${error.message}`);
    }
  },

  // Student profiles
  async getStudentProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('student_profiles')
        .select(`
          *,
          user:users(full_name, email),
          achievements:student_achievements(
            achievement:achievements(*)
          )
        `)
        .eq('user_id', userId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found, create one
          return await this.createStudentProfile(userId);
        }
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error fetching student profile:', error);
      throw new Error(`Failed to fetch student profile: ${error.message}`);
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
    } catch (error) {
      console.error('Error creating student profile:', error);
      throw new Error(`Failed to create student profile: ${error.message}`);
    }
  },

  async updateStudentXP(userId: string, xpGain: number) {
    try {
      // First get current profile
      const profile = await this.getStudentProfile(userId);
      const newXP = profile.xp + xpGain;
      const newLevel = Math.floor(newXP / 1000) + 1;
      
      const { data, error } = await supabase
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
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating student XP:', error);
      throw new Error(`Failed to update XP: ${error.message}`);
    }
  },

  // Quizzes
  async getQuizzes(subject?: string, difficulty?: string) {
    try {
      let query = supabase
        .from('quizzes')
        .select(`
          *,
          questions:quiz_questions(*),
          teacher:users!quizzes_teacher_id_fkey(full_name)
        `)
        .eq('active', true);
      
      if (subject && subject !== 'all') query = query.eq('subject', subject);
      if (difficulty && difficulty !== 'all') query = query.eq('difficulty_level', difficulty);
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      throw new Error(`Failed to fetch quizzes: ${error.message}`);
    }
  },

  async submitQuizAttempt(attempt: any) {
    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .insert({
          ...attempt,
          completed_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error submitting quiz attempt:', error);
      throw new Error(`Failed to submit quiz attempt: ${error.message}`);
    }
  },

  // Leaderboard
  async getLeaderboard(classId?: string, timeframe: 'daily' | 'weekly' | 'monthly' | 'all' = 'weekly') {
    try {
      // Fallback implementation since RPC might not exist
      let query = supabase
        .from('student_profiles')
        .select(`
          *,
          user:users!student_profiles_user_id_fkey(full_name, avatar_url)
        `)
        .order('xp', { ascending: false })
        .limit(50);
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform data to leaderboard format
      return data?.map((profile, index) => ({
        user_id: profile.user_id,
        full_name: profile.user?.full_name || 'Unknown',
        avatar_url: profile.user?.avatar_url,
        xp: profile.xp,
        level: profile.level,
        rank: index + 1,
        streak_days: profile.streak_days
      })) || [];
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw new Error(`Failed to fetch leaderboard: ${error.message}`);
    }
  },

  // Wellness
  async addWellnessEntry(entry: any) {
    try {
      const { data, error } = await supabase
        .from('wellness_entries')
        .insert({
          ...entry,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding wellness entry:', error);
      throw new Error(`Failed to add wellness entry: ${error.message}`);
    }
  },

  // Study sessions
  async addStudySession(session: any) {
    try {
      const { data, error } = await supabase
        .from('study_sessions')
        .insert({
          ...session,
          completed_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding study session:', error);
      throw new Error(`Failed to add study session: ${error.message}`);
    }
  },

  // AI Tutor sessions
  async addAITutorSession(session: any) {
    try {
      const { data, error } = await supabase
        .from('ai_tutor_sessions')
        .insert({
          ...session,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding AI tutor session:', error);
      throw new Error(`Failed to add AI tutor session: ${error.message}`);
    }
  },

  // Achievements
  async unlockAchievement(userId: string, achievementId: string) {
    try {
      // Check if already unlocked
      const { data: existing } = await supabase
        .from('student_achievements')
        .select('id')
        .eq('student_id', userId)
        .eq('achievement_id', achievementId)
        .single();
      
      if (existing) {
        throw new Error('Achievement already unlocked');
      }
      
      const { data, error } = await supabase
        .from('student_achievements')
        .insert({
          student_id: userId,
          achievement_id: achievementId,
          unlocked_at: new Date().toISOString()
        })
        .select(`
          *,
          achievement:achievements(*)
        `)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      throw new Error(`Failed to unlock achievement: ${error.message}`);
    }
  },

  // Classes
  async getTeacherClasses(teacherId: string) {
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
        .eq('active', true);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching teacher classes:', error);
      throw new Error(`Failed to fetch classes: ${error.message}`);
    }
  },

  // Live sessions
  async createLiveSession(session: any) {
    try {
      const { data, error } = await supabase
        .from('live_sessions')
        .insert({
          ...session,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating live session:', error);
      throw new Error(`Failed to create live session: ${error.message}`);
    }
  },

  async joinLiveSession(sessionId: string, userId: string) {
    try {
      // Get current session
      const { data: session, error: fetchError } = await supabase
        .from('live_sessions')
        .select('participants')
        .eq('id', sessionId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const participants = session.participants || [];
      if (!participants.includes(userId)) {
        participants.push(userId);
        
        const { data, error } = await supabase
          .from('live_sessions')
          .update({ participants })
          .eq('id', sessionId)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
      
      return session;
    } catch (error) {
      console.error('Error joining live session:', error);
      throw new Error(`Failed to join live session: ${error.message}`);
    }
  }
  }
};

// Enhanced real-time subscriptions with error handling
// Real-time subscriptions
export const subscriptions = {
  liveSession(sessionId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`live_session_${sessionId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'live_sessions',
        filter: `id=eq.${sessionId}`
      }, (payload) => {
        try {
          callback(payload);
        } catch (error) {
          console.error('Error in live session callback:', error);
        }
      })
      .on('subscribe', (status) => {
        console.log('Live session subscription status:', status);
      })
      .subscribe();
  },

  classUpdates(classId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`class_${classId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'class_students',
        filter: `class_id=eq.${classId}`
      }, (payload) => {
        try {
          callback(payload);
        } catch (error) {
          console.error('Error in class updates callback:', error);
        }
      })
      .subscribe();
  },

  userNotifications(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`notifications_${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        try {
          callback(payload);
        } catch (error) {
          console.error('Error in notifications callback:', error);
        }
      })
      .subscribe();
  }
};