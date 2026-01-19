import AppLayoutTemplate from './app-header-layout';
import { User, type BreadcrumbItem } from '@/app/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    user: User;
    githubData?: Record<string, any>;
}

export default function AppLayout({
    children,
    breadcrumbs,
    user,
    githubData,
}: AppLayoutProps) {
    return (
        <AppLayoutTemplate
            breadcrumbs={breadcrumbs}
            user={user}
            githubData={githubData}
        >
            {children}
        </AppLayoutTemplate>
    );
}
