'use client';

import type React from 'react';
import type { SearchBarProps } from './search-bar.props';
import { SearchBarDefault } from './SearchBarDefault.dev';

/**
 * SearchBar component - Default variant
 * Displays a search bar with background image, input field, and submit button
 * Based on Figma design: https://www.figma.com/design/TM3hdPWQNOMHfhrDTaGs5h/_Nexusblack.com--v0-?node-id=2005-193&m=dev
 * @param {SearchBarProps} props - Component props from XM Cloud datasource
 * @returns {JSX.Element} The rendered SearchBar component
 */
export const Default: React.FC<SearchBarProps> = (props) => {
  const { page } = props;
  const isEditing = page?.mode?.isEditing ?? false;

  return <SearchBarDefault {...props} isPageEditing={isEditing} />;
};
