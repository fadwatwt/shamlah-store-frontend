'use client';

import PolicyLayout, { PolicyBody, PolicySection } from '../components/PolicyLayout';
import { useLanguage } from '../context/LanguageContext';

export default function PrivacyPage() {
    const { t } = useLanguage();
    const content = t.infoPages.privacy;

    return (
        <PolicyLayout title={content.title} subtitle={content.subtitle} showUpdated>
            <PolicyBody sections={content.sections as PolicySection[]} />
        </PolicyLayout>
    );
}
