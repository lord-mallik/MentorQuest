import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Clock, BookOpen, Brain, Award, Star } from 'lucide-react';
import Card from '../ui/Card';

interface ActivityItem {
  id: number;
  type: 'quiz_completed' | 'ai_tutor_session' | 'achievement_unlocked';
  title: string;
  score?: number;
  xp_earned?: number;
  topic?: string;
  description?: string;
  timestamp: string;
}

interface RecentActivityProps {
  recentActivity: ActivityItem[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ recentActivity }) => {
  const { t } = useTranslation();

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'quiz_completed': return BookOpen;
      case 'ai_tutor_session': return Brain;
      case 'achievement_unlocked': return Award;
      default: return Star;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
    >
      <Card variant="default" padding="lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="heading-sm text-neutral-900">{t('recentActivity')}</h3>
          <Clock className="w-5 h-5 text-primary-600" />
        </div>
        
        <div className="space-y-4">
          {recentActivity.map((activity, index) => {
            const Icon = getActivityIcon(activity.type);
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="flex items-start space-x-3"
              >
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="label-base text-neutral-900 truncate">
                    {activity.title}
                  </p>
                  {activity.score && (
                    <p className="body-sm text-neutral-600">
                      Score: {activity.score}% (+{activity.xp_earned} XP)
                    </p>
                  )}
                  {activity.topic && (
                    <p className="body-sm text-neutral-600">
                      Topic: {activity.topic}
                    </p>
                  )}
                  {activity.description && (
                    <p className="body-sm text-neutral-600">
                      {activity.description}
                    </p>
                  )}
                  <p className="body-xs text-neutral-500 mt-1">
                    {getTimeAgo(activity.timestamp)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
};

export default RecentActivity;