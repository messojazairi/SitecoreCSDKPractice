import { ComponentRendering, RichTextField } from '@sitecore-content-sdk/nextjs';

export const mockRendering: ComponentRendering = {
  componentName: 'PageContent',
  dataSource: '',
} as ComponentRendering;

// Mock rich text field with content
export const mockContentField: RichTextField = {
  value: '<p>This is page content</p><h2>Heading</h2><ul><li>Item 1</li><li>Item 2</li></ul>',
};

export const mockEmptyContentField: RichTextField = {
  value: '',
};

// Mock useSitecore context
export const mockSitecoreContext = {
  page: {
    layout: {
      sitecore: {
        route: {
          fields: {
            Content: {
              value: '<p>Content from route</p>',
            },
          },
        },
      },
    },
    locale: 'en',
    mode: {
      isEditing: false,
      isPreview: false,
    },
  },
};

export const mockSitecoreContextWithoutContent = {
  page: {
    layout: {
      sitecore: {
        route: {
          fields: {},
        },
      },
    },
    locale: 'en',
    mode: {
      isEditing: false,
      isPreview: false,
    },
  },
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
  page: mockSitecoreContext.page,
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
  page: mockSitecoreContext.page,
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
  page: mockSitecoreContext.page,
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
  page: mockSitecoreContext.page,
};

// Props without fields (page has no route content for fallback tests)
export const propsWithoutFields = {
  rendering: mockRendering,
  params: {
    Styles: 'no-fields-style',
    RenderingIdentifier: 'no-fields-id',
  },
  fields: undefined as unknown as typeof defaultProps.fields,
  page: mockSitecoreContextWithoutContent.page,
};

// Props without Content field (page has no route content for fallback tests)
export const propsWithoutContentField = {
  rendering: mockRendering,
  params: {
    Styles: 'no-content-field',
    RenderingIdentifier: 'no-content-field-id',
  },
  fields: {} as unknown as typeof defaultProps.fields,
  page: mockSitecoreContextWithoutContent.page,
};

// Props with undefined params
export const propsWithUndefinedParams = {
  rendering: mockRendering,
  params: {} as typeof defaultProps.params,
  fields: {
    Content: mockContentField,
  },
  page: mockSitecoreContext.page,
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
  page: mockSitecoreContext.page,
};

