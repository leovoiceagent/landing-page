import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Home, 
  Users, 
  Settings, 
  Shield, 
  LogOut, 
  BarChart3,
  Plus,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react';
import { signOut } from '../lib/auth';
import { getCurrentUserAdminPermissions } from '../lib/admin';
import { AdminPermissions } from '../lib/admin';
import OrganizationsManagement from './admin/OrganizationsManagement';
import PropertiesManagement from './admin/PropertiesManagement';
import UsersManagement from './admin/UsersManagement';
import AdminUsersManagement from './admin/AdminUsersManagement';

type AdminTab = 'organizations' | 'properties' | 'users' | 'admin-users' | 'settings';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('organizations');
  const [adminPermissions, setAdminPermissions] = useState<AdminPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const loadAdminPermissions = async () => {
      try {
        const permissions = await getCurrentUserAdminPermissions();
        setAdminPermissions(permissions);
        
        if (!permissions?.is_admin) {
          navigate('/app', { replace: true });
          return;
        }
      } catch (error) {
        console.error('Error loading admin permissions:', error);
        navigate('/app', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    loadAdminPermissions();
  }, [navigate]);

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

  const tabs = [
    {
      id: 'organizations' as AdminTab,
      label: 'Organizations',
      icon: Building2,
      permission: 'can_manage_organizations'
    },
    {
      id: 'properties' as AdminTab,
      label: 'Properties',
      icon: Home,
      permission: 'can_manage_properties'
    },
    {
      id: 'users' as AdminTab,
      label: 'Users',
      icon: Users,
      permission: 'can_manage_users'
    },
    {
      id: 'admin-users' as AdminTab,
      label: 'Admin Users',
      icon: Shield,
      permission: 'can_manage_users'
    },
    {
      id: 'settings' as AdminTab,
      label: 'Settings',
      icon: Settings,
      permission: 'can_view_all_data'
    }
  ];

  const filteredTabs = tabs.filter(tab => 
    adminPermissions?.[tab.permission as keyof AdminPermissions] || 
    adminPermissions?.admin_level === 'super_admin'
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F3EF] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-12 h-12 bg-[#38BDF8] rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-white animate-pulse" />
          </div>
          <h2 className="text-xl font-semibold text-[#1E293B] mb-2">
            Loading Admin Panel...
          </h2>
          <p className="text-[#64748B]">
            Checking your permissions...
          </p>
        </div>
      </div>
    );
  }

  if (!adminPermissions?.is_admin) {
    return (
      <div className="min-h-screen bg-[#F5F3EF] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-[#1E293B] mb-2">
            Access Denied
          </h2>
          <p className="text-[#64748B] mb-6">
            You don't have admin permissions to access this area.
          </p>
          <button
            onClick={() => navigate('/app')}
            className="bg-[#38BDF8] text-white px-6 py-2 rounded-xl font-semibold hover:bg-[#0EA5E9] transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'organizations':
        return <OrganizationsManagement />;
      case 'properties':
        return <PropertiesManagement />;
      case 'users':
        return <UsersManagement />;
      case 'admin-users':
        return <AdminUsersManagement />;
      case 'settings':
        return (
          <div className="bg-white rounded-xl p-8">
            <h3 className="text-2xl font-bold text-[#1E293B] mb-6">Admin Settings</h3>
            <div className="space-y-6">
              <div className="p-6 bg-gray-50 rounded-xl">
                <h4 className="text-lg font-semibold text-[#1E293B] mb-2">Your Admin Permissions</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${adminPermissions.can_manage_organizations ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm text-[#64748B]">Manage Organizations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${adminPermissions.can_manage_properties ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm text-[#64748B]">Manage Properties</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${adminPermissions.can_manage_users ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm text-[#64748B]">Manage Users</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${adminPermissions.can_view_all_data ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm text-[#64748B]">View All Data</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-[#64748B]">
                    <strong>Admin Level:</strong> {adminPermissions.admin_level}
                  </p>
                  <p className="text-sm text-[#64748B]">
                    <strong>Organization ID:</strong> {adminPermissions.organization_id}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <OrganizationsManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-8 h-8 text-[#38BDF8]" />
                <h1 className="text-2xl font-bold text-[#1E293B]">Admin Panel</h1>
                <span className="px-2 py-1 bg-[#38BDF8] text-white text-xs rounded-full">
                  {adminPermissions.admin_level}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/app')}
                className="flex items-center space-x-2 px-4 py-2 text-[#64748B] hover:text-[#1E293B] transition-colors"
              >
                <BarChart3 className="w-5 h-5" />
                <span>Dashboard</span>
              </button>
              
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-64 bg-white rounded-xl shadow-sm p-6 h-fit">
            <nav className="space-y-2">
              {filteredTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-[#38BDF8] text-white'
                        : 'text-[#64748B] hover:bg-gray-100 hover:text-[#1E293B]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
