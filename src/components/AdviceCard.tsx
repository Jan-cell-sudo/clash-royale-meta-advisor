import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingDown, Star } from "lucide-react";
import { troopElixirCosts, troopTraitFamilies } from "./stats/constants";
import { ElixirIcon } from "@/components/ui/elixir-icon";


interface TroopAdvice {
  id: number;
  name: string;
  usagePercentage: number;
  traitFamily: string;
  rank: number;
}

interface AdviceCardProps {
  league: string;
  troops: TroopAdvice[];
  loading?: boolean;
}

export function AdviceCard({ league, troops, loading = false }: AdviceCardProps) {
  if (loading) {
    return (
      <div className="game-card">
        <CardHeader style={{
          background: 'var(--gradient-winner)',
          borderBottom: '4px solid hsl(var(--accent))'
        }}>
          <CardTitle className="flex items-center gap-3 font-game-title text-xl text-accent-foreground">
            <TrendingDown className="h-6 w-6 animate-bounce-subtle" strokeWidth={3} />
            Loading advice...
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-xl bg-muted animate-pulse border-2 border-accent" />
                <div className="flex-1 space-y-3">
                  <div className="h-6 w-32 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </div>
    );
  }

  return (
    <div className="w-full game-card">
      <CardHeader style={{
        background: 'var(--gradient-winner)',
        borderBottom: '4px solid hsl(var(--accent))'
      }}>
        <CardTitle className="flex items-center gap-3 font-game-title text-xl text-accent-foreground drop-shadow-lg">
          <TrendingDown className="h-6 w-6 animate-bounce-subtle" strokeWidth={3} />
          Meta Counter Advice
        </CardTitle>
        <CardDescription className="font-game text-accent-foreground/80">
          Least used troops in <Badge variant="secondary" className="bg-gradient-silver text-foreground font-game-title border-2 border-accent">{league}</Badge> - Use these to gain advantage!
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {troops.map((troop, index) => (
            <div key={troop.id} className={`flex items-center space-x-4 p-4 rounded-xl border-3 shadow-game transition-all duration-200 hover:scale-105 ${
              index === 0 ? 'bg-gradient-winner border-accent' : 'bg-gradient-silver border-accent/70'
            }`}>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-game-inset border-2 border-accent overflow-hidden ${
                index === 0 ? 'bg-gradient-accent' : 'bg-gradient-primary'
              }`}>
                {troop.name === 'Bomber' ? (
                  <img src="/lovable-uploads/c0566d5a-7fe1-4c7e-8ce4-8a46d243dd6a.png" alt="Bomber" className="w-full h-full object-cover" />
                ) : troop.name === 'Barbarians' ? (
                  <img src="/lovable-uploads/2951f1e5-7b28-41f0-b49f-c4f2cc3b500a.png" alt="Barbarians" className="w-full h-full object-cover" />
                ) : (
                  <Star className="h-6 w-6 text-accent-foreground animate-bounce-subtle" strokeWidth={3} />
                )}
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-game-title text-xl text-card-foreground drop-shadow-sm">
                      {troop.name} ({troopElixirCosts[troop.name] || 2}<ElixirIcon size={18} className="mx-1" />) – {troopTraitFamilies[troop.name] || 'Unknown, Warrior'}
                    </h4>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant="outline" 
                      className={`text-base font-game-title border-2 ${
                        index === 0 ? 'border-accent bg-accent text-accent-foreground' : 'border-foreground bg-transparent text-foreground'
                      }`}
                    >
                      #{troop.rank}
                    </Badge>
                    <p className="text-sm font-game text-foreground/80 mt-1">
                      {troop.usagePercentage.toFixed(1)}% usage
                    </p>
                  </div>
                </div>
                <Progress 
                  value={troop.usagePercentage} 
                  className="h-3 border-2 border-accent"
                />
              </div>
            </div>
          ))}
        </div>
        
        {troops.length === 0 && (
          <div className="text-center py-12">
            <TrendingDown className="h-16 w-16 text-foreground/60 mx-auto mb-6 animate-bounce-subtle" strokeWidth={3} />
            <p className="text-foreground font-game-title text-xl">No data available for this league yet.</p>
            <p className="text-lg font-game text-foreground/80 mt-3">Upload screenshots to help build the meta database!</p>
          </div>
        )}
      </CardContent>
    </div>
  );
}