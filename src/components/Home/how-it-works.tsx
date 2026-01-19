'use client';

import { Card } from '@/components/ui/card';
import { LogIn, RefreshCw, BarChart3, TrendingUp, Download } from 'lucide-react';
import { useState } from 'react';

const steps = [
  {
    number: '01',
    icon: LogIn,
    title: 'Connect GitHub',
    description: 'Sign in with your GitHub account using secure OAuth authentication. No passwords stored.',
  },
  {
    number: '02',
    icon: RefreshCw,
    title: 'Automatic Sync',
    description: 'Beitrag fetches your repositories, commits, PRs, and activity data automatically.',
  },
  {
    number: '03',
    icon: BarChart3,
    title: 'Visualize Data',
    description: 'See your productivity through interactive charts, heatmaps, and detailed metrics.',
  },
  {
    number: '04',
    icon: TrendingUp,
    title: 'Track Progress',
    description: 'Monitor trends over time with customizable date ranges and filtering options.',
  },
  {
    number: '05',
    icon: Download,
    title: 'Export Insights',
    description: 'Download your data in CSV format for external analysis and reporting.',
  },
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="how-it-works" className="pt-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">How It Works</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get started in minutes with a simple five-step process
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx === activeStep;

            return (
              <Card
                key={idx}
                onMouseEnter={() => setActiveStep(idx)}
                className={`
                  h-full p-6 flex flex-col justify-between
                  transition-all duration-300
                  ${isActive ? 'border-primary/50 bg-primary/5' : 'border-border bg-card hover:border-primary/30'}
                `}
              >
                {/* Top Content */}
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className={`text-sm font-mono font-semibold ${
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      {step.number}
                    </div>
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                        isActive ? 'bg-primary/20' : 'bg-muted/20'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                  </div>

                  <h3 className="font-semibold text-sm text-foreground mb-2">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                </div>

                {/* Bottom Accent */}
                <div className="mt-6">
                  <div
                    className={`h-1 w-full rounded-full transition-all ${
                      isActive ? 'bg-primary/40' : 'bg-muted/30'
                    }`}
                  />
                </div>
              </Card>
            );
          })}
        </div>

        {/* Process Visualization */}
        <div className="relative mt-20">
          <Card className="p-12 rounded-lg border-border bg-card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-xl font-bold mb-6 text-foreground">Security & Privacy First</h3>
                <ul className="space-y-3">
                  {[
                    'Secure OAuth authentication through GitHub',
                    'Tokens stored securely in encrypted database',
                    'Read-only access to GitHub repositories',
                    'Users can disconnect and delete data anytime',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Card className="p-8 rounded-lg border-border bg-primary/5">
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">Enterprise Grade</div>
                  <p className="text-sm text-muted-foreground mb-4">Your data is safe and secure with us</p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div>✓ End-to-end encrypted</div>
                    <div>✓ GDPR compliant</div>
                    <div>✓ No third-party tracking</div>
                  </div>
                </div>
              </Card>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
