import type { ColorOverride } from './CreatureSVG';
import { SnakeShape } from './SnakeShape';
import type { ComponentType } from 'react';

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

export function RaptorShape({ colors }: { colors: ColorOverride }) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      {BG_DEFS}
      <rect width="400" height="300" fill="url(#shape-bg)" />
      <line x1="20" y1="282" x2="380" y2="282" stroke="#b5ad95" strokeWidth="1" strokeDasharray="3 4" />

      <path d="M 110 190 Q 60 175 25 140" stroke={colors.shade} strokeWidth="24" fill="none" strokeLinecap="round" />
      <path d="M 110 190 Q 60 175 25 140" stroke={colors.main} strokeWidth="16" fill="none" strokeLinecap="round" />
      <g stroke={colors.shade} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.7">
        <line x1="75" y1="160" x2="72" y2="150" />
        <line x1="55" y1="148" x2="52" y2="138" />
        <line x1="40" y1="145" x2="35" y2="135" />
      </g>

      <path d="M 175 225 Q 165 250 178 275" stroke={colors.shade} strokeWidth="20" fill="none" strokeLinecap="round" />
      <ellipse cx="180" cy="278" rx="14" ry="4" fill="#3a2118" />
      <path d="M 183 278 l 8 -3 M 183 278 l 6 5 M 173 278 l -6 3" stroke="#3a2118" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      <path d="M 205 225 Q 200 250 215 275" stroke={colors.shade} strokeWidth="20" fill="none" strokeLinecap="round" />
      <ellipse cx="215" cy="278" rx="14" ry="4" fill="#3a2118" />
      <path d="M 218 278 l 8 -3 M 218 278 l 6 5 M 208 278 l -6 3" stroke="#3a2118" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      <ellipse cx="185" cy="200" rx="80" ry="34" fill={colors.shade} />
      <ellipse cx="185" cy="195" rx="76" ry="30" fill={colors.main} />
      <ellipse cx="185" cy="216" rx="62" ry="12" fill={colors.light} opacity="0.6" />

      <g stroke={colors.shade} strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.7">
        <path d="M 135 178 l 0 -6" />
        <path d="M 150 174 l 0 -7" />
        <path d="M 165 172 l 0 -8" />
        <path d="M 185 170 l 0 -9" />
        <path d="M 205 172 l 0 -8" />
        <path d="M 225 175 l 0 -7" />
      </g>

      <line x1="235" y1="208" x2="252" y2="226" stroke={colors.shade} strokeWidth="7" strokeLinecap="round" />
      <line x1="252" y1="226" x2="258" y2="232" stroke={colors.shade} strokeWidth="5" strokeLinecap="round" />
      <g stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round" fill="none">
        <path d="M 258 232 l 5 -2" />
        <path d="M 258 232 l 4 4" />
        <path d="M 258 232 l 2 6" />
      </g>

      <path d="M 250 180 Q 275 162 295 168" stroke={colors.shade} strokeWidth="24" fill="none" strokeLinecap="round" />
      <path d="M 250 180 Q 275 162 295 168" stroke={colors.main} strokeWidth="18" fill="none" strokeLinecap="round" />

      <ellipse cx="305" cy="167" rx="34" ry="22" fill={colors.shade} />
      <ellipse cx="303" cy="164" rx="30" ry="19" fill={colors.main} />
      <ellipse cx="330" cy="170" rx="14" ry="9" fill={colors.main} />
      <ellipse cx="330" cy="170" rx="13" ry="8" fill={colors.shade} opacity="0.4" />

      <g fill="white">
        <polygon points="322,178 324,184 326,178" />
        <polygon points="328,179 330,184 332,179" />
        <polygon points="334,179 336,183 338,178" />
      </g>

      <g className="eye-blink" style={{ transformOrigin: '305px 159px' }}>
        <circle cx="305" cy="159" r="6" fill="white" stroke="#222" strokeWidth="0.6" />
        <ellipse cx="306" cy="159" rx="2.6" ry="4.5" fill="#1a1a1a" />
        <circle cx="307" cy="156" r="1.6" fill="white" />
      </g>

      <circle cx="338" cy="166" r="1.6" fill={colors.shade} />

      <ellipse cx="195" cy="285" rx="60" ry="5" fill="rgba(0,0,0,0.22)" />
    </svg>
  );
}

export function TriceratopsShape({ colors }: { colors: ColorOverride }) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      {BG_DEFS}
      <rect width="400" height="300" fill="url(#shape-bg)" />
      <line x1="20" y1="282" x2="380" y2="282" stroke="#b5ad95" strokeWidth="1" strokeDasharray="3 4" />

      <path d="M 80 205 Q 50 200 28 210" stroke={colors.shade} strokeWidth="26" fill="none" strokeLinecap="round" />
      <path d="M 80 205 Q 50 200 28 210" stroke={colors.main} strokeWidth="18" fill="none" strokeLinecap="round" />

      <rect x="100" y="220" width="22" height="55" fill={colors.shade} rx="5" />
      <rect x="155" y="220" width="22" height="55" fill={colors.shade} rx="5" />
      <rect x="220" y="220" width="22" height="55" fill={colors.shade} rx="5" />
      <rect x="265" y="220" width="22" height="55" fill={colors.shade} rx="5" />
      <ellipse cx="111" cy="278" rx="15" ry="4" fill="#3a2118" />
      <ellipse cx="166" cy="278" rx="15" ry="4" fill="#3a2118" />
      <ellipse cx="231" cy="278" rx="15" ry="4" fill="#3a2118" />
      <ellipse cx="276" cy="278" rx="15" ry="4" fill="#3a2118" />

      <ellipse cx="195" cy="195" rx="115" ry="50" fill={colors.shade} />
      <ellipse cx="195" cy="190" rx="110" ry="44" fill={colors.main} />
      <ellipse cx="195" cy="220" rx="92" ry="14" fill={colors.light} opacity="0.55" />
      <ellipse cx="170" cy="160" rx="60" ry="14" fill="white" opacity="0.18" />

      <ellipse cx="300" cy="180" rx="55" ry="62" fill={colors.shade} />
      <ellipse cx="300" cy="180" rx="48" ry="55" fill={colors.main} />
      <g fill={colors.shade}>
        <polygon points="270,128 275,114 282,132" />
        <polygon points="293,122 298,108 305,126" />
        <polygon points="315,126 320,112 327,130" />
        <polygon points="332,138 338,124 343,142" />
      </g>

      <ellipse cx="325" cy="200" rx="36" ry="24" fill={colors.shade} />
      <ellipse cx="324" cy="198" rx="32" ry="21" fill={colors.main} />
      <ellipse cx="345" cy="207" rx="14" ry="10" fill={colors.main} />

      <g fill={colors.shade}>
        <polygon points="346,200 354,180 360,202" />
        <polygon points="312,175 308,140 320,175" />
        <polygon points="340,175 346,140 352,175" />
      </g>
      <g fill={colors.light} opacity="0.4">
        <polygon points="313,170 309,148 318,170" />
        <polygon points="341,170 347,148 350,170" />
      </g>

      <g className="eye-blink" style={{ transformOrigin: '322px 193px' }}>
        <circle cx="322" cy="193" r="5" fill="white" stroke="#222" strokeWidth="0.6" />
        <circle cx="323" cy="193" r="3" fill="#1a1a1a" />
        <circle cx="324" cy="191" r="1.3" fill="white" />
      </g>

      <path d="M 345 213 L 358 213" stroke="#3a2118" strokeWidth="2" strokeLinecap="round" />
      <circle cx="354" cy="208" r="1.2" fill={colors.shade} />

      <ellipse cx="200" cy="287" rx="135" ry="6" fill="rgba(0,0,0,0.2)" />
    </svg>
  );
}

export function StegosaurusShape({ colors }: { colors: ColorOverride }) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      {BG_DEFS}
      <rect width="400" height="300" fill="url(#shape-bg)" />
      <line x1="20" y1="282" x2="380" y2="282" stroke="#b5ad95" strokeWidth="1" strokeDasharray="3 4" />

      <path d="M 85 215 Q 50 230 22 252" stroke={colors.shade} strokeWidth="22" fill="none" strokeLinecap="round" />
      <path d="M 85 215 Q 50 230 22 252" stroke={colors.main} strokeWidth="14" fill="none" strokeLinecap="round" />
      <g fill={colors.shade}>
        <polygon points="32,250 16,228 38,247" />
        <polygon points="46,253 30,232 52,250" />
        <polygon points="40,260 50,278 56,255" />
        <polygon points="52,260 64,278 66,255" />
      </g>

      <rect x="100" y="218" width="22" height="58" fill={colors.shade} rx="5" />
      <rect x="142" y="225" width="20" height="51" fill={colors.shade} rx="5" />
      <rect x="225" y="220" width="22" height="56" fill={colors.shade} rx="5" />
      <rect x="265" y="225" width="20" height="51" fill={colors.shade} rx="5" />
      <ellipse cx="111" cy="278" rx="15" ry="4" fill="#3a2118" />
      <ellipse cx="152" cy="278" rx="14" ry="4" fill="#3a2118" />
      <ellipse cx="236" cy="278" rx="15" ry="4" fill="#3a2118" />
      <ellipse cx="275" cy="278" rx="14" ry="4" fill="#3a2118" />

      <path d="M 88 220 Q 88 175 110 165 Q 160 130 200 130 Q 240 130 270 165 Q 295 175 295 220 Z" fill={colors.shade} />
      <path d="M 93 218 Q 93 175 113 167 Q 162 135 200 135 Q 238 135 268 167 Q 290 175 290 218 Z" fill={colors.main} />
      <ellipse cx="195" cy="208" rx="90" ry="16" fill={colors.light} opacity="0.55" />

      <g stroke={colors.shade} strokeWidth="1.2">
        <polygon points="115,160 130,128 145,160" fill={colors.main} />
        <polygon points="150,148 165,112 180,148" fill={colors.main} />
        <polygon points="185,138 200,98 215,138" fill={colors.main} />
        <polygon points="220,148 235,112 250,148" fill={colors.main} />
        <polygon points="253,160 265,128 277,160" fill={colors.main} />
      </g>
      <g fill={colors.light} opacity="0.45">
        <polygon points="120,155 130,134 140,155" />
        <polygon points="156,144 165,118 174,144" />
        <polygon points="191,134 200,104 209,134" />
        <polygon points="226,144 235,118 244,144" />
        <polygon points="258,155 265,134 272,155" />
      </g>

      <ellipse cx="298" cy="205" rx="22" ry="14" fill={colors.shade} />
      <ellipse cx="297" cy="203" rx="19" ry="12" fill={colors.main} />
      <ellipse cx="316" cy="208" rx="12" ry="8" fill={colors.main} />

      <g className="eye-blink" style={{ transformOrigin: '297px 200px' }}>
        <circle cx="297" cy="200" r="3.5" fill="white" stroke="#222" strokeWidth="0.5" />
        <circle cx="298" cy="200" r="2" fill="#1a1a1a" />
      </g>
      <path d="M 313 212 L 323 213" stroke="#3a2118" strokeWidth="1.5" strokeLinecap="round" />

      <ellipse cx="195" cy="287" rx="130" ry="6" fill="rgba(0,0,0,0.2)" />
    </svg>
  );
}

export function PterodactylShape({ colors }: { colors: ColorOverride }) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="ptero-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7fbfe0" />
          <stop offset="1" stopColor="#c4dde8" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#ptero-sky)" />
      <g fill="white" opacity="0.6">
        <ellipse cx="60" cy="60" rx="22" ry="6" />
        <ellipse cx="50" cy="55" rx="14" ry="5" />
        <ellipse cx="330" cy="80" rx="25" ry="7" />
        <ellipse cx="345" cy="76" rx="16" ry="5" />
      </g>

      <path d="M 200 170 L 60 130 L 40 148 L 70 195 L 200 188 Z" fill={colors.shade} />
      <path d="M 200 170 L 70 138 L 60 152 L 80 188 L 200 184 Z" fill={colors.main} />
      <g stroke={colors.shade} strokeWidth="1.5" fill="none" opacity="0.5">
        <line x1="200" y1="170" x2="60" y2="130" />
        <line x1="200" y1="175" x2="80" y2="155" />
        <line x1="200" y1="180" x2="100" y2="178" />
      </g>

      <path d="M 200 170 L 340 130 L 360 148 L 330 195 L 200 188 Z" fill={colors.shade} />
      <path d="M 200 170 L 330 138 L 340 152 L 320 188 L 200 184 Z" fill={colors.main} />
      <g stroke={colors.shade} strokeWidth="1.5" fill="none" opacity="0.5">
        <line x1="200" y1="170" x2="340" y2="130" />
        <line x1="200" y1="175" x2="320" y2="155" />
        <line x1="200" y1="180" x2="300" y2="178" />
      </g>

      <ellipse cx="200" cy="180" rx="22" ry="34" fill={colors.shade} />
      <ellipse cx="200" cy="178" rx="18" ry="30" fill={colors.main} />
      <ellipse cx="195" cy="170" rx="10" ry="14" fill={colors.light} opacity="0.45" />

      <ellipse cx="200" cy="140" rx="22" ry="18" fill={colors.shade} />
      <ellipse cx="200" cy="138" rx="19" ry="15" fill={colors.main} />

      <polygon points="218,132 270,98 220,148" fill={colors.shade} />
      <polygon points="216,134 262,104 218,144" fill={colors.main} />
      <line x1="222" y1="138" x2="262" y2="118" stroke="#3a2118" strokeWidth="0.6" />

      <polygon points="195,125 188,84 210,90 215,120" fill={colors.shade} />
      <polygon points="197,123 191,90 208,94 212,118" fill={colors.main} />

      <g className="eye-blink" style={{ transformOrigin: '207px 137px' }}>
        <circle cx="207" cy="137" r="4" fill="white" stroke="#222" strokeWidth="0.6" />
        <circle cx="208" cy="137" r="2.4" fill="#1a1a1a" />
        <circle cx="209" cy="135" r="1.2" fill="white" />
      </g>

      <line x1="196" y1="212" x2="190" y2="240" stroke={colors.shade} strokeWidth="7" strokeLinecap="round" />
      <line x1="204" y1="212" x2="210" y2="240" stroke={colors.shade} strokeWidth="7" strokeLinecap="round" />
      <path d="M 190 240 l -3 4 l 5 -1 l -2 5 l 5 -2 l -2 5" stroke="#3a2118" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M 210 240 l 3 4 l -5 -1 l 2 5 l -5 -2 l 2 5" stroke="#3a2118" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      <ellipse cx="200" cy="262" rx="80" ry="5" fill="rgba(0,0,0,0.15)" />
    </svg>
  );
}

export function LionShape({ colors }: { colors: ColorOverride }) {
  const maneColor = '#6e4818';
  const maneInner = '#8a5e24';
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      {BG_DEFS}
      <rect width="400" height="300" fill="url(#shape-bg)" />
      <line x1="20" y1="282" x2="380" y2="282" stroke="#b5ad95" strokeWidth="1" strokeDasharray="3 4" />

      <path d="M 90 195 Q 50 175 28 188" stroke={colors.shade} strokeWidth="14" fill="none" strokeLinecap="round" />
      <path d="M 90 195 Q 50 175 28 188" stroke={colors.main} strokeWidth="9" fill="none" strokeLinecap="round" />
      <ellipse cx="24" cy="186" rx="9" ry="11" fill={maneColor} />

      <rect x="105" y="220" width="20" height="58" fill={colors.shade} rx="4" />
      <rect x="148" y="222" width="20" height="56" fill={colors.shade} rx="4" />
      <rect x="220" y="222" width="20" height="56" fill={colors.shade} rx="4" />
      <rect x="262" y="220" width="20" height="58" fill={colors.shade} rx="4" />
      <ellipse cx="115" cy="280" rx="14" ry="4" fill="#3a2118" />
      <ellipse cx="158" cy="280" rx="14" ry="4" fill="#3a2118" />
      <ellipse cx="230" cy="280" rx="14" ry="4" fill="#3a2118" />
      <ellipse cx="272" cy="280" rx="14" ry="4" fill="#3a2118" />

      <ellipse cx="195" cy="195" rx="100" ry="42" fill={colors.shade} />
      <ellipse cx="195" cy="190" rx="95" ry="38" fill={colors.main} />
      <ellipse cx="195" cy="218" rx="78" ry="14" fill={colors.light} opacity="0.55" />
      <ellipse cx="170" cy="160" rx="50" ry="11" fill="white" opacity="0.2" />

      <g>
        <circle cx="295" cy="170" r="56" fill={maneColor} />
        {Array.from({ length: 18 }).map((_, i) => {
          const a = (i / 18) * Math.PI * 2;
          const x = 295 + Math.cos(a) * 60;
          const y = 170 + Math.sin(a) * 60;
          return <circle key={i} cx={x} cy={y} r="10" fill={maneColor} />;
        })}
        <circle cx="295" cy="170" r="48" fill={maneInner} opacity="0.5" />
      </g>

      <circle cx="300" cy="180" r="36" fill={colors.main} />
      <ellipse cx="290" cy="170" rx="22" ry="10" fill={colors.light} opacity="0.5" />

      <ellipse cx="322" cy="187" rx="14" ry="10" fill={colors.main} />
      <ellipse cx="322" cy="187" rx="13" ry="8" fill="#f0c890" opacity="0.4" />
      <ellipse cx="332" cy="183" rx="3" ry="2" fill="#1a1a1a" />

      <g className="eye-blink" style={{ transformOrigin: '290px 175px' }}>
        <circle cx="290" cy="175" r="6" fill="white" stroke="#222" strokeWidth="0.6" />
        <ellipse cx="291" cy="175" rx="3" ry="4.5" fill="#1a1a1a" />
        <circle cx="293" cy="172" r="1.6" fill="white" />
      </g>
      <g className="eye-blink" style={{ transformOrigin: '312px 174px' }}>
        <circle cx="312" cy="174" r="5" fill="white" stroke="#222" strokeWidth="0.6" />
        <ellipse cx="313" cy="174" rx="2.5" ry="3.8" fill="#1a1a1a" />
        <circle cx="314" cy="171" r="1.4" fill="white" />
      </g>

      <path d="M 305 197 Q 315 205 326 200" stroke="#3a2118" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 320 200 Q 327 207 333 200" stroke="#3a2118" strokeWidth="2" fill="none" strokeLinecap="round" />

      <g stroke="#3a2118" strokeWidth="0.7" strokeLinecap="round" fill="none" opacity="0.6">
        <line x1="322" y1="194" x2="345" y2="190" />
        <line x1="322" y1="198" x2="346" y2="198" />
        <line x1="322" y1="202" x2="345" y2="208" />
      </g>

      <polygon points="248,148 252,128 260,148" fill={maneColor} />
      <polygon points="338,148 346,128 350,148" fill={maneColor} />

      <ellipse cx="195" cy="287" rx="125" ry="6" fill="rgba(0,0,0,0.22)" />
    </svg>
  );
}

export function DolphinShape({ colors }: { colors: ColorOverride }) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      {BG_DEFS}
      <rect width="400" height="300" fill="url(#shape-bg-water)" opacity="0.85" />

      <g opacity="0.55">
        <line x1="40" y1="50" x2="62" y2="46" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <line x1="150" y1="42" x2="172" y2="46" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <line x1="270" y1="48" x2="292" y2="44" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </g>
      <g opacity="0.35">
        <ellipse cx="80" cy="240" rx="40" ry="3" fill="white" />
        <ellipse cx="320" cy="250" rx="35" ry="3" fill="white" />
      </g>

      <ellipse cx="195" cy="175" rx="125" ry="40" fill={colors.shade} transform="rotate(-8 195 175)" />
      <ellipse cx="195" cy="170" rx="118" ry="34" fill={colors.main} transform="rotate(-8 195 170)" />
      <ellipse cx="200" cy="195" rx="105" ry="14" fill="white" opacity="0.85" transform="rotate(-8 200 195)" />
      <ellipse cx="180" cy="145" rx="70" ry="10" fill="white" opacity="0.18" transform="rotate(-8 180 145)" />

      <path d="M 190 130 Q 195 80 235 110 Q 215 130 200 140 Z" fill={colors.shade} />
      <path d="M 192 132 Q 198 95 225 115 Q 213 130 200 138 Z" fill={colors.main} />

      <path d="M 305 158 L 380 105 L 372 175 L 340 175 Z" fill={colors.shade} />
      <path d="M 308 162 L 370 115 L 364 168 L 340 172 Z" fill={colors.main} />
      <path d="M 305 188 L 380 230 L 365 195 L 340 188 Z" fill={colors.shade} />
      <path d="M 308 186 L 370 220 L 360 195 L 340 188 Z" fill={colors.main} />

      <ellipse cx="118" cy="210" rx="22" ry="11" fill={colors.shade} transform="rotate(28 118 210)" />
      <ellipse cx="118" cy="208" rx="18" ry="8" fill={colors.main} transform="rotate(28 118 208)" />

      <path d="M 50 175 L 28 168 L 32 178 L 18 178 L 32 185 L 28 195 L 50 188 Z" fill={colors.shade} />
      <path d="M 52 178 L 35 172 L 36 180 L 28 180 L 36 187 L 35 192 L 52 187 Z" fill={colors.main} />

      <line x1="32" y1="178" x2="48" y2="182" stroke="#3a2118" strokeWidth="2" strokeLinecap="round" />
      <path d="M 25 184 q 4 3 12 1" stroke="#3a2118" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      <g className="eye-blink" style={{ transformOrigin: '70px 168px' }}>
        <circle cx="70" cy="168" r="5" fill="white" stroke="#222" strokeWidth="0.6" />
        <circle cx="70" cy="168" r="3" fill="#1a1a1a" />
        <circle cx="72" cy="166" r="1.3" fill="white" />
      </g>

      <ellipse cx="118" cy="135" rx="5" ry="2.5" fill={colors.shade} />
      <g opacity="0.55" className="bob-breathe" style={{ transformOrigin: '118px 120px' }}>
        <ellipse cx="118" cy="100" rx="15" ry="6" fill="#cfeefb" />
        <ellipse cx="112" cy="80" rx="10" ry="4" fill="#cfeefb" opacity="0.8" />
      </g>

      <ellipse cx="200" cy="262" rx="115" ry="7" fill="rgba(0,0,0,0.15)" />
    </svg>
  );
}

export function ChameleonShape({ colors }: { colors: ColorOverride }) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="cham-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d6efc8" />
          <stop offset="1" stopColor="#f0eed0" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#cham-bg)" />
      <g opacity="0.5">
        <ellipse cx="40" cy="60" rx="22" ry="10" fill="#7aa850" />
        <ellipse cx="360" cy="80" rx="26" ry="11" fill="#7aa850" />
        <ellipse cx="60" cy="120" rx="14" ry="6" fill="#7aa850" />
      </g>

      <path d="M 0 245 Q 80 252 200 244 Q 320 236 400 246" stroke="#5a3818" strokeWidth="16" fill="none" />
      <path d="M 0 250 Q 80 257 200 249 Q 320 241 400 251" stroke="#3e2a18" strokeWidth="6" fill="none" opacity="0.6" />

      <path d="M 105 220 C 70 218 50 240 60 258 C 70 272 92 270 95 254 C 96 244 84 244 84 254" stroke={colors.shade} strokeWidth="18" fill="none" strokeLinecap="round" />
      <path d="M 105 220 C 70 218 50 240 60 258 C 70 272 92 270 95 254 C 96 244 84 244 84 254" stroke={colors.main} strokeWidth="13" fill="none" strokeLinecap="round" />

      <path d="M 115 210 Q 130 130 200 130 Q 270 130 285 210 Q 285 232 200 234 Q 115 232 115 210 Z" fill={colors.shade} />
      <path d="M 120 208 Q 135 138 200 138 Q 265 138 280 208 Q 280 229 200 231 Q 120 229 120 208 Z" fill={colors.main} />
      <path d="M 130 218 Q 200 232 270 218 Q 270 226 200 230 Q 130 226 130 218 Z" fill={colors.light} opacity="0.6" />

      <g fill={colors.shade}>
        {[140, 156, 172, 188, 204, 220, 236, 252, 268].map((x) => (
          <polygon key={x} points={`${x - 4},138 ${x},124 ${x + 4},138`} />
        ))}
      </g>

      <g stroke={colors.shade} strokeWidth="2.5" fill="none" opacity="0.45">
        <path d="M 145 218 q 0 -32 6 -65" />
        <path d="M 170 224 q 0 -42 6 -85" />
        <path d="M 200 228 q 0 -45 0 -90" />
        <path d="M 230 224 q 0 -42 -6 -85" />
        <path d="M 255 218 q 0 -32 -6 -65" />
      </g>

      <g>
        <ellipse cx="140" cy="240" rx="14" ry="10" fill={colors.shade} />
        <ellipse cx="140" cy="240" rx="11" ry="8" fill={colors.main} />
        <path d="M 134 244 q -2 6 2 10 M 146 244 q 2 6 -2 10 M 132 240 q -8 4 -10 12 M 148 240 q 8 4 10 12" stroke={colors.shade} strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
      <g>
        <ellipse cx="260" cy="240" rx="14" ry="10" fill={colors.shade} />
        <ellipse cx="260" cy="240" rx="11" ry="8" fill={colors.main} />
        <path d="M 254 244 q -2 6 2 10 M 266 244 q 2 6 -2 10 M 252 240 q -8 4 -10 12 M 268 240 q 8 4 10 12" stroke={colors.shade} strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>

      <ellipse cx="305" cy="175" rx="40" ry="34" fill={colors.shade} />
      <ellipse cx="305" cy="173" rx="36" ry="30" fill={colors.main} />

      <path d="M 280 148 Q 295 102 320 102 Q 340 102 342 152 Q 320 145 280 152 Z" fill={colors.shade} />
      <path d="M 285 146 Q 297 110 318 110 Q 336 110 340 148 Q 318 142 285 148 Z" fill={colors.main} />
      <g fill={colors.shade}>
        <polygon points="290,108 293,98 298,108" />
        <polygon points="305,102 308,90 313,102" />
        <polygon points="320,108 323,98 328,108" />
      </g>

      <ellipse cx="340" cy="188" rx="14" ry="11" fill={colors.main} />
      <ellipse cx="338" cy="184" rx="10" ry="6" fill={colors.light} opacity="0.5" />

      <line x1="352" y1="190" x2="392" y2="178" stroke="#ff5078" strokeWidth="3.5" strokeLinecap="round" />
      <ellipse cx="394" cy="176" rx="8" ry="5" fill="#ff5078" />
      <ellipse cx="394" cy="174" rx="4" ry="2.5" fill="#ff90a0" />

      <g transform="translate(364 158)">
        <ellipse cx="0" cy="0" rx="5" ry="3" fill="#3a2118" />
        <ellipse cx="-5" cy="-2" rx="4" ry="2" fill="white" opacity="0.5" />
        <ellipse cx="5" cy="-2" rx="4" ry="2" fill="white" opacity="0.5" />
      </g>

      <circle cx="292" cy="160" r="16" fill={colors.shade} />
      <circle cx="292" cy="160" r="12" fill={colors.main} />
      <g stroke={colors.shade} strokeWidth="1" fill="none" opacity="0.6">
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <line key={i} x1={292 + Math.cos(a) * 6} y1={160 + Math.sin(a) * 6} x2={292 + Math.cos(a) * 12} y2={160 + Math.sin(a) * 12} />;
        })}
      </g>
      <circle cx="284" cy="160" r="4" fill="#1a1a1a" />
      <circle cx="285" cy="158" r="1.4" fill="white" />

      <circle cx="322" cy="174" r="16" fill={colors.shade} />
      <circle cx="322" cy="174" r="12" fill={colors.main} />
      <g stroke={colors.shade} strokeWidth="1" fill="none" opacity="0.6">
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <line key={i} x1={322 + Math.cos(a) * 6} y1={174 + Math.sin(a) * 6} x2={322 + Math.cos(a) * 12} y2={174 + Math.sin(a) * 12} />;
        })}
      </g>
      <circle cx="330" cy="178" r="4" fill="#1a1a1a" />
      <circle cx="331" cy="176" r="1.4" fill="white" />
    </svg>
  );
}

export function ElephantShape({ colors }: { colors: ColorOverride }) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      {BG_DEFS}
      <rect width="400" height="300" fill="url(#shape-bg)" />
      <line x1="20" y1="282" x2="380" y2="282" stroke="#b5ad95" strokeWidth="1" strokeDasharray="3 4" />

      <path d="M 80 210 Q 50 215 30 230" stroke={colors.shade} strokeWidth="14" fill="none" strokeLinecap="round" />
      <path d="M 80 210 Q 50 215 30 230" stroke={colors.main} strokeWidth="9" fill="none" strokeLinecap="round" />
      <g stroke={colors.shade} strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.65">
        <line x1="30" y1="230" x2="22" y2="240" />
        <line x1="30" y1="230" x2="32" y2="244" />
        <line x1="30" y1="230" x2="42" y2="240" />
      </g>

      <rect x="100" y="218" width="30" height="58" fill={colors.shade} rx="6" />
      <rect x="155" y="220" width="28" height="56" fill={colors.shade} rx="6" />
      <rect x="220" y="220" width="28" height="56" fill={colors.shade} rx="6" />
      <rect x="270" y="218" width="30" height="58" fill={colors.shade} rx="6" />
      <ellipse cx="115" cy="280" rx="18" ry="5" fill="#3a2118" />
      <ellipse cx="169" cy="280" rx="17" ry="5" fill="#3a2118" />
      <ellipse cx="234" cy="280" rx="17" ry="5" fill="#3a2118" />
      <ellipse cx="285" cy="280" rx="18" ry="5" fill="#3a2118" />

      <ellipse cx="195" cy="185" rx="130" ry="55" fill={colors.shade} />
      <ellipse cx="195" cy="180" rx="124" ry="50" fill={colors.main} />
      <ellipse cx="195" cy="210" rx="105" ry="16" fill={colors.light} opacity="0.55" />
      <ellipse cx="175" cy="148" rx="80" ry="12" fill="white" opacity="0.2" />

      <path d="M 295 180 Q 320 155 300 132 Q 270 110 240 122 L 245 162 Z" fill={colors.shade} />
      <path d="M 295 178 Q 318 156 302 134 Q 274 114 248 124 L 250 160 Z" fill={colors.main} />
      <ellipse cx="270" cy="135" rx="22" ry="6" fill="#f4c8b8" opacity="0.5" />

      <path d="M 305 195 Q 320 215 318 245 Q 314 268 306 275 Q 300 268 302 245 Q 304 215 305 195 Z" fill={colors.shade} />
      <path d="M 307 195 Q 320 215 318 245 Q 314 264 308 270 Q 304 264 305 245 Q 306 215 307 195 Z" fill={colors.main} />

      <polygon points="288,228 290,265 296,232" fill="#f0ead0" stroke="#b8a890" strokeWidth="0.6" />
      <polygon points="324,228 322,265 316,232" fill="#f0ead0" stroke="#b8a890" strokeWidth="0.6" />

      <ellipse cx="318" cy="265" rx="1.5" ry="1" fill={colors.shade} />
      <ellipse cx="312" cy="265" rx="1.5" ry="1" fill={colors.shade} />

      <g className="eye-blink" style={{ transformOrigin: '292px 195px' }}>
        <circle cx="292" cy="195" r="5" fill="white" stroke="#222" strokeWidth="0.6" />
        <circle cx="293" cy="195" r="3" fill="#1a1a1a" />
        <circle cx="294" cy="193" r="1.2" fill="white" />
      </g>

      <ellipse cx="195" cy="287" rx="135" ry="6" fill="rgba(0,0,0,0.22)" />
    </svg>
  );
}

export function GorillaShape({ colors }: { colors: ColorOverride }) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      {BG_DEFS}
      <rect width="400" height="300" fill="url(#shape-bg)" />
      <line x1="20" y1="282" x2="380" y2="282" stroke="#b5ad95" strokeWidth="1" strokeDasharray="3 4" />

      <rect x="155" y="200" width="32" height="78" fill={colors.shade} rx="8" />
      <rect x="215" y="200" width="32" height="78" fill={colors.shade} rx="8" />
      <ellipse cx="170" cy="280" rx="20" ry="6" fill="#1a1a1a" />
      <ellipse cx="231" cy="280" rx="20" ry="6" fill="#1a1a1a" />

      <path d="M 130 180 Q 105 230 90 270" stroke={colors.shade} strokeWidth="34" fill="none" strokeLinecap="round" />
      <path d="M 130 180 Q 105 230 90 270" stroke={colors.main} strokeWidth="26" fill="none" strokeLinecap="round" />
      <ellipse cx="90" cy="270" rx="16" ry="10" fill={colors.shade} />

      <path d="M 270 180 Q 295 230 310 270" stroke={colors.shade} strokeWidth="34" fill="none" strokeLinecap="round" />
      <path d="M 270 180 Q 295 230 310 270" stroke={colors.main} strokeWidth="26" fill="none" strokeLinecap="round" />
      <ellipse cx="310" cy="270" rx="16" ry="10" fill={colors.shade} />

      <ellipse cx="200" cy="190" rx="80" ry="78" fill={colors.shade} />
      <ellipse cx="200" cy="185" rx="74" ry="72" fill={colors.main} />
      <ellipse cx="200" cy="215" rx="56" ry="40" fill="#5a4a4a" opacity="0.55" />

      <ellipse cx="200" cy="110" rx="50" ry="44" fill={colors.shade} />
      <ellipse cx="200" cy="108" rx="46" ry="40" fill={colors.main} />

      <ellipse cx="200" cy="135" rx="40" ry="26" fill="#7a6050" />
      <ellipse cx="200" cy="135" rx="35" ry="22" fill="#9a7868" />

      <path d="M 150 88 Q 200 50 250 88" stroke={colors.shade} strokeWidth="12" fill="none" strokeLinecap="round" />

      <circle cx="158" cy="108" r="9" fill={colors.shade} />
      <circle cx="242" cy="108" r="9" fill={colors.shade} />

      <g className="eye-blink" style={{ transformOrigin: '184px 122px' }}>
        <circle cx="184" cy="122" r="5" fill="white" stroke="#222" strokeWidth="0.6" />
        <circle cx="185" cy="122" r="3" fill="#1a1a1a" />
        <circle cx="186" cy="120" r="1.2" fill="white" />
      </g>
      <g className="eye-blink" style={{ transformOrigin: '216px 122px' }}>
        <circle cx="216" cy="122" r="5" fill="white" stroke="#222" strokeWidth="0.6" />
        <circle cx="217" cy="122" r="3" fill="#1a1a1a" />
        <circle cx="218" cy="120" r="1.2" fill="white" />
      </g>

      <ellipse cx="195" cy="138" rx="2.5" ry="2" fill="#1a1a1a" />
      <ellipse cx="205" cy="138" rx="2.5" ry="2" fill="#1a1a1a" />

      <path d="M 188 148 Q 200 156 212 148" stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round" />

      <ellipse cx="200" cy="287" rx="120" ry="6" fill="rgba(0,0,0,0.22)" />
    </svg>
  );
}

export function CamelShape({ colors }: { colors: ColorOverride }) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="camel-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd589" />
          <stop offset="1" stopColor="#fbe9b0" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#camel-sky)" />
      <path d="M 0 282 Q 200 270 400 282 L 400 300 L 0 300 Z" fill="#e3b06a" />
      <ellipse cx="60" cy="285" rx="40" ry="6" fill="#c89a5a" opacity="0.7" />
      <ellipse cx="340" cy="288" rx="50" ry="6" fill="#c89a5a" opacity="0.7" />
      <circle cx="80" cy="50" r="20" fill="#ffb84a" opacity="0.7" />

      <path d="M 90 215 Q 80 250 88 280" stroke={colors.shade} strokeWidth="18" fill="none" strokeLinecap="round" />
      <path d="M 120 215 Q 112 250 120 280" stroke={colors.shade} strokeWidth="18" fill="none" strokeLinecap="round" />
      <path d="M 230 215 Q 222 250 230 280" stroke={colors.shade} strokeWidth="18" fill="none" strokeLinecap="round" />
      <path d="M 260 215 Q 252 250 260 280" stroke={colors.shade} strokeWidth="18" fill="none" strokeLinecap="round" />

      <ellipse cx="90" cy="282" rx="14" ry="5" fill="#3a2118" />
      <ellipse cx="120" cy="282" rx="14" ry="5" fill="#3a2118" />
      <ellipse cx="230" cy="282" rx="14" ry="5" fill="#3a2118" />
      <ellipse cx="260" cy="282" rx="14" ry="5" fill="#3a2118" />

      <ellipse cx="180" cy="200" rx="105" ry="38" fill={colors.shade} />
      <ellipse cx="180" cy="196" rx="100" ry="34" fill={colors.main} />

      <path d="M 130 195 Q 155 130 215 195 Z" fill={colors.shade} />
      <path d="M 134 195 Q 158 138 212 195 Z" fill={colors.main} />
      <ellipse cx="170" cy="160" rx="32" ry="6" fill={colors.light} opacity="0.5" />

      <path d="M 90 200 L 70 195 L 75 210 Z" fill={colors.shade} />
      <path d="M 85 198 L 75 196 L 78 207 Z" fill={colors.main} />

      <path d="M 270 198 Q 305 165 320 130" stroke={colors.shade} strokeWidth="26" fill="none" strokeLinecap="round" />
      <path d="M 270 198 Q 305 165 320 130" stroke={colors.main} strokeWidth="20" fill="none" strokeLinecap="round" />

      <ellipse cx="328" cy="118" rx="22" ry="18" fill={colors.shade} />
      <ellipse cx="326" cy="116" rx="19" ry="15" fill={colors.main} />

      <ellipse cx="345" cy="120" rx="12" ry="9" fill={colors.main} />
      <ellipse cx="354" cy="122" rx="2.5" ry="2" fill="#3a2118" />
      <ellipse cx="354" cy="116" rx="2.5" ry="1.5" fill="#3a2118" />

      <polygon points="312,98 314,82 320,100" fill={colors.shade} />
      <polygon points="332,98 334,82 326,100" fill={colors.shade} />

      <g className="eye-blink" style={{ transformOrigin: '322px 112px' }}>
        <circle cx="322" cy="112" r="3.5" fill="white" stroke="#222" strokeWidth="0.5" />
        <circle cx="323" cy="112" r="2.2" fill="#1a1a1a" />
      </g>

      <path d="M 340 130 L 348 128" stroke="#3a2118" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function OstrichShape({ colors }: { colors: ColorOverride }) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      {BG_DEFS}
      <rect width="400" height="300" fill="url(#shape-bg)" />
      <line x1="20" y1="282" x2="380" y2="282" stroke="#b5ad95" strokeWidth="1" strokeDasharray="3 4" />

      <path d="M 178 220 Q 168 250 180 278" stroke="#e8a060" strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d="M 222 220 Q 232 250 220 278" stroke="#e8a060" strokeWidth="10" fill="none" strokeLinecap="round" />
      <g fill="#d8851a">
        <polygon points="172,278 184,272 184,284" />
        <polygon points="184,278 196,272 196,284" />
        <polygon points="204,278 216,272 216,284" />
        <polygon points="216,278 228,272 228,284" />
      </g>

      <ellipse cx="200" cy="210" rx="65" ry="65" fill={colors.shade} />
      <ellipse cx="200" cy="205" rx="60" ry="60" fill={colors.main} />
      <ellipse cx="195" cy="170" rx="35" ry="14" fill={colors.light} opacity="0.4" />

      <g stroke={colors.shade} strokeWidth="1.5" fill="none" opacity="0.55" strokeLinecap="round">
        <path d="M 160 200 q 6 8 0 16" />
        <path d="M 175 195 q 6 9 0 17" />
        <path d="M 195 195 q 6 9 0 17" />
        <path d="M 215 195 q 6 9 0 17" />
        <path d="M 235 200 q 6 8 0 16" />
        <path d="M 168 220 q 6 9 0 17" />
        <path d="M 188 220 q 6 9 0 17" />
        <path d="M 210 220 q 6 9 0 17" />
        <path d="M 230 220 q 6 8 0 16" />
      </g>

      <path d="M 142 252 Q 110 270 95 278 Q 115 268 138 248" fill={colors.shade} />
      <path d="M 250 248 Q 280 270 295 278 Q 275 268 252 244" fill={colors.shade} />

      <path d="M 240 175 Q 280 90 285 50" stroke={colors.shade} strokeWidth="14" fill="none" strokeLinecap="round" />
      <path d="M 240 175 Q 280 90 285 50" stroke={colors.light} strokeWidth="10" fill="none" strokeLinecap="round" opacity="0.7" />

      <ellipse cx="284" cy="44" rx="18" ry="14" fill={colors.shade} />
      <ellipse cx="282" cy="42" rx="15" ry="11" fill={colors.main} />

      <polygon points="294,40 312,46 298,52" fill="#d8851a" />
      <polygon points="296,42 306,46 298,50" fill="#fa9a30" />

      <g className="eye-blink" style={{ transformOrigin: '278px 38px' }}>
        <circle cx="278" cy="38" r="4" fill="white" stroke="#222" strokeWidth="0.5" />
        <circle cx="279" cy="38" r="2.5" fill="#1a1a1a" />
        <circle cx="280" cy="36" r="1.2" fill="white" />
      </g>

      <ellipse cx="200" cy="287" rx="110" ry="6" fill="rgba(0,0,0,0.22)" />
    </svg>
  );
}

export function EagleShape({ colors }: { colors: ColorOverride }) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="eagle-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7fbfe0" />
          <stop offset="1" stopColor="#cfeaf4" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#eagle-sky)" />
      <g fill="white" opacity="0.7">
        <ellipse cx="60" cy="60" rx="22" ry="6" />
        <ellipse cx="340" cy="80" rx="25" ry="7" />
      </g>

      <path d="M 200 165 L 50 100 Q 25 130 28 165 Q 50 175 100 175 Q 150 178 200 180 Z" fill={colors.shade} />
      <path d="M 200 165 L 65 110 Q 40 135 38 165 Q 60 175 105 175 Q 152 178 200 180 Z" fill={colors.main} />
      <g stroke={colors.shade} strokeWidth="1.5" fill="none" opacity="0.6">
        <line x1="200" y1="170" x2="60" y2="115" />
        <line x1="200" y1="175" x2="85" y2="142" />
        <line x1="200" y1="178" x2="115" y2="160" />
        <line x1="200" y1="180" x2="145" y2="172" />
      </g>

      <path d="M 200 165 L 350 100 Q 375 130 372 165 Q 350 175 300 175 Q 250 178 200 180 Z" fill={colors.shade} />
      <path d="M 200 165 L 335 110 Q 360 135 362 165 Q 340 175 295 175 Q 248 178 200 180 Z" fill={colors.main} />
      <g stroke={colors.shade} strokeWidth="1.5" fill="none" opacity="0.6">
        <line x1="200" y1="170" x2="340" y2="115" />
        <line x1="200" y1="175" x2="315" y2="142" />
        <line x1="200" y1="178" x2="285" y2="160" />
        <line x1="200" y1="180" x2="255" y2="172" />
      </g>

      <ellipse cx="200" cy="190" rx="28" ry="44" fill={colors.shade} />
      <ellipse cx="200" cy="188" rx="24" ry="40" fill={colors.main} />
      <ellipse cx="200" cy="210" rx="20" ry="20" fill={colors.light} opacity="0.4" />

      <g stroke={colors.shade} strokeWidth="1.2" fill="none" opacity="0.6">
        <line x1="190" y1="220" x2="190" y2="234" />
        <line x1="200" y1="220" x2="200" y2="234" />
        <line x1="210" y1="220" x2="210" y2="234" />
      </g>

      <ellipse cx="200" cy="140" rx="26" ry="22" fill="#f4ede0" />
      <ellipse cx="200" cy="138" rx="22" ry="18" fill="white" />

      <polygon points="200,140 195,166 224,154 220,148" fill="#fa9a30" />
      <polygon points="200,148 205,160 218,154 212,150" fill="#d8851a" />

      <g className="eye-blink" style={{ transformOrigin: '194px 135px' }}>
        <circle cx="194" cy="135" r="4.5" fill="#ffd34a" stroke="#222" strokeWidth="0.6" />
        <circle cx="195" cy="135" r="2.5" fill="#1a1a1a" />
        <circle cx="196" cy="133" r="1.2" fill="white" />
      </g>

      <polygon points="195,108 200,90 205,108" fill={colors.shade} />

      <g stroke={colors.shade} strokeWidth="3" strokeLinecap="round" fill="none">
        <line x1="190" y1="232" x2="186" y2="240" />
        <line x1="190" y1="232" x2="192" y2="245" />
        <line x1="195" y1="232" x2="198" y2="245" />
        <line x1="210" y1="232" x2="214" y2="240" />
        <line x1="210" y1="232" x2="208" y2="245" />
        <line x1="205" y1="232" x2="202" y2="245" />
      </g>
    </svg>
  );
}

export function OwlShape({ colors }: { colors: ColorOverride }) {
  const spot = colors.pattern ?? '#3a2818';
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="owl-night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1f254a" />
          <stop offset="1" stopColor="#3a3055" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#owl-night)" />

      <circle cx="58" cy="58" r="20" fill="#fff8c8" opacity="0.85" />
      <g fill="white" opacity="0.75">
        <circle cx="120" cy="40" r="1.4" />
        <circle cx="220" cy="35" r="1" />
        <circle cx="330" cy="55" r="1.4" />
        <circle cx="280" cy="80" r="1" />
        <circle cx="370" cy="100" r="1.4" />
      </g>

      <line x1="60" y1="245" x2="340" y2="245" stroke="#3a2818" strokeWidth="6" strokeLinecap="round" />

      <ellipse cx="200" cy="190" rx="80" ry="78" fill={colors.shade} />
      <ellipse cx="200" cy="186" rx="74" ry="72" fill={colors.main} />
      <ellipse cx="200" cy="215" rx="58" ry="38" fill={colors.light} opacity="0.55" />

      <g fill={spot} opacity="0.6">
        <ellipse cx="170" cy="195" rx="5" ry="6" />
        <ellipse cx="200" cy="210" rx="6" ry="6" />
        <ellipse cx="230" cy="195" rx="5" ry="6" />
        <ellipse cx="184" cy="220" rx="5" ry="5" />
        <ellipse cx="216" cy="220" rx="5" ry="5" />
        <ellipse cx="160" cy="180" rx="4" ry="5" />
        <ellipse cx="240" cy="180" rx="4" ry="5" />
      </g>

      <polygon points="158,128 152,90 178,112" fill={colors.shade} />
      <polygon points="242,128 248,90 222,112" fill={colors.shade} />

      <ellipse cx="200" cy="130" rx="65" ry="55" fill={colors.shade} />
      <ellipse cx="200" cy="128" rx="60" ry="50" fill={colors.main} />

      <ellipse cx="180" cy="130" rx="22" ry="24" fill="#fae8c8" />
      <ellipse cx="220" cy="130" rx="22" ry="24" fill="#fae8c8" />
      <g className="eye-blink" style={{ transformOrigin: '180px 130px' }}>
        <circle cx="180" cy="130" r="16" fill="#ffd34a" stroke="#222" strokeWidth="0.6" />
        <circle cx="181" cy="130" r="9" fill="#1a1a1a" />
        <circle cx="184" cy="126" r="3" fill="white" />
      </g>
      <g className="eye-blink" style={{ transformOrigin: '220px 130px' }}>
        <circle cx="220" cy="130" r="16" fill="#ffd34a" stroke="#222" strokeWidth="0.6" />
        <circle cx="221" cy="130" r="9" fill="#1a1a1a" />
        <circle cx="224" cy="126" r="3" fill="white" />
      </g>

      <polygon points="200,148 192,162 208,162" fill="#d8851a" />
      <polygon points="200,152 196,160 204,160" fill="#fa9a30" />

      <ellipse cx="124" cy="200" rx="22" ry="50" fill={colors.shade} transform="rotate(10 124 200)" />
      <ellipse cx="276" cy="200" rx="22" ry="50" fill={colors.shade} transform="rotate(-10 276 200)" />

      <polygon points="186,248 192,250 188,256 200,252 212,256 208,250 214,248" fill="#fa9a30" />

      <ellipse cx="200" cy="278" rx="70" ry="5" fill="rgba(0,0,0,0.4)" />
    </svg>
  );
}

export function TortoiseShape({ colors }: { colors: ColorOverride }) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      {BG_DEFS}
      <rect width="400" height="300" fill="url(#shape-bg)" />
      <line x1="20" y1="282" x2="380" y2="282" stroke="#b5ad95" strokeWidth="1" strokeDasharray="3 4" />

      <rect x="105" y="235" width="22" height="40" fill="#5a7a40" rx="4" />
      <rect x="155" y="238" width="22" height="38" fill="#5a7a40" rx="4" />
      <rect x="220" y="238" width="22" height="38" fill="#5a7a40" rx="4" />
      <rect x="270" y="235" width="22" height="40" fill="#5a7a40" rx="4" />
      <ellipse cx="116" cy="280" rx="14" ry="4" fill="#3a2118" />
      <ellipse cx="166" cy="280" rx="14" ry="4" fill="#3a2118" />
      <ellipse cx="231" cy="280" rx="14" ry="4" fill="#3a2118" />
      <ellipse cx="281" cy="280" rx="14" ry="4" fill="#3a2118" />

      <ellipse cx="85" cy="245" rx="18" ry="5" fill="#5a7a40" />

      <path d="M 110 240 Q 200 105 290 240 Q 290 255 200 258 Q 110 255 110 240 Z" fill="#5a4828" />
      <path d="M 115 238 Q 200 115 285 238 Q 285 252 200 254 Q 115 252 115 238 Z" fill="#7a6232" />

      <g fill="#5a4828" stroke="#3a2818" strokeWidth="1.2">
        <polygon points="155,200 175,170 200,165 225,170 245,200 232,225 200,232 168,225" />
        <polygon points="200,165 215,135 205,108 195,108 185,135" />
      </g>
      <g fill="#9a7a44" opacity="0.5">
        <polygon points="158,200 178,175 200,170 222,175 242,200 232,222 200,228 168,222" />
      </g>

      <g fill="#5a4828" opacity="0.6">
        <polygon points="135,225 155,200 170,225" />
        <polygon points="170,225 195,200 215,200 230,225" />
        <polygon points="230,225 245,200 265,225" />
      </g>

      <ellipse cx="320" cy="225" rx="30" ry="22" fill={colors.shade} />
      <ellipse cx="320" cy="222" rx="27" ry="19" fill={colors.main} />
      <ellipse cx="340" cy="232" rx="14" ry="10" fill={colors.main} />

      <ellipse cx="348" cy="234" rx="2.5" ry="2" fill="#3a2118" />

      <g className="eye-blink" style={{ transformOrigin: '320px 218px' }}>
        <circle cx="320" cy="218" r="4" fill="white" stroke="#222" strokeWidth="0.5" />
        <circle cx="321" cy="218" r="2.5" fill="#1a1a1a" />
        <circle cx="322" cy="216" r="1.1" fill="white" />
      </g>

      <path d="M 340 238 L 350 238" stroke="#3a2118" strokeWidth="1.4" strokeLinecap="round" />

      <g fill="#5a7a40" opacity="0.6">
        <polygon points="304,205 308,194 314,205" />
        <polygon points="320,202 324,190 330,202" />
      </g>

      <ellipse cx="195" cy="287" rx="130" ry="6" fill="rgba(0,0,0,0.22)" />
    </svg>
  );
}

export function CrocodileShape({ colors }: { colors: ColorOverride }) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="croc-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a8c2b8" />
          <stop offset="1" stopColor="#7aa090" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#croc-water)" />
      <g opacity="0.5">
        <line x1="40" y1="220" x2="80" y2="222" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <line x1="160" y1="216" x2="200" y2="220" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <line x1="290" y1="218" x2="330" y2="222" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </g>
      <path d="M 0 230 Q 200 222 400 230 L 400 240 Q 200 232 0 240 Z" fill="#5a8470" opacity="0.7" />

      <path d="M 80 175 Q 50 168 30 188 Q 14 210 26 232 Q 38 248 56 244" stroke={colors.shade} strokeWidth="18" fill="none" strokeLinecap="round" />
      <path d="M 80 175 Q 50 168 30 188 Q 14 210 26 232 Q 38 248 56 244" stroke={colors.main} strokeWidth="12" fill="none" strokeLinecap="round" />
      <g fill={colors.shade}>
        <polygon points="60,162 56,148 70,160" />
        <polygon points="48,170 42,156 56,168" />
        <polygon points="36,185 28,172 42,184" />
        <polygon points="24,205 14,195 28,202" />
      </g>

      <rect x="105" y="200" width="16" height="38" fill={colors.shade} rx="3" />
      <rect x="145" y="200" width="16" height="38" fill={colors.shade} rx="3" />
      <rect x="195" y="200" width="16" height="38" fill={colors.shade} rx="3" />
      <rect x="235" y="200" width="16" height="38" fill={colors.shade} rx="3" />
      <g fill="#3a2118">
        <polygon points="105,242 102,248 108,248 108,242 113,242 113,248 119,248 119,242 124,242" />
        <polygon points="145,242 142,248 148,248 148,242 153,242 153,248 159,248 159,242 164,242" />
        <polygon points="195,242 192,248 198,248 198,242 203,242 203,248 209,248 209,242 214,242" />
        <polygon points="235,242 232,248 238,248 238,242 243,242 243,248 249,248 249,242 254,242" />
      </g>

      <ellipse cx="180" cy="190" rx="100" ry="22" fill={colors.shade} />
      <ellipse cx="180" cy="186" rx="96" ry="18" fill={colors.main} />
      <ellipse cx="180" cy="200" rx="80" ry="6" fill={colors.light} opacity="0.5" />

      <g fill={colors.shade}>
        <polygon points="105,170 112,158 118,170" />
        <polygon points="135,168 142,154 148,168" />
        <polygon points="165,166 172,152 178,166" />
        <polygon points="195,166 202,152 208,166" />
        <polygon points="225,168 232,154 238,168" />
        <polygon points="252,170 259,158 265,170" />
      </g>

      <ellipse cx="290" cy="186" rx="55" ry="18" fill={colors.shade} />
      <ellipse cx="290" cy="184" rx="52" ry="15" fill={colors.main} />

      <ellipse cx="278" cy="170" rx="9" ry="6" fill={colors.shade} />
      <ellipse cx="300" cy="170" rx="9" ry="6" fill={colors.shade} />
      <g className="eye-blink" style={{ transformOrigin: '278px 168px' }}>
        <circle cx="278" cy="168" r="3.5" fill="#ffd34a" stroke="#222" strokeWidth="0.5" />
        <ellipse cx="278" cy="168" rx="1.4" ry="3" fill="#1a1a1a" />
      </g>
      <g className="eye-blink" style={{ transformOrigin: '300px 168px' }}>
        <circle cx="300" cy="168" r="3.5" fill="#ffd34a" stroke="#222" strokeWidth="0.5" />
        <ellipse cx="300" cy="168" rx="1.4" ry="3" fill="#1a1a1a" />
      </g>

      <line x1="244" y1="192" x2="340" y2="192" stroke="#3a2118" strokeWidth="1.6" />
      <g fill="white">
        {Array.from({ length: 11 }).map((_, i) => (
          <polygon key={`u${i}`} points={`${250 + i * 9},192 ${252 + i * 9},198 ${254 + i * 9},192`} />
        ))}
        {Array.from({ length: 11 }).map((_, i) => (
          <polygon key={`l${i}`} points={`${250 + i * 9},192 ${252 + i * 9},186 ${254 + i * 9},192`} />
        ))}
      </g>

      <ellipse cx="332" cy="184" rx="2.5" ry="1.6" fill={colors.shade} />
      <ellipse cx="326" cy="184" rx="2.5" ry="1.6" fill={colors.shade} />
    </svg>
  );
}

export function SharkShape({ colors }: { colors: ColorOverride }) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      {BG_DEFS}
      <rect width="400" height="300" fill="url(#shape-bg-water)" opacity="0.85" />
      <g opacity="0.6">
        <line x1="40" y1="50" x2="60" y2="46" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <line x1="150" y1="42" x2="172" y2="46" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <line x1="280" y1="48" x2="302" y2="44" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </g>
      <g fill="white" opacity="0.4">
        <circle cx="60" cy="250" r="2.5" />
        <circle cx="120" cy="230" r="2" />
        <circle cx="350" cy="240" r="2.5" />
      </g>

      <ellipse cx="195" cy="175" rx="135" ry="42" fill={colors.shade} />
      <ellipse cx="195" cy="170" rx="128" ry="36" fill={colors.main} />
      <ellipse cx="195" cy="192" rx="120" ry="20" fill={colors.light} opacity="0.85" />
      <ellipse cx="170" cy="148" rx="80" ry="10" fill="white" opacity="0.2" />

      <line x1="100" y1="170" x2="115" y2="175" stroke={colors.shade} strokeWidth="1.5" />
      <line x1="115" y1="170" x2="125" y2="175" stroke={colors.shade} strokeWidth="1.5" />
      <line x1="130" y1="170" x2="140" y2="175" stroke={colors.shade} strokeWidth="1.5" />
      <line x1="145" y1="170" x2="155" y2="175" stroke={colors.shade} strokeWidth="1.5" />

      <polygon points="180,140 200,80 220,140" fill={colors.shade} />
      <polygon points="184,142 200,90 216,142" fill={colors.main} />

      <polygon points="115,200 90,235 145,210" fill={colors.shade} />
      <polygon points="285,200 310,235 255,210" fill={colors.shade} />

      <path d="M 320 168 L 380 100 L 365 175 L 380 248 L 320 178 Z" fill={colors.shade} />
      <path d="M 322 170 L 372 110 L 360 174 L 372 240 L 322 176 Z" fill={colors.main} />

      <g className="eye-blink" style={{ transformOrigin: '85px 165px' }}>
        <circle cx="85" cy="165" r="5" fill="#1a1a1a" stroke="#222" strokeWidth="0.5" />
        <circle cx="86" cy="163" r="1.4" fill="white" />
      </g>

      <ellipse cx="70" cy="190" rx="18" ry="3" fill={colors.shade} />
      <ellipse cx="68" cy="186" rx="14" ry="2" fill={colors.shade} opacity="0.7" />

      <path d="M 60 188 Q 80 186 95 192" stroke="#1a1a1a" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <g fill="white">
        {Array.from({ length: 9 }).map((_, i) => (
          <polygon key={i} points={`${62 + i * 4},188 ${64 + i * 4},194 ${66 + i * 4},188`} />
        ))}
      </g>
      <g fill="white">
        {Array.from({ length: 9 }).map((_, i) => (
          <polygon key={i} points={`${62 + i * 4},188 ${64 + i * 4},182 ${66 + i * 4},188`} />
        ))}
      </g>

      <ellipse cx="200" cy="262" rx="130" ry="7" fill="rgba(0,0,0,0.15)" />
    </svg>
  );
}

export function CheetahShape({ colors }: { colors: ColorOverride }) {
  const spot = colors.pattern ?? '#1a1a1a';
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      {BG_DEFS}
      <rect width="400" height="300" fill="url(#shape-bg)" />
      <line x1="20" y1="282" x2="380" y2="282" stroke="#b5ad95" strokeWidth="1" strokeDasharray="3 4" />

      <path d="M 80 195 Q 50 175 25 200 Q 22 215 30 230" stroke={colors.shade} strokeWidth="12" fill="none" strokeLinecap="round" />
      <path d="M 80 195 Q 50 175 25 200 Q 22 215 30 230" stroke={colors.main} strokeWidth="8" fill="none" strokeLinecap="round" />
      <ellipse cx="32" cy="232" rx="9" ry="7" fill={spot} />

      <path d="M 110 210 Q 105 245 118 275" stroke={colors.shade} strokeWidth="11" fill="none" strokeLinecap="round" />
      <path d="M 144 210 Q 140 248 150 275" stroke={colors.shade} strokeWidth="11" fill="none" strokeLinecap="round" />
      <path d="M 232 210 Q 226 248 238 275" stroke={colors.shade} strokeWidth="11" fill="none" strokeLinecap="round" />
      <path d="M 268 210 Q 262 248 274 275" stroke={colors.shade} strokeWidth="11" fill="none" strokeLinecap="round" />
      <ellipse cx="120" cy="278" rx="11" ry="3.5" fill="#3a2118" />
      <ellipse cx="152" cy="278" rx="11" ry="3.5" fill="#3a2118" />
      <ellipse cx="240" cy="278" rx="11" ry="3.5" fill="#3a2118" />
      <ellipse cx="276" cy="278" rx="11" ry="3.5" fill="#3a2118" />

      <ellipse cx="190" cy="200" rx="105" ry="32" fill={colors.shade} />
      <ellipse cx="190" cy="196" rx="100" ry="28" fill={colors.main} />
      <ellipse cx="190" cy="218" rx="85" ry="10" fill={colors.light} opacity="0.55" />
      <ellipse cx="165" cy="178" rx="55" ry="8" fill="white" opacity="0.18" />

      <g fill={spot} opacity="0.85">
        <circle cx="135" cy="186" r="3" />
        <circle cx="155" cy="194" r="3.2" />
        <circle cx="170" cy="184" r="2.8" />
        <circle cx="190" cy="190" r="3" />
        <circle cx="210" cy="188" r="2.8" />
        <circle cx="225" cy="196" r="3.4" />
        <circle cx="245" cy="184" r="3" />
        <circle cx="265" cy="192" r="3" />
        <circle cx="148" cy="208" r="2.6" />
        <circle cx="180" cy="208" r="2.8" />
        <circle cx="215" cy="210" r="3" />
        <circle cx="252" cy="208" r="2.6" />
        <circle cx="118" cy="200" r="2.6" />
        <circle cx="275" cy="202" r="2.6" />
      </g>

      <circle cx="295" cy="186" r="26" fill={colors.shade} />
      <circle cx="295" cy="184" r="22" fill={colors.main} />
      <ellipse cx="289" cy="178" rx="14" ry="4" fill={colors.light} opacity="0.5" />

      <polygon points="282,168 285,156 290,168" fill={colors.shade} />
      <polygon points="305,168 308,156 313,168" fill={colors.shade} />
      <polygon points="285,168 287,160 289,168" fill="#f0c890" opacity="0.6" />
      <polygon points="307,168 309,160 311,168" fill="#f0c890" opacity="0.6" />

      <ellipse cx="314" cy="194" rx="10" ry="7" fill={colors.main} />
      <ellipse cx="320" cy="196" rx="3" ry="2" fill="#1a1a1a" />

      <g className="eye-blink" style={{ transformOrigin: '290px 180px' }}>
        <circle cx="290" cy="180" r="4.5" fill="white" stroke="#222" strokeWidth="0.5" />
        <ellipse cx="291" cy="180" rx="2" ry="3.4" fill="#1a1a1a" />
        <circle cx="292" cy="178" r="1.2" fill="white" />
      </g>
      <g className="eye-blink" style={{ transformOrigin: '304px 180px' }}>
        <circle cx="304" cy="180" r="4.5" fill="white" stroke="#222" strokeWidth="0.5" />
        <ellipse cx="305" cy="180" rx="2" ry="3.4" fill="#1a1a1a" />
        <circle cx="306" cy="178" r="1.2" fill="white" />
      </g>

      <path d="M 288 183 L 288 196" stroke={spot} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M 306 183 L 306 196" stroke={spot} strokeWidth="2.2" strokeLinecap="round" />

      <path d="M 306 200 Q 312 206 318 202" stroke="#3a2118" strokeWidth="1.6" fill="none" strokeLinecap="round" />

      <ellipse cx="195" cy="287" rx="125" ry="6" fill="rgba(0,0,0,0.22)" />
    </svg>
  );
}

export function SnowLeopardShape({ colors }: { colors: ColorOverride }) {
  const rosette = colors.pattern ?? '#3a3530';
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="snow-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dfecf2" />
          <stop offset="1" stopColor="#f4f1e6" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#snow-bg)" />
      <ellipse cx="200" cy="288" rx="200" ry="14" fill="white" />
      <ellipse cx="200" cy="290" rx="120" ry="6" fill="rgba(0,0,0,0.12)" />

      <path d="M 88 195 Q 50 185 26 200 Q 14 215 22 234 Q 32 248 50 250" stroke={colors.shade} strokeWidth="22" fill="none" strokeLinecap="round" />
      <path d="M 88 195 Q 50 185 26 200 Q 14 215 22 234 Q 32 248 50 250" stroke={colors.main} strokeWidth="16" fill="none" strokeLinecap="round" />
      <g fill={rosette} opacity="0.55">
        <circle cx="62" cy="200" r="3.5" />
        <circle cx="42" cy="208" r="3.5" />
        <circle cx="28" cy="220" r="3.5" />
        <circle cx="36" cy="240" r="3.2" />
      </g>

      <rect x="110" y="218" width="22" height="55" fill={colors.shade} rx="5" />
      <rect x="150" y="222" width="20" height="51" fill={colors.shade} rx="5" />
      <rect x="225" y="220" width="22" height="53" fill={colors.shade} rx="5" />
      <rect x="265" y="222" width="20" height="51" fill={colors.shade} rx="5" />
      <ellipse cx="121" cy="276" rx="14" ry="4" fill="#3a2118" />
      <ellipse cx="160" cy="276" rx="13" ry="4" fill="#3a2118" />
      <ellipse cx="236" cy="276" rx="14" ry="4" fill="#3a2118" />
      <ellipse cx="275" cy="276" rx="13" ry="4" fill="#3a2118" />

      <ellipse cx="195" cy="195" rx="100" ry="40" fill={colors.shade} />
      <ellipse cx="195" cy="190" rx="95" ry="35" fill={colors.main} />
      <ellipse cx="195" cy="218" rx="80" ry="12" fill="white" opacity="0.55" />

      <g fill={rosette} opacity="0.55" stroke={rosette} strokeWidth="1.2">
        <circle cx="140" cy="186" r="6" fill="none" />
        <circle cx="160" cy="200" r="6" fill="none" />
        <circle cx="178" cy="184" r="5.5" fill="none" />
        <circle cx="198" cy="195" r="6" fill="none" />
        <circle cx="218" cy="184" r="5.5" fill="none" />
        <circle cx="232" cy="198" r="6" fill="none" />
        <circle cx="250" cy="186" r="5.5" fill="none" />
        <circle cx="266" cy="200" r="5" fill="none" />
        <circle cx="142" cy="178" r="3" />
        <circle cx="180" cy="178" r="3" />
        <circle cx="218" cy="178" r="3" />
        <circle cx="252" cy="178" r="3" />
      </g>

      <g fill={colors.shade} stroke="white" strokeWidth="0.4" opacity="0.6">
        {[0,1,2,3,4,5,6,7,8].map((i) => (
          <line key={i} x1={130 + i*15} y1={158} x2={132 + i*15} y2={150} stroke="white" strokeWidth="1.5" />
        ))}
      </g>

      <circle cx="295" cy="180" r="36" fill={colors.shade} />
      <circle cx="294" cy="178" r="32" fill={colors.main} />
      <ellipse cx="288" cy="170" rx="20" ry="6" fill="white" opacity="0.45" />

      <polygon points="276,158 280,142 290,158" fill={colors.shade} />
      <polygon points="310,158 320,142 314,158" fill={colors.shade} />
      <polygon points="280,156 283,148 287,156" fill="#f4c8d4" opacity="0.6" />
      <polygon points="313,156 317,148 312,156" fill="#f4c8d4" opacity="0.6" />

      <g fill={rosette} opacity="0.6">
        <circle cx="285" cy="158" r="2" />
        <circle cx="305" cy="158" r="2" />
        <circle cx="275" cy="175" r="2.5" />
        <circle cx="315" cy="175" r="2.5" />
      </g>

      <ellipse cx="312" cy="190" rx="12" ry="9" fill={colors.main} />
      <ellipse cx="320" cy="192" rx="4" ry="3" fill="#1a1a1a" />

      <g className="eye-blink" style={{ transformOrigin: '288px 176px' }}>
        <circle cx="288" cy="176" r="5" fill="white" stroke="#222" strokeWidth="0.6" />
        <ellipse cx="289" cy="176" rx="2.4" ry="4" fill="#1a1a1a" />
        <circle cx="290" cy="174" r="1.4" fill="white" />
      </g>
      <g className="eye-blink" style={{ transformOrigin: '304px 176px' }}>
        <circle cx="304" cy="176" r="5" fill="white" stroke="#222" strokeWidth="0.6" />
        <ellipse cx="305" cy="176" rx="2.4" ry="4" fill="#1a1a1a" />
        <circle cx="306" cy="174" r="1.4" fill="white" />
      </g>

      <path d="M 306 198 Q 312 204 320 200" stroke="#3a2118" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function WolfShape({ colors }: { colors: ColorOverride }) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      {BG_DEFS}
      <rect width="400" height="300" fill="url(#shape-bg)" />
      <line x1="20" y1="282" x2="380" y2="282" stroke="#b5ad95" strokeWidth="1" strokeDasharray="3 4" />

      <path d="M 80 220 Q 50 230 30 248" stroke={colors.shade} strokeWidth="20" fill="none" strokeLinecap="round" />
      <path d="M 80 220 Q 50 230 30 248" stroke={colors.main} strokeWidth="14" fill="none" strokeLinecap="round" />
      <g fill={colors.shade} opacity="0.6">
        <circle cx="62" cy="226" r="2" />
        <circle cx="46" cy="234" r="2" />
        <circle cx="36" cy="244" r="2" />
      </g>

      <rect x="100" y="220" width="18" height="55" fill={colors.shade} rx="4" />
      <rect x="140" y="223" width="17" height="52" fill={colors.shade} rx="4" />
      <rect x="220" y="222" width="18" height="53" fill={colors.shade} rx="4" />
      <rect x="258" y="223" width="17" height="52" fill={colors.shade} rx="4" />
      <ellipse cx="109" cy="278" rx="12" ry="3.5" fill="#3a2118" />
      <ellipse cx="148" cy="278" rx="11" ry="3.5" fill="#3a2118" />
      <ellipse cx="229" cy="278" rx="12" ry="3.5" fill="#3a2118" />
      <ellipse cx="267" cy="278" rx="11" ry="3.5" fill="#3a2118" />

      <ellipse cx="185" cy="200" rx="100" ry="32" fill={colors.shade} />
      <ellipse cx="185" cy="196" rx="95" ry="28" fill={colors.main} />
      <ellipse cx="185" cy="218" rx="80" ry="10" fill={colors.light} opacity="0.55" />
      <path d="M 95 175 Q 185 165 275 175" stroke={colors.shade} strokeWidth="6" fill="none" opacity="0.5" />

      <ellipse cx="295" cy="180" r="0" fill={colors.shade} />
      <ellipse cx="285" cy="184" rx="32" ry="26" fill={colors.shade} />
      <ellipse cx="284" cy="182" rx="28" ry="22" fill={colors.main} />

      <ellipse cx="320" cy="200" rx="22" ry="12" fill={colors.shade} />
      <ellipse cx="320" cy="198" rx="19" ry="10" fill={colors.main} />
      <ellipse cx="338" cy="200" rx="4.5" ry="3.5" fill="#1a1a1a" />
      <line x1="338" y1="204" x2="338" y2="208" stroke="#1a1a1a" strokeWidth="1.5" />

      <path d="M 320 207 Q 326 212 332 209 Q 326 214 318 209" stroke="#1a1a1a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <polygon points="324,205 325,210 327,205" fill="white" />
      <polygon points="328,205 329,210 331,205" fill="white" />

      <polygon points="262,158 252,128 274,150" fill={colors.shade} />
      <polygon points="295,158 305,128 282,150" fill={colors.shade} />
      <polygon points="266,156 260,140 274,150" fill="#d8b8a0" opacity="0.5" />
      <polygon points="293,156 299,140 285,150" fill="#d8b8a0" opacity="0.5" />

      <g className="eye-blink" style={{ transformOrigin: '278px 182px' }}>
        <circle cx="278" cy="182" r="5" fill="white" stroke="#222" strokeWidth="0.6" />
        <ellipse cx="279" cy="182" rx="2.4" ry="3.6" fill="#b8830f" />
        <circle cx="280" cy="180" r="1.2" fill="white" />
      </g>
      <g className="eye-blink" style={{ transformOrigin: '300px 184px' }}>
        <circle cx="300" cy="184" r="5" fill="white" stroke="#222" strokeWidth="0.6" />
        <ellipse cx="301" cy="184" rx="2.4" ry="3.6" fill="#b8830f" />
        <circle cx="302" cy="182" r="1.2" fill="white" />
      </g>

      <ellipse cx="195" cy="287" rx="120" ry="6" fill="rgba(0,0,0,0.22)" />
    </svg>
  );
}

export function PolarBearShape({ colors }: { colors: ColorOverride }) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="polar-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cfe3ec" />
          <stop offset="1" stopColor="#f4f1e6" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#polar-bg)" />
      <ellipse cx="200" cy="288" rx="200" ry="14" fill="white" />
      <ellipse cx="200" cy="290" rx="130" ry="6" fill="rgba(0,0,0,0.12)" />

      <ellipse cx="78" cy="210" rx="14" ry="10" fill={colors.shade} />
      <ellipse cx="78" cy="208" rx="11" ry="8" fill={colors.main} />

      <rect x="100" y="220" width="32" height="58" fill={colors.shade} rx="8" />
      <rect x="160" y="222" width="32" height="56" fill={colors.shade} rx="8" />
      <rect x="230" y="222" width="32" height="56" fill={colors.shade} rx="8" />
      <rect x="288" y="220" width="32" height="58" fill={colors.shade} rx="8" />
      <ellipse cx="116" cy="282" rx="20" ry="5" fill="#3a2118" />
      <ellipse cx="176" cy="282" rx="20" ry="5" fill="#3a2118" />
      <ellipse cx="246" cy="282" rx="20" ry="5" fill="#3a2118" />
      <ellipse cx="304" cy="282" rx="20" ry="5" fill="#3a2118" />

      <ellipse cx="200" cy="190" rx="135" ry="55" fill={colors.shade} />
      <ellipse cx="200" cy="184" rx="128" ry="50" fill={colors.main} />
      <ellipse cx="200" cy="215" rx="105" ry="18" fill={colors.light} opacity="0.7" />
      <ellipse cx="175" cy="150" rx="80" ry="12" fill="white" opacity="0.4" />

      <g fill="none" stroke={colors.shade} strokeWidth="1.4" strokeLinecap="round" opacity="0.7">
        {[...Array(20)].map((_, i) => {
          const a = (i / 20) * Math.PI * 2 - Math.PI / 2;
          if (Math.sin(a) > 0.55) return null;
          const sx = 200 + Math.cos(a) * 130;
          const sy = 184 + Math.sin(a) * 50;
          const ex = sx + Math.cos(a) * 8;
          const ey = sy + Math.sin(a) * 8;
          return <path key={i} d={`M ${sx} ${sy} L ${ex} ${ey}`} />;
        })}
      </g>

      <ellipse cx="320" cy="160" rx="42" ry="36" fill={colors.shade} />
      <ellipse cx="318" cy="158" rx="38" ry="32" fill={colors.main} />
      <ellipse cx="312" cy="148" rx="22" ry="6" fill="white" opacity="0.5" />

      <circle cx="298" cy="142" r="10" fill={colors.shade} />
      <circle cx="298" cy="140" r="8" fill={colors.main} />
      <circle cx="342" cy="142" r="10" fill={colors.shade} />
      <circle cx="342" cy="140" r="8" fill={colors.main} />

      <ellipse cx="346" cy="174" rx="16" ry="12" fill={colors.main} />
      <ellipse cx="356" cy="176" rx="6" ry="5" fill="#1a1a1a" />

      <g className="eye-blink" style={{ transformOrigin: '312px 156px' }}>
        <circle cx="312" cy="156" r="4" fill="white" stroke="#222" strokeWidth="0.5" />
        <circle cx="312" cy="156" r="2.6" fill="#1a1a1a" />
        <circle cx="313" cy="154" r="1.2" fill="white" />
      </g>
      <g className="eye-blink" style={{ transformOrigin: '330px 156px' }}>
        <circle cx="330" cy="156" r="4" fill="white" stroke="#222" strokeWidth="0.5" />
        <circle cx="330" cy="156" r="2.6" fill="#1a1a1a" />
        <circle cx="331" cy="154" r="1.2" fill="white" />
      </g>

      <path d="M 350 183 Q 358 188 354 192" stroke="#1a1a1a" strokeWidth="1.6" fill="none" strokeLinecap="round" />

      <g fill="white" opacity="0.85">
        <ellipse cx="50" cy="285" rx="30" ry="4" />
        <ellipse cx="360" cy="288" rx="30" ry="4" />
      </g>
    </svg>
  );
}

export function MouseShape({ colors }: { colors: ColorOverride }) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      {BG_DEFS}
      <rect width="400" height="300" fill="url(#shape-bg)" />
      <line x1="20" y1="282" x2="380" y2="282" stroke="#b5ad95" strokeWidth="1" strokeDasharray="3 4" />

      <path d="M 140 215 Q 90 230 50 250 Q 20 265 18 278" stroke="#d8a090" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M 140 215 Q 90 230 50 250 Q 20 265 18 278" stroke="#e8b8a8" strokeWidth="3" fill="none" strokeLinecap="round" />

      <ellipse cx="195" cy="225" rx="68" ry="50" fill={colors.shade} />
      <ellipse cx="195" cy="220" rx="62" ry="45" fill={colors.main} />
      <ellipse cx="195" cy="248" rx="48" ry="14" fill={colors.light} opacity="0.55" />
      <ellipse cx="175" cy="195" rx="40" ry="10" fill="white" opacity="0.2" />

      <rect x="170" y="265" width="14" height="10" fill={colors.shade} rx="3" />
      <rect x="206" y="265" width="14" height="10" fill={colors.shade} rx="3" />
      <ellipse cx="177" cy="276" rx="9" ry="3" fill="#3a2118" />
      <ellipse cx="213" cy="276" rx="9" ry="3" fill="#3a2118" />

      <circle cx="222" cy="158" r="36" fill={colors.shade} />
      <circle cx="288" cy="158" r="36" fill={colors.shade} />
      <circle cx="222" cy="162" r="26" fill="#f0b8b0" />
      <circle cx="288" cy="162" r="26" fill="#f0b8b0" />
      <circle cx="222" cy="160" r="18" fill="#f4c8c0" opacity="0.6" />
      <circle cx="288" cy="160" r="18" fill="#f4c8c0" opacity="0.6" />

      <ellipse cx="258" cy="200" rx="50" ry="42" fill={colors.shade} />
      <ellipse cx="256" cy="196" rx="45" ry="38" fill={colors.main} />

      <ellipse cx="305" cy="210" rx="16" ry="12" fill={colors.main} />
      <ellipse cx="304" cy="208" rx="13" ry="9" fill={colors.light} opacity="0.5" />
      <ellipse cx="316" cy="212" rx="4" ry="3" fill="#d85a78" />

      <g className="eye-blink" style={{ transformOrigin: '270px 188px' }}>
        <circle cx="270" cy="188" r="8" fill="white" stroke="#222" strokeWidth="0.6" />
        <circle cx="271" cy="188" r="6" fill="#1a1a1a" />
        <circle cx="273" cy="185" r="2.5" fill="white" />
      </g>
      <g className="eye-blink" style={{ transformOrigin: '244px 188px' }}>
        <circle cx="244" cy="188" r="8" fill="white" stroke="#222" strokeWidth="0.6" />
        <circle cx="245" cy="188" r="6" fill="#1a1a1a" />
        <circle cx="247" cy="185" r="2.5" fill="white" />
      </g>

      <g stroke="#3a2118" strokeWidth="0.8" strokeLinecap="round" opacity="0.7" fill="none">
        <line x1="298" y1="206" x2="345" y2="200" />
        <line x1="298" y1="212" x2="350" y2="215" />
        <line x1="298" y1="218" x2="345" y2="225" />
        <line x1="290" y1="208" x2="340" y2="208" />
      </g>

      <path d="M 300 220 Q 308 226 318 222" stroke="#3a2118" strokeWidth="1.3" fill="none" strokeLinecap="round" />

      <ellipse cx="195" cy="282" rx="80" ry="5" fill="rgba(0,0,0,0.2)" />
    </svg>
  );
}

export function HummingbirdShape({ colors }: { colors: ColorOverride }) {
  const gorget = '#e63060';
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="hum-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a8e0f0" />
          <stop offset="1" stopColor="#d8f0e8" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#hum-sky)" />

      <g transform="translate(310 130)">
        <line x1="0" y1="20" x2="0" y2="160" stroke="#3a7a3a" strokeWidth="4" strokeLinecap="round" />
        <path d="M 0 80 q -16 -4 -22 -14 q 6 14 22 16" stroke="#3a7a3a" strokeWidth="3" fill="#5a9a4a" strokeLinecap="round" />
        <path d="M 0 110 q 16 -2 22 -14 q -6 14 -22 18" stroke="#3a7a3a" strokeWidth="3" fill="#5a9a4a" strokeLinecap="round" />
        <g>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="0" cy="-12" rx="11" ry="18" fill="#ff8aa0" stroke="#d85a78" strokeWidth="0.8" transform={`rotate(${a} 0 0)`} />
          ))}
          <circle cx="0" cy="0" r="7" fill="#ffd84a" />
          <circle cx="0" cy="0" r="4" fill="#fa8a30" />
        </g>
      </g>

      <g opacity="0.55" className="bird-wing" style={{ transformOrigin: '170px 138px' }}>
        <ellipse cx="170" cy="138" rx="44" ry="14" fill={colors.shade} transform="rotate(-30 170 138)" />
      </g>
      <g opacity="0.4" className="bird-wing" style={{ transformOrigin: '170px 145px' }}>
        <ellipse cx="170" cy="145" rx="44" ry="14" fill={colors.shade} transform="rotate(28 170 145)" />
      </g>

      <ellipse cx="205" cy="155" rx="32" ry="22" fill={colors.shade} />
      <ellipse cx="205" cy="152" rx="28" ry="19" fill={colors.main} />
      <ellipse cx="200" cy="142" rx="20" ry="6" fill={colors.light} opacity="0.5" />
      <ellipse cx="219" cy="160" rx="14" ry="10" fill={gorget} />
      <ellipse cx="222" cy="158" rx="8" ry="5" fill="#ff708a" opacity="0.7" />

      <polygon points="178,154 148,142 152,158 175,160" fill={colors.shade} />
      <polygon points="178,158 148,162 154,170 176,165" fill={colors.shade} />
      <polygon points="178,156 158,158 178,160" fill={colors.main} />

      <circle cx="232" cy="143" r="13" fill={colors.shade} />
      <circle cx="231" cy="141" r="11" fill={colors.main} />

      <line x1="244" y1="149" x2="296" y2="192" stroke="#2a2014" strokeWidth="2.6" strokeLinecap="round" />
      <line x1="244" y1="151" x2="296" y2="194" stroke="#5a4828" strokeWidth="1.2" strokeLinecap="round" />

      <g className="eye-blink" style={{ transformOrigin: '236px 140px' }}>
        <circle cx="236" cy="140" r="3.5" fill="white" stroke="#222" strokeWidth="0.5" />
        <circle cx="236" cy="140" r="2.2" fill="#1a1a1a" />
        <circle cx="237" cy="138" r="1" fill="white" />
      </g>

      <line x1="210" y1="175" x2="210" y2="186" stroke="#5a3818" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="200" y1="175" x2="200" y2="186" stroke="#5a3818" strokeWidth="1.5" strokeLinecap="round" />

      <g fill="white" opacity="0.6">
        <ellipse cx="80" cy="60" rx="22" ry="6" />
        <ellipse cx="70" cy="56" rx="14" ry="4" />
      </g>
    </svg>
  );
}

export function BatShape({ colors }: { colors: ColorOverride }) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="bat-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a1f3a" />
          <stop offset="1" stopColor="#2c3550" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#bat-sky)" />

      <circle cx="58" cy="58" r="24" fill="#fff8c8" opacity="0.85" />
      <circle cx="52" cy="54" r="18" fill="#fff8c8" opacity="0.4" />

      <g fill="white" opacity="0.8">
        <circle cx="120" cy="40" r="1.4" />
        <circle cx="160" cy="65" r="1" />
        <circle cx="230" cy="35" r="1.6" />
        <circle cx="280" cy="60" r="1.2" />
        <circle cx="320" cy="40" r="1.4" />
        <circle cx="350" cy="80" r="1" />
        <circle cx="100" cy="100" r="1" />
        <circle cx="370" cy="120" r="1.4" />
      </g>

      <path d="M 200 175 Q 110 100 30 130 Q 70 160 100 170 Q 140 180 200 185 Z" fill={colors.shade} />
      <path d="M 200 175 Q 115 108 38 134 Q 75 162 102 170 Q 142 178 200 182 Z" fill={colors.main} />
      <g stroke={colors.shade} strokeWidth="1.5" fill="none" opacity="0.65">
        <line x1="200" y1="175" x2="50" y2="138" />
        <line x1="200" y1="178" x2="78" y2="158" />
        <line x1="200" y1="180" x2="105" y2="172" />
      </g>
      <path d="M 30 132 Q 60 145 95 170" stroke={colors.shade} strokeWidth="1" fill="none" opacity="0.7" />

      <path d="M 200 175 Q 290 100 370 130 Q 330 160 300 170 Q 260 180 200 185 Z" fill={colors.shade} />
      <path d="M 200 175 Q 285 108 362 134 Q 325 162 298 170 Q 258 178 200 182 Z" fill={colors.main} />
      <g stroke={colors.shade} strokeWidth="1.5" fill="none" opacity="0.65">
        <line x1="200" y1="175" x2="350" y2="138" />
        <line x1="200" y1="178" x2="322" y2="158" />
        <line x1="200" y1="180" x2="295" y2="172" />
      </g>
      <path d="M 370 132 Q 340 145 305 170" stroke={colors.shade} strokeWidth="1" fill="none" opacity="0.7" />

      <ellipse cx="200" cy="180" rx="22" ry="32" fill={colors.shade} />
      <ellipse cx="200" cy="178" rx="18" ry="28" fill={colors.main} />
      <ellipse cx="200" cy="195" rx="14" ry="14" fill={colors.light} opacity="0.4" />

      <ellipse cx="200" cy="148" rx="22" ry="18" fill={colors.shade} />
      <ellipse cx="200" cy="146" rx="19" ry="15" fill={colors.main} />

      <polygon points="186,134 178,104 196,128" fill={colors.shade} />
      <polygon points="214,134 222,104 204,128" fill={colors.shade} />
      <polygon points="188,132 184,116 194,128" fill="#c87890" />
      <polygon points="212,132 216,116 206,128" fill="#c87890" />

      <g className="eye-blink" style={{ transformOrigin: '193px 145px' }}>
        <circle cx="193" cy="145" r="3.5" fill="white" stroke="#222" strokeWidth="0.5" />
        <circle cx="194" cy="145" r="2.2" fill="#1a1a1a" />
        <circle cx="195" cy="143" r="1" fill="white" />
      </g>
      <g className="eye-blink" style={{ transformOrigin: '207px 145px' }}>
        <circle cx="207" cy="145" r="3.5" fill="white" stroke="#222" strokeWidth="0.5" />
        <circle cx="208" cy="145" r="2.2" fill="#1a1a1a" />
        <circle cx="209" cy="143" r="1" fill="white" />
      </g>

      <polygon points="196,155 197,160 199,155" fill="white" />
      <polygon points="201,155 203,160 205,155" fill="white" />

      <line x1="195" y1="210" x2="190" y2="222" stroke={colors.shade} strokeWidth="3.5" strokeLinecap="round" />
      <line x1="205" y1="210" x2="210" y2="222" stroke={colors.shade} strokeWidth="3.5" strokeLinecap="round" />

      <g stroke="#cfe0ff" strokeWidth="1.6" fill="none" opacity="0.5">
        <path d="M 160 145 q -16 -4 -22 -14" />
        <path d="M 150 152 q -20 -6 -28 -18" />
        <path d="M 240 145 q 16 -4 22 -14" />
        <path d="M 250 152 q 20 -6 28 -18" />
      </g>
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

// Registry: shape-name → component. Used by CreatureStage / CreatureSVG /
// DexModal so a creature loaded straight from the dex can render its
// canonical silhouette anywhere in the app.
export const BESPOKE_SHAPES: Record<string, ComponentType<{ colors: ColorOverride }>> = {
  snake: SnakeShape,
  octopus: OctopusShape,
  whale: WhaleShape,
  dolphin: DolphinShape,
  penguin: PenguinShape,
  lion: LionShape,
  cheetah: CheetahShape,
  snowleopard: SnowLeopardShape,
  wolf: WolfShape,
  foxkit: FoxkitShape,
  polarbear: PolarBearShape,
  mouse: MouseShape,
  hummingbird: HummingbirdShape,
  bat: BatShape,
  sloth: SlothShape,
  kangaroo: KangarooShape,
  elephant: ElephantShape,
  gorilla: GorillaShape,
  camel: CamelShape,
  ostrich: OstrichShape,
  eagle: EagleShape,
  owl: OwlShape,
  tortoise: TortoiseShape,
  crocodile: CrocodileShape,
  shark: SharkShape,
  chameleon: ChameleonShape,
  raptor: RaptorShape,
  triceratops: TriceratopsShape,
  stegosaurus: StegosaurusShape,
  pterodactyl: PterodactylShape,
  tiger: TigerShape,
  trex: TRexShape,
  jellyfish: JellyfishShape,
  sheep: SheepShape,
  cow: CowShape,
};

export function getBespokeShape(name?: string): ComponentType<{ colors: ColorOverride }> | null {
  if (!name || name === 'default') return null;
  return BESPOKE_SHAPES[name] ?? null;
}

// ─── Sloth ──────────────────────────────────────────────────────────────
// Slow arboreal mammal: long hook claws, shaggy algae-green fur, sleepy face.
export function SlothShape({ colors }: { colors: ColorOverride }) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      {BG_DEFS}
      <rect width="400" height="300" fill="url(#shape-bg)" />
      <line x1="30" y1="85" x2="370" y2="55" stroke="#7a5a32" strokeWidth="16" strokeLinecap="round" />
      <line x1="78" y1="110" x2="338" y2="88" stroke="#a67a43" strokeWidth="6" strokeLinecap="round" opacity="0.75" />
      <ellipse cx="200" cy="255" rx="112" ry="7" fill="rgba(0,0,0,0.16)" />

      <path d="M 140 105 Q 118 154 128 218" stroke={colors.shade} strokeWidth="26" fill="none" strokeLinecap="round" />
      <path d="M 250 98 Q 285 142 278 215" stroke={colors.shade} strokeWidth="26" fill="none" strokeLinecap="round" />
      <path d="M 140 105 Q 118 154 128 218" stroke={colors.main} strokeWidth="18" fill="none" strokeLinecap="round" />
      <path d="M 250 98 Q 285 142 278 215" stroke={colors.main} strokeWidth="18" fill="none" strokeLinecap="round" />

      <g stroke="#2d2015" strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M 126 92 q 0 22 16 20" />
        <path d="M 142 90 q 0 22 16 20" />
        <path d="M 238 88 q 0 22 16 20" />
        <path d="M 254 87 q 0 22 16 20" />
      </g>

      <ellipse cx="205" cy="175" rx="78" ry="62" fill={colors.shade} />
      <ellipse cx="200" cy="168" rx="72" ry="58" fill={colors.main} />
      <ellipse cx="190" cy="178" rx="50" ry="38" fill={colors.light} opacity="0.45" />

      <g stroke="#6f8a45" strokeWidth="2" opacity="0.55" strokeLinecap="round">
        {[150, 168, 186, 204, 222, 240].map((x, i) => (
          <path key={x} d={`M ${x} ${130 + (i % 2) * 8} q -8 34 4 72`} />
        ))}
      </g>
      <g stroke={colors.shade} strokeWidth="1.8" opacity="0.55" strokeLinecap="round">
        {[145, 170, 195, 220, 245].map((x) => (
          <path key={x} d={`M ${x} 118 q -12 26 -4 58 q 8 28 0 56`} />
        ))}
      </g>

      <circle cx="205" cy="118" r="42" fill={colors.shade} />
      <circle cx="205" cy="116" r="38" fill={colors.light} />
      <ellipse cx="190" cy="113" rx="14" ry="18" fill="#5b4732" opacity="0.72" transform="rotate(-18 190 113)" />
      <ellipse cx="220" cy="113" rx="14" ry="18" fill="#5b4732" opacity="0.72" transform="rotate(18 220 113)" />

      <g className="eye-blink" style={{ transformOrigin: '190px 114px' }}>
        <circle cx="190" cy="114" r="4.5" fill="#16120e" />
        <circle cx="191" cy="112" r="1.3" fill="white" opacity="0.8" />
      </g>
      <g className="eye-blink" style={{ transformOrigin: '220px 114px' }}>
        <circle cx="220" cy="114" r="4.5" fill="#16120e" />
        <circle cx="221" cy="112" r="1.3" fill="white" opacity="0.8" />
      </g>
      <ellipse cx="205" cy="128" rx="5" ry="3.5" fill="#2d2015" />
      <path d="M 194 138 Q 205 146 216 138" stroke="#2d2015" strokeWidth="2" fill="none" strokeLinecap="round" />

      <g stroke="#2d2015" strokeWidth="2.2" fill="none" strokeLinecap="round">
        <path d="M 130 220 q -8 18 -22 12" />
        <path d="M 142 220 q -6 18 -20 16" />
        <path d="M 276 218 q 8 18 22 12" />
        <path d="M 264 218 q 6 18 20 16" />
      </g>
    </svg>
  );
}

// ─── Kangaroo ───────────────────────────────────────────────────────────
// Hopping macropod, side-view facing right:
//   - massive hind legs folded under (calf nearly horizontal on the ground)
//   - thick tail trailing back forming a tripod with the legs
//   - tall upright torso with light cream belly
//   - tiny tucked-up forearms with little paws
//   - long muzzle, tall pointed ears
//   - joey peeking out of the pouch
export function KangarooShape({ colors }: { colors: ColorOverride }) {
  const main = colors.main;
  const shade = colors.shade;
  const light = colors.light;
  const belly = '#fbeed3';     // characteristic light belly
  const bellyShade = '#e6cea0';
  const innerEar = '#e09080';
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      {BG_DEFS}
      <rect width="400" height="300" fill="url(#shape-bg)" />
      <line x1="20" y1="262" x2="380" y2="262" stroke="#b5ad95" strokeWidth="1" strokeDasharray="3 4" />

      {/* shadow under the tripod */}
      <ellipse cx="190" cy="266" rx="170" ry="6" fill="rgba(0,0,0,0.18)" />

      {/* THICK TAIL trailing left — counterbalance + tripod support */}
      <path d="M 110 248
               Q 50 246 24 240
               Q 14 232 24 224
               Q 50 218 120 224
               Q 158 232 168 248 Z"
        fill={shade} />
      <path d="M 116 244
               Q 60 242 36 236
               Q 28 230 36 224
               Q 58 220 120 226
               Q 154 234 162 244 Z"
        fill={main} />
      {/* small tail tip */}
      <circle cx="22" cy="234" r="6" fill={shade} />

      {/* BIG HIND LEG — far (rear) leg, drawn first so the near leg overlaps it */}
      {/* thigh — thick, angled back */}
      <ellipse cx="170" cy="200" rx="46" ry="28" fill={shade} transform="rotate(-15 170 200)" />
      {/* shank — long and folded forward (kangaroos crouch on long feet) */}
      <path d="M 132 222
               Q 158 232 230 248
               L 232 258
               Q 158 258 130 252 Z"
        fill={shade} />
      <path d="M 138 226
               Q 162 234 226 248
               L 228 254
               Q 162 254 138 250 Z"
        fill={main} />
      {/* claw nails on the long foot */}
      <g fill="#3a2118">
        <polygon points="228 252 240 252 236 258" />
        <polygon points="218 251 230 251 226 257" />
      </g>

      {/* near hind leg (slightly forward and lighter) */}
      <ellipse cx="178" cy="206" rx="42" ry="26" fill={main} transform="rotate(-12 178 206)" />
      <path d="M 144 226
               Q 170 232 232 246
               L 234 256
               Q 170 256 142 252 Z"
        fill={main} />
      <ellipse cx="230" cy="252" rx="14" ry="5" fill={shade} />

      {/* HAUNCH/RUMP — round, joining tail base to upper body */}
      <ellipse cx="180" cy="178" rx="60" ry="52" fill={shade} />
      <ellipse cx="178" cy="172" rx="54" ry="46" fill={main} />

      {/* UPRIGHT TORSO — leans slightly forward */}
      <path d="M 178 130
               Q 218 124 232 146
               Q 240 178 226 208
               Q 200 222 168 216
               Q 144 192 150 158
               Q 158 134 178 130 Z"
        fill={shade} />
      <path d="M 184 134
               Q 218 130 228 150
               Q 234 178 222 204
               Q 198 216 172 210
               Q 152 190 156 162
               Q 164 138 184 134 Z"
        fill={main} />

      {/* LIGHT CREAM BELLY — runs from chest down to pouch */}
      <path d="M 178 156
               Q 200 154 214 168
               Q 220 192 206 212
               Q 188 218 170 212
               Q 158 192 164 172
               Q 168 158 178 156 Z"
        fill={bellyShade} />
      <path d="M 180 160
               Q 200 158 212 170
               Q 216 190 204 208
               Q 188 214 172 210
               Q 162 192 168 174
               Q 172 162 180 160 Z"
        fill={belly} />

      {/* POUCH — pocket cut into belly with JOEY peeking out */}
      <path d="M 174 196
               Q 196 192 208 200
               Q 206 220 188 222
               Q 172 218 174 196 Z"
        fill={bellyShade} />
      <path d="M 178 200
               Q 198 196 206 204
               Q 200 218 188 220
               Q 176 216 178 200 Z"
        fill="#3a2a1e" opacity="0.85" />
      {/* joey head */}
      <ellipse cx="195" cy="203" rx="11" ry="9" fill={shade} />
      <ellipse cx="195" cy="203" rx="9" ry="7" fill={main} />
      {/* joey ears */}
      <ellipse cx="190" cy="195" rx="2.5" ry="5" fill={shade} transform="rotate(-15 190 195)" />
      <ellipse cx="200" cy="195" rx="2.5" ry="5" fill={shade} transform="rotate(15 200 195)" />
      {/* joey eye */}
      <circle cx="198" cy="203" r="1.6" fill="#1a1a1a" />
      <circle cx="198.4" cy="202.4" r="0.6" fill="white" />
      {/* joey nose */}
      <ellipse cx="203" cy="207" rx="1.6" ry="1" fill="#1a1208" />

      {/* TINY FORELIMBS — folded against chest with little paws */}
      <path d="M 218 158
               Q 234 168 232 184
               Q 224 188 220 184
               Q 214 174 216 162 Z"
        fill={shade} />
      <path d="M 220 160
               Q 232 168 230 182
               Q 224 184 222 180
               Q 218 172 220 162 Z"
        fill={main} />
      {/* paws/claws */}
      <g fill="#3a2118">
        <circle cx="232" cy="184" r="1.4" />
        <circle cx="229" cy="186" r="1.2" />
        <circle cx="226" cy="187" r="1.1" />
      </g>

      {/* NECK + LONG SNOUT HEAD */}
      <path d="M 200 122
               Q 218 110 240 110
               Q 268 116 280 132
               Q 286 144 282 156
               Q 274 168 254 168
               Q 230 162 214 150
               Q 198 138 200 122 Z"
        fill={shade} />
      <path d="M 206 124
               Q 224 114 240 114
               Q 264 120 274 134
               Q 278 144 274 154
               Q 266 162 252 162
               Q 230 158 216 148
               Q 204 138 206 124 Z"
        fill={main} />
      {/* lighter cheek/jaw */}
      <ellipse cx="260" cy="150" rx="18" ry="8" fill={light} opacity="0.55" />

      {/* TALL POINTED EARS — the headline feature */}
      <ellipse cx="222" cy="92" rx="8" ry="26" fill={shade} transform="rotate(-22 222 92)" />
      <ellipse cx="222" cy="94" rx="4" ry="20" fill={innerEar} transform="rotate(-22 222 94)" opacity="0.85" />
      <ellipse cx="248" cy="88" rx="8" ry="28" fill={shade} transform="rotate(8 248 88)" />
      <ellipse cx="248" cy="90" rx="4" ry="22" fill={innerEar} transform="rotate(8 248 90)" opacity="0.85" />

      {/* EYE (the far one is hidden behind muzzle) */}
      <g className="eye-blink" style={{ transformOrigin: '244px 134px' }}>
        <circle cx="244" cy="134" r="5.5" fill="white" stroke="#222" strokeWidth="0.6" />
        <circle cx="245" cy="134" r="3.4" fill="#1a1a1a" />
        <circle cx="246" cy="132" r="1.2" fill="white" />
      </g>

      {/* nose at the tip of the muzzle */}
      <ellipse cx="280" cy="146" rx="5" ry="3.5" fill="#1a1208" />
      {/* nostril hint */}
      <ellipse cx="279" cy="145" rx="1.4" ry="0.9" fill="#5a3828" />
      {/* mouth */}
      <path d="M 278 155 Q 272 160 264 158" stroke="#3a2118" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {/* whisker hints */}
      <g stroke="#5a3828" strokeWidth="0.6" opacity="0.55">
        <line x1="266" y1="152" x2="252" y2="152" />
        <line x1="266" y1="156" x2="250" y2="158" />
      </g>
    </svg>
  );
}

// ─── Tiger ──────────────────────────────────────────────────────────────
// Like a big cat with bold black stripes on orange.
export function TigerShape({ colors }: { colors: ColorOverride }) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      {BG_DEFS}
      <rect width="400" height="300" fill="url(#shape-bg)" />
      <line x1="20" y1="262" x2="380" y2="262" stroke="#b5ad95" strokeWidth="1" strokeDasharray="3 4" />

      {/* shadow */}
      <ellipse cx="200" cy="265" rx="150" ry="6" fill="rgba(0,0,0,0.18)" />

      {/* legs */}
      <rect x="120" y="190" width="22" height="68" rx="6" fill={colors.shade} />
      <rect x="158" y="190" width="22" height="68" rx="6" fill={colors.main} />
      <rect x="240" y="190" width="22" height="68" rx="6" fill={colors.shade} />
      <rect x="278" y="190" width="22" height="68" rx="6" fill={colors.main} />

      {/* body */}
      <ellipse cx="200" cy="180" rx="115" ry="48" fill={colors.shade} />
      <ellipse cx="200" cy="175" rx="110" ry="42" fill={colors.main} />
      <ellipse cx="200" cy="195" rx="100" ry="20" fill={colors.light} opacity="0.7" />

      {/* black stripes on body */}
      <g fill="#1a1a1a" opacity="0.85">
        {[-0.3, -0.15, 0, 0.15, 0.3].map((off) => (
          <path key={off} d={`M ${200 + 200 * off - 3} 148 q -2 25 0 50 q 6 -2 6 -10 q -2 -20 -3 -40 z`} />
        ))}
      </g>

      {/* tail */}
      <path d="M 85 175 Q 50 160 30 145" stroke={colors.shade} strokeWidth="14" fill="none" strokeLinecap="round" />
      <path d="M 85 175 Q 50 160 30 145" stroke={colors.main} strokeWidth="10" fill="none" strokeLinecap="round" />
      <g stroke="#1a1a1a" strokeWidth="2.5" fill="none" opacity="0.85">
        <line x1="60" y1="167" x2="65" y2="155" />
        <line x1="42" y1="158" x2="48" y2="146" />
      </g>

      {/* head */}
      <circle cx="310" cy="160" r="42" fill={colors.shade} />
      <circle cx="310" cy="160" r="38" fill={colors.main} />
      <ellipse cx="305" cy="178" rx="28" ry="14" fill={colors.light} opacity="0.6" />

      {/* head stripes */}
      <g stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M 300 130 q -3 8 -2 16" />
        <path d="M 312 125 q -1 9 0 18" />
        <path d="M 324 130 q 3 8 2 16" />
        <path d="M 282 145 q -3 6 -2 12" />
        <path d="M 338 145 q 3 6 2 12" />
      </g>

      {/* ears */}
      <ellipse cx="288" cy="128" rx="9" ry="11" fill={colors.shade} transform="rotate(-25 288 128)" />
      <ellipse cx="288" cy="130" rx="5" ry="7" fill="#f4b8b8" transform="rotate(-25 288 130)" />
      <ellipse cx="332" cy="128" rx="9" ry="11" fill={colors.shade} transform="rotate(25 332 128)" />
      <ellipse cx="332" cy="130" rx="5" ry="7" fill="#f4b8b8" transform="rotate(25 332 130)" />

      {/* eyes */}
      <g className="eye-blink" style={{ transformOrigin: '296px 160px' }}>
        <circle cx="296" cy="160" r="6" fill="white" stroke="#222" strokeWidth="0.6" />
        <ellipse cx="297" cy="160" rx="2.5" ry="4" fill="#f5a040" />
        <ellipse cx="297" cy="160" rx="1" ry="3" fill="#1a1a1a" />
      </g>
      <g className="eye-blink" style={{ transformOrigin: '324px 160px' }}>
        <circle cx="324" cy="160" r="6" fill="white" stroke="#222" strokeWidth="0.6" />
        <ellipse cx="325" cy="160" rx="2.5" ry="4" fill="#f5a040" />
        <ellipse cx="325" cy="160" rx="1" ry="3" fill="#1a1a1a" />
      </g>

      {/* nose + mouth + fangs */}
      <ellipse cx="310" cy="176" rx="5" ry="3.5" fill="#1a1a1a" />
      <path d="M 310 180 Q 305 188 300 185 M 310 180 Q 315 188 320 185" stroke="#1a1a1a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <polygon points="304 185 306 192 308 185" fill="white" stroke="#888" strokeWidth="0.4" />
      <polygon points="312 185 314 192 316 185" fill="white" stroke="#888" strokeWidth="0.4" />

      {/* whiskers */}
      <g stroke="white" strokeWidth="0.6" opacity="0.7">
        <line x1="296" y1="178" x2="270" y2="174" />
        <line x1="296" y1="182" x2="268" y2="184" />
        <line x1="324" y1="178" x2="350" y2="174" />
        <line x1="324" y1="182" x2="352" y2="184" />
      </g>
    </svg>
  );
}

// ─── T-Rex ──────────────────────────────────────────────────────────────
// Bipedal apex theropod — massive head, tiny arms, long counterbalancing tail.
export function TRexShape({ colors }: { colors: ColorOverride }) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      {BG_DEFS}
      <rect width="400" height="300" fill="url(#shape-bg)" />
      <line x1="20" y1="270" x2="380" y2="270" stroke="#b5ad95" strokeWidth="1" strokeDasharray="3 4" />

      <ellipse cx="200" cy="273" rx="130" ry="6" fill="rgba(0,0,0,0.2)" />

      {/* long tail */}
      <path d="M 200 175 Q 280 140 360 175 Q 380 200 360 210" stroke={colors.shade} strokeWidth="34" fill="none" strokeLinecap="round" />
      <path d="M 200 175 Q 280 140 360 175 Q 380 200 360 210" stroke={colors.main} strokeWidth="26" fill="none" strokeLinecap="round" />

      {/* powerful hind legs */}
      <path d="M 178 178 Q 168 215 158 268 L 192 268 Q 198 220 196 200 Z" fill={colors.shade} />
      <path d="M 175 188 Q 168 220 162 264 L 188 264 Q 192 222 192 200 Z" fill={colors.main} />
      <ellipse cx="155" cy="268" rx="20" ry="6" fill="#3a2118" />
      <g stroke="#1a1a1a" strokeWidth="1.5" fill="none" strokeLinecap="round">
        <line x1="140" y1="270" x2="138" y2="278" />
        <line x1="148" y1="270" x2="146" y2="280" />
      </g>

      <path d="M 218 178 Q 222 215 230 268 L 264 268 Q 254 220 240 200 Z" fill={colors.shade} />
      <path d="M 220 188 Q 226 222 232 264 L 258 264 Q 252 222 240 200 Z" fill={colors.main} />
      <ellipse cx="263" cy="268" rx="20" ry="6" fill="#3a2118" />

      {/* body (S-curved torso) */}
      <ellipse cx="195" cy="170" rx="65" ry="48" fill={colors.shade} />
      <ellipse cx="195" cy="165" rx="60" ry="42" fill={colors.main} />
      <ellipse cx="195" cy="180" rx="55" ry="20" fill={colors.light} opacity="0.6" />

      {/* tiny arms */}
      <g stroke={colors.shade} strokeWidth="6" fill="none" strokeLinecap="round">
        <path d="M 168 165 q -10 6 -8 16" />
        <path d="M 222 165 q 10 6 8 16" />
      </g>
      <g fill="#1a1a1a">
        <circle cx="160" cy="182" r="1.4" />
        <circle cx="163" cy="184" r="1.4" />
        <circle cx="230" cy="182" r="1.4" />
        <circle cx="233" cy="184" r="1.4" />
      </g>

      {/* HUGE head */}
      <ellipse cx="145" cy="125" rx="62" ry="32" fill={colors.shade} />
      <ellipse cx="145" cy="120" rx="58" ry="28" fill={colors.main} />
      <ellipse cx="135" cy="115" rx="36" ry="14" fill={colors.light} opacity="0.55" />

      {/* jaw */}
      <path d="M 92 132 Q 145 156 198 132 Q 198 142 145 162 Q 92 142 92 132 Z" fill={colors.shade} />
      <path d="M 100 134 Q 145 152 190 134 Q 190 140 145 156 Q 100 140 100 134 Z" fill="#5a3838" />

      {/* MANY teeth */}
      <g fill="white" stroke="#888" strokeWidth="0.4">
        {[100, 112, 124, 136, 148, 160, 172, 184].map((x) => (
          <polygon key={x} points={`${x - 2} 138 ${x} 150 ${x + 2} 138`} />
        ))}
        {[105, 117, 129, 141, 153, 165, 177].map((x) => (
          <polygon key={x} points={`${x - 2} 152 ${x} 142 ${x + 2} 152`} />
        ))}
      </g>

      {/* eye */}
      <g className="eye-blink" style={{ transformOrigin: '160px 110px' }}>
        <circle cx="160" cy="110" r="7" fill="white" stroke="#222" strokeWidth="0.7" />
        <ellipse cx="161" cy="110" rx="3" ry="5" fill="#d6a040" />
        <ellipse cx="161" cy="110" rx="1.2" ry="4" fill="#1a1a1a" />
      </g>

      {/* nostrils */}
      <ellipse cx="100" cy="120" rx="3" ry="2" fill="#1a1a1a" />
    </svg>
  );
}

// ─── Jellyfish ──────────────────────────────────────────────────────────
// Translucent bell with trailing tentacles.
export function JellyfishShape({ colors }: { colors: ColorOverride }) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      {BG_DEFS}
      <rect width="400" height="300" fill="url(#shape-bg-water)" opacity="0.85" />

      {/* bubbles */}
      <g fill="white" opacity="0.55">
        <circle cx="60" cy="40" r="2.5" />
        <circle cx="320" cy="60" r="3" />
        <circle cx="100" cy="80" r="1.8" />
        <circle cx="280" cy="40" r="2" />
      </g>

      {/* tentacles — long and wavy */}
      <g stroke={colors.shade} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.85">
        {[140, 160, 180, 200, 220, 240, 260].map((x) => (
          <path key={x} d={`M ${x} 175 q -8 30 0 60 q 8 30 0 60`} />
        ))}
      </g>
      <g stroke={colors.main} strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.65">
        {[140, 160, 180, 200, 220, 240, 260].map((x) => (
          <path key={x} d={`M ${x} 175 q -8 30 0 60 q 8 30 0 60`} />
        ))}
      </g>

      {/* short frilly tentacles */}
      <g stroke={colors.shade} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8">
        {[150, 175, 200, 225, 250].map((x) => (
          <path key={x} d={`M ${x} 170 q 0 14 ${(x % 30) - 15} 28`} />
        ))}
      </g>

      {/* BELL — translucent dome */}
      <path d="M 110 175 Q 200 70 290 175 Z" fill={colors.shade} opacity="0.7" />
      <path d="M 118 172 Q 200 80 282 172 Z" fill={colors.main} opacity="0.85" />
      <path d="M 130 168 Q 200 92 270 168 Z" fill={colors.light} opacity="0.65" />
      {/* highlight */}
      <ellipse cx="175" cy="120" rx="44" ry="22" fill="white" opacity="0.4" />

      {/* bell ridges */}
      <g stroke={colors.shade} strokeWidth="1.2" fill="none" opacity="0.5">
        <path d="M 145 168 Q 150 130 165 100" />
        <path d="M 180 168 Q 182 120 188 90" />
        <path d="M 220 168 Q 218 120 212 90" />
        <path d="M 255 168 Q 250 130 235 100" />
      </g>

      {/* hint of inner organs (radial gonads) */}
      <g fill={colors.cheek} opacity="0.7">
        <ellipse cx="180" cy="140" rx="10" ry="14" />
        <ellipse cx="220" cy="140" rx="10" ry="14" />
        <ellipse cx="200" cy="125" rx="10" ry="14" />
      </g>

      {/* bell rim */}
      <ellipse cx="200" cy="175" rx="92" ry="6" fill={colors.shade} opacity="0.65" />

      {/* eye-spots (jellyfish actually have ocelli at the bell edge) */}
      <circle cx="120" cy="173" r="2" fill="#1a1a1a" />
      <circle cx="280" cy="173" r="2" fill="#1a1a1a" />

      <ellipse cx="200" cy="285" rx="100" ry="4" fill="rgba(0,0,0,0.15)" />
    </svg>
  );
}

// ─── Foxkit ─────────────────────────────────────────────────────────────
// Recreated from the uploaded portrait: peach watercolor fox, huge ears,
// cream chest ruff, bright eyes, springy runner pose, curled fluffy tail.
export function FoxkitShape({ colors }: { colors: ColorOverride }) {
  const OUT = '#2a1713';
  const cream = colors.light;
  const dark = colors.shade;
  const main = colors.main;
  const blush = colors.cheek;
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      {BG_DEFS}
      <rect width="400" height="300" fill="url(#shape-bg)" />
      <ellipse cx="215" cy="266" rx="136" ry="12" fill="rgba(64,34,24,0.14)" />

      {/* curled tail behind the body */}
      <path
        d="M 272 135 C 315 72 380 96 365 144 C 354 180 315 183 333 140 C 343 112 309 103 287 141 C 278 156 268 159 259 151"
        fill={main}
        stroke={OUT}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M 300 120 C 331 89 369 104 355 141 C 346 164 324 164 331 143 C 338 123 319 114 302 135"
        fill={cream}
        opacity="0.72"
      />
      <g stroke={dark} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6">
        <path d="M 286 135 q 22 -34 58 -25" />
        <path d="M 302 151 q 28 -8 42 -29" />
        <path d="M 274 144 q 16 5 31 1" />
      </g>

      {/* rear legs */}
      <path d="M 250 176 C 282 188 296 216 318 228" stroke={OUT} strokeWidth="17" strokeLinecap="round" fill="none" />
      <path d="M 250 176 C 282 188 296 216 318 228" stroke={main} strokeWidth="12" strokeLinecap="round" fill="none" />
      <ellipse cx="322" cy="230" rx="18" ry="8" fill={main} stroke={OUT} strokeWidth="3" transform="rotate(15 322 230)" />
      <path d="M 224 183 C 238 207 238 229 247 252" stroke={OUT} strokeWidth="16" strokeLinecap="round" fill="none" />
      <path d="M 224 183 C 238 207 238 229 247 252" stroke={main} strokeWidth="11" strokeLinecap="round" fill="none" />
      <ellipse cx="248" cy="255" rx="15" ry="8" fill={main} stroke={OUT} strokeWidth="3" transform="rotate(40 248 255)" />

      {/* body */}
      <ellipse cx="210" cy="150" rx="76" ry="48" fill={main} stroke={OUT} strokeWidth="4" transform="rotate(-5 210 150)" />
      <path d="M 151 132 C 180 112 223 110 264 132 C 235 128 193 139 162 157 Z" fill="#ffb194" opacity="0.42" />
      <path d="M 163 175 C 190 194 231 197 261 174 C 230 190 193 188 163 175 Z" fill={dark} opacity="0.3" />

      {/* front legs in running pose */}
      <path d="M 158 174 C 129 196 111 226 87 256" stroke={OUT} strokeWidth="17" strokeLinecap="round" fill="none" />
      <path d="M 158 174 C 129 196 111 226 87 256" stroke={main} strokeWidth="12" strokeLinecap="round" fill="none" />
      <ellipse cx="84" cy="259" rx="20" ry="9" fill={main} stroke={OUT} strokeWidth="3" transform="rotate(-24 84 259)" />
      <path d="M 181 178 C 165 209 147 239 129 267" stroke={OUT} strokeWidth="18" strokeLinecap="round" fill="none" />
      <path d="M 181 178 C 165 209 147 239 129 267" stroke={main} strokeWidth="13" strokeLinecap="round" fill="none" />
      <ellipse cx="127" cy="270" rx="21" ry="10" fill={main} stroke={OUT} strokeWidth="3" transform="rotate(-18 127 270)" />

      {/* neck and fluffy cream ruff */}
      <path d="M 139 119 C 123 143 126 175 153 195 C 157 174 170 144 190 126 Z" fill={main} stroke={OUT} strokeWidth="4" />
      <path
        d="M 128 135 L 145 146 L 137 157 L 156 161 L 148 176 L 169 172 L 162 193 L 188 174 L 199 140 Z"
        fill={cream}
        stroke={OUT}
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* head */}
      <g transform="rotate(-8 120 102)">
        <path d="M 61 53 L 37 6 C 29 -9 18 -4 16 15 C 13 43 26 69 49 83 Z" fill={main} stroke={OUT} strokeWidth="4" />
        <path d="M 161 53 L 184 6 C 192 -9 203 -4 205 15 C 208 43 195 69 172 83 Z" fill={main} stroke={OUT} strokeWidth="4" />
        <path d="M 56 54 L 37 17 C 51 26 63 43 67 63 Z" fill={cream} opacity="0.82" />
        <path d="M 166 54 L 185 17 C 171 26 159 43 155 63 Z" fill={cream} opacity="0.82" />

        <path
          d="M 44 92 C 47 47 78 30 111 32 C 150 35 177 61 175 101 C 173 139 141 160 103 158 C 65 156 42 132 44 92 Z"
          fill={main}
          stroke={OUT}
          strokeWidth="4"
        />
        <path d="M 58 114 C 80 93 130 92 159 114 C 145 145 76 146 58 114 Z" fill={cream} opacity="0.92" />
        <path d="M 48 90 C 35 94 24 106 21 121 C 37 116 51 113 64 108 Z" fill={main} stroke={OUT} strokeWidth="3" />

        <g className="eye-blink" style={{ transformOrigin: '86px 89px' }}>
          <ellipse cx="84" cy="89" rx="15" ry="21" fill="#fff8e8" stroke={OUT} strokeWidth="3" />
          <ellipse cx="88" cy="92" rx="8" ry="14" fill="#9a4a20" />
          <ellipse cx="91" cy="90" rx="4" ry="10" fill="#22120e" />
          <circle cx="84" cy="80" r="4" fill="white" />
        </g>
        <g className="eye-blink" style={{ transformOrigin: '136px 89px' }}>
          <ellipse cx="136" cy="89" rx="15" ry="21" fill="#fff8e8" stroke={OUT} strokeWidth="3" />
          <ellipse cx="132" cy="92" rx="8" ry="14" fill="#9a4a20" />
          <ellipse cx="129" cy="90" rx="4" ry="10" fill="#22120e" />
          <circle cx="136" cy="80" r="4" fill="white" />
        </g>

        <ellipse cx="111" cy="121" rx="9" ry="6" fill="#2b1713" />
        <ellipse cx="108" cy="118" rx="3" ry="2" fill="#fff" opacity="0.5" />
        <path d="M 111 126 q -2 10 -13 12" stroke={OUT} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M 111 126 q 4 10 19 8" stroke={OUT} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <ellipse cx="67" cy="111" rx="9" ry="6" fill={blush} opacity="0.55" />
        <ellipse cx="153" cy="111" rx="9" ry="6" fill={blush} opacity="0.55" />

        {/* scruffy cheek and forehead tufts */}
        <g fill={main} stroke={OUT} strokeWidth="2" strokeLinejoin="round">
          <path d="M 73 45 l 10 -19 l 8 20" />
          <path d="M 92 39 l 13 -18 l 4 22" />
          <path d="M 116 42 l 18 -16 l -2 22" />
          <path d="M 45 111 l -18 9 l 21 5" />
          <path d="M 170 111 l 18 9 l -21 5" />
        </g>
      </g>

      {/* watercolor fur strokes */}
      <g stroke={dark} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.48">
        <path d="M 170 126 q 22 -12 46 -8" />
        <path d="M 181 142 q 34 -11 70 2" />
        <path d="M 152 165 q 24 18 58 17" />
        <path d="M 260 134 q 18 13 26 29" />
        <path d="M 71 249 q 12 7 30 2" />
        <path d="M 111 265 q 18 8 34 -2" />
      </g>
    </svg>
  );
}

// ─── Sheep (ram) ────────────────────────────────────────────────────────
// Cloud-shaped fluffy fleece, dark face + legs, big curled ram horns.
export function SheepShape({ colors }: { colors: ColorOverride }) {
  const wool = colors.main;
  const woolShade = colors.shade;
  const woolHi = colors.light;
  const face = '#3a2a1e';
  const faceLite = '#5a4a36';
  const horn = '#c8a070';
  const hornDark = '#8a6238';
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      {BG_DEFS}
      <rect width="400" height="300" fill="url(#shape-bg)" />
      <line x1="20" y1="262" x2="380" y2="262" stroke="#b5ad95" strokeWidth="1" strokeDasharray="3 4" />

      {/* shadow */}
      <ellipse cx="195" cy="265" rx="120" ry="6" fill="rgba(0,0,0,0.18)" />

      {/* legs — slim and dark */}
      <rect x="128" y="194" width="10" height="64" rx="3" fill={face} />
      <rect x="158" y="194" width="10" height="64" rx="3" fill={faceLite} />
      <rect x="226" y="194" width="10" height="64" rx="3" fill={face} />
      <rect x="256" y="194" width="10" height="64" rx="3" fill={faceLite} />
      {/* hooves */}
      <ellipse cx="133" cy="260" rx="7" ry="3" fill="#1a1208" />
      <ellipse cx="163" cy="260" rx="7" ry="3" fill="#1a1208" />
      <ellipse cx="231" cy="260" rx="7" ry="3" fill="#1a1208" />
      <ellipse cx="261" cy="260" rx="7" ry="3" fill="#1a1208" />

      {/* FLEECE BODY — many overlapping bumps for a cloud-of-wool silhouette */}
      <g fill={woolShade}>
        <circle cx="115" cy="180" r="32" />
        <circle cx="150" cy="160" r="36" />
        <circle cx="190" cy="155" r="38" />
        <circle cx="230" cy="160" r="36" />
        <circle cx="265" cy="180" r="32" />
        <circle cx="130" cy="200" r="28" />
        <circle cx="170" cy="205" r="30" />
        <circle cx="210" cy="205" r="30" />
        <circle cx="250" cy="200" r="28" />
      </g>
      <g fill={wool}>
        <circle cx="118" cy="177" r="28" />
        <circle cx="150" cy="157" r="32" />
        <circle cx="190" cy="152" r="34" />
        <circle cx="230" cy="157" r="32" />
        <circle cx="262" cy="177" r="28" />
        <circle cx="130" cy="197" r="24" />
        <circle cx="170" cy="202" r="26" />
        <circle cx="210" cy="202" r="26" />
        <circle cx="250" cy="197" r="24" />
      </g>
      {/* highlights on top */}
      <g fill={woolHi} opacity="0.7">
        <circle cx="148" cy="145" r="14" />
        <circle cx="188" cy="138" r="16" />
        <circle cx="228" cy="145" r="14" />
        <circle cx="116" cy="168" r="10" />
        <circle cx="262" cy="168" r="10" />
      </g>
      {/* little curls — small swirls suggesting fleece texture */}
      <g stroke={woolShade} strokeWidth="1.2" fill="none" opacity="0.65" strokeLinecap="round">
        {[
          [135, 188, 6], [165, 175, 7], [200, 170, 7], [235, 175, 7], [255, 188, 6],
          [148, 210, 5], [185, 215, 5], [218, 215, 5], [245, 210, 5],
        ].map(([cx, cy, r], i) => (
          <path key={i} d={`M ${cx - r} ${cy} a ${r} ${r} 0 1 1 ${r * 2} 0 a ${r * 0.55} ${r * 0.55} 0 1 0 ${-r * 1.1} 0`} />
        ))}
      </g>

      {/* tail tuft */}
      <circle cx="92" cy="172" r="14" fill={woolShade} />
      <circle cx="92" cy="170" r="11" fill={wool} />

      {/* HEAD — dark face poking out to the right */}
      <ellipse cx="310" cy="178" rx="32" ry="36" fill={face} />
      <ellipse cx="310" cy="183" rx="26" ry="30" fill={faceLite} opacity="0.55" />
      {/* dark muzzle */}
      <ellipse cx="328" cy="195" rx="14" ry="10" fill={face} />
      {/* nose */}
      <ellipse cx="338" cy="195" rx="4" ry="3" fill="#1a1208" />
      {/* mouth */}
      <path d="M 338 200 Q 332 206 326 202" stroke="#1a1208" strokeWidth="1.4" fill="none" strokeLinecap="round" />

      {/* ears (small floppy) */}
      <ellipse cx="290" cy="148" rx="11" ry="6" fill={face} transform="rotate(-22 290 148)" />
      <ellipse cx="290" cy="148" rx="6" ry="3" fill="#a06a76" transform="rotate(-22 290 148)" opacity="0.85" />

      {/* CURLED RAM HORNS — the headline feature.
          Spiral path on each side using arcs. */}
      <g fill="none" stroke={hornDark} strokeWidth="11" strokeLinecap="round">
        {/* left horn — sweeps back, curls under and forward */}
        <path d="M 296 152
                 Q 270 130 252 152
                 Q 240 178 268 188
                 Q 290 192 296 178" />
        {/* right horn — mirrors */}
        <path d="M 324 152
                 Q 350 130 364 156
                 Q 372 184 346 192
                 Q 322 192 320 178" />
      </g>
      <g fill="none" stroke={horn} strokeWidth="7" strokeLinecap="round">
        <path d="M 296 152
                 Q 270 130 252 152
                 Q 240 178 268 188
                 Q 290 192 296 178" />
        <path d="M 324 152
                 Q 350 130 364 156
                 Q 372 184 346 192
                 Q 322 192 320 178" />
      </g>
      {/* horn ridges — short cross-strokes give the spiral keratin look */}
      <g stroke={hornDark} strokeWidth="1.3" fill="none" opacity="0.85" strokeLinecap="round">
        <path d="M 290 148 q -4 6 0 12" />
        <path d="M 275 138 q -4 6 0 12" />
        <path d="M 258 148 q -4 6 0 12" />
        <path d="M 253 168 q -4 6 0 12" />
        <path d="M 264 182 q -4 6 0 12" />
        <path d="M 330 148 q 4 6 0 12" />
        <path d="M 345 138 q 4 6 0 12" />
        <path d="M 362 152 q 4 6 0 12" />
        <path d="M 368 172 q 4 6 0 12" />
        <path d="M 355 188 q 4 6 0 12" />
      </g>

      {/* eyes — sheep have horizontal slit pupils */}
      <g className="eye-blink" style={{ transformOrigin: '298px 178px' }}>
        <ellipse cx="298" cy="178" rx="5" ry="4" fill="white" stroke="#222" strokeWidth="0.6" />
        <ellipse cx="298" cy="178" rx="3.5" ry="2" fill="#7a5028" />
        <rect x="296" y="177" width="4" height="1.5" fill="#1a1208" />
      </g>
      <g className="eye-blink" style={{ transformOrigin: '318px 178px' }}>
        <ellipse cx="318" cy="178" rx="5" ry="4" fill="white" stroke="#222" strokeWidth="0.6" />
        <ellipse cx="318" cy="178" rx="3.5" ry="2" fill="#7a5028" />
        <rect x="316" y="177" width="4" height="1.5" fill="#1a1208" />
      </g>
    </svg>
  );
}

// ─── Cow (with horns) ──────────────────────────────────────────────────
// Side-view, facing right. Iconic Holstein dairy-cow look with bold black
// patches over white, pink muzzle and udder, floppy ears, and forward-then-
// up curving horns that double as defensive weapons (defenseTier 2).
export function CowShape({ colors }: { colors: ColorOverride }) {
  const main = colors.main;        // off-white body
  const shade = colors.shade;      // ivory shadow
  const light = colors.light;      // pure white highlights
  const cheek = colors.cheek;      // pink (muzzle / udder)
  const spot = colors.pattern ?? '#1a1a1a';
  const horn = '#fff5d8';
  const hornDark = '#a88848';
  const hoof = '#1a1208';
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      {BG_DEFS}
      <rect width="400" height="300" fill="url(#shape-bg)" />
      <line x1="20" y1="262" x2="380" y2="262" stroke="#b5ad95" strokeWidth="1" strokeDasharray="3 4" />

      {/* shadow */}
      <ellipse cx="200" cy="266" rx="150" ry="7" fill="rgba(0,0,0,0.18)" />

      {/* TAIL — long with dark tuft at the tip */}
      <path d="M 80 175 Q 50 195 36 232" stroke={shade} strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M 80 175 Q 50 195 36 232" stroke={main} strokeWidth="6" fill="none" strokeLinecap="round" />
      <ellipse cx="36" cy="240" rx="9" ry="11" fill={spot} />
      <ellipse cx="34" cy="244" rx="4" ry="6" fill="#3a2a1a" />

      {/* LEGS — sturdy and dark */}
      <rect x="118" y="194" width="16" height="64" rx="4" fill={shade} />
      <rect x="118" y="194" width="16" height="64" rx="4" fill={main} opacity="0.9" />
      <rect x="118" y="248" width="16" height="12" rx="3" fill={spot} />
      <ellipse cx="126" cy="262" rx="10" ry="3" fill={hoof} />

      <rect x="150" y="194" width="16" height="64" rx="4" fill={main} />
      <rect x="150" y="248" width="16" height="12" rx="3" fill={spot} />
      <ellipse cx="158" cy="262" rx="10" ry="3" fill={hoof} />

      <rect x="232" y="194" width="16" height="64" rx="4" fill={shade} />
      <rect x="232" y="194" width="16" height="64" rx="4" fill={main} opacity="0.9" />
      <rect x="232" y="248" width="16" height="12" rx="3" fill={spot} />
      <ellipse cx="240" cy="262" rx="10" ry="3" fill={hoof} />

      <rect x="264" y="194" width="16" height="64" rx="4" fill={main} />
      <rect x="264" y="248" width="16" height="12" rx="3" fill={spot} />
      <ellipse cx="272" cy="262" rx="10" ry="3" fill={hoof} />

      {/* BIG BARREL BODY */}
      <ellipse cx="195" cy="176" rx="120" ry="46" fill={shade} />
      <ellipse cx="195" cy="172" rx="115" ry="42" fill={main} />
      <ellipse cx="195" cy="186" rx="106" ry="22" fill={light} opacity="0.7" />

      {/* BLACK COW SPOTS — irregular blobs in classic Holstein pattern */}
      <g fill={spot}>
        <path d="M 100 168 Q 88 158 92 144 Q 108 138 124 148 Q 132 166 116 178 Q 102 180 100 168 Z" />
        <path d="M 160 192 Q 148 184 152 174 Q 168 168 184 178 Q 192 192 176 200 Q 162 200 160 192 Z" />
        <path d="M 220 160 Q 212 148 220 138 Q 240 132 254 144 Q 262 162 248 174 Q 228 174 220 160 Z" />
        <path d="M 270 192 Q 262 184 268 172 Q 284 168 296 178 Q 300 192 288 200 Q 274 202 270 192 Z" />
        <path d="M 196 134 Q 188 124 200 118 Q 216 116 220 130 Q 216 142 202 142 Q 196 138 196 134 Z" />
      </g>

      {/* PINK UDDER — under the belly, between the back legs */}
      <ellipse cx="210" cy="216" rx="22" ry="14" fill={cheek} />
      <ellipse cx="208" cy="214" rx="18" ry="11" fill="#f4cad0" opacity="0.85" />
      {/* teats */}
      <g fill={cheek} stroke="#c08080" strokeWidth="0.6">
        <ellipse cx="198" cy="226" rx="2.5" ry="4" />
        <ellipse cx="208" cy="228" rx="2.5" ry="4" />
        <ellipse cx="218" cy="226" rx="2.5" ry="4" />
      </g>

      {/* NECK joining body to head */}
      <path d="M 290 160 Q 305 152 315 154 Q 320 172 310 188 Q 295 192 285 184 Z" fill={shade} />
      <path d="M 292 162 Q 305 154 312 156 Q 316 170 308 184 Q 296 188 288 182 Z" fill={main} />

      {/* HEAD — broad jaw */}
      <path d="M 300 130
               Q 332 122 358 134
               Q 372 152 360 174
               Q 340 184 312 178
               Q 296 166 300 130 Z"
        fill={shade} />
      <path d="M 304 134
               Q 332 126 354 138
               Q 366 152 356 170
               Q 338 180 314 174
               Q 300 164 304 134 Z"
        fill={main} />

      {/* spot on the face — half-mask */}
      <path d="M 312 134 Q 326 130 338 138 Q 340 152 326 156 Q 312 152 312 134 Z" fill={spot} />

      {/* PINK MUZZLE (large, broad — defining cow feature) */}
      <ellipse cx="358" cy="160" rx="20" ry="14" fill={cheek} />
      <ellipse cx="356" cy="158" rx="16" ry="11" fill="#f0a8a8" opacity="0.85" />
      {/* nostrils */}
      <ellipse cx="362" cy="156" rx="2.5" ry="3" fill="#8a4040" />
      <ellipse cx="370" cy="159" rx="2.5" ry="3" fill="#8a4040" />
      {/* mouth */}
      <path d="M 354 168 Q 358 174 366 172" stroke="#5a2828" strokeWidth="1.4" fill="none" strokeLinecap="round" />

      {/* HORNS — the headline feature. Curve out sideways then forward
          and up to a sharp point. Drawn behind the head so the head
          shape stays clean. */}
      <g stroke={hornDark} strokeWidth="11" fill="none" strokeLinecap="round">
        {/* left/back horn — curls up and back */}
        <path d="M 322 122 Q 305 100 290 88 Q 280 84 274 90" />
        {/* right/front horn — curls up and forward */}
        <path d="M 338 122 Q 354 100 368 88 Q 378 84 384 90" />
      </g>
      <g stroke={horn} strokeWidth="7" fill="none" strokeLinecap="round">
        <path d="M 322 122 Q 305 100 290 88 Q 280 84 274 90" />
        <path d="M 338 122 Q 354 100 368 88 Q 378 84 384 90" />
      </g>
      {/* sharp tips */}
      <polygon points="270 84 280 92 280 86" fill={horn} stroke={hornDark} strokeWidth="0.8" />
      <polygon points="388 84 378 92 378 86" fill={horn} stroke={hornDark} strokeWidth="0.8" />
      {/* keratin ridges */}
      <g stroke={hornDark} strokeWidth="1.3" fill="none" opacity="0.75" strokeLinecap="round">
        <path d="M 314 116 q 2 -4 4 -2" />
        <path d="M 306 104 q 2 -4 4 -2" />
        <path d="M 294 92 q 2 -4 4 -2" />
        <path d="M 346 116 q -2 -4 -4 -2" />
        <path d="M 354 104 q -2 -4 -4 -2" />
        <path d="M 366 92 q -2 -4 -4 -2" />
      </g>

      {/* FLOPPY EARS — sticking out sideways below the horns */}
      <ellipse cx="306" cy="134" rx="11" ry="6" fill={shade} transform="rotate(-30 306 134)" />
      <ellipse cx="306" cy="134" rx="6" ry="3" fill="#f4a8a8" transform="rotate(-30 306 134)" opacity="0.85" />
      <ellipse cx="354" cy="128" rx="11" ry="6" fill={shade} transform="rotate(20 354 128)" />
      <ellipse cx="354" cy="128" rx="6" ry="3" fill="#f4a8a8" transform="rotate(20 354 128)" opacity="0.85" />

      {/* EYES — big and round with long lashes */}
      <g className="eye-blink" style={{ transformOrigin: '320px 148px' }}>
        <ellipse cx="320" cy="148" rx="7" ry="6" fill="white" stroke="#222" strokeWidth="0.7" />
        <ellipse cx="320" cy="148" rx="4" ry="5" fill="#3a2a18" />
        <circle cx="321" cy="146" r="1.5" fill="white" />
        {/* eyelash hints */}
        <line x1="314" y1="142" x2="312" y2="139" stroke="#1a1a1a" strokeWidth="1" strokeLinecap="round" />
        <line x1="318" y1="141" x2="317" y2="137" stroke="#1a1a1a" strokeWidth="1" strokeLinecap="round" />
      </g>

      {/* small white patch on the muzzle/chin */}
      <ellipse cx="346" cy="172" rx="8" ry="4" fill={light} opacity="0.6" />
    </svg>
  );
}
