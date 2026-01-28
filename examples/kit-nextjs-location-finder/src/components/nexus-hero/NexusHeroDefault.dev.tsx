'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Text, RichText } from '@sitecore-content-sdk/nextjs';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { Default as ImageWrapper } from '@/components/image/ImageWrapper.dev';
import { Default as AnimatedSection } from '@/components/animated-section/AnimatedSection.dev';
import { NexusHeroProps } from './nexus-hero.props';

export const NexusHeroDefault: React.FC<NexusHeroProps> = (props) => {
  const { fields, isPageEditing } = props;
  const heading = fields?.Heading;
  const description = fields?.Description;
  const backgroundImage = fields?.['Background Image'];
  const navigationLink = fields?.['Navigation Link'];

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  if (!fields) {
    return <NoDataFallback componentName="Nexus Hero" />;
  }

  const hasPagesPositionStyles: boolean = props?.params?.styles
    ? props?.params?.styles.includes('position-')
    : false;

  return (
    <section
      data-component="NexusHero"
      className="@container/nexushero relative w-full overflow-hidden bg-black text-white"
    >
      {/* Main Container */}
      <div
        data-class-change
        className={cn(
          'relative mx-auto max-w-screen-2xl px-6 py-8 @md/nexushero:px-12 @lg/nexushero:px-16 @lg/nexushero:py-12',
          {
            'position-left': !hasPagesPositionStyles,
            [props?.params?.styles as string]: props?.params?.styles,
          }
        )}
      >
        {/* Hero Image with Blur Effect */}
        <div className="relative mb-0">
          {/* Image Container - Centered */}
          <AnimatedSection
            direction="up"
            distanceInRem={4}
            isPageEditing={isPageEditing}
            reducedMotion={prefersReducedMotion}
            className="relative z-10 mx-auto max-w-3xl @lg/nexushero:max-w-4xl"
          >
            <div className="relative">
              {/* Blur/Glow Effect Behind Image */}
              <div
                className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-[80%] h-32 rounded-full opacity-60 blur-3xl"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(180, 120, 80, 0.6) 0%, rgba(200, 150, 100, 0.5) 50%, rgba(180, 120, 80, 0.6) 100%)',
                }}
              />
              {/* Image */}
              <div className="relative overflow-hidden rounded-lg">
                <ImageWrapper
                  image={backgroundImage}
                  wrapperClass="relative w-full aspect-[16/9]"
                  className="h-full w-full object-cover"
                  priority={true}
                  page={props.page}
                />
              </div>
            </div>
          </AnimatedSection>
        </div>

        {/* Content Grid - Overlapping with Image Area */}
        <div className="@container/content relative z-20 mt-8 @lg/nexushero:mt-12">
          <div className="grid gap-6 @md/content:grid-cols-[1fr_1fr] @lg/content:grid-cols-[1.2fr_1fr] @lg/content:gap-12 items-start">
            {/* Left Column - Heading */}
            <AnimatedSection
              direction="left"
              distanceInRem={5}
              delay={200}
              isPageEditing={isPageEditing}
              reducedMotion={prefersReducedMotion}
              className="@lg/content:pr-8"
            >
              {(heading?.value || isPageEditing) && (
                <Text
                  tag="h1"
                  field={heading}
                  className="font-heading text-balance text-2xl font-normal leading-[1.2] tracking-tight @sm/content:text-3xl @md/content:text-4xl @lg/content:text-[2.75rem]"
                />
              )}
            </AnimatedSection>

            {/* Right Column - Description & Navigation Links */}
            <div className="space-y-6 @lg/content:space-y-8">
              {/* Description */}
              <AnimatedSection
                direction="right"
                distanceInRem={5}
                delay={300}
                isPageEditing={isPageEditing}
                reducedMotion={prefersReducedMotion}
              >
                {(description?.value || isPageEditing) && (
                  <div className="text-pretty text-sm leading-relaxed text-gray-300 @md/content:text-base @lg/content:text-[0.95rem]">
                    <RichText field={description} />
                  </div>
                )}
              </AnimatedSection>

              {/* Navigation Links */}
              {navigationLink && navigationLink.length > 0 && (
                <AnimatedSection
                  direction="up"
                  delay={400}
                  isPageEditing={isPageEditing}
                  reducedMotion={prefersReducedMotion}
                >
                  <nav className="flex flex-col gap-3 pt-2" aria-label="Quick navigation">
                    {navigationLink.map((link, index) => (
                      <div key={link.id} className="flex items-baseline gap-3">
                        <span className="text-gray-500 text-xs font-light tabular-nums">
                          {index + 1}.
                        </span>
                        <a
                          href={`#${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                          className="text-white hover:text-gray-300 transition-colors duration-200 text-sm font-light"
                        >
                          {link.displayName}
                        </a>
                      </div>
                    ))}
                  </nav>
                </AnimatedSection>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
