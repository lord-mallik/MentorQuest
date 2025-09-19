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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role === 'student') {
      loadGameificationData();
    }
  }, [user]);

  const loadGameificationData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Load student profile
      try {
        const profileData = await db.getStudentProfile(user.id);
        setProfile(profileData);
      } catch (profileError) {
        console.error('Error loading student profile:', profileError);
        // Create profile if it doesn't exist
        try {
          const newProfile = await db.createStudentProfile(user.id);
          setProfile(newProfile);
        } catch (createError) {
          console.error('Error creating student profile:', createError);
          setError('Failed to load or create student profile');
        }
      }

      // Load daily quests
      try {
        const { data: questsData, error: questsError } = await supabase
          .from('daily_quests')
          .select('*')
          .eq('student_id', user.id)
          .gte('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false });
      
        if (questsError) throw questsError;
        setDailyQuests(questsData || []);
      } catch (questsError) {
        console.error('Error loading daily quests:', questsError);
        setDailyQuests([]);
      }

      // Load achievements
      try {
        const { data: achievementsData, error: achievementsError } = await supabase
          .from('achievements')
          .select('*')
          .order('rarity', { ascending: false });
      
        if (achievementsError) throw achievementsError;
        setAchievements(achievementsData || []);
      } catch (achievementsError) {
        console.error('Error loading achievements:', achievementsError);
        setAchievements([]);
      }

    } catch (error) {
      console.error('Error loading gamification data:', error);
      setError('Failed to load gamification data');
    } finally {
      setLoading(false);
    }
  };

  const addXP = async (amount: number, source: string = 'general') => {
    if (!user || !profile) {
      throw new Error('User or profile not available');
    }

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
      toast.error('Failed to add XP. Please try again.');
      throw new Error('Failed to add XP');
    }
  };

  const checkAchievements = async (stats: any) => {
    if (!user || !achievements || achievements.length === 0) return [];

    const unlockedAchievements = [];

    for (const achievement of achievements) {
      try {
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
            
            // Show achievement notification (don't add XP here to avoid recursion)
            toast.success(`🏆 Achievement Unlocked: ${achievement.name}!`, {
              description: achievement.description,
              duration: 8000,
              className: 'achievement-unlock'
            });
          } catch (unlockError) {
            console.error('Error unlocking achievement:', unlockError);
          }
        }
      } catch (checkError) {
        console.error('Error checking achievement:', checkError);
      }
    }

    return unlockedAchievements;
  };

  const completeQuest = async (questId: string) => {
    if (!user) {
      throw new Error('User not available');
    }

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
        
        toast.success(`Quest completed! +${quest.xp_reward} XP`);
      }
    } catch (error) {
      console.error('Error completing quest:', error);
      toast.error('Failed to complete quest. Please try again.');
      throw new Error('Failed to complete quest');
    }
  };

  const updateStreak = async () => {
    if (!user || !profile) {
      console.warn('User or profile not available for streak update');
      return;
    }

    try {
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
            last_activity: new Date().toISOString(),
            updated_at: new Date().toISOString()
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
          
          if (newStreakDays > profile.streak_days) {
            toast.success(`🔥 ${newStreakDays} day streak!`);
          }
        } else {
          console.error('Error updating streak:', error);
        }
      }
    } catch (error) {
      console.error('Error in updateStreak:', error);
    }
  };

  const generateDailyQuests = async () => {
    if (!user) {
      console.warn('User not available for quest generation');
      return;
    }

    try {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const questTemplates = [
        {
          title: 'Study Session',
          description: 'Complete a 25-minute study session',
          type: 'study_time' as const,
          target_value: 25,
          xp_reward: 50
        },
        {
          title: 'Quiz Master',
          description: 'Complete 2 quizzes',
          type: 'quiz_completion' as const,
          target_value: 2,
          xp_reward: 75
        },
        {
          title: 'Wellness Check',
          description: 'Complete your daily wellness check-in',
          type: 'wellness_checkin' as const,
          target_value: 1,
          xp_reward: 25
        },
        {
          title: 'Streak Keeper',
          description: 'Maintain your study streak',
          type: 'streak' as const,
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
          student_id: user.id,
          expires_at: tomorrow.toISOString(),
          completed: false
        }));

      const { data, error } = await supabase
        .from('daily_quests')
        .insert(selectedQuests)
        .select();

      if (!error && data) {
        setDailyQuests(prev => [...prev, ...data]);
        toast.success(`${data.length} new daily quests generated!`);
      } else if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error generating daily quests:', error);
      toast.error('Failed to generate daily quests');
    }
  };

  return {
    profile,
    dailyQuests,
    achievements,
    loading,
    error,
    addXP,
    checkAchievements,
    completeQuest,
    updateStreak,
    generateDailyQuests,
    refreshData: loadGameificationData
  };
}