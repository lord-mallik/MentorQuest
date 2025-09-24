export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'teacher' | 'admin';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'auto';
  dyslexic_font: boolean;
  high_contrast: boolean;
  reduced_motion: boolean;
  text_size: 'small' | 'medium' | 'large';
  voice_enabled: boolean;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  level: number;
  xp: number;
  streak_days: number;
  last_activity: string;
  total_study_time: number;
  achievements: Achievement[];
  wellness_streak: number;
  created_at: string;
  updated_at: string;
  student_achievements?: StudentAchievement[];
}

export interface TeacherProfile {
  id: string;
  user_id: string;
  school: string;
  subjects: string[];
  verified: boolean;
  bio: string;
  created_at: string;
  updated_at: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  subject: string;
  teacher_id: string;
  students: string[]; // Computed field
  description: string;
  class_code: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  class_students?: Array<{
    users?: {
      id: string;
    };
  }>;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  subject: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  lessons: Lesson[];
  created_by: string;
  created_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  content: string;
  order: number;
  duration_minutes: number;
  objectives: string[];
  resources: Resource[];
}

export interface Resource {
  id: string;
  type: 'video' | 'document' | 'quiz' | 'interactive';
  title: string;
  url?: string;
  content?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  difficulty_level: 'easy' | 'medium' | 'hard';
  subject: string;
  created_by: string;
  created_at: string;
  time_limit?: number;
}

export interface Question {
  id: string;
  quiz_id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  options?: string[];
  correct_answer: string | string[];
  explanation: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  student_id: string;
  answers: Record<string, string>;
  score: number;
  max_score: number;
  percentage: number;
  completed_at: string;
  time_taken: number;
  xp_earned: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'learning' | 'streak' | 'social' | 'wellness' | 'special';
  requirements: Record<string, number | string | boolean>;
  xp_reward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked_at?: string;
}

export interface StudentAchievement {
  id: string;
  student_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievements?: Achievement;
}

export interface WellnessData {
  id: string;
  student_id: string;
  date: string;
  mood: 1 | 2 | 3 | 4 | 5;
  stress_level: 1 | 2 | 3 | 4 | 5;
  energy_level: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  activities: string[];
}

export interface StudySession {
  id: string;
  student_id: string;
  subject: string;
  duration_minutes: number;
  focus_score: number;
  breaks_taken: number;
  completed_at: string;
  xp_earned: number;
}

export interface AITutorSession {
  id: string;
  student_id: string;
  question: string;
  answer: string;
  subject: string;
  difficulty_level: string;
  satisfaction_rating?: number;
  follow_up_questions: string[];
  created_at: string;
}

export interface LiveSession {
  id: string;
  class_id: string;
  teacher_id: string;
  title: string;
  description: string;
  start_time: string;
  end_time?: string;
  active: boolean;
  participants: string[];
  quiz_id?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
  action_url?: string;
}

export interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  avatar_url?: string;
  xp: number;
  level: number;
  rank: number;
  streak_days: number;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  type: 'study_time' | 'quiz_completion' | 'streak' | 'wellness_checkin';
  target_value: number;
  xp_reward: number;
  expires_at: string;
  completed: boolean;
}

export interface ProgressData {
  subject: string;
  completed_lessons: number;
  total_lessons: number;
  average_score: number;
  time_spent: number;
  last_activity: string;
}

export interface AIResponse {
  answer: string;
  confidence: number;
  sources?: string[];
  follow_up_questions: string[];
  quiz_questions?: Question[];
}

export interface VoiceSettings {
  enabled: boolean;
  language: string;
  speed: number;
  pitch: number;
  voice: string;
}

export interface AccessibilitySettings {
  dyslexic_font: boolean;
  high_contrast: boolean;
  large_text: boolean;
  reduced_motion: boolean;
  screen_reader: boolean;
  keyboard_navigation: boolean;
}