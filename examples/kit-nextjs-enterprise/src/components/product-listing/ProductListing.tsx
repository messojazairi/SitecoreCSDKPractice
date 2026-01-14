'use client';

import React from 'react';
import { Text, Image, Link as SitecoreLink, RichText } from '@sitecore-content-sdk/nextjs';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProductListingProps, ProductItem } from './product-listing.props';

/**
 * Default Product Listing - Grid layout
 */
export const Default: React.FC<ProductListingProps> = ({ fields, params, page }) => {
  const isPageEditing = page.mode.isEditing;
  const { columns = '3', colorScheme = 'light' } = params || {};

  if (!fields) {
    return <NoDataFallback componentName="ProductListing" />;
  }

  const { title, subtitle, products } = fields;

  const gridCols = {
    '2': 'md:grid-cols-2',
    '3': 'md:grid-cols-2 lg:grid-cols-3',
    '4': 'md:grid-cols-2 lg:grid-cols-4',
  }[columns] || 'md:grid-cols-2 lg:grid-cols-3';

  return (
    <section
      className={cn(
        'py-16 lg:py-24',
        colorScheme === 'light' ? 'bg-background' : 'bg-muted',
        params?.styles
      )}
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          {(title?.value || isPageEditing) && (
            <Text
              tag="h2"
              field={title}
              className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
            />
          )}
          {(subtitle?.value || isPageEditing) && (
            <Text
              tag="p"
              field={subtitle}
              className="mx-auto max-w-2xl text-lg text-muted-foreground"
            />
          )}
        </div>

        {/* Products Grid */}
        <div className={cn('grid gap-6', gridCols)}>
          {products?.map((product: ProductItem, index: number) => (
            <ProductCard key={index} product={product} isPageEditing={isPageEditing} />
          ))}
        </div>

        {/* Empty state for editing */}
        {(!products || products.length === 0) && isPageEditing && (
          <div className="rounded-lg border-2 border-dashed border-muted p-12 text-center">
            <p className="text-muted-foreground">Add products to display them here</p>
          </div>
        )}
      </div>
    </section>
  );
};

/**
 * Featured Product Listing - Highlighted first product
 */
export const Featured: React.FC<ProductListingProps> = ({ fields, params, page }) => {
  const isPageEditing = page.mode.isEditing;
  const { colorScheme = 'light' } = params || {};

  if (!fields) {
    return <NoDataFallback componentName="ProductListing (Featured)" />;
  }

  const { title, subtitle, products } = fields;
  const [featuredProduct, ...otherProducts] = products || [];

  return (
    <section
      className={cn(
        'py-16 lg:py-24',
        colorScheme === 'light' ? 'bg-background' : 'bg-muted',
        params?.styles
      )}
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          {(title?.value || isPageEditing) && (
            <Text
              tag="h2"
              field={title}
              className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
            />
          )}
          {(subtitle?.value || isPageEditing) && (
            <Text
              tag="p"
              field={subtitle}
              className="mx-auto max-w-2xl text-lg text-muted-foreground"
            />
          )}
        </div>

        {/* Featured Product */}
        {featuredProduct && (
          <div className="mb-12">
            <Card className="overflow-hidden">
              <div className="grid lg:grid-cols-2">
                <div className="relative min-h-[300px] lg:min-h-[400px]">
                  {featuredProduct.fields?.image?.value?.src && (
                    <Image
                      field={featuredProduct.fields.image}
                      className="h-full w-full object-cover"
                    />
                  )}
                  {featuredProduct.fields?.badge?.value && (
                    <Badge className="absolute left-4 top-4" variant="default">
                      {featuredProduct.fields.badge.value}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col justify-center p-8 lg:p-12">
                  {featuredProduct.fields?.name?.value && (
                    <Text
                      tag="h3"
                      field={featuredProduct.fields.name}
                      className="mb-4 text-2xl font-bold lg:text-3xl"
                    />
                  )}
                  {featuredProduct.fields?.description?.value && (
                    <RichText
                      field={featuredProduct.fields.description}
                      className="mb-6 text-muted-foreground"
                    />
                  )}
                  {featuredProduct.fields?.price?.value && (
                    <Text
                      tag="p"
                      field={featuredProduct.fields.price}
                      className="mb-6 text-2xl font-bold text-pastel-pink"
                    />
                  )}
                  {featuredProduct.fields?.ctaLink?.value?.href && (
                    <div>
                      <SitecoreLink field={featuredProduct.fields.ctaLink}>
                        <Button size="lg">
                          {featuredProduct.fields.ctaLink.value.text || 'View Details'}
                        </Button>
                      </SitecoreLink>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Other Products */}
        {otherProducts.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {otherProducts.map((product: ProductItem, index: number) => (
              <ProductCard key={index} product={product} isPageEditing={isPageEditing} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

/**
 * Product Card Component
 */
interface ProductCardProps {
  product: ProductItem;
  isPageEditing: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isPageEditing }) => {
  const { fields } = product;

  if (!fields) return null;

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden">
        {fields.image?.value?.src && (
          <Image
            field={fields.image}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        {fields.badge?.value && (
          <Badge className="absolute left-3 top-3" variant="default">
            {fields.badge.value}
          </Badge>
        )}
      </div>
      <CardHeader>
        {(fields.name?.value || isPageEditing) && (
          <CardTitle>
            <Text field={fields.name} />
          </CardTitle>
        )}
        {fields.price?.value && (
          <CardDescription className="text-lg font-semibold text-pastel-pink">
            <Text field={fields.price} />
          </CardDescription>
        )}
      </CardHeader>
      {(fields.description?.value || isPageEditing) && (
        <CardContent>
          <RichText field={fields.description} className="line-clamp-3 text-sm text-muted-foreground" />
        </CardContent>
      )}
      {fields.ctaLink?.value?.href && (
        <CardFooter>
          <SitecoreLink field={fields.ctaLink} className="w-full">
            <Button variant="outline" className="w-full">
              {fields.ctaLink.value.text || 'View Details'}
            </Button>
          </SitecoreLink>
        </CardFooter>
      )}
    </Card>
  );
};
