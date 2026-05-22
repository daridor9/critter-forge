import type { Creature } from '../types';
import { sizeToMass } from '../physics';
import { hybridCatalog } from '../data/hybrids';
import { getBespokeShape } from './dexShapes';

interface Metrics {
  bodyW: number;
  bodyH: number;
  legLen: number;
  legW: number;
  logM: number;
  sizeT: number;
}

function metrics(creature: Creature, scale: number): Metrics {
  const m = sizeToMass(creature.sizeUnit);
  const logM = Math.log10(Math.max(0.01, m));
  const sizeT = Math.max(0, Math.min(1, (logM + 2) / 7));

  const baseSize = Math.max(15, 30 + logM * 22);
  const visualSize = baseSize * scale;

  const bodyAspect = 1.35 + sizeT * 1.15;
  const legThickMult = 0.78 + sizeT * 0.95;

  const bodyH = visualSize;
  const bodyW = bodyH * bodyAspect;
  const legLenBase = [bodyH * 0.35, bodyH * 0.7, bodyH * 1.1][creature.legTier];
  const legLen = legLenBase * (1 - sizeT * 0.18);
  const legW = [bodyH * 0.22, bodyH * 0.16, bodyH * 0.1][creature.legTier] * legThickMult;

  return { bodyW, bodyH, legLen, legW, logM, sizeT };
}

function massProportions(sizeT: number) {
  return {
    headMult: 1.42 - sizeT * 1.1,
    eyeMult: 1.55 - sizeT * 1.05,
    earMult: 1.5 - sizeT * 1.1,
    tailMult: 1.55 - sizeT * 1.15,
  };
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

export interface ColorOverride {
  main: string;
  shade: string;
  light: string;
  cheek: string;
  pattern?: string;
}

interface BodyProps {
  creature: Creature;
  cx: number;
  footY: number;
  scale?: number;
  facingRight?: boolean;
  animate?: 'run' | 'breathe' | 'none';
  colorOverride?: ColorOverride;
}

export function CreatureBody({ creature, cx, footY, scale = 1, facingRight = true, animate = 'none', colorOverride }: BodyProps) {
  const { bodyW, bodyH, legLen, legW, sizeT } = metrics(creature, scale);
  const props = massProportions(sizeT);
  const cy = footY - bodyH / 2 - legLen;
  const colors = colorOverride ?? bodyColors(creature);
  const armorColor = '#6b6b6b';

  const numLegs = creature.bodyPlan === 'fish' ? 0 : creature.bodyPlan === 'bird' ? 2 : 4;
  // Eye size by sensor tier. Bumped from [6,8,11] for a kawaii read — the
  // critter should feel cute and alive when seen at a glance. eyeMult still
  // scales it with body size so big creatures don't get bug-eyed.
  const eyeR = [8, 11, 14][creature.sensorTier] * scale * props.eyeMult;
  const showDetail = scale >= 0.55;
  const isTiny = sizeT < 0.2;
  const isHuge = sizeT > 0.75;

  const xs =
    numLegs === 2
      ? [cx - bodyW * 0.2, cx + bodyW * 0.2]
      : numLegs === 4
        ? [cx - bodyW * 0.38, cx - bodyW * 0.12, cx + bodyW * 0.12, cx + bodyW * 0.38]
        : [];

  const brainHeadMult = [0.78, 1.0, 1.22, 1.45][creature.brainTier];
  const headR = bodyH * 0.44 * brainHeadMult * props.headMult;
  const headCx = cx + bodyW / 2 - 6 * scale;
  const headCy = cy - bodyH * 0.14;
  const eyeCx = headCx + headR * 0.45;
  const eyeCy = headCy - headR * 0.1;

  const pattern = colorOverride?.pattern ?? patternColor(creature);
  const forcePattern = !!colorOverride?.pattern;
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
          <rect x={x - legW / 2 + Math.max(0.5, legW * 0.1)} y={cy + bodyH / 2 - 4 * scale + 1} width={Math.max(1, legW * 0.28)} height={legLen - 4} fill={colors.main} rx={legW / 4} opacity="0.7" />
          <ellipse cx={x} cy={cy + bodyH / 2 + legLen - 1} rx={legW * 0.78} ry={Math.max(1.5, legW * 0.42)} fill="#3a2118" />
          <ellipse cx={x - legW * 0.15} cy={cy + bodyH / 2 + legLen - 1.5} rx={legW * 0.25} ry={Math.max(0.6, legW * 0.15)} fill="#5a3825" opacity="0.7" />
        </g>
      ))}

      {creature.bodyPlan === 'mammal' && (
        <path
          d={
            isTiny
              ? `M ${cx - bodyW / 2 + 4} ${cy - bodyH * 0.02} Q ${cx - bodyW / 2 - bodyH * 0.9} ${cy + bodyH * 0.05} ${cx - bodyW / 2 - bodyH * 1.5 * props.tailMult} ${cy + bodyH * 0.5}`
              : isHuge
                ? `M ${cx - bodyW / 2 + 4} ${cy + bodyH * 0.1} Q ${cx - bodyW / 2 - bodyH * 0.3} ${cy + bodyH * 0.2} ${cx - bodyW / 2 - bodyH * 0.4 * props.tailMult} ${cy + bodyH * 0.3}`
                : `M ${cx - bodyW / 2 + 4} ${cy - bodyH * 0.05} Q ${cx - bodyW / 2 - bodyH * 0.5} ${cy - bodyH * 0.45} ${cx - bodyW / 2 - bodyH * 0.65 * props.tailMult} ${cy - bodyH * 0.7 * props.tailMult}`
          }
          stroke={colors.main}
          strokeWidth={Math.max(2, bodyH * (isTiny ? 0.06 : isHuge ? 0.18 : 0.13))}
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

      <ellipse cx={cx + bodyW * 0.02} cy={cy + bodyH * 0.04} rx={bodyW / 2} ry={bodyH / 2} fill={colors.shade} opacity="0.5" />
      <ellipse cx={cx} cy={cy} rx={bodyW / 2} ry={bodyH / 2} fill={colors.main} stroke={colors.shade} strokeWidth={Math.max(0.8, 1.4 * scale)} strokeOpacity={0.55} />
      <ellipse cx={cx - bodyW * 0.08} cy={cy - bodyH * 0.22} rx={bodyW * 0.3} ry={bodyH * 0.15} fill="white" opacity="0.22" />
      <ellipse cx={cx} cy={cy + bodyH * 0.18} rx={bodyW * 0.42} ry={bodyH * 0.28} fill={colors.light} opacity={0.5} />
      <ellipse cx={cx + bodyW * 0.05} cy={cy + bodyH * 0.32} rx={bodyW * 0.4} ry={bodyH * 0.12} fill={colors.shade} opacity="0.25" />

      {(showDetail || forcePattern) && pattern && creature.bodyPlan === 'mammal' && (
        <g fill={pattern} opacity={forcePattern ? 0.85 : 0.55}>
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

      {creature.brainTier >= 2 && showDetail && (
        <circle cx={headCx - headR * 0.35} cy={headCy - headR * 0.75} r={headR * (creature.brainTier === 3 ? 0.65 : 0.55)} fill={colors.main} />
      )}

      {creature.bodyPlan === 'mammal' && showDetail && (() => {
        const hasEcho = creature.hybrids.includes('echolocation');
        if (hasEcho) {
          return (
            <g>
              <ellipse cx={headCx - headR * 0.45} cy={headCy - headR * 0.95} rx={headR * 0.32} ry={headR * 0.65} fill={colors.shade} transform={`rotate(-14 ${headCx - headR * 0.45} ${headCy - headR * 0.95})`} />
              <ellipse cx={headCx + headR * 0.25} cy={headCy - headR * 1.0} rx={headR * 0.32} ry={headR * 0.65} fill={colors.shade} transform={`rotate(10 ${headCx + headR * 0.25} ${headCy - headR * 1.0})`} />
              <ellipse cx={headCx - headR * 0.45} cy={headCy - headR * 0.9} rx={headR * 0.16} ry={headR * 0.42} fill="#e88aa0" opacity="0.85" transform={`rotate(-14 ${headCx - headR * 0.45} ${headCy - headR * 0.9})`} />
              <ellipse cx={headCx + headR * 0.25} cy={headCy - headR * 0.95} rx={headR * 0.16} ry={headR * 0.42} fill="#e88aa0" opacity="0.85" transform={`rotate(10 ${headCx + headR * 0.25} ${headCy - headR * 0.95})`} />
            </g>
          );
        }
        if (creature.sensorTier === 2) {
          const leftCx = headCx - headR * 0.5;
          const rightCx = headCx + headR * 0.4;
          const earCy = headCy - headR * 0.95;
          const dishRx = headR * 0.42;
          const dishRy = headR * 0.55;
          return (
            <g>
              <g transform={`rotate(-22 ${leftCx} ${earCy})`}>
                <ellipse cx={leftCx} cy={earCy} rx={dishRx} ry={dishRy} fill={colors.shade} />
                <ellipse cx={leftCx} cy={earCy} rx={dishRx * 0.65} ry={dishRy * 0.78} fill="#e88aa0" opacity="0.9" />
                <ellipse cx={leftCx} cy={earCy} rx={dishRx * 0.25} ry={dishRy * 0.35} fill={colors.shade} />
              </g>
              <g transform={`rotate(22 ${rightCx} ${earCy})`}>
                <ellipse cx={rightCx} cy={earCy} rx={dishRx} ry={dishRy} fill={colors.shade} />
                <ellipse cx={rightCx} cy={earCy} rx={dishRx * 0.65} ry={dishRy * 0.78} fill="#e88aa0" opacity="0.9" />
                <ellipse cx={rightCx} cy={earCy} rx={dishRx * 0.25} ry={dishRy * 0.35} fill={colors.shade} />
              </g>
              <g stroke={colors.shade} strokeWidth={Math.max(0.6, 0.9 * scale)} fill="none" opacity="0.6">
                <path d={`M ${leftCx - dishRx * 1.6} ${earCy - dishRy * 0.4} q ${-headR * 0.15} ${dishRy * 0.4} 0 ${dishRy * 0.8}`} />
                <path d={`M ${leftCx - dishRx * 2.1} ${earCy - dishRy * 0.5} q ${-headR * 0.18} ${dishRy * 0.5} 0 ${dishRy}`} />
                <path d={`M ${rightCx + dishRx * 1.6} ${earCy - dishRy * 0.4} q ${headR * 0.15} ${dishRy * 0.4} 0 ${dishRy * 0.8}`} />
                <path d={`M ${rightCx + dishRx * 2.1} ${earCy - dishRy * 0.5} q ${headR * 0.18} ${dishRy * 0.5} 0 ${dishRy}`} />
              </g>
            </g>
          );
        }
        const earH = (creature.sensorTier === 0 ? headR * 0.45 : headR * 0.85) * props.earMult;
        const earW = (creature.sensorTier === 0 ? headR * 0.18 : headR * 0.22) * props.earMult;
        return (
          <g>
            <polygon
              points={`${headCx - headR * 0.5} ${headCy - headR * 0.5} ${headCx - headR * 0.5 + earW} ${headCy - headR * 0.5 - earH} ${headCx - headR * 0.5 + earW * 2.2} ${headCy - headR * 0.55}`}
              fill={colors.shade}
            />
            <polygon
              points={`${headCx + headR * 0.1} ${headCy - headR * 0.55} ${headCx + headR * 0.1 + earW} ${headCy - headR * 0.5 - earH} ${headCx + headR * 0.1 + earW * 2.2} ${headCy - headR * 0.5}`}
              fill={colors.shade}
            />
            {creature.sensorTier >= 1 && (
              <>
                <polygon
                  points={`${headCx - headR * 0.5 + earW * 0.4} ${headCy - headR * 0.5 - earH * 0.2} ${headCx - headR * 0.5 + earW} ${headCy - headR * 0.5 - earH * 0.85} ${headCx - headR * 0.5 + earW * 1.6} ${headCy - headR * 0.5 - earH * 0.2}`}
                  fill="#e88aa0"
                  opacity="0.8"
                />
                <polygon
                  points={`${headCx + headR * 0.1 + earW * 0.4} ${headCy - headR * 0.5 - earH * 0.2} ${headCx + headR * 0.1 + earW} ${headCy - headR * 0.5 - earH * 0.85} ${headCx + headR * 0.1 + earW * 1.6} ${headCy - headR * 0.5 - earH * 0.2}`}
                  fill="#e88aa0"
                  opacity="0.8"
                />
              </>
            )}
          </g>
        );
      })()}

      <circle cx={headCx + headR * 0.05} cy={headCy + headR * 0.05} r={headR} fill={colors.shade} opacity="0.45" />
      <circle cx={headCx} cy={headCy} r={headR} fill={colors.main} stroke={colors.shade} strokeWidth={Math.max(0.8, 1.4 * scale)} strokeOpacity={0.55} />
      <ellipse cx={headCx - headR * 0.25} cy={headCy - headR * 0.55} rx={headR * 0.42} ry={headR * 0.22} fill="white" opacity="0.28" />
      <ellipse cx={headCx + headR * 0.05} cy={headCy + headR * 0.55} rx={headR * 0.6} ry={headR * 0.18} fill={colors.shade} opacity="0.25" />

      {creature.bodyPlan === 'bird' && showDetail && (
        <polygon
          points={`${headCx + headR * 0.85} ${headCy + headR * 0.05} ${headCx + headR * 1.45} ${headCy + headR * 0.25} ${headCx + headR * 0.85} ${headCy + headR * 0.4}`}
          fill="#e8a838"
          stroke="#9a6c20"
          strokeWidth="0.6"
        />
      )}
      {creature.bodyPlan === 'reptile' && showDetail && (
        <>
          <ellipse cx={headCx + headR * 0.75} cy={headCy + headR * 0.15} rx={headR * 0.45} ry={headR * 0.3} fill={colors.main} />
          <ellipse cx={headCx + headR * 0.95} cy={headCy + headR * 0.25} rx={headR * 0.07} ry={headR * 0.05} fill={colors.shade} />
          <g fill="#d94560" stroke="#9a3045" strokeWidth={Math.max(0.4, 0.6 * scale)}>
            <path d={`M ${headCx + headR * 1.15} ${headCy + headR * 0.3} l ${headR * 0.45} ${headR * 0.08} l ${-headR * 0.12} ${-headR * 0.14} l ${headR * 0.2} ${0} l ${-headR * 0.12} ${headR * 0.14} l ${-headR * 0.2} ${0} z`} />
          </g>
        </>
      )}
      {creature.bodyPlan === 'reptile' && (
        <g fill={colors.shade}>
          {[-0.34, -0.18, -0.04, 0.1, 0.24, 0.36].map((off) => (
            <polygon
              key={off}
              points={`${cx + bodyW * off - 4 * scale} ${cy - bodyH * 0.46} ${cx + bodyW * off} ${cy - bodyH * 0.65} ${cx + bodyW * off + 4 * scale} ${cy - bodyH * 0.46}`}
            />
          ))}
        </g>
      )}
      {creature.bodyPlan === 'fish' && showDetail && (
        <g stroke={colors.shade} strokeWidth={Math.max(1, 1.5 * scale)} fill="none" strokeLinecap="round">
          <path d={`M ${headCx + headR * 0.15} ${headCy - headR * 0.35} q ${-headR * 0.15} ${headR * 0.35} 0 ${headR * 0.7}`} />
          <path d={`M ${headCx + headR * 0.35} ${headCy - headR * 0.35} q ${-headR * 0.15} ${headR * 0.35} 0 ${headR * 0.7}`} />
        </g>
      )}

      <g className={showDetail ? 'eye-blink' : undefined} style={{ transformOrigin: `${eyeCx}px ${eyeCy}px` }}>
        <circle cx={eyeCx} cy={eyeCy} r={eyeR} fill="white" stroke="#222" strokeWidth="0.8" />
        <circle cx={eyeCx + eyeR * 0.18} cy={eyeCy + eyeR * 0.08} r={eyeR * 0.62} fill="#1a1a1a" />
        <circle cx={eyeCx + eyeR * 0.4} cy={eyeCy - eyeR * 0.32} r={eyeR * 0.4} fill="white" />
        <circle cx={eyeCx - eyeR * 0.05} cy={eyeCy + eyeR * 0.3} r={eyeR * 0.2} fill="white" opacity="0.9" />
      </g>
      {showDetail && creature.bodyPlan === 'mammal' && (
        <g className="eye-blink" style={{ transformOrigin: `${eyeCx - headR * 0.55}px ${eyeCy + headR * 0.08}px` }}>
          <circle cx={eyeCx - headR * 0.55} cy={eyeCy + headR * 0.08} r={eyeR * 0.9} fill="white" stroke="#222" strokeWidth="0.8" />
          <circle cx={eyeCx - headR * 0.55 + eyeR * 0.15} cy={eyeCy + headR * 0.08 + eyeR * 0.05} r={eyeR * 0.55} fill="#1a1a1a" />
          <circle cx={eyeCx - headR * 0.55 + eyeR * 0.3} cy={eyeCy + headR * 0.08 - eyeR * 0.3} r={eyeR * 0.33} fill="white" />
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

      {showDetail && isTiny && creature.bodyPlan === 'mammal' && (
        <g stroke="#3a2118" strokeWidth={Math.max(0.5, 0.7 * scale)} strokeLinecap="round" fill="none" opacity="0.7">
          <line x1={headCx + headR * 0.6} y1={headCy + headR * 0.3} x2={headCx + headR * 1.4} y2={headCy + headR * 0.15} />
          <line x1={headCx + headR * 0.6} y1={headCy + headR * 0.45} x2={headCx + headR * 1.45} y2={headCy + headR * 0.45} />
          <line x1={headCx + headR * 0.6} y1={headCy + headR * 0.6} x2={headCx + headR * 1.4} y2={headCy + headR * 0.75} />
          <line x1={headCx + headR * 0.55} y1={headCy + headR * 0.32} x2={headCx - headR * 0.15} y2={headCy + headR * 0.18} />
          <line x1={headCx + headR * 0.5} y1={headCy + headR * 0.5} x2={headCx - headR * 0.2} y2={headCy + headR * 0.5} />
        </g>
      )}

      {showDetail && isHuge && creature.bodyPlan === 'mammal' && (
        <ellipse
          cx={headCx + headR * 0.3}
          cy={headCy + headR * 0.85}
          rx={headR * 0.65}
          ry={headR * 0.35}
          fill={colors.shade}
          opacity="0.45"
        />
      )}

      {creature.defenseTier === 1 && (creature.bodyPlan === 'mammal' || creature.bodyPlan === 'bird') && (
        <g fill="none" stroke={colors.shade} strokeWidth={Math.max(1.4, 1.7 * scale)} strokeLinecap="round">
          {Array.from({ length: 28 }).map((_, i) => {
            const angle = (i / 28) * Math.PI * 2 - Math.PI / 2;
            if (Math.sin(angle) > 0.5) return null;
            const sx = cx + (bodyW / 2) * Math.cos(angle);
            const sy = cy + (bodyH / 2) * Math.sin(angle);
            const len = 7 * scale;
            const ex = sx + Math.cos(angle) * len;
            const ey = sy + Math.sin(angle) * len;
            return <path key={i} d={`M ${sx} ${sy} L ${ex} ${ey}`} />;
          })}
        </g>
      )}

      {creature.defenseTier === 1 && (creature.bodyPlan === 'reptile' || creature.bodyPlan === 'fish') && (
        <g>
          {Array.from({ length: 5 }).flatMap((_, row) =>
            Array.from({ length: 7 }).map((_, col) => {
              const offset = row % 2 === 0 ? 0 : bodyW * 0.06;
              const x = cx - bodyW * 0.36 + col * (bodyW * 0.12) + offset;
              const y = cy - bodyH * 0.32 + row * (bodyH * 0.18);
              const dx = (x - cx) / (bodyW / 2);
              const dy = (y - cy) / (bodyH / 2);
              if (dx * dx + dy * dy > 0.78) return null;
              const r = bodyH * 0.075;
              return (
                <path
                  key={`${row}-${col}`}
                  d={`M ${x - r} ${y} a ${r} ${r} 0 0 1 ${r * 2} 0 z`}
                  fill={colors.shade}
                  opacity="0.6"
                  stroke={colors.shade}
                  strokeWidth={Math.max(0.4, 0.6 * scale)}
                />
              );
            })
          )}
        </g>
      )}

      {creature.defenseTier === 2 && (
        <g>
          <path
            d={`M ${cx - bodyW * 0.5} ${cy + bodyH * 0.1} q ${bodyW * 0.5} ${-bodyH * 0.75} ${bodyW} 0 l 0 ${bodyH * 0.15} q ${-bodyW * 0.5} ${bodyH * 0.45} ${-bodyW} 0 z`}
            fill="#7a7570"
            stroke="#2e2a26"
            strokeWidth={Math.max(1, 1.5 * scale)}
          />
          <g stroke="#2e2a26" strokeWidth={Math.max(0.6, 1 * scale)} fill="none" opacity="0.7">
            <path d={`M ${cx - bodyW * 0.3} ${cy - bodyH * 0.15} q ${bodyW * 0.08} ${-3 * scale} ${bodyW * 0.16} 0 q ${bodyW * 0.08} ${-3 * scale} ${bodyW * 0.16} 0 q ${bodyW * 0.08} ${-3 * scale} ${bodyW * 0.16} 0`} />
            <path d={`M ${cx - bodyW * 0.35} ${cy + bodyH * 0.0} q ${bodyW * 0.08} ${-3 * scale} ${bodyW * 0.16} 0 q ${bodyW * 0.08} ${-3 * scale} ${bodyW * 0.16} 0 q ${bodyW * 0.08} ${-3 * scale} ${bodyW * 0.16} 0`} />
          </g>
          <g fill="#2e2a26">
            {[-0.42, -0.2, 0, 0.2, 0.42].map((off) => {
              const top = cy + bodyH * 0.1 - bodyH * 0.7 * Math.cos(off * 1.4);
              return (
                <polygon
                  key={off}
                  points={`${cx + bodyW * off - 5 * scale} ${top + 4 * scale} ${cx + bodyW * off} ${top - 16 * scale} ${cx + bodyW * off + 5 * scale} ${top + 4 * scale}`}
                />
              );
            })}
          </g>
        </g>
      )}

      {creature.hybrids.includes('camouflage') && (
        <g fill="#5a7038" opacity="0.55">
          <ellipse cx={cx - bodyW * 0.25} cy={cy - bodyH * 0.12} rx={bodyH * 0.16} ry={bodyH * 0.11} />
          <ellipse cx={cx + bodyW * 0.12} cy={cy + bodyH * 0.04} rx={bodyH * 0.13} ry={bodyH * 0.09} />
          <ellipse cx={cx + bodyW * 0.28} cy={cy - bodyH * 0.18} rx={bodyH * 0.14} ry={bodyH * 0.1} />
          <ellipse cx={cx - bodyW * 0.05} cy={cy + bodyH * 0.2} rx={bodyH * 0.12} ry={bodyH * 0.08} />
          <ellipse cx={cx - bodyW * 0.32} cy={cy + bodyH * 0.12} rx={bodyH * 0.1} ry={bodyH * 0.07} />
        </g>
      )}

      {creature.hybrids.includes('antifreeze') && (
        <g fill="#cce7f4" stroke="#5b9fe0" strokeWidth={Math.max(0.5, 0.8 * scale)}>
          {[[0.2, -0.25], [-0.18, -0.08], [0.32, 0.08], [-0.28, 0.16], [0.06, -0.32], [-0.05, 0.22]].map(([dx, dy], i) => (
            <circle key={i} cx={cx + bodyW * (dx as number)} cy={cy + bodyH * (dy as number)} r={Math.max(1.8, 2.6 * scale)} />
          ))}
        </g>
      )}

      {creature.hybrids.includes('electric') && (
        <polyline
          points={`${cx - bodyW * 0.12} ${cy - bodyH * 0.25} ${cx + bodyW * 0.04} ${cy - bodyH * 0.08} ${cx - bodyW * 0.04} ${cy + bodyH * 0.05} ${cx + bodyW * 0.14} ${cy + bodyH * 0.22}`}
          stroke="#ffd60a"
          strokeWidth={Math.max(2, 2.6 * scale)}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {creature.hybrids.includes('gills') && creature.bodyPlan !== 'fish' && (
        <g stroke={colors.shade} strokeWidth={Math.max(1.5, 2 * scale)} strokeLinecap="round" fill="none">
          <path d={`M ${cx + bodyW * 0.28} ${cy - bodyH * 0.18} q ${-2 * scale} ${bodyH * 0.12} 0 ${bodyH * 0.24}`} />
          <path d={`M ${cx + bodyW * 0.35} ${cy - bodyH * 0.15} q ${-2 * scale} ${bodyH * 0.12} 0 ${bodyH * 0.24}`} />
          <path d={`M ${cx + bodyW * 0.42} ${cy - bodyH * 0.12} q ${-2 * scale} ${bodyH * 0.12} 0 ${bodyH * 0.24}`} />
        </g>
      )}

      {creature.hybrids.includes('thick-fur') && (
        <g fill="none" stroke={colors.shade} strokeWidth={Math.max(1.8, 2.4 * scale)} strokeLinecap="round" opacity="0.9">
          {Array.from({ length: 28 }).map((_, i) => {
            const angle = (i / 28) * Math.PI * 2 - Math.PI / 2;
            if (Math.sin(angle) > 0.55) return null;
            const sx = cx + (bodyW / 2) * Math.cos(angle);
            const sy = cy + (bodyH / 2) * Math.sin(angle);
            const len = 10 * scale;
            const ex = sx + Math.cos(angle) * len;
            const ey = sy + Math.sin(angle) * len;
            return <path key={i} d={`M ${sx} ${sy} L ${ex} ${ey}`} />;
          })}
        </g>
      )}

      {creature.hybrids.includes('venom') && showDetail && (
        <polygon
          points={`${headCx + headR * 0.18} ${headCy + headR * 0.6} ${headCx + headR * 0.28} ${headCy + headR * 0.95} ${headCx + headR * 0.38} ${headCy + headR * 0.6}`}
          fill="white"
          stroke="#1a1a1a"
          strokeWidth="0.6"
        />
      )}
      </g>
    </g>
  );
}

export function CreatureSVG({ creature, colorOverride }: { creature: Creature; colorOverride?: ColorOverride }) {
  const Bespoke = getBespokeShape(creature.shape);
  const colors = colorOverride ?? creature.colors;
  if (Bespoke && colors) {
    return <Bespoke colors={colors} />;
  }

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

      <CreatureBody creature={creature} cx={cx} footY={footY} scale={1} colorOverride={colors} />
    </svg>
  );
}
