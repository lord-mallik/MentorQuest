import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import { useAuth } from '../../hooks/useAuth';

const Layout: React.FC = () => {
  const { supabaseUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!supabaseUser) {
      navigate('/auth', { replace: true });
      return;
    }
  }, [supabaseUser, navigate]);

  return (
    <div className="min-h-screen bg-white">
      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(217, 70, 239, 0.1) 0%, transparent 50%)`
        }} />
      </div>
      
      <Navbar />
      
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <Outlet />
      </motion.main>
      
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
          },
        }}
      />
    </div>
  );
};

export default Layout;