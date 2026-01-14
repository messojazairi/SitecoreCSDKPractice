import { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

/**
 * Stat item fields
 */
export interface StatItemFields {
  value?: Field<string>;
  label?: Field<string>;
}

export interface StatItem {
  fields: StatItemFields;
  id?: string;
}

/**
 * ContentBlock component parameters
 */
export interface ContentBlockParams {
  colorScheme?: 'light' | 'dark' | 'pink' | 'peach' | 'yellow' | 'green';
  alignment?: 'left' | 'center' | 'right';
  width?: 'narrow' | 'normal' | 'wide' | 'full';
  styles?: string;
  [key: string]: string | undefined;
}

/**
 * ContentBlock component fields from Sitecore datasource
 */
export interface ContentBlockFields {
  title?: Field<string>;
  subtitle?: Field<string>;
  content?: Field<string>;
  image?: ImageField;
  ctaLink?: LinkField;
  stats?: StatItem[];
}

/**
 * ContentBlock component props
 */
export interface ContentBlockProps extends ComponentProps {
  params: ContentBlockParams;
  fields: ContentBlockFields;
}
