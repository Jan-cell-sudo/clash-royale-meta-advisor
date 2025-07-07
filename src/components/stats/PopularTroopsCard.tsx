import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { TroopPopularity } from "./types";
import { troopElixirCosts, troopTraitFamilies } from "./constants";

interface PopularTroopsCardProps {
  troopStats: TroopPopularity[];
}

export const PopularTroopsCard = ({ troopStats }: PopularTroopsCardProps) => {
  return (
    <div className="game-card">
      <CardHeader style={{
        background: 'var(--gradient-silver)',
        borderBottom: '4px solid hsl(var(--accent))'
      }}>
        <CardTitle className="font-game-title text-xl text-foreground flex items-center gap-2">
          <TrendingUp className="h-6 w-6" strokeWidth={3} />
          Popular Troops
        </CardTitle>
        <CardDescription className="font-game text-foreground/80">
          Most used troops across all leagues
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          {troopStats.map((troop, index) => (
            <div key={troop.troop_name} className="flex items-center justify-between p-4 rounded-xl bg-gradient-silver border-2 border-accent/50 hover:border-accent transition-all duration-200 hover:scale-[1.02]">
              <div className="flex items-center space-x-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-accent text-accent-foreground text-sm font-game-title shadow-game-inset border-2 border-accent">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-game-title text-base text-foreground mb-1">
                    {troop.troop_name} ({troopElixirCosts[troop.troop_name] || 2}⚡) – {troopTraitFamilies[troop.troop_name] || 'Unknown, Warrior'}
                  </h4>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-game-title text-accent">
                      {troop.avg_percentage.toFixed(1)}% usage
                    </div>
                    <div className="text-xs font-game text-foreground/60">
                      • {troop.total_usage} uses
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </div>
  );
};