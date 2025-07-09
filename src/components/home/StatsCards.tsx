import { useState } from "react";
import { Upload, Users, Target, RefreshCw, Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AppStats } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

interface StatsCardsProps {
  stats: AppStats;
  onRefresh: () => void;
  refreshing: boolean;
}

export const StatsCards = ({ stats, onRefresh, refreshing }: StatsCardsProps) => {
  const { profile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedStats, setEditedStats] = useState(stats);

  const handleSave = () => {
    // Here you would normally save to database
    // For now, just close edit mode
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedStats(stats);
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
                  stats.screenshots
                )}
              </div>
              <p className="text-sm font-game text-foreground/80">+{Math.floor(stats.screenshots / 3)} from last hour</p>
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
                  stats.contributors
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
                  stats.leagues
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