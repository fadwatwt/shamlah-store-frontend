'use client';

import PolicyLayout, { PolicyBody, PolicySection } from '../components/PolicyLayout';
import { useLanguage } from '../context/LanguageContext';

export default function ReturnsPage() {
    const { t } = useLanguage();
    const content = t.infoPages.returns;

    return (
        <PolicyLayout title={content.title} subtitle={content.subtitle} showUpdated>
            <PolicyBody sections={content.sections as PolicySection[]} />
        </PolicyLayout>
    );
}
