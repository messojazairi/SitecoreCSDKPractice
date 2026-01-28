import { Field, ImageField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

interface NexusHeroParams {
  [key: string]: any; // eslint-disable-line
}

export interface NexusHeroFields {
  Heading?: Field<string>;
  Description?: Field<string>;
  'Background Image'?: ImageField;
  'Navigation Link'?: Array<{
    id: string;
    name: string;
    displayName: string;
  }>;
}

export interface NexusHeroProps extends ComponentProps {
  params: NexusHeroParams;
  fields: NexusHeroFields;
  isPageEditing?: boolean;
}
