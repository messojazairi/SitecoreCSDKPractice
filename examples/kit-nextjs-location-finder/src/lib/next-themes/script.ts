// Blocking theme script (from next-themes, MIT). Runs once in SSR HTML before hydration.
export function applyThemeBeforeHydration(
  attribute: string | string[],
  storageKey: string,
  defaultTheme: string,
  forcedTheme: string | undefined,
  themes: string[],
  value: Record<string, string> | undefined,
  enableSystem: boolean,
  enableColorScheme: boolean,
) {
  const el = document.documentElement;
  const systemThemes = ['light', 'dark'];

  function updateDOM(theme: string) {
    const attributes = Array.isArray(attribute) ? attribute : [attribute];

    attributes.forEach((attr) => {
      const isClass = attr === 'class';
      const classes = isClass && value ? themes.map((t) => value[t] || t) : themes;
      if (isClass) {
        el.classList.remove(...classes);
        el.classList.add(value && value[theme] ? value[theme] : theme);
      } else {
        el.setAttribute(attr, theme);
      }
    });

    if (enableColorScheme && systemThemes.includes(theme)) {
      el.style.colorScheme = theme;
    }
  }

  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  if (forcedTheme) {
    updateDOM(forcedTheme);
    return;
  }

  try {
    const themeName = localStorage.getItem(storageKey) || defaultTheme;
    const theme = enableSystem && themeName === 'system' ? getSystemTheme() : themeName;
    updateDOM(theme);
  } catch {
    // localStorage unavailable
  }
}
