import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Pause, Play, User, Mail, Building2, Shield } from 'lucide-react';
import { 
  getUserProfiles, 
  createUserProfile, 
  updateUserProfile,
  getOrganizations,
  type UserProfile,
  type Organization 
} from '../../lib/admin';

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInactiveModal, setShowInactiveModal] = useState<string | null>(null);
  const [formData, setFormData] = useState({ 
    user_id: '',
    first_name: '', 
    last_name: '',
    organization_id: '',
    email: ''
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [usersData, organizationsData] = await Promise.all([
        getUserProfiles(),
        getOrganizations()
      ]);
      setUsers(usersData);
      setOrganizations(organizationsData);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.user_id.trim() || !formData.first_name.trim() || !formData.last_name.trim() || !formData.organization_id || !formData.email.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsCreating(true);
      setError(null);
      const result = await createUserProfile(
        formData.user_id.trim(),
        formData.organization_id,
        formData.first_name.trim(),
        formData.last_name.trim(),
        formData.email.trim()
      );
      
      if (result.success) {
        setShowCreateModal(false);
        setFormData({ user_id: '', first_name: '', last_name: '', organization_id: '', email: '' });
        await loadData();
      } else {
        setError(result.error || 'Failed to create user profile');
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (id: string, firstName: string, lastName: string, email: string, organizationId: string, isActive: boolean) => {
    try {
      setError(null);
      const result = await updateUserProfile(id, firstName, lastName, isActive);
      
      if (result.success) {
        setIsEditing(null);
        await loadData();
      } else {
        setError(result.error || 'Failed to update user profile');
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      setError('An unexpected error occurred');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      setError(null);
      const user = users.find(u => u.id === id);
      if (!user) return;
      
      const result = await updateUserProfile(id, user.first_name, user.last_name, isActive);
      
      if (result.success) {
        setShowInactiveModal(null);
        await loadData();
      } else {
        setError(result.error || `Failed to ${isActive ? 'activate' : 'deactivate'} user profile`);
      }
    } catch (error) {
      console.error('Error toggling user profile status:', error);
      setError('An unexpected error occurred');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOrg = selectedOrg === 'all' || user.organization_id === selectedOrg;
    return matchesSearch && matchesOrg;
  });

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
            <h2 className="text-2xl font-bold text-[#1E293B]">Users</h2>
            <p className="text-[#64748B]">Manage user profiles and their organization assignments</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-[#38BDF8] text-white px-4 py-2 rounded-lg hover:bg-[#0EA5E9] transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add User</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search users..."
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

      {/* Users List */}
      <div className="bg-white rounded-xl overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#1E293B] mb-2">No users found</h3>
            <p className="text-[#64748B] mb-4">
              {searchTerm || selectedOrg !== 'all' 
                ? 'Try adjusting your search or filter terms' 
                : 'Get started by creating your first user profile'
              }
            </p>
            {!searchTerm && selectedOrg === 'all' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-[#38BDF8] text-white px-4 py-2 rounded-lg hover:bg-[#0EA5E9] transition-colors"
              >
                Create User
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <div key={user.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {isEditing === user.id ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          const firstName = formData.get('first_name') as string;
                          const lastName = formData.get('last_name') as string;
                          const organizationId = formData.get('organization_id') as string;
                          const isActive = formData.get('is_active') === 'on';
                          
                          if (firstName.trim() && lastName.trim() && organizationId) {
                            // Email is read-only, so we don't pass it to handleUpdate
                            handleUpdate(user.id, firstName.trim(), lastName.trim(), user.email, organizationId, isActive);
                          }
                        }}
                        className="space-y-3"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            name="first_name"
                            defaultValue={user.first_name}
                            className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent"
                            placeholder="First name"
                            autoFocus
                            required
                          />
                          <input
                            type="text"
                            name="last_name"
                            defaultValue={user.last_name}
                            className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent"
                            placeholder="Last name"
                            required
                          />
                          <div>
                            <input
                              type="email"
                              name="email"
                              value={user.email}
                              className="px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-600 cursor-not-allowed"
                              placeholder="Email address"
                              disabled
                              readOnly
                            />
                            <div className="mt-1 mb-2 text-xs text-gray-500">
                              Email cannot be changed for security
                            </div>
                          </div>
                          <select
                            name="organization_id"
                            defaultValue={user.organization_id}
                            className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent"
                            required
                          >
                            <option value="">Select Organization</option>
                            {organizations.map(org => (
                              <option key={org.id} value={org.id}>
                                {org.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="is_active"
                            defaultChecked={user.is_active}
                            className="w-4 h-4 text-[#38BDF8] bg-gray-100 border-gray-300 rounded focus:ring-[#38BDF8] focus:ring-2"
                          />
                          <label className="text-sm text-[#64748B]">Active user</label>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            type="submit"
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsEditing(null)}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div>
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-[#1E293B]">
                            {user.first_name} {user.last_name}
                          </h3>
                          {user.is_admin && (
                            <span className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              <Shield className="w-3 h-3" />
                              <span>{user.admin_level}</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-[#64748B]">
                          <div className="flex items-center space-x-1">
                            <Mail className="w-4 h-4" />
                            <span>{user.email}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Building2 className="w-4 h-4" />
                            <span>{user.organization_name}</span>
                          </div>
                          <span>Created {new Date(user.created_at).toLocaleDateString()}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {isEditing !== user.id && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsEditing(user.id)}
                        className="p-2 text-[#64748B] hover:text-[#38BDF8] hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit user"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowInactiveModal(user.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          user.is_active
                            ? 'text-[#64748B] hover:text-orange-600 hover:bg-orange-50'
                            : 'text-[#64748B] hover:text-green-600 hover:bg-green-50'
                        }`}
                        title={user.is_active ? 'Deactivate user' : 'Activate user'}
                      >
                        {user.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
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
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-[#1E293B] mb-4">Create User Profile</h3>
            <form onSubmit={handleCreate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-2">
                    User ID (from auth.users)
                  </label>
                  <input
                    type="text"
                    value={formData.user_id}
                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent"
                    placeholder="Enter user UUID"
                    required
                  />
                  <p className="text-xs text-[#64748B] mt-1">
                    This should be the UUID from the auth.users table
                  </p>
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
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent"
                    placeholder="user@example.com"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[#1E293B] mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent"
                      placeholder="First name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1E293B] mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent"
                      placeholder="Last name"
                      required
                    />
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
              {users.find(user => user.id === showInactiveModal)?.is_active ? 'Deactivate' : 'Activate'} User Profile
            </h3>
            <p className="text-[#64748B] mb-6">
              {users.find(user => user.id === showInactiveModal)?.is_active 
                ? 'Are you sure you want to deactivate this user profile? The user will be marked as inactive but can be reactivated later.'
                : 'Are you sure you want to activate this user profile? The user will be marked as active and can access the system.'
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
                  const user = users.find(user => user.id === showInactiveModal);
                  if (user) {
                    handleToggleActive(showInactiveModal, !user.is_active);
                  }
                }}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${
                  users.find(user => user.id === showInactiveModal)?.is_active
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {users.find(user => user.id === showInactiveModal)?.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
