import { Field } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

/**
 * Individual FAQ item fields
 */
export interface FAQItemFields {
  question?: Field<string>;
  answer?: Field<string>;
}

/**
 * FAQ item from Sitecore
 */
export interface FAQItem {
  fields: FAQItemFields;
  id?: string;
  name?: string;
}

/**
 * FAQ component parameters
 */
export interface FAQParams {
  colorScheme?: 'light' | 'dark';
  layout?: 'centered' | 'wide';
  columns?: '2' | '3';
  styles?: string;
  [key: string]: string | undefined;
}

/**
 * FAQ component fields from Sitecore datasource
 */
export interface FAQFields {
  title?: Field<string>;
  subtitle?: Field<string>;
  items?: FAQItem[];
}

/**
 * FAQ component props
 */
export interface FAQProps extends ComponentProps {
  params: FAQParams;
  fields: FAQFields;
}
