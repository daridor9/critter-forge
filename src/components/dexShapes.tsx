import type { ColorOverride } from './CreatureSVG';
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
  // 8 tentacles, with two top-side tentacles curling UPWARD for a more dynamic
  // exploring pose, and the suckerPoints array placing visible suckers along
  // each tentacle.
  const tentacles: Array<{
    sx: number; sy: number; c1x: number; c1y: number; c2x: number; c2y: number; ex: number; ey: number;
    suckers: Array<[number, number]>;
  }> = [
    // Leftmost — CURLS UPWARD (exploring above)
    { sx: 155, sy: 175, c1x: 100, c1y: 130, c2x: 50, c2y: 70, ex: 28, ey: 38,
      suckers: [[130, 156], [105, 130], [78, 100], [54, 72], [38, 50]] },
    // Lower-left
    { sx: 170, sy: 185, c1x: 130, c1y: 230, c2x: 110, c2y: 270, ex: 95, ey: 290,
      suckers: [[152, 200], [132, 226], [118, 252], [102, 278]] },
    { sx: 185, sy: 190, c1x: 175, c1y: 240, c2x: 155, c2y: 280, ex: 160, ey: 290,
      suckers: [[180, 210], [170, 240], [162, 268], [160, 285]] },
    // Centre-left
    { sx: 200, sy: 192, c1x: 205, c1y: 245, c2x: 205, c2y: 280, ex: 210, ey: 295,
      suckers: [[200, 215], [204, 245], [206, 270], [208, 290]] },
    // Centre-right
    { sx: 215, sy: 190, c1x: 225, c1y: 240, c2x: 245, c2y: 280, ex: 250, ey: 290,
      suckers: [[220, 210], [230, 240], [238, 268], [248, 285]] },
    { sx: 230, sy: 185, c1x: 270, c1y: 230, c2x: 290, c2y: 270, ex: 305, ey: 290,
      suckers: [[248, 200], [268, 226], [282, 252], [298, 278]] },
    // Rightmost — CURLS UPWARD (exploring above)
    { sx: 245, sy: 175, c1x: 300, c1y: 130, c2x: 350, c2y: 70, ex: 374, ey: 38,
      suckers: [[270, 156], [295, 130], [322, 100], [346, 72], [364, 50]] },
    // Centre dangling between others
    { sx: 200, sy: 190, c1x: 220, c1y: 250, c2x: 235, c2y: 285, ex: 230, ey: 295,
      suckers: [[210, 215], [220, 245], [228, 270], [230, 290]] },
  ];

  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
      {BG_DEFS}
      <rect width="400" height="300" fill="url(#shape-bg-water)" opacity="0.85" />

      {tentacles.map((t, i) => (
        <g key={i}>
          {/* tentacle base — dark outline */}
          <path d={`M ${t.sx} ${t.sy} C ${t.c1x} ${t.c1y}, ${t.c2x} ${t.c2y}, ${t.ex} ${t.ey}`} stroke={colors.shade} strokeWidth="22" fill="none" strokeLinecap="round" />
          {/* tentacle main color */}
          <path d={`M ${t.sx} ${t.sy} C ${t.c1x} ${t.c1y}, ${t.c2x} ${t.c2y}, ${t.ex} ${t.ey}`} stroke={colors.main} strokeWidth="18" fill="none" strokeLinecap="round" />
          {/* VISIBLE SUCKERS — light circles along the tentacle's underside.
              Real octopi have ~200 suckers per arm; we show ~4-5 prominent ones. */}
          <g>
            {t.suckers.map(([sx, sy], j) => (
              <g key={j}>
                <circle cx={sx} cy={sy} r="3.5" fill={colors.light} opacity="0.85" />
                <circle cx={sx} cy={sy} r="1.8" fill={colors.shade} opacity="0.6" />
              </g>
            ))}
          </g>
        </g>
      ))}

      {/* MANTLE (head bulb) — slightly elongated at the top to suggest the
          siphon/breathing direction */}
      <ellipse cx="200" cy="125" rx="86" ry="70" fill={colors.shade} />
      <ellipse cx="200" cy="120" rx="80" ry="64" fill={colors.main} />
      <ellipse cx="175" cy="80" rx="40" ry="22" fill="white" opacity="0.35" />
      <ellipse cx="180" cy="100" rx="55" ry="30" fill={colors.light} opacity="0.45" />
      {/* subtle mantle texture spots (chromatophore hint) */}
      <g fill={colors.shade} opacity="0.4">
        <circle cx="155" cy="100" r="2.5" />
        <circle cx="195" cy="85" r="2" />
        <circle cx="225" cy="95" r="2.5" />
        <circle cx="215" cy="155" r="2" />
        <circle cx="175" cy="160" r="2.5" />
      </g>

      {/* SIPHON — tube on the side of the mantle (jet propulsion) */}
      <ellipse cx="276" cy="155" rx="8" ry="5" fill={colors.shade} transform="rotate(20 276 155)" />
      <ellipse cx="276" cy="154" rx="5" ry="3" fill="#0a1820" transform="rotate(20 276 154)" />

      {/* LARGE EXPRESSIVE EYES — the iconic octopus look */}
      <g className="eye-blink" style={{ transformOrigin: '170px 130px' }}>
        <circle cx="170" cy="130" r="13" fill="white" stroke="#222" strokeWidth="0.7" />
        <ellipse cx="170" cy="130" rx="6" ry="11" fill="#1a1a1a" />
        {/* horizontal rectangular pupil — octopus characteristic */}
        <rect x="164" y="128" width="12" height="4" rx="1.5" fill="#000" />
        <circle cx="173" cy="124" r="3.5" fill="white" />
      </g>
      <g className="eye-blink" style={{ transformOrigin: '230px 130px' }}>
        <circle cx="230" cy="130" r="13" fill="white" stroke="#222" strokeWidth="0.7" />
        <ellipse cx="230" cy="130" rx="6" ry="11" fill="#1a1a1a" />
        <rect x="224" y="128" width="12" height="4" rx="1.5" fill="#000" />
        <circle cx="233" cy="124" r="3.5" fill="white" />
      </g>

      {/* slight curved mouth/beak hint */}
      <path d="M 184 158 Q 200 170 216 158" stroke="#3a2118" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <ellipse cx="200" cy="164" rx="3" ry="2" fill="#1a1208" opacity="0.6" />

      <ellipse cx="200" cy="285" rx="120" ry="6" fill="rgba(0,0,0,0.18)" />
    </svg>
  );
}

export function WhaleShape({ colors }: { colors: ColorOverride }) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
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

      {/* BODY — massive torpedo */}
      <ellipse cx="205" cy="178" rx="172" ry="58" fill={colors.shade} />
      <ellipse cx="205" cy="172" rx="166" ry="52" fill={colors.main} />
      {/* WHITE BELLY — humpback / blue whales have a pale underside */}
      <ellipse cx="205" cy="200" rx="148" ry="20" fill="#fff8e8" opacity="0.92" />
      <ellipse cx="205" cy="208" rx="135" ry="11" fill="#ffffff" opacity="0.7" />
      <ellipse cx="190" cy="142" rx="100" ry="14" fill="white" opacity="0.18" />

      {/* THROAT PLEATS / VENTRAL GROOVES — the iconic rorqual feature.
          Long parallel folds running from the chin to the belly that
          expand when the whale lunge-feeds. Real humpbacks have ~20-30. */}
      <g stroke={colors.shade} strokeWidth="1" fill="none" opacity="0.5">
        <path d="M 70 195 Q 110 215 165 218" />
        <path d="M 70 200 Q 110 220 165 222" />
        <path d="M 70 205 Q 110 224 165 225" />
        <path d="M 72 210 Q 110 228 165 228" />
        <path d="M 75 215 Q 110 230 165 231" />
        <path d="M 80 220 Q 112 232 162 233" />
      </g>

      {/* BARNACLE patches — characteristic white encrustations on humpbacks */}
      <g fill="#e8e4d8" opacity="0.85">
        <circle cx="60" cy="180" r="3.5" />
        <circle cx="56" cy="186" r="2" />
        <circle cx="66" cy="184" r="2" />
        <circle cx="350" cy="165" r="2.5" />
        <circle cx="356" cy="170" r="2" />
      </g>
      <g fill={colors.shade} opacity="0.4">
        <circle cx="60" cy="180" r="1.5" />
        <circle cx="350" cy="165" r="1.2" />
      </g>

      {/* FLUKE — broad horizontal tail with central notch */}
      <polygon points="365,172 398,116 400,168 380,178 400,188 398,228 365,180" fill={colors.shade} />
      <polygon points="365,172 392,130 394,168 378,178 394,188 392,218 365,178" fill={colors.main} />
      {/* fluke central notch */}
      <ellipse cx="380" cy="178" rx="10" ry="3" fill={colors.shade} />
      {/* fluke trailing edge highlight */}
      <path d="M 365 175 Q 380 175 392 132" stroke={colors.light} strokeWidth="1.2" fill="none" opacity="0.4" />

      {/* GIGANTIC PECTORAL FIN — humpbacks have the longest flippers of
          any whale (1/3 their body length) */}
      <ellipse cx="125" cy="215" rx="34" ry="14" fill={colors.shade} transform="rotate(18 125 215)" />
      <ellipse cx="125" cy="213" rx="30" ry="11" fill={colors.main} transform="rotate(18 125 213)" />
      {/* white underside of the flipper */}
      <ellipse cx="128" cy="218" rx="24" ry="6" fill="#fff8e8" opacity="0.85" transform="rotate(18 128 218)" />

      {/* HEAD TUBERCLES — the bumpy knobs along a humpback's head/jaw */}
      <g fill={colors.shade}>
        <circle cx="80" cy="150" r="3" />
        <circle cx="68" cy="160" r="3" />
        <circle cx="58" cy="170" r="3" />
        <circle cx="52" cy="180" r="2.5" />
      </g>

      {/* BLOWHOLE — on top of the head */}
      <ellipse cx="125" cy="125" rx="7" ry="3.5" fill={colors.shade} />
      <ellipse cx="125" cy="124" rx="4" ry="2" fill="#0a1820" />

      {/* small kind EYE */}
      <g className="eye-blink" style={{ transformOrigin: '92px 168px' }}>
        <circle cx="92" cy="168" r="5" fill="white" stroke="#222" strokeWidth="0.6" />
        <circle cx="92" cy="168" r="3" fill="#1a1a1a" />
        <circle cx="93" cy="166" r="1.2" fill="white" />
      </g>

      {/* long curving MOUTH LINE (whales have characteristic upturned mouth) */}
      <path d="M 45 185 Q 75 200 110 192" stroke="#3a2118" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <line x1="55" y1="184" x2="100" y2="187" stroke="#3a2118" strokeWidth="1" opacity="0.5" />

      <ellipse cx="200" cy="262" rx="150" ry="8" fill="rgba(0,0,0,0.18)" />
    </svg>
  );
}

export function RaptorShape({ colors }: { colors: ColorOverride }) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
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

      {/* LEFT LEG with the iconic raptor SICKLE CLAW */}
      <path d="M 175 225 Q 165 250 178 275" stroke={colors.shade} strokeWidth="20" fill="none" strokeLinecap="round" />
      <ellipse cx="180" cy="278" rx="14" ry="4" fill="#3a2118" />
      {/* small toes */}
      <path d="M 183 278 l 8 -3 M 173 278 l -6 3" stroke="#3a2118" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* SICKLE CLAW — the massive curved killing claw on the raised second
          toe (every dromaeosaur signature; Velociraptor's most famous feature). */}
      <path d="M 186 278 Q 196 274 198 264 Q 196 272 188 272 Z" fill="#1a0a08" stroke="#000" strokeWidth="0.5" />
      <path d="M 186 278 Q 196 274 198 264 Q 196 272 188 272" fill="#3a2010" />
      <circle cx="198" cy="264" r="1.4" fill="#000" />

      {/* RIGHT LEG (slightly forward) — also with sickle claw */}
      <path d="M 205 225 Q 200 250 215 275" stroke={colors.shade} strokeWidth="20" fill="none" strokeLinecap="round" />
      <ellipse cx="215" cy="278" rx="14" ry="4" fill="#3a2118" />
      <path d="M 218 278 l 8 -3 M 208 278 l -6 3" stroke="#3a2118" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* SICKLE CLAW on right foot */}
      <path d="M 221 278 Q 231 274 233 264 Q 231 272 223 272 Z" fill="#1a0a08" stroke="#000" strokeWidth="0.5" />
      <path d="M 221 278 Q 231 274 233 264 Q 231 272 223 272" fill="#3a2010" />
      <circle cx="233" cy="264" r="1.4" fill="#000" />

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
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
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

      {/* BIGGER FRILL SHIELD — the iconic triceratops feature.
          Bony plate extending from the head, used for display + defense. */}
      <ellipse cx="295" cy="180" rx="62" ry="70" fill={colors.shade} />
      <ellipse cx="295" cy="180" rx="55" ry="62" fill={colors.main} />
      {/* frill bone pattern radiating outward (like real triceratops) */}
      <g stroke={colors.shade} strokeWidth="1.5" fill="none" opacity="0.6">
        <path d="M 295 180 L 250 120" />
        <path d="M 295 180 L 274 112" />
        <path d="M 295 180 L 300 108" />
        <path d="M 295 180 L 325 112" />
        <path d="M 295 180 L 343 130" />
        <path d="M 295 180 L 350 158" />
        <path d="M 295 180 L 245 152" />
      </g>
      {/* SCALLOPED EDGE SPIKES — bigger than before, ringing the frill top */}
      <g fill={colors.shade}>
        <polygon points="248,140 250,124 258,142" />
        <polygon points="265,124 268,108 275,128" />
        <polygon points="285,116 288,98 298,122" />
        <polygon points="307,114 312,96 320,118" />
        <polygon points="325,120 332,104 339,126" />
        <polygon points="340,132 348,118 352,138" />
        <polygon points="350,156 358,144 354,162" />
      </g>
      {/* frill bumps along the edges (osteoderm rim) */}
      <g fill={colors.main} opacity="0.7">
        <circle cx="254" cy="130" r="2" />
        <circle cx="272" cy="118" r="2" />
        <circle cx="293" cy="110" r="2" />
        <circle cx="315" cy="108" r="2" />
        <circle cx="333" cy="116" r="2" />
      </g>

      {/* HEAD/MUZZLE — wider, beak-like front */}
      <ellipse cx="325" cy="202" rx="38" ry="26" fill={colors.shade} />
      <ellipse cx="324" cy="200" rx="34" ry="22" fill={colors.main} />
      <ellipse cx="345" cy="209" rx="16" ry="11" fill={colors.main} />

      {/* BIGGER BROW HORNS — the two long ones above the eyes */}
      <polygon points="308,178 304,128 322,176" fill={colors.shade} />
      <polygon points="336,178 344,128 352,176" fill={colors.shade} />
      {/* horn highlights */}
      <polygon points="310,172 307,138 318,172" fill={colors.light} opacity="0.5" />
      <polygon points="339,172 343,138 350,172" fill={colors.light} opacity="0.5" />
      {/* sharp dark tips */}
      <circle cx="306" cy="130" r="2" fill="#1a0e08" />
      <circle cx="346" cy="130" r="2" fill="#1a0e08" />

      {/* THIRD HORN — the SHORT NOSE HORN that gives triceratops its name
          ("three horns"). Smaller than the brow horns but the defining
          feature. Sits at the base of the beak. */}
      <polygon points="358,196 364,176 370,196" fill={colors.shade} />
      <polygon points="360,194 364,182 368,194" fill={colors.light} opacity="0.5" />
      <circle cx="364" cy="178" r="1.4" fill="#1a0e08" />

      {/* PARROT-LIKE BEAK at the front */}
      <path d="M 354 210 Q 368 212 368 220 Q 364 224 354 222 Z" fill="#3a2010" />
      <path d="M 356 212 Q 364 214 364 218 Q 360 220 356 218 Z" fill="#5a3018" />

      <g className="eye-blink" style={{ transformOrigin: '322px 193px' }}>
        <circle cx="322" cy="193" r="5" fill="white" stroke="#222" strokeWidth="0.6" />
        <circle cx="323" cy="193" r="3" fill="#1a1a1a" />
        <circle cx="324" cy="191" r="1.3" fill="white" />
      </g>

      {/* mouth line */}
      <path d="M 340 218 Q 352 220 360 218" stroke="#3a2118" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <circle cx="354" cy="208" r="1.2" fill={colors.shade} />

      <ellipse cx="200" cy="287" rx="135" ry="6" fill="rgba(0,0,0,0.2)" />
    </svg>
  );
}

export function StegosaurusShape({ colors }: { colors: ColorOverride }) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
      {BG_DEFS}
      <rect width="400" height="300" fill="url(#shape-bg)" />
      <line x1="20" y1="282" x2="380" y2="282" stroke="#b5ad95" strokeWidth="1" strokeDasharray="3 4" />

      {/* TAIL with THAGOMIZER — the iconic 4 tail spikes at the tip.
          Named after a Far Side cartoon; real stegosaurus used them as
          a defensive weapon, swinging the tail laterally. */}
      <path d="M 85 215 Q 50 230 22 252" stroke={colors.shade} strokeWidth="22" fill="none" strokeLinecap="round" />
      <path d="M 85 215 Q 50 230 22 252" stroke={colors.main} strokeWidth="14" fill="none" strokeLinecap="round" />
      {/* BIGGER, SHARPER thagomizer spikes — 4 fanning out at the tail tip */}
      <g>
        <polygon points="36,252 6,220 40,248" fill={colors.shade} />
        <polygon points="36,252 6,220 40,248" fill={colors.main} opacity="0.7" />
        <polygon points="52,253 28,218 54,250" fill={colors.shade} />
        <polygon points="52,253 28,218 54,250" fill={colors.main} opacity="0.7" />
        <polygon points="40,260 44,288 58,255" fill={colors.shade} />
        <polygon points="40,260 44,288 58,255" fill={colors.main} opacity="0.7" />
        <polygon points="52,260 60,288 70,255" fill={colors.shade} />
        <polygon points="52,260 60,288 70,255" fill={colors.main} opacity="0.7" />
        {/* dark sharp tips */}
        <circle cx="6" cy="220" r="2" fill="#1a0e08" />
        <circle cx="28" cy="218" r="2" fill="#1a0e08" />
        <circle cx="44" cy="288" r="2" fill="#1a0e08" />
        <circle cx="60" cy="288" r="2" fill="#1a0e08" />
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

      {/* BIGGER KITE-SHAPED PLATES along the spine — the iconic stegosaurus
          feature. Drawn larger and with a paired/alternating pattern hint
          (real stegosaurus likely had alternating offset plates). */}
      <g stroke={colors.shade} strokeWidth="1.4">
        {/* small plate at the neck */}
        <polygon points="108,162 122,118 140,162" fill={colors.main} />
        {/* mid plates — bigger */}
        <polygon points="148,150 168,90 188,150" fill={colors.main} />
        <polygon points="190,140 210,76 230,140" fill={colors.main} />
        <polygon points="230,150 250,90 270,150" fill={colors.main} />
        {/* plate at the rump */}
        <polygon points="270,162 286,118 304,162" fill={colors.main} />
      </g>
      {/* plate highlights — lighter inner kite shape */}
      <g fill={colors.light} opacity="0.5">
        <polygon points="116,158 122,128 134,158" />
        <polygon points="156,146 168,100 180,146" />
        <polygon points="198,136 210,86 222,136" />
        <polygon points="238,146 250,100 262,146" />
        <polygon points="276,158 286,128 298,158" />
      </g>
      {/* dark plate edge ridges for armor texture */}
      <g stroke="#3a2818" strokeWidth="0.8" fill="none" opacity="0.5">
        <line x1="122" y1="118" x2="124" y2="158" />
        <line x1="168" y1="90" x2="170" y2="146" />
        <line x1="210" y1="76" x2="212" y2="136" />
        <line x1="250" y1="90" x2="252" y2="146" />
        <line x1="286" y1="118" x2="288" y2="158" />
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
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
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

      {/* LEFT WING — pterosaur anatomy. Unlike bats (multiple finger
          bones) pterosaurs supported their entire wing on ONE massively
          elongated fourth finger. The leading edge is that single bone. */}
      <path d="M 200 170 L 60 130 L 40 148 L 70 195 L 200 188 Z" fill={colors.shade} />
      <path d="M 200 170 L 70 138 L 60 152 L 80 188 L 200 184 Z" fill={colors.main} />
      {/* THICK leading-edge finger bone — the single one */}
      <line x1="200" y1="170" x2="40" y2="148" stroke={colors.shade} strokeWidth="3.5" strokeLinecap="round" />
      {/* small claw at the wing tip */}
      <polygon points="40,148 32,140 38,154" fill="#1a0e08" />
      {/* wing membrane support struts */}
      <g stroke={colors.shade} strokeWidth="1.2" fill="none" opacity="0.45">
        <line x1="200" y1="175" x2="90" y2="160" />
        <line x1="200" y1="180" x2="120" y2="180" />
        <line x1="200" y1="184" x2="150" y2="186" />
      </g>

      {/* RIGHT WING (mirrored) */}
      <path d="M 200 170 L 340 130 L 360 148 L 330 195 L 200 188 Z" fill={colors.shade} />
      <path d="M 200 170 L 330 138 L 340 152 L 320 188 L 200 184 Z" fill={colors.main} />
      <line x1="200" y1="170" x2="360" y2="148" stroke={colors.shade} strokeWidth="3.5" strokeLinecap="round" />
      <polygon points="360,148 368,140 362,154" fill="#1a0e08" />
      <g stroke={colors.shade} strokeWidth="1.2" fill="none" opacity="0.45">
        <line x1="200" y1="175" x2="310" y2="160" />
        <line x1="200" y1="180" x2="280" y2="180" />
        <line x1="200" y1="184" x2="250" y2="186" />
      </g>

      <ellipse cx="200" cy="180" rx="22" ry="34" fill={colors.shade} />
      <ellipse cx="200" cy="178" rx="18" ry="30" fill={colors.main} />
      <ellipse cx="195" cy="170" rx="10" ry="14" fill={colors.light} opacity="0.45" />

      <ellipse cx="200" cy="140" rx="22" ry="18" fill={colors.shade} />
      <ellipse cx="200" cy="138" rx="19" ry="15" fill={colors.main} />

      <polygon points="218,132 270,98 220,148" fill={colors.shade} />
      <polygon points="216,134 262,104 218,144" fill={colors.main} />
      <line x1="222" y1="138" x2="262" y2="118" stroke="#3a2118" strokeWidth="0.6" />

      {/* BIGGER BACKWARD-SWEPT CREST — the iconic Pteranodon head crest.
          A long bony fin extending back from the skull. Much more dramatic
          than the original tiny triangle. */}
      <path d="M 192 124 Q 175 80 162 68 Q 158 80 174 110 Q 184 122 192 122 Z" fill={colors.shade} />
      <path d="M 194 124 Q 178 84 168 72 Q 166 84 178 108 Q 186 120 194 122 Z" fill={colors.main} />
      <path d="M 196 122 Q 184 96 178 84" stroke={colors.light} strokeWidth="1.2" fill="none" opacity="0.6" />

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

// ─── Lion — CARTOON STYLE TEST ────────────────────────────────────────
// Experimental redesign: bold black outlines, solid colors (no gradients),
// big expressive eyes, friendly proportions. If this style works better
// than the painterly approach, we apply it across the rest of the dex.
export function LionShape({ colors }: { colors: ColorOverride }) {
  const OUT = '#2a1810';            // bold cartoon outline
  const OUT_W = 3;                  // outline stroke width
  const body = colors.main;
  const bodyShade = colors.shade;
  const belly = colors.light;
  const mane = '#8a5018';           // bold solid mane color
  const maneDark = '#5a2c08';       // mane shadow
  const tailTuft = '#2a1810';       // black tuft
  const noseColor = '#3a1810';
  const tongue = '#d04848';
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
      {BG_DEFS}
      <rect width="400" height="300" fill="url(#shape-bg)" />
      <line x1="20" y1="282" x2="380" y2="282" stroke="#b5ad95" strokeWidth="1" strokeDasharray="3 4" />

      {/* TAIL — bold cartoon arc with chunky tuft */}
      <path d="M 95 215 Q 55 235 25 215 Q 10 205 18 188"
        stroke={OUT} strokeWidth={OUT_W + 6} fill="none" strokeLinecap="round" />
      <path d="M 95 215 Q 55 235 25 215 Q 10 205 18 188"
        stroke={body} strokeWidth={OUT_W + 2} fill="none" strokeLinecap="round" />
      {/* dark tail tuft — single bold shape */}
      <ellipse cx="15" cy="184" rx="12" ry="16"
        fill={tailTuft} stroke={OUT} strokeWidth={OUT_W - 1} transform="rotate(-20 15 184)" />

      {/* LEGS — chunky rounded rectangles with bold outlines */}
      {[110, 152, 218, 260].map((x, i) => (
        <g key={i}>
          <rect x={x - 11} y="215" width="22" height="60" rx="8"
            fill={i % 2 ? body : bodyShade} stroke={OUT} strokeWidth={OUT_W} />
          {/* paw pad — dark oval at base */}
          <ellipse cx={x} cy="278" rx="14" ry="4" fill={OUT} />
        </g>
      ))}

      {/* BODY — single bold ellipse */}
      <ellipse cx="180" cy="200" rx="100" ry="44"
        fill={body} stroke={OUT} strokeWidth={OUT_W} />
      {/* light belly */}
      <ellipse cx="180" cy="222" rx="80" ry="14" fill={belly} opacity="0.85" />

      {/* MANE — bold solid ring with cartoon scallop edges (no fluffy noise) */}
      <g>
        {/* outer scalloped mane silhouette as a path with bumps */}
        <path
          d={[
            'M 240 130',
            'C 235 105, 255 95, 265 105',
            'C 270 90, 290 88, 295 100',
            'C 305 85, 325 90, 325 105',
            'C 340 92, 360 100, 358 118',
            'C 375 115, 385 135, 372 150',
            'C 388 158, 388 178, 372 188',
            'C 385 200, 378 220, 360 220',
            'C 360 240, 340 245, 325 232',
            'C 322 248, 300 252, 292 238',
            'C 282 250, 260 248, 258 230',
            'C 240 240, 225 225, 232 208',
            'C 215 205, 215 185, 230 180',
            'C 215 170, 220 150, 235 148',
            'C 225 140, 230 128, 240 130',
            'Z',
          ].join(' ')}
          fill={mane} stroke={OUT} strokeWidth={OUT_W}
        />
        {/* darker mane shading on lower-right (gives depth without gradients) */}
        <path
          d="M 358 188 C 385 200 378 220 360 220 C 360 240 340 245 325 232 C 322 248 300 252 292 238 C 320 230 350 215 358 188 Z"
          fill={maneDark} opacity="0.55"
        />
      </g>

      {/* FACE — round and prominent */}
      <circle cx="298" cy="178" r="42" fill={body} stroke={OUT} strokeWidth={OUT_W} />
      {/* lighter snout area */}
      <ellipse cx="305" cy="200" rx="28" ry="18" fill={belly} opacity="0.9" />

      {/* EARS — perky triangles peeking through the mane */}
      <g>
        <path d="M 256 140 L 252 116 L 274 132 Z" fill={body} stroke={OUT} strokeWidth={OUT_W} />
        <path d="M 256 140 L 256 124 L 268 134 Z" fill="#f4b8a0" />
        <path d="M 338 140 L 342 116 L 322 132 Z" fill={body} stroke={OUT} strokeWidth={OUT_W} />
        <path d="M 338 140 L 338 124 L 326 134 Z" fill="#f4b8a0" />
      </g>

      {/* BIG CARTOON EYES — large white sclera, big black pupil, sparkle highlight */}
      <g className="eye-blink" style={{ transformOrigin: '286px 175px' }}>
        <circle cx="286" cy="175" r="11" fill="white" stroke={OUT} strokeWidth={OUT_W - 1} />
        <circle cx="288" cy="176" r="6.5" fill={OUT} />
        <circle cx="290" cy="173" r="2.8" fill="white" />
        <circle cx="286" cy="178" r="1.4" fill="white" />
      </g>
      <g className="eye-blink" style={{ transformOrigin: '316px 175px' }}>
        <circle cx="316" cy="175" r="11" fill="white" stroke={OUT} strokeWidth={OUT_W - 1} />
        <circle cx="318" cy="176" r="6.5" fill={OUT} />
        <circle cx="320" cy="173" r="2.8" fill="white" />
        <circle cx="316" cy="178" r="1.4" fill="white" />
      </g>

      {/* NOSE — solid triangle with a soft top edge */}
      <path d="M 295 195 L 311 195 L 303 205 Z" fill={noseColor} stroke={OUT} strokeWidth={OUT_W - 1} strokeLinejoin="round" />

      {/* MOUTH — friendly cartoon smile with peek of tongue */}
      <path d="M 303 205 L 303 211" stroke={OUT} strokeWidth={OUT_W - 1} strokeLinecap="round" />
      <path d="M 286 213 Q 303 226 320 213" stroke={OUT} strokeWidth={OUT_W} fill="none" strokeLinecap="round" />
      {/* small pink tongue tip */}
      <path d="M 297 218 Q 303 226 309 218 Q 303 222 297 218 Z" fill={tongue} stroke={OUT} strokeWidth={OUT_W - 2} />
      {/* two tiny fangs hint */}
      <polygon points="295,215 296,221 298,215" fill="white" stroke={OUT} strokeWidth="0.6" />
      <polygon points="308,215 310,221 311,215" fill="white" stroke={OUT} strokeWidth="0.6" />

      {/* whisker dots */}
      <g fill={OUT}>
        <circle cx="288" cy="202" r="1" />
        <circle cx="293" cy="207" r="1" />
        <circle cx="313" cy="207" r="1" />
        <circle cx="318" cy="202" r="1" />
      </g>

      {/* ground shadow */}
      <ellipse cx="195" cy="287" rx="125" ry="6" fill="rgba(0,0,0,0.22)" />
    </svg>
  );
}

export function DolphinShape({ colors }: { colors: ColorOverride }) {
  // CARTOON STYLE — bold outlines, solid colors, sparkle eye, big smile.
  // Signature features preserved: horizontal fluke (not vertical fish tail),
  // pectoral fin, rostrum/beak, dorsal fin, blowhole with water spout,
  // white underbelly, iconic upturned dolphin smile.
  const OUT = '#0a1a2a';
  const OUT_W = 3;
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
      {BG_DEFS}
      <rect width="400" height="300" fill="url(#shape-bg-water)" opacity="0.9" />

      {/* sparkle highlights and ripples in the water — kept light/cartoony */}
      <g opacity="0.7" stroke="white" strokeWidth="2" strokeLinecap="round">
        <line x1="40" y1="50" x2="62" y2="46" />
        <line x1="150" y1="42" x2="172" y2="46" />
        <line x1="270" y1="48" x2="292" y2="44" />
      </g>
      <g opacity="0.45" fill="white">
        <ellipse cx="80" cy="240" rx="42" ry="3" />
        <ellipse cx="320" cy="250" rx="38" ry="3" />
      </g>
      {/* a couple of cartoon bubbles rising near the dolphin */}
      <g fill="white" opacity="0.7" stroke={OUT} strokeWidth="1">
        <circle cx="56" cy="220" r="4" />
        <circle cx="46" cy="200" r="3" />
        <circle cx="62" cy="186" r="2.5" />
      </g>

      {/* HORIZONTAL FLUKE — drawn first so the body overlaps it cleanly */}
      <path d="M 300 175 Q 348 142 388 108 Q 386 148 360 178 Q 348 180 318 180 Z"
        fill={colors.main} stroke={OUT} strokeWidth={OUT_W} strokeLinejoin="round" />
      <path d="M 300 175 Q 348 208 388 242 Q 386 202 360 172 Q 348 170 318 170 Z"
        fill={colors.main} stroke={OUT} strokeWidth={OUT_W} strokeLinejoin="round" />

      {/* PECTORAL FIN — angled side flipper, drawn behind body */}
      <ellipse cx="120" cy="212" rx="24" ry="12"
        fill={colors.main} stroke={OUT} strokeWidth={OUT_W}
        transform="rotate(28 120 212)" />

      {/* BODY — sleek streamlined ellipse with bold outline */}
      <ellipse cx="195" cy="175" rx="125" ry="40"
        fill={colors.main} stroke={OUT} strokeWidth={OUT_W}
        transform="rotate(-8 195 175)" />
      {/* WHITE BELLY — bottlenose dolphin underside */}
      <path d="M 80 195 Q 195 230 310 190 Q 308 212 195 222 Q 82 214 80 195 Z"
        fill="#fff5ea" stroke={OUT} strokeWidth="1.5"
        transform="rotate(-8 195 205)" />

      {/* DORSAL FIN — curved, top of the back */}
      <path d="M 188 130 Q 200 78 238 108 Q 218 128 200 140 Z"
        fill={colors.main} stroke={OUT} strokeWidth={OUT_W} strokeLinejoin="round" />

      {/* ROSTRUM (beak) — pointed snout, cleaner cartoon wedge */}
      <path d="M 60 172 L 18 168 Q 6 178 18 188 L 60 192 Z"
        fill={colors.main} stroke={OUT} strokeWidth={OUT_W} strokeLinejoin="round" />
      {/* white tip on rostrum */}
      <path d="M 30 174 Q 20 180 30 186 L 46 184 Q 46 178 46 178 Z"
        fill="#fff5ea" stroke={OUT} strokeWidth="1.2" />

      {/* ICONIC SMILE — bold cartoon upturned mouth */}
      <path d="M 20 184 Q 40 200 76 192" stroke={OUT} strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* tiny smile-corner dimple */}
      <circle cx="76" cy="192" r="1.6" fill={OUT} />

      {/* BIG SPARKLY EYE */}
      <g className="eye-blink" style={{ transformOrigin: '76px 166px' }}>
        <ellipse cx="76" cy="166" rx="7.5" ry="8" fill="white" stroke={OUT} strokeWidth={OUT_W} />
        <ellipse cx="77" cy="167" rx="4.5" ry="6" fill="#3a6a8a" />
        <ellipse cx="77" cy="167" rx="2" ry="5" fill={OUT} />
        <circle cx="75" cy="164" r="1.6" fill="white" />
        <circle cx="78" cy="169" r="0.9" fill="white" />
      </g>

      {/* BLOWHOLE — bold cartoon oval */}
      <ellipse cx="120" cy="132" rx="7" ry="3.5"
        fill={OUT} stroke={OUT} strokeWidth="1" />
      {/* WATER SPOUT — cartoon puffs rising from blowhole */}
      <g className="bob-breathe" style={{ transformOrigin: '120px 120px' }}>
        <ellipse cx="120" cy="104" rx="16" ry="7"
          fill="#cfeefb" stroke={OUT} strokeWidth="1.6" />
        <ellipse cx="112" cy="82" rx="10" ry="5"
          fill="#cfeefb" stroke={OUT} strokeWidth="1.4" />
        <ellipse cx="126" cy="86" rx="8" ry="4"
          fill="#cfeefb" stroke={OUT} strokeWidth="1.4" />
        <circle cx="106" cy="68" r="3.5" fill="#cfeefb" stroke={OUT} strokeWidth="1.2" />
        <circle cx="130" cy="70" r="3" fill="#cfeefb" stroke={OUT} strokeWidth="1.2" />
      </g>

      {/* SOFT SHADOW BENEATH (suggests floating above the waterline) */}
      <ellipse cx="200" cy="262" rx="115" ry="7" fill="rgba(0,0,0,0.18)" />
    </svg>
  );
}

export function ChameleonShape({ colors }: { colors: ColorOverride }) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
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
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
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

      {/* PILLAR LEGS — thick columnar */}
      <rect x="100" y="218" width="30" height="58" fill={colors.shade} rx="6" />
      <rect x="155" y="220" width="28" height="56" fill={colors.shade} rx="6" />
      <rect x="220" y="220" width="28" height="56" fill={colors.shade} rx="6" />
      <rect x="270" y="218" width="30" height="58" fill={colors.shade} rx="6" />
      <ellipse cx="115" cy="280" rx="18" ry="5" fill="#3a2118" />
      <ellipse cx="169" cy="280" rx="17" ry="5" fill="#3a2118" />
      <ellipse cx="234" cy="280" rx="17" ry="5" fill="#3a2118" />
      <ellipse cx="285" cy="280" rx="18" ry="5" fill="#3a2118" />
      {/* TOENAILS — 4 little hoof-like nails on each foot */}
      <g fill="#f0e8d0" stroke="#888" strokeWidth="0.4">
        {[100, 108, 116, 124].map((x, i) => (
          <rect key={`f1-${i}`} x={x} y="274" width="5" height="6" rx="1" />
        ))}
        {[155, 163, 171, 179].map((x, i) => (
          <rect key={`f2-${i}`} x={x} y="274" width="5" height="6" rx="1" />
        ))}
        {[220, 228, 236, 244].map((x, i) => (
          <rect key={`f3-${i}`} x={x} y="274" width="5" height="6" rx="1" />
        ))}
        {[270, 278, 286, 294].map((x, i) => (
          <rect key={`f4-${i}`} x={x} y="274" width="5" height="6" rx="1" />
        ))}
      </g>

      {/* BODY */}
      <ellipse cx="195" cy="185" rx="130" ry="55" fill={colors.shade} />
      <ellipse cx="195" cy="180" rx="124" ry="50" fill={colors.main} />
      <ellipse cx="195" cy="210" rx="105" ry="16" fill={colors.light} opacity="0.55" />
      <ellipse cx="175" cy="148" rx="80" ry="12" fill="white" opacity="0.2" />

      {/* WRINKLY SKIN texture — characteristic elephant hide */}
      <g stroke={colors.shade} strokeWidth="0.8" fill="none" opacity="0.45">
        <path d="M 90 170 q 30 6 60 4" />
        <path d="M 90 185 q 30 6 60 4" />
        <path d="M 90 200 q 30 6 60 4" />
        <path d="M 160 170 q 30 6 60 4" />
        <path d="M 160 185 q 30 6 60 4" />
        <path d="M 220 175 q 20 4 40 2" />
        <path d="M 220 190 q 20 4 40 2" />
      </g>

      {/* GIANT AFRICA-SHAPED EAR — much bigger than original */}
      <path d="M 268 168 Q 240 130 215 118 Q 195 110 188 132 Q 188 168 220 192 Q 246 200 268 192 Z" fill={colors.shade} />
      <path d="M 264 168 Q 240 134 218 124 Q 200 120 194 138 Q 196 166 224 188 Q 244 194 262 188 Z" fill={colors.main} />
      <ellipse cx="232" cy="158" rx="22" ry="14" fill="#f4c8b8" opacity="0.4" />
      {/* ear vein lines */}
      <g stroke={colors.shade} strokeWidth="0.7" fill="none" opacity="0.5">
        <path d="M 222 140 q 8 14 12 30" />
        <path d="M 232 138 q 4 16 6 32" />
        <path d="M 242 142 q 0 16 -2 30" />
      </g>

      {/* HUGE LONG TRUNK with ring-folds — elephants have ~150,000 muscles
          in the trunk. Much longer and more dramatic than before. */}
      <path d="M 295 195 Q 332 220 340 255 Q 338 278 320 282 Q 304 274 306 252 Q 310 220 295 195 Z" fill={colors.shade} />
      <path d="M 297 197 Q 330 222 336 254 Q 334 274 320 278 Q 308 270 310 252 Q 312 220 297 197 Z" fill={colors.main} />
      {/* trunk ring-folds (the rib-like wrinkles) */}
      <g stroke={colors.shade} strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.7">
        <path d="M 300 208 q 12 10 22 0" />
        <path d="M 304 222 q 14 10 26 -2" />
        <path d="M 307 236 q 14 10 28 -2" />
        <path d="M 308 250 q 14 8 28 -2" />
        <path d="M 310 264 q 12 6 24 -2" />
      </g>
      {/* trunk tip with two finger-like lobes (African elephant feature) */}
      <ellipse cx="320" cy="282" rx="9" ry="5" fill={colors.shade} />
      <ellipse cx="320" cy="282" rx="6" ry="3" fill="#3a2818" opacity="0.7" />
      {/* nostril */}
      <ellipse cx="320" cy="280" rx="2" ry="1.4" fill="#1a1208" />

      {/* TUSKS — long curving ivory */}
      <polygon points="284,225 286,275 296,228" fill="#f0ead0" stroke="#b8a890" strokeWidth="0.6" />
      <polygon points="284,225 290,272 292,230" fill="#fff8e0" />
      {/* tusk shadow */}
      <ellipse cx="290" cy="270" rx="1.5" ry="1" fill={colors.shade} />

      {/* EYE — small, kind */}
      <g className="eye-blink" style={{ transformOrigin: '278px 175px' }}>
        <circle cx="278" cy="175" r="5" fill="white" stroke="#222" strokeWidth="0.6" />
        <circle cx="279" cy="175" r="3" fill="#1a1a1a" />
        <circle cx="280" cy="173" r="1.2" fill="white" />
        {/* long eyelashes */}
        <line x1="275" y1="171" x2="273" y2="168" stroke="#1a1a1a" strokeWidth="0.7" strokeLinecap="round" />
        <line x1="278" y1="170" x2="277" y2="167" stroke="#1a1a1a" strokeWidth="0.7" strokeLinecap="round" />
        <line x1="281" y1="170" x2="282" y2="167" stroke="#1a1a1a" strokeWidth="0.7" strokeLinecap="round" />
      </g>

      <ellipse cx="195" cy="287" rx="135" ry="6" fill="rgba(0,0,0,0.22)" />
    </svg>
  );
}

export function GorillaShape({ colors }: { colors: ColorOverride }) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
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

      {/* MASSIVE BARREL CHEST */}
      <ellipse cx="200" cy="190" rx="84" ry="80" fill={colors.shade} />
      <ellipse cx="200" cy="185" rx="78" ry="74" fill={colors.main} />
      <ellipse cx="200" cy="215" rx="56" ry="40" fill="#5a4a4a" opacity="0.55" />

      {/* SILVERBACK SADDLE — adult male gorillas develop a silver-grey
          patch of fur from shoulders to lower back. This is the iconic
          mature-male marker. */}
      <ellipse cx="200" cy="160" rx="68" ry="26" fill="#c8c8c8" opacity="0.7" />
      <ellipse cx="200" cy="158" rx="62" ry="22" fill="#e0e0e0" opacity="0.6" />
      {/* silvery fur lines on the saddle */}
      <g stroke="#a8a8a8" strokeWidth="0.8" fill="none" opacity="0.7">
        <path d="M 150 152 q 4 6 8 4" />
        <path d="M 170 148 q 4 6 8 4" />
        <path d="M 195 146 q 4 6 8 4" />
        <path d="M 220 148 q 4 6 8 4" />
        <path d="M 240 152 q 4 6 8 4" />
        <path d="M 160 168 q 4 6 8 4" />
        <path d="M 190 170 q 4 6 8 4" />
        <path d="M 220 168 q 4 6 8 4" />
      </g>

      {/* HEAD — slightly tapered (sagittal-crest hint) */}
      <ellipse cx="200" cy="110" rx="50" ry="44" fill={colors.shade} />
      <ellipse cx="200" cy="108" rx="46" ry="40" fill={colors.main} />
      {/* SAGITTAL CREST — peaked ridge on top of the skull (males only) */}
      <path d="M 184 72 Q 200 60 216 72 Q 208 80 200 78 Q 192 80 184 72 Z" fill={colors.shade} />

      {/* FACE — bare dark skin (gorillas have hairless faces) */}
      <ellipse cx="200" cy="135" rx="40" ry="26" fill="#3a2a1e" />
      <ellipse cx="200" cy="135" rx="35" ry="22" fill="#5a4632" />

      {/* PROMINENT BROW RIDGE — deeply furrowed, projecting forward */}
      <path d="M 152 88 Q 200 48 248 88" stroke={colors.shade} strokeWidth="14" fill="none" strokeLinecap="round" />
      <path d="M 156 90 Q 200 56 244 90" stroke="#3a2a1e" strokeWidth="9" fill="none" strokeLinecap="round" />
      {/* brow furrows */}
      <g stroke="#1a0e08" strokeWidth="1" fill="none" opacity="0.7">
        <path d="M 178 96 q 4 -4 8 -4" />
        <path d="M 214 96 q 4 -4 8 -4" />
      </g>

      {/* dark eye sockets */}
      <circle cx="158" cy="108" r="9" fill={colors.shade} />
      <circle cx="242" cy="108" r="9" fill={colors.shade} />

      {/* EYES — small, intelligent, deep-set */}
      <g className="eye-blink" style={{ transformOrigin: '184px 122px' }}>
        <circle cx="184" cy="122" r="5" fill="white" stroke="#222" strokeWidth="0.6" />
        <ellipse cx="185" cy="122" rx="2.6" ry="3.4" fill="#5a3a18" />
        <circle cx="185" cy="122" r="2" fill="#1a1a1a" />
        <circle cx="186" cy="120" r="1.2" fill="white" />
      </g>
      <g className="eye-blink" style={{ transformOrigin: '216px 122px' }}>
        <circle cx="216" cy="122" r="5" fill="white" stroke="#222" strokeWidth="0.6" />
        <ellipse cx="217" cy="122" rx="2.6" ry="3.4" fill="#5a3a18" />
        <circle cx="217" cy="122" r="2" fill="#1a1a1a" />
        <circle cx="218" cy="120" r="1.2" fill="white" />
      </g>

      {/* WIDE FLAT NOSE with prominent nostrils — gorilla signature */}
      <ellipse cx="200" cy="140" rx="11" ry="6" fill="#1a1208" opacity="0.85" />
      <ellipse cx="194" cy="141" rx="3" ry="2.4" fill="#000" />
      <ellipse cx="206" cy="141" rx="3" ry="2.4" fill="#000" />
      {/* nose bridge */}
      <path d="M 192 134 q 8 -4 16 0" stroke="#3a2010" strokeWidth="1.2" fill="none" />

      {/* MOUTH — wide, with subtle lip line */}
      <path d="M 184 152 Q 200 160 216 152" stroke="#1a1a1a" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M 188 152 Q 200 156 212 152" stroke="#1a1a1a" strokeWidth="1" fill="none" opacity="0.5" />

      {/* fur texture lines on the body shoulders */}
      <g stroke={colors.shade} strokeWidth="0.8" fill="none" opacity="0.55">
        <path d="M 130 190 q 6 8 4 16" />
        <path d="M 140 200 q 6 8 4 16" />
        <path d="M 260 190 q -6 8 -4 16" />
        <path d="M 250 200 q -6 8 -4 16" />
      </g>

      <ellipse cx="200" cy="287" rx="120" ry="6" fill="rgba(0,0,0,0.22)" />
    </svg>
  );
}

export function CamelShape({ colors }: { colors: ColorOverride }) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
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

      {/* PROMINENT HUMP — dromedary camel signature. Bigger and more rounded. */}
      <path d="M 120 195 Q 155 115 220 195 Z" fill={colors.shade} />
      <path d="M 124 195 Q 158 124 216 195 Z" fill={colors.main} />
      {/* hump highlight on top — sun-bleached top */}
      <ellipse cx="170" cy="142" rx="32" ry="8" fill={colors.light} opacity="0.6" />
      <ellipse cx="170" cy="160" rx="30" ry="5" fill={colors.light} opacity="0.4" />
      {/* fur tuft on top of the hump */}
      <g fill={colors.shade} opacity="0.7">
        <circle cx="160" cy="125" r="3" />
        <circle cx="170" cy="120" r="3.5" />
        <circle cx="180" cy="125" r="3" />
      </g>

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

      {/* EYE with the famously LONG CAMEL EYELASHES — they protect against
          desert sand and sun glare. Multiple eyelashes splayed above the eye. */}
      <g className="eye-blink" style={{ transformOrigin: '322px 112px' }}>
        <circle cx="322" cy="112" r="3.5" fill="white" stroke="#222" strokeWidth="0.5" />
        <circle cx="323" cy="112" r="2.2" fill="#1a1a1a" />
        <circle cx="324" cy="111" r="0.8" fill="white" />
      </g>
      {/* iconic long curving eyelashes */}
      <g stroke="#1a1a1a" strokeWidth="1.2" strokeLinecap="round" fill="none">
        <path d="M 318 107 Q 316 102 314 98" />
        <path d="M 322 106 Q 322 100 322 96" />
        <path d="M 326 107 Q 328 102 330 98" />
        <path d="M 330 109 Q 334 105 338 102" />
      </g>

      <path d="M 340 130 L 348 128" stroke="#3a2118" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function OstrichShape({ colors }: { colors: ColorOverride }) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
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

      {/* EYE with BIG LASHES — ostriches have the largest eyes of any land
          vertebrate (5cm wide, bigger than their own brain) and famously
          long curving lashes for desert glare protection. */}
      <g className="eye-blink" style={{ transformOrigin: '278px 38px' }}>
        <circle cx="278" cy="38" r="5" fill="white" stroke="#222" strokeWidth="0.6" />
        <circle cx="279" cy="38" r="3" fill="#1a1a1a" />
        <circle cx="280" cy="36" r="1.4" fill="white" />
      </g>
      {/* long curving eyelashes */}
      <g stroke="#1a1a1a" strokeWidth="1.2" strokeLinecap="round" fill="none">
        <path d="M 274 33 Q 272 28 270 24" />
        <path d="M 278 32 Q 278 26 278 22" />
        <path d="M 282 33 Q 284 28 286 24" />
      </g>

      {/* FLUFFY FEATHER TUFTS on the body — ostriches have iconic loose
          fluffy plumage, especially the showy tail and wing feathers. */}
      <g fill={colors.light} opacity="0.5">
        <circle cx="160" cy="244" r="6" />
        <circle cx="175" cy="252" r="5" />
        <circle cx="225" cy="252" r="5" />
        <circle cx="240" cy="244" r="6" />
      </g>

      <ellipse cx="200" cy="287" rx="110" ry="6" fill="rgba(0,0,0,0.22)" />
    </svg>
  );
}

export function EagleShape({ colors }: { colors: ColorOverride }) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
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

      {/* WHITE HEAD — bald eagle hood with a slight crest at the back */}
      <ellipse cx="200" cy="140" rx="28" ry="24" fill="#f4ede0" />
      <ellipse cx="200" cy="138" rx="24" ry="20" fill="white" />
      {/* feather lines on the head crown */}
      <g stroke="#d4cdc0" strokeWidth="0.8" fill="none" opacity="0.7">
        <path d="M 184 130 q 4 -2 6 0" />
        <path d="M 196 124 q 4 -2 6 0" />
        <path d="M 208 126 q 4 -2 6 0" />
        <path d="M 188 142 q 4 -2 6 0" />
        <path d="M 212 142 q 4 -2 6 0" />
      </g>

      {/* HOOKED BEAK — the signature feature. Sharper, more recurved.
          Bright yellow with a darker hook tip. */}
      <path d="M 198 142 Q 226 144 240 158 Q 232 168 220 165 Q 210 160 200 156 Z" fill="#fa9a30" />
      <path d="M 200 144 Q 222 146 234 158 Q 228 164 220 162 Q 212 158 202 154 Z" fill="#ffb850" />
      {/* hook tip - darker */}
      <path d="M 228 156 Q 240 158 240 158 Q 234 168 220 165 Q 226 160 232 156 Z" fill="#c8741a" />
      {/* nostril */}
      <ellipse cx="212" cy="150" rx="1.4" ry="1" fill="#3a2010" />

      {/* INTENSE EYE — yellow with a deep brow ridge */}
      <path d="M 184 130 Q 192 126 200 130" stroke={colors.shade} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <g className="eye-blink" style={{ transformOrigin: '194px 135px' }}>
        <circle cx="194" cy="135" r="5" fill="#ffd34a" stroke="#222" strokeWidth="0.8" />
        <circle cx="195" cy="135" r="3" fill="#1a1a1a" />
        <circle cx="196" cy="133" r="1.3" fill="white" />
      </g>

      {/* TAIL FEATHERS — white tail (mature bald eagle), splayed below the body */}
      <g>
        <path d="M 200 232 Q 184 256 178 274 L 200 264 Z" fill="#f4ede0" stroke={colors.shade} strokeWidth="0.8" />
        <path d="M 200 232 Q 192 258 194 278 L 200 264 Z" fill="#fff" stroke={colors.shade} strokeWidth="0.6" />
        <path d="M 200 232 Q 208 258 206 278 L 200 264 Z" fill="#fff" stroke={colors.shade} strokeWidth="0.6" />
        <path d="M 200 232 Q 216 256 222 274 L 200 264 Z" fill="#f4ede0" stroke={colors.shade} strokeWidth="0.8" />
      </g>

      {/* TALONS — large yellow legs with curved black CLAWS gripping prey.
          Real eagles have massive talons; this is the signature predator feature. */}
      <g>
        {/* left leg */}
        <path d="M 188 230 L 184 250" stroke="#e0a040" strokeWidth="5" strokeLinecap="round" />
        <path d="M 184 250 L 180 260" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 184 250 L 186 262" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 184 250 L 192 260" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 184 250 L 178 256" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
        {/* claw tips — pointed black */}
        <circle cx="180" cy="260" r="1.4" fill="#1a1a1a" />
        <circle cx="186" cy="262" r="1.4" fill="#1a1a1a" />
        <circle cx="192" cy="260" r="1.4" fill="#1a1a1a" />
        <circle cx="178" cy="256" r="1.4" fill="#1a1a1a" />
        {/* right leg */}
        <path d="M 212 230 L 216 250" stroke="#e0a040" strokeWidth="5" strokeLinecap="round" />
        <path d="M 216 250 L 220 260" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 216 250 L 214 262" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 216 250 L 208 260" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 216 250 L 222 256" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="220" cy="260" r="1.4" fill="#1a1a1a" />
        <circle cx="214" cy="262" r="1.4" fill="#1a1a1a" />
        <circle cx="208" cy="260" r="1.4" fill="#1a1a1a" />
        <circle cx="222" cy="256" r="1.4" fill="#1a1a1a" />
      </g>
    </svg>
  );
}

export function OwlShape({ colors }: { colors: ColorOverride }) {
  const spot = colors.pattern ?? '#3a2818';
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
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

      {/* FACIAL DISC — the iconic owl face. Pale heart-shaped feather ring
          that gathers sound into the ears, like a satellite dish. */}
      <path d="M 200 100 Q 152 102 142 130 Q 138 160 162 178 Q 200 188 238 178 Q 262 160 258 130 Q 248 102 200 100 Z" fill="#fae8c8" />
      <path d="M 200 105 Q 158 108 148 132 Q 146 158 168 172 Q 200 182 232 172 Q 254 158 252 132 Q 242 108 200 105 Z" fill="#fdf2d8" />
      {/* feather lines radiating around the disc — the satellite-dish texture */}
      <g stroke="#c8a878" strokeWidth="0.7" fill="none" opacity="0.7">
        <path d="M 200 102 Q 200 92 200 86" />
        <path d="M 174 108 Q 168 100 162 94" />
        <path d="M 152 124 Q 144 122 138 122" />
        <path d="M 148 152 Q 140 156 134 162" />
        <path d="M 162 174 Q 156 182 150 188" />
        <path d="M 226 108 Q 232 100 238 94" />
        <path d="M 248 124 Q 256 122 262 122" />
        <path d="M 252 152 Q 260 156 266 162" />
        <path d="M 238 174 Q 244 182 250 188" />
      </g>
      {/* central bridge between the eyes — gives owl its distinctive look */}
      <path d="M 195 130 Q 200 140 205 130 Q 200 150 195 130 Z" fill="#c8a878" opacity="0.5" />

      {/* HUGE round yellow eyes — owls have eyes that fill 70% of their skull.
          Surrounded by dark rings for that intense stare. */}
      <circle cx="180" cy="130" r="20" fill="#3a2010" />
      <circle cx="220" cy="130" r="20" fill="#3a2010" />
      <g className="eye-blink" style={{ transformOrigin: '180px 130px' }}>
        <circle cx="180" cy="130" r="17" fill="#ffd34a" stroke="#3a2010" strokeWidth="1.2" />
        <circle cx="180" cy="130" r="13" fill="#fa9a30" />
        <circle cx="181" cy="130" r="10" fill="#1a1a1a" />
        <circle cx="184" cy="126" r="3.5" fill="white" />
        <circle cx="178" cy="132" r="1.4" fill="white" opacity="0.7" />
      </g>
      <g className="eye-blink" style={{ transformOrigin: '220px 130px' }}>
        <circle cx="220" cy="130" r="17" fill="#ffd34a" stroke="#3a2010" strokeWidth="1.2" />
        <circle cx="220" cy="130" r="13" fill="#fa9a30" />
        <circle cx="221" cy="130" r="10" fill="#1a1a1a" />
        <circle cx="224" cy="126" r="3.5" fill="white" />
        <circle cx="218" cy="132" r="1.4" fill="white" opacity="0.7" />
      </g>

      {/* SHARP HOOKED BEAK — pointed downward, dark tip */}
      <path d="M 200 150 L 192 168 L 200 172 L 208 168 Z" fill="#d8851a" />
      <path d="M 200 152 L 194 166 L 200 170 L 206 166 Z" fill="#fa9a30" />
      <path d="M 196 168 L 200 174 L 204 168 L 200 170 Z" fill="#6a3010" />

      {/* WINGS folded against the body — angled with feather edge */}
      <ellipse cx="124" cy="200" rx="22" ry="50" fill={colors.shade} transform="rotate(10 124 200)" />
      <ellipse cx="124" cy="198" rx="18" ry="46" fill={colors.main} transform="rotate(10 124 200)" />
      <ellipse cx="276" cy="200" rx="22" ry="50" fill={colors.shade} transform="rotate(-10 276 200)" />
      <ellipse cx="276" cy="198" rx="18" ry="46" fill={colors.main} transform="rotate(-10 276 200)" />
      {/* wing feather barred lines */}
      <g stroke={spot} strokeWidth="1.2" fill="none" opacity="0.6">
        <path d="M 116 180 q 14 -4 22 0" />
        <path d="M 114 200 q 18 -4 26 0" />
        <path d="M 116 220 q 18 -4 24 0" />
        <path d="M 116 240 q 14 -4 20 0" />
        <path d="M 262 180 q 14 -4 22 0" transform="scale(-1,1) translate(-548,0)" />
        <path d="M 264 200 q 18 -4 26 0" transform="scale(-1,1) translate(-548,0)" />
        <path d="M 262 220 q 18 -4 24 0" transform="scale(-1,1) translate(-548,0)" />
        <path d="M 264 240 q 14 -4 20 0" transform="scale(-1,1) translate(-548,0)" />
      </g>

      {/* talons gripping the branch — sharper now */}
      <g>
        <path d="M 188 248 L 186 256 M 194 248 L 192 256" stroke="#3a2010" strokeWidth="3" strokeLinecap="round" />
        <path d="M 206 248 L 208 256 M 212 248 L 214 256" stroke="#3a2010" strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="195" cy="252" rx="7" ry="4" fill="#fa9a30" />
        <ellipse cx="208" cy="252" rx="7" ry="4" fill="#fa9a30" />
        {/* claws */}
        <g fill="#1a1208">
          <ellipse cx="186" cy="258" rx="1.5" ry="2" />
          <ellipse cx="192" cy="258" rx="1.5" ry="2" />
          <ellipse cx="208" cy="258" rx="1.5" ry="2" />
          <ellipse cx="214" cy="258" rx="1.5" ry="2" />
        </g>
      </g>

      <ellipse cx="200" cy="278" rx="70" ry="5" fill="rgba(0,0,0,0.4)" />
    </svg>
  );
}

export function TortoiseShape({ colors }: { colors: ColorOverride }) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
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

      {/* SHELL — dome with darker rim */}
      <path d="M 110 240 Q 200 105 290 240 Q 290 255 200 258 Q 110 255 110 240 Z" fill="#5a4828" />
      <path d="M 115 238 Q 200 115 285 238 Q 285 252 200 254 Q 115 252 115 238 Z" fill="#7a6232" />

      {/* HEXAGONAL SCUTE PATTERN — the iconic tortoise shell tiles.
          Central row of large hexes flanked by smaller surrounding scutes.
          Real tortoise shells have these growth-ring keratin plates. */}
      <g fill="#5a4828" stroke="#3a2818" strokeWidth="1.4">
        {/* central spine row */}
        <polygon points="200,115 215,128 215,150 200,162 185,150 185,128" />
        <polygon points="200,165 215,178 215,200 200,212 185,200 185,178" />
        <polygon points="200,215 215,225 215,240 200,250 185,240 185,225" />
        {/* left flank row */}
        <polygon points="155,150 170,158 170,178 155,186 140,178 140,158" />
        <polygon points="155,195 170,205 170,225 155,232 140,225 140,205" />
        {/* right flank row */}
        <polygon points="245,150 230,158 230,178 245,186 260,178 260,158" />
        <polygon points="245,195 230,205 230,225 245,232 260,225 260,205" />
        {/* edge rim scutes */}
        <polygon points="125,225 138,235 125,245 116,235" />
        <polygon points="275,225 262,235 275,245 284,235" />
      </g>
      {/* lighter scute centers — growth-ring highlight */}
      <g fill="#9a7a44" opacity="0.6">
        <polygon points="200,122 211,131 211,148 200,155 189,148 189,131" />
        <polygon points="200,172 211,180 211,198 200,205 189,198 189,180" />
        <polygon points="200,220 211,228 211,238 200,245 189,238 189,228" />
        <polygon points="155,156 166,162 166,176 155,180 144,176 144,162" />
        <polygon points="155,201 166,207 166,222 155,226 144,222 144,207" />
        <polygon points="245,156 234,162 234,176 245,180 256,176 256,162" />
        <polygon points="245,201 234,207 234,222 245,226 256,222 256,207" />
      </g>
      {/* growth rings on the center scutes — concentric darker lines */}
      <g stroke="#3a2818" strokeWidth="0.8" fill="none" opacity="0.6">
        <polygon points="200,130 207,136 207,148 200,153 193,148 193,136" />
        <polygon points="200,178 207,184 207,196 200,201 193,196 193,184" />
        <polygon points="200,225 207,231 207,238 200,243 193,238 193,231" />
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
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
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

      {/* SCALE TEXTURE on body — small bumps in a grid pattern */}
      <g fill={colors.shade} opacity="0.4">
        {[120, 140, 160, 180, 200, 220, 240].map((x) => (
          <g key={x}>
            <circle cx={x} cy="184" r="1.3" />
            <circle cx={x + 6} cy="190" r="1.3" />
            <circle cx={x} cy="196" r="1.3" />
          </g>
        ))}
      </g>

      {/* BIGGER, more pronounced ARMOR PLATES along the spine — the iconic
          crocodile osteoderm ridges. Replaced 6 thin triangles with 7 bigger
          armor plates with a paired-keel shape. */}
      <g fill={colors.shade}>
        <path d="M 100 172 L 108 156 L 114 160 L 120 156 L 128 172 Z" />
        <path d="M 128 170 L 136 154 L 142 158 L 148 154 L 156 170 Z" />
        <path d="M 156 168 L 164 150 L 170 154 L 176 150 L 184 168 Z" />
        <path d="M 184 166 L 192 148 L 198 152 L 204 148 L 212 166 Z" />
        <path d="M 212 168 L 220 150 L 226 154 L 232 150 L 240 168 Z" />
        <path d="M 240 170 L 248 154 L 254 158 L 260 154 L 268 170 Z" />
      </g>
      {/* darker plate centers for depth */}
      <g fill="#1a2a1a" opacity="0.4">
        <ellipse cx="114" cy="166" rx="3" ry="2" />
        <ellipse cx="142" cy="164" rx="3" ry="2" />
        <ellipse cx="170" cy="162" rx="3" ry="2" />
        <ellipse cx="198" cy="160" rx="3" ry="2" />
        <ellipse cx="226" cy="162" rx="3" ry="2" />
        <ellipse cx="254" cy="164" rx="3" ry="2" />
      </g>

      {/* HEAD/SNOUT — wider at the base, narrowing toward the tip */}
      <ellipse cx="290" cy="186" rx="55" ry="18" fill={colors.shade} />
      <ellipse cx="290" cy="184" rx="52" ry="15" fill={colors.main} />

      {/* BROW RIDGES — prominent bony hoods above the eyes (croc signature) */}
      <ellipse cx="278" cy="167" rx="12" ry="7" fill={colors.shade} />
      <ellipse cx="278" cy="166" rx="10" ry="5" fill={colors.main} />
      <ellipse cx="300" cy="167" rx="12" ry="7" fill={colors.shade} />
      <ellipse cx="300" cy="166" rx="10" ry="5" fill={colors.main} />

      {/* EYES — yellow with vertical slit pupils (reptile feature) */}
      <g className="eye-blink" style={{ transformOrigin: '278px 168px' }}>
        <circle cx="278" cy="168" r="4" fill="#ffd34a" stroke="#222" strokeWidth="0.6" />
        <ellipse cx="278" cy="168" rx="1.4" ry="3.4" fill="#1a1a1a" />
        <circle cx="279" cy="167" r="0.8" fill="white" opacity="0.7" />
      </g>
      <g className="eye-blink" style={{ transformOrigin: '300px 168px' }}>
        <circle cx="300" cy="168" r="4" fill="#ffd34a" stroke="#222" strokeWidth="0.6" />
        <ellipse cx="300" cy="168" rx="1.4" ry="3.4" fill="#1a1a1a" />
        <circle cx="301" cy="167" r="0.8" fill="white" opacity="0.7" />
      </g>

      {/* MOUTH with INTERLOCKING TEETH — the menacing croc grin where the
          bottom fangs stick UP through the upper lip, alternating with
          upper fangs hanging DOWN. */}
      <line x1="244" y1="192" x2="340" y2="192" stroke="#3a2118" strokeWidth="1.6" />
      {/* upper teeth pointing DOWN */}
      <g fill="white" stroke="#888" strokeWidth="0.3">
        {Array.from({ length: 11 }).map((_, i) => (
          <polygon key={`u${i}`} points={`${250 + i * 9},192 ${252 + i * 9},199 ${254 + i * 9},192`} />
        ))}
      </g>
      {/* lower teeth pointing UP — extra long fangs at positions 1, 4, 7
          stick THROUGH the upper jaw (the croc smile) */}
      <g fill="white" stroke="#888" strokeWidth="0.3">
        {Array.from({ length: 11 }).map((_, i) => {
          const isLongFang = i === 1 || i === 4 || i === 7;
          const tipY = isLongFang ? 178 : 185;
          return (
            <polygon
              key={`l${i}`}
              points={`${250 + i * 9},192 ${252 + i * 9},${tipY} ${254 + i * 9},192`}
            />
          );
        })}
      </g>

      {/* nostrils — raised on top of the snout (croc lets the snout sit at
          water level while the body is submerged) */}
      <ellipse cx="332" cy="180" rx="2.5" ry="1.6" fill={colors.shade} />
      <ellipse cx="326" cy="180" rx="2.5" ry="1.6" fill={colors.shade} />
      <ellipse cx="332" cy="180" rx="1" ry="0.6" fill="#1a1a1a" />
      <ellipse cx="326" cy="180" rx="1" ry="0.6" fill="#1a1a1a" />
    </svg>
  );
}

export function SharkShape({ colors }: { colors: ColorOverride }) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
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

      {/* BODY — torpedo silhouette with sharp countershading:
          dark grey top / pale white belly (great white shark colors) */}
      <ellipse cx="195" cy="175" rx="135" ry="42" fill={colors.shade} />
      <ellipse cx="195" cy="170" rx="128" ry="36" fill={colors.main} />
      {/* BRIGHT WHITE BELLY — distinctive countershade contrast */}
      <ellipse cx="195" cy="195" rx="118" ry="18" fill="#fff8e8" opacity="0.95" />
      <ellipse cx="195" cy="202" rx="110" ry="10" fill="#ffffff" opacity="0.85" />
      <ellipse cx="170" cy="148" rx="80" ry="10" fill="white" opacity="0.2" />

      {/* FIVE GILL SLITS — real great whites have exactly 5 vertical slits */}
      <g stroke={colors.shade} strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.85">
        <path d="M 105 160 q -2 12 0 24" />
        <path d="M 118 160 q -2 12 0 24" />
        <path d="M 131 160 q -2 12 0 24" />
        <path d="M 144 160 q -2 12 0 24" />
        <path d="M 157 160 q -2 12 0 24" />
      </g>

      {/* DORSAL FIN — the iconic shark silhouette. Bigger, sharper,
          slightly swept back (real great white proportions). */}
      <path d="M 172 135 Q 200 60 220 135 L 218 142 Z" fill={colors.shade} />
      <path d="M 176 138 Q 200 72 216 140 L 214 144 Z" fill={colors.main} />
      {/* darker tip — apex predator detail */}
      <path d="M 196 80 Q 200 60 208 90 L 200 90 Z" fill="#1a2530" opacity="0.4" />

      {/* SECOND DORSAL FIN (smaller, behind the main one) */}
      <path d="M 282 158 Q 290 138 300 158 Z" fill={colors.shade} />
      <path d="M 284 160 Q 290 144 298 160 Z" fill={colors.main} />

      {/* PECTORAL FINS — big sweeping triangles on the sides */}
      <path d="M 115 200 L 80 244 Q 100 232 145 212 Z" fill={colors.shade} />
      <path d="M 118 202 L 90 240 Q 108 230 142 214 Z" fill={colors.main} />
      <path d="M 285 200 L 320 244 Q 300 232 255 212 Z" fill={colors.shade} />
      <path d="M 282 202 L 310 240 Q 292 230 258 214 Z" fill={colors.main} />

      {/* PELVIC FIN (smaller, underside, mid-body) */}
      <path d="M 220 210 L 235 234 Q 245 222 248 210 Z" fill={colors.shade} />

      {/* CAUDAL FIN — asymmetric heterocercal tail (top lobe bigger,
          characteristic of great whites). Two lobes with notch. */}
      <path d="M 320 168 L 388 88 L 374 175 L 384 256 L 320 178 Z" fill={colors.shade} />
      <path d="M 322 170 L 380 100 L 368 174 L 376 248 L 322 176 Z" fill={colors.main} />
      <path d="M 374 175 Q 366 178 360 175" stroke={colors.shade} strokeWidth="1.5" fill="none" />

      {/* INTENSE BLACK EYE — predator eye, pure black, slightly larger */}
      <g className="eye-blink" style={{ transformOrigin: '78px 162px' }}>
        <circle cx="78" cy="162" r="6.5" fill="#1a1a1a" stroke="#0a0a0a" strokeWidth="0.8" />
        <circle cx="78" cy="162" r="5" fill="#000" />
        <circle cx="80" cy="160" r="1.4" fill="white" opacity="0.7" />
      </g>
      {/* dark eye ring for menace */}
      <path d="M 70 158 Q 78 154 88 158" stroke={colors.shade} strokeWidth="1.4" fill="none" strokeLinecap="round" />

      {/* MOUTH — wider, more menacing, slightly opened with VISIBLE
          TRIANGULAR TEETH (the signature shark trait) */}
      <path d="M 50 192 Q 80 184 102 196 Q 80 210 50 200 Z" fill="#1a0808" />
      <path d="M 52 194 Q 80 188 100 196 Q 80 206 52 198 Z" fill="#3a1010" opacity="0.7" />
      {/* upper row of teeth — bigger, sharper triangles */}
      <g fill="white" stroke="#888" strokeWidth="0.4">
        {Array.from({ length: 11 }).map((_, i) => (
          <polygon key={`u${i}`} points={`${56 + i * 4.5},193 ${58 + i * 4.5},200 ${60 + i * 4.5},193`} />
        ))}
      </g>
      {/* lower row of teeth */}
      <g fill="white" stroke="#888" strokeWidth="0.4">
        {Array.from({ length: 11 }).map((_, i) => (
          <polygon key={`l${i}`} points={`${56 + i * 4.5},199 ${58 + i * 4.5},192 ${60 + i * 4.5},199`} />
        ))}
      </g>

      {/* nostril hint */}
      <circle cx="60" cy="172" r="1.2" fill={colors.shade} opacity="0.7" />

      <ellipse cx="200" cy="262" rx="130" ry="7" fill="rgba(0,0,0,0.15)" />
    </svg>
  );
}

// ─── Cheetah — CARTOON STYLE ──────────────────────────────────────────
// Matches the cartoon Lion treatment: bold black outlines, solid colors,
// big sparkle eyes, friendly smile. Cheetah signature features preserved:
// dense spots, iconic tear lines, ringed tail with black tip, sleek build.
export function CheetahShape({ colors }: { colors: ColorOverride }) {
  const OUT = '#2a1810';
  const OUT_W = 3;
  const body = colors.main;
  const bodyShade = colors.shade;
  const belly = '#fff5d8';
  const spot = colors.pattern ?? '#1a1208';
  const tear = '#1a1208';        // tear-line color
  const innerEar = '#f4b8a0';
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
      {BG_DEFS}
      <rect width="400" height="300" fill="url(#shape-bg)" />
      <line x1="20" y1="282" x2="380" y2="282" stroke="#b5ad95" strokeWidth="1" strokeDasharray="3 4" />

      {/* TAIL — bold arched curve with black bands and a solid black tip */}
      <path d="M 95 200 Q 55 188 25 205 Q 8 222 20 245 Q 30 262 48 264"
        stroke={OUT} strokeWidth={OUT_W + 8} fill="none" strokeLinecap="round" />
      <path d="M 95 200 Q 55 188 25 205 Q 8 222 20 245 Q 30 262 48 264"
        stroke={body} strokeWidth={OUT_W + 4} fill="none" strokeLinecap="round" />
      {/* solid black tail bands */}
      <g fill={spot}>
        <ellipse cx="70" cy="195" rx="3.5" ry="7" transform="rotate(-15 70 195)" />
        <ellipse cx="50" cy="194" rx="3.5" ry="7" transform="rotate(-30 50 194)" />
        <ellipse cx="30" cy="208" rx="3.5" ry="7" transform="rotate(-55 30 208)" />
        <ellipse cx="20" cy="230" rx="3.5" ry="7" transform="rotate(-80 20 230)" />
      </g>
      {/* big black tail tip */}
      <ellipse cx="48" cy="264" rx="11" ry="13" fill={spot} stroke={OUT} strokeWidth={OUT_W - 1} />

      {/* LEGS — long thin sprinter legs with bold outline + dark paw */}
      {[112, 152, 230, 270].map((x, i) => (
        <g key={i}>
          <path d={`M ${x} 218 Q ${x - 5} 250 ${x + 5} 280`}
            stroke={OUT} strokeWidth={OUT_W + 6} fill="none" strokeLinecap="round" />
          <path d={`M ${x} 218 Q ${x - 5} 250 ${x + 5} 280`}
            stroke={i % 2 ? body : bodyShade} strokeWidth={OUT_W + 2} fill="none" strokeLinecap="round" />
          <ellipse cx={x + 5} cy="282" rx="11" ry="4" fill={OUT} />
          {/* small spot on each leg */}
          <circle cx={x - 1} cy={232} r="2" fill={spot} />
          <circle cx={x + 1} cy={250} r="1.6" fill={spot} />
        </g>
      ))}

      {/* BODY — slim sprinter silhouette as a single bold ellipse */}
      <ellipse cx="190" cy="200" rx="108" ry="28"
        fill={body} stroke={OUT} strokeWidth={OUT_W} />
      {/* WHITE BELLY — distinctive cheetah feature, sits inside the outline */}
      <ellipse cx="190" cy="215" rx="92" ry="11" fill={belly} />

      {/* SPOTS — bold, varied sizes, sparse-but-readable. Cartoon style
          uses fewer larger spots vs the painterly 40-spot density. */}
      <g fill={spot}>
        {/* upper back */}
        <ellipse cx="115" cy="186" rx="3.2" ry="2.6" />
        <ellipse cx="135" cy="190" rx="3.6" ry="2.8" />
        <ellipse cx="158" cy="184" rx="3.2" ry="2.6" />
        <ellipse cx="180" cy="188" rx="3.6" ry="2.8" />
        <ellipse cx="202" cy="184" rx="3.2" ry="2.6" />
        <ellipse cx="222" cy="188" rx="3.6" ry="2.8" />
        <ellipse cx="245" cy="184" rx="3.2" ry="2.6" />
        <ellipse cx="268" cy="190" rx="3.6" ry="2.8" />
        {/* mid */}
        <ellipse cx="125" cy="200" rx="3.2" ry="2.6" />
        <ellipse cx="148" cy="204" rx="3.6" ry="2.8" />
        <ellipse cx="172" cy="200" rx="3.2" ry="2.6" />
        <ellipse cx="194" cy="204" rx="3.6" ry="2.8" />
        <ellipse cx="218" cy="200" rx="3.2" ry="2.6" />
        <ellipse cx="240" cy="204" rx="3.6" ry="2.8" />
        <ellipse cx="262" cy="200" rx="3.2" ry="2.6" />
      </g>

      {/* HEAD — round small head sits at the front, bold outlined */}
      <circle cx="302" cy="186" r="28" fill={body} stroke={OUT} strokeWidth={OUT_W} />
      {/* light face patch */}
      <ellipse cx="296" cy="178" rx="14" ry="5" fill={belly} opacity="0.85" />

      {/* EARS — small rounded perky cartoon ears */}
      <g>
        <ellipse cx="286" cy="164" rx="9" ry="11" fill={body} stroke={OUT} strokeWidth={OUT_W}
          transform="rotate(-18 286 164)" />
        <ellipse cx="287" cy="167" rx="5" ry="7" fill={innerEar} transform="rotate(-18 287 167)" />
        <ellipse cx="318" cy="164" rx="9" ry="11" fill={body} stroke={OUT} strokeWidth={OUT_W}
          transform="rotate(18 318 164)" />
        <ellipse cx="317" cy="167" rx="5" ry="7" fill={innerEar} transform="rotate(18 317 167)" />
      </g>

      {/* BIG CARTOON EYES — amber with big black pupil + sparkles */}
      <g className="eye-blink" style={{ transformOrigin: '290px 180px' }}>
        <circle cx="290" cy="180" r="9" fill="white" stroke={OUT} strokeWidth={OUT_W - 1} />
        <circle cx="291" cy="181" r="6.5" fill="#e0a040" />
        <circle cx="291" cy="181" r="4.5" fill={OUT} />
        <circle cx="293" cy="178" r="2.2" fill="white" />
        <circle cx="289" cy="183" r="1" fill="white" />
      </g>
      <g className="eye-blink" style={{ transformOrigin: '314px 180px' }}>
        <circle cx="314" cy="180" r="9" fill="white" stroke={OUT} strokeWidth={OUT_W - 1} />
        <circle cx="315" cy="181" r="6.5" fill="#e0a040" />
        <circle cx="315" cy="181" r="4.5" fill={OUT} />
        <circle cx="317" cy="178" r="2.2" fill="white" />
        <circle cx="313" cy="183" r="1" fill="white" />
      </g>

      {/* ICONIC TEAR LINES — bold cartoon-thick stripes from eye to mouth.
          Cheetah's natural sun-glare reducer (the signature feature). */}
      <path d="M 290 189 Q 287 198 291 207"
        stroke={tear} strokeWidth={OUT_W + 1} fill="none" strokeLinecap="round" />
      <path d="M 314 189 Q 317 198 313 207"
        stroke={tear} strokeWidth={OUT_W + 1} fill="none" strokeLinecap="round" />

      {/* MUZZLE — light snout area */}
      <ellipse cx="302" cy="206" rx="14" ry="9" fill={belly} stroke={OUT} strokeWidth={OUT_W - 1} />

      {/* NOSE — triangular cartoon nose */}
      <path d="M 296 202 L 308 202 L 302 211 Z" fill={OUT} strokeLinejoin="round" />

      {/* MOUTH — small friendly smile */}
      <path d="M 302 211 L 302 215" stroke={OUT} strokeWidth={OUT_W - 1} strokeLinecap="round" />
      <path d="M 293 215 Q 302 222 311 215" stroke={OUT} strokeWidth={OUT_W - 1} fill="none" strokeLinecap="round" />
      {/* tiny fangs hint */}
      <polygon points="297,217 298,222 300,217" fill="white" stroke={OUT} strokeWidth="0.5" />
      <polygon points="304,217 306,222 307,217" fill="white" stroke={OUT} strokeWidth="0.5" />

      {/* whisker dots */}
      <g fill={OUT}>
        <circle cx="293" cy="208" r="1" />
        <circle cx="291" cy="212" r="1" />
        <circle cx="313" cy="208" r="1" />
        <circle cx="315" cy="212" r="1" />
      </g>

      <ellipse cx="195" cy="288" rx="135" ry="6" fill="rgba(0,0,0,0.22)" />
    </svg>
  );
}

// ─── Snow Leopard — CARTOON STYLE ─────────────────────────────────────
// Matches Lion/Cheetah cartoon treatment. Signature features preserved:
// pale blue-green icy eyes (only big cat with this color), extra-fluffy
// long tail, rosette pattern (open ring spots), pale grey-white fur.
export function SnowLeopardShape({ colors }: { colors: ColorOverride }) {
  const OUT = '#3a3530';
  const OUT_W = 3;
  const body = colors.main;
  const bodyShade = colors.shade;
  const belly = 'white';
  const rosette = colors.pattern ?? '#3a3530';
  const innerEar = '#f4c8d4';
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
      <defs>
        <linearGradient id="snow-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dfecf2" />
          <stop offset="1" stopColor="#f4f1e6" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#snow-bg)" />
      {/* snow strip */}
      <ellipse cx="200" cy="288" rx="200" ry="14" fill="white" />
      <ellipse cx="200" cy="290" rx="120" ry="6" fill="rgba(0,0,0,0.12)" />

      {/* EXTRA-FLUFFY THICK TAIL — single bold chunky outline + lighter
          underside band. Snow leopards have a tail almost as long as their
          body, used as a counterweight and as a scarf when sleeping. */}
      <path d="M 92 195 Q 50 180 22 200 Q 6 220 18 244 Q 30 260 50 260"
        stroke={OUT} strokeWidth={OUT_W + 22} fill="none" strokeLinecap="round" />
      <path d="M 92 195 Q 50 180 22 200 Q 6 220 18 244 Q 30 260 50 260"
        stroke={body} strokeWidth={OUT_W + 18} fill="none" strokeLinecap="round" />
      {/* light fluff underside */}
      <path d="M 92 200 Q 50 188 22 208 Q 8 226 22 246"
        stroke={belly} strokeWidth="9" fill="none" strokeLinecap="round" opacity="0.7" />
      {/* tail rosettes */}
      <g fill="none" stroke={rosette} strokeWidth={OUT_W - 1}>
        <circle cx="62" cy="195" r="5" />
        <circle cx="38" cy="208" r="5" />
        <circle cx="22" cy="230" r="5" />
        <circle cx="36" cy="252" r="4.5" />
      </g>

      {/* LEGS — chunky rounded rectangles with bold outline */}
      {[112, 154, 230, 270].map((x, i) => (
        <g key={i}>
          <rect x={x - 12} y="215" width="24" height="60" rx="8"
            fill={i % 2 ? body : bodyShade} stroke={OUT} strokeWidth={OUT_W} />
          <ellipse cx={x} cy="278" rx="14" ry="4" fill={OUT} />
          {/* rosette on each leg */}
          <circle cx={x} cy="235" r="4" fill="none" stroke={rosette} strokeWidth={OUT_W - 1} />
        </g>
      ))}

      {/* BODY — bold ellipse */}
      <ellipse cx="195" cy="195" rx="100" ry="42"
        fill={body} stroke={OUT} strokeWidth={OUT_W} />
      {/* white belly band */}
      <ellipse cx="195" cy="218" rx="84" ry="12" fill={belly} opacity="0.9" />

      {/* ROSETTES — open ring spots in two rows. Cartoon-clean.
          Snow leopards have ~12-14 visible rosettes on each side. */}
      <g fill="none" stroke={rosette} strokeWidth={OUT_W - 1}>
        {/* upper row */}
        <circle cx="135" cy="186" r="7" />
        <circle cx="165" cy="192" r="7" />
        <circle cx="195" cy="186" r="7" />
        <circle cx="225" cy="192" r="7" />
        <circle cx="255" cy="186" r="7" />
        {/* lower row */}
        <circle cx="120" cy="208" r="6" />
        <circle cx="150" cy="212" r="6" />
        <circle cx="180" cy="208" r="6" />
        <circle cx="210" cy="212" r="6" />
        <circle cx="240" cy="208" r="6" />
        <circle cx="268" cy="212" r="6" />
      </g>
      {/* tiny dark center dots inside each rosette (real rosette structure) */}
      <g fill={rosette}>
        <circle cx="135" cy="186" r="1.5" />
        <circle cx="165" cy="192" r="1.5" />
        <circle cx="195" cy="186" r="1.5" />
        <circle cx="225" cy="192" r="1.5" />
        <circle cx="255" cy="186" r="1.5" />
      </g>

      {/* HEAD — round face with bold outline */}
      <circle cx="298" cy="180" r="34" fill={body} stroke={OUT} strokeWidth={OUT_W} />
      {/* light upper face */}
      <ellipse cx="290" cy="170" rx="20" ry="6" fill={belly} opacity="0.6" />

      {/* EARS — small rounded with pink interior */}
      <g>
        <ellipse cx="282" cy="156" rx="10" ry="12" fill={body} stroke={OUT} strokeWidth={OUT_W}
          transform="rotate(-18 282 156)" />
        <ellipse cx="283" cy="159" rx="5" ry="7" fill={innerEar} transform="rotate(-18 283 159)" />
        <ellipse cx="316" cy="156" rx="10" ry="12" fill={body} stroke={OUT} strokeWidth={OUT_W}
          transform="rotate(18 316 156)" />
        <ellipse cx="315" cy="159" rx="5" ry="7" fill={innerEar} transform="rotate(18 315 159)" />
      </g>

      {/* SIGNATURE PALE BLUE-GREEN EYES — the icy eye color only snow
          leopards have. Big sparkle cartoon style. */}
      <g className="eye-blink" style={{ transformOrigin: '286px 178px' }}>
        <circle cx="286" cy="178" r="10" fill="white" stroke={OUT} strokeWidth={OUT_W - 1} />
        <circle cx="287" cy="178" r="7" fill="#9ad0d8" />
        <circle cx="287" cy="178" r="4.5" fill={OUT} />
        <circle cx="289" cy="175" r="2.4" fill="white" />
        <circle cx="285" cy="181" r="1.2" fill="white" />
      </g>
      <g className="eye-blink" style={{ transformOrigin: '314px 178px' }}>
        <circle cx="314" cy="178" r="10" fill="white" stroke={OUT} strokeWidth={OUT_W - 1} />
        <circle cx="315" cy="178" r="7" fill="#9ad0d8" />
        <circle cx="315" cy="178" r="4.5" fill={OUT} />
        <circle cx="317" cy="175" r="2.4" fill="white" />
        <circle cx="313" cy="181" r="1.2" fill="white" />
      </g>

      {/* dark eye-spots above (snow leopard face marking) */}
      <g fill={rosette}>
        <ellipse cx="282" cy="167" rx="2.5" ry="1.5" />
        <ellipse cx="318" cy="167" rx="2.5" ry="1.5" />
      </g>

      {/* MUZZLE — light snout area */}
      <ellipse cx="300" cy="200" rx="16" ry="11" fill={belly} stroke={OUT} strokeWidth={OUT_W - 1} />

      {/* NOSE — triangular dark nose */}
      <path d="M 293 196 L 307 196 L 300 204 Z" fill={OUT} strokeLinejoin="round" />

      {/* MOUTH — friendly smile + tiny fangs */}
      <path d="M 300 204 L 300 208" stroke={OUT} strokeWidth={OUT_W - 1} strokeLinecap="round" />
      <path d="M 290 210 Q 300 218 310 210" stroke={OUT} strokeWidth={OUT_W - 1} fill="none" strokeLinecap="round" />
      <polygon points="295,212 296,217 298,212" fill="white" stroke={OUT} strokeWidth="0.5" />
      <polygon points="302,212 304,217 305,212" fill="white" stroke={OUT} strokeWidth="0.5" />

      {/* whisker dots */}
      <g fill={OUT}>
        <circle cx="289" cy="202" r="1" />
        <circle cx="287" cy="206" r="1" />
        <circle cx="311" cy="202" r="1" />
        <circle cx="313" cy="206" r="1" />
      </g>
    </svg>
  );
}

export function WolfShape({ colors }: { colors: ColorOverride }) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
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

      {/* FUR RUFF — thick shaggy mane around the wolf's shoulders/neck.
          Layered tufts in two shades give it volume. Wolves have a
          distinctive winter-coat collar that other canines don't. */}
      <g>
        {/* darker outer tufts */}
        {[
          [240, 170, 14], [248, 188, 15], [252, 206, 13], [248, 222, 12],
          [232, 168, 12], [218, 162, 11], [205, 160, 10],
        ].map(([cx, cy, r], i) => (
          <circle key={`ro-${i}`} cx={cx} cy={cy} r={r} fill={colors.shade} />
        ))}
        {/* lighter inner tufts on top */}
        {[
          [244, 178, 10], [250, 196, 11], [248, 214, 9], [238, 226, 8],
          [234, 174, 9], [222, 168, 8],
        ].map(([cx, cy, r], i) => (
          <circle key={`ri-${i}`} cx={cx} cy={cy} r={r} fill={colors.main} />
        ))}
        {/* light highlights on the topmost tufts */}
        {[[240, 174, 5], [244, 192, 5], [240, 210, 4]].map(([cx, cy, r], i) => (
          <circle key={`rh-${i}`} cx={cx} cy={cy} r={r} fill={colors.light} opacity="0.55" />
        ))}
        {/* fur-direction lines around the ruff */}
        <g stroke={colors.shade} strokeWidth="1.4" strokeLinecap="round" opacity="0.55">
          <line x1="226" y1="160" x2="220" y2="146" />
          <line x1="240" y1="158" x2="238" y2="142" />
          <line x1="254" y1="170" x2="258" y2="156" />
        </g>
      </g>

      {/* HEAD — slightly more elongated for the iconic wolf snout */}
      <ellipse cx="285" cy="184" rx="34" ry="26" fill={colors.shade} />
      <ellipse cx="284" cy="182" rx="30" ry="22" fill={colors.main} />
      {/* cheek light patch (wolves have pale cheeks) */}
      <ellipse cx="278" cy="196" rx="14" ry="6" fill={colors.light} opacity="0.55" />

      {/* SNOUT — longer and more pointed than the original ellipse */}
      <path d="M 308 188 Q 344 192 348 200 Q 344 210 308 208 Z" fill={colors.shade} />
      <path d="M 310 190 Q 340 194 344 200 Q 340 208 310 206 Z" fill={colors.main} />
      <ellipse cx="345" cy="200" rx="5" ry="4" fill="#1a1a1a" />
      <line x1="345" y1="205" x2="345" y2="210" stroke="#1a1a1a" strokeWidth="1.5" />

      {/* mouth + fangs — repositioned for the new longer snout */}
      <path d="M 328 207 Q 334 212 340 209 Q 334 214 326 209" stroke="#1a1a1a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <polygon points="332,205 333,210 335,205" fill="white" />
      <polygon points="336,205 337,210 339,205" fill="white" />

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
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
      <defs>
        <linearGradient id="polar-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cfe3ec" />
          <stop offset="1" stopColor="#f4f1e6" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#polar-bg)" />
      <ellipse cx="200" cy="288" rx="200" ry="14" fill="white" />
      <ellipse cx="200" cy="290" rx="130" ry="6" fill="rgba(0,0,0,0.12)" />

      {/* short tail nub */}
      <ellipse cx="78" cy="210" rx="14" ry="10" fill={colors.shade} />
      <ellipse cx="78" cy="208" rx="11" ry="8" fill={colors.main} />

      {/* stocky legs with bigger paws */}
      <rect x="100" y="220" width="32" height="58" fill={colors.shade} rx="8" />
      <rect x="160" y="222" width="32" height="56" fill={colors.shade} rx="8" />
      <rect x="230" y="222" width="32" height="56" fill={colors.shade} rx="8" />
      <rect x="288" y="220" width="32" height="58" fill={colors.shade} rx="8" />
      <ellipse cx="116" cy="282" rx="22" ry="6" fill="#3a2118" />
      <ellipse cx="176" cy="282" rx="22" ry="6" fill="#3a2118" />
      <ellipse cx="246" cy="282" rx="22" ry="6" fill="#3a2118" />
      <ellipse cx="304" cy="282" rx="22" ry="6" fill="#3a2118" />
      {/* ICONIC CURVED CLAWS — 4 per paw, pointing forward */}
      <g fill="#1a1208" stroke="#000" strokeWidth="0.4">
        {[100, 110, 120, 130].map((x, i) => (
          <path key={`fl${i}`} d={`M ${x + 1} 282 q -1 4 -3 6 q 2 -2 4 -3 z`} />
        ))}
        {[160, 170, 180, 190].map((x, i) => (
          <path key={`fr${i}`} d={`M ${x + 1} 282 q -1 4 -3 6 q 2 -2 4 -3 z`} />
        ))}
        {[230, 240, 250, 260].map((x, i) => (
          <path key={`bl${i}`} d={`M ${x + 1} 282 q -1 4 -3 6 q 2 -2 4 -3 z`} />
        ))}
        {[288, 298, 308, 318].map((x, i) => (
          <path key={`br${i}`} d={`M ${x + 1} 282 q -1 4 -3 6 q 2 -2 4 -3 z`} />
        ))}
      </g>

      {/* BODY — bears are STOCKY, with a clear back arch */}
      <ellipse cx="200" cy="190" rx="135" ry="55" fill={colors.shade} />
      <ellipse cx="200" cy="184" rx="128" ry="50" fill={colors.main} />
      <ellipse cx="200" cy="215" rx="105" ry="18" fill={colors.light} opacity="0.7" />
      <ellipse cx="175" cy="150" rx="80" ry="12" fill="white" opacity="0.4" />

      {/* SHOULDER HUMP — distinctive muscular bear feature.
          A raised bulge above the shoulders, where the trapezius muscles
          power the digging arms. Grizzlies and polar bears have this;
          black bears don't (the easy way to tell them apart). */}
      <path d="M 220 150 Q 250 122 280 138 Q 290 156 282 170 Q 250 162 220 168 Z" fill={colors.shade} />
      <path d="M 224 152 Q 252 128 276 142 Q 285 156 278 168 Q 252 162 224 168 Z" fill={colors.main} />
      <ellipse cx="258" cy="145" rx="14" ry="6" fill="white" opacity="0.3" />
      {/* fur strokes on the hump */}
      <g stroke={colors.shade} strokeWidth="1" fill="none" opacity="0.5">
        <path d="M 244 142 q 2 -6 8 -8" />
        <path d="M 258 138 q 2 -6 8 -6" />
        <path d="M 272 142 q 0 -4 4 -6" />
      </g>

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
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
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

      {/* MUZZLE/SNOUT — pointed pink-tipped nose */}
      <ellipse cx="305" cy="210" rx="16" ry="12" fill={colors.main} />
      <ellipse cx="304" cy="208" rx="13" ry="9" fill={colors.light} opacity="0.5" />
      <ellipse cx="316" cy="212" rx="4" ry="3" fill="#d85a78" />
      {/* TWO BIG FRONT TEETH — the iconic rodent feature.
          Continuously-growing incisors poking out below the nose. */}
      <rect x="308" y="218" width="3" height="6" rx="0.5" fill="white" stroke="#888" strokeWidth="0.4" />
      <rect x="313" y="218" width="3" height="6" rx="0.5" fill="white" stroke="#888" strokeWidth="0.4" />

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
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
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
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
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

      {/* LEFT WING with VISIBLE FINGER BONES — the iconic bat feature.
          Bats are the only mammals with true flight, and their wings are
          elongated hand-and-finger skeletons stretched in a thin membrane.
          The visible bones radiating through the membrane are the giveaway. */}
      <path d="M 200 175 Q 110 100 30 130 Q 70 160 100 170 Q 140 180 200 185 Z" fill={colors.shade} />
      <path d="M 200 175 Q 115 108 38 134 Q 75 162 102 170 Q 142 178 200 182 Z" fill={colors.main} opacity="0.92" />
      {/* finger bones — 5 long ridges radiating outward from the body */}
      <g stroke={colors.shade} strokeWidth="2.2" fill="none" strokeLinecap="round">
        <line x1="200" y1="175" x2="40" y2="135" />
        <line x1="200" y1="175" x2="62" y2="150" />
        <line x1="200" y1="175" x2="85" y2="166" />
        <line x1="200" y1="175" x2="115" y2="175" />
        <line x1="200" y1="175" x2="155" y2="184" />
      </g>
      {/* tiny thumb claw at the wing tip */}
      <circle cx="30" cy="130" r="3" fill={colors.shade} />
      <polygon points="32,128 38,124 34,132" fill={colors.shade} />
      {/* wing membrane outline curve */}
      <path d="M 30 132 Q 60 145 95 170" stroke={colors.shade} strokeWidth="1" fill="none" opacity="0.7" />

      {/* RIGHT WING — mirrored */}
      <path d="M 200 175 Q 290 100 370 130 Q 330 160 300 170 Q 260 180 200 185 Z" fill={colors.shade} />
      <path d="M 200 175 Q 285 108 362 134 Q 325 162 298 170 Q 258 178 200 182 Z" fill={colors.main} opacity="0.92" />
      <g stroke={colors.shade} strokeWidth="2.2" fill="none" strokeLinecap="round">
        <line x1="200" y1="175" x2="360" y2="135" />
        <line x1="200" y1="175" x2="338" y2="150" />
        <line x1="200" y1="175" x2="315" y2="166" />
        <line x1="200" y1="175" x2="285" y2="175" />
        <line x1="200" y1="175" x2="245" y2="184" />
      </g>
      <circle cx="370" cy="130" r="3" fill={colors.shade} />
      <polygon points="368,128 362,124 366,132" fill={colors.shade} />
      <path d="M 370 132 Q 340 145 305 170" stroke={colors.shade} strokeWidth="1" fill="none" opacity="0.7" />

      {/* BODY — small furry torso */}
      <ellipse cx="200" cy="180" rx="22" ry="32" fill={colors.shade} />
      <ellipse cx="200" cy="178" rx="18" ry="28" fill={colors.main} />
      <ellipse cx="200" cy="195" rx="14" ry="14" fill={colors.light} opacity="0.4" />
      {/* fur tufts on belly */}
      <g fill={colors.light} opacity="0.4">
        <circle cx="195" cy="190" r="2.5" />
        <circle cx="205" cy="192" r="2.5" />
        <circle cx="200" cy="200" r="2.5" />
      </g>

      {/* HEAD */}
      <ellipse cx="200" cy="148" rx="22" ry="18" fill={colors.shade} />
      <ellipse cx="200" cy="146" rx="19" ry="15" fill={colors.main} />
      {/* furry forehead tuft */}
      <ellipse cx="200" cy="138" rx="14" ry="3" fill={colors.light} opacity="0.4" />

      {/* HUGE EARS — bigger now, with internal "fingerprint" lines hinting at
          the sound-collection ridges (real bats use these like satellite dishes
          for echolocation). */}
      <path d="M 186 134 L 174 96 L 200 124 Z" fill={colors.shade} />
      <path d="M 214 134 L 226 96 L 200 124 Z" fill={colors.shade} />
      <path d="M 188 132 L 180 108 L 196 126 Z" fill="#d88aa0" />
      <path d="M 212 132 L 220 108 L 204 126 Z" fill="#d88aa0" />
      {/* inner ear ridge lines */}
      <g stroke="#a8556a" strokeWidth="0.8" fill="none" opacity="0.7">
        <path d="M 184 124 L 188 116" />
        <path d="M 188 122 L 192 116" />
        <path d="M 216 124 L 212 116" />
        <path d="M 212 122 L 208 116" />
      </g>

      {/* EYES — small, dark, alert (bats see ok but echolocate better) */}
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

      {/* TINY NOSE LEAF — many bats have this distinctive ornament */}
      <ellipse cx="200" cy="153" rx="2.5" ry="1.6" fill="#a8556a" />
      <ellipse cx="200" cy="153" rx="1.4" ry="0.8" fill="#6a283c" />

      {/* MOUTH with VISIBLE FANGS — slightly larger, sharper. Vampire-style. */}
      <path d="M 192 158 Q 200 162 208 158" stroke="#1a0a08" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <polygon points="195,158 196,164 198,158" fill="white" stroke="#888" strokeWidth="0.3" />
      <polygon points="202,158 204,164 206,158" fill="white" stroke="#888" strokeWidth="0.3" />

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
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
      {BG_DEFS}
      <rect width="400" height="300" fill="url(#shape-bg-ice)" />

      <ellipse cx="200" cy="290" rx="180" ry="14" fill="white" />
      <ellipse cx="200" cy="285" rx="110" ry="9" fill="rgba(0,0,0,0.15)" />

      {/* BODY — dark torpedo (tuxedo back) */}
      <ellipse cx="207" cy="175" rx="78" ry="95" fill={colors.shade} />
      <ellipse cx="200" cy="170" rx="74" ry="90" fill={colors.main} />

      {/* WHITE BELLY — the iconic tuxedo front, sharp contrast */}
      <ellipse cx="200" cy="192" rx="48" ry="72" fill="white" />
      <ellipse cx="200" cy="180" rx="40" ry="50" fill={colors.light} opacity="0.5" />
      {/* sharp boundary curve between black back and white belly */}
      <path d="M 152 150 Q 158 195 174 250" stroke={colors.shade} strokeWidth="1" fill="none" opacity="0.5" />
      <path d="M 248 150 Q 242 195 226 250" stroke={colors.shade} strokeWidth="1" fill="none" opacity="0.5" />

      {/* HEAD — dark cap */}
      <ellipse cx="200" cy="100" rx="55" ry="48" fill={colors.shade} />
      <ellipse cx="200" cy="95" rx="50" ry="44" fill={colors.main} />

      {/* WHITE FACE MASK — wraps around the chin */}
      <path d="M 168 95 Q 200 130 232 95 Q 230 80 200 78 Q 170 80 168 95 Z" fill="white" opacity="0.95" />

      {/* EMPEROR PENGUIN AURICULAR PATCHES — bright yellow-orange teardrops
          on either side of the neck. The most iconic emperor-penguin marker. */}
      <path d="M 152 110 Q 144 130 152 152 Q 162 148 168 130 Q 168 115 156 110 Z" fill="#ffd34a" />
      <path d="M 155 115 Q 150 130 158 148 Q 164 145 166 130 Q 166 118 158 115 Z" fill="#fff088" opacity="0.7" />
      <path d="M 248 110 Q 256 130 248 152 Q 238 148 232 130 Q 232 115 244 110 Z" fill="#ffd34a" />
      <path d="M 245 115 Q 250 130 242 148 Q 236 145 234 130 Q 234 118 242 115 Z" fill="#fff088" opacity="0.7" />

      {/* EYES — dark, alert */}
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

      {/* LONG POINTED BEAK — penguins have notably long bills */}
      <polygon points="190,115 200,148 210,115" fill="#d8851a" />
      <polygon points="194,118 200,142 206,118" fill="#fa9a30" />
      <line x1="200" y1="118" x2="200" y2="142" stroke="#7a4810" strokeWidth="0.5" />
      {/* slight beak tip pink for the gular skin */}
      <circle cx="200" cy="146" r="1.6" fill="#a83828" />

      {/* FLIPPERS — angled side wings */}
      <ellipse cx="135" cy="180" rx="16" ry="50" fill={colors.shade} transform="rotate(12 135 180)" />
      <ellipse cx="265" cy="180" rx="16" ry="50" fill={colors.shade} transform="rotate(-12 265 180)" />
      <ellipse cx="133" cy="170" rx="8" ry="30" fill={colors.main} transform="rotate(12 133 170)" />
      <ellipse cx="267" cy="170" rx="8" ry="30" fill={colors.main} transform="rotate(-12 267 170)" />
      {/* white inner-flipper edge */}
      <ellipse cx="146" cy="220" rx="4" ry="14" fill="white" opacity="0.5" transform="rotate(12 146 220)" />
      <ellipse cx="254" cy="220" rx="4" ry="14" fill="white" opacity="0.5" transform="rotate(-12 254 220)" />

      {/* WEBBED FEET — bigger, with visible toe segments */}
      <ellipse cx="178" cy="271" rx="22" ry="7" fill="#d8851a" />
      <ellipse cx="222" cy="271" rx="22" ry="7" fill="#d8851a" />
      {/* toe webbing lines */}
      <g stroke="#7a4810" strokeWidth="0.8" fill="none">
        <line x1="166" y1="270" x2="172" y2="276" />
        <line x1="178" y1="270" x2="180" y2="276" />
        <line x1="190" y1="270" x2="188" y2="276" />
        <line x1="210" y1="270" x2="212" y2="276" />
        <line x1="222" y1="270" x2="220" y2="276" />
        <line x1="234" y1="270" x2="228" y2="276" />
      </g>
      {/* black claws */}
      <g fill="#1a1208">
        <circle cx="171" cy="276" r="1.2" />
        <circle cx="180" cy="276" r="1.2" />
        <circle cx="189" cy="276" r="1.2" />
        <circle cx="213" cy="276" r="1.2" />
        <circle cx="222" cy="276" r="1.2" />
        <circle cx="231" cy="276" r="1.2" />
      </g>
    </svg>
  );
}

// ─── EmojiShape ─────────────────────────────────────────────────────────
// Big centered emoji on a soft backdrop. The OS emoji font (Apple Color
// Emoji on iOS/Mac, Noto on Android, Segoe on Windows) does the heavy
// illustrative work — a single glyph is professionally illustrated at
// every size and looks crisp on any display.
//
// `colors` is accepted for API parity with the bespoke shape signature
// but is not used — emoji glyphs are pre-colored by the system font.

export const SHAPE_EMOJI: Record<string, string> = {
  snake: '🐍',
  octopus: '🐙',
  whale: '🐋',
  dolphin: '🐬',
  penguin: '🐧',
  lion: '🦁',
  cheetah: '🐆',
  snowleopard: '🐆',
  wolf: '🐺',
  foxkit: '🦊',
  polarbear: '🐻‍❄️',
  mouse: '🐭',
  hummingbird: '🐦',
  bat: '🦇',
  sloth: '🦥',
  kangaroo: '🦘',
  elephant: '🐘',
  gorilla: '🦍',
  camel: '🐪',
  ostrich: '🪿',
  eagle: '🦅',
  owl: '🦉',
  tortoise: '🐢',
  crocodile: '🐊',
  shark: '🦈',
  chameleon: '🦎',
  raptor: '🦖',
  triceratops: '🦕',
  stegosaurus: '🦕',
  pterodactyl: '🦅',
  tiger: '🐯',
  trex: '🦖',
  jellyfish: '🪼',
  sheep: '🐑',
  cow: '🐄',
  horse: '🐎',
  pig: '🐖',
  giraffe: '🦒',
  rooster: '🐓',
  donkey: '🫏',
  rhino: '🦏',
  cat: '🐈',
  dog: '🐕',
  goat: '🐐',
};

// Aquatic species get the water gradient; ice species the ice gradient;
// everything else uses the default warm backdrop.
const SHAPE_BG: Record<string, string> = {
  octopus: 'shape-bg-water',
  whale: 'shape-bg-water',
  dolphin: 'shape-bg-water',
  shark: 'shape-bg-water',
  jellyfish: 'shape-bg-water',
  penguin: 'shape-bg-ice',
  polarbear: 'shape-bg-ice',
  snowleopard: 'shape-bg-ice',
};

// Species classification — used by arenas to swap egg/clutch language and
// visuals for live-bearing mammals (litters of cubs/pups) vs. egg-layers
// (clutches of eggs). Marsupials like kangaroo are included as mammals.
export const MAMMAL_SHAPES = new Set<string>([
  'lion', 'cheetah', 'snowleopard', 'tiger', 'wolf', 'foxkit', 'polarbear',
  'mouse', 'bat', 'sloth', 'kangaroo', 'elephant', 'gorilla', 'camel',
  'sheep', 'cow', 'horse', 'pig', 'giraffe', 'donkey', 'rhino',
  'cat', 'dog', 'goat', 'whale', 'dolphin',
]);

export function isMammalShape(shape?: string): boolean {
  return !!shape && MAMMAL_SHAPES.has(shape);
}

function makeEmojiShape(shapeName: string): ComponentType<{ colors: ColorOverride }> {
  const emoji = SHAPE_EMOJI[shapeName] ?? '🐾';
  const bg = SHAPE_BG[shapeName] ?? 'shape-bg';
  const Component: ComponentType<{ colors: ColorOverride }> = () => (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
      {BG_DEFS}
      <rect width="400" height="300" fill={`url(#${bg})`} />
      {/* soft ground shadow */}
      <ellipse cx="200" cy="278" rx="105" ry="9" fill="rgba(0,0,0,0.18)" />
      {/* the emoji itself — bottom-anchored so the glyph's paws/base sit
          on the ground line instead of typographically centering inside
          an oversized em-box (which made the creature appear to float
          in the upper half of the tile, especially inside arena scenes). */}
      <text
        x="200"
        y="275"
        textAnchor="middle"
        fontSize="240"
        style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.25))' }}
      >
        {emoji}
      </text>
    </svg>
  );
  Component.displayName = `EmojiShape(${shapeName})`;
  return Component;
}

// Registry: shape-name → component. Used by CreatureStage / CreatureSVG /
// DexModal so a creature loaded straight from the dex can render its
// canonical silhouette anywhere in the app. As of the emoji-art pivot,
// every entry is an EmojiShape — the OS emoji font outclasses anything
// we can hand-code in SVG.
export const BESPOKE_SHAPES: Record<string, ComponentType<{ colors: ColorOverride }>> = Object.fromEntries(
  Object.keys(SHAPE_EMOJI).map((shape) => [shape, makeEmojiShape(shape)])
);

export function getBespokeShape(name?: string): ComponentType<{ colors: ColorOverride }> | null {
  if (!name || name === 'default') return null;
  return BESPOKE_SHAPES[name] ?? null;
}

// ─── BespokeInScene ─────────────────────────────────────────────────────
// Drops a bespoke dex shape (Octopus, Tiger, etc.) into another SVG scene
// (an arena) at a specific position + size, with the background stripped
// via CSS (the .dex-bare class targets the BG rect by its 400×300 size
// and the horizon line by its dash pattern). Uses <foreignObject> so we
// can host the bespoke <svg> inside HTML where width/height behave normally.
import type { Creature } from '../types';
interface BespokeInSceneProps {
  creature: Creature;
  /** top-left corner of the placement box, in parent-SVG coordinates */
  x: number;
  y: number;
  width: number;
  height: number;
  /** optional CSS animation class — e.g. 'bob-run' or 'bob-breathe' */
  animate?: 'run' | 'breathe' | 'none';
  /** mirror horizontally (e.g. fleeing prey) */
  facingRight?: boolean;
}

export function BespokeInScene({ creature, x, y, width, height, animate = 'none', facingRight = true }: BespokeInSceneProps) {
  const Bespoke = getBespokeShape(creature.shape);
  if (!Bespoke || !creature.colors) return null;
  const animClass = animate === 'run' ? 'bob-run' : animate === 'breathe' ? 'bob-breathe' : '';
  const flipStyle = facingRight ? undefined : { transform: 'scaleX(-1)', transformOrigin: 'center' };
  const hasHybrids = creature.hybrids && creature.hybrids.length > 0;
  return (
    <foreignObject x={x} y={y} width={width} height={height} style={{ overflow: 'visible' }}>
      <div
        // SVG-inside-foreignObject in React: namespace handled automatically
        className={`dex-bare ${animClass}`.trim()}
        style={{ width: '100%', height: '100%', position: 'relative', ...flipStyle }}
      >
        <Bespoke colors={creature.colors} />
        {hasHybrids && (
          // Overlay SVG aligned to the same 400×300 coordinate space as every
          // dex shape — draws hybrid decorations (wings, fur, armor, etc.) on
          // top of the parent shape so the goat-with-wings actually shows wings.
          <svg
            viewBox="0 0 400 300"
            preserveAspectRatio="xMidYMax meet"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          >
            <HybridOverlay hybrids={creature.hybrids} colors={creature.colors} />
          </svg>
        )}
      </div>
    </foreignObject>
  );
}

// ─── HybridOverlay ──────────────────────────────────────────────────────
// Decorations drawn on top of a bespoke shape to visually indicate hybrid
// traits. Positions are tuned for the standard 400×300 dex viewBox with a
// generic side-view quadruped body in the upper 87% (most dex shapes).
function HybridOverlay({ hybrids, colors }: { hybrids: import('../types').Hybrid[]; colors: ColorOverride }) {
  return (
    <g>
      {/* WINGS — feathered wings sweeping up from the back */}
      {hybrids.includes('wings') && (
        <g transform="translate(180 150)" opacity="0.92">
          <path d="M 0 0 Q -30 -60 -90 -50 Q -100 -20 -70 0 Q -40 8 -10 4 Z" fill={colors.shade ?? '#a89878'} stroke="#3a2a14" strokeWidth="1.5" />
          <path d="M 0 0 Q -30 -50 -75 -42 Q -85 -22 -60 -6 Q -35 0 -8 -2 Z" fill={colors.main ?? '#d8c890'} />
          {/* feather lines */}
          <g stroke="#3a2a14" strokeWidth="0.6" fill="none" opacity="0.65">
            <line x1="-10" y1="-2" x2="-30" y2="-22" />
            <line x1="-20" y1="-4" x2="-44" y2="-26" />
            <line x1="-30" y1="-6" x2="-58" y2="-30" />
            <line x1="-40" y1="-8" x2="-70" y2="-32" />
          </g>
        </g>
      )}

      {/* DRAGON — twin spiral horns from the head */}
      {hybrids.includes('dragon') && (
        <g transform="translate(310 110)" opacity="0.9">
          <path d="M 0 0 Q -6 -22 -10 -32 L -6 -20 Z" fill="#3a2814" stroke="#1a1208" strokeWidth="1" />
          <path d="M 12 4 Q 14 -16 18 -28 L 14 -16 Z" fill="#3a2814" stroke="#1a1208" strokeWidth="1" />
        </g>
      )}

      {/* THICK FUR — fluffy halo of fur tufts around the body */}
      {hybrids.includes('thick-fur') && (
        <g opacity="0.55" fill={colors.light ?? '#fff'}>
          {[[120, 170, 8], [150, 145, 7], [200, 135, 9], [250, 145, 7], [280, 175, 8],
            [115, 200, 7], [285, 200, 7], [100, 230, 6], [300, 230, 6]].map(([cx, cy, r], i) => (
            <circle key={i} cx={cx} cy={cy} r={r} />
          ))}
        </g>
      )}

      {/* STONESKIN — grey armor plates on the back */}
      {hybrids.includes('stoneskin') && (
        <g opacity="0.85">
          <ellipse cx="160" cy="160" rx="22" ry="14" fill="#7a7468" stroke="#3a342a" strokeWidth="1" />
          <ellipse cx="195" cy="150" rx="22" ry="14" fill="#8a8478" stroke="#3a342a" strokeWidth="1" />
          <ellipse cx="232" cy="160" rx="22" ry="14" fill="#7a7468" stroke="#3a342a" strokeWidth="1" />
        </g>
      )}

      {/* VENOM — drip from the mouth, fangs hint */}
      {hybrids.includes('venom') && (
        <g transform="translate(348 162)" opacity="0.95">
          <ellipse cx="0" cy="6" rx="3" ry="6" fill="#58c850" stroke="#1a4818" strokeWidth="0.8" />
          <circle cx="0" cy="14" r="2" fill="#58c850" />
          <circle cx="2" cy="20" r="1.4" fill="#58c850" />
        </g>
      )}

      {/* FIREBREATH — flame plume from the mouth */}
      {hybrids.includes('firebreath') && (
        <g transform="translate(354 160)" opacity="0.95">
          <path d="M 0 0 Q 20 -6 38 -2 Q 30 4 38 10 Q 20 8 0 6 Z" fill="#ff7820" />
          <path d="M 4 -2 Q 18 -4 30 0 Q 22 4 30 8 Q 18 6 4 4 Z" fill="#ffd040" />
        </g>
      )}

      {/* ELECTRIC — yellow spark zigzags around the body */}
      {hybrids.includes('electric') && (
        <g stroke="#ffd040" strokeWidth="2" fill="none" opacity="0.95" strokeLinecap="round">
          <path d="M 100 130 L 90 138 L 100 142 L 90 152" />
          <path d="M 310 130 L 320 138 L 312 144 L 322 152" />
          <path d="M 200 80 L 196 92 L 204 90 L 198 102" />
        </g>
      )}

      {/* GILLS — three slits on the neck */}
      {hybrids.includes('gills') && (
        <g transform="translate(270 158)" opacity="0.85" stroke="#5a3030" strokeWidth="2" fill="none" strokeLinecap="round">
          <path d="M 0 0 q -2 4 0 8" />
          <path d="M 6 0 q -2 4 0 8" />
          <path d="M 12 0 q -2 4 0 8" />
        </g>
      )}

      {/* ANTIFREEZE — pale blue frost glow */}
      {hybrids.includes('antifreeze') && (
        <g opacity="0.45" fill="#aef0ff">
          {[[140, 175, 3], [240, 170, 3], [180, 200, 2.5], [220, 200, 2.5]].map(([cx, cy, r], i) => (
            <g key={i} transform={`translate(${cx} ${cy})`}>
              <line x1={-r} y1="0" x2={r} y2="0" stroke="#aef0ff" strokeWidth="1" />
              <line x1="0" y1={-r} x2="0" y2={r} stroke="#aef0ff" strokeWidth="1" />
              <line x1={-r * 0.7} y1={-r * 0.7} x2={r * 0.7} y2={r * 0.7} stroke="#aef0ff" strokeWidth="1" />
              <line x1={-r * 0.7} y1={r * 0.7} x2={r * 0.7} y2={-r * 0.7} stroke="#aef0ff" strokeWidth="1" />
            </g>
          ))}
        </g>
      )}

      {/* ECHOLOCATION — sound waves emitting from the head */}
      {hybrids.includes('echolocation') && (
        <g transform="translate(340 138)" stroke="#9a60d0" strokeWidth="1.4" fill="none" opacity="0.7">
          <path d="M 0 0 q 8 -10 18 0" />
          <path d="M -4 4 q 14 -16 28 0" />
          <path d="M -8 8 q 20 -22 38 0" />
        </g>
      )}

      {/* CAMOUFLAGE — soft dappled patches over the body */}
      {hybrids.includes('camouflage') && (
        <g opacity="0.4" fill={colors.pattern ?? '#3a342a'}>
          <ellipse cx="160" cy="175" rx="12" ry="6" />
          <ellipse cx="200" cy="190" rx="14" ry="7" />
          <ellipse cx="240" cy="170" rx="10" ry="5" />
          <ellipse cx="220" cy="160" rx="9" ry="4" />
        </g>
      )}

      {/* SYMBIOSIS — small companion bird perched on the back */}
      {hybrids.includes('symbiosis') && (
        <g transform="translate(220 130)" opacity="0.95">
          <ellipse cx="0" cy="0" rx="8" ry="5" fill="#d4d0c4" />
          <circle cx="6" cy="-2" r="3" fill="#d4d0c4" />
          <circle cx="7" cy="-3" r="0.8" fill="#1a1208" />
          <path d="M 9 -2 L 13 0 L 9 1 Z" fill="#ffb030" />
          <line x1="-6" y1="2" x2="-12" y2="4" stroke="#d4d0c4" strokeWidth="2" />
        </g>
      )}

      {/* HYPERSONIC — motion blur lines streaming back */}
      {hybrids.includes('hypersonic') && (
        <g stroke="#c0d8e8" strokeWidth="2.5" fill="none" opacity="0.65" strokeLinecap="round">
          <line x1="50" y1="160" x2="100" y2="160" />
          <line x1="40" y1="180" x2="95" y2="180" />
          <line x1="50" y1="200" x2="100" y2="200" />
        </g>
      )}

      {/* PHOTOSYNTHESIS — green leafy patches + sun rays around the body */}
      {hybrids.includes('photosynthesis') && (
        <g>
          {/* leafy patches on the back */}
          <g fill="#5a9a4a" stroke="#3a7a2a" strokeWidth="0.6">
            <ellipse cx="160" cy="160" rx="8" ry="5" transform="rotate(-20 160 160)" />
            <ellipse cx="195" cy="155" rx="9" ry="6" transform="rotate(0 195 155)" />
            <ellipse cx="230" cy="160" rx="8" ry="5" transform="rotate(20 230 160)" />
            <ellipse cx="180" cy="175" rx="6" ry="4" transform="rotate(-15 180 175)" />
            <ellipse cx="215" cy="175" rx="6" ry="4" transform="rotate(15 215 175)" />
          </g>
          {/* leaf veins */}
          <g stroke="#3a7a2a" strokeWidth="0.6" fill="none" opacity="0.7">
            <path d="M 160 160 q 3 0 6 -1" />
            <path d="M 195 155 q 4 0 7 -1" />
            <path d="M 230 160 q 3 0 6 -1" />
          </g>
          {/* sun rays overhead — small radiating lines */}
          <g stroke="#ffd34a" strokeWidth="1.4" fill="none" opacity="0.7" strokeLinecap="round">
            <line x1="195" y1="95" x2="195" y2="85" />
            <line x1="180" y1="98" x2="174" y2="90" />
            <line x1="210" y1="98" x2="216" y2="90" />
            <line x1="165" y1="108" x2="158" y2="103" />
            <line x1="225" y1="108" x2="232" y2="103" />
          </g>
        </g>
      )}

      {/* REGENERATION — pink heart-shaped pulse + healing sparkles */}
      {hybrids.includes('regeneration') && (
        <g>
          {/* glowing pulse around the body */}
          <ellipse cx="200" cy="185" rx="120" ry="50" fill="none" stroke="#ff7ab0" strokeWidth="1.4" opacity="0.5" strokeDasharray="4 6" />
          {/* tiny heal sparkles */}
          <g fill="#ff7ab0" opacity="0.85">
            <path d="M 140 180 l 2 -5 l 2 5 l 5 2 l -5 2 l -2 5 l -2 -5 l -5 -2 z" />
            <path d="M 250 175 l 1.5 -4 l 1.5 4 l 4 1.5 l -4 1.5 l -1.5 4 l -1.5 -4 l -4 -1.5 z" />
            <path d="M 210 200 l 1.5 -4 l 1.5 4 l 4 1.5 l -4 1.5 l -1.5 4 l -1.5 -4 l -4 -1.5 z" />
          </g>
        </g>
      )}

      {/* BIOLUMINESCENCE — glowing spots on the body */}
      {hybrids.includes('bioluminescence') && (
        <g>
          {/* core spots — bright cyan */}
          <g fill="#aef0ff" opacity="0.95">
            <circle cx="160" cy="175" r="2.5" />
            <circle cx="180" cy="190" r="2" />
            <circle cx="200" cy="180" r="3" />
            <circle cx="220" cy="190" r="2" />
            <circle cx="240" cy="175" r="2.5" />
            <circle cx="195" cy="200" r="2" />
            <circle cx="215" cy="200" r="2" />
          </g>
          {/* outer halo around each spot */}
          <g fill="#88c8ee" opacity="0.35">
            <circle cx="160" cy="175" r="6" />
            <circle cx="200" cy="180" r="7" />
            <circle cx="240" cy="175" r="6" />
          </g>
          {/* head lure (anglerfish-style) */}
          <line x1="320" y1="160" x2="332" y2="142" stroke="#88c8ee" strokeWidth="1.2" />
          <circle cx="332" cy="142" r="4" fill="#aef0ff" />
          <circle cx="332" cy="142" r="7" fill="#aef0ff" opacity="0.3" />
        </g>
      )}

      {/* MIMICRY — wavy shimmer outline + question marks */}
      {hybrids.includes('mimicry') && (
        <g opacity="0.7">
          {/* shimmery wave around the body */}
          <path d="M 120 165 q 10 -8 20 0 q 10 8 20 0 q 10 -8 20 0 q 10 8 20 0 q 10 -8 20 0 q 10 8 20 0 q 10 -8 20 0"
            stroke="#c8a8ff" strokeWidth="1.4" fill="none" opacity="0.7" />
          <path d="M 120 210 q 10 -8 20 0 q 10 8 20 0 q 10 -8 20 0 q 10 8 20 0 q 10 -8 20 0 q 10 8 20 0 q 10 -8 20 0"
            stroke="#c8a8ff" strokeWidth="1.4" fill="none" opacity="0.7" />
          {/* question marks floating */}
          <text x="120" y="140" fontSize="14" fill="#9a60d0" opacity="0.8" fontWeight="700">?</text>
          <text x="270" y="135" fontSize="12" fill="#9a60d0" opacity="0.8" fontWeight="700">?</text>
        </g>
      )}

      {/* HIBERNATION — sleeping Zzz over the head */}
      {hybrids.includes('hibernation') && (
        <g opacity="0.85">
          <text x="320" y="120" fontSize="20" fill="#5a4a36" fontWeight="700" fontStyle="italic">z</text>
          <text x="328" y="105" fontSize="16" fill="#5a4a36" fontWeight="700" fontStyle="italic">z</text>
          <text x="338" y="92" fontSize="12" fill="#5a4a36" fontWeight="700" fontStyle="italic">z</text>
        </g>
      )}
    </g>
  );
}

// Convenience: returns whether this creature should render as a bespoke
// shape (used by arenas to decide between BespokeInScene and CreatureBody).
export function hasBespokeShape(creature: Creature): boolean {
  return !!(getBespokeShape(creature.shape) && creature.colors);
}

// ─── Sloth ──────────────────────────────────────────────────────────────
// Slow arboreal mammal: long hook claws, shaggy algae-green fur, sleepy face.
export function SlothShape({ colors }: { colors: ColorOverride }) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
      {BG_DEFS}
      <rect width="400" height="300" fill="url(#shape-bg)" />
      <line x1="30" y1="85" x2="370" y2="55" stroke="#7a5a32" strokeWidth="16" strokeLinecap="round" />
      <line x1="78" y1="110" x2="338" y2="88" stroke="#a67a43" strokeWidth="6" strokeLinecap="round" opacity="0.75" />
      <ellipse cx="200" cy="255" rx="112" ry="7" fill="rgba(0,0,0,0.16)" />

      <path d="M 140 105 Q 118 154 128 218" stroke={colors.shade} strokeWidth="26" fill="none" strokeLinecap="round" />
      <path d="M 250 98 Q 285 142 278 215" stroke={colors.shade} strokeWidth="26" fill="none" strokeLinecap="round" />
      <path d="M 140 105 Q 118 154 128 218" stroke={colors.main} strokeWidth="18" fill="none" strokeLinecap="round" />
      <path d="M 250 98 Q 285 142 278 215" stroke={colors.main} strokeWidth="18" fill="none" strokeLinecap="round" />

      {/* HOOKED CLAWS — bigger, sharper, the iconic sloth feature.
          Sloths hang from these claws for hours; they're permanent hooks. */}
      <g stroke="#2d2015" strokeWidth="4" fill="none" strokeLinecap="round">
        <path d="M 126 92 q 0 24 18 22" />
        <path d="M 142 90 q 0 24 18 22" />
        <path d="M 158 90 q 0 22 16 20" />
        <path d="M 234 88 q 0 24 18 22" />
        <path d="M 250 87 q 0 24 18 22" />
        <path d="M 266 87 q 0 22 16 20" />
      </g>
      {/* claw tips — pointed black */}
      <g fill="#1a0e08">
        <circle cx="144" cy="114" r="1.4" />
        <circle cx="160" cy="112" r="1.4" />
        <circle cx="174" cy="110" r="1.4" />
        <circle cx="252" cy="110" r="1.4" />
        <circle cx="268" cy="109" r="1.4" />
        <circle cx="282" cy="107" r="1.4" />
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
      {/* nose */}
      <ellipse cx="205" cy="128" rx="5" ry="3.5" fill="#2d2015" />
      {/* ICONIC SLEEPY SMILE — wide upturned mouth (sloths look permanently happy) */}
      <path d="M 188 138 Q 205 152 222 138" stroke="#2d2015" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      {/* slight cheek dimples */}
      <ellipse cx="186" cy="135" rx="3" ry="2" fill="#d4a878" opacity="0.5" />
      <ellipse cx="224" cy="135" rx="3" ry="2" fill="#d4a878" opacity="0.5" />

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
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
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
  // CARTOON STYLE — bold outlines, solid colors, sparkle eyes, friendly mouth.
  // Signature features preserved: irregular black stripes, white belly,
  // ringed black-tipped tail, amber eyes, perky pink-interior ears.
  const OUT = '#2a1810';
  const OUT_W = 3;
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
      {BG_DEFS}
      <rect width="400" height="300" fill="url(#shape-bg)" />
      <line x1="20" y1="262" x2="380" y2="262" stroke="#b5ad95" strokeWidth="1" strokeDasharray="3 4" />

      {/* shadow */}
      <ellipse cx="200" cy="265" rx="150" ry="7" fill="rgba(0,0,0,0.22)" />

      {/* TAIL — long, curling up, black-tipped with rings (drawn first, behind body) */}
      <path d="M 95 178 Q 55 168 32 142 Q 22 128 30 118"
        stroke={OUT} strokeWidth={OUT_W + 14} fill="none" strokeLinecap="round" />
      <path d="M 95 178 Q 55 168 32 142 Q 22 128 30 118"
        stroke={colors.main} strokeWidth="13" fill="none" strokeLinecap="round" />
      {/* tail rings — solid black bands wrapping the tail */}
      <g stroke={OUT} strokeWidth="6" strokeLinecap="round" fill="none">
        <path d="M 76 175 q 2 6 0 8" />
        <path d="M 60 167 q 2 6 -1 8" />
        <path d="M 44 156 q 3 5 -1 9" />
      </g>
      {/* solid black tail tip */}
      <circle cx="30" cy="118" r="9" fill={OUT} />

      {/* legs — chunky rounded rectangles with bold outlines */}
      <rect x="118" y="192" width="26" height="68" rx="9"
        fill={colors.main} stroke={OUT} strokeWidth={OUT_W} />
      <rect x="156" y="192" width="26" height="68" rx="9"
        fill={colors.main} stroke={OUT} strokeWidth={OUT_W} />
      <rect x="238" y="192" width="26" height="68" rx="9"
        fill={colors.main} stroke={OUT} strokeWidth={OUT_W} />
      <rect x="276" y="192" width="26" height="68" rx="9"
        fill={colors.main} stroke={OUT} strokeWidth={OUT_W} />
      {/* paw stripes — short black bands on each leg */}
      <g stroke={OUT} strokeWidth="3" fill="none" strokeLinecap="round">
        <line x1="122" y1="210" x2="140" y2="210" />
        <line x1="160" y1="210" x2="178" y2="210" />
        <line x1="242" y1="210" x2="260" y2="210" />
        <line x1="280" y1="210" x2="298" y2="210" />
      </g>
      {/* toe lines on each paw */}
      <g stroke={OUT} strokeWidth="2" fill="none" strokeLinecap="round">
        <line x1="125" y1="258" x2="125" y2="252" />
        <line x1="131" y1="259" x2="131" y2="253" />
        <line x1="137" y1="258" x2="137" y2="252" />
        <line x1="163" y1="258" x2="163" y2="252" />
        <line x1="169" y1="259" x2="169" y2="253" />
        <line x1="175" y1="258" x2="175" y2="252" />
        <line x1="245" y1="258" x2="245" y2="252" />
        <line x1="251" y1="259" x2="251" y2="253" />
        <line x1="257" y1="258" x2="257" y2="252" />
        <line x1="283" y1="258" x2="283" y2="252" />
        <line x1="289" y1="259" x2="289" y2="253" />
        <line x1="295" y1="258" x2="295" y2="252" />
      </g>

      {/* body — big chunky ellipse with bold outline */}
      <ellipse cx="200" cy="180" rx="115" ry="48"
        fill={colors.main} stroke={OUT} strokeWidth={OUT_W} />
      {/* WHITE BELLY — distinctive tiger underside */}
      <path d="M 110 195 Q 200 230 290 195 Q 290 218 200 222 Q 110 218 110 195 Z"
        fill="#fff5e8" stroke={OUT} strokeWidth="1.5" opacity="0.95" />

      {/* IRREGULAR BLACK STRIPES — bold solid bands curving from spine to belly */}
      <g fill={OUT}>
        <path d="M 140 138 q -4 30 -2 60 q 6 -3 7 -12 q -2 -24 -5 -50 z" />
        <path d="M 162 134 q -3 36 1 70 q 7 -3 7 -13 q -4 -30 -5 -58 z" />
        <path d="M 186 132 q -4 40 1 76 q 9 -3 9 -14 q -4 -34 -6 -64 z" />
        <path d="M 210 134 q -3 38 1 74 q 8 -3 8 -13 q -4 -32 -5 -62 z" />
        <path d="M 234 132 q -4 36 1 70 q 7 -3 7 -13 q -4 -30 -5 -58 z" />
        <path d="M 258 134 q -3 32 1 64 q 6 -3 6 -12 q -3 -28 -4 -54 z" />
        <path d="M 280 138 q -3 28 1 54 q 6 -2 6 -11 q -3 -24 -4 -46 z" />
        {/* shorter belly-edge accent stripes */}
        <path d="M 148 195 q -2 18 0 32 q 4 -1 4 -10 q -1 -14 -3 -24 z" />
        <path d="M 196 195 q -2 18 0 32 q 4 -1 4 -10 q -1 -14 -3 -24 z" />
        <path d="M 246 195 q -2 18 0 32 q 4 -1 4 -10 q -1 -14 -3 -24 z" />
      </g>

      {/* head — big round with bold outline */}
      <circle cx="310" cy="158" r="44"
        fill={colors.main} stroke={OUT} strokeWidth={OUT_W} />
      {/* white muzzle/cheek area */}
      <ellipse cx="310" cy="180" rx="26" ry="14" fill="#fff5e8" stroke={OUT} strokeWidth="1.5" />

      {/* ears — perky with pink interior */}
      <ellipse cx="286" cy="124" rx="10" ry="13"
        fill={colors.main} stroke={OUT} strokeWidth={OUT_W} transform="rotate(-25 286 124)" />
      <ellipse cx="286" cy="126" rx="5" ry="7" fill="#f4a8b8" transform="rotate(-25 286 126)" />
      <ellipse cx="334" cy="124" rx="10" ry="13"
        fill={colors.main} stroke={OUT} strokeWidth={OUT_W} transform="rotate(25 334 124)" />
      <ellipse cx="334" cy="126" rx="5" ry="7" fill="#f4a8b8" transform="rotate(25 334 126)" />

      {/* head stripes — bold curving bands across forehead and cheeks */}
      <g fill={OUT}>
        <path d="M 296 122 q -2 14 -1 22 q 3 -1 3 -6 q -1 -10 -2 -16 z" />
        <path d="M 310 118 q -1 16 0 24 q 3 -1 3 -6 q -1 -12 -2 -18 z" />
        <path d="M 324 122 q 2 14 1 22 q -3 -1 -3 -6 q 1 -10 2 -16 z" />
        <path d="M 278 140 q -3 10 -1 18 q 3 -1 3 -6 q -1 -8 -2 -12 z" />
        <path d="M 342 140 q 3 10 1 18 q -3 -1 -3 -6 q 1 -8 2 -12 z" />
      </g>

      {/* eyes — big sparkly amber */}
      <g className="eye-blink" style={{ transformOrigin: '294px 158px' }}>
        <ellipse cx="294" cy="158" rx="8.5" ry="9" fill="white" stroke={OUT} strokeWidth={OUT_W} />
        <ellipse cx="295" cy="159" rx="5" ry="6.5" fill="#f5a040" />
        <ellipse cx="295" cy="159" rx="2" ry="5" fill={OUT} />
        <circle cx="293" cy="156" r="1.6" fill="white" />
        <circle cx="297" cy="161" r="0.9" fill="white" />
      </g>
      <g className="eye-blink" style={{ transformOrigin: '326px 158px' }}>
        <ellipse cx="326" cy="158" rx="8.5" ry="9" fill="white" stroke={OUT} strokeWidth={OUT_W} />
        <ellipse cx="327" cy="159" rx="5" ry="6.5" fill="#f5a040" />
        <ellipse cx="327" cy="159" rx="2" ry="5" fill={OUT} />
        <circle cx="325" cy="156" r="1.6" fill="white" />
        <circle cx="329" cy="161" r="0.9" fill="white" />
      </g>

      {/* nose — triangle */}
      <path d="M 304 170 L 316 170 L 310 178 Z" fill={OUT} />
      {/* friendly mouth */}
      <path d="M 310 178 Q 310 186 302 186 M 310 178 Q 310 186 318 186"
        stroke={OUT} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 296 188 Q 310 196 324 188"
        stroke={OUT} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      {/* tiny white fangs */}
      <polygon points="305 187 307 192 309 187" fill="white" stroke={OUT} strokeWidth="0.8" />
      <polygon points="311 187 313 192 315 187" fill="white" stroke={OUT} strokeWidth="0.8" />

      {/* whisker dots */}
      <g fill={OUT}>
        <circle cx="290" cy="178" r="1" />
        <circle cx="288" cy="182" r="1" />
        <circle cx="330" cy="178" r="1" />
        <circle cx="332" cy="182" r="1" />
      </g>
    </svg>
  );
}

// ─── T-Rex ──────────────────────────────────────────────────────────────
// Bipedal apex theropod — massive head, tiny arms, long counterbalancing tail.
export function TRexShape({ colors }: { colors: ColorOverride }) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
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
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
      {BG_DEFS}
      <rect width="400" height="300" fill="url(#shape-bg-water)" opacity="0.85" />

      {/* bubbles */}
      <g fill="white" opacity="0.55">
        <circle cx="60" cy="40" r="2.5" />
        <circle cx="320" cy="60" r="3" />
        <circle cx="100" cy="80" r="1.8" />
        <circle cx="280" cy="40" r="2" />
      </g>

      {/* TENTACLES — VARIED LENGTHS for organic look (real jellies have
          stinging tentacles of many different lengths). Long thin trailing
          ones in dark + thin highlight. */}
      <g stroke={colors.shade} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.85">
        <path d="M 130 175 q -10 30 4 60 q 6 30 -4 60 q -6 20 0 30" />
        <path d="M 150 175 q -6 20 0 40 q -2 20 -8 40" />
        <path d="M 170 175 q -4 26 6 52 q 8 26 -2 50" />
        <path d="M 190 175 q -2 30 0 60 q 4 30 -4 50" />
        <path d="M 210 175 q 2 30 0 60 q -4 30 4 50" />
        <path d="M 230 175 q 4 26 -6 52 q -8 26 2 50" />
        <path d="M 250 175 q 6 20 0 40 q 2 20 8 40" />
        <path d="M 270 175 q 10 30 -4 60 q -6 30 4 60 q 6 20 0 30" />
      </g>
      {/* light glow lines on each tentacle for bioluminescence */}
      <g stroke={colors.light} strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6">
        <path d="M 130 175 q -10 30 4 60 q 6 30 -4 60 q -6 20 0 30" />
        <path d="M 170 175 q -4 26 6 52 q 8 26 -2 50" />
        <path d="M 210 175 q 2 30 0 60 q -4 30 4 50" />
        <path d="M 250 175 q 6 20 0 40 q 2 20 8 40" />
        <path d="M 270 175 q 10 30 -4 60 q -6 30 4 60 q 6 20 0 30" />
      </g>

      {/* SHORT FRILLY ORAL ARMS (the central feeding tentacles) — denser */}
      <g stroke={colors.shade} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.85">
        <path d="M 175 170 q -2 16 -8 30" />
        <path d="M 188 170 q 0 14 -4 28" />
        <path d="M 200 170 q 0 16 0 32" />
        <path d="M 212 170 q 0 14 4 28" />
        <path d="M 225 170 q 2 16 8 30" />
      </g>

      {/* BIOLUMINESCENT GLOW HALO behind the bell */}
      <ellipse cx="200" cy="135" rx="115" ry="80" fill={colors.light} opacity="0.18" />
      <ellipse cx="200" cy="135" rx="100" ry="65" fill={colors.cheek} opacity="0.18" />

      {/* BELL — translucent dome */}
      <path d="M 110 175 Q 200 70 290 175 Z" fill={colors.shade} opacity="0.7" />
      <path d="M 118 172 Q 200 80 282 172 Z" fill={colors.main} opacity="0.85" />
      <path d="M 130 168 Q 200 92 270 168 Z" fill={colors.light} opacity="0.65" />
      {/* highlight */}
      <ellipse cx="175" cy="120" rx="44" ry="22" fill="white" opacity="0.4" />
      {/* secondary smaller highlight */}
      <ellipse cx="195" cy="98" rx="14" ry="6" fill="white" opacity="0.5" />

      {/* bell ridges — meridional channels */}
      <g stroke={colors.shade} strokeWidth="1.2" fill="none" opacity="0.5">
        <path d="M 130 168 Q 138 130 158 96" />
        <path d="M 158 168 Q 162 130 175 94" />
        <path d="M 180 168 Q 182 120 188 90" />
        <path d="M 220 168 Q 218 120 212 90" />
        <path d="M 242 168 Q 238 130 225 94" />
        <path d="M 270 168 Q 262 130 242 96" />
      </g>

      {/* GONADS — the four lobes visible through the translucent bell */}
      <g fill={colors.cheek} opacity="0.75">
        <ellipse cx="172" cy="140" rx="9" ry="14" />
        <ellipse cx="228" cy="140" rx="9" ry="14" />
        <ellipse cx="200" cy="125" rx="9" ry="14" />
        <ellipse cx="200" cy="155" rx="9" ry="14" />
      </g>

      {/* FRILLY BELL RIM — wavy edge instead of flat ellipse */}
      <path d="M 110 175 Q 122 182 134 175 Q 146 182 158 175 Q 170 182 182 175 Q 194 182 206 175 Q 218 182 230 175 Q 242 182 254 175 Q 266 182 278 175 Q 286 178 290 175"
        stroke={colors.shade} strokeWidth="2" fill="none" opacity="0.85" />

      {/* RHOPALIA — light-sensing organs at the bell margin (real jellyfish
          feature; they have ~8 of these around the bell edge) */}
      <g fill="#ffd34a" opacity="0.85">
        <circle cx="120" cy="173" r="2" />
        <circle cx="156" cy="173" r="2" />
        <circle cx="200" cy="178" r="2" />
        <circle cx="244" cy="173" r="2" />
        <circle cx="280" cy="173" r="2" />
      </g>
      <g fill="#1a1a1a" opacity="0.7">
        <circle cx="120" cy="173" r="1" />
        <circle cx="156" cy="173" r="1" />
        <circle cx="244" cy="173" r="1" />
        <circle cx="280" cy="173" r="1" />
      </g>

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
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
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
      {/* ICONIC WHITE TAIL TIP — red foxes have this distinctive marker.
          Bright white at the very tip of the curled brush. */}
      <ellipse cx="376" cy="106" rx="13" ry="10" fill="white" stroke={OUT} strokeWidth="2.5" transform="rotate(20 376 106)" />
      <ellipse cx="378" cy="104" rx="9" ry="7" fill="#fff8e8" transform="rotate(20 378 104)" />
      {/* fluff lines on the white tip */}
      <g stroke="#d4cdc0" strokeWidth="0.8" fill="none" opacity="0.7">
        <path d="M 372 100 q 4 -3 8 -2" />
        <path d="M 376 110 q 4 -3 8 -2" />
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
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
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
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
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

// ─── Horse ──────────────────────────────────────────────────────────────
// Side-view chestnut horse — long sleek torso, four runner legs,
// flowing mane and tail, white blaze down the muzzle, tall pointed ears.
export function HorseShape({ colors }: { colors: ColorOverride }) {
  const main = colors.main;
  const shade = colors.shade;
  const light = colors.light;
  const mane = colors.pattern ?? '#3a1a08';
  const hoof = '#1a1208';
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
      {BG_DEFS}
      <rect width="400" height="300" fill="url(#shape-bg)" />
      <line x1="20" y1="262" x2="380" y2="262" stroke="#b5ad95" strokeWidth="1" strokeDasharray="3 4" />

      {/* shadow */}
      <ellipse cx="200" cy="266" rx="156" ry="7" fill="rgba(0,0,0,0.18)" />

      {/* FLOWING TAIL — left side */}
      <path d="M 78 178 Q 36 196 24 250 Q 32 254 44 246 Q 54 232 70 224 Q 60 244 56 254 Q 64 256 78 246 Q 88 228 94 210"
        fill={mane} stroke={mane} strokeWidth="1" />
      <path d="M 84 180 Q 52 200 40 244 Q 50 246 60 238 Q 70 222 86 214"
        fill="#5a2a14" opacity="0.85" />

      {/* LEGS — long and slim, classic horse stance */}
      {/* far back leg */}
      <rect x="108" y="190" width="13" height="72" rx="4" fill={shade} />
      <rect x="105" y="252" width="19" height="10" rx="3" fill={hoof} />
      {/* near back leg */}
      <rect x="140" y="192" width="14" height="70" rx="4" fill={main} />
      <rect x="137" y="252" width="20" height="10" rx="3" fill={hoof} />
      {/* far front leg */}
      <rect x="230" y="190" width="13" height="72" rx="4" fill={shade} />
      <rect x="227" y="252" width="19" height="10" rx="3" fill={hoof} />
      {/* near front leg */}
      <rect x="262" y="192" width="14" height="70" rx="4" fill={main} />
      <rect x="259" y="252" width="20" height="10" rx="3" fill={hoof} />

      {/* SLEEK BARREL TORSO */}
      <ellipse cx="180" cy="172" rx="115" ry="42" fill={shade} />
      <ellipse cx="180" cy="168" rx="110" ry="38" fill={main} />
      <ellipse cx="180" cy="186" rx="100" ry="18" fill={light} opacity="0.6" />

      {/* WITHERS hump (shoulder) */}
      <ellipse cx="230" cy="138" rx="22" ry="14" fill={shade} />

      {/* MUSCULAR NECK arching up to the head */}
      <path d="M 244 148
               Q 256 110 296 96
               Q 322 92 332 110
               L 326 138
               Q 296 142 270 156
               Q 252 160 244 158 Z"
        fill={shade} />
      <path d="M 248 150
               Q 260 114 296 102
               Q 318 100 326 114
               L 322 134
               Q 296 138 272 152
               Q 256 156 248 156 Z"
        fill={main} />

      {/* MANE — flowing along the neck and behind the ears */}
      <path d="M 256 134
               Q 268 110 302 96
               Q 318 96 328 108
               Q 320 116 308 116
               Q 290 114 278 124
               Q 264 132 256 134 Z"
        fill={mane} />
      <path d="M 264 140 Q 280 130 300 124" stroke={mane} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.85" />
      <path d="M 270 148 Q 286 138 304 134" stroke={mane} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.75" />

      {/* HEAD — long, narrow */}
      <path d="M 308 100
               Q 348 100 366 124
               Q 376 144 368 162
               Q 354 172 332 168
               Q 314 158 308 140 Z"
        fill={shade} />
      <path d="M 312 104
               Q 346 104 362 126
               Q 370 142 362 158
               Q 350 166 332 162
               Q 316 152 312 138 Z"
        fill={main} />

      {/* WHITE BLAZE running down the muzzle */}
      <path d="M 322 110 Q 332 130 340 156 Q 348 162 354 156 Q 350 130 338 108 Q 328 100 322 110 Z"
        fill={light} opacity="0.85" />

      {/* MUZZLE / nose pad */}
      <ellipse cx="360" cy="156" rx="12" ry="8" fill="#5a3828" />
      <ellipse cx="358" cy="154" rx="10" ry="6" fill="#7a4838" />
      {/* nostril */}
      <ellipse cx="362" cy="154" rx="3" ry="4" fill="#1a1208" />
      {/* mouth */}
      <path d="M 354 164 Q 360 170 366 166" stroke="#3a1a08" strokeWidth="1.4" fill="none" strokeLinecap="round" />

      {/* TALL POINTED EARS */}
      <path d="M 312 96 L 304 70 L 320 82 Z" fill={shade} />
      <path d="M 312 92 L 308 78 L 318 86 Z" fill="#f4a8a8" opacity="0.85" />
      <path d="M 332 92 L 332 64 L 344 80 Z" fill={shade} />
      <path d="M 334 88 L 334 74 L 342 82 Z" fill="#f4a8a8" opacity="0.85" />

      {/* EYE — large and gentle */}
      <g className="eye-blink" style={{ transformOrigin: '328px 128px' }}>
        <ellipse cx="328" cy="128" rx="6" ry="5" fill="white" stroke="#222" strokeWidth="0.6" />
        <ellipse cx="328" cy="128" rx="4" ry="4" fill="#3a1808" />
        <circle cx="329" cy="126" r="1.4" fill="white" />
        {/* eyelash hint */}
        <line x1="324" y1="122" x2="322" y2="119" stroke="#1a1a1a" strokeWidth="1" strokeLinecap="round" />
        <line x1="328" y1="121" x2="328" y2="118" stroke="#1a1a1a" strokeWidth="1" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// ─── Pig ────────────────────────────────────────────────────────────────
// Round chunky body, short stubby legs with cloven hooves, curly tail,
// flat disk snout, floppy ears.
export function PigShape({ colors }: { colors: ColorOverride }) {
  const main = colors.main;
  const shade = colors.shade;
  const light = colors.light;
  const cheek = colors.cheek;
  const hoof = '#3a1a14';
  const snoutDark = '#a85060';
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
      {BG_DEFS}
      <rect width="400" height="300" fill="url(#shape-bg)" />
      <line x1="20" y1="262" x2="380" y2="262" stroke="#b5ad95" strokeWidth="1" strokeDasharray="3 4" />

      {/* shadow */}
      <ellipse cx="200" cy="266" rx="140" ry="7" fill="rgba(0,0,0,0.18)" />

      {/* CURLY TAIL — corkscrew at the back */}
      <path d="M 84 178
               Q 60 168 56 152
               Q 56 144 64 144
               Q 70 148 68 156
               Q 66 162 60 162"
        stroke={shade} strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M 84 178
               Q 60 168 56 152
               Q 56 144 64 144
               Q 70 148 68 156
               Q 66 162 60 162"
        stroke={main} strokeWidth="4" fill="none" strokeLinecap="round" />

      {/* SHORT STUBBY LEGS with cloven hooves */}
      {[120, 152, 240, 272].map((x, i) => (
        <g key={x}>
          <rect x={x - 9} y="206" width="18" height="44" rx="4" fill={i % 2 === 0 ? shade : main} />
          {/* hoof — cloven (split) */}
          <rect x={x - 10} y="248" width="20" height="12" rx="2" fill={hoof} />
          {/* hoof split line */}
          <line x1={x} y1="248" x2={x} y2="260" stroke="#0a0500" strokeWidth="1.6" />
        </g>
      ))}

      {/* ROUND CHUBBY BARREL BODY */}
      <ellipse cx="190" cy="178" rx="115" ry="55" fill={shade} />
      <ellipse cx="190" cy="174" rx="110" ry="50" fill={main} />
      <ellipse cx="190" cy="194" rx="100" ry="24" fill={light} opacity="0.65" />
      {/* belly highlight */}
      <ellipse cx="190" cy="206" rx="80" ry="14" fill={cheek} opacity="0.35" />

      {/* faint side-spots (a few darker speckles) */}
      <g fill={shade} opacity="0.45">
        <circle cx="148" cy="158" r="6" />
        <circle cx="172" cy="192" r="5" />
        <circle cx="220" cy="166" r="6" />
        <circle cx="250" cy="186" r="5" />
      </g>

      {/* SHORT NECK + HEAD — almost merged with body */}
      <ellipse cx="298" cy="172" rx="48" ry="42" fill={shade} />
      <ellipse cx="298" cy="170" rx="44" ry="38" fill={main} />
      <ellipse cx="298" cy="186" rx="38" ry="18" fill={light} opacity="0.55" />

      {/* CHEEK PUFFS — pigs have prominent jowls */}
      <ellipse cx="282" cy="194" rx="14" ry="10" fill={cheek} opacity="0.5" />

      {/* DISK SNOUT (the signature feature) — flat circle on the front of the face */}
      <ellipse cx="342" cy="170" rx="20" ry="22" fill={shade} />
      <ellipse cx="340" cy="170" rx="17" ry="19" fill={cheek} />
      <ellipse cx="338" cy="166" rx="12" ry="10" fill="#f8c8b8" opacity="0.6" />
      {/* twin nostrils — round holes on the disk */}
      <ellipse cx="344" cy="166" rx="3" ry="4" fill={snoutDark} />
      <ellipse cx="344" cy="178" rx="3" ry="4" fill={snoutDark} />
      <ellipse cx="343" cy="165" rx="1.2" ry="1.6" fill="#3a1820" />
      <ellipse cx="343" cy="177" rx="1.2" ry="1.6" fill="#3a1820" />
      {/* snout ridge separating snout from face */}
      <path d="M 326 152 Q 332 170 326 188" stroke={shade} strokeWidth="1.2" fill="none" opacity="0.6" />

      {/* SMILE */}
      <path d="M 326 196 Q 336 202 348 196" stroke="#5a2020" strokeWidth="1.6" fill="none" strokeLinecap="round" />

      {/* FLOPPY TRIANGLE EARS — flop forward over the eyes */}
      <path d="M 274 134 L 290 142 L 286 162 Q 278 158 274 134 Z" fill={shade} />
      <path d="M 278 138 L 286 144 L 284 158 Q 280 154 278 138 Z" fill="#f0a08a" opacity="0.8" />
      <path d="M 314 132 L 330 138 L 322 158 Q 312 154 314 132 Z" fill={shade} />
      <path d="M 318 136 L 326 140 L 320 154 Q 314 150 318 136 Z" fill="#f0a08a" opacity="0.8" />

      {/* EYES — small and beady */}
      <g className="eye-blink" style={{ transformOrigin: '296px 160px' }}>
        <circle cx="296" cy="160" r="4" fill="white" stroke="#222" strokeWidth="0.5" />
        <circle cx="297" cy="160" r="2.4" fill="#1a1208" />
        <circle cx="298" cy="158" r="0.9" fill="white" />
      </g>
      <g className="eye-blink" style={{ transformOrigin: '318px 158px' }}>
        <circle cx="318" cy="158" r="4" fill="white" stroke="#222" strokeWidth="0.5" />
        <circle cx="319" cy="158" r="2.4" fill="#1a1208" />
        <circle cx="320" cy="156" r="0.9" fill="white" />
      </g>
    </svg>
  );
}

// ─── Giraffe ────────────────────────────────────────────────────────────
// Tallest land animal. Long curved neck (only 7 vertebrae, like every
// mammal, but each vertebra is huge), spotted hide, ossicones on the
// head, tiny tufted tail, long thin legs.
export function GiraffeShape({ colors }: { colors: ColorOverride }) {
  const main = colors.main;
  const shade = colors.shade;
  const light = colors.light;
  const cheek = colors.cheek;
  const spot = colors.pattern ?? '#6a4828';
  const ossicone = '#5a3a18';
  const hoof = '#2a1a08';
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
      {BG_DEFS}
      <rect width="400" height="300" fill="url(#shape-bg)" />
      <line x1="20" y1="262" x2="380" y2="262" stroke="#b5ad95" strokeWidth="1" strokeDasharray="3 4" />

      {/* shadow under the body */}
      <ellipse cx="180" cy="266" rx="110" ry="6" fill="rgba(0,0,0,0.18)" />

      {/* LONG LEGS — drawn before body so body covers the tops */}
      {[120, 152, 220, 252].map((x, i) => (
        <g key={x}>
          <rect x={x - 7} y="180" width="14" height="82" rx="3" fill={i % 2 === 0 ? shade : main} />
          {/* knee marker */}
          <ellipse cx={x} cy="220" rx="8" ry="4" fill={shade} opacity="0.55" />
          {/* hoof */}
          <rect x={x - 8} y="252" width="16" height="10" rx="2" fill={hoof} />
        </g>
      ))}

      {/* TAIL — short with dark tuft */}
      <path d="M 80 180 Q 60 196 56 218" stroke={shade} strokeWidth="5" fill="none" strokeLinecap="round" />
      <ellipse cx="56" cy="222" rx="5" ry="9" fill={spot} />

      {/* BODY — relatively small relative to the neck */}
      <ellipse cx="170" cy="170" rx="100" ry="34" fill={shade} />
      <ellipse cx="170" cy="166" rx="96" ry="30" fill={main} />
      <ellipse cx="170" cy="184" rx="86" ry="14" fill={light} opacity="0.6" />

      {/* SHOULDER HUMP — giraffes have a noticeable forequarter rise */}
      <ellipse cx="240" cy="148" rx="32" ry="22" fill={shade} />
      <ellipse cx="240" cy="146" rx="28" ry="18" fill={main} />

      {/* LONG CURVED NECK rising up and to the right */}
      <path d="M 230 162
               Q 264 110 296 72
               Q 320 50 332 36
               L 348 48
               Q 332 66 312 92
               Q 286 130 252 178 Z"
        fill={shade} />
      <path d="M 234 162
               Q 264 114 294 78
               Q 318 56 330 42
               L 342 50
               Q 328 68 310 94
               Q 286 130 252 174 Z"
        fill={main} />

      {/* SPOTS — irregular polygon shapes on body and neck (Reticulated pattern hints) */}
      <g fill={spot}>
        {/* body spots */}
        <polygon points="110 152 130 148 138 162 128 178 112 172" />
        <polygon points="146 162 162 156 172 172 160 188 148 184" />
        <polygon points="184 158 198 152 212 162 206 180 192 184" />
        <polygon points="218 168 232 162 244 176 236 192 222 192" />
        <polygon points="158 188 170 184 180 196 170 208 158 204" opacity="0.85" />
        <polygon points="194 188 210 184 220 196 214 208 198 210" opacity="0.85" />
        {/* shoulder hump */}
        <polygon points="232 134 246 130 254 146 244 158 232 152" />
        {/* neck spots */}
        <polygon points="246 144 260 140 268 154 258 166 248 162" />
        <polygon points="264 122 278 118 286 132 276 144 266 140" />
        <polygon points="282 100 296 96 304 110 294 122 282 116" />
        <polygon points="300 78 314 74 322 88 312 100 302 96" />
        <polygon points="318 56 330 54 336 66 326 76 318 70" />
      </g>

      {/* HEAD — small, elongated, at the top of the neck */}
      <path d="M 320 32
               Q 348 28 360 42
               Q 364 56 358 64
               Q 340 70 328 64
               Q 316 54 320 32 Z"
        fill={shade} />
      <path d="M 322 36
               Q 346 32 356 44
               Q 360 54 354 62
               Q 340 66 330 62
               Q 320 54 322 36 Z"
        fill={main} />

      {/* MUZZLE — pink/light tip */}
      <ellipse cx="358" cy="58" rx="6" ry="4" fill={cheek} />
      <ellipse cx="361" cy="58" rx="1.5" ry="1" fill="#5a2828" />
      {/* mouth */}
      <path d="M 354 62 Q 358 64 362 62" stroke="#3a1a08" strokeWidth="1.2" fill="none" strokeLinecap="round" />

      {/* OSSICONES — small horn-bumps on the head (the giraffe signature) */}
      <g>
        <ellipse cx="332" cy="22" rx="2.6" ry="8" fill={ossicone} />
        <circle cx="332" cy="14" r="3.4" fill="#3a2a14" />
        <ellipse cx="344" cy="22" rx="2.6" ry="8" fill={ossicone} />
        <circle cx="344" cy="14" r="3.4" fill="#3a2a14" />
      </g>

      {/* TALL EARS — wide at the base */}
      <path d="M 322 30 L 308 16 L 322 22 Z" fill={shade} />
      <path d="M 322 28 L 314 20 L 322 24 Z" fill="#f4b8a8" opacity="0.85" />
      <path d="M 354 30 L 368 16 L 354 22 Z" fill={shade} />
      <path d="M 354 28 L 362 20 L 354 24 Z" fill="#f4b8a8" opacity="0.85" />

      {/* EYE — large, kind */}
      <g className="eye-blink" style={{ transformOrigin: '332px 46px' }}>
        <ellipse cx="332" cy="46" rx="4" ry="5" fill="white" stroke="#222" strokeWidth="0.5" />
        <ellipse cx="332" cy="46" rx="2.8" ry="4" fill="#1a1208" />
        <circle cx="333" cy="44" r="1" fill="white" />
        {/* long eyelashes */}
        <line x1="328" y1="42" x2="326" y2="39" stroke="#1a1a1a" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="330" y1="41" x2="329" y2="38" stroke="#1a1a1a" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="332" y1="40.5" x2="332" y2="37" stroke="#1a1a1a" strokeWidth="0.8" strokeLinecap="round" />
      </g>

      {/* MANE — short dark hair running down the back of the neck */}
      <path d="M 336 40 Q 320 80 300 110 Q 280 140 256 168"
        stroke={spot} strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.85" />
      <g stroke={spot} strokeWidth="0.8" fill="none" opacity="0.55" strokeLinecap="round">
        <path d="M 332 50 q -2 4 -4 6" />
        <path d="M 322 70 q -2 4 -4 6" />
        <path d="M 308 92 q -2 4 -4 6" />
        <path d="M 292 116 q -2 4 -4 6" />
        <path d="M 276 142 q -2 4 -4 6" />
      </g>
    </svg>
  );
}

// ─── Rooster ────────────────────────────────────────────────────────────
// Side-view facing right. Iconic features: tall red COMB on top of the
// head, dangling red WATTLES under the chin, bright yellow beak, long
// curved SICKLE TAIL FEATHERS, sharp leg spur, golden hackles ringing
// the neck.
export function RoosterShape({ colors }: { colors: ColorOverride }) {
  const main = colors.main;       // deep red body
  const shade = colors.shade;     // dark red shadow
  const hackle = colors.light;    // golden hackle / saddle feathers
  const beak = colors.cheek;      // yellow beak / legs
  const comb = '#e03038';
  const combDark = '#8a1a1a';
  const tail = '#3a2a4a';         // iridescent dark-green tail
  const tailHi = '#5a8a4a';
  const claw = '#3a1808';
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
      {BG_DEFS}
      <rect width="400" height="300" fill="url(#shape-bg)" />
      <line x1="20" y1="262" x2="380" y2="262" stroke="#b5ad95" strokeWidth="1" strokeDasharray="3 4" />

      {/* shadow */}
      <ellipse cx="200" cy="266" rx="120" ry="6" fill="rgba(0,0,0,0.18)" />

      {/* LONG SICKLE TAIL FEATHERS — the rooster's headline silhouette */}
      <g>
        {/* dark inner tail */}
        <path d="M 90 180 Q 30 100 20 60 Q 50 80 80 130" fill={tail} />
        <path d="M 90 180 Q 30 110 26 78 Q 56 100 86 150" fill={tailHi} opacity="0.85" />
        {/* curved sickle plumes */}
        <path d="M 95 170 Q 50 130 30 80" stroke={tail} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M 95 170 Q 50 130 30 80" stroke={tailHi} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.85" />
        <path d="M 100 180 Q 60 150 40 110" stroke={tail} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M 105 190 Q 70 170 50 140" stroke={tail} strokeWidth="5" fill="none" strokeLinecap="round" />
        {/* feather barbs */}
        <g stroke={tailHi} strokeWidth="0.7" fill="none" opacity="0.7">
          <line x1="50" y1="130" x2="44" y2="124" />
          <line x1="35" y1="100" x2="29" y2="94" />
          <line x1="22" y1="80" x2="17" y2="74" />
        </g>
      </g>

      {/* LEGS — scaly yellow, two strong claws */}
      <g>
        {/* far leg */}
        <rect x="178" y="198" width="9" height="44" fill={beak} />
        <g stroke={shade} strokeWidth="0.6" opacity="0.8" fill="none">
          <line x1="178" y1="208" x2="187" y2="208" />
          <line x1="178" y1="218" x2="187" y2="218" />
          <line x1="178" y1="228" x2="187" y2="228" />
        </g>
        {/* foot + toes */}
        <g stroke={claw} strokeWidth="1.5" fill={beak} strokeLinecap="round">
          <line x1="183" y1="242" x2="173" y2="252" />
          <line x1="183" y1="242" x2="183" y2="254" />
          <line x1="183" y1="242" x2="193" y2="252" />
          <line x1="183" y1="242" x2="172" y2="246" />
        </g>
        {/* SPUR — the defensive feature, sharp keratin on the inside */}
        <path d="M 175 230 L 165 232 L 174 240 Z" fill={claw} stroke="#1a1208" strokeWidth="0.4" />

        {/* near leg */}
        <rect x="212" y="200" width="9" height="42" fill={beak} />
        <g stroke={shade} strokeWidth="0.6" opacity="0.8" fill="none">
          <line x1="212" y1="210" x2="221" y2="210" />
          <line x1="212" y1="220" x2="221" y2="220" />
          <line x1="212" y1="230" x2="221" y2="230" />
        </g>
        <g stroke={claw} strokeWidth="1.5" fill={beak} strokeLinecap="round">
          <line x1="217" y1="242" x2="207" y2="252" />
          <line x1="217" y1="242" x2="217" y2="254" />
          <line x1="217" y1="242" x2="227" y2="252" />
          <line x1="217" y1="242" x2="206" y2="246" />
        </g>
      </g>

      {/* PLUMP ROUND BODY */}
      <ellipse cx="190" cy="180" rx="90" ry="48" fill={shade} />
      <ellipse cx="190" cy="174" rx="84" ry="44" fill={main} />
      <ellipse cx="190" cy="194" rx="74" ry="22" fill={hackle} opacity="0.5" />

      {/* WING — folded against the side, with feather hatch lines */}
      <path d="M 130 158
               Q 170 152 220 168
               Q 220 192 180 198
               Q 140 192 128 178 Z"
        fill={shade} />
      <path d="M 136 162
               Q 170 156 214 170
               Q 214 188 180 192
               Q 144 188 134 178 Z"
        fill={main} />
      <g stroke={shade} strokeWidth="0.8" fill="none" opacity="0.7" strokeLinecap="round">
        <path d="M 140 168 Q 170 162 208 174" />
        <path d="M 140 178 Q 170 174 210 184" />
        <path d="M 144 188 Q 170 186 200 190" />
      </g>
      {/* primary flight feathers along the wing edge */}
      <g fill={tail} opacity="0.85">
        <path d="M 198 184 Q 210 188 220 196 L 214 194 Z" />
        <path d="M 184 188 Q 198 192 210 200 L 200 198 Z" />
      </g>

      {/* NECK — arching up to the head, with GOLDEN HACKLES */}
      <path d="M 252 158
               Q 268 130 290 110
               Q 312 110 318 130
               L 308 154
               Q 286 162 268 168 Z"
        fill={shade} />
      <path d="M 256 160
               Q 270 134 290 114
               Q 308 114 314 132
               L 304 150
               Q 286 158 270 166 Z"
        fill={main} />
      {/* golden hackle feathers — small overlapping pointed scales */}
      <g fill={hackle} stroke={shade} strokeWidth="0.4">
        {[
          [270, 132], [280, 124], [290, 118], [300, 122], [308, 130],
          [266, 144], [276, 138], [286, 132], [296, 134], [306, 142],
          [262, 156], [272, 150], [282, 146], [294, 148], [304, 154],
        ].map(([cx, cy], i) => (
          <path key={i} d={`M ${cx} ${cy} L ${cx + 3} ${cy + 5} L ${cx - 3} ${cy + 5} Z`} />
        ))}
      </g>

      {/* HEAD */}
      <ellipse cx="310" cy="106" rx="22" ry="18" fill={shade} />
      <ellipse cx="310" cy="104" rx="19" ry="15" fill={main} />
      <ellipse cx="306" cy="100" rx="9" ry="6" fill={hackle} opacity="0.45" />

      {/* COMB — the iconic red zigzag crest on top of the head */}
      <g>
        <path d="M 296 90 Q 300 76 308 80 Q 312 74 318 80 Q 322 72 326 80 L 326 92 Q 312 96 296 92 Z"
          fill={comb} />
        <path d="M 298 88 Q 302 78 308 82 Q 312 76 318 82 Q 322 76 324 82" stroke={combDark} strokeWidth="1" fill="none" />
        {/* highlight */}
        <ellipse cx="312" cy="84" rx="6" ry="2" fill="#f06868" opacity="0.7" />
      </g>

      {/* WATTLES — twin red hanging flaps under the chin */}
      <g fill={comb}>
        <ellipse cx="312" cy="124" rx="5" ry="8" />
        <ellipse cx="320" cy="126" rx="4.5" ry="7" />
      </g>
      <g fill={combDark} opacity="0.5">
        <ellipse cx="312" cy="128" rx="3" ry="3" />
      </g>

      {/* BEAK — bright orange/yellow, hooked */}
      <path d="M 330 102
               L 346 104
               L 330 110 Z"
        fill={beak} stroke="#a8780a" strokeWidth="0.6" />
      <path d="M 330 110 L 344 110 L 330 114 Z" fill={beak} stroke="#a8780a" strokeWidth="0.5" />

      {/* EYE — alert and round */}
      <g className="eye-blink" style={{ transformOrigin: '318px 102px' }}>
        <circle cx="318" cy="102" r="4" fill="white" stroke="#222" strokeWidth="0.6" />
        <circle cx="319" cy="102" r="2.4" fill="#8a4818" />
        <circle cx="320" cy="100" r="1" fill="#1a1208" />
        <circle cx="321" cy="99" r="0.5" fill="white" />
      </g>

      {/* ear-hole patch */}
      <ellipse cx="306" cy="110" rx="3" ry="2" fill={hackle} opacity="0.7" />
    </svg>
  );
}

// ─── Donkey ─────────────────────────────────────────────────────────────
// Side-view facing right. Compact mammal with VERY LONG EARS (the donkey
// signature), upright stiff mane (not flowing like a horse), the iconic
// dark "donkey cross" stripe along the spine and across the shoulders,
// white muzzle ring, and a tail with hair only at the tuft end.
export function DonkeyShape({ colors }: { colors: ColorOverride }) {
  const main = colors.main;        // body grey
  const shade = colors.shade;      // dark grey
  const light = colors.light;      // pale belly
  const muzzle = colors.cheek;     // white muzzle / eye ring
  const cross = colors.pattern ?? '#3a342a';  // donkey-cross stripe
  const hoof = '#1a1208';
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
      {BG_DEFS}
      <rect width="400" height="300" fill="url(#shape-bg)" />
      <line x1="20" y1="262" x2="380" y2="262" stroke="#b5ad95" strokeWidth="1" strokeDasharray="3 4" />

      {/* shadow */}
      <ellipse cx="200" cy="266" rx="146" ry="7" fill="rgba(0,0,0,0.18)" />

      {/* TAIL — thin, with hair only at the tuft (distinct from horse) */}
      <line x1="80" y1="180" x2="58" y2="218" stroke={shade} strokeWidth="6" strokeLinecap="round" />
      <line x1="80" y1="180" x2="58" y2="218" stroke={main} strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="56" cy="228" rx="8" ry="12" fill={cross} />
      <g stroke={cross} strokeWidth="0.6" opacity="0.85">
        <line x1="52" y1="236" x2="48" y2="246" />
        <line x1="56" y1="240" x2="56" y2="252" />
        <line x1="60" y1="236" x2="64" y2="248" />
      </g>

      {/* LEGS — slimmer than horse */}
      {[110, 142, 232, 264].map((x, i) => (
        <g key={x}>
          <rect x={x - 6} y="190" width="12" height="68" rx="3" fill={i % 2 === 0 ? shade : main} />
          {/* lower leg darker — donkeys often have darker stockings */}
          <rect x={x - 6} y="232" width="12" height="20" fill={cross} opacity="0.55" />
          {/* hoof */}
          <rect x={x - 7} y="252" width="14" height="10" rx="2" fill={hoof} />
        </g>
      ))}

      {/* SLEEK BODY */}
      <ellipse cx="180" cy="172" rx="105" ry="40" fill={shade} />
      <ellipse cx="180" cy="168" rx="100" ry="36" fill={main} />
      {/* pale belly */}
      <ellipse cx="180" cy="190" rx="92" ry="18" fill={light} opacity="0.85" />

      {/* THE DONKEY CROSS — dark stripe along the spine plus a
          perpendicular stripe across the shoulders. Real donkeys
          have this; mythology says it appeared after Jesus rode one. */}
      {/* spine stripe */}
      <path d="M 80 170 Q 180 138 282 158" stroke={cross} strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.85" />
      {/* shoulder cross-stripe */}
      <path d="M 220 148 L 220 200" stroke={cross} strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.85" />

      {/* SHOULDER BULGE */}
      <ellipse cx="222" cy="148" rx="22" ry="18" fill={shade} />
      <ellipse cx="222" cy="146" rx="18" ry="14" fill={main} />

      {/* UPRIGHT STIFF MANE — short and bristly, runs along the top
          of the neck. Donkeys do NOT have flowing horse manes. */}
      <g fill={cross}>
        <polygon points="232 138 234 122 236 138" />
        <polygon points="244 134 246 116 248 134" />
        <polygon points="256 130 258 112 260 130" />
        <polygon points="268 126 270 108 272 126" />
        <polygon points="280 124 282 106 284 124" />
        <polygon points="290 124 292 108 294 124" />
      </g>
      {/* base of mane along spine */}
      <path d="M 226 138 Q 260 124 296 124" stroke={cross} strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* MUSCULAR NECK arching up */}
      <path d="M 232 158
               Q 246 124 286 116
               Q 308 116 318 132
               L 314 156
               Q 286 154 264 162
               Q 244 160 232 158 Z"
        fill={shade} />
      <path d="M 236 160
               Q 248 128 286 120
               Q 304 120 314 134
               L 310 152
               Q 286 152 266 158
               Q 248 158 236 160 Z"
        fill={main} />

      {/* HEAD — short rounded */}
      <path d="M 298 116
               Q 332 116 348 134
               Q 354 152 344 168
               Q 328 174 312 170
               Q 296 158 298 116 Z"
        fill={shade} />
      <path d="M 302 120
               Q 330 120 344 136
               Q 348 150 340 164
               Q 326 170 312 166
               Q 300 154 302 120 Z"
        fill={main} />

      {/* WHITE MUZZLE RING — donkeys have a distinct pale ring around
          the mouth and nose. */}
      <ellipse cx="340" cy="156" rx="16" ry="13" fill={muzzle} opacity="0.85" />
      <ellipse cx="338" cy="154" rx="13" ry="10" fill="#fff" opacity="0.6" />
      {/* nostril */}
      <ellipse cx="346" cy="154" rx="2.5" ry="3" fill="#5a3828" />
      {/* mouth */}
      <path d="M 338 162 Q 344 168 350 164" stroke="#3a1a08" strokeWidth="1.4" fill="none" strokeLinecap="round" />

      {/* VERY LONG EARS — the donkey signature, MUCH taller than a
          horse's. Drawn as tall pointed paddles. */}
      <ellipse cx="304" cy="78" rx="6.5" ry="32" fill={shade} transform="rotate(-18 304 78)" />
      <ellipse cx="304" cy="80" rx="3.5" ry="26" fill="#e8b8a8" transform="rotate(-18 304 80)" opacity="0.85" />
      <ellipse cx="324" cy="76" rx="6.5" ry="34" fill={shade} transform="rotate(8 324 76)" />
      <ellipse cx="324" cy="78" rx="3.5" ry="28" fill="#e8b8a8" transform="rotate(8 324 78)" opacity="0.85" />
      {/* darker ear tips */}
      <ellipse cx="294" cy="48" rx="3" ry="6" fill={cross} transform="rotate(-18 294 48)" />
      <ellipse cx="328" cy="44" rx="3" ry="6" fill={cross} transform="rotate(8 328 44)" />

      {/* EYE with white ring */}
      <ellipse cx="324" cy="140" rx="8" ry="6" fill={muzzle} opacity="0.7" />
      <g className="eye-blink" style={{ transformOrigin: '324px 140px' }}>
        <ellipse cx="324" cy="140" rx="5" ry="4" fill="white" stroke="#222" strokeWidth="0.6" />
        <ellipse cx="324" cy="140" rx="3.5" ry="3.5" fill="#3a2a14" />
        <circle cx="325" cy="138" r="1.2" fill="white" />
        {/* eyelash */}
        <line x1="320" y1="136" x2="318" y2="133" stroke="#1a1a1a" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="323" y1="135" x2="322" y2="132" stroke="#1a1a1a" strokeWidth="0.8" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// ─── Rhinoceros ─────────────────────────────────────────────────────────
// Side-view facing right. White rhinoceros profile — TWO horns (front
// big, rear smaller), armored skin folds across the body, small pointed
// ears, columnar legs with three toes, short tufted tail.
export function RhinoShape({ colors }: { colors: ColorOverride }) {
  const main = colors.main;
  const shade = colors.shade;
  const light = colors.light;
  const cheek = colors.cheek;
  const fold = colors.pattern ?? '#3a342a';
  const horn = '#e6dac0';
  const hornShade = '#a89878';
  const hoof = '#1a1208';
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
      {BG_DEFS}
      <rect width="400" height="300" fill="url(#shape-bg)" />
      <line x1="20" y1="262" x2="380" y2="262" stroke="#b5ad95" strokeWidth="1" strokeDasharray="3 4" />

      {/* shadow under the heavy body */}
      <ellipse cx="200" cy="266" rx="160" ry="8" fill="rgba(0,0,0,0.22)" />

      {/* SHORT TUFTED TAIL */}
      <path d="M 78 178 Q 60 192 56 218" stroke={shade} strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M 78 178 Q 60 192 56 218" stroke={main} strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="56" cy="222" rx="6" ry="9" fill={fold} />

      {/* COLUMNAR LEGS — short, very thick, ending in 3-toe stumps */}
      {[112, 148, 244, 280].map((x, i) => (
        <g key={x}>
          {/* upper thigh */}
          <rect x={x - 12} y="186" width="24" height="44" rx="5" fill={shade} />
          {/* lower leg */}
          <rect x={x - 11} y="186" width="22" height="44" rx="4" fill={i % 2 === 0 ? main : shade} />
          {/* skin folds at the knee */}
          <path d={`M ${x - 11} 208 Q ${x} 210 ${x + 11} 208`} stroke={fold} strokeWidth="1.5" fill="none" opacity="0.7" />
          {/* base of the foot pad */}
          <rect x={x - 13} y="226" width="26" height="14" rx="4" fill={shade} />
          {/* three-toe nails */}
          <rect x={x - 11} y="240" width="6" height="8" rx="1.5" fill={hoof} />
          <rect x={x - 3} y="240" width="6" height="8" rx="1.5" fill={hoof} />
          <rect x={x + 5} y="240" width="6" height="8" rx="1.5" fill={hoof} />
        </g>
      ))}

      {/* MASSIVE BARREL BODY */}
      <ellipse cx="185" cy="170" rx="125" ry="50" fill={shade} />
      <ellipse cx="185" cy="166" rx="120" ry="46" fill={main} />
      <ellipse cx="185" cy="186" rx="108" ry="22" fill={light} opacity="0.55" />

      {/* SHOULDER HUMP (white rhinos have a pronounced one) */}
      <ellipse cx="235" cy="138" rx="34" ry="22" fill={shade} />
      <ellipse cx="235" cy="136" rx="30" ry="18" fill={main} />

      {/* SKIN FOLDS / ARMORED PLATING — thick body wrinkles */}
      <g stroke={fold} strokeWidth="2" fill="none" opacity="0.7" strokeLinecap="round">
        {/* vertical fold behind the shoulder */}
        <path d="M 188 132 Q 184 170 188 210" />
        {/* fold in front of the haunch */}
        <path d="M 110 160 Q 108 184 112 208" />
        {/* horizontal belly fold */}
        <path d="M 100 198 Q 180 206 270 196" />
        {/* upper-back wrinkles */}
        <path d="M 130 148 Q 140 152 150 148" />
        <path d="M 250 142 Q 258 146 268 142" />
        {/* neck folds */}
        <path d="M 252 154 Q 258 162 254 172" />
        <path d="M 268 152 Q 274 162 270 174" />
      </g>

      {/* NECK joining body to head */}
      <path d="M 260 152
               Q 274 130 296 124
               Q 314 130 318 144
               L 312 162
               Q 296 168 280 170
               Q 266 168 260 162 Z"
        fill={shade} />
      <path d="M 264 154
               Q 276 134 296 128
               Q 312 134 314 144
               L 308 160
               Q 296 164 282 166
               Q 270 164 264 162 Z"
        fill={main} />

      {/* HEAD — broad, square jaw */}
      <path d="M 296 128
               Q 332 122 354 140
               Q 364 158 354 178
               Q 332 188 308 184
               Q 290 172 296 128 Z"
        fill={shade} />
      <path d="M 300 132
               Q 330 126 350 142
               Q 358 158 350 174
               Q 332 184 312 180
               Q 294 170 300 132 Z"
        fill={main} />

      {/* CHEEK / JAW shadow */}
      <ellipse cx="332" cy="168" rx="20" ry="10" fill={cheek} opacity="0.4" />

      {/* TWO HORNS — front large, rear smaller. Drawn as upward-curving
          cones with shading. */}
      {/* front horn (the big one) */}
      <path d="M 348 120
               Q 358 88 362 60
               Q 366 80 366 116
               Q 358 124 348 120 Z"
        fill={hornShade} />
      <path d="M 348 120
               Q 358 90 362 64
               Q 364 86 362 114
               Q 356 122 348 120 Z"
        fill={horn} />
      {/* horn ridges */}
      <g stroke={hornShade} strokeWidth="0.7" opacity="0.85" fill="none">
        <path d="M 350 110 Q 356 110 360 108" />
        <path d="M 351 100 Q 357 100 361 98" />
        <path d="M 353 88 Q 358 88 362 86" />
      </g>

      {/* rear horn (smaller, behind the big one) */}
      <path d="M 326 122
               Q 322 100 324 86
               Q 330 100 332 122 Z"
        fill={hornShade} />
      <path d="M 327 122
               Q 324 102 326 90
               Q 330 102 331 122 Z"
        fill={horn} />

      {/* SMALL POINTED EARS — perched on top of the head */}
      <path d="M 308 116 L 306 96 L 318 110 Z" fill={shade} />
      <path d="M 308 114 L 310 102 L 316 110 Z" fill="#e8a8a8" opacity="0.85" />
      <path d="M 324 110 L 326 92 L 334 108 Z" fill={shade} />
      <path d="M 324 108 L 328 98 L 332 108 Z" fill="#e8a8a8" opacity="0.85" />

      {/* SMALL ALERT EYE */}
      <g className="eye-blink" style={{ transformOrigin: '320px 150px' }}>
        <ellipse cx="320" cy="150" rx="4" ry="3" fill="white" stroke="#222" strokeWidth="0.5" />
        <ellipse cx="320" cy="150" rx="2.4" ry="2.2" fill="#1a1208" />
        <circle cx="321" cy="149" r="0.7" fill="white" />
      </g>

      {/* BROAD MOUTH / NOSTRILS */}
      <ellipse cx="352" cy="168" rx="6" ry="3" fill={fold} opacity="0.6" />
      <path d="M 340 178 Q 350 184 358 178" stroke="#3a1a08" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <ellipse cx="356" cy="170" rx="1.5" ry="2" fill="#3a1a08" />
    </svg>
  );
}

// ─── Cat (housecat) ─────────────────────────────────────────────────────
// Sleeker than a tiger — small triangular ears, long curving tail,
// vertical-slit pupils, faint tabby stripes, pink nose, prominent
// whiskers, retractable claws hinted on the paws.
export function CatShape({ colors }: { colors: ColorOverride }) {
  const main = colors.main;
  const shade = colors.shade;
  const light = colors.light;
  const cheek = colors.cheek;
  const stripe = colors.pattern ?? '#1a1a1a';
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
      {BG_DEFS}
      <rect width="400" height="300" fill="url(#shape-bg)" />
      <line x1="20" y1="262" x2="380" y2="262" stroke="#b5ad95" strokeWidth="1" strokeDasharray="3 4" />

      {/* shadow */}
      <ellipse cx="200" cy="266" rx="120" ry="6" fill="rgba(0,0,0,0.18)" />

      {/* LONG CURVING TAIL — curves up like a question mark, classic cat */}
      <path d="M 88 188 Q 50 196 36 158 Q 36 132 60 130 Q 76 134 70 154" stroke={shade} strokeWidth="11" fill="none" strokeLinecap="round" />
      <path d="M 88 188 Q 50 196 36 158 Q 36 132 60 130 Q 76 134 70 154" stroke={main} strokeWidth="7" fill="none" strokeLinecap="round" />
      <g stroke={stripe} strokeWidth="1.2" opacity="0.6" fill="none">
        <line x1="68" y1="180" x2="72" y2="174" />
        <line x1="54" y1="170" x2="58" y2="162" />
        <line x1="46" y1="148" x2="52" y2="142" />
      </g>

      {/* LEGS — slim with paw pads */}
      {[125, 162, 240, 277].map((x, i) => (
        <g key={x}>
          <rect x={x - 6} y="200" width="12" height="54" rx="4" fill={i % 2 === 0 ? shade : main} />
          {/* faint stripes on legs */}
          <line x1={x - 6} y1="218" x2={x + 6} y2="218" stroke={stripe} strokeWidth="1" opacity="0.5" />
          <line x1={x - 6} y1="232" x2={x + 6} y2="232" stroke={stripe} strokeWidth="1" opacity="0.5" />
          {/* paw */}
          <ellipse cx={x} cy="258" rx="9" ry="5" fill={shade} />
          {/* retractable claw hint */}
          <g stroke="#3a1a08" strokeWidth="0.8" opacity="0.7">
            <line x1={x - 4} y1="261" x2={x - 6} y2="263" />
            <line x1={x} y1="262" x2={x} y2="265" />
            <line x1={x + 4} y1="261" x2={x + 6} y2="263" />
          </g>
        </g>
      ))}

      {/* SLEEK BODY */}
      <ellipse cx="190" cy="190" rx="100" ry="32" fill={shade} />
      <ellipse cx="190" cy="186" rx="96" ry="28" fill={main} />
      <ellipse cx="190" cy="200" rx="86" ry="14" fill={light} opacity="0.6" />

      {/* TABBY STRIPES on the back */}
      <g stroke={stripe} strokeWidth="2" fill="none" opacity="0.65" strokeLinecap="round">
        <path d="M 130 168 q 8 8 16 0" />
        <path d="M 160 162 q 8 8 16 0" />
        <path d="M 190 158 q 8 8 16 0" />
        <path d="M 220 162 q 8 8 16 0" />
        <path d="M 250 170 q 8 8 16 0" />
      </g>

      {/* NECK + HEAD — round and slightly forward */}
      <circle cx="290" cy="170" r="38" fill={shade} />
      <circle cx="290" cy="168" r="34" fill={main} />
      <ellipse cx="288" cy="186" rx="26" ry="12" fill={light} opacity="0.55" />

      {/* TRIANGULAR EARS — pointed, set wide apart on top */}
      <polygon points="262 144 268 110 280 144" fill={shade} />
      <polygon points="266 142 270 122 276 142" fill="#f4b8a8" opacity="0.85" />
      <polygon points="300 144 312 110 318 144" fill={shade} />
      <polygon points="304 142 310 122 314 142" fill="#f4b8a8" opacity="0.85" />

      {/* FACE STRIPES — classic tabby M on the forehead */}
      <g stroke={stripe} strokeWidth="2" fill="none" opacity="0.7" strokeLinecap="round">
        <path d="M 280 148 q 5 4 0 12" />
        <path d="M 290 148 q 0 6 0 14" />
        <path d="M 300 148 q -5 4 0 12" />
      </g>

      {/* SLIT-PUPIL EYES */}
      <g className="eye-blink" style={{ transformOrigin: '275px 170px' }}>
        <ellipse cx="275" cy="170" rx="8" ry="7" fill="white" stroke="#222" strokeWidth="0.7" />
        <ellipse cx="276" cy="170" rx="5.5" ry="6" fill="#5cc46a" />
        <rect x="274.5" y="164" width="3" height="12" rx="1.5" fill="#0a0a0a" />
      </g>
      <g className="eye-blink" style={{ transformOrigin: '305px 170px' }}>
        <ellipse cx="305" cy="170" rx="8" ry="7" fill="white" stroke="#222" strokeWidth="0.7" />
        <ellipse cx="306" cy="170" rx="5.5" ry="6" fill="#5cc46a" />
        <rect x="304.5" y="164" width="3" height="12" rx="1.5" fill="#0a0a0a" />
      </g>

      {/* PINK NOSE — triangle */}
      <polygon points="285 184 295 184 290 191" fill={cheek} stroke="#a05060" strokeWidth="0.5" />
      {/* mouth — soft "W" */}
      <path d="M 290 191 q -4 6 -10 4 M 290 191 q 4 6 10 4" stroke="#3a1a08" strokeWidth="1.4" fill="none" strokeLinecap="round" />

      {/* WHISKERS — long, on both sides */}
      <g stroke="white" strokeWidth="0.8" opacity="0.85" strokeLinecap="round">
        <line x1="278" y1="188" x2="252" y2="184" />
        <line x1="278" y1="192" x2="250" y2="194" />
        <line x1="302" y1="188" x2="328" y2="184" />
        <line x1="302" y1="192" x2="330" y2="194" />
      </g>
    </svg>
  );
}

// ─── Dog ────────────────────────────────────────────────────────────────
// Friendly golden-ish dog, side view. Floppy ears, panting pink tongue,
// wagging tail, friendly square muzzle.
export function DogShape({ colors }: { colors: ColorOverride }) {
  const main = colors.main;
  const shade = colors.shade;
  const light = colors.light;
  const cheek = colors.cheek;
  const dark = colors.pattern ?? '#3a1a08';
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
      {BG_DEFS}
      <rect width="400" height="300" fill="url(#shape-bg)" />
      <line x1="20" y1="262" x2="380" y2="262" stroke="#b5ad95" strokeWidth="1" strokeDasharray="3 4" />

      {/* shadow */}
      <ellipse cx="200" cy="266" rx="138" ry="7" fill="rgba(0,0,0,0.18)" />

      {/* TAIL — wagging arc */}
      <path d="M 82 180 Q 50 172 36 140 Q 32 124 46 122 Q 60 128 58 142" stroke={shade} strokeWidth="13" fill="none" strokeLinecap="round" />
      <path d="M 82 180 Q 50 172 36 140 Q 32 124 46 122 Q 60 128 58 142" stroke={main} strokeWidth="9" fill="none" strokeLinecap="round" />
      {/* lighter underside */}
      <path d="M 88 184 Q 60 178 50 156" stroke={light} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6" />
      {/* motion-line wag hints */}
      <g stroke={dark} strokeWidth="1" opacity="0.4" strokeLinecap="round">
        <path d="M 22 110 q 6 4 8 12" fill="none" />
        <path d="M 60 100 q -4 6 -8 8" fill="none" />
      </g>

      {/* LEGS */}
      {[120, 152, 232, 264].map((x, i) => (
        <g key={x}>
          <rect x={x - 7} y="194" width="14" height="60" rx="4" fill={i % 2 === 0 ? shade : main} />
          {/* paw pads */}
          <ellipse cx={x} cy="258" rx="10" ry="5" fill={dark} />
          {/* toes */}
          <g fill={dark}>
            <circle cx={x - 5} cy="256" r="1.6" />
            <circle cx={x} cy="255" r="1.6" />
            <circle cx={x + 5} cy="256" r="1.6" />
          </g>
        </g>
      ))}

      {/* BODY */}
      <ellipse cx="180" cy="178" rx="105" ry="38" fill={shade} />
      <ellipse cx="180" cy="174" rx="100" ry="34" fill={main} />
      <ellipse cx="180" cy="192" rx="92" ry="16" fill={light} opacity="0.65" />

      {/* CHEST FLUFF — lighter cream patch */}
      <ellipse cx="248" cy="200" rx="18" ry="14" fill={light} opacity="0.85" />

      {/* NECK + HEAD */}
      <ellipse cx="282" cy="156" rx="32" ry="28" fill={shade} />
      <ellipse cx="282" cy="154" rx="28" ry="24" fill={main} />

      {/* FLOPPY EARS — hanging down the sides */}
      <path d="M 256 138
               Q 244 158 250 188
               Q 264 190 268 180
               Q 270 158 268 140 Z"
        fill={shade} />
      <path d="M 260 142
               Q 252 160 256 184
               Q 264 184 266 176
               Q 268 158 266 144 Z"
        fill={dark} opacity="0.55" />
      <path d="M 304 138
               Q 318 152 318 174
               Q 308 184 300 178
               Q 296 154 300 140 Z"
        fill={shade} />
      <path d="M 306 142
               Q 314 154 314 172
               Q 306 178 302 174
               Q 300 156 304 144 Z"
        fill={dark} opacity="0.45" />

      {/* SQUARE MUZZLE poking forward */}
      <path d="M 296 158
               Q 332 160 344 172
               Q 348 184 340 192
               Q 320 196 304 188
               Q 296 178 296 158 Z"
        fill={shade} />
      <path d="M 300 160
               Q 328 162 340 174
               Q 344 184 336 188
               Q 320 192 306 186
               Q 300 178 300 160 Z"
        fill={main} />
      <ellipse cx="324" cy="186" rx="14" ry="6" fill={light} opacity="0.6" />

      {/* BLACK NOSE — bulbous at the tip */}
      <ellipse cx="346" cy="174" rx="7" ry="5" fill={dark} />
      <ellipse cx="346" cy="172" rx="4" ry="2.5" fill="#0a0a0a" />

      {/* PINK TONGUE — sticking out slightly */}
      <path d="M 326 188 Q 332 198 322 200 Q 318 192 320 188 Z" fill={cheek} stroke="#a05060" strokeWidth="0.6" />
      <line x1="324" y1="192" x2="324" y2="198" stroke="#a05060" strokeWidth="0.6" />

      {/* FRIENDLY EYE */}
      <g className="eye-blink" style={{ transformOrigin: '290px 154px' }}>
        <circle cx="290" cy="154" r="6" fill="white" stroke="#222" strokeWidth="0.6" />
        <circle cx="290" cy="154" r="4" fill={dark} />
        <circle cx="291" cy="152" r="1.5" fill="white" />
        <circle cx="293" cy="156" r="0.8" fill="white" opacity="0.7" />
      </g>
      {/* eyebrow shadow */}
      <path d="M 284 145 q 6 -2 12 0" stroke={shade} strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* eye on the far side (smaller, hidden behind muzzle) */}
      <circle cx="306" cy="156" r="3" fill={dark} opacity="0.6" />
    </svg>
  );
}

// ─── Goat ───────────────────────────────────────────────────────────────
// Side view. Backward-curving horns (different from sheep's curled-under
// ones), chin BEARD, horizontal-slit pupils, cloven hooves, short tail.
export function GoatShape({ colors }: { colors: ColorOverride }) {
  const main = colors.main;
  const shade = colors.shade;
  const light = colors.light;
  const cheek = colors.cheek;
  const dark = colors.pattern ?? '#3a342a';
  const horn = '#a89878';
  const hornDark = '#6a5838';
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
      {BG_DEFS}
      <rect width="400" height="300" fill="url(#shape-bg)" />
      <line x1="20" y1="262" x2="380" y2="262" stroke="#b5ad95" strokeWidth="1" strokeDasharray="3 4" />

      {/* shadow */}
      <ellipse cx="200" cy="266" rx="125" ry="6" fill="rgba(0,0,0,0.18)" />

      {/* SHORT UPRIGHT TAIL */}
      <path d="M 88 178 L 76 168 L 80 184 Z" fill={shade} />
      <path d="M 86 178 L 78 172 L 80 182 Z" fill={main} />

      {/* LEGS with cloven hooves */}
      {[125, 158, 238, 270].map((x, i) => (
        <g key={x}>
          <rect x={x - 7} y="194" width="14" height="58" rx="3" fill={i % 2 === 0 ? shade : main} />
          {/* darker lower leg */}
          <rect x={x - 7} y="232" width="14" height="20" fill={dark} opacity="0.45" />
          {/* cloven hoof */}
          <rect x={x - 8} y="252" width="16" height="10" rx="2" fill="#1a1208" />
          <line x1={x} y1="252" x2={x} y2="262" stroke="#0a0500" strokeWidth="1.5" />
        </g>
      ))}

      {/* BODY */}
      <ellipse cx="188" cy="176" rx="98" ry="38" fill={shade} />
      <ellipse cx="188" cy="172" rx="94" ry="34" fill={main} />
      <ellipse cx="188" cy="190" rx="86" ry="16" fill={light} opacity="0.65" />

      {/* faint goat speckles */}
      <g fill={dark} opacity="0.3">
        <circle cx="148" cy="160" r="4" />
        <circle cx="176" cy="180" r="3" />
        <circle cx="208" cy="160" r="4" />
        <circle cx="232" cy="180" r="3" />
      </g>

      {/* NECK + HEAD — long and angular */}
      <path d="M 252 156
               Q 268 130 296 122
               Q 316 124 322 138
               L 316 158
               Q 296 164 274 168
               Q 258 166 252 162 Z"
        fill={shade} />
      <path d="M 256 158
               Q 270 132 296 126
               Q 312 128 318 138
               L 312 156
               Q 296 160 276 164
               Q 260 164 256 162 Z"
        fill={main} />

      {/* HEAD */}
      <path d="M 296 122
               Q 332 122 348 138
               Q 354 156 344 172
               Q 320 178 306 172
               Q 292 158 296 122 Z"
        fill={shade} />
      <path d="M 300 126
               Q 330 126 344 140
               Q 350 154 342 168
               Q 322 174 308 170
               Q 296 158 300 126 Z"
        fill={main} />

      {/* light muzzle */}
      <ellipse cx="344" cy="160" rx="14" ry="9" fill={cheek} opacity="0.55" />

      {/* nose + mouth */}
      <ellipse cx="354" cy="156" rx="4" ry="3" fill="#1a1208" />
      <path d="M 350 164 Q 346 170 340 168" stroke="#3a1a08" strokeWidth="1.4" fill="none" strokeLinecap="round" />

      {/* CHIN BEARD — the iconic goat tuft */}
      <path d="M 326 174 Q 322 198 314 210 Q 308 200 312 182 Z" fill={dark} />
      <g stroke={dark} strokeWidth="1" opacity="0.7">
        <line x1="324" y1="180" x2="320" y2="200" />
        <line x1="320" y1="184" x2="316" y2="206" />
      </g>

      {/* BACKWARD-CURVING HORNS — different from sheep's curl. Sweep
          UP and BACK in a smooth arc. */}
      <g fill="none" stroke={hornDark} strokeWidth="9" strokeLinecap="round">
        <path d="M 306 122 Q 296 96 280 80 Q 272 76 268 80" />
        <path d="M 320 122 Q 314 94 304 76 Q 296 70 290 74" />
      </g>
      <g fill="none" stroke={horn} strokeWidth="5" strokeLinecap="round">
        <path d="M 306 122 Q 296 96 280 80 Q 272 76 268 80" />
        <path d="M 320 122 Q 314 94 304 76 Q 296 70 290 74" />
      </g>
      {/* horn ridges */}
      <g stroke={hornDark} strokeWidth="1" opacity="0.85" fill="none" strokeLinecap="round">
        <path d="M 302 118 q -3 4 -2 8" />
        <path d="M 296 106 q -3 4 -2 8" />
        <path d="M 286 92 q -3 4 -2 8" />
        <path d="M 316 118 q -3 4 -2 8" />
        <path d="M 312 106 q -3 4 -2 8" />
        <path d="M 304 90 q -3 4 -2 8" />
      </g>

      {/* DROOPING EAR sticking sideways */}
      <ellipse cx="296" cy="138" rx="14" ry="6" fill={shade} transform="rotate(20 296 138)" />
      <ellipse cx="296" cy="138" rx="9" ry="3" fill="#f0b8a8" transform="rotate(20 296 138)" opacity="0.85" />

      {/* HORIZONTAL-SLIT PUPILS — classic goat eye */}
      <g className="eye-blink" style={{ transformOrigin: '320px 144px' }}>
        <ellipse cx="320" cy="144" rx="6" ry="5" fill="white" stroke="#222" strokeWidth="0.6" />
        <ellipse cx="320" cy="144" rx="4.5" ry="3" fill="#7a5028" />
        <rect x="316" y="143" width="8" height="2" rx="1" fill="#0a0500" />
      </g>
    </svg>
  );
}
