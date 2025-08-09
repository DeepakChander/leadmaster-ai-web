import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { exportLeadsToCSV, openInGoogleSheets, type Lead } from "@/utils/export";
import { Mail, Phone, Globe, MapPin, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface LeadsResultsProps {
  leads: Lead[];
}

const LeadsResults = ({ leads }: LeadsResultsProps) => {
  const { toast } = useToast();

  if (!leads?.length) return null;

  return (
    <section id="lead" className="py-12 border-t border-border">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">New Leads ({leads.length})</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => exportLeadsToCSV(leads)}>
              <Download className="mr-2 h-4 w-4" /> Download CSV
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
