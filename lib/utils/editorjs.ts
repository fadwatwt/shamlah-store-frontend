// Saleor rich-text fields (product/collection/category descriptions) are stored
// as EditorJS JSON: {"blocks":[{"type":"paragraph","data":{"text":"..."}}]}.
// This extracts readable plain text; non-JSON strings pass through untouched.

function stripHtml(html: string): string {
    return html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p\s*>/gi, '\n')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .trim();
}

export function editorJsToText(value: string | null | undefined): string {
    if (!value) return '';
    const trimmed = value.trim();
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return value;
    try {
        const parsed = JSON.parse(trimmed);
        const blocks = Array.isArray(parsed) ? parsed : parsed?.blocks;
        if (!Array.isArray(blocks)) return value;
        const parts: string[] = [];
        for (const block of blocks) {
            const data = (block as { data?: { text?: unknown; items?: unknown } })?.data;
            if (!data) continue;
            if (typeof data.text === 'string' && data.text.trim()) {
                parts.push(stripHtml(data.text));
            } else if (Array.isArray(data.items)) {
                for (const item of data.items) {
                    if (typeof item === 'string' && item.trim()) parts.push(stripHtml(item));
                    else if (item && typeof (item as { content?: unknown }).content === 'string') {
                        parts.push(stripHtml((item as { content: string }).content));
                    }
                }
            }
        }
        const text = parts.filter(Boolean).join('\n\n');
        return text || value;
    } catch {
        return value;
    }
}
