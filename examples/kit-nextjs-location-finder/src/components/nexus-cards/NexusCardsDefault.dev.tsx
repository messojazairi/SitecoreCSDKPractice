'use client';

import type React from 'react';
import { Text, RichText, Image } from '@sitecore-content-sdk/nextjs';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';
import type { NexusCardsProps, NexusCardItem } from './nexus-cards.props';

/**
 * Individual card component matching Figma design
 */
const NexusCard: React.FC<{ card: NexusCardItem; isPageEditing?: boolean }> = ({
  card,
  isPageEditing,
}) => {
  const { Title, Description, CardNumber, CardImage } = card;

  // Parse description to separate gray and black text
  const descriptionValue = Description?.jsonValue?.value || '';
  const descriptionParts = descriptionValue.split('\n').filter(Boolean);
  const grayText = descriptionParts[0] || '';
  const blackText = descriptionParts[1] || '';

  return (
    <div className="flex flex-col gap-3 rounded-[6px] bg-[#f9f9f9] p-5 min-h-[520px]">
      {/* Card Header - Number and Title */}
      <div className="flex items-start justify-between shrink-0">
        <div className="flex flex-col gap-0 text-[15px] leading-[1.3] tracking-[-0.15px]">
          {/* Card Number */}
          {(CardNumber?.jsonValue?.value || isPageEditing) && (
            <span className="font-medium text-[rgba(17,17,17,0.5)]">
              <Text field={CardNumber?.jsonValue} />
            </span>
          )}
          {/* Title */}
          {(Title?.jsonValue?.value || isPageEditing) && (
            <h3 className="font-medium text-[#111]">
              <Text field={Title?.jsonValue} />
            </h3>
          )}
        </div>
      </div>

      {/* Card Image or Placeholder */}
      <div className={cn('flex-1 min-h-[280px] rounded-[4px] overflow-hidden', !CardImage?.jsonValue?.value?.src && 'bg-black')}>
        {CardImage?.jsonValue?.value?.src && (
          <Image
            field={CardImage?.jsonValue}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      {/* Card Description */}
      {((grayText || blackText) || isPageEditing) && (
        <div className="text-[17px] leading-[1.3] tracking-[-0.17px] whitespace-pre-wrap shrink-0">
          {grayText && (
            <p className="mb-0 text-[rgba(17,17,17,0.5)]">{grayText}</p>
          )}
          {blackText && (
            <p className="mb-0 text-[#111]">{blackText}</p>
          )}
          {!grayText && !blackText && isPageEditing && (
            <div className="text-[rgba(17,17,17,0.5)]">
              <RichText field={Description?.jsonValue} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Transform card item fields from { value: "..." } to { jsonValue: { value: "..." } } structure
 * This handles cases where data comes directly from GraphQL without the jsonValue wrapper
 */
const transformCardFields = (card: any): NexusCardItem => {
  // If card already has proper structure, return as-is
  if (card.Title?.jsonValue || card.Tagline?.jsonValue) {
    return card;
  }

  // Transform fields from { value: "..." } to { jsonValue: { value: "..." } }
  const transformedCard: NexusCardItem = {
    id: card.id || '',
    name: card.name || '',
    displayName: card.displayName || '',
  };

  // Transform each field if it exists
  if (card.fields) {
    if (card.fields.Title?.value !== undefined) {
      transformedCard.Title = {
        jsonValue: { value: card.fields.Title.value } as any,
      };
    }
    if (card.fields.Tagline?.value !== undefined) {
      transformedCard.Tagline = {
        jsonValue: { value: card.fields.Tagline.value } as any,
      };
    }
    if (card.fields.Description?.value !== undefined) {
      transformedCard.Description = {
        jsonValue: { value: card.fields.Description.value } as any,
      };
    }
    if (card.fields.CardNumber?.value !== undefined) {
      transformedCard.CardNumber = {
        jsonValue: { value: card.fields.CardNumber.value } as any,
      };
    }
    if (card.fields.CardImage?.value) {
      transformedCard.CardImage = {
        jsonValue: card.fields.CardImage.value as any,
      };
    }
    if (card.fields.CardLink?.value) {
      transformedCard.CardLink = {
        jsonValue: card.fields.CardLink.value as any,
      };
    }
  }

  return transformedCard;
};

/**
 * NexusCards Default variant implementation
 * Displays cards in a responsive grid layout
 * @param {NexusCardsProps} props - Component props
 * @returns {JSX.Element} The rendered component
 */
export const NexusCardsDefault: React.FC<NexusCardsProps & { isPageEditing?: boolean }> = (
  props
) => {
  const { fields, isPageEditing } = props;

  // Debug logging
  console.log('🃏 NexusCards - Fields:', fields);
  console.log('🃏 NexusCards - Datasource:', fields?.data?.datasource);
  console.log('🃏 NexusCards - Children:', fields?.data?.datasource?.children);

  const fieldsAny = fields as any;

  // Get cards from various possible locations:
  // 1. fields.NexusCards (direct array from GraphQL)
  // 2. fields.data.datasource.children.results (standard multilist structure)
  // 3. fields.data.datasource.NexusCards (alternative datasource structure)
  let rawCards: any[] = [];

  if (Array.isArray(fieldsAny?.NexusCards)) {
    // Data coming directly as fields.NexusCards array
    rawCards = fieldsAny.NexusCards;
  } else if (fields?.data?.datasource?.children?.results) {
    // Standard multilist structure
    rawCards = fields.data.datasource.children.results;
  } else if (fieldsAny?.data?.datasource?.NexusCards) {
    // Alternative datasource structure
    rawCards = Array.isArray(fieldsAny.data.datasource.NexusCards)
      ? fieldsAny.data.datasource.NexusCards
      : [];
  }

  // Transform cards to ensure proper field structure
  const cards = rawCards.map(transformCardFields);

  console.log('🃏 NexusCards - Raw cards found:', rawCards.length);
  console.log('🃏 NexusCards - Transformed cards:', cards.length, cards);

  // Handle missing datasource - only show fallback if no cards found and not editing
  if (cards.length === 0 && !isPageEditing && !fields?.data?.datasource && !fieldsAny?.NexusCards) {
    console.warn('🃏 NexusCards - No datasource or cards found');
    return <NoDataFallback componentName="NexusCards" />;
  }

  // Show message if no cards and not in editing mode
  if (cards.length === 0 && !isPageEditing) {
    return (
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-center text-gray-500">No cards to display.</p>
        </div>
      </section>
    );
  }

  return (
    <section className={cn('bg-white py-8')}>
      <div className="mx-auto w-full px-0">
        {/* Cards Grid - 2x2 Layout matching Figma */}
        <div className="flex flex-col gap-2">
          {/* Render cards in rows of 2 */}
          {Array.from({ length: Math.ceil(cards.length / 2) }).map((_, rowIndex) => (
            <div key={`row-${rowIndex}`} className="flex gap-2">
              {cards.slice(rowIndex * 2, rowIndex * 2 + 2).map((card) => (
                <div key={card.id} className="flex-1 min-w-0">
                  <NexusCard card={card} isPageEditing={isPageEditing} />
                </div>
              ))}
              {/* Add spacer if odd number of cards in last row */}
              {cards.length % 2 !== 0 && rowIndex === Math.floor(cards.length / 2) && (
                <div className="flex-1 min-w-0" />
              )}
            </div>
          ))}
        </div>

        {/* Editing mode placeholder */}
        {isPageEditing && cards.length === 0 && (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <p className="text-gray-500">
              Add NexusCard items to the datasource to display cards here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
