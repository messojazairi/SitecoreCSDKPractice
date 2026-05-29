import { ComponentProps } from 'lib/component-props';
import { ImageField, Field, LinkField } from '@sitecore-content-sdk/nextjs';
import type { JSX } from 'react';

export interface PromoFields {
  PromoIcon: ImageField;
  PromoText: Field<string>;
  PromoLink: LinkField;
  PromoText2: Field<string>;
}

export type PromoProps = ComponentProps & {
  fields: PromoFields;
};

export interface PromoContentProps extends PromoProps {
  renderText: (fields: PromoFields) => JSX.Element;
}
