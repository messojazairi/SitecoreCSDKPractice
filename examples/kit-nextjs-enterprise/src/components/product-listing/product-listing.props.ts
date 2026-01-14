import { Field, ImageField, LinkField, ComponentRendering } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

/**
 * Individual product item fields
 */
export interface ProductItemFields {
  name?: Field<string>;
  description?: Field<string>;
  price?: Field<string>;
  image?: ImageField;
  badge?: Field<string>;
  ctaLink?: LinkField;
}

/**
 * Product item from Sitecore multi-list or children
 */
export interface ProductItem {
  fields: ProductItemFields;
  id?: string;
  name?: string;
}

/**
 * ProductListing component parameters
 */
export interface ProductListingParams {
  columns?: '2' | '3' | '4';
  colorScheme?: 'light' | 'dark';
  styles?: string;
  [key: string]: string | undefined;
}

/**
 * ProductListing component fields from Sitecore datasource
 */
export interface ProductListingFields {
  title?: Field<string>;
  subtitle?: Field<string>;
  products?: ProductItem[];
}

/**
 * ProductListing component props
 */
export interface ProductListingProps extends ComponentProps {
  params: ProductListingParams;
  fields: ProductListingFields;
}
