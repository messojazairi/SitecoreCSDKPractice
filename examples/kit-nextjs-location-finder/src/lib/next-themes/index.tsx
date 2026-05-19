'use client';

// next-themes v0.4.6 behavior with React 19 fix: theme script injected via useServerInsertedHTML.
// https://github.com/pacocoursey/next-themes/issues/385

import * as React from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import type { ThemeProviderProps } from 'next-themes';
import { applyThemeBeforeHydration } from './script';

export type { ThemeProviderProps } from 'next-themes';

const MEDIA = '(prefers-color-scheme: dark)';
const colorSchemes = ['light', 'dark'];
const defaultThemes = ['light', 'dark'];

type ThemeContextValue = {
  theme?: string;
  setTheme: React.Dispatch<React.SetStateAction<string>>;
  forcedTheme?: string;
  resolvedTheme?: string;
  themes: string[];
  systemTheme?: 'dark' | 'light';
};

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

const emptyThemeContext: ThemeContextValue = {
  setTheme: () => {},
  themes: [],
};

export const useTheme = () => React.useContext(ThemeContext) ?? emptyThemeContext;

export function ThemeProvider(props: ThemeProviderProps) {
  if (React.useContext(ThemeContext) !== undefined) {
    return <>{props.children}</>;
  }
  return <Theme {...props} />;
}

function Theme({
  forcedTheme,
  disableTransitionOnChange = false,
  enableSystem = true,
  enableColorScheme = true,
  storageKey = 'theme',
  themes = defaultThemes,
  defaultTheme = enableSystem ? 'system' : 'light',
  attribute = 'data-theme',
  value,
  children,
  nonce,
  scriptProps,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<string | undefined>(() =>
    readStoredTheme(storageKey, defaultTheme),
  );
  const [resolvedTheme, setResolvedTheme] = React.useState<'light' | 'dark' | undefined>(() =>
    theme === 'system' ? getSystemTheme() : (theme as 'light' | 'dark' | undefined),
  );
  const classNames = value ? Object.values(value) : themes;

  const applyTheme = React.useCallback(
    (themeName: string) => {
      if (!themeName) return;

      let resolved = themeName;
      if (themeName === 'system' && enableSystem) {
        resolved = getSystemTheme();
      }

      const name = value ? value[resolved] : resolved;
      const restoreTransitions = disableTransitionOnChange ? disableTransitions(nonce) : null;
      const root = document.documentElement;

      const setAttribute = (attr: string) => {
        if (attr === 'class') {
          root.classList.remove(...classNames);
          if (name) root.classList.add(name);
        } else if (attr.startsWith('data-')) {
          if (name) root.setAttribute(attr, name);
          else root.removeAttribute(attr);
        }
      };

      if (Array.isArray(attribute)) attribute.forEach(setAttribute);
      else setAttribute(attribute);

      if (enableColorScheme) {
        const fallback = colorSchemes.includes(defaultTheme) ? defaultTheme : null;
        root.style.colorScheme = colorSchemes.includes(resolved) ? resolved : fallback ?? '';
      }

      restoreTransitions?.();
    },
    [attribute, classNames, defaultTheme, disableTransitionOnChange, enableColorScheme, enableSystem, nonce, value],
  );

  const setTheme = React.useCallback(
    (next: React.SetStateAction<string>) => {
      setThemeState((prev) => {
        const updated = typeof next === 'function' ? next(prev ?? defaultTheme) : next;
        try {
          localStorage.setItem(storageKey, updated);
        } catch {
          // unsupported
        }
        return updated;
      });
    },
    [defaultTheme, storageKey],
  );

  const onSystemThemeChange = React.useCallback(
    (event: MediaQueryListEvent | MediaQueryList) => {
      const resolved = getSystemTheme(event);
      setResolvedTheme(resolved);
      if (theme === 'system' && enableSystem && !forcedTheme) {
        applyTheme('system');
      }
    },
    [applyTheme, enableSystem, forcedTheme, theme],
  );

  React.useEffect(() => {
    const media = window.matchMedia(MEDIA);
    media.addEventListener('change', onSystemThemeChange);
    onSystemThemeChange(media);
    return () => media.removeEventListener('change', onSystemThemeChange);
  }, [onSystemThemeChange]);

  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== storageKey) return;
      if (!event.newValue) setTheme(defaultTheme);
      else setThemeState(event.newValue);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [defaultTheme, setTheme, storageKey]);

  React.useEffect(() => {
    applyTheme(forcedTheme ?? theme ?? defaultTheme);
  }, [applyTheme, defaultTheme, forcedTheme, theme]);

  const context = React.useMemo(
    () => ({
      theme,
      setTheme,
      forcedTheme,
      resolvedTheme: theme === 'system' ? resolvedTheme : theme,
      themes: enableSystem ? [...themes, 'system'] : themes,
      systemTheme: enableSystem ? resolvedTheme : undefined,
    }),
    [enableSystem, forcedTheme, resolvedTheme, setTheme, theme, themes],
  );

  return (
    <ThemeContext.Provider value={context}>
      <ThemeScript
        attribute={attribute}
        storageKey={storageKey}
        defaultTheme={defaultTheme}
        forcedTheme={forcedTheme}
        themes={themes}
        value={value}
        enableSystem={enableSystem}
        enableColorScheme={enableColorScheme}
        nonce={nonce}
        scriptProps={scriptProps}
      />
      {children}
    </ThemeContext.Provider>
  );
}

const ThemeScript = React.memo(function ThemeScript({
  attribute,
  storageKey,
  defaultTheme,
  forcedTheme,
  themes,
  value,
  enableSystem,
  enableColorScheme,
  nonce,
  scriptProps,
}: {
  attribute: ThemeProviderProps['attribute'];
  storageKey: string;
  defaultTheme: string;
  forcedTheme?: string;
  themes: string[];
  value?: ThemeProviderProps['value'];
  enableSystem: boolean;
  enableColorScheme: boolean;
  nonce?: string;
  scriptProps?: ThemeProviderProps['scriptProps'];
}) {
  // Inject into <head> during SSR only — not in the hydrated tree (avoids
  // shifting sibling <script> nodes e.g. StructuredData JSON-LD).
  useServerInsertedHTML(() => {
    const args = JSON.stringify([
      attribute,
      storageKey,
      defaultTheme,
      forcedTheme,
      themes,
      value,
      enableSystem,
      enableColorScheme,
    ]).slice(1, -1);

    return (
      <script
        {...scriptProps}
        suppressHydrationWarning
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: `(${applyThemeBeforeHydration.toString()})(${args})`,
        }}
      />
    );
  });

  return null;
});

function readStoredTheme(storageKey: string, fallback: string) {
  if (typeof window === 'undefined') return undefined;
  try {
    return localStorage.getItem(storageKey) || fallback;
  } catch {
    return fallback;
  }
}

function getSystemTheme(media?: MediaQueryList | MediaQueryListEvent) {
  const query = media ?? window.matchMedia(MEDIA);
  return query.matches ? 'dark' : 'light';
}

function disableTransitions(nonce?: string) {
  const style = document.createElement('style');
  if (nonce) style.setAttribute('nonce', nonce);
  style.appendChild(
    document.createTextNode(
      '*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}',
    ),
  );
  document.head.appendChild(style);
  return () => {
    window.getComputedStyle(document.body);
    setTimeout(() => document.head.removeChild(style), 1);
  };
}
