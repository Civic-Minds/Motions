/**
 * Static constants for Toronto Council Transparency
 */

export const FORMER_MEMBERS = {
  'John Tory':     'Resigned February 2023',
  'Jaye Robinson': 'Passed away June 2024',
  'Gary Crawford': 'Resigned August 2023',
};

export const COUNCILLORS = [
    'Olivia Chow', 'Stephen Holyday', 'Amber Morley', 'Gord Perks', 'Alejandra Bravo',
    'Mike Colle', 'Josh Matlow', 'Dianne Saxe', 'Ausma Malik', 'Chris Moise',
    'Paula Fletcher', 'Lily Cheng', 'Shelley Carroll', 'Jon Burnside', 'Jaye Robinson',
    'Brad Bradford', 'Parthi Kandavel', 'Paul Ainslie', 'Jamaal Myers', 'Jennifer McKelvie',
    'Michael Thompson', 'Nick Mantas', 'Vincent Crisanti', 'Frances Nunziata', 'James Pasternak'
];

export const PROGRESSIVES = ['Olivia Chow', 'Gord Perks', 'Alejandra Bravo', 'Ausma Malik', 'Chris Moise', 'Paula Fletcher', 'Dianne Saxe', 'Jamaal Myers', 'Amber Morley'];
export const CONSERVATIVES = ['Stephen Holyday', 'Vincent Crisanti', 'Frances Nunziata', 'Jaye Robinson', 'Brad Bradford', 'Jon Burnside'];

// ─── Ward → Councillor mapping (2022–2026 term, by-election winners included) ─

export const WARD_COUNCILLORS = {
    '1':  'Vincent Crisanti',
    '2':  'Stephen Holyday',
    '3':  'Amber Morley',
    '4':  'Gord Perks',
    '5':  'Frances Nunziata',
    '6':  'James Pasternak',
    '7':  'Anthony Perruzza',
    '8':  'Mike Colle',
    '9':  'Alejandra Bravo',
    '10': 'Ausma Malik',
    '11': 'Dianne Saxe',
    '12': 'Josh Matlow',
    '13': 'Chris Moise',
    '14': 'Paula Fletcher',
    '15': 'Jaye Robinson',
    '16': 'Rachel Chernos Lin',
    '17': 'Shelley Carroll',
    '18': 'Lily Cheng',
    '19': 'Brad Bradford',
    '20': 'Parthi Kandavel',
    '21': 'Michael Thompson',
    '22': 'Nick Mantas',
    '23': 'Jamaal Myers',
    '24': 'Paul Ainslie',
    '25': 'Neethan Shan',
};

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

/** Borderless light pill — used across motion lists, search, ward/committee views */
export const TOPIC_LIGHT = {
    Housing: 'bg-blue-50 text-blue-700',
    Transit: 'bg-amber-50 text-amber-700',
    Finance: 'bg-emerald-50 text-emerald-700',
    Parks:   'bg-green-50 text-green-700',
    Climate: 'bg-teal-50 text-teal-700',
    Events:  'bg-purple-50 text-purple-700',
    General: 'bg-slate-100 text-slate-600',
};

/** Solid dot/bar colour — used in sidebar filters and VersusOverlay bars */
export const TOPIC_DOT = {
    Housing: 'bg-blue-500',
    Transit: 'bg-amber-500',
    Finance: 'bg-emerald-500',
    Parks:   'bg-green-500',
    Climate: 'bg-teal-500',
    Events:  'bg-purple-500',
    General: 'bg-slate-400',
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

// ─── Committee names (derived from motion ID prefix) ─────────────────────────

export const COMMITTEE_NAMES = {
  MM:  'City Council',
  CC:  'City Council',
  EX:  'Executive Committee',
  PH:  'Planning & Housing Committee',
  IE:  'Infrastructure & Environment Committee',
  EC:  'Economic & Community Development Committee',
  TE:  'Toronto & East York Community Council',
  EY:  'Etobicoke York Community Council',
  NY:  'North York Community Council',
  SC:  'Scarborough Community Council',
  GG:  'General Government & Licensing Committee',
  AU:  'Audit Committee',
  HL:  'Board of Health',
  MPB: 'Mayor\'s Policy & Budget',
  BL:  'Budget Committee',
  BU:  'Budget Committee',
  RM:  'Etobicoke York Community Council',
  DM:  'Deputy Mayor\'s Office',
  IA:  'Striking Committee',
  ST:  'Striking Committee',
  CA:  'Committee of Adjustment',
  ZB:  'Toronto Zoo Board',
  TTC: 'TTC Board',
  EP:  'Exhibition Place Board',
  PB:  'Toronto Preservation Board',
  PA:  'Toronto Parking Authority',
  DI:  'Disability Issues Committee',
  TA:  'Toronto Accessibility Advisory Committee',
  TM:  'Toronto-Metrolinx Working Group',
  FWC: 'FIFA World Cup 2026 Committee',
  FM:  'Inaugural Council Meeting',
  CT:  'City Theatre Advisory Board',
  CR:  'Community Resilience Committee',
};

export function getCommittee(motionId) {
  const code = motionId?.split('.')[0].replace(/\d/g, '') ?? '';
  return COMMITTEE_NAMES[code] ?? code;
}

// ─── Flag styling ─────────────────────────────────────────────────────────────

export const FLAG_STYLES = {
    'close-vote':       'bg-rose-50 text-rose-600 border-rose-200',
    'defeated':         'bg-slate-100 text-slate-500 border-slate-200',
    'unanimous':        'bg-emerald-50 text-emerald-600 border-emerald-200',
    'landslide-defeat': 'bg-slate-100 text-slate-400 border-slate-200',
};

export const FLAG_LABELS = {
    'close-vote':       'Close Vote',
    'defeated':         'Lost',
    'unanimous':        'Unanimous',
    'landslide-defeat': 'Landslide Loss',
};

export const FLAG_FILTER_STYLES = {
    'close-vote':       { active: 'bg-rose-600 text-white border-rose-600',      inactive: 'text-rose-600 border-rose-200 hover:border-rose-400 bg-rose-50/50' },
    'unanimous':        { active: 'bg-emerald-600 text-white border-emerald-600', inactive: 'text-emerald-700 border-emerald-200 hover:border-emerald-400 bg-emerald-50/50' },
    'landslide-defeat': { active: 'bg-slate-500 text-white border-slate-500',     inactive: 'text-slate-500 border-slate-200 hover:border-slate-400 bg-slate-50' },
    'defeated':         { active: 'bg-slate-700 text-white border-slate-700',     inactive: 'text-slate-600 border-slate-200 hover:border-slate-400 bg-slate-50' },
};
