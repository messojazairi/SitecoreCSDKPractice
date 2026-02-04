import { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

/**
 * Parameters for the SimilarIdeas component
 */
interface SimilarIdeasParams {
  [key: string]: any; // eslint-disable-line
}

/**
 * Individual idea item fields from IdeaItem template
 * Fields come from Content SDK as { jsonValue: Field } structure
 */
export interface IdeaItem {
  id: string;
  name: string;
  displayName: string;
  IdeaImage?: {
    jsonValue: ImageField;
  };
  IdeaTitle?: {
    jsonValue: Field<string>;
  };
  IdeaAuthor?: {
    jsonValue: Field<string>;
  };
  IdeaCategory?: {
    jsonValue: Field<string>;
  };
  IdeaDate?: {
    jsonValue: Field<string>;
  };
  IdeaLink?: {
    jsonValue: LinkField;
  };
}

/**
 * Fields from the SimilarIdeas datasource template
 * Multilist fields come as children.results array
 */
export interface SimilarIdeasFields {
  data: {
    datasource: {
      SectionTitle?: {
        jsonValue: Field<string>;
      };
      Ideas?: {
        jsonValue: Field<string[]>;
      };
      children?: {
        results: IdeaItem[];
      };
    };
  };
}

/**
 * Props for the SimilarIdeas component
 */
export interface SimilarIdeasProps extends ComponentProps {
  params: SimilarIdeasParams;
  fields: SimilarIdeasFields;
  isPageEditing?: boolean;
}
