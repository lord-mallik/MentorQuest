import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const ConnectionStatus: React.FC = () => {
  const { connectionStatus, refreshConnection } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

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
      const timer = setTimeout(() => {
        if (isOnline && connectionStatus.connected) {
          setShowStatus(false);
        }
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      // Hide status after successful connection
      const timer = setTimeout(() => setShowStatus(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, connectionStatus.connected]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await refreshConnection();
      // Also try to reconnect to the internet if offline
      if (!isOnline) {
        // Force a network check
        const response = await fetch('/favicon.ico', { 
          method: 'HEAD',
          cache: 'no-cache'
        });
        if (response.ok) {
          setIsOnline(true);
        }
      }
    } catch (error) {
      console.error('Retry connection failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        icon: AlertCircle,
        message: 'No internet connection',
        bgColor: 'bg-red-500',
        textColor: 'text-white',
        showRetry: true
      };
    }
    
    if (!connectionStatus.connected) {
      return {
        icon: AlertCircle,
        message: connectionStatus.error || 'Database connection lost',
        bgColor: 'bg-yellow-500',
        textColor: 'text-white',
        showRetry: true
      };
    }
    
    return {
      icon: CheckCircle,
      message: 'Connected',
      bgColor: 'bg-green-500',
      textColor: 'text-white',
      showRetry: false
    };
  };

  const status = getStatusConfig();
  const Icon = status.icon;

  // Don't show if everything is working fine and we've already shown success
  if (!showStatus && isOnline && connectionStatus.connected) {
    return null;
  }

  return (
    <AnimatePresence>
      {showStatus && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className={`${status.bgColor} ${status.textColor} px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 min-w-max`}>
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{status.message}</span>
            
            {status.showRetry && (
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="ml-2 text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
                <span>{isRetrying ? 'Retrying...' : 'Retry'}</span>
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConnectionStatus;