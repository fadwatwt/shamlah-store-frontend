import { cookies } from 'next/headers';
import { getCollections } from '../../lib/queries/collections';
import { Collection } from '../../lib/types/saleor';
import CollectionsContent from '../components/CollectionsContent';
import { getRequestChannel } from '@/lib/saleor/get-request-channel';

export default async function CollectionsPage() {
    let collections: Collection[] = [];

    const cookieStore = await cookies();
    const language = cookieStore.get('language')?.value || 'en';
    const languageCode = language === 'ar' ? 'AR' : 'EN';

    try {
        // Same geo-channel as detail + home so listing never diverges.
        const channel = await getRequestChannel();
        collections = await getCollections(20, channel, languageCode as 'AR' | 'EN');
    } catch (error) {
        console.error('Error fetching collections:', error);
        collections = [];
    }

    return <CollectionsContent collections={collections} />;
}
