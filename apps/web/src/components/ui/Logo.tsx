import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export function Logo({ className, size = 'md', showText = true }: LogoProps) {
  const sizeClasses = {
    sm: { box: 'w-8 h-8 rounded-lg', text: 'text-xl', icon: 'text-lg' },
    md: { box: 'w-10 h-10 rounded-xl', text: 'text-2xl', icon: 'text-xl' },
    lg: { box: 'w-16 h-16 rounded-2xl', text: 'text-5xl', icon: 'text-3xl' },
    xl: { box: 'w-24 h-24 rounded-3xl', text: 'text-7xl', icon: 'text-5xl' }
  };

  const { box, text, icon } = sizeClasses[size];

  return (
    <div className={cn("flex items-center space-x-3 select-none", className)}>
      <motion.div 
        initial={{ rotate: -15, scale: 0.9 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 10 }}
        className={cn(
          "flex items-center justify-center bg-primary/20 border-2 border-primary/40 shadow-[0_0_20px_rgba(30,144,255,0.3)]",
          box
        )}
      >
        <span className={cn("font-black tracking-tighter text-primary font-mono", icon)}>
          &lt;?
        </span>
      </motion.div>
      {showText && (
        <span className={cn("font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50", text)}>
          Ephmrl
        </span>
      )}
    </div>
  );
}
