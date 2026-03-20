/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView } from 'motion/react';
import { 
  Shield, 
  CheckCircle2, 
  ArrowRight, 
  ChevronDown, 
  Send, 
  Phone, 
  MapPin, 
  Check, 
  Menu, 
  X,
  Lock,
  FileText,
  TrendingUp,
  UserCheck,
  MessageCircle
} from 'lucide-react';

// --- Components ---

const CountUp = ({ end, duration = 2, prefix = '', suffix = '' }: { end: number; duration?: number; prefix?: string; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let startTime: number;
      let animationFrame: number;

      const updateCount = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        setCount(Math.floor(progress * end));
        if (progress < 1) {
          animationFrame = requestAnimationFrame(updateCount);
        }
      };

      animationFrame = requestAnimationFrame(updateCount);
      return () => cancelAnimationFrame(animationFrame);
    }
  }, [isInView, end, duration]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
};

const RevealText = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div
        initial={{ y: "100%" }}
        whileInView={{ y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
};

const MagneticButton = ({ children, className = "", href }: { children: React.ReactNode; className?: string; href?: string }) => {
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    setPosition({ x: x * 0.3, y: y * 0.3 });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const content = (
    <motion.div
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", damping: 15, stiffness: 150, mass: 0.1 }}
    >
      {children}
    </motion.div>
  );

  if (href) {
    return (
      <a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {content}
    </button>
  );
};

const FlipCard = ({ pillar, index }: any) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="perspective-1000 h-[400px] w-full cursor-pointer"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <motion.div
        className="relative w-full h-full preserve-3d transition-all duration-700"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 180 }}
      >
        {/* Front */}
        <div className="absolute inset-0 backface-hidden glass-card p-10 flex flex-col justify-between border-t-2 border-secondary/30">
          <div>
            <span className="text-secondary font-serif text-6xl mb-6 block opacity-20">{pillar.id}</span>
            <h3 className="text-3xl font-serif text-white font-bold mb-4">{pillar.title}</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              {pillar.label}
            </p>
          </div>
          <div className="flex items-center justify-between text-secondary">
            <span className="text-[10px] font-bold uppercase tracking-widest">Pilar Estratégico</span>
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>

        {/* Back */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 glass-card p-10 flex flex-col justify-center border-t-2 border-secondary">
          <h4 className="text-secondary font-serif text-xl mb-6 font-bold">O que entregamos:</h4>
          <ul className="space-y-4 text-white text-sm">
            {pillar.items.map((item: string) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 className="text-secondary w-4 h-4 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
              Foco em Resultado Jurídico
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Início', href: '#home' },
    { name: 'Quem Somos', href: '#about' },
    { name: 'Serviços', href: '#services' },
    { name: 'O Processo', href: '#process' },
    { name: 'FAQ', href: '#faq' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-background/90 backdrop-blur-md border-b border-white/5 h-24' : 'bg-transparent h-28'}`}>
      <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
          <div className="flex items-center">
            <a href="#home" className="flex items-center">
              <img 
                src="/logo.png" 
                alt="AlphaCred" 
                className="h-16 w-auto object-contain"
              />
            </a>
          </div>

        <div className="hidden lg:flex space-x-8 items-center">
          {navLinks.map((link) => (
            <a 
              key={link.name}
              href={link.href}
              className="text-on-surface-variant hover:text-secondary transition-colors font-label text-sm tracking-wide"
            >
              {link.name}
            </a>
          ))}
          <a 
            href="#contact"
            className="gold-gradient text-primary-container px-6 py-2.5 font-bold font-label text-xs uppercase tracking-widest hover:brightness-110 transition-all active:scale-95"
          >
            Falar com Especialista
          </a>
        </div>

        <button 
          className="lg:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden absolute top-full left-0 w-full bg-surface border-b border-white/5 p-6 space-y-4"
          >
            {navLinks.map((link) => (
              <a 
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-on-surface hover:text-secondary transition-colors font-label text-lg"
              >
                {link.name}
              </a>
            ))}
            <a 
              href="#contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block gold-gradient text-primary-container px-6 py-3 text-center font-bold font-label text-sm uppercase tracking-widest"
            >
              Falar com Especialista
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = () => {
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    service: 'Limpa Nome Estratégico'
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setFormData({ name: '', whatsapp: '', service: 'Limpa Nome Estratégico' });
      setTimeout(() => setStatus('idle'), 5000);
    }, 1500);
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center pt-36 pb-20 navy-gradient overflow-hidden">
      <motion.div style={{ y: y1 }} className="absolute inset-0 opacity-20">
        <img 
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070" 
          alt="Corporative background" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </motion.div>
      
      <div className="relative max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        <motion.div 
          style={{ y: y2 }}
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-7"
        >
            <RevealText>
              <span className="text-secondary font-label font-semibold tracking-[0.3em] uppercase text-xs mb-6 block">
                Reabilitação de Crédito
              </span>
            </RevealText>
            <RevealText>
              <h1 className="text-5xl md:text-7xl font-serif text-white font-bold leading-tight mb-8">
                Renove seu <br /> <span className="text-secondary">C</span>rédito
              </h1>
            </RevealText>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-on-surface-variant text-lg md:text-xl max-w-xl mb-10 leading-relaxed font-light"
            >
              Recupere sua capacidade de crédito e volte a ter acesso a financiamentos, empréstimos e cartões com condições especiais.
            </motion.p>
          
          <div className="grid grid-cols-2 gap-6 max-w-md">
            <motion.div 
              whileHover={{ x: 10 }}
              className="flex items-center gap-3 cursor-default"
            >
              <UserCheck className="text-secondary w-5 h-5" />
              <span className="text-sm font-label text-white/80">Compliance Total</span>
            </motion.div>
            <motion.div 
              whileHover={{ x: 10 }}
              className="flex items-center gap-3 cursor-default"
            >
              <Lock className="text-secondary w-5 h-5" />
              <span className="text-sm font-label text-white/80">Sigilo Absoluto</span>
            </motion.div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="lg:col-span-5"
          id="contact"
        >
          <div className="glass-card p-8 lg:p-10 border-t-4 border-secondary shadow-2xl">
            <h3 className="text-2xl font-serif text-white mb-2">Protocolo de Diagnóstico</h3>
            <p className="text-on-surface-variant text-sm mb-8">
              Preencha para receber uma análise preliminar gratuita do seu CPF/CNPJ.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-label uppercase tracking-widest text-secondary font-bold">
                  Nome Completo / Razão Social
                </label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-primary-container/50 border border-white/10 focus:border-secondary text-white p-3.5 outline-none transition-all rounded-sm"
                  placeholder="Digite seu nome"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-label uppercase tracking-widest text-secondary font-bold">
                  WhatsApp
                </label>
                <input 
                  type="tel" 
                  required
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                  className="w-full bg-primary-container/50 border border-white/10 focus:border-secondary text-white p-3.5 outline-none transition-all rounded-sm"
                  placeholder="(00) 00000-0000"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-label uppercase tracking-widest text-secondary font-bold">
                  Serviço Principal
                </label>
                <select 
                  value={formData.service}
                  onChange={(e) => setFormData({...formData, service: e.target.value})}
                  className="w-full bg-primary-container/50 border border-white/10 focus:border-secondary text-white p-3.5 outline-none transition-all rounded-sm appearance-none"
                >
                  <option className="bg-primary-container">Limpa Nome Estratégico</option>
                  <option className="bg-primary-container">Aumento de Rating (Score)</option>
                  <option className="bg-primary-container">Regularização BACEN / SCR</option>
                  <option className="bg-primary-container">Consultoria Empresarial</option>
                </select>
              </div>
              
              <button 
                type="submit"
                disabled={status === 'loading'}
                className="w-full gold-gradient text-primary-container py-4 font-bold tracking-widest uppercase text-sm hover:scale-[1.02] transition-transform flex items-center justify-center gap-3 shadow-lg shadow-secondary/20 disabled:opacity-50"
              >
                {status === 'loading' ? (
                  <div className="w-5 h-5 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
                ) : status === 'success' ? (
                  <>
                    <Check className="w-5 h-5" />
                    Enviado com Sucesso
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Solicitar Diagnóstico
                  </>
                )}
              </button>
            </form>
            <p className="mt-6 text-[10px] text-center text-on-surface-variant uppercase tracking-widest">
              Atendimento disponível em todo o Brasil
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const About = () => {
  return (
    <section id="about" className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <img 
              src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=1000" 
              alt="Financial Analysis" 
              className="w-full rounded-xl shadow-2xl border border-secondary/20"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-6 -right-6 bg-secondary p-6 hidden md:block shadow-xl">
              <p className="text-primary-container font-bold text-4xl font-serif">
                <CountUp end={50} prefix="+R$ " suffix="M" />
              </p>
              <p className="text-primary-container text-xs font-label uppercase font-bold tracking-tighter">
                Em crédito reabilitado
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <RevealText>
              <h2 className="text-4xl font-serif text-white font-bold mb-6 italic">Sobre a AlphaCred</h2>
            </RevealText>
            <p className="text-on-surface-variant text-lg leading-relaxed mb-6">
              Somos uma consultoria especializada em engenharia financeira e reabilitação de crédito de alto impacto. Nosso foco é devolver a indivíduos e empresas a capacidade de operar no mercado com as melhores taxas e condições.
            </p>
            <p className="text-on-surface-variant text-lg leading-relaxed mb-8">
              Através de estratégias jurídicas fundamentadas e acesso técnico aos sistemas bancários, removemos entraves que impedem seu crescimento, focando sempre no resultado prático e na discrição.
            </p>
            
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="text-secondary w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-bold">Autoridade de Mercado</h4>
                  <p className="text-sm text-on-surface-variant">Anos de experiência lidando com as maiores instituições financeiras.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="text-secondary w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-bold">Resultados Tangíveis</h4>
                  <p className="text-sm text-on-surface-variant">Processos acelerados para regularização em tempo recorde.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Pillars = () => {
  const pillars = [
    {
      id: '01',
      title: 'Limpa Nome',
      items: [
        'Retirada por medida liminar',
        'Suspensão de negativações',
        'Regularização estratégica do CPF',
        'Proteção jurídica temporária'
      ],
      label: 'Base da Reconstrução'
    },
    {
      id: '02',
      title: 'Rating Bancário',
      items: [
        'Reposicionamento de score',
        'Melhora de credibilidade no mercado',
        'Aumento da capacidade de crédito',
        'Reestruturação do perfil financeiro'
      ],
      label: 'Fortalecimento de Imagem'
    },
    {
      id: '03',
      title: 'BACEN / SCR',
      items: [
        'Regularização de apontamentos bancários',
        'Organização de registros financeiros',
        'Estruturação para novas operações',
        'Atenuação de restrições nacionais'
      ],
      label: 'Consolidação Institucional'
    }
  ];

  return (
    <section id="services" className="py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <RevealText className="inline-block">
            <h2 className="text-4xl md:text-5xl font-serif text-white font-bold mb-6 italic">Os 3 Pilares Alpha</h2>
          </RevealText>
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: 96 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-1 bg-secondary mx-auto"
          ></motion.div>
        </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pillars.map((pillar, index) => (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <FlipCard pillar={pillar} index={index} />
              </motion.div>
            ))}
          </div>
      </div>
    </section>
  );
};

const Method = () => {
  const steps = [
    {
      num: 1,
      title: 'Análise Crítica',
      desc: 'Avaliamos seu dossiê financeiro completo para identificar gargalos.'
    },
    {
      num: 2,
      title: 'Ação Jurídica',
      desc: 'Entramos com os protocolos necessários para suspender restrições.'
    },
    {
      num: 3,
      title: 'Ajuste de Rating',
      desc: 'Trabalhamos seu perfil interno nos bancos para aumentar o score.'
    },
    {
      num: 4,
      title: 'Liberação',
      desc: 'Pronto! Você retoma seu acesso ao crédito com autoridade total.'
    }
  ];

  return (
    <section id="process" className="py-32 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-6">
        <RevealText className="text-center mb-16">
          <h2 className="text-4xl font-serif text-white font-bold italic">Nosso Método</h2>
        </RevealText>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div 
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="text-center group"
            >
              <div className="relative w-20 h-20 mx-auto mb-6">
                <motion.div 
                  className="absolute inset-0 gold-gradient rounded-full blur-lg opacity-0 group-hover:opacity-50 transition-opacity"
                />
                <div className="relative w-20 h-20 rounded-full gold-gradient flex items-center justify-center text-primary-container font-bold text-2xl shadow-xl">
                  {step.num}
                </div>
              </div>
              <h4 className="text-white font-bold mb-3 group-hover:text-secondary transition-colors">{step.title}</h4>
              <p className="text-sm text-on-surface-variant">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  const testimonials = [
    {
      name: "Ricardo Santos",
      role: "Empresário",
      text: "A AlphaCred transformou minha situação financeira. Em menos de 30 dias, meu score subiu e consegui o financiamento que precisava para minha empresa.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
    },
    {
      name: "Ana Paula Silva",
      role: "Profissional Liberal",
      text: "Atendimento impecável e resultados reais. O sigilo e a transparência me deram a segurança que eu buscava para limpar meu histórico.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
    },
    {
      name: "Marcos Oliveira",
      role: "Diretor Comercial",
      text: "Estratégia jurídica de alto nível. Recomendo a AlphaCred para quem busca reabilitação de crédito com autoridade e eficiência.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150"
    }
  ];

  return (
    <section className="py-32 bg-surface-container-low overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <RevealText className="inline-block">
            <h2 className="text-4xl md:text-5xl font-serif text-white font-bold mb-6 italic">Depoimentos de Elite</h2>
          </RevealText>
          <div className="h-1 w-24 bg-secondary mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-8 relative"
            >
              <div className="flex items-center gap-4 mb-6">
                <img 
                  src={t.image} 
                  alt={t.name} 
                  className="w-16 h-16 rounded-full border-2 border-secondary object-cover"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="text-white font-bold">{t.name}</h4>
                  <p className="text-secondary text-xs uppercase tracking-widest">{t.role}</p>
                </div>
              </div>
              <p className="text-on-surface-variant italic leading-relaxed">
                "{t.text}"
              </p>
              <div className="absolute top-8 right-8 text-secondary opacity-10">
                <Shield className="w-12 h-12" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'O serviço de limpa nome é legalizado?',
      a: 'Sim, utilizamos fundamentos do Código de Defesa do Consumidor e vias administrativas/judiciais para garantir que seus direitos sejam preservados contra cobranças indevidas ou abusivas.'
    },
    {
      q: 'Quanto tempo demora para ver resultados?',
      a: 'Em geral, as primeiras suspensões de negativação ocorrem entre 15 a 30 dias úteis após o início do protocolo jurídico.'
    },
    {
      q: 'Vocês garantem a aprovação de cartões e empréstimos?',
      a: 'Nós garantimos a reabilitação do seu perfil e o aumento do seu Rating. A decisão final de crédito cabe a cada instituição, mas com um perfil Alpha, suas chances são maximizadas drasticamente.'
    }
  ];

  return (
    <section id="faq" className="py-32 bg-background">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-4xl font-serif text-white font-bold mb-16 italic text-center">Perguntas Frequentes</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="glass-card overflow-hidden">
              <button 
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-6 flex justify-between items-center text-left"
              >
                <span className="text-white font-bold">{faq.q}</span>
                <ChevronDown className={`text-secondary transition-transform ${openIndex === index ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 pt-0 text-on-surface-variant text-sm leading-relaxed border-t border-white/5">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-background w-full pt-16 pb-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1">
          <div className="flex items-center gap-2 mb-6">
<img
              src="/logo.png"
              alt="AlphaCred"
              className="h-16 w-auto object-contain"
            />
          </div>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            Referência nacional em inteligência de crédito e reabilitação estratégica de ativos para perfis de alta performance.
          </p>
        </div>
        
        <div>
          <h4 className="text-white font-serif font-bold mb-6">Serviços</h4>
          <ul className="space-y-3">
            <li><a href="#" className="text-on-surface-variant hover:text-white transition-colors text-sm">Limpa Nome Premium</a></li>
            <li><a href="#" className="text-on-surface-variant hover:text-white transition-colors text-sm">Rating Bancário</a></li>
            <li><a href="#" className="text-on-surface-variant hover:text-white transition-colors text-sm">Consultoria BACEN</a></li>
            <li><a href="#" className="text-on-surface-variant hover:text-white transition-colors text-sm">Blindagem de Ativos</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-white font-serif font-bold mb-6">Institucional</h4>
          <ul className="space-y-3">
            <li><a href="#about" className="text-on-surface-variant hover:text-white transition-colors text-sm">Quem Somos</a></li>
            <li><a href="#process" className="text-on-surface-variant hover:text-white transition-colors text-sm">O Processo</a></li>
            <li><a href="#contact" className="text-on-surface-variant hover:text-white transition-colors text-sm">Fale Conosco</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-white font-serif font-bold mb-6">Contato</h4>
          <ul className="space-y-3">
            <li className="text-on-surface-variant text-sm flex items-center gap-2">
              <Phone className="text-secondary w-4 h-4" /> (19) 99351-0227
            </li>
            <li className="text-on-surface-variant text-sm flex items-center gap-2">
              <MapPin className="text-secondary w-4 h-4" /> São Paulo, SP
            </li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/5">
        <p className="text-on-surface-variant text-[10px] text-center uppercase tracking-widest">
          © 2026 AlphaCred Reabilitação de Crédito. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default function App() {
  return (
    <div className="min-h-screen bg-background selection:bg-secondary/30">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Pillars />
        <Method />
        <Testimonials />
        <FAQ />
        
        {/* Final CTA */}
        <section className="py-24 bg-primary-container text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative z-10 max-w-7xl mx-auto px-6"
          >
            <RevealText className="inline-block">
              <h2 className="text-4xl md:text-5xl font-serif text-white font-bold mb-8 italic">
                Pronto para dar o próximo passo?
              </h2>
            </RevealText>
            <p className="text-on-surface-variant text-xl mb-12 max-w-2xl mx-auto">
              Não deixe que o passado financeiro limite o seu futuro. Fale com um consultor agora.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
              <MagneticButton 
                href="#contact"
                className="gold-gradient text-primary-container px-10 py-5 font-bold tracking-widest uppercase text-lg shadow-2xl block"
              >
                Começar Agora
              </MagneticButton>
              <MagneticButton 
                href="https://wa.me/5519993510227"
                className="border border-secondary text-secondary px-10 py-5 font-bold tracking-widest uppercase text-lg hover:bg-secondary/10 transition-colors flex items-center justify-center gap-2 block"
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-6 h-6" />
                  WhatsApp Direto
                </div>
              </MagneticButton>
            </div>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
