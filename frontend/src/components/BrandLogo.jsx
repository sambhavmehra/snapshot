import React from 'react';

export default function BrandLogo({ size = 'md', withWordmark = true, className = '' }) {
  const sizeMap = {
    sm: {
      wrap: 'h-9 w-9 rounded-2xl',
      dot: 'h-2.5 w-2.5',
      ring: 'h-5.5 w-5.5',
      text: 'text-lg',
    },
    md: {
      wrap: 'h-11 w-11 rounded-[1.35rem]',
      dot: 'h-3 w-3',
      ring: 'h-6.5 w-6.5',
      text: 'text-xl',
    },
    lg: {
      wrap: 'h-14 w-14 rounded-[1.6rem]',
      dot: 'h-3.5 w-3.5',
      ring: 'h-8 w-8',
      text: 'text-2xl',
    },
  };

  const token = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className={`relative flex items-center justify-center overflow-hidden border border-white/20 bg-[linear-gradient(135deg,#081226_0%,#102a5c_48%,#34c5ff_100%)] shadow-[0_18px_45px_rgba(22,78,255,0.28)] ${token.wrap}`}>
        <div className={`absolute rounded-full border border-white/35 ${token.ring}`} />
        <div className={`rounded-full bg-white shadow-[0_0_22px_rgba(255,255,255,0.9)] ${token.dot}`} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.4),transparent_52%)]" />
      </div>
      {withWordmark ? (
        <div className="min-w-0">
          <div className={`font-black tracking-tight text-slate-950 ${token.text}`}>SnapStudy</div>
          <div className="text-[10px] font-bold uppercase tracking-[0.34em] text-sky-600">Visual Intelligence</div>
        </div>
      ) : null}
    </div>
  );
}
