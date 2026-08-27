import React from 'react';

const cardClass = 'bg-white border border-slate-200 rounded-2xl p-4 text-left group flex flex-col gap-2 hover:border-[#004a99]/40 hover:shadow-sm transition-all';

export default function HomepageCard({ as: Component = 'div', className = '', children, ...props }) {
  return (
    <Component className={`${cardClass}${className ? ` ${className}` : ''}`} {...props}>
      {children}
    </Component>
  );
}
