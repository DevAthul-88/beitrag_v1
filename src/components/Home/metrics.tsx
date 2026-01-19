'use client';

import React from 'react';
import { EvervaultCard } from '@/components/ui/evervault-card';
import { Zap, Clock, AlertCircle, Gauge } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

const metrics = [
  {
    icon: Zap,
    title: 'Deployment Frequency',
    description: 'How often code is deployed to production',
  },
  {
    icon: Clock,
    title: 'Lead Time for Changes',
    description: 'Time from code commit to production deployment',
  },
  {
    icon: AlertCircle,
    title: 'Change Failure Rate',
    description: 'Percentage of changes causing failures',
  },
  {
    icon: Gauge,
    title: 'Time to Restore Service',
    description: 'Average time to recover from incidents',
  },
];

export default function Metrics() {
  return (
    <section id="metrics" className="pt-32 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            DORA Metrics Tracking
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Monitor industry-standard DevOps performance indicators to optimize your development workflow
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, idx) => {
            const Icon = metric.icon;

            return (
              <div
                key={idx}
                className="relative h-[18rem] rounded-xl border border-border overflow-hidden"
              >
                {/* Evervault background */}
                <EvervaultCard text={metric.title} />

                {/* Content overlay */}
                <div className="relative z-10 p-6 h-full flex flex-col justify-end bg-gradient-to-t from-background/80 to-transparent">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>

                  <h3 className="font-semibold text-base mb-2 text-foreground">
                    {metric.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {metric.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom stats */}
        <Card className="mt-14">
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {[
                { value: '5+', label: 'DORA Metrics Available' },
                { value: 'Real-time', label: 'Data Updates' },
                { value: 'Custom', label: 'Date Range Filters' },
              ].map((stat, idx) => (
                <div key={idx}>
                  <div className="text-3xl font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>

    </section>
  );
}
