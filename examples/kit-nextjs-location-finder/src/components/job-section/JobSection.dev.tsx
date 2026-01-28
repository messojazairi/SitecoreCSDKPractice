'use client';

import type React from 'react';
import { Text, RichText } from '@sitecore-content-sdk/nextjs';
import { JobSectionProps, JobItemProps } from './job-section.props';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { Default as JobItem } from './JobItem.dev';
import { cn } from '@/lib/utils';

export const Default: React.FC<JobSectionProps> = (props) => {
  const { fields, params } = props;
  const datasource = fields?.data?.datasource;
  
  // Handle data coming directly on fields or from datasource
  // Map fields.title.value to title.jsonValue structure
  const fieldsAny = fields as any;
  const title = datasource?.title ?? (fieldsAny?.title?.value ? { jsonValue: { value: fieldsAny.title.value } } : fieldsAny?.title);
  const description = datasource?.description ?? (fieldsAny?.description?.value ? { jsonValue: { value: fieldsAny.description.value } } : fieldsAny?.description);
  
  // Check for jobs array directly on fields first (as shown in console logs: fields.jobs: Array(4))
  // The data might be at fields.jobs directly, not nested in fields.data.datasource
  const jobsFromFields = Array.isArray(fieldsAny?.jobs) ? fieldsAny.jobs : null;
  const jobsFromDatasource = datasource?.jobs;
  const childrenFromDatasource = datasource?.children;
  
  const jobItems = jobsFromFields ?? 
    jobsFromDatasource?.targetItems ?? 
    jobsFromDatasource?.results ?? 
    childrenFromDatasource?.results ?? [];

  if (!fields) {
    return <NoDataFallback componentName="Job Section" />;
  }

  return (
    <div
      data-component="JobSection"
      className={cn(
        '@container @md:py-16 @lg:py-20 bg-background text-foreground border-b-2 border-t-2 py-10 [.border-b-2+&]:border-t-0',
        params?.styles && {
          [params.styles]: true,
        }
      )}
      data-class-change
    >
      <div
        className="@xl:px-0 mx-auto grid max-w-screen-xl gap-8 px-0 [&:not(.px-6_&):not(.px-8_&):not(.px-10_&)]:px-6"
        data-component="JobSectionContentWrapper"
      >
        <div className="flex flex-col gap-6">
          {title?.jsonValue && (
            <Text
              tag="h2"
              className="max-w-screen-sm text-pretty font-heading text-4xl @sm:text-5xl @md:text-6xl font-light leading-tight tracking-tighter antialiased"
              field={title.jsonValue}
            />
          )}
          {description?.jsonValue && (
            <RichText
              className="max-w-3xl text-pretty text-lg leading-relaxed text-muted-foreground"
              field={description.jsonValue}
            />
          )}
        </div>
        {jobItems.length > 0 && (
          <div className="@md:grid-cols-2 @lg:grid-cols-3 grid grid-cols-1 gap-6">
            {jobItems.map((job: any, index: number) => {
              // Map Sitecore data structure (fields.title.value) to expected structure (title.jsonValue)
              const mappedJob: JobItemProps = {
                title: job.fields?.title ? { jsonValue: { value: job.fields.title.value } } : undefined,
                location: job.fields?.location ? { jsonValue: { value: job.fields.location.value } } : undefined,
                link: job.fields?.link ? { jsonValue: job.fields.link.value } : undefined,
              };
              return <JobItem key={job.id || index} {...mappedJob} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
};
