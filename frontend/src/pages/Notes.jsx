import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { BadgeCheck, BookText, Bot, FileText, FolderOpen, Loader2, MessageSquareText, Search, Send, Sparkles, Trash2, Upload, WandSparkles, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';

const modeConfig = {
  all: { label: 'All Notes', description: 'Browse every saved note from your workspace in one place.' },
  manual: { label: 'Manual Notes', description: 'Write and manage your own study notes in a dedicated workspace.' },
  ai: { label: 'AI Generated', description: 'Generate structured notes from a topic or one of your analyzed sessions.' },
  upload: { label: 'Upload Notes', description: 'Upload PDF, TXT, or MD notes and continue learning through chat.' },
};

export default function Notes() {
  const { token } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [notes, setNotes] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const initialMode = searchParams.get('mode');
  const [activeMode, setActiveMode] = useState(modeConfig[initialMode] ? initialMode : 'all');
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [manualDraft, setManualDraft] = useState({ title: '', topic: '', content: '' });
  const [aiDraft, setAiDraft] = useState({ topic: '', sessionId: searchParams.get('session') || '' });
  const [uploadDraft, setUploadDraft] = useState({ title: '', topic: '', file: null });

  useEffect(() => {
    const fetchWorkspaceData = async () => {
      try {
        const [notesRes, sessionsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/workspace-notes', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/sessions', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const nextNotes = notesRes.data.notes || [];
        setNotes(nextNotes);
        setSessions(sessionsRes.data.sessions || []);
        const requestedNoteId = Number(searchParams.get('note'));
        const nextSelected = requestedNoteId && nextNotes.some((note) => note.id === requestedNoteId)
          ? requestedNoteId
          : nextNotes.find((note) => activeMode === 'all' || note.type === activeMode)?.id || nextNotes[0]?.id || null;
        setSelectedNoteId(nextSelected);
      } catch (error) {
        console.error('Failed to load notes workspace', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkspaceData();
  }, [token]);

  useEffect(() => {
    if (!selectedNoteId) {
      setSelectedNote(null);
      setChatMessages([]);
      setChatOpen(false);
      return;
    }
    const fetchNoteDetail = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/workspace-notes/${selectedNoteId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const note = res.data.note;
        setSelectedNote(note);
        setChatMessages(res.data.chats || []);
        if (note.type === 'manual') setManualDraft({ title: note.title || '', topic: note.topic || '', content: note.content || '' });
        if (note.type === 'ai') setAiDraft((prev) => ({ ...prev, topic: note.topic || '', sessionId: note.session_id ? String(note.session_id) : prev.sessionId }));
        if (note.type === 'upload') setUploadDraft({ title: note.title || '', topic: note.topic || '', file: null });
      } catch (error) {
        console.error('Failed to load selected note', error);
      }
    };
    fetchNoteDetail();
  }, [selectedNoteId, token]);

  useEffect(() => {
    const nextParams = {};
    if (activeMode) nextParams.mode = activeMode;
    if (selectedNoteId) nextParams.note = String(selectedNoteId);
    if (!selectedNoteId && searchParams.get('session')) nextParams.session = searchParams.get('session');
    setSearchParams(nextParams, { replace: true });
  }, [activeMode, selectedNoteId]);

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      if (activeMode !== 'all' && note.type !== activeMode) return false;
      const query = search.trim().toLowerCase();
      if (!query) return true;
      return [note.title, note.topic, note.content, note.source_name].filter(Boolean).some((value) => value.toLowerCase().includes(query));
    });
  }, [notes, search, activeMode]);

  const syncNote = (note, shouldSelect = true) => {
    setNotes((prev) => {
      const next = prev.some((item) => item.id === note.id) ? prev.map((item) => (item.id === note.id ? note : item)) : [note, ...prev];
      return next.sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at));
    });
    if (shouldSelect) {
      setSelectedNoteId(note.id);
      setSelectedNote(note);
    }
  };

  const createManualNote = async () => {
    setSaving(true);
    try {
      const res = await axios.post('http://localhost:5000/api/workspace-notes', {
        type: 'manual', title: 'Untitled Manual Note', topic: '', content: '',
      }, { headers: { Authorization: `Bearer ${token}` } });
      syncNote(res.data.note);
      setChatMessages([]);
    } catch (error) {
      console.error('Failed to create manual note', error);
    } finally {
      setSaving(false);
    }
  };

  const saveManualNote = async () => {
    if (!selectedNote || selectedNote.type !== 'manual') return;
    setSaving(true);
    try {
      const res = await axios.put(`http://localhost:5000/api/workspace-notes/${selectedNote.id}`, manualDraft, {
        headers: { Authorization: `Bearer ${token}` },
      });
      syncNote(res.data.note);
    } catch (error) {
      console.error('Failed to save manual note', error);
    } finally {
      setSaving(false);
    }
  };

  const generateAiNote = async () => {
    if (!aiDraft.topic.trim() && !aiDraft.sessionId) return;
    setGenerating(true);
    try {
      const res = await axios.post('http://localhost:5000/api/workspace-notes/generate', {
        topic: aiDraft.topic,
        sessionId: aiDraft.sessionId ? Number(aiDraft.sessionId) : null,
      }, { headers: { Authorization: `Bearer ${token}` } });
      syncNote(res.data.note);
      setChatMessages([]);
    } catch (error) {
      console.error('Failed to generate AI note', error);
    } finally {
      setGenerating(false);
    }
  };

  const saveAiNote = async () => {
    if (!selectedNote || selectedNote.type !== 'ai') return;
    setSaving(true);
    try {
      const res = await axios.put(`http://localhost:5000/api/workspace-notes/${selectedNote.id}`, {
        title: selectedNote.title,
        topic: aiDraft.topic,
        content: selectedNote.content,
        session_id: aiDraft.sessionId ? Number(aiDraft.sessionId) : null,
      }, { headers: { Authorization: `Bearer ${token}` } });
      syncNote(res.data.note);
    } catch (error) {
      console.error('Failed to save AI note', error);
    } finally {
      setSaving(false);
    }
  };

  const uploadNoteFile = async () => {
    if (!uploadDraft.file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadDraft.file);
      formData.append('title', uploadDraft.title);
      formData.append('topic', uploadDraft.topic);
      const res = await axios.post('http://localhost:5000/api/workspace-notes/upload', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      syncNote(res.data.note);
      setChatMessages([]);
      setUploadDraft((prev) => ({ ...prev, file: null, title: res.data.note.title, topic: res.data.note.topic || '' }));
    } catch (error) {
      console.error('Failed to upload note file', error);
      alert(error.response?.data?.error || 'Failed to upload notes file.');
    } finally {
      setUploading(false);
    }
  };

  const saveUploadedNote = async () => {
    if (!selectedNote || selectedNote.type !== 'upload') return;
    setSaving(true);
    try {
      const res = await axios.put(`http://localhost:5000/api/workspace-notes/${selectedNote.id}`, {
        title: uploadDraft.title,
        topic: uploadDraft.topic,
        content: selectedNote.content,
      }, { headers: { Authorization: `Bearer ${token}` } });
      syncNote(res.data.note);
    } catch (error) {
      console.error('Failed to save uploaded note', error);
    } finally {
      setSaving(false);
    }
  };

  const deleteSelectedNote = async () => {
    if (!selectedNote) return;
    try {
      await axios.delete(`http://localhost:5000/api/workspace-notes/${selectedNote.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes((prev) => prev.filter((note) => note.id !== selectedNote.id));
      setSelectedNote(null);
      setSelectedNoteId(null);
      setChatMessages([]);
      setChatOpen(false);
    } catch (error) {
      console.error('Failed to delete note', error);
    }
  };

  const activeSessionLabel = sessions.find((session) => String(session.id) === String(aiDraft.sessionId));

  const handleAgenticNoteUpdate = (updatedNote) => {
    if (!updatedNote) return;

    setSelectedNote((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        title: updatedNote.title ?? prev.title,
        topic: updatedNote.topic ?? prev.topic,
        content: updatedNote.content ?? prev.content,
      };
    });

    setNotes((prev) =>
      prev.map((note) =>
        note.id === updatedNote.id
          ? {
              ...note,
              title: updatedNote.title ?? note.title,
              topic: updatedNote.topic ?? note.topic,
              content: updatedNote.content ?? note.content,
              updated_at: new Date().toISOString(),
            }
          : note
      )
    );

    if (selectedNote?.type === 'manual') {
      setManualDraft((prev) => ({
        ...prev,
        title: updatedNote.title ?? prev.title,
        topic: updatedNote.topic ?? prev.topic,
        content: updatedNote.content ?? prev.content,
      }));
    }

    if (selectedNote?.type === 'ai') {
      setAiDraft((prev) => ({
        ...prev,
        topic: updatedNote.topic ?? prev.topic,
      }));
    }

    if (selectedNote?.type === 'upload') {
      setUploadDraft((prev) => ({
        ...prev,
        title: updatedNote.title ?? prev.title,
        topic: updatedNote.topic ?? prev.topic,
      }));
    }
  };

  return (
    <Layout>
      <div className="mx-auto w-full max-w-[100rem] pb-12">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-indigo-300">
            <BookText size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Notes Workspace</h1>
            <p className="font-medium text-slate-300">Switch between manual notes, AI notes, and uploaded notes with chat attached to every saved note.</p>
          </div>
        </div>

        {loading ? <CardShell><LoadingState label="Loading notes workspace..." /></CardShell> : (
          <div className="grid gap-8 xl:grid-cols-[21rem_minmax(0,1fr)]">
            <aside className="space-y-5">
              <section className="rounded-[2rem] border border-slate-200 bg-white/95 p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-indigo-600">
                    <Search size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">Saved Notes</h2>
                    <p className="text-sm font-medium text-slate-500">Open, search, and manage every note.</p>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="relative">
                    <Search size={16} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search notes"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-11 py-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(modeConfig).map(([mode]) => (
                      <button
                        key={mode}
                        onClick={() => {
                          setActiveMode(mode);
                          setSelectedNote(null);
                          setSelectedNoteId(notes.find((note) => mode === 'all' || note.type === mode)?.id || null);
                        }}
                        className={`rounded-2xl px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] transition-colors ${activeMode === mode ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                      >
                        {mode === 'all' ? 'all' : mode}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              <section className="rounded-[2rem] border border-slate-200 bg-white/95 p-4 shadow-sm">
                <div className="max-h-[34rem] space-y-3 overflow-y-auto pr-1">
                  {filteredNotes.length === 0 ? (
                    <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50/80 p-5 text-center">
                      <FolderOpen size={22} className="mx-auto text-slate-400" />
                      <p className="mt-3 text-sm font-semibold text-slate-900">No {modeConfig[activeMode].label.toLowerCase()} yet</p>
                      <p className="mt-1 text-xs font-medium leading-6 text-slate-500">{modeConfig[activeMode].description}</p>
                    </div>
                  ) : (
                    filteredNotes.map((note) => (
                      <button
                        key={note.id}
                        onClick={() => setSelectedNoteId(note.id)}
                        className={`w-full rounded-[1.5rem] border p-4 text-left transition-all ${selectedNoteId === note.id ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-slate-50/70 text-slate-900 hover:bg-white'}`}
                      >
                        <p className={`text-[11px] font-bold uppercase tracking-[0.2em] ${selectedNoteId === note.id ? 'text-slate-300' : 'text-slate-400'}`}>{note.type}</p>
                        <h3 className="mt-2 line-clamp-2 text-sm font-extrabold">{note.title}</h3>
                        <p className={`mt-2 line-clamp-2 text-xs font-medium leading-5 ${selectedNoteId === note.id ? 'text-slate-300' : 'text-slate-500'}`}>{note.topic || note.source_name || 'No topic added yet'}</p>
                      </button>
                    ))
                  )}
                </div>
              </section>

              {notes.length > 0 ? (
                <section className="rounded-[2rem] border border-slate-200 bg-white/95 p-4 shadow-sm">
                  <div className="mb-3">
                    <h3 className="text-sm font-extrabold uppercase tracking-[0.18em] text-slate-500">Recent Notes</h3>
                    <p className="mt-1 text-xs font-medium text-slate-500">Quick access to your latest saved notes.</p>
                  </div>
                  <div className="space-y-2">
                    {notes.slice(0, 5).map((note) => (
                      <button
                        key={`recent-${note.id}`}
                        onClick={() => {
                          setActiveMode(note.type);
                          setSelectedNoteId(note.id);
                        }}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-left transition-colors hover:bg-white"
                      >
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{note.type}</p>
                        <p className="mt-1 truncate text-sm font-bold text-slate-900">{note.title}</p>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}
            </aside>

            <section className="space-y-6">
              <section className="rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-sm md:p-8">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-3xl">
                    <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-indigo-700">
                      <BadgeCheck size={14} /> {modeConfig[activeMode].label}
                    </div>
                    <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">{modeConfig[activeMode].label}</h2>
                    <p className="mt-2 text-sm font-medium leading-6 text-slate-500">{modeConfig[activeMode].description}</p>
                  </div>
                  {selectedNote ? (
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => setChatOpen(true)}
                        disabled={!selectedNote}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <MessageSquareText size={16} /> Chat with AI
                      </button>
                      <button onClick={deleteSelectedNote} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition-colors hover:bg-red-100">
                        <Trash2 size={16} /> Delete Note
                      </button>
                    </div>
                  ) : null}
                </div>
              </section>

              <AnimatePresence mode="wait">
                <motion.div key={activeMode} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                  {activeMode === 'manual' ? (
                    <ModeShell>
                      <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-6">
                          <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-extrabold text-slate-900">Manual Note Editor</h3>
                            <div className="flex flex-wrap gap-3">
                            {!selectedNote || selectedNote.type !== 'manual' ? (
                              <button onClick={createManualNote} disabled={saving} className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800">{saving ? 'Creating...' : 'New Manual Note'}</button>
                            ) : (
                              <button onClick={saveManualNote} disabled={saving} className="rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-700">{saving ? 'Saving...' : 'Save Note'}</button>
                            )}
                              <button
                                onClick={() => setChatOpen(true)}
                                disabled={!selectedNote || selectedNote.type !== 'manual'}
                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <MessageSquareText size={16} /> Chat with AI
                              </button>
                            </div>
                          </div>
                          {selectedNote && selectedNote.type === 'manual' ? (
                            <div className="space-y-4">
                              <input type="text" value={manualDraft.title} onChange={(e) => setManualDraft((prev) => ({ ...prev, title: e.target.value }))} placeholder="Note title" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" />
                              <input type="text" value={manualDraft.topic} onChange={(e) => setManualDraft((prev) => ({ ...prev, topic: e.target.value }))} placeholder="Topic or subject" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" />
                              <textarea value={manualDraft.content} onChange={(e) => setManualDraft((prev) => ({ ...prev, content: e.target.value }))} placeholder="Start writing your own notes here." className="min-h-[42rem] w-full rounded-[1.5rem] border border-slate-200 bg-white px-5 py-5 text-sm font-medium leading-7 text-slate-800 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" />
                            </div>
                          ) : <EmptyEditor title="Manual mode is ready" text="Create a manual note and this workspace becomes a full writing area for your own study material." />}
                      </div>
                    </ModeShell>
                  ) : null}
                  {activeMode === 'ai' ? (
                    <ModeShell>
                      <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-6">
                          <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-extrabold text-slate-900">AI Notes Generator</h3>
                            <div className="flex gap-3">
                              {selectedNote && selectedNote.type === 'ai' ? (
                                <button onClick={saveAiNote} disabled={saving} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100">{saving ? 'Saving...' : 'Save'}</button>
                              ) : null}
                              <button onClick={generateAiNote} disabled={generating} className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-700">
                                <WandSparkles size={16} /> {generating ? 'Generating...' : 'Generate Note'}
                              </button>
                              <button
                                onClick={() => setChatOpen(true)}
                                disabled={!selectedNote || selectedNote.type !== 'ai'}
                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <MessageSquareText size={16} /> Chat with AI
                              </button>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <input type="text" value={aiDraft.topic} onChange={(e) => setAiDraft((prev) => ({ ...prev, topic: e.target.value }))} placeholder="Enter a topic like SQL Injection or OSI Model" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" />
                            <select value={aiDraft.sessionId} onChange={(e) => setAiDraft((prev) => ({ ...prev, sessionId: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10">
                              <option value="">Generate from topic only</option>
                              {sessions.map((session) => (
                                <option key={session.id} value={session.id}>{session.object} | {new Date(session.created_at).toLocaleDateString()}</option>
                              ))}
                            </select>
                            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
                              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">
                                <Sparkles size={14} /> AI Output
                              </div>
                              <textarea value={selectedNote?.type === 'ai' ? selectedNote.content : ''} onChange={(e) => selectedNote && setSelectedNote((prev) => ({ ...prev, content: e.target.value }))} placeholder="Your generated note will appear here." className="min-h-[40rem] w-full rounded-[1.25rem] border border-slate-200 bg-slate-50 px-5 py-5 text-sm font-medium leading-7 text-slate-800 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10" />
                            </div>
                            {activeSessionLabel ? <p className="text-xs font-medium text-slate-500">Linked analysis: {activeSessionLabel.object}</p> : null}
                          </div>
                      </div>
                    </ModeShell>
                  ) : null}
                  {activeMode === 'upload' ? (
                    <ModeShell>
                      <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-6">
                          <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-extrabold text-slate-900">Upload Your Notes</h3>
                            <div className="flex flex-wrap gap-3">
                              {selectedNote && selectedNote.type === 'upload' ? (
                                <button onClick={saveUploadedNote} disabled={saving} className="rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-700">{saving ? 'Saving...' : 'Save'}</button>
                              ) : null}
                              <button
                                onClick={() => setChatOpen(true)}
                                disabled={!selectedNote || selectedNote.type !== 'upload'}
                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <MessageSquareText size={16} /> Chat with AI
                              </button>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <input type="text" value={uploadDraft.title} onChange={(e) => setUploadDraft((prev) => ({ ...prev, title: e.target.value }))} placeholder="Optional note title" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" />
                            <input type="text" value={uploadDraft.topic} onChange={(e) => setUploadDraft((prev) => ({ ...prev, topic: e.target.value }))} placeholder="Optional topic" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" />
                            <label className="flex cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300 bg-white px-6 py-10 text-center transition-colors hover:border-indigo-400 hover:bg-indigo-50/40">
                              <Upload size={26} className="text-indigo-600" />
                              <p className="mt-4 text-base font-extrabold text-slate-900">Upload PDF, TXT, or MD notes</p>
                              <p className="mt-2 text-sm font-medium text-slate-500">We extract the text, save it to your account, and make it chat-ready.</p>
                              <input type="file" accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown" className="hidden" onChange={(e) => setUploadDraft((prev) => ({ ...prev, file: e.target.files?.[0] || null }))} />
                            </label>
                            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
                              <p className="text-sm font-medium text-slate-600">{uploadDraft.file?.name || selectedNote?.source_name || 'No file selected yet'}</p>
                              <button onClick={uploadNoteFile} disabled={uploading || !uploadDraft.file} className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">{uploading ? 'Uploading...' : 'Upload Notes'}</button>
                            </div>
                            <textarea value={selectedNote?.type === 'upload' ? selectedNote.content : ''} onChange={(e) => selectedNote && setSelectedNote((prev) => ({ ...prev, content: e.target.value }))} placeholder="Uploaded note content will appear here." className="min-h-[38rem] w-full rounded-[1.5rem] border border-slate-200 bg-white px-5 py-5 text-sm font-medium leading-7 text-slate-800 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" />
                          </div>
                      </div>
                    </ModeShell>
                  ) : null}
                </motion.div>
              </AnimatePresence>
            </section>
          </div>
        )}
      </div>
      <AnimatePresence>
        {chatOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/35 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="flex h-[calc(100vh-2rem)] w-full max-w-2xl flex-col rounded-[2rem] bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Chat with AI</h3>
                  <p className="text-sm font-medium text-slate-500">
                    {selectedNote ? `Ask questions about ${selectedNote.title}` : 'Open a note first'}
                  </p>
                </div>
                <button
                  onClick={() => setChatOpen(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="min-h-0 flex-1 p-4">
                <NoteChatPanel note={selectedNote} token={token} initialMessages={chatMessages} compact onNoteUpdated={handleAgenticNoteUpdate} />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Layout>
  );
}

function ModeShell({ children }) {
  return <section className="rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-sm md:p-8">{children}</section>;
}

function EmptyEditor({ title, text }) {
  return (
    <div className="flex min-h-[32rem] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-200 bg-white px-8 text-center">
      <FileText size={24} className="text-slate-400" />
      <h3 className="mt-4 text-xl font-extrabold text-slate-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm font-medium leading-6 text-slate-500">{text}</p>
    </div>
  );
}

function NoteChatPanel({ note, token, initialMessages, compact = false, onNoteUpdated }) {
  const [messages, setMessages] = useState(initialMessages || []);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    setMessages(initialMessages && initialMessages.length > 0 ? initialMessages : []);
  }, [initialMessages, note?.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!note?.id || !input.trim() || isTyping) return;
    const userMessage = { role: 'user', content: input };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setIsTyping(true);
    try {
      const res = await axios.post(`http://localhost:5000/api/workspace-notes/${note.id}/chat`, { messages: nextMessages }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const assistantMessages = [{ role: 'assistant', content: res.data.reply }];
      if (res.data.noteUpdated && res.data.updatedNote) {
        onNoteUpdated?.(res.data.updatedNote);
        assistantMessages.push({
          role: 'assistant',
          content: `**Note updated.** ${res.data.updatedNote.change_summary || 'I applied the requested changes to your note.'}`,
        });
      }
      setMessages((prev) => [...prev, ...assistantMessages]);
    } catch (error) {
      console.error('Failed to chat on note', error);
      const fallback =
        error.response?.data?.reply ||
        error.response?.data?.error ||
        'I hit a temporary issue while working on this note. Please try again.';
      setMessages((prev) => [...prev, { role: 'assistant', content: fallback }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm ${compact ? 'min-h-0' : 'h-[48rem]'}`}>
      <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-sky-100 text-indigo-600">
            <Bot size={18} />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900">Notes Chat</h3>
            <p className="text-xs font-medium text-slate-500">
              {note ? `Ask questions about ${note.title} or tell me to rewrite, improve, shorten, expand, or reorganize it.` : 'Save or open a note to begin chatting'}
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {!note ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <Bot size={22} className="text-slate-400" />
            <p className="mt-4 text-sm font-semibold text-slate-900">No active note selected</p>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-500">Open, generate, or upload a note and the dedicated chat will appear here.</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <Sparkles size={22} className="text-indigo-500" />
            <p className="mt-4 text-sm font-semibold text-slate-900">This note is agent-ready</p>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-500">Ask for summaries, examples, flashcards, or tell the AI to directly improve and rewrite the note for you.</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => (
              <motion.div key={`${msg.role}-${index}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex max-w-[90%] gap-3 ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-indigo-100 text-indigo-600'}`}>{msg.role === 'user' ? 'U' : <Bot size={14} />}</div>
                <div className={`rounded-2xl border p-4 text-sm font-medium leading-7 shadow-sm ${msg.role === 'user' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700'}`}>
                  {msg.role === 'assistant' ? (
                    <ReactMarkdown components={{ p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />, ul: ({ node, ...props }) => <ul className="mb-2 list-disc pl-5" {...props} />, strong: ({ node, ...props }) => <strong className="font-bold text-slate-900" {...props} /> }}>
                      {msg.content}
                    </ReactMarkdown>
                  ) : msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        {isTyping ? (
          <div className="flex max-w-[90%] gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600"><Bot size={14} /></div>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-500 shadow-sm">
              <Loader2 size={16} className="animate-spin text-indigo-500" />
              Thinking through your note...
            </div>
          </div>
        ) : null}
        <div ref={endRef} />
      </div>
      <div className="border-t border-slate-100 bg-white p-4">
        <form onSubmit={sendMessage} className="relative">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} disabled={!note} placeholder={note ? 'Ask about this note...' : 'Select or create a note first'} className="w-full rounded-full border border-slate-200 bg-slate-50 px-5 py-4 pr-14 text-sm font-medium text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60" />
          <button type="submit" disabled={!note || !input.trim() || isTyping} className="absolute top-1/2 right-2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-indigo-600 text-white transition-colors hover:bg-indigo-700 disabled:opacity-50">
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

function CardShell({ children }) {
  return <div className="rounded-[2rem] border border-slate-200 bg-white/95 p-10 shadow-sm">{children}</div>;
}

function LoadingState({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
}
