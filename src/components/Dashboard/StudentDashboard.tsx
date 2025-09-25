import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ProgressData, DailyQuest } from '../../types';
import { useGamification } from '../../hooks/useGamification';
import WelcomeHeader from './WelcomeHeader';
import StatsGrid from './StatsGrid';
import DailyQuests from './DailyQuests';
import ProgressOverview from './ProgressOverview';
import RecentActivity from './RecentActivity';
import QuickActions from './QuickActions';

const StudentDashboard: React.FC = () => {
  const { supabaseUser } = useAuth();
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
  }, [completeQuest]);

  if (loading || !supabaseUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"/>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <WelcomeHeader supabaseUser={supabaseUser} profile={profile} />

      {/* Stats Grid */}
      <StatsGrid profile={profile} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily Quests */}
        <div className="lg:col-span-1">
          <DailyQuests 
            dailyQuests={dailyQuests} 
            onQuestComplete={handleQuestComplete} 
          />
        </div>

        {/* Progress Overview */}
        <div className="lg:col-span-1">
          <ProgressOverview progressData={progressData} />
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <RecentActivity recentActivity={recentActivity} />
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
};

export default StudentDashboard;