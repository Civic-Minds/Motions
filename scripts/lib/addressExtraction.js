// Shared match/dedupe mechanism behind Toronto's and Vancouver's address
// extraction. Each city keeps its own street-suffix regexes and exclusion
// rules (hard-won against real false positives like bylaw numbers) — only
// the "run both regexes, split grouped street numbers, dedupe, filter"
// pipeline is shared, so city-specific matching behaviour is unchanged.
export function extractAddresses(title, { addressRe, groupedRe, exclude, cleanup }) {
  addressRe.lastIndex = 0;
  groupedRe.lastIndex = 0;

  const grouped = [...title.matchAll(groupedRe)].flatMap(match =>
    match[1].split(/\s*(?:,|and|&)\s*/i).map(number => `${number} ${match[2]}`)
  );
  const individual = [...title.matchAll(addressRe)].map(m => m[1].trim());

  let addresses = [...new Set([...grouped, ...individual])];
  if (cleanup) addresses = addresses.map(cleanup);
  return addresses.filter(address => !exclude.test(address));
}
