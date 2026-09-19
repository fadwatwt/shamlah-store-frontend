'use client';

import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

// Footer newsletter column (beside the link columns, like most stores).
// POSTs to /api/newsletter (Klaviyo, server-side).
export default function NewsletterSignup() {
    const { t, dir } = useLanguage();
    const n = t.footer.newsletter;
    const [email, setEmail] = useState('');
    const [state, setState] = useState<'idle' | 'loading' | 'success' | 'invalid' | 'error'>('idle');

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (state === 'loading') return;
        const clean = email.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
            setState('invalid');
            return;
        }
        setState('loading');
        try {
            const res = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: clean }),
            });
            const data = await res.json();
            if (res.ok && data.ok) {
                setState('success');
                setEmail('');
            } else if (res.status === 400) {
                setState('invalid');
            } else {
                setState('error');
            }
        } catch {
            setState('error');
        }
    };

    return (
        <div dir={dir}>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-6">
                {n.title}
            </h3>
            <p className="text-gray-600 text-sm mb-4">{n.subtitle}</p>
            <form onSubmit={submit} className="space-y-3" noValidate>
                <input
                    type="email"
                    dir="ltr"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (state !== 'idle' && state !== 'loading') setState('idle'); }}
                    placeholder={n.placeholder}
                    aria-label={n.placeholder}
                    style={{ textAlign: !email && dir === 'rtl' ? 'right' : 'left' }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-sm text-sm placeholder:text-gray-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white"
                />
                <button
                    type="submit"
                    disabled={state === 'loading'}
                    className="w-full bg-accent text-white px-8 py-3 text-sm font-bold rounded-sm hover:bg-[#5a1214] smooth-transition disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
                >
                    {state === 'loading' ? '...' : n.button}
                </button>
            </form>
            {state === 'success' && (
                <p className="mt-3 text-sm text-green-700">{n.success}</p>
            )}
            {state === 'invalid' && (
                <p className="mt-3 text-sm text-red-500">{n.invalid}</p>
            )}
            {state === 'error' && (
                <p className="mt-3 text-sm text-red-500">{n.error}</p>
            )}
        </div>
    );
}
