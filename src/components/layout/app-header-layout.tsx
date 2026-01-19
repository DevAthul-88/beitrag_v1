import { AppContent } from '@/components/app-content';
import { AppHeader } from '@/components/app-header';
import { AppShell } from '@/components/app-shell';
import { type BreadcrumbItem, type User } from '@/app/types';
import type { PropsWithChildren } from 'react';

interface AppHeaderLayoutProps {
  breadcrumbs?: BreadcrumbItem[];
  user: User;
  githubData?: Record<string, any>;
}

export default function AppHeaderLayout({
  children,
  breadcrumbs,
  user,
  githubData,
}: PropsWithChildren<AppHeaderLayoutProps>) {
  return (
    <AppShell>
      <AppHeader breadcrumbs={breadcrumbs} user={user} githubData={githubData} />
      <AppContent>{children}</AppContent>
    </AppShell>
  );
}
