import React from 'react';
import { cn } from '../lib/utils';

// Keep static pages in the same responsive column as the homepage motion list.
export const PAGE_COLUMN_CLASS = 'mx-auto w-full lg:w-[calc(100%_-_444px)]';

export default function PageColumn({ children, className }) {
  return <div className={cn(PAGE_COLUMN_CLASS, className)}>{children}</div>;
}
