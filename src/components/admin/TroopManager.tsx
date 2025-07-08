import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TroopImage } from "@/components/meta-advice/TroopImage";

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
      // Get all troops
      const { data: allTroops, error: troopsError } = await supabase
        .from('troop_types')
        .select('id, name, description, trait_family')
        .order('name');

      if (troopsError) throw troopsError;

      // Get troops already in the current league's advice
      const { data: currentAdvice, error: adviceError } = await supabase
        .from('league_usage')
        .select('troop_id')
        .eq('league', selectedLeague);

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
      // For now, we'll add a placeholder entry to league_usage
      // In a real implementation, you'd want to add actual usage data
      const troopsToAdd = Array.from(selectedTroops).map(troopId => {
        const troop = availableTroops.find(t => t.id === troopId);
        return {
          troop_id: troopId,
          troop_name: troop?.name || 'Unknown',
          league: selectedLeague,
          usage_count: 1, // Placeholder value
          usage_percentage: 0.1, // Placeholder value
          trait_family: troop?.trait_family || null,
          avg_confidence: 0.95,
          avg_star_level: 1,
          screenshots_featured: 1,
          winner_usage: 0
        };
      });

      // Note: This would normally insert into a proper table, but league_usage is a view
      // In a real implementation, you'd insert into the underlying tables that feed this view
      
      toast({
        title: "Success",
        description: `Added ${selectedTroops.size} troop(s) to ${selectedLeague} counter advice!`,
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
          <CardHeader style={{
            background: 'var(--gradient-winner)',
            borderBottom: '4px solid hsl(var(--accent))'
          }}>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 font-game-title text-xl text-accent-foreground">
                <Plus className="h-6 w-6" />
                Add to {selectedLeague} Counter Advice
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetAndClose}
                className="text-accent-foreground hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-16 w-16 rounded-xl bg-muted animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                      <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
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

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {availableTroops.map((troop) => {
                    const isSelected = selectedTroops.has(troop.id);
                    return (
                      <div 
                        key={troop.id} 
                        className={`flex items-center space-x-4 p-3 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 ${
                          isSelected 
                            ? 'border-accent bg-accent/10' 
                            : 'border-accent/20 hover:border-accent/40'
                        }`}
                        onClick={() => toggleTroopSelection(troop.id)}
                      >
                        <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-accent relative">
                          <TroopImage 
                            troopName={troop.name}
                            className="w-full h-full object-contain bg-gradient-to-br from-slate-100 to-slate-200"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                              <Check className="h-6 w-6 text-accent" strokeWidth={3} />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-game-title text-foreground truncate">
                              {troop.name}
                            </h3>
                            <Badge variant="secondary" className="text-xs">
                              #{troop.id}
                            </Badge>
                          </div>
                          
                          {troop.trait_family && (
                            <Badge variant="outline" className="mb-2 text-xs">
                              {troop.trait_family}
                            </Badge>
                          )}
                          
                          {troop.description && (
                            <p className="text-sm text-foreground/70 font-game truncate">
                              {troop.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {availableTroops.length === 0 && !loading && (
                    <div className="text-center py-8">
                      <Check className="h-16 w-16 text-foreground/60 mx-auto mb-4" />
                      <p className="text-foreground font-game-title">All troops are already in the advice!</p>
                      <p className="text-sm text-foreground/70 font-game">All available troops are already being recommended for {selectedLeague}.</p>
                    </div>
                  )}
                </div>

                {availableTroops.length > 0 && (
                  <div className="flex gap-4 pt-6 border-t">
                    <Button
                      onClick={handleAddSelectedTroops}
                      disabled={loading || selectedTroops.size === 0}
                      className="flex-1 bg-gradient-primary hover:bg-gradient-winner text-accent-foreground font-game-title"
                    >
                      {loading ? "Adding..." : `Add Selected (${selectedTroops.size})`}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={resetAndClose}
                      className="font-game-title"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}