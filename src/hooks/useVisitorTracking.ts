import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';

// Generate a simple visitor ID based on browser fingerprinting
const generateVisitorId = (): string => {
  const storage = localStorage.getItem('visitor_id');
  if (storage) return storage;
  
  // Create a simple fingerprint
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    window.devicePixelRatio || 1
  ].join('|');
  
  // Generate hash-like ID
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  const visitorId = Math.abs(hash).toString(36) + Date.now().toString(36);
  localStorage.setItem('visitor_id', visitorId);
  return visitorId;
};

export interface VisitorStats {
  todayViews: number;
  todayUniqueVisitors: number;
  yesterdayViews: number;
  yesterdayUniqueVisitors: number;
  weekViews: number;
  weekUniqueVisitors: number;
}

export const useVisitorTracking = () => {
  const location = useLocation();
  const [visitorStats, setVisitorStats] = useState<VisitorStats>({
    todayViews: 0,
    todayUniqueVisitors: 0,
    yesterdayViews: 0,
    yesterdayUniqueVisitors: 0,
    weekViews: 0,
    weekUniqueVisitors: 0,
  });
  const [loading, setLoading] = useState(true);

  // Track page view
  useEffect(() => {
    const trackPageView = async () => {
      const visitorId = generateVisitorId();
      const currentPath = location.pathname;
      
      try {
        // Insert page view
        await supabase
          .from('page_views')
          .insert({
            visitor_id: visitorId,
            page_path: currentPath,
            user_agent: navigator.userAgent,
          });

        // Insert/update unique visitor for today
        await supabase
          .from('unique_visitors')
          .insert({
            visitor_id: visitorId,
          })
          .select()
          .single();
      } catch (error) {
        // Ignore errors for duplicate unique visitors (expected)
        console.debug('Visitor tracking error (expected for returning visitors):', error);
      }
    };

    trackPageView();
  }, [location.pathname]);

  // Fetch visitor stats (admin only)
  const fetchVisitorStats = async () => {
    try {
      setLoading(true);
      
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Get today's stats
      const [todayViewsResult, todayUniqueResult] = await Promise.all([
        supabase
          .from('page_views')
          .select('id', { count: 'exact' })
          .gte('created_at', today)
          .lt('created_at', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
        
        supabase
          .from('unique_visitors')
          .select('id', { count: 'exact' })
          .eq('date', today)
      ]);

      // Get yesterday's stats  
      const [yesterdayViewsResult, yesterdayUniqueResult] = await Promise.all([
        supabase
          .from('page_views')
          .select('id', { count: 'exact' })
          .gte('created_at', yesterday)
          .lt('created_at', today),
        
        supabase
          .from('unique_visitors')
          .select('id', { count: 'exact' })
          .eq('date', yesterday)
      ]);

      // Get week's stats
      const [weekViewsResult, weekUniqueResult] = await Promise.all([
        supabase
          .from('page_views')
          .select('id', { count: 'exact' })
          .gte('created_at', weekAgo),
        
        supabase
          .from('unique_visitors')
          .select('id', { count: 'exact' })
          .gte('date', weekAgo)
      ]);

      setVisitorStats({
        todayViews: todayViewsResult.count || 0,
        todayUniqueVisitors: todayUniqueResult.count || 0,
        yesterdayViews: yesterdayViewsResult.count || 0,
        yesterdayUniqueVisitors: yesterdayUniqueResult.count || 0,
        weekViews: weekViewsResult.count || 0,
        weekUniqueVisitors: weekUniqueResult.count || 0,
      });
    } catch (error) {
      console.error('Error fetching visitor stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    visitorStats,
    fetchVisitorStats,
    loading,
  };
};