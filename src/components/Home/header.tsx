'use client';

import { Button } from '@/components/ui/button';
import { GitBranch } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import AppLogo from '../app-logo';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center  hover:opacity-70 transition">
           <AppLogo />
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition text-sm">
            Features
          </a>
          <a href="#metrics" className="text-muted-foreground hover:text-foreground transition text-sm">
            Metrics
          </a>
          <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition text-sm">
            How It Works
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="outline" className="hidden md:inline-flex bg-transparent">
              Sign In
            </Button>
          </Link>
          <Link href="/login">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
