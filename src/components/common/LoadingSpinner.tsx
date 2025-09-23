import React from 'react';
import { motion } from 'framer-motion';


interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  fullScreen?: boolean;
  variant?: 'default' | 'brain' | 'dots' | 'pulse';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  message = 'Loading...', 
  fullScreen = false,
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const containerClasses = fullScreen 
    ? 'min-h-screen flex items-center justify-center bg-gray-50'
    : 'flex items-center justify-center p-8';

  const renderSpinner = () => {
    switch (variant) {
      case 'brain':
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className={`${sizeClasses[size]} bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center`}
          >
            <Brain className={`${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-8 h-8'} text-white`} />
          </motion.div>
        );
      
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
                className={`${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-5 h-5'} bg-primary-500 rounded-full`}
              />
            ))}
          </div>
        );
      
      case 'pulse':
        return (
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={`${sizeClasses[size]} bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center`}
          >
            <Brain className={`${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-8 h-8'} text-white`} />
          </motion.div>
        );
      
      default:
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className={`${sizeClasses[size]} border-2 border-primary-200 border-t-primary-600 rounded-full`}
          />
        );
    }
  };

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className="flex justify-center mb-4">
          {renderSpinner()}
        </div>
        
        {message && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <p className={`text-gray-600 font-medium ${textSizes[size]}`}>
              {message}
            </p>
            
            {fullScreen && (
              <p className="text-sm text-gray-500">
                This may take a few moments...
              </p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Skeleton loader component for content loading
export const SkeletonLoader: React.FC<{ 
  lines?: number; 
  className?: string;
  variant?: 'text' | 'card' | 'avatar' | 'button';
}> = ({ 
  lines = 3, 
  className = '', 
  variant = 'text' 
}) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className={`animate-pulse ${className}`}>
            <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
            <div className="space-y-2">
              <div className="bg-gray-200 rounded h-4 w-3/4"></div>
              <div className="bg-gray-200 rounded h-4 w-1/2"></div>
            </div>
          </div>
        );
      
      case 'avatar':
        return (
          <div className={`animate-pulse flex items-center space-x-3 ${className}`}>
            <div className="bg-gray-200 rounded-full h-10 w-10"></div>
            <div className="space-y-2 flex-1">
              <div className="bg-gray-200 rounded h-4 w-1/2"></div>
              <div className="bg-gray-200 rounded h-3 w-1/3"></div>
            </div>
          </div>
        );
      
      case 'button':
        return (
          <div className={`animate-pulse bg-gray-200 rounded-lg h-10 w-24 ${className}`}></div>
        );
      
      default:
        return (
          <div className={`animate-pulse space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
              <div 
                key={i}
                className={`bg-gray-200 rounded h-4 ${
                  i === lines - 1 ? 'w-2/3' : 'w-full'
                }`}
              ></div>
            ))}
          </div>
        );
    }
  };

  return renderSkeleton();
};

export default LoadingSpinner;