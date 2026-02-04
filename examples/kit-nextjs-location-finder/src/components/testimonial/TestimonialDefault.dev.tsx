'use client';

import type React from 'react';
import { Text, RichText, Image } from '@sitecore-content-sdk/nextjs';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';
import type { TestimonialProps } from './testimonial.props';

/**
 * Testimonial Default variant implementation
 * Displays a two-column layout with speaker info and testimonial quote
 * Based on Figma design: https://www.figma.com/design/TM3hdPWQNOMHfhrDTaGs5h/_Nexusblack.com--v0-?node-id=2005-144&m=dev
 * @param {TestimonialProps} props - Component props
 * @returns {JSX.Element} The rendered component
 */
export const TestimonialDefault: React.FC<TestimonialProps & { isPageEditing?: boolean }> = (
  props
) => {
  const { fields, isPageEditing } = props;

  // Debug logging
  console.log('💬 Testimonial - Fields:', fields);
  console.log('💬 Testimonial - Datasource:', fields?.data?.datasource);

  // Handle different data structures
  // Data can come in two ways:
  // 1. Direct from fields (fields.SpeakerName.value)
  // 2. From datasource (fields.data.datasource.SpeakerName.jsonValue)
  const fieldsAny = fields as any;
  
  // Get fields from either direct or datasource structure
  const SpeakerImage = fieldsAny?.SpeakerImage || fields?.data?.datasource?.SpeakerImage;
  const SpeakerName = fieldsAny?.SpeakerName || fields?.data?.datasource?.SpeakerName;
  const BodyText = fieldsAny?.BodyText || fields?.data?.datasource?.BodyText;
  const speakerPostion = fieldsAny?.speakerPostion || fields?.data?.datasource?.speakerPostion;
  const CompanyName = fieldsAny?.CompanyName || fields?.data?.datasource?.CompanyName;

  // Handle missing datasource
  if (!SpeakerImage && !SpeakerName && !BodyText && !isPageEditing) {
    console.warn('💬 Testimonial - No data found');
    return <NoDataFallback componentName="Testimonial" />;
  }

  return (
    <section
      data-component="Testimonial"
      className={cn(
        '@container/testimonial relative w-full bg-white px-4 py-12',
        '@md/testimonial:px-8 @lg/testimonial:px-16 @lg/testimonial:py-20'
      )}
    >
      {/* Main Container */}
      <div className="mx-auto max-w-[1400px]">
        {/* Two-column layout matching Figma design */}
        <div className="flex flex-col gap-8 @md/testimonial:flex-row @md/testimonial:items-start @md/testimonial:gap-16 @lg/testimonial:gap-24">
          
          {/* Left Column - Speaker Information */}
          <div className="flex shrink-0 flex-col gap-3 @md/testimonial:w-[180px] @lg/testimonial:w-[200px]">
            {/* Speaker Image - Small Square */}
            {(SpeakerImage?.value?.src || SpeakerImage?.jsonValue?.value?.src || isPageEditing) && (
              <div className="relative h-[48px] w-[48px] overflow-hidden rounded-[4px]">
                <Image
                  field={SpeakerImage?.jsonValue || SpeakerImage}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            
            {/* Speaker Name */}
            {(SpeakerName?.value || SpeakerName?.jsonValue?.value || isPageEditing) && (
              <Text
                field={SpeakerName?.jsonValue || SpeakerName}
                tag="p"
                className="m-0 text-[16px] font-normal leading-[1.2] tracking-[-0.02em] text-[#000000]"
              />
            )}
            
            {/* Position and Company - Combined on one line */}
            {((speakerPostion?.value || speakerPostion?.jsonValue?.value) && 
              (CompanyName?.value || CompanyName?.jsonValue?.value)) || isPageEditing ? (
              <p className="m-0 text-[14px] font-normal leading-[1.2] tracking-[-0.02em] text-[#666666]">
                {(speakerPostion?.value || speakerPostion?.jsonValue?.value) && (
                  <Text
                    field={speakerPostion?.jsonValue || speakerPostion}
                    tag="span"
                    className="inline"
                  />
                )}
                {(speakerPostion?.value || speakerPostion?.jsonValue?.value) && 
                 (CompanyName?.value || CompanyName?.jsonValue?.value) && (
                  <span className="inline">, </span>
                )}
                {(CompanyName?.value || CompanyName?.jsonValue?.value) && (
                  <Text
                    field={CompanyName?.jsonValue || CompanyName}
                    tag="span"
                    className="inline"
                  />
                )}
              </p>
            ) : null}
          </div>

          {/* Right Column - Testimonial Body Text */}
          <div className="flex-1">
            {(BodyText?.value || BodyText?.jsonValue?.value || isPageEditing) && (
              <div className="text-[28px] leading-[1.4] tracking-[-0.02em] text-[#000000] @lg/testimonial:text-[32px] @lg/testimonial:leading-[1.35]">
                <RichText
                  field={BodyText?.jsonValue || BodyText}
                  className="font-normal"
                />
              </div>
            )}
          </div>
        </div>

        {/* Editing mode placeholder */}
        {isPageEditing && !SpeakerImage && !SpeakerName && !BodyText && (
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
