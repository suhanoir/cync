'use client';

import React, { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showPasswordToggle?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, type = 'text', showPasswordToggle = false, ...props }, ref) => {
    const inputId = id || props.name || Math.random().toString(36).substring(7);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const isPasswordType = type === 'password';
    const effectiveType = isPasswordType && showPasswordToggle
      ? (isPasswordVisible ? 'text' : 'password')
      : type;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-muted-foreground uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            type={effectiveType}
            className={twMerge(
              clsx(
                'w-full px-3.5 py-2 text-sm bg-muted/60 dark:bg-zinc-900 border border-border rounded-lg text-foreground dark:text-zinc-100 placeholder:text-muted-foreground/60 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-cync-green focus:border-cync-green transition-colors caret-foreground',
                isPasswordType && showPasswordToggle && 'pr-10',
                error && 'border-red-500/50 focus:ring-red-500 focus:border-red-500',
                className
              )
            )}
            {...props}
          />
          {isPasswordType && showPasswordToggle && (
            <button
              type="button"
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
              aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
            >
              {isPasswordVisible ? (
                <EyeOff className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Eye className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          )}
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        {helperText && !error && <p className="text-xs text-muted-foreground">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
