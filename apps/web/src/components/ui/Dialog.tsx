'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassCard } from './GlassCard';
import { Button } from './Button';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  hideCloseButton?: boolean;
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  hideCloseButton = false,
}: DialogProps) {
  // Prevent scrolling when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          {/* Dialog Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn('relative w-full max-w-lg mx-auto z-10', className)}
            role="dialog"
            aria-modal="true"
          >
            <GlassCard className="p-0 overflow-hidden rounded-[2rem] flex flex-col max-h-[90vh]">
              {/* Header */}
              {(title || !hideCloseButton) && (
                <div className="flex items-start justify-between p-6 pb-4 md:p-8 md:pb-6 border-b border-white/5">
                  <div className="space-y-1">
                    {title && <h2 className="text-xl md:text-2xl font-bold">{title}</h2>}
                    {description && (
                      <p className="text-sm text-muted-foreground">{description}</p>
                    )}
                  </div>
                  {!hideCloseButton && (
                    <Button
                      variant="ghost"
                      className="h-10 w-10 p-0 rounded-full flex-shrink-0 text-white/50 hover:text-white"
                      onClick={onClose}
                      aria-label="Close dialog"
                    >
                      <X size={20} />
                    </Button>
                  )}
                </div>
              )}

              {/* Body */}
              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div className="p-6 md:p-8 pt-4 md:pt-4 border-t border-white/5 bg-black/20 mt-auto">
                  {footer}
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
