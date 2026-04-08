'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full text-left">
        {label && (
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full bg-white/[0.03] border border-white/10 rounded-[1.25rem] p-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all duration-300",
            error && "border-destructive/30 focus:ring-destructive/30 focus:border-destructive/30",
            className
          )}
          {...props}
        />
        {error && <p className="text-destructive text-[10px] font-bold ml-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
