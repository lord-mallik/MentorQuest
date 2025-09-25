/*
  # Admin Profile and Notifications Enhancement

  1. New Tables
    - `admin_profiles` - Admin user profiles with permissions
    - Enhanced notifications system
  
  2. Security
    - Enable RLS on admin_profiles table
    - Add policies for admin access
    - Enhanced notification policies
  
  3. Functions
    - Admin management functions
    - Notification system functions
*/

-- Create admin_profiles table
CREATE TABLE IF NOT EXISTS admin_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  permissions text[] DEFAULT '{"manage_users", "manage_courses", "view_analytics", "system_admin"}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Admin profiles policies
CREATE POLICY "Admins can manage admin profiles"
  ON admin_profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Enhanced notification policies
DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to create admin profile
CREATE OR REPLACE FUNCTION create_admin_profile(admin_user_id uuid)
RETURNS admin_profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_profile admin_profiles;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = admin_user_id 
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'User is not an admin';
  END IF;

  -- Create admin profile
  INSERT INTO admin_profiles (user_id)
  VALUES (admin_user_id)
  RETURNING * INTO new_profile;

  RETURN new_profile;
END;
$$;

-- Function to send notification
CREATE OR REPLACE FUNCTION send_notification(
  target_user_id uuid,
  notification_title text,
  notification_message text,
  notification_type text DEFAULT 'info',
  action_url text DEFAULT NULL
)
RETURNS notifications
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_notification notifications;
BEGIN
  INSERT INTO notifications (
    user_id,
    title,
    message,
    notification_type,
    action_url
  )
  VALUES (
    target_user_id,
    notification_title,
    notification_message,
    notification_type,
    action_url
  )
  RETURNING * INTO new_notification;

  RETURN new_notification;
END;
$$;

-- Function to get system metrics
CREATE OR REPLACE FUNCTION get_system_metrics()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  metrics json;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM users),
    'total_students', (SELECT COUNT(*) FROM users WHERE role = 'student'),
    'total_teachers', (SELECT COUNT(*) FROM users WHERE role = 'teacher'),
    'total_courses', (SELECT COUNT(*) FROM courses),
    'total_quizzes', (SELECT COUNT(*) FROM quizzes),
    'active_sessions', 0,
    'completion_rate', 85,
    'engagement_score', 92
  ) INTO metrics;

  RETURN metrics;
END;
$$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_profiles_user_id ON admin_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read) WHERE read = false;

-- Insert sample admin profile for demo admin user
DO $$
BEGIN
  -- Create admin profile for demo admin if exists
  IF EXISTS (SELECT 1 FROM users WHERE email = 'admin@demo.com' AND role = 'admin') THEN
    INSERT INTO admin_profiles (user_id, permissions)
    SELECT id, '{"manage_users", "manage_courses", "view_analytics", "system_admin"}'
    FROM users 
    WHERE email = 'admin@demo.com' AND role = 'admin'
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
END $$;

-- Insert sample notifications for demo users
DO $$
DECLARE
  student_id uuid;
  teacher_id uuid;
  admin_id uuid;
BEGIN
  -- Get demo user IDs
  SELECT id INTO student_id FROM users WHERE email = 'student@demo.com' LIMIT 1;
  SELECT id INTO teacher_id FROM users WHERE email = 'teacher@demo.com' LIMIT 1;
  SELECT id INTO admin_id FROM users WHERE email = 'admin@demo.com' LIMIT 1;

  -- Insert notifications for student
  IF student_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, message, notification_type, created_at) VALUES
    (student_id, 'Welcome to MentorQuest!', 'Start your learning journey with our AI tutor and interactive quizzes.', 'info', now() - interval '1 hour'),
    (student_id, 'Achievement Unlocked!', 'You earned the "First Steps" achievement for completing your profile.', 'achievement', now() - interval '2 hours'),
    (student_id, 'Daily Quest Available', 'Complete a 25-minute study session to earn 50 XP!', 'info', now() - interval '30 minutes')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Insert notifications for teacher
  IF teacher_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, message, notification_type, created_at) VALUES
    (teacher_id, 'Welcome Teacher!', 'Create your first class and start engaging with students.', 'info', now() - interval '1 hour'),
    (teacher_id, 'New Student Enrolled', 'A new student has joined your Mathematics class.', 'info', now() - interval '3 hours')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Insert notifications for admin
  IF admin_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, message, notification_type, created_at) VALUES
    (admin_id, 'System Status', 'All systems are running normally. Database backup completed successfully.', 'success', now() - interval '2 hours'),
    (admin_id, 'User Activity', 'Platform engagement is up 15% this week.', 'info', now() - interval '4 hours')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;