import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { List, EyeOff, Trash2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TroopImage } from "@/components/meta-advice/TroopImage";
import { useToast } from "@/hooks/use-toast";

interface CounterAdviceTroop {
  id: string;
  troop_id: number;
  league_id: number;
  rank: number;
  usage_count: number;
  usage_percentage: number;
  troop_name: string;
  trait_family: string | null;
}

interface CounterAdviceManagerProps {
  selectedLeague: string;
  onAdviceUpdated?: () => void;
}

export function CounterAdviceManager({ selectedLeague, onAdviceUpdated }: CounterAdviceManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [troops, setTroops] = useState<CounterAdviceTroop[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const fetchCounterAdvice = async () => {
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
      if (!leagueData) {
        setTroops([]);
        return;
      }

      // Get counter advice with troop details
      const { data, error } = await supabase
        .from('counter_advice')
        .select('id, troop_id, league_id, rank, usage_count, usage_percentage')
        .eq('league_id', leagueData.id)
        .order('rank');

      if (error) throw error;

      // Get troop names
      const { data: troopData, error: troopError } = await supabase
        .from('troop_types')
        .select('id, name, trait_family');

      if (troopError) throw troopError;

      const troopMap = troopData?.reduce((acc, troop) => {
        acc[troop.id] = { name: troop.name, trait_family: troop.trait_family };
        return acc;
      }, {} as Record<number, { name: string; trait_family: string | null }>) || {};

      const enrichedData = (data || []).map(item => ({
        ...item,
        troop_name: troopMap[item.troop_id]?.name || 'Unknown',
        trait_family: troopMap[item.troop_id]?.trait_family || null
      }));

      setTroops(enrichedData);
    } catch (error) {
      console.error('Error fetching counter advice:', error);
      toast({
        title: "Error",
        description: "Failed to load counter advice",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTroop = async (adviceId: string, troopName: string) => {
    setDeletingIds(prev => new Set(prev).add(adviceId));
    
    try {
      const { error } = await supabase
        .from('counter_advice')
        .delete()
        .eq('id', adviceId);

      if (error) throw error;

      toast({
        title: "✅ Counter Advice Updated!",
        description: `Removed ${troopName} from ${selectedLeague} counter advice. This change is now visible to all users!`,
      });

      // Refresh the list and notify parent
      await fetchCounterAdvice();
      onAdviceUpdated?.();
    } catch (error) {
      console.error('Error removing troop:', error);
      toast({
        title: "Error",
        description: "Failed to remove troop",
        variant: "destructive",
      });
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(adviceId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    if (isOpen && selectedLeague) {
      fetchCounterAdvice();
    }
  }, [isOpen, selectedLeague]);

  if (!selectedLeague) {
    return (
      <Button disabled variant="outline" className="w-full font-game-title">
        <List className="h-4 w-4 mr-2" />
        Select a League First
      </Button>
    );
  }

  return (
    <div className="w-full">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          className="w-full font-game-title border-2 border-accent hover:bg-accent/10"
        >
          <List className="h-4 w-4 mr-2" />
          Manage {selectedLeague} Counter Advice ({troops.length})
        </Button>
      ) : (
        <Card className="game-card">
          <CardHeader style={{
            background: 'var(--gradient-winner)',
            borderBottom: '4px solid hsl(var(--accent))'
          }}>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 font-game-title text-xl text-accent-foreground">
                <List className="h-6 w-6" />
                {selectedLeague} Counter Advice ({troops.length})
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-accent-foreground hover:bg-white/20"
              >
                <EyeOff className="h-4 w-4" />
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
                    <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {troops.map((troop) => {
                  const isDeleting = deletingIds.has(troop.id);
                  return (
                    <div 
                      key={troop.id} 
                      className={`flex items-center space-x-4 p-3 rounded-xl border-2 transition-all animate-fade-in ${
                        isDeleting 
                          ? 'border-red-400 bg-red-50 opacity-50' 
                          : 'border-accent/20 hover:border-accent/40 hover:scale-105'
                      }`}
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-accent">
                        <TroopImage 
                          troopName={troop.troop_name}
                          className="w-full h-full object-contain bg-gradient-to-br from-slate-100 to-slate-200"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-game-title text-foreground truncate">
                            {troop.troop_name}
                          </h3>
                          <Badge variant="secondary" className="text-xs">
                            #{troop.rank}
                          </Badge>
                        </div>
                        
                        {troop.trait_family && (
                          <Badge variant="outline" className="mb-2 text-xs">
                            {troop.trait_family}
                          </Badge>
                        )}
                        
                        <div className="flex gap-2 text-xs text-foreground/60">
                          <span>Usage: {troop.usage_percentage.toFixed(1)}%</span>
                          <span>Count: {troop.usage_count}</span>
                        </div>
                      </div>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveTroop(troop.id, troop.troop_name)}
                        disabled={isDeleting}
                        className="font-game-title"
                      >
                        {isDeleting ? (
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  );
                })}
                
                {troops.length === 0 && !loading && (
                  <div className="text-center py-8">
                    <List className="h-16 w-16 text-foreground/60 mx-auto mb-4" />
                    <p className="text-foreground font-game-title">No counter advice set</p>
                    <p className="text-sm text-foreground/70 font-game">Add some troops to the counter advice list!</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}