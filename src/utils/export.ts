export interface Lead {
  name?: string;
  address?: string;
  phone?: string;
  website?: string;
  email?: string;
  rating?: number | string;
}

export const exportLeadsToCSV = (leads: Lead[], filename = "leadmaster-leads.csv") => {
  const headers = ["Name","Address","Phone","Website","Email","Rating"];
  const rows = leads.map(l => [l.name||"", l.address||"", l.phone||"", l.website||"", l.email||"", l.rating??""].map(v => `"${String(v).replace(/"/g,'""')}"`).join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const openInGoogleSheets = async (leads: Lead[], toast?: any) => {
  const headers = ["Name","Address","Phone","Website","Email","Rating"];
  const rows = leads.map(l => [l.name||"", l.address||"", l.phone||"", l.website||"", l.email||"", l.rating??""].join("\t"));
  const tsv = [headers.join("\t"), ...rows].join("\n");
  try {
    await navigator.clipboard.writeText(tsv);
    toast?.({ title: "Copied", description: "Data copied. Paste into the new Google Sheet." });
  } catch (e) {
    // fallback: no clipboard
  }
  window.open("https://sheet.new", "_blank");
};
