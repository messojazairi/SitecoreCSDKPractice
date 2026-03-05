import { RichTextField, Page } from '@sitecore-content-sdk/nextjs';

// Mock rich text field with content
export const mockContentField: RichTextField = {
  value: '<p>This is page content</p><h2>Heading</h2><ul><li>Item 1</li><li>Item 2</li></ul>',
};

export const mockEmptyContentField: RichTextField = {
  value: '',
};

// Mock page object with route content
const createMockPage = (hasContent: boolean = true): Page =>
  ({
    layout: {
      sitecore: {
        route: {
          fields: hasContent
            ? {
                Content: {
                  value: '<p>Content from route</p>',
                },
              }
            : {},
        },
      },
    },
    mode: {
      isEditing: false,
      isPreview: false,
      isNormal: true,
    },
  }) as unknown as Page;

// Mock useSitecore context
export const mockSitecoreContext = {
  page: createMockPage(true),
};

export const mockSitecoreContextWithoutContent = {
  page: createMockPage(false),
};

// Mock rendering object
const mockRendering = {
  uid: 'test-uid',
  componentName: 'PageContent',
};

// Default props with content field
export const defaultProps = {
  rendering: mockRendering,
  params: {
    Styles: 'custom-page-content-style',
    RenderingIdentifier: 'page-content-id',
  },
  fields: {
    Content: mockContentField,
  },
  page: createMockPage(true),
};

// Props with empty content
export const propsWithEmptyContent = {
  rendering: mockRendering,
  params: {
    Styles: 'empty-content-style',
    RenderingIdentifier: 'empty-content-id',
  },
  fields: {
    Content: mockEmptyContentField,
  },
  page: createMockPage(true),
};

// Props without styles
export const propsWithoutStyles = {
  rendering: mockRendering,
  params: {
    Styles: '',
    RenderingIdentifier: 'no-style-id',
  },
  fields: {
    Content: mockContentField,
  },
  page: createMockPage(true),
};

// Props without RenderingIdentifier
export const propsWithoutId = {
  rendering: mockRendering,
  params: {
    Styles: 'custom-style',
    RenderingIdentifier: '',
  },
  fields: {
    Content: mockContentField,
  },
  page: createMockPage(true),
};

// Props without fields
export const propsWithoutFields = {
  rendering: mockRendering,
  params: {
    Styles: 'no-fields-style',
    RenderingIdentifier: 'no-fields-id',
  },
  fields: undefined as unknown as typeof defaultProps.fields,
  page: createMockPage(false),
};

// Props without Content field
export const propsWithoutContentField = {
  rendering: mockRendering,
  params: {
    Styles: 'no-content-field',
    RenderingIdentifier: 'no-content-field-id',
  },
  fields: {} as unknown as typeof defaultProps.fields,
  page: createMockPage(true),
};

// Props with undefined params
export const propsWithUndefinedParams = {
  rendering: mockRendering,
  params: {} as typeof defaultProps.params,
  fields: {
    Content: mockContentField,
  },
  page: createMockPage(true),
};

// Props with null content field
export const propsWithNullContent = {
  rendering: mockRendering,
  params: {
    Styles: 'null-content',
    RenderingIdentifier: 'null-content-id',
  },
  fields: {
    Content: null as unknown as RichTextField,
  },
  page: createMockPage(false),
};

