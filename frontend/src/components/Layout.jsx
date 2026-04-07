import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, NotebookPen, Settings, LogOut, LayoutDashboard, SlidersHorizontal, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Layout({ children }) {
  const { logout, user } = React.useContext(AuthContext);
  const userInitial = user?.username?.charAt(0)?.toUpperCase() || 'S';

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white font-sans text-slate-900">
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 hidden w-64 flex-shrink-0 flex-col border-r border-slate-200 bg-white md:flex"
      >
        <div className="flex items-center gap-3 p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 text-white shadow-lg shadow-primary-500/20">
            <Zap size={22} fill="currentColor" />
          </div>
          <h1 className="bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
            SnapStudy
          </h1>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
            <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" to="/dashboard" />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, duration: 0.5 }}>
            <NavItem icon={<BookOpen size={18} />} label="My Library" to="/library" />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55, duration: 0.5 }}>
            <NavItem icon={<NotebookPen size={18} />} label="Notes Workspace" to="/notes" />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6, duration: 0.5 }}>
            <NavItem icon={<SlidersHorizontal size={18} />} label="AI Configuration" to="/ai-settings" />
          </motion.div>
        </nav>

        <div className="border-t border-slate-100 p-4">
          <div className="mb-4 rounded-3xl border border-slate-200 bg-slate-50/90 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 text-sm font-extrabold text-white shadow-lg shadow-indigo-500/20">
                {userInitial}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-800">{user?.username || 'SnapStudy User'}</p>
                <p className="truncate text-xs font-medium text-slate-500">{user?.email || 'Signed in'}</p>
              </div>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.65, duration: 0.5 }}>
            <NavItem icon={<Settings size={18} />} label="Profile Settings" to="/profile" />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.75, duration: 0.5 }}>
            <button onClick={logout} className="w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold text-red-500 transition-all duration-200 hover:bg-red-50">
              <span className="flex items-center gap-3">
                <LogOut size={18} />
                <span>Log out</span>
              </span>
            </button>
          </motion.div>
        </div>
      </motion.aside>

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
        className="relative flex h-full flex-1 flex-col overflow-hidden bg-white"
      >
        <div className="z-20 flex items-center justify-between border-b border-slate-200/80 bg-white/70 px-5 py-4 backdrop-blur md:hidden">
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-slate-900">SnapStudy</p>
            <p className="truncate text-xs font-medium text-slate-500">{user?.username || 'Welcome back'}</p>
          </div>
          <Link
            to="/profile"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-extrabold text-slate-700 shadow-sm"
          >
            {userInitial}
          </Link>
        </div>

        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute top-0 left-0 z-0 h-64 w-full bg-gradient-to-b from-primary-100/50 to-transparent"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute top-[-10%] right-[-5%] z-0 h-[40rem] w-[40rem] rounded-full bg-indigo-200/40 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 0.9, 1], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute top-[-5%] left-[-10%] z-0 h-[30rem] w-[30rem] rounded-full bg-primary-200/30 blur-3xl"
        />

        <div className="z-10 flex-1 overflow-y-auto scroll-smooth p-6 md:p-10">
          <div className="mx-auto h-full w-full max-w-6xl">{children}</div>
        </div>
      </motion.main>
    </div>
  );
}

function NavItem({ icon, label, to, className = '' }) {
  const location = useLocation();
  const active = location.pathname === to;

  if (to) {
    return (
      <Link
        to={to}
        className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
          active ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        } ${className}`}
      >
        {icon}
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <button
      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
        active ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      } ${className}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
