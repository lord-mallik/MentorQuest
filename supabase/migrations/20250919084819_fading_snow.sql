/*
  # Seed Initial Data for MentorQuest

  This file seeds the database with demo data including:
  - Demo users (students and teachers)
  - Student and teacher profiles
  - Sample courses and lessons
  - Achievements and quests
  - Sample notifications

  IMPORTANT: Users are inserted first to avoid foreign key constraint errors
*/

-- Insert demo users first (to avoid foreign key errors)
INSERT INTO users (id, email, full_name, role, avatar_url, preferences) VALUES
  -- Demo Teachers
  ('550e8400-e29b-41d4-a716-446655440001', 'teacher@demo.com', 'Prof. Sarah Wilson', 'teacher', null, '{"language": "en", "theme": "light", "dyslexic_font": false, "high_contrast": false, "reduced_motion": false, "text_size": "medium", "voice_enabled": true}'),
  ('550e8400-e29b-41d4-a716-446655440002', 'teacher2@demo.com', 'Dr. Michael Chen', 'teacher', null, '{"language": "en", "theme": "light", "dyslexic_font": false, "high_contrast": false, "reduced_motion": false, "text_size": "medium", "voice_enabled": true}'),
  
  -- Demo Students
  ('550e8400-e29b-41d4-a716-446655440003', 'student@demo.com', 'Alex Johnson', 'student', null, '{"language": "en", "theme": "light", "dyslexic_font": false, "high_contrast": false, "reduced_motion": false, "text_size": "medium", "voice_enabled": true}'),
  ('550e8400-e29b-41d4-a716-446655440004', 'student2@demo.com', 'Emma Davis', 'student', null, '{"language": "en", "theme": "light", "dyslexic_font": false, "high_contrast": false, "reduced_motion": false, "text_size": "medium", "voice_enabled": true}'),
  ('550e8400-e29b-41d4-a716-446655440005', 'student3@demo.com', 'Carlos Rodriguez', 'student', null, '{"language": "es", "theme": "light", "dyslexic_font": false, "high_contrast": false, "reduced_motion": false, "text_size": "medium", "voice_enabled": true}'),
  ('550e8400-e29b-41d4-a716-446655440006', 'student4@demo.com', 'Priya Patel', 'student', null, '{"language": "hi", "theme": "light", "dyslexic_font": false, "high_contrast": false, "reduced_motion": false, "text_size": "medium", "voice_enabled": true}')
ON CONFLICT (email) DO NOTHING;

-- Insert teacher profiles
INSERT INTO teacher_profiles (user_id, school, subjects, verified, bio) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Demo High School', ARRAY['Mathematics', 'Physics'], true, 'Experienced mathematics teacher with 10+ years in education. Passionate about making complex concepts accessible to all students.'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Demo University', ARRAY['Computer Science', 'Data Science'], true, 'Computer Science professor specializing in AI and machine learning education.')
ON CONFLICT (user_id) DO NOTHING;

-- Insert student profiles with gamification data
INSERT INTO student_profiles (user_id, level, xp, streak_days, total_study_time, wellness_streak) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', 5, 4250, 7, 1200, 3),
  ('550e8400-e29b-41d4-a716-446655440004', 3, 2100, 12, 800, 5),
  ('550e8400-e29b-41d4-a716-446655440005', 4, 3500, 4, 950, 2),
  ('550e8400-e29b-41d4-a716-446655440006', 2, 1800, 15, 600, 8)
ON CONFLICT (user_id) DO NOTHING;

-- Insert sample courses (now that teachers exist)
INSERT INTO courses (id, teacher_id, title, description, subject, difficulty_level, active) VALUES
  ('course-math-001', '550e8400-e29b-41d4-a716-446655440001', 'Algebra Fundamentals', 'Master the basics of algebraic expressions, equations, and problem-solving techniques', 'Mathematics', 'beginner', true),
  ('course-math-002', '550e8400-e29b-41d4-a716-446655440001', 'Advanced Calculus', 'Dive deep into differential and integral calculus with real-world applications', 'Mathematics', 'advanced', true),
  ('course-physics-001', '550e8400-e29b-41d4-a716-446655440001', 'Physics Basics', 'Introduction to mechanics, thermodynamics, and wave physics', 'Physics', 'beginner', true),
  ('course-cs-001', '550e8400-e29b-41d4-a716-446655440002', 'Introduction to Programming', 'Learn programming fundamentals with Python', 'Computer Science', 'beginner', true),
  ('course-cs-002', '550e8400-e29b-41d4-a716-446655440002', 'Data Structures & Algorithms', 'Master essential data structures and algorithmic thinking', 'Computer Science', 'intermediate', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample lessons
INSERT INTO lessons (course_id, title, content, lesson_order, duration_minutes, objectives) VALUES
  ('course-math-001', 'Introduction to Variables', 'Learn what variables are and how to use them in algebraic expressions. Variables are symbols that represent unknown values.', 1, 45, ARRAY['Understand what variables represent', 'Identify variables in expressions', 'Create simple algebraic expressions']),
  ('course-math-001', 'Solving Linear Equations', 'Master the techniques for solving linear equations step by step.', 2, 50, ARRAY['Solve one-step equations', 'Solve multi-step equations', 'Check solutions']),
  ('course-physics-001', 'Motion and Velocity', 'Understand the concepts of motion, speed, velocity, and acceleration.', 1, 40, ARRAY['Define motion and velocity', 'Calculate average speed', 'Understand acceleration']),
  ('course-cs-001', 'Python Basics', 'Introduction to Python syntax, variables, and basic data types.', 1, 60, ARRAY['Write your first Python program', 'Understand variables and data types', 'Use basic operators'])
ON CONFLICT DO NOTHING;

-- Insert sample quizzes
INSERT INTO quizzes (id, course_id, teacher_id, title, description, difficulty_level, subject, time_limit, active) VALUES
  ('quiz-math-001', 'course-math-001', '550e8400-e29b-41d4-a716-446655440001', 'Algebra Basics Quiz', 'Test your understanding of basic algebraic concepts', 'easy', 'Mathematics', 15, true),
  ('quiz-physics-001', 'course-physics-001', '550e8400-e29b-41d4-a716-446655440001', 'Motion Quiz', 'Quiz on motion, velocity, and acceleration', 'medium', 'Physics', 20, true),
  ('quiz-cs-001', 'course-cs-001', '550e8400-e29b-41d4-a716-446655440002', 'Python Fundamentals', 'Test your Python basics knowledge', 'easy', 'Computer Science', 25, true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample quiz questions
INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, correct_answer, explanation, points, question_order) VALUES
  ('quiz-math-001', 'What is the value of x in the equation 2x + 5 = 13?', 'multiple_choice', '["x = 3", "x = 4", "x = 5", "x = 6"]', 'x = 4', 'Subtract 5 from both sides: 2x = 8, then divide by 2: x = 4', 10, 1),
  ('quiz-math-001', 'Simplify: 3(x + 2) - 2x', 'multiple_choice', '["x + 6", "x + 4", "5x + 6", "3x + 2"]', 'x + 6', '3(x + 2) - 2x = 3x + 6 - 2x = x + 6', 15, 2),
  ('quiz-physics-001', 'What is the formula for calculating speed?', 'multiple_choice', '["Speed = Distance × Time", "Speed = Distance ÷ Time", "Speed = Time ÷ Distance", "Speed = Force × Distance"]', 'Speed = Distance ÷ Time', 'Speed is calculated by dividing distance by time', 10, 1),
  ('quiz-cs-001', 'Which of the following is a valid Python variable name?', 'multiple_choice', '["2variable", "my-variable", "my_variable", "class"]', 'my_variable', 'Python variable names can contain letters, numbers, and underscores, but cannot start with a number or use reserved keywords', 10, 1)
ON CONFLICT DO NOTHING;

-- Insert sample classes
INSERT INTO classes (id, teacher_id, name, subject, description, class_code) VALUES
  ('class-001', '550e8400-e29b-41d4-a716-446655440001', 'Mathematics Grade 10', 'Mathematics', 'Comprehensive mathematics course for 10th grade students', 'MATH10A'),
  ('class-002', '550e8400-e29b-41d4-a716-446655440001', 'Physics Grade 11', 'Physics', 'Introduction to physics concepts for 11th grade', 'PHYS11B'),
  ('class-003', '550e8400-e29b-41d4-a716-446655440002', 'Computer Science 101', 'Computer Science', 'Introduction to programming and computer science', 'CS101')
ON CONFLICT (id) DO NOTHING;

-- Enroll students in classes
INSERT INTO class_students (class_id, student_id) VALUES
  ('class-001', '550e8400-e29b-41d4-a716-446655440003'),
  ('class-001', '550e8400-e29b-41d4-a716-446655440004'),
  ('class-002', '550e8400-e29b-41d4-a716-446655440003'),
  ('class-003', '550e8400-e29b-41d4-a716-446655440005'),
  ('class-003', '550e8400-e29b-41d4-a716-446655440006')
ON CONFLICT (class_id, student_id) DO NOTHING;

-- Insert achievements
INSERT INTO achievements (id, name, description, icon, category, requirements, xp_reward, rarity) VALUES
  ('ach-001', 'First Steps', 'Complete your first lesson', '🎯', 'learning', '{"lessons_completed": 1}', 50, 'common'),
  ('ach-002', 'Quiz Master', 'Score 90% or higher on 5 quizzes', '🏆', 'learning', '{"high_score_quizzes": 5, "min_score": 90}', 200, 'rare'),
  ('ach-003', 'Streak Warrior', 'Maintain a 7-day study streak', '🔥', 'streak', '{"streak_days": 7}', 150, 'rare'),
  ('ach-004', 'Knowledge Seeker', 'Ask 50 questions to the AI tutor', '🤔', 'learning', '{"ai_questions": 50}', 100, 'common'),
  ('ach-005', 'Wellness Champion', 'Complete 30 wellness check-ins', '💚', 'wellness', '{"wellness_checkins": 30}', 175, 'rare'),
  ('ach-006', 'Social Learner', 'Join 3 different classes', '👥', 'social', '{"classes_joined": 3}', 75, 'common'),
  ('ach-007', 'Perfect Score', 'Get 100% on any quiz', '⭐', 'learning', '{"perfect_quiz": 1}', 300, 'epic'),
  ('ach-008', 'Marathon Learner', 'Study for 10 hours in a week', '⏰', 'learning', '{"weekly_study_hours": 10}', 250, 'epic'),
  ('ach-009', 'Consistency King', 'Maintain a 30-day streak', '👑', 'streak', '{"streak_days": 30}', 500, 'legendary'),
  ('ach-010', 'Helping Hand', 'Help 10 classmates with questions', '🤝', 'social', '{"helped_classmates": 10}', 125, 'rare')
ON CONFLICT (id) DO NOTHING;

-- Award some achievements to demo students
INSERT INTO student_achievements (student_id, achievement_id) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', 'ach-001'),
  ('550e8400-e29b-41d4-a716-446655440003', 'ach-003'),
  ('550e8400-e29b-41d4-a716-446655440004', 'ach-001'),
  ('550e8400-e29b-41d4-a716-446655440004', 'ach-006'),
  ('550e8400-e29b-41d4-a716-446655440005', 'ach-001'),
  ('550e8400-e29b-41d4-a716-446655440006', 'ach-001'),
  ('550e8400-e29b-41d4-a716-446655440006', 'ach-005')
ON CONFLICT (student_id, achievement_id) DO NOTHING;

-- Insert sample daily quests
INSERT INTO daily_quests (student_id, title, description, quest_type, target_value, xp_reward, expires_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', 'Study Session', 'Complete a 30-minute study session', 'study_time', 30, 50, (CURRENT_DATE + INTERVAL '1 day')::timestamptz),
  ('550e8400-e29b-41d4-a716-446655440003', 'Quiz Challenge', 'Complete 2 quizzes today', 'quiz_completion', 2, 75, (CURRENT_DATE + INTERVAL '1 day')::timestamptz),
  ('550e8400-e29b-41d4-a716-446655440004', 'Wellness Check', 'Complete your daily wellness check-in', 'wellness_checkin', 1, 25, (CURRENT_DATE + INTERVAL '1 day')::timestamptz),
  ('550e8400-e29b-41d4-a716-446655440004', 'Streak Keeper', 'Maintain your study streak', 'streak', 1, 30, (CURRENT_DATE + INTERVAL '1 day')::timestamptz),
  ('550e8400-e29b-41d4-a716-446655440005', 'AI Tutor Session', 'Ask 5 questions to the AI tutor', 'study_time', 5, 40, (CURRENT_DATE + INTERVAL '1 day')::timestamptz),
  ('550e8400-e29b-41d4-a716-446655440006', 'Learning Explorer', 'Spend 45 minutes learning today', 'study_time', 45, 60, (CURRENT_DATE + INTERVAL '1 day')::timestamptz)
ON CONFLICT DO NOTHING;

-- Insert sample wellness entries
INSERT INTO wellness_entries (student_id, date, mood, stress_level, energy_level, notes, activities) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', CURRENT_DATE - INTERVAL '1 day', 4, 2, 4, 'Feeling good after completing math homework', ARRAY['study', 'exercise']),
  ('550e8400-e29b-41d4-a716-446655440003', CURRENT_DATE - INTERVAL '2 days', 3, 3, 3, 'Average day, a bit stressed about upcoming quiz', ARRAY['study', 'music']),
  ('550e8400-e29b-41d4-a716-446655440004', CURRENT_DATE - INTERVAL '1 day', 5, 1, 5, 'Great day! Understood physics concepts well', ARRAY['study', 'social', 'exercise']),
  ('550e8400-e29b-41d4-a716-446655440005', CURRENT_DATE - INTERVAL '1 day', 3, 4, 2, 'Tired from late night studying', ARRAY['study', 'rest']),
  ('550e8400-e29b-41d4-a716-446655440006', CURRENT_DATE - INTERVAL '1 day', 4, 2, 4, 'Productive study session with AI tutor', ARRAY['study', 'meditation'])
ON CONFLICT (student_id, date) DO NOTHING;

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, notification_type) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', 'Welcome to MentorQuest!', 'Start your learning journey with our AI tutor and gamified lessons.', 'info'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Achievement Unlocked!', 'You earned the "Streak Warrior" achievement for maintaining a 7-day study streak!', 'achievement'),
  ('550e8400-e29b-41d4-a716-446655440004', 'New Daily Quests Available', 'Check out today''s quests to earn XP and level up!', 'info'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Wellness Reminder', 'Don''t forget to complete your daily wellness check-in!', 'info'),
  ('550e8400-e29b-41d4-a716-446655440005', '¡Bienvenido a MentorQuest!', 'Comienza tu viaje de aprendizaje con nuestro tutor de IA.', 'info'),
  ('550e8400-e29b-41d4-a716-446655440006', 'मेंटरक्वेस्ट में आपका स्वागत है!', 'हमारे AI ट्यूटर के साथ अपनी सीखने की यात्रा शुरू करें।', 'info'),
  ('550e8400-e29b-41d4-a716-446655440001', 'New Student Enrolled', 'Alex Johnson has joined your Mathematics Grade 10 class.', 'info'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Class Performance Update', 'Your Computer Science 101 class average has improved by 15%!', 'success')
ON CONFLICT DO NOTHING;

-- Insert sample AI tutor sessions
INSERT INTO ai_tutor_sessions (student_id, question, answer, subject, difficulty_level, satisfaction_rating) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', 'How do I solve quadratic equations?', 'Quadratic equations can be solved using several methods: factoring, completing the square, or the quadratic formula. The quadratic formula is: x = (-b ± √(b²-4ac)) / 2a, where the equation is in the form ax² + bx + c = 0.', 'Mathematics', 'medium', 5),
  ('550e8400-e29b-41d4-a716-446655440004', 'What is Newton''s first law of motion?', 'Newton''s first law of motion, also known as the law of inertia, states that an object at rest stays at rest and an object in motion stays in motion with the same speed and in the same direction, unless acted upon by an unbalanced force.', 'Physics', 'easy', 4),
  ('550e8400-e29b-41d4-a716-446655440005', '¿Qué es una función en programación?', 'Una función en programación es un bloque de código reutilizable que realiza una tarea específica. Las funciones ayudan a organizar el código, evitar repetición y hacer el programa más modular y fácil de mantener.', 'Computer Science', 'easy', 5),
  ('550e8400-e29b-41d4-a716-446655440006', 'What are variables in algebra?', 'Variables in algebra are symbols (usually letters like x, y, or z) that represent unknown or changing values. They allow us to write general mathematical expressions and equations that can work with different numbers.', 'Mathematics', 'easy', 4)
ON CONFLICT DO NOTHING;

-- Insert sample study sessions
INSERT INTO study_sessions (student_id, subject, duration_minutes, focus_score, breaks_taken, xp_earned) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', 'Mathematics', 45, 8, 1, 45),
  ('550e8400-e29b-41d4-a716-446655440003', 'Physics', 30, 7, 0, 30),
  ('550e8400-e29b-41d4-a716-446655440004', 'Mathematics', 60, 9, 2, 60),
  ('550e8400-e29b-41d4-a716-446655440004', 'Physics', 40, 6, 1, 40),
  ('550e8400-e29b-41d4-a716-446655440005', 'Computer Science', 50, 8, 1, 50),
  ('550e8400-e29b-41d4-a716-446655440006', 'Mathematics', 35, 7, 1, 35)
ON CONFLICT DO NOTHING;

-- Insert sample quiz attempts
INSERT INTO quiz_attempts (quiz_id, student_id, answers, score, max_score, time_taken, xp_earned) VALUES
  ('quiz-math-001', '550e8400-e29b-41d4-a716-446655440003', '{"q1": "x = 4", "q2": "x + 6"}', 25, 25, 600, 50),
  ('quiz-physics-001', '550e8400-e29b-41d4-a716-446655440003', '{"q1": "Speed = Distance ÷ Time"}', 10, 10, 300, 25),
  ('quiz-math-001', '550e8400-e29b-41d4-a716-446655440004', '{"q1": "x = 4", "q2": "x + 4"}', 20, 25, 480, 40),
  ('quiz-cs-001', '550e8400-e29b-41d4-a716-446655440005', '{"q1": "my_variable"}', 10, 10, 420, 25)
ON CONFLICT DO NOTHING;