import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseRealtimeUpdatesProps {
  onStatsUpdate: () => void;
  onAdviceUpdate: () => void;
  selectedLeague: string;
}

export const useRealtimeUpdates = ({ onStatsUpdate, onAdviceUpdate, selectedLeague }: UseRealtimeUpdatesProps) => {
  useEffect(() => {
    const uploadsChannel = supabase
      .channel('uploads-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'uploads',
          filter: 'parse_status=eq.completed'
        },
        () => {
          console.log('Upload completed, refreshing stats and advice');
          onStatsUpdate();
          onAdviceUpdate();
        }
      )
      .subscribe();

    const detectionsChannel = supabase
      .channel('detections-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'detections'
        },
        () => {
          console.log('New detections added, refreshing advice');
          setTimeout(() => {
            onAdviceUpdate();
          }, 1000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(uploadsChannel);
      supabase.removeChannel(detectionsChannel);
    };
  }, [selectedLeague, onStatsUpdate, onAdviceUpdate]);
};