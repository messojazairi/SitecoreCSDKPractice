/**
 * Dictionary keys for internationalization
 * These keys correspond to entries in the Sitecore dictionary
 */
export const dictionaryKeys = {
  // Common
  COMMON_ReadMore: 'Read More',
  COMMON_LearnMore: 'Learn More',
  COMMON_Submit: 'Submit',
  COMMON_Loading: 'Loading...',
  COMMON_Error: 'Error',
  COMMON_Success: 'Success',

  // Hero
  HERO_DefaultTitle: 'Welcome to Enterprise',
  HERO_DefaultSubtitle: 'Your success starts here',

  // Contact Form
  CONTACT_NameLabel: 'Name',
  CONTACT_EmailLabel: 'Email',
  CONTACT_MessageLabel: 'Message',
  CONTACT_SubmitButton: 'Send Message',
  CONTACT_SuccessMessage: 'Thank you! We will be in touch soon.',
  CONTACT_ErrorMessage: 'Something went wrong. Please try again.',

  // FAQ
  FAQ_DefaultTitle: 'Frequently Asked Questions',

  // Pricing
  PRICING_DefaultTitle: 'Choose Your Plan',
  PRICING_Monthly: 'Monthly',
  PRICING_Yearly: 'Yearly',
  PRICING_Popular: 'Most Popular',
  PRICING_GetStarted: 'Get Started',

  // Products
  PRODUCTS_DefaultTitle: 'Our Products',
  PRODUCTS_ViewDetails: 'View Details',
} as const;

export type DictionaryKey = keyof typeof dictionaryKeys;
