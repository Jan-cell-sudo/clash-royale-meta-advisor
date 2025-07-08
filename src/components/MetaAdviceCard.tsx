import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { LeagueSelector } from "./LeagueSelector";
import { AdminEditControls } from "./meta-advice/AdminEditControls";
import { TroopAdviceDisplay } from "./meta-advice/TroopAdviceDisplay";
import { League, TroopAdvice } from "./meta-advice/types";
import { calculateTotalUsage } from "./meta-advice/utils";

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
            <AdminEditControls
              editMode={editMode}
              isAdmin={isAdmin}
              onEdit={handleEdit}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        <LeagueSelector
          leagues={leagues}
          selectedLeague={selectedLeague}
          onLeagueChange={onLeagueChange}
          loading={leaguesLoading}
        />

        {selectedLeague && (
          <TroopAdviceDisplay
            troops={displayTroops}
            loading={loading}
            editMode={editMode}
            isAdmin={!!isAdmin}
            selectedLeague={selectedLeague}
            onCountChange={handleCountChange}
            onPercentageChange={handlePercentageChange}
          />
        )}
      </CardContent>
    </div>
  );
}