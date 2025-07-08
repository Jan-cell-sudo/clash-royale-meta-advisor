import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { List, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TroopImage } from "@/components/meta-advice/TroopImage";

interface Troop {
  id: number;
  name: string;
  description: string | null;
  trait_family: string | null;
}

export function TroopList() {
  const [isOpen, setIsOpen] = useState(false);
  const [troops, setTroops] = useState<Troop[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTroops = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('troop_types')
        .select('*')
        .order('name');

      if (error) throw error;
      setTroops(data || []);
    } catch (error) {
      console.error('Error fetching troops:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTroops();
    }
  }, [isOpen]);

  return (
    <div className="w-full">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          className="w-full font-game-title border-2 border-accent hover:bg-accent/10"
        >
          <List className="h-4 w-4 mr-2" />
          View All Troops ({troops.length || '?'})
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
                All Troops ({troops.length})
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {troops.map((troop) => (
                  <div key={troop.id} className="flex items-center space-x-4 p-3 rounded-xl border-2 border-accent/20 hover:border-accent/40 transition-all">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-accent">
                      <TroopImage 
                        troopName={troop.name}
                        className="w-full h-full object-contain bg-gradient-to-br from-slate-100 to-slate-200"
                      />
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
                ))}
                
                {troops.length === 0 && (
                  <div className="text-center py-8">
                    <List className="h-16 w-16 text-foreground/60 mx-auto mb-4" />
                    <p className="text-foreground font-game-title">No troops found</p>
                    <p className="text-sm text-foreground/70 font-game">Add some troops to get started!</p>
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