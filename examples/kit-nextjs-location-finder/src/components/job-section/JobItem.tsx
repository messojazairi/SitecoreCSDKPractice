'use client';

import type React from 'react';
import type { JobItemProps } from './job-section.props';
import { Default as JobItemDefault } from './JobItem.dev';

// Default display of the component
export const Default: React.FC<JobItemProps> = (props) => {
  return <JobItemDefault {...props} />;
};
