import React from 'react';
import { useAuth } from '../hooks/useAuth';
import StudentDashboard from '../components/Dashboard/StudentDashboard';
import TeacherDashboard from '../components/Dashboard/TeacherDashboard';

const Dashboard: React.FC = () => {
  const { supabaseUser } = useAuth();

  if (!supabaseUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600">
        </div>
      </div>
    );
  }

  return supabaseUser.role === 'teacher' ? <TeacherDashboard /> : <StudentDashboard />;
};

export default Dashboard;