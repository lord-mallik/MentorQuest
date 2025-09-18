import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
});

// Database helper functions
export const db = {
  // Users
  async getUser(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateUser(id: string, updates: any) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Student profiles
  async getStudentProfile(userId: string) {
    const { data, error } = await supabase
      .from('student_profiles')
      .select(`
        *,
        achievements:student_achievements(
          achievement:achievements(*)
        ),
        wellness_data:wellness_entries(*)
      `)
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateStudentXP(userId: string, xpGain: number) {
    const { data, error } = await supabase.rpc('add_student_xp', {
      student_user_id: userId,
      xp_amount: xpGain
    });
    
    if (error) throw error;
    return data;
  },

  // Quizzes
  async getQuizzes(subject?: string, difficulty?: string) {
    let query = supabase
      .from('quizzes')
      .select(`
        *,
        questions:quiz_questions(*),
        creator:users(full_name)
      `);
    
    if (subject) query = query.eq('subject', subject);
    if (difficulty) query = query.eq('difficulty_level', difficulty);
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async submitQuizAttempt(attempt: any) {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert(attempt)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Leaderboard
  async getLeaderboard(classId?: string, timeframe: 'daily' | 'weekly' | 'monthly' | 'all' = 'weekly') {
    const { data, error } = await supabase.rpc('get_leaderboard', {
      class_id: classId,
      time_frame: timeframe
    });
    
    if (error) throw error;
    return data;
  },

  // Wellness
  async addWellnessEntry(entry: any) {
    const { data, error } = await supabase
      .from('wellness_entries')
      .insert(entry)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Study sessions
  async addStudySession(session: any) {
    const { data, error } = await supabase
      .from('study_sessions')
      .insert(session)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // AI Tutor sessions
  async addAITutorSession(session: any) {
    const { data, error } = await supabase
      .from('ai_tutor_sessions')
      .insert(session)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Achievements
  async unlockAchievement(userId: string, achievementId: string) {
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
  },

  // Classes
  async getTeacherClasses(teacherId: string) {
    const { data, error } = await supabase
      .from('classes')
      .select(`
        *,
        students:class_students(
          student:users(id, full_name, avatar_url)
        )
      `)
      .eq('teacher_id', teacherId);
    
    if (error) throw error;
    return data;
  },

  // Live sessions
  async createLiveSession(session: any) {
    const { data, error } = await supabase
      .from('live_sessions')
      .insert(session)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async joinLiveSession(sessionId: string, userId: string) {
    const { data, error } = await supabase.rpc('join_live_session', {
      session_id: sessionId,
      user_id: userId
    });
    
    if (error) throw error;
    return data;
  }
};

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
      }, callback)
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
      }, callback)
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
      }, callback)
      .subscribe();
  }
};