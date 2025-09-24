import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  gradient?: boolean;
  glow?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  gradient = false,
  glow = false,
  disabled,
  className = '',
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: gradient 
      ? 'gradient-primary text-white shadow-sm hover:shadow-md focus:ring-primary-500' 
      : 'bg-primary-600 text-white shadow-sm hover:bg-primary-700 hover:shadow-md focus:ring-primary-500',
    secondary: 'bg-white text-neutral-700 border border-neutral-300 shadow-xs hover:bg-neutral-50 hover:border-neutral-400 focus:ring-neutral-500',
    outline: 'border-2 border-primary-500 text-primary-600 bg-transparent hover:bg-primary-500 hover:text-white focus:ring-primary-500',
    ghost: 'text-neutral-600 bg-transparent hover:bg-neutral-100 hover:text-neutral-900 focus:ring-neutral-500',
    danger: 'bg-error-600 text-white shadow-sm hover:bg-error-700 hover:shadow-md focus:ring-error-500'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded-md gap-1.5',
    md: 'px-4 py-2 text-sm rounded-lg gap-2',
    lg: 'px-6 py-3 text-base rounded-lg gap-2',
    xl: 'px-8 py-4 text-lg rounded-xl gap-3'
  };
  
  const glowClasses = glow ? {
    primary: 'shadow-glow-primary',
    secondary: '',
    outline: 'shadow-glow-primary',
    ghost: '',
    danger: 'shadow-glow-accent'
  } : {};
  
  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? 'w-full' : '',
    glow ? glowClasses[variant] : '',
    className
  ].filter(Boolean).join(' ');
  
  const iconSize = {
    sm: 16,
    md: 18,
    lg: 20,
    xl: 24
  };
  
  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={classes}
      disabled={disabled || loading}
    >
      {loading && (
        <Loader2 size={iconSize[size]} className="animate-spin" />
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span style={{ width: iconSize[size], height: iconSize[size] }}>
          {icon}
        </span>
      )}
      
      {children}
      
      {!loading && icon && iconPosition === 'right' && (
        <span style={{ width: iconSize[size], height: iconSize[size] }}>
          {icon}
        </span>
      )}
    </motion.button>
  );
};

export default Button;