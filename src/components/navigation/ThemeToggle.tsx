'use client';

import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../providers/ThemeProvider';

export function ThemeToggle({ collapsed = false }: { collapsed?: boolean }) {
  const { theme, setTheme } = useTheme();

  return (
    <div className={`flex items-center gap-1 p-1 bg-muted/60 rounded-lg border border-border ${collapsed ? 'w-auto' : 'w-full justify-between'}`}>
      <button
        onClick={() => setTheme('light')}
        title="Light theme"
        className={`p-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 flex-1 justify-center ${
          theme === 'light'
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Sun className="w-3.5 h-3.5" />
        {!collapsed && <span>Light</span>}
      </button>

      <button
        onClick={() => setTheme('dark')}
        title="Dark theme"
        className={`p-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 flex-1 justify-center ${
          theme === 'dark'
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Moon className="w-3.5 h-3.5" />
        {!collapsed && <span>Dark</span>}
      </button>

      <button
        onClick={() => setTheme('system')}
        title="System preference"
        className={`p-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 flex-1 justify-center ${
          theme === 'system'
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Monitor className="w-3.5 h-3.5" />
        {!collapsed && <span>Auto</span>}
      </button>
    </div>
  );
}
