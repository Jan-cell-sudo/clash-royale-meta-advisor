import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { TroopImage } from "@/components/meta-advice/TroopImage";

interface AvailableTroop {
  id: number;
  name: string;
  description: string | null;
  trait_family: string | null;
}

interface TroopItemProps {
  troop: AvailableTroop;
  isSelected: boolean;
  onClick: () => void;
}

export function TroopItem({ troop, isSelected, onClick }: TroopItemProps) {
  return (
    <div 
      className={`flex items-center space-x-4 p-3 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 ${
        isSelected 
          ? 'border-accent bg-accent/10' 
          : 'border-accent/20 hover:border-accent/40'
      }`}
      onClick={onClick}
    >
      <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-accent relative">
        <TroopImage 
          troopName={troop.name}
          className="w-full h-full object-contain bg-gradient-to-br from-slate-100 to-slate-200"
        />
        {isSelected && (
          <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
            <Check className="h-6 w-6 text-accent" strokeWidth={3} />
          </div>
        )}
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
  );
}