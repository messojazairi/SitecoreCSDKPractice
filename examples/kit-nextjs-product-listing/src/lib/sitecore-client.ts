import { SitecoreClient } from '@sitecore-content-sdk/nextjs/client';
import scConfig from 'sitecore.config';

// Suppress only the known DEP0169 warning emitted by third-party url.parse usage.
// This keeps runtime behavior unchanged while preventing noisy dev error overlays.
if (process.env.NODE_ENV === 'development' && typeof process.emitWarning === 'function') {
  const processWithFlag = process as NodeJS.Process & { __dep0169Filtered?: boolean };

  if (!processWithFlag.__dep0169Filtered) {
    const originalEmitWarning = process.emitWarning.bind(process);

    process.emitWarning = ((warning: string | Error, ...args: unknown[]) => {
      const message = typeof warning === 'string' ? warning : warning?.message;
      const warningCode =
        typeof warning === 'object' && warning && 'code' in warning
          ? String((warning as { code?: unknown }).code)
          : undefined;
      const argsCode = args.find((arg) => typeof arg === 'string' && /^DEP\d+$/i.test(arg));

      if (warningCode === 'DEP0169' || argsCode === 'DEP0169' || message?.includes('`url.parse()`')) {
        return;
      }

      return (originalEmitWarning as (...callArgs: unknown[]) => void)(warning, ...args);
    }) as NodeJS.Process['emitWarning'];

    processWithFlag.__dep0169Filtered = true;
  }
}

const client = new SitecoreClient({
  ...scConfig,
});

export default client;
