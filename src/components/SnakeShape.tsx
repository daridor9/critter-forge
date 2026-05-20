import type { ColorOverride } from './CreatureSVG';

interface Props {
  colors: ColorOverride;
}

export function SnakeShape({ colors }: Props) {
  const path = 'M 60 220 C 110 110, 170 110, 210 200 C 250 290, 300 290, 350 200';
  const pattern = colors.pattern ?? colors.shade;

  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="snake-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fdfaf0" />
          <stop offset="1" stopColor="#f0ead7" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#snake-bg)" />
      <line x1="20" y1="278" x2="380" y2="278" stroke="#b5ad95" strokeWidth="1" strokeDasharray="3 4" />

      <path d={path} stroke="rgba(0,0,0,0.18)" strokeWidth="38" fill="none" strokeLinecap="round" transform="translate(2 6)" />

      <path d={path} stroke={colors.main} strokeWidth="36" fill="none" strokeLinecap="round" />

      <path d={path} stroke={colors.light} strokeWidth="16" fill="none" strokeLinecap="round" opacity="0.45" />

      <path d={path} stroke={pattern} strokeWidth="3" fill="none" strokeDasharray="6 14" opacity="0.7" />

      <g fill={pattern} opacity="0.7">
        <ellipse cx="115" cy="138" rx="6" ry="4" />
        <ellipse cx="160" cy="120" rx="7" ry="4" />
        <ellipse cx="200" cy="180" rx="7" ry="4" />
        <ellipse cx="240" cy="225" rx="7" ry="4" />
        <ellipse cx="285" cy="260" rx="7" ry="4" />
        <ellipse cx="325" cy="245" rx="6" ry="4" />
      </g>

      <path d="M 345 200 L 380 196" stroke={colors.shade} strokeWidth="20" strokeLinecap="round" fill="none" />
      <path d="M 360 198 L 378 195" stroke={colors.shade} strokeWidth="10" strokeLinecap="round" fill="none" />

      <g transform="translate(60 220)">
        <ellipse cx="0" cy="2" rx="34" ry="6" fill="rgba(0,0,0,0.18)" />
        <ellipse cx="-12" cy="-2" rx="30" ry="22" fill={colors.shade} />
        <ellipse cx="-15" cy="-4" rx="28" ry="20" fill={colors.main} />
        <ellipse cx="-22" cy="-10" rx="14" ry="6" fill={colors.light} opacity="0.55" />
        <ellipse cx="-26" cy="-2" rx="6" ry="3" fill={colors.shade} opacity="0.6" />

        <g className="eye-blink" style={{ transformOrigin: '-7px -6px' }}>
          <circle cx="-7" cy="-6" r="6.5" fill="white" stroke="#222" strokeWidth="0.6" />
          <ellipse cx="-6" cy="-5" rx="2.4" ry="5" fill="#1a1a1a" />
          <circle cx="-4" cy="-9" r="2" fill="white" />
        </g>

        <circle cx="-40" cy="-2" r="1.4" fill={colors.shade} />

        <path d="M -42 0 L -68 -4 M -68 -4 L -78 -10 M -68 -4 L -78 4"
              stroke="#d94560" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}
