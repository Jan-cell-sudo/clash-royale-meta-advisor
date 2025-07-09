import { useState, useEffect } from "react";
import { Upload, Users, Target, RefreshCw, Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AppStats } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StatsCardsProps {
  stats: AppStats;
  onRefresh: () => void;
  refreshing: boolean;
}

export const StatsCards = ({ stats, onRefresh, refreshing }: StatsCardsProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedStats, setEditedStats] = useState(stats);
  const [adminStats, setAdminStats] = useState<AppStats>(stats);

  // Fetch admin stats from database
  const fetchAdminStats = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_stats')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      if (data) {
        const dbStats: AppStats = {
          screenshots: data.screenshots_count,
          contributors: data.contributors_count,
          leagues: data.leagues_count
        };
        setAdminStats(dbStats);
        setEditedStats(dbStats);
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const handleSave = async () => {
    try {
      // Get the ID of the first (and only) admin stats record
      const { data: existingData } = await supabase
        .from('admin_stats')
        .select('id')
        .limit(1)
        .single();

      if (!existingData) {
        // If no record exists, create one
        const { error: insertError } = await supabase
          .from('admin_stats')
          .insert({
            screenshots_count: editedStats.screenshots,
            contributors_count: editedStats.contributors,
            leagues_count: editedStats.leagues
          });
        
        if (insertError) throw insertError;
      } else {
        // Update existing record
        const { error: updateError } = await supabase
          .from('admin_stats')
          .update({
            screenshots_count: editedStats.screenshots,
            contributors_count: editedStats.contributors,
            leagues_count: editedStats.leagues
          })
          .eq('id', existingData.id);

        if (updateError) throw updateError;
      }

      setAdminStats(editedStats);
      setIsEditing(false);
      
      toast({
        title: "Stats Updated",
        description: "Admin stats have been saved successfully!",
      });
    } catch (error) {
      console.error('Error saving admin stats:', error);
      toast({
        title: "Save Failed",
        description: "Could not save stats. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setEditedStats(adminStats);
    setIsEditing(false);
  };

  const isAdmin = profile?.is_admin && profile?.email === 'waterflesjan@gmail.com';

  return (
    <>
      {/* Admin Edit Controls */}
      {isAdmin && (
        <div className="text-center mb-4">
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              size="sm"
              className="font-game-title border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            >
              <Edit className="h-4 w-4 mr-2" strokeWidth={3} />
              Edit Stats
            </Button>
          ) : (
            <div className="flex gap-2 justify-center">
              <Button
                onClick={handleSave}
                variant="outline"
                size="sm"
                className="font-game-title border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
              >
                <Save className="h-4 w-4 mr-2" strokeWidth={3} />
                Save
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
                className="font-game-title border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              >
                <X className="h-4 w-4 mr-2" strokeWidth={3} />
                Cancel
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Desktop: Show stats cards */}
      <div className="max-w-4xl mx-auto"
>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          <div className="game-card hover:scale-105 transition-transform duration-200 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-lg font-game-title text-foreground">Screenshots Analyzed</CardTitle>
              <Upload className="h-6 w-6 text-accent animate-bounce-subtle group-hover:scale-110 transition-transform" strokeWidth={3} />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-game-title text-accent drop-shadow-lg">
            {isEditing ? (
              <Input
                type="number"
                value={editedStats.screenshots}
                onChange={(e) => setEditedStats(prev => ({ ...prev, screenshots: parseInt(e.target.value) || 0 }))}
                className="text-center text-4xl font-game-title text-accent bg-transparent border-accent"
              />
            ) : (
              adminStats.screenshots
            )}
              </div>
              <p className="text-sm font-game text-foreground/80">+{Math.floor(adminStats.screenshots / 3)} from last hour</p>
            </CardContent>
          </div>
          <div className="game-card hover:scale-105 transition-transform duration-200 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-lg font-game-title text-foreground">Active Contributors</CardTitle>
              <Users className="h-6 w-6 text-accent animate-bounce-subtle group-hover:scale-110 transition-transform" strokeWidth={3} />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-game-title text-accent drop-shadow-lg">
            {isEditing ? (
              <Input
                type="number"
                value={editedStats.contributors}
                onChange={(e) => setEditedStats(prev => ({ ...prev, contributors: parseInt(e.target.value) || 0 }))}
                className="text-center text-4xl font-game-title text-accent bg-transparent border-accent"
              />
            ) : (
              adminStats.contributors
            )}
              </div>
              <p className="text-sm font-game text-foreground/80">Community powered</p>
            </CardContent>
          </div>
          <div className="game-card hover:scale-105 transition-transform duration-200 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-lg font-game-title text-foreground">Leagues Tracked</CardTitle>
              <Target className="h-6 w-6 text-accent animate-bounce-subtle group-hover:scale-110 transition-transform" strokeWidth={3} />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-game-title text-accent drop-shadow-lg">
                {isEditing ? (
                  <Input
                    type="number"
                    value={editedStats.leagues}
                    onChange={(e) => setEditedStats(prev => ({ ...prev, leagues: parseInt(e.target.value) || 0 }))}
                    className="text-center text-4xl font-game-title text-accent bg-transparent border-accent"
                  />
                ) : (
                  adminStats.leagues
                )}
              </div>
              <p className="text-sm font-game text-foreground/80">Bronze to Diamond</p>
            </CardContent>
          </div>
        </div>
        
        {/* Refresh Button */}
        <div className="text-center">
          <Button
            onClick={onRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="font-game-title border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} strokeWidth={3} />
            {refreshing ? 'Updating...' : 'Refresh Data'}
          </Button>
        </div>
      </div>
    </>
  );
};