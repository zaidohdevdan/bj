'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/auth-context';
import api from '@/lib/api';
import { UserPlus, AlertCircle } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import axios from 'axios';

import { RegisterSchema, RegisterDTO } from '@ephemeral/shared';

export default function RegisterPage() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterDTO>({
    resolver: zodResolver(RegisterSchema),
  });

  const onSubmit = async (data: RegisterDTO) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/register', data);
      login(response.data.token, response.data.user);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const backendError = err.response?.data?.error;
        // Se o erro for um objeto (como format() do Zod), extrair mensagem legível
        if (typeof backendError === 'object' && backendError !== null) {
          setError('Erro de validação nos dados enviados.');
        } else {
          setError(backendError || 'Erro ao criar conta. Tente novamente.');
        }
      } else {
        setError('Ocorreu um erro inesperado.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(0,255,255,0.05),transparent)] -z-10" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <GlassCard className="space-y-8">
          <div className="flex flex-col items-center justify-center space-y-4 mb-4">
            <Logo size="lg" />
            <h1 className="text-3xl font-bold tracking-tight">Criar Conta</h1>
            <p className="text-muted-foreground text-sm">Entre para o círculo de privacidade</p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start space-x-3">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Usuário"
              {...register('username')}
              type="text"
              placeholder="ex: agente_007"
              error={errors.username?.message}
            />

            <Input
              label="Senha"
              {...register('password')}
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
            />

            <Input
              label="Confirmar Senha"
              {...register('confirmPassword')}
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
            />

            <Button
              isLoading={isLoading}
              type="submit"
              className="w-full"
              leftIcon={<UserPlus size={20} />}
            >
              Cadastrar
            </Button>
          </form>

          <div className="text-center">
            <Link href="/login" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Já tem uma conta? <span className="font-bold border-b border-primary/20">Fazer Login</span>
            </Link>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
