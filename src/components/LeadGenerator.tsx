import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Globe, Phone, Mail, Star, MapPin, FileDown, FileSpreadsheet } from "lucide-react";
import { exportLeadsToCSV, openInGoogleSheets } from "@/utils/export";

interface Lead {
  name?: string;
  address?: string;
  phone?: string;
  website?: string;
  email?: string;
  rating?: number | string;
}

const WEBHOOK_URL = "https://toolsagentn8n.app.n8n.cloud/webhook/e5c0f357-c0a4-4ebc-9162-0382d8009539/chat";

const normalizeLead = (item: any): Lead => {
  const name = item?.name || item?.businessName || item?.["Business Name"] || item?.title;
  const address = item?.address || item?.formatted_address || item?.location || item?.["Address"];
  const phone = item?.phone || item?.phone_number || item?.["Phone"];
  const website = item?.website || item?.site || item?.url || item?.["Website"];
  const email = item?.email || item?.["Email"];
  const rating = item?.rating || item?.stars || item?.["Rating"];
  return { name, address, phone, website, email, rating } as Lead;
};

const LeadGenerator = () => {
  const { toast } = useToast();
  const [businessType, setBusinessType] = useState("");
  const [location, setLocation] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [includeEmails, setIncludeEmails] = useState<boolean>(true);
  const [limit, setLimit] = useState<number>(50);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [leads, setLeads] = useState<Lead[]>([]);

  const statusTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!loading) return;
    const steps = [
      "Searching Google Maps…",
      "Processing results…",
      "Extracting contact information…",
      "Finalizing data…",
    ];
    let i = 0;
    setStatus(steps[0]);
    const tick = () => {
      i = (i + 1) % steps.length;
      setStatus(steps[i]);
      // @ts-ignore
      statusTimer.current = window.setTimeout(tick, 1200);
    };
    // @ts-ignore
    statusTimer.current = window.setTimeout(tick, 1200);
    return () => {
      if (statusTimer.current) window.clearTimeout(statusTimer.current);
    };
  }, [loading]);

  const canSearch = useMemo(() => businessType.trim() && location.trim(), [businessType, location]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSearch) {
      toast({ title: "Missing info", description: "Please enter a business type and location." });
      return;
    }

    setLoading(true);
    setLeads([]);

    try {
      const payload = {
        query: { businessType: businessType.trim(), location: location.trim() },
        options: { minRating, includeEmails, limit },
      };

      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();

      // Try to find an array of leads in common shapes
      const arr = Array.isArray(data)
        ? data
        : data?.leads || data?.data || data?.result || data?.items || [];

      const normalized = (arr as any[]).map(normalizeLead).filter(l => l.name);
      setLeads(normalized);

      toast({ title: "Leads generated", description: `${normalized.length} results found.` });
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error", description: err?.message || "Failed to generate leads.", variant: "destructive" });
    } finally {
      setLoading(false);
      setStatus("");
    }
  };

  return (
    <section id="lead" className="py-12 md:py-16">
      <div className="container mx-auto">
        <Card className="animate-scale-in">
          <CardHeader>
            <CardTitle>Find business leads</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={onSubmit} className="grid md:grid-cols-[1fr_1fr_auto] gap-3">
              <Input
                placeholder="e.g., Coffee shops"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                aria-label="Business type"
              />
              <Input
                placeholder="e.g., Austin, TX"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                aria-label="Location"
              />
              <Button type="submit" variant="hero" disabled={loading || !canSearch}>
                {loading ? <><Loader2 className="animate-spin" /> Processing</> : "Generate Leads"}
              </Button>
            </form>
            <div className="flex items-center gap-3">
              <Switch id="advanced" checked={showAdvanced} onCheckedChange={setShowAdvanced} />
              <label htmlFor="advanced" className="text-sm">Advanced search options</label>
            </div>
            {showAdvanced && (
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs">Minimum rating</label>
                  <Input type="number" min={0} max={5} step={0.1} value={minRating}
                    onChange={(e) => setMinRating(parseFloat(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs">Result limit</label>
                  <Input type="number" min={1} max={200} value={limit}
                    onChange={(e) => setLimit(parseInt(e.target.value))} />
                </div>
                <div className="flex items-end gap-2">
                  <Switch id="emails" checked={includeEmails} onCheckedChange={setIncludeEmails} />
                  <label htmlFor="emails" className="text-sm">Try to include emails</label>
                </div>
              </div>
            )}

            {loading && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Loader2 className="animate-spin" /> {status}
              </div>
            )}

            {!loading && leads.length > 0 && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">{leads.length} results</p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => exportLeadsToCSV(leads)}>
                      <FileDown /> Export CSV
                    </Button>
                    <Button variant="secondary" onClick={() => openInGoogleSheets(leads, toast)}>
                      <FileSpreadsheet /> Google Sheets
                    </Button>
                  </div>
                </div>
                <Separator />
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {leads.map((lead, idx) => (
                    <Card key={idx} className="hover-scale">
                      <CardHeader>
                        <CardTitle className="text-base">{lead.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm space-y-2 text-muted-foreground">
                        {lead.address && (
                          <div className="flex items-center gap-2"><MapPin /> {lead.address}</div>
                        )}
                        {lead.phone && (
                          <div className="flex items-center gap-2"><Phone /> {lead.phone}</div>
                        )}
                        {lead.website && (
                          <div className="flex items-center gap-2"><Globe /> <a className="story-link" href={lead.website} target="_blank" rel="noreferrer">Website</a></div>
                        )}
                        {lead.email && (
                          <div className="flex items-center gap-2"><Mail /> {lead.email}</div>
                        )}
                        {lead.rating && (
                          <div className="flex items-center gap-2"><Star /> {lead.rating}</div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default LeadGenerator;
