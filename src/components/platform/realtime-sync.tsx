"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type RealtimeSyncProps = {
  profileId: string;
};

export function RealtimeSync({ profileId }: RealtimeSyncProps) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const refresh = () => router.refresh();
    const notificationsChannel = supabase
      .channel(`notifications:${profileId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `profile_id=eq.${profileId}`,
        },
        refresh,
      )
      .subscribe();

    const activityChannel = supabase
      .channel(`activity:${profileId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "applications" },
        refresh,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "campaign_matches" },
        refresh,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        refresh,
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(notificationsChannel);
      void supabase.removeChannel(activityChannel);
    };
  }, [profileId, router]);

  return null;
}
