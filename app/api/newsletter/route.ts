import { NextRequest, NextResponse } from 'next/server';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Footer newsletter signup → subscribes the email to Klaviyo (email marketing).
// Uses the server-side Subscribe Profiles endpoint with the private key, so the
// key never reaches the browser. Docs:
// https://developers.klaviyo.com/en/docs/collect_email_and_sms_consent_via_api
export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();
        const clean = (email || '').trim().toLowerCase();
        if (!EMAIL_RE.test(clean)) {
            return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 });
        }

        const apiKey = process.env.KLAVIYO_PRIVATE_API_KEY;
        const listId = process.env.KLAVIYO_LIST_ID;
        if (!apiKey || !listId) {
            console.error('[Newsletter] KLAVIYO_PRIVATE_API_KEY or KLAVIYO_LIST_ID missing');
            return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 503 });
        }

        // Debug: surface Klaviyo rejections in the dev server log.
        // Keep the original success path (202) — 5xx errors log + 502 to the UI.
        const res = await fetch('https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/', {
            method: 'POST',
            headers: {
                'Authorization': `Klaviyo-API-Key ${apiKey}`,
                'revision': '2024-10-15',
                'Content-Type': 'application/json',
                'accept': 'application/json',
            },
            body: JSON.stringify({
                data: {
                    type: 'profile-subscription-bulk-create-job',
                    attributes: {
                        custom_source: 'Website footer signup form',
                        profiles: {
                            data: [
                                {
                                    type: 'profile',
                                    attributes: {
                                        email: clean,
                                        subscriptions: { email: { marketing: { consent: 'SUBSCRIBED' } } },
                                    },
                                },
                            ],
                        },
                    },
                    relationships: { list: { data: { type: 'list', id: listId } } },
                },
            }),
        });

        if (res.status === 202 || res.ok) {
            return NextResponse.json({ ok: true });
        }
        // Log full body (was truncated before) so Payload/Response mismatch is visible.
        const errBody = await res.text();
        console.error('[Newsletter] Klaviyo error:', res.status, errBody);
        return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 502 });
    } catch (error) {
        console.error('[Newsletter] failed:', error);
        return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 500 });
    }
}
