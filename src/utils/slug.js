export function nameToSlug(name) {
    return name.toLowerCase().replace(/'/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function slugToName(slug, names) {
    return names.find(n => nameToSlug(n) === slug) ?? null;
}

export function committeeToSlug(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
