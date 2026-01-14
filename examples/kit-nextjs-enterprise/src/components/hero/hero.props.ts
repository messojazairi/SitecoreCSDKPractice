import { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

/**
 * Hero component parameters from Sitecore rendering parameters
 */
export interface HeroParams {
  colorScheme?: 'pink' | 'peach' | 'yellow' | 'green' | 'light' | 'dark';
  size?: 'small' | 'medium' | 'large';
  alignment?: 'left' | 'center' | 'right';
  imagePosition?: 'left' | 'right';
  styles?: string;
  [key: string]: string | undefined;
}

/**
 * Hero component fields from Sitecore datasource
 */
export interface HeroFields {
  title?: Field<string>;
  subtitle?: Field<string>;
  description?: Field<string>;
  ctaLink?: LinkField;
  backgroundImage?: ImageField;
  backgroundVideo?: LinkField;
}

/**
 * Hero component props combining Sitecore fields and parameters
 */
export interface HeroProps extends ComponentProps {
  params: HeroParams;
  fields: HeroFields;
}
