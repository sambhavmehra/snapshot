"use client";
import React, { useContext, useState } from 'react';
import { AuthContext } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import {
  BadgeCheck,
  KeyRound,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';

export default function Profile() {
  const { user } = useContext(AuthContext);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  if (!user) return null;

  const initials =
    user.username
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'SS';

  const handlePasswordChange = () => {
    console.log('Password Change:', { currentPassword, newPassword });
  };

  return (
    <Layout>
      <div className="mx-auto w-full max-w-6xl pb-12">
        <section className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-950 text-white shadow-[0_24px_70px_-40px_rgba(15,23,42,0.85)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.28),_transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(2,6,23,0.94))]" />
          <div className="relative flex flex-col gap-5 p-5 md:p-6 lg:flex-row lg:items-center lg:justify-between lg:p-7">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-100">
                <BadgeCheck size={14} /> Profile Overview
              </div>
              <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-white md:text-3xl">
                A cleaner view of your account.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                Manage your identity, workspace details, and password settings from one polished profile page.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-[1.35rem] border border-white/10 bg-white/6 p-4 backdrop-blur-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-[1rem] bg-gradient-to-br from-sky-400 to-indigo-500 text-lg font-extrabold text-white shadow-lg shadow-sky-500/20">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">
                  <ShieldCheck size={14} /> Verified Account
                </div>
                <h2 className="mt-2 break-words text-lg font-extrabold text-white">{user.username}</h2>
                <p className="mt-1 break-all text-xs font-medium text-slate-300 md:text-sm">{user.email}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_22rem]">
          <div className="space-y-8">
            <div className="rounded-[2rem] border border-white/10 bg-white/8 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur-2xl md:p-8">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h3 className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-white">
                    <UserRound size={18} className="text-indigo-300" /> Profile Details
                  </h3>
                  <p className="mt-2 text-sm font-medium leading-6 text-slate-300">
                    Your username and email are fixed account identifiers and are shown here for reference.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Username">
                  <div className="w-full rounded-2xl border border-white/10 bg-white/8 px-4 py-3.5 font-medium text-white">
                    {user.username}
                  </div>
                </Field>

                <Field label="Email Address">
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/8 px-4 py-3.5">
                    <Mail size={16} className="text-slate-400" />
                    <div className="w-full font-medium text-white">{user.email}</div>
                  </div>
                </Field>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/8 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur-2xl md:p-8">
              <div className="mb-6">
                <h3 className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-white">
                  <KeyRound size={18} className="text-indigo-300" /> Password & Security
                </h3>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-300">
                  Keep your account secure by updating your password when needed.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Current Password">
                  <input
                    type="password"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/8 px-4 py-3.5 font-medium text-white outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400/40 focus:bg-white/10 focus:ring-4 focus:ring-indigo-400/10"
                  />
                </Field>

                <Field label="New Password">
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/8 px-4 py-3.5 font-medium text-white outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400/40 focus:bg-white/10 focus:ring-4 focus:ring-indigo-400/10"
                  />
                </Field>
              </div>

              <button
                onClick={handlePasswordChange}
                className="mt-6 inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-700"
              >
                Update Password
              </button>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-white/8 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
              <h3 className="flex items-center gap-2 text-lg font-extrabold text-white">
                <Sparkles size={18} className="text-indigo-300" /> Workspace Ready
              </h3>
              <p className="mt-4 text-sm font-medium leading-7 text-slate-300">
                Your profile is set up for uploads, saved study material, and continued AI conversations from the dashboard.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </Layout>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-200">{label}</label>
      {children}
    </div>
  );
}
