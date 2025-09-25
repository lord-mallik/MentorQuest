import React from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProfileSectionProps {
  user: any;
  onSignOut: () => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ user, onSignOut }) => {
  return (
    <div className="flex items-center space-x-2">
      <Link
        to="/profile"
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center"
        >
          <User className="w-4 h-4 text-white" />
        </motion.div>
        <span className="text-sm font-medium text-gray-700">
          {user?.user_metadata?.full_name || user?.email || 'User'}
        </span>
      </Link>
      
      <button
        onClick={onSignOut}
        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        title="Sign Out"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ProfileSection;