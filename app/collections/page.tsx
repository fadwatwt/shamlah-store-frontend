import { cookies } from 'next/headers';
import { getCollections } from '../../lib/queries/collections';
import { Collection } from '../../lib/types/saleor';
import CollectionsContent from '../components/CollectionsContent';

export default async function CollectionsPage() {
    let collections: Collection[] = [];

    const cookieStore = await cookies();
    const language = cookieStore.get('language')?.value || 'en';
    const languageCode = language === 'ar' ? 'AR' : 'EN';

    try {
        collections = await getCollections(20, 'default-channel', languageCode as 'AR' | 'EN');
    } catch (error) {
        console.error('Error fetching collections:', error);
        collections = [];
    }

    return <CollectionsContent collections={collections} />;
}
