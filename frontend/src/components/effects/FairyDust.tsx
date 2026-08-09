import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface Particle {
  id: number;
  emoji: string;
  dx: number;
  dy: number;
  rot: number;
  delay: number;
}

interface Burst {
  id: number;
  x: number;
  y: number;
  particles: Particle[];
}

const EMOJIS = ['✨', '💖', '🌸'];
const PARTICLE_COUNT = 7;
const BURST_LIFETIME_MS = 800;

export default function FairyDust() {
  const { theme } = useTheme();
  const [bursts, setBursts] = useState<Burst[]>([]);
  const counter = useRef(0);

  useEffect(() => {
    if (theme !== 'rose') return;

    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement | null)?.closest('button, a, [role="button"]');
      if (!target) return;

      const id = ++counter.current;
      const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
        const angle = (Math.PI * 2 * i) / PARTICLE_COUNT + Math.random() * 0.5;
        const distance = 30 + Math.random() * 35;
        return {
          id: i,
          emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
          dx: Math.cos(angle) * distance,
          dy: Math.sin(angle) * distance,
          rot: (Math.random() - 0.5) * 180,
          delay: Math.random() * 0.08,
        };
      });

      setBursts((prev) => [...prev, { id, x: e.clientX, y: e.clientY, particles }]);
      setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== id));
      }, BURST_LIFETIME_MS);
    }

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [theme]);

  if (theme !== 'rose' || bursts.length === 0) return null;

  return (
    <div aria-hidden="true">
      {bursts.map((burst) =>
        burst.particles.map((p) => (
          <span
            key={`${burst.id}-${p.id}`}
            className="fairy-dust-particle"
            style={
              {
                left: burst.x,
                top: burst.y,
                '--fairy-dx': `${p.dx}px`,
                '--fairy-dy': `${p.dy}px`,
                '--fairy-rot': `${p.rot}deg`,
                animationDelay: `${p.delay}s`,
              } as CSSProperties
            }
          >
            {p.emoji}
          </span>
        ))
      )}
    </div>
  );
}
