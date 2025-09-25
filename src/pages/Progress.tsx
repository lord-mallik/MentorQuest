import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Clock, BookOpen, Award, BarChart3, Calendar, BrainCircuit, FlaskConical, Landmark, PencilRuler } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ProgressData, StudySession, QuizResult } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Progress: React.FC = () => {
  const { t } = useTranslation();
  const { supabaseUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year'>('week');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  const loadProgressData = useCallback(async () => {
    if (!supabaseUser) return;
    
    setLoading(true);
    try {
      // In a real implementation, these would be actual database calls
      // For now, we'll use mock data similar to what's in StudentDashboard
      
      // Mock progress data
      setProgressData([
        {
          subject: t('subjects.mathematics'),
          completed_lessons: 12,
          total_lessons: 20,
          average_score: 87,
          time_spent: 240, // minutes
          last_activity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          subject: t('subjects.science'),
          completed_lessons: 8,
          total_lessons: 15,
          average_score: 92,
          time_spent: 180,
          last_activity: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        },
        {
          subject: t('subjects.history'),
          completed_lessons: 6,
          total_lessons: 12,
          average_score: 78,
          time_spent: 120,
          last_activity: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          subject: t('subjects.english'),
          completed_lessons: 10,
          total_lessons: 18,
          average_score: 85,
          time_spent: 200,
          last_activity: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
        }
      ]);
      
      // Mock study sessions
      setStudySessions([
        {
          id: '1',
          student_id: supabaseUser.id,
          subject: t('subjects.mathematics'),
          duration_minutes: 45,
          focus_score: 85,
          breaks_taken: 2,
          completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          xp_earned: 50
        },
        {
          id: '2',
          student_id: supabaseUser.id,
          subject: t('subjects.science'),
          duration_minutes: 60,
          focus_score: 90,
          breaks_taken: 1,
          completed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          xp_earned: 65
        },
        {
          id: '3',
          student_id: supabaseUser.id,
          subject: t('subjects.history'),
          duration_minutes: 30,
          focus_score: 75,
          breaks_taken: 1,
          completed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          xp_earned: 35
        }
      ]);
      
      // Mock quiz results with more detailed information
      setQuizResults([
        {
          id: '1',
          quiz_id: 'q1',
          student_id: supabaseUser.id,
          title: t('quizzes.algebraFundamentals'),
          subject: t('subjects.mathematics'),
          answers: { '1': 'a', '2': 'b', '3': 'c' },
          score: 8,
          max_score: 10,
          percentage: 80,
          completed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          time_taken: 15,
          xp_earned: 40
        },
        {
          id: '2',
          quiz_id: 'q2',
          student_id: supabaseUser.id,
          title: t('quizzes.cellBiology'),
          subject: t('subjects.science'),
          answers: { '1': 'b', '2': 'a', '3': 'd' },
          score: 9,
          max_score: 10,
          percentage: 90,
          completed_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          time_taken: 12,
          xp_earned: 45
        },
        {
          id: '3',
          quiz_id: 'q3',
          student_id: supabaseUser.id,
          title: t('quizzes.worldWar2'),
          subject: t('subjects.history'),
          answers: { '1': 'c', '2': 'c', '3': 'a', '4': 'b' },
          score: 7,
          max_score: 10,
          percentage: 70,
          completed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          time_taken: 18,
          xp_earned: 35
        }
      ]);
      
    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
    }
  }, [supabaseUser, t]);

  useEffect(() => {
    loadProgressData();
  }, [loadProgressData, selectedTimeframe]);

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}${t('time.hours')} ${mins}${t('time.minutes')}` : `${mins}${t('time.minutes')}`;
  };

  const getCompletionPercentage = (subject: ProgressData): number => {
    return Math.round((subject.completed_lessons / subject.total_lessons) * 100);
  };

  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return t('time.secondsAgo', { count: diffInSeconds });
    if (diffInSeconds < 3600) return t('time.minutesAgo', { count: Math.floor(diffInSeconds / 60) });
    if (diffInSeconds < 86400) return t('time.hoursAgo', { count: Math.floor(diffInSeconds / 3600) });
    return t('time.daysAgo', { count: Math.floor(diffInSeconds / 86400) });
  };

  const getScoreColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-green-100';
    if (percentage >= 75) return 'bg-blue-100';
    if (percentage >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getSubjectIcon = (subject: string) => {
    const subjectKey = subject.toLowerCase();
    if (subjectKey.includes('math')) return <PencilRuler className="w-5 h-5 text-blue-600" />;
    if (subjectKey.includes('science')) return <FlaskConical className="w-5 h-5 text-green-600" />;
    if (subjectKey.includes('history')) return <Landmark className="w-5 h-5 text-yellow-600" />;
    if (subjectKey.includes('english')) return <BookOpen className="w-5 h-5 text-purple-600" />;
    return <BrainCircuit className="w-5 h-5 text-gray-600" />;
  };

  const getSubjectIconBg = (subject: string) => {
    const subjectKey = subject.toLowerCase();
    if (subjectKey.includes('math')) return 'bg-blue-100';
    return 'bg-gray-100';
  }
  const filteredProgressData = selectedSubject === 'all' 
    ? progressData 
    : progressData.filter(item => item.subject === selectedSubject);

  if (loading) {
    return <LoadingSpinner fullScreen message={t('loading.progress')} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="heading-lg text-gray-900">{t('progressSection.title')}</h1>
          <p className="body-base text-gray-600">{t('progressSection.subtitle')}</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="flex rounded-lg overflow-hidden border border-gray-200">
            <button 
              onClick={() => setSelectedTimeframe('week')}
              className={`px-4 py-2 text-sm ${selectedTimeframe === 'week' ? 'bg-primary-50 text-primary-700 font-medium' : 'bg-white text-gray-700'}`}
            >
              {t('time.week')}
            </button>
            <button 
              onClick={() => setSelectedTimeframe('month')}
              className={`px-4 py-2 text-sm ${selectedTimeframe === 'month' ? 'bg-primary-50 text-primary-700 font-medium' : 'bg-white text-gray-700'}`}
            >
              {t('time.month')}
            </button>
            <button 
              onClick={() => setSelectedTimeframe('year')}
              className={`px-4 py-2 text-sm ${selectedTimeframe === 'year' ? 'bg-primary-50 text-primary-700 font-medium' : 'bg-white text-gray-700'}`}
            >
              {t('time.year')}
            </button>
          </div>
          
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm bg-white text-gray-700"
          >
            <option value="all">{t('subjects.all')}</option>
            {progressData.map(subject => (
              <option key={subject.subject} value={subject.subject}>{subject.subject}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Progress Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="label-base text-gray-600">{t('progressSection.averageScore')}</p>
              <p className="heading-md text-gray-900">
                {Math.round(progressData.reduce((acc, curr) => acc + curr.average_score, 0) / progressData.length)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-blue-600" />
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
              <p className="label-base text-gray-600">{t('progressSection.totalStudyTime')}</p>
              <p className="heading-md text-gray-900">
                {formatTime(progressData.reduce((acc, curr) => acc + curr.time_spent, 0))}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-600" />
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
              <p className="label-base text-gray-600">{t('progressSection.completedLessons')}</p>
              <p className="heading-md text-gray-900">
                {progressData.reduce((acc, curr) => acc + curr.completed_lessons, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-purple-600" />
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
              <p className="label-base text-gray-600">{t('progressSection.quizzesCompleted')}</p>
              <p className="heading-md text-gray-900">{quizResults.length}</p>
            </div>
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-pink-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Subject Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card p-6"
      >
        <h2 className="heading-sm text-gray-900 mb-6">{t('progressSection.subjectProgress')}</h2>
        
        <div className="space-y-6">
          {filteredProgressData.map((subject) => (
            <div key={subject.subject} className="group">
              <div className="flex items-center gap-4 mb-2">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getSubjectIconBg(subject.subject)}`}>
                  {getSubjectIcon(subject.subject)}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <span className="label-lg text-gray-900">{subject.subject}</span>
                    <span className="body-sm font-medium text-primary-600">{getCompletionPercentage(subject)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500"
                      style={{ width: `${getCompletionPercentage(subject)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="pl-14 flex flex-wrap items-center justify-between text-sm text-gray-600">
                <span>{subject.completed_lessons}/{subject.total_lessons} {t('progressSection.lessons')}</span>
                <span className="text-gray-600">{t('progressSection.avgScore')}: {subject.average_score}%</span>
                <span className="text-gray-600">{formatTime(subject.time_spent)} {t('progressSection.spent')}</span>
                <span>{t('progressSection.lastActivity')}: {getTimeAgo(subject.last_activity)}</span>
              </div>
            </div>
          ))}
          
          {filteredProgressData.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{t('progressSection.noSubjectsFound')}</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card p-6"
        >
          <h2 className="heading-sm text-gray-900 mb-6">{t('progressSection.recentStudySessions')}</h2>
          
          <div className="space-y-4">
            {studySessions.map((session) => (
              <div key={session.id} className="rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between bg-gray-50 px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 ${getSubjectIconBg(session.subject)} rounded-lg flex items-center justify-center`}>
                      {getSubjectIcon(session.subject)}
                    </div>
                    <h3 className="label-base text-gray-900">{session.subject}</h3>
                  </div>
                  <span className="text-xs text-gray-500">{getTimeAgo(session.completed_at)}</span>
                </div>
                <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-500">{t('progressSection.duration')}</p>
                    <p className="text-lg font-medium text-gray-800">{formatTime(session.duration_minutes)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t('progressSection.focusScore')}</p>
                    <p className="text-lg font-medium text-gray-800">{session.focus_score}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t('progressSection.breaksTaken')}</p>
                    <p className="text-lg font-medium text-gray-800">{session.breaks_taken}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t('progressSection.xpEarned')}</p>
                    <p className="text-lg font-medium text-primary-600">+{session.xp_earned} XP</p>
                  </div>
                </div>
              </div>
            ))}
            
            {studySessions.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">{t('progressSection.noStudySessionsFound')}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quiz Results - Improved UI */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card p-6"
        >
          <h2 className="heading-sm text-gray-900 mb-6">{t('progressSection.quizResults')}</h2>
          
          <div className="space-y-4">
            {quizResults.map((quiz) => (
              <div key={quiz.id} className="rounded-lg border border-gray-100 overflow-hidden shadow-sm">
                <div className="flex items-center justify-between bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 ${getScoreBgColor(quiz.percentage)} rounded-lg flex items-center justify-center`}>
                      <BookOpen className={`w-4 h-4 ${getScoreColor(quiz.percentage)}`} />
                    </div>
                    <div>
                      <h3 className="label-base text-gray-900">{quiz.title}</h3>
                      <p className="text-xs text-gray-500">{quiz.subject}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{getTimeAgo(quiz.completed_at)}</span>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className={`text-lg font-bold ${getScoreColor(quiz.percentage)}`}>
                        {quiz.percentage}%
                      </span>
                      <span className="text-sm text-gray-600">
                        ({quiz.score}/{quiz.max_score} {t('progressSection.correct')})
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{quiz.time_taken} {t('time.minutes')}</span>
                    </div>
                  </div>
                  
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full ${quiz.percentage >= 90 ? 'bg-gradient-to-r from-green-500 to-green-600' : 
                        quiz.percentage >= 75 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                        quiz.percentage >= 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                        'bg-gradient-to-r from-red-500 to-red-600'}`}
                      style={{ width: `${quiz.percentage}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Award className="w-4 h-4 text-primary-500" />
                      <span className="text-sm font-medium text-primary-600">+{quiz.xp_earned} XP</span>
                    </div>
                    <button className="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1">
                      <span>{t('progressSection.reviewQuiz')}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {quizResults.length === 0 && (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">{t('progressSection.noQuizResultsFound')}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Progress;