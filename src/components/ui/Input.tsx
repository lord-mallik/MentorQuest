import React from 'react';
import { motion } from 'framer-motion';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outline';
  inputSize?: 'sm' | 'md' | 'lg';
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  variant = 'default',
  inputSize = 'md',
  className = '',
}) => {
  const baseClasses = 'input w-full transition-all duration-200';
  
  const variantClasses = {
    default: 'border border-neutral-300 bg-white focus:border-primary-500 focus:ring-primary-500/10',
    filled: 'border-0 bg-neutral-100 focus:bg-white focus:ring-2 focus:ring-primary-500/20',
    outline: 'border-2 border-neutral-200 bg-transparent focus:border-primary-500 focus:ring-0'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm rounded-md',
    md: 'px-4 py-3 text-sm rounded-lg',
    lg: 'px-5 py-4 text-base rounded-xl'
  };
  
  const errorClasses = error 
    ? 'border-error-500 focus:border-error-500 focus:ring-error-500/10' 
    : '';
  
  const inputClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[inputSize],
    leftIcon ? 'pl-10' : '',
    rightIcon ? 'pr-10' : '',
    errorClasses,
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className="space-y-2">
      {label && (
        <label className="label-base text-neutral-700">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
            {leftIcon}
          </div>
        )}
        
        <motion.input
          whileFocus={{ scale: 1.01 }}
          className={inputClasses}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="body-sm text-error-600"
        >
          {error}
        </motion.p>
      )}
      
      {hint && !error && (
        <p className="body-sm text-neutral-500">
          {hint}
        </p>
      )}
    </div>
  );
};

export default Input;