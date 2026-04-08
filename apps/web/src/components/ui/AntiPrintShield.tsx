'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  children: React.ReactNode;
  username: string;
}

export function AntiPrintShield({ children, username }: Props) {
  const [isBlurred, setIsBlurred] = useState(false);

  useEffect(() => {
    // Escurece/Desfoca ao perder foco da janela (abrir snip tool)
    const handleBlur = () => setIsBlurred(true);
    const handleFocus = () => setIsBlurred(false);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Deteção agressiva de Combos de Print
      // Windows: PrintScreen, Win+Shift+S (cai no blur direto)
      // Mac: Cmd+Shift+3/4/5
      if (
        e.key === 'PrintScreen' ||
        (e.ctrlKey && e.key === 'p') || // Bloqueia Ctrl+P
        (e.metaKey && e.shiftKey && ['s', '3', '4', '5'].includes(e.key.toLowerCase()))
      ) {
        setIsBlurred(true);
        // O prevent default às vezes não bloqueia o atalho em nível de SO,
        // mas garante que acionemos o state antes da captura.
        e.preventDefault(); 
      }
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      // Opcionalmente sujar o clipboard se a pessoa tentar copiar texto forçadamente.
      if (e.clipboardData) {
        e.clipboardData.setData('text/plain', 'Tentativa de cópia bloqueada pelo Protocolo Efêmero.');
      }
    };

    const handleSelectStart = (e: Event) => e.preventDefault();

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('copy', handleCopy);
    document.addEventListener('selectstart', handleSelectStart);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('copy', handleCopy);
      document.removeEventListener('selectstart', handleSelectStart);
    };
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col flex-1 select-none" style={{ WebkitUserSelect: 'none', userSelect: 'none' }}>
      
      {/* 4. Marca D'água Tiled Persecutória Oculta (Rendeizada atrás das msgs) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 flex flex-wrap justify-center content-center gap-14 opacity-[0.03]">
        {Array.from({ length: 150 }).map((_, i) => (
          <span key={i} className="text-2xl font-black uppercase text-white whitespace-nowrap rotate-[-35deg]">
            {username} - CONFIDENCIAL
          </span>
        ))}
      </div>

      {/* Conteúdo principal (Chat) - Envolve tudo e reage ao blur */}
      <div 
        className={cn(
          "relative w-full h-full flex-1 flex flex-col z-10 transition-all duration-75",
          isBlurred ? "blur-xl grayscale brightness-50 opacity-0 pointer-events-none select-none" : "blur-none opacity-100"
        )}
      >
        {children}
      </div>

      {/* Overlay de Bloqueio Ativo (Quando isBlurred === true) */}
      <AnimatePresence>
        {isBlurred && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-3xl text-white select-none pointer-events-auto"
          >
            <EyeOff size={64} className="mb-6 text-destructive animate-pulse" />
            <h2 className="text-3xl font-black tracking-tight text-destructive uppercase">Acesso Interceptado</h2>
            <p className="text-muted-foreground mt-2 max-w-sm text-center font-medium">
              A janela do chat perdeu o foco ou uma ferramenta de captura foi detectada.
            </p>
            <p className="text-xs text-white/40 mt-8 font-mono bg-white/5 px-4 py-2 rounded-lg border border-white/10">
              Retorne à janela para restaurar a visão.
            </p>
            <div className="mt-auto mb-12 flex items-center space-x-2 text-[10px] text-destructive/50 font-bold uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-destructive animate-ping" />
              <span>Proteção Anti-Snipping Ativa</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
