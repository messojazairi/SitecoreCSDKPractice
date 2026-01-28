'use client';

import type React from 'react';
import type { JobSectionProps } from './job-section.props';
import { Default as JobSectionDefault } from './JobSection.dev';

// Default display of the component
export const Default: React.FC<JobSectionProps> = (props) => {
  return <JobSectionDefault {...props} />;
};
