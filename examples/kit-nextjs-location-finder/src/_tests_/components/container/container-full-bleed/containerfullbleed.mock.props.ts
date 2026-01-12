// Simple mock props for ContainerFullBleed component
export const mockContainerFullBleedProps = {
  rendering: {
    componentName: 'ContainerFullBleed',
    placeholders: {
      'container-fullbleed-main': [{ componentName: 'SampleComponent' }],
    },
  },
  params: {
    DynamicPlaceholderId: 'main',
    styles: 'custom-fullbleed-styles',
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
export const mockContainerFullBleedPropsNoMargin = {
  rendering: {
    componentName: 'ContainerFullBleed',
    placeholders: {
      'container-fullbleed-test': [{ componentName: 'SampleComponent' }],
    },
  },
  params: {
    DynamicPlaceholderId: 'test',
    excludeTopMargin: '1',
    styles: 'no-margin-fullbleed',
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
export const mockContainerFullBleedPropsEmpty = {
  rendering: {
    componentName: 'ContainerFullBleed',
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
