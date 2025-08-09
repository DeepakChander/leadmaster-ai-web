import HeaderNav from "@/components/HeaderNav";
import HeroSection from "@/components/HeroSection";

import { ShieldCheck, Zap, Database } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeaderNav />
      <main>
        <HeroSection />
        

        <section id="features" className="py-16">
          <div className="container mx-auto grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg border border-border hover-scale">
              <Zap className="text-primary" />
              <h3 className="mt-3 font-semibold">Fast & Accurate</h3>
              <p className="text-sm text-muted-foreground">AI processes data in seconds so you can act faster.</p>
            </div>
            <div className="p-6 rounded-lg border border-border hover-scale">
              <Database className="text-primary" />
              <h3 className="mt-3 font-semibold">Clean Exports</h3>
              <p className="text-sm text-muted-foreground">Download CSVs or paste directly into Google Sheets.</p>
            </div>
            <div className="p-6 rounded-lg border border-border hover-scale">
              <ShieldCheck className="text-primary" />
              <h3 className="mt-3 font-semibold">Reliable</h3>
              <p className="text-sm text-muted-foreground">Clear feedback, error handling, and responsive design.</p>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-16 border-t border-border">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold mb-6">How It Works</h2>
            <ol className="grid md:grid-cols-3 gap-6">
              <li className="p-6 rounded-lg border border-border">1. Enter a business type and location</li>
              <li className="p-6 rounded-lg border border-border">2. We search, process and enrich automatically</li>
              <li className="p-6 rounded-lg border border-border">3. Review results and export to CSV/Sheets</li>
            </ol>
          </div>
        </section>

        <section id="contact" className="py-16 border-t border-border">
          <div className="container mx-auto text-center">
            <h2 className="text-2xl font-bold mb-2">Contact</h2>
            <p className="text-muted-foreground">Questions? Email us at <a className="story-link" href="mailto:support@leadmaster.ai">support@leadmaster.ai</a></p>
          </div>
        </section>
      </main>
      <footer className="py-8 border-t border-border text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} LeadMaster AI. All rights reserved.
      </footer>
    </div>
  );
};

export default Index;
