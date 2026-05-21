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
