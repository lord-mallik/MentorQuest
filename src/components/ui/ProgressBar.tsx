import React from 'react';
import { motion } from 'framer-motion';

export interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'primary',
  showLabel = false,
  label,
  animated = true,
  className = ''
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };
  
  const variantClasses = {
    primary: 'gradient-primary',
    success: 'gradient-accent',
    warning: 'gradient-warm',
    error: 'bg-error-500'
  };
  
  const trackClasses = [
    'progress-bar',
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ');
  
  const fillClasses = [
    'h-full rounded-full transition-all duration-500',
    variantClasses[variant]
  ].join(' ');
  
  return (
    <div className="space-y-2">
      {(showLabel || label) && (
        <div className="flex items-center justify-between">
          <span className="label-sm text-neutral-700">
            {label || 'Progress'}
          </span>
          <span className="label-sm text-neutral-500">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      
      <div className={trackClasses}>
        <motion.div
          className={fillClasses}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ 
            duration: animated ? 0.8 : 0,
            ease: 'easeOut'
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;