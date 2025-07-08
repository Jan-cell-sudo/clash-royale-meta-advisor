import { Button } from "@/components/ui/button";
import { Edit2, Save, X } from "lucide-react";

interface AdminEditControlsProps {
  editMode: boolean;
  isAdmin: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export function AdminEditControls({ 
  editMode, 
  isAdmin, 
  onEdit, 
  onSave, 
  onCancel 
}: AdminEditControlsProps) {
  if (!isAdmin) return null;

  return (
    <div className="flex items-center gap-2">
      {editMode ? (
        <>
          <Button
            onClick={onSave}
            size="sm"
            className="font-game-title"
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
          <Button
            onClick={onCancel}
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
          onClick={onEdit}
          variant="outline"
          size="sm"
          className="font-game-title"
        >
          <Edit2 className="h-4 w-4 mr-1" />
          Edit
        </Button>
      )}
    </div>
  );
}