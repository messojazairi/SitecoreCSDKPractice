import { Field, ImageField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

/**
 * Parameters for the SearchBar component
 */
interface SearchBarParams {
  [key: string]: any; // eslint-disable-line
}

/**
 * Fields from the SearchBar datasource template
 * Supports both jsonValue structure and direct value structure
 */
export interface SearchBarFields {
  data?: {
    datasource?: {
      BackgroundImage?: {
        jsonValue?: ImageField;
        value?: ImageField | {
          src?: string;
          alt?: string;
          width?: string | number;
          height?: string | number;
        };
      };
      PlaceholderText?: {
        jsonValue?: Field<string>;
        value?: string;
      };
      ButtonText?: {
        jsonValue?: Field<string>;
        value?: string;
      };
    };
  };
  // Also support direct field access (for alternative data structures)
  BackgroundImage?: {
    jsonValue?: ImageField;
    value?: ImageField | {
      src?: string;
      alt?: string;
      width?: string | number;
      height?: string | number;
    };
  };
  PlaceholderText?: {
    jsonValue?: Field<string>;
    value?: string;
  };
  ButtonText?: {
    jsonValue?: Field<string>;
    value?: string;
  };
}

/**
 * Props for the SearchBar component
 */
export interface SearchBarProps extends ComponentProps {
  params: SearchBarParams;
  fields: SearchBarFields;
  isPageEditing?: boolean;
}
