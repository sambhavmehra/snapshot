  import React, { useRef } from 'react';
  import { motion, useScroll, useTransform } from 'framer-motion';
  import { Link } from 'react-router-dom';
  import { ArrowRight, Sparkles, Brain, ImageIcon, Zap, ChevronDown, CheckCircle2 } from 'lucide-react';

  export default function Landing() {
    const { scrollYProgress } = useScroll();
    const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    
    return (
      <div className="min-h-screen bg-white overflow-hidden font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 relative">
        {/* Navigation */}
        <nav className="fixed w-full top-0 left-0 right-0 z-50 px-6 py-4 border-b border-white/10 bg-white/60 backdrop-blur-xl transition-all">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg group-hover:shadow-indigo-500/30 transition-all group-hover:scale-105">
                <Zap size={18} fill="currentColor" />
              </div>
              <span className="text-xl font-extrabold tracking-tight">SnapStudy</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">Log In</Link>
              <Link to="/signup" className="text-sm font-bold bg-slate-900 text-white px-6 py-2.5 rounded-full hover:bg-slate-800 transition-all shadow hover:shadow-lg active:scale-95">
                Start Learning
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section (The Hook) */}
        <section className="relative min-h-[95vh] flex flex-col justify-center px-6 pt-20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/40 via-white to-white pointer-events-none -z-10" />
          
          <div className="max-w-5xl mx-auto text-center relative z-10 w-full mt-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50/80 backdrop-blur border border-indigo-100/50 text-indigo-700 font-bold text-xs tracking-widest uppercase mb-8 shadow-sm"
            >
              <Sparkles size={14} className="text-indigo-500 animate-pulse" />
              The Next Evolution in Learning
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-8 leading-[1]"
            >
              Don't just stare at notes.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Talk to them.
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto mb-12 leading-relaxed font-medium"
            >
              Snap a photo of any diagram, textbook page, or scribbled note. SnapStudy's visual AI instantly understands the context and transforms it into an interactive tutoring session.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/signup" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 hover:shadow-2xl hover:-translate-y-1">
                Try the AI Free <ArrowRight size={20} />
              </Link>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce flex flex-col items-center text-slate-400"
          >
            <span className="text-xs font-bold uppercase tracking-widest mb-2">Scroll to discover</span>
            <ChevronDown size={24} />
          </motion.div>
        </section>

        {/* Story Chapter 1: The Problem */}
        <section className="relative py-32 overflow-hidden bg-white px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
              >
                <div className="w-16 h-16 rounded-3xl mb-8 flex items-center justify-center bg-slate-100 text-slate-500 border border-slate-200">
                  <ImageIcon size={30} />
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-slate-900 leading-tight">
                  Information overload is <span className="underline decoration-indigo-200 decoration-8 underline-offset-4">exhausting.</span>
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed font-medium">
                  You sit in lectures taking rapid photos of complex whiteboards. You screenshot diagrams that make no sense without the professor's voice. Months later, you look at them and draw a blank.
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.2 }}
                className="relative rounded-3xl bg-slate-100 border border-slate-200 p-2 shadow-2xl overflow-hidden aspect-square flex flex-col items-center justify-center"
              >
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]"></div>
                <div className="relative z-10 w-[80%] h-[70%] bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between transform -rotate-3">
                    <div className="space-y-3 opacity-30 blur-[1px]">
                      <div className="w-full h-4 bg-slate-300 rounded-full"></div>
                      <div className="w-3/4 h-4 bg-slate-300 rounded-full"></div>
                      <div className="w-5/6 h-4 bg-slate-300 rounded-full"></div>
                      <div className="w-full h-32 bg-slate-200 rounded-xl mt-6"></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl font-extrabold text-slate-800 rotate-12 drop-shadow-md">? ? ?</span>
                    </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Story Chapter 2: The Action/Solution */}
        <section className="relative py-32 overflow-hidden px-6 bg-slate-50 border-y border-slate-200">
          <div className="absolute left-0 top-0 w-full h-[150%] bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none"></div>
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid md:grid-cols-2 gap-16 items-center flex-col-reverse md:flex-row">
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, type: "spring" }}
                className="order-2 md:order-1 relative rounded-3xl bg-white border border-indigo-100 p-2 shadow-2xl overflow-hidden aspect-square"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-5"></div>
                <div className="h-full w-full bg-white rounded-2xl flex flex-col pt-8">
                    <div className="px-8 pb-4 border-b border-slate-100 flex items-center gap-4">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                    </div>
                    <div className="flex-1 p-8 space-y-6">
                      <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 }}
                          className="bg-indigo-50 w-fit px-6 py-4 rounded-2xl rounded-tl-sm shadow-sm"
                      >
                        <p className="font-medium text-indigo-900">I see an intricate neural network diagram. Let me break down the hidden layers for you.</p>
                      </motion.div>
                      <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.8 }}
                          className="bg-slate-800 text-white w-fit ml-auto px-6 py-4 rounded-2xl rounded-tr-sm shadow-sm"
                      >
                        <p className="font-medium">Why are there weights attached to the synapsis?</p>
                      </motion.div>
                      <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 1.3 }}
                          className="bg-white border border-slate-100 w-[85%] px-6 py-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-3"
                      >
                          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                          <p className="font-medium text-slate-500">Generating contextual knowledge...</p>
                      </motion.div>
                    </div>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="order-1 md:order-2"
              >
                <div className="w-16 h-16 rounded-3xl mb-8 flex items-center justify-center bg-indigo-600 text-white shadow-xl shadow-indigo-600/30">
                  <Brain size={30} />
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-slate-900 leading-tight">
                  Unlock meaning with <span className="text-indigo-600">Superhuman Vision.</span>
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed font-medium mb-8">
                  SnapStudy doesn't just read the text. It intrinsically understands charts, models, handwritten equations, and physical objects. It analyzes relationships and generates a comprehensive learning profile.
                </p>
                
                <ul className="space-y-4">
                  {[
                    "Zero setup, just drag-and-drop imagery.",
                    "Powered by state-of-the-art multimodal LLMs.",
                    "Automatic conversational context mapping."
                  ].map((text, i) => (
                    <motion.li 
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 + (i * 0.1) }}
                        key={i} 
                        className="flex items-center gap-3 text-slate-700 font-bold"
                    >
                      <CheckCircle2 size={24} className="text-indigo-500 shrink-0" />
                      {text}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Final Chapter: The Climax CTA */}
        <section className="relative py-40 overflow-hidden bg-slate-900 text-white px-6">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/30 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
                Your personal tutor is waiting.
              </h2>
              <p className="text-xl md:text-2xl text-slate-300 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
                Stop guessing. Start understanding. Join the future of education and bring an AI tutor into your back pocket.
              </p>
              <Link to="/signup" className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 px-12 py-5 rounded-full font-extrabold text-xl hover:bg-slate-100 transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95">
                Launch Dashboard <ArrowRight size={22} className="text-indigo-600" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 bg-black text-slate-500 text-center font-medium text-sm">
          <p>© 2026 SnapStudy. A visual learning prototype.</p>
        </footer>
      </div>
    );
  }
