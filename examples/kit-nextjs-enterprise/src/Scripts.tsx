'use client';

import { useEffect } from 'react';
import Bootstrap from './Bootstrap';

/**
 * Renders client-side scripts and initializations
 */
export default function Scripts(): JSX.Element {
  useEffect(() => {
    // Any client-side initialization can go here
  }, []);

  return <Bootstrap />;
}
