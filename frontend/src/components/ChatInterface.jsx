"use client";
import React, { useState, useRef, useEffect, useContext } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { AuthContext } from '@/context/AuthContext';
import ReactMarkdown from 'react-markdown';

const defaultAssistantMessage = {
  role: 'assistant',
  content: "Hi! I've analyzed your image. What else would you like to know about it?",
};

export default function ChatInterface({
  sessionId,
  initialMessages,
  title = 'AI Tutor',
  subtitle = 'Online',
}) {
  const [messages, setMessages] = useState(() => normalizeMessages(initialMessages));
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef(null);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    setMessages(normalizeMessages(initialMessages));
  }, [initialMessages, sessionId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping || !sessionId) return;

    const userMsg = { role: 'user', content: input };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setIsTyping(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/chat',
        { messages: nextMessages, sessionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) => [...prev, { role: 'assistant', content: response.data.reply }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Oops, I encountered an error while trying to answer that.' },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-[600px] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/8 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-white/6 px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-[1rem] bg-[linear-gradient(135deg,#0f172a_0%,#1447b8_58%,#38bdf8_100%)] text-white shadow-lg shadow-blue-900/20">
          <Bot size={18} />
        </div>
        <div>
          <h3 className="font-extrabold text-white">{title}</h3>
          <p className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow shadow-emerald-400/60" />
            {subtitle}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4 text-sm font-medium scroll-smooth">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={`${msg.role}-${i}`}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex max-w-[88%] gap-2.5 ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-[linear-gradient(135deg,#1447b8,#38bdf8)] text-white'
                    : 'border border-white/10 bg-white/10 text-sky-200'
                }`}
              >
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div
                className={`rounded-2xl border px-4 py-3 shadow-sm ${
                  msg.role === 'user'
                    ? 'rounded-tr-sm border-blue-500/30 bg-[linear-gradient(135deg,#0f172a,#1e3a8a)] text-white'
                    : 'rounded-tl-sm border-white/10 bg-white/8 text-slate-100'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <ReactMarkdown
                    components={{
                      p: ({ node, ...props }) => <p className="mb-2 last:mb-0 leading-7" {...props} />,
                      strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
                      code: ({ node, ...props }) => (
                        <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-sky-300" {...props} />
                      ),
                      ul: ({ node, ...props }) => <ul className="mb-2 list-disc pl-4 space-y-1" {...props} />,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex max-w-[85%] gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 text-sky-200 shadow-sm">
                <Bot size={14} />
              </div>
              <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-white/10 bg-white/8 px-4 py-3 text-slate-300 shadow-sm">
                <Loader2 size={14} className="animate-spin text-sky-400" />
                Thinking...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-white/10 bg-white/6 p-4">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={sessionId ? 'Ask a deeper question...' : 'Upload an image to start chatting'}
            disabled={!sessionId}
            className="w-full rounded-full border border-white/10 bg-white/8 py-3.5 pl-5 pr-14 font-medium text-white transition-all placeholder:text-slate-400 focus:border-sky-400/40 focus:bg-white/12 focus:outline-none focus:ring-4 focus:ring-sky-400/10 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping || !sessionId}
            className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#1447b8,#38bdf8)] text-white shadow-lg transition-transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

function normalizeMessages(initialMessages) {
  return initialMessages && initialMessages.length > 0 ? initialMessages : [defaultAssistantMessage];
}
