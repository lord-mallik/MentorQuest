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

### 1. Clone and Install


```bash
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
VITE_HUGGINGFACE_API_KEY=your-key (optional)
VITE_LIBRETRANSLATE_API_URL=https://libretranslate.de
```

#### 3. Database Setup

**Option A: Using npm scripts (recommended)**
```bash
npm run db:migrate  # Create schema
npm run db:seed     # Add demo data
```
The application will automatically create the necessary tables and relationships:

- Users and authentication
- Student/Teacher profiles
- Courses and lessons
- Quizzes and questions
- Gamification elements
- Wellness tracking
- Real-time features

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

## 🧪 Testing

```bash
# Run all tests
npm test

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

## 📁 Project Structure

### Frontend (Vercel/Netlify)

```bash
npm run build
# Deploy dist/ folder to your preferred platform
```

### Backend (Supabase)

The backend is automatically deployed with Supabase. No additional deployment needed.

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

