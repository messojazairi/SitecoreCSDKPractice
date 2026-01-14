import { Field, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

/**
 * CtaBanner component parameters
 */
export interface CtaBannerParams {
  colorScheme?: 'pink' | 'peach' | 'yellow' | 'green' | 'dark' | 'light';
  alignment?: 'left' | 'center' | 'right';
  styles?: string;
  [key: string]: string | undefined;
}

/**
 * CtaBanner component fields from Sitecore datasource
 */
export interface CtaBannerFields {
  title?: Field<string>;
  subtitle?: Field<string>;
  primaryCta?: LinkField;
  secondaryCta?: LinkField;
}

/**
 * CtaBanner component props
 */
export interface CtaBannerProps extends ComponentProps {
  params: CtaBannerParams;
  fields: CtaBannerFields;
}
