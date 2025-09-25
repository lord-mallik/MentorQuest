import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Hop as Home, Brain, BookOpen, TrendingUp, Heart, Users, Menu, X, CircleAlert as AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';
import NotificationCenter from '../Notifications/NotificationCenter';
import ProfileSection from './ProfileSection';
import LanguageSelector from './LanguageSelector';
import NotificationButton from './NotificationButton';
import MobileMenu from './MobileMenu';

const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const { supabaseUser, signOut, connectionStatus } = useAuth();
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
  ];

  const teacherNavItems = [
    { path: '/dashboard', icon: Home, label: t('dashboard') },
    { path: '/classroom', icon: Users, label: t('classroom') },
    { path: '/content-generator', icon: Brain, label: 'Content Generator' },
    { path: '/analytics', icon: TrendingUp, label: 'Analytics' },
  ];

  const navItems = supabaseUser?.user_metadata?.role === 'teacher' ? teacherNavItems : studentNavItems;

  const handleSignOut = async () => {
    try {
      setIsMobileMenuOpen(false);
      await signOut();
      toast.success('Signed out successfully', {position: 'bottom-right'});
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden lg:flex fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-sm">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-3 group">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-glow-primary"
              >
                <Brain className="w-6 h-6 text-white" />
              </motion.div>
              <span className="heading-xs text-gradient-primary group-hover:scale-105 transition-transform">
                MentorQuest
              </span>
            </Link>

            {/* Navigation Items */}
            <div className="flex items-center space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative px-4 py-2 rounded-xl label-base transition-all duration-300 group ${
                      isActive(item.path)
                        ? 'text-primary-700 bg-primary-50 shadow-sm font-semibold'
                        : 'text-neutral-700 hover:text-primary-700 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isActive(item.path) ? 'text-primary-600' : ''
                      }`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive(item.path) && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-xl -z-10"
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
              
              {/* Notifications */}
              <NotificationButton 
                onClick={() => setShowNotifications(true)}
                hasUnread={true}
              />

              {/* Language Selector */}
              <LanguageSelector />

              {/* Profile Section */}
              <ProfileSection user={supabaseUser} onSignOut={handleSignOut} />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-sm">
        <div className="px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-2 group">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shadow-glow-primary"
              >
                <Brain className="w-5 h-5 text-white" />
              </motion.div>
              <span className="heading-sm text-gradient-primary group-hover:scale-105 transition-transform">
                MentorQuest
              </span>
            </Link>

            <div className="flex items-center space-x-2">
              {/* Connection Status for Mobile */}
              {!connectionStatus.connected && (
                <AlertCircle className="w-5 h-5 text-yellow-600" />
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
        <MobileMenu
          isOpen={isMobileMenuOpen}
          navItems={navItems}
          isActive={isActive}
          onItemClick={() => setIsMobileMenuOpen(false)}
          onSignOut={handleSignOut}
        />
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16"></div>

      {/* Notification Center - Fixed positioning */}
      <NotificationCenter 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </>
  );
};

export default Navbar;