import { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

/**
 * Feature item fields
 */
export interface FeatureItemFields {
  text?: Field<string>;
  icon?: Field<string>;
}

export interface FeatureItem {
  fields: FeatureItemFields;
  id?: string;
}

/**
 * Section item fields for alternating layout
 */
export interface SectionItemFields {
  title?: Field<string>;
  content?: Field<string>;
  image?: ImageField;
}

export interface SectionItem {
  fields: SectionItemFields;
  id?: string;
}

/**
 * TwoColumnLayout component parameters
 */
export interface TwoColumnLayoutParams {
  colorScheme?: 'light' | 'dark';
  imagePosition?: 'left' | 'right';
  verticalAlignment?: 'top' | 'center' | 'bottom';
  styles?: string;
  [key: string]: string | undefined;
}

/**
 * TwoColumnLayout component fields from Sitecore datasource
 */
export interface TwoColumnLayoutFields {
  title?: Field<string>;
  subtitle?: Field<string>;
  content?: Field<string>;
  image?: ImageField;
  ctaLink?: LinkField;
  features?: FeatureItem[];
  sections?: SectionItem[];
}

/**
 * TwoColumnLayout component props
 */
export interface TwoColumnLayoutProps extends ComponentProps {
  params: TwoColumnLayoutParams;
  fields: TwoColumnLayoutFields;
}
