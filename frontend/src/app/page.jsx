"use client";
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  MessageSquareText,
  ScanSearch,
  ScrollText,
  Sparkles,
  Zap,
  BookOpen,
  Eye,
  Upload,
  FileText,
} from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

/* ─── Story data ─── */
const storyChapters = [
  {
    kicker: 'Chapter 01',
    title: 'Upload study images and get a structured breakdown.',
    text: 'SnapStudy analyzes diagrams, handwritten notes, whiteboards, charts, and textbook screenshots, then returns an organized explanation with context, practical uses, and learning advice.',
    icon: <ScanSearch size={22} />,
    gradient: 'from-sky-400 to-cyan-300',
    accentColor: '#38bdf8',
  },
  {
    kicker: 'Chapter 02',
    title: 'Keep learning in a tutor chat that remembers the session.',
    text: 'After analysis, you can ask follow-up questions in the dashboard so the assistant explains, simplifies, and expands on the same material instead of starting fresh each time.',
    icon: <Brain size={22} />,
    gradient: 'from-violet-400 to-purple-300',
    accentColor: '#818cf8',
  },
  {
    kicker: 'Chapter 03',
    title: 'Generate notes, edit them, and revisit them later.',
    text: 'Create AI notes from an analysis, upload your own PDF or text files into the notes workspace, and use the assistant to rewrite, shorten, expand, or reorganize the note content.',
    icon: <MessageSquareText size={22} />,
    gradient: 'from-blue-400 to-indigo-300',
    accentColor: '#60a5fa',
  },
];

const stats = [
  { value: 'AI', label: 'Powered Analysis', icon: <Zap size={18} /> },
  { value: '∞', label: 'Study Sessions', icon: <BookOpen size={18} /> },
  { value: '360°', label: 'Visual Insight', icon: <Eye size={18} /> },
];

/* ─── Floating particles ─── */
function FloatingParticles() {
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 10,
    opacity: Math.random() * 0.4 + 0.1,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden" aria-hidden>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-sky-300"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -80, 0],
            x: [0, Math.random() * 40 - 20, 0],
            opacity: [p.opacity, p.opacity * 0.3, p.opacity],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

/* ─── Animated grid overlay ─── */
function GridOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden>
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: [0.02, 0.04, 0.02] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          backgroundImage: `
            linear-gradient(rgba(148,210,255,0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148,210,255,0.4) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(148,210,255,0.6) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148,210,255,0.6) 1px, transparent 1px)
          `,
          backgroundSize: '15px 15px',
        }}
      />
    </div>
  );
}

/* ─── Grain texture overlay ─── */
function GrainOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[60] opacity-[0.025] mix-blend-overlay"
      aria-hidden
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '128px 128px',
      }}
    />
  );
}

/* ─── Shimmer button ─── */
function ShimmerButton({ children, href, variant = 'primary', className = '' }) {
  return (
    <Link
      href={href}
      className={`group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full text-base font-black transition-all duration-300 ${
        variant === 'primary'
          ? 'bg-gradient-to-r from-white via-slate-50 to-white px-8 py-4 text-slate-950 shadow-[0_0_40px_rgba(255,255,255,0.15),0_20px_50px_rgba(0,0,0,0.3)] hover:-translate-y-1 hover:shadow-[0_0_60px_rgba(255,255,255,0.2),0_30px_60px_rgba(0,0,0,0.4)]'
          : 'border border-white/15 bg-white/[0.06] px-8 py-4 text-white backdrop-blur-2xl hover:bg-white/[0.12] hover:border-white/25'
      } ${className}`}
    >
      {variant === 'primary' && (
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      )}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </Link>
  );
}

/* ─── Animated typing cursor for hero ─── */
function TypewriterBadge() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const interval = setInterval(() => setVisible((v) => !v), 530);
    return () => clearInterval(interval);
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="inline-flex items-center gap-2.5 rounded-full border border-sky-300/20 bg-sky-400/[0.08] px-4 py-2 shadow-[0_0_20px_rgba(56,189,248,0.1)]"
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
        <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-300"></span>
      </span>
      <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-sky-200">
        AI Study Workspace
      </span>
      <span
        className="ml-0.5 inline-block h-3 w-0.5 bg-sky-300/70 transition-opacity duration-100"
        style={{ opacity: visible ? 1 : 0 }}
      />
    </motion.div>
  );
}

/* ─── Feature pill card ─── */
function FeatureCard({ title, text, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="group relative rounded-[1.6rem] border border-white/[0.08] bg-white/[0.04] p-6 backdrop-blur-2xl transition-colors duration-500 hover:border-white/[0.16] hover:bg-white/[0.08] hover:shadow-[0_8px_40px_rgba(56,189,248,0.08)]"
    >
      <div className="absolute inset-0 rounded-[1.6rem] bg-gradient-to-br from-sky-400/[0.04] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <p className="relative text-[13px] font-bold tracking-wide text-white">{title}</p>
      <p className="relative mt-2.5 text-[13px] font-medium leading-[1.7] text-slate-400">{text}</p>
    </motion.div>
  );
}

/* ─── Animated orbit ring ─── */
function OrbitRing({ radius, duration, color, size = 6, delay = 0 }) {
  return (
    <motion.div
      className="pointer-events-none absolute"
      style={{
        width: radius * 2,
        height: radius * 2,
        top: '50%',
        left: '50%',
        marginLeft: -radius,
        marginTop: -radius,
        borderRadius: '50%',
        border: `1px solid ${color}20`,
      }}
      animate={{ rotate: 360 }}
      transition={{ duration, repeat: Infinity, ease: 'linear', delay }}
    >
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          background: color,
          top: -size / 2,
          left: '50%',
          marginLeft: -size / 2,
          boxShadow: `0 0 8px ${color}`,
        }}
      />
    </motion.div>
  );
}

/* ─── Animated step counter ─── */
function AnimatedCounter({ target, suffix = '', prefix = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const isSymbol = isNaN(Number(target));
    if (isSymbol) return;
    let start = 0;
    const end = parseInt(target);
    const duration = 1200;
    const stepTime = Math.abs(Math.floor(duration / end));
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, stepTime);
    return () => clearInterval(timer);
  }, [isInView, target]);

  const isSymbol = isNaN(Number(target));
  return <span ref={ref}>{prefix}{isSymbol ? target : count}{suffix}</span>;
}

/* ─── Scan line animation for hero card ─── */
function ScanLine() {
  return (
    <motion.div
      className="pointer-events-none absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-sky-400/60 to-transparent"
      animate={{ top: ['10%', '90%', '10%'] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

/* ─── Main Landing Page ─── */
export default function Landing() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.96]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x: nx, y: ny });
      mouseX.set(nx);
      mouseY.set(ny);
    };
    const handleScroll = () => setHasScrolled(window.scrollY > 80);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  /* stagger variants */
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94] } },
  };

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden bg-[#07101d] text-white">
      {/* ── Ambient background layers ── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,16,29,0.15)_0%,rgba(7,16,29,0.5)_35%,rgba(7,16,29,0.92)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,rgba(56,189,248,0.18),transparent_50%)]" />

        {/* Parallax blobs */}
        <motion.div
          className="absolute left-[-15%] top-[5%] h-[36rem] w-[36rem] rounded-full blur-[120px]"
          style={{
            background: 'radial-gradient(circle, rgba(56,189,248,0.14), transparent 70%)',
            x: useTransform(springX, [-1, 1], [-20, 20]),
            y: useTransform(springY, [-1, 1], [-12, 12]),
          }}
        />
        <motion.div
          className="absolute right-[-12%] top-[18%] h-[32rem] w-[32rem] rounded-full blur-[120px]"
          style={{
            background: 'radial-gradient(circle, rgba(129,140,248,0.12), transparent 70%)',
            x: useTransform(springX, [-1, 1], [16, -16]),
            y: useTransform(springY, [-1, 1], [-10, 10]),
          }}
        />
        <motion.div
          className="absolute bottom-[-20%] left-[25%] h-[30rem] w-[30rem] rounded-full bg-cyan-300/[0.06] blur-[120px]"
          animate={{ scale: [1, 1.08, 1], opacity: [0.06, 0.1, 0.06] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute bottom-[10%] right-[10%] h-[20rem] w-[20rem] rounded-full bg-violet-400/[0.05] blur-[100px]" />
      </div>

      <GridOverlay />
      <FloatingParticles />
      <GrainOverlay />

      {/* ── Navigation ── */}
      <nav className="fixed inset-x-0 top-0 z-50 px-6 py-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.04] px-5 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.3)] backdrop-blur-2xl"
          style={{
            borderColor: hasScrolled ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.08)',
            background: hasScrolled ? 'rgba(7,16,29,0.7)' : 'rgba(255,255,255,0.04)',
            transition: 'all 0.4s ease',
          }}
        >
          <Link href="/" className="inline-flex">
            <BrandLogo size="md" className="[&_*]:text-white" />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-300 transition-all duration-300 hover:bg-white/[0.06] hover:text-white"
            >
              Log In
            </Link>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/signup"
                className="relative overflow-hidden rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 px-6 py-2.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(56,189,248,0.5)]"
              >
                <motion.span
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />
                Start Free
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative z-10 px-6 pt-28 pb-12">
        <motion.div style={{ opacity: heroOpacity, scale: heroScale }}>
          <div className="mx-auto grid min-h-[90vh] max-w-7xl items-center gap-12 lg:grid-cols-[1.08fr_0.92fr]">
            {/* Left hero content */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Badge */}
              <motion.div variants={itemVariants}>
                <TypewriterBadge />
              </motion.div>

              {/* Heading */}
              <motion.h1 variants={itemVariants} className="mt-8 max-w-[640px]">
                <span className="block text-[3.4rem] font-black leading-[1.04] tracking-tight text-white sm:text-[4rem] lg:text-[4.6rem]">
                  Turn study images
                </span>
                <motion.span
                  className="mt-1 block bg-gradient-to-r from-sky-300 via-cyan-200 to-blue-400 bg-clip-text text-[3.4rem] font-black leading-[1.04] tracking-tight text-transparent sm:text-[4rem] lg:text-[4.6rem]"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ backgroundSize: '200% 200%' }}
                >
                  into knowledge.
                </motion.span>
              </motion.h1>

              {/* Description */}
              <motion.p
                variants={itemVariants}
                className="mt-7 max-w-xl text-[17px] font-medium leading-[1.8] text-slate-400"
              >
                Upload diagrams, handwritten notes, textbook pages, and documents — get structured analysis,
                tutor-led conversations, and editable notes you can revisit anytime.
              </motion.p>

              {/* CTA buttons */}
              <motion.div
                variants={itemVariants}
                className="mt-10 flex flex-col gap-4 sm:flex-row"
              >
                <ShimmerButton href="/signup" variant="primary">
                  Start Studying <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                </ShimmerButton>
                <ShimmerButton href="/login" variant="secondary">
                  Open Workspace
                </ShimmerButton>
              </motion.div>

              {/* Stats row */}
              <motion.div
                variants={itemVariants}
                className="mt-12 flex items-center gap-8"
              >
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    className="flex items-center gap-3"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <motion.div
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-sky-300"
                      whileHover={{ borderColor: 'rgba(56,189,248,0.3)', backgroundColor: 'rgba(56,189,248,0.08)' }}
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4 + i, repeat: Infinity, delay: i * 1.2 }}
                    >
                      {stat.icon}
                    </motion.div>
                    <div>
                      <p className="text-lg font-black text-white">{stat.value}</p>
                      <p className="text-[11px] font-medium tracking-wide text-slate-500">{stat.label}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right product card */}
            <motion.div
              initial={{ opacity: 0, x: 40, rotateY: -5 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 0.9, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative"
              whileHover={{ y: -6 }}
            >
              {/* Orbit rings behind card */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <OrbitRing radius={200} duration={18} color="#38bdf8" size={5} />
                <OrbitRing radius={260} duration={28} color="#818cf8" size={4} delay={5} />
                <OrbitRing radius={320} duration={38} color="#60a5fa" size={3} delay={10} />
              </div>

              {/* Glow behind card */}
              <motion.div
                className="absolute -inset-4 rounded-[3rem] bg-gradient-to-br from-sky-400/[0.08] via-transparent to-violet-400/[0.06] blur-xl"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 4, repeat: Infinity }}
              />

              <div className="relative rounded-[2rem] border border-white/[0.08] bg-white/[0.05] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
                <div className="relative overflow-hidden rounded-[1.6rem] border border-white/[0.08] bg-gradient-to-b from-[rgba(8,18,38,0.96)] via-[rgba(12,30,65,0.94)] to-[rgba(16,50,110,0.9)] p-6">
                  {/* Scan line */}
                  <ScanLine />

                  {/* Card header */}
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-sky-300/80">Product Overview</p>
                      <h3 className="mt-2 text-xl font-black tracking-tight text-white">
                        What SnapStudy does
                      </h3>
                    </div>
                    <motion.div
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    >
                      <BrandLogo size="sm" withWordmark={false} />
                    </motion.div>
                  </div>

                  <div className="mt-5 grid gap-3.5">
                    {/* Flow card */}
                    <motion.div
                      className="group rounded-[1.3rem] border border-white/[0.06] bg-white/[0.04] p-5 transition-all duration-300 hover:border-sky-400/20 hover:bg-white/[0.07]"
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex items-center gap-2">
                        <motion.div
                          className="h-1.5 w-1.5 rounded-full bg-sky-400"
                          animate={{ scale: [1, 1.6, 1], opacity: [1, 0.5, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-sky-300/70">Study Session Flow</p>
                      </div>
                      <p className="mt-3 text-[13px] leading-[1.7] text-slate-300">
                        One upload creates a saved study session with image analysis, contextual tutor chat, and a direct path into AI-generated notes.
                      </p>
                    </motion.div>

                    {/* Two-column grid */}
                    <div className="grid gap-3.5 md:grid-cols-2">
                      {[
                        { dot: 'bg-violet-400', dotColor: '#818cf8', label: 'Image to Insight', labelColor: 'text-violet-300/70', border: 'hover:border-violet-400/20', text: 'Upload lecture notes, textbook pages, diagrams, or whiteboard photos.\nGet structured analysis in seconds.' },
                        { dot: 'bg-blue-400', dotColor: '#60a5fa', label: 'Editable Notes', labelColor: 'text-blue-300/70', border: 'hover:border-blue-400/20', text: 'Generate notes from analysis.\nUpload PDF, TXT, or MD files.\nRewrite with AI assistance.' },
                      ].map((item, i) => (
                        <motion.div
                          key={item.label}
                          className={`group rounded-[1.3rem] border border-white/[0.06] bg-white/[0.04] p-5 transition-all duration-300 hover:bg-white/[0.07] ${item.border}`}
                          whileHover={{ scale: 1.02, y: -2 }}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8 + i * 0.1 }}
                        >
                          <div className="flex items-center gap-2">
                            <motion.div
                              className={`h-1.5 w-1.5 rounded-full ${item.dot}`}
                              animate={{ scale: [1, 1.6, 1] }}
                              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.5 }}
                            />
                            <p className={`text-[10px] font-bold uppercase tracking-[0.25em] ${item.labelColor}`}>{item.label}</p>
                          </div>
                          <p className="mt-3 text-[13px] leading-[1.7] text-slate-300 whitespace-pre-line">{item.text}</p>
                        </motion.div>
                      ))}
                    </div>

                    {/* Core features */}
                    <motion.div
                      className="rounded-[1.3rem] border border-white/[0.06] bg-white/[0.04] p-5"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.0 }}
                    >
                      <div className="flex items-center gap-2">
                        <motion.div
                          className="h-1.5 w-1.5 rounded-full bg-cyan-400"
                          animate={{ scale: [1, 1.6, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                        />
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-300/70">Core Features</p>
                      </div>
                      <div className="mt-3 grid gap-2.5 md:grid-cols-3">
                        {[
                          { label: 'Dashboard', desc: 'Analyze & chat' },
                          { label: 'Library', desc: 'Past sessions' },
                          { label: 'Workspace', desc: 'Save & edit' },
                        ].map((item, i) => (
                          <motion.div
                            key={item.label}
                            className="rounded-xl bg-white/[0.04] px-4 py-3 transition-all duration-300 hover:bg-white/[0.08]"
                            whileHover={{ scale: 1.04, y: -2 }}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1.1 + i * 0.1 }}
                          >
                            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-sky-300/60">{item.label}</p>
                            <p className="mt-1.5 text-[12px] font-medium text-slate-300">{item.desc}</p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── Feature cards below hero ── */}
      <section className="relative z-10 px-6 pb-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ['Image Analysis', 'Upload a study image and get object detection, explanation, context, uses, and smart learning advice.'],
              ['Tutor Chat', 'Ask follow-up questions against the saved image session instead of starting from scratch every time.'],
              ['Notes Workspace', 'Generate AI notes, upload source material, and edit saved notes with the assistant.'],
            ].map(([title, text], i) => (
              <FeatureCard key={title} title={title} text={text} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <motion.div
          className="h-px"
          style={{
            background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent)',
          }}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        />
      </div>

      {/* ── How it works ── */}
      <section className="relative z-10 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          {/* Section header */}
          <div className="mb-16 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2"
            >
              <ScrollText size={14} className="text-sky-300" />
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-300">How it works</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mt-6"
            >
              <span className="block text-[2.8rem] font-black leading-[1.1] tracking-tight text-white sm:text-5xl">
                Built for studying,
              </span>
              <span className="mt-1 block bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text text-[2.8rem] font-black leading-[1.1] tracking-tight text-transparent sm:text-5xl">
                not just AI answers.
              </span>
            </motion.h2>
          </div>

          {/* Chapters */}
          <div className="space-y-6">
            {storyChapters.map((chapter, index) => (
              <motion.div
                key={chapter.kicker}
                initial={{ opacity: 0, x: index % 2 === 0 ? -32 : 32 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.65, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                whileHover={{ scale: 1.01, y: -3 }}
                className="group relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.04] shadow-[0_24px_80px_rgba(0,0,0,0.2)] backdrop-blur-2xl transition-colors duration-500 hover:border-white/[0.14] hover:bg-white/[0.06]"
              >
                {/* Animated accent line */}
                <motion.div
                  className="absolute left-0 top-0 h-full w-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `linear-gradient(to bottom, transparent, ${chapter.accentColor}, transparent)` }}
                />

                {/* Progress bar animation on hover */}
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(to right, ${chapter.accentColor}80, transparent)` }}
                  initial={{ width: '0%' }}
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.6 }}
                />

                <div className="relative grid gap-6 p-7 md:grid-cols-[14rem_minmax(0,1fr)] md:p-9">
                  <div>
                    <motion.div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.1] transition-all duration-300"
                      style={{ background: `${chapter.accentColor}15`, color: chapter.accentColor }}
                      whileHover={{ scale: 1.15, rotate: 5 }}
                    >
                      {chapter.icon}
                    </motion.div>
                    <p
                      className="mt-4 text-[10px] font-bold uppercase tracking-[0.3em]"
                      style={{ color: chapter.accentColor }}
                    >
                      {chapter.kicker}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-[1.6rem] font-black leading-[1.2] tracking-tight text-white sm:text-[1.8rem]">
                      {chapter.title}
                    </h3>
                    <p className="mt-4 max-w-3xl text-[15px] font-medium leading-[1.8] text-slate-400">
                      {chapter.text}
                    </p>
                    <motion.div
                      className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3.5 py-2"
                      whileHover={{ borderColor: `${chapter.accentColor}30`, backgroundColor: `${chapter.accentColor}08` }}
                    >
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      >
                        <Sparkles size={12} style={{ color: chapter.accentColor }} />
                      </motion.div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                        {index === 0 ? 'Analysis layer' : index === 1 ? 'Tutor layer' : 'Notes layer'}
                      </span>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <motion.div
          className="h-px"
          style={{
            background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent)',
          }}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        />
      </div>

      {/* ── CTA Section ── */}
      <section className="relative z-10 px-6 py-28">
        <div className="relative mx-auto max-w-5xl">
          {/* Background glow - animated */}
          <motion.div
            className="absolute -inset-6 rounded-[3.5rem] blur-2xl"
            animate={{
              background: [
                'linear-gradient(135deg, rgba(56,189,248,0.06) 0%, transparent 60%, rgba(129,140,248,0.04) 100%)',
                'linear-gradient(225deg, rgba(56,189,248,0.08) 0%, transparent 60%, rgba(129,140,248,0.06) 100%)',
                'linear-gradient(135deg, rgba(56,189,248,0.06) 0%, transparent 60%, rgba(129,140,248,0.04) 100%)',
              ],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="relative rounded-[2.5rem] border border-white/[0.1] bg-white/[0.05] p-10 shadow-[0_32px_110px_rgba(0,0,0,0.25)] backdrop-blur-2xl md:p-14"
          >
            <h2 className="max-w-3xl">
              <span className="block text-[2.6rem] font-black leading-[1.1] tracking-tight text-white sm:text-5xl">
                One place to analyze, understand,
              </span>
              <span className="mt-1 block bg-gradient-to-r from-sky-300 via-cyan-200 to-violet-400 bg-clip-text text-[2.6rem] font-black leading-[1.1] tracking-tight text-transparent sm:text-5xl">
                and keep your study material.
              </span>
            </h2>
            <p className="mt-6 max-w-2xl text-[17px] font-medium leading-[1.8] text-slate-400">
              SnapStudy combines visual analysis, tutor chat, saved sessions, AI-generated notes,
              uploaded study files, and personalized AI behavior in one workspace.
            </p>

            <div className="mt-10 grid gap-3.5 md:grid-cols-3">
              {[
                { text: 'Analyze study images with AI', icon: <ScanSearch size={18} />, color: '#38bdf8' },
                { text: 'Chat on top of saved sessions', icon: <Brain size={18} />, color: '#818cf8' },
                { text: 'Generate and edit reusable notes', icon: <MessageSquareText size={18} />, color: '#60a5fa' },
              ].map((item, i) => (
                <motion.div
                  key={item.text}
                  className="group rounded-[1.4rem] border border-white/[0.08] bg-white/[0.04] p-5 transition-colors duration-300 hover:border-white/[0.14] hover:bg-white/[0.07]"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.1 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                >
                  <motion.div
                    className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300"
                    style={{ background: `${item.color}18`, color: item.color }}
                    whileHover={{ scale: 1.15, rotate: 8 }}
                  >
                    {item.icon}
                  </motion.div>
                  <p className="text-[13px] font-bold text-white">{item.text}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <ShimmerButton href="/signup" variant="primary">
                Start Free <ArrowRight size={18} className="text-sky-600 transition-transform duration-300 group-hover:translate-x-1" />
              </ShimmerButton>
              <ShimmerButton href="/login" variant="secondary">
                Sign In
              </ShimmerButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <motion.footer
        className="relative z-10 border-t border-white/[0.06] px-6 py-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-[13px] font-medium text-slate-500">
            Built with ❤️ by SnapStudy
          </p>
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-medium text-slate-600">Powered by</span>
            <motion.span
              className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-[11px] font-bold text-transparent"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              AI
            </motion.span>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}