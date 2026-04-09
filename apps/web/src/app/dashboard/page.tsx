'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { ServiceStatus } from '@/components/ui/ServiceStatus';
import { Input } from '@/components/ui/Input';
import { Plus, LogOut, MessageSquare, Clock, Globe, ShieldAlert, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateRoomSchema, CreateRoomDTO, RoomStatus } from '@ephemeral/shared';
import { Dialog } from '@/components/ui/Dialog';
import { cn } from '@/lib/utils';
import axios from 'axios';

interface RoomListItem {
  id: string;
  name: string;
  status: RoomStatus;
  expiresAt: string;
}

export default function DashboardPage() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [rooms, setRooms] = useState<RoomListItem[]>([]);
  const [fetchingRooms, setFetchingRooms] = useState(true);
  const [creating, setCreating] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);

  // Dialog states
  const [isClearHistoryDialogOpen, setIsClearHistoryDialogOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateRoomDTO>({
    resolver: zodResolver(CreateRoomSchema),
    defaultValues: {
      name: '',
      durationMin: 15,
      receiverEmail: '',
      secret: ''
    }
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchRooms = useCallback(async () => {
    try {
      const res = await api.get('/rooms');
      setRooms(res.data);
    } catch (err: unknown) {
      console.error('Failed to fetch rooms:', err);
    } finally {
      setFetchingRooms(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchRooms();
  }, [user, fetchRooms]);

  const onCreateRoom = async (data: CreateRoomDTO) => {
    setCreating(true);
    try {
      const res = await api.post('/rooms', data);
      const roomId = res.data.id;
      // Salvar secret localmente para criptografia E2E (visto que o servidor não guarda o secret em texto puro)
      localStorage.setItem(`room_secret_${roomId}`, data.secret.trim());
      reset();
      fetchRooms();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error('Failed to create room:', err.response?.data);
      } else {
        console.error('An unexpected error occurred:', err);
      }
      alert('Erro ao criar sala');
    } finally {
      setCreating(false);
    }
  };

  const onClearHistory = async () => {
    setIsClearHistoryDialogOpen(false);
    setClearing(true);
    try {
      await api.delete('/rooms');
      setRooms([]);
    } catch (err: unknown) {
      console.error('Failed to clear history:', err);
      alert('Erro ao limpar histórico');
    } finally {
      setClearing(false);
    }
  };

  const onDeleteRoom = async () => {
    if (!roomToDelete) return;
    const roomId = roomToDelete;
    
    setRoomToDelete(null);
    setDeletingRoomId(roomId);
    try {
      await api.delete(`/rooms/${roomId}`);
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
    } catch (err: unknown) {
      console.error('Failed to delete room:', err);
      alert('Erro ao deletar sala');
    } finally {
      setDeletingRoomId(null);
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="flex-1 flex flex-col p-6 space-y-8 max-w-2xl mx-auto w-full">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold">
            {user.username[0].toUpperCase()}
          </div>
          <div>
            <h2 className="font-bold">Agente {user.username}</h2>
            <div className="flex items-center space-x-2">
              <p className="text-[10px] uppercase tracking-tighter text-muted-foreground font-bold">Protocolo Ativado</p>
              <span className="text-[10px] text-white/10">•</span>
              <ServiceStatus />
            </div>
          </div>
        </div>
        <Button variant="ghost" className="p-2 h-auto rounded-xl" onClick={logout}>
          <LogOut size={18} className="text-white/40 hover:text-destructive transition-colors" />
        </Button>
      </header>

      {/* Create Room Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <GlassCard className="p-6 space-y-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
            <ShieldAlert size={80} />
          </div>
          
          <div className="space-y-1">
            <h3 className="text-lg font-bold">Nova Missão</h3>
            <p className="text-xs text-muted-foreground">Configure os parâmetros da sala efêmera.</p>
          </div>

          <form onSubmit={handleSubmit(onCreateRoom)} className="space-y-4">
            <Input label="Identificador da Sala" placeholder="ex: Operação Alpha" {...register('name')} error={errors.name?.message} />
            
            <div className="grid grid-cols-2 gap-4">
               <Input label="Duração (minutos)" type="number" {...register('durationMin', { valueAsNumber: true })} error={errors.durationMin?.message} />
               <Input label="Palavra-Passe" type="password" placeholder="chave-mestra" {...register('secret')} error={errors.secret?.message} />
            </div>
            
            <Input label="E-mail do Destinatário" type="email" placeholder="contato@exemplo.com" {...register('receiverEmail')} error={errors.receiverEmail?.message} />

            <Button isLoading={creating} type="submit" className="w-full" leftIcon={<Plus size={20} />}>
              Gerar Link Seguro
            </Button>
          </form>
        </GlassCard>
      </motion.div>

      {/* Active Rooms */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center space-x-2">
            <Globe size={14} className="text-primary" />
            <span>Suas Salas Ativas</span>
          </h3>
          {rooms.length > 0 && (
            <Button 
              variant="ghost" 
              className="h-auto py-1 px-2 text-[10px] text-destructive hover:bg-destructive/10"
              onClick={() => setIsClearHistoryDialogOpen(true)}
              isLoading={clearing}
            >
              Limpar Histórico
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {fetchingRooms ? (
            Array(2).fill(0).map((_, i) => <div key={i} className="h-24 glass rounded-2xl animate-pulse" />)
          ) : rooms.length === 0 ? (
            <div className="p-12 text-center glass rounded-3xl border-dashed border-white/10">
              <p className="text-sm text-muted-foreground italic tracking-wide">Nenhuma operação ativa no momento.</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {rooms.map((room) => (
                <motion.div
                  key={room.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="glass-card hover:bg-white/10 transition-all cursor-pointer group"
                  onClick={() => router.push(`/room/${room.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-colors shadow-inner",
                        room.status === 'CONNECTED' ? "bg-primary/20 text-primary border border-primary/20" : "bg-white/5 text-white/20 border border-white/10"
                      )}>
                        <MessageSquare size={20} />
                      </div>
                      <div className="text-left">
                        <h4 className="font-bold group-hover:text-primary transition-colors">{room.name}</h4>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{room.status}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 text-xs font-bold text-white/40">
                        <Clock size={12} />
                        <span>
                          {new Date(room.expiresAt) < new Date() ? 'Expirado' : new Date(room.expiresAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRoomToDelete(room.id);
                        }}
                        disabled={deletingRoomId === room.id}
                        className="ml-1 p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Deletar sala"
                      >
                        {deletingRoomId === room.id ? (
                          <span className="block w-4 h-4 border-2 border-red-400/40 border-t-red-400 rounded-full animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </section>

      {/* Clear History Dialog */}
      <Dialog
        isOpen={isClearHistoryDialogOpen}
        onClose={() => setIsClearHistoryDialogOpen(false)}
        title="Limpar Histórico"
        description="Esta ação é irreversível e todas as suas salas serão apagadas da base de dados."
        footer={
          <div className="flex justify-end space-x-3 w-full">
            <Button variant="ghost" onClick={() => setIsClearHistoryDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={onClearHistory}>Apagar Tudo</Button>
          </div>
        }
      >
      </Dialog>

      {/* Delete Room Dialog */}
      <Dialog
        isOpen={!!roomToDelete}
        onClose={() => setRoomToDelete(null)}
        title="Apagar Sala"
        description="Tem certeza de que deseja apagar esta sala permanentemente? Essa ação não pode ser desfeita."
        footer={
          <div className="flex justify-end space-x-3 w-full">
            <Button variant="ghost" onClick={() => setRoomToDelete(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={onDeleteRoom}>Apagar Sala</Button>
          </div>
        }
      >
      </Dialog>
    </div>
  );
}
