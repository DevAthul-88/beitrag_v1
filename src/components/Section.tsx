'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import Grid from './ui/grid';

export const Section = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <section className={cn('relative', className)}>
      {/* Top double border */}
      <Grid columns={0} rows={1} height="h-5" className="absolute top-0 left-0 w-full" />

      {children}

      {/* Bottom double border */}
      <Grid columns={0} rows={1} height="h-5" className="absolute bottom-0 left-0 w-full" />
    </section>
  );
};
