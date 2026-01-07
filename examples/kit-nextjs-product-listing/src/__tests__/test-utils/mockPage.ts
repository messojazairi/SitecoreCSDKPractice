/**
 * Mock page object for testing components that require page.mode.isEditing
 */

export const mockPage = {
  mode: {
    isEditing: false,
    isNormal: true,
    isPreview: false,
  },
};

export const mockPageEditing = {
  mode: {
    isEditing: true,
    isNormal: false,
    isPreview: false,
  },
};



