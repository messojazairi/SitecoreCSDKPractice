import React from 'react';

interface NoDataFallbackProps {
  componentName: string;
  message?: string;
}

/**
 * Fallback component displayed when a Sitecore component has no datasource configured
 * @param componentName - Name of the component for identification
 * @param message - Optional custom message
 */
export const NoDataFallback: React.FC<NoDataFallbackProps> = ({
  componentName,
  message = 'No data source configured',
}) => {
  // Only show in development or editing mode
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="my-4 rounded-lg border-2 border-dashed border-pastel-pink bg-pastel-pink/10 p-6 text-center">
      <p className="text-sm font-medium text-foreground">
        <span className="font-bold">{componentName}</span>: {message}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Please configure a data source for this component in Sitecore.
      </p>
    </div>
  );
};

export default NoDataFallback;
