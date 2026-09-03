import { useEffect, useRef, useState } from 'react';

/**
 * CSS-transition replacement for framer-motion's <AnimatePresence>.
 *
 * CSS alone can't delay unmounting a component for an exit transition, so
 * this keeps the element rendered for `duration` ms after `show` goes
 * false, giving a plain Tailwind `transition` class time to animate out
 * before the element actually leaves the DOM.
 *
 * Usage:
 *   const { rendered, entered } = usePresence(open, 200);
 *   if (!rendered) return null;
 *   return (
 *     <div className={cn(
 *       'transition-all duration-200 ease-out',
 *       entered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
 *     )}>
 *       ...
 *     </div>
 *   );
 *
 * `rendered` is true while the element should exist in the DOM (open, or
 * still animating out). `entered` is true once it should show its
 * "animated in" styles — it starts false, flips to true a frame after
 * mount so the initial styles paint first, and flips back to false
 * immediately when `show` goes false so the exit transition can run.
 */
export function usePresence(show, duration = 200) {
  const [rendered, setRendered] = useState(show);
  const [entered, setEntered] = useState(show);
  const timeoutRef = useRef(null);

  useEffect(() => {
    clearTimeout(timeoutRef.current);

    if (show) {
      // Deliberate: mounting immediately (not deferred to a callback) is what
      // makes the element present in the DOM in time for the very next frame,
      // which is when `entered` flips true to kick off the CSS transition.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRendered(true);
      const raf = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(raf);
    }

    setEntered(false);
    timeoutRef.current = setTimeout(() => setRendered(false), duration);
    return () => clearTimeout(timeoutRef.current);
  }, [show, duration]);

  return { rendered, entered };
}
