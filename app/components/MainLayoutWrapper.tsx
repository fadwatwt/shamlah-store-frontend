'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LoadingOverlay } from './LoadingSpinner';

export default function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Hide loader when pathname changes
    setIsNavigating(false);
  }, [pathname]);

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (
        anchor && 
        anchor.href && 
        anchor.href.startsWith(window.location.origin) &&
        !anchor.href.includes('#') &&
        anchor.target !== '_blank'
      ) {
        // Only show for internal links
        const targetUrl = new URL(anchor.href);
        if (targetUrl.pathname !== window.location.pathname) {
          setIsNavigating(true);
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  // Check if the current route is the story page
  const isStoryPage = pathname === '/story' || pathname?.startsWith('/story/') || pathname === '/';

  return (
    <div className={isStoryPage ? '' : 'px-16'}>
      {isNavigating && <LoadingOverlay />}
      {children}
    </div>
  );
}
