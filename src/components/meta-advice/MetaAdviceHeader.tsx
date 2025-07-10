import { CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { AdminEditControls } from "./AdminEditControls";

interface MetaAdviceHeaderProps {
  isAdmin: boolean;
  isSpecificAdmin: boolean;
  selectedLeague: string;
  editMode: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export function MetaAdviceHeader({
  isAdmin,
  isSpecificAdmin,
  selectedLeague,
  editMode,
  onEdit,
  onSave,
  onCancel
}: MetaAdviceHeaderProps) {
  return (
    <CardHeader style={{
      background: 'var(--gradient-winner)',
      borderBottom: '4px solid hsl(var(--accent))'
    }}>
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-3 font-game-title text-xl text-accent-foreground drop-shadow-lg">
          <Trophy className="h-6 w-6 animate-bounce-subtle" strokeWidth={3} />
          Choose Your League
        </CardTitle>
        {isAdmin && isSpecificAdmin && selectedLeague && (
          <AdminEditControls
            editMode={editMode}
            isAdmin={isAdmin}
            onEdit={onEdit}
            onSave={onSave}
            onCancel={onCancel}
          />
        )}
      </div>
    </CardHeader>
  );
}