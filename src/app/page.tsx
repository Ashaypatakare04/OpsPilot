import React from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { SolutionFlow } from '@/components/landing/SolutionFlow';
import { AutonomyMatrix } from '@/components/landing/AutonomyMatrix';
import { WorkflowInteractiveDemo } from '@/components/landing/WorkflowInteractiveDemo';
import { TrustSecurity } from '@/components/landing/TrustSecurity';
import { Footer } from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas-950 text-graphite-100 flex flex-col selection:bg-blue-600/30 selection:text-blue-200">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ProblemSection />
        <SolutionFlow />
        <AutonomyMatrix />
        <WorkflowInteractiveDemo />
        <TrustSecurity />
      </main>
      <Footer />
    </div>
  );
}
