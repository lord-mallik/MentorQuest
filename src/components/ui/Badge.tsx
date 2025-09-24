import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  children?: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  dot = false,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const variantClasses = {
    primary: 'bg-primary-100 text-primary-800 border border-primary-200',
    secondary: 'bg-secondary-100 text-secondary-800 border border-secondary-200',
    success: 'bg-accent-100 text-accent-800 border border-accent-200',
    warning: 'bg-warning-100 text-warning-800 border border-warning-200',
    error: 'bg-error-100 text-error-800 border border-error-200',
    neutral: 'bg-neutral-100 text-neutral-800 border border-neutral-200'
  };
  
  const sizeClasses = {
    sm: dot ? 'w-2 h-2' : 'px-2 py-0.5 text-xs gap-1',
    md: dot ? 'w-2.5 h-2.5' : 'px-2.5 py-1 text-xs gap-1.5',
    lg: dot ? 'w-3 h-3' : 'px-3 py-1.5 text-sm gap-2'
  };
  
  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ');
  
  if (dot) {
    return <span className={classes} {...props} />;
  }
  
  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
};

export default Badge;