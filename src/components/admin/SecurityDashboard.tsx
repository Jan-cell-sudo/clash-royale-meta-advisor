import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, Activity, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useToast } from '@/hooks/use-toast';

interface AuditLogEntry {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string;
  created_at: string;
}

interface SecurityStats {
  totalActions: number;
  recentActions: number;
  uniqueUsers: number;
  topActions: Array<{ action: string; count: number }>;
}

export const SecurityDashboard = () => {
  const { isAdmin } = useUserRoles();
  const { toast } = useToast();
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [securityStats, setSecurityStats] = useState<SecurityStats>({
    totalActions: 0,
    recentActions: 0,
    uniqueUsers: 0,
    topActions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      fetchAuditLogs();
      fetchSecurityStats();
    }
  }, [isAdmin]);

  const fetchAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAuditLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch audit logs',
        variant: 'destructive'
      });
    }
  };

  const fetchSecurityStats = async () => {
    try {
      setLoading(true);
      
      // Get total actions count
      const { count: totalActions } = await supabase
        .from('audit_log')
        .select('*', { count: 'exact', head: true });

      // Get recent actions (last 24 hours)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count: recentActions } = await supabase
        .from('audit_log')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneDayAgo);

      // Get unique users count
      const { data: uniqueUsersData } = await supabase
        .from('audit_log')
        .select('user_id')
        .not('user_id', 'is', null);
      
      const uniqueUsers = new Set(uniqueUsersData?.map(entry => entry.user_id) || []).size;

      // Get top actions
      const { data: actionsData } = await supabase
        .from('audit_log')
        .select('action');
      
      const actionCounts = (actionsData || []).reduce((acc, entry) => {
        acc[entry.action] = (acc[entry.action] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topActions = Object.entries(actionCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([action, count]) => ({ action, count }));

      setSecurityStats({
        totalActions: totalActions || 0,
        recentActions: recentActions || 0,
        uniqueUsers,
        topActions
      });
    } catch (error) {
      console.error('Error fetching security stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const csv = [
        'Timestamp,User ID,Action,Table,Record ID',
        ...(data || []).map(entry => 
          `${entry.created_at},${entry.user_id || 'N/A'},${entry.action},${entry.table_name || 'N/A'},${entry.record_id || 'N/A'}`
        )
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Export Complete',
        description: 'Audit logs exported successfully'
      });
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export audit logs',
        variant: 'destructive'
      });
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-game-title text-foreground">Security Dashboard</h2>
        <Button onClick={exportAuditLogs} className="font-game-title">
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="game-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-game-title">
              <Shield className="h-4 w-4" />
              Total Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-game-title text-foreground">
              {loading ? '...' : securityStats.totalActions}
            </div>
          </CardContent>
        </Card>

        <Card className="game-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-game-title">
              <Activity className="h-4 w-4" />
              Recent (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-game-title text-foreground">
              {loading ? '...' : securityStats.recentActions}
            </div>
          </CardContent>
        </Card>

        <Card className="game-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-game-title">
              <AlertTriangle className="h-4 w-4" />
              Unique Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-game-title text-foreground">
              {loading ? '...' : securityStats.uniqueUsers}
            </div>
          </CardContent>
        </Card>

        <Card className="game-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-game-title">Top Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {securityStats.topActions.slice(0, 3).map((item, index) => (
                <div key={index} className="flex justify-between text-xs">
                  <span className="font-game text-foreground/70">{item.action}</span>
                  <Badge variant="secondary">{item.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Audit Logs */}
      <Card className="game-card">
        <CardHeader>
          <CardTitle className="font-game-title">Recent Admin Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {auditLogs.length === 0 ? (
              <p className="text-foreground/60 font-game text-center py-4">No audit logs found</p>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="font-game">
                      {log.action}
                    </Badge>
                    {log.table_name && (
                      <span className="text-sm font-game text-foreground/70">
                        {log.table_name}
                      </span>
                    )}
                    {log.record_id && (
                      <span className="text-xs font-game text-foreground/50">
                        ID: {log.record_id}
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-game text-foreground/60">
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};