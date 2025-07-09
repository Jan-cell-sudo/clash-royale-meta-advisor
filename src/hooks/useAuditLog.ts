import { supabase } from '@/integrations/supabase/client';

interface AuditLogEntry {
  action: string;
  tableName?: string;
  recordId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
}

export const useAuditLog = () => {
  const logAction = async (entry: AuditLogEntry) => {
    try {
      const { error } = await supabase.rpc('log_admin_action', {
        _action: entry.action,
        _table_name: entry.tableName || null,
        _record_id: entry.recordId || null,
        _old_values: entry.oldValues || null,
        _new_values: entry.newValues || null,
      });

      if (error) {
        console.error('Error logging admin action:', error);
      }
    } catch (error) {
      console.error('Error logging admin action:', error);
    }
  };

  const logDownload = async (leagueName: string) => {
    await logAction({
      action: 'screenshot_download',
      tableName: 'leagues',
      recordId: leagueName,
      newValues: { league: leagueName, downloadedAt: new Date().toISOString() }
    });
  };

  const logTroopManagement = async (action: string, troopData: any) => {
    await logAction({
      action: `troop_${action}`,
      tableName: 'counter_advice',
      recordId: troopData.id?.toString(),
      newValues: troopData
    });
  };

  return {
    logAction,
    logDownload,
    logTroopManagement,
  };
};