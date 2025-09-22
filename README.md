# MentorQuest - AI-Powered Global Learning Platform

MentorQuest is a comprehensive EdTech platform that combines AI tutoring, gamified learning, wellness tracking, and teacher tools using exclusively free and open-source technologies.

## 🎯 Quick Start

```bash
# 1. Clone and setup
git clone <repository-url>
cd mentorquest
npm run setup

# 2. Configure environment
# Edit .env with your Supabase credentials

# 3. Setup database
npm run db:migrate
npm run db:seed

# 4. Start development
npm run dev
```

**Demo Accounts:**
- Teacher: `teacher@demo.com` / `password123`
- Student: `student@demo.com` / `password123`

## 🌟 Features

### For Students
- **AI Tutor System**: Natural language question input with personalized explanations
- **Gamification Engine**: XP points, levels, achievements, and daily quests
- **Wellness Tools**: Daily mood check-ins and stress level monitoring
- **Multi-language Support**: Available in English, Spanish, French, German, and Hindi
- **Accessibility**: Voice-to-text, text-to-speech, dyslexia-friendly fonts
- **Progress Tracking**: Visual progress charts and knowledge gap identification

### For Teachers
- **Content Generation**: AI-powered lesson plan and quiz creation
- **Classroom Management**: Real-time performance dashboards
- **Student Analytics**: Progress monitoring and wellness insights
- **Live Sessions**: Interactive classroom features

## 🚀 Technology Stack

### Frontend
- **React.js** with TypeScript and Vite
- **TailwindCSS** for responsive design
- **Framer Motion** for animations
- **i18next** for internationalization
- **Recharts** for data visualization

### Backend & Database
- **Supabase** (free tier) for authentication, database, and real-time features
- **PostgreSQL** with Row Level Security (RLS)

### AI & ML Services (All Free)
- **HuggingFace Inference API** for AI tutoring
- **Web Speech API** for voice features
- **LibreTranslate** for multilingual support

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier)
- PostgreSQL client (for database operations)

### Automated Setup
```bash
npm run setup
```

This will:
- Install all dependencies
- Create .env from template
- Verify environment configuration
- Check TypeScript compilation
- Validate project structure

### Manual Setup

#### 1. Install Dependencies
```bash
npm install
```

#### 2. Environment Configuration
```bash
cp .env.example .env
```

Update `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_HUGGINGFACE_API_KEY=your-key (optional)
VITE_LIBRETRANSLATE_API_URL=https://libretranslate.de
```

#### 3. Database Setup

**Option A: Using npm scripts (recommended)**
```bash
npm run db:migrate  # Create schema
npm run db:seed     # Add demo data
```

**Option B: Using Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run `supabase/migrations/000_idempotent_schema.sql`
4. Run `supabase/seed/seed-safe.sql`

**Option C: Using psql directly**
```bash
export DATABASE_URL="postgresql://user:pass@host:port/db"
psql $DATABASE_URL -f supabase/migrations/000_idempotent_schema.sql
psql $DATABASE_URL -f supabase/seed/seed-safe.sql
```

#### 4. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:5173`

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Test database migrations
npm run test:migrations
```

## 🚀 Deployment

### Quick Deploy to Vercel
```bash
npm run deploy
```

This automated script will:
- Validate environment variables
- Run tests and build
- Configure Vercel environment
- Deploy to production

### Manual Deployment

#### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder
```

#### Environment Variables for Production
Set these in your deployment platform:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
VITE_HUGGINGFACE_API_KEY=your-key (optional)
VITE_LIBRETRANSLATE_API_URL=https://libretranslate.de
VITE_APP_NAME=MentorQuest
VITE_APP_VERSION=1.0.0
```

## 📊 Database Schema

The platform includes 18 tables with comprehensive relationships:

### Core Tables
- `users` - Authentication and basic profiles
- `student_profiles` - Gamification data (XP, levels, streaks)
- `teacher_profiles` - Teacher-specific information
- `courses` & `lessons` - Educational content
- `quizzes`, `quiz_questions`, `quiz_attempts` - Assessment system
- `classes` & `class_students` - Classroom management
- `achievements` & `student_achievements` - Gamification
- `daily_quests` - Daily challenges
- `wellness_entries` - Mental health tracking
- `study_sessions` - Learning analytics
- `ai_tutor_sessions` - AI interaction logs
- `live_sessions` - Real-time classroom features
- `notifications` - User notifications

### Database Functions
- `add_student_xp(user_id, xp_amount)` - XP management with level progression
- `get_leaderboard(class_id, time_frame)` - Leaderboard queries
- `check_achievements(user_id)` - Achievement validation

## 🔒 Security Features

- **Row Level Security (RLS)** on all tables
- **JWT-based authentication** via Supabase Auth
- **Data encryption** in transit and at rest
- **Input validation** and sanitization
- **CORS configuration** for API security
- **Environment variable protection**

## 🌍 Internationalization

The platform supports 5 languages:
- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Hindi (hi)

Language can be changed from the navbar dropdown or automatically detected from browser settings.

## ♿ Accessibility Features

- **WCAG 2.1 AA** compliance
- **Dyslexia-friendly fonts** (OpenDyslexic)
- **High contrast mode**
- **Reduced motion** support
- **Screen reader** compatibility
- **Keyboard navigation**
- **Voice input/output**

## 🎯 Gamification System

### XP and Levels
- Earn XP for various activities (questions, quizzes, streaks)
- Level up every 1000 XP
- Visual progress indicators

### Achievements
- Learning milestones
- Streak rewards
- Social achievements
- Wellness goals

### Daily Quests
- Study time goals
- Quiz completion
- Wellness check-ins
- Streak maintenance

## 🧠 AI Features

### AI Tutor
- **Free HuggingFace Models**: `mistralai/Mistral-7B-Instruct`, `tiiuae/falcon-7b-instruct`
- **Fallback System**: Rich educational responses when APIs unavailable
- **Multi-difficulty Support**: Easy, medium, hard responses
- **Quiz Generation**: Subject-specific questions with explanations
- **Voice Integration**: Web Speech API for input/output

### Wellness AI
- **Sentiment Analysis**: `cardiffnlp/twitter-roberta-base-sentiment`
- **Stress Detection**: Pattern recognition in user input
- **Personalized Recommendations**: Context-aware wellness suggestions
- **Trend Analysis**: Historical wellness data insights

## 📊 Analytics & Progress

### Student Analytics
- Subject-wise progress
- Time spent studying
- Quiz performance trends
- Wellness patterns

### Teacher Analytics
- Class performance overview
- Individual student progress
- Engagement metrics
- Wellness monitoring

## 🔒 Security & Privacy

- **Row Level Security (RLS)** on all database tables
- **JWT-based authentication**
- **Data encryption** in transit and at rest
- **GDPR compliance** ready
- **Privacy-first** design

## 📁 Project Structure

```
mentorquest/
├── src/
│   ├── components/          # React components
│   │   ├── AITutor/        # AI tutoring interface
│   │   ├── Auth/           # Authentication forms
│   │   ├── Dashboard/      # Student/Teacher dashboards
│   │   ├── Layout/         # Navigation and layout
│   │   ├── Quizzes/        # Quiz interface
│   │   ├── Wellness/       # Wellness tracking
│   │   └── common/         # Shared components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and services
│   │   ├── ai-services.ts  # AI integration
│   │   ├── i18n.ts         # Internationalization
│   │   └── supabase.ts     # Database client
│   ├── pages/              # Page components
│   ├── test/               # Test files
│   └── types/              # TypeScript definitions
├── supabase/
│   ├── migrations/         # Database schema
│   └── seed/               # Demo data
├── scripts/                # Automation scripts
├── docs/                   # Documentation
└── public/                 # Static assets
```

## 🛠️ Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Run ESLint

# Testing
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:ui         # Run tests with UI
npm run test:migrations # Test database migrations

# Database
npm run db:migrate      # Run database migrations
npm run db:seed         # Seed demo data
npm run db:reset        # Reset database (migrate + seed)

# Deployment
npm run setup           # Complete development setup
npm run deploy          # Deploy to production
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes | - |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes | - |
| `VITE_HUGGINGFACE_API_KEY` | HuggingFace API key | No | - |
| `VITE_LIBRETRANSLATE_API_URL` | Translation service URL | No | `https://libretranslate.de` |
| `VITE_APP_NAME` | Application name | No | `MentorQuest` |
| `VITE_APP_VERSION` | Application version | No | `1.0.0` |

### Database Configuration

For direct database access (testing/development):
```bash
export DATABASE_URL="postgresql://user:password@host:port/database"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔍 Troubleshooting

### Common Issues

**Build Errors:**
```bash
rm -rf node_modules dist
npm install
npm run build
```

**Database Connection:**
- Verify Supabase URL and keys in `.env`
- Check if Supabase project is active
- Ensure RLS policies allow access

**Migration Issues:**
```bash
npm run test:migrations
```

**Environment Variables:**
- Ensure all required variables start with `VITE_`
- Restart dev server after changes
- Check for typos in variable names

### Getting Help

1. Check the browser console for errors
2. Review Supabase logs in dashboard
3. Verify environment variables
4. Run `npm run setup` to validate configuration
5. Check [docs/](./docs/) for detailed guides

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the [documentation](./docs/)
- Join our community discussions
- Review troubleshooting guide above

## 🎉 Acknowledgments

- HuggingFace for free AI models
- Supabase for backend infrastructure
- OpenDyslexic font for accessibility
- All open-source contributors

---

**MentorQuest** - Empowering education through AI and open-source technology! 🚀📚

Built with ❤️ using React, TypeScript, Supabase, and HuggingFace