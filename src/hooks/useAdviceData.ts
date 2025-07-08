import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TroopAdvice } from "@/types";
import { useToast } from "@/hooks/use-toast";

export const useAdviceData = (selectedLeague: string) => {
  const [advice, setAdvice] = useState<TroopAdvice[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchAdvice = async () => {
    if (!selectedLeague) return;
    
    setLoading(true);
    try {
      // Get troop usage data for the selected league with proper trait mapping
      const { data, error } = await supabase
        .from('league_usage')
        .select('troop_id, troop_name, usage_count, usage_percentage')
        .eq('league', selectedLeague)
        .order('usage_percentage', { ascending: true })
        .limit(6);

      if (error) throw error;

      // Get trait family info
      const { data: troopData, error: troopError } = await supabase
        .from('troop_types')
        .select('id, trait_family');

      const troopTraits = troopData?.reduce((acc, troop) => {
        acc[troop.id] = troop.trait_family;
        return acc;
      }, {} as Record<number, string>) || {};

      // Transform data for the advice card
      const adviceData: TroopAdvice[] = (data || []).map((item, index) => ({
        id: item.troop_id,
        name: item.troop_name,
        usagePercentage: item.usage_percentage || 0,
        usageCount: item.usage_count || 0,
        traitFamily: troopTraits[item.troop_id] || "Unknown",
        rank: index + 1
      }));

      setAdvice(adviceData);
    } catch (error) {
      console.error('Error fetching advice:', error);
      toast({
        title: "Info",
        description: "No data available for this league yet. Upload screenshots to contribute!",
      });
      setAdvice([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvice();
  }, [selectedLeague]);

  return { advice, loading, fetchAdvice };
};