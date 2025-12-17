'use client';

import { type FC } from 'react';
import { ComponentProps } from '@/lib/component-props';
import { Field } from '@sitecore-content-sdk/nextjs';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { Default as FooterNavigationColumnDev } from './FooterNavigationColumn.dev';
import type { FooterNavigationLink } from './global-footer.props';

export type FooterNavigationColumnWrapperProps = ComponentProps & {
  fields: {
    data?: {
      datasource?: {
        header?: {
          jsonValue: Field<string>;
        };
        items?: {
          results: FooterNavigationLink[];
        };
      };
    };
  };
};

export const Default: FC<FooterNavigationColumnWrapperProps> = (props) => {
  const { fields, page } = props;
  const { header, items } = fields?.data?.datasource ?? {};
  const isPageEditing = page?.mode?.isEditing ?? false;

  // If no data, show fallback in editing mode
  if (!fields?.data?.datasource && isPageEditing) {
    return <NoDataFallback componentName="Footer Navigation Column" />;
  }

  // Pass transformed props to the dev component
  return (
    <FooterNavigationColumnDev
      items={items?.results}
      header={header}
      isPageEditing={isPageEditing}
      parentRef={{ current: null }}
    />
  );
};
