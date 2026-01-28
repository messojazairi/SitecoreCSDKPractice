'use client';

import { Text, Link } from '@sitecore-content-sdk/nextjs';
import { Button } from '@/components/ui/button';
import { JobItemProps } from './job-section.props';
import { MapPin } from 'lucide-react';

export const Default: React.FC<JobItemProps> = (props) => {
  const { title, location, link } = props || {};

  if (!title?.jsonValue?.value && !location?.jsonValue?.value) {
    return null;
  }

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border/50 bg-card p-8 shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-xl">
      <div className="mb-6 flex-1">
        {title?.jsonValue && (
          <h3 className="mb-4 font-heading text-2xl font-semibold leading-tight tracking-tight text-black">
            <Text field={title.jsonValue} className="text-black" />
          </h3>
        )}
        {location?.jsonValue && (
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <MapPin className="h-5 w-5 shrink-0 text-primary" />
            <p className="text-base font-medium leading-relaxed">
              <Text field={location.jsonValue} />
            </p>
          </div>
        )}
      </div>
      {link?.jsonValue && (
        <div className="mt-auto border-t border-border/50 pt-6">
          <Button variant="default" asChild className="w-full font-semibold">
            <Link field={link.jsonValue}>Apply Now</Link>
          </Button>
        </div>
      )}
    </div>
  );
};
