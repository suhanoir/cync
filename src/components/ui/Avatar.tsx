import React from 'react';

interface AvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ name, avatarUrl, size = 'md', className = '' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base font-medium',
    xl: 'w-16 h-16 text-xl font-medium',
  };

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover border border-border shrink-0 ${className}`}
      />
    );
  }

  // Consistent background tint derived from name
  const colors = [
    'bg-emerald-950 text-emerald-300 border-emerald-800/40',
    'bg-zinc-800 text-zinc-200 border-zinc-700/50',
    'bg-slate-800 text-slate-200 border-slate-700/50',
    'bg-neutral-800 text-neutral-200 border-neutral-700/50',
  ];
  const charCode = name ? name.charCodeAt(0) % colors.length : 0;
  const colorClass = colors[charCode];

  return (
    <div
      className={`${sizeClasses[size]} ${colorClass} rounded-full flex items-center justify-center font-medium border shrink-0 select-none ${className}`}
    >
      {initials}
    </div>
  );
}
