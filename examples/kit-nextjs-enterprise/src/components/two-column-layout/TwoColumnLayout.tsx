'use client';

import React from 'react';
import { Text, RichText, Image, Link as SitecoreLink } from '@sitecore-content-sdk/nextjs';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { Button } from '@/components/ui/button';
import { TwoColumnLayoutProps } from './two-column-layout.props';

/**
 * Default Two Column Layout - Image and content side by side
 */
export const Default: React.FC<TwoColumnLayoutProps> = ({ fields, params, page }) => {
  const isPageEditing = page.mode.isEditing;
  const {
    colorScheme = 'light',
    imagePosition = 'left',
    verticalAlignment = 'center',
  } = params || {};

  if (!fields) {
    return <NoDataFallback componentName="TwoColumnLayout" />;
  }

  const { title, subtitle, content, image, ctaLink } = fields;

  const alignmentClass = {
    top: 'items-start',
    center: 'items-center',
    bottom: 'items-end',
  }[verticalAlignment] || 'items-center';

  const imageSection = (
    <div className="relative">
      {image?.value?.src && (
        <Image field={image} className="w-full rounded-xl shadow-lg" />
      )}
    </div>
  );

  const contentSection = (
    <div className="flex flex-col justify-center">
      {(title?.value || isPageEditing) && (
        <Text
          tag="h2"
          field={title}
          className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
        />
      )}

      {(subtitle?.value || isPageEditing) && (
        <Text tag="p" field={subtitle} className="mb-4 text-xl text-muted-foreground" />
      )}

      {(content?.value || isPageEditing) && (
        <RichText field={content} className="prose mb-6 max-w-none text-muted-foreground" />
      )}

      {ctaLink?.value?.href && (
        <div>
          <SitecoreLink field={ctaLink}>
            <Button size="lg">{ctaLink.value.text || 'Learn More'}</Button>
          </SitecoreLink>
        </div>
      )}
    </div>
  );

  return (
    <section
      className={cn(
        'py-16 lg:py-24',
        colorScheme === 'light' ? 'bg-background' : 'bg-muted',
        params?.styles
      )}
    >
      <div className="container mx-auto px-4">
        <div className={cn('grid gap-12 lg:grid-cols-2', alignmentClass)}>
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
      </div>
    </section>
  );
};

/**
 * Feature List Two Column - With bullet points
 */
export const FeatureList: React.FC<TwoColumnLayoutProps> = ({ fields, params, page }) => {
  const isPageEditing = page.mode.isEditing;
  const { colorScheme = 'light', imagePosition = 'right' } = params || {};

  if (!fields) {
    return <NoDataFallback componentName="TwoColumnLayout (FeatureList)" />;
  }

  const { title, subtitle, content, image, ctaLink, features } = fields;

  const imageSection = (
    <div className="relative">
      {image?.value?.src && (
        <Image field={image} className="w-full rounded-xl shadow-lg" />
      )}
    </div>
  );

  const contentSection = (
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
        <RichText field={content} className="prose mb-6 max-w-none text-muted-foreground" />
      )}

      {/* Feature List */}
      {features && features.length > 0 && (
        <ul className="mb-8 space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-pastel-pink" />
              <span>{feature.fields?.text?.value || 'Feature'}</span>
            </li>
          ))}
        </ul>
      )}

      {ctaLink?.value?.href && (
        <SitecoreLink field={ctaLink}>
          <Button size="lg">{ctaLink.value.text || 'Get Started'}</Button>
        </SitecoreLink>
      )}
    </div>
  );

  return (
    <section
      className={cn(
        'py-16 lg:py-24',
        colorScheme === 'light' ? 'bg-background' : 'bg-muted',
        params?.styles
      )}
    >
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
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
      </div>
    </section>
  );
};

/**
 * Alternating Two Column - Multiple sections alternating image position
 */
export const Alternating: React.FC<TwoColumnLayoutProps> = ({ fields, params, page }) => {
  const isPageEditing = page.mode.isEditing;
  const { colorScheme = 'light' } = params || {};

  if (!fields) {
    return <NoDataFallback componentName="TwoColumnLayout (Alternating)" />;
  }

  const { title, subtitle, sections } = fields;

  return (
    <section
      className={cn(
        'py-16 lg:py-24',
        colorScheme === 'light' ? 'bg-background' : 'bg-muted',
        params?.styles
      )}
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        {(title?.value || subtitle?.value || isPageEditing) && (
          <div className="mx-auto mb-16 max-w-3xl text-center">
            {(title?.value || isPageEditing) && (
              <Text
                tag="h2"
                field={title}
                className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
              />
            )}
            {(subtitle?.value || isPageEditing) && (
              <Text tag="p" field={subtitle} className="text-lg text-muted-foreground" />
            )}
          </div>
        )}

        {/* Sections */}
        {sections && sections.length > 0 ? (
          <div className="space-y-24">
            {sections.map((section, index) => {
              const isEven = index % 2 === 0;
              return (
                <div
                  key={index}
                  className="grid items-center gap-12 lg:grid-cols-2"
                >
                  <div className={cn(!isEven && 'lg:order-2')}>
                    {section.fields?.image?.value?.src && (
                      <Image
                        field={section.fields.image}
                        className="w-full rounded-xl shadow-lg"
                      />
                    )}
                  </div>
                  <div className={cn(!isEven && 'lg:order-1')}>
                    {section.fields?.title?.value && (
                      <Text
                        tag="h3"
                        field={section.fields.title}
                        className="mb-4 text-2xl font-bold"
                      />
                    )}
                    {section.fields?.content?.value && (
                      <RichText
                        field={section.fields.content}
                        className="prose max-w-none text-muted-foreground"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          isPageEditing && (
            <div className="rounded-lg border-2 border-dashed border-muted p-12 text-center">
              <p className="text-muted-foreground">Add sections to display them here</p>
            </div>
          )
        )}
      </div>
    </section>
  );
};
