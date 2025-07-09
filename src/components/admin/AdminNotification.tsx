import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Users, Eye } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";

interface AdminNotificationProps {
  selectedLeague: string;
}

export function AdminNotification({ selectedLeague }: AdminNotificationProps) {
  const { isAdmin } = useUserRoles();
  const [showNotification, setShowNotification] = useState(false);
  
  useEffect(() => {
    if (isAdmin && selectedLeague) {
      setShowNotification(true);
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => setShowNotification(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [isAdmin, selectedLeague]);

  if (!showNotification || !isAdmin) {
    return null;
  }

  return (
    <Card className="mx-auto max-w-sm mb-4 p-4 border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50 shadow-lg">
      <div className="flex items-center gap-3">
        <Crown className="h-6 w-6 text-yellow-600 animate-bounce-subtle" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="bg-yellow-200 text-yellow-800 font-game-title">
              ADMIN MODE
            </Badge>
            <Badge variant="outline" className="text-xs">
              {selectedLeague}
            </Badge>
          </div>
          <p className="text-sm font-game text-yellow-800">
            Your changes will be visible to <span className="font-bold">all users</span> immediately
          </p>
          <div className="flex items-center gap-1 mt-1">
            <Users className="h-3 w-3 text-yellow-600" />
            <Eye className="h-3 w-3 text-yellow-600" />
            <span className="text-xs text-yellow-700 font-game">Live updates enabled</span>
          </div>
        </div>
      </div>
    </Card>
  );
}