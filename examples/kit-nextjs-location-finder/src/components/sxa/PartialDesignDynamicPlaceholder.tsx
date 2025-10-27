'use client'
import React, { JSX } from 'react';
import AppPlaceholder from 'components/content-sdk/Placeholder';
import { ComponentProps } from 'lib/component-props';

const PartialDesignDynamicPlaceholder = (props: ComponentProps): JSX.Element => (
  <AppPlaceholder name={props.rendering?.params?.sig || ''} rendering={props.rendering} />
);

export default PartialDesignDynamicPlaceholder;
