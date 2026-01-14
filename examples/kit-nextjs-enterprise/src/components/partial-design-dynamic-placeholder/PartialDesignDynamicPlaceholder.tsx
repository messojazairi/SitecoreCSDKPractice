import { AppPlaceholder, useSitecore } from '@sitecore-content-sdk/nextjs';
import componentMap from '.sitecore/component-map';
import { ComponentProps } from '@/lib/component-props';

interface PartialDesignDynamicPlaceholderProps extends ComponentProps {
  params: {
    sig?: string;
    [key: string]: string | undefined;
  };
}

/**
 * Dynamic placeholder for partial designs
 * Used by Sitecore for design library and component composition
 */
export const Default = (props: PartialDesignDynamicPlaceholderProps) => {
  const { page } = useSitecore();
  const { rendering, params } = props;
  const phName = `partial-design-${params?.sig || 'default'}`;

  return (
    <AppPlaceholder
      page={page}
      componentMap={componentMap}
      name={phName}
      rendering={rendering}
    />
  );
};
