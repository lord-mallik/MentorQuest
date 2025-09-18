# MentorQuest - AI-Powered Global Learning Platform

MentorQuest is a comprehensive EdTech platform that combines AI tutoring, gamified learning, wellness tracking, and teacher tools using exclusively free and open-source technologies.

## 🌟 Features

### For Students
- **AI Tutor System**: Natural language question input with personalized explanations
- **Gamification Engine**: XP points, levels, achievements, and daily quests
- **Interactive Quizzes**: Adaptive quizzes with instant feedback and explanations
- **Wellness Tools**: Daily mood check-ins, stress level monitoring, and AI recommendations
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

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier)

### 1. Clone and Install
```bash
git clone <repository-url>
cd mentorquest
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Database Setup

The application uses Supabase for the database. Run the migration files in order:

1. `supabase/migrations/001_create_core_tables.sql` - Creates all tables and RLS policies
2. `supabase/migrations/002_seed_initial_data.sql` - Seeds initial data and demo content

### 4. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

## 🎮 Demo Accounts

For testing purposes, you can create demo accounts:

**Student Account:**
- Email: `student@demo.com`
- Password: `password123`

**Teacher Account:**
- Email: `teacher@demo.com`
- Password: `password123`

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
- Natural language processing
- Subject-specific responses
- Difficulty level adaptation
- Follow-up question generation
- Auto-quiz creation

### Wellness AI
- Sentiment analysis of mood entries
- Stress level detection
- Personalized recommendations
- Mental health insights

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

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder to your preferred platform
```

### Backend (Supabase)
The backend is automatically deployed with Supabase. No additional deployment needed.

## 📁 Project Structure

```
mentorquest/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── AITutor/        # AI tutoring interface
│   │   ├── Auth/           # Authentication forms
│   │   ├── Dashboard/      # Student/Teacher dashboards
│   │   ├── Layout/         # Navigation and layout
│   │   ├── Quizzes/        # Quiz interface and management
│   │   └── Wellness/       # Wellness tracking components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and services
│   │   ├── ai-services.ts  # AI integration
│   │   ├── i18n.ts         # Internationalization
│   │   └── supabase.ts     # Database client
│   ├── pages/              # Page components
│   └── types/              # TypeScript definitions
├── supabase/
│   └── migrations/         # Database schema and seeds
├── docs/                   # Documentation
└── public/                 # Static assets
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Join our community discussions

## 🎉 Acknowledgments

- HuggingFace for free AI models
- Supabase for backend infrastructure
- OpenDyslexic font for accessibility
- All open-source contributors

---

**MentorQuest** - Empowering education through AI and open-source technology! 🚀📚