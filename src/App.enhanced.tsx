import React from 'react';
import Navbar from './components/Layout/Navbar';
import ProfileSection from './components/Layout/ProfileSection';
import XPDisplay from './components/Layout/XPDisplay';
import LanguageSelector from './components/Layout/LanguageSelector';
import NotificationButton from './components/Layout/NotificationButton';
import MobileMenu from './components/Layout/MobileMenu';
import NotificationCenter from './components/Notifications/NotificationCenter';

// Mock data for preview
const mockUser = {
  user_metadata: {
    full_name: 'John Doe',
    role: 'student'
  },
  email: 'john.doe@example.com'
};

const mockProfile = {
  level: 5,
  xp: 1250
};

const mockNavItems = [
  { path: '/dashboard', icon: () => <div>🏠</div>, label: 'Dashboard' },
  { path: '/ai-tutor', icon: () => <div>🧠</div>, label: 'AI Tutor' },
  { path: '/quizzes', icon: () => <div>📚</div>, label: 'Quizzes' },
];

const App: React.FC = () => {
  const [showNotifications, setShowNotifications] = React.useState(false);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Enhanced Navbar */}
      <div className="mb-8">
        <Navbar />
      </div>

      {/* Component Showcase */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center mb-12">
          <h1 className="heading-lg text-gradient-primary mb-4">Enhanced Navbar Components</h1>
          <p className="body-lg text-neutral-600">Modular, reusable navbar components with improved design</p>
        </div>

        {/* Profile Section Demo */}
        <div className="card p-6">
          <h2 className="heading-sm mb-4">Profile Section</h2>
          <div className="flex justify-center">
            <ProfileSection 
              user={mockUser} 
              onSignOut={() => console.log('Sign out clicked')} 
            />
          </div>
        </div>

        {/* XP Display Demo */}
        <div className="card p-6">
          <h2 className="heading-sm mb-4">XP Display</h2>
          <div className="flex justify-center space-x-8">
            <div>
              <h3 className="label-base mb-2">Desktop Version</h3>
              <XPDisplay profile={mockProfile} />
            </div>
            <div>
              <h3 className="label-base mb-2">Mobile Version</h3>
              <XPDisplay profile={mockProfile} isMobile />
            </div>
          </div>
        </div>

        {/* Language Selector Demo */}
        <div className="card p-6">
          <h2 className="heading-sm mb-4">Language Selector</h2>
          <div className="flex justify-center space-x-8">
            <div>
              <h3 className="label-base mb-2">Desktop Version</h3>
              <LanguageSelector />
            </div>
            <div>
              <h3 className="label-base mb-2">Mobile Version</h3>
              <LanguageSelector isMobile />
            </div>
          </div>
        </div>

        {/* Notification Button Demo */}
        <div className="card p-6">
          <h2 className="heading-sm mb-4">Notification Button</h2>
          <div className="flex justify-center space-x-4">
            <NotificationButton 
              onClick={() => setShowNotifications(true)}
              hasUnread={true}
            />
            <NotificationButton 
              onClick={() => console.log('No notifications')}
              hasUnread={false}
            />
          </div>
        </div>

        {/* Mobile Menu Demo */}
        <div className="card p-6">
          <h2 className="heading-sm mb-4">Mobile Menu (Always Open for Demo)</h2>
          <div className="max-w-sm mx-auto border rounded-lg overflow-hidden">
            <MobileMenu
              isOpen={true}
              navItems={mockNavItems}
              isActive={(path) => path === '/dashboard'}
              onItemClick={() => console.log('Menu item clicked')}
              onSignOut={() => console.log('Sign out from mobile')}
            />
          </div>
        </div>

        {/* Features List */}
        <div className="card p-6">
          <h2 className="heading-sm mb-4">✨ Enhancements Made</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="label-base text-primary-700">🗂️ Code Organization</h3>
              <ul className="body-sm text-neutral-600 space-y-1">
                <li>• Extracted ProfileSection component</li>
                <li>• Created XPDisplay component</li>
                <li>• Separated LanguageSelector</li>
                <li>• Built NotificationButton component</li>
                <li>• Modular MobileMenu component</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="label-base text-accent-700">🎨 UI Improvements</h3>
              <ul className="body-sm text-neutral-600 space-y-1">
                <li>• Removed settings icon as requested</li>
                <li>• Fixed notification panel positioning</li>
                <li>• Enhanced hover animations</li>
                <li>• Improved mobile responsiveness</li>
                <li>• Better visual hierarchy</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Center */}
      <NotificationCenter 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </div>
  );
};

export default App;