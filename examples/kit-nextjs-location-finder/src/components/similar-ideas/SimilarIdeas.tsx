'use client';

import type React from 'react';
import type { SimilarIdeasProps } from './similar-ideas.props';
import { SimilarIdeasDefault } from './SimilarIdeasDefault.dev';

/**
 * SimilarIdeas component - Default variant
 * Displays a collection of idea cards with images, titles, authors, categories, and dates
 * Based on Figma design: https://www.figma.com/design/TM3hdPWQNOMHfhrDTaGs5h/_Nexusblack.com--v0-?node-id=2005-161&m=dev
 * @param {SimilarIdeasProps} props - Component props from XM Cloud datasource
 * @returns {JSX.Element} The rendered SimilarIdeas component
 */
export const Default: React.FC<SimilarIdeasProps> = (props) => {
  console.log('💡 SimilarIdeas - Default Variant Props:', props);
  console.log('💡 SimilarIdeas - Page Mode:', props.page?.mode);

  const { page } = props;
  const isEditing = page?.mode?.isEditing ?? false;

  return <SimilarIdeasDefault {...props} isPageEditing={isEditing} />;
};
