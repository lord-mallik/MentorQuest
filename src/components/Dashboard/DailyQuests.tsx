import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Target, Calendar, Zap, Star } from 'lucide-react';
import { DailyQuest } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface DailyQuestsProps {
  dailyQuests: DailyQuest[];
  onQuestComplete: (quest: DailyQuest) => void;
}

const DailyQuests: React.FC<DailyQuestsProps> = ({ dailyQuests, onQuestComplete }) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card variant="default" padding="lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="heading-sm text-neutral-900">{t('todaysQuests')}</h3>
          <Target className="w-5 h-5 text-primary-700" />
        </div>
        
        <div className="space-y-4">
          {dailyQuests.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <p className="body-base text-neutral-600">No quests available today</p>
            </div>
          ) : (
            dailyQuests.map((quest, index) => (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  quest.completed
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-primary-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="label-lg text-neutral-900">{quest.title}</h4>
                    <p className="body-sm text-neutral-700">{quest.description}</p>
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
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onQuestComplete(quest)}
                    >
                      Complete
                    </Button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default DailyQuests;