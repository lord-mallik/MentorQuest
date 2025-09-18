import React from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import Navbar from './Navbar';
import { useAuth } from '../../hooks/useAuth';

const Layout: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
          },
        }}
      />
    </div>
  );
};

export default Layout;