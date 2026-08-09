let layer: HTMLDivElement | null = null;

function getSparkLayer() {
  if (!layer) {
    layer = document.createElement('div');
    layer.className = 'cursor-spark-layer';
    layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);
  }
  return layer;
}

interface SparkOptions {
  emoji?: string;
  dx: number;
  dy: number;
  fontSize?: number;
  duration?: number;
}

export function spawnSpark(x: number, y: number, opts: SparkOptions) {
  const el = document.createElement('span');
  el.className = 'cursor-spark';
  el.textContent = opts.emoji ?? '✨';
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.setProperty('--spark-dx', `${opts.dx}px`);
  el.style.setProperty('--spark-dy', `${opts.dy}px`);
  if (opts.fontSize) el.style.fontSize = `${opts.fontSize}rem`;
  if (opts.duration) el.style.animationDuration = `${opts.duration}s`;
  getSparkLayer().appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}
