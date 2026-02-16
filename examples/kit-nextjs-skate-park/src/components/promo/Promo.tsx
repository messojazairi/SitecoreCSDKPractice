import React, { JSX } from 'react';
import {
  NextImage as ContentSdkImage,
  Link as ContentSdkLink,
  RichText as ContentSdkRichText,
  ImageField,
  Field,
  LinkField,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import StructuredData from 'components/structured-data/StructuredData';
import { buildProductJsonLd } from 'src/lib/structured-data/schema';

interface Fields {
  PromoIcon: ImageField;
  PromoText: Field<string>;
  PromoLink: LinkField;
  PromoText2: Field<string>;
}

type PromoProps = ComponentProps & {
  fields: Fields;
};

interface PromoContentProps extends PromoProps {
  renderText: (fields: Fields) => JSX.Element;
}

function getBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    'http://localhost:3000'
  );
}

const PromoContent = (props: PromoContentProps): JSX.Element => {
  const { fields, params, renderText } = props;
  const { styles, RenderingIdentifier: id } = params;
  const baseUrl = getBaseUrl();

  const Wrapper = ({ children }: { children: JSX.Element }): JSX.Element => (
    <article
      className={`component promo ${styles}`}
      id={id}
      itemScope
      itemType="https://schema.org/Product"
    >
      <div className="component-content">{children}</div>
    </article>
  );

  if (!fields) {
    return (
      <Wrapper>
        <span className="is-empty-hint">Promo</span>
      </Wrapper>
    );
  }

  const linkValue =
    fields.PromoLink?.value ??
    (fields.PromoLink as { jsonValue?: { value?: { href?: string; title?: string; text?: string } } })
      ?.jsonValue?.value;
  const linkHref = linkValue?.href;
  const productUrl =
    linkHref && typeof linkHref === 'string'
      ? linkHref.startsWith('http')
        ? linkHref
        : baseUrl + (linkHref.startsWith('/') ? linkHref : `/${linkHref}`)
      : baseUrl;

  const nameFromLink = linkValue?.title ?? linkValue?.text;
  const nameFromRichText = fields.PromoText?.value ? String(fields.PromoText.value) : undefined;

  return (
    <Wrapper>
      <>
        <figure className="field-promoicon" itemProp="image">
          <ContentSdkImage field={fields.PromoIcon} />
        </figure>
        <div className="promo-text" itemProp="description">
          {renderText(fields)}
        </div>
        <StructuredData
          id={`jsonld-product-${id ?? 'promo'}`}
          data={buildProductJsonLd({
            name: nameFromLink ?? undefined,
            nameHtml: nameFromLink ? undefined : nameFromRichText,
            descriptionHtml: nameFromRichText,
            url: productUrl,
            image: (fields.PromoIcon as unknown as { value?: { src?: string } })?.value?.src,
          })}
        />
      </>
    </Wrapper>
  );
};

export const Default = (props: PromoProps): JSX.Element => {
  const renderText = (fields: Fields) => (
    <>
      <div className="field-promotext">
        <ContentSdkRichText field={fields.PromoText} />
      </div>
      <div className="field-promolink">
        <ContentSdkLink field={fields.PromoLink} />
      </div>
    </>
  );

  return <PromoContent {...props} renderText={renderText} />;
};

export const WithText = (props: PromoProps): JSX.Element => {
  const renderText = (fields: Fields) => (
    <>
      <div className="field-promotext">
        <ContentSdkRichText className="promo-text" field={fields.PromoText} />
      </div>
      <div className="field-promotext">
        <ContentSdkRichText className="promo-text" field={fields.PromoText2} />
      </div>
    </>
  );

  return <PromoContent {...props} renderText={renderText} />;
};
