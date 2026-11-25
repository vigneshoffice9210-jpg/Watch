import { useId } from 'react';

// Basha Gadgets brand marks, drawn as inline SVG so they stay sharp at any size
// and use the page's web fonts (Saira Condensed / Montserrat).

const DIAL_TICKS = [0, 1, 2, 3, 4, 6, 8, 9, 10, 11]; // 5 and 7 o'clock sit behind the tagline

/** Full lockup: chrome clock ring, BASHA GADGETS banner, PREMIUM WATCHES. */
export function BrandMark({ className, animated = false, title = 'Basha Gadgets — Premium Watches' }) {
  const id = useId().replace(/:/g, '');
  const cx = 500, cy = 240, r = 232;
  return (
    <svg viewBox="0 0 1000 520" className={className} role="img" aria-label={title}>
      <defs>
        <linearGradient id={`ring${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".22" stopColor="#c9ced6" />
          <stop offset=".45" stopColor="#e3202b" />
          <stop offset=".62" stopColor="#7d0910" />
          <stop offset=".85" stopColor="#d7dbe1" />
          <stop offset="1" stopColor="#8d939c" />
        </linearGradient>
        <linearGradient id={`chrome${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".42" stopColor="#e6e9ee" />
          <stop offset=".52" stopColor="#8e959f" />
          <stop offset=".7" stopColor="#f4f6f8" />
          <stop offset="1" stopColor="#aeb4bd" />
        </linearGradient>
        <linearGradient id={`red${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff6a60" />
          <stop offset=".45" stopColor="#e3202b" />
          <stop offset=".55" stopColor="#9e0c15" />
          <stop offset=".85" stopColor="#e3202b" />
          <stop offset="1" stopColor="#ff4b42" />
        </linearGradient>
        <radialGradient id={`dial${id}`} cx=".5" cy=".45" r=".55">
          <stop offset="0" stopColor="#3a0a0e" />
          <stop offset="1" stopColor="#120507" />
        </radialGradient>
        <filter id={`glow${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="9" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* dial + ring */}
      <circle cx={cx} cy={cy} r={r - 10} fill={`url(#dial${id})`} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e3202b" strokeWidth="10" opacity=".55" filter={`url(#glow${id})`} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={`url(#ring${id})`} strokeWidth="18" />
      <circle cx={cx} cy={cy} r={r - 14} fill="none" stroke="#e3202b" strokeWidth="2" opacity=".7" />

      {/* hour ticks */}
      {DIAL_TICKS.map((h) => {
        const a = (h / 12) * Math.PI * 2;
        const s = Math.sin(a), c = -Math.cos(a);
        const r1 = h % 3 === 0 ? 168 : 180, r2 = 202;
        return <line key={h} x1={cx + s * r1} y1={cy + c * r1} x2={cx + s * r2} y2={cy + c * r2} stroke={`url(#chrome${id})`} strokeWidth={h % 3 === 0 ? 7 : 5} strokeLinecap="round" />;
      })}

      {/* banner */}
      <polygon points="92,232 942,232 910,372 60,372" fill="#e3202b" opacity=".5" filter={`url(#glow${id})`} />
      <polygon points="92,232 942,232 910,372 60,372" fill="#0d0405" stroke="#e3202b" strokeWidth="6" strokeLinejoin="miter" />
      <polygon points="104,242 928,242 900,362 72,362" fill="none" stroke="#ffffff" strokeOpacity=".18" strokeWidth="1.5" />
      <text x="500" y="345" textAnchor="middle" fontFamily='"Saira Condensed", "Arial Narrow", sans-serif' fontWeight="800" fontStyle="italic" fontSize="150" textLength="780" lengthAdjust="spacingAndGlyphs">
        <tspan fill={`url(#chrome${id})`} stroke="#3b3f45" strokeWidth="1.5">BASHA</tspan>
        <tspan fill={`url(#red${id})`} stroke="#4a0509" strokeWidth="1.5">GADGETS</tspan>
      </text>

      {/* hands (drawn over the banner edge, pivot on the dial centre) */}
      <g className={animated ? 'brand-hands' : undefined} style={{ transformOrigin: `${cx}px ${cy}px` }}>
        <polygon points={`${cx - 6},${cy} ${cx},${cy - 6} ${cx - 118},${cy - 98} ${cx - 124},${cy - 100}`} fill={`url(#chrome${id})`} />
        <polygon points={`${cx + 6},${cy} ${cx},${cy - 7} ${cx + 176},${cy - 124} ${cx + 183},${cy - 126}`} fill={`url(#chrome${id})`} />
      </g>
      <circle cx={cx} cy={cy} r="13" fill={`url(#chrome${id})`} stroke="#5a5f66" strokeWidth="2" />
      <circle cx={cx} cy={cy} r="4" fill="#e3202b" />

      {/* tagline */}
      <rect x="250" y="384" width="500" height="54" fill="#0d0405" />
      <line x1="110" y1="412" x2="240" y2="412" stroke="#e9ecf0" strokeWidth="2.5" />
      <line x1="760" y1="412" x2="890" y2="412" stroke="#e9ecf0" strokeWidth="2.5" />
      <text x="500" y="425" textAnchor="middle" fill="#ffffff" fontFamily='"Montserrat", sans-serif' fontWeight="500" fontSize="36" textLength="460" lengthAdjust="spacing">PREMIUM WATCHES</text>
    </svg>
  );
}

/** Compact clock emblem, used for the header logo and favicon. */
export function Emblem({ className }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`er${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".3" stopColor="#c9ced6" />
          <stop offset=".55" stopColor="#e3202b" />
          <stop offset=".8" stopColor="#7d0910" />
          <stop offset="1" stopColor="#c9ced6" />
        </linearGradient>
        <radialGradient id={`ed${id}`} cx=".5" cy=".45" r=".6">
          <stop offset="0" stopColor="#3a0a0e" />
          <stop offset="1" stopColor="#0d0405" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="28" fill={`url(#ed${id})`} stroke={`url(#er${id})`} strokeWidth="4" />
      <circle cx="32" cy="32" r="24.5" fill="none" stroke="#e3202b" strokeWidth=".8" opacity=".8" />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((h) => {
        const a = (h / 12) * Math.PI * 2, s = Math.sin(a), c = -Math.cos(a);
        const r1 = h % 3 === 0 ? 18 : 20.5;
        return <line key={h} x1={32 + s * r1} y1={32 + c * r1} x2={32 + s * 23} y2={32 + c * 23} stroke="#e9ecf0" strokeWidth={h % 3 === 0 ? 1.8 : 1.1} strokeLinecap="round" />;
      })}
      <path d="M32 32 L19 22" stroke="#e9ecf0" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M32 32 L49 19" stroke="#e9ecf0" strokeWidth="1.9" strokeLinecap="round" />
      <circle cx="32" cy="32" r="2.6" fill="#e9ecf0" />
      <circle cx="32" cy="32" r="1" fill="#e3202b" />
    </svg>
  );
}
