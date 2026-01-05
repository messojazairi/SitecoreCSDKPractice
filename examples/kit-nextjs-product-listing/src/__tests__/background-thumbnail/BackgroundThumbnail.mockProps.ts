import React from 'react';
import type { BackgroundThumbailProps } from '../../components/background-thumbnail/BackgroundThumbnail.dev';
import { mockPage, mockPageEditing } from '../test-utils/mockPage';

// Mock children element
const mockChildren = React.createElement('div', { 'data-testid': 'mock-children' }, 'Mock Child');

// Mock useSitecore context for editing mode (kept for backwards compatibility if needed)
export const mockUseSitecoreEditing = {
  page: { mode: { isEditing: true } },
} as unknown;

// Mock useSitecore context for non-editing mode (kept for backwards compatibility if needed)
export const mockUseSitecoreNormal = {
  page: { mode: { isEditing: false } },
} as unknown;

// Default props for testing (non-editing mode)
export const defaultBackgroundThumbnailProps: BackgroundThumbailProps = {
  rendering: {
    componentName: 'BackgroundThumbnail',
    params: {},
  },
  params: {},
  page: mockPage,
  children: mockChildren,
};

// Props for editing mode
export const backgroundThumbnailPropsEditing: BackgroundThumbailProps = {
  rendering: {
    componentName: 'BackgroundThumbnail',
    params: {},
  },
  params: {},
  page: mockPageEditing,
  children: mockChildren,
};
