import { CardContent } from "@/components/ui/card";
import { LeagueSelector } from "@/components/LeagueSelector";
import { TroopAdviceDisplay } from "./TroopAdviceDisplay";
import { League, TroopAdvice } from "./types";

interface MetaAdviceContentProps {
  leagues: League[];
  selectedLeague: string;
  onLeagueChange: (league: string) => void;
  leaguesLoading: boolean;
  troops: TroopAdvice[];
  loading: boolean;
  editMode: boolean;
  isAdmin: boolean;
  onCountChange: (index: number, newCount: string) => void;
  onPercentageChange: (index: number, newPercentage: string) => void;
  inputValues: Record<string, { count: string; percentage: string }>;
}

export function MetaAdviceContent({
  leagues,
  selectedLeague,
  onLeagueChange,
  leaguesLoading,
  troops,
  loading,
  editMode,
  isAdmin,
  onCountChange,
  onPercentageChange,
  inputValues
}: MetaAdviceContentProps) {
  return (
    <CardContent className="p-8 space-y-8">
      <LeagueSelector
        leagues={leagues}
        selectedLeague={selectedLeague}
        onLeagueChange={onLeagueChange}
        loading={leaguesLoading}
      />

      {selectedLeague && (
        <TroopAdviceDisplay
          troops={troops}
          loading={loading}
          editMode={editMode}
          isAdmin={isAdmin}
          selectedLeague={selectedLeague}
          onCountChange={onCountChange}
          onPercentageChange={onPercentageChange}
          inputValues={inputValues}
        />
      )}
    </CardContent>
  );
}