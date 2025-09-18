import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase, db } from '../lib/supabase';
import { Achievement, DailyQuest, StudentProfile } from '../types';
import { toast } from 'sonner';

export function useGameification() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role === 'student') {
      loadGameificationData();
    }
  }, [user]);

  const loadGameificationData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Load student profile
      const profileData = await db.getStudentProfile(user.id);
      setProfile(profileData);

      // Load daily quests
      const { data: questsData } = await supabase
        .from('daily_quests')
        .select('*')
        .eq('student_id', user.id)
        .gte('expires_at', new Date().toISOString());
      
      setDailyQuests(questsData || []);

      // Load achievements
      const { data: achievementsData } = await supabase
        .from('achievements')
        .select('*')
        .order('rarity', { ascending: false });
      
      setAchievements(achievementsData || []);

    } catch (error) {
      console.error('Error loading gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addXP = async (amount: number, source: string = 'general') => {
    if (!user || !profile) return;

    try {
      const newXP = profile.xp + amount;
      const newLevel = Math.floor(newXP / 1000) + 1;
      const leveledUp = newLevel > profile.level;

      // Update XP in database
      const updatedProfile = await db.updateStudentXP(user.id, amount);
      setProfile(updatedProfile);

      // Show XP gain notification
      toast.success(`+${amount} XP earned from ${source}!`, {
        className: 'xp-gain'
      });

      // Check for level up
      if (leveledUp) {
        toast.success(`🎉 Level Up! You're now level ${newLevel}!`, {
          duration: 5000,
          className: 'achievement-unlock'
        });
        
        // Check for level-based achievements
        await checkAchievements({ level: newLevel, xp: newXP });
      }

      return { xp: newXP, level: newLevel, leveledUp };
    } catch (error) {
      console.error('Error adding XP:', error);
      throw error;
    }
  };

  const checkAchievements = async (stats: any) => {
    if (!user || !achievements) return;

    const unlockedAchievements = [];

    for (const achievement of achievements) {
      // Check if already unlocked
      const { data: existing } = await supabase
        .from('student_achievements')
        .select('id')
        .eq('student_id', user.id)
        .eq('achievement_id', achievement.id)
        .single();

      if (existing) continue;

      // Check achievement requirements
      let shouldUnlock = false;

      switch (achievement.category) {
        case 'learning':
          if (achievement.requirements.quizzes_completed && 
              stats.quizzesCompleted >= achievement.requirements.quizzes_completed) {
            shouldUnlock = true;
          }
          if (achievement.requirements.study_hours && 
              stats.studyHours >= achievement.requirements.study_hours) {
            shouldUnlock = true;
          }
          break;

        case 'streak':
          if (achievement.requirements.streak_days && 
              stats.streakDays >= achievement.requirements.streak_days) {
            shouldUnlock = true;
          }
          break;

        case 'social':
          if (achievement.requirements.level && 
              stats.level >= achievement.requirements.level) {
            shouldUnlock = true;
          }
          break;

        case 'wellness':
          if (achievement.requirements.wellness_checkins && 
              stats.wellnessCheckins >= achievement.requirements.wellness_checkins) {
            shouldUnlock = true;
          }
          break;
      }

      if (shouldUnlock) {
        try {
          await db.unlockAchievement(user.id, achievement.id);
          unlockedAchievements.push(achievement);
          
          // Add XP reward
          await addXP(achievement.xp_reward, 'achievement');
          
          // Show achievement notification
          toast.success(`🏆 Achievement Unlocked: ${achievement.name}!`, {
            description: achievement.description,
            duration: 8000,
            className: 'achievement-unlock'
          });
        } catch (error) {
          console.error('Error unlocking achievement:', error);
        }
      }
    }

    return unlockedAchievements;
  };

  const completeQuest = async (questId: string) => {
    try {
      const { error } = await supabase
        .from('daily_quests')
        .update({ completed: true })
        .eq('id', questId)
        .eq('student_id', user?.id);

      if (error) throw error;

      // Find the quest and add XP reward
      const quest = dailyQuests.find(q => q.id === questId);
      if (quest) {
        await addXP(quest.xp_reward, 'daily quest');
        
        // Update local state
        setDailyQuests(prev => 
          prev.map(q => q.id === questId ? { ...q, completed: true } : q)
        );
      }
    } catch (error) {
      console.error('Error completing quest:', error);
      throw error;
    }
  };

  const updateStreak = async () => {
    if (!user || !profile) return;

    const today = new Date().toDateString();
    const lastActivity = new Date(profile.last_activity).toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

    let newStreakDays = profile.streak_days;

    if (lastActivity === yesterday) {
      // Continue streak
      newStreakDays += 1;
    } else if (lastActivity !== today) {
      // Reset streak if more than a day has passed
      newStreakDays = 1;
    }

    if (newStreakDays !== profile.streak_days) {
      const { error } = await supabase
        .from('student_profiles')
        .update({ 
          streak_days: newStreakDays,
          last_activity: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (!error) {
        setProfile(prev => prev ? { 
          ...prev, 
          streak_days: newStreakDays,
          last_activity: new Date().toISOString()
        } : null);

        // Check for streak achievements
        await checkAchievements({ streakDays: newStreakDays });
      }
    }
  };

  const generateDailyQuests = async () => {
    if (!user) return;

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const questTemplates = [
      {
        title: 'Study Session',
        description: 'Complete a 25-minute study session',
        type: 'study_time',
        target_value: 25,
        xp_reward: 50
      },
      {
        title: 'Quiz Master',
        description: 'Complete 2 quizzes',
        type: 'quiz_completion',
        target_value: 2,
        xp_reward: 75
      },
      {
        title: 'Wellness Check',
        description: 'Complete your daily wellness check-in',
        type: 'wellness_checkin',
        target_value: 1,
        xp_reward: 25
      },
      {
        title: 'Streak Keeper',
        description: 'Maintain your study streak',
        type: 'streak',
        target_value: 1,
        xp_reward: 30
      }
    ];

    // Generate 3 random quests for today
    const selectedQuests = questTemplates
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(template => ({
        ...template,
        id: `quest_${Date.now()}_${Math.random()}`,
        student_id: user.id,
        expires_at: tomorrow.toISOString(),
        completed: false
      }));

    try {
      const { data, error } = await supabase
        .from('daily_quests')
        .insert(selectedQuests)
        .select();

      if (!error && data) {
        setDailyQuests(prev => [...prev, ...data]);
      }
    } catch (error) {
      console.error('Error generating daily quests:', error);
    }
  };

  return {
    profile,
    dailyQuests,
    achievements,
    loading,
    addXP,
    checkAchievements,
    completeQuest,
    updateStreak,
    generateDailyQuests,
    refreshData: loadGameificationData
  };
}