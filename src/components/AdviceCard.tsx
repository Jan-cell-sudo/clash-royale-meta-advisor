import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingDown } from "lucide-react";
import { troopElixirCosts, troopTraitFamilies } from "./stats/constants";
import { ElixirIcon } from "@/components/ui/elixir-icon";
import { TroopImage } from "./meta-advice/TroopImage";


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
            <div key={troop.id} className={`rounded-xl border-3 shadow-game transition-all duration-200 hover:scale-105 overflow-hidden ${
              index === 0 ? 'bg-gradient-winner border-accent' : 'bg-gradient-silver border-accent/70'
            }`}>
              <div className="w-full h-32 overflow-hidden">
                <TroopImage 
                  troopName={troop.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {/* Image contains the troop name, so we only show percentage */}
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <Badge 
                      variant="outline" 
                      className={`text-lg font-game-title border-3 mb-3 px-4 py-2 ${
                        index === 0 ? 'border-accent bg-accent text-accent-foreground' : 'border-foreground bg-transparent text-foreground'
                      }`}
                    >
                      #{troop.rank}
                    </Badge>
                    <div className="text-5xl font-game-title text-accent drop-shadow-lg mb-2">
                      {troop.usagePercentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
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