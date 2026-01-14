'use client';

import React, { useState } from 'react';
import { Text, RichText, Link as SitecoreLink } from '@sitecore-content-sdk/nextjs';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X } from 'lucide-react';
import { PricingTableProps, PricingPlan, PlanFeature } from './pricing-table.props';

/**
 * Default Pricing Table - Card-based layout
 */
export const Default: React.FC<PricingTableProps> = ({ fields, params, page }) => {
  const isPageEditing = page.mode.isEditing;
  const { colorScheme = 'light', showBillingToggle = 'true' } = params || {};
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  if (!fields) {
    return <NoDataFallback componentName="PricingTable" />;
  }

  const { title, subtitle, plans, monthlyLabel, yearlyLabel } = fields;

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

          {/* Billing Toggle */}
          {showBillingToggle === 'true' && (
            <div className="mt-8 flex justify-center">
              <Tabs
                value={billingPeriod}
                onValueChange={(value) => setBillingPeriod(value as 'monthly' | 'yearly')}
              >
                <TabsList>
                  <TabsTrigger value="monthly">
                    {monthlyLabel?.value || 'Monthly'}
                  </TabsTrigger>
                  <TabsTrigger value="yearly">
                    {yearlyLabel?.value || 'Yearly'}
                    <Badge variant="accent" className="ml-2">
                      Save 20%
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        {plans && plans.length > 0 ? (
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
            {plans.map((plan: PricingPlan, index: number) => (
              <PricingCard
                key={index}
                plan={plan}
                billingPeriod={billingPeriod}
                isPageEditing={isPageEditing}
              />
            ))}
          </div>
        ) : (
          isPageEditing && (
            <div className="rounded-lg border-2 border-dashed border-muted p-12 text-center">
              <p className="text-muted-foreground">Add pricing plans to display them here</p>
            </div>
          )
        )}
      </div>
    </section>
  );
};

/**
 * Pricing Card Component
 */
interface PricingCardProps {
  plan: PricingPlan;
  billingPeriod: 'monthly' | 'yearly';
  isPageEditing: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({ plan, billingPeriod, isPageEditing }) => {
  const { fields } = plan;

  if (!fields) return null;

  const isHighlighted = fields.isHighlighted?.value === true || fields.isHighlighted?.value === 'true';
  const price = billingPeriod === 'yearly' ? fields.yearlyPrice : fields.monthlyPrice;

  return (
    <Card
      className={cn(
        'relative flex flex-col',
        isHighlighted && 'border-2 border-pastel-pink shadow-lg'
      )}
    >
      {/* Highlighted Badge */}
      {isHighlighted && fields.highlightLabel?.value && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
          {fields.highlightLabel.value}
        </Badge>
      )}

      <CardHeader className="text-center">
        {(fields.name?.value || isPageEditing) && (
          <CardTitle className="text-xl">
            <Text field={fields.name} />
          </CardTitle>
        )}
        {(fields.description?.value || isPageEditing) && (
          <CardDescription>
            <Text field={fields.description} />
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex-1">
        {/* Price */}
        <div className="mb-6 text-center">
          {price?.value && (
            <>
              <span className="text-4xl font-bold">{price.value}</span>
              <span className="text-muted-foreground">
                /{billingPeriod === 'yearly' ? 'year' : 'month'}
              </span>
            </>
          )}
        </div>

        {/* Features */}
        {fields.features && fields.features.length > 0 && (
          <ul className="space-y-3">
            {fields.features.map((feature: PlanFeature, index: number) => (
              <li key={index} className="flex items-start gap-3">
                {feature.fields?.included?.value ? (
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-pastel-green" />
                ) : (
                  <X className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                )}
                <span
                  className={cn(
                    'text-sm',
                    !feature.fields?.included?.value && 'text-muted-foreground line-through'
                  )}
                >
                  {feature.fields?.text?.value || 'Feature'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <CardFooter>
        {fields.ctaLink?.value?.href ? (
          <SitecoreLink field={fields.ctaLink} className="w-full">
            <Button
              variant={isHighlighted ? 'default' : 'outline'}
              size="lg"
              className="w-full"
            >
              {fields.ctaLink.value.text || 'Get Started'}
            </Button>
          </SitecoreLink>
        ) : (
          <Button
            variant={isHighlighted ? 'default' : 'outline'}
            size="lg"
            className="w-full"
          >
            {fields.ctaText?.value || 'Get Started'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

/**
 * Comparison Pricing Table - Table-style comparison
 */
export const Comparison: React.FC<PricingTableProps> = ({ fields, params, page }) => {
  const isPageEditing = page.mode.isEditing;
  const { colorScheme = 'light' } = params || {};

  if (!fields) {
    return <NoDataFallback componentName="PricingTable (Comparison)" />;
  }

  const { title, subtitle, plans } = fields;

  // Get all unique features across all plans
  const allFeatures = new Set<string>();
  plans?.forEach((plan) => {
    plan.fields?.features?.forEach((feature) => {
      if (feature.fields?.text?.value) {
        allFeatures.add(feature.fields.text.value);
      }
    });
  });

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

        {/* Comparison Table */}
        {plans && plans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse">
              <thead>
                <tr>
                  <th className="p-4 text-left font-medium">Features</th>
                  {plans.map((plan, index) => (
                    <th key={index} className="p-4 text-center">
                      <div className="font-bold">{plan.fields?.name?.value || `Plan ${index + 1}`}</div>
                      <div className="text-2xl font-bold text-pastel-pink">
                        {plan.fields?.monthlyPrice?.value}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from(allFeatures).map((featureName, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-muted/50' : ''}>
                    <td className="p-4 font-medium">{featureName}</td>
                    {plans.map((plan, colIndex) => {
                      const hasFeature = plan.fields?.features?.some(
                        (f) => f.fields?.text?.value === featureName && f.fields?.included?.value
                      );
                      return (
                        <td key={colIndex} className="p-4 text-center">
                          {hasFeature ? (
                            <Check className="mx-auto h-5 w-5 text-pastel-green" />
                          ) : (
                            <X className="mx-auto h-5 w-5 text-muted-foreground" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="p-4"></td>
                  {plans.map((plan, index) => (
                    <td key={index} className="p-4 text-center">
                      {plan.fields?.ctaLink?.value?.href ? (
                        <SitecoreLink field={plan.fields.ctaLink}>
                          <Button variant={index === 1 ? 'default' : 'outline'}>
                            {plan.fields.ctaLink.value.text || 'Get Started'}
                          </Button>
                        </SitecoreLink>
                      ) : (
                        <Button variant={index === 1 ? 'default' : 'outline'}>Get Started</Button>
                      )}
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          isPageEditing && (
            <div className="rounded-lg border-2 border-dashed border-muted p-12 text-center">
              <p className="text-muted-foreground">Add pricing plans to display comparison</p>
            </div>
          )
        )}
      </div>
    </section>
  );
};
