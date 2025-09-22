/*
  # Seed Initial Data for MentorQuest

  This migration seeds the database with:
  1. Demo users (teachers and students)
  2. Sample courses and lessons
  3. Quiz questions and sample data
  4. Achievements and gamification elements
  5. Initial notifications and wellness data
*/

-- Insert demo users (teachers first, then students)
INSERT INTO users (id, email, full_name, role, preferences) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'teacher@demo.com', 'Prof. Sarah Wilson', 'teacher', '{"language": "en", "theme": "light", "dyslexic_font": false, "high_contrast": false, "reduced_motion": false, "text_size": "medium", "voice_enabled": true}'),
  ('550e8400-e29b-41d4-a716-446655440002', 'teacher2@demo.com', 'Dr. Michael Chen', 'teacher', '{"language": "en", "theme": "light", "dyslexic_font": false, "high_contrast": false, "reduced_motion": false, "text_size": "medium", "voice_enabled": true}'),
  ('550e8400-e29b-41d4-a716-446655440003', 'student@demo.com', 'Alex Johnson', 'student', '{"language": "en", "theme": "light", "dyslexic_font": false, "high_contrast": false, "reduced_motion": false, "text_size": "medium", "voice_enabled": true}'),
  ('550e8400-e29b-41d4-a716-446655440004', 'student2@demo.com', 'Emma Davis', 'student', '{"language": "en", "theme": "light", "dyslexic_font": false, "high_contrast": false, "reduced_motion": false, "text_size": "medium", "voice_enabled": true}'),
  ('550e8400-e29b-41d4-a716-446655440005', 'student3@demo.com', 'Carlos Rodriguez', 'student', '{"language": "es", "theme": "light", "dyslexic_font": false, "high_contrast": false, "reduced_motion": false, "text_size": "medium", "voice_enabled": true}'),
  ('550e8400-e29b-41d4-a716-446655440006', 'student4@demo.com', 'Priya Patel', 'student', '{"language": "hi", "theme": "light", "dyslexic_font": false, "high_contrast": false, "reduced_motion": false, "text_size": "medium", "voice_enabled": true}')
ON CONFLICT (email) DO NOTHING;

-- Insert teacher profiles
INSERT INTO teacher_profiles (user_id, school, subjects, verified, bio) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Springfield High School', ARRAY['Mathematics', 'Physics'], true, 'Experienced mathematics teacher with 10+ years in education. Passionate about making complex concepts accessible to all students.'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Tech Valley Academy', ARRAY['Computer Science', 'Physics'], true, 'Former software engineer turned educator. Specializes in bridging the gap between theoretical knowledge and practical application.')
ON CONFLICT (user_id) DO NOTHING;

-- Insert student profiles with gamification data
INSERT INTO student_profiles (user_id, level, xp, streak_days, total_study_time, wellness_streak) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', 3, 2150, 7, 480, 5),
  ('550e8400-e29b-41d4-a716-446655440004', 2, 1850, 12, 360, 8),
  ('550e8400-e29b-41d4-a716-446655440005', 4, 3200, 5, 720, 3),
  ('550e8400-e29b-41d4-a716-446655440006', 2, 1650, 9, 420, 6)
ON CONFLICT (user_id) DO NOTHING;

-- Insert sample courses
INSERT INTO courses (id, teacher_id, title, description, subject, difficulty_level, active) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Algebra Fundamentals', 'Master the basics of algebraic expressions, equations, and problem-solving techniques.', 'Mathematics', 'beginner', true),
  ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Advanced Calculus', 'Dive deep into differential and integral calculus with real-world applications.', 'Mathematics', 'advanced', true),
  ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Introduction to Physics', 'Explore the fundamental principles of motion, energy, and forces.', 'Physics', 'beginner', true),
  ('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'Computer Science Basics', 'Learn programming fundamentals and computational thinking.', 'Computer Science', 'beginner', true),
  ('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 'Statistics and Probability', 'Understanding data analysis and statistical reasoning.', 'Mathematics', 'intermediate', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample lessons
INSERT INTO lessons (course_id, title, content, lesson_order, duration_minutes, objectives) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', 'Introduction to Variables', 'Learn what variables are and how they represent unknown quantities in mathematical expressions.', 1, 45, ARRAY['Understand the concept of variables', 'Identify variables in expressions', 'Use variables to represent real-world quantities']),
  ('650e8400-e29b-41d4-a716-446655440001', 'Solving Linear Equations', 'Master the techniques for solving equations with one variable.', 2, 50, ARRAY['Apply inverse operations', 'Solve one-step equations', 'Solve multi-step equations']),
  ('650e8400-e29b-41d4-a716-446655440003', 'Newton''s Laws of Motion', 'Explore the three fundamental laws that govern motion in our universe.', 1, 60, ARRAY['State Newton''s three laws', 'Apply laws to real situations', 'Calculate forces and acceleration']),
  ('650e8400-e29b-41d4-a716-446655440004', 'Programming Logic', 'Introduction to logical thinking and problem-solving in programming.', 1, 40, ARRAY['Understand algorithms', 'Break down complex problems', 'Write pseudocode'])
ON CONFLICT DO NOTHING;

-- Insert sample quizzes
INSERT INTO quizzes (id, teacher_id, title, description, difficulty_level, subject, time_limit, active) VALUES
  ('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Basic Algebra Quiz', 'Test your understanding of algebraic expressions and simple equations.', 'easy', 'Mathematics', 15, true),
  ('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Advanced Math Challenge', 'Challenging problems for advanced mathematics students.', 'hard', 'Mathematics', 30, true),
  ('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Physics Fundamentals', 'Basic concepts of motion, force, and energy.', 'medium', 'Physics', 20, true),
  ('750e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'Programming Basics', 'Test your knowledge of basic programming concepts.', 'easy', 'Computer Science', 25, true)
ON CONFLICT (id) DO NOTHING;

-- Insert quiz questions
INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, correct_answer, explanation, points, question_order) VALUES
  ('750e8400-e29b-41d4-a716-446655440001', 'What is the value of x in the equation 2x + 5 = 13?', 'multiple_choice', '["x = 3", "x = 4", "x = 5", "x = 6"]', 'x = 4', 'Subtract 5 from both sides: 2x = 8, then divide by 2: x = 4', 10, 1),
  ('750e8400-e29b-41d4-a716-446655440001', 'Simplify: 3(x + 2) - 2x', 'multiple_choice', '["x + 6", "x + 4", "5x + 6", "3x + 2"]', 'x + 6', '3(x + 2) - 2x = 3x + 6 - 2x = x + 6', 15, 2),
  ('750e8400-e29b-41d4-a716-446655440003', 'What is the formula for calculating speed?', 'multiple_choice', '["Speed = Distance × Time", "Speed = Distance ÷ Time", "Speed = Time ÷ Distance", "Speed = Force × Distance"]', 'Speed = Distance ÷ Time', 'Speed is calculated by dividing distance by time', 10, 1),
  ('750e8400-e29b-41d4-a716-446655440003', 'A car travels 120 km in 2 hours. What is its average speed?', 'multiple_choice', '["50 km/h", "60 km/h", "70 km/h", "80 km/h"]', '60 km/h', 'Speed = 120 km ÷ 2 hours = 60 km/h', 15, 2),
  ('750e8400-e29b-41d4-a716-446655440004', 'What is a variable in programming?', 'multiple_choice', '["A fixed value", "A container for storing data", "A type of loop", "A function"]', 'A container for storing data', 'Variables are used to store and manipulate data in programs', 10, 1)
ON CONFLICT DO NOTHING;

-- Insert sample quiz attempts
INSERT INTO quiz_attempts (quiz_id, student_id, answers, score, max_score, time_taken, xp_earned) VALUES
  ('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', '{"q1": "x = 4", "q2": "x + 6"}', 25, 25, 600, 50),
  ('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', '{"q1": "Speed = Distance ÷ Time", "q2": "60 km/h"}', 25, 25, 720, 50),
  ('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', '{"q1": "x = 4", "q2": "x + 4"}', 10, 25, 480, 25)
ON CONFLICT DO NOTHING;

-- Insert classes
INSERT INTO classes (id, teacher_id, name, subject, description, class_code) VALUES
  ('850e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Mathematics Grade 10', 'Mathematics', 'Comprehensive mathematics course covering algebra, geometry, and statistics.', 'MATH10A'),
  ('850e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Physics Grade 11', 'Physics', 'Introduction to classical mechanics, thermodynamics, and waves.', 'PHYS11B'),
  ('850e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Computer Science Fundamentals', 'Computer Science', 'Programming basics, algorithms, and computational thinking.', 'CS101C')
ON CONFLICT (id) DO NOTHING;

-- Insert class enrollments
INSERT INTO class_students (class_id, student_id) VALUES
  ('850e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003'),
  ('850e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004'),
  ('850e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005'),
  ('850e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440006'),
  ('850e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005')
ON CONFLICT (class_id, student_id) DO NOTHING;

-- Insert achievements
INSERT INTO achievements (id, name, description, icon, category, requirements, xp_reward, rarity) VALUES
  ('950e8400-e29b-41d4-a716-446655440001', 'First Steps', 'Complete your first quiz', '🎯', 'learning', '{"quizzes_completed": 1}', 50, 'common'),
  ('950e8400-e29b-41d4-a716-446655440002', 'Quiz Master', 'Complete 10 quizzes', '🏆', 'learning', '{"quizzes_completed": 10}', 200, 'rare'),
  ('950e8400-e29b-41d4-a716-446655440003', 'Streak Starter', 'Maintain a 3-day study streak', '🔥', 'streak', '{"streak_days": 3}', 75, 'common'),
  ('950e8400-e29b-41d4-a716-446655440004', 'Dedicated Learner', 'Maintain a 7-day study streak', '⚡', 'streak', '{"streak_days": 7}', 150, 'rare'),
  ('950e8400-e29b-41d4-a716-446655440005', 'Wellness Warrior', 'Complete 5 wellness check-ins', '💚', 'wellness', '{"wellness_checkins": 5}', 100, 'common'),
  ('950e8400-e29b-41d4-a716-446655440006', 'Study Marathon', 'Study for 10 hours total', '📚', 'learning', '{"study_hours": 10}', 300, 'epic'),
  ('950e8400-e29b-41d4-a716-446655440007', 'Perfect Score', 'Get 100% on any quiz', '⭐', 'learning', '{"perfect_quiz": 1}', 250, 'rare'),
  ('950e8400-e29b-41d4-a716-446655440008', 'Social Butterfly', 'Join 3 different classes', '🦋', 'social', '{"classes_joined": 3}', 125, 'common'),
  ('950e8400-e29b-41d4-a716-446655440009', 'AI Enthusiast', 'Ask 20 questions to the AI tutor', '🤖', 'learning', '{"ai_questions": 20}', 175, 'rare'),
  ('950e8400-e29b-41d4-a716-446655440010', 'Legend', 'Reach level 10', '👑', 'special', '{"level": 10}', 1000, 'legendary')
ON CONFLICT (id) DO NOTHING;

-- Insert some student achievements
INSERT INTO student_achievements (student_id, achievement_id) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', '950e8400-e29b-41d4-a716-446655440001'),
  ('550e8400-e29b-41d4-a716-446655440003', '950e8400-e29b-41d4-a716-446655440003'),
  ('550e8400-e29b-41d4-a716-446655440004', '950e8400-e29b-41d4-a716-446655440001'),
  ('550e8400-e29b-41d4-a716-446655440005', '950e8400-e29b-41d4-a716-446655440001'),
  ('550e8400-e29b-41d4-a716-446655440005', '950e8400-e29b-41d4-a716-446655440004')
ON CONFLICT (student_id, achievement_id) DO NOTHING;

-- Insert daily quests
INSERT INTO daily_quests (student_id, title, description, quest_type, target_value, xp_reward, expires_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', 'Study Session', 'Complete a 25-minute study session', 'study_time', 25, 50, (CURRENT_DATE + INTERVAL '1 day')::timestamptz),
  ('550e8400-e29b-41d4-a716-446655440003', 'Quiz Challenge', 'Complete 2 quizzes today', 'quiz_completion', 2, 75, (CURRENT_DATE + INTERVAL '1 day')::timestamptz),
  ('550e8400-e29b-41d4-a716-446655440004', 'Wellness Check', 'Complete your daily wellness check-in', 'wellness_checkin', 1, 25, (CURRENT_DATE + INTERVAL '1 day')::timestamptz),
  ('550e8400-e29b-41d4-a716-446655440005', 'Streak Keeper', 'Maintain your study streak', 'streak', 1, 30, (CURRENT_DATE + INTERVAL '1 day')::timestamptz)
ON CONFLICT DO NOTHING;

-- Insert sample wellness entries
INSERT INTO wellness_entries (student_id, date, mood, stress_level, energy_level, notes, activities) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', CURRENT_DATE - INTERVAL '1 day', 4, 2, 4, 'Feeling good about my progress in math!', ARRAY['deep_breathing', 'short_walk']),
  ('550e8400-e29b-41d4-a716-446655440004', CURRENT_DATE - INTERVAL '1 day', 3, 3, 3, 'Average day, a bit tired from studying.', ARRAY['music', 'hydrate']),
  ('550e8400-e29b-41d4-a716-446655440005', CURRENT_DATE - INTERVAL '2 days', 5, 1, 5, 'Great day! Aced my physics quiz.', ARRAY['gratitude', 'call_friend']),
  ('550e8400-e29b-41d4-a716-446655440006', CURRENT_DATE - INTERVAL '1 day', 2, 4, 2, 'Struggling with some concepts, feeling overwhelmed.', ARRAY['meditation', 'journaling'])
ON CONFLICT (student_id, date) DO NOTHING;

-- Insert study sessions
INSERT INTO study_sessions (student_id, subject, duration_minutes, focus_score, breaks_taken, xp_earned, completed_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', 'Mathematics', 45, 8, 1, 45, now() - INTERVAL '2 hours'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Physics', 30, 7, 0, 30, now() - INTERVAL '4 hours'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Computer Science', 60, 9, 2, 60, now() - INTERVAL '1 day'),
  ('550e8400-e29b-41d4-a716-446655440006', 'Mathematics', 25, 6, 1, 25, now() - INTERVAL '6 hours')
ON CONFLICT DO NOTHING;

-- Insert AI tutor sessions
INSERT INTO ai_tutor_sessions (student_id, question, answer, subject, difficulty_level, satisfaction_rating, follow_up_questions) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', 'How do I solve quadratic equations?', 'Quadratic equations can be solved using several methods: factoring, completing the square, or the quadratic formula. The quadratic formula is: x = (-b ± √(b²-4ac)) / 2a', 'Mathematics', 'medium', 5, '["Can you show me an example?", "What if the discriminant is negative?", "When should I use each method?"]'),
  ('550e8400-e29b-41d4-a716-446655440004', 'What is Newton''s second law?', 'Newton''s second law states that the force acting on an object is equal to its mass times its acceleration: F = ma. This means that heavier objects require more force to accelerate at the same rate.', 'Physics', 'easy', 4, '["Can you give me a real-world example?", "How does this relate to the first law?", "What are the units for force?"]'),
  ('550e8400-e29b-41d4-a716-446655440005', 'What is a for loop in programming?', 'A for loop is a control structure that repeats a block of code a specific number of times. It typically has three parts: initialization, condition, and increment/decrement.', 'Computer Science', 'easy', 5, '["Can you show me the syntax?", "How is it different from a while loop?", "When should I use a for loop?"]')
ON CONFLICT DO NOTHING;

-- Insert notifications
INSERT INTO notifications (user_id, title, message, notification_type, read) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', 'Welcome to MentorQuest!', 'Welcome to your personalized learning journey. Start by exploring the AI Tutor or taking a quiz!', 'info', false),
  ('550e8400-e29b-41d4-a716-446655440004', 'Achievement Unlocked!', 'Congratulations! You''ve unlocked the "First Steps" achievement for completing your first quiz.', 'achievement', false),
  ('550e8400-e29b-41d4-a716-446655440005', 'New Quest Available', 'A new daily quest is waiting for you. Complete it to earn XP and maintain your streak!', 'info', false),
  ('550e8400-e29b-41d4-a716-446655440001', 'New Student Enrolled', 'Alex Johnson has joined your Mathematics Grade 10 class.', 'info', true),
  ('550e8400-e29b-41d4-a716-446655440002', 'Class Performance Update', 'Your Physics Grade 11 class has an average completion rate of 87% this week.', 'success', false)
ON CONFLICT DO NOTHING;

-- Insert live sessions
INSERT INTO live_sessions (id, class_id, teacher_id, title, description, start_time, active, participants) VALUES
  ('a50e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Algebra Review Session', 'Interactive review of quadratic equations and factoring techniques', now() + INTERVAL '2 hours', false, '[]'::jsonb),
  ('a50e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Physics Lab Discussion', 'Discussion of recent lab experiments and results', now() + INTERVAL '1 day', false, '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;