// Simple mock props for Container70 component
export const mockContainer70Props = {
  rendering: {
    componentName: 'Container70',
    placeholders: {
      'container-seventy-main': [{ componentName: 'SampleComponent' }],
    },
  },
  params: {
    DynamicPlaceholderId: 'main',
    styles: 'custom-container-styles',
  },
  page: {
    mode: {
      isEditing: false,
    },
    layout: {},
    locale: 'en',
  },
  componentMap: new Map(),
};

// Mock props with exclude top margin
export const mockContainer70PropsNoMargin = {
  rendering: {
    componentName: 'Container70',
    placeholders: {
      'container-seventy-test': [{ componentName: 'SampleComponent' }],
    },
  },
  params: {
    DynamicPlaceholderId: 'test',
    excludeTopMargin: '1',
    styles: 'no-margin-container',
  },
  page: {
    mode: {
      isEditing: false,
    },
    layout: {},
    locale: 'en',
  },
  componentMap: new Map(),
};

// Mock props for empty container
export const mockContainer70PropsEmpty = {
  rendering: {
    componentName: 'Container70',
    placeholders: {},
  },
  params: {
    DynamicPlaceholderId: 'empty',
  },
  page: {
    mode: {
      isEditing: false,
    },
    layout: {},
    locale: 'en',
  },
  componentMap: new Map(),
};
