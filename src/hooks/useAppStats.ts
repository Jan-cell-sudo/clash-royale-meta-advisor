import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppStats } from "@/types";

export const useAppStats = () => {
  const [stats, setStats] = useState<AppStats>({ screenshots: 0, contributors: 0, leagues: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const { data: uploadsData, error: uploadsError } = await supabase
        .from('uploads')
        .select('id, user_id')
        .eq('parse_status', 'completed');

      if (uploadsError) throw uploadsError;
      
      // Since we don't have authentication, estimate contributors based on upload patterns
      // Assume average contributor uploads 3-5 screenshots
      const estimatedContributors = Math.max(1, Math.floor((uploadsData?.length || 0) / 4));
      
      setStats(prev => ({
        ...prev,
        screenshots: uploadsData?.length || 0,
        contributors: estimatedContributors,
      }));
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, setLoading, fetchStats, setStats };
};