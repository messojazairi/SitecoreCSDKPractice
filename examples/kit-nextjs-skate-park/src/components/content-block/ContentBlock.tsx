import { JSX } from 'react';
import { Text, RichText, Field, withDatasourceCheck } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

type ContentBlockProps = ComponentProps & {
  fields: {
    heading: Field<string>;
    content: Field<string>;
  };
};

/**
 * A simple Content Block component, with a heading and rich text block.
 * This is the most basic building block of a content site, and the most basic
 * Content SDK component that's useful.
 * 
 * Uses semantic <article> element for standalone content blocks.
 */
const ContentBlock = ({ fields }: ContentBlockProps): JSX.Element => (
  <div className="contentBlock">
    <article>
      <Text tag="h2" className="contentTitle" field={fields.heading} />
      <RichText className="contentDescription" field={fields.content} />
    </article>
  </div>
);

export default withDatasourceCheck()<ContentBlockProps>(ContentBlock);
