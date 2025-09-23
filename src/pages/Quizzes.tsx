import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Search,
  Star,
  Clock,
  Target,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Quiz, QuizAttempt } from '../types';
import QuizInterface from '../components/Quizzes/QuizInterface';
import { toast } from 'sonner';

const Quizzes: React.FC = () => {
  const { supabaseUser } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [loading, setLoading] = useState(true);
  const [recentAttempts, setRecentAttempts] = useState<QuizAttempt[]>([]);

  const subjects = ['all', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'English', 'Science'];
  const difficulties = ['all', 'easy', 'medium', 'hard'];

  // Mock quizzes for demonstration - wrapped in useMemo to prevent recreation on every render
  const mockQuizzes: Quiz[] = useMemo(() => [
    {
      id: 'quiz-1',
      title: 'Basic Algebra',
      description: 'Test your understanding of algebraic expressions and equations',
      questions: [
        {
          id: 'q1',
          quiz_id: 'quiz-1',
          question: 'What is the value of x in the equation 2x + 5 = 13?',
          type: 'multiple_choice',
          options: ['x = 3', 'x = 4', 'x = 5', 'x = 6'],
          correct_answer: 'x = 4',
          explanation: 'Subtract 5 from both sides: 2x = 8, then divide by 2: x = 4',
          points: 10,
          difficulty: 'easy'
        },
        {
          id: 'q2',
          quiz_id: 'quiz-1',
          question: 'Simplify: 3(x + 2) - 2x',
          type: 'multiple_choice',
          options: ['x + 6', 'x + 4', '5x + 6', '3x + 2'],
          correct_answer: 'x + 6',
          explanation: '3(x + 2) - 2x = 3x + 6 - 2x = x + 6',
          points: 15,
          difficulty: 'medium'
        }
      ],
      difficulty_level: 'easy',
      subject: 'Mathematics',
      created_by: 'teacher-1',
      created_at: new Date().toISOString(),
      time_limit: 15
    },
    {
      id: 'quiz-2',
      title: 'Physics Fundamentals',
      description: 'Basic concepts of motion, force, and energy',
      questions: [
        {
          id: 'q3',
          quiz_id: 'quiz-2',
          question: 'What is the formula for calculating speed?',
          type: 'multiple_choice',
          options: ['Speed = Distance × Time', 'Speed = Distance ÷ Time', 'Speed = Time ÷ Distance', 'Speed = Force × Distance'],
          correct_answer: 'Speed = Distance ÷ Time',
          explanation: 'Speed is calculated by dividing distance by time',
          points: 10,
          difficulty: 'easy'
        },
        {
          id: 'q4',
          quiz_id: 'quiz-2',
          question: 'A car travels 120 km in 2 hours. What is its average speed?',
          type: 'multiple_choice',
          options: ['50 km/h', '60 km/h', '70 km/h', '80 km/h'],
          correct_answer: '60 km/h',
          explanation: 'Speed = 120 km ÷ 2 hours = 60 km/h',
          points: 15,
          difficulty: 'medium'
        }
      ],
      difficulty_level: 'medium',
      subject: 'Physics',
      created_by: 'teacher-2',
      created_at: new Date().toISOString(),
      time_limit: 20
    },
    {
      id: 'quiz-3',
      title: 'World History',
      description: 'Major events and civilizations throughout history',
      questions: [
        {
          id: 'q5',
          quiz_id: 'quiz-3',
          question: 'Which empire was ruled by Julius Caesar?',
          type: 'multiple_choice',
          options: ['Greek Empire', 'Roman Empire', 'Persian Empire', 'Egyptian Empire'],
          correct_answer: 'Roman Empire',
          explanation: 'Julius Caesar was a Roman general and statesman who ruled the Roman Empire',
          points: 10,
          difficulty: 'easy'
        }
      ],
      difficulty_level: 'medium',
      subject: 'History',
      created_by: 'teacher-3',
      created_at: new Date().toISOString(),
      time_limit: 25
    }
  ], []);

  const loadQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from the database
      // const data = await db.getQuizzes();
      setQuizzes(mockQuizzes);
    } catch (error) {
      console.error('Error loading quizzes:', error);
      toast.error('Error loading quizzes');
    } finally {
      setLoading(false);
    }
  }, [mockQuizzes]);

  const loadRecentAttempts = useCallback(async () => {
    if (!supabaseUser) return;

    try {
      // Mock recent attempts
      const mockAttempts: QuizAttempt[] = [
        {
          id: 'attempt-1',
          quiz_id: 'quiz-1',
          student_id: supabaseUser.id,
          answers: {},
          score: 20,
          max_score: 25,
          completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          time_taken: 600
        },
        {
          id: 'attempt-2',
          quiz_id: 'quiz-2',
          student_id: supabaseUser.id,
          answers: {},
          score: 18,
          max_score: 25,
          completed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          time_taken: 800
        }
      ];
      setRecentAttempts(mockAttempts);
    } catch (error) {
      console.error('Error loading recent attempts:', error);
    }
  }, [supabaseUser]);

  useEffect(() => {
    loadQuizzes();
    loadRecentAttempts();
  }, [loadQuizzes, loadRecentAttempts, supabaseUser]);

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || quiz.subject === selectedSubject;
    const matchesDifficulty = selectedDifficulty === 'all' || quiz.difficulty_level === selectedDifficulty;
    
    return matchesSearch && matchesSubject && matchesDifficulty;
  });

  const handleQuizComplete = (attempt: QuizAttempt) => {
    setRecentAttempts(prev => [attempt, ...prev.slice(0, 4)]);
    setSelectedQuiz(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPercentage = (attempt: QuizAttempt) => {
    return attempt.max_score > 0 ? Math.round((attempt.score / attempt.max_score) * 100) : 0;
  };

  if (selectedQuiz) {
    return (
      <QuizInterface
        quiz={selectedQuiz}
        onComplete={handleQuizComplete}
        onExit={() => setSelectedQuiz(null)}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Quizzes</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Test your knowledge and track your progress with interactive quizzes
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1 space-y-6"
        >
          {/* Search and Filters */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Search & Filter</h3>
            
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search quizzes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>

            {/* Subject Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="input"
              >
                {subjects.map(subject => (
                  <option key={subject} value={subject}>
                    {subject === 'all' ? 'All Subjects' : subject}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="input"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty === 'all' ? 'All Levels' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Recent Attempts */}
          {recentAttempts.length > 0 && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Attempts</h3>
                <TrendingUp className="w-5 h-5 text-primary-600" />
              </div>
              
              <div className="space-y-3">
                {recentAttempts.slice(0, 3).map((attempt) => {
                  const quiz = quizzes.find(q => q.id === attempt.quiz_id);
                  const percentage = getPercentage(attempt);
                  
                  return (
                    <div key={attempt.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900 text-sm">
                          {quiz?.title || 'Unknown Quiz'}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          percentage >= 80 ? 'text-green-700 bg-green-100' :
                          percentage >= 60 ? 'text-yellow-700 bg-yellow-100' :
                          'text-red-700 bg-red-100'
                        }`}>
                          {percentage}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(attempt.completed_at).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Quizzes Taken</span>
                <span className="font-semibold text-gray-900">{recentAttempts.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average Score</span>
                <span className="font-semibold text-gray-900">
                  {recentAttempts.length > 0 
                    ? Math.round(recentAttempts.reduce((acc, attempt) => acc + getPercentage(attempt), 0) / recentAttempts.length)
                    : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Best Score</span>
                <span className="font-semibold text-gray-900">
                  {recentAttempts.length > 0 
                    ? Math.max(...recentAttempts.map(getPercentage))
                    : 0}%
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quiz Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredQuizzes.map((quiz, index) => (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="card p-6 hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => setSelectedQuiz(quiz)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {quiz.title}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                        {quiz.description}
                      </p>
                    </div>
                    <div className="ml-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(quiz.difficulty_level)}`}>
                        {quiz.difficulty_level}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{quiz.questions?.length || 0} questions</span>
                      </div>
                      {quiz.time_limit && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{quiz.time_limit} min</span>
                        </div>
                      )}
                    </div>
                    <span className="text-primary-600 font-medium">{quiz.subject}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-600">
                        {quiz.questions?.reduce((acc, q) => acc + q.points, 0) || 0} points
                      </span>
                    </div>
                    
                    <button className="btn-primary text-sm px-4 py-2 group-hover:bg-primary-700 transition-colors">
                      <Target className="w-4 h-4 mr-1" />
                      Start Quiz
                    </button>
                  </div>

                  {/* Previous attempt indicator */}
                  {recentAttempts.some(attempt => attempt.quiz_id === quiz.id) && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Previous attempt:</span>
                        <span className="font-medium">
                          {getPercentage(recentAttempts.find(attempt => attempt.quiz_id === quiz.id)!)}%
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Quizzes;