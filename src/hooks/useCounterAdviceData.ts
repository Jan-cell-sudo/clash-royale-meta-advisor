import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TroopAdvice } from "@/types";
import { useToast } from "@/hooks/use-toast";

export const useCounterAdviceData = (selectedLeague: string) => {
  const [advice, setAdvice] = useState<TroopAdvice[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchAdvice = async () => {
    if (!selectedLeague) return;
    
    setLoading(true);
    try {
      // Get league ID
      const { data: leagueData, error: leagueError } = await supabase
        .from('leagues')
        .select('id')
        .eq('name', selectedLeague)
        .maybeSingle();

      if (leagueError) throw leagueError;
      if (!leagueData) {
        setAdvice([]);
        return;
      }

      // Get counter advice data for the selected league with troop details
      const { data, error } = await supabase
        .from('counter_advice')
        .select('troop_id, usage_count, usage_percentage, rank')
        .eq('league_id', leagueData.id)
        .order('rank', { ascending: true });

      if (error) throw error;

      // Get troop details separately
      const { data: troopData, error: troopError } = await supabase
        .from('troop_types')
        .select('id, name, trait_family');

      if (troopError) throw troopError;

      // Create a map of troop details
      const troopMap = troopData?.reduce((acc, troop) => {
        acc[troop.id] = troop;
        return acc;
      }, {} as Record<number, { name: string; trait_family: string | null }>) || {};

      // Transform data for the advice card
      const adviceData: TroopAdvice[] = (data || []).map((item) => {
        const troopDetails = troopMap[item.troop_id];
        return {
          id: item.troop_id,
          name: troopDetails?.name || 'Unknown',
          usagePercentage: item.usage_percentage || 0.1,
          usageCount: item.usage_count || 1,
          traitFamily: troopDetails?.trait_family || "Unknown",
          rank: item.rank
        };
      });

      setAdvice(adviceData);
    } catch (error) {
      console.error('Error fetching counter advice:', error);
      toast({
        title: "Info",
        description: "No counter advice available for this league yet.",
      });
      setAdvice([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvice();
    
    // Set up real-time listener for counter advice changes
    const channel = supabase
      .channel('counter-advice-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'counter_advice'
        },
        () => {
          console.log('Counter advice changed, refreshing...');
          fetchAdvice();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedLeague]);

  return { advice, loading, fetchAdvice };
};