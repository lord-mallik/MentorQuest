/*
# MentorQuest Complete Database Schema - Idempotent Migration

This migration creates the complete MentorQuest database schema with:
1. All core tables with proper relationships
2. Row Level Security (RLS) policies
3. Database functions for gamification
4. Indexes for performance optimization
5. Idempotent design - can be run multiple times safely

## Tables Created:
- users (authentication and profiles)
- student_profiles (gamification data)
- teacher_profiles (teacher-specific data)
- courses, lessons (educational content)
- quizzes, quiz_questions, quiz_attempts (assessment system)
- classes, class_students (classroom management)
- achievements, student_achievements (gamification)
- daily_quests (daily challenges)
- wellness_entries (mental health tracking)
- study_sessions (learning analytics)
- ai_tutor_sessions (AI interaction logs)
- live_sessions (real-time classroom)
- notifications (user notifications)

## Security:
- RLS enabled on all tables
- Proper access policies for students/teachers
- Data isolation and privacy protection
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create users table (core authentication)
CREATE TABLE IF NOT EXISTS public.users (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    email text NOT NULL,
    full_name text NOT NULL,
    role text NOT NULL CHECK (role = ANY (ARRAY['student'::text, 'teacher'::text, 'admin'::text])),
    avatar_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    preferences jsonb DEFAULT '{"theme": "light", "language": "en", "text_size": "medium", "dyslexic_font": false, "high_contrast": false, "voice_enabled": true, "reduced_motion": false}'::jsonb,
    CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- Create unique constraint on email if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_email_key'
    ) THEN
        ALTER TABLE public.users ADD CONSTRAINT users_email_key UNIQUE (email);
    END IF;
END $$;

-- Create student profiles table
CREATE TABLE IF NOT EXISTS public.student_profiles (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid,
    level integer DEFAULT 1,
    xp integer DEFAULT 0,
    streak_days integer DEFAULT 0,
    last_activity timestamp with time zone DEFAULT now(),
    total_study_time integer DEFAULT 0,
    achievements jsonb DEFAULT '[]'::jsonb,
    wellness_streak integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT student_profiles_pkey PRIMARY KEY (id)
);

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'student_profiles_user_id_fkey'
    ) THEN
        ALTER TABLE public.student_profiles 
        ADD CONSTRAINT student_profiles_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create teacher profiles table
CREATE TABLE IF NOT EXISTS public.teacher_profiles (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid,
    school text DEFAULT ''::text,
    subjects text[] DEFAULT '{}'::text[],
    verified boolean DEFAULT false,
    bio text DEFAULT ''::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT teacher_profiles_pkey PRIMARY KEY (id)
);

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'teacher_profiles_user_id_fkey'
    ) THEN
        ALTER TABLE public.teacher_profiles 
        ADD CONSTRAINT teacher_profiles_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    teacher_id uuid,
    title text NOT NULL,
    description text DEFAULT ''::text,
    subject text NOT NULL,
    difficulty_level text DEFAULT 'beginner'::text CHECK (difficulty_level = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text])),
    language text DEFAULT 'en'::text,
    thumbnail_url text,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT courses_pkey PRIMARY KEY (id)
);

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'courses_teacher_id_fkey'
    ) THEN
        ALTER TABLE public.courses 
        ADD CONSTRAINT courses_teacher_id_fkey 
        FOREIGN KEY (teacher_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    course_id uuid,
    title text NOT NULL,
    content text NOT NULL,
    lesson_order integer NOT NULL,
    duration_minutes integer DEFAULT 30,
    objectives text[] DEFAULT '{}'::text[],
    resources jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT lessons_pkey PRIMARY KEY (id)
);

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'lessons_course_id_fkey'
    ) THEN
        ALTER TABLE public.lessons 
        ADD CONSTRAINT lessons_course_id_fkey 
        FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create quizzes table
CREATE TABLE IF NOT EXISTS public.quizzes (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    course_id uuid,
    teacher_id uuid,
    title text NOT NULL,
    description text DEFAULT ''::text,
    difficulty_level text DEFAULT 'medium'::text CHECK (difficulty_level = ANY (ARRAY['easy'::text, 'medium'::text, 'hard'::text])),
    subject text NOT NULL,
    time_limit integer,
    max_attempts integer DEFAULT 3,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT quizzes_pkey PRIMARY KEY (id)
);

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'quizzes_course_id_fkey'
    ) THEN
        ALTER TABLE public.quizzes 
        ADD CONSTRAINT quizzes_course_id_fkey 
        FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'quizzes_teacher_id_fkey'
    ) THEN
        ALTER TABLE public.quizzes 
        ADD CONSTRAINT quizzes_teacher_id_fkey 
        FOREIGN KEY (teacher_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create quiz questions table
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    quiz_id uuid,
    question_text text NOT NULL,
    question_type text DEFAULT 'multiple_choice'::text CHECK (question_type = ANY (ARRAY['multiple_choice'::text, 'true_false'::text, 'short_answer'::text, 'essay'::text])),
    options jsonb DEFAULT '[]'::jsonb,
    correct_answer text NOT NULL,
    explanation text DEFAULT ''::text,
    points integer DEFAULT 10,
    question_order integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT quiz_questions_pkey PRIMARY KEY (id)
);

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'quiz_questions_quiz_id_fkey'
    ) THEN
        ALTER TABLE public.quiz_questions 
        ADD CONSTRAINT quiz_questions_quiz_id_fkey 
        FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create quiz attempts table
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    quiz_id uuid,
    student_id uuid,
    answers jsonb NOT NULL DEFAULT '{}'::jsonb,
    score integer NOT NULL DEFAULT 0,
    max_score integer NOT NULL DEFAULT 0,
    percentage real GENERATED ALWAYS AS (
        CASE
            WHEN max_score > 0 THEN ((score::real / max_score::real) * 100)
            ELSE 0
        END
    ) STORED,
    time_taken integer,
    completed_at timestamp with time zone DEFAULT now(),
    xp_earned integer DEFAULT 0,
    CONSTRAINT quiz_attempts_pkey PRIMARY KEY (id)
);

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'quiz_attempts_quiz_id_fkey'
    ) THEN
        ALTER TABLE public.quiz_attempts 
        ADD CONSTRAINT quiz_attempts_quiz_id_fkey 
        FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'quiz_attempts_student_id_fkey'
    ) THEN
        ALTER TABLE public.quiz_attempts 
        ADD CONSTRAINT quiz_attempts_student_id_fkey 
        FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create classes table
CREATE TABLE IF NOT EXISTS public.classes (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    teacher_id uuid,
    name text NOT NULL,
    subject text NOT NULL,
    description text DEFAULT ''::text,
    class_code text NOT NULL DEFAULT substring(md5(random()::text), 1, 8),
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT classes_pkey PRIMARY KEY (id)
);

-- Add unique constraint on class_code if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'classes_class_code_key'
    ) THEN
        ALTER TABLE public.classes ADD CONSTRAINT classes_class_code_key UNIQUE (class_code);
    END IF;
END $$;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'classes_teacher_id_fkey'
    ) THEN
        ALTER TABLE public.classes 
        ADD CONSTRAINT classes_teacher_id_fkey 
        FOREIGN KEY (teacher_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create class students table
CREATE TABLE IF NOT EXISTS public.class_students (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    class_id uuid,
    student_id uuid,
    joined_at timestamp with time zone DEFAULT now(),
    CONSTRAINT class_students_pkey PRIMARY KEY (id)
);

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'class_students_class_id_student_id_key'
    ) THEN
        ALTER TABLE public.class_students 
        ADD CONSTRAINT class_students_class_id_student_id_key 
        UNIQUE (class_id, student_id);
    END IF;
END $$;

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'class_students_class_id_fkey'
    ) THEN
        ALTER TABLE public.class_students 
        ADD CONSTRAINT class_students_class_id_fkey 
        FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'class_students_student_id_fkey'
    ) THEN
        ALTER TABLE public.class_students 
        ADD CONSTRAINT class_students_student_id_fkey 
        FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text NOT NULL,
    icon text DEFAULT '🏆'::text,
    category text DEFAULT 'learning'::text CHECK (category = ANY (ARRAY['learning'::text, 'streak'::text, 'social'::text, 'wellness'::text, 'special'::text])),
    requirements jsonb NOT NULL DEFAULT '{}'::jsonb,
    xp_reward integer DEFAULT 50,
    rarity text DEFAULT 'common'::text CHECK (rarity = ANY (ARRAY['common'::text, 'rare'::text, 'epic'::text, 'legendary'::text])),
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT achievements_pkey PRIMARY KEY (id)
);

-- Create student achievements table
CREATE TABLE IF NOT EXISTS public.student_achievements (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    student_id uuid,
    achievement_id uuid,
    unlocked_at timestamp with time zone DEFAULT now(),
    CONSTRAINT student_achievements_pkey PRIMARY KEY (id)
);

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'student_achievements_student_id_achievement_id_key'
    ) THEN
        ALTER TABLE public.student_achievements 
        ADD CONSTRAINT student_achievements_student_id_achievement_id_key 
        UNIQUE (student_id, achievement_id);
    END IF;
END $$;

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'student_achievements_student_id_fkey'
    ) THEN
        ALTER TABLE public.student_achievements 
        ADD CONSTRAINT student_achievements_student_id_fkey 
        FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'student_achievements_achievement_id_fkey'
    ) THEN
        ALTER TABLE public.student_achievements 
        ADD CONSTRAINT student_achievements_achievement_id_fkey 
        FOREIGN KEY (achievement_id) REFERENCES public.achievements(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create daily quests table
CREATE TABLE IF NOT EXISTS public.daily_quests (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    student_id uuid,
    title text NOT NULL,
    description text NOT NULL,
    quest_type text NOT NULL CHECK (quest_type = ANY (ARRAY['study_time'::text, 'quiz_completion'::text, 'streak'::text, 'wellness_checkin'::text])),
    target_value integer NOT NULL,
    current_progress integer DEFAULT 0,
    xp_reward integer DEFAULT 25,
    completed boolean DEFAULT false,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT daily_quests_pkey PRIMARY KEY (id)
);

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'daily_quests_student_id_fkey'
    ) THEN
        ALTER TABLE public.daily_quests 
        ADD CONSTRAINT daily_quests_student_id_fkey 
        FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create wellness entries table
CREATE TABLE IF NOT EXISTS public.wellness_entries (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    student_id uuid,
    date date DEFAULT CURRENT_DATE,
    mood integer NOT NULL CHECK (mood >= 1 AND mood <= 5),
    stress_level integer NOT NULL CHECK (stress_level >= 1 AND stress_level <= 5),
    energy_level integer NOT NULL CHECK (energy_level >= 1 AND energy_level <= 5),
    notes text DEFAULT ''::text,
    activities text[] DEFAULT '{}'::text[],
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT wellness_entries_pkey PRIMARY KEY (id)
);

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'wellness_entries_student_id_date_key'
    ) THEN
        ALTER TABLE public.wellness_entries 
        ADD CONSTRAINT wellness_entries_student_id_date_key 
        UNIQUE (student_id, date);
    END IF;
END $$;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'wellness_entries_student_id_fkey'
    ) THEN
        ALTER TABLE public.wellness_entries 
        ADD CONSTRAINT wellness_entries_student_id_fkey 
        FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create study sessions table
CREATE TABLE IF NOT EXISTS public.study_sessions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    student_id uuid,
    subject text NOT NULL,
    duration_minutes integer NOT NULL,
    focus_score integer DEFAULT 5 CHECK (focus_score >= 1 AND focus_score <= 10),
    breaks_taken integer DEFAULT 0,
    completed_at timestamp with time zone DEFAULT now(),
    xp_earned integer DEFAULT 0,
    CONSTRAINT study_sessions_pkey PRIMARY KEY (id)
);

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'study_sessions_student_id_fkey'
    ) THEN
        ALTER TABLE public.study_sessions 
        ADD CONSTRAINT study_sessions_student_id_fkey 
        FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create AI tutor sessions table
CREATE TABLE IF NOT EXISTS public.ai_tutor_sessions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    student_id uuid,
    question text NOT NULL,
    answer text NOT NULL,
    subject text NOT NULL,
    difficulty_level text DEFAULT 'medium'::text,
    satisfaction_rating integer CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    follow_up_questions jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT ai_tutor_sessions_pkey PRIMARY KEY (id)
);

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'ai_tutor_sessions_student_id_fkey'
    ) THEN
        ALTER TABLE public.ai_tutor_sessions 
        ADD CONSTRAINT ai_tutor_sessions_student_id_fkey 
        FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create live sessions table
CREATE TABLE IF NOT EXISTS public.live_sessions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    class_id uuid,
    teacher_id uuid,
    title text NOT NULL,
    description text DEFAULT ''::text,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone,
    active boolean DEFAULT false,
    participants jsonb DEFAULT '[]'::jsonb,
    quiz_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT live_sessions_pkey PRIMARY KEY (id)
);

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'live_sessions_class_id_fkey'
    ) THEN
        ALTER TABLE public.live_sessions 
        ADD CONSTRAINT live_sessions_class_id_fkey 
        FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'live_sessions_teacher_id_fkey'
    ) THEN
        ALTER TABLE public.live_sessions 
        ADD CONSTRAINT live_sessions_teacher_id_fkey 
        FOREIGN KEY (teacher_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'live_sessions_quiz_id_fkey'
    ) THEN
        ALTER TABLE public.live_sessions 
        ADD CONSTRAINT live_sessions_quiz_id_fkey 
        FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id);
    END IF;
END $$;

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid,
    title text NOT NULL,
    message text NOT NULL,
    notification_type text DEFAULT 'info'::text CHECK (notification_type = ANY (ARRAY['info'::text, 'success'::text, 'warning'::text, 'error'::text, 'achievement'::text])),
    read boolean DEFAULT false,
    action_url text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT notifications_pkey PRIMARY KEY (id)
);

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'notifications_user_id_fkey'
    ) THEN
        ALTER TABLE public.notifications 
        ADD CONSTRAINT notifications_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON public.student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_xp ON public.student_profiles(xp DESC);
CREATE INDEX IF NOT EXISTS idx_teacher_profiles_user_id ON public.teacher_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_teacher_id ON public.courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_courses_subject ON public.courses(subject);
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON public.lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_teacher_id ON public.quizzes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_subject ON public.quizzes(subject);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON public.quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student_id ON public.quiz_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_classes_teacher_id ON public.classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_class_students_class_id ON public.class_students(class_id);
CREATE INDEX IF NOT EXISTS idx_class_students_student_id ON public.class_students(student_id);
CREATE INDEX IF NOT EXISTS idx_daily_quests_student_id ON public.daily_quests(student_id);
CREATE INDEX IF NOT EXISTS idx_daily_quests_expires_at ON public.daily_quests(expires_at);
CREATE INDEX IF NOT EXISTS idx_wellness_entries_student_id ON public.wellness_entries(student_id);
CREATE INDEX IF NOT EXISTS idx_wellness_entries_date ON public.wellness_entries(date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellness_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tutor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Users can read own data' AND tablename = 'users'
    ) THEN
        CREATE POLICY "Users can read own data" ON public.users
            FOR SELECT USING (auth.uid() = id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Users can update own data' AND tablename = 'users'
    ) THEN
        CREATE POLICY "Users can update own data" ON public.users
            FOR UPDATE USING (auth.uid() = id);
    END IF;
END $$;

-- Student profiles policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Students can read own profile' AND tablename = 'student_profiles'
    ) THEN
        CREATE POLICY "Students can read own profile" ON public.student_profiles
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Students can update own profile' AND tablename = 'student_profiles'
    ) THEN
        CREATE POLICY "Students can update own profile" ON public.student_profiles
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Teachers can read student profiles in their classes' AND tablename = 'student_profiles'
    ) THEN
        CREATE POLICY "Teachers can read student profiles in their classes" ON public.student_profiles
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM class_students cs
                    JOIN classes c ON c.id = cs.class_id
                    WHERE cs.student_id = student_profiles.user_id
                    AND c.teacher_id = auth.uid()
                )
            );
    END IF;
END $$;

-- Teacher profiles policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Teachers can read own profile' AND tablename = 'teacher_profiles'
    ) THEN
        CREATE POLICY "Teachers can read own profile" ON public.teacher_profiles
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Teachers can update own profile' AND tablename = 'teacher_profiles'
    ) THEN
        CREATE POLICY "Teachers can update own profile" ON public.teacher_profiles
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Anyone can read verified teacher profiles' AND tablename = 'teacher_profiles'
    ) THEN
        CREATE POLICY "Anyone can read verified teacher profiles" ON public.teacher_profiles
            FOR SELECT USING (verified = true);
    END IF;
END $$;

-- Courses policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Teachers can manage own courses' AND tablename = 'courses'
    ) THEN
        CREATE POLICY "Teachers can manage own courses" ON public.courses
            FOR ALL USING (auth.uid() = teacher_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Students can read active courses' AND tablename = 'courses'
    ) THEN
        CREATE POLICY "Students can read active courses" ON public.courses
            FOR SELECT USING (active = true);
    END IF;
END $$;

-- Lessons policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Teachers can manage lessons in own courses' AND tablename = 'lessons'
    ) THEN
        CREATE POLICY "Teachers can manage lessons in own courses" ON public.lessons
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM courses 
                    WHERE courses.id = lessons.course_id 
                    AND courses.teacher_id = auth.uid()
                )
            );
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Students can read lessons in enrolled courses' AND tablename = 'lessons'
    ) THEN
        CREATE POLICY "Students can read lessons in enrolled courses" ON public.lessons
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM courses c
                    JOIN class_students cs ON cs.class_id IN (
                        SELECT cl.id FROM classes cl WHERE cl.teacher_id = c.teacher_id
                    )
                    WHERE c.id = lessons.course_id 
                    AND cs.student_id = auth.uid()
                )
            );
    END IF;
END $$;

-- Quizzes policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Teachers can manage own quizzes' AND tablename = 'quizzes'
    ) THEN
        CREATE POLICY "Teachers can manage own quizzes" ON public.quizzes
            FOR ALL USING (auth.uid() = teacher_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Students can read active quizzes' AND tablename = 'quizzes'
    ) THEN
        CREATE POLICY "Students can read active quizzes" ON public.quizzes
            FOR SELECT USING (active = true);
    END IF;
END $$;

-- Quiz questions policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Teachers can manage questions in own quizzes' AND tablename = 'quiz_questions'
    ) THEN
        CREATE POLICY "Teachers can manage questions in own quizzes" ON public.quiz_questions
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM quizzes 
                    WHERE quizzes.id = quiz_questions.quiz_id 
                    AND quizzes.teacher_id = auth.uid()
                )
            );
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Students can read questions in active quizzes' AND tablename = 'quiz_questions'
    ) THEN
        CREATE POLICY "Students can read questions in active quizzes" ON public.quiz_questions
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM quizzes 
                    WHERE quizzes.id = quiz_questions.quiz_id 
                    AND quizzes.active = true
                )
            );
    END IF;
END $$;

-- Quiz attempts policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Students can manage own quiz attempts' AND tablename = 'quiz_attempts'
    ) THEN
        CREATE POLICY "Students can manage own quiz attempts" ON public.quiz_attempts
            FOR ALL USING (auth.uid() = student_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Teachers can read attempts for their quizzes' AND tablename = 'quiz_attempts'
    ) THEN
        CREATE POLICY "Teachers can read attempts for their quizzes" ON public.quiz_attempts
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM quizzes 
                    WHERE quizzes.id = quiz_attempts.quiz_id 
                    AND quizzes.teacher_id = auth.uid()
                )
            );
    END IF;
END $$;

-- Classes policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Teachers can manage own classes' AND tablename = 'classes'
    ) THEN
        CREATE POLICY "Teachers can manage own classes" ON public.classes
            FOR ALL USING (auth.uid() = teacher_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Students can read classes they are enrolled in' AND tablename = 'classes'
    ) THEN
        CREATE POLICY "Students can read classes they are enrolled in" ON public.classes
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM class_students 
                    WHERE class_students.class_id = classes.id 
                    AND class_students.student_id = auth.uid()
                )
            );
    END IF;
END $$;

-- Class students policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Teachers can manage students in own classes' AND tablename = 'class_students'
    ) THEN
        CREATE POLICY "Teachers can manage students in own classes" ON public.class_students
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM classes 
                    WHERE classes.id = class_students.class_id 
                    AND classes.teacher_id = auth.uid()
                )
            );
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Students can read own class enrollments' AND tablename = 'class_students'
    ) THEN
        CREATE POLICY "Students can read own class enrollments" ON public.class_students
            FOR SELECT USING (auth.uid() = student_id);
    END IF;
END $$;

-- Achievements policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Anyone can read achievements' AND tablename = 'achievements'
    ) THEN
        CREATE POLICY "Anyone can read achievements" ON public.achievements
            FOR SELECT TO authenticated USING (true);
    END IF;
END $$;

-- Student achievements policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Students can read own achievements' AND tablename = 'student_achievements'
    ) THEN
        CREATE POLICY "Students can read own achievements" ON public.student_achievements
            FOR SELECT USING (auth.uid() = student_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'System can insert achievements' AND tablename = 'student_achievements'
    ) THEN
        CREATE POLICY "System can insert achievements" ON public.student_achievements
            FOR INSERT TO public WITH CHECK (true);
    END IF;
END $$;

-- Daily quests policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Students can manage own daily quests' AND tablename = 'daily_quests'
    ) THEN
        CREATE POLICY "Students can manage own daily quests" ON public.daily_quests
            FOR ALL USING (auth.uid() = student_id);
    END IF;
END $$;

-- Wellness entries policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Students can manage own wellness data' AND tablename = 'wellness_entries'
    ) THEN
        CREATE POLICY "Students can manage own wellness data" ON public.wellness_entries
            FOR ALL USING (auth.uid() = student_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Teachers can read wellness data for their students' AND tablename = 'wellness_entries'
    ) THEN
        CREATE POLICY "Teachers can read wellness data for their students" ON public.wellness_entries
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM class_students cs
                    JOIN classes c ON c.id = cs.class_id
                    WHERE cs.student_id = wellness_entries.student_id
                    AND c.teacher_id = auth.uid()
                )
            );
    END IF;
END $$;

-- Study sessions policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Students can manage own study sessions' AND tablename = 'study_sessions'
    ) THEN
        CREATE POLICY "Students can manage own study sessions" ON public.study_sessions
            FOR ALL USING (auth.uid() = student_id);
    END IF;
END $$;

-- AI tutor sessions policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Students can manage own AI tutor sessions' AND tablename = 'ai_tutor_sessions'
    ) THEN
        CREATE POLICY "Students can manage own AI tutor sessions" ON public.ai_tutor_sessions
            FOR ALL USING (auth.uid() = student_id);
    END IF;
END $$;

-- Live sessions policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Teachers can manage own live sessions' AND tablename = 'live_sessions'
    ) THEN
        CREATE POLICY "Teachers can manage own live sessions" ON public.live_sessions
            FOR ALL USING (auth.uid() = teacher_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Students can read sessions in enrolled classes' AND tablename = 'live_sessions'
    ) THEN
        CREATE POLICY "Students can read sessions in enrolled classes" ON public.live_sessions
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM class_students 
                    WHERE class_students.class_id = live_sessions.class_id 
                    AND class_students.student_id = auth.uid()
                )
            );
    END IF;
END $$;

-- Notifications policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Users can read own notifications' AND tablename = 'notifications'
    ) THEN
        CREATE POLICY "Users can read own notifications" ON public.notifications
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Users can update own notifications' AND tablename = 'notifications'
    ) THEN
        CREATE POLICY "Users can update own notifications" ON public.notifications
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Create database functions
-- Function to add XP to student and handle level progression
CREATE OR REPLACE FUNCTION add_student_xp(student_user_id uuid, xp_amount integer)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_profile record;
    new_xp integer;
    new_level integer;
    level_up boolean := false;
BEGIN
    -- Get current student profile
    SELECT * INTO current_profile 
    FROM student_profiles 
    WHERE user_id = student_user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Student profile not found for user %', student_user_id;
    END IF;
    
    -- Calculate new XP and level
    new_xp := current_profile.xp + xp_amount;
    new_level := FLOOR(new_xp / 1000) + 1;
    
    -- Check if leveled up
    IF new_level > current_profile.level THEN
        level_up := true;
    END IF;
    
    -- Update student profile
    UPDATE student_profiles 
    SET 
        xp = new_xp,
        level = new_level,
        last_activity = now(),
        updated_at = now()
    WHERE user_id = student_user_id;
    
    -- Return updated data
    RETURN json_build_object(
        'user_id', student_user_id,
        'old_xp', current_profile.xp,
        'new_xp', new_xp,
        'old_level', current_profile.level,
        'new_level', new_level,
        'level_up', level_up,
        'xp_gained', xp_amount
    );
END;
$$;

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
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
    WHERE 
        u.role = 'student'
        AND (
            class_id_param IS NULL 
            OR u.id IN (
                SELECT cs.student_id 
                FROM class_students cs 
                WHERE cs.class_id = class_id_param
            )
        )
        AND (
            time_frame = 'all'
            OR (time_frame = 'weekly' AND sp.last_activity >= now() - interval '7 days')
            OR (time_frame = 'monthly' AND sp.last_activity >= now() - interval '30 days')
            OR (time_frame = 'daily' AND sp.last_activity >= now() - interval '1 day')
        )
    ORDER BY sp.xp DESC
    LIMIT 100;
END;
$$;

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION check_achievements(student_user_id uuid)
RETURNS json[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    student_data record;
    achievement record;
    new_achievements json[] := '{}';
    achievement_json json;
BEGIN
    -- Get student data
    SELECT 
        sp.*,
        u.full_name,
        (SELECT COUNT(*) FROM quiz_attempts qa WHERE qa.student_id = student_user_id) as quiz_count,
        (SELECT COUNT(*) FROM wellness_entries we WHERE we.student_id = student_user_id) as wellness_count
    INTO student_data
    FROM student_profiles sp
    JOIN users u ON u.id = sp.user_id
    WHERE sp.user_id = student_user_id;
    
    -- Check each achievement
    FOR achievement IN 
        SELECT * FROM achievements 
        WHERE id NOT IN (
            SELECT achievement_id 
            FROM student_achievements 
            WHERE student_id = student_user_id
        )
    LOOP
        -- Check if student meets requirements
        IF (
            (achievement.category = 'learning' AND 
             ((achievement.requirements->>'quiz_count')::int IS NULL OR 
              student_data.quiz_count >= (achievement.requirements->>'quiz_count')::int)) OR
            (achievement.category = 'streak' AND 
             student_data.streak_days >= (achievement.requirements->>'streak_days')::int) OR
            (achievement.category = 'wellness' AND 
             student_data.wellness_count >= (achievement.requirements->>'wellness_count')::int) OR
            (achievement.category = 'social' AND 
             student_data.level >= (achievement.requirements->>'level')::int)
        ) THEN
            -- Award achievement
            INSERT INTO student_achievements (student_id, achievement_id)
            VALUES (student_user_id, achievement.id)
            ON CONFLICT DO NOTHING;
            
            -- Add to return array
            achievement_json := json_build_object(
                'id', achievement.id,
                'name', achievement.name,
                'description', achievement.description,
                'icon', achievement.icon,
                'xp_reward', achievement.xp_reward
            );
            new_achievements := array_append(new_achievements, achievement_json);
        END IF;
    END LOOP;
    
    RETURN new_achievements;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;