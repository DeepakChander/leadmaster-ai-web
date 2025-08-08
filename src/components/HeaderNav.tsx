import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";

const HeaderNav = () => {
  const [open, setOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <nav className="container mx-auto flex items-center justify-between py-4">
        <a href="#home" onClick={(e) => { e.preventDefault(); scrollTo("home"); }} className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md" style={{ background: "var(--gradient-primary)" }} aria-hidden />
          <span className="font-bold text-lg gradient-text">LeadMaster AI</span>
        </a>
        <div className="hidden md:flex items-center gap-6">
          <a className="story-link text-sm" href="#features">Features</a>
          <a className="story-link text-sm" href="#how-it-works">How It Works</a>
          <a className="story-link text-sm" href="#contact">Contact</a>
          <Button variant="hero" onClick={() => scrollTo("lead")}>
            Generate Leads
          </Button>
        </div>
        <button className="md:hidden p-2" aria-label="Open menu" onClick={() => setOpen(!open)}>
          <Menu />
        </button>
      </nav>
      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container mx-auto py-3 flex flex-col gap-3">
            <a href="#features" onClick={(e) => { e.preventDefault(); scrollTo("features"); }}>Features</a>
            <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollTo("how-it-works"); }}>How It Works</a>
            <a href="#contact" onClick={(e) => { e.preventDefault(); scrollTo("contact"); }}>Contact</a>
            <Button variant="hero" onClick={() => scrollTo("lead")}>Generate Leads</Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default HeaderNav;
