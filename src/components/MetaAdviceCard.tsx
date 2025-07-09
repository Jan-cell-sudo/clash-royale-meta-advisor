import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LeagueSelector } from "./LeagueSelector";
import { AdminEditControls } from "./meta-advice/AdminEditControls";
import { TroopAdviceDisplay } from "./meta-advice/TroopAdviceDisplay";
import { League, TroopAdvice } from "./meta-advice/types";
import { calculateTotalUsage } from "./meta-advice/utils";

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

  const isAdmin = profile?.is_admin;

  // Keep editedTroops in sync with troops data when not in edit mode
  useEffect(() => {
    if (!editMode) {
      setEditedTroops([...troops]);
    }
  }, [troops, editMode]);

  const handleEdit = () => {
    setEditedTroops([...troops]);
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditedTroops([...troops]);
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
    const count = newCount === "" ? 0 : parseInt(newCount) || 0;
    setEditedTroops(prev => {
      const newTroops = prev.map((troop, i) => 
        i === index ? { ...troop, usageCount: count } : troop
      );
      
      // Recalculate percentages for all troops
      const totalUsage = calculateTotalUsage(newTroops);
      return newTroops.map(troop => ({
        ...troop,
        usagePercentage: totalUsage > 0 ? (troop.usageCount / totalUsage) * 100 : 0
      }));
    });
  };

  const handlePercentageChange = (index: number, newPercentage: string) => {
    const percentage = newPercentage === "" ? 0 : parseFloat(newPercentage) || 0;
    setEditedTroops(prev => {
      const newTroops = [...prev];
      newTroops[index] = { ...newTroops[index], usagePercentage: percentage };
      
      // Recalculate usage counts based on percentages
      // We'll use a base total of 1000 for calculations
      const baseTotal = 1000;
      return newTroops.map(troop => ({
        ...troop,
        usageCount: Math.round((troop.usagePercentage / 100) * baseTotal)
      }));
    });
  };

  const displayTroops = editMode ? editedTroops : troops;

  return (
    <div className="w-full game-card">
      <CardHeader style={{
        background: 'var(--gradient-winner)',
        borderBottom: '4px solid hsl(var(--accent))'
      }}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 font-game-title text-xl text-accent-foreground drop-shadow-lg">
            <Trophy className="h-6 w-6 animate-bounce-subtle" strokeWidth={3} />
            Choose Your League
          </CardTitle>
          {isAdmin && profile?.email === 'waterflesjan@gmail.com' && selectedLeague && (
            <AdminEditControls
              editMode={editMode}
              isAdmin={isAdmin}
              onEdit={handleEdit}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        <LeagueSelector
          leagues={leagues}
          selectedLeague={selectedLeague}
          onLeagueChange={onLeagueChange}
          loading={leaguesLoading}
        />

        {selectedLeague && (
          <TroopAdviceDisplay
            troops={displayTroops}
            loading={loading}
            editMode={editMode}
            isAdmin={!!isAdmin}
            selectedLeague={selectedLeague}
            onCountChange={handleCountChange}
            onPercentageChange={handlePercentageChange}
          />
        )}
      </CardContent>
    </div>
  );
}