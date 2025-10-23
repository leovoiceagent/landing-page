import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Home, Shield } from 'lucide-react';
import { getCurrentUserAdminPermissions } from '../lib/admin';
import { getUserProperties, getDashboardStats } from '../lib/dashboard';
import type { Property, DashboardStats } from '../lib/dashboard';

const AppDashboardMinimal: React.FC = () => {
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
        const [propertiesData, statsData] = await Promise.all([
          getUserProperties(),
          getDashboardStats()
        ]);

        setProperties(propertiesData);
        setStats(statsData);
        
        console.log('Dashboard data loaded:', {
          properties: propertiesData,
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
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-[#1E293B] mb-6">
            Dashboard (Minimal Test)
          </h2>
          <p className="text-[#64748B] text-lg">
            This is a minimal test version to isolate the error.
          </p>
        </div>
      </main>
    </div>
  );
};

export default AppDashboardMinimal;
