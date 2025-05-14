import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/queryClient';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useToast } from '../../hooks/use-toast';
import { 
  ExternalLink, 
  RefreshCw, 
  Loader2, 
  BarChart4, 
  MapPin, 
  Globe, 
  CalendarDays,
  Cpu,
  Layers,
  Share2
} from 'lucide-react';
import { format, formatDistance, parseISO } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type RedirectUrl = {
  id: number;
  name: string;
  destinationUrl: string;
  accessCount: number;
  lastAccessed: string | null;
  createdAt: string;
  updatedAt?: string;
};

type QRCodeAnalyticsData = {
  totalScans: number;
  devices: Record<string, number>;
  browsers: Record<string, number>;
  operatingSystems: Record<string, number>;
  scansByRedirect: Record<number, number>;
  utmSources: Record<string, number>;
  utmMediums: Record<string, number>;
  utmCampaigns: Record<string, number>;
  locations: Record<string, number>;
  dailyScans: Record<string, number>;
  campaigns: Array<{name: string, scans: number}>;
  rawData: any[];
};

interface QRCodeAnalyticsProps {
  mainRedirectDestination: string;
}

export function QRCodeAnalytics({ mainRedirectDestination }: QRCodeAnalyticsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch redirect statistics
  const { data: redirectStats = [], isLoading: isStatsLoading } = useQuery({
    queryKey: ['/api/redirect-stats'],
    queryFn: () => apiRequest('/api/redirect-stats', 'GET'),
  });
  
  // Fetch detailed QR analytics data
  const { data: analyticsData, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ['/api/qr-analytics'],
    queryFn: async () => {
      const data = await apiRequest('/api/qr-analytics', 'GET');
      return data as QRCodeAnalyticsData;
    },
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy h:mm a');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const formatTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      return formatDistance(date, new Date(), { addSuffix: true });
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Helper function to calculate percentage and get width style
  const getPercentageStyle = (value: number, total: number) => {
    if (total === 0) return { percentage: 0, style: { width: '0%' } };
    const percentage = Math.round((value / total) * 100);
    return { 
      percentage, 
      style: { width: `${percentage}%` }
    };
  };
  
  // Helper function to get top items from analytics records
  const getTopItems = (data: Record<string, number>, limit = 4) => {
    return Object.entries(data)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([key, value]) => ({ name: key, value }));
  };
  
  // The date format for displaying daily scans
  const formatScanDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM d, yyyy');
    } catch (e) {
      return dateStr;
    }
  };
  
  const isLoading = isStatsLoading || isAnalyticsLoading;
  
  return (
    <Card className="mt-6 overflow-hidden border shadow">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">QR Code Analytics</CardTitle>
        <CardDescription>
          Track performance and usage statistics for your QR code redirects
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-8">
        {isLoading ? (
          <div className="py-6 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* QR Scans Analytics Summary */}
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <h3 className="text-lg font-semibold mb-4">QR Analytics</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Total QR Scans</span>
                    <p className="text-3xl font-bold text-primary">{analyticsData?.totalScans || 0}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Today's Scans</span>
                    <p className="font-medium">
                      {analyticsData?.dailyScans && Object.keys(analyticsData.dailyScans).length > 0 
                        ? analyticsData.dailyScans[Object.keys(analyticsData.dailyScans)[0]] 
                        : 0}
                    </p>
                    <p className="text-xs text-gray-500">
                      {analyticsData?.dailyScans && Object.keys(analyticsData.dailyScans).length > 0 
                        ? formatScanDate(Object.keys(analyticsData.dailyScans)[0])
                        : 'No data available'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Total Scans by Device Type */}
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center mb-4">
                  <BarChart4 className="h-5 w-5 mr-2 text-primary" />
                  <h3 className="text-lg font-semibold">Device Types</h3>
                </div>
                <div className="space-y-3">
                  {analyticsData && analyticsData.totalScans > 0 ? (
                    Object.entries(analyticsData.devices)
                      .sort(([, a], [, b]) => b - a)
                      .map(([device, count]) => {
                        const { percentage, style } = getPercentageStyle(count, analyticsData.totalScans);
                        return (
                          <div key={device} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-sm capitalize">{device}</span>
                              <span className="text-sm font-medium">{percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div className="bg-primary h-2 rounded-full" style={style}></div>
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <p className="text-sm text-gray-500">No data available yet</p>
                  )}
                </div>
              </div>
              
              {/* UTM Campaign Summary */}
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center mb-4">
                  <Globe className="h-5 w-5 mr-2 text-primary" />
                  <h3 className="text-lg font-semibold">Top Campaigns</h3>
                </div>
                <div className="space-y-2">
                  {analyticsData && analyticsData.campaigns && analyticsData.campaigns.length > 0 ? (
                    analyticsData.campaigns.slice(0, 4).map(campaign => {
                      const { percentage, style } = getPercentageStyle(campaign.scans, analyticsData.totalScans);
                      return (
                        <div key={campaign.name} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">{campaign.name === 'none' ? 'No Campaign' : campaign.name}</span>
                            <span className="text-sm font-medium">{campaign.scans} scans</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={style}></div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500">No campaign data available</p>
                  )}
                </div>
              </div>
              
              {/* Daily Scan Activity */}
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center mb-4">
                  <CalendarDays className="h-5 w-5 mr-2 text-primary" />
                  <h3 className="text-lg font-semibold">Daily Scan Activity</h3>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {analyticsData && analyticsData.dailyScans && Object.keys(analyticsData.dailyScans).length > 0 ? (
                    Object.entries(analyticsData.dailyScans)
                      .sort(([a, ], [b, ]) => b.localeCompare(a)) // Sort by date descending
                      .map(([date, count]) => {
                        const { style } = getPercentageStyle(
                          count, 
                          Math.max(...Object.values(analyticsData.dailyScans))
                        );
                        return (
                          <div key={date} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">{formatScanDate(date)}</span>
                              <span className="text-sm font-medium">{count} scans</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div className="bg-primary h-2 rounded-full" style={style}></div>
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <p className="text-sm text-gray-500">No daily scan data available yet</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Browser Analytics */}
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center mb-4">
                  <Globe className="h-5 w-5 mr-2 text-blue-500" />
                  <h3 className="text-lg font-semibold">Browser Analytics</h3>
                </div>
                <div className="space-y-3">
                  {analyticsData && analyticsData.browsers && Object.keys(analyticsData.browsers).length > 0 ? (
                    Object.entries(analyticsData.browsers)
                      .sort(([, a], [, b]) => b - a)
                      .map(([browser, count]) => {
                        const { percentage, style } = getPercentageStyle(count, analyticsData.totalScans);
                        return (
                          <div key={browser} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-sm capitalize">{browser}</span>
                              <span className="text-sm font-medium">{percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div className="bg-blue-500 h-2 rounded-full" style={style}></div>
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <p className="text-sm text-gray-500">No browser data available</p>
                  )}
                </div>
              </div>
              
              {/* Operating System Analytics */}
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center mb-4">
                  <Cpu className="h-5 w-5 mr-2 text-green-500" />
                  <h3 className="text-lg font-semibold">Operating Systems</h3>
                </div>
                <div className="space-y-3">
                  {analyticsData && analyticsData.operatingSystems && Object.keys(analyticsData.operatingSystems).length > 0 ? (
                    Object.entries(analyticsData.operatingSystems)
                      .sort(([, a], [, b]) => b - a)
                      .map(([os, count]) => {
                        const { percentage, style } = getPercentageStyle(count, analyticsData.totalScans);
                        return (
                          <div key={os} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-sm capitalize">{os}</span>
                              <span className="text-sm font-medium">{percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full" style={style}></div>
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <p className="text-sm text-gray-500">No OS data available</p>
                  )}
                </div>
              </div>
              
              {/* Traffic Sources */}
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center mb-4">
                  <Share2 className="h-5 w-5 mr-2 text-purple-500" />
                  <h3 className="text-lg font-semibold">Traffic Sources</h3>
                </div>
                <div className="space-y-3">
                  {analyticsData && analyticsData.utmSources && Object.keys(analyticsData.utmSources).length > 0 ? (
                    Object.entries(analyticsData.utmSources)
                      .sort(([, a], [, b]) => b - a)
                      .map(([source, count]) => {
                        const { percentage, style } = getPercentageStyle(count, analyticsData.totalScans);
                        return (
                          <div key={source} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">{source || 'Direct'}</span>
                              <span className="text-sm font-medium">{count} scans</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div className="bg-purple-500 h-2 rounded-full" style={style}></div>
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <p className="text-sm text-gray-500">No source data available</p>
                  )}
                </div>
              </div>
              
              {/* Traffic Mediums */}
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center mb-4">
                  <Layers className="h-5 w-5 mr-2 text-indigo-500" />
                  <h3 className="text-lg font-semibold">Traffic Mediums</h3>
                </div>
                <div className="space-y-3">
                  {analyticsData && analyticsData.utmMediums && Object.keys(analyticsData.utmMediums).length > 0 ? (
                    Object.entries(analyticsData.utmMediums)
                      .sort(([, a], [, b]) => b - a)
                      .map(([medium, count]) => {
                        const { percentage, style } = getPercentageStyle(count, analyticsData.totalScans);
                        return (
                          <div key={medium} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">{medium || 'None'}</span>
                              <span className="text-sm font-medium">{count} scans</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div className="bg-indigo-500 h-2 rounded-full" style={style}></div>
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <p className="text-sm text-gray-500">No medium data available</p>
                  )}
                </div>
              </div>
              
              {/* Geographic Locations */}
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center mb-4">
                  <MapPin className="h-5 w-5 mr-2 text-amber-500" />
                  <h3 className="text-lg font-semibold">Geographic Locations</h3>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {analyticsData && analyticsData.locations && Object.keys(analyticsData.locations).length > 0 ? (
                    Object.entries(analyticsData.locations)
                      .sort(([, a], [, b]) => b - a)
                      .map(([location, count]) => {
                        const { percentage, style } = getPercentageStyle(count, analyticsData.totalScans);
                        return (
                          <div key={location} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">{location || 'Unknown'}</span>
                              <span className="text-sm font-medium">{count} scans</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div className="bg-amber-500 h-2 rounded-full" style={style}></div>
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <p className="text-sm text-gray-500">No location data available yet</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Refresh Button */}
            <div className="mt-6 text-center">
              <Button 
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ['/api/redirect-stats'] });
                  queryClient.invalidateQueries({ queryKey: ['/api/qr-analytics'] });
                  toast({
                    title: "Analytics Refreshed",
                    description: "The latest QR code analytics data has been loaded.",
                    duration: 3000,
                  });
                }}
                variant="outline"
                className="mx-auto"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Analytics
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default QRCodeAnalytics;