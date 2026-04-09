'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { ShieldCheck, Activity, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

type Status = 'checking' | 'online' | 'offline' | 'unstable';

export function ServiceStatus() {
  const [status, setStatus] = useState<Status>('checking');
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  const checkStatus = async () => {
    try {
      // Use original axios to avoid interceptors if they cause loop/issues with dashboard logic
      const startTime = Date.now();
      const res = await api.get('/health', { timeout: 5000 });
      const duration = Date.now() - startTime;
      
      if (res.data.status === 'ok') {
        setStatus(duration > 1500 ? 'unstable' : 'online');
      } else {
        setStatus('offline');
      }
    } catch (err) {
      console.error('Service status check failed:', err);
      setStatus('offline');
    } finally {
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const config = {
    checking: {
      color: 'text-slate-400',
      bg: 'bg-slate-400/10',
      border: 'border-slate-400/20',
      icon: <RefreshCw size={14} className="animate-spin" />,
      text: 'Verificando Sistema...'
    },
    online: {
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      border: 'border-emerald-400/20',
      icon: <ShieldCheck size={14} />,
      text: 'Sistema: Operacional'
    },
    unstable: {
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      border: 'border-amber-400/20',
      icon: <Activity size={14} className="animate-pulse" />,
      text: 'Sistema: Instável'
    },
    offline: {
      color: 'text-destructive',
      bg: 'bg-destructive/10',
      border: 'border-destructive/20',
      icon: <AlertCircle size={14} />,
      text: 'Sistema: Offline'
    }
  };

  const current = config[status];

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border backdrop-blur-md transition-all duration-500",
        current.bg,
        current.border,
        current.color
      )}
    >
      <div className="relative flex items-center justify-center">
        {status === 'online' && (
          <span className="absolute inset-0 rounded-full bg-emerald-400/40 animate-ping opacity-75" />
        )}
        {current.icon}
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
        {current.text}
      </span>
      <div className="h-2 w-[1px] bg-current/20 mx-1 hidden sm:block" />
      <span className="text-[9px] font-mono opacity-40 hidden sm:block">
        {lastChecked.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </motion.div>
  );
}
