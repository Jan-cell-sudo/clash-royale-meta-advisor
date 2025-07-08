import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingDown, Star, Trophy, Edit2, Save, X } from "lucide-react";
import { troopElixirCosts, troopTraitFamilies } from "./stats/constants";
import { ElixirIcon } from "@/components/ui/elixir-icon";

import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface League {
  id: number;
  name: string;
  min_trophies: number;
  max_trophies: number;
}

interface TroopAdvice {
  id: number;
  name: string;
  usagePercentage: number;
  usageCount: number;
  traitFamily: string;
  rank: number;
}

interface MetaAdviceCardProps {
  leagues: League[];
  selectedLeague: string;
  onLeagueChange: (league: string) => void;
  troops: TroopAdvice[];
  loading?: boolean;
  leaguesLoading?: boolean;
}

export function MetaAdviceCard({ 
  leagues, 
  selectedLeague, 
  onLeagueChange, 
  troops, 
  loading = false,
  leaguesLoading = false 
}: MetaAdviceCardProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [editedTroops, setEditedTroops] = useState<TroopAdvice[]>(troops);

  const isAdmin = profile?.is_admin;
  
  const formatTrophyRange = (min: number, max: number) => {
    if (max >= 9999) return `${min.toLocaleString()}+`;
    return `${min.toLocaleString()}-${max.toLocaleString()}`;
  };

  const getBadgeVariant = (leagueName: string) => {
    if (leagueName === "Bronze") return "secondary";
    if (leagueName === "Silver") return "outline";
    if (leagueName === "Gold") return "default";
    if (leagueName === "Diamond") return "default";
    return "secondary";
  };

  const handleEdit = () => {
    setEditedTroops([...troops]);
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditedTroops([...troops]);
    setEditMode(false);
  };

  const handleSave = () => {
    toast({
      title: "Changes Saved",
      description: "Troop data has been updated successfully!",
    });
    setEditMode(false);
    // TODO: Integrate with actual database update
  };

  const calculateTotalUsage = (troopList: TroopAdvice[]) => {
    return troopList.reduce((total, troop) => total + troop.usageCount, 0);
  };

  const handleCountChange = (index: number, newCount: string) => {
    const count = parseInt(newCount) || 0;
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
    const percentage = parseFloat(newPercentage) || 0;
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
          {isAdmin && selectedLeague && (
            <div className="flex items-center gap-2">
              {editMode ? (
                <>
                  <Button
                    onClick={handleSave}
                    size="sm"
                    className="font-game-title"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="sm"
                    className="font-game-title"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleEdit}
                  variant="outline"
                  size="sm"
                  className="font-game-title"
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* League Selector */}
        <div className="space-y-3">
          <label className="text-lg font-game-title text-foreground">Select League</label>
          {leaguesLoading ? (
            <div className="h-12 bg-muted rounded-xl animate-pulse border-2 border-accent" />
          ) : (
            <Select value={selectedLeague} onValueChange={onLeagueChange}>
              <SelectTrigger className="w-full h-12 bg-gradient-primary border-3 border-accent font-game text-foreground shadow-game hover:scale-105 transition-transform">
                <SelectValue placeholder="Choose your league..." />
              </SelectTrigger>
              <SelectContent className="bg-gradient-primary border-3 border-accent shadow-game">
                {leagues.map((league) => (
                  <SelectItem 
                    key={league.id} 
                    value={league.name}
                    className="font-game text-foreground hover:bg-gradient-winner focus:bg-gradient-winner cursor-pointer"
                  >
                    <div className="flex items-center space-x-4">
                      <Trophy className="h-5 w-5 text-accent animate-bounce-subtle" strokeWidth={3} />
                      <div className="flex items-center space-x-3">
                        <Badge 
                          variant={getBadgeVariant(league.name)} 
                          className="text-sm font-game-title border-2 border-accent bg-gradient-accent text-accent-foreground"
                        >
                          {league.name}
                        </Badge>
                        <span className="text-sm font-game text-foreground/80">
                          {formatTrophyRange(league.min_trophies, league.max_trophies)} trophies
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Meta Counter Advice Section */}
        {selectedLeague && (
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

            {loading ? (
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
            ) : displayTroops.length > 0 ? (
              <div className="space-y-4">
                {displayTroops.map((troop, index) => (
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
                          <h4 className="font-game-title text-xl text-card-foreground drop-shadow-sm mb-2">
                            {troop.name} <span className="text-purple-500">{troopElixirCosts[troop.name] || 2}<ElixirIcon size={20} className="ml-1 align-text-top" /></span> {troopTraitFamilies[troop.name] || 'Unknown, Warrior'}
                          </h4>
                          {editMode && isAdmin && (
                            <div className="flex items-center gap-4 mt-3">
                              <div className="flex items-center gap-2">
                                <label className="text-sm font-game text-card-foreground/70">Count:</label>
                                <Input
                                  type="number"
                                  value={troop.usageCount}
                                  onChange={(e) => handleCountChange(index, e.target.value)}
                                  className="w-24 h-9 text-sm font-game-title"
                                  min="0"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <label className="text-sm font-game text-card-foreground/70">Percentage:</label>
                                <Input
                                  type="number"
                                  value={troop.usagePercentage.toFixed(1)}
                                  onChange={(e) => handlePercentageChange(index, e.target.value)}
                                  className="w-24 h-9 text-sm font-game-title"
                                  step="0.1"
                                  min="0"
                                  max="100"
                                />
                                <span className="text-sm font-game-title text-accent">%</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant="outline" 
                            className={`text-lg font-game-title border-3 mb-3 ${
                              index === 0 ? 'border-accent bg-accent text-accent-foreground' : 'border-foreground bg-transparent text-foreground'
                            }`}
                          >
                            #{troop.rank}
                          </Badge>
                          <div className="text-4xl font-game-title text-accent drop-shadow-lg">
                            {troop.usagePercentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <Progress 
                        value={troop.usagePercentage} 
                        className="h-4 border-2 border-accent bg-gradient-primary"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <TrendingDown className="h-16 w-16 text-foreground/60 mx-auto mb-6 animate-bounce-subtle" strokeWidth={3} />
                <p className="text-foreground font-game-title text-xl mb-3">No data available for this league yet.</p>
                <p className="text-lg font-game text-foreground/80">Upload screenshots to help build the meta database!</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </div>
  );
}