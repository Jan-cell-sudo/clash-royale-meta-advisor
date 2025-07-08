import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { MetaAdviceCard } from "@/components/MetaAdviceCard";
import { HeroSection } from "@/components/home/HeroSection";
import { ActionButtons } from "@/components/home/ActionButtons";
import { StatsCards } from "@/components/home/StatsCards";
import { TroopManager } from "@/components/admin/TroopManager";
import { TroopList } from "@/components/admin/TroopList";
import { CounterAdviceManager } from "@/components/admin/CounterAdviceManager";
import { AdminNotification } from "@/components/admin/AdminNotification";
import { useAppStats } from "@/hooks/useAppStats";
import { useLeagueData } from "@/hooks/useLeagueData";
import { useCounterAdviceData } from "@/hooks/useCounterAdviceData";
import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [selectedLeague, setSelectedLeague] = useState<string>("Bronze");
  const [refreshing, setRefreshing] = useState(false);
  const { profile } = useAuth();
  const { toast } = useToast();

  // Custom hooks for data management
  const { stats, loading: statsLoading, fetchStats, setStats } = useAppStats();
  const { leagues, loading: leaguesLoading } = useLeagueData();
  const { advice, loading: adviceLoading, fetchAdvice } = useCounterAdviceData(selectedLeague);

  // Set up real-time updates
  useRealtimeUpdates({
    onStatsUpdate: fetchStats,
    onAdviceUpdate: fetchAdvice,
    selectedLeague
  });

  // Initialize leagues count in stats
  useEffect(() => {
    if (leagues.length > 0) {
      setStats(prev => ({
        ...prev,
        leagues: leagues.length
      }));
    }
  }, [leagues, setStats]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchStats(), fetchAdvice()]);
      toast({
        title: "Data Refreshed",
        description: "Latest meta analysis updated successfully!"
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Could not update data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen relative">
        <div className="container py-8 px-4 space-y-8 relative z-10">
          {/* Hero Content */}
          <HeroSection />

          {/* Action Buttons */}
          <ActionButtons />

          {/* Stats Cards */}
          <StatsCards 
            stats={stats} 
            onRefresh={handleRefresh} 
            refreshing={refreshing} 
          />

          {/* Combined League Selector and Meta Advice */}
          <div className="max-w-sm mx-auto px-4">
            {/* Admin Notification - Only visible to admin */}
            <AdminNotification selectedLeague={selectedLeague} />
            
            <MetaAdviceCard
              leagues={leagues}
              selectedLeague={selectedLeague}
              onLeagueChange={setSelectedLeague}
              troops={advice}
              loading={adviceLoading}
              leaguesLoading={leaguesLoading}
            />
          </div>

          {/* Admin Section - Only visible to waterflesjan@gmail.com */}
          {profile?.is_admin && profile?.email === 'waterflesjan@gmail.com' && (
            <div className="max-w-sm mx-auto px-4 space-y-4">
              <TroopManager selectedLeague={selectedLeague} onTroopAdded={fetchAdvice} />
              <CounterAdviceManager selectedLeague={selectedLeague} onAdviceUpdated={fetchAdvice} />
              <TroopList />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Index;