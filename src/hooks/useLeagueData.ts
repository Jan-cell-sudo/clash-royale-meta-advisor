import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { League } from "@/types";
import { useToast } from "@/hooks/use-toast";

export const useLeagueData = () => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const { data: leaguesData, error: leaguesError } = await supabase
          .from('leagues')
          .select('*')
          .order('id');

        if (leaguesError) throw leaguesError;
        setLeagues(leaguesData || []);
      } catch (error) {
        console.error('Error fetching leagues:', error);
        toast({
          title: "Error",
          description: "Failed to load leagues data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLeagues();
  }, [toast]);

  return { leagues, loading };
};