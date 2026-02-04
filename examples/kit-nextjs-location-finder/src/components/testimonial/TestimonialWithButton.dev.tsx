'use client';

import type React from 'react';
import { RichText, Link as ContentSdkLink } from '@sitecore-content-sdk/nextjs';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';
import type { TestimonialProps } from './testimonial.props';

/**
 * Testimonial With Button variant implementation
 * Displays body text on the left and a button on the right
 * Matches the design: light grey background, body text left (60-70% width), black pill button right (30-40% width)
 * @param {TestimonialProps} props - Component props
 * @returns {JSX.Element} The rendered component
 */
export const TestimonialWithButton: React.FC<TestimonialProps & { isPageEditing?: boolean }> = (
  props
) => {
  const { fields, isPageEditing } = props;

  // Debug logging
  console.log('💬 Testimonial With Button - Fields:', fields);
  console.log('💬 Testimonial With Button - Datasource:', fields?.data?.datasource);

  // Handle different data structures and field name variations
  const fieldsAny = fields as any;
  const datasource = fields?.data?.datasource || {};
  
  // Support both BodyText/bodytext and ButtonLink/lbutton field names (case-insensitive)
  const BodyText = 
    fieldsAny?.BodyText || 
    fieldsAny?.bodytext ||
    datasource?.BodyText || 
    datasource?.bodytext;
    
  const ButtonLink = 
    fieldsAny?.ButtonLink || 
    fieldsAny?.lbutton ||
    fieldsAny?.LButton ||
    datasource?.ButtonLink || 
    datasource?.lbutton ||
    datasource?.LButton;

  // Handle missing datasource
  if (!BodyText && !isPageEditing) {
    console.warn('💬 Testimonial With Button - No data found');
    return <NoDataFallback componentName="Testimonial With Button" />;
  }

  // Get button text and href
  const buttonField = ButtonLink?.jsonValue || ButtonLink;
  const buttonValue = buttonField?.value || buttonField;
  const buttonHref = buttonValue?.href || buttonField?.href;
  const buttonText = buttonValue?.text || buttonField?.text || 'FIND OUT MORE';

  return (
    <section
      data-component="TestimonialWithButton"
      className={cn(
        '@container/testimonial relative w-full bg-gray-50 px-4 py-12',
        '@md/testimonial:px-8 @md/testimonial:py-16',
        '@lg/testimonial:px-16 @lg/testimonial:py-20'
      )}
    >
      {/* Main Container */}
      <div className="mx-auto max-w-[1400px]">
        {/* Two-column layout: Body text left (60-70%), Button right (30-40%) */}
        <div className="flex flex-col gap-8 @md/testimonial:flex-row @md/testimonial:items-end @md/testimonial:gap-12 @lg/testimonial:gap-16">
          
          {/* Left Column - Body Text (60-70% width) */}
          <div className="flex-1 @md/testimonial:flex-[0.65]">
            {(BodyText?.value || BodyText?.jsonValue?.value || isPageEditing) && (
              <div className="text-base leading-relaxed text-gray-900 @md/testimonial:text-lg @lg/testimonial:text-lg">
                <RichText
                  field={BodyText?.jsonValue || BodyText}
                  className="font-normal"
                />
              </div>
            )}
          </div>

          {/* Right Column - Button (30-40% width) */}
          {/* Button aligned towards bottom of text block */}
          <div className="flex shrink-0 items-end @md/testimonial:flex-[0.35] @md/testimonial:justify-center">
            {(buttonHref || isPageEditing) && (
              <>
                {isPageEditing ? (
                  <ContentSdkLink
                    field={buttonField}
                    className={cn(
                      'inline-block rounded-full bg-black px-8 py-4 text-sm font-medium uppercase tracking-wide text-white',
                      'transition-colors hover:bg-gray-900',
                      '@md/testimonial:px-10 @md/testimonial:py-5',
                      'focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2'
                    )}
                  />
                ) : (
                  <Link
                    href={buttonHref}
                    className={cn(
                      'inline-block rounded-full bg-black px-8 py-4 text-sm font-medium uppercase tracking-wide text-white',
                      'transition-colors hover:bg-gray-900',
                      '@md/testimonial:px-10 @md/testimonial:py-5',
                      'focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2'
                    )}
                  >
                    {buttonText}
                  </Link>
                )}
              </>
            )}
          </div>
        </div>

        {/* Editing mode placeholder */}
        {isPageEditing && !BodyText && (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <p className="text-gray-500">
              Configure the Testimonial datasource to display content here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
