'use client';

import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { type User } from '@/app/types';
import { LogOut, Settings, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface UserMenuContentProps {
    user: User;
    onLogout?: () => void; // optional callback for logout
}

export function UserMenuContent({ user, onLogout }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    // Ensure theme is mounted to prevent hydration mismatch
    useEffect(() => setMounted(true), []);

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
        toast.success('Signed out successfully')
    }

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
        cleanup();
    };

    if (!mounted) return null; // prevent render mismatch

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link
                        href={'/app/settings/'}
                        className="block w-full cursor-pointer"
                        onClick={cleanup}
                    >
                        <Settings className="mr-2" />
                        Settings
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={toggleTheme}
                    data-test="theme-toggle-button"
                >
                    {theme === 'light' ? (
                        <Moon className="mr-2" />
                    ) : (
                        <Sun className="mr-2" />
                    )}
                    {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
                <button
                    className="block w-full text-left cursor-pointer"
                    onClick={handleLogout}
                    data-test="logout-button"
                >
                    <LogOut className="mr-2" />
                    Log out
                </button>
            </DropdownMenuItem>
        </>
    );
}
