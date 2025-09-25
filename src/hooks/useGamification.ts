import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { db, supabase } from '../lib/supabase';
import { Achievement, DailyQuest, StudentProfile } from '../types';
import { toast } from 'sonner';

export function useGamification() {
  const { supabaseUser } = useAuth();
  
  console.log(supabaseUser)
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGamificationData = useCallback(async () => {
    if (!supabaseUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Load student profile
      try {
        let profileData: StudentProfile = await db.getStudentProfile(supabaseUser.id);
        if (!profileData) {
          // Create profile if it doesn't exist
          profileData = await db.createStudentProfile(supabaseUser.id);
        }
        
        // If still null, provide fallback mock data
        if (!profileData) {
          console.warn('Using fallback profile data');
          profileData = {
            id: 'mock-profile',
            user_id: supabaseUser.id,
            level: 1,
            xp: 150,
            streak_days: 3,
            last_activity: new Date().toISOString(),
            total_study_time: 120,
            achievements: [],
            wellness_streak: 2,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
        setProfile(profileData);
      } catch (profileError) {
        console.error('Error loading student profile:', profileError);
        // Provide fallback data even on error
        const fallbackProfile = {
          id: 'fallback-profile',
          user_id: supabaseUser.id,
          level: 1,
          xp: 0,
          streak_days: 0,
          last_activity: new Date().toISOString(),
          total_study_time: 0,
          achievements: [],
          wellness_streak: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setProfile(fallbackProfile);
        setError('Using offline mode - some features may be limited');
      }

      // Load daily quests
      try {
        const questsData = await db.getDailyQuests(supabaseUser.id);
        if (questsData && questsData.length > 0) {
          setDailyQuests(questsData);
        } else {
          // Provide mock daily quests if none exist
          const mockQuests = [
            {
              id: 'quest-1',
              title: 'Study Session',
              description: 'Complete a 25-minute study session',
              type: 'study_time' as const,
              target_value: 25,
              xp_reward: 50,
              expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              completed: false
            },
            {
              id: 'quest-2',
              title: 'Quiz Master',
              description: 'Complete 2 quizzes',
              type: 'quiz_completion' as const,
              target_value: 2,
              xp_reward: 75,
              expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              completed: false
            },
            {
              id: 'quest-3',
              title: 'Wellness Check',
              description: 'Complete your daily wellness check-in',
              type: 'wellness_checkin' as const,
              target_value: 1,
              xp_reward: 25,
              expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              completed: true
            }
          ];
          setDailyQuests(mockQuests);
        }
      } catch (questsError) {
        console.error('Error loading daily quests:', questsError);
        setDailyQuests([]);
      }

      // Load achievements
      try {
        const achievementsData = await db.getAchievements();
        setAchievements(achievementsData);
      } catch (achievementsError) {
        console.error('Error loading achievements:', achievementsError);
        setAchievements([]);
      }

      // Load unlocked achievements
      try {
        const unlockedData = await db.getStudentAchievements(supabaseUser.id);
        setUnlockedAchievements(unlockedData);
      } catch (unlockedError) {
        console.error('Error loading unlocked achievements:', unlockedError);
        setUnlockedAchievements([]);
      }

    } catch (error) {
      console.error('Error loading gamification data:', error);
      setError('Failed to load gamification data');
    } finally {
      setLoading(false);
    }
  }, [supabaseUser]);

  const checkAchievements = useCallback( async (stats: {
    level?: number;
    xp?: number;
    quizzesCompleted?: number;
    studyHours?: number;
    streakDays?: number;
    wellnessCheckins?: number;
  }): Promise<Achievement[]> => {
    if (!supabaseUser || !achievements || achievements.length === 0) return [];

    const unlockedAchievements: Achievement[] = [];

    for (const achievement of achievements) {
      try {
        // Check if already unlocked (from loaded data)
        const alreadyUnlocked = unlockedAchievements.some(
          ua => ua.id === achievement.id
        );
        if (alreadyUnlocked) continue;

        // Check achievement requirements
        let shouldUnlock = false;

        switch (achievement.category) {
          case 'learning':
            if (achievement.requirements.quizzes_completed &&
                (stats.quizzesCompleted ?? 0) >= (achievement.requirements.quizzes_completed as number)) {
              shouldUnlock = true;
            }
            if (achievement.requirements.study_hours &&
                (stats.studyHours ?? 0) >= (achievement.requirements.study_hours as number)) {
              shouldUnlock = true;
            }
            break;

          case 'streak':
            if (achievement.requirements.streak_days &&
                (stats.streakDays ?? 0) >= (achievement.requirements.streak_days as number)) {
              shouldUnlock = true;
            }
            break;

          case 'social':
            if (achievement.requirements.level &&
                (stats.level ?? 0) >= (achievement.requirements.level as number)) {
              shouldUnlock = true;
            }
            break;

          case 'wellness':
            if (achievement.requirements.wellness_checkins &&
                (stats.wellnessCheckins ?? 0) >= (achievement.requirements.wellness_checkins as number)) {
              shouldUnlock = true;
            }
            break;
        }

        if (shouldUnlock) {
          try {
            const unlockedAchievement = await db.unlockAchievement(supabaseUser.id, achievement.id);
            if (unlockedAchievement) {
              unlockedAchievements.push(achievement);

              // Show achievement notification (don't add XP here to avoid recursion)
              toast.success(`🏆 Achievement Unlocked: ${achievement.name}!`, {
                description: achievement.description,
                duration: 8000,
                className: 'achievement-unlock'
              });
            }
          } catch (unlockError) {
            console.error('Error unlocking achievement:', unlockError);
          }
        }
      } catch (checkError) {
        console.error('Error checking achievement:', checkError);
      }
    }

    return unlockedAchievements;
  },[achievements, supabaseUser]);

  const addXP =useCallback( async (amount: number, source: string = 'general') => {
    if (!supabaseUser || !profile) {
      console.warn('User or profile not available for XP addition');
      return { xp: 0, level: 1, leveledUp: false };
    }

    try {
      const newXP = profile.xp + amount;
      const newLevel = Math.floor(newXP / 1000) + 1;
      const leveledUp = newLevel > profile.level;

      // Update XP in database
      const updatedProfile = await db.updateStudentXP(supabaseUser.id, amount);
      if (updatedProfile) {
        setProfile(updatedProfile);
      } else {
        // Fallback to local update
        setProfile(prev => prev ? {
          ...prev,
          xp: newXP,
          level: newLevel,
          last_activity: new Date().toISOString()
        } : null);
      }

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
        const newAchievements = await checkAchievements({ level: newLevel, xp: newXP });
        if (newAchievements.length > 0) {
          // Award XP for new achievements
          for (const achievement of newAchievements) {
            await addXP(achievement.xp_reward, 'achievement');
          }
        }
      }

      return { xp: newXP, level: newLevel, leveledUp };
    } catch (error) {
      console.error('Error adding XP:', error);
      toast.error('Failed to add XP. Please try again.');
      return { xp: profile.xp, level: profile.level, leveledUp: false };
    }
  },[checkAchievements, profile, supabaseUser]);

  const completeQuest =useCallback( async (questId: string) => {
    if (!supabaseUser) {
      console.warn('User not available for quest completion');
      return;
    }

    try {
      // Find the quest and add XP reward
      const quest = dailyQuests.find(q => q.id === questId);
      if (!quest) {
        throw new Error('Quest not found');
      }

      if (quest.completed) {
        toast.info('Quest already completed!');
        return;
      }

      // Complete quest in database
      await db.completeQuest(questId, supabaseUser.id);
      
      // Update local state
      setDailyQuests(prev => 
        prev.map(q => q.id === questId ? { ...q, completed: true } : q)
      );
      
      // Award XP
      await addXP(quest.xp_reward, 'daily quest');
      
      toast.success(`Quest completed! +${quest.xp_reward} XP`);
    } catch (error) {
      console.error('Error completing quest:', error);
      toast.error('Failed to complete quest. Please try again.');
    }
  },[addXP, dailyQuests, supabaseUser]);

  const updateStreak =useCallback (async () => {
    if (!supabaseUser || !profile) {
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
        try {
          // Update student profile streak
          const { data, error } = await (supabase as any)
            .from('student_profiles')
            .update({
              streak_days: newStreakDays,
              last_activity: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('user_id', supabaseUser.id)
            .select()
            .single();

          if (!error && data) {
            setProfile(data);
            
            // Check for streak achievements
            await checkAchievements({ streakDays: newStreakDays });
            
            if (newStreakDays > profile.streak_days) {
              toast.success(`🔥 ${newStreakDays} day streak!`);
            }
          } else {
            console.error('Error updating streak:', error);
          }
        } catch (updateError) {
          console.error('Error updating streak:', updateError);
        }
      }
    } catch (error) {
      console.error('Error in updateStreak:', error);
    }
  },[checkAchievements, profile, supabaseUser]);

  const generateDailyQuests =useCallback( async () => {
    if (!supabaseUser) {
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
          student_id: supabaseUser.id,
          expires_at: tomorrow.toISOString(),
          completed: false
        }));

      const { data, error } = await (supabase as any)
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
  },[supabaseUser]);

  useEffect(() => {
    if (supabaseUser && supabaseUser.user_metadata?.role === 'student') {
      loadGamificationData();
    }
  }, [supabaseUser, loadGamificationData]);

  return {
    profile,
    dailyQuests,
    achievements,
    unlockedAchievements,
    loading,
    error,
    addXP,
    checkAchievements,
    completeQuest,
    updateStreak,
    generateDailyQuests,
    refreshData: loadGamificationData
  };
};