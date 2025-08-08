import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles } from "lucide-react";

const benefits = [
  "AI-powered Google Maps scraping",
  "Instant, accurate business data",
  "Clean export to CSV or Google Sheets",
];

const HeroSection = () => {
  const scrollToLead = () => document.getElementById("lead")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="home" className="pt-28 pb-16 md:pt-32 md:pb-24">
      <div className="container mx-auto grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs">
            <Sparkles className="text-primary" />
            <span>AI-Powered Business Lead Generation in Seconds</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Generate High-Quality Business Leads <span className="gradient-text">Instantly</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Search Google Maps with AI, process results, and export clean business contacts — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="hero" size="lg" onClick={scrollToLead}>
              Start Generating Leads
            </Button>
            <a href="#how-it-works" className="story-link self-center sm:self-auto">See how it works</a>
          </div>
          <ul className="grid gap-2">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="text-[hsl(var(--accent-green))]" /> {b}
              </li>
            ))}
          </ul>
        </div>
        <div className="hidden md:block animate-slide-in-right">
          <div className="rounded-xl p-8 shadow-[var(--shadow-elevated)] border border-border" style={{ background: "var(--gradient-primary)" }}>
            <div className="bg-background/80 rounded-md p-6 glass">
              <p className="text-sm">“Find coffee shops in Austin” ➜ leads in seconds</p>
              <div className="mt-4 h-36 rounded-md border border-border bg-background/60" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
