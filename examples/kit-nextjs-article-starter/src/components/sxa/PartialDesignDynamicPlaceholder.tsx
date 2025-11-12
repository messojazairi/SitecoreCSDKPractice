import React, { JSX } from 'react';
import { ComponentRendering } from '@sitecore-content-sdk/nextjs';
import componentMap from '.sitecore/component-map';
import { ComponentProps } from 'lib/component-props';
import { AppPlaceholder } from '@sitecore-content-sdk/nextjs';

type DynamicPlaceholderProps = ComponentProps & {
  rendering: ComponentRendering;
};

const PartialDesignDynamicPlaceholder = (
  props: DynamicPlaceholderProps,
): JSX.Element => (
  <AppPlaceholder
    name={props.rendering?.params?.sig || ''}
    rendering={props.rendering}
    page={props.page}
    componentMap={componentMap}
  />
);

export default PartialDesignDynamicPlaceholder;
