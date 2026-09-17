// Deterministic "copy link" that behaves identically on Windows / macOS / mobile.
// navigator.share() is intentionally NOT used: its sheet (and whether it even
// offers "Copy link") belongs to the OS/browser and varies per device.
// The Clipboard API needs a secure context, so HTTP / old browsers fall back
// to the classic hidden-textarea execCommand('copy') path.
export async function copyTextToClipboard(text: string): Promise<boolean> {
    try {
        if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        }
        throw new Error('clipboard-api-unavailable');
    } catch {
        try {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.setAttribute('readonly', '');
            ta.style.position = 'fixed';
            ta.style.top = '-9999px';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            ta.setSelectionRange(0, ta.value.length);
            const ok = document.execCommand('copy');
            document.body.removeChild(ta);
            return ok;
        } catch {
            return false;
        }
    }
}
