import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain,
  BookOpen,
  Trophy,
  Target,
  TrendingUp,
  Calendar,
  Clock,
  Star,
  Zap,
  Award,
  Heart,
  Users
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ProgressData, DailyQuest } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import { useGamification } from '../../hooks/useGamification';

const StudentDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { supabaseUser } = useAuth();

  console.log(supabaseUser)

  const { profile, dailyQuests, loading: gamificationLoading, completeQuest, updateStreak } = useGamification();
  const [recentActivity, setRecentActivity] = useState<Array<{
    id: number;
    type: 'quiz_completed' | 'ai_tutor_session' | 'achievement_unlocked';
    title: string;
    score?: number;
    xp_earned?: number;
    topic?: string;
    description?: string;
    timestamp: string;
  }>>([]);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    // Mock data for demo
    setRecentActivity([
      {
        id: 1,
        type: 'quiz_completed',
        title: 'Mathematics Quiz',
        score: 85,
        xp_earned: 50,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        type: 'ai_tutor_session',
        title: 'Physics Question',
        topic: 'Newton\'s Laws',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        type: 'achievement_unlocked',
        title: 'Quiz Master',
        description: 'Completed 10 quizzes',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ]);

    setProgressData([
      {
        subject: 'Mathematics',
        completed_lessons: 12,
        total_lessons: 20,
        average_score: 87,
        time_spent: 240,
        last_activity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        subject: 'Science',
        completed_lessons: 8,
        total_lessons: 15,
        average_score: 92,
        time_spent: 180,
        last_activity: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        subject: 'History',
        completed_lessons: 6,
        total_lessons: 12,
        average_score: 78,
        time_spent: 120,
        last_activity: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ]);
  }, []);

  useEffect(() => {
    if (supabaseUser) {
      updateStreak();
      loadDashboardData();
    }
  }, [supabaseUser, updateStreak, loadDashboardData]);

  useEffect(() => {
    if (!gamificationLoading) {
      setLoading(false);
    }
  }, [gamificationLoading]);

  const handleQuestComplete = useCallback(async (quest: DailyQuest) => {
    try {
      await completeQuest(quest.id);
    } catch (error) {
      console.error('Error completing quest:', error);
    }
  },[completeQuest]);

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
console.log(loading, profile)
  // if (loading || !profile) {
  //   return (
  //     <LoadingSpinner 
  //       size="lg" 
  //       message="Loading your dashboard..." 
  //       fullScreen={false}
  //     />
  //   );
  // }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-8 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {t('welcomeBack')}, {supabaseUser?.user_metadata?.full_name}! 👋
            </h1>
            <p className="text-primary-100 text-lg">
              Ready to continue your learning journey?
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">Level {profile?.level}</div>
            <div className="text-primary-200">{profile?.xp} XP</div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('totalXP')}</p>
              <p className="text-2xl font-bold text-gray-900">{profile?.xp.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('studyStreak')}</p>
              <p className="text-2xl font-bold text-gray-900">{profile?.streak_days} days</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Study Time</p>
              <p className="text-2xl font-bold text-gray-900">            
                {profile?.total_study_time &&  Math.floor(profile?.total_study_time / 60)}h
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('achievements')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {Array.isArray(profile?.achievements) ? profile.achievements.length : 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily Quests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-1"
        >
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">{t('todaysQuests')}</h3>
              <Target className="w-5 h-5 text-primary-600" />
            </div>
            
            <div className="space-y-4">
              {dailyQuests.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No quests available today</p>
                </div>
              ) : (
                dailyQuests.map((quest) => (
                  <div
                    key={quest.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      quest.completed
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-primary-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{quest.title}</h4>
                        <p className="text-sm text-gray-600">{quest.description}</p>
                        <div className="flex items-center mt-2 space-x-2">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium text-yellow-600">
                            +{quest.xp_reward} XP
                          </span>
                        </div>
                      </div>
                      {quest.completed ? (
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <Star className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <button
                          onClick={() => handleQuestComplete(quest)}
                          className="btn-primary text-sm px-3 py-1"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-1"
        >
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">{t('progress')}</h3>
              <TrendingUp className="w-5 h-5 text-primary-600" />
            </div>
            
            <div className="space-y-4">
              {progressData.map((subject) => (
                <div key={subject.subject} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{subject.subject}</span>
                    <span className="text-sm text-gray-600">
                      {subject.completed_lessons}/{subject.total_lessons}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${(subject.completed_lessons / subject.total_lessons) * 100}%`
                      }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Avg: {subject.average_score}%</span>
                    <span>{Math.floor(subject.time_spent / 60)}h studied</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="lg:col-span-1"
        >
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">{t('recentActivity')}</h3>
              <Clock className="w-5 h-5 text-primary-600" />
            </div>
            
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {activity.title}
                      </p>
                      {activity.score && (
                        <p className="text-sm text-gray-600">
                          Score: {activity.score}% (+{activity.xp_earned} XP)
                        </p>
                      )}
                      {activity.topic && (
                        <p className="text-sm text-gray-600">
                          Topic: {activity.topic}
                        </p>
                      )}
                      {activity.description && (
                        <p className="text-sm text-gray-600">
                          {activity.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {getTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Link to="/ai-tutor" className="card p-6 hover:shadow-lg transition-shadow text-left group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Ask AI Tutor</h4>
              <p className="text-sm text-gray-600">Get instant help</p>
            </div>
          </div>
        </Link>

        <Link to="/quizzes" className="card p-6 hover:shadow-lg transition-shadow text-left group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Take Quiz</h4>
              <p className="text-sm text-gray-600">Test your knowledge</p>
            </div>
          </div>
        </Link>

        <Link to="/wellness" className="card p-6 hover:shadow-lg transition-shadow text-left group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center group-hover:bg-pink-200 transition-colors">
              <Heart className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Wellness Check</h4>
              <p className="text-sm text-gray-600">How are you feeling?</p>
            </div>
          </div>
        </Link>

        <Link to="/leaderboard" className="card p-6 hover:shadow-lg transition-shadow text-left group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Leaderboard</h4>
              <p className="text-sm text-gray-600">See your ranking</p>
            </div>
          </div>
        </Link>
      </motion.div>
    </div>
  );
};

export default StudentDashboard;