export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: 'student' | 'teacher' | 'admin';
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
          preferences: {
            language: string;
            theme: 'light' | 'dark' | 'auto';
            dyslexic_font: boolean;
            high_contrast: boolean;
            reduced_motion: boolean;
            text_size: 'small' | 'medium' | 'large';
            voice_enabled: boolean;
          };
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role: 'student' | 'teacher' | 'admin';
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          preferences?: any;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: 'student' | 'teacher' | 'admin';
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          preferences?: any;
        };
      };
      student_profiles: {
        Row: {
          id: string;
          user_id: string;
          level: number;
          xp: number;
          streak_days: number;
          last_activity: string;
          total_study_time: number;
          achievements: any[];
          wellness_streak: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          level?: number;
          xp?: number;
          streak_days?: number;
          last_activity?: string;
          total_study_time?: number;
          achievements?: any[];
          wellness_streak?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          level?: number;
          xp?: number;
          streak_days?: number;
          last_activity?: string;
          total_study_time?: number;
          achievements?: any[];
          wellness_streak?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      teacher_profiles: {
        Row: {
          id: string;
          user_id: string;
          school: string;
          subjects: string[];
          verified: boolean;
          bio: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          school?: string;
          subjects?: string[];
          verified?: boolean;
          bio?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          school?: string;
          subjects?: string[];
          verified?: boolean;
          bio?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      quizzes: {
        Row: {
          id: string;
          course_id: string | null;
          teacher_id: string;
          title: string;
          description: string;
          difficulty_level: 'easy' | 'medium' | 'hard';
          subject: string;
          time_limit: number | null;
          max_attempts: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id?: string | null;
          teacher_id: string;
          title: string;
          description?: string;
          difficulty_level?: 'easy' | 'medium' | 'hard';
          subject: string;
          time_limit?: number | null;
          max_attempts?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string | null;
          teacher_id?: string;
          title?: string;
          description?: string;
          difficulty_level?: 'easy' | 'medium' | 'hard';
          subject?: string;
          time_limit?: number | null;
          max_attempts?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      quiz_questions: {
        Row: {
          id: string;
          quiz_id: string;
          question_text: string;
          question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
          options: any;
          correct_answer: string;
          explanation: string;
          points: number;
          question_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          question_text: string;
          question_type?: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
          options?: any;
          correct_answer: string;
          explanation?: string;
          points?: number;
          question_order: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          quiz_id?: string;
          question_text?: string;
          question_type?: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
          options?: any;
          correct_answer?: string;
          explanation?: string;
          points?: number;
          question_order?: number;
          created_at?: string;
        };
      };
      quiz_attempts: {
        Row: {
          id: string;
          quiz_id: string;
          student_id: string;
          answers: any;
          score: number;
          max_score: number;
          percentage: number;
          time_taken: number | null;
          completed_at: string;
          xp_earned: number;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          student_id: string;
          answers: any;
          score: number;
          max_score: number;
          percentage?: number;
          time_taken?: number | null;
          completed_at?: string;
          xp_earned?: number;
        };
        Update: {
          id?: string;
          quiz_id?: string;
          student_id?: string;
          answers?: any;
          score?: number;
          max_score?: number;
          percentage?: number;
          time_taken?: number | null;
          completed_at?: string;
          xp_earned?: number;
        };
      };
      wellness_entries: {
        Row: {
          id: string;
          student_id: string;
          date: string;
          mood: number;
          stress_level: number;
          energy_level: number;
          notes: string;
          activities: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          date?: string;
          mood: number;
          stress_level: number;
          energy_level: number;
          notes?: string;
          activities?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          date?: string;
          mood?: number;
          stress_level?: number;
          energy_level?: number;
          notes?: string;
          activities?: string[];
          created_at?: string;
        };
      };
      achievements: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon: string;
          category: 'learning' | 'streak' | 'social' | 'wellness' | 'special';
          requirements: any;
          xp_reward: number;
          rarity: 'common' | 'rare' | 'epic' | 'legendary';
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          icon?: string;
          category?: 'learning' | 'streak' | 'social' | 'wellness' | 'special';
          requirements: any;
          xp_reward?: number;
          rarity?: 'common' | 'rare' | 'epic' | 'legendary';
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          icon?: string;
          category?: 'learning' | 'streak' | 'social' | 'wellness' | 'special';
          requirements?: any;
          xp_reward?: number;
          rarity?: 'common' | 'rare' | 'epic' | 'legendary';
          created_at?: string;
        };
      };
      student_achievements: {
        Row: {
          id: string;
          student_id: string;
          achievement_id: string;
          unlocked_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          achievement_id: string;
          unlocked_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          achievement_id?: string;
          unlocked_at?: string;
        };
      };
      classes: {
        Row: {
          id: string;
          teacher_id: string;
          name: string;
          subject: string;
          description: string;
          class_code: string;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          teacher_id: string;
          name: string;
          subject: string;
          description?: string;
          class_code?: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          teacher_id?: string;
          name?: string;
          subject?: string;
          description?: string;
          class_code?: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      class_students: {
        Row: {
          id: string;
          class_id: string;
          student_id: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          student_id: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          student_id?: string;
          joined_at?: string;
        };
      };
      live_sessions: {
        Row: {
          id: string;
          class_id: string;
          teacher_id: string;
          title: string;
          description: string;
          start_time: string;
          end_time: string | null;
          active: boolean;
          participants: any;
          quiz_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          teacher_id: string;
          title: string;
          description?: string;
          start_time: string;
          end_time?: string | null;
          active?: boolean;
          participants?: any;
          quiz_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          teacher_id?: string;
          title?: string;
          description?: string;
          start_time?: string;
          end_time?: string | null;
          active?: boolean;
          participants?: any;
          quiz_id?: string | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          notification_type: 'info' | 'success' | 'warning' | 'error' | 'achievement';
          read: boolean;
          action_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          notification_type?: 'info' | 'success' | 'warning' | 'error' | 'achievement';
          read?: boolean;
          action_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          notification_type?: 'info' | 'success' | 'warning' | 'error' | 'achievement';
          read?: boolean;
          action_url?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}