import React from 'react';
import { Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import Badge from '../ui/Badge';

interface NotificationButtonProps {
  onClick: () => void;
  hasUnread?: boolean;
  unreadCount?: number;
}

const NotificationButton: React.FC<NotificationButtonProps> = ({ 
  onClick, 
  hasUnread = true, 
  unreadCount = 0 
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
    >
      <Bell className="w-5 h-5" />
      {hasUnread && (
        <div className="absolute -top-1 -right-1">
          <Badge variant="error" size="sm" dot>
            {unreadCount > 0 ? unreadCount : null}
          </Badge>
        </div>
      )}
    </motion.button>
  );
};

export default NotificationButton;