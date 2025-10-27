import { Placeholder, ServerPlaceholder } from '@sitecore-content-sdk/nextjs';
import { rsc } from 'rsc-env';

/**
 * Smart Placeholder that automatically uses:
 * - ServerPlaceholder in Server Components
 * - Placeholder in Client Components
 */
const AppPlaceholder = (rsc ? ServerPlaceholder : Placeholder) as typeof Placeholder;

export default AppPlaceholder;
