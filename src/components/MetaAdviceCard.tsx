import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { League, TroopAdvice } from "./meta-advice/types";
import { calculateTotalUsage } from "./meta-advice/utils";
import { MetaAdviceHeader } from "./meta-advice/MetaAdviceHeader";
import { MetaAdviceContent } from "./meta-advice/MetaAdviceContent";

interface MetaAdviceCardProps {
  leagues: League[];
  selectedLeague: string;
  onLeagueChange: (league: string) => void;
  troops: TroopAdvice[];
  loading?: boolean;
  leaguesLoading?: boolean;
  onDataRefresh?: () => void;
}

export function MetaAdviceCard({ 
  leagues, 
  selectedLeague, 
  onLeagueChange, 
  troops, 
  loading = false,
  leaguesLoading = false,
  onDataRefresh
}: MetaAdviceCardProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [editedTroops, setEditedTroops] = useState<TroopAdvice[]>(troops);
  const [inputValues, setInputValues] = useState<Record<string, { count: string; percentage: string }>>({});

  const isAdmin = profile?.is_admin;

  // Keep editedTroops in sync with troops data when not in edit mode
  useEffect(() => {
    if (!editMode) {
      setEditedTroops([...troops]);
    }
  }, [troops, editMode]);

  const handleEdit = () => {
    setEditedTroops([...troops]);
    // Initialize input values with current troop values
    const initialInputValues: Record<string, { count: string; percentage: string }> = {};
    troops.forEach((troop, index) => {
      initialInputValues[`${troop.id}-${index}`] = {
        count: troop.usageCount.toString(),
        percentage: troop.usagePercentage.toFixed(1)
      };
    });
    setInputValues(initialInputValues);
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditedTroops([...troops]);
    setInputValues({});
    setEditMode(false);
  };

  const handleSave = async () => {
    if (!selectedLeague || editedTroops.length === 0) {
      toast({
        title: "Error",
        description: "No data to save",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get league ID
      const { data: leagueData, error: leagueError } = await supabase
        .from('leagues')
        .select('id')
        .eq('name', selectedLeague)
        .single();

      if (leagueError) throw leagueError;

      // Update each troop's counter advice
      const updates = editedTroops.map(async (troop) => {
        const { error } = await supabase
          .from('counter_advice')
          .update({
            usage_count: troop.usageCount,
            usage_percentage: troop.usagePercentage,
            rank: troop.rank,
            updated_at: new Date().toISOString()
          })
          .eq('league_id', leagueData.id)
          .eq('troop_id', troop.id);

        if (error) throw error;
      });

      await Promise.all(updates);

      toast({
        title: "✅ Changes Saved Successfully!",
        description: `Updated counter advice for ${selectedLeague}. Changes are now live for all users!`,
      });
      
      setEditMode(false);
      
      // Refresh the data
      if (onDataRefresh) {
        onDataRefresh();
      }
    } catch (error) {
      console.error('Error saving counter advice:', error);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCountChange = (index: number, newCount: string) => {
    const troop = editedTroops[index];
    if (!troop) return;
    
    // Update raw input value first
    const key = `${troop.id}-${index}`;
    setInputValues(prev => ({
      ...prev,
      [key]: { ...prev[key], count: newCount }
    }));
    
    // Only update troop data if it's a valid number
    const count = newCount === "" ? 0 : parseInt(newCount) || 0;
    
    setEditedTroops(prev => {
      const newTroops = [...prev];
      newTroops[index] = { ...newTroops[index], usageCount: count };
      
      // Recalculate percentages for all troops but don't update input values
      const totalUsage = calculateTotalUsage(newTroops);
      const troopsWithUpdatedPercentages = newTroops.map(t => ({
        ...t,
        usagePercentage: totalUsage > 0 ? (t.usageCount / totalUsage) * 100 : 0
      }));
      
      // Update input values for percentages (but not the count that's being edited)
      const newInputValues: Record<string, { count: string; percentage: string }> = {};
      troopsWithUpdatedPercentages.forEach((t, i) => {
        const inputKey = `${t.id}-${i}`;
        newInputValues[inputKey] = {
          count: i === index ? newCount : t.usageCount.toString(), // Keep the user's input for the current field
          percentage: t.usagePercentage.toFixed(1)
        };
      });
      
      // Update input values without causing re-render conflicts
      setTimeout(() => {
        setInputValues(newInputValues);
      }, 0);
      
      return troopsWithUpdatedPercentages;
    });
  };

  const handlePercentageChange = (index: number, newPercentage: string) => {
    const troop = editedTroops[index];
    if (!troop) return;
    
    // Update raw input value first
    const key = `${troop.id}-${index}`;
    setInputValues(prev => ({
      ...prev,
      [key]: { ...prev[key], percentage: newPercentage }
    }));
    
    // Only update troop data if it's a valid number
    const percentage = newPercentage === "" ? 0 : parseFloat(newPercentage) || 0;
    
    setEditedTroops(prev => {
      const newTroops = [...prev];
      newTroops[index] = { ...newTroops[index], usagePercentage: percentage };
      
      // Recalculate usage counts based on percentages using a base total of 1000
      const baseTotal = 1000;
      const troopsWithUpdatedCounts = newTroops.map(t => ({
        ...t,
        usageCount: Math.round((t.usagePercentage / 100) * baseTotal)
      }));
      
      // Update input values for counts (but not the percentage that's being edited)
      const newInputValues: Record<string, { count: string; percentage: string }> = {};
      troopsWithUpdatedCounts.forEach((t, i) => {
        const inputKey = `${t.id}-${i}`;
        newInputValues[inputKey] = {
          count: t.usageCount.toString(),
          percentage: i === index ? newPercentage : t.usagePercentage.toFixed(1) // Keep the user's input for the current field
        };
      });
      
      // Update input values without causing re-render conflicts
      setTimeout(() => {
        setInputValues(newInputValues);
      }, 0);
      
      return troopsWithUpdatedCounts;
    });
  };

  const displayTroops = editMode ? editedTroops : troops;

  return (
    <div className="w-full game-card">
      <MetaAdviceHeader
        isAdmin={!!isAdmin}
        isSpecificAdmin={profile?.email === 'waterflesjan@gmail.com'}
        selectedLeague={selectedLeague}
        editMode={editMode}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
      />
      
      <MetaAdviceContent
        leagues={leagues}
        selectedLeague={selectedLeague}
        onLeagueChange={onLeagueChange}
        leaguesLoading={leaguesLoading}
        troops={displayTroops}
        loading={loading}
        editMode={editMode}
        isAdmin={!!isAdmin}
        onCountChange={handleCountChange}
        onPercentageChange={handlePercentageChange}
        inputValues={inputValues}
      />
    </div>
  );
}