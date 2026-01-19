'use client';

import { SidebarProvider } from '@/components/ui/sidebar';

interface AppShellProps {
    children: React.ReactNode;
    variant?: 'header' | 'sidebar';
    sidebarOpen?: boolean; // pass this from page/layout
}

export function AppShell({
    children,
    variant = 'header',
    sidebarOpen = false,
}: AppShellProps) {
    if (variant === 'header') {
        return (
            <div className="flex min-h-screen w-full flex-col">{children}</div>
        );
    }

    return <SidebarProvider defaultOpen={sidebarOpen}>{children}</SidebarProvider>;
}
