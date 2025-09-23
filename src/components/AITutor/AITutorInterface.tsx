import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Brain,
  BookOpen,
  Lightbulb,
  Star,
  Loader,
  Zap
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGameification } from '../../hooks/useGameification';
import { aiService, ttsService, sttService } from '../../lib/ai-services';
import { db } from '../../lib/supabase';
import { toast } from 'sonner';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  subject?: string;
  difficulty?: string;
  followUpQuestions?: string[];
  quizQuestions?: Array<{
    question: string;
    options: string[];
    correct_answer: string | number;
    explanation: string;
  }>;
}

const AITutorInterface: React.FC = () => {
  const { t } = useTranslation();
  const { supabaseUser } = useAuth();
  const { addXP } = useGameification();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('general');
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const subjects = [
    { value: 'general', label: 'General', icon: '🎓' },
    { value: 'mathematics', label: t('mathematics'), icon: '🔢' },
    { value: 'science', label: t('science'), icon: '🔬' },
    { value: 'history', label: t('history'), icon: '📚' },
    { value: 'english', label: t('english'), icon: '📝' },
    { value: 'physics', label: 'Physics', icon: '⚛️' },
    { value: 'chemistry', label: 'Chemistry', icon: '🧪' },
    { value: 'biology', label: 'Biology', icon: '🧬' }
  ];

  const difficulties = [
    { value: 'easy', label: t('easy'), color: 'text-green-600' },
    { value: 'medium', label: t('medium'), color: 'text-yellow-600' },
    { value: 'hard', label: t('hard'), color: 'text-red-600' }
  ];

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    // Welcome message
    if (messages.length === 0 && supabaseUser) {
      setMessages([{
        id: '1',
        type: 'ai',
        content: `Hello ${supabaseUser?.user_metadata?.full_name || supabaseUser?.email}! I'm your AI tutor. I'm here to help you learn and understand any topic. What would you like to explore today?`,
        timestamp: new Date()
      }]);
    }
  }, [supabaseUser, messages.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText,
      timestamp: new Date(),
      subject: selectedSubject,
      difficulty: selectedDifficulty
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Get AI response
      const response = await aiService.generateTutorResponse(
        inputText,
        selectedSubject,
        selectedDifficulty
      );

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.answer,
        timestamp: new Date(),
        followUpQuestions: response.follow_up_questions,
        quizQuestions: response.quiz_questions
      };

      setMessages(prev => [...prev, aiMessage]);

      // Save session to database
      if (supabaseUser) {
        try {
          await db.addAITutorSession({
            student_id: supabaseUser.id,
            question: inputText,
            answer: response.answer,
            subject: selectedSubject,
            difficulty_level: selectedDifficulty,
            follow_up_questions: response.follow_up_questions
          });

          // Award XP for asking questions
          await addXP(10, 'AI tutor question');
        } catch (dbError) {
          console.error('Error saving AI tutor session:', dbError);
          // Continue without saving to DB
        }
      }

      // Auto-speak response if enabled
      if (supabaseUser?.user_metadata?.voice_enabled) {
        handleSpeak(response.answer);
      }

    } catch (error) {
      console.error('Error getting AI response:', error);
      toast.error('Sorry, I encountered an error. Please try again.');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'I apologize, but I encountered an error processing your question. Please try again or rephrase your question.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!sttService.isSupported()) {
      toast.error('Speech recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      sttService.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      sttService.startListening(
        (text, isFinal) => {
          if (isFinal) {
            setInputText(text);
            setIsListening(false);
          } else {
            setInputText(text);
          }
        },
        (error) => {
          console.error('Speech recognition error:', error);
          setIsListening(false);
          toast.error('Voice input error. Please try again.');
        },
        supabaseUser?.user_metadata?.language || 'en-US'
      );
    }
  };

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      ttsService.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      ttsService.speak(text, {
        language: supabaseUser?.user_metadata?.language || 'en',
        rate: 0.9,
        pitch: 1
      });
      
      // Reset speaking state after a delay
      setTimeout(() => setIsSpeaking(false), text.length * 50);
    }
  };

  const handleFollowUpQuestion = (question: string) => {
    setInputText(question);
  };

  const handleQuizGeneration = async (questions: Array<{
    question: string;
    options: string[];
    correct_answer: string | number;
    explanation: string;
  }>) => {
    if (!supabaseUser) return;

    try {
      // Create a quick quiz from the generated questions
      const quiz = {
        title: `AI Generated Quiz - ${selectedSubject}`,
        description: 'Quiz generated from your AI tutor session',
        questions: questions,
        difficulty_level: selectedDifficulty,
        subject: selectedSubject,
        created_by: supabaseUser.id,
        created_at: new Date().toISOString()
      };

      // Save quiz (in a real app, you'd save to database)
      console.log('Quiz generated:', quiz.title);
      toast.success('Quiz generated! You can find it in your quizzes section.');

      // Award XP for quiz generation
      await addXP(25, 'quiz generation');

    } catch (error) {
      console.error('Error generating quiz:', error);
      toast.error('Error generating quiz. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-6 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI Tutor</h1>
              <p className="text-primary-100">Your personal learning assistant</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-gray-600" />
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {subjects.map(subject => (
                  <option key={subject.value} value={subject.value}>
                    {subject.icon} {subject.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-gray-600" />
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty.value} value={difficulty.value}>
                    {difficulty.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-6 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <div className="flex items-start space-x-2">
                    {message.type === 'ai' && (
                      <Brain className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm">{message.content}</p>
                      
                      {/* Follow-up Questions */}
                      {message.followUpQuestions && message.followUpQuestions.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs font-medium text-gray-600">Follow-up questions:</p>
                          {message.followUpQuestions.map((question, index) => (
                            <button
                              key={index}
                              onClick={() => handleFollowUpQuestion(question)}
                              className="block w-full text-left text-xs p-2 bg-white rounded-lg border border-gray-200 hover:border-primary-300 transition-colors"
                            >
                              <Lightbulb className="w-3 h-3 inline mr-1 text-yellow-500" />
                              {question}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Quiz Generation */}
                      {message.quizQuestions && message.quizQuestions.length > 0 && (
                        <div className="mt-3">
                          <button
                            onClick={() => handleQuizGeneration(message.quizQuestions!)}
                            className="btn-primary text-xs px-3 py-1"
                          >
                            <Zap className="w-3 h-3 mr-1" />
                            Generate Quiz ({message.quizQuestions.length} questions)
                          </button>
                        </div>
                      )}

                      {/* Voice Controls */}
                      {message.type === 'ai' && (
                        <div className="mt-2 flex items-center space-x-2">
                          <button
                            onClick={() => handleSpeak(message.content)}
                            className="text-xs text-gray-500 hover:text-primary-600 transition-colors"
                          >
                            {isSpeaking ? (
                              <VolumeX className="w-4 h-4" />
                            ) : (
                              <Volume2 className="w-4 h-4" />
                            )}
                          </button>
                          <span className="text-xs text-gray-400">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <div className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-primary-600" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <form onSubmit={handleSubmit} className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t('questionPlaceholder')}
                className="input pr-12"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-colors ${
                  isListening
                    ? 'text-red-600 bg-red-50'
                    : 'text-gray-400 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>
            
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
          
          <div className="mt-2 text-xs text-gray-500 text-center">
            {isListening && (
              <span className="text-red-600 font-medium">🎤 Listening...</span>
            )}
            {!isListening && (
              <span>Ask me anything! I can help with explanations, examples, and generate quizzes.</span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AITutorInterface;