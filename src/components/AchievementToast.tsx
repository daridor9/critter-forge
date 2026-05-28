import { useMemo } from 'react';

interface Props {
  name: string;
  emoji: string;
  description?: string;
}

// 16 colorful confetti particles burst outward in random directions.
// Pure CSS — each particle gets its own --tx / --ty CSS custom property
// for its flight vector, plus a delay so they don't fire all at once.
function Confetti() {
  const particles = useMemo(() => {
    const colors = ['#ff6b4a', '#ffd040', '#5cc46a', '#4ac8e0', '#9a60d0', '#ff7ab0'];
    return Array.from({ length: 16 }).map((_, i) => {
      const a = (i / 16) * Math.PI * 2 + Math.random() * 0.4;
      const dist = 60 + Math.random() * 50;
      return {
        tx: Math.cos(a) * dist,
        ty: Math.sin(a) * dist - 20,           // bias upward
        color: colors[i % colors.length],
        size: 5 + Math.random() * 5,
        delay: Math.random() * 80,
        rot: Math.random() * 720,
      };
    });
  }, []);
  return (
    <div className="ach-confetti" aria-hidden>
      {particles.map((p, i) => (
        <span
          key={i}
          className="ach-confetti-piece"
          style={{
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            '--rot': `${p.rot}deg`,
            background: p.color,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `${p.delay}ms`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

export function AchievementToast({ name, emoji, description }: Props) {
  return (
    <div className="ach-toast">
      <Confetti />
      <div className="ach-toast-emoji">{emoji}</div>
      <div className="ach-toast-body">
        <div className="ach-toast-title">★ Achievement unlocked!</div>
        <div className="ach-toast-name">{name}</div>
        {description && <div className="ach-toast-desc">{description}</div>}
      </div>
    </div>
  );
}
