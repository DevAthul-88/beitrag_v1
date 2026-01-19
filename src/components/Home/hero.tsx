'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Github } from 'lucide-react';
import Link from 'next/link';
import { AnimatedListAll } from './animated-list';
import { PointerHighlight } from '../ui/pointer-highlight';
import AnimatedBadge from '../ui/animated-badge';


export default function Hero() {
  return (
    <section className="relative pt-20 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

        {/* LEFT: Content */}
        <div className="flex flex-col justify-center">
          {/* Badge */}
          <div className="mb-4">
            <AnimatedBadge
            text="Powered by GitHub API"
            color="#1447e6"
            href="https://docs.github.com/en/rest?apiVersion=2022-11-28"
          />

          </div>
          {/* Heading */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-foreground">
            Transform Your{" "}
            <span className="inline-block whitespace-nowrap align-baseline">
              <PointerHighlight>
                <span>GitHub</span>
              </PointerHighlight>
            </span>{" "}
            Activity Into Actionable Insights
          </h1>


          {/* Subheading */}
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-xl">
            Beitrag visualizes your entire developer journey. Track productivity metrics,
            analyze coding patterns, and understand contribution trends using real-time
            analytics and DORA metrics.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/login">
              <Button size="lg" className="gap-2">
                Connect GitHub
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              See Demo
            </Button>
          </div>
        </div>

        {/* RIGHT: Cubes */}
        <div className="relative hidden lg:flex justify-center lg:justify-end items-center">
          <AnimatedListAll />
        </div>
      </div>
    </section>
  );
}
