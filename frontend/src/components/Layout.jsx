"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';
import { BookOpen, NotebookPen, Settings, LogOut, LayoutDashboard, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import BrandLogo from './BrandLogo';

export default function Layout({ children }) {
  const { logout, user } = React.useContext(AuthContext);
  const userInitial = user?.username?.charAt(0)?.toUpperCase() || 'S';

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-[#07101d] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,16,29,0.32)_0%,rgba(7,16,29,0.62)_38%,rgba(7,16,29,0.9)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_28%)]" />
        <div className="absolute top-[-18%] left-[-8%] h-[34rem] w-[34rem] rounded-full bg-sky-300/16 blur-3xl" />
        <div className="absolute top-[8%] right-[-10%] h-[42rem] w-[42rem] rounded-full bg-blue-400/14 blur-3xl" />
        <div className="absolute bottom-[-12%] left-[26%] h-[30rem] w-[30rem] rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="grid-noise absolute inset-0 opacity-25" />
      </div>

      <motion.aside
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="relative z-10 hidden w-72 flex-shrink-0 flex-col border-r border-white/10 bg-white/8 backdrop-blur-2xl md:flex"
      >
        <div className="px-6 pt-6">
          <BrandLogo size="md" />
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6">
          <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" to="/dashboard" />
          <NavItem icon={<BookOpen size={18} />} label="My Library" to="/library" />
          <NavItem icon={<NotebookPen size={18} />} label="Notes Workspace" to="/notes" />
          <NavItem icon={<SlidersHorizontal size={18} />} label="AI Configuration" to="/ai-settings" />
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-4 rounded-[1.75rem] border border-white/10 bg-white/8 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.18)]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[1.2rem] bg-[linear-gradient(135deg,#0f172a_0%,#0f4fa8_48%,#38bdf8_100%)] text-sm font-black text-white shadow-[0_12px_28px_rgba(37,99,235,0.25)]">
                {userInitial}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-white">{user?.username || 'SnapStudy User'}</p>
                <p className="truncate text-xs font-semibold text-slate-300">{user?.email || 'Signed in'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <NavItem icon={<Settings size={18} />} label="Profile Settings" to="/profile" />
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-rose-200 transition-all duration-200 hover:bg-white/10"
            >
              <LogOut size={18} />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </motion.aside>

      <motion.main
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.12, ease: 'easeOut' }}
        className="relative flex flex-1 flex-col overflow-hidden"
      >
        <div className="z-20 flex items-center justify-between border-b border-white/10 bg-white/8 px-5 py-4 backdrop-blur-xl md:hidden">
          <BrandLogo size="sm" />
          <Link
            href="/profile"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1.1rem] border border-white/10 bg-white/10 text-sm font-black text-white shadow-sm"
          >
            {userInitial}
          </Link>
        </div>

        <div className="z-10 flex-1 overflow-y-auto bg-[#07101d] px-5 py-6 md:px-8 md:py-8">
          <div className="mx-auto w-full max-w-[92rem]">{children}</div>
        </div>
      </motion.main>
    </div>
  );
}

function NavItem({ icon, label, to }) {
  const pathname = usePathname();
  const active = pathname === to;

  return (
    <Link
      href={to}
      className={`flex w-full items-center gap-3 rounded-[1.2rem] px-4 py-3 text-sm font-bold transition-all duration-200 ${
        active
          ? 'bg-[linear-gradient(135deg,#0f172a_0%,#1447b8_58%,#38bdf8_100%)] text-white shadow-[0_18px_38px_rgba(29,78,216,0.24)]'
          : 'text-slate-300 hover:bg-white/10 hover:text-white'
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
