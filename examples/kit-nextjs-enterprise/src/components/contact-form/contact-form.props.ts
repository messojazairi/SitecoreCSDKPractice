import { Field } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

/**
 * ContactForm component parameters
 */
export interface ContactFormParams {
  colorScheme?: 'light' | 'dark' | 'pink' | 'peach' | 'yellow' | 'green';
  layout?: 'standard' | 'narrow';
  styles?: string;
  [key: string]: string | undefined;
}

/**
 * ContactForm component fields from Sitecore datasource
 */
export interface ContactFormFields {
  title?: Field<string>;
  subtitle?: Field<string>;
  description?: Field<string>;
  nameLabel?: Field<string>;
  emailLabel?: Field<string>;
  companyLabel?: Field<string>;
  phoneLabel?: Field<string>;
  messageLabel?: Field<string>;
  submitButtonText?: Field<string>;
  successMessage?: Field<string>;
  errorMessage?: Field<string>;
}

/**
 * ContactForm component props
 */
export interface ContactFormProps extends ComponentProps {
  params: ContactFormParams;
  fields: ContactFormFields;
}
