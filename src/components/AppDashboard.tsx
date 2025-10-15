import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, signOut } from '../lib/auth';
import { getCurrentUserAdminPermissions } from '../lib/admin';
import { getUserProperties, getRecentActivity, getDashboardStats } from '../lib/dashboard';
import type { Property, ActivityItem, DashboardStats } from '../lib/dashboard';
import CallVolumeChart from './CallVolumeChart';
import { User, LogOut, Home, Settings, HelpCircle, Shield } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

/**
 * Helper function to calculate "time ago" from a timestamp
 */
const getTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now.getTime() - past.getTime();
  
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return past.toLocaleDateString();
};

/**
 * App Dashboard Component
 * Main dashboard for authenticated users at /app route
 */
const AppDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Dashboard data state
  const [properties, setProperties] = useState<Property[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_calls: 0,
    tour_rate: 0,
    avg_call_duration: '0m 0s',
    active_properties: 0
  });
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      
      // Check if user is admin
      const adminPermissions = await getCurrentUserAdminPermissions();
      setIsAdmin(adminPermissions?.is_admin || false);
    };

    loadUser();
  }, []);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoadingData(true);
      
      try {
        // Fetch all dashboard data in parallel
        const [propertiesData, activitiesData, statsData] = await Promise.all([
          getUserProperties(),
          getRecentActivity(10),
          getDashboardStats()
        ]);

        setProperties(propertiesData);
        setActivities(activitiesData);
        setStats(statsData);
        
        console.log('Dashboard data loaded:', {
          properties: propertiesData,
          activities: activitiesData,
          stats: statsData
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    const result = await signOut();
    
    if (result.success) {
      navigate('/login', { replace: true });
    } else {
      console.error('Sign out error:', result.error);
      setIsLoggingOut(false);
    }
  };

  const displayName = user?.user_metadata?.display_name || 
                      user?.user_metadata?.full_name || 
                      user?.email?.split('@')[0] || 
                      'User';

  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-[#1E293B]">Leo Voice Agent</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 px-4 py-2 text-[#64748B] hover:text-[#1E293B] transition-colors"
              >
                <Home className="w-5 h-5" />
                <span>Home</span>
              </button>
              
              {isAdmin && (
                <button
                  onClick={() => navigate('/admin')}
                  className="flex items-center space-x-2 px-4 py-2 text-[#64748B] hover:text-[#1E293B] transition-colors"
                >
                  <Shield className="w-5 h-5" />
                  <span>Admin</span>
                </button>
              )}
              
              <div className="flex items-center space-x-3 px-4 py-2 bg-[#F5F3EF] rounded-lg">
                <User className="w-5 h-5 text-[#64748B]" />
                <span className="text-[#1E293B] font-medium">{displayName}</span>
              </div>
              
              <button
                onClick={handleSignOut}
                disabled={isLoggingOut}
                className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogOut className="w-5 h-5" />
                <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Dashboard Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-[#1E293B] mb-6">
            Dashboard
          </h2>
          
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Calls</p>
                  {isLoadingData ? (
                    <div className="animate-pulse">
                      <div className="h-9 bg-white/20 rounded w-20 mb-1"></div>
                    </div>
                  ) : (
                    <>
                      <p className="text-3xl font-bold">{stats.total_calls.toLocaleString()}</p>
                      <p className="text-blue-100 text-sm">All time</p>
                    </>
                  )}
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#10B981] to-[#059669] rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Tour Rate</p>
                  {isLoadingData ? (
                    <div className="animate-pulse">
                      <div className="h-9 bg-white/20 rounded w-20 mb-1"></div>
                    </div>
                  ) : (
                    <>
                      <p className="text-3xl font-bold">{stats.tour_rate}%</p>
                      <p className="text-green-100 text-sm">
                        {stats.total_calls > 0 ? 'Tours scheduled' : 'No calls yet'}
                      </p>
                    </>
                  )}
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Avg. Call Duration</p>
                  {isLoadingData ? (
                    <div className="animate-pulse">
                      <div className="h-9 bg-white/20 rounded w-20 mb-1"></div>
                    </div>
                  ) : (
                    <>
                      <p className="text-3xl font-bold">{stats.avg_call_duration}</p>
                      <p className="text-orange-100 text-sm">Average duration</p>
                    </>
                  )}
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Active Properties</p>
                  {isLoadingData ? (
                    <div className="animate-pulse">
                      <div className="h-9 bg-white/20 rounded w-20 mb-1"></div>
                    </div>
                  ) : (
                    <>
                      <p className="text-3xl font-bold">{stats.active_properties}</p>
                      <p className="text-purple-100 text-sm">Currently active</p>
                    </>
                  )}
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <CallVolumeChart className="mb-8" />

          {/* Properties and Recent Activity Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Properties Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-[#1E293B] mb-4">Properties (incl. key stats)</h3>
              
              {isLoadingData ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#38BDF8]"></div>
                  <span className="ml-3 text-[#64748B]">Loading properties...</span>
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p className="text-[#64748B]">No properties found</p>
                  <p className="text-sm text-[#94A3B8] mt-1">Properties will appear here once added</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {properties.slice(0, 5).map((property) => (
                    <div key={property.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-[#1E293B]">{property.name}</p>
                        <p className="text-sm text-[#64748B]">
                          {property.call_count || 0} calls • {property.lead_count || 0} leads • {property.conversion_count || 0} conversions
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        property.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {property.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              {!isLoadingData && properties.length > 5 && (
                <button className="w-full mt-4 py-2 text-[#38BDF8] hover:text-[#0EA5E9] font-medium transition-colors">
                  View all {properties.length} properties →
                </button>
              )}
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-[#1E293B] mb-4">Recent Activity</h3>
              
              {isLoadingData ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#38BDF8]"></div>
                  <span className="ml-3 text-[#64748B]">Loading activity...</span>
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-[#64748B]">No recent activity</p>
                  <p className="text-sm text-[#94A3B8] mt-1">Activity will appear here once calls are made</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.slice(0, 10).map((activity) => {
                    // Calculate time ago
                    const timeAgo = getTimeAgo(activity.timestamp);
                    
                    // Determine color based on activity type
                    const colorClass = activity.type === 'lead' 
                      ? 'bg-green-500' 
                      : activity.type === 'call' 
                      ? 'bg-[#38BDF8]' 
                      : activity.type === 'property_update'
                      ? 'bg-yellow-500'
                      : 'bg-purple-500';
                    
                    return (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className={`w-2 h-2 ${colorClass} rounded-full mt-2`}></div>
                        <div className="flex-1">
                          <p className="text-sm text-[#1E293B]">{activity.message}</p>
                          <p className="text-xs text-[#64748B]">{timeAgo}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {!isLoadingData && activities.length > 10 && (
                <button className="w-full mt-4 py-2 text-[#38BDF8] hover:text-[#0EA5E9] font-medium transition-colors">
                  View all activity →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-[#1E293B] mb-4">
            Welcome back, {displayName}! 👋
          </h2>
          <p className="text-[#64748B] text-lg">
            You're now in the secure app area. This is where you can access all the features of Leo Voice Agent.
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-[#F7EF00] rounded-lg flex items-center justify-center mb-4">
              <Settings className="w-6 h-6 text-[#1E293B]" />
            </div>
            <h3 className="text-xl font-semibold text-[#1E293B] mb-2">Settings</h3>
            <p className="text-[#64748B]">
              Configure your voice agent preferences and account settings.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-[#38BDF8] rounded-lg flex items-center justify-center mb-4">
              <User className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-[#1E293B] mb-2">Profile</h3>
            <p className="text-[#64748B]">
              Update your profile information and manage your account.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-[#10B981] rounded-lg flex items-center justify-center mb-4">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-[#1E293B] mb-2">Help & Support</h3>
            <p className="text-[#64748B]">
              Get help with using Leo Voice Agent and contact support.
            </p>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] rounded-2xl shadow-lg p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Your Account Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-blue-100 mb-1">Email</p>
              <p className="text-lg font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-blue-100 mb-1">Account Created</p>
              <p className="text-lg font-medium">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-blue-100 mb-1">User ID</p>
              <p className="text-sm font-mono">{user?.id}</p>
            </div>
            <div>
              <p className="text-blue-100 mb-1">Authentication Method</p>
              <p className="text-lg font-medium">
                {user?.app_metadata?.provider ? 
                  user.app_metadata.provider.charAt(0).toUpperCase() + user.app_metadata.provider.slice(1) : 
                  'Email'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppDashboard;

