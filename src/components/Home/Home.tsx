'use client';

import Header from './header';
import Hero from './hero';
import Features from './features';
import Metrics from './metrics';
import HowItWorks from './how-it-works';
import CTA from './cta';
import Footer from './footer';
import { StickyBanner } from '../ui/sticky-banner';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-hidden">

      <StickyBanner className="bg-gradient-to-b from-primary/90 to-primary">
        <p className="mx-0 max-w-[90%] text-white drop-shadow-md">
          Transform your GitHub activity into actionable insights with Beitrag.{" "}
          <a href="/#features" className="transition duration-200 hover:underline">
            Learn more
          </a>
        </p>
      </StickyBanner>
      <Header />
      <Hero />
      <Features />
      <Metrics />
      <HowItWorks />
      <CTA />
      <Footer />
    </main>
  );
}
