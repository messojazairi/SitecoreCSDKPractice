'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Text, Image, Link as SitecoreLink } from '@sitecore-content-sdk/nextjs';
import { cva } from 'class-variance-authority';
import { Play, Pause, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { Button } from '@/components/ui/button';
import { HeroProps } from './hero.props';
import { usePrefersReducedMotion } from '@/hooks/use-media-query';

/**
 * Hero section variants using class-variance-authority
 */
export const heroVariants = cva('hero relative w-full overflow-hidden', {
  variants: {
    colorScheme: {
      pink: 'bg-pastel-pink text-primary-foreground',
      peach: 'bg-pastel-peach text-secondary-foreground',
      yellow: 'bg-pastel-yellow text-tertiary-foreground',
      green: 'bg-pastel-green text-accent-foreground',
      light: 'bg-background text-foreground',
      dark: 'bg-foreground text-background',
    },
    size: {
      small: 'min-h-[400px] py-12',
      medium: 'min-h-[600px] py-16',
      large: 'min-h-screen py-20',
    },
    alignment: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
  },
  defaultVariants: {
    colorScheme: 'light',
    size: 'large',
    alignment: 'center',
  },
});

/**
 * Default Hero variant - Full-screen with optional video/image background
 */
export const Default: React.FC<HeroProps> = ({ fields, params, page }) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isVideoPlaying, setIsVideoPlaying] = useState(!prefersReducedMotion);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isPageEditing = page.mode.isEditing;

  const { colorScheme = 'light', size = 'large', alignment = 'center' } = params || {};

  useEffect(() => {
    if (videoRef.current) {
      if (isVideoPlaying && !prefersReducedMotion) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isVideoPlaying, prefersReducedMotion]);

  if (!fields) {
    return <NoDataFallback componentName="Hero" />;
  }

  const { title, subtitle, description, ctaLink, backgroundImage, backgroundVideo } = fields;
  const hasVideo = backgroundVideo?.value?.href;
  const hasImage = backgroundImage?.value?.src;

  return (
    <section
      className={cn(
        heroVariants({ colorScheme, size, alignment }),
        'flex items-center justify-center',
        params?.styles
      )}
    >
      {/* Background Media */}
      {(hasVideo || hasImage) && (
        <div className="absolute inset-0 z-0">
          {hasVideo && !prefersReducedMotion ? (
            <video
              ref={videoRef}
              autoPlay={!prefersReducedMotion}
              loop
              muted
              playsInline
              className="h-full w-full object-cover"
            >
              <source src={backgroundVideo.value.href} type="video/mp4" />
            </video>
          ) : hasImage ? (
            <Image
              field={backgroundImage}
              className="h-full w-full object-cover"
              priority
            />
          ) : null}
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4">
        <div
          className={cn('mx-auto max-w-4xl', {
            'ml-0': alignment === 'left',
            'mr-0': alignment === 'right',
          })}
        >
          {(title?.value || isPageEditing) && (
            <Text
              tag="h1"
              field={title}
              className={cn(
                'mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl',
                (hasVideo || hasImage) && 'text-white drop-shadow-lg'
              )}
            />
          )}

          {(subtitle?.value || isPageEditing) && (
            <Text
              tag="p"
              field={subtitle}
              className={cn(
                'mb-4 text-xl font-medium sm:text-2xl',
                (hasVideo || hasImage) && 'text-white/90 drop-shadow'
              )}
            />
          )}

          {(description?.value || isPageEditing) && (
            <Text
              tag="p"
              field={description}
              className={cn(
                'mb-8 text-lg',
                (hasVideo || hasImage) && 'text-white/80 drop-shadow'
              )}
            />
          )}

          {ctaLink?.value?.href && (
            <SitecoreLink field={ctaLink} className="inline-block">
              <Button
                variant={hasVideo || hasImage ? 'default' : 'default'}
                size="lg"
              >
                {ctaLink.value.text || 'Learn More'}
              </Button>
            </SitecoreLink>
          )}
        </div>
      </div>

      {/* Video Play/Pause Control */}
      {hasVideo && !prefersReducedMotion && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsVideoPlaying((prev) => !prev)}
          className="absolute bottom-4 right-4 z-20 bg-white/20 text-white hover:bg-white/40"
          aria-label={isVideoPlaying ? 'Pause video' : 'Play video'}
        >
          {isVideoPlaying ? <Pause size={20} /> : <Play size={20} />}
        </Button>
      )}

      {/* Scroll Indicator */}
      {size === 'large' && (
        <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce">
          <ChevronDown
            size={32}
            className={cn(
              'opacity-60',
              (hasVideo || hasImage) ? 'text-white' : 'text-foreground'
            )}
          />
        </div>
      )}
    </section>
  );
};

/**
 * Split Hero - Content on one side, media on the other
 */
export const Split: React.FC<HeroProps> = ({ fields, params, page }) => {
  const isPageEditing = page.mode.isEditing;
  const { colorScheme = 'light', imagePosition = 'right' } = params || {};

  if (!fields) {
    return <NoDataFallback componentName="Hero (Split)" />;
  }

  const { title, subtitle, description, ctaLink, backgroundImage } = fields;

  const contentSection = (
    <div className="flex flex-col justify-center p-8 lg:p-16">
      {(title?.value || isPageEditing) && (
        <Text
          tag="h1"
          field={title}
          className="mb-4 text-4xl font-bold tracking-tight lg:text-5xl"
        />
      )}
      {(subtitle?.value || isPageEditing) && (
        <Text tag="p" field={subtitle} className="mb-4 text-xl font-medium text-muted-foreground" />
      )}
      {(description?.value || isPageEditing) && (
        <Text tag="p" field={description} className="mb-8 text-lg" />
      )}
      {ctaLink?.value?.href && (
        <div>
          <SitecoreLink field={ctaLink}>
            <Button size="lg">{ctaLink.value.text || 'Get Started'}</Button>
          </SitecoreLink>
        </div>
      )}
    </div>
  );

  const imageSection = (
    <div className="relative min-h-[400px] lg:min-h-[600px]">
      {backgroundImage?.value?.src && (
        <Image field={backgroundImage} className="h-full w-full object-cover" priority />
      )}
    </div>
  );

  return (
    <section
      className={cn(heroVariants({ colorScheme, size: 'medium' }), 'min-h-0', params?.styles)}
    >
      <div className="grid min-h-[600px] lg:grid-cols-2">
        {imagePosition === 'left' ? (
          <>
            {imageSection}
            {contentSection}
          </>
        ) : (
          <>
            {contentSection}
            {imageSection}
          </>
        )}
      </div>
    </section>
  );
};

/**
 * Minimal Hero - Simple text-focused hero
 */
export const Minimal: React.FC<HeroProps> = ({ fields, params, page }) => {
  const isPageEditing = page.mode.isEditing;
  const { colorScheme = 'light', alignment = 'center' } = params || {};

  if (!fields) {
    return <NoDataFallback componentName="Hero (Minimal)" />;
  }

  const { title, subtitle, ctaLink } = fields;

  return (
    <section
      className={cn(heroVariants({ colorScheme, size: 'small', alignment }), params?.styles)}
    >
      <div className="container mx-auto flex min-h-[400px] flex-col items-center justify-center px-4 py-16">
        {(title?.value || isPageEditing) && (
          <Text
            tag="h1"
            field={title}
            className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
          />
        )}
        {(subtitle?.value || isPageEditing) && (
          <Text tag="p" field={subtitle} className="mb-6 max-w-2xl text-lg text-muted-foreground" />
        )}
        {ctaLink?.value?.href && (
          <SitecoreLink field={ctaLink}>
            <Button size="lg">{ctaLink.value.text || 'Learn More'}</Button>
          </SitecoreLink>
        )}
      </div>
    </section>
  );
};
