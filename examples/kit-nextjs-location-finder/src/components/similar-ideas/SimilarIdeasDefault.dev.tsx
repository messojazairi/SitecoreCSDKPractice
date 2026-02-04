'use client';

import type React from 'react';
import { Text, Image, Link } from '@sitecore-content-sdk/nextjs';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';
import type { SimilarIdeasProps, IdeaItem } from './similar-ideas.props';

/**
 * Format date to "Month Day" format (e.g., "April 22nd")
 * @param {string} dateString - ISO date string or date value
 * @returns {string} Formatted date string
 */
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const day = date.getDate();
    
    // Add ordinal suffix (st, nd, rd, th)
    const getOrdinalSuffix = (d: number): string => {
      if (d > 3 && d < 21) return 'th';
      switch (d % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };

    return `${month} ${day}${getOrdinalSuffix(day)}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Individual idea card component matching Figma design
 * Displays image on left, text content on right with title, author, category, and date
 */
const IdeaCard: React.FC<{ idea: IdeaItem; isPageEditing?: boolean }> = ({
  idea,
  isPageEditing,
}) => {
  const { IdeaImage, IdeaTitle, IdeaAuthor, IdeaCategory, IdeaDate, IdeaLink } = idea;

  const titleValue = IdeaTitle?.jsonValue?.value || '';
  const authorValue = IdeaAuthor?.jsonValue?.value || '';
  const categoryValue = IdeaCategory?.jsonValue?.value || '';
  const dateValue = IdeaDate?.jsonValue?.value || '';
  const formattedDate = formatDate(dateValue);

  // Build metadata line: Author | Category | Date
  const metadataParts = [authorValue, categoryValue, formattedDate].filter(Boolean);
  const metadataText = metadataParts.join(' • ');

  // Check for image - ImageField structure has src directly in jsonValue, not in jsonValue.value
  const imageField = IdeaImage?.jsonValue;
  // const imageSrc = imageField || imageField?.value?.src;
  const hasImage = Boolean(imageField);

  const cardContent = (
    <div className="flex gap-4 px-4 py-5">
      {/* Left Side - Image */}
      <div className="shrink-0">
        <div className="w-[120px] h-[120px] rounded-[4px] overflow-hidden bg-gray-200 flex-shrink-0">
          {hasImage ? (
            <Image
              field={imageField}
              className="w-full h-full object-cover"
              alt={imageField || titleValue || 'Idea image'}
            />
          ) : isPageEditing ? (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm bg-gray-100">
              Image
            </div>
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}
        </div>
      </div>

      {/* Right Side - Text Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
        {/* Title - Bold, prominent, can wrap to multiple lines */}
        {(titleValue || isPageEditing) && (
          <h3 className="text-[16px] leading-[1.4] tracking-[-0.16px] font-semibold text-[#111] mb-3 line-clamp-3">
            <Text field={IdeaTitle?.jsonValue} />
          </h3>
        )}

        {/* Metadata: Author, Category, Date - Smaller, lighter gray */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] leading-[1.4] tracking-[-0.13px] text-[rgba(17,17,17,0.6)]">
          {authorValue && (
            <span>
              <Text field={IdeaAuthor?.jsonValue} />
            </span>
          )}
          {authorValue && categoryValue && (
            <span className="text-[rgba(17,17,17,0.4)]">•</span>
          )}
          {categoryValue && (
            <span>
              <Text field={IdeaCategory?.jsonValue} />
            </span>
          )}
          {(authorValue || categoryValue) && formattedDate && (
            <span className="text-[rgba(17,17,17,0.4)]">•</span>
          )}
          {formattedDate && <span>{formattedDate}</span>}
          {isPageEditing && !metadataText && (
            <span className="text-gray-400">Author • Category • Date</span>
          )}
        </div>
      </div>
    </div>
  );

  // Wrap in Link if IdeaLink is provided - handle both jsonValue.href and jsonValue.value.href structures
  const linkHref = IdeaLink?.jsonValue?.value?.href;
  if (linkHref && IdeaLink?.jsonValue) {
    return (
      <Link field={IdeaLink.jsonValue} className="block hover:opacity-80 transition-opacity">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

/**
 * Transform idea item fields from various data structures
 * Handles cases where data comes directly from GraphQL without the jsonValue wrapper
 */
const transformIdeaFields = (idea: any): IdeaItem => {
  // If idea already has proper structure, return as-is
  if (idea.IdeaTitle?.jsonValue || idea.IdeaImage?.jsonValue) {
    return idea;
  }

  // Transform fields from { value: "..." } to { jsonValue: { value: "..." } }
  const transformedIdea: IdeaItem = {
    id: idea.id || '',
    name: idea.name || '',
    displayName: idea.displayName || '',
  };

  // Transform each field if it exists
  if (idea.fields) {
    if (idea.fields.IdeaImage?.value || idea.fields.IdeaImage) {
      transformedIdea.IdeaImage = {
        jsonValue: (idea.fields.IdeaImage.value || idea.fields.IdeaImage) as any,
      };
    }
    if (idea.fields.IdeaTitle?.value !== undefined) {
      transformedIdea.IdeaTitle = {
        jsonValue: { value: idea.fields.IdeaTitle.value } as any,
      };
    }
    if (idea.fields.IdeaAuthor?.value !== undefined) {
      transformedIdea.IdeaAuthor = {
        jsonValue: { value: idea.fields.IdeaAuthor.value } as any,
      };
    }
    if (idea.fields.IdeaCategory?.value !== undefined) {
      transformedIdea.IdeaCategory = {
        jsonValue: { value: idea.fields.IdeaCategory.value } as any,
      };
    }
    if (idea.fields.IdeaDate?.value !== undefined) {
      transformedIdea.IdeaDate = {
        jsonValue: { value: idea.fields.IdeaDate.value } as any,
      };
    }
    if (idea.fields.IdeaLink?.value) {
      transformedIdea.IdeaLink = {
        jsonValue: idea.fields.IdeaLink.value as any,
      };
    }
  }

  return transformedIdea;
};

/**
 * SimilarIdeas Default variant implementation
 * Displays a vertical list of idea cards matching the Figma design
 * Based on Figma design: https://www.figma.com/design/TM3hdPWQNOMHfhrDTaGs5h/_Nexusblack.com--v0-?node-id=2005-161&m=dev
 * @param {SimilarIdeasProps} props - Component props
 * @returns {JSX.Element} The rendered component
 */
export const SimilarIdeasDefault: React.FC<SimilarIdeasProps & { isPageEditing?: boolean }> = (
  props
) => {
  const { fields, isPageEditing } = props;

  // Debug logging
  console.log('💡 SimilarIdeas - Fields:', fields);
  console.log('💡 SimilarIdeas - Datasource:', fields?.data?.datasource);
  console.log('💡 SimilarIdeas - Children:', fields?.data?.datasource?.children);

  const fieldsAny = fields as any;

  // Get ideas from various possible locations:
  // 1. fields.Ideas (direct array from GraphQL)
  // 2. fields.data.datasource.children.results (standard multilist structure)
  // 3. fields.data.datasource.Ideas (alternative datasource structure)
  let rawIdeas: any[] = [];

  if (Array.isArray(fieldsAny?.Ideas)) {
    // Data coming directly as fields.Ideas array
    rawIdeas = fieldsAny.Ideas;
  } else if (fields?.data?.datasource?.children?.results) {
    // Standard multilist structure
    rawIdeas = fields.data.datasource.children.results;
  } else if (fieldsAny?.data?.datasource?.Ideas) {
    // Alternative datasource structure
    rawIdeas = Array.isArray(fieldsAny.data.datasource.Ideas)
      ? fieldsAny.data.datasource.Ideas
      : [];
  }

  // Transform ideas to ensure proper field structure
  const ideas = rawIdeas.map(transformIdeaFields);

  console.log('💡 SimilarIdeas - Raw ideas found:', rawIdeas.length);
  console.log('💡 SimilarIdeas - Transformed ideas:', ideas.length, ideas);

  // Get section title - handle multiple field access patterns
  let sectionTitle: any = null;
  
  // Try multiple ways to access the SectionTitle field
  if (fields?.data?.datasource?.SectionTitle?.jsonValue) {
    sectionTitle = fields.data.datasource.SectionTitle.jsonValue;
  } else if (fieldsAny?.data?.datasource?.SectionTitle?.jsonValue) {
    sectionTitle = fieldsAny.data.datasource.SectionTitle.jsonValue;
  } else if (fieldsAny?.SectionTitle?.jsonValue) {
    sectionTitle = fieldsAny.SectionTitle.jsonValue;
  } else if (fieldsAny?.data?.datasource?.SectionTitle) {
    sectionTitle = fieldsAny.data.datasource.SectionTitle;
  } else if (fieldsAny?.SectionTitle) {
    sectionTitle = fieldsAny.SectionTitle;
  }

  const sectionTitleValue = sectionTitle?.value || sectionTitle?.jsonValue?.value || '';

  console.log('💡 SimilarIdeas - SectionTitle:', sectionTitle);
  console.log('💡 SimilarIdeas - SectionTitle value:', sectionTitleValue);

  // Handle missing datasource - only show fallback if no ideas found and not editing
  if (
    ideas.length === 0 &&
    !isPageEditing &&
    !fields?.data?.datasource &&
    !fieldsAny?.Ideas &&
    !sectionTitleValue
  ) {
    console.warn('💡 SimilarIdeas - No datasource or ideas found');
    return <NoDataFallback componentName="SimilarIdeas" />;
  }

  return (
    <section className={cn('bg-[#f7f7f7]')} data-component="SimilarIdeas">
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Section Title */}
        {(sectionTitleValue || isPageEditing) && (
          <h2 className="text-[20px] leading-[1.3] tracking-[-0.2px] font-medium text-[#111] mb-6">
            {fields?.data?.datasource?.SectionTitle?.jsonValue ? (
              <Text field={fields.data.datasource.SectionTitle.jsonValue} />
            ) : fieldsAny?.data?.datasource?.SectionTitle?.jsonValue ? (
              <Text field={fieldsAny.data.datasource.SectionTitle.jsonValue} />
            ) : sectionTitleValue ? (
              sectionTitleValue
            ) : isPageEditing ? (
              <span className="text-gray-400">Section Title</span>
            ) : null}
          </h2>
        )}

        {/* Ideas List */}
        {ideas.length > 0 ? (
          <div className="bg-white rounded-[4px] overflow-hidden">
            {ideas.map((idea, index) => (
              <div key={idea.id || index}>
                <IdeaCard idea={idea} isPageEditing={isPageEditing} />
                {/* Divider between cards (except after last card) */}
                {index < ideas.length - 1 && (
                  <div className="border-b border-[#e0e0e0]" />
                )}
              </div>
            ))}
          </div>
        ) : (
          // Show message if no ideas and not in editing mode
          !isPageEditing && (
            <div className="bg-white rounded-[4px] p-8 text-center">
              <p className="text-gray-500">No ideas to display.</p>
            </div>
          )
        )}

        {/* Editing mode placeholder */}
        {isPageEditing && ideas.length === 0 && (
          <div className="bg-white rounded-[4px] border-2 border-dashed border-gray-300 p-12 text-center">
            <p className="text-gray-500">
              Add IdeaItem items to the datasource to display ideas here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
