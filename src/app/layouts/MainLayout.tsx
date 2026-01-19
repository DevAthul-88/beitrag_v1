import { redirect } from 'next/navigation';
import { ReactNode } from 'react';
import AppLayout from '@/components/layout/app-layout';
import { createClient } from '@/lib/supabase/server';
import type { User as AppUser, User } from '@/app/types';

export default async function MainLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user: supabaseUser },
    error,
  } = await supabase.auth.getUser();

  if (error || !supabaseUser) {
    redirect('/login');
  }

  // Map Supabase user to app User interface
  const user: User = {
    id: supabaseUser.id,
    name: supabaseUser.user_metadata?.full_name || supabaseUser.email || 'User',
    email: supabaseUser.email || supabaseUser.user_metadata?.email || '',
    avatar: supabaseUser.user_metadata?.avatar_url || undefined,
    email_verified_at: supabaseUser.email_confirmed_at || null,
    created_at: supabaseUser.created_at,
    updated_at: supabaseUser.updated_at || new Date().toISOString(),
    user_metadata: supabaseUser.user_metadata || {},
  };

  // Fetch GitHub metadata (optional, can include extra info)
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const githubData = session?.user?.user_metadata || {};

  return (
    <AppLayout user={user} githubData={githubData}>
      <main>{children}</main>
    </AppLayout>
  );
}
