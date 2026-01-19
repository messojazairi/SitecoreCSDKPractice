'use client';

import { useContext, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { ImageField, Image as ContentSdkImage, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ImageOptimizationContext } from '@/components/image/image-optimization.context';
import { useRef } from 'react';
import { useInView } from 'framer-motion';
import NextImage, { ImageProps } from 'next/image';
import placeholderImageLoader from '@/utils/placeholderImageLoader';

type ImageWrapperProps = {
  image?: ImageField;
  className?: string;
  priority?: boolean;
  sizes?: string;
  blurDataURL?: string;
  alt?: string;
  wrapperClass?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export const Default: React.FC<ImageWrapperProps> = (props) => {
  const { image, className, wrapperClass, sizes, ...rest } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const isPreview = page?.mode.isPreview;

  const { unoptimized } = useContext(ImageOptimizationContext);
  const ref = useRef(null);
  const inView = useInView(ref);

  // State to track if we're on client-side after hydration
  const [isClient, setIsClient] = useState(false);

  // Only run on client after hydration is complete
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isPageEditing && !image?.value?.src) {
    return <></>;
  }

  const imageSrc = image?.value?.src ? image?.value?.src : '';
  const isSvg = imageSrc.includes('.svg');
  
  // if  unoptimized || svg || external
  // Check if image is from external domain (not current hostname)
  // Only check window.location after hydration is complete to avoid hydration mismatch
  const isUnoptimized =
    unoptimized ||
    isSvg ||
    (imageSrc.startsWith('https://') &&
      (isClient ? !imageSrc.includes(window.location.hostname) : false));

  const isPicsumImage = imageSrc.includes('picsum.photos');

  return (
    <div className={cn('image-container', wrapperClass)}>
      {isPageEditing || isPreview || isSvg ? (
        <ContentSdkImage field={image} className={className} />
      ) : (
        <NextImage
          loader={isPicsumImage ? placeholderImageLoader : undefined}
          {...(image?.value as ImageProps)}
          className={className}
          unoptimized={isUnoptimized}
          priority={inView ? true : false}
          // Always use sizes for responsive images (except SVG which doesn't need it)
          // If sizes not provided, use a sensible default for full-width images
          sizes={
            isSvg
              ? undefined
              : sizes ||
                '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 1200px'
          }
          blurDataURL={image?.value?.src}
          placeholder="blur"
          //if image is an svg and no width is provide, set a default to avoid error, this will be overwritten by css
          {...(!image?.value?.width && isSvg ? { width: 16, height: 16 } : {})}
          {...rest}
        />
      )}
    </div>
  );
};
