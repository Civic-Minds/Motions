import React from 'react';
import { cn } from '../../lib/utils';

const variants = {
  default:  "bg-[#004a99] text-white hover:bg-[#003875] shadow-sm",
  outline:  "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm",
  secondary:"bg-slate-100 text-slate-900 hover:bg-slate-200",
  ghost:    "hover:bg-slate-100 text-slate-600 hover:text-slate-900",
  destructive: "bg-red-500 text-white hover:bg-red-600",
};

const sizes = {
  default: "h-9 px-4 py-2 text-sm",
  sm:      "h-7 px-3 text-xs rounded-md",
  lg:      "h-11 px-6 text-base",
  icon:    "h-9 w-9",
};

export const Button = React.forwardRef(({ className, variant = 'default', size = 'default', ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004a99]/50 disabled:pointer-events-none disabled:opacity-50",
      variants[variant],
      sizes[size],
      className
    )}
    {...props}
  />
));
Button.displayName = "Button";
