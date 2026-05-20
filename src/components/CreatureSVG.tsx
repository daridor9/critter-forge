import type { Creature } from '../types';
import { sizeToMass } from '../physics';
import { hybridCatalog } from '../data/hybrids';

interface Metrics {
  bodyW: number;
  bodyH: number;
  legLen: number;
  legW: number;
}

function metrics(creature: Creature, scale: number): Metrics {
  const m = sizeToMass(creature.sizeUnit);
  const baseSize = Math.max(15, 30 + Math.log10(Math.max(0.01, m)) * 22);
  const visualSize = baseSize * scale;
  const bodyW = visualSize * 1.7;
  const bodyH = visualSize;
  const legLen = [bodyH * 0.4, bodyH * 0.75, bodyH * 1.15][creature.legTier];
  const legW = [bodyH * 0.22, bodyH * 0.16, bodyH * 0.1][creature.legTier];
  return { bodyW, bodyH, legLen, legW };
}

function bodyColors(creature: Creature) {
  if (creature.warmBlooded) return { main: '#e88a6c', shade: '#c66a4a', light: '#f6bea2', cheek: '#f29ca3' };
  return { main: '#6caedf', shade: '#4787bd', light: '#9dc8ee', cheek: '#a5d4f3' };
}

function patternColor(c: Creature): string | null {
  if (c.defenseTier === 2) return null;
  if (c.bodyPlan === 'reptile') return '#3f6e9f';
  if (c.bodyPlan === 'fish') return '#3a6fa3';
  if (c.bodyPlan === 'mammal' && c.defenseTier === 0) return '#9d4a2f';
  return null;
}

interface BodyProps {
  creature: Creature;
  cx: number;
  footY: number;
  scale?: number;
  facingRight?: boolean;
  animate?: 'run' | 'breathe' | 'none';
}

export function CreatureBody({ creature, cx, footY, scale = 1, facingRight = true, animate = 'none' }: BodyProps) {
  const { bodyW, bodyH, legLen, legW } = metrics(creature, scale);
  const cy = footY - bodyH / 2 - legLen;
  const colors = bodyColors(creature);
  const armorColor = '#6b6b6b';

  const numLegs = creature.bodyPlan === 'fish' ? 0 : creature.bodyPlan === 'bird' ? 2 : 4;
  const eyeR = [6, 8, 11][creature.sensorTier] * scale;
  const showDetail = scale >= 0.55;

  const xs =
    numLegs === 2
      ? [cx - bodyW * 0.2, cx + bodyW * 0.2]
      : numLegs === 4
        ? [cx - bodyW * 0.38, cx - bodyW * 0.12, cx + bodyW * 0.12, cx + bodyW * 0.38]
        : [];

  const headCx = cx + bodyW / 2 - 6 * scale;
  const headCy = cy - bodyH * 0.14;
  const headR = bodyH * 0.44;
  const eyeCx = headCx + headR * 0.45;
  const eyeCy = headCy - headR * 0.1;

  const pattern = patternColor(creature);
  const flip = facingRight ? '' : `translate(${cx * 2} 0) scale(-1 1)`;
  const animClass = animate === 'run' ? 'bob-run' : animate === 'breathe' ? 'bob-breathe' : undefined;

  return (
    <g transform={flip}>
      <ellipse cx={cx} cy={footY + 4 * scale} rx={bodyW * 0.6} ry={Math.max(2, 4 * scale)} fill="rgba(0,0,0,0.18)" />
      <g className={animClass}>

      {creature.defenseTier === 2 && (
        <ellipse cx={cx} cy={cy} rx={bodyW / 2 + 10 * scale} ry={bodyH / 2 + 8 * scale} fill={armorColor} opacity={0.3} />
      )}

      {xs.map((x, i) => (
        <g key={i} className={`leg leg-${i % 2 === 0 ? 'a' : 'b'}`} style={{ transformOrigin: `${x}px ${cy + bodyH / 2 - 4 * scale}px` }}>
          <rect x={x - legW / 2} y={cy + bodyH / 2 - 4 * scale} width={legW} height={legLen} fill={colors.shade} rx={legW / 3} />
          <ellipse cx={x} cy={cy + bodyH / 2 + legLen - 1} rx={legW * 0.75} ry={Math.max(1.5, legW * 0.4)} fill="#3a2118" />
        </g>
      ))}

      {creature.bodyPlan === 'mammal' && (
        <path
          d={`M ${cx - bodyW / 2 + 4} ${cy - bodyH * 0.05} Q ${cx - bodyW / 2 - bodyH * 0.5} ${cy - bodyH * 0.45} ${cx - bodyW / 2 - bodyH * 0.65} ${cy - bodyH * 0.7}`}
          stroke={colors.main}
          strokeWidth={Math.max(2, bodyH * 0.13)}
          strokeLinecap="round"
          fill="none"
        />
      )}
      {creature.bodyPlan === 'reptile' && (
        <path
          d={`M ${cx - bodyW / 2 + 4} ${cy} Q ${cx - bodyW * 0.8} ${cy + bodyH * 0.05} ${cx - bodyW} ${cy + bodyH * 0.3}`}
          stroke={colors.shade}
          strokeWidth={Math.max(3, bodyH * 0.22)}
          strokeLinecap="round"
          fill="none"
        />
      )}
      {creature.bodyPlan === 'bird' && (
        <polygon
          points={`${cx - bodyW / 2} ${cy - bodyH * 0.2} ${cx - bodyW / 2 - bodyH * 0.55} ${cy + bodyH * 0.2} ${cx - bodyW / 2} ${cy + bodyH * 0.3}`}
          fill={colors.shade}
        />
      )}
      {creature.bodyPlan === 'fish' && (
        <>
          <polygon
            points={`${cx - bodyW / 2 - bodyH * 0.55} ${cy - bodyH * 0.4} ${cx - bodyW / 2} ${cy} ${cx - bodyW / 2 - bodyH * 0.55} ${cy + bodyH * 0.4}`}
            fill={colors.shade}
          />
          <polygon
            points={`${cx} ${cy + bodyH * 0.45} ${cx - bodyH * 0.2} ${cy + bodyH * 0.85} ${cx + bodyH * 0.2} ${cy + bodyH * 0.85}`}
            fill={colors.shade}
          />
        </>
      )}

      {(creature.bodyPlan === 'bird' || creature.hybrids.includes('wings')) && (
        <>
          <ellipse
            cx={cx - bodyW * 0.4}
            cy={cy}
            rx={bodyW * 0.35}
            ry={bodyH * 0.28}
            fill={colors.light}
            stroke={colors.shade}
            strokeWidth="0.6"
            opacity={0.92}
            transform={`rotate(-22 ${cx - bodyW * 0.4} ${cy})`}
          />
          <ellipse
            cx={cx + bodyW * 0.4}
            cy={cy}
            rx={bodyW * 0.35}
            ry={bodyH * 0.28}
            fill={colors.light}
            stroke={colors.shade}
            strokeWidth="0.6"
            opacity={0.92}
            transform={`rotate(22 ${cx + bodyW * 0.4} ${cy})`}
          />
        </>
      )}

      <ellipse cx={cx} cy={cy} rx={bodyW / 2} ry={bodyH / 2} fill={colors.main} />
      <ellipse cx={cx} cy={cy + bodyH * 0.18} rx={bodyW * 0.42} ry={bodyH * 0.28} fill={colors.light} opacity={0.45} />

      {showDetail && pattern && creature.bodyPlan === 'mammal' && (
        <g fill={pattern} opacity={0.55}>
          <circle cx={cx - bodyW * 0.18} cy={cy - bodyH * 0.05} r={bodyH * 0.07} />
          <circle cx={cx + bodyW * 0.05} cy={cy - bodyH * 0.13} r={bodyH * 0.06} />
          <circle cx={cx + bodyW * 0.22} cy={cy + bodyH * 0.04} r={bodyH * 0.05} />
          <circle cx={cx - bodyW * 0.05} cy={cy + bodyH * 0.12} r={bodyH * 0.05} />
        </g>
      )}
      {showDetail && pattern && (creature.bodyPlan === 'reptile' || creature.bodyPlan === 'fish') && (
        <g stroke={pattern} strokeWidth="1.5" opacity={0.4}>
          {[-0.3, -0.15, 0, 0.15, 0.3].map((off) => (
            <line key={off} x1={cx + bodyW * off} y1={cy - bodyH * 0.42} x2={cx + bodyW * off} y2={cy + bodyH * 0.42} />
          ))}
        </g>
      )}

      {creature.brainTier === 2 && showDetail && (
        <circle cx={headCx - headR * 0.35} cy={headCy - headR * 0.75} r={headR * 0.55} fill={colors.main} />
      )}

      <circle cx={headCx} cy={headCy} r={headR} fill={colors.main} />

      {creature.bodyPlan === 'mammal' && showDetail && (
        <polygon
          points={`${headCx - headR * 0.3} ${headCy - headR * 0.5} ${headCx - headR * 0.05} ${headCy - headR * 1.15} ${headCx + headR * 0.15} ${headCy - headR * 0.6}`}
          fill={colors.shade}
        />
      )}

      <g className={showDetail ? 'eye-blink' : undefined} style={{ transformOrigin: `${eyeCx}px ${eyeCy}px` }}>
        <circle cx={eyeCx} cy={eyeCy} r={eyeR} fill="white" stroke="#222" strokeWidth="0.6" />
        <circle cx={eyeCx + eyeR * 0.18} cy={eyeCy + eyeR * 0.08} r={eyeR * 0.62} fill="#1a1a1a" />
        <circle cx={eyeCx + eyeR * 0.4} cy={eyeCy - eyeR * 0.32} r={eyeR * 0.34} fill="white" />
        <circle cx={eyeCx + eyeR * 0.05} cy={eyeCy + eyeR * 0.32} r={eyeR * 0.15} fill="white" opacity="0.8" />
      </g>
      {showDetail && creature.bodyPlan === 'mammal' && (
        <g className="eye-blink" style={{ transformOrigin: `${eyeCx - headR * 0.55}px ${eyeCy + headR * 0.08}px` }}>
          <circle cx={eyeCx - headR * 0.55} cy={eyeCy + headR * 0.08} r={eyeR * 0.9} fill="white" stroke="#222" strokeWidth="0.6" />
          <circle cx={eyeCx - headR * 0.55 + eyeR * 0.15} cy={eyeCy + headR * 0.08 + eyeR * 0.05} r={eyeR * 0.55} fill="#1a1a1a" />
          <circle cx={eyeCx - headR * 0.55 + eyeR * 0.3} cy={eyeCy + headR * 0.08 - eyeR * 0.3} r={eyeR * 0.28} fill="white" />
        </g>
      )}

      {showDetail && (
        <>
          <ellipse cx={eyeCx - eyeR * 0.4} cy={eyeCy + headR * 0.5} rx={headR * 0.16} ry={headR * 0.1} fill={colors.cheek} opacity="0.75" />
          {creature.bodyPlan === 'mammal' && (
            <ellipse cx={eyeCx - headR * 0.85} cy={eyeCy + headR * 0.55} rx={headR * 0.14} ry={headR * 0.09} fill={colors.cheek} opacity="0.7" />
          )}
        </>
      )}

      {showDetail && (
        <g>
          <path
            d={`M ${headCx + headR * 0.05} ${headCy + headR * 0.45} q ${headR * 0.35} ${headR * 0.35} ${headR * 0.7} 0`}
            stroke="#3a2118"
            strokeWidth={Math.max(1, 1.6 * scale)}
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={`M ${headCx + headR * 0.18} ${headCy + headR * 0.58} q ${headR * 0.22} ${headR * 0.18} ${headR * 0.44} 0`}
            fill="#e88aa0"
            opacity="0.9"
          />
        </g>
      )}

      {creature.defenseTier === 1 && creature.bodyPlan === 'mammal' && showDetail && (
        <g fill="none" stroke={colors.shade} strokeWidth="1.5" strokeLinecap="round">
          <path d={`M ${cx - bodyW * 0.2} ${cy - bodyH / 2 - 1} l 1 -5`} />
          <path d={`M ${cx - bodyW * 0.05} ${cy - bodyH / 2 - 1} l 1 -6`} />
          <path d={`M ${cx + bodyW * 0.1} ${cy - bodyH / 2 - 1} l 1 -5`} />
          <path d={`M ${cx + bodyW * 0.25} ${cy - bodyH / 2 - 1} l 1 -6`} />
        </g>
      )}

      {creature.defenseTier === 2 && (
        <g fill={armorColor}>
          {[-0.3, 0, 0.3].map((off) => (
            <polygon
              key={off}
              points={`${cx + bodyW * off - 5 * scale} ${cy - bodyH / 2} ${cx + bodyW * off} ${cy - bodyH / 2 - 14 * scale} ${cx + bodyW * off + 5 * scale} ${cy - bodyH / 2}`}
            />
          ))}
        </g>
      )}
      </g>
    </g>
  );
}

export function CreatureSVG({ creature }: { creature: Creature }) {
  const cx = 200;
  const footY = 260;

  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="stage-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fdfaf0" />
          <stop offset="1" stopColor="#f0ead7" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="400" height="300" fill="url(#stage-bg)" />
      <line x1="20" y1={footY + 8} x2="380" y2={footY + 8} stroke="#b5ad95" strokeWidth="1" strokeDasharray="3 4" />

      {creature.hybrids.length > 0 && (
        <g>
          {creature.hybrids.map((id, i) => {
            const info = hybridCatalog.find((h) => h.id === id);
            if (!info) return null;
            return (
              <text key={id} x={cx + (i - (creature.hybrids.length - 1) / 2) * 32} y={42} textAnchor="middle" fontSize="22">
                {info.emoji}
              </text>
            );
          })}
        </g>
      )}

      <CreatureBody creature={creature} cx={cx} footY={footY} scale={1} />
    </svg>
  );
}
