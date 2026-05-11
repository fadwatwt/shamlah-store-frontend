'use client';

import { createContext, useContext } from 'react';
import { Category } from '@/lib/types/saleor';

const CategoriesContext = createContext<Category[]>([]);

export function CategoriesProvider({ children, categories }: { children: React.ReactNode; categories: Category[] }) {
    return <CategoriesContext.Provider value={categories}>{children}</CategoriesContext.Provider>;
}

export function useCategoriesContext() {
    return useContext(CategoriesContext);
}
