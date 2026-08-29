import React from 'react';

function formatDollar(value) {
  return value >= 1_000_000_000 ? `${(value / 1_000_000_000).toFixed(1)}B`
    : value >= 1_000_000 ? `${(value / 1_000_000).toFixed(1)}M`
    : value >= 1_000 ? `${(value / 1_000).toFixed(0)}K`
    : `${value}`;
}

export default function MotionFunding({ motion }) {
  if (motion.keyAmounts?.length > 0) {
    const formatAmount = ({ value, unit }) => (
      unit === '$' ? `$${formatDollar(value)}`
        : unit === '%' ? `${value}%`
        : `${value} ${unit}`
    );

    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-4">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-3">Funding</p>
        <div className="flex flex-col gap-2">
          {motion.keyAmounts.map((amount, index) => (
            <div key={index} className="flex flex-col">
              <span className="text-xs text-slate-500 mb-0.5">{amount.label}</span>
              <span className="text-sm font-semibold text-slate-800">{formatAmount(amount)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (motion.amounts?.length > 0 && motion.amounts.length <= 10) {
    const amounts = motion.amounts.map(amount => (
      typeof amount === 'number' ? { value: amount } : amount
    ));
    const formatAmount = value => (
      value >= 1_000_000_000 ? `${(value / 1_000_000_000).toFixed(1)}B`
        : value >= 1_000_000 ? `${(value / 1_000_000).toFixed(1)}M`
        : `${(value / 1_000).toFixed(0)}K`
    );

    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-4">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-3">Funding</p>
        <div className="flex flex-wrap gap-2 items-center">
          {amounts.slice(0, 3).map((amount, index) => (
            <span key={index} className="text-sm font-semibold text-slate-800">
              ${formatAmount(amount.value)}
            </span>
          ))}
          {amounts.length > 3 && (
            <span className="text-xs text-slate-500">+{(amounts.length - 3).toLocaleString()} more</span>
          )}
        </div>
      </div>
    );
  }

  return null;
}
