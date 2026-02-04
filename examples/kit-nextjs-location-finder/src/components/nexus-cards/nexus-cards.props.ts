import { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

/**
 * Parameters for the NexusCards component
 */
interface NexusCardsParams {
  [key: string]: any; // eslint-disable-line
}

/**
 * Individual card item fields from NexusCard template
 * Fields come from Content SDK as { jsonValue: Field } structure
 */
export interface NexusCardItem {
  id: string;
  name: string;
  displayName: string;
  Title?: {
    jsonValue: Field<string>;
  };
  Tagline?: {
    jsonValue: Field<string>;
  };
  Description?: {
    jsonValue: Field<string>;
  };
  CardNumber?: {
    jsonValue: Field<string>;
  };
  CardImage?: {
    jsonValue: ImageField;
  };
  CardLink?: {
    jsonValue: LinkField;
  };
}

/**
 * Fields from the NexusCards datasource template
 * Multilist fields come as children.results array
 */
export interface NexusCardsFields {
  data: {
    datasource: {
      children?: {
        results: NexusCardItem[];
      };
    };
  };
}

/**
 * Props for the NexusCards component
 */
export interface NexusCardsProps extends ComponentProps {
  params: NexusCardsParams;
  fields: NexusCardsFields;
  isPageEditing?: boolean;
}
