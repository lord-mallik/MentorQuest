import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Brain,
  BookOpen,
  TrendingUp,
  Heart,
  User,
  Settings,
  Trophy,
  Users,
  Menu,
  X,
  LogOut,
  Bell,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGameification } from '../../hooks/useGameification';
import { toast } from 'sonner';

const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, signOut, connectionStatus } = useAuth();
  const { profile } = useGameification();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const studentNavItems = [
    { path: '/dashboard', icon: Home, label: t('dashboard') },
    { path: '/ai-tutor', icon: Brain, label: t('aiTutor') },
    { path: '/quizzes', icon: BookOpen, label: t('quizzes') },
    { path: '/progress', icon: TrendingUp, label: t('progress') },
    { path: '/wellness', icon: Heart, label: t('wellness') },
    { path: '/leaderboard', icon: Trophy, label: t('leaderboard') },
  ];

  const teacherNavItems = [
    { path: '/dashboard', icon: Home, label: t('dashboard') },
    { path: '/classroom', icon: Users, label: t('classroom') },
    { path: '/content-generator', icon: Brain, label: 'Content Generator' },
    { path: '/analytics', icon: TrendingUp, label: 'Analytics' },
  ];

  const navItems = user?.role === 'teacher' ? teacherNavItems : studentNavItems;

  const handleSignOut = async () => {
    try {
      setIsMobileMenuOpen(false);
      await signOut();
      toast.success('Signed out successfully');
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  const handleLanguageChange = (language: string) => {
    try {
      i18n.changeLanguage(language);
      toast.success(`Language changed to ${language.toUpperCase()}`);
    } catch (error) {
      console.error('Error changing language:', error);
      toast.error('Failed to change language');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden lg:flex fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                MentorQuest
              </span>
            </Link>

            {/* Navigation Items */}
            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive(item.path)
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {isActive(item.path) && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-primary-100 rounded-lg -z-10"
                        initial={false}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Connection Status Indicator */}
              {!connectionStatus.connected && (
                <div className="flex items-center space-x-1 text-yellow-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-xs">Offline</span>
                </div>
              )}
              
              {/* XP and Level (Students only) */}
              {user?.role === 'student' && profile && (
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      Level {profile.level}
                    </div>
                    <div className="text-xs text-gray-500">
                      {profile.xp} XP
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold">
                    {profile.level}
                  </div>
                </div>
              )}

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>
              </div>

              {/* Language Selector */}
              <select
                value={i18n.language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="en">EN</option>
                <option value="es">ES</option>
                <option value="fr">FR</option>
                <option value="de">DE</option>
                <option value="hi">हि</option>
              </select>

              {/* Profile Menu */}
              <div className="flex items-center space-x-2">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user?.full_name || 'User'}
                  </span>
                </Link>
                
                <Link
                  to="/settings"
                  className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </Link>
                
                <button
                  onClick={handleSignOut}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                MentorQuest
              </span>
            </Link>

            <div className="flex items-center space-x-2">
              {/* Connection Status for Mobile */}
              {!connectionStatus.connected && (
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              )}
              
              {/* XP Display for Mobile Students */}
              {user?.role === 'student' && profile && (
                <div className="text-xs text-gray-600">
                  L{profile.level} • {profile.xp}XP
                </div>
              )}
              
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white border-t border-gray-200"
            >
              <div className="px-4 py-4 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive(item.path)
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
                
                <hr className="my-4" />
                
                {/* Language Selector for Mobile */}
                <div className="px-3 py-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Language</label>
                  <select
                    value={i18n.language}
                    onChange={(e) => {
                      handleLanguageChange(e.target.value);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="hi">हिन्दी</option>
                  </select>
                </div>
                
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span>{t('profile')}</span>
                </Link>
                
                <Link
                  to="/settings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                  <span>{t('settings')}</span>
                </Link>
                
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                >
                  <LogOut className="w-5 h-5" />
                  <span>{t('signOut')}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16"></div>
    </>
  );
};

export default Navbar;