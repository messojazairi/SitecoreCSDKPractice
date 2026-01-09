import {
  Field,
  ImageField,
  NextImage as ContentSdkImage,
  Link as ContentSdkLink,
  LinkField,
  Text,
} from "@sitecore-content-sdk/nextjs";
import React from "react";
import { ComponentProps } from "lib/component-props";

interface ImageFields {
  Image: ImageField;
  ImageCaption: Field<string>;
  TargetUrl: LinkField;
}

interface ImageProps extends ComponentProps {
  fields: ImageFields;
}

const ImageWrapper: React.FC<{
  className: string;
  id?: string;
  children: React.ReactNode;
}> = ({ className, id, children }) => (
  <div className={className.trim()} id={id}>
    <div className="component-content">{children}</div>
  </div>
);

const ImageDefault: React.FC<ImageProps> = ({ params }) => (
  <ImageWrapper className={`component image ${params.styles}`}>
    <span className="is-empty-hint">Image</span>
  </ImageWrapper>
);

export const Banner: React.FC<ImageProps> = ({ params, fields }) => {
  const { styles, RenderingIdentifier: id } = params;
  
  // Get alt text with fallback
  const altText = fields.ImageCaption?.value?.toString() || 
                  (fields.Image?.value?.alt ? String(fields.Image.value.alt) : undefined) || 
                  'Hero banner image';
  
  const imageField = fields.Image && {
    ...fields.Image,
    value: {
      ...fields.Image.value,
      style: { objectFit: "cover", width: "100%", height: "100%" },
      alt: altText,
    },
  };

  return (
    <div className={`component hero-banner ${styles}`.trim()} id={id}>
      <div className="component-content sc-sxa-image-hero-banner">
        <ContentSdkImage
          field={imageField}
          loading="eager"
          fetchPriority="high"
          alt={altText}
        />
      </div>
    </div>
  );
};

export const Default: React.FC<ImageProps> = (props) => {
  const { fields, params, page } = props;
  const { styles, RenderingIdentifier: id } = params;

  if (!fields) {
    return <ImageDefault {...props} />;
  }

  // Get alt text with fallback logic
  const altText = fields.ImageCaption?.value?.toString() || 
                  (fields.Image?.value?.alt ? String(fields.Image.value.alt) : undefined) || 
                  (fields.Image?.value?.title ? String(fields.Image.value.title) : undefined) || 
                  'Image';

  const Image = () => <ContentSdkImage field={fields.Image} alt={altText} />;
  const shouldWrapWithLink =
    !page.mode.isEditing && fields.TargetUrl?.value?.href;

  return (
    <ImageWrapper className={`component image ${styles}`} id={id}>
      {shouldWrapWithLink ? (
        <ContentSdkLink field={fields.TargetUrl} aria-label={altText}>
          <Image />
        </ContentSdkLink>
      ) : (
        <Image />
      )}
      {fields.ImageCaption?.value && (
        <Text
          tag="span"
          className="image-caption field-imagecaption"
          field={fields.ImageCaption}
        />
      )}
    </ImageWrapper>
  );
};
