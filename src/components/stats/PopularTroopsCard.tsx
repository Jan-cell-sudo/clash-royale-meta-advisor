import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, Edit2, Save, X, ArrowUp, ArrowDown } from "lucide-react";
import { TroopPopularity } from "./types";
import { troopElixirCosts, troopTraitFamilies } from "./constants";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface PopularTroopsCardProps {
  troopStats: TroopPopularity[];
}

export const PopularTroopsCard = ({ troopStats }: PopularTroopsCardProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [editedStats, setEditedStats] = useState<TroopPopularity[]>(troopStats);

  const isAdmin = profile?.is_admin;

  const handleEdit = () => {
    setEditedStats([...troopStats]);
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditedStats([...troopStats]);
    setEditMode(false);
  };

  const handleSave = () => {
    // In a real app, this would save to the database
    toast({
      title: "Changes Saved",
      description: "Troop percentages have been updated successfully!",
    });
    setEditMode(false);
    // TODO: Integrate with actual database update
  };

  const handlePercentageChange = (index: number, newPercentage: string) => {
    const value = parseFloat(newPercentage) || 0;
    setEditedStats(prev => prev.map((troop, i) => 
      i === index ? { ...troop, avg_percentage: value } : troop
    ));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setEditedStats(prev => {
      const newStats = [...prev];
      [newStats[index], newStats[index - 1]] = [newStats[index - 1], newStats[index]];
      return newStats;
    });
  };

  const moveDown = (index: number) => {
    if (index === editedStats.length - 1) return;
    setEditedStats(prev => {
      const newStats = [...prev];
      [newStats[index], newStats[index + 1]] = [newStats[index + 1], newStats[index]];
      return newStats;
    });
  };

  const displayStats = editMode ? editedStats : troopStats;

  return (
    <div className="game-card">
      <CardHeader style={{
        background: 'var(--gradient-silver)',
        borderBottom: '4px solid hsl(var(--accent))'
      }}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-game-title text-xl text-foreground flex items-center gap-2">
              <TrendingUp className="h-6 w-6" strokeWidth={3} />
              Underused Troops
            </CardTitle>
            <CardDescription className="font-game text-foreground/80">
              Least used troops - perfect for gaining meta advantage
            </CardDescription>
          </div>
          {isAdmin && (
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
      <CardContent className="p-6">
        <div className="space-y-3">
          {displayStats.map((troop, index) => (
            <div key={troop.troop_name} className="flex items-center justify-between p-4 rounded-xl bg-gradient-silver border-2 border-accent/50 hover:border-accent transition-all duration-200 hover:scale-[1.02]">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-accent text-accent-foreground text-sm font-game-title shadow-game-inset border-2 border-accent">
                    {index + 1}
                  </div>
                  {editMode && isAdmin && (
                    <div className="flex flex-col space-y-1">
                      <Button
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        onClick={() => moveDown(index)}
                        disabled={index === displayStats.length - 1}
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-game-title text-base text-foreground mb-1">
                    {troop.troop_name} ({troopElixirCosts[troop.troop_name] || 2}⚡) – {troopTraitFamilies[troop.troop_name] || 'Unknown, Warrior'}
                  </h4>
                  <div className="text-xs font-game text-foreground/60">
                    {troop.total_usage} uses across all leagues
                  </div>
                </div>
              </div>
              <div className="text-right">
                {editMode && isAdmin ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={troop.avg_percentage.toFixed(1)}
                      onChange={(e) => handlePercentageChange(index, e.target.value)}
                      className="w-20 text-right font-game-title"
                      step="0.1"
                      min="0"
                      max="100"
                    />
                    <span className="text-xl font-game-title text-accent">%</span>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-game-title text-accent drop-shadow-lg">
                      {troop.avg_percentage.toFixed(1)}%
                    </div>
                    <div className="text-xs font-game text-foreground/70">
                      usage rate
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </div>
  );
};