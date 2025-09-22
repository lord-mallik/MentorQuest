/*
  # MentorQuest Database Schema

  1. New Tables
    - `users` - Main user table with authentication and profile data
    - `student_profiles` - Extended student data with gamification
    - `teacher_profiles` - Extended teacher data and verification
    - `courses` - Course management for teachers
    - `lessons` - Individual lessons within courses
    - `quizzes` - Quiz management with metadata
    - `quiz_questions` - Individual questions within quizzes
    - `quiz_attempts` - Track student quiz performance
    - `classes` - Teacher classroom management
    - `class_students` - Many-to-many relationship for class enrollment
    - `live_sessions` - Real-time classroom sessions
    - `achievements` - Available achievements in the system
    - `student_achievements` - Track which achievements students have unlocked
    - `daily_quests` - Daily challenges for students
    - `wellness_entries` - Daily wellness check-ins from students
    - `study_sessions` - Track individual study sessions
    - `ai_tutor_sessions` - Track AI tutor interactions
    - `notifications` - User notification system

  2. Security
    - Enable RLS on all tables
    - Add policies for user data access
    - Ensure students can only access their own data
    - Teachers can access their students' data
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (main authentication and profile)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  preferences jsonb DEFAULT '{
    "language": "en",
    "theme": "light",
    "dyslexic_font": false,
    "high_contrast": false,
    "reduced_motion": false,
    "text_size": "medium",
    "voice_enabled": true
  }'::jsonb
);

-- Student profiles with gamification
CREATE TABLE IF NOT EXISTS student_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  level integer DEFAULT 1,
  xp integer DEFAULT 0,
  streak_days integer DEFAULT 0,
  last_activity timestamptz DEFAULT now(),
  total_study_time integer DEFAULT 0,
  achievements jsonb DEFAULT '[]'::jsonb,
  wellness_streak integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Teacher profiles
CREATE TABLE IF NOT EXISTS teacher_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  school text DEFAULT '',
  subjects text[] DEFAULT '{}',
  verified boolean DEFAULT false,
  bio text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Courses
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  subject text NOT NULL,
  difficulty_level text CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  language text DEFAULT 'en',
  thumbnail_url text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Lessons
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  lesson_order integer NOT NULL,
  duration_minutes integer DEFAULT 30,
  objectives text[] DEFAULT '{}',
  resources jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Quizzes
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  teacher_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  difficulty_level text CHECK (difficulty_level IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  subject text NOT NULL,
  time_limit integer,
  max_attempts integer DEFAULT 3,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Quiz questions
CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer', 'essay')) DEFAULT 'multiple_choice',
  options jsonb DEFAULT '[]'::jsonb,
  correct_answer text NOT NULL,
  explanation text DEFAULT '',
  points integer DEFAULT 10,
  question_order integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Quiz attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id uuid REFERENCES users(id) ON DELETE CASCADE,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  score integer NOT NULL DEFAULT 0,
  max_score integer NOT NULL DEFAULT 0,
  percentage real GENERATED ALWAYS AS (
    CASE WHEN max_score > 0 THEN (score::real / max_score::real) * 100 ELSE 0 END
  ) STORED,
  time_taken integer,
  completed_at timestamptz DEFAULT now(),
  xp_earned integer DEFAULT 0
);

-- Classes
CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  subject text NOT NULL,
  description text DEFAULT '',
  class_code text UNIQUE NOT NULL DEFAULT substring(md5(random()::text), 1, 8),
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Class students (many-to-many)
CREATE TABLE IF NOT EXISTS class_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE,
  student_id uuid REFERENCES users(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(class_id, student_id)
);

-- Live sessions
CREATE TABLE IF NOT EXISTS live_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  active boolean DEFAULT false,
  participants jsonb DEFAULT '[]'::jsonb,
  quiz_id uuid REFERENCES quizzes(id),
  created_at timestamptz DEFAULT now()
);

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text DEFAULT '🏆',
  category text CHECK (category IN ('learning', 'streak', 'social', 'wellness', 'special')) DEFAULT 'learning',
  requirements jsonb NOT NULL DEFAULT '{}'::jsonb,
  xp_reward integer DEFAULT 50,
  rarity text CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')) DEFAULT 'common',
  created_at timestamptz DEFAULT now()
);

-- Student achievements
CREATE TABLE IF NOT EXISTS student_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES users(id) ON DELETE CASCADE,
  achievement_id uuid REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(student_id, achievement_id)
);

-- Daily quests
CREATE TABLE IF NOT EXISTS daily_quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  quest_type text CHECK (quest_type IN ('study_time', 'quiz_completion', 'streak', 'wellness_checkin')) NOT NULL,
  target_value integer NOT NULL,
  current_progress integer DEFAULT 0,
  xp_reward integer DEFAULT 25,
  completed boolean DEFAULT false,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Wellness entries
CREATE TABLE IF NOT EXISTS wellness_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES users(id) ON DELETE CASCADE,
  date date DEFAULT CURRENT_DATE,
  mood integer CHECK (mood BETWEEN 1 AND 5) NOT NULL,
  stress_level integer CHECK (stress_level BETWEEN 1 AND 5) NOT NULL,
  energy_level integer CHECK (energy_level BETWEEN 1 AND 5) NOT NULL,
  notes text DEFAULT '',
  activities text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, date)
);

-- Study sessions
CREATE TABLE IF NOT EXISTS study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  duration_minutes integer NOT NULL,
  focus_score integer CHECK (focus_score BETWEEN 1 AND 10) DEFAULT 5,
  breaks_taken integer DEFAULT 0,
  completed_at timestamptz DEFAULT now(),
  xp_earned integer DEFAULT 0
);

-- AI tutor sessions
CREATE TABLE IF NOT EXISTS ai_tutor_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES users(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  subject text NOT NULL,
  difficulty_level text DEFAULT 'medium',
  satisfaction_rating integer CHECK (satisfaction_rating BETWEEN 1 AND 5),
  follow_up_questions jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  notification_type text CHECK (notification_type IN ('info', 'success', 'warning', 'error', 'achievement')) DEFAULT 'info',
  read boolean DEFAULT false,
  action_url text,
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_xp ON student_profiles(xp DESC);
CREATE INDEX IF NOT EXISTS idx_teacher_profiles_user_id ON teacher_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_teacher_id ON courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_courses_subject ON courses(subject);
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_teacher_id ON quizzes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_subject ON quizzes(subject);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student_id ON quiz_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_class_students_class_id ON class_students(class_id);
CREATE INDEX IF NOT EXISTS idx_class_students_student_id ON class_students(student_id);
CREATE INDEX IF NOT EXISTS idx_daily_quests_student_id ON daily_quests(student_id);
CREATE INDEX IF NOT EXISTS idx_daily_quests_expires_at ON daily_quests(expires_at);
CREATE INDEX IF NOT EXISTS idx_wellness_entries_student_id ON wellness_entries(student_id);
CREATE INDEX IF NOT EXISTS idx_wellness_entries_date ON wellness_entries(date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tutor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users policies
CREATE POLICY "Users can read own data" ON users FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Student profiles policies
CREATE POLICY "Students can read own profile" ON student_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Students can update own profile" ON student_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Teachers can read student profiles in their classes" ON student_profiles FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM class_students cs
    JOIN classes c ON c.id = cs.class_id
    WHERE cs.student_id = student_profiles.user_id AND c.teacher_id = auth.uid()
  )
);

-- Teacher profiles policies
CREATE POLICY "Teachers can read own profile" ON teacher_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Teachers can update own profile" ON teacher_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Anyone can read verified teacher profiles" ON teacher_profiles FOR SELECT TO authenticated USING (verified = true);

-- Courses policies
CREATE POLICY "Teachers can manage own courses" ON courses FOR ALL TO authenticated USING (auth.uid() = teacher_id);
CREATE POLICY "Students can read active courses" ON courses FOR SELECT TO authenticated USING (active = true);

-- Lessons policies
CREATE POLICY "Teachers can manage lessons in own courses" ON lessons FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM courses WHERE courses.id = lessons.course_id AND courses.teacher_id = auth.uid())
);
CREATE POLICY "Students can read lessons in enrolled courses" ON lessons FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM courses c
    JOIN class_students cs ON cs.class_id IN (
      SELECT cl.id FROM classes cl WHERE cl.teacher_id = c.teacher_id
    )
    WHERE c.id = lessons.course_id AND cs.student_id = auth.uid()
  )
);

-- Quizzes policies
CREATE POLICY "Teachers can manage own quizzes" ON quizzes FOR ALL TO authenticated USING (auth.uid() = teacher_id);
CREATE POLICY "Students can read active quizzes" ON quizzes FOR SELECT TO authenticated USING (active = true);

-- Quiz questions policies
CREATE POLICY "Teachers can manage questions in own quizzes" ON quiz_questions FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM quizzes WHERE quizzes.id = quiz_questions.quiz_id AND quizzes.teacher_id = auth.uid())
);
CREATE POLICY "Students can read questions in active quizzes" ON quiz_questions FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM quizzes WHERE quizzes.id = quiz_questions.quiz_id AND quizzes.active = true)
);

-- Quiz attempts policies
CREATE POLICY "Students can manage own quiz attempts" ON quiz_attempts FOR ALL TO authenticated USING (auth.uid() = student_id);
CREATE POLICY "Teachers can read attempts for their quizzes" ON quiz_attempts FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM quizzes WHERE quizzes.id = quiz_attempts.quiz_id AND quizzes.teacher_id = auth.uid())
);

-- Classes policies
CREATE POLICY "Teachers can manage own classes" ON classes FOR ALL TO authenticated USING (auth.uid() = teacher_id);
CREATE POLICY "Students can read classes they're enrolled in" ON classes FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM class_students WHERE class_students.class_id = classes.id AND class_students.student_id = auth.uid())
);

-- Class students policies
CREATE POLICY "Students can read own class enrollments" ON class_students FOR SELECT TO authenticated USING (auth.uid() = student_id);
CREATE POLICY "Teachers can manage students in own classes" ON class_students FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM classes WHERE classes.id = class_students.class_id AND classes.teacher_id = auth.uid())
);

-- Live sessions policies
CREATE POLICY "Teachers can manage own live sessions" ON live_sessions FOR ALL TO authenticated USING (auth.uid() = teacher_id);
CREATE POLICY "Students can read sessions in enrolled classes" ON live_sessions FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM class_students WHERE class_students.class_id = live_sessions.class_id AND class_students.student_id = auth.uid())
);

-- Achievements policies
CREATE POLICY "Anyone can read achievements" ON achievements FOR SELECT TO authenticated USING (true);

-- Student achievements policies
CREATE POLICY "Students can read own achievements" ON student_achievements FOR SELECT TO authenticated USING (auth.uid() = student_id);
CREATE POLICY "System can insert achievements" ON student_achievements FOR INSERT TO authenticated WITH CHECK (true);

-- Daily quests policies
CREATE POLICY "Students can manage own daily quests" ON daily_quests FOR ALL TO authenticated USING (auth.uid() = student_id);

-- Wellness entries policies
CREATE POLICY "Students can manage own wellness data" ON wellness_entries FOR ALL TO authenticated USING (auth.uid() = student_id);
CREATE POLICY "Teachers can read wellness data for their students" ON wellness_entries FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM class_students cs
    JOIN classes c ON c.id = cs.class_id
    WHERE cs.student_id = wellness_entries.student_id AND c.teacher_id = auth.uid()
  )
);

-- Study sessions policies
CREATE POLICY "Students can manage own study sessions" ON study_sessions FOR ALL TO authenticated USING (auth.uid() = student_id);

-- AI tutor sessions policies
CREATE POLICY "Students can manage own AI tutor sessions" ON ai_tutor_sessions FOR ALL TO authenticated USING (auth.uid() = student_id);

-- Notifications policies
CREATE POLICY "Users can read own notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Functions for gamification
CREATE OR REPLACE FUNCTION add_student_xp(student_user_id uuid, xp_amount integer)
RETURNS student_profiles AS $$
DECLARE
  updated_profile student_profiles;
BEGIN
  UPDATE student_profiles 
  SET 
    xp = xp + xp_amount,
    level = GREATEST(1, FLOOR((xp + xp_amount) / 1000) + 1),
    updated_at = now()
  WHERE user_id = student_user_id
  RETURNING * INTO updated_profile;
  
  RETURN updated_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get leaderboard
CREATE OR REPLACE FUNCTION get_leaderboard(class_id_param uuid DEFAULT NULL, time_frame text DEFAULT 'all')
RETURNS TABLE (
  user_id uuid,
  full_name text,
  avatar_url text,
  xp integer,
  level integer,
  rank bigint,
  streak_days integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id as user_id,
    u.full_name,
    u.avatar_url,
    sp.xp,
    sp.level,
    ROW_NUMBER() OVER (ORDER BY sp.xp DESC) as rank,
    sp.streak_days
  FROM users u
  JOIN student_profiles sp ON u.id = sp.user_id
  WHERE u.role = 'student'
    AND (class_id_param IS NULL OR u.id IN (
      SELECT cs.student_id FROM class_students cs WHERE cs.class_id = class_id_param
    ))
  ORDER BY sp.xp DESC
  LIMIT 100;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;