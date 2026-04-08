import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  MessageSquareText,
  ScanSearch,
  ScrollText,
  Sparkles,
} from 'lucide-react';
import BrandLogo from '../components/BrandLogo';

const storyChapters = [
  {
    kicker: 'Chapter 01',
    title: 'Upload study images and get a structured breakdown.',
    text: 'SnapStudy analyzes diagrams, handwritten notes, whiteboards, charts, and textbook screenshots, then returns an organized explanation with context, practical uses, and learning advice.',
    icon: <ScanSearch size={20} />,
  },
  {
    kicker: 'Chapter 02',
    title: 'Keep learning in a tutor chat that remembers the session.',
    text: 'After analysis, you can ask follow-up questions in the dashboard so the assistant explains, simplifies, and expands on the same material instead of starting fresh each time.',
    icon: <Brain size={20} />,
  },
  {
    kicker: 'Chapter 03',
    title: 'Generate notes, edit them, and revisit them later.',
    text: 'Create AI notes from an analysis, upload your own PDF or text files into the notes workspace, and use the assistant to rewrite, shorten, expand, or reorganize the note content.',
    icon: <MessageSquareText size={20} />,
  },
];

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07101d] text-white">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,16,29,0.28)_0%,rgba(7,16,29,0.6)_35%,rgba(7,16,29,0.88)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.22),transparent_28%)]" />
      <div className="absolute left-[-12%] top-[8%] h-[32rem] w-[32rem] rounded-full bg-sky-400/12 blur-3xl" />
      <div className="absolute right-[-10%] top-[22%] h-[28rem] w-[28rem] rounded-full bg-blue-500/12 blur-3xl" />
      <div className="absolute bottom-[-18%] left-[28%] h-[26rem] w-[26rem] rounded-full bg-cyan-300/10 blur-3xl" />

      <nav className="fixed inset-x-0 top-0 z-50 px-6 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/10 bg-white/6 px-5 py-3 backdrop-blur-2xl">
          <Link to="/" className="inline-flex">
            <BrandLogo size="md" className="[&_*]:text-white" />
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-black text-slate-200 transition-colors hover:text-white">
              Log In
            </Link>
            <Link to="/signup" className="rounded-full bg-white px-6 py-2.5 text-sm font-black text-slate-950 shadow-[0_18px_36px_rgba(255,255,255,0.12)] transition-transform hover:-translate-y-0.5">
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative z-10 px-6 pt-32 pb-16">
        <div className="mx-auto grid min-h-[88vh] max-w-7xl items-center gap-14 lg:grid-cols-[1.04fr_0.96fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-white/8 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-sky-200 backdrop-blur-xl">
              <Sparkles size={14} /> AI study workspace
            </div>
            <h1 className="mt-8 max-w-5xl text-6xl font-black tracking-tight text-white md:text-7xl xl:text-[5.6rem] xl:leading-[0.98]">
              Turn study images and documents into explanations, chat, and revision-ready notes.
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-slate-300">
              SnapStudy helps students upload diagrams, handwritten notes, textbook pages, and files, then converts them into structured analysis, tutor-led conversations, and editable notes they can keep using later.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link to="/signup" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-black text-slate-950 shadow-[0_26px_58px_rgba(255,255,255,0.14)] transition-transform hover:-translate-y-1">
                Start Studying <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/6 px-8 py-4 text-base font-black text-white backdrop-blur-xl transition-colors hover:bg-white/10">
                Open Workspace
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                ['Image analysis', 'Upload a study image and get object detection, explanation, context, uses, and smart learning advice.'],
                ['Tutor chat', 'Ask follow-up questions against the saved image session instead of starting from scratch every time.'],
                ['Notes workspace', 'Generate AI notes, upload source material, and edit saved notes with the assistant.'],
              ].map(([title, text]) => (
                <div key={title} className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5 backdrop-blur-xl">
                  <p className="text-sm font-black text-white">{title}</p>
                  <p className="mt-2 text-sm font-medium leading-6 text-slate-300">{text}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75, delay: 0.15 }}
            className="relative"
          >
            <div className="rounded-[2rem] border border-white/10 bg-white/7 p-5 shadow-[0_30px_100px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
              <div className="rounded-[1.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,18,38,0.94)_0%,rgba(10,34,74,0.92)_54%,rgba(16,67,133,0.88)_100%)] p-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-5">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.26em] text-sky-200">Product Overview</p>
                    <h3 className="mt-2 text-2xl font-black text-white">What SnapStudy actually does</h3>
                  </div>
                  <BrandLogo size="sm" withWordmark={false} />
                </div>

                <div className="mt-6 grid gap-4">
                  <div className="rounded-[1.4rem] border border-white/10 bg-white/6 p-5">
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-sky-200">Study Session Flow</p>
                    <p className="mt-3 text-sm leading-7 text-slate-100">
                      One upload creates a saved study session with image analysis, contextual tutor chat, and a direct path into AI-generated notes.
                    </p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-[1.4rem] border border-white/10 bg-white/6 p-5">
                      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-sky-200">Image to Insight</p>
                      <p className="mt-3 text-sm leading-7 text-slate-200">
                        Upload lecture notes, textbook pages, diagrams, or whiteboard photos.
                        <br />
                        Get structured educational analysis in seconds.
                      </p>
                    </div>
                    <div className="rounded-[1.4rem] border border-white/10 bg-white/6 p-5">
                      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-sky-200">Editable Notes</p>
                      <p className="mt-3 text-sm leading-7 text-slate-200">
                        Generate notes from analysis.
                        <br />
                        Upload PDF, TXT, or MD files.
                        <br />
                        Rewrite content with AI help.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[1.4rem] border border-white/10 bg-white/6 p-5">
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-sky-200">Core Features</p>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      <div className="rounded-2xl bg-white/6 px-4 py-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-sky-200">Dashboard</p>
                        <p className="mt-2 text-sm text-slate-200">Analyze and chat</p>
                      </div>
                      <div className="rounded-2xl bg-white/6 px-4 py-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-sky-200">Library</p>
                        <p className="mt-2 text-sm text-slate-200">Reopen past sessions</p>
                      </div>
                      <div className="rounded-2xl bg-white/6 px-4 py-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-sky-200">Workspace</p>
                        <p className="mt-2 text-sm text-slate-200">Save and edit notes</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-slate-200 backdrop-blur-xl">
              <ScrollText size={14} /> How it works
            </div>
            <h2 className="mt-6 text-5xl font-black tracking-tight text-white">
              The product flow is built for studying, not just one-off AI answers.
            </h2>
          </div>

          <div className="space-y-8">
            {storyChapters.map((chapter, index) => (
              <motion.div
                key={chapter.kicker}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
                className="grid gap-6 rounded-[2rem] border border-white/10 bg-white/7 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur-2xl md:grid-cols-[14rem_minmax(0,1fr)] md:p-8"
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-[1.1rem] border border-sky-300/20 bg-sky-400/10 text-sky-200">
                    {chapter.icon}
                  </div>
                  <p className="mt-4 text-xs font-black uppercase tracking-[0.28em] text-sky-200">{chapter.kicker}</p>
                </div>
                <div>
                  <h3 className="text-3xl font-black tracking-tight text-white">{chapter.title}</h3>
                  <p className="mt-4 max-w-3xl text-base font-medium leading-8 text-slate-300">{chapter.text}</p>
                  <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-sky-200">
                    <Sparkles size={12} /> {index === 0 ? 'Analysis layer' : index === 1 ? 'Tutor layer' : 'Notes layer'}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 py-24">
        <div className="mx-auto max-w-5xl rounded-[2.5rem] border border-white/12 bg-white/8 p-10 shadow-[0_32px_110px_rgba(0,0,0,0.22)] backdrop-blur-2xl md:p-14">
          <h2 className="max-w-3xl text-5xl font-black tracking-tight text-white">
            Built for students who want one place to analyze, understand, and keep their study material.
          </h2>
          <p className="mt-5 max-w-2xl text-lg font-medium leading-8 text-slate-300">
            SnapStudy combines visual analysis, tutor chat, saved sessions, AI-generated notes, uploaded study files, and personalized AI behavior in one workspace.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              'Analyze study images with AI',
              'Chat on top of saved sessions',
              'Generate and edit reusable notes',
            ].map((item) => (
              <div key={item} className="rounded-[1.4rem] border border-white/10 bg-white/6 p-5">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-[1rem] bg-white text-slate-950">
                  <CheckCircle2 size={18} />
                </div>
                <p className="text-sm font-black text-white">{item}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link to="/signup" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-black text-slate-950 transition-transform hover:-translate-y-0.5">
              Start Free <ArrowRight size={18} className="text-sky-600" />
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/6 px-8 py-4 text-base font-black text-white transition-colors hover:bg-white/10">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 px-6 py-8 text-center text-sm font-semibold text-slate-400">
        Copyright 2026 SnapStudy. Visual intelligence for serious learners.
      </footer>
    </div>
  );
}
