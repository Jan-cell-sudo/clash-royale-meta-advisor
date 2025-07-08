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
            <div key={troop.id} className={`relative rounded-2xl border-4 shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl overflow-hidden ${
              index === 0 ? 'border-yellow-400 bg-gradient-to-b from-blue-600 via-purple-600 to-yellow-500' : 'border-purple-400 bg-gradient-to-b from-blue-600 via-purple-600 to-blue-800'
            }`}>
              {/* Top section with troop image */}
              <div className="relative p-4 pb-2">
                <div className="w-full h-28 mb-3 rounded-xl overflow-hidden shadow-lg">
                  <TroopImage 
                    troopName={troop.name}
                    className="w-full h-full object-contain bg-gradient-to-br from-slate-100 to-slate-200"
                  />
                </div>
              </div>
              
              {/* Bottom section with rank and percentage */}
              <div className={`relative p-6 pt-4 ${
                index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gradient-to-br from-purple-500 to-blue-600'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                  </div>
                  
                  {/* Rank badge */}
                  <div className="absolute top-3 right-3">
                    <div className={`px-4 py-2 rounded-xl font-game-title text-lg font-bold shadow-lg ${
                      index === 0 ? 'bg-white text-yellow-600' : 'bg-white/20 text-white border border-white/40'
                    }`}>
                      #{troop.rank}
                    </div>
                  </div>
                </div>
                
                {/* Large percentage display */}
                <div className="text-center mt-2">
                  <div className={`text-5xl font-game-title font-black drop-shadow-2xl ${
                    index === 0 ? 'text-white' : 'text-white'
                  }`} style={{ 
                    textShadow: '3px 3px 0px rgba(0,0,0,0.3), 6px 6px 0px rgba(0,0,0,0.1)' 
                  }}>
                    {troop.usagePercentage.toFixed(1)}%
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