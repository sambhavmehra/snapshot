import React, { useState, useRef, useEffect, useContext } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';

const defaultAssistantMessage = {
  role: 'assistant',
  content: "Hi! I've analyzed your image. What else would you like to know about it?",
};

export default function ChatInterface({
  sessionId,
  initialMessages,
  title = 'Advanced AI Tutor',
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
        {
          messages: nextMessages,
          sessionId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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
    <div className="flex h-[500px] flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
      <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 shadow-sm">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">{title}</h3>
            <p className="flex items-center gap-1 text-xs font-medium text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow shadow-emerald-500/50" />
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4 text-sm font-medium scroll-smooth">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={`${msg.role}-${i}`}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex max-w-[85%] gap-3 ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600'
                }`}
              >
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div
                className={`markdown-content rounded-2xl border p-4 shadow-sm ${
                  msg.role === 'user'
                    ? 'rounded-tr-sm border-indigo-700 bg-indigo-600 text-white'
                    : 'rounded-tl-sm border-slate-100 bg-white text-slate-700'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <ReactMarkdown
                    components={{
                      p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                      strong: ({ node, ...props }) => <strong className="font-bold text-slate-900" {...props} />,
                      code: ({ node, ...props }) => (
                        <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sm text-pink-600" {...props} />
                      ),
                      ul: ({ node, ...props }) => <ul className="mb-2 list-disc pl-4" {...props} />,
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex max-w-[85%] gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 shadow-sm">
                <Bot size={16} />
              </div>
              <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-slate-100 bg-white p-4 text-slate-500 shadow-sm">
                <Loader2 size={16} className="animate-spin text-indigo-500" />
                Thinking deeply...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      <div className="border-t border-slate-50 bg-white p-4">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={sessionId ? 'Ask a deeper question...' : 'Select a session to continue the chat'}
            disabled={!sessionId}
            className="w-full rounded-full border border-slate-200 bg-slate-50/50 py-4 pl-6 pr-14 font-medium text-slate-800 transition-all placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping || !sessionId}
            className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md transition-colors hover:bg-indigo-700 hover:shadow-lg active:scale-95 disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

function normalizeMessages(initialMessages) {
  return initialMessages && initialMessages.length > 0 ? initialMessages : [defaultAssistantMessage];
}
