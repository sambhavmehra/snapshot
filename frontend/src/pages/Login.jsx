import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { Zap, Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, Sparkles, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,#f8fafc_0%,#eef2ff_45%,#ffffff_100%)] font-sans">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-10%] right-[-5%] h-[34rem] w-[34rem] rounded-full bg-indigo-300/30 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] h-[28rem] w-[28rem] rounded-full bg-sky-200/40 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-6 py-10 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55 }}
          className="hidden lg:block"
        >
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-900/20">
              <Zap size={24} fill="currentColor" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-slate-900">SnapStudy</span>
          </Link>

          <div className="mt-16 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-indigo-700 shadow-sm">
              <Sparkles size={14} /> AI study workspace
            </div>
            <h1 className="mt-6 text-5xl font-extrabold leading-tight tracking-tight text-slate-900">
              Sign in and pick up exactly where you left off.
            </h1>
            <p className="mt-5 text-lg font-medium leading-8 text-slate-600">
              Your dashboard, uploads, and profile now feel more connected, so returning users can instantly recognize their workspace.
            </p>
            <div className="mt-10 grid gap-4">
              {[
                'See your user identity clearly on the dashboard.',
                'Jump from sign-in to uploads without extra steps.',
                'Keep your profile details visible and organized.',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/75 px-4 py-4 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <ShieldCheck size={18} />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="w-full max-w-xl justify-self-center"
        >
          <div className="rounded-[2rem] border border-white/80 bg-white/85 p-8 shadow-2xl shadow-slate-900/10 backdrop-blur-xl md:p-10">
            <div className="mb-8 text-center lg:text-left">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20 lg:mx-0">
                <Zap size={28} fill="currentColor" />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900">Welcome back</h2>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                Sign in to continue your learning journey and access your personalized dashboard.
              </p>
            </div>

            {error && <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{error}</div>}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Email Address</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    className="block w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-3.5 pl-11 pr-4 text-slate-900 outline-none transition-all focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-bold text-slate-700">Password</label>
                  <span className="text-xs font-semibold text-slate-400">Required</span>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="block w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-3.5 pl-11 pr-12 text-slate-900 outline-none transition-all focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 transition-colors hover:text-slate-700"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : <span>Sign In <ArrowRight className="ml-2 inline h-4 w-4" /></span>}
              </button>
            </form>

            <p className="mt-8 text-center text-sm font-medium text-slate-500">
              Don&apos;t have an account? <Link to="/signup" className="font-bold text-primary-600 hover:text-primary-500">Create one</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
