'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { Shield, Zap, Lock, EyeOff, CameraOff, ShieldCheck, FileKey, Trash2, Mail } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { GlassCard } from '@/components/ui/GlassCard';

export default function LandingPage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const features = [
    {
      icon: <ShieldCheck className="text-primary" size={24} />,
      title: 'Criptografia de Ponta-a-Ponta',
      description: 'Nenhuma mensagem passa pelo servidor em texto puro. Suas chaves de acesso são validadas localmente no seu dispositivo.'
    },
    {
      icon: <Trash2 className="text-destructive" size={24} />,
      title: 'Botão de Pânico',
      description: 'Em caso de emergência, destrua a sala instantaneamente. Todos os usuários são ejetados e a memória local apagada.'
    },
    {
      icon: <CameraOff className="text-orange-400" size={24} />,
      title: 'Anti-Print Oculto',
      description: 'Nossa interface camufla o nome do seu usuário quando a tela não está em foco ou há tentativas de capturas.'
    },
    {
      icon: <EyeOff className="text-indigo-400" size={24} />,
      title: 'Sem Banco de Dados de Mensagem',
      description: 'Não gravamos o seu histórico. Uma vez enviada e lida, a mensagem só existe na memória RAM do seu navegador.'
    },
    {
      icon: <Mail className="text-emerald-400" size={24} />,
      title: 'Convites Seguros',
      description: 'O link de acesso expira e tem limite de 3 usos. Enviado diretamente para a caixa de e-mail do seu contato confiancial.'
    },
    {
      icon: <FileKey className="text-yellow-400" size={24} />,
      title: 'Palavra-Passe Local',
      description: 'A sala exige uma senha acordada previamente, bloqueando o acesso mesmo se o link for interceptado.'
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-background">
      <div className="max-w-5xl mx-auto px-6 py-12 md:py-24 space-y-32">
        {/* HERO SECTION */}
        <section className="flex flex-col items-center text-center space-y-12 relative mt-8 md:mt-16">
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-primary/10 blur-[120px] rounded-full -z-10" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-4">
              <Shield size={14} />
              <span>Plataforma Clandestina Segura</span>
            </div>
            <div className="flex justify-center mb-6">
              <Logo size="xl" />
            </div>
            <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Mensagens que desaparecem. <br className="hidden md:block"/>
              Sem rastros, sem histórico, apenas privacidade verdadeira.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-full max-w-sm space-y-4"
          >
            <Link 
              href="/register" 
              className="flex items-center justify-center w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 transition-transform active:scale-[0.98] hover:brightness-110"
            >
              Iniciar Missão
            </Link>
            <Link 
              href="/login" 
              className="flex items-center justify-center w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold backdrop-blur-md transition-transform active:scale-[0.98] hover:bg-white/10"
            >
              Acesso Agente
            </Link>
          </motion.div>

          {/* Mini features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="grid grid-cols-3 gap-6 md:gap-16 pt-8 text-muted-foreground w-full max-w-lg"
          >
            <div className="flex flex-col items-center space-y-2">
              <Zap size={20} />
              <span className="text-[10px] uppercase tracking-widest font-bold">Rápido</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Lock size={20} />
              <span className="text-[10px] uppercase tracking-widest font-bold">Seguro</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <EyeOff size={20} />
              <span className="text-[10px] uppercase tracking-widest font-bold">Privado</span>
            </div>
          </motion.div>
        </section>

        {/* DETAILS / FEATURES SECTION */}
        <section className="space-y-12 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-4"
          >
            <h2 className="text-3xl font-bold">Por que o Ephemeral?</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Projetado do zero com base em arquitetura Zero-Trust, garantindo que o seu chat permaneça invisível para nós e para terceiros.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <GlassCard className="h-full p-6 sm:p-8 space-y-4 hover:bg-white-[0.05] transition-colors border-white/5">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* FOOTER CALL TO ACTION */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="pb-24"
        >
          <GlassCard className="p-8 md:p-12 text-center space-y-6 relative overflow-hidden bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
            <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 scale-150">
              <Shield size={120} />
            </div>
            <h2 className="text-2xl md:text-4xl font-bold max-w-xl mx-auto">Pronto para conversas que não deixam rastros?</h2>
            <div className="pt-4 flex justify-center">
              <Link 
                href="/register" 
                className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-white text-black font-extrabold shadow-xl hover:scale-105 active:scale-95 transition-all w-full sm:w-auto"
              >
                Criar sua primeira Sala Segura
              </Link>
            </div>
          </GlassCard>
        </motion.section>
      </div>
    </div>
  );
}
