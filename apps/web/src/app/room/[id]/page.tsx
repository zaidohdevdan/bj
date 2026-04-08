'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import api from '@/lib/api';
import socket from '@/lib/socket';
import { encryptMessage, decryptMessage, getKeyFingerprint } from '@/lib/crypto';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Send, ShieldAlert, Lock, LogOut, Loader2, Clock, Trash2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RoomStatus } from '@ephemeral/shared';
import { AntiPrintShield } from '@/components/ui/AntiPrintShield';
import { Dialog } from '@/components/ui/Dialog';
import axios from 'axios';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isMe: boolean;
}

interface Room {
  id: string;
  name: string;
  status: RoomStatus;
  expiresAt: string;
  creatorId: string;
  guestId?: string;
  guestVerifiedAt?: string | null;
}

export default function RoomPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading, login } = useAuth();

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [secret, setSecret] = useState('');

  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Timer & Security State
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpiring, setIsExpiring] = useState(false);
  const [roomSecret, setRoomSecret] = useState<string>(''); // Armazenar o secret localmente para criptografia
  const [isPanicDialogOpen, setIsPanicDialogOpen] = useState(false);
  const [errorDialog, setErrorDialog] = useState<{isOpen: boolean; message: string}>({ isOpen: false, message: '' });

  const performWipeAndClose = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.open('about:blank', '_self');
    window.close();
    setTimeout(() => { window.location.replace('about:blank'); }, 100);
  };

  // Fetch Room & Handle Camouflage
  const fetchRoom = async () => {
    try {
      const res = await api.get(`/rooms/${id}`);
      setRoom(res.data);
      if (res.data.creatorId === user?.userId) {
        // Se for o criador, o secret vem no objeto room (ou deve ser salvo na criação)
        // No nosso caso, o criador inseriu no dashboard.
        // Se precisarmos persistir temporariamente na sessão:
        const savedSecret = localStorage.getItem(`room_secret_${id}`);
        if (savedSecret) {
          const trimmed = savedSecret.trim();
          console.log(`[RoomPage] Loading secret from storage. Length: ${trimmed.length}`);
          setRoomSecret(trimmed);
        }
      }
    } catch (err: unknown) {
      // CAMUFLAGEM: Se erro ou 404
      console.error('Room fetch error:', err);
      // Aqui, apenas fechamos a aba para não deslogar um criador que por erro digitou URL inválida
      window.open('about:blank', '_self');
      window.close();
      setTimeout(() => { window.location.replace('about:blank'); }, 100);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && id) fetchRoom();
    else if (!authLoading && !user) setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user, authLoading]);

  // Socket Connection
  useEffect(() => {
    // CRITICAL: Não conectar se o segredo da sala não estiver carregado.
    // Isso evita processar mensagens com uma chave vazia ou errada durante o carregamento.
    if (!room || !user || !roomSecret || (room.guestId === user.userId && !room.guestVerifiedAt)) return;

    console.log(`[Socket] Connecting with Secret Length: ${roomSecret.length}`);
    socket.connect();

    if (socket.connected) {
      setIsConnected(true);
      socket.emit('join_room', id);
    }

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join_room', id);
    });

    socket.on('receive_message', async (data) => {
      try {
        const finger = await getKeyFingerprint(roomSecret, id as string);
        console.log(`[Socket] Receiving message. Fingerprint: ${finger}`);

        const decrypted = await decryptMessage(data.encryptedData, roomSecret, id as string);
        const msg: Message = {
          id: Math.random().toString(36),
          sender: data.sender,
          content: decrypted,
          timestamp: data.timestamp,
          isMe: false
        };
        setMessages((prev) => [...prev, msg]);
      } catch (err) {
        console.error('Failed to decrypt message:', err);
      }
    });

    const handleCloseTab = () => {
      if (room?.creatorId === user?.userId) {
        localStorage.removeItem(`room_secret_${id}`);
        window.location.href = '/dashboard';
      } else {
        performWipeAndClose();
      }
    };

    socket.on('room_destroyed', handleCloseTab);

    socket.on('room_expiring', () => {
      setIsExpiring(true);
    });

    socket.on('room_error', (err) => {
      console.error(err);
      if (err === 'Room not found' || err.includes('available')) {
         handleCloseTab();
      }
    });

    return () => {
      socket.off('connect');
      socket.off('receive_message');
      socket.off('room_destroyed');
      socket.off('room_error');
      socket.disconnect();
    };
  }, [room, user, id, roomSecret]);

  // Timer Logic
  useEffect(() => {
    if (!room) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const expiresAt = new Date(room.expiresAt).getTime();
      const diff = expiresAt - now;

      if (diff <= 0) {
        setTimeLeft('00:00');
        return;
      }

      const mins = Math.floor(diff / 1000 / 60);
      const secs = Math.floor((diff / 1000) % 60);
      setTimeLeft(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);

      if (diff <= 30000) setIsExpiring(true);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [room]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const onVerifyKey = async () => {
    setIsVerifying(true);
    try {
      const trimmedSecret = secret.trim();
      const res = await api.post(`/rooms/${id}/verify-key`, { secret: trimmedSecret });
      setRoom(res.data);
      setRoomSecret(trimmedSecret); // Salvar secret para decriptação
    } catch (err) {
      console.error('Password verification error:', err);
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setErrorDialog({ isOpen: true, message: err.response.data.error });
      } else {
        setErrorDialog({ isOpen: true, message: 'Chave incorreta, tente novamente.' });
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const onGuestJoin = async () => {
    if (!guestName || !secret) {
      setErrorDialog({ isOpen: true, message: 'Preencha seu nome e a palavra-passe para continuar.' });
      return;
    }
    setIsVerifying(true);
    try {
      const res = await api.post('/auth/guest-join', {
        roomId: id,
        guestName,
        secret
      });
      // Login silencioso (sem redirect)
      login(res.data.token, res.data.user, '');
      const trimmedSecret = secret.trim();
      setRoomSecret(trimmedSecret); // Habilitar criptografia para o convidado
      // O useEffect do user vai disparar o fetchRoom
    } catch (err) {
      console.error('Guest join error:', err);
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setErrorDialog({ isOpen: true, message: err.response.data.error });
      } else {
        setErrorDialog({ isOpen: true, message: 'Dados incorretos. Verifique a palavra-passe e tente novamente.' });
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const onSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !isConnected || !roomSecret) return;

    try {
      const finger = await getKeyFingerprint(roomSecret, id as string);
      console.log(`[Socket] Sending message. Fingerprint: ${finger}`);

      const encrypted = await encryptMessage(newMessage, roomSecret, id as string);

      const messageData = {
        roomId: id as string,
        encryptedData: encrypted
      };

      socket.emit('send_message', messageData);

      const msg: Message = {
        id: Math.random().toString(36),
        sender: user!.username,
        content: newMessage,
        timestamp: new Date().toISOString(),
        isMe: true
      };

      setMessages((prev) => [...prev, msg]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const onPanic = () => {
    localStorage.removeItem(`room_secret_${id}`);
    socket.emit('panic_button', id);
    setIsPanicDialogOpen(false);
  };

  if (loading || authLoading) return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );

  // GUEST LOGIN UI (Se não estiver logado)
  if (!user) {
    return (
      <>
        <div className="flex-1 flex items-center justify-center p-6 bg-background">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
          <GlassCard className="space-y-8 text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <ShieldAlert size={32} />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Acesso à Sessão</h2>
              <p className="text-sm text-muted-foreground">Esta é uma sala protegida. Identifique-se para entrar.</p>
            </div>
            <div className="space-y-4">
              <Input
                placeholder="Seu Nome ou Codinome"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="text-center"
              />
              <Input
                type="password"
                placeholder="Palavra-passe da Sala"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="text-center tracking-widest"
              />
              <Button isLoading={isVerifying} onClick={onGuestJoin} className="w-full">
                Entrar na Sessão
              </Button>
            </div>
              <p className="text-[10px] text-white/20 uppercase font-black tracking-tighter">Conexão Ponto-a-Ponto Criptografada</p>
            </GlassCard>
          </motion.div>
        </div>

        <Dialog
          isOpen={errorDialog.isOpen}
          onClose={() => setErrorDialog({ isOpen: false, message: '' })}
          title={
            <div className="flex items-center space-x-2 text-destructive">
              <AlertTriangle size={24} />
              <span>Falha no Acesso</span>
            </div>
          }
          description={errorDialog.message}
          footer={
            <div className="flex justify-end w-full">
              <Button variant="default" onClick={() => setErrorDialog({ isOpen: false, message: '' })}>
                Tentar Novamente
              </Button>
            </div>
          }
        />
      </>
    );
  }

  // GATEKEEPER UI (Se logado mas não verificado como convidado)
  if (room && room.guestId === user?.userId && !room.guestVerifiedAt) {
    return (
      <>
        <div className="flex-1 flex items-center justify-center p-6 bg-background">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
          <GlassCard className="space-y-8 text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
                <Lock size={32} />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Acesso Restrito</h2>
              <p className="text-sm text-muted-foreground">O remetente protegeu esta sala. Insira a palavra-passe para prosseguir.</p>
            </div>
            <div className="space-y-4">
              <Input
                type="password"
                placeholder="Palavra-passe"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="text-center text-lg tracking-widest"
              />
              <Button isLoading={isVerifying} onClick={onVerifyKey} className="w-full" variant="destructive">
                Desbloquear Sessão
              </Button>
            </div>
            <Button variant="ghost" className="text-xs text-white/20" onClick={performWipeAndClose}>
              Sair
            </Button>
          </GlassCard>
        </motion.div>
      </div>

      <Dialog
        isOpen={errorDialog.isOpen}
        onClose={() => setErrorDialog({ isOpen: false, message: '' })}
        title={
          <div className="flex items-center space-x-2 text-destructive">
            <AlertTriangle size={24} />
            <span>Falha no Acesso</span>
          </div>
        }
        description={errorDialog.message}
        footer={
          <div className="flex justify-end w-full">
            <Button variant="default" onClick={() => setErrorDialog({ isOpen: false, message: '' })}>
              Tentar Novamente
            </Button>
          </div>
        }
      />
      </>
    );
  }

  // CHAT UI
  return (
    <AntiPrintShield username={user.username}>
      <div className="flex-1 flex flex-col bg-background h-screen max-w-2xl mx-auto w-full relative">
      {/* Room Header */}
      <header className="p-4 glass sticky top-0 z-20 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
            <ShieldAlert size={18} />
          </div>
          <div>
            <h3 className="font-bold text-sm truncate max-w-[150px]">{room?.name}</h3>
            <div className="flex items-center space-x-1.5">
              <div className={cn(
                "w-1.5 h-1.5 rounded-full animate-pulse",
                isExpiring ? "bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-primary shadow-[0_0_8px_rgba(30,144,255,0.5)]"
              )} />
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-tight",
                isExpiring ? "text-destructive" : "text-primary"
              )}>
                {isExpiring ? 'Sessão Expirando' : 'Sessão Ativa'}
              </span>
              <span className="text-[10px] text-white/20 font-bold px-1">•</span>
              <span className="text-[10px] font-mono font-bold text-white/40">{timeLeft}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="hidden sm:flex items-center space-x-1 px-2 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 mr-2">
            <ShieldCheck size={12} />
            <span className="text-[9px] font-bold uppercase">E2E Ativo</span>
          </div>
          {room?.creatorId === user?.userId && (
            <Button variant="destructive" className="p-2 h-auto rounded-xl" onClick={() => setIsPanicDialogOpen(true)} title="Botão de Pânico">
              <Trash2 size={18} />
            </Button>
          )}
          <Button variant="ghost" className="p-2 h-auto rounded-xl" onClick={() => {
            localStorage.removeItem(`room_secret_${id}`);
            if (room?.creatorId === user?.userId) {
              router.push('/dashboard');
            } else {
              performWipeAndClose();
            }
          }}>
            <LogOut size={18} className="text-white/40" />
          </Button>
        </div>
      </header>

      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        <div className="flex flex-col items-center mb-8 space-y-3">
          <div className="px-4 py-2 rounded-full glass border-white/5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center space-x-2">
            <Clock size={12} />
            <span>Efêmero: Sem histórico gravado</span>
          </div>
          {isExpiring && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-4 py-2 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-[10px] font-bold uppercase tracking-tighter flex items-center space-x-2"
            >
              <AlertTriangle size={12} className="animate-bounce" />
              <span>Atenção: Sala será destruída em instantes</span>
            </motion.div>
          )}
        </div>

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex flex-col max-w-[85%]",
                msg.isMe ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <div className={cn(
                "flex items-center space-x-2 px-1 mb-1",
                msg.isMe ? "justify-end" : "justify-start"
              )}>
                <span className="text-[10px] font-bold text-white/40">
                  {msg.isMe ? 'Você' : msg.sender}
                </span>
              </div>
              <div className={cn(
                "p-4 rounded-2xl text-sm break-words shadow-xl",
                msg.isMe
                  ? "bg-primary text-primary-foreground rounded-tr-none"
                  : "glass text-white rounded-tl-none border-white/10"
              )}>
                {msg.content}
              </div>
              <span className="text-[10px] mt-1 text-white/20 font-bold px-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <footer className="p-4 glass-card rounded-none rounded-t-3xl border-t border-white/10 pb-8">
        <form onSubmit={onSendMessage} className="flex items-center space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Sua mensagem..."
            className="flex-1"
          />
          <Button
            type="submit"
            className="rounded-2xl w-14 h-14 p-0 shrink-0"
            disabled={!newMessage.trim() || !isConnected}
          >
            <Send size={20} />
          </Button>
        </form>
      </footer>
      </div>

      <Dialog
        isOpen={isPanicDialogOpen}
        onClose={() => setIsPanicDialogOpen(false)}
        title={
          <div className="flex items-center space-x-2 text-destructive">
            <ShieldAlert size={24} />
            <span>Destruir Sala?</span>
          </div>
        }
        description="Esta ação é IMEDIATA e IRREVERSÍVEL. Todos os usuários serão desconectados, os dados em memória apagados e o registro da sala destruído do servidor."
        footer={
          <div className="flex justify-end space-x-3 w-full">
            <Button variant="ghost" onClick={() => setIsPanicDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={onPanic}>Sim, DESTRUIR AGORA</Button>
          </div>
        }
      />

      <Dialog
        isOpen={errorDialog.isOpen}
        onClose={() => setErrorDialog({ isOpen: false, message: '' })}
        title={
          <div className="flex items-center space-x-2 text-destructive">
            <AlertTriangle size={24} />
            <span>Falha no Acesso</span>
          </div>
        }
        description={errorDialog.message}
        footer={
          <div className="flex justify-end w-full">
            <Button variant="default" onClick={() => setErrorDialog({ isOpen: false, message: '' })}>
              Tentar Novamente
            </Button>
          </div>
        }
      />
    </AntiPrintShield>
  );
}
