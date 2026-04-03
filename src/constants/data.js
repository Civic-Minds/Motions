/**
 * Static constants for Toronto Council Transparency
 */

export const COUNCILLORS = [
    'Olivia Chow', 'Stephen Holyday', 'Amber Morley', 'Gord Perks', 'Alejandra Bravo',
    'Mike Colle', 'Josh Matlow', 'Dianne Saxe', 'Ausma Malik', 'Chris Moise',
    'Paula Fletcher', 'Lily Cheng', 'Shelley Carroll', 'Jon Burnside', 'Jaye Robinson',
    'Brad Bradford', 'Parthi Kandavel', 'Paul Ainslie', 'Jamaal Myers', 'Jennifer McKelvie',
    'Michael Thompson', 'Nick Mantas', 'Vincent Crisanti', 'Frances Nunziata', 'James Pasternak'
];

export const PROGRESSIVES = ['Olivia Chow', 'Gord Perks', 'Alejandra Bravo', 'Ausma Malik', 'Chris Moise', 'Paula Fletcher', 'Dianne Saxe', 'Jamaal Myers', 'Amber Morley'];
export const CONSERVATIVES = ['Stephen Holyday', 'Vincent Crisanti', 'Frances Nunziata', 'Jaye Robinson', 'Brad Bradford', 'Jon Burnside'];

// ─── Topic styling ────────────────────────────────────────────────────────────

/** Bordered pill — used in ContestBoard, VersusOverlay */
export const TOPIC_BADGE = {
    Housing: 'border-blue-400 text-blue-700 bg-blue-50',
    Transit: 'border-red-400 text-red-600 bg-red-50',
    Finance: 'border-emerald-400 text-emerald-700 bg-emerald-50',
    Parks:   'border-green-400 text-green-700 bg-green-50',
    Climate: 'border-teal-400 text-teal-700 bg-teal-50',
    Events:  'border-purple-400 text-purple-700 bg-purple-50',
    General: 'border-slate-300 text-slate-500 bg-slate-50',
};

/** Borderless pill — used in ProfilePanel */
export const TOPIC_PILL = {
    Housing: 'bg-blue-50 text-blue-600',
    Transit: 'bg-red-50 text-red-600',
    Finance: 'bg-emerald-50 text-emerald-700',
    Parks:   'bg-green-50 text-green-700',
    Climate: 'bg-teal-50 text-teal-700',
    Events:  'bg-purple-50 text-purple-700',
    General: 'bg-slate-100 text-slate-600',
};

/** Badge + dot tokens — used in MotionTable */
export const TOPIC_COLOR = {
    Housing: { badge: 'bg-blue-50 text-blue-700 border-blue-100',          dot: 'bg-blue-500' },
    Transit: { badge: 'bg-rose-50 text-rose-700 border-rose-100',          dot: 'bg-rose-500' },
    Finance: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500' },
    Parks:   { badge: 'bg-lime-50 text-lime-700 border-lime-100',          dot: 'bg-lime-500' },
    Climate: { badge: 'bg-teal-50 text-teal-700 border-teal-100',          dot: 'bg-teal-500' },
    General: { badge: 'bg-slate-50 text-slate-500 border-slate-200',       dot: 'bg-slate-400' },
};

// ─── Flag styling ─────────────────────────────────────────────────────────────

export const FLAG_STYLES = {
    'close-vote':       'bg-rose-50 text-rose-600 border-rose-200',
    'defeated':         'bg-slate-100 text-slate-500 border-slate-200',
    'unanimous':        'bg-emerald-50 text-emerald-600 border-emerald-200',
    'landslide-defeat': 'bg-slate-100 text-slate-400 border-slate-200',
};

export const FLAG_LABELS = {
    'close-vote':       'Close Vote',
    'defeated':         'Defeated',
    'unanimous':        'Unanimous',
    'landslide-defeat': 'Crushed',
};

export const FLAG_FILTER_STYLES = {
    'close-vote':       { active: 'bg-rose-600 text-white border-rose-600',      inactive: 'text-rose-600 border-rose-200 hover:border-rose-400 bg-rose-50/50' },
    'unanimous':        { active: 'bg-emerald-600 text-white border-emerald-600', inactive: 'text-emerald-700 border-emerald-200 hover:border-emerald-400 bg-emerald-50/50' },
    'landslide-defeat': { active: 'bg-slate-500 text-white border-slate-500',     inactive: 'text-slate-500 border-slate-200 hover:border-slate-400 bg-slate-50' },
    'defeated':         { active: 'bg-slate-700 text-white border-slate-700',     inactive: 'text-slate-600 border-slate-200 hover:border-slate-400 bg-slate-50' },
};
