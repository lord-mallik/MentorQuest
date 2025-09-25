import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { TrendingUp } from 'lucide-react';
import { ProgressData } from '../../types';
import Card from '../ui/Card';
import ProgressBar from '../ui/ProgressBar';

interface ProgressOverviewProps {
  progressData: ProgressData[];
}

const ProgressOverview: React.FC<ProgressOverviewProps> = ({ progressData }) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <Card variant="default" padding="lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="heading-sm text-neutral-900">{t('progress')}</h3>
          <TrendingUp className="w-5 h-5 text-primary-700" />
        </div>
        
        <div className="space-y-6">
          {progressData.map((subject, index) => (
            <motion.div
              key={subject.subject}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="label-lg text-neutral-900">{subject.subject}</span>
                <span className="body-sm text-neutral-700">
                  {subject.completed_lessons}/{subject.total_lessons}
                </span>
              </div>
              
              <ProgressBar
                value={subject.completed_lessons}
                max={subject.total_lessons}
                variant="primary"
                size="md"
                animated={true}
              />
              
              <div className="flex items-center justify-between body-sm text-neutral-700">
                <span>Avg: {subject.average_score}%</span>
                <span>{Math.floor(subject.time_spent / 60)}h studied</span>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};

export default ProgressOverview;