import React from 'react';
import { motion } from 'framer-motion';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface TeacherWelcomeHeaderProps {
  supabaseUser: SupabaseUser;
  totalStudents: number;
}

const TeacherWelcomeHeader: React.FC<TeacherWelcomeHeaderProps> = ({ 
  supabaseUser, 
  totalStudents 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="gradient-primary rounded-3xl p-8 text-white shadow-glow-primary relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)`
        }} />
      </div>
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex-1">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="heading-lg mb-3"
          >
            Welcome back, {supabaseUser?.user_metadata?.full_name || supabaseUser?.email}!{' '}
            <motion.span
              initial={{ rotate: 0 }}
              animate={{ 
                rotate: [0, -15, 15, -15, 0],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
                ease: "easeInOut"
              }}
              style={{ display: 'inline-block' }}
            >
              👨‍🏫
            </motion.span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="body-lg text-white/90"
          >
            Ready to inspire and educate your students today?
          </motion.p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="text-right"
        >
          <div className="heading-md mb-1">{totalStudents}</div>
          <div className="body-base text-white/80">Total Students</div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TeacherWelcomeHeader;