# MentorQuest Setup Guide

This guide will walk you through setting up MentorQuest locally for development.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)
- **Git**
- A **Supabase** account (free tier is sufficient)

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd mentorquest
```

## Step 2: Install Dependencies

```bash
npm install
```

This will install all the required dependencies for the React frontend.

## Step 3: Set Up Supabase

### 3.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Fill in your project details:
   - Name: `mentorquest`
   - Database Password: Choose a strong password
   - Region: Select the closest region to you
6. Click "Create new project"

### 3.2 Get Your Project Credentials

Once your project is created:

1. Go to Settings → API
2. Copy your Project URL and anon public key
3. You'll need these for the environment variables

### 3.3 Set Up the Database Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Run the migration files in order:

**First, run `001_create_core_tables.sql`:**
```sql
-- Copy and paste the contents of supabase/migrations/001_create_core_tables.sql
-- This creates all the tables, RLS policies, and functions
```

**Then, run `002_seed_initial_data.sql`:**
```sql
-- Copy and paste the contents of supabase/migrations/002_seed_initial_data.sql
-- This seeds the database with initial data and demo content
```

## Step 4: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit the `.env` file with your Supabase credentials:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# HuggingFace API (Optional - for enhanced AI features)
VITE_HUGGINGFACE_API_KEY=your-huggingface-api-key

# LibreTranslate API (Optional - for translation features)
VITE_LIBRETRANSLATE_API_URL=https://libretranslate.de

# Application Settings
VITE_APP_NAME=MentorQuest
VITE_APP_VERSION=1.0.0
```

### Optional API Keys

While the app works without these, you can enhance functionality by adding:

**HuggingFace API Key (Free):**
1. Go to [huggingface.co](https://huggingface.co)
2. Sign up for a free account
3. Go to Settings → Access Tokens
4. Create a new token
5. Add it to your `.env` file

**LibreTranslate (Free):**
- The default URL `https://libretranslate.de` is free to use
- For higher limits, you can set up your own instance

## Step 5: Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Step 6: Create Demo Accounts

You can create demo accounts through the signup process, or use the authentication system to create:

1. **Student Account:**
   - Email: `student@demo.com`
   - Password: `password123`
   - Role: Student

2. **Teacher Account:**
   - Email: `teacher@demo.com`
   - Password: `password123`
   - Role: Teacher

## Step 7: Verify Setup

### Test Student Features:
1. Sign up as a student
2. Complete the onboarding
3. Try the AI Tutor
4. Take a quiz
5. Complete a wellness check-in

### Test Teacher Features:
1. Sign up as a teacher
2. Create a class
3. Generate content with AI
4. View student analytics

## Troubleshooting

### Common Issues:

**1. Supabase Connection Error**
- Verify your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Check that your Supabase project is active
- Ensure RLS policies are properly set up

**2. Database Schema Issues**
- Make sure you ran both migration files in order
- Check the Supabase logs for any SQL errors
- Verify that all tables were created successfully

**3. AI Features Not Working**
- The app has fallback responses if AI APIs are unavailable
- Check your HuggingFace API key if you added one
- Ensure you're not hitting rate limits

**4. Build Errors**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check that you're using Node.js 18+
- Verify all environment variables are set correctly

### Getting Help

If you encounter issues:

1. Check the browser console for errors
2. Check the Supabase logs in your dashboard
3. Verify your environment variables
4. Make sure all dependencies are installed
5. Try clearing your browser cache

## Development Tips

### Hot Reload
The development server supports hot reload. Changes to your code will automatically refresh the browser.

### Database Changes
If you make changes to the database schema:
1. Create a new migration file
2. Run it in the Supabase SQL Editor
3. Update your TypeScript types accordingly

### Adding New Features
1. Follow the existing component structure
2. Use TypeScript for type safety
3. Add proper error handling
4. Include loading states
5. Test with both student and teacher accounts

## Next Steps

Once you have the basic setup working:

1. Explore the codebase structure
2. Try customizing the UI components
3. Add new quiz questions or subjects
4. Experiment with the AI features
5. Set up additional language translations

## Production Deployment

For production deployment, see `DEPLOYMENT.md` for detailed instructions on deploying to various platforms.