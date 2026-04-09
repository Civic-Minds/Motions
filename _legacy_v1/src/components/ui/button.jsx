import React from 'react';
import { cn } from '../../lib/utils';

const variants = {
  default: "bg-gradient-to-b from-[#004a99] to-[#003875] text-white shadow-[0_2px_10px_rgba(0,74,153,0.2)] hover:shadow-[0_4px_15px_rgba(0,74,153,0.3)] hover:-translate-y-0.5",
  destructive: "bg-gradient-to-b from-red-500 to-red-600 text-white shadow-sm hover:shadow-md hover:-translate-y-0.5",
  outline: "border border-slate-200 bg-white/50 backdrop-blur-sm shadow-sm hover:bg-slate-50 hover:text-slate-900",
  secondary: "bg-slate-100 text-slate-900 shadow-sm hover:bg-slate-200",
  ghost: "hover:bg-slate-100 hover:text-slate-900",
  link: "text-[#004a99] underline-offset-4 hover:underline",
};

const sizes = {
  default: "h-9 px-4 py-2",
  sm: "h-8 rounded-md px-3 text-xs",
  lg: "h-10 rounded-md px-8",
  icon: "h-9 w-9",
};

export const Button = React.forwardRef(({ className, variant = 'default', size = 'default', ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004a99]/50 disabled:pointer-events-none disabled:opacity-50",
      variants[variant],
      sizes[size],
      className
    )}
    {...props}
  />
));
Button.displayName = "Button";
