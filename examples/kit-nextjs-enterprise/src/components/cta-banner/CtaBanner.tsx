'use client';

import React from 'react';
import { Text, Link as SitecoreLink } from '@sitecore-content-sdk/nextjs';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { Button } from '@/components/ui/button';
import { CtaBannerProps } from './cta-banner.props';
import { ArrowRight } from 'lucide-react';

/**
 * Default CTA Banner - Full-width call to action
 */
export const Default: React.FC<CtaBannerProps> = ({ fields, params, page }) => {
  const isPageEditing = page.mode.isEditing;
  const { colorScheme = 'pink', alignment = 'center' } = params || {};

  if (!fields) {
    return <NoDataFallback componentName="CtaBanner" />;
  }

  const { title, subtitle, primaryCta, secondaryCta } = fields;

  const bgColor = {
    pink: 'bg-pastel-pink',
    peach: 'bg-pastel-peach',
    yellow: 'bg-pastel-yellow',
    green: 'bg-pastel-green',
    dark: 'bg-foreground text-background',
  }[colorScheme] || 'bg-pastel-pink';

  return (
    <section className={cn('py-16 lg:py-24', bgColor, params?.styles)}>
      <div className="container mx-auto px-4">
        <div
          className={cn('mx-auto max-w-4xl', {
            'text-left': alignment === 'left',
            'text-center': alignment === 'center',
            'text-right': alignment === 'right',
          })}
        >
          {(title?.value || isPageEditing) && (
            <Text
              tag="h2"
              field={title}
              className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
            />
          )}

          {(subtitle?.value || isPageEditing) && (
            <Text tag="p" field={subtitle} className="mb-8 text-lg opacity-80 lg:text-xl" />
          )}

          <div
            className={cn('flex flex-wrap gap-4', {
              'justify-start': alignment === 'left',
              'justify-center': alignment === 'center',
              'justify-end': alignment === 'right',
            })}
          >
            {primaryCta?.value?.href && (
              <SitecoreLink field={primaryCta}>
                <Button
                  variant={colorScheme === 'dark' ? 'default' : 'secondary'}
                  size="lg"
                >
                  {primaryCta.value.text || 'Get Started'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </SitecoreLink>
            )}

            {secondaryCta?.value?.href && (
              <SitecoreLink field={secondaryCta}>
                <Button
                  variant={colorScheme === 'dark' ? 'outline' : 'ghost'}
                  size="lg"
                  className={colorScheme === 'dark' ? 'border-background text-background hover:bg-background hover:text-foreground' : ''}
                >
                  {secondaryCta.value.text || 'Learn More'}
                </Button>
              </SitecoreLink>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * Inline CTA Banner - Compact single-line banner
 */
export const Inline: React.FC<CtaBannerProps> = ({ fields, params, page }) => {
  const isPageEditing = page.mode.isEditing;
  const { colorScheme = 'pink' } = params || {};

  if (!fields) {
    return <NoDataFallback componentName="CtaBanner (Inline)" />;
  }

  const { title, primaryCta } = fields;

  const bgColor = {
    pink: 'bg-pastel-pink',
    peach: 'bg-pastel-peach',
    yellow: 'bg-pastel-yellow',
    green: 'bg-pastel-green',
  }[colorScheme] || 'bg-pastel-pink';

  return (
    <section className={cn('py-4', bgColor, params?.styles)}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {(title?.value || isPageEditing) && (
            <Text tag="p" field={title} className="font-medium" />
          )}

          {primaryCta?.value?.href && (
            <SitecoreLink field={primaryCta}>
              <Button variant="secondary" size="sm">
                {primaryCta.value.text || 'Learn More'}
                <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            </SitecoreLink>
          )}
        </div>
      </div>
    </section>
  );
};

/**
 * Card CTA Banner - Elevated card style
 */
export const Card: React.FC<CtaBannerProps> = ({ fields, params, page }) => {
  const isPageEditing = page.mode.isEditing;
  const { colorScheme = 'light' } = params || {};

  if (!fields) {
    return <NoDataFallback componentName="CtaBanner (Card)" />;
  }

  const { title, subtitle, primaryCta, secondaryCta } = fields;

  return (
    <section
      className={cn(
        'py-16 lg:py-24',
        colorScheme === 'light' ? 'bg-background' : 'bg-muted',
        params?.styles
      )}
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl bg-gradient-to-r from-pastel-pink via-pastel-peach to-pastel-yellow p-8 shadow-xl lg:p-12">
          <div className="text-center">
            {(title?.value || isPageEditing) && (
              <Text
                tag="h2"
                field={title}
                className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl"
              />
            )}

            {(subtitle?.value || isPageEditing) && (
              <Text tag="p" field={subtitle} className="mb-8 text-lg opacity-80" />
            )}

            <div className="flex flex-wrap justify-center gap-4">
              {primaryCta?.value?.href && (
                <SitecoreLink field={primaryCta}>
                  <Button variant="secondary" size="lg">
                    {primaryCta.value.text || 'Get Started'}
                  </Button>
                </SitecoreLink>
              )}

              {secondaryCta?.value?.href && (
                <SitecoreLink field={secondaryCta}>
                  <Button variant="outline" size="lg" className="bg-white/50">
                    {secondaryCta.value.text || 'Learn More'}
                  </Button>
                </SitecoreLink>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
