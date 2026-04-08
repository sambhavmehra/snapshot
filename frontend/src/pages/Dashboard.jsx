import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  Clock3,
  ImagePlus,
  Layers3,
  Sparkles,
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';
import ImageUploader from '../components/ImageUploader';
import AnalysisResult from '../components/AnalysisResult';
import ChatInterface from '../components/ChatInterface';
import { API_BASE_URL } from '../config/api';

const quickStats = [
  {
    icon: <ImagePlus size={18} />,
    label: 'Input',
    value: 'Images, notes, diagrams',
  },
  {
    icon: <Sparkles size={18} />,
    label: 'Output',
    value: 'Explanation plus tutor chat',
  },
  {
    icon: <Clock3 size={18} />,
    label: 'Flow',
    value: 'Upload, analyze, explore',
  },
];

const workflowCards = [
  {
    icon: <Layers3 size={18} />,
    title: 'Structured understanding',
    text: 'The dashboard turns one image into an organized breakdown instead of a raw caption.',
  },
  {
    icon: <BookOpenCheck size={18} />,
    title: 'Study-ready context',
    text: 'Useful for lecture notes, textbook pages, whiteboards, charts, and real-world objects.',
  },
  {
    icon: <Sparkles size={18} />,
    title: 'Follow-up learning',
    text: 'Use the tutor panel to simplify concepts, ask questions, or go deeper after analysis.',
  },
];

export default function Dashboard() {
  const [isUploading, setIsUploading] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [imageContext, setImageContext] = useState(null);
  const [imageMime, setImageMime] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [initialMessages, setInitialMessages] = useState(undefined);
  const [sessionLoading, setSessionLoading] = useState(false);
  const { token, user } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const firstName = user?.username?.split(' ')[0] || 'Learner';

  useEffect(() => {
    const requestedSessionId = searchParams.get('session');
    if (!requestedSessionId) return;

    const fetchSession = async () => {
      setSessionLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/sessions/${requestedSessionId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setAnalysisData(res.data.session.analysisData);
        setImageContext(res.data.session.imageContext);
        setImageMime(res.data.session.imageMime);
        setSessionId(res.data.session.id);
        setInitialMessages(res.data.chats);
      } catch (error) {
        console.error('Failed to load saved session', error);
      } finally {
        setSessionLoading(false);
      }
    };

    fetchSession();
  }, [searchParams, token]);

  const handleUpload = async (file) => {
    setIsUploading(true);
    setAnalysisData(null);
    setImageContext(null);
    setImageMime(null);
    setSessionId(null);
    setInitialMessages(undefined);
    setSearchParams({});

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/analyze`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAnalysisData(res.data.data);
      setImageContext(res.data.imageContext);
      setImageMime(res.data.imageMime);
      setSessionId(res.data.sessionId);
      setInitialMessages(undefined);
    } catch (error) {
      console.error('Upload failed', error);
      alert('Failed to analyze image. Check console for details.');
    } finally {
      setIsUploading(false);
    }
  };

  const resetDashboard = () => {
    setAnalysisData(null);
    setImageContext(null);
    setImageMime(null);
    setSessionId(null);
    setInitialMessages(undefined);
    setSearchParams({});
  };

  return (
    <Layout>
      <div className="flex min-h-full flex-col pb-8">
        <AnimatePresence mode="wait">
          {!analysisData ? (
            <motion.div
              key="dashboard-home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
              className="space-y-8"
            >
              <section className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_22rem]">
                <div className="rounded-[2rem] border border-white/10 bg-white/8 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur-2xl md:p-8">
                  <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-sky-200">
                        <BadgeCheck size={14} /> Dashboard
                      </div>
                      <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white">Upload study material</h2>
                      <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-300">
                        Welcome back, {firstName}. Upload a diagram, handwritten page, whiteboard photo, or textbook screenshot and SnapStudy will turn it into a guided study session.
                      </p>
                    </div>
                  </div>

                  <div className="mb-6 grid gap-4 md:grid-cols-3">
                    {quickStats.map((item) => (
                      <div key={item.label} className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-sky-200 shadow-sm">
                          {item.icon}
                        </div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">{item.label}</p>
                        <p className="mt-2 text-sm font-semibold leading-6 text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <ImageUploader onUpload={handleUpload} isUploading={isUploading} />
                </div>

                <aside className="space-y-4">
                  {workflowCards.map((item) => (
                    <div key={item.title} className="rounded-[1.75rem] border border-white/10 bg-white/8 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.16)] backdrop-blur-2xl">
                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-sky-200">
                        {item.icon}
                      </div>
                      <h3 className="text-base font-extrabold text-white">{item.title}</h3>
                      <p className="mt-2 text-sm font-medium leading-6 text-slate-300">{item.text}</p>
                    </div>
                  ))}
                </aside>
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="dashboard-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
              className="space-y-8"
            >
              <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/8 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur-2xl md:p-8">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 via-indigo-500 to-emerald-400" />
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-3xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-emerald-200">
                      <BadgeCheck size={14} /> {searchParams.get('session') ? 'Saved Session Opened' : 'Analysis Complete'}
                    </div>
                    <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                      {searchParams.get('session') ? 'Your previous chat is open on the dashboard.' : 'Your study breakdown is ready.'}
                    </h1>
                    <p className="mt-3 text-sm font-medium leading-6 text-slate-300 md:text-base">
                      Review the structured explanation below, then continue the session with the tutor to summarize, clarify, or explore related questions.
                    </p>
                  </div>

                  <button
                    onClick={resetDashboard}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800 active:scale-95"
                  >
                    Upload Another <ArrowRight size={16} />
                  </button>
                </div>
                {sessionId ? (
                  <div className="mt-5">
                    <Link
                      to={`/notes?mode=ai&session=${sessionId}`}
                      className="inline-flex items-center gap-2 rounded-2xl border border-sky-300/20 bg-sky-400/10 px-4 py-3 text-sm font-bold text-sky-100 transition-colors hover:bg-sky-400/15"
                    >
                      <Sparkles size={16} />
                      Generate Notes From This Analysis
                    </Link>
                  </div>
                ) : null}
              </section>

              {sessionLoading ? (
                <div className="rounded-[2rem] border border-white/10 bg-white/8 p-10 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                    <p className="mt-4 text-sm font-medium text-slate-300">Loading saved session...</p>
                  </div>
                </div>
              ) : (
                <>
                  <section className="grid grid-cols-1 gap-8 xl:grid-cols-12">
                    <div className="xl:col-span-7">
                      <AnalysisResult data={analysisData} />
                    </div>
                    <div className="xl:col-span-5">
                      <div className="xl:sticky xl:top-8">
                        <ChatInterface
                          sessionId={sessionId}
                          initialMessages={initialMessages}
                          imageContext={imageContext}
                          imageMime={imageMime}
                        />
                      </div>
                    </div>
                  </section>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
