import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Lightbulb, Target, Info, Sparkles } from 'lucide-react';

export default function AnalysisResult({ data }) {
  if (!data) return null;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {data.sensitiveData && (
        <motion.div variants={item} className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 text-red-800">
          <div className="shrink-0 mt-0.5">
            <Info size={18} className="text-red-500" />
          </div>
          <div>
            <h4 className="font-bold text-sm mb-1">Privacy Warning</h4>
            <p className="text-sm text-red-700/90">{data.sensitiveData}</p>
          </div>
        </motion.div>
      )}

      <motion.div variants={item} className="glass rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary-500"></div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
            <Target size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 capitalize">{data.object}</h2>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Identified Subject</p>
          </div>
        </div>
        <p className="text-slate-700 leading-relaxed font-medium">{data.description}</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={item} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={20} className="text-blue-500" />
            <h3 className="font-bold text-lg text-slate-800">Contextual Learning</h3>
          </div>
          <p className="text-slate-600 leading-relaxed">{data.context}</p>
        </motion.div>

        <motion.div variants={item} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <Info size={20} className="text-emerald-500" />
            <h3 className="font-bold text-lg text-slate-800">Practical Uses</h3>
          </div>
          <ul className="space-y-3">
            {data.uses && data.uses.map((use, i) => (
              <li key={i} className="flex gap-3 text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></span>
                <span>{use}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      <motion.div variants={item} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 border border-amber-100/50">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={20} className="text-amber-500" />
          <h3 className="font-bold text-lg text-amber-900">Smart Insights</h3>
        </div>
        <p className="text-amber-800/80 leading-relaxed">{data.advice}</p>
      </motion.div>
    </motion.div>
  );
}
