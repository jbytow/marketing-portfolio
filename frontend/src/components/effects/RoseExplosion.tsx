import { useEffect, useRef, useState, type CSSProperties } from 'react';

export const ROSE_EXPLOSION_EVENT = 'rose-explosion';

interface Petal {
  id: number;
  left: number;
  duration: number;
  delay: number;
  size: number;
  emoji: string;
  drift: number;
  rot: number;
}

const EMOJIS = ['🌸', '🌹', '🥀', '❀'];
const PETAL_COUNT = 55;
const LIFETIME_MS = 2600;

export default function RoseExplosion() {
  const [petals, setPetals] = useState<Petal[]>([]);
  const counter = useRef(0);

  useEffect(() => {
    function handleExplosion() {
      const id = ++counter.current;
      const newPetals: Petal[] = Array.from({ length: PETAL_COUNT }, (_, i) => ({
        id: id * 1000 + i,
        left: Math.random() * 100,
        duration: 1.6 + Math.random() * 1.4,
        delay: Math.random() * 0.4,
        size: 0.8 + Math.random() * 1.1,
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        drift: (Math.random() - 0.5) * 200,
        rot: 180 + Math.random() * 540,
      }));
      setPetals(newPetals);
      setTimeout(() => setPetals([]), LIFETIME_MS);
    }

    window.addEventListener(ROSE_EXPLOSION_EVENT, handleExplosion);
    return () => window.removeEventListener(ROSE_EXPLOSION_EVENT, handleExplosion);
  }, []);

  if (petals.length === 0) return null;

  return (
    <div className="rose-explosion-layer" aria-hidden="true">
      {petals.map((p) => (
        <span
          key={p.id}
          className="rose-petal"
          style={
            {
              left: `${p.left}%`,
              fontSize: `${p.size}rem`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              '--petal-drift': `${p.drift}px`,
              '--petal-rot': `${p.rot}deg`,
            } as CSSProperties
          }
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
