import Header from '@/components/Home/header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, Lock, Eye, Share2, Trash2, FileText } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Learn how Beitrag collects, uses, and protects your personal data. Transparency and privacy are our top priorities.',
};


export default function PrivacyPage() {
  const sections = [
    {
      icon: Eye,
      title: 'What Information We Collect',
      content: 'We collect information you provide directly, such as your GitHub account details, email address, and profile information. We also automatically collect certain technical information when you use our service, including IP addresses, browser type, and usage patterns.'
    },
    {
      icon: Share2,
      title: 'How We Use Your Information',
      content: 'Your information is used to provide, maintain, and improve our services. We analyze GitHub data to generate analytics and insights. We never sell your data to third parties. We may use anonymized, aggregated data for analytics and research purposes.'
    },
    {
      icon: Lock,
      title: 'Data Security',
      content: 'We implement industry-standard security measures including encryption, firewalls, and secure authentication. Your GitHub token is encrypted and never stored in plain text. We conduct regular security audits and maintain compliance with GDPR and other privacy regulations.'
    },
    {
      icon: Share2,
      title: 'Third-Party Services',
      content: 'We integrate with GitHub to access your repository data. We use analytics services to understand user behavior. All third-party services are contractually obligated to protect your privacy and data.'
    },
    {
      icon: Trash2,
      title: 'Data Retention',
      content: 'We retain your data only as long as necessary to provide our services. You can request deletion of your account and associated data at any time. Deletion is permanent and cannot be reversed.'
    },
    {
      icon: FileText,
      title: 'Your Privacy Rights',
      content: 'You have the right to access, correct, or delete your personal data. You can control what data we collect through your account settings. You can opt-out of non-essential data collection at any time.'
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        </div>

        <div className="max-w-4xl mx-auto relative z-10 animate-slide-in-left">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-primary" />
            <span className="text-primary font-semibold">Your Privacy Matters</span>
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-4">Privacy Policy</h1>
          <p className="text-xl text-muted-foreground">
            We're committed to protecting your privacy and being transparent about how we handle your data.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <Card className="p-8 bg-card/50 backdrop-blur-xl border-border/50 mb-12 animate-slide-in-right">
            <h2 className="text-2xl font-bold text-foreground mb-4">Introduction</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Beitrag ("Company", "we", "us", "our", or "Platform") operates the Beitrag website and service. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We use your data to provide and improve the Service. By using Beitrag, you agree to the collection and use of information in accordance with this policy. Last updated: January 18, 2026.
            </p>
          </Card>

          {/* Privacy Sections Grid */}
          <div className="grid gap-6 mb-12">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <Card
                  key={index}
                  className="p-8 bg-card/50 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-all duration-300 animate-slide-in-right"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2">{section.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Contact Section */}
          <Card className="p-8 bg-card/50 backdrop-blur-xl border-border/50 animate-slide-in-left">
            <h2 className="text-2xl font-bold text-foreground mb-4">Contact Us</h2>
            <p className="text-muted-foreground mb-6">
              If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <div className="space-y-2 text-muted-foreground">
              <p>
                <strong className="text-foreground">Email:</strong> privacy@beitrag.com
              </p>
              <p>
                <strong className="text-foreground">Address:</strong> 123 Developer Street, Tech City, TC 12345
              </p>
              <p>
                <strong className="text-foreground">Response Time:</strong> We respond to privacy inquiries within 30 days
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 border-t border-border/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of developers using Beitrag to track their GitHub analytics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-in-left">
            <Link href="/login">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Sign In
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="border-border/50 bg-transparent">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
