/*
# MentorQuest Safe Seeding Script

This script safely seeds the MentorQuest database with demo data.
It uses ON CONFLICT DO NOTHING to prevent duplicates on re-runs.

## Demo Accounts:
- teacher@demo.com / password123 (Teacher)
- student@demo.com / password123 (Student)

## Seeded Data:
1. Demo users with explicit UUIDs
2. Teacher and student profiles
3. Sample courses and lessons
4. Quiz questions and sample attempts
5. Achievements and gamification data
6. Wellness entries and notifications
*/

-- Insert demo users with explicit UUIDs
INSERT INTO public.users (id, email, full_name, role, preferences, created_at, updated_at)
VALUES 
    (
        '11111111-1111-1111-1111-111111111111',
        'teacher@demo.com',
        'Prof. Sarah Wilson',
        'teacher',
        '{"theme": "light", "language": "en", "text_size": "medium", "dyslexic_font": false, "high_contrast": false, "voice_enabled": true, "reduced_motion": false}'::jsonb,
        now(),
        now()
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        'student@demo.com',
        'Alex Johnson',
        'student',
        '{"theme": "light", "language": "en", "text_size": "medium", "dyslexic_font": false, "high_contrast": false, "voice_enabled": true, "reduced_motion": false}'::jsonb,
        now(),
        now()
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        'teacher2@demo.com',
        'Dr. Michael Chen',
        'teacher',
        '{"theme": "dark", "language": "en", "text_size": "large", "dyslexic_font": false, "high_contrast": false, "voice_enabled": true, "reduced_motion": false}'::jsonb,
        now(),
        now()
    ),
    (
        '44444444-4444-4444-4444-444444444444',
        'student2@demo.com',
        'Emma Davis',
        'student',
        '{"theme": "light", "language": "es", "text_size": "medium", "dyslexic_font": true, "high_contrast": false, "voice_enabled": true, "reduced_motion": false}'::jsonb,
        now(),
        now()
    ),
    (
        '55555555-5555-5555-5555-555555555555',
        'student3@demo.com',
        'Carlos Rodriguez',
        'student',
        '{"theme": "light", "language": "es", "text_size": "medium", "dyslexic_font": false, "high_contrast": true, "voice_enabled": false, "reduced_motion": true}'::jsonb,
        now(),
        now()
    ),
    (
        '66666666-6666-6666-6666-666666666666',
        'student4@demo.com',
        'Priya Patel',
        'student',
        '{"theme": "light", "language": "hi", "text_size": "small", "dyslexic_font": false, "high_contrast": false, "voice_enabled": true, "reduced_motion": false}'::jsonb,
        now(),
        now()
    )
ON CONFLICT (email) DO NOTHING;

-- Insert teacher profiles
INSERT INTO public.teacher_profiles (id, user_id, school, subjects, verified, bio, created_at, updated_at)
VALUES 
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '11111111-1111-1111-1111-111111111111',
        'MentorQuest Academy',
        ARRAY['Mathematics', 'Physics', 'Computer Science'],
        true,
        'Experienced educator with 15+ years in STEM education. Passionate about making complex concepts accessible to all students.',
        now(),
        now()
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        '33333333-3333-3333-3333-333333333333',
        'Global Learning Institute',
        ARRAY['Chemistry', 'Biology', 'Environmental Science'],
        true,
        'Research scientist turned educator. Specializes in hands-on learning and real-world applications of science.',
        now(),
        now()
    )
ON CONFLICT (id) DO NOTHING;

-- Insert student profiles with gamification data
INSERT INTO public.student_profiles (id, user_id, level, xp, streak_days, last_activity, total_study_time, achievements, wellness_streak, created_at, updated_at)
VALUES 
    (
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        '22222222-2222-2222-2222-222222222222',
        3,
        2150,
        7,
        now() - interval '2 hours',
        480,
        '[]'::jsonb,
        5,
        now() - interval '30 days',
        now()
    ),
    (
        'dddddddd-dddd-dddd-dddd-dddddddddddd',
        '44444444-4444-4444-4444-444444444444',
        2,
        1350,
        3,
        now() - interval '1 day',
        320,
        '[]'::jsonb,
        2,
        now() - interval '20 days',
        now()
    ),
    (
        'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        '55555555-5555-5555-5555-555555555555',
        4,
        3200,
        12,
        now() - interval '30 minutes',
        720,
        '[]'::jsonb,
        8,
        now() - interval '45 days',
        now()
    ),
    (
        'ffffffff-ffff-ffff-ffff-ffffffffffff',
        '66666666-6666-6666-6666-666666666666',
        1,
        450,
        1,
        now() - interval '3 hours',
        120,
        '[]'::jsonb,
        1,
        now() - interval '5 days',
        now()
    )
ON CONFLICT (id) DO NOTHING;

-- Insert classes
INSERT INTO public.classes (id, teacher_id, name, subject, description, class_code, active, created_at, updated_at)
VALUES 
    (
        '10101010-1010-1010-1010-101010101010',
        '11111111-1111-1111-1111-111111111111',
        'Advanced Mathematics',
        'Mathematics',
        'Calculus, algebra, and advanced mathematical concepts for high school students.',
        'MATH2024',
        true,
        now() - interval '60 days',
        now()
    ),
    (
        '20202020-2020-2020-2020-202020202020',
        '11111111-1111-1111-1111-111111111111',
        'Physics Fundamentals',
        'Physics',
        'Introduction to mechanics, thermodynamics, and electromagnetism.',
        'PHYS2024',
        true,
        now() - interval '45 days',
        now()
    ),
    (
        '30303030-3030-3030-3030-303030303030',
        '33333333-3333-3333-3333-333333333333',
        'Chemistry Lab',
        'Chemistry',
        'Hands-on chemistry experiments and theoretical foundations.',
        'CHEM2024',
        true,
        now() - interval '30 days',
        now()
    )
ON CONFLICT (id) DO NOTHING;

-- Insert class enrollments
INSERT INTO public.class_students (id, class_id, student_id, joined_at)
VALUES 
    (
        'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1',
        '10101010-1010-1010-1010-101010101010',
        '22222222-2222-2222-2222-222222222222',
        now() - interval '55 days'
    ),
    (
        'c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2',
        '10101010-1010-1010-1010-101010101010',
        '44444444-4444-4444-4444-444444444444',
        now() - interval '50 days'
    ),
    (
        'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3',
        '20202020-2020-2020-2020-202020202020',
        '55555555-5555-5555-5555-555555555555',
        now() - interval '40 days'
    ),
    (
        'c4c4c4c4-c4c4-c4c4-c4c4-c4c4c4c4c4c4',
        '30303030-3030-3030-3030-303030303030',
        '66666666-6666-6666-6666-666666666666',
        now() - interval '25 days'
    )
ON CONFLICT (class_id, student_id) DO NOTHING;

-- Insert courses
INSERT INTO public.courses (id, teacher_id, title, description, subject, difficulty_level, language, active, created_at, updated_at)
VALUES 
    (
        '40404040-4040-4040-4040-404040404040',
        '11111111-1111-1111-1111-111111111111',
        'Calculus Fundamentals',
        'Master the basics of differential and integral calculus with practical applications.',
        'Mathematics',
        'intermediate',
        'en',
        true,
        now() - interval '50 days',
        now()
    ),
    (
        '50505050-5050-5050-5050-505050505050',
        '11111111-1111-1111-1111-111111111111',
        'Linear Algebra',
        'Vectors, matrices, and linear transformations explained clearly.',
        'Mathematics',
        'advanced',
        'en',
        true,
        now() - interval '40 days',
        now()
    ),
    (
        '60606060-6060-6060-6060-606060606060',
        '33333333-3333-3333-3333-333333333333',
        'Organic Chemistry',
        'Comprehensive introduction to organic compounds and reactions.',
        'Chemistry',
        'intermediate',
        'en',
        true,
        now() - interval '35 days',
        now()
    )
ON CONFLICT (id) DO NOTHING;

-- Insert lessons
INSERT INTO public.lessons (id, course_id, title, content, lesson_order, duration_minutes, objectives, resources, created_at, updated_at)
VALUES 
    (
        '70707070-7070-7070-7070-707070707070',
        '40404040-4040-4040-4040-404040404040',
        'Introduction to Limits',
        'Understanding the concept of limits and their role in calculus. We will explore how functions behave as they approach specific values.',
        1,
        45,
        ARRAY['Understand the definition of a limit', 'Calculate basic limits', 'Apply limit laws'],
        '[{"type": "video", "title": "Limits Explained", "url": "https://example.com/limits"}, {"type": "practice", "title": "Limit Problems", "url": "https://example.com/practice"}]'::jsonb,
        now() - interval '45 days',
        now()
    ),
    (
        '80808080-8080-8080-8080-808080808080',
        '40404040-4040-4040-4040-404040404040',
        'Derivatives and Differentiation',
        'Learn how to find derivatives using various rules and techniques. Understand the geometric and physical interpretations.',
        2,
        60,
        ARRAY['Master the power rule', 'Apply product and quotient rules', 'Understand chain rule'],
        '[{"type": "interactive", "title": "Derivative Calculator", "url": "https://example.com/calc"}, {"type": "worksheet", "title": "Practice Problems", "url": "https://example.com/worksheet"}]'::jsonb,
        now() - interval '40 days',
        now()
    ),
    (
        '90909090-9090-9090-9090-909090909090',
        '60606060-6060-6060-6060-606060606060',
        'Alkanes and Alkenes',
        'Study the structure, properties, and reactions of saturated and unsaturated hydrocarbons.',
        1,
        50,
        ARRAY['Identify alkane and alkene structures', 'Predict reaction products', 'Understand stereochemistry'],
        '[{"type": "3d_model", "title": "Molecular Models", "url": "https://example.com/3d"}, {"type": "quiz", "title": "Structure Quiz", "url": "https://example.com/quiz"}]'::jsonb,
        now() - interval '30 days',
        now()
    )
ON CONFLICT (id) DO NOTHING;

-- Insert quizzes
INSERT INTO public.quizzes (id, course_id, teacher_id, title, description, difficulty_level, subject, time_limit, max_attempts, active, created_at, updated_at)
VALUES 
    (
        'q1q1q1q1-q1q1-q1q1-q1q1-q1q1q1q1q1q1',
        '40404040-4040-4040-4040-404040404040',
        '11111111-1111-1111-1111-111111111111',
        'Limits and Continuity Quiz',
        'Test your understanding of limits, continuity, and basic calculus concepts.',
        'medium',
        'Mathematics',
        30,
        3,
        true,
        now() - interval '35 days',
        now()
    ),
    (
        'q2q2q2q2-q2q2-q2q2-q2q2-q2q2q2q2q2q2',
        '60606060-6060-6060-6060-606060606060',
        '33333333-3333-3333-3333-333333333333',
        'Hydrocarbon Structures',
        'Identify and name various hydrocarbon compounds and their properties.',
        'easy',
        'Chemistry',
        20,
        2,
        true,
        now() - interval '25 days',
        now()
    ),
    (
        'q3q3q3q3-q3q3-q3q3-q3q3-q3q3q3q3q3q3',
        NULL,
        '11111111-1111-1111-1111-111111111111',
        'General Physics Quiz',
        'Mixed questions covering mechanics, waves, and thermodynamics.',
        'hard',
        'Physics',
        45,
        2,
        true,
        now() - interval '20 days',
        now()
    )
ON CONFLICT (id) DO NOTHING;

-- Insert quiz questions
INSERT INTO public.quiz_questions (id, quiz_id, question_text, question_type, options, correct_answer, explanation, points, question_order, created_at)
VALUES 
    (
        'qq1qq1qq-1qq1-qq1q-q1qq-1qq1qq1qq1qq',
        'q1q1q1q1-q1q1-q1q1-q1q1-q1q1q1q1q1q1',
        'What is the limit of (x² - 4)/(x - 2) as x approaches 2?',
        'multiple_choice',
        '["2", "4", "0", "undefined"]'::jsonb,
        '4',
        'Factor the numerator: (x² - 4) = (x + 2)(x - 2). Cancel (x - 2) terms to get x + 2. As x approaches 2, the limit is 2 + 2 = 4.',
        15,
        1,
        now() - interval '35 days'
    ),
    (
        'qq2qq2qq-2qq2-qq2q-q2qq-2qq2qq2qq2qq',
        'q1q1q1q1-q1q1-q1q1-q1q1-q1q1q1q1q1q1',
        'A function is continuous at x = a if:',
        'multiple_choice',
        '["f(a) exists", "lim(x→a) f(x) exists", "lim(x→a) f(x) = f(a)", "All of the above"]'::jsonb,
        'All of the above',
        'For continuity at a point, three conditions must be met: the function value exists, the limit exists, and they are equal.',
        10,
        2,
        now() - interval '35 days'
    ),
    (
        'qq3qq3qq-3qq3-qq3q-q3qq-3qq3qq3qq3qq',
        'q2q2q2q2-q2q2-q2q2-q2q2-q2q2q2q2q2q2',
        'What is the molecular formula for methane?',
        'multiple_choice',
        '["CH₄", "C₂H₆", "C₃H₈", "C₄H₁₀"]'::jsonb,
        'CH₄',
        'Methane is the simplest alkane with one carbon atom bonded to four hydrogen atoms.',
        10,
        1,
        now() - interval '25 days'
    ),
    (
        'qq4qq4qq-4qq4-qq4q-q4qq-4qq4qq4qq4qq',
        'q3q3q3q3-q3q3-q3q3-q3q3-q3q3q3q3q3q3',
        'What is the acceleration due to gravity on Earth?',
        'multiple_choice',
        '["9.8 m/s²", "10 m/s²", "9.81 m/s²", "Both A and C are correct"]'::jsonb,
        'Both A and C are correct',
        'The standard acceleration due to gravity is approximately 9.81 m/s², often rounded to 9.8 m/s² for calculations.',
        15,
        1,
        now() - interval '20 days'
    )
ON CONFLICT (id) DO NOTHING;

-- Insert sample quiz attempts
INSERT INTO public.quiz_attempts (id, quiz_id, student_id, answers, score, max_score, time_taken, completed_at, xp_earned)
VALUES 
    (
        'qa1qa1qa-1qa1-qa1q-a1qa-1qa1qa1qa1qa',
        'q1q1q1q1-q1q1-q1q1-q1q1-q1q1q1q1q1q1',
        '22222222-2222-2222-2222-222222222222',
        '{"qq1qq1qq-1qq1-qq1q-q1qq-1qq1qq1qq1qq": "4", "qq2qq2qq-2qq2-qq2q-q2qq-2qq2qq2qq2qq": "All of the above"}'::jsonb,
        25,
        25,
        1200,
        now() - interval '10 days',
        50
    ),
    (
        'qa2qa2qa-2qa2-qa2q-a2qa-2qa2qa2qa2qa',
        'q2q2q2q2-q2q2-q2q2-q2q2-q2q2q2q2q2q2',
        '44444444-4444-4444-4444-444444444444',
        '{"qq3qq3qq-3qq3-qq3q-q3qq-3qq3qq3qq3qq": "CH₄"}'::jsonb,
        10,
        10,
        800,
        now() - interval '15 days',
        25
    )
ON CONFLICT (id) DO NOTHING;

-- Insert achievements
INSERT INTO public.achievements (id, name, description, icon, category, requirements, xp_reward, rarity, created_at)
VALUES 
    (
        'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1',
        'First Steps',
        'Complete your first quiz',
        '🎯',
        'learning',
        '{"quiz_count": 1}'::jsonb,
        50,
        'common',
        now() - interval '60 days'
    ),
    (
        'a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2',
        'Quiz Master',
        'Complete 10 quizzes',
        '🏆',
        'learning',
        '{"quiz_count": 10}'::jsonb,
        200,
        'rare',
        now() - interval '60 days'
    ),
    (
        'a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3',
        'Streak Keeper',
        'Maintain a 7-day study streak',
        '🔥',
        'streak',
        '{"streak_days": 7}'::jsonb,
        150,
        'rare',
        now() - interval '60 days'
    ),
    (
        'a4a4a4a4-a4a4-a4a4-a4a4-a4a4a4a4a4a4',
        'Wellness Warrior',
        'Complete 30 wellness check-ins',
        '💚',
        'wellness',
        '{"wellness_count": 30}'::jsonb,
        300,
        'epic',
        now() - interval '60 days'
    ),
    (
        'a5a5a5a5-a5a5-a5a5-a5a5-a5a5a5a5a5a5',
        'Level Up',
        'Reach level 5',
        '⭐',
        'social',
        '{"level": 5}'::jsonb,
        500,
        'epic',
        now() - interval '60 days'
    ),
    (
        'a6a6a6a6-a6a6-a6a6-a6a6-a6a6a6a6a6a6',
        'Perfect Score',
        'Get 100% on any quiz',
        '💯',
        'learning',
        '{"perfect_quiz": true}'::jsonb,
        100,
        'rare',
        now() - interval '60 days'
    ),
    (
        'a7a7a7a7-a7a7-a7a7-a7a7-a7a7a7a7a7a7',
        'Early Bird',
        'Complete a quiz before 8 AM',
        '🌅',
        'special',
        '{"early_completion": true}'::jsonb,
        75,
        'common',
        now() - interval '60 days'
    ),
    (
        'a8a8a8a8-a8a8-a8a8-a8a8-a8a8a8a8a8a8',
        'Night Owl',
        'Study after 10 PM',
        '🦉',
        'special',
        '{"late_study": true}'::jsonb,
        75,
        'common',
        now() - interval '60 days'
    ),
    (
        'a9a9a9a9-a9a9-a9a9-a9a9-a9a9a9a9a9a9',
        'Helping Hand',
        'Help 5 classmates',
        '🤝',
        'social',
        '{"help_count": 5}'::jsonb,
        250,
        'rare',
        now() - interval '60 days'
    ),
    (
        'a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a0a0',
        'Legend',
        'Reach level 10 with 10,000 XP',
        '👑',
        'social',
        '{"level": 10, "xp": 10000}'::jsonb,
        1000,
        'legendary',
        now() - interval '60 days'
    )
ON CONFLICT (id) DO NOTHING;

-- Insert student achievements
INSERT INTO public.student_achievements (id, student_id, achievement_id, unlocked_at)
VALUES 
    (
        'sa1sa1sa-1sa1-sa1s-a1sa-1sa1sa1sa1sa',
        '22222222-2222-2222-2222-222222222222',
        'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1',
        now() - interval '10 days'
    ),
    (
        'sa2sa2sa-2sa2-sa2s-a2sa-2sa2sa2sa2sa',
        '22222222-2222-2222-2222-222222222222',
        'a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3',
        now() - interval '5 days'
    ),
    (
        'sa3sa3sa-3sa3-sa3s-a3sa-3sa3sa3sa3sa',
        '55555555-5555-5555-5555-555555555555',
        'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1',
        now() - interval '15 days'
    ),
    (
        'sa4sa4sa-4sa4-sa4s-a4sa-4sa4sa4sa4sa',
        '55555555-5555-5555-5555-555555555555',
        'a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3',
        now() - interval '8 days'
    )
ON CONFLICT (student_id, achievement_id) DO NOTHING;

-- Insert daily quests
INSERT INTO public.daily_quests (id, student_id, title, description, quest_type, target_value, current_progress, xp_reward, completed, expires_at, created_at)
VALUES 
    (
        'dq1dq1dq-1dq1-dq1d-q1dq-1dq1dq1dq1dq',
        '22222222-2222-2222-2222-222222222222',
        'Study Session',
        'Complete a 30-minute study session',
        'study_time',
        30,
        0,
        50,
        false,
        (CURRENT_DATE + INTERVAL '1 day')::timestamp with time zone,
        now()
    ),
    (
        'dq2dq2dq-2dq2-dq2d-q2dq-2dq2dq2dq2dq',
        '22222222-2222-2222-2222-222222222222',
        'Quiz Challenge',
        'Complete 2 quizzes today',
        'quiz_completion',
        2,
        1,
        75,
        false,
        (CURRENT_DATE + INTERVAL '1 day')::timestamp with time zone,
        now()
    ),
    (
        'dq3dq3dq-3dq3-dq3d-q3dq-3dq3dq3dq3dq',
        '44444444-4444-4444-4444-444444444444',
        'Wellness Check',
        'Complete your daily wellness check-in',
        'wellness_checkin',
        1,
        0,
        25,
        false,
        (CURRENT_DATE + INTERVAL '1 day')::timestamp with time zone,
        now()
    ),
    (
        'dq4dq4dq-4dq4-dq4d-q4dq-4dq4dq4dq4dq',
        '55555555-5555-5555-5555-555555555555',
        'Streak Keeper',
        'Maintain your study streak',
        'streak',
        1,
        1,
        30,
        true,
        (CURRENT_DATE + INTERVAL '1 day')::timestamp with time zone,
        now()
    )
ON CONFLICT (id) DO NOTHING;

-- Insert wellness entries
INSERT INTO public.wellness_entries (id, student_id, date, mood, stress_level, energy_level, notes, activities, created_at)
VALUES 
    (
        'we1we1we-1we1-we1w-e1we-1we1we1we1we',
        '22222222-2222-2222-2222-222222222222',
        CURRENT_DATE - INTERVAL '1 day',
        4,
        2,
        4,
        'Feeling good after completing the calculus quiz. Ready for more challenges!',
        ARRAY['deep_breathing', 'short_walk', 'healthy_snack'],
        now() - interval '1 day'
    ),
    (
        'we2we2we-2we2-we2w-e2we-2we2we2we2we',
        '44444444-4444-4444-4444-444444444444',
        CURRENT_DATE - INTERVAL '2 days',
        3,
        3,
        3,
        'Moderate stress from upcoming exams, but managing well.',
        ARRAY['meditation', 'music', 'journaling'],
        now() - interval '2 days'
    ),
    (
        'we3we3we-3we3-we3w-e3we-3we3we3we3we',
        '55555555-5555-5555-5555-555555555555',
        CURRENT_DATE,
        5,
        1,
        5,
        'Excellent day! Understood all the chemistry concepts and feeling energized.',
        ARRAY['stretching', 'hydrate', 'call_friend'],
        now()
    ),
    (
        'we4we4we-4we4-we4w-e4we-4we4we4we4we',
        '66666666-6666-6666-6666-666666666666',
        CURRENT_DATE - INTERVAL '1 day',
        2,
        4,
        2,
        'Struggling with some concepts. Need to ask for help.',
        ARRAY['deep_breathing', 'gratitude'],
        now() - interval '1 day'
    )
ON CONFLICT (student_id, date) DO NOTHING;

-- Insert study sessions
INSERT INTO public.study_sessions (id, student_id, subject, duration_minutes, focus_score, breaks_taken, completed_at, xp_earned)
VALUES 
    (
        'ss1ss1ss-1ss1-ss1s-s1ss-1ss1ss1ss1ss',
        '22222222-2222-2222-2222-222222222222',
        'Mathematics',
        45,
        8,
        1,
        now() - interval '2 hours',
        45
    ),
    (
        'ss2ss2ss-2ss2-ss2s-s2ss-2ss2ss2ss2ss',
        '44444444-4444-4444-4444-444444444444',
        'Chemistry',
        30,
        7,
        0,
        now() - interval '1 day',
        30
    ),
    (
        'ss3ss3ss-3ss3-ss3s-s3ss-3ss3ss3ss3ss',
        '55555555-5555-5555-5555-555555555555',
        'Physics',
        60,
        9,
        2,
        now() - interval '3 hours',
        60
    )
ON CONFLICT (id) DO NOTHING;

-- Insert AI tutor sessions
INSERT INTO public.ai_tutor_sessions (id, student_id, question, answer, subject, difficulty_level, satisfaction_rating, follow_up_questions, created_at)
VALUES 
    (
        'ai1ai1ai-1ai1-ai1a-i1ai-1ai1ai1ai1ai',
        '22222222-2222-2222-2222-222222222222',
        'How do I solve quadratic equations?',
        'Quadratic equations can be solved using several methods: 1) Factoring, 2) Quadratic formula, 3) Completing the square. The quadratic formula x = (-b ± √(b²-4ac))/2a works for all quadratic equations ax² + bx + c = 0.',
        'Mathematics',
        'medium',
        5,
        '["Can you show me an example of factoring?", "When should I use the quadratic formula?", "What is completing the square?"]'::jsonb,
        now() - interval '3 hours'
    ),
    (
        'ai2ai2ai-2ai2-ai2a-i2ai-2ai2ai2ai2ai',
        '44444444-4444-4444-4444-444444444444',
        'What is the difference between ionic and covalent bonds?',
        'Ionic bonds form between metals and non-metals through electron transfer, creating charged ions. Covalent bonds form between non-metals through electron sharing. Ionic compounds typically have high melting points and conduct electricity when dissolved, while covalent compounds often have lower melting points and don\'t conduct electricity.',
        'Chemistry',
        'easy',
        4,
        '["Can you give examples of ionic compounds?", "How do I identify bond types?", "What about polar covalent bonds?"]'::jsonb,
        now() - interval '1 day'
    ),
    (
        'ai3ai3ai-3ai3-ai3a-i3ai-3ai3ai3ai3ai',
        '55555555-5555-5555-5555-555555555555',
        'Explain Newton\'s laws of motion',
        'Newton\'s three laws: 1) An object at rest stays at rest, an object in motion stays in motion unless acted upon by a force. 2) F = ma (Force equals mass times acceleration). 3) For every action, there is an equal and opposite reaction. These laws form the foundation of classical mechanics.',
        'Physics',
        'medium',
        5,
        '["Can you give real-world examples?", "How do these apply to circular motion?", "What about friction forces?"]'::jsonb,
        now() - interval '5 hours'
    )
ON CONFLICT (id) DO NOTHING;

-- Insert notifications
INSERT INTO public.notifications (id, user_id, title, message, notification_type, read, action_url, created_at)
VALUES 
    (
        'n1n1n1n1-n1n1-n1n1-n1n1-n1n1n1n1n1n1',
        '22222222-2222-2222-2222-222222222222',
        'Welcome to MentorQuest!',
        'Start your learning journey with our AI tutor and interactive quizzes.',
        'info',
        false,
        '/ai-tutor',
        now() - interval '30 days'
    ),
    (
        'n2n2n2n2-n2n2-n2n2-n2n2-n2n2n2n2n2n2',
        '22222222-2222-2222-2222-222222222222',
        'Achievement Unlocked!',
        'Congratulations! You\'ve unlocked the "First Steps" achievement.',
        'achievement',
        true,
        '/profile',
        now() - interval '10 days'
    ),
    (
        'n3n3n3n3-n3n3-n3n3-n3n3-n3n3n3n3n3n3',
        '44444444-4444-4444-4444-444444444444',
        'New Quiz Available',
        'Prof. Wilson has created a new quiz: "Hydrocarbon Structures"',
        'info',
        false,
        '/quizzes',
        now() - interval '2 days'
    ),
    (
        'n4n4n4n4-n4n4-n4n4-n4n4-n4n4n4n4n4n4',
        '11111111-1111-1111-1111-111111111111',
        'Student Needs Help',
        'Priya Patel is struggling with chemistry concepts and may need additional support.',
        'warning',
        false,
        '/analytics',
        now() - interval '1 day'
    ),
    (
        'n5n5n5n5-n5n5-n5n5-n5n5-n5n5n5n5n5n5',
        '55555555-5555-5555-5555-555555555555',
        'Streak Milestone!',
        'Amazing! You\'ve maintained a 12-day study streak. Keep it up!',
        'success',
        false,
        '/dashboard',
        now() - interval '6 hours'
    )
ON CONFLICT (id) DO NOTHING;

-- Insert live sessions
INSERT INTO public.live_sessions (id, class_id, teacher_id, title, description, start_time, end_time, active, participants, quiz_id, created_at)
VALUES 
    (
        'ls1ls1ls-1ls1-ls1l-s1ls-1ls1ls1ls1ls',
        '10101010-1010-1010-1010-101010101010',
        '11111111-1111-1111-1111-111111111111',
        'Calculus Review Session',
        'Review of limits, derivatives, and integration techniques before the midterm exam.',
        now() + interval '2 hours',
        now() + interval '3 hours',
        false,
        '[]'::jsonb,
        'q1q1q1q1-q1q1-q1q1-q1q1-q1q1q1q1q1q1',
        now() - interval '1 day'
    ),
    (
        'ls2ls2ls-2ls2-ls2l-s2ls-2ls2ls2ls2ls',
        '30303030-3030-3030-3030-303030303030',
        '33333333-3333-3333-3333-333333333333',
        'Chemistry Lab Demo',
        'Virtual demonstration of organic synthesis reactions.',
        now() + interval '1 day',
        now() + interval '1 day 1 hour',
        false,
        '[]'::jsonb,
        NULL,
        now() - interval '2 hours'
    )
ON CONFLICT (id) DO NOTHING;

-- Update sequences to prevent conflicts
SELECT setval('users_id_seq', (SELECT MAX(id::text)::bigint FROM users WHERE id::text ~ '^[0-9]+$') + 1, false);