import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'glow' | 'destructive';
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: "bg-white/[0.03] backdrop-blur-2xl border-white/10 shadow-2xl",
      glow: "bg-white/[0.05] backdrop-blur-2xl border-primary/20 shadow-[0_0_40px_-15px_rgba(30,144,255,0.2)]", // Assumindo primary como dodgerblue por agora
      destructive: "bg-destructive/[0.03] backdrop-blur-2xl border-destructive/20 shadow-[0_0_40px_-15px_rgba(239,68,68,0.1)]",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-[2.5rem] p-8 transition-all duration-500 border",
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);


GlassCard.displayName = "GlassCard";
