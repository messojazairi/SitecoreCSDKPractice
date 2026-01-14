import { JSX } from 'react';
import BYOCClientComponents from './index.client';

/**
 * BYOC (Bring Your Own Components) entry point
 * Handles both server and client component registration
 */
export default function BYOC(): JSX.Element {
  return <BYOCClientComponents />;
}
