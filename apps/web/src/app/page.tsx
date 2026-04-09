'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { Shield, Zap, Lock, EyeOff, CameraOff, ShieldCheck, FileKey, Trash2, Mail, ChevronRight } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { GlassCard } from '@/components/ui/GlassCard';
import { ServiceStatus } from '@/components/ui/ServiceStatus';

export default function LandingPage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } }
  };

  const features = [
    {
      icon: <ShieldCheck className="text-blue-400" size={26} />,
      title: 'Criptografia de Ponta-a-Ponta',
      description: 'Nenhuma mensagem passa pelo servidor em texto puro. Suas chaves de acesso são validadas localmente no seu dispositivo.'
    },
    {
      icon: <Trash2 className="text-red-400" size={26} />,
      title: 'Botão de Pânico',
      description: 'Em caso de emergência, destrua a sala instantaneamente. Todos os usuários são ejetados e a memória local apagada.'
    },
    {
      icon: <CameraOff className="text-amber-400" size={26} />,
      title: 'Anti-Print Oculto',
      description: 'Nossa interface camufla o nome do seu usuário quando a tela não está em foco ou há tentativas de capturas.'
    },
    {
      icon: <EyeOff className="text-indigo-400" size={26} />,
      title: 'Sem Banco de Dados',
      description: 'Não gravamos o seu histórico. Uma vez enviada e lida, a mensagem só existe na memória RAM do seu navegador.'
    },
    {
      icon: <Mail className="text-emerald-400" size={26} />,
      title: 'Convites Seguros',
      description: 'O link de acesso expira e tem limite estrito de usos. Enviado diretamente para a caixa de e-mail do seu contato.'
    },
    {
      icon: <FileKey className="text-fuchsia-400" size={26} />,
      title: 'Palavra-Passe Local',
      description: 'A sala exige uma senha acordada previamente, bloqueando invasores mesmo se o link for interceptado.'
    }
  ];

  return (
    <div className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar bg-[#020617] relative selection:bg-primary/30">
      
      {/* ANIMATED BACKGROUND MESH */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] bg-primary/20 blur-[150px] rounded-full mix-blend-screen"
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[40%] -right-[10%] w-[40vw] h-[40vw] bg-indigo-500/20 blur-[150px] rounded-full mix-blend-screen"
        />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 md:py-24 space-y-32 relative z-10">
        
        {/* HERO SECTION */}
        <section className="flex flex-col items-center text-center space-y-10 relative mt-10 md:mt-20">
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-white/5 bg-white/5 backdrop-blur-xl shadow-2xl mb-4"
          >
            <ServiceStatus />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            className="flex justify-center mb-2"
          >
            <Logo size="xl" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-6"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/50">
              Comunicação Impossível<br className="hidden md:block" /> de ser Rastreada.
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
              Salas efêmeras, senhas locais e destruição instantânea. O único chat criado sob os preceitos absolutos de arquitetura Zero-Trust.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="w-full max-w-md flex flex-col sm:flex-row gap-4 pt-6"
          >
            <Link
              href="/register"
              className="group flex-1 flex items-center justify-center space-x-2 py-4 rounded-2xl bg-primary hover:bg-blue-500 text-white font-bold shadow-[0_0_30px_rgba(30,144,255,0.3)] hover:shadow-[0_0_40px_rgba(30,144,255,0.5)] transition-all active:scale-95"
            >
              <span>Cadastre-se</span>
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="flex-1 flex items-center justify-center py-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-white font-semibold backdrop-blur-md transition-all active:scale-95"
            >
              Acesse sua conta
            </Link>
          </motion.div>

          {/* Mini features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="grid grid-cols-3 gap-8 md:gap-24 pt-12 text-slate-500 w-full max-w-2xl"
          >
            <div className="flex flex-col items-center space-y-3 group hover:text-white transition-colors cursor-default">
              <Zap size={24} className="group-hover:text-amber-400 transition-colors" />
              <span className="text-[11px] uppercase tracking-[0.2em] font-bold">Instantanêo</span>
            </div>
            <div className="flex flex-col items-center space-y-3 group hover:text-white transition-colors cursor-default">
              <Lock size={24} className="group-hover:text-emerald-400 transition-colors" />
              <span className="text-[11px] uppercase tracking-[0.2em] font-bold">Blindado</span>
            </div>
            <div className="flex flex-col items-center space-y-3 group hover:text-white transition-colors cursor-default">
              <EyeOff size={24} className="group-hover:text-indigo-400 transition-colors" />
              <span className="text-[11px] uppercase tracking-[0.2em] font-bold">Invisível</span>
            </div>
          </motion.div>
        </section>

        {/* DETAILS / FEATURES SECTION */}
        <section className="space-y-16 pb-10 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[300px] bg-slate-800/20 blur-[120px] rounded-full -z-10" />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center space-y-6"
          >
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Arquitetura de Guerra</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-lg font-light">
              Projetado sob a premissa de que até mesmo os nossos servidores estão comprometidos. Confiança Zero.
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
                <GlassCard className="h-full p-8 space-y-5 hover:bg-white/[0.04] hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 border-white/[0.05] group">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800/50 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-inner">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-slate-100">{feature.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed font-light">
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
          viewport={{ once: true, margin: "-50px" }}
          className="pb-24"
        >
          <GlassCard className="p-10 md:p-16 text-center space-y-8 relative overflow-hidden bg-gradient-to-br from-primary/10 via-transparent to-transparent border-primary/20 backdrop-blur-2xl">
            <div className="absolute -top-10 -right-10 p-8 opacity-[0.03] rotate-12 scale-150 pointer-events-none">
              <Shield size={250} />
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            
            <h2 className="text-3xl md:text-5xl font-extrabold max-w-2xl mx-auto tracking-tight relative z-10 text-white">
              Converse <br className="hidden md:block"/> com privacidade real.
            </h2>
            <div className="pt-6 flex justify-center relative z-10">
              <Link
                href="/register"
                className="group inline-flex items-center justify-center px-10 py-5 rounded-2xl bg-white text-black font-extrabold shadow-xl hover:scale-105 active:scale-95 transition-all w-full sm:w-auto"
              >
                Cadastre-se
                <ShieldCheck size={20} className="ml-3 group-hover:text-primary transition-colors" />
              </Link>
            </div>
          </GlassCard>
        </motion.section>
      </div>
    </div>
  );
}
