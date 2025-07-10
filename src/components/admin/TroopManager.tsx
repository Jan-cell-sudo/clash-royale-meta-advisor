import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TroopManagerHeader } from "./TroopManager/TroopManagerHeader";
import { TroopManagerLoadingSkeleton } from "./TroopManager/TroopManagerLoadingSkeleton";
import { TroopManagerEmptyState } from "./TroopManager/TroopManagerEmptyState";
import { TroopItem } from "./TroopManager/TroopItem";
import { TroopManagerActions } from "./TroopManager/TroopManagerActions";

interface AvailableTroop {
  id: number;
  name: string;
  description: string | null;
  trait_family: string | null;
}

interface TroopManagerProps {
  selectedLeague: string;
  onTroopAdded?: () => void;
}

export function TroopManager({ selectedLeague, onTroopAdded }: TroopManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableTroops, setAvailableTroops] = useState<AvailableTroop[]>([]);
  const [selectedTroops, setSelectedTroops] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const fetchAvailableTroops = async () => {
    if (!selectedLeague) return;
    
    setLoading(true);
    try {
      // Get league ID
      const { data: leagueData, error: leagueError } = await supabase
        .from('leagues')
        .select('id')
        .eq('name', selectedLeague)
        .single();

      if (leagueError) throw leagueError;
      if (!leagueData) throw new Error('League not found');

      // Get all troops
      const { data: allTroops, error: troopsError } = await supabase
        .from('troop_types')
        .select('id, name, description, trait_family')
        .order('name');

      if (troopsError) throw troopsError;

      // Get troops already in the current league's counter advice
      const { data: currentAdvice, error: adviceError } = await supabase
        .from('counter_advice')
        .select('troop_id')
        .eq('league_id', leagueData.id);

      if (adviceError) throw adviceError;

      // Filter out troops that are already in the advice
      const usedTroopIds = new Set(currentAdvice?.map(item => item.troop_id) || []);
      const available = allTroops?.filter(troop => !usedTroopIds.has(troop.id)) || [];
      
      setAvailableTroops(available);
    } catch (error) {
      console.error('Error fetching available troops:', error);
      toast({
        title: "Error",
        description: "Failed to load available troops",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && selectedLeague) {
      fetchAvailableTroops();
    }
  }, [isOpen, selectedLeague]);

  const toggleTroopSelection = (troopId: number) => {
    setSelectedTroops(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(troopId)) {
        newSelection.delete(troopId);
      } else {
        newSelection.add(troopId);
      }
      return newSelection;
    });
  };

  const handleAddSelectedTroops = async () => {
    if (selectedTroops.size === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one troop to add",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Get league ID
      const { data: leagueData, error: leagueError } = await supabase
        .from('leagues')
        .select('id')
        .eq('name', selectedLeague)
        .maybeSingle();

      if (leagueError) throw leagueError;
      if (!leagueData) throw new Error('League not found');

      // Get the current highest rank for this league
      const { data: maxRankData, error: rankError } = await supabase
        .from('counter_advice')
        .select('rank')
        .eq('league_id', leagueData.id)
        .order('rank', { ascending: false })
        .limit(1);

      if (rankError) throw rankError;

      const nextRank = maxRankData && maxRankData.length > 0 
        ? maxRankData[0].rank + 1 
        : 1;

      // Prepare troop entries for insertion
      const troopsToAdd = Array.from(selectedTroops).map((troopId, index) => ({
        league_id: leagueData.id,
        troop_id: troopId,
        usage_count: 1,
        usage_percentage: 0.1,
        rank: nextRank + index
      }));

      const { error: insertError } = await supabase
        .from('counter_advice')
        .insert(troopsToAdd);

      if (insertError) throw insertError;

      // Get troop names for the toast
      const selectedTroopNames = availableTroops
        .filter(troop => selectedTroops.has(troop.id))
        .map(troop => troop.name)
        .join(', ');
      
      toast({
        title: "✅ Counter Advice Updated!",
        description: `Successfully added ${selectedTroops.size} troop(s) to ${selectedLeague}: ${selectedTroopNames}. All users can now see these changes!`,
      });

      // Reset and close
      setSelectedTroops(new Set());
      setIsOpen(false);
      onTroopAdded?.();
    } catch (error) {
      console.error('Error adding troops:', error);
      toast({
        title: "Error",
        description: "Failed to add troops. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setSelectedTroops(new Set());
    setIsOpen(false);
  };

  if (!selectedLeague) {
    return (
      <Button disabled className="w-full font-game-title">
        <Plus className="h-4 w-4 mr-2" />
        Select a League First
      </Button>
    );
  }

  return (
    <div className="w-full">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="w-full bg-gradient-primary hover:bg-gradient-winner text-accent-foreground font-game-title"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Troops to {selectedLeague} (Admin Only)
        </Button>
      ) : (
        <Card className="game-card">
          <TroopManagerHeader 
            selectedLeague={selectedLeague} 
            onClose={resetAndClose} 
          />
          
          <CardContent className="p-6">
            {loading ? (
              <TroopManagerLoadingSkeleton />
            ) : (
              <>
                <div className="mb-6">
                  <p className="text-sm text-foreground/70 font-game mb-4">
                    Select troops to add to {selectedLeague} counter advice. These troops are not currently in the advice list.
                  </p>
                  {selectedTroops.size > 0 && (
                    <Badge variant="secondary" className="font-game-title">
                      {selectedTroops.size} selected
                    </Badge>
                  )}
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-accent/20 scrollbar-track-transparent">
                  {availableTroops.map((troop) => {
                    const isSelected = selectedTroops.has(troop.id);
                    return (
                      <TroopItem
                        key={troop.id}
                        troop={troop}
                        isSelected={isSelected}
                        onClick={() => toggleTroopSelection(troop.id)}
                      />
                    );
                  })}
                  
                  {availableTroops.length === 0 && !loading && (
                    <TroopManagerEmptyState selectedLeague={selectedLeague} />
                  )}
                </div>

                {availableTroops.length > 0 && (
                  <TroopManagerActions
                    selectedTroopsCount={selectedTroops.size}
                    loading={loading}
                    onAddSelectedTroops={handleAddSelectedTroops}
                    onCancel={resetAndClose}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Note: This file is getting long (341 lines). Consider refactoring into smaller components for better maintainability.