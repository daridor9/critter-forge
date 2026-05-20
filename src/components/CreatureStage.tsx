import type { Creature } from '../types';
import { CreatureBody } from './CreatureSVG';
import { hybridCatalog } from '../data/hybrids';

const W = 400;
const H = 300;

const FOOT_Y: Record<string, number> = {
  mammal: 252,
  reptile: 252,
  bird: 232,
  fish: 195,
};

export function CreatureStage({ creature }: { creature: Creature }) {
  const footY = FOOT_Y[creature.bodyPlan];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      {creature.bodyPlan === 'mammal' && <MeadowHabitat />}
      {creature.bodyPlan === 'reptile' && <RockyHabitat />}
      {creature.bodyPlan === 'bird' && <SkyHabitat />}
      {creature.bodyPlan === 'fish' && <UnderwaterHabitat />}

      {creature.hybrids.length > 0 && (
        <g>
          {creature.hybrids.map((id, i) => {
            const info = hybridCatalog.find((h) => h.id === id);
            if (!info) return null;
            return (
              <text key={id} x={W / 2 + (i - (creature.hybrids.length - 1) / 2) * 30} y={26} textAnchor="middle" fontSize="20">
                {info.emoji}
              </text>
            );
          })}
        </g>
      )}

      <CreatureBody creature={creature} cx={W / 2} footY={footY} scale={1} animate="breathe" />
    </svg>
  );
}

function MeadowHabitat() {
  const groundY = 256;
  return (
    <>
      <defs>
        <linearGradient id="meadow-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9fd4ee" />
          <stop offset="0.7" stopColor="#cfe6c4" />
          <stop offset="1" stopColor="#f8d68a" />
        </linearGradient>
        <linearGradient id="meadow-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#aac470" />
          <stop offset="1" stopColor="#7a9b48" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width={W} height={groundY} fill="url(#meadow-sky)" />
      <rect x="0" y={groundY} width={W} height={H - groundY} fill="url(#meadow-ground)" />

      <g className="sun-rays" style={{ transformOrigin: '340px 50px' }}>
        {Array.from({ length: 10 }).map((_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return <line key={i} x1={340 + Math.cos(a) * 22} y1={50 + Math.sin(a) * 22} x2={340 + Math.cos(a) * 30} y2={50 + Math.sin(a) * 30} stroke="#ffd66a" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />;
        })}
      </g>
      <circle cx="340" cy="50" r="22" fill="#ffe9a0" opacity="0.5" />
      <circle cx="340" cy="50" r="16" fill="#ffd66a" />
      <ellipse cx="336" cy="46" rx="6" ry="4" fill="#fff0a0" opacity="0.7" />

      <g transform="translate(70 40)">
        <g className="cloud" style={{ animationDuration: '60s' }}>
          <ellipse cx="0" cy="0" rx="24" ry="7" fill="white" opacity="0.95" />
          <ellipse cx="-12" cy="-3" rx="14" ry="6" fill="white" opacity="0.9" />
          <ellipse cx="11" cy="-2" rx="15" ry="6" fill="white" opacity="0.9" />
        </g>
      </g>
      <g transform="translate(200 80)">
        <g className="cloud" style={{ animationDuration: '80s', animationDelay: '-30s' }}>
          <ellipse cx="0" cy="0" rx="18" ry="5" fill="white" opacity="0.9" />
          <ellipse cx="-9" cy="-2" rx="10" ry="4" fill="white" opacity="0.85" />
        </g>
      </g>

      <ellipse cx="120" cy={groundY + 4} rx="120" ry="12" fill="#8aa050" opacity="0.6" />
      <ellipse cx="320" cy={groundY + 6} rx="100" ry="10" fill="#8aa050" opacity="0.6" />

      {[28, 75, 320, 372].map((tx, i) => (
        <g key={i}>
          <rect x={tx - 1.5} y={groundY - 22} width="3" height="22" fill="#3e2a18" />
          <ellipse cx={tx} cy={groundY - 26} rx="12" ry="6" fill="#3f6b34" />
          <ellipse cx={tx - 4} cy={groundY - 23} rx="7" ry="4" fill="#557d3e" />
        </g>
      ))}

      <g className="bob-breathe" style={{ transformOrigin: '292px 110px' }}>
        <text x="292" y="110" fontSize="13">🦋</text>
      </g>

      {Array.from({ length: 14 }).map((_, i) => {
        const tx = 8 + i * 28;
        return (
          <g key={i} className="grass-tuft" style={{ transformOrigin: `${tx}px ${H - 4}px` }}>
            <line x1={tx} y1={H - 2} x2={tx - 3} y2={H - 11} stroke="#4d6f22" strokeWidth="1.3" strokeLinecap="round" />
            <line x1={tx} y1={H - 2} x2={tx} y2={H - 14} stroke="#5d7f30" strokeWidth="1.3" strokeLinecap="round" />
            <line x1={tx} y1={H - 2} x2={tx + 3} y2={H - 11} stroke="#4d6f22" strokeWidth="1.3" strokeLinecap="round" />
          </g>
        );
      })}
    </>
  );
}

function RockyHabitat() {
  const groundY = 256;
  return (
    <>
      <defs>
        <linearGradient id="rock-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffba78" />
          <stop offset="1" stopColor="#ffd590" />
        </linearGradient>
        <linearGradient id="rock-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d99850" />
          <stop offset="1" stopColor="#8a5a28" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width={W} height={groundY} fill="url(#rock-sky)" />
      <rect x="0" y={groundY} width={W} height={H - groundY} fill="url(#rock-ground)" />

      <circle cx="340" cy="55" r="24" fill="#ff8a40" opacity="0.6" />
      <circle cx="340" cy="55" r="17" fill="#ff6a30" />
      <g className="sun-rays" style={{ transformOrigin: '340px 55px' }}>
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return <line key={i} x1={340 + Math.cos(a) * 24} y1={55 + Math.sin(a) * 24} x2={340 + Math.cos(a) * 32} y2={55 + Math.sin(a) * 32} stroke="#ff8a40" strokeWidth="2" opacity="0.55" strokeLinecap="round" />;
        })}
      </g>

      <polygon points={`0,${groundY} 90,${groundY - 30} 170,${groundY - 12} ${W},${groundY - 20} ${W},${groundY}`} fill="#a06030" opacity="0.5" />

      <g fill="#6e4628">
        <ellipse cx="55" cy={groundY + 4} rx="34" ry="14" />
        <ellipse cx="35" cy={groundY - 4} rx="22" ry="10" />
        <ellipse cx="345" cy={groundY + 8} rx="38" ry="14" />
        <ellipse cx="370" cy={groundY - 2} rx="22" ry="12" />
      </g>
      <g fill="#8a5a32">
        <ellipse cx="55" cy={groundY + 2} rx="32" ry="11" />
        <ellipse cx="345" cy={groundY + 5} rx="36" ry="11" />
      </g>

      <g stroke="#6a4828" strokeWidth="1.5" fill="none" strokeLinecap="round">
        <path d={`M 130 ${H - 12} L 165 ${H - 22} L 200 ${H - 14} L 240 ${H - 24}`} />
        <path d={`M 110 ${H - 4} L 150 ${H - 14}`} />
      </g>

      {[180, 250].map((tx, i) => (
        <g key={i}>
          <rect x={tx - 3} y={groundY - 16} width="6" height="16" fill="#4a6228" />
          {[-4, 0, 4].map((dx, j) => (
            <ellipse key={j} cx={tx + dx} cy={groundY - 18 + Math.abs(dx)} rx="2.5" ry="4" fill="#6a8a30" transform={`rotate(${dx * 8} ${tx + dx} ${groundY - 18})`} />
          ))}
        </g>
      ))}
    </>
  );
}

function SkyHabitat() {
  const branchY = 240;
  return (
    <>
      <defs>
        <linearGradient id="sky-up" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5fb6e0" />
          <stop offset="1" stopColor="#b8e0ee" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width={W} height={H} fill="url(#sky-up)" />

      <circle cx="340" cy="55" r="20" fill="#ffe9a0" opacity="0.5" />
      <circle cx="340" cy="55" r="14" fill="#ffd66a" />

      <g transform="translate(80 60)">
        <g className="cloud" style={{ animationDuration: '50s' }}>
          <ellipse cx="0" cy="0" rx="28" ry="9" fill="white" opacity="0.95" />
          <ellipse cx="-14" cy="-4" rx="17" ry="7" fill="white" />
          <ellipse cx="14" cy="-3" rx="18" ry="7" fill="white" />
        </g>
      </g>
      <g transform="translate(250 110)">
        <g className="cloud" style={{ animationDuration: '70s', animationDelay: '-20s' }}>
          <ellipse cx="0" cy="0" rx="22" ry="7" fill="white" opacity="0.9" />
          <ellipse cx="-11" cy="-3" rx="13" ry="5" fill="white" opacity="0.85" />
        </g>
      </g>
      <g transform="translate(50 150)">
        <g className="cloud" style={{ animationDuration: '90s', animationDelay: '-45s' }}>
          <ellipse cx="0" cy="0" rx="16" ry="5" fill="white" opacity="0.85" />
        </g>
      </g>

      {[180, 220, 250].map((bx, i) => (
        <g key={i} transform={`translate(${bx} ${100 + i * 8})`}>
          <g className="bird-wing" style={{ transformOrigin: 'center' }}>
            <path d="M -7 0 Q -3 -3 0 0 Q 3 -3 7 0" stroke="#3a2a18" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          </g>
        </g>
      ))}

      <line x1="0" y1={branchY + 6} x2={W} y2={branchY + 8} stroke="#5a3b22" strokeWidth="10" />
      <line x1="20" y1={branchY + 4} x2="160" y2={branchY + 8} stroke="#3e2a18" strokeWidth="2" opacity="0.4" />

      <g>
        {[80, 100, 110, 300, 340, 360].map((lx, i) => (
          <ellipse key={i} cx={lx} cy={branchY + 4 + (i % 2) * 2} rx="6" ry="3" fill="#3f6b34" />
        ))}
      </g>

      <rect x="0" y={H - 24} width={W} height="24" fill="#5a7d3a" opacity="0.4" />
    </>
  );
}

function UnderwaterHabitat() {
  return (
    <>
      <defs>
        <linearGradient id="under-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#74c4dc" />
          <stop offset="0.5" stopColor="#3a85b8" />
          <stop offset="1" stopColor="#1a4878" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width={W} height={H} fill="url(#under-water)" />

      {Array.from({ length: 6 }).map((_, i) => (
        <line key={i} x1={i * 70} y1="6" x2={i * 70 + 24} y2="12" stroke="white" strokeWidth="2" opacity="0.6" />
      ))}

      <g opacity="0.4">
        <g className="cloud" style={{ animationDuration: '40s' }}>
          <ellipse cx="0" cy="60" rx="120" ry="6" fill="white" />
        </g>
      </g>

      <g>
        {Array.from({ length: 14 }).map((_, i) => (
          <circle
            key={i}
            cx={20 + ((i * 37) % (W - 40))}
            cy={H - 40 + ((i * 19) % 30)}
            r={1.5 + (i % 3) * 0.6}
            fill="white"
            opacity="0.7"
            className="snowflake"
            style={{
              animationDuration: `${5 + (i % 4)}s`,
              animationDelay: `-${i * 0.6}s`,
            }}
          />
        ))}
      </g>

      <g fill="#3a6850" opacity="0.85">
        {[20, 70, 360, 380].map((bx, i) => (
          <ellipse key={i} cx={bx} cy={H - 6} rx="22" ry="6" />
        ))}
      </g>
      <g stroke="#3a8848" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8">
        <path d={`M 30 ${H} q -4 -25 0 -50 q 4 -25 0 -50`} />
        <path d={`M 60 ${H} q -3 -20 0 -40 q 3 -20 0 -40`} />
        <path d={`M 360 ${H} q 4 -25 0 -50 q -4 -25 0 -50`} />
        <path d={`M 380 ${H} q 3 -25 0 -40`} />
      </g>

      <g transform="translate(80 130)" opacity="0.5">
        <ellipse cx="0" cy="0" rx="6" ry="3" fill="#1a2c4a" />
        <polygon points="-6,0 -10,-3 -10,3" fill="#1a2c4a" />
      </g>
      <g transform="translate(330 170)" opacity="0.4">
        <ellipse cx="0" cy="0" rx="5" ry="2.5" fill="#1a2c4a" />
        <polygon points="-5,0 -8,-2 -8,2" fill="#1a2c4a" />
      </g>

      <line x1="0" y1={H * 0.78} x2={W} y2={H * 0.78} stroke="white" strokeWidth="0.5" strokeDasharray="3 4" opacity="0.15" />
    </>
  );
}
