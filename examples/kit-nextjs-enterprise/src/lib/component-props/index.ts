import { ComponentParams, ComponentRendering, Page } from '@sitecore-content-sdk/nextjs';

/**
 * Base component props shared by all components
 */
export type ComponentProps = {
  rendering: ComponentRendering;
  params: ComponentParams;
  page: Page;
};

/**
 * Component props with context - use with useSitecore hook
 */
export type ComponentWithContextProps = ComponentProps & {
  page: Page;
};
