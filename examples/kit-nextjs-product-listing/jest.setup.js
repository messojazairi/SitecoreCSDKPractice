import '@testing-library/jest-dom';
import React from 'react';

// Mock ResizeObserver for tests
global.ResizeObserver = class ResizeObserver {
  constructor(cb) {
    this.cb = cb;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver for tests
global.IntersectionObserver = class IntersectionObserver {
  constructor(cb) {
    this.cb = cb;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Common mock page object for tests
global.mockPage = {
  mode: {
    isEditing: false,
    isNormal: true,
    isPreview: false,
  },
};

global.mockPageEditing = {
  mode: {
    isEditing: true,
    isNormal: false,
    isPreview: false,
  },
};

// Mock lucide-react icons
jest.mock('lucide-react', () => {
  const createMockIcon = (name) => {
    const MockIcon = (props) => React.createElement('svg', { 'data-testid': `${name}-icon`, ...props });
    MockIcon.displayName = name;
    return MockIcon;
  };

  return new Proxy({}, {
    get: (target, prop) => {
      if (prop === '__esModule') return true;
      return createMockIcon(prop);
    },
  });
});

// Mock change-case module (ESM module that needs mocking)
jest.mock('change-case', () => ({
  kebabCase: (s) => String(s).replace(/\s+/g, '-').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
  capitalCase: (s) => String(s).replace(/(^|\s)\S/g, (t) => t.toUpperCase()),
  camelCase: (s) => String(s).replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : ''),
  pascalCase: (s) => String(s).replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '').replace(/^./, (c) => c.toUpperCase()),
  sentenceCase: (s) => String(s).charAt(0).toUpperCase() + String(s).slice(1).toLowerCase(),
}));

jest.mock('@sitecore-content-sdk/nextjs', () => ({
  Text: ({ field, tag: Tag = 'span' }) => {
    if (!field || !field.value) return null;
    return React.createElement(Tag, {}, field.value);
  },
  RichText: ({ field }) => {
    if (!field || !field.value) return null;
    return React.createElement('div', { dangerouslySetInnerHTML: { __html: field.value } });
  },
  Link: ({ field, children }) => {
    if (!field || !field.value) return React.createElement(React.Fragment, {}, children);
    const linkText = field?.value?.text || children;
    return React.createElement('a', { href: field.value.href }, linkText);
  },
  useSitecore: () => ({
    sitecoreContext: {
      pageEditing: false,
    },
    page: global.mockPage,
  }),
  withDatasourceCheck: () => (Component) => Component,
  Placeholder: ({ name, rendering }) => React.createElement('div', { 'data-testid': 'placeholder', 'data-name': name }),
  NextImage: ({ field, className, width, height }) => {
    if (!field || !field.value) return null;
    return React.createElement('img', { src: field.value.src, alt: field.value.alt, className, width, height });
  },
}));
