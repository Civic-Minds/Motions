/**
 * Static constants for Toronto Council Transparency
 */

export const FORMER_MEMBERS = {
  'John Tory':          'Resigned February 2023',
  'Gary Crawford':      'Resigned August 2023',
  'Jaye Robinson':      'Passed away June 2024',
  'Jennifer McKelvie':  'Resigned May 2025',
};

export const COUNCILLORS = [
    'Olivia Chow', 'Stephen Holyday', 'Amber Morley', 'Gord Perks', 'Alejandra Bravo',
    'Mike Colle', 'Anthony Perruzza', 'Josh Matlow', 'Dianne Saxe', 'Ausma Malik', 'Chris Moise',
    'Paula Fletcher', 'Lily Cheng', 'Shelley Carroll', 'Jon Burnside', 'Rachel Chernos Lin',
    'Brad Bradford', 'Parthi Kandavel', 'Paul Ainslie', 'Jamaal Myers', 'Neethan Shan',
    'Michael Thompson', 'Nick Mantas', 'Vincent Crisanti', 'Frances Nunziata', 'James Pasternak'
];

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
    '15': 'Rachel Chernos Lin',
    '16': 'Jon Burnside',
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

export const COMMITTEE_DESCRIPTIONS = {
  'City Council': 'The main decision-making body for the City of Toronto, composed of the Mayor and 25 Councillors.',
  'Executive Committee': 'Monitors city-wide priorities, financial planning, and intergovernmental relations. Often the first stop for major policy shifts.',
  'Planning & Housing Committee': 'Oversees the city’s growth and development, including urban planning, development apps, and affordable housing strategy.',
  'Infrastructure & Environment Committee': 'Focuses on the city’s physical systems: roads, transit infrastructure, water, waste, and climate change action.',
  'Economic & Community Development Committee': 'Covers social services, recreation, culture, public health, and business development across Toronto.',
  'General Government & Licensing Committee': 'Oversees city internal operations, property management, corporate assets, and various licensing matters.',
  'Audit Committee': 'Ensures accountability by reviewing the work of the Auditor General and city financial statements.',
  'Board of Health': 'Focuses on public health policy and the operations of Toronto Public Health.',
  'Budget Committee': 'A specialized group that reviews the city’s annual multi-billion dollar operating and capital budgets.',
  'Toronto & East York Community Council': 'Handles local planning, traffic, and neighborhood-specific matters for the downtown core and East York.',
  'North York Community Council': 'Deliberates on local issues across North York, including neighborhood developments and local safety requests.',
  'Scarborough Community Council': 'Manages community-level decisions and local planning applications for the Scarborough area.',
  'Etobicoke York Community Council': 'Reviews local planning and service issues specifically for the Etobicoke and York regions.',
  'TTC Board': 'Oversees the operations, policies, and multi-year planning of the Toronto Transit Commission.',
  'Mayor\'s Policy & Budget': 'Advises the Mayor on policy direction and budget priorities for the city.',
  'Deputy Mayor\'s Office': 'Supports the Deputy Mayor\'s portfolio and handles delegated council responsibilities.',
  'Striking Committee': 'Appoints councillors to committees, boards, and external bodies at the start of each council term.',
  'Committee of Adjustment': 'Hears applications for minor variances and land severances under provincial planning law.',
  'Toronto Zoo Board': 'Governs the Toronto Zoo, overseeing animal welfare, conservation programs, and park operations.',
  'Exhibition Place Board': 'Manages Exhibition Place grounds, including the CNE, BMO Field, and year-round event programming.',
  'Toronto Preservation Board': 'Advises council on heritage conservation, including designations and demolition reviews.',
  'Toronto Parking Authority': 'Operates the city\'s public parking facilities and sets rates across municipal lots and garages.',
  'Disability Issues Committee': 'Advises council on policies affecting people with disabilities, including accessibility and inclusion.',
  'Toronto Accessibility Advisory Committee': 'Reviews city policies and programs to ensure compliance with accessibility standards.',
  'Toronto-Metrolinx Working Group': 'Coordinates between the city and Metrolinx on regional transit projects like the Ontario Line and Eglinton Crosstown.',
  'FIFA World Cup 2026 Committee': 'Oversees Toronto\'s preparations as a host city for the 2026 FIFA World Cup.',
  'Inaugural Council Meeting': 'The ceremonial first meeting of a new council term where members are sworn in.',
  'City Theatre Advisory Board': 'Advises on the operations and programming of city-owned theatre venues.',
  'Community Resilience Committee': 'Focuses on emergency preparedness, community safety, and long-term resilience planning.',
  'Toronto Atmospheric Fund': 'An arms-length city agency funding projects that reduce greenhouse gas emissions and air pollution.',
  // Aliases matching exact names from the motions dataset
  'Toronto Zoo': 'Governs the Toronto Zoo, overseeing animal welfare, conservation programs, and park operations.',
  'Exhibition Place': 'Manages Exhibition Place grounds, including the CNE, BMO Field, and year-round event programming.',
  'FIFA World Cup 2026 Subcommittee': 'Oversees Toronto\'s preparations as a host city for the 2026 FIFA World Cup.',
  'Toronto Transit Commission': 'Oversees the operations, policies, and multi-year planning of the Toronto Transit Commission.',
  'Planning and Housing Committee': 'Oversees the city\'s growth and development, including urban planning, development applications, and affordable housing strategy.',
  'Infrastructure and Environment Committee': 'Focuses on the city\'s physical systems: roads, transit infrastructure, water, waste, and climate change action.',
  'Economic and Community Development Committee': 'Covers social services, recreation, culture, public health, and business development across Toronto.',
  'General Government Committee': 'Oversees city internal operations, property management, corporate assets, and various licensing matters.',
  'Toronto and East York Community Council': 'Handles local planning, traffic, and neighborhood-specific matters for the downtown core and East York.',
  'Confronting Anti-Black Racism Advisory Committee': 'Advises council on policies to address anti-Black racism and promote equity across city services and programs.',
  'TO Live': 'Manages the city\'s major performing arts venues including Meridian Hall, the St. Lawrence Centre, and Meridian Arts Centre.',
  'Civic Appointments Committee': 'Reviews and recommends public appointments to the city\'s agencies, boards, and corporations.',
};

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
