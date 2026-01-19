'use client';

import { usePathname } from 'next/navigation';

export function useActiveUrl() {
    const pathname = usePathname(); // current path

    function urlIsActive(urlToCheck: string, currentUrl?: string) {
        const urlToCompare = currentUrl ?? pathname;
        return urlToCheck === urlToCompare;
    }

    return {
        currentUrl: pathname,
        urlIsActive,
    };
}
