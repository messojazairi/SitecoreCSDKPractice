'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Text, Image } from '@sitecore-content-sdk/nextjs';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { Default as ImageWrapper } from '@/components/image/ImageWrapper.dev';
import { SearchBarProps } from './search-bar.props';

/**
 * SearchBar Default variant implementation
 * Displays a search bar with background image, input field, and submit button
 * Based on Figma design: https://www.figma.com/design/TM3hdPWQNOMHfhrDTaGs5h/_Nexusblack.com--v0-?node-id=2005-193&m=dev
 * @param {SearchBarProps} props - Component props
 * @returns {JSX.Element} The rendered component
 */
export const SearchBarDefault: React.FC<SearchBarProps> = (props) => {
  const { fields, isPageEditing } = props;
  const [searchValue, setSearchValue] = useState('');

  // Safe destructuring with fallbacks
  // Check both structures: fields.data.datasource OR fields directly
  const { data } = fields || {};
  const { datasource } = data || {};
  
  // Get fields from datasource OR directly from fields
  const BackgroundImage = datasource?.BackgroundImage || fields?.BackgroundImage;
  const PlaceholderText = datasource?.PlaceholderText || fields?.PlaceholderText;
  const ButtonText = datasource?.ButtonText || fields?.ButtonText;

  // Handle both jsonValue and direct value structures
  // Support: BackgroundImage.jsonValue OR BackgroundImage.value OR direct object with src
  let backgroundImageField: any = BackgroundImage?.jsonValue || BackgroundImage?.value || BackgroundImage;
  
  // If backgroundImageField has direct src property (not wrapped in value), wrap it for ImageWrapper
  if (backgroundImageField?.src && !backgroundImageField?.value) {
    backgroundImageField = {
      value: {
        src: backgroundImageField.src,
        alt: backgroundImageField.alt || '',
        width: backgroundImageField.width || backgroundImageField.w || '',
        height: backgroundImageField.height || backgroundImageField.h || '',
      },
    };
  }
  
  // Support: PlaceholderText.jsonValue.value OR PlaceholderText.value
  const placeholderValue = 
    PlaceholderText?.jsonValue?.value || 
    PlaceholderText?.value || 
    '';

  // Support: ButtonText.jsonValue.value OR ButtonText.value
  const buttonTextValue = 
    ButtonText?.jsonValue?.value || 
    ButtonText?.value || 
    'Ask';

  // Debug logging
  console.log('🔍 SearchBar - Fields:', fields);
  console.log('🔍 SearchBar - Data:', data);
  console.log('🔍 SearchBar - Datasource:', datasource);
  console.log('🔍 SearchBar - BackgroundImage:', BackgroundImage);
  console.log('🔍 SearchBar - backgroundImageField (final):', backgroundImageField);
  console.log('🔍 SearchBar - placeholderValue:', placeholderValue);
  console.log('🔍 SearchBar - buttonTextValue:', buttonTextValue);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchValue.trim()) {
      // Handle search submission - can be customized
      console.log('Search submitted:', searchValue);
      // You can add navigation or API call here
    }
  };

  // Handle missing datasource - check for both structures
  const hasDatasource = 
    fields?.data?.datasource || 
    fields?.BackgroundImage || 
    fields?.PlaceholderText || 
    fields?.ButtonText;
  
  if (!hasDatasource && !isPageEditing) {
    return <NoDataFallback componentName="SearchBar" />;
  }

  return (
    <section
      data-component="SearchBar"
      className="relative w-full min-h-[600px] @md:min-h-[700px] @lg:min-h-[800px] flex items-center justify-center overflow-hidden"
    >
      {/* Background Image - Larger, more prominent */}
      <div className="absolute inset-0 z-0">
        {backgroundImageField?.value?.src ? (
          <ImageWrapper
            image={backgroundImageField}
            wrapperClass="absolute inset-0 w-full h-full"
            className="h-full w-full object-cover scale-105"
            priority={true}
            page={props.page}
          />
        ) : isPageEditing ? (
          <div className="h-full w-full bg-gray-800 flex items-center justify-center text-gray-500">
            Background Image
          </div>
        ) : (
          <div className="h-full w-full bg-gray-900" />
        )}
      </div>

      {/* Search Bar Container - Perfectly centered in middle of background */}
      <div className="relative z-10 w-full max-w-4xl px-4 @md:px-6 @lg:px-8 flex items-center justify-center">
        {/* Form container with subtle shadow/glow - button is inside */}
        <form
          onSubmit={handleSubmit}
          className="flex items-stretch w-full gap-0 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.25),0_0_30px_rgba(255,255,255,0.15)] overflow-hidden"
          role="search"
          aria-label="Search form"
          style={{
            background: 'rgba(245, 245, 245, 0.98)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {/* Input Field - Inside the form container, rounded left corners only */}
          <div className="flex-1 relative flex items-center">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={placeholderValue || 'Enter your question...'}
              className={cn(
                'w-full h-14 @md:h-16 px-6 @md:px-8',
                'bg-transparent text-[#111]',
                'border-0 rounded-none',
                'text-base @md:text-lg',
                'font-normal leading-normal',
                'placeholder:text-[rgba(17,17,17,0.6)]',
                'focus:outline-none focus:ring-0',
                'transition-all duration-200',
                'appearance-none'
              )}
              style={{
                borderRadius: '9999px 0 0 9999px',
              }}
              aria-label="Search input"
            />
          </div>

          {/* Submit Button - Inside the form container, aligned with input, rounded right corners only */}
          <button
            type="submit"
            className={cn(
              'h-14 @md:h-16 px-8 @md:px-10',
              'text-white font-semibold',
              'border-0 rounded-none',
              'text-base @md:text-lg',
              'whitespace-nowrap',
              'transition-all duration-200',
              'focus:outline-none focus:ring-0',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'flex-shrink-0',
              'flex items-center justify-center',
              'hover:opacity-90 active:opacity-80'
            )}
            style={{
              background: 'linear-gradient(to right, #8A2BE2 0%, #A020F0 100%)',
              borderRadius: '0 9999px 9999px 0',
            }}
            aria-label="Submit search"
          >
          {(buttonTextValue || isPageEditing) && (
            isPageEditing && (ButtonText?.jsonValue || ButtonText?.value) ? (
              ButtonText?.jsonValue ? (
                <Text field={ButtonText.jsonValue} />
              ) : (
                buttonTextValue || 'Ask'
              )
            ) : (
              buttonTextValue || 'Ask'
            )
          )}
        </button>
      </form>

      {/* Editing mode helper text */}
      {isPageEditing && !placeholderValue && (
        <p className="mt-4 text-center text-sm text-gray-300">
          Configure PlaceholderText and ButtonText fields in the datasource
        </p>
      )}
    </div>
    </section>
  );
};
