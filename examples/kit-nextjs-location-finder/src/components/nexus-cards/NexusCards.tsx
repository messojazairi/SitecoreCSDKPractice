'use client';

import type React from 'react';
import type { NexusCardsProps } from './nexus-cards.props';
import { NexusCardsDefault } from './NexusCardsDefault.dev';

/**
 * NexusCards component - Default variant
 * Displays a collection of cards with images, titles, descriptions, and links
 * @param {NexusCardsProps} props - Component props from XM Cloud datasource
 * @returns {JSX.Element} The rendered NexusCards component
 */
export const Default: React.FC<NexusCardsProps> = (props) => {
  console.log('🃏 NexusCards - Default Variant Props:', props);
  console.log('🃏 NexusCards - Page Mode:', props.page?.mode);

  const { page } = props;
  const isEditing = page?.mode?.isEditing ?? false;

  return <NexusCardsDefault {...props} isPageEditing={isEditing} />;
};
