/**
 * Shared mock page objects for tests
 * Use these in mock props files to provide the required `page` prop
 */

import type { Page } from '@sitecore-content-sdk/nextjs';

/**
 * Mock page object for normal (non-editing) mode
 */
export const mockPage: Page = {
  mode: {
    isEditing: false,
    isNormal: true,
    isPreview: false,
  },
} as Page;

/**
 * Mock page object for editing mode
 */
export const mockPageEditing: Page = {
  mode: {
    isEditing: true,
    isNormal: false,
    isPreview: false,
  },
} as Page;

/**
 * Mock page object for preview mode
 */
export const mockPagePreview: Page = {
  mode: {
    isEditing: false,
    isNormal: false,
    isPreview: true,
  },
} as Page;

