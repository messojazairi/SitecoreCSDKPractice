import { LinkField, TextField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import type React from 'react';

export interface TitleItem {
  url: {
    path: string;
    siteName: string;
  };
  field: {
    jsonValue: {
      value: string;
    };
  };
}

export interface TitleProps extends ComponentProps {
  fields: {
    data?: {
      datasource?: TitleItem;
      contextItem?: TitleItem;
    };
  };
}

export interface TitleComponentContentProps {
  id?: string;
  styles?: string;
  children: React.ReactNode;
}

export type TitleLink = LinkField;
export type TitleTextField = TextField;
