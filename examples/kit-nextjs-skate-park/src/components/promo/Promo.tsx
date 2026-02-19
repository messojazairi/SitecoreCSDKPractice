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
  const envBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL;
  if (envBaseUrl) {
    return envBaseUrl;
  }

  // On preview deployments, prefer the stable production project URL for canonical schema URLs.
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  // Preview deployments expose a host at runtime.
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Local development fallback.
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || '3000';
    return `http://localhost:${port}`;
  }

  // In non-dev environments without a configured site URL, avoid producing incorrect absolute URLs.
  return '';
}

function buildAbsoluteUrl(baseUrl: string, href?: string): string | undefined {
  if (!href || typeof href !== 'string') {
    return baseUrl || undefined;
  }

  if (href.startsWith('http://') || href.startsWith('https://')) {
    return href;
  }

  if (!baseUrl) {
    return undefined;
  }

  return `${baseUrl}${href.startsWith('/') ? href : `/${href}`}`;
}

function getJsonLdProductUrl(baseUrl: string, linkHref?: string): string | undefined {
  // Prefer the linked destination when available; otherwise fall back to the site root.
  return buildAbsoluteUrl(baseUrl, linkHref);
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
  const productUrl = getJsonLdProductUrl(baseUrl, linkHref);
  const imageSource = (fields.PromoIcon as unknown as { value?: { src?: string } })?.value?.src;

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
            image: imageSource,
          })}
        />
      </>
    </Wrapper>
  );
}

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