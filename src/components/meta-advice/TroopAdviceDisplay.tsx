import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { TrendingDown } from "lucide-react";
import { troopElixirCosts, troopTraitFamilies } from "../stats/constants";
import { ElixirIcon } from "@/components/ui/elixir-icon";
import { TroopImage } from "./TroopImage";

interface TroopAdvice {
  id: number;
  name: string;
  usagePercentage: number;
  usageCount: number;
  traitFamily: string;
  rank: number;
}

interface TroopAdviceDisplayProps {
  troops: TroopAdvice[];
  loading: boolean;
  editMode: boolean;
  isAdmin: boolean;
  selectedLeague: string;
  onCountChange: (index: number, newCount: string) => void;
  onPercentageChange: (index: number, newPercentage: string) => void;
}

export function TroopAdviceDisplay({
  troops,
  loading,
  editMode,
  isAdmin,
  selectedLeague,
  onCountChange,
  onPercentageChange
}: TroopAdviceDisplayProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-silver border-2 border-accent/50">
            <div className="h-12 w-12 rounded-xl bg-muted animate-pulse border-2 border-accent" />
            <div className="flex-1 space-y-3">
              <div className="h-6 w-32 bg-muted rounded animate-pulse" />
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (troops.length === 0) {
    return (
      <div className="text-center py-12">
        <TrendingDown className="h-16 w-16 text-foreground/60 mx-auto mb-6 animate-bounce-subtle" strokeWidth={3} />
        <p className="text-foreground font-game-title text-xl mb-3">No data available for this league yet.</p>
        <p className="text-lg font-game text-foreground/80">Upload screenshots to help build the meta database!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border-t-2 border-accent/30 pt-4">
        <div className="flex items-center gap-3 mb-4">
          <TrendingDown className="h-6 w-6 animate-bounce-subtle text-accent-foreground" strokeWidth={3} />
          <h3 className="font-game-title text-xl text-accent-foreground drop-shadow-lg">
            Meta Counter Advice
          </h3>
        </div>
        <p className="font-game text-accent-foreground/80 mb-6">
          Least used troops in <Badge variant="secondary" className="bg-gradient-silver text-foreground font-game-title border-2 border-accent mx-1">{selectedLeague}</Badge> - Use these to gain advantage! (Low → High usage)
        </p>
      </div>

      <div className="space-y-4">
        {troops.map((troop, index) => (
          <div key={troop.id} className={`relative rounded-2xl border-4 shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl overflow-hidden ${
            index === 0 ? 'border-yellow-400 bg-gradient-to-b from-blue-600 via-purple-600 to-yellow-500' : 'border-purple-400 bg-gradient-to-b from-blue-600 via-purple-600 to-blue-800'
          }`}>
            {/* Top section with troop image and info */}
            <div className="relative p-4 pb-2">
              <div className="w-full h-24 mb-3 rounded-xl overflow-hidden shadow-lg">
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
                  {editMode && isAdmin && (
                    <div className="flex flex-col gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-game text-white/90">Count:</label>
                        <Input
                          type="number"
                          value={troop.usageCount}
                          onChange={(e) => onCountChange(index, e.target.value)}
                          className="w-24 h-8 text-sm font-game-title bg-white/20 border-white/30 text-white"
                          min="0"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-game text-white/90">Percentage:</label>
                        <Input
                          type="number"
                          value={troop.usagePercentage.toFixed(1)}
                          onChange={(e) => onPercentageChange(index, e.target.value)}
                          className="w-24 h-8 text-sm font-game-title bg-white/20 border-white/30 text-white"
                          step="0.1"
                          min="0"
                          max="100"
                        />
                        <span className="text-sm font-game-title text-white">%</span>
                      </div>
                    </div>
                  )}
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
                <div className={`text-7xl font-game-title font-black drop-shadow-2xl ${
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
    </div>
  );
}