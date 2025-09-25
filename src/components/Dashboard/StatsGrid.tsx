import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Zap, Target, Clock, Trophy } from 'lucide-react';
import { StudentProfile } from '../../types';
import Card from '../ui/Card';

interface StatsGridProps {
  profile: StudentProfile | null;
}

const StatsGrid: React.FC<StatsGridProps> = ({ profile }) => {
  const { t } = useTranslation();

  const stats = [
    {
      key: 'totalXP',
      label: t('totalXP'),
      value: profile?.xp?.toLocaleString() || '0',
      icon: Zap,
      gradient: 'from-warning-400 to-warning-500',
      glow: 'shadow-glow-accent'
    },
    {
      key: 'studyStreak',
      label: t('studyStreak'),
      value: `${profile?.streak_days || 0} days`,
      icon: Target,
      gradient: 'from-error-400 to-warning-500',
      glow: 'shadow-glow-secondary'
    },
    {
      key: 'studyTime',
      label: 'Study Time',
      value: `${profile?.total_study_time ? Math.floor(profile.total_study_time / 60) : 0}h`,
      icon: Clock,
      gradient: 'from-primary-400 to-primary-500',
      glow: 'shadow-glow-primary'
    },
    {
      key: 'achievements',
      label: t('achievements'),
      value: Array.isArray(profile?.achievements) ? profile.achievements.length.toString() : '0',
      icon: Trophy,
      gradient: 'from-secondary-400 to-secondary-500',
      glow: 'shadow-glow-accent'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + index * 0.1 }}
        >
          <Card 
            variant="default" 
            padding="lg" 
            hover={true}
            className="hover:shadow-glow-primary/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="label-base text-neutral-600">{stat.label}</p>
                <p className="heading-md text-neutral-900">{stat.value}</p>
              </div>
              <div className={`w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center ${stat.glow}`}>
                <stat.icon className="w-7 h-7 text-neutral-900" />
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsGrid;