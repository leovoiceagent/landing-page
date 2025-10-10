import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Pause, Play, Shield, User, Building2, Mail, Crown } from 'lucide-react';
import { 
  getAdminUsers, 
  createAdminUser, 
  updateAdminUser, 
  deleteAdminUser,
  getOrganizations,
  getUserProfiles,
  type AdminUser,
  type Organization,
  type UserProfile 
} from '../../lib/admin';

const AdminUsersManagement: React.FC = () => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInactiveModal, setShowInactiveModal] = useState<string | null>(null);
  const [formData, setFormData] = useState({ 
    user_id: '',
    organization_id: '',
    admin_level: 'admin',
    can_manage_organizations: true,
    can_manage_properties: true,
    can_manage_users: true,
    can_view_all_data: true
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [adminUsersData, organizationsData, userProfilesData] = await Promise.all([
        getAdminUsers(),
        getOrganizations(),
        getUserProfiles()
      ]);
      setAdminUsers(adminUsersData);
      setOrganizations(organizationsData);
      setUserProfiles(userProfilesData);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.user_id || !formData.organization_id) return;

    try {
      setIsCreating(true);
      setError(null);
      const result = await createAdminUser(
        formData.user_id,
        formData.organization_id,
        formData.admin_level,
        {
          can_manage_organizations: formData.can_manage_organizations,
          can_manage_properties: formData.can_manage_properties,
          can_manage_users: formData.can_manage_users,
          can_view_all_data: formData.can_view_all_data
        }
      );
      
      if (result.success) {
        setShowCreateModal(false);
        setFormData({ 
          user_id: '',
          organization_id: '',
          admin_level: 'admin',
          can_manage_organizations: true,
          can_manage_properties: true,
          can_manage_users: true,
          can_view_all_data: true
        });
        await loadData();
      } else {
        setError(result.error || 'Failed to create admin user');
      }
    } catch (error) {
      console.error('Error creating admin user:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (id: string, adminLevel: string, permissions: any) => {
    try {
      setError(null);
      const result = await updateAdminUser(id, adminLevel, permissions);
      
      if (result.success) {
        setIsEditing(null);
        await loadData();
      } else {
        setError(result.error || 'Failed to update admin user');
      }
    } catch (error) {
      console.error('Error updating admin user:', error);
      setError('An unexpected error occurred');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      setError(null);
      const result = await updateAdminUser(id, undefined, { is_active: isActive });
      
      if (result.success) {
        setShowInactiveModal(null);
        await loadData();
      } else {
        setError(result.error || `Failed to ${isActive ? 'activate' : 'deactivate'} admin user`);
      }
    } catch (error) {
      console.error('Error toggling admin user status:', error);
      setError('An unexpected error occurred');
    }
  };

  const filteredAdminUsers = adminUsers.filter(admin => {
    const matchesSearch = 
      admin.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.organization_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOrg = selectedOrg === 'all' || admin.organization_id === selectedOrg;
    return matchesSearch && matchesOrg;
  });

  // Get available users (those not already admins)
  const availableUsers = userProfiles.filter(user => 
    !adminUsers.some(admin => admin.user_id === user.user_id)
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#1E293B]">Admin Users</h2>
            <p className="text-[#64748B]">Manage admin privileges and permissions</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={availableUsers.length === 0}
            className="flex items-center space-x-2 bg-[#38BDF8] text-white px-4 py-2 rounded-lg hover:bg-[#0EA5E9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            <span>Add Admin</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search admin users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent"
            />
          </div>
          <select
            value={selectedOrg}
            onChange={(e) => setSelectedOrg(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent"
          >
            <option value="all">All Organizations</option>
            {organizations.map(org => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Admin Users List */}
      <div className="bg-white rounded-xl overflow-hidden">
        {filteredAdminUsers.length === 0 ? (
          <div className="p-8 text-center">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#1E293B] mb-2">No admin users found</h3>
            <p className="text-[#64748B] mb-4">
              {searchTerm || selectedOrg !== 'all' 
                ? 'Try adjusting your search or filter terms' 
                : 'Get started by creating your first admin user'
              }
            </p>
            {!searchTerm && selectedOrg === 'all' && availableUsers.length > 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-[#38BDF8] text-white px-4 py-2 rounded-lg hover:bg-[#0EA5E9] transition-colors"
              >
                Create Admin User
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAdminUsers.map((admin) => (
              <div key={admin.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {isEditing === admin.id ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          const adminLevel = formData.get('admin_level') as string;
                          const permissions = {
                            can_manage_organizations: formData.get('can_manage_organizations') === 'on',
                            can_manage_properties: formData.get('can_manage_properties') === 'on',
                            can_manage_users: formData.get('can_manage_users') === 'on',
                            can_view_all_data: formData.get('can_view_all_data') === 'on',
                            is_active: formData.get('is_active') === 'on'
                          };
                          handleUpdate(admin.id, adminLevel, permissions);
                        }}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-[#1E293B] mb-1">
                              Admin Level
                            </label>
                            <select
                              name="admin_level"
                              defaultValue={admin.admin_level}
                              className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent"
                            >
                              <option value="admin">Admin</option>
                              <option value="super_admin">Super Admin</option>
                            </select>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              name="is_active"
                              defaultChecked={admin.is_active}
                              className="rounded"
                            />
                            <label className="text-sm text-[#1E293B]">Active</label>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                name="can_manage_organizations"
                                defaultChecked={admin.can_manage_organizations}
                                className="rounded"
                              />
                              <label className="text-sm text-[#1E293B]">Manage Organizations</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                name="can_manage_properties"
                                defaultChecked={admin.can_manage_properties}
                                className="rounded"
                              />
                              <label className="text-sm text-[#1E293B]">Manage Properties</label>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                name="can_manage_users"
                                defaultChecked={admin.can_manage_users}
                                className="rounded"
                              />
                              <label className="text-sm text-[#1E293B]">Manage Users</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                name="can_view_all_data"
                                defaultChecked={admin.can_view_all_data}
                                className="rounded"
                              />
                              <label className="text-sm text-[#1E293B]">View All Data</label>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            type="submit"
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsEditing(null)}
                            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div>
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-[#1E293B]">
                            {admin.user_name}
                          </h3>
                          <div className="flex items-center space-x-2">
                            {admin.admin_level === 'super_admin' ? (
                              <span className="flex items-center space-x-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                <Crown className="w-3 h-3" />
                                <span>Super Admin</span>
                              </span>
                            ) : (
                              <span className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                <Shield className="w-3 h-3" />
                                <span>Admin</span>
                              </span>
                            )}
                            {!admin.is_active && (
                              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                Inactive
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-[#64748B]">
                          <div className="flex items-center space-x-1">
                            <Mail className="w-4 h-4" />
                            <span>{admin.user_email}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Building2 className="w-4 h-4" />
                            <span>{admin.organization_name}</span>
                          </div>
                          <span>Granted {new Date(admin.granted_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-[#64748B]">
                          {admin.can_manage_organizations && <span>Organizations</span>}
                          {admin.can_manage_properties && <span>Properties</span>}
                          {admin.can_manage_users && <span>Users</span>}
                          {admin.can_view_all_data && <span>All Data</span>}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {isEditing !== admin.id && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsEditing(admin.id)}
                        className="p-2 text-[#64748B] hover:text-[#38BDF8] hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit admin user"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowInactiveModal(admin.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          admin.is_active
                            ? 'text-[#64748B] hover:text-orange-600 hover:bg-orange-50'
                            : 'text-[#64748B] hover:text-green-600 hover:bg-green-50'
                        }`}
                        title={admin.is_active ? 'Deactivate admin user' : 'Activate admin user'}
                      >
                        {admin.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold text-[#1E293B] mb-4">Create Admin User</h3>
            <form onSubmit={handleCreate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-2">
                    User
                  </label>
                  <select
                    value={formData.user_id}
                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent"
                    required
                  >
                    <option value="">Select user</option>
                    {availableUsers.map(user => (
                      <option key={user.user_id} value={user.user_id}>
                        {user.first_name} {user.last_name} ({user.email}) - {user.organization_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-2">
                    Organization
                  </label>
                  <select
                    value={formData.organization_id}
                    onChange={(e) => setFormData({ ...formData, organization_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent"
                    required
                  >
                    <option value="">Select organization</option>
                    {organizations.map(org => (
                      <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-2">
                    Admin Level
                  </label>
                  <select
                    value={formData.admin_level}
                    onChange={(e) => setFormData({ ...formData, admin_level: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent"
                  >
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-3">
                    Permissions
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.can_manage_organizations}
                          onChange={(e) => setFormData({ ...formData, can_manage_organizations: e.target.checked })}
                          className="rounded"
                        />
                        <span className="text-sm text-[#1E293B]">Manage Organizations</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.can_manage_properties}
                          onChange={(e) => setFormData({ ...formData, can_manage_properties: e.target.checked })}
                          className="rounded"
                        />
                        <span className="text-sm text-[#1E293B]">Manage Properties</span>
                      </label>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.can_manage_users}
                          onChange={(e) => setFormData({ ...formData, can_manage_users: e.target.checked })}
                          className="rounded"
                        />
                        <span className="text-sm text-[#1E293B]">Manage Users</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.can_view_all_data}
                          onChange={(e) => setFormData({ ...formData, can_view_all_data: e.target.checked })}
                          className="rounded"
                        />
                        <span className="text-sm text-[#1E293B]">View All Data</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-[#64748B] hover:text-[#1E293B] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 bg-[#38BDF8] text-white rounded-lg hover:bg-[#0EA5E9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inactive/Active Modal */}
      {showInactiveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-[#1E293B] mb-4">
              {adminUsers.find(admin => admin.id === showInactiveModal)?.is_active ? 'Deactivate' : 'Activate'} Admin User
            </h3>
            <p className="text-[#64748B] mb-6">
              {adminUsers.find(admin => admin.id === showInactiveModal)?.is_active 
                ? 'Are you sure you want to deactivate this admin user? They will lose admin privileges but can be reactivated later.'
                : 'Are you sure you want to activate this admin user? They will regain their admin privileges.'
              }
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowInactiveModal(null)}
                className="px-4 py-2 text-[#64748B] hover:text-[#1E293B] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const admin = adminUsers.find(admin => admin.id === showInactiveModal);
                  if (admin) {
                    handleToggleActive(showInactiveModal, !admin.is_active);
                  }
                }}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${
                  adminUsers.find(admin => admin.id === showInactiveModal)?.is_active
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {adminUsers.find(admin => admin.id === showInactiveModal)?.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersManagement;
