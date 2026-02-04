'use client';

import type React from 'react';
import type { TestimonialProps } from './testimonial.props';
import { TestimonialDefault } from './TestimonialDefault.dev';
import { TestimonialWithButton as TestimonialWithButtonImpl } from './TestimonialWithButton.dev';

/**
 * Testimonial component - Default variant
 * Displays a testimonial with speaker information and quote
 * Also handles variant routing based on params.Variant
 * @param {TestimonialProps} props - Component props from XM Cloud datasource
 * @returns {JSX.Element} The rendered Testimonial component
 */
export const Default: React.FC<TestimonialProps> = (props) => {
  console.log('💬 Testimonial - Default Variant Called!');
  console.log('💬 Testimonial - Rendering:', props.rendering);
  console.log('💬 Testimonial - Component Name:', props.rendering?.componentName);
  console.log('💬 Testimonial - Params:', props.params);
  console.log('💬 Testimonial - Page Mode:', props.page?.mode);

  const { page, params } = props;
  const isEditing = page?.mode?.isEditing ?? false;

  // Check if a variant is specified in params
  const variant = params?.Variant || params?.variant;
  
  // Route to the appropriate variant based on params.Variant
  if (variant) {
    const variantLower = variant.toLowerCase();
    
    // Check for Testimonialwithbutton variant (case-insensitive)
    if (
      variantLower === 'testimonialwithbutton' ||
      variantLower === 'testimonial-with-button' ||
      variantLower === 'withbutton' ||
      variantLower === 'with-button'
    ) {
      console.log('💬 Testimonial - Routing to Testimonialwithbutton variant based on params.Variant');
      return <WithButton {...props} />;
    }
  }

  // Default to standard testimonial display
  return <TestimonialDefault {...props} isPageEditing={isEditing} />;
};

/**
 * Testimonial component - With Button variant
 * Displays body text on the left and a button on the right
 * @param {TestimonialProps} props - Component props from XM Cloud datasource
 * @returns {JSX.Element} The rendered Testimonial component
 */
export const WithButton: React.FC<TestimonialProps> = (props) => {
  console.log('💬 Testimonial - WithButton Variant Called!');
  console.log('💬 Testimonial - Rendering:', props.rendering);
  console.log('💬 Testimonial - Component Name:', props.rendering?.componentName);
  console.log('💬 Testimonial - Params:', props.params);
  console.log('💬 Testimonial - Variant Param:', props.params?.Variant || props.params?.variant);
  console.log('💬 Testimonial - Page Mode:', props.page?.mode);

  const { page } = props;
  const isEditing = page?.mode?.isEditing ?? false;

  return <TestimonialWithButtonImpl {...props} isPageEditing={isEditing} />;
};

/**
 * Testimonial component - Testimonialwithbutton variant (alias for WithButton)
 * Matches the variant name selected in Sitecore styling
 * Displays body text on the left and a button on the right
 * @param {TestimonialProps} props - Component props from XM Cloud datasource
 * @returns {JSX.Element} The rendered Testimonial component
 */
export const Testimonialwithbutton: React.FC<TestimonialProps> = (props) => {
  console.log('💬 Testimonial - Testimonialwithbutton Variant Called!');
  console.log('💬 Testimonial - Rendering:', props.rendering);
  console.log('💬 Testimonial - Component Name:', props.rendering?.componentName);
  console.log('💬 Testimonial - Params:', props.params);
  console.log('💬 Testimonial - Variant Param:', props.params?.Variant || props.params?.variant);
  console.log('💬 Testimonial - Page Mode:', props.page?.mode);
  
  const { page } = props;
  const isEditing = page?.mode?.isEditing ?? false;
  
  return <TestimonialWithButtonImpl {...props} isPageEditing={isEditing} />;
};

/**
 * Alternative variant name formats to handle different casing from Sitecore
 * These are aliases for the Testimonialwithbutton variant
 */
export const TestimonialWithButton: React.FC<TestimonialProps> = (props) => {
  console.log('💬 Testimonial - TestimonialWithButton Variant Called!');
  const { page } = props;
  const isEditing = page?.mode?.isEditing ?? false;
  return <TestimonialWithButtonImpl {...props} isPageEditing={isEditing} />;
};

export const testimonialwithbutton: React.FC<TestimonialProps> = (props) => {
  console.log('💬 Testimonial - testimonialwithbutton Variant Called!');
  const { page } = props;
  const isEditing = page?.mode?.isEditing ?? false;
  return <TestimonialWithButtonImpl {...props} isPageEditing={isEditing} />;
};
