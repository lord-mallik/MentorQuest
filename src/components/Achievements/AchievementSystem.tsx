import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Award, Target, Zap, Crown, Medal, Lock, CircleCheck as CheckCircle } from 'lucide-react';
import { useGamification } from '../../hooks/useGamification';
import { Achievement } from '../../types';
import { toast } from 'sonner';

interface AchievementSystemProps {
  showModal?: boolean;
  onClose?: () => void;
}

const AchievementSystem: React.FC<AchievementSystemProps> = () => {
  const { achievements, unlockedAchievements, loading } = useGamification();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([]);

  const categories = [
    { id: 'all', name: 'All', icon: Trophy },
    { id: 'learning', name: 'Learning', icon: Star },
    { id: 'streak', name: 'Streaks', icon: Target },
    { id: 'social', name: 'Social', icon: Award },
    { id: 'wellness', name: 'Wellness', icon: Zap },
    { id: 'special', name: 'Special', icon: Crown }
  ];

  const rarityColors = {
    common: 'border-gray-300 bg-gray-50',
    rare: 'border-blue-300 bg-blue-50',
    epic: 'border-purple-300 bg-purple-50',
    legendary: 'border-yellow-300 bg-yellow-50'
  };

  const rarityIcons = {
    common: Medal,
    rare: Award,
    epic: Crown,
    legendary: Trophy
  };

  const filteredAchievements = achievements.filter(achievement => 
    selectedCategory === 'all' || achievement.category === selectedCategory
  );

  const isUnlocked = useCallback((achievementId: string) => {
    return unlockedAchievements.some(ua => 
      (ua as any).achievement_id === achievementId || ua.id === achievementId
    );
  }, [unlockedAchievements]);

  const getUnlockedDate = useCallback((achievementId: string) => {
    const unlocked = unlockedAchievements.find(ua =>
      (ua as any).achievement_id === achievementId || ua.id === achievementId
    );
    return unlocked ? (unlocked as any).unlocked_at : null;
  }, [unlockedAchievements]);

  // Check for newly unlocked achievements
  useEffect(() => {
    const checkNewAchievements = () => {
      const recentlyUnlocked = unlockedAchievements.filter(ua => {
        const unlockedDate = (ua as any).unlocked_at;
        const timeDiff = Date.now() - new Date(unlockedDate).getTime();
        return timeDiff < 5000; // Within last 5 seconds
      });

      if (recentlyUnlocked.length > 0) {
        const newAchievements = recentlyUnlocked.map(ua => {
          const achievementId = (ua as any).achievement_id || ua.id;
          return achievements.find(a => a.id === achievementId);
        }).filter(Boolean) as Achievement[];

        setNewlyUnlocked(newAchievements);
        
        // Show toast notifications
        newAchievements.forEach(achievement => {
          toast.success(`🏆 Achievement Unlocked: ${achievement.name}!`, {
            description: achievement.description,
            duration: 8000
          });
        });
      }
    };

    if (achievements.length > 0 && unlockedAchievements.length > 0) {
      checkNewAchievements();
    }
  }, [achievements, unlockedAchievements]);

  const AchievementCard: React.FC<{ achievement: Achievement }> = ({ achievement }) => {
    const unlocked = isUnlocked(achievement.id);
    const unlockedDate = getUnlockedDate(achievement.id);
    const RarityIcon = rarityIcons[achievement.rarity];

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: unlocked ? 1.05 : 1.02 }}
        className={`p-4 rounded-xl border-2 transition-all ${
          unlocked 
            ? rarityColors[achievement.rarity] 
            : 'border-gray-200 bg-gray-100 opacity-60'
        }`}
      >
        <div className="text-center">
          <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
            unlocked 
              ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg' 
              : 'bg-gray-300'
          }`}>
            {unlocked ? (
              <span className="text-2xl">{achievement.icon}</span>
            ) : (
              <Lock className="w-8 h-8 text-gray-500" />
            )}
          </div>
          
          <h3 className={`font-bold mb-2 ${unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
            {achievement.name}
          </h3>
          
          <p className={`text-sm mb-3 ${unlocked ? 'text-gray-700' : 'text-gray-500'}`}>
            {achievement.description}
          </p>
          
          <div className="flex items-center justify-center space-x-2 mb-2">
            <RarityIcon className={`w-4 h-4 ${
              unlocked ? 'text-yellow-600' : 'text-gray-400'
            }`} />
            <span className={`text-xs font-medium capitalize ${
              unlocked ? 'text-gray-700' : 'text-gray-500'
            }`}>
              {achievement.rarity}
            </span>
          </div>
          
          <div className={`text-xs ${unlocked ? 'text-green-600' : 'text-gray-500'}`}>
            {unlocked ? (
              <div className="flex items-center justify-center space-x-1">
                <CheckCircle className="w-3 h-3" />
                <span>Unlocked {new Date(unlockedDate).toLocaleDateString()}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-1">
                <Zap className="w-3 h-3" />
                <span>+{achievement.xp_reward} XP</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const AchievementModal: React.FC<{ achievement: Achievement; onClose: () => void }> = ({ 
    achievement, 
    onClose 
  }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
          <span className="text-4xl">{achievement.icon}</span>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Achievement Unlocked!</h2>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">{achievement.name}</h3>
        <p className="text-gray-600 mb-6">{achievement.description}</p>
        
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">+{achievement.xp_reward}</div>
            <div className="text-sm text-gray-600">XP Earned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 capitalize">{achievement.rarity}</div>
            <div className="text-sm text-gray-600">Rarity</div>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="btn-primary px-8 py-3"
        >
          Awesome!
        </button>
      </motion.div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Achievements</h1>
        </div>
        <p className="text-lg text-gray-600">
          Track your learning milestones and unlock rewards
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {unlockedAchievements.length}
          </div>
          <div className="text-gray-600">Unlocked</div>
        </div>
        
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {achievements.length - unlockedAchievements.length}
          </div>
          <div className="text-gray-600">Remaining</div>
        </div>
        
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {Math.round((unlockedAchievements.length / achievements.length) * 100) || 0}%
          </div>
          <div className="text-gray-600">Complete</div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === category.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAchievements.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </div>

      {/* Achievement Unlock Modals */}
      <AnimatePresence>
        {newlyUnlocked.map((achievement) => (
          <AchievementModal
            key={achievement.id}
            achievement={achievement}
            onClose={() => setNewlyUnlocked(prev => 
              prev.filter(a => a.id !== achievement.id)
            )}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AchievementSystem;