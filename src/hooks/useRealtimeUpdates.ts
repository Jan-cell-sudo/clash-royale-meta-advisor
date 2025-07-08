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

    // Listen for counter advice changes
    const counterAdviceChannel = supabase
      .channel('counter-advice-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'counter_advice'
        },
        () => {
          console.log('Counter advice updated, refreshing advice');
          setTimeout(() => {
            onAdviceUpdate();
          }, 500);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(uploadsChannel);
      supabase.removeChannel(detectionsChannel);
      supabase.removeChannel(counterAdviceChannel);
    };
  }, [selectedLeague, onStatsUpdate, onAdviceUpdate]);
};