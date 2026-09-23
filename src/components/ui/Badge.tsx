import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'green' | 'orange' | 'neutral' | 'red';
  size?: 'sm' | 'md';
}

export function Badge({
  className = '',
  variant = 'neutral',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    green:
      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300',
    orange:
      'bg-amber-500/10 text-amber-500 border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-400',
    neutral:
      'bg-muted text-muted-foreground border-border',
    red:
      'bg-red-500/10 text-red-400 border-red-500/20',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted/60 dark:bg-muted/40 ${className}`}
      aria-hidden="true"
    />
  );
}

