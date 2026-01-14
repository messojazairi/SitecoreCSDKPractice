'use client';

import React from 'react';
import { Text, RichText } from '@sitecore-content-sdk/nextjs';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FAQProps, FAQItem } from './faq.props';

/**
 * Default FAQ - Accordion style
 */
export const Default: React.FC<FAQProps> = ({ fields, params, page }) => {
  const isPageEditing = page.mode.isEditing;
  const { colorScheme = 'light', layout = 'centered' } = params || {};

  if (!fields) {
    return <NoDataFallback componentName="FAQ" />;
  }

  const { title, subtitle, items } = fields;

  return (
    <section
      className={cn(
        'py-16 lg:py-24',
        colorScheme === 'light' ? 'bg-background' : 'bg-muted',
        params?.styles
      )}
    >
      <div className="container mx-auto px-4">
        <div className={cn('mx-auto', layout === 'centered' ? 'max-w-3xl' : 'max-w-5xl')}>
          {/* Header */}
          <div className="mb-12 text-center">
            {(title?.value || isPageEditing) && (
              <Text
                tag="h2"
                field={title}
                className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
              />
            )}
            {(subtitle?.value || isPageEditing) && (
              <Text
                tag="p"
                field={subtitle}
                className="text-lg text-muted-foreground"
              />
            )}
          </div>

          {/* FAQ Items */}
          {items && items.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {items.map((item: FAQItem, index: number) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-lg font-medium">
                    {item.fields?.question?.value || `Question ${index + 1}`}
                  </AccordionTrigger>
                  <AccordionContent>
                    {item.fields?.answer?.value && (
                      <RichText
                        field={item.fields.answer}
                        className="text-muted-foreground"
                      />
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            isPageEditing && (
              <div className="rounded-lg border-2 border-dashed border-muted p-12 text-center">
                <p className="text-muted-foreground">Add FAQ items to display them here</p>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
};

/**
 * Two Column FAQ - Questions on left, answers expand on right
 */
export const TwoColumn: React.FC<FAQProps> = ({ fields, params, page }) => {
  const isPageEditing = page.mode.isEditing;
  const { colorScheme = 'light' } = params || {};

  if (!fields) {
    return <NoDataFallback componentName="FAQ (TwoColumn)" />;
  }

  const { title, subtitle, items } = fields;

  return (
    <section
      className={cn(
        'py-16 lg:py-24',
        colorScheme === 'light' ? 'bg-background' : 'bg-muted',
        params?.styles
      )}
    >
      <div className="container mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Left Column - Header */}
          <div className="lg:sticky lg:top-8 lg:self-start">
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

          {/* Right Column - FAQ Items */}
          <div className="lg:col-span-2">
            {items && items.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {items.map((item: FAQItem, index: number) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left text-lg font-medium">
                      {item.fields?.question?.value || `Question ${index + 1}`}
                    </AccordionTrigger>
                    <AccordionContent>
                      {item.fields?.answer?.value && (
                        <RichText
                          field={item.fields.answer}
                          className="text-muted-foreground"
                        />
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              isPageEditing && (
                <div className="rounded-lg border-2 border-dashed border-muted p-12 text-center">
                  <p className="text-muted-foreground">Add FAQ items to display them here</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * Grid FAQ - Card-based layout
 */
export const Grid: React.FC<FAQProps> = ({ fields, params, page }) => {
  const isPageEditing = page.mode.isEditing;
  const { colorScheme = 'light', columns = '2' } = params || {};

  if (!fields) {
    return <NoDataFallback componentName="FAQ (Grid)" />;
  }

  const { title, subtitle, items } = fields;

  const gridCols = columns === '3' ? 'lg:grid-cols-3' : 'lg:grid-cols-2';

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
        <div className="mx-auto mb-12 max-w-3xl text-center">
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

        {/* FAQ Grid */}
        {items && items.length > 0 ? (
          <div className={cn('grid gap-6', gridCols)}>
            {items.map((item: FAQItem, index: number) => (
              <div
                key={index}
                className="rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                {item.fields?.question?.value && (
                  <h3 className="mb-3 text-lg font-semibold">
                    {item.fields.question.value}
                  </h3>
                )}
                {item.fields?.answer?.value && (
                  <RichText
                    field={item.fields.answer}
                    className="text-sm text-muted-foreground"
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          isPageEditing && (
            <div className="rounded-lg border-2 border-dashed border-muted p-12 text-center">
              <p className="text-muted-foreground">Add FAQ items to display them here</p>
            </div>
          )
        )}
      </div>
    </section>
  );
};
