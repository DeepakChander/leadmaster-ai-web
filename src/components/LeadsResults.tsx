import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { exportLeadsToCSV, openInGoogleSheets, type Lead } from "@/utils/export";
import { Mail, Phone, Globe, MapPin, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

interface LeadsResultsProps {
  leads: Lead[];
  sessionStart?: Date;
}

const LeadsResults = ({ leads, sessionStart }: LeadsResultsProps) => {
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (): Promise<void> => {
    if (!leads?.length && !sessionStart) {
      toast({ title: "No data", description: "No leads to export yet." });
      return;
    }
    try {
      setDownloading(true);
      if (sessionStart) {
        const sinceIso = sessionStart.toISOString();
        const { data, error } = await (supabase
          .from("leads")
          .select("*")
          .gte("created_at", sinceIso) as any).csv();
        if (error) throw error;
        const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `leads_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // Fallback to in-memory leads
        exportLeadsToCSV(leads);
      }
    } catch (e: any) {
      toast({ title: "Export failed", description: e?.message || "Could not download CSV", variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  if (!leads?.length) return null;

  return (
    <section id="lead" className="py-12 border-t border-border">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">New Leads ({leads.length})</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownload} disabled={downloading}>
              <Download className="mr-2 h-4 w-4" /> {downloading ? "Preparing CSV..." : "Download CSV"}
            </Button>
            <Button variant="default" onClick={() => openInGoogleSheets(leads, toast)}>
              Open in Sheets
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leads.map((l, idx) => (
            <Card key={`${l.name}-${idx}`} className="animate-fade-in">
              <CardHeader>
                <CardTitle className="text-lg">{l.name || "Unknown"}</CardTitle>
                <CardDescription>Rating: {l.rating ?? "-"}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                {l.address && (
                  <div className="flex items-start gap-2"><MapPin className="h-4 w-4" /> <span>{l.address}</span></div>
                )}
                {l.phone && (
                  <div className="flex items-start gap-2"><Phone className="h-4 w-4" /> <span>{l.phone}</span></div>
                )}
                {l.email && (
                  <div className="flex items-start gap-2"><Mail className="h-4 w-4" /> <span>{l.email}</span></div>
                )}
                {l.website && (
                  <div className="flex items-start gap-2"><Globe className="h-4 w-4" /> <a className="story-link" href={l.website} target="_blank" rel="noreferrer">{l.website}</a></div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LeadsResults;
