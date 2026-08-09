import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';

/**
 * Renders children directly under document.body, bypassing any ancestor
 * with `transform`/`filter`/`perspective` that would otherwise turn it into
 * the containing block for `position: fixed` descendants (a common cause of
 * fixed-position overlays appearing in the wrong spot).
 */
export default function FxPortal({ children }: { children: ReactNode }) {
  return createPortal(children, document.body);
}
