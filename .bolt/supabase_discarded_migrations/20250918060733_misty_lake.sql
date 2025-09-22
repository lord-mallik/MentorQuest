/*
  # Seed Initial Data for MentorQuest

  1. Sample Achievements
    - Learning milestones
    - Streak rewards
    - Social achievements
    - Wellness goals

  2. Demo Users
    - Student and teacher accounts for testing
    - Pre-configured profiles with sample data

  3. Sample Courses and Content
    - Mathematics, Science, History courses
    - Lessons and quizzes for demonstration

  4. Initial Quests and Notifications
    - Daily quests for engagement
    - Welcome notifications
*/

-- Insert sample achievements
INSERT INTO achievements (name, description, icon, category, requirements, xp_reward, rarity) VALUES
  ('First Steps', 'Complete your first lesson', '👶', 'learning', '{"lessons_completed": 1}', 50, 'common'),
  ('Quiz Novice', 'Complete your first quiz', '📝', 'learning', '{"quizzes_completed": 1}', 75, 'common'),
  ('Study Streak', 'Study for 3 days in a row', '🔥', 'streak', '{"streak_days": 3}', 100, 'common'),
  ('Week Warrior', 'Study for 7 days in a row', '⚡', 'streak', '{"streak_days": 7}', 200, 'rare'),
  ('Knowledge Seeker', 'Complete 10 lessons', '🎓', 'learning', '{"lessons_completed": 10}', 150, 'common'),
  ('Quiz Master', 'Complete 10 quizzes', '🏆', 'learning', '{"quizzes_completed": 10}', 200, 'rare'),
  ('Perfect Score', 'Get 100% on a quiz', '⭐', 'learning', '{"perfect_quiz": 1}', 300, 'epic'),
  ('Level Up', 'Reach level 5', '🚀', 'learning', '{"level": 5}', 250, 'rare'),
  ('Wellness Warrior', 'Complete 7 wellness check-ins', '💚', 'wellness', '{"wellness_checkins": 7}', 150, 'common'),
  ('Stress Buster', 'Maintain low stress for a week', '😌', 'wellness', '{"low_stress_week": 1}', 200, 'rare'),
  ('Social Butterfly', 'Help 5 classmates', '🦋', 'social', '{"helped_classmates": 5}', 175, 'rare'),
  ('Legendary Learner', 'Reach level 10', '👑', 'learning', '{"level": 10}', 500, 'legendary')
ON CONFLICT DO NOTHING;

-- Insert demo users (these will be created via auth, but we'll prepare profiles)
-- Note: In a real app, these would be created through the signup process

-- Sample courses for demonstration
INSERT INTO courses (id, teacher_id, title, description, subject, difficulty_level, language) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Introduction to Algebra', 'Learn the fundamentals of algebraic thinking and problem solving', 'Mathematics', 'beginner', 'en'),
  ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Basic Physics', 'Explore the fundamental laws of physics through interactive lessons', 'Physics', 'beginner', 'en'),
  ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'World History', 'Journey through major historical events and civilizations', 'History', 'intermediate', 'en')
ON CONFLICT DO NOTHING;

-- Sample lessons
INSERT INTO lessons (course_id, title, content, lesson_order, duration_minutes, objectives) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'What is Algebra?', 'Algebra is a branch of mathematics that uses symbols and letters to represent numbers and quantities in formulas and equations. In this lesson, we will explore the basic concepts of algebra and how it helps us solve real-world problems.', 1, 30, ARRAY['Understand what algebra is', 'Identify algebraic expressions', 'Recognize variables and constants']),
  ('550e8400-e29b-41d4-a716-446655440001', 'Variables and Constants', 'Learn to distinguish between variables (letters that represent unknown values) and constants (fixed numbers). We will practice identifying and working with both in mathematical expressions.', 2, 25, ARRAY['Define variables and constants', 'Identify variables in expressions', 'Work with algebraic notation']),
  ('550e8400-e29b-41d4-a716-446655440001', 'Simple Equations', 'Discover how to solve basic algebraic equations using inverse operations. We will start with one-step equations and build confidence in algebraic problem-solving.', 3, 35, ARRAY['Solve one-step equations', 'Use inverse operations', 'Check solutions']),
  
  ('550e8400-e29b-41d4-a716-446655440002', 'Introduction to Physics', 'Physics is the science that seeks to understand how the universe works. From the smallest particles to the largest galaxies, physics explains the fundamental laws governing matter and energy.', 1, 40, ARRAY['Understand what physics studies', 'Learn about scientific method', 'Explore physics in daily life']),
  ('550e8400-e29b-41d4-a716-446655440002', 'Motion and Speed', 'Learn about different types of motion and how to calculate speed, velocity, and acceleration. We will explore real-world examples and practice solving motion problems.', 2, 45, ARRAY['Define motion, speed, and velocity', 'Calculate average speed', 'Understand acceleration']),
  
  ('550e8400-e29b-41d4-a716-446655440003', 'Ancient Civilizations', 'Explore the rise of the first human civilizations in Mesopotamia, Egypt, India, and China. Learn about their contributions to art, science, government, and culture.', 1, 50, ARRAY['Identify major ancient civilizations', 'Understand their contributions', 'Compare different civilizations'])
ON CONFLICT DO NOTHING;

-- Sample quizzes
INSERT INTO quizzes (id, teacher_id, title, description, difficulty_level, subject, time_limit, max_attempts) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Algebra Basics Quiz', 'Test your understanding of basic algebraic concepts', 'easy', 'Mathematics', 15, 3),
  ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Physics Fundamentals', 'Quiz on basic physics concepts and motion', 'medium', 'Physics', 20, 2),
  ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Ancient History Challenge', 'Test your knowledge of ancient civilizations', 'medium', 'History', 25, 2)
ON CONFLICT DO NOTHING;

-- Sample quiz questions
INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, correct_answer, explanation, points, question_order) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', 'What is a variable in algebra?', 'multiple_choice', 
   '["A fixed number", "A letter representing an unknown value", "A mathematical operation", "A type of equation"]',
   'A letter representing an unknown value', 
   'Variables are symbols (usually letters) that represent unknown or changing values in mathematical expressions.', 
   10, 1),
   
  ('660e8400-e29b-41d4-a716-446655440001', 'Solve for x: x + 5 = 12', 'multiple_choice',
   '["x = 7", "x = 17", "x = 5", "x = 12"]',
   'x = 7',
   'To solve x + 5 = 12, subtract 5 from both sides: x = 12 - 5 = 7',
   15, 2),
   
  ('660e8400-e29b-41d4-a716-446655440002', 'What is the formula for speed?', 'multiple_choice',
   '["Speed = Distance × Time", "Speed = Distance ÷ Time", "Speed = Time ÷ Distance", "Speed = Distance + Time"]',
   'Speed = Distance ÷ Time',
   'Speed is calculated by dividing the distance traveled by the time taken.',
   10, 1),
   
  ('660e8400-e29b-41d4-a716-446655440002', 'If a car travels 100 km in 2 hours, what is its average speed?', 'multiple_choice',
   '["50 km/h", "100 km/h", "200 km/h", "25 km/h"]',
   '50 km/h',
   'Average speed = Distance ÷ Time = 100 km ÷ 2 hours = 50 km/h',
   15, 2),
   
  ('660e8400-e29b-41d4-a716-446655440003', 'Which river was central to ancient Egyptian civilization?', 'multiple_choice',
   '["Tigris", "Euphrates", "Nile", "Indus"]',
   'Nile',
   'The Nile River was crucial to ancient Egyptian civilization, providing water, fertile soil, and transportation.',
   10, 1)
ON CONFLICT DO NOTHING;

-- Sample classes
INSERT INTO classes (id, teacher_id, name, subject, description, class_code) VALUES
  ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Math Grade 9A', 'Mathematics', 'Algebra and geometry for 9th grade students', 'MATH9A01'),
  ('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Physics 101', 'Physics', 'Introduction to physics concepts', 'PHYS101A'),
  ('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'World History', 'History', 'Survey of world civilizations', 'HIST201B')
ON CONFLICT DO NOTHING;

-- Function to create demo user profiles after auth signup
CREATE OR REPLACE FUNCTION create_demo_profiles()
RETURNS void AS $$
BEGIN
  -- This function will be called after demo users are created via auth
  -- It ensures proper profile setup for demonstration
  
  -- Create student profiles for any student users without profiles
  INSERT INTO student_profiles (user_id, level, xp, streak_days, total_study_time)
  SELECT u.id, 1, 0, 0, 0
  FROM users u
  WHERE u.role = 'student' 
  AND NOT EXISTS (SELECT 1 FROM student_profiles sp WHERE sp.user_id = u.id);
  
  -- Create teacher profiles for any teacher users without profiles
  INSERT INTO teacher_profiles (user_id, school, subjects, verified)
  SELECT u.id, 'Demo School', ARRAY['Mathematics', 'Physics', 'History'], true
  FROM users u
  WHERE u.role = 'teacher'
  AND NOT EXISTS (SELECT 1 FROM teacher_profiles tp WHERE tp.user_id = u.id);
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create some sample notifications templates
-- These will be created dynamically when users sign up, but we can prepare the structure

-- Sample wellness activities for reference
-- These can be used in the frontend for wellness tracking
CREATE TABLE IF NOT EXISTS wellness_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  description text,
  icon text DEFAULT '🏃',
  created_at timestamptz DEFAULT now()
);

INSERT INTO wellness_activities (name, category, description, icon) VALUES
  ('Deep Breathing', 'relaxation', '5-minute deep breathing exercise', '🫁'),
  ('Short Walk', 'physical', '10-minute walk outside', '🚶'),
  ('Meditation', 'mindfulness', 'Guided meditation session', '🧘'),
  ('Stretching', 'physical', 'Basic stretching routine', '🤸'),
  ('Journaling', 'mental', 'Write about your thoughts and feelings', '📝'),
  ('Listen to Music', 'relaxation', 'Enjoy your favorite calming music', '🎵'),
  ('Hydrate', 'physical', 'Drink a glass of water', '💧'),
  ('Healthy Snack', 'physical', 'Eat a nutritious snack', '🍎'),
  ('Call a Friend', 'social', 'Connect with someone you care about', '📞'),
  ('Gratitude Practice', 'mental', 'Think of three things you are grateful for', '🙏')
ON CONFLICT DO NOTHING;

-- Create trigger to automatically create profiles when users are inserted
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Create appropriate profile based on user role
  IF NEW.role = 'student' THEN
    INSERT INTO student_profiles (user_id, level, xp, streak_days, total_study_time)
    VALUES (NEW.id, 1, 0, 0, 0);
    
    -- Create welcome notification
    INSERT INTO notifications (user_id, title, message, notification_type)
    VALUES (NEW.id, 'Welcome to MentorQuest!', 'Start your learning journey with our AI tutor and gamified lessons.', 'info');
    
  ELSIF NEW.role = 'teacher' THEN
    INSERT INTO teacher_profiles (user_id, school, subjects, verified)
    VALUES (NEW.id, '', ARRAY[]::text[], false);
    
    -- Create welcome notification for teachers
    INSERT INTO notifications (user_id, title, message, notification_type)
    VALUES (NEW.id, 'Welcome, Educator!', 'Create your first class and start engaging with students using AI-powered tools.', 'info');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to generate daily quests
CREATE OR REPLACE FUNCTION generate_daily_quests_for_student(student_user_id uuid)
RETURNS void AS $$
DECLARE
  quest_templates RECORD;
  expires_tomorrow timestamptz;
BEGIN
  expires_tomorrow := (CURRENT_DATE + INTERVAL '1 day')::timestamptz;
  
  -- Clear existing quests for today
  DELETE FROM daily_quests 
  WHERE student_id = student_user_id 
  AND DATE(created_at) = CURRENT_DATE;
  
  -- Generate 3 random daily quests
  INSERT INTO daily_quests (student_id, title, description, quest_type, target_value, xp_reward, expires_at)
  SELECT 
    student_user_id,
    quest.title,
    quest.description,
    quest.quest_type,
    quest.target_value,
    quest.xp_reward,
    expires_tomorrow
  FROM (
    VALUES 
      ('Study Session', 'Complete a 25-minute study session', 'study_time', 25, 50),
      ('Quiz Challenge', 'Complete 2 quizzes today', 'quiz_completion', 2, 75),
      ('Wellness Check', 'Complete your daily wellness check-in', 'wellness_checkin', 1, 25),
      ('Streak Keeper', 'Maintain your study streak', 'streak', 1, 30),
      ('Knowledge Explorer', 'Ask the AI tutor 3 questions', 'ai_questions', 3, 40),
      ('Perfect Practice', 'Score 80% or higher on a quiz', 'quiz_score', 80, 100)
  ) AS quest(title, description, quest_type, target_value, xp_reward)
  ORDER BY RANDOM()
  LIMIT 3;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;