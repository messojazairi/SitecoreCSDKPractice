/**
 * Lazy-loadable framer-motion feature bundle.
 *
 * `domAnimation` covers: animate, exit, variants, whileHover, whileTap,
 * whileFocus, whileInView — sufficient for every animation in this project.
 *
 * The full `domMax` bundle (~140 KiB) adds layout animations and drag
 * which are not used. By lazy-loading `domAnimation` via `<LazyMotion>`,
 * the initial JS payload shrinks by ~80-100 KiB.
 */
export async function loadFramerFeatures() {
  const mod = await import('framer-motion');
  return mod.domAnimation;
}
