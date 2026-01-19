'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Github, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function CTA() {
  const features = [
    { value: '0%', label: 'Setup time' },
    { value: '100%', label: 'Privacy guaranteed' },
    { value: '∞', label: 'Unlimited exports' },
  ];

  return (
    <section className="py-32 px-6">
      <div className="max-w-3xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card mb-6">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs text-muted-foreground font-medium">Join thousands of developers</span>
        </div>

        {/* Main Heading */}
        <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-foreground">
          Ready to understand your GitHub activity?
        </h2>

        {/* Subheading */}
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          Start tracking your developer productivity today. Beitrag transforms raw GitHub data into insights that help you grow as an engineer.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link href="/login">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              <Github className="w-4 h-4" />
              Connect Your GitHub
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Button size="lg" variant="outline">
            Schedule Demo
          </Button>
        </div>

        {/* Features showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((item, idx) => (
            <Card
              key={idx}
              className="p-6 text-center border-border bg-card hover:bg-card/80 transition-colors"
            >
              <div className="text-3xl font-bold text-primary mb-2">{item.value}</div>
              <p className="text-sm text-muted-foreground">{item.label}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
