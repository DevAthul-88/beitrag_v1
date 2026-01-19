import Header from '@/components/Home/header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, BookOpen, Zap, Lock, Gavel, Flag } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Read the terms and conditions governing the use of Beitrag, including user responsibilities, account rules, and legal information.',
};

export default function TermsPage() {
  const terms = [
    {
      icon: BookOpen,
      title: 'Acceptance of Terms',
      content: 'By accessing and using Beitrag, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.'
    },
    {
      icon: Zap,
      title: 'Use License',
      content: 'Permission is granted to temporarily download one copy of the materials (information or software) on Beitrag for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not: modify or copy materials; use materials for any commercial purpose or for any public display; attempt to decompile, disassemble, or reverse engineer software; remove copyright or other proprietary notations; transfer materials to another person or "mirror" materials on any other server.'
    },
    {
      icon: Lock,
      title: 'GitHub Integration',
      content: 'When you authorize Beitrag to access your GitHub account, you grant us permission to read repository data and generate analytics. You acknowledge that this access is subject to GitHub\'s terms of service. You can revoke access at any time through your GitHub settings.'
    },
    {
      icon: AlertCircle,
      title: 'Disclaimer of Warranties',
      content: 'The materials on Beitrag are provided on an "as is" basis. Beitrag makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.'
    },
    {
      icon: Gavel,
      title: 'Limitations of Liability',
      content: 'In no event shall Beitrag or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Beitrag, even if Beitrag or an authorized representative has been notified orally or in writing of the possibility of such damage.'
    },
    {
      icon: Flag,
      title: 'Accuracy of Materials',
      content: 'The materials appearing on Beitrag could include technical, typographical, or photographic errors. Beitrag does not warrant that any of the materials on its website are accurate, complete, or current. Beitrag may make changes to the materials contained on its website at any time without notice.'
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
            <Gavel className="w-8 h-8 text-primary" />
            <span className="text-primary font-semibold">Legal Information</span>
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-4">Terms of Service</h1>
          <p className="text-xl text-muted-foreground">
            Please read these terms carefully before using Beitrag.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <Card className="p-8 bg-card/50 backdrop-blur-xl border-border/50 mb-12 animate-slide-in-right">
            <h2 className="text-2xl font-bold text-foreground mb-4">Effective Date</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              These Terms of Service ("Terms") were last updated on January 18, 2026. We may update these Terms at any time by posting a new version on our website. Your continued use of the Service following the posting of revised Terms means that you accept and agree to the changes.
            </p>
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-foreground font-semibold mb-2">Important:</p>
              <p className="text-muted-foreground text-sm">
                These Terms constitute the entire agreement between you and Beitrag regarding your use of the Service and supersede all prior and contemporaneous agreements.
              </p>
            </div>
          </Card>

          {/* Terms Sections Grid */}
          <div className="grid gap-6 mb-12">
            {terms.map((term, index) => {
              const Icon = term.icon;
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
                      <h3 className="text-lg font-semibold text-foreground mb-2">{term.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{term.content}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* User Responsibilities */}
          <Card className="p-8 bg-card/50 backdrop-blur-xl border-border/50 mb-12 animate-slide-in-left">
            <h2 className="text-2xl font-bold text-foreground mb-4">Your Responsibilities</h2>
            <div className="space-y-3 text-muted-foreground">
              <p className="flex gap-2">
                <span className="text-primary font-bold min-w-6">•</span>
                <span>You are responsible for maintaining the confidentiality of your account credentials</span>
              </p>
              <p className="flex gap-2">
                <span className="text-primary font-bold min-w-6">•</span>
                <span>You agree not to use the Service for any illegal or unauthorized purpose</span>
              </p>
              <p className="flex gap-2">
                <span className="text-primary font-bold min-w-6">•</span>
                <span>You will not violate any laws, regulations, or third-party rights</span>
              </p>
              <p className="flex gap-2">
                <span className="text-primary font-bold min-w-6">•</span>
                <span>You agree not to attempt to gain unauthorized access to our systems</span>
              </p>
              <p className="flex gap-2">
                <span className="text-primary font-bold min-w-6">•</span>
                <span>You will not engage in harassment, abuse, or threatening behavior</span>
              </p>
            </div>
          </Card>

          {/* Termination */}
          <Card className="p-8 bg-card/50 backdrop-blur-xl border-border/50 mb-12 animate-slide-in-right">
            <h2 className="text-2xl font-bold text-foreground mb-4">Termination</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We reserve the right, in our sole discretion, to terminate your access to Beitrag without notice if: (1) you breach these Terms; (2) we believe your use violates any law or infringes on third-party rights; or (3) we discontinue the Service.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Upon termination, all rights and licenses granted to you will immediately cease. You remain liable for any damages caused by your use of the Service.
            </p>
          </Card>

          {/* Contact Section */}
          <Card className="p-8 bg-card/50 backdrop-blur-xl border-border/50 animate-slide-in-left">
            <h2 className="text-2xl font-bold text-foreground mb-4">Questions or Concerns?</h2>
            <p className="text-muted-foreground mb-6">
              If you have any questions regarding these Terms of Service, please contact us at:
            </p>
            <div className="space-y-2 text-muted-foreground">
              <p>
                <strong className="text-foreground">Email:</strong> devathulvinod@gmail.com
              </p>
              <p>
                <strong className="text-foreground">Address:</strong> 123 Developer Street, Tech City, TC 12345
              </p>
              <p>
                <strong className="text-foreground">Response Time:</strong> We respond to legal inquiries within 5 business days
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 border-t border-border/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Agree to Our Terms?</h2>
          <p className="text-muted-foreground mb-8">
            Start using Beitrag to analyze your GitHub activity today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-in-left">
            <Link href="/login">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Get Started
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
