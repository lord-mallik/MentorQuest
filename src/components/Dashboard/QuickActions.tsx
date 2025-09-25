import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Brain, BookOpen, Heart, Users } from 'lucide-react';
import Card from '../ui/Card';

const QuickActions: React.FC = () => {
  const actions = [
    {
      to: '/ai-tutor',
      icon: Brain,
      title: 'Ask AI Tutor',
      description: 'Get instant help',
      bgColor: 'bg-blue-100',
      hoverColor: 'group-hover:bg-blue-200',
      iconColor: 'text-blue-600'
    },
    {
      to: '/quizzes',
      icon: BookOpen,
      title: 'Take Quiz',
      description: 'Test your knowledge',
      bgColor: 'bg-green-100',
      hoverColor: 'group-hover:bg-green-200',
      iconColor: 'text-green-600'
    },
    {
      to: '/wellness',
      icon: Heart,
      title: 'Wellness Check',
      description: 'How are you feeling?',
      bgColor: 'bg-pink-100',
      hoverColor: 'group-hover:bg-pink-200',
      iconColor: 'text-pink-600'
    },
    {
      to: '/leaderboard',
      icon: Users,
      title: 'Leaderboard',
      description: 'See your ranking',
      bgColor: 'bg-purple-100',
      hoverColor: 'group-hover:bg-purple-200',
      iconColor: 'text-purple-600'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {actions.map((action, index) => (
        <motion.div
          key={action.to}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9 + index * 0.1 }}
        >
          <Link to={action.to}>
            <Card 
              variant="default" 
              padding="lg" 
              hover={true}
              className="text-left group cursor-pointer"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 ${action.bgColor} rounded-lg flex items-center justify-center ${action.hoverColor} transition-colors`}>
                  <action.icon className={`w-6 h-6 ${action.iconColor}`} />
                </div>
                <div>
                  <h4 className="label-lg text-neutral-900">{action.title}</h4>
                  <p className="body-sm text-neutral-600">{action.description}</p>
                </div>
              </div>
            </Card>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default QuickActions;