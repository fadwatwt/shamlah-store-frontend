import { getCollections } from '../../lib/queries/collections';
import { Collection } from '../../lib/types/saleor';
import CollectionsContent from '../components/CollectionsContent';

export default async function CollectionsPage() {
    let collections: Collection[] = [];

    try {
        collections = await getCollections(20);
    } catch (error) {
        console.error('Error fetching collections:', error);
        collections = [];
    }

    return <CollectionsContent collections={collections} />;
}
