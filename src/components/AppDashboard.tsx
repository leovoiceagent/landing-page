import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Home, Shield } from 'lucide-react';
import { getCurrentUserAdminPermissions } from '../lib/admin';
import { getUserProperties, getDashboardStats, getRecentCallRecords } from '../lib/dashboard';
import type { Property, DashboardStats, CallRecord } from '../lib/dashboard';
import CallVolumeChart from './CallVolumeChart';

const AppDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Dashboard data state
  const [properties, setProperties] = useState<Property[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_calls: 0,
    tour_rate: 0,
    avg_call_duration: '0m 0s',
    active_properties: 0
  });
  const [callRecords, setCallRecords] = useState<CallRecord[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const adminPermissions = await getCurrentUserAdminPermissions();
        setIsAdmin(adminPermissions?.is_admin || false);
      } catch (error) {
        console.error('Error loading admin permissions:', error);
      }
    };

    loadUser();
  }, []);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoadingData(true);
      
      try {
        // Fetch all dashboard data in parallel
        const [propertiesData, statsData, callRecordsData] = await Promise.all([
          getUserProperties(),
          getDashboardStats(),
          getRecentCallRecords(20)
        ]);

        setProperties(propertiesData);
        setStats(statsData);
        setCallRecords(callRecordsData);
        
        console.log('Dashboard data loaded:', {
          properties: propertiesData,
          stats: statsData,
          callRecords: callRecordsData
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadDashboardData();
  }, []);

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
              <Link
                to="/"
                className="flex items-center space-x-2 px-4 py-2 text-[#64748B] hover:text-[#1E293B] transition-colors"
              >
                <Home className="w-5 h-5" />
                <span>Home</span>
              </Link>
              
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center space-x-2 px-4 py-2 text-[#64748B] hover:text-[#1E293B] transition-colors"
                >
                  <Shield className="w-5 h-5" />
                  <span>Admin</span>
                </Link>
              )}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Avg Call Duration</p>
                  {isLoadingData ? (
                    <div className="animate-pulse">
                      <div className="h-9 bg-white/20 rounded w-20 mb-1"></div>
                    </div>
                  ) : (
                    <>
                      <p className="text-3xl font-bold">{stats.avg_call_duration}</p>
                      <p className="text-orange-100 text-sm">Per call</p>
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
                      <p className="text-purple-100 text-sm">Properties</p>
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
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Properties Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-1">
              <h3 className="text-lg font-semibold text-[#1E293B] mb-4">
                Properties (incl. key stats)
                {!isLoadingData && properties.length > 0 && (
                  <span className="text-sm font-normal text-[#64748B] ml-2">
                    {stats.total_calls.toLocaleString()} total calls
                  </span>
                )}
              </h3>
              
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
                  <p className="text-sm text-[#94A3B8] mt-1">Properties will appear here once they are added</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {properties.map((property) => (
                    <div key={property.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-[#1E293B]">{property.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            property.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {property.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-[#64748B]">
                          {property.call_count || 0} calls • {property.lead_count || 0} leads • {property.conversion_count || 0} conversions
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-[#1E293B] mb-4">Recent Activities</h3>
              
              {isLoadingData ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#38BDF8]"></div>
                  <span className="ml-3 text-[#64748B]">Loading recent activity...</span>
                </div>
              ) : callRecords.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-[#64748B]">No recent activity</p>
                  <p className="text-sm text-[#94A3B8] mt-1">Call records will appear here once calls are made</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {callRecords.map((record) => (
                    <div key={record.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                      {/* First line: Customer info */}
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-[#1E293B]">
                            {record.customer_first_name} {record.customer_last_name}
                          </span>
                          <span className="text-sm text-[#64748B]">•</span>
                          <span className="text-sm text-[#64748B]">{record.customer_phone}</span>
                          <span className="text-sm text-[#64748B]">•</span>
                          <span className="text-sm text-[#64748B]">{record.customer_email}</span>
                        </div>
                        {record.tour_scheduled_for && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Tour: {new Date(record.tour_scheduled_for).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      
                      {/* Second line: Call summary */}
                      <p className="text-sm text-[#64748B] line-clamp-2">
                        {record.call_summary || 'No summary available'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-[#1E293B] mb-4">
            Welcome back! 👋
          </h2>
          <p className="text-[#64748B] text-lg">
            You're now in the secure app area. This is where you can access all the features of Leo Voice Agent.
          </p>
        </div>

        {/* Account Info Card */}
        <div className="bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] rounded-2xl shadow-lg p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Account Status</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-blue-100 mb-1">Status</p>
              <p className="text-lg font-medium">Active</p>
            </div>
            <div>
              <p className="text-blue-100 mb-1">Access Level</p>
              <p className="text-lg font-medium">
                {isAdmin ? 'Administrator' : 'Standard User'}
              </p>
            </div>
            <div>
              <p className="text-blue-100 mb-1">Dashboard</p>
              <p className="text-lg font-medium">Ready</p>
            </div>
            <div>
              <p className="text-blue-100 mb-1">Last Updated</p>
              <p className="text-lg font-medium">
                {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppDashboard;
