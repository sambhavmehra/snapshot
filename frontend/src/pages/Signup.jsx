import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff, CheckCircle2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import BrandLogo from '../components/BrandLogo';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/auth/signup', { username, email, password });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07101d] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,16,29,0.32)_0%,rgba(7,16,29,0.62)_38%,rgba(7,16,29,0.9)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_28%)]" />
        <div className="absolute top-[-18%] left-[-8%] h-[34rem] w-[34rem] rounded-full bg-sky-300/16 blur-3xl" />
        <div className="absolute top-[8%] right-[-10%] h-[42rem] w-[42rem] rounded-full bg-blue-400/14 blur-3xl" />
        <div className="absolute bottom-[-12%] left-[26%] h-[30rem] w-[30rem] rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="grid-noise absolute inset-0 opacity-25" />
      </div>

      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-6 py-10 lg:grid-cols-[0.94fr_1.06fr]">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="w-full max-w-xl justify-self-center lg:order-2"
        >
          <div className="rounded-[2rem] border border-white/10 bg-white/8 p-8 shadow-[0_28px_90px_rgba(0,0,0,0.22)] backdrop-blur-2xl md:p-10">
            <div className="mb-8 text-center lg:text-left">
              <div className="mx-auto mb-5 lg:mx-0">
                <BrandLogo size="md" withWordmark={false} />
              </div>
              <h1 className="text-3xl font-black text-white">Create your account</h1>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-300">
                Launch a personalized study workspace built around notes, chat, and visual understanding.
              </p>
            </div>

            {error ? <div className="mb-5 rounded-2xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm font-medium text-rose-100">{error}</div> : null}

            <form onSubmit={handleSignup} className="space-y-4">
              <InputField label="Username" icon={<User className="h-5 w-5 text-slate-400" />} type="text" value={username} onChange={setUsername} placeholder="johndoe" minLength={3} />
              <InputField label="Email Address" icon={<Mail className="h-5 w-5 text-slate-400" />} type="email" value={email} onChange={setEmail} placeholder="you@example.com" />

              <PasswordField
                label="Password"
                value={password}
                onChange={setPassword}
                show={showPassword}
                onToggle={() => setShowPassword((prev) => !prev)}
                placeholder="Create a password"
              />

              <PasswordField
                label="Confirm Password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                show={showConfirmPassword}
                onToggle={() => setShowConfirmPassword((prev) => !prev)}
                placeholder="Repeat your password"
              />

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-2xl bg-[linear-gradient(135deg,#081226_0%,#154cb5_54%,#36c3ff_100%)] px-4 py-3.5 text-sm font-black text-white shadow-[0_20px_40px_rgba(37,99,235,0.28)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : <span>Create Workspace <ArrowRight className="ml-2 inline h-4 w-4" /></span>}
              </button>
            </form>

            <p className="mt-8 text-center text-sm font-medium text-slate-300">
              Already have an account? <Link to="/login" className="font-black text-sky-300 hover:text-sky-200">Sign in</Link>
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55 }}
          className="hidden lg:block lg:order-1"
        >
          <Link to="/" className="inline-flex">
            <BrandLogo size="lg" />
          </Link>

          <div className="mt-16 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-white/8 px-4 py-2 text-xs font-black uppercase tracking-[0.26em] text-sky-200 backdrop-blur-xl">
              <Sparkles size={14} /> Adaptive onboarding
            </div>
            <h2 className="mt-7 text-6xl font-black tracking-tight text-white">
              Start with a smarter study identity from day one.
            </h2>
            <p className="mt-6 max-w-xl text-lg font-medium leading-8 text-slate-300">
              Your dashboard, AI settings, profile, library, and notes workspace now feel like parts of one premium learning platform.
            </p>

            <div className="mt-10 space-y-4">
              {[
                'Set up a workspace tied to your name and account.',
                'Generate AI notes, upload PDFs, and continue note chat later.',
                'Tune the assistant perspective so responses match how you learn best.',
              ].map((item) => (
                <div key={item} className="flex items-center gap-4 rounded-[1.6rem] border border-white/10 bg-white/6 px-5 py-4 shadow-[0_18px_40px_rgba(15,23,42,0.18)] backdrop-blur-xl">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-white/10 text-sky-200">
                    <CheckCircle2 size={18} />
                  </div>
                  <p className="text-sm font-bold text-slate-100">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function InputField({ label, icon, type, value, onChange, placeholder, minLength }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black text-slate-200">{label}</label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">{icon}</div>
        <input
          type={type}
          required
          minLength={minLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="block w-full rounded-2xl border border-white/10 bg-white/8 py-3.5 pl-11 pr-4 text-white outline-none transition-all placeholder:text-slate-400 focus:border-sky-400/40 focus:bg-white/10 focus:ring-4 focus:ring-sky-400/10"
        />
      </div>
    </div>
  );
}

function PasswordField({ label, value, onChange, show, onToggle, placeholder }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black text-slate-200">{label}</label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <Lock className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type={show ? 'text' : 'password'}
          required
          minLength={6}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="block w-full rounded-2xl border border-white/10 bg-white/8 py-3.5 pl-11 pr-12 text-white outline-none transition-all placeholder:text-slate-400 focus:border-sky-400/40 focus:bg-white/10 focus:ring-4 focus:ring-sky-400/10"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 transition-colors hover:text-white"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}
