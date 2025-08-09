import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { Lead } from "@/utils/export";

const toLead = (row: any): Lead => ({
  name: row?.name ?? row?.title ?? row?.business_name ?? undefined,
  address: row?.address ?? row?.formatted_address ?? undefined,
  phone: row?.phone ?? row?.phone_number ?? undefined,
  website: row?.website ?? row?.site ?? undefined,
  email: row?.email ?? row?.emails ?? undefined,
  rating: row?.rating ?? row?.score ?? undefined,
});

export function useLeadsRealtime(table = "leads") {
  const [leads, setLeads] = useState<Lead[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const sessionStartedAtRef = useRef<Date | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, []);

  const startNewSession = async () => {
    // Reset state
    setLeads([]);
    sessionStartedAtRef.current = new Date();

    // Remove previous channel
    if (channelRef.current) {
      try { supabase.removeChannel(channelRef.current); } catch {}
      channelRef.current = null;
    }

    // Subscribe to INSERTs on the table
    const channel = supabase
      .channel(`lead-updates-${crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table },
        (payload) => {
          const row = payload.new as any;
          const createdAt = row?.created_at ? new Date(row.created_at) : null;
          const sessionStart = sessionStartedAtRef.current;

          // Only accept rows after session start (if created_at available). Otherwise, accept all after subscription.
          if (!sessionStart || !createdAt || createdAt >= sessionStart) {
            setLeads((prev) => [toLead(row), ...prev]);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;
  };

  return {
    leads,
    startNewSession,
    clear: () => setLeads([]),
  } as const;
}
