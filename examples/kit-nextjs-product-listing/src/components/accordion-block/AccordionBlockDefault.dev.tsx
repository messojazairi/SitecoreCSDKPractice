'use client';

import { Text, RichText } from '@sitecore-content-sdk/nextjs';
import { Accordion } from '@/components/ui/accordion';
import { EditableButton } from '@/components/button-component/ButtonComponent';
import { AccordionProps, AccordionItemProps } from './accordion-block.props';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { AccordionBlockItem } from './AccordionBlockItem.dev';
import { cn } from '@/lib/utils';
import { generateFAQPageSchema } from '@/utils/schema-org';
import { JsonLdScript } from '@/components/schema-org/JsonLdScript';
import { useMemo } from 'react';

// Helper function to extract plain text from RichTextField
const extractTextFromRichField = (field: any): string => {
  if (!field?.jsonValue?.value) return '';
  
  // Handle different possible structures
  if (typeof field.jsonValue.value === 'string') {
    return field.jsonValue.value;
  }
  
  // If it's an object with text property
  if (typeof field.jsonValue.value === 'object' && 'text' in field.jsonValue.value) {
    return String(field.jsonValue.value.text || '');
  }
  
  // Fallback: try to stringify and strip HTML
  try {
    return JSON.stringify(field.jsonValue.value).replace(/<[^>]*>/g, '').trim();
  } catch {
    return '';
  }
};

export const AccordionBlockDefault: React.FC<AccordionProps> = (props) => {
  const { fields, isPageEditing } = props;

  const { heading, description, link, children } = fields?.data?.datasource || {};
  const accordionItems = (children?.results ?? []).filter(Boolean);
  const acordionItemValues = [
    ...accordionItems.map((_, index) => `accordion-block-item-${index + 1}`),
  ];

  // Generate FAQPage schema if accordion items have question/answer structure
  const faqSchema = useMemo(() => {
    const faqs = accordionItems
      .map((item) => {
        const question = item.heading?.jsonValue?.value || '';
        const answer = extractTextFromRichField(item.description);
        return question && answer ? { question, answer } : null;
      })
      .filter((faq): faq is { question: string; answer: string } => faq !== null);

    // Only generate FAQ schema if we have at least one Q&A pair
    return faqs.length > 0 ? generateFAQPageSchema(faqs) : null;
  }, [accordionItems]);

  if (fields) {
    return (
      <>
        {/* FAQPage Schema JSON-LD */}
        {faqSchema && (
          <JsonLdScript id="accordion-faq-schema" schema={faqSchema} strategy="afterInteractive" />
        )}
        <div
        data-component="AccordionBlock"
        className={cn(
          '@container @md:py-16 @lg:py-20 border-b-2 border-t-2 py-10 [.border-b-2+&]:border-t-0',
          {
            [props.params.styles as string]: props?.params?.styles,
          }
        )}
        data-class-change
      >
        <div
          className="@xl:px-0 mx-auto grid max-w-screen-xl gap-6 px-0 [&:not(.px-6_&):not(.px-8_&):not(.px-10_&)]:px-6"
          data-component="AccordionBlockContentWrapper"
        >
          <div className="@lg:mb-0 mb-8">
            {heading?.jsonValue && (
              <Text
                tag="h2"
                className="font-heading @md:text-6xl @lg:text-7xl max-w-screen-sm text-pretty text-5xl font-light leading-[1.1] tracking-tighter antialiased"
                field={heading?.jsonValue}
              />
            )}
          </div>
          <div className="@md:grid @md:grid-cols-[4fr,6fr] @md:gap-8 @lg:gap-12 @xl:gap-16">
            <div className="@md:col-start-[2] @md:col-end-[2]">
              <Accordion
                type="multiple"
                className="@md:gap-11 grid w-full gap-8 p-0"
                value={isPageEditing ? acordionItemValues : undefined} //force open all accordion items
                onValueChange={isPageEditing ? () => {} : undefined} //prevent accordion item from closing
              >
                {accordionItems.map((child: AccordionItemProps, index: number) => (
                  <AccordionBlockItem key={index} index={index} child={child} />
                ))}
              </Accordion>
            </div>
            {(isPageEditing || description?.jsonValue?.value || link?.jsonValue?.value?.href) && (
              <div className="bg-primary @sm:flex-row @sm:text-start @md:flex-col @md:text-center @lg:flex-row @lg:text-start mt-6 flex flex-col flex-nowrap items-center gap-4 p-7 text-center">
                <Text
                  tag="p"
                  className="text-primary-foreground font-heading text-lg font-light"
                  field={description?.jsonValue}
                />
                {link?.jsonValue && (
                  <EditableButton
                    variant="secondary"
                    buttonLink={link.jsonValue}
                    isPageEditing={isPageEditing}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      </>
    );
  }

  return <NoDataFallback componentName="Accordion Block" />;
};
