'use client';

import type { LocationSearchItemProps } from './location-search.props';
import { Text } from '@sitecore-content-sdk/nextjs';

export const LocationSearchItem = ({
  dealership,
  isSelected,
  onSelect,
}: LocationSearchItemProps) => {
  return (
    <article
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
      itemScope
      itemType="https://schema.org/Place"
    >
      <div className="flex items-start justify-between">
        <div>
          {dealership?.dealershipName?.jsonValue && (
            <h3
              className="font-heading @md:text-3xl text-2xl font-normal"
              itemProp="name"
            >
              <Text
                tag="span"
                field={dealership.dealershipName.jsonValue}
              />
            </h3>
          )}
          <address className="font-heading mt-3 text-lg not-italic" itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
            <span itemProp="streetAddress">
              <Text field={dealership.dealershipAddress?.jsonValue} />
            </span>
            {dealership.dealershipCity?.jsonValue?.value && (
              <>
                {', '}
                <span itemProp="addressLocality">
                  <Text field={dealership.dealershipCity?.jsonValue} />
                </span>
              </>
            )}
            {dealership.dealershipState?.jsonValue?.value && (
              <>
                {' '}
                <span itemProp="addressRegion">
                  <Text field={dealership.dealershipState?.jsonValue} />
                </span>
              </>
            )}
            {dealership.dealershipZipCode?.jsonValue?.value && (
              <>
                {' '}
                <span itemProp="postalCode">
                  <Text field={dealership.dealershipZipCode?.jsonValue} />
                </span>
              </>
            )}
          </address>
          {dealership.latitude && dealership.longitude && (
            <div itemProp="geo" itemScope itemType="https://schema.org/GeoCoordinates" className="sr-only">
              <meta itemProp="latitude" content={dealership.latitude.toString()} />
              <meta itemProp="longitude" content={dealership.longitude.toString()} />
            </div>
          )}
        </div>
        {dealership.distance !== undefined && (
          <span className="font-heading whitespace-nowrap text-right" aria-label={`${dealership.distance.toFixed(1)} miles away`}>
            {dealership.distance.toFixed(1)}mi
          </span>
        )}
      </div>
    </article>
  );
};
