import React from 'react';
import { cn } from '../../lib/utils';

const variants = {
  default:     "bg-slate-900 text-slate-50 hover:bg-slate-900/80",
  secondary:   "bg-slate-100 text-slate-700 hover:bg-slate-200",
  destructive: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
  success:     "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  warning:     "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
  outline:     "border border-slate-200 text-slate-700",
};

export const Badge = React.forwardRef(({ className, variant = 'default', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
      variants[variant],
      className
    )}
    {...props}
  />
));
Badge.displayName = "Badge";
