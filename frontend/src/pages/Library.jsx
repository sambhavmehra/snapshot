import React, { useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';
import { BookOpen, Clock3, FolderOpen, Layers3, Sparkles } from 'lucide-react';

export default function Library() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/sessions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const nextSessions = res.data.sessions || [];
        setSessions(nextSessions);
      } catch (err) {
        console.error('Failed to fetch library sessions', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [token]);

  const groupedItems = useMemo(() => {
    const grouped = new Map();

    sessions.forEach((session) => {
      const key = session.object?.trim()?.toLowerCase() || 'session';
      const current = grouped.get(key);

      if (!current) {
        grouped.set(key, {
          id: session.id,
          title: session.object,
          count: 1,
          latestAt: session.created_at,
        });
      } else {
        current.count += 1;
        if (new Date(session.created_at) > new Date(current.latestAt)) {
          current.latestAt = session.created_at;
          current.id = session.id;
        }
      }
    });

    return Array.from(grouped.values()).sort((a, b) => new Date(b.latestAt) - new Date(a.latestAt));
  }, [sessions]);

  return (
    <Layout>
      <div className="mx-auto w-full max-w-6xl pb-12">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">My Library</h1>
            <p className="font-medium text-slate-500">View your study material grouped by topic and open previous chats on the dashboard.</p>
          </div>
        </div>

        {loading ? (
          <CardShell>
            <LoadingState label="Loading library..." />
          </CardShell>
        ) : groupedItems.length === 0 ? (
          <CardShell>
            <div className="text-center">
              <FolderOpen size={28} className="mx-auto text-slate-400" />
              <h2 className="mt-4 text-xl font-extrabold text-slate-900">Your library is empty</h2>
              <p className="mt-2 text-sm font-medium text-slate-500">
                Upload something from the dashboard and it will start appearing here as part of your study collection.
              </p>
            </div>
          </CardShell>
        ) : (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {groupedItems.map((item) => (
              <div key={item.title} className="rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-indigo-600">
                  <Layers3 size={20} />
                </div>
                <h2 className="text-xl font-extrabold capitalize text-slate-900">{item.title}</h2>
                <div className="mt-4 space-y-2 text-sm font-medium text-slate-500">
                  <p>{item.count} session{item.count > 1 ? 's' : ''} in this topic</p>
                  <p className="flex items-center gap-2">
                    <Clock3 size={14} />
                    Last studied {new Date(item.latestAt).toLocaleDateString()}
                  </p>
                </div>
                <Link
                  to={`/notes?mode=ai&session=${item.id}`}
                  className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800"
                >
                  <Sparkles size={16} />
                  Open Notes Workspace
                </Link>
              </div>
            ))}
          </section>
        )}
      </div>
    </Layout>
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
