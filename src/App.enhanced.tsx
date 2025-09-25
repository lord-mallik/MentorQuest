import React from 'react';
import { Users, TrendingUp } from 'lucide-react';
import Navbar from './components/Layout/Navbar';
import NotificationCenter from './components/Notifications/NotificationCenter';
import TeacherWelcomeHeader from './components/Dashboard/TeacherWelcomeHeader';
import StatsCard from './components/Dashboard/StatsCard';
import ClassCard from './components/Dashboard/ClassCard';
import PerformanceSection from './components/Dashboard/PerformanceSection';
import QuickToolsGrid from './components/Dashboard/QuickToolsGrid';

// Mock data for preview
const mockTeacherUser = {
  id: 'mock-teacher',
  user_metadata: {
    full_name: 'Dr. Sarah Wilson',
    role: 'teacher'
  },
  email: 'sarah.wilson@school.edu',
  app_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString()
} as any;

const mockClassRoom = {
  id: '1',
  name: 'Advanced Mathematics',
  subject: 'Mathematics',
  teacher_id: 'teacher1',
  students: ['student1', 'student2', 'student3'],
  description: 'Advanced mathematics for grade 10 students',
  class_code: 'MATH10-001',
  active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  class_students: []
};

const mockTopPerformers = [
  { name: 'Alice Johnson', score: 95, subject: 'Mathematics' },
  { name: 'Bob Smith', score: 92, subject: 'Physics' },
];

const mockStrugglingStudents = [
  { name: 'David Wilson', subject: 'Mathematics', score: 65 },
  { name: 'Eva Brown', subject: 'Physics', score: 68 }
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
          <h1 className="heading-lg text-gradient-primary mb-4">Enhanced Dashboard Components</h1>
          <p className="body-lg text-neutral-600">Fixed TypeScript errors and modular dashboard components</p>
        </div>

        {/* Teacher Welcome Header Demo */}
        <div className="card p-6">
          <h2 className="heading-sm mb-4">Teacher Welcome Header</h2>
          <TeacherWelcomeHeader 
            supabaseUser={mockTeacherUser} 
            totalStudents={45} 
          />
        </div>

        {/* Stats Card Demo */}
        <div className="card p-6">
          <h2 className="heading-sm mb-4">Stats Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Active Classes"
              value={8}
              icon={Users}
              iconColor="text-blue-600"
              iconBgColor="bg-blue-100"
            />
            <StatsCard
              title="Avg Engagement"
              value="87%"
              icon={TrendingUp}
              iconColor="text-green-600"
              iconBgColor="bg-green-100"
            />
          </div>
        </div>

        {/* Class Card Demo */}
        <div className="card p-6">
          <h2 className="heading-sm mb-4">Class Card</h2>
          <div className="max-w-sm">
            <ClassCard classRoom={mockClassRoom} />
          </div>
        </div>

        {/* Performance Section Demo */}
        <div className="card p-6">
          <h2 className="heading-sm mb-4">Performance Section</h2>
          <div className="max-w-md">
            <PerformanceSection 
              topPerformers={mockTopPerformers}
              strugglingStudents={mockStrugglingStudents}
            />
          </div>
        </div>

        {/* Quick Tools Grid Demo */}
        <div className="card p-6">
          <h2 className="heading-sm mb-4">Quick Tools Grid</h2>
          <div className="max-w-xs">
            <QuickToolsGrid />
          </div>
        </div>

        {/* Fixes Applied */}
        <div className="card p-6">
          <h2 className="heading-sm mb-4">🔧 Fixes Applied</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="label-base text-primary-700">🐛 TypeScript Fixes</h3>
              <ul className="body-sm text-neutral-600 space-y-1">
                <li>• Fixed ClassRoom type compatibility</li>
                <li>• Added proper User interface mapping</li>
                <li>• Resolved class_students type mismatch</li>
                <li>• Added missing preferences property</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="label-base text-accent-700">🎨 UI Improvements</h3>
              <ul className="body-sm text-neutral-600 space-y-1">
                <li>• Matched name color from StudentDashboard</li>
                <li>• Created modular components</li>
                <li>• Improved code organization</li>
                <li>• Enhanced reusability</li>
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