'use client';

import React from 'react';
import { Text, RichText, Image, Link as SitecoreLink } from '@sitecore-content-sdk/nextjs';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { Button } from '@/components/ui/button';
import { ContentBlockProps } from './content-block.props';

/**
 * Default Content Block - Simple text content section
 */
export const Default: React.FC<ContentBlockProps> = ({ fields, params, page }) => {
  const isPageEditing = page.mode.isEditing;
  const { colorScheme = 'light', alignment = 'left', width = 'normal' } = params || {};

  if (!fields) {
    return <NoDataFallback componentName="ContentBlock" />;
  }

  const { title, subtitle, content, ctaLink, image } = fields;

  const widthClass = {
    narrow: 'max-w-2xl',
    normal: 'max-w-4xl',
    wide: 'max-w-6xl',
    full: 'max-w-none',
  }[width] || 'max-w-4xl';

  return (
    <section
      className={cn(
        'py-12 lg:py-20',
        colorScheme === 'light' ? 'bg-background' : colorScheme === 'dark' ? 'bg-foreground text-background' : `bg-pastel-${colorScheme}`,
        params?.styles
      )}
    >
      <div className="container mx-auto px-4">
        <div
          className={cn('mx-auto', widthClass, {
            'text-left': alignment === 'left',
            'text-center': alignment === 'center',
            'text-right': alignment === 'right',
          })}
        >
          {/* Title */}
          {(title?.value || isPageEditing) && (
            <Text
              tag="h2"
              field={title}
              className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
            />
          )}

          {/* Subtitle */}
          {(subtitle?.value || isPageEditing) && (
            <Text
              tag="p"
              field={subtitle}
              className="mb-6 text-xl text-muted-foreground"
            />
          )}

          {/* Image */}
          {image?.value?.src && (
            <div className="mb-8">
              <Image
                field={image}
                className="mx-auto rounded-xl shadow-lg"
              />
            </div>
          )}

          {/* Content */}
          {(content?.value || isPageEditing) && (
            <RichText
              field={content}
              className="prose prose-lg mx-auto mb-8 max-w-none"
            />
          )}

          {/* CTA */}
          {ctaLink?.value?.href && (
            <div className={cn({ 'text-center': alignment === 'center' })}>
              <SitecoreLink field={ctaLink}>
                <Button size="lg">{ctaLink.value.text || 'Learn More'}</Button>
              </SitecoreLink>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

/**
 * Highlight Content Block - With background accent
 */
export const Highlight: React.FC<ContentBlockProps> = ({ fields, params, page }) => {
  const isPageEditing = page.mode.isEditing;
  const { colorScheme = 'pink' } = params || {};

  if (!fields) {
    return <NoDataFallback componentName="ContentBlock (Highlight)" />;
  }

  const { title, subtitle, content, ctaLink } = fields;

  const bgColor = {
    pink: 'bg-pastel-pink',
    peach: 'bg-pastel-peach',
    yellow: 'bg-pastel-yellow',
    green: 'bg-pastel-green',
  }[colorScheme] || 'bg-pastel-pink';

  return (
    <section className={cn('py-16 lg:py-24', bgColor, params?.styles)}>
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          {(title?.value || isPageEditing) && (
            <Text
              tag="h2"
              field={title}
              className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
            />
          )}

          {(subtitle?.value || isPageEditing) && (
            <Text tag="p" field={subtitle} className="mb-6 text-xl opacity-80" />
          )}

          {(content?.value || isPageEditing) && (
            <RichText field={content} className="prose prose-lg mx-auto mb-8 max-w-none" />
          )}

          {ctaLink?.value?.href && (
            <SitecoreLink field={ctaLink}>
              <Button variant="secondary" size="lg">
                {ctaLink.value.text || 'Learn More'}
              </Button>
            </SitecoreLink>
          )}
        </div>
      </div>
    </section>
  );
};

/**
 * Stats Content Block - Content with statistics
 */
export const WithStats: React.FC<ContentBlockProps> = ({ fields, params, page }) => {
  const isPageEditing = page.mode.isEditing;
  const { colorScheme = 'light' } = params || {};

  if (!fields) {
    return <NoDataFallback componentName="ContentBlock (WithStats)" />;
  }

  const { title, subtitle, content, stats } = fields;

  return (
    <section
      className={cn(
        'py-16 lg:py-24',
        colorScheme === 'light' ? 'bg-background' : 'bg-muted',
        params?.styles
      )}
    >
      <div className="container mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Content */}
          <div>
            {(title?.value || isPageEditing) && (
              <Text
                tag="h2"
                field={title}
                className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
              />
            )}

            {(subtitle?.value || isPageEditing) && (
              <Text tag="p" field={subtitle} className="mb-6 text-xl text-muted-foreground" />
            )}

            {(content?.value || isPageEditing) && (
              <RichText field={content} className="prose max-w-none text-muted-foreground" />
            )}
          </div>

          {/* Stats */}
          {stats && stats.length > 0 && (
            <div className="grid grid-cols-2 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  {stat.fields?.value?.value && (
                    <div className="mb-2 text-4xl font-bold text-pastel-pink lg:text-5xl">
                      {stat.fields.value.value}
                    </div>
                  )}
                  {stat.fields?.label?.value && (
                    <div className="text-sm text-muted-foreground">{stat.fields.label.value}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
