'use client';

import type { LocationSearchItemProps } from './location-search.props';
import { Text } from '@sitecore-content-sdk/nextjs';
import { generatePlaceSchema } from '@/utils/schema-org';
import { JsonLdScript } from '@/components/schema-org/JsonLdScript';
import { useMemo } from 'react';

export const LocationSearchItem = ({
  dealership,
  isSelected,
  onSelect,
}: LocationSearchItemProps) => {
  // Generate Place/LocalBusiness schema
  const placeSchema = useMemo(() => {
    const dealershipName = dealership?.dealershipName?.jsonValue?.value;
    if (!dealershipName) return null;

    return generatePlaceSchema({
      name: dealershipName,
      type: 'LocalBusiness', // Using LocalBusiness for dealerships
      streetAddress: dealership.dealershipAddress?.jsonValue?.value || undefined,
      addressLocality: dealership.dealershipCity?.jsonValue?.value || undefined,
      addressRegion: dealership.dealershipState?.jsonValue?.value || undefined,
      postalCode: dealership.dealershipZipCode?.jsonValue?.value || undefined,
      latitude: dealership.latitude,
      longitude: dealership.longitude,
    });
  }, [dealership]);

  return (
    <>
      {/* Place/LocalBusiness Schema JSON-LD */}
      {placeSchema && (
        <JsonLdScript
          id={`place-schema-${dealership?.dealershipName?.jsonValue?.value?.replace(/\s+/g, '-').toLowerCase() || 'location'}`}
          schema={placeSchema}
          strategy="afterInteractive"
        />
      )}
    <div
      className={`border-1 cursor-pointer p-5 transition-colors ${
        isSelected
          ? 'bg-primary text-primary-foreground rounded-default border-primary'
          : 'bg-secondary text-secondary-foreground hover:bg-secondary/70 border-border '
      }`}
      onClick={() => onSelect(dealership)}
      onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter' ? onSelect(dealership) : null)}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      data-component="LocationSearchItem"
    >
      <div className="flex items-start justify-between">
        <div>
          {dealership?.dealershipName?.jsonValue && (
            <Text
              tag="p"
              field={dealership.dealershipName.jsonValue}
              className="font-heading @md:text-3xl text-2xl font-normal"
            />
          )}
          <p className="font-heading mt-3 text-lg">
            <Text field={dealership.dealershipAddress?.jsonValue} />
            {', '}
            <Text field={dealership.dealershipCity?.jsonValue} />{' '}
            <Text field={dealership.dealershipZipCode?.jsonValue} />
          </p>
        </div>
        {dealership.distance !== undefined && (
          <span className="font-heading whitespace-nowrap text-right">
            {dealership.distance.toFixed(1)}mi
          </span>
        )}
      </div>
    </div>
    </>
  );
};
