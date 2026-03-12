'use client';

import { useEffect, useState } from 'react';
import { getCategories } from '@/lib/queries/categories';
import { Category } from '@/lib/types/saleor';

export function useCategories(languageCode: 'AR' | 'EN' = 'EN') {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCategories() {
            setLoading(true);
            try {
                const data = await getCategories(languageCode);
                setCategories(data);
            } catch (error) {
                console.error('Error fetching categories:', error);
                setCategories([]);
            } finally {
                setLoading(false);
            }
        }

        fetchCategories();
    }, [languageCode]);

    return { categories, loading };
}
