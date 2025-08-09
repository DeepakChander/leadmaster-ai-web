import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Sparkles, Search, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useLeadsRealtime } from "@/hooks/useLeadsRealtime";
import LeadsResults from "@/components/LeadsResults";
import ClarificationChat from "@/components/ClarificationChat";

const benefits = [
  "AI-powered Google Maps scraping",
  "Instant, accurate business data",
  "Clean export to CSV or Google Sheets",
];

const HeroSection = () => {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [progressIndex, setProgressIndex] = useState(0);
  const { leads, startNewSession, clear } = useLeadsRealtime("leads");
  const [sessionStart, setSessionStart] = useState<Date | null>(null);
  const progressMessages = [
    "Searching Google Maps...",
    "Processing results...",
    "Preparing leads...",
  ];
  const intervalRef = useRef<number | null>(null);

  // Session + Clarification chat state
  const sessionIdRef = useRef<string | null>(null);
  const [isClarificationOpen, setClarificationOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: "assistant" | "user"; text: string }[]>([]);
  const [isBotTyping, setBotTyping] = useState(false);

  const isClarificationOutput = (output?: string) => {
    if (!output) return false;
    const clarificationKeywords = [
      "country code",
      "which country",
      "please specify",
      "need more information",
      "clarify",
    ];
    const lower = output.toLowerCase();
    return clarificationKeywords.some((k) => lower.includes(k));
  };

  useEffect(() => {
    if (loading) {
      intervalRef.current = window.setInterval(() => {
        setProgressIndex((i) => (i + 1) % progressMessages.length);
      }, 1500);
    } else if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
      setProgressIndex(0);
    }

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [loading]);

  const generateSessionId = () =>
    (crypto as any)?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const submitQuery = async (userInput: string) => {
    const webhookUrl =
      "https://toolsagentn8n.app.n8n.cloud/webhook/e5c0f357-c0a4-4ebc-9162-0382d8009539/chat";

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 60000); // 60s timeout

    try {
      setLoading(true);
      // Mark session start for CSV export filtering
      setSessionStart(new Date());

      // Start a fresh session for new query
      sessionIdRef.current = generateSessionId();
      clear();
      await startNewSession();

      const body = {
        // Legacy payload (if workflow expects these)
        chatInput: userInput,
        action: "sendMessage",
        sessionId: sessionIdRef.current,
        // New bidirectional chat payload (if workflow expects these)
        message: userInput,
        session_id: sessionIdRef.current,
        timestamp: new Date().toISOString(),
      } as any;

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const result = await response.json().catch(() => undefined as any);

      const output: string | undefined = result?.output ?? result?.message ?? result?.text;
      const needsClarification = result?.type === "clarification" || isClarificationOutput(output);

      if (needsClarification) {
        setClarificationOpen(true);
        setChatMessages((prev) => [...prev, { role: "assistant", text: output || "I need a quick clarification to proceed." }]);
      } else {
        toast({ title: "Query sent", description: "Collecting new leads in real time..." });
      }
    } catch (error: any) {
      const msg =
        error?.name === "AbortError"
          ? "Request timed out. Please try again."
          : error?.message || "Something went wrong";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      window.clearTimeout(timeout);
      setLoading(false);
    }
  };

  const handleSendFollowUp = async (message: string) => {
    const webhookUrl =
      "https://toolsagentn8n.app.n8n.cloud/webhook/e5c0f357-c0a4-4ebc-9162-0382d8009539/chat";

    // Append user message immediately
    setChatMessages((prev) => [...prev, { role: "user", text: message }]);
    setBotTyping(true);

    try {
      if (!sessionIdRef.current) {
        sessionIdRef.current = generateSessionId();
      }

      const body = {
        // Legacy
        chatInput: message,
        action: "sendMessage",
        sessionId: sessionIdRef.current,
        // New bidirectional
        message,
        session_id: sessionIdRef.current,
        is_follow_up: true,
        timestamp: new Date().toISOString(),
      } as any;

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json().catch(() => undefined as any);
      const output: string | undefined = result?.output ?? result?.message ?? result?.text;
      const needsClarification = result?.type === "clarification" || isClarificationOutput(output);

      if (needsClarification) {
        setChatMessages((prev) => [...prev, { role: "assistant", text: output || "Got it. One more detail please…" }]);
      } else {
        setClarificationOpen(false);
        if (output) {
          setChatMessages((prev) => [...prev, { role: "assistant", text: output }]);
        }
        // Results will stream via Supabase in real time
      }
    } catch (error: any) {
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", text: "There was an error. Please try again in a moment." },
      ]);
    } finally {
      setBotTyping(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = query?.trim();
    if (!value) {
      toast({ title: "Enter a search", description: "e.g. Find restaurants in Paris, France" });
      return;
    }
    submitQuery(value);
  };

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
            AI-powered Google Maps scraping to find verified business contacts in any location worldwide
          </p>

          {/* Single Search Bar */}
          <form onSubmit={onSubmit} className="w-full">
            <div className="w-full max-w-2xl md:min-w-[400px]">
              <div className="flex items-center gap-2 rounded-lg border border-border p-2 bg-background shadow-sm">
                <Search className="text-muted-foreground ml-1" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Find restaurants in Paris, France"
                  className="border-0 focus-visible:ring-0"
                />
                <Button type="submit" variant="hero" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating
                    </>
                  ) : (
                    "Generate Leads"
                  )}
                </Button>
              </div>
              {loading && (
                <p className="mt-2 text-sm text-muted-foreground animate-fade-in">{progressMessages[progressIndex]}</p>
              )}
            </div>
          </form>

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

      {/* Results */}
      <LeadsResults leads={leads} sessionStart={sessionStart ?? undefined} />
      <ClarificationChat
        open={isClarificationOpen}
        messages={chatMessages}
        typing={isBotTyping}
        onSend={handleSendFollowUp}
        onClose={() => setClarificationOpen(false)}
      />
    </section>
  );
};

export default HeroSection;

