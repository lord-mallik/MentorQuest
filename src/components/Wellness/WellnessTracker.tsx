import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Brain,
  Activity,
  Calendar,
  TrendingUp,
  Battery,
  AlertTriangle,
  CheckCircle,
  Target,
  Clock
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../lib/supabase';
import { aiService } from '../../lib/ai-services';
import { toast } from 'sonner';
import { useGamification } from '../../hooks/useGamification';

interface WellnessEntry {
  mood: number;
  stress_level: number;
  energy_level: number;
  notes: string;
  activities: string[];
}

interface WellnessRecommendation {
  title: string;
  description: string;
  icon: string;
  duration: string;
  category: 'physical' | 'mental' | 'social' | 'relaxation';
}

const WellnessTracker: React.FC = () => {
  const { t } = useTranslation();
  const { supabaseUser } = useAuth();
  const { addXP } = useGamification();
  const [todayEntry, setTodayEntry] = useState<WellnessEntry>({
    mood: 3,
    stress_level: 3,
    energy_level: 3,
    notes: '',
    activities: []
  });
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [weeklyData, setWeeklyData] = useState<WellnessEntry[]>([]);
  const [recommendations, setRecommendations] = useState<WellnessRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const moodEmojis = ['😢', '😕', '😐', '😊', '😄'];
  const moodLabels = [t('verySad'), t('sad'), t('neutral'), t('happy'), t('veryHappy')];
  
  const stressColors = ['bg-green-500', 'bg-yellow-400', 'bg-orange-500', 'bg-red-500', 'bg-red-700'];
  const energyColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-400', 'bg-green-600'];

  const wellnessActivities = [
    { id: 'deep_breathing', name: 'Deep Breathing', icon: '🫁', category: 'relaxation' },
    { id: 'short_walk', name: 'Short Walk', icon: '🚶', category: 'physical' },
    { id: 'meditation', name: 'Meditation', icon: '🧘', category: 'mental' },
    { id: 'stretching', name: 'Stretching', icon: '🤸', category: 'physical' },
    { id: 'journaling', name: 'Journaling', icon: '📝', category: 'mental' },
    { id: 'music', name: 'Listen to Music', icon: '🎵', category: 'relaxation' },
    { id: 'hydrate', name: 'Drink Water', icon: '💧', category: 'physical' },
    { id: 'healthy_snack', name: 'Healthy Snack', icon: '🍎', category: 'physical' },
    { id: 'call_friend', name: 'Call a Friend', icon: '📞', category: 'social' },
    { id: 'gratitude', name: 'Gratitude Practice', icon: '🙏', category: 'mental' }
  ];

  const loadWellnessData = useCallback(async () => {
    if (!supabaseUser) return;

    try {
      // Check if user has already checked in today
      const today = new Date().toISOString().split('T')[0];
      const { data: todayData } = await db.supabase
        .from('wellness_entries')
        .select('*')
        .eq('student_id', supabaseUser.id)
        .eq('date', today)
        .single();

      if (todayData) {
        setTodayEntry({
          mood: todayData.mood,
          stress_level: todayData.stress_level,
          energy_level: todayData.energy_level,
          notes: todayData.notes || '',
          activities: todayData.activities || []
        });
        setHasCheckedInToday(true);
      }

      // Load weekly data for trends
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { data: weekData } = await db.supabase
        .from('wellness_entries')
        .select('*')
        .eq('student_id', supabaseUser.id)
        .gte('date', weekAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

      setWeeklyData(weekData || []);

    } catch (error) {
      console.error('Error loading wellness data:', error);
    }
  }, [supabaseUser]);

  useEffect(() => {
    if (supabaseUser) {
      loadWellnessData();
    }
  }, [supabaseUser, loadWellnessData]);

  const handleSubmitWellness = async () => {
    if (!supabaseUser) return;

    setLoading(true);
    try {
      const wellnessData = {
        student_id: supabaseUser.id,
        date: new Date().toISOString().split('T')[0],
        mood: todayEntry.mood,
        stress_level: todayEntry.stress_level,
        energy_level: todayEntry.energy_level,
        notes: todayEntry.notes,
        activities: todayEntry.activities
      };

      try {
        await db.addWellnessEntry(wellnessData);
      } catch (dbError) {
        console.error('Error saving wellness entry:', dbError);
        // Continue with local state update even if DB save fails
      }
      
      setHasCheckedInToday(true);

      // Award XP for wellness check-in
      try {
        await addXP(25, 'wellness check-in');
      } catch (xpError) {
        console.error('Error awarding wellness XP:', xpError);
        toast.success(t('wellnessRecorded'));
      }

      // Generate AI recommendations based on the entry
      await generateRecommendations();

      if (!hasCheckedInToday) {
        toast.success(t('wellnessRecorded'));
      }

    } catch (error) {
      console.error('Error submitting wellness data:', error);
      toast.error('Error recording wellness data');
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async () => {
    try {
      const stressLevel = todayEntry.stress_level >= 4 ? 'high' : 
                         todayEntry.stress_level >= 3 ? 'medium' : 'low';
      
      const aiRecommendations = await aiService.generateWellnessRecommendations(
        todayEntry, 
        stressLevel
      );

      const formattedRecommendations: WellnessRecommendation[] = aiRecommendations.map((rec: string, index: number) => ({
        title: rec,
        description: `Recommended based on your current wellness levels`,
        icon: ['🧘', '🚶', '💧', '🎵', '📞'][index % 5],
        duration: '5-15 min',
        category: ['mental', 'physical', 'physical', 'relaxation', 'social'][index % 5] as 'mental' | 'physical' | 'relaxation' | 'social'
      }));

      setRecommendations(formattedRecommendations);
      setShowRecommendations(true);

    } catch (error) {
      console.error('Error generating recommendations:', error);
    }
  };

  const getStressLevelText = (level: number) => {
    const levels = ['Very Low', 'Low', 'Moderate', 'High', 'Very High'];
    return levels[level - 1] || 'Moderate';
  };

  const getEnergyLevelText = (level: number) => {
    const levels = ['Very Low', 'Low', 'Moderate', 'High', 'Very High'];
    return levels[level - 1] || 'Moderate';
  };

  const getWeeklyAverage = (field: 'mood' | 'stress_level' | 'energy_level') => {
    if (weeklyData.length === 0) return 0;
    const sum = weeklyData.reduce((acc, entry) => acc + entry[field], 0);
    return (sum / weeklyData.length).toFixed(1);
  };

  const toggleActivity = (activityId: string) => {
    setTodayEntry(prev => ({
      ...prev,
      activities: prev.activities.includes(activityId)
        ? prev.activities.filter(id => id !== activityId)
        : [...prev.activities, activityId]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Wellness Tracker</h1>
        </div>
        <p className="text-lg text-gray-600">
          Take care of your mental and physical well-being while you learn
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily Check-in */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {hasCheckedInToday ? "Today's Check-in" : t('moodCheckIn')}
              </h2>
              {hasCheckedInToday && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">Completed</span>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Mood */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('howAreYouFeeling')}
                </label>
                <div className="flex items-center justify-between">
                  {moodEmojis.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => setTodayEntry(prev => ({ ...prev, mood: index + 1 }))}
                      disabled={hasCheckedInToday}
                      className={`p-3 rounded-lg text-2xl transition-all ${
                        todayEntry.mood === index + 1
                          ? 'bg-primary-100 ring-2 ring-primary-500 scale-110'
                          : 'hover:bg-gray-100'
                      } ${hasCheckedInToday ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <div className="text-center mt-2">
                  <span className="text-sm text-gray-600">
                    {moodLabels[todayEntry.mood - 1]}
                  </span>
                </div>
              </div>

              {/* Stress Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('stressLevel')}: {getStressLevelText(todayEntry.stress_level)}
                </label>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-gray-400" />
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={todayEntry.stress_level}
                    onChange={(e) => setTodayEntry(prev => ({ 
                      ...prev, 
                      stress_level: parseInt(e.target.value) 
                    }))}
                    disabled={hasCheckedInToday}
                    className="flex-1"
                  />
                  <div className={`w-4 h-4 rounded-full ${stressColors[todayEntry.stress_level - 1]}`}></div>
                </div>
              </div>

              {/* Energy Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('energyLevel')}: {getEnergyLevelText(todayEntry.energy_level)}
                </label>
                <div className="flex items-center space-x-2">
                  <Battery className="w-4 h-4 text-gray-400" />
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={todayEntry.energy_level}
                    onChange={(e) => setTodayEntry(prev => ({ 
                      ...prev, 
                      energy_level: parseInt(e.target.value) 
                    }))}
                    disabled={hasCheckedInToday}
                    className="flex-1"
                  />
                  <div className={`w-4 h-4 rounded-full ${energyColors[todayEntry.energy_level - 1]}`}></div>
                </div>
              </div>

              {/* Activities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Wellness Activities (optional)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {wellnessActivities.map((activity) => (
                    <button
                      key={activity.id}
                      onClick={() => toggleActivity(activity.id)}
                      disabled={hasCheckedInToday}
                      className={`p-2 rounded-lg text-sm border transition-all ${
                        todayEntry.activities.includes(activity.id)
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${hasCheckedInToday ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
                    >
                      <div className="text-lg mb-1">{activity.icon}</div>
                      <div className="font-medium">{activity.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('notes')} (optional)
                </label>
                <textarea
                  value={todayEntry.notes}
                  onChange={(e) => setTodayEntry(prev => ({ ...prev, notes: e.target.value }))}
                  disabled={hasCheckedInToday}
                  placeholder="How are you feeling today? Any thoughts or concerns?"
                  className="input h-20 resize-none"
                />
              </div>

              {/* Submit Button */}
              {!hasCheckedInToday && (
                <button
                  onClick={handleSubmitWellness}
                  disabled={loading}
                  className="btn-primary w-full h-12 text-base font-semibold"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Recording...</span>
                    </div>
                  ) : (
                    <>
                      <Heart className="w-5 h-5 mr-2" />
                      Complete Check-in (+25 XP)
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Weekly Trends & Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Weekly Summary */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Weekly Trends</h3>
              <TrendingUp className="w-5 h-5 text-primary-600" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg Mood</span>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{getWeeklyAverage('mood')}</span>
                  <span className="text-lg">{moodEmojis[Math.round(parseFloat(getWeeklyAverage('mood'))) - 1] || '😐'}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg Stress</span>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{getWeeklyAverage('stress_level')}</span>
                  <div className={`w-3 h-3 rounded-full ${stressColors[Math.round(parseFloat(getWeeklyAverage('stress_level'))) - 1] || 'bg-gray-300'}`}></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg Energy</span>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{getWeeklyAverage('energy_level')}</span>
                  <div className={`w-3 h-3 rounded-full ${energyColors[Math.round(parseFloat(getWeeklyAverage('energy_level'))) - 1] || 'bg-gray-300'}`}></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Check-ins</span>
                <span className="font-semibold">{weeklyData.length}/7</span>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <AnimatePresence>
            {showRecommendations && recommendations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recommendations</h3>
                  <Brain className="w-5 h-5 text-purple-600" />
                </div>
                
                <div className="space-y-3">
                  {recommendations.slice(0, 3).map((rec, index) => (
                    <div key={index} className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <span className="text-lg">{rec.icon}</span>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{rec.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                          <div className="flex items-center mt-2 space-x-2">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{rec.duration}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Actions */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-primary-200 transition-colors">
                <div className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">Pomodoro Timer</div>
                    <div className="text-sm text-gray-600">25-minute focused study session</div>
                  </div>
                </div>
              </button>
              
              <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-primary-200 transition-colors">
                <div className="flex items-center space-x-3">
                  <Activity className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium text-gray-900">Breathing Exercise</div>
                    <div className="text-sm text-gray-600">5-minute guided breathing</div>
                  </div>
                </div>
              </button>
              
              <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-primary-200 transition-colors">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-medium text-gray-900">View History</div>
                    <div className="text-sm text-gray-600">See your wellness trends</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WellnessTracker;