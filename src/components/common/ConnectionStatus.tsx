import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { checkSupabaseConnection } from '../../lib/supabase';

const ConnectionStatus: React.FC = () => {
  const { connectionStatus, refreshConnection } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      refreshConnection();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshConnection]);

  useEffect(() => {
    if (!isOnline || !connectionStatus.connected) {
      setShowStatus(true);
      const timer = setTimeout(() => setShowStatus(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, connectionStatus.connected]);

  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        message: 'No internet connection',
        bgColor: 'bg-red-500',
        textColor: 'text-white'
      };
    }
    
    if (!connectionStatus.connected) {
      return {
        icon: AlertCircle,
        message: 'Database connection lost',
        bgColor: 'bg-yellow-500',
        textColor: 'text-white'
      };
    }
    
    return {
      icon: CheckCircle,
      message: 'Connected',
      bgColor: 'bg-green-500',
      textColor: 'text-white'
    };
  };

  const status = getStatusConfig();
  const Icon = status.icon;

  if (!showStatus && isOnline && connectionStatus.connected) {
    return null;
  }

  return (
    <AnimatePresence>
      {showStatus && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className={`${status.bgColor} ${status.textColor} px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2`}>
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{status.message}</span>
            {!isOnline || !connectionStatus.connected ? (
              <button
                onClick={refreshConnection}
                className="ml-2 text-xs underline hover:no-underline"
              >
                Retry
              </button>
            ) : null}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConnectionStatus;