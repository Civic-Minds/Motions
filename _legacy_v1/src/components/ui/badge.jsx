import React from 'react';
import { cn } from '../../lib/utils';

const variants = {
  default: "border-transparent bg-slate-900 text-slate-50 shadow-sm hover:bg-slate-900/80",
  secondary: "border-transparent bg-slate-100 text-slate-700 hover:bg-slate-200",
  destructive: "border-transparent bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
  success: "border-transparent bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  warning: "border-transparent bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
  outline: "text-slate-950 border-slate-200",
};

export const Badge = React.forwardRef(({ className, variant = 'default', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
      variants[variant],
      className
    )}
    {...props}
  />
));
Badge.displayName = "Badge";
