/*
  # Create Demo Admin User
  
  This script creates a demo admin user for testing admin functionality.
  
  Demo Admin Account:
  - Email: admin@demo.com
  - Password: password123
  - Role: admin
*/

-- Insert demo admin user
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Insert admin user if not exists
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@demo.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Admin User", "role": "admin"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO admin_user_id;

  -- If user was just created, get the ID
  IF admin_user_id IS NULL THEN
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@demo.com';
  END IF;

  -- Insert into users table
  INSERT INTO users (
    id,
    email,
    full_name,
    role,
    preferences,
    created_at,
    updated_at
  ) VALUES (
    admin_user_id,
    'admin@demo.com',
    'Admin User',
    'admin',
    '{
      "language": "en",
      "theme": "light",
      "dyslexic_font": false,
      "high_contrast": false,
      "reduced_motion": false,
      "text_size": "medium",
      "voice_enabled": true
    }'::jsonb,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    full_name = 'Admin User',
    updated_at = now();

  -- Create admin profile
  INSERT INTO admin_profiles (
    user_id,
    permissions,
    created_at,
    updated_at
  ) VALUES (
    admin_user_id,
    '{"manage_users", "manage_courses", "view_analytics", "system_admin"}',
    now(),
    now()
  )
  ON CONFLICT (user_id) DO NOTHING;

  RAISE NOTICE 'Demo admin user created/updated: admin@demo.com / password123';
END $$;