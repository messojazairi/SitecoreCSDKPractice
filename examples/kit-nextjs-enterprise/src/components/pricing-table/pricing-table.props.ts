import { Field, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

/**
 * Plan feature item
 */
export interface PlanFeatureFields {
  text?: Field<string>;
  included?: Field<boolean | string>;
}

export interface PlanFeature {
  fields: PlanFeatureFields;
  id?: string;
}

/**
 * Pricing plan fields
 */
export interface PricingPlanFields {
  name?: Field<string>;
  description?: Field<string>;
  monthlyPrice?: Field<string>;
  yearlyPrice?: Field<string>;
  features?: PlanFeature[];
  ctaLink?: LinkField;
  ctaText?: Field<string>;
  isHighlighted?: Field<boolean | string>;
  highlightLabel?: Field<string>;
}

/**
 * Pricing plan from Sitecore
 */
export interface PricingPlan {
  fields: PricingPlanFields;
  id?: string;
  name?: string;
}

/**
 * PricingTable component parameters
 */
export interface PricingTableParams {
  colorScheme?: 'light' | 'dark';
  showBillingToggle?: 'true' | 'false';
  styles?: string;
  [key: string]: string | undefined;
}

/**
 * PricingTable component fields from Sitecore datasource
 */
export interface PricingTableFields {
  title?: Field<string>;
  subtitle?: Field<string>;
  monthlyLabel?: Field<string>;
  yearlyLabel?: Field<string>;
  plans?: PricingPlan[];
}

/**
 * PricingTable component props
 */
export interface PricingTableProps extends ComponentProps {
  params: PricingTableParams;
  fields: PricingTableFields;
}
