'use client';

import { usePathname } from 'next/navigation';

export default function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Check if the current route is the story page
  const isStoryPage = pathname === '/story' || pathname?.startsWith('/story/') || '/' || pathname?.startsWith('/');

  return (
    <div className={isStoryPage ? '' : 'px-16'}>
      {children}
    </div>
  );
}
