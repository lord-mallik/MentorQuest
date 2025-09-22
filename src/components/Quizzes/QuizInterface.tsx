import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  Trophy,
  Brain,
  Target,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Zap
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGameification } from '../../hooks/useGameification';
import { db } from '../../lib/supabase';
import { Quiz, Question, QuizAttempt } from '../../types';
import { toast } from 'sonner';

interface QuizInterfaceProps {
  quiz?: Quiz;
  onComplete?: (attempt: QuizAttempt) => void;
  onExit?: () => void;
}

const QuizInterface: React.FC<QuizInterfaceProps> = ({ quiz, onComplete, onExit }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { addXP } = useGameification();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);

  // Mock quiz data if none provided
  const mockQuiz: Quiz = {
    id: 'mock-quiz',
    title: 'Sample Mathematics Quiz',
    description: 'Test your basic math skills',
    questions: [
      {
        id: 'q1',
        quiz_id: 'mock-quiz',
        question: 'What is 2 + 2?',
        type: 'multiple_choice',
        options: ['3', '4', '5', '6'],
        correct_answer: '4',
        explanation: '2 + 2 equals 4. This is basic addition.',
        points: 10,
        difficulty: 'easy'
      },
      {
        id: 'q2',
        quiz_id: 'mock-quiz',
        question: 'What is 15 × 3?',
        type: 'multiple_choice',
        options: ['35', '45', '55', '65'],
        correct_answer: '45',
        explanation: '15 × 3 = 45. Multiply 15 by 3.',
        points: 15,
        difficulty: 'medium'
      },
      {
        id: 'q3',
        quiz_id: 'mock-quiz',
        question: 'Solve for x: 2x + 6 = 14',
        type: 'multiple_choice',
        options: ['x = 2', 'x = 4', 'x = 6', 'x = 8'],
        correct_answer: 'x = 4',
        explanation: '2x + 6 = 14, so 2x = 8, therefore x = 4.',
        points: 20,
        difficulty: 'hard'
      }
    ],
    difficulty_level: 'medium',
    subject: 'Mathematics',
    created_by: 'teacher',
    created_at: new Date().toISOString(),
    time_limit: 10
  };

  const currentQuiz = quiz || mockQuiz;
  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (currentQuiz) {
      setQuestions(currentQuiz.questions || []);
      if (currentQuiz.time_limit) {
        setTimeRemaining(currentQuiz.time_limit * 60); // Convert minutes to seconds
      }
    }
  }, [currentQuiz]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quizStarted && timeRemaining !== null && timeRemaining > 0 && !quizCompleted) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quizStarted, timeRemaining, quizCompleted]);

  const startQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setAnswers({});
  };

  const handleAnswerSelect = (answer: string) => {
    if (quizCompleted) return;
    
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!user || !currentQuiz) return;

    setLoading(true);
    try {
      // Calculate score
      let score = 0;
      let maxScore = 0;
      const questionResults: any[] = [];

      questions.forEach(question => {
        maxScore += question.points;
        const userAnswer = answers[question.id];
        const isCorrect = userAnswer === question.correct_answer;
        
        if (isCorrect) {
          score += question.points;
        }

        questionResults.push({
          question_id: question.id,
          question: question.question,
          user_answer: userAnswer,
          correct_answer: question.correct_answer,
          is_correct: isCorrect,
          points_earned: isCorrect ? question.points : 0,
          explanation: question.explanation
        });
      });

      const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
      
      // Create quiz attempt
      const attempt: QuizAttempt = {
        id: `attempt_${Date.now()}`,
        quiz_id: currentQuiz.id,
        student_id: user.id,
        answers,
        score,
        max_score: maxScore,
        completed_at: new Date().toISOString(),
        time_taken: currentQuiz.time_limit ? (currentQuiz.time_limit * 60) - (timeRemaining || 0) : 0
      };

      // Save to database if real quiz
      if (quiz) {
        try {
          await db.submitQuizAttempt(attempt);
        } catch (dbError) {
          console.error('Error saving quiz attempt to database:', dbError);
          // Continue with local processing even if DB save fails
        }
      }

      // Calculate XP reward based on performance
      let xpReward = Math.floor(score / 2); // Base XP
      if (percentage >= 90) xpReward += 50; // Bonus for excellent performance
      else if (percentage >= 80) xpReward += 30; // Bonus for good performance
      else if (percentage >= 70) xpReward += 15; // Bonus for decent performance

      // Award XP
      if (xpReward > 0) {
        try {
          await addXP(xpReward, 'quiz completion');
        } catch (xpError) {
          console.error('Error awarding XP:', xpError);
          // Show XP notification even if DB update fails
          toast.success(`Quiz completed! Score: ${percentage.toFixed(1)}% (+${xpReward} XP)`);
        }
      }

      // Set results
      const results = {
        attempt,
        questionResults,
        percentage,
        xpEarned: xpReward,
        grade: percentage >= 90 ? 'A' : percentage >= 80 ? 'B' : percentage >= 70 ? 'C' : percentage >= 60 ? 'D' : 'F'
      };

      setResults(results);
      setQuizCompleted(true);
      
      // Call completion callback
      onComplete?.(attempt);

      if (!xpReward || xpReward === 0) {
        toast.success(`Quiz completed! Score: ${percentage.toFixed(1)}%`);
      }

    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Error submitting quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const restartQuiz = () => {
    setQuizStarted(false);
    setQuizCompleted(false);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setResults(null);
    if (currentQuiz.time_limit) {
      setTimeRemaining(currentQuiz.time_limit * 60);
    }
  };

  if (!quizStarted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{currentQuiz.title}</h1>
          <p className="text-gray-600 mb-6">{currentQuiz.description}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{questions.length}</div>
              <div className="text-sm text-gray-600">Questions</div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {currentQuiz.time_limit ? `${currentQuiz.time_limit} min` : '∞'}
              </div>
              <div className="text-sm text-gray-600">Time Limit</div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 capitalize">{currentQuiz.difficulty_level}</div>
              <div className="text-sm text-gray-600">Difficulty</div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{currentQuiz.subject}</div>
              <div className="text-sm text-gray-600">Subject</div>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-4">
            {onExit && (
              <button onClick={onExit} className="btn-outline px-6 py-3">
                Cancel
              </button>
            )}
            <button onClick={startQuiz} className="btn-primary px-8 py-3 text-lg">
              <Target className="w-5 h-5 mr-2" />
              Start Quiz
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (quizCompleted && results) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl mx-auto"
      >
        <div className="card p-8">
          {/* Results Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h1>
            <p className="text-lg text-gray-600">Here are your results</p>
          </div>

          {/* Score Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <div className="text-3xl font-bold text-blue-600 mb-2">{results.percentage.toFixed(1)}%</div>
              <div className="text-sm text-blue-700">Final Score</div>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <div className="text-3xl font-bold text-green-600 mb-2">{results.attempt.score}</div>
              <div className="text-sm text-green-700">Points Earned</div>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <div className="text-3xl font-bold text-purple-600 mb-2">+{results.xpEarned}</div>
              <div className="text-sm text-purple-700">XP Gained</div>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl">
              <div className="text-3xl font-bold text-yellow-600 mb-2">{results.grade}</div>
              <div className="text-sm text-yellow-700">Grade</div>
            </div>
          </div>

          {/* Question Review */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Question Review</h2>
            <div className="space-y-4">
              {results.questionResults.map((result: any, index: number) => (
                <div key={index} className={`p-4 rounded-lg border-2 ${
                  result.is_correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900">Question {index + 1}</h3>
                    <div className="flex items-center space-x-2">
                      {result.is_correct ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="text-sm font-medium">
                        {result.points_earned}/{questions[index]?.points || 0} pts
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{result.question}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Your Answer: </span>
                      <span className={result.is_correct ? 'text-green-700' : 'text-red-700'}>
                        {result.user_answer || 'Not answered'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Correct Answer: </span>
                      <span className="text-green-700">{result.correct_answer}</span>
                    </div>
                  </div>
                  
                  {result.explanation && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Explanation:</strong> {result.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center space-x-4">
            <button onClick={restartQuiz} className="btn-outline px-6 py-3">
              <RotateCcw className="w-5 h-5 mr-2" />
              Retake Quiz
            </button>
            {onExit && (
              <button onClick={onExit} className="btn-primary px-6 py-3">
                Continue Learning
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      {/* Quiz Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">{currentQuiz.title}</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span>•</span>
              <span>{getAnsweredCount()}/{questions.length} answered</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {timeRemaining !== null && (
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${
                timeRemaining < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>
                <Clock className="w-4 h-4" />
                <span className="font-mono font-medium">{formatTime(timeRemaining)}</span>
              </div>
            )}
            
            {onExit && (
              <button onClick={onExit} className="btn-outline text-sm px-3 py-1">
                Exit
              </button>
            )}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question */}
      {currentQuestion && (
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="card p-8"
        >
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Question {currentQuestionIndex + 1}
              </h2>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-600">
                  {currentQuestion.points} points
                </span>
              </div>
            </div>
            
            <p className="text-xl text-gray-800 leading-relaxed">
              {currentQuestion.question}
            </p>
          </div>

          {/* Answer Options */}
          <div className="space-y-3 mb-8">
            {currentQuestion.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                  answers[currentQuestion.id] === option
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    answers[currentQuestion.id] === option
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-gray-300'
                  }`}>
                    {answers[currentQuestion.id] === option && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={previousQuestion}
              disabled={currentQuestionIndex === 0}
              className="btn-outline px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </button>

            <div className="flex items-center space-x-3">
              {currentQuestionIndex === questions.length - 1 ? (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={loading || getAnsweredCount() === 0}
                  className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Submit Quiz
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  className="btn-primary px-4 py-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default QuizInterface;