// Shared helpers for working with Saleor product attributes.

export interface AttributeLike {
    attribute: {
        name?: string | null;
        slug?: string | null;
    };
    values?: Array<{ name?: string | null } | null> | null;
}

export function isHexColor(value: string | null | undefined): boolean {
    return !!value && /^#[0-9a-f]{3,8}$/i.test(value);
}

// Matches color attributes regardless of naming ("color", "colors",
// "ceramics-color", "اللون", ...) — color values in Saleor are hex codes.
export function isColorAttribute(attr: { name?: string | null; slug?: string | null }): boolean {
    const slug = (attr.slug || '').toLowerCase();
    const name = (attr.name || '').toLowerCase();
    if (!slug && !name) return false;
    if (slug === 'color' || slug === 'colors') return true;
    if (slug.includes('color') || slug.includes('colour')) return true;
    if (name === 'color' || name === 'colors' || name === 'اللون' || name === 'ألوان') return true;
    if (name.includes('color') || name.includes('colour') || name.includes('لون') || name.includes('ألوان')) return true;
    return false;
}

// Collects usable color swatches from product attributes (hex values only).
export function extractHexColors(attributes?: AttributeLike[] | null): Array<{ name: string; hex: string }> {
    if (!attributes || attributes.length === 0) return [];
    const colorAttr = attributes.find(a => a && isColorAttribute(a.attribute));
    if (!colorAttr) return [];
    return (colorAttr.values || [])
        .map(v => ({ name: v?.name || '', hex: v?.name || '' }))
        .filter(c => isHexColor(c.hex));
}

// True when the product carries a "handmade = yes" attribute (slug "handmade").
export function isHandmadeProduct(attributes?: AttributeLike[] | null): boolean {
    if (!attributes || attributes.length === 0) return false;
    const attr = attributes.find(a => {
        if (!a) return false;
        const slug = (a.attribute.slug || '').toLowerCase();
        const name = (a.attribute.name || '').toLowerCase();
        return slug === 'handmade' || name === 'handmade' || name === 'يدوي' || name === 'صناعة يدوية';
    });
    if (!attr) return false;
    return (attr.values || []).some(v => {
        const n = (v?.name || '').toLowerCase();
        return n === 'yes' || n === 'true' || n === 'نعم';
    });
}
