import { Placeholder } from '@sitecore-content-sdk/nextjs';
import React, { JSX } from 'react';
import { ComponentProps } from 'lib/component-props';
import { AppPlaceholder } from "@sitecore-content-sdk/nextjs";

interface ContainerProps extends ComponentProps {
  params: ComponentProps['params'] & {
    BackgroundImage?: string;
    DynamicPlaceholderId: string;
  };
}

// Import componentMap - this will only be used in production
let componentMap: any;
try {
  // Dynamic require to avoid circular dependency during module initialization
  componentMap = require('.sitecore/component-map').default;
} catch {
  // In test environment, componentMap might not be available
  componentMap = {};
}

const Container = ({
  params,
  rendering,
  page,
}: ContainerProps): JSX.Element => {
  const {
    styles,
    RenderingIdentifier: id,
    BackgroundImage: backgroundImage,
    DynamicPlaceholderId,
  } = params;
  const phKey = `container-${DynamicPlaceholderId}`;

  // Extract the mediaurl from rendering parameters
  const mediaUrlPattern = new RegExp(/mediaurl=\"([^"]*)\"/, 'i');

  let backgroundStyle: { [key: string]: string } = {};

  if (backgroundImage && backgroundImage.match(mediaUrlPattern)) {
    const mediaUrl = backgroundImage.match(mediaUrlPattern)?.[1] || '';

    backgroundStyle = {
      backgroundImage: `url('${mediaUrl}')`,
    };
  }

  return (
    <div className={`component container-default ${styles}`} id={id}>
      <div className="component-content" style={backgroundStyle}>
        <div className="row">
          <Placeholder name={phKey} rendering={rendering} />
        </div>
      </div>
    </div>
  );
};

export const Default = (props: ContainerProps): JSX.Element => {
  const styles = props.params?.styles?.split(' ');

  return styles?.includes('container') ? (
    <div className="container-wrapper">
      <Container {...props} />
    </div>
  ) : (
    <Container {...props} />
  );
};
