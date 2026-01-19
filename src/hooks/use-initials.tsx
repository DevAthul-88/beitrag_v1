import { useCallback } from 'react';

/**
 * Hook to generate initials from a full name.
 * Example: "Athul Vinod" => "AV"
 */
export function useInitials() {
  return useCallback((fullName: string): string => {
    if (!fullName) return '';

    const names = fullName.trim().split(' ');

    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }

    const firstInitial = names[0].charAt(0);
    const lastInitial = names[names.length - 1].charAt(0);

    return `${firstInitial}${lastInitial}`.toUpperCase();
  }, []);
}
