# MentorQuest API Documentation

This document describes the API endpoints and database schema for MentorQuest.

## Database Schema

### Core Tables

#### users
Main user table for authentication and basic profile information.

```sql
CREATE TABLE users (
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
```

#### student_profiles
Extended profile information for students with gamification data.

```sql
CREATE TABLE student_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  level integer DEFAULT 1,
  xp integer DEFAULT 0,
  streak_days integer DEFAULT 0,
  last_activity timestamptz DEFAULT now(),
  total_study_time integer DEFAULT 0, -- in minutes
  achievements jsonb DEFAULT '[]'::jsonb,
  wellness_streak integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### teacher_profiles
Extended profile information for teachers.

```sql
CREATE TABLE teacher_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  school text DEFAULT '',
  subjects text[] DEFAULT '{}',
  verified boolean DEFAULT false,
  bio text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Content Tables

#### courses
Course management for teachers.

```sql
CREATE TABLE courses (
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
```

#### lessons
Individual lessons within courses.

```sql
CREATE TABLE lessons (
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
```

#### quizzes
Quiz management with metadata.

```sql
CREATE TABLE quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  teacher_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  difficulty_level text CHECK (difficulty_level IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  subject text NOT NULL,
  time_limit integer, -- in minutes
  max_attempts integer DEFAULT 3,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### quiz_questions
Individual questions within quizzes.

```sql
CREATE TABLE quiz_questions (
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
```

#### quiz_attempts
Track student quiz performance.

```sql
CREATE TABLE quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id uuid REFERENCES users(id) ON DELETE CASCADE,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  score integer NOT NULL DEFAULT 0,
  max_score integer NOT NULL DEFAULT 0,
  percentage real GENERATED ALWAYS AS (
    CASE WHEN max_score > 0 THEN (score::real / max_score::real) * 100 ELSE 0 END
  ) STORED,
  time_taken integer, -- in seconds
  completed_at timestamptz DEFAULT now(),
  xp_earned integer DEFAULT 0
);
```

### Gamification Tables

#### achievements
Available achievements in the system.

```sql
CREATE TABLE achievements (
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
```

#### student_achievements
Track which achievements students have unlocked.

```sql
CREATE TABLE student_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES users(id) ON DELETE CASCADE,
  achievement_id uuid REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(student_id, achievement_id)
);
```

#### daily_quests
Daily challenges for students.

```sql
CREATE TABLE daily_quests (
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
```

### Wellness Tables

#### wellness_entries
Daily wellness check-ins from students.

```sql
CREATE TABLE wellness_entries (
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
```

#### study_sessions
Track individual study sessions.

```sql
CREATE TABLE study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  duration_minutes integer NOT NULL,
  focus_score integer CHECK (focus_score BETWEEN 1 AND 10) DEFAULT 5,
  breaks_taken integer DEFAULT 0,
  completed_at timestamptz DEFAULT now(),
  xp_earned integer DEFAULT 0
);
```

#### ai_tutor_sessions
Track AI tutor interactions.

```sql
CREATE TABLE ai_tutor_sessions (
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
```

### Classroom Tables

#### classes
Teacher classroom management.

```sql
CREATE TABLE classes (
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
```

#### class_students
Many-to-many relationship for class enrollment.

```sql
CREATE TABLE class_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE,
  student_id uuid REFERENCES users(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(class_id, student_id)
);
```

#### live_sessions
Real-time classroom sessions.

```sql
CREATE TABLE live_sessions (
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
```

#### notifications
User notification system.

```sql
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  notification_type text CHECK (notification_type IN ('info', 'success', 'warning', 'error', 'achievement')) DEFAULT 'info',
  read boolean DEFAULT false,
  action_url text,
  created_at timestamptz DEFAULT now()
);
```

## Database Functions

### add_student_xp(student_user_id, xp_amount)
Adds XP to a student and handles level progression.

```sql
SELECT add_student_xp('user-uuid', 100);
```

**Returns:** Updated student profile with new XP and level.

### get_leaderboard(class_id, time_frame)
Gets leaderboard data for students.

```sql
SELECT * FROM get_leaderboard(NULL, 'weekly');
```

**Parameters:**
- `class_id` (optional): Filter by specific class
- `time_frame`: 'daily', 'weekly', 'monthly', or 'all'

**Returns:** Ranked list of students with XP, level, and streak data.

### join_live_session(session_id, user_id)
Adds a user to a live session.

```sql
SELECT join_live_session('session-uuid', 'user-uuid');
```

**Returns:** Boolean indicating success.

## Row Level Security (RLS) Policies

All tables have RLS enabled with appropriate policies:

### User Data Access
- Users can read and update their own data
- Teachers can read student profiles for their classes
- Public profiles are visible to all authenticated users

### Content Access
- Teachers can manage their own courses, lessons, and quizzes
- Students can read active content
- Quiz attempts are private to the student and quiz creator

### Gamification Data
- Students can manage their own achievements and quests
- Leaderboard data is visible to class members
- Wellness data is private to the student and their teachers

## API Usage Examples

### Authentication
MentorQuest uses Supabase Auth for user management:

```javascript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
  options: {
    data: {
      full_name: 'John Doe',
      role: 'student'
    }
  }
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});
```

### Database Operations

```javascript
// Get student profile
const { data, error } = await supabase
  .from('student_profiles')
  .select(`
    *,
    achievements:student_achievements(
      achievement:achievements(*)
    )
  `)
  .eq('user_id', userId)
  .single();

// Submit quiz attempt
const { data, error } = await supabase
  .from('quiz_attempts')
  .insert({
    quiz_id: quizId,
    student_id: userId,
    answers: answersObject,
    score: calculatedScore,
    max_score: totalPoints
  });

// Add wellness entry
const { data, error } = await supabase
  .from('wellness_entries')
  .insert({
    student_id: userId,
    mood: 4,
    stress_level: 2,
    energy_level: 5,
    notes: 'Feeling great today!'
  });
```

### Real-time Subscriptions

```javascript
// Subscribe to live session updates
const subscription = supabase
  .channel(`live_session_${sessionId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'live_sessions',
    filter: `id=eq.${sessionId}`
  }, (payload) => {
    console.log('Session updated:', payload);
  })
  .subscribe();

// Subscribe to notifications
const notificationSub = supabase
  .channel(`notifications_${userId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    console.log('New notification:', payload.new);
  })
  .subscribe();
```

## Error Handling

All database operations should include proper error handling:

```javascript
try {
  const { data, error } = await supabase
    .from('table_name')
    .select('*');
    
  if (error) {
    console.error('Database error:', error);
    throw error;
  }
  
  return data;
} catch (error) {
  console.error('Operation failed:', error);
  // Handle error appropriately
}
```

## Performance Considerations

### Indexes
The schema includes indexes on frequently queried columns:
- User email and role
- Student XP for leaderboards
- Quiz attempts by student and quiz
- Wellness entries by student and date

### Pagination
For large datasets, use pagination:

```javascript
const { data, error } = await supabase
  .from('quiz_attempts')
  .select('*')
  .range(0, 9) // First 10 records
  .order('completed_at', { ascending: false });
```

### Caching
Consider caching frequently accessed data like achievements and course content.

## Security Best Practices

1. **Always use RLS**: All tables have Row Level Security enabled
2. **Validate input**: Check data types and constraints on the client
3. **Use prepared statements**: Supabase handles this automatically
4. **Limit data exposure**: Only select necessary columns
5. **Monitor usage**: Use Supabase analytics to track API usage

## Rate Limits

Supabase free tier includes:
- 500MB database storage
- 2GB bandwidth per month
- 50,000 monthly active users
- Real-time connections

For production use, consider upgrading to a paid plan for higher limits.