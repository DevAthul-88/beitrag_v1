'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Activity,
  TrendingUp,
  BarChart3,
  GitPullRequest,
  Eye,
  Download,
  Calendar,
  Zap,
  LucideIcon,
} from 'lucide-react';

const features = [
  {
    icon: Activity,
    title: 'Activity Overview',
    description: 'See commits, PRs, and code reviews at a glance with comprehensive dashboards',
  },
  {
    icon: BarChart3,
    title: 'Commit Analytics',
    description: 'Track commit frequency with customizable date ranges (7d, 30d, 90d)',
  },
  {
    icon: TrendingUp,
    title: 'Activity Heatmap',
    description: 'Visual calendar showing your daily contribution patterns and productivity',
  },
  {
    icon: GitPullRequest,
    title: 'PR Metrics',
    description: 'Monitor pull request statistics, sizes, and merge times for better insights',
  },
  {
    icon: Eye,
    title: 'Code Reviews',
    description: 'Track reviews given and response times to understand your review patterns',
  },
  {
    icon: Zap,
    title: 'DORA Metrics',
    description: 'Industry-standard DevOps metrics: deployment frequency, lead time, and more',
  },
  {
    icon: Download,
    title: 'Export Data',
    description: 'Download commits, PRs, and repository data in CSV format',
  },
  {
    icon: Calendar,
    title: 'Custom Filters',
    description: 'Analyze specific time periods and get tailored insights for your workflow',
  },
];

export default function Features() {
  return (
    <section id="features" className="pt-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Powerful Features</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Comprehensive analytics tools designed to help you understand your coding patterns and productivity
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  relative z-10 py-10 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Feature key={feature.title} {...feature} index={index} />
          ))}
        </div>

      </div>
    </section>
  );
}

const Feature = ({
  title,
  description,
  icon: Icon,
  index,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r py-10 relative group/feature dark:border-neutral-800",
        (index === 0 || index === 4) && "lg:border-l",
        index < 4 && "lg:border-b"
      )}
    >
      <div className="mb-4 relative z-10 px-10 text-neutral-600 dark:text-neutral-400">
        <Icon className="w-6 h-6" />
      </div>

      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-blue-500 transition-all duration-200" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block">
          {title}
        </span>
      </div>

      <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};
