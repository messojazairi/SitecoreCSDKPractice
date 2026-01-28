import type { Field, LinkField } from '@sitecore-content-sdk/nextjs';
import type { ComponentProps } from '@/lib/component-props';

export type JobSectionProps = ComponentProps & JobSectionFields;

export interface JobSectionFields {
  fields: {
    data: {
      datasource?: {
        title: { jsonValue: Field<string> };
        description?: { jsonValue: Field<string> };
        jobs?: {
          results?: JobItemProps[];
          targetItems?: JobItemProps[];
        };
        children?: {
          results: JobItemProps[];
        };
      };
    };
  };
}

export type JobItemProps = {
  title?: {
    jsonValue: Field<string>;
  };
  location?: {
    jsonValue: Field<string>;
  };
  link?: {
    jsonValue?: LinkField;
  };
};
