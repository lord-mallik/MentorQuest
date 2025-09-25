import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Clock, Star, Award, Zap } from 'lucide-react';
import { useGamification } from '../../hooks/useGamification';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';

interface ProfileStatsProps {
  className?: string;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ className = '' }) => {
  const { profile: gamificationProfile } = useGamification();

  if (!gamificationProfile) return null;

  const stats = [
    {
      icon: Trophy,
      label: 'Level',
      value: gamificationProfile.level,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      icon: Target,
      label: 'Streak',
      value: `${gamificationProfile.streak_days} days`,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      icon: Clock,
      label: 'Study Time',
      value: `${Math.floor((gamificationProfile.total_study_time || 0) / 60)}h`,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    }
  ];

  const xpProgress = gamificationProfile.level > 0 
    ? (gamificationProfile.xp % 1000) / 1000 * 100 
    : (gamificationProfile.xp / 1000) * 100;

  return (
    <Card variant="elevated" padding="lg" className={className}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="heading-sm text-neutral-900">Your Progress</h3>
              <p className="body-sm text-neutral-600">Keep up the great work!</p>
            </div>
          </div>
          <Badge variant="success" size="md">
            <Award className="w-3 h-3" />
            Active
          </Badge>
        </div>

        {/* XP Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="label-base text-neutral-700">Experience Points</span>
            <span className="label-base text-primary-600 font-semibold">
              {gamificationProfile.xp} XP
            </span>
          </div>
          <ProgressBar
            value={xpProgress}
            max={100}
            variant="primary"
            size="md"
            animated={true}
            className="shadow-sm"
          />
          <p className="body-xs text-neutral-500 text-center">
            {Math.round(100 - xpProgress)}% to next level
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: 0.1 + index * 0.05 }}
              className={`${stat.bgColor} ${stat.borderColor} border rounded-xl p-4 text-center hover:shadow-md transition-all duration-200`}
            >
              <div className={`inline-flex items-center justify-center w-8 h-8 ${stat.color} mb-2`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="heading-sm text-neutral-900">{stat.value}</p>
                <p className="body-xs text-neutral-600">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Achievement Hint */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-4 text-white">
          <div className="flex items-center space-x-3">
            <Zap className="w-5 h-5 text-yellow-300" />
            <div>
              <p className="font-semibold text-sm">Next Achievement</p>
              <p className="text-xs opacity-90">Complete 5 more lessons to unlock "Scholar" badge</p>
            </div>
          </div>
        </div>
      </motion.div>
    </Card>
  );
};

export default ProfileStats;