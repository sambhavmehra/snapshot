import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Bot, Save, SlidersHorizontal } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';

const presets = {
  perspective: ['student', 'beginner', 'exam candidate', 'teacher assistant', 'developer', 'cybersecurity learner'],
  tone: ['clear and encouraging', 'professional and concise', 'friendly and simple', 'technical and direct'],
  response_style: ['structured notes with examples', 'step-by-step explanation', 'short revision points', 'deep detailed explanation'],
};

export default function AISettings() {
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    perspective: 'student',
    tone: 'clear and encouraging',
    response_style: 'structured notes with examples',
    focus: '',
    custom_instructions: '',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/ai-settings', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setForm(res.data.settings);
      } catch (error) {
        console.error('Failed to load AI settings', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [token]);

  const updateField = (key, value) => {
    setSaved(false);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const res = await axios.put('http://localhost:5000/api/ai-settings', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm(res.data.settings);
      setSaved(true);
    } catch (error) {
      console.error('Failed to save AI settings', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto w-full max-w-5xl pb-12">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600">
            <SlidersHorizontal size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">AI Configuration</h1>
            <p className="font-medium text-slate-500">Set how SnapStudy should respond across analysis, chat, and notes.</p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white/95 p-10 shadow-sm">
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
              <p className="mt-4 text-sm font-medium text-slate-500">Loading AI configuration...</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
            <section className="rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-sm md:p-8">
              <div className="grid gap-6">
                <FieldBlock
                  label="Perspective"
                  description="Choose the role or viewpoint the AI should favor by default."
                >
                  <select
                    value={form.perspective}
                    onChange={(e) => updateField('perspective', e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  >
                    {presets.perspective.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </FieldBlock>

                <FieldBlock
                  label="Tone"
                  description="Control whether answers feel more concise, gentle, technical, or conversational."
                >
                  <select
                    value={form.tone}
                    onChange={(e) => updateField('tone', e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  >
                    {presets.tone.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </FieldBlock>

                <FieldBlock
                  label="Response Style"
                  description="Choose the default structure you want from AI responses."
                >
                  <select
                    value={form.response_style}
                    onChange={(e) => updateField('response_style', e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  >
                    {presets.response_style.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </FieldBlock>

                <FieldBlock
                  label="Learning Focus"
                  description="Tell the AI what to prioritize, like exam prep, real-world examples, or quick revision."
                >
                  <input
                    type="text"
                    value={form.focus}
                    onChange={(e) => updateField('focus', e.target.value)}
                    placeholder="Example: focus on interview-style explanations"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  />
                </FieldBlock>

                <FieldBlock
                  label="Custom Instructions"
                  description="Add your own persistent prompt instructions for every AI feature."
                >
                  <textarea
                    value={form.custom_instructions}
                    onChange={(e) => updateField('custom_instructions', e.target.value)}
                    placeholder="Example: explain everything with analogies first, then give a technical version."
                    className="min-h-[14rem] w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium leading-7 text-slate-800 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  />
                </FieldBlock>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={saveSettings}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
                  >
                    <Save size={16} />
                    {saving ? 'Saving...' : 'Save Configuration'}
                  </button>
                  <p className={`text-sm font-medium ${saved ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {saved ? 'Configuration saved for all AI tools.' : 'Changes apply after saving.'}
                  </p>
                </div>
              </div>
            </section>

            <aside className="space-y-5">
              <div className="rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-sm">
                <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
                  <Bot size={18} className="text-indigo-600" /> How It Works
                </h2>
                <p className="mt-4 text-sm font-medium leading-7 text-slate-500">
                  These settings now influence image analysis, dashboard tutoring, AI notes generation, and the note-editing assistant.
                </p>
              </div>

              <div className="rounded-[2rem] bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/10">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Preview</p>
                <h3 className="mt-3 text-2xl font-extrabold">{form.perspective}</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-300">
                  Tone: {form.tone}
                </p>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-300">
                  Style: {form.response_style}
                </p>
                <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-200">
                  {form.custom_instructions || form.focus || 'Your saved preferences will be applied to future AI responses throughout the app.'}
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </Layout>
  );
}

function FieldBlock({ label, description, children }) {
  return (
    <div>
      <div className="mb-3">
        <h2 className="text-base font-extrabold text-slate-900">{label}</h2>
        <p className="mt-1 text-sm font-medium leading-6 text-slate-500">{description}</p>
      </div>
      {children}
    </div>
  );
}
