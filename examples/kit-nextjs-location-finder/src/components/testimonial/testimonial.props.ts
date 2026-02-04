import { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

/**
 * Parameters for the Testimonial component
 */
interface TestimonialParams {
  [key: string]: any; // eslint-disable-line
}

/**
 * Fields from the Testimonial datasource template
 */
export interface TestimonialFields {
  data?: {
    datasource?: {
      SpeakerImage?: {
        jsonValue: ImageField;
      };
      SpeakerName?: {
        jsonValue: Field<string>;
      };
      BodyText?: {
        jsonValue: Field<string>;
      };
      bodytext?: {
        jsonValue: Field<string>;
      };
      speakerPostion?: {
        jsonValue: Field<string>;
      };
      CompanyName?: {
        jsonValue: Field<string>;
      };
      ButtonLink?: {
        jsonValue: LinkField;
      };
      lbutton?: {
        jsonValue: LinkField;
      };
      LButton?: {
        jsonValue: LinkField;
      };
    };
  };
}

/**
 * Props for the Testimonial component
 */
export interface TestimonialProps extends ComponentProps {
  params: TestimonialParams;
  fields: TestimonialFields;
  isPageEditing?: boolean;
}
