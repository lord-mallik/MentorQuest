import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  BookOpen, 
  Trophy, 
  Target, 
  TrendingUp, 
  Clock, 
  Star, 
  Zap, 
  Award, 
  Heart, 
  Users,
  Mail,
  Lock,
  User,
  Eye,
  Send,
  Mic,
} from 'lucide-react';

// Import enhanced UI components
import Button from './components/ui/Button';
import Card from './components/ui/Card';
import Input from './components/ui/Input';
import Badge from './components/ui/Badge';
import ProgressBar from './components/ui/ProgressBar';

const EnhancedUIShowcase: React.FC = () => {
  return (
    <div className="min-h-screen bg-white p-8">
      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(217, 70, 239, 0.1) 0%, transparent 50%)`
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center space-x-4">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-16 h-16 gradient-primary rounded-3xl flex items-center justify-center shadow-glow-primary"
            >
              <Brain className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="heading-xl text-gradient-primary">MentorQuest Enhanced UI</h1>
          </div>
          <p className="body-lg text-neutral-700 max-w-2xl mx-auto">
            Experience the modern, beautiful, and accessible design system with enhanced colors, typography, and interactive components optimized for light theme.
          </p>
        </motion.div>

        {/* Welcome Card */}
        <Card variant="gradient" padding="lg" className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="heading-lg mb-4">Welcome to Your Learning Journey! 👋</h2>
            <p className="body-lg text-white/90 mb-6">Ready to explore enhanced UI components and modern design patterns?</p>
            <div className="flex items-center justify-center space-x-4">
              <Badge variant="primary" size="lg">Level 5</Badge>
              <Badge variant="success" size="lg">1,250 XP</Badge>
              <Badge variant="warning" size="lg">15 Day Streak</Badge>
            </div>
          </motion.div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card hover glow className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="label-base text-neutral-600">Total XP</p>
                <p className="heading-md text-neutral-900">1,250</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-warning-400 to-warning-500 rounded-2xl flex items-center justify-center shadow-glow-accent">
                <Zap className="w-7 h-7 text-white" />
              </div>
            </div>
          </Card>

          <Card hover className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="label-base text-neutral-600">Study Streak</p>
                <p className="heading-md text-neutral-900">15 days</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-error-400 to-warning-500 rounded-2xl flex items-center justify-center shadow-glow-secondary">
                <Target className="w-7 h-7 text-white" />
              </div>
            </div>
          </Card>

          <Card hover className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="label-base text-neutral-600">Study Time</p>
                <p className="heading-md text-neutral-900">42h</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-primary-500 rounded-2xl flex items-center justify-center shadow-glow-primary">
                <Clock className="w-7 h-7 text-white" />
              </div>
            </div>
          </Card>

          <Card hover className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="label-base text-neutral-600">Achievements</p>
                <p className="heading-md text-neutral-900">8</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-secondary-400 to-secondary-500 rounded-2xl flex items-center justify-center shadow-glow-accent">
                <Trophy className="w-7 h-7 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Button Showcase */}
        <Card padding="lg">
          <h3 className="heading-sm mb-6 text-center">Enhanced Button Components</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="label-lg text-neutral-700">Primary Buttons</h4>
              <Button variant="primary" gradient glow icon={<Brain />}>
                AI Tutor
              </Button>
              <Button variant="primary" size="lg" icon={<BookOpen />}>
                Take Quiz
              </Button>
              <Button variant="primary" size="sm" icon={<Star />}>
                Small Button
              </Button>
            </div>

            <div className="space-y-4">
              <h4 className="label-lg text-neutral-700">Secondary & Outline</h4>
              <Button variant="secondary" icon={<Users />}>
                Join Classroom
              </Button>
              <Button variant="outline" icon={<Heart />}>
                Wellness Check
              </Button>
              <Button variant="ghost" icon={<TrendingUp />}>
                View Progress
              </Button>
            </div>

            <div className="space-y-4">
              <h4 className="label-lg text-neutral-700">Interactive States</h4>
              <Button variant="primary" loading>
                Loading...
              </Button>
              <Button variant="danger" icon={<Award />}>
                Delete Achievement
              </Button>
              <Button variant="primary" fullWidth icon={<Send />}>
                Full Width Button
              </Button>
            </div>
          </div>
        </Card>

        {/* Input Showcase */}
        <Card padding="lg">
          <h3 className="heading-sm mb-6 text-center">Enhanced Input Components</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                leftIcon={<Mail className="w-5 h-5" />}
                hint="We'll never share your email"
              />
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                leftIcon={<Lock className="w-5 h-5" />}
                rightIcon={<Eye className="w-5 h-5" />}
              />
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                leftIcon={<User className="w-5 h-5" />}
                variant="filled"
              />
            </div>
            
            <div className="space-y-6">
              <Input
                label="Search Courses"
                placeholder="Type to search..."
                variant="outline"
                inputSize="lg"
              />
              <Input
                label="Error Example"
                placeholder="This field has an error"
                error="This field is required"
                leftIcon={<Mail className="w-5 h-5" />}
              />
              <div className="space-y-2">
                <label className="label-base text-neutral-700">Voice Input</label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Ask me anything..."
                    className="flex-1"
                  />
                  <Button variant="outline" icon={<Mic />} />
                  <Button variant="primary" icon={<Send />} />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Progress & Badges */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card padding="lg">
            <h3 className="heading-sm mb-6">Progress Tracking</h3>
            <div className="space-y-6">
              <ProgressBar
                value={75}
                variant="primary"
                showLabel
                label="Mathematics"
                animated
              />
              <ProgressBar
                value={60}
                variant="success"
                showLabel
                label="Science"
                animated
              />
              <ProgressBar
                value={90}
                variant="warning"
                showLabel
                label="History"
                animated
              />
              <ProgressBar
                value={45}
                variant="error"
                showLabel
                label="English"
                animated
              />
            </div>
          </Card>

          <Card padding="lg">
            <h3 className="heading-sm mb-6">Badge Components</h3>
            <div className="space-y-6">
              <div>
                <h4 className="label-base text-neutral-700 mb-3">Achievement Badges</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="primary" size="lg">Quiz Master</Badge>
                  <Badge variant="success" size="lg">Study Streak</Badge>
                  <Badge variant="warning" size="lg">Fast Learner</Badge>
                  <Badge variant="error" size="lg">Challenge Complete</Badge>
                </div>
              </div>
              
              <div>
                <h4 className="label-base text-neutral-700 mb-3">Status Indicators</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="primary">Active</Badge>
                  <Badge variant="success">Completed</Badge>
                  <Badge variant="warning">In Progress</Badge>
                  <Badge variant="neutral">Draft</Badge>
                </div>
              </div>

              <div>
                <h4 className="label-base text-neutral-700 mb-3">Notification Dots</h4>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Badge variant="primary" dot />
                    <span className="body-sm">New Messages</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="success" dot />
                    <span className="body-sm">Online</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="error" dot />
                    <span className="body-sm">Alert</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Card Variants */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="default" padding="lg">
            <h4 className="heading-xs mb-3">Default Card</h4>
            <p className="body-base text-neutral-600">
              Standard card with subtle shadow and hover effects.
            </p>
          </Card>

          <Card variant="elevated" padding="lg">
            <h4 className="heading-xs mb-3">Elevated Card</h4>
            <p className="body-base text-neutral-600">
              Enhanced shadow for important content sections.
            </p>
          </Card>

          <Card variant="glass" padding="lg">
            <h4 className="heading-xs mb-3">Glass Card</h4>
            <p className="body-base text-neutral-600">
              Modern glassmorphism effect with backdrop blur.
            </p>
          </Card>
        </div>

        {/* Typography Showcase */}
        <Card padding="lg">
          <h3 className="heading-sm mb-6 text-center">Typography System</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="label-lg text-neutral-700">Headings</h4>
              <h1 className="heading-xl text-gradient-primary">Extra Large Heading</h1>
              <h2 className="heading-lg text-gradient-accent">Large Heading</h2>
              <h3 className="heading-md text-neutral-900">Medium Heading</h3>
              <h4 className="heading-sm text-neutral-800">Small Heading</h4>
              <h5 className="heading-xs text-neutral-700">Extra Small Heading</h5>
            </div>
            
            <div className="space-y-4">
              <h4 className="label-lg text-neutral-700">Body Text & Labels</h4>
              <p className="body-lg text-neutral-700">Large body text for important content and descriptions.</p>
              <p className="body-base text-neutral-600">Regular body text for most content and paragraphs.</p>
              <p className="body-sm text-neutral-500">Small body text for secondary information.</p>
              <p className="body-xs text-neutral-400">Extra small text for captions and metadata.</p>
              <div className="space-y-2">
                <p className="label-lg text-neutral-800">Large Label</p>
                <p className="label-base text-neutral-700">Base Label</p>
                <p className="label-sm text-neutral-600">Small Label</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center py-8"
        >
          <p className="body-base text-neutral-500">
            Enhanced MentorQuest UI with modern design patterns, accessibility, and beautiful animations.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default EnhancedUIShowcase;