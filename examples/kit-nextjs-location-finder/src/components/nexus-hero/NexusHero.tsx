'use client';

import type React from 'react';
import type { NexusHeroProps } from './nexus-hero.props';
import { NexusHeroDefault } from './NexusHeroDefault.dev';

// Default display of the component
export const Default: React.FC<NexusHeroProps> = (props) => {
  console.log('🚀 Nexus Hero - Default Variant Props:', props);
  console.log('🚀 Nexus Hero - Page Mode:', props.page.mode);
  
  const { page } = props;
  const { isEditing } = page.mode;
  
  return <NexusHeroDefault {...props} isPageEditing={isEditing} />;
};
