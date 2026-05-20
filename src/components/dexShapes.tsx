import type { ColorOverride } from './CreatureSVG';

const BG_DEFS = (
  <defs>
    <linearGradient id="shape-bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#fdfaf0" />
      <stop offset="1" stopColor="#f0ead7" />
    </linearGradient>
    <linearGradient id="shape-bg-water" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#bfe1ee" />
      <stop offset="1" stopColor="#5a8ab4" />
    </linearGradient>
    <linearGradient id="shape-bg-ice" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#d8e9f0" />
      <stop offset="1" stopColor="#f5f1e3" />
    </linearGradient>
  </defs>
);

export function OctopusShape({ colors }: { colors: ColorOverride }) {
  const tentacles = [
    { sx: 155, sy: 175, c1x: 90,  c1y: 195, c2x: 50,  c2y: 250, ex: 30,  ey: 270 },
    { sx: 170, sy: 185, c1x: 130, c1y: 230, c2x: 110, c2y: 270, ex: 95,  ey: 290 },
    { sx: 185, sy: 190, c1x: 175, c1y: 240, c2x: 155, c2y: 280, ex: 160, ey: 290 },
    { sx: 200, sy: 192, c1x: 205, c1y: 245, c2x: 205, c2y: 280, ex: 210, ey: 295 },
    { sx: 215, sy: 190, c1x: 225, c1y: 240, c2x: 245, c2y: 280, ex: 250, ey: 290 },
    { sx: 230, sy: 185, c1x: 270, c1y: 230, c2x: 290, c2y: 270, ex: 305, ey: 290 },
    { sx: 245, sy: 175, c1x: 310, c1y: 195, c2x: 350, c2y: 250, ex: 370, ey: 270 },
    { sx: 200, sy: 190, c1x: 220, c1y: 250, c2x: 235, c2y: 285, ex: 230, ey: 295 },
  ];

  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      {BG_DEFS}
      <rect width="400" height="300" fill="url(#shape-bg-water)" opacity="0.85" />

      {tentacles.map((t, i) => (
        <g key={i}>
          <path d={`M ${t.sx} ${t.sy} C ${t.c1x} ${t.c1y}, ${t.c2x} ${t.c2y}, ${t.ex} ${t.ey}`} stroke={colors.shade} strokeWidth="22" fill="none" strokeLinecap="round" />
          <path d={`M ${t.sx} ${t.sy} C ${t.c1x} ${t.c1y}, ${t.c2x} ${t.c2y}, ${t.ex} ${t.ey}`} stroke={colors.main} strokeWidth="18" fill="none" strokeLinecap="round" />
          <path d={`M ${t.sx} ${t.sy} C ${t.c1x} ${t.c1y}, ${t.c2x} ${t.c2y}, ${t.ex} ${t.ey}`} stroke={colors.light} strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray="3 14" opacity="0.55" />
        </g>
      ))}

      <ellipse cx="200" cy="125" rx="86" ry="70" fill={colors.shade} />
      <ellipse cx="200" cy="120" rx="80" ry="64" fill={colors.main} />
      <ellipse cx="175" cy="80" rx="40" ry="22" fill="white" opacity="0.35" />
      <ellipse cx="180" cy="100" rx="55" ry="30" fill={colors.light} opacity="0.45" />

      <g className="eye-blink" style={{ transformOrigin: '170px 130px' }}>
        <circle cx="170" cy="130" r="13" fill="white" stroke="#222" strokeWidth="0.7" />
        <ellipse cx="170" cy="130" rx="6" ry="11" fill="#1a1a1a" />
        <circle cx="173" cy="124" r="3.5" fill="white" />
      </g>
      <g className="eye-blink" style={{ transformOrigin: '230px 130px' }}>
        <circle cx="230" cy="130" r="13" fill="white" stroke="#222" strokeWidth="0.7" />
        <ellipse cx="230" cy="130" rx="6" ry="11" fill="#1a1a1a" />
        <circle cx="233" cy="124" r="3.5" fill="white" />
      </g>

      <path d="M 184 158 Q 200 168 216 158" stroke="#3a2118" strokeWidth="2.2" fill="none" strokeLinecap="round" />

      <ellipse cx="200" cy="285" rx="120" ry="6" fill="rgba(0,0,0,0.18)" />
    </svg>
  );
}

export function WhaleShape({ colors }: { colors: ColorOverride }) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      {BG_DEFS}
      <rect width="400" height="300" fill="url(#shape-bg-water)" opacity="0.85" />

      <g opacity="0.5">
        <line x1="40" y1="50" x2="60" y2="46" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <line x1="120" y1="42" x2="140" y2="46" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <line x1="230" y1="48" x2="252" y2="44" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <line x1="320" y1="44" x2="342" y2="50" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </g>

      <g opacity="0.55" className="bob-breathe" style={{ transformOrigin: '125px 110px' }}>
        <ellipse cx="125" cy="80" rx="22" ry="9" fill="#cfeefb" />
        <ellipse cx="115" cy="58" rx="14" ry="6" fill="#cfeefb" opacity="0.85" />
        <ellipse cx="135" cy="55" rx="11" ry="5" fill="#cfeefb" opacity="0.8" />
      </g>

      <ellipse cx="205" cy="178" rx="172" ry="58" fill={colors.shade} />
      <ellipse cx="205" cy="172" rx="166" ry="52" fill={colors.main} />
      <ellipse cx="205" cy="198" rx="150" ry="22" fill={colors.light} opacity="0.7" />
      <ellipse cx="190" cy="142" rx="100" ry="14" fill="white" opacity="0.18" />

      <polygon points="365,172 398,128 398,168 380,178 398,188 398,222 365,180" fill={colors.shade} />
      <polygon points="365,172 392,140 392,168 378,178 392,188 392,212 365,178" fill={colors.main} />

      <ellipse cx="125" cy="215" rx="26" ry="14" fill={colors.shade} transform="rotate(18 125 215)" />

      <ellipse cx="125" cy="125" rx="6" ry="3" fill={colors.shade} />

      <g className="eye-blink" style={{ transformOrigin: '92px 168px' }}>
        <circle cx="92" cy="168" r="5" fill="white" stroke="#222" strokeWidth="0.6" />
        <circle cx="92" cy="168" r="3" fill="#1a1a1a" />
        <circle cx="93" cy="166" r="1.2" fill="white" />
      </g>

      <path d="M 55 185 Q 75 196 110 188" stroke="#3a2118" strokeWidth="2" fill="none" strokeLinecap="round" />
      <line x1="60" y1="184" x2="105" y2="186" stroke="#3a2118" strokeWidth="1" opacity="0.5" />

      <ellipse cx="200" cy="262" rx="150" ry="8" fill="rgba(0,0,0,0.18)" />
    </svg>
  );
}

export function PenguinShape({ colors }: { colors: ColorOverride }) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      {BG_DEFS}
      <rect width="400" height="300" fill="url(#shape-bg-ice)" />

      <ellipse cx="200" cy="290" rx="180" ry="14" fill="white" />
      <ellipse cx="200" cy="285" rx="110" ry="9" fill="rgba(0,0,0,0.15)" />

      <ellipse cx="207" cy="175" rx="78" ry="95" fill={colors.shade} />
      <ellipse cx="200" cy="170" rx="74" ry="90" fill={colors.main} />

      <ellipse cx="200" cy="192" rx="48" ry="72" fill="white" />
      <ellipse cx="200" cy="180" rx="40" ry="50" fill={colors.light} opacity="0.5" />

      <ellipse cx="200" cy="100" rx="55" ry="48" fill={colors.shade} />
      <ellipse cx="200" cy="95" rx="50" ry="44" fill={colors.main} />

      <path d="M 168 95 Q 200 125 232 95 Q 230 80 200 78 Q 170 80 168 95 Z" fill="white" opacity="0.95" />

      <g className="eye-blink" style={{ transformOrigin: '183px 90px' }}>
        <circle cx="183" cy="90" r="6" fill="white" stroke="#222" strokeWidth="0.6" />
        <circle cx="184" cy="90" r="3.8" fill="#1a1a1a" />
        <circle cx="185" cy="87" r="1.5" fill="white" />
      </g>
      <g className="eye-blink" style={{ transformOrigin: '217px 90px' }}>
        <circle cx="217" cy="90" r="6" fill="white" stroke="#222" strokeWidth="0.6" />
        <circle cx="218" cy="90" r="3.8" fill="#1a1a1a" />
        <circle cx="219" cy="87" r="1.5" fill="white" />
      </g>

      <polygon points="192,115 200,140 208,115" fill="#d8851a" />
      <polygon points="195,118 200,135 205,118" fill="#fa9a30" />
      <line x1="200" y1="118" x2="200" y2="135" stroke="#7a4810" strokeWidth="0.5" />

      <ellipse cx="135" cy="180" rx="16" ry="50" fill={colors.shade} transform="rotate(12 135 180)" />
      <ellipse cx="265" cy="180" rx="16" ry="50" fill={colors.shade} transform="rotate(-12 265 180)" />
      <ellipse cx="133" cy="170" rx="8" ry="30" fill={colors.main} transform="rotate(12 133 170)" />
      <ellipse cx="267" cy="170" rx="8" ry="30" fill={colors.main} transform="rotate(-12 267 170)" />

      <ellipse cx="178" cy="271" rx="22" ry="7" fill="#d8851a" />
      <ellipse cx="222" cy="271" rx="22" ry="7" fill="#d8851a" />
      <line x1="170" y1="271" x2="180" y2="275" stroke="#7a4810" strokeWidth="0.7" />
      <line x1="184" y1="271" x2="196" y2="275" stroke="#7a4810" strokeWidth="0.7" />
      <line x1="214" y1="271" x2="226" y2="275" stroke="#7a4810" strokeWidth="0.7" />
      <line x1="220" y1="271" x2="234" y2="275" stroke="#7a4810" strokeWidth="0.7" />
    </svg>
  );
}
