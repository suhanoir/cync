import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { QuoteCategory, getQuoteForCategory } from '@/lib/quotes';

interface QuoteBlockProps {
  quote?: string;
  category?: QuoteCategory;
  author?: string;
  variant?: 'inline' | 'banner' | 'minimal';
  className?: string;
}

export function QuoteBlock({
  quote,
  category,
  author,
  variant = 'inline',
  className,
}: QuoteBlockProps) {
  const text = quote || (category ? getQuoteForCategory(category) : 'Stay consistent. Stay connected.');

  if (variant === 'banner') {
    return (
      <div
        className={twMerge(
          clsx(
            'py-4 px-2 my-2 text-center border-y border-border/50 select-none',
            className
          )
        )}
      >
        <p className="font-quote italic text-sm md:text-base text-muted-foreground/80 dark:text-zinc-400 tracking-wide">
          &ldquo;{text}&rdquo;
        </p>
        {author && (
          <span className="block text-[10px] uppercase tracking-widest text-muted-foreground/60 mt-1 font-sans not-italic">
            — {author}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <p
        className={twMerge(
          clsx(
            'font-quote italic text-xs md:text-sm text-muted-foreground/75 dark:text-zinc-400 select-none',
            className
          )
        )}
      >
        &ldquo;{text}&rdquo;
      </p>
    );
  }

  // Default: inline
  return (
    <div className={twMerge(clsx('inline-flex items-center gap-1.5 select-none', className))}>
      <span className="font-quote italic text-xs md:text-sm text-muted-foreground/80 dark:text-zinc-400">
        &ldquo;{text}&rdquo;
      </span>
      {author && (
        <span className="text-[10px] text-muted-foreground/60 not-italic font-sans">
          — {author}
        </span>
      )}
    </div>
  );
}

