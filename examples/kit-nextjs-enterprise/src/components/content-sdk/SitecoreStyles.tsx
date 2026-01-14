import { LayoutServiceData } from '@sitecore-content-sdk/nextjs';

interface SitecoreStylesProps {
  layoutData: LayoutServiceData;
}

/**
 * Renders Sitecore-specific styles from layout data
 */
export default function SitecoreStyles({ layoutData }: SitecoreStylesProps): JSX.Element | null {
  const styles = layoutData?.sitecore?.context?.clientScripts;

  if (!styles) {
    return null;
  }

  return (
    <>
      {styles.map((style: string, index: number) => (
        <link key={index} rel="stylesheet" href={style} />
      ))}
    </>
  );
}
