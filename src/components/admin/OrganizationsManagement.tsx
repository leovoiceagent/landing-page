import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Pause, Play, Building2, Users, Home } from 'lucide-react';
import { 
  getOrganizations, 
  createOrganization, 
  updateOrganization,
  type Organization 
} from '../../lib/admin';

const OrganizationsManagement: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInactiveModal, setShowInactiveModal] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '' });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      setIsLoading(true);
      const data = await getOrganizations();
      setOrganizations(data);
    } catch (error) {
      console.error('Error loading organizations:', error);
      setError('Failed to load organizations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setIsCreating(true);
      setError(null);
      const result = await createOrganization(formData.name.trim());
      
      if (result.success) {
        setShowCreateModal(false);
        setFormData({ name: '' });
        await loadOrganizations();
      } else {
        setError(result.error || 'Failed to create organization');
      }
    } catch (error) {
      console.error('Error creating organization:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (id: string, name: string) => {
    try {
      setError(null);
      const result = await updateOrganization(id, name);
      
      if (result.success) {
        setIsEditing(null);
        await loadOrganizations();
      } else {
        setError(result.error || 'Failed to update organization');
      }
    } catch (error) {
      console.error('Error updating organization:', error);
      setError('An unexpected error occurred');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      setError(null);
      const result = await updateOrganization(id, '', isActive);
      
      if (result.success) {
        setShowInactiveModal(null);
        await loadOrganizations();
      } else {
        setError(result.error || `Failed to ${isActive ? 'activate' : 'deactivate'} organization`);
      }
    } catch (error) {
      console.error('Error toggling organization status:', error);
      setError('An unexpected error occurred');
    }
  };

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h2 className="text-2xl font-bold text-[#1E293B]">Organizations</h2>
            <p className="text-[#64748B]">Manage organizations and their settings</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-[#38BDF8] text-white px-4 py-2 rounded-lg hover:bg-[#0EA5E9] transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Organization</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Organizations List */}
      <div className="bg-white rounded-xl overflow-hidden">
        {filteredOrganizations.length === 0 ? (
          <div className="p-8 text-center">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#1E293B] mb-2">No organizations found</h3>
            <p className="text-[#64748B] mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first organization'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-[#38BDF8] text-white px-4 py-2 rounded-lg hover:bg-[#0EA5E9] transition-colors"
              >
                Create Organization
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredOrganizations.map((org) => (
              <div key={org.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {isEditing === org.id ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          const name = formData.get('name') as string;
                          if (name.trim()) {
                            handleUpdate(org.id, name.trim());
                          }
                        }}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="text"
                          name="name"
                          defaultValue={org.name}
                          className="flex-1 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent"
                          autoFocus
                        />
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
                      </form>
                    ) : (
                      <div>
                        <h3 className="text-lg font-semibold text-[#1E293B]">{org.name}</h3>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-[#64748B]">
                          <div className="flex items-center space-x-1">
                            <Home className="w-4 h-4" />
                            <span>{org.properties_count || 0} properties</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{org.users_count || 0} users</span>
                          </div>
                          <span>Created {new Date(org.created_at).toLocaleDateString()}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            org.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {org.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {isEditing !== org.id && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsEditing(org.id)}
                        className="p-2 text-[#64748B] hover:text-[#38BDF8] hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit organization"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowInactiveModal(org.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          org.is_active
                            ? 'text-[#64748B] hover:text-orange-600 hover:bg-orange-50'
                            : 'text-[#64748B] hover:text-green-600 hover:bg-green-50'
                        }`}
                        title={org.is_active ? 'Deactivate organization' : 'Activate organization'}
                      >
                        {org.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
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
            <h3 className="text-lg font-semibold text-[#1E293B] mb-4">Create Organization</h3>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#1E293B] mb-2">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent"
                  placeholder="Enter organization name"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
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
              {organizations.find(org => org.id === showInactiveModal)?.is_active ? 'Deactivate' : 'Activate'} Organization
            </h3>
            <p className="text-[#64748B] mb-6">
              {organizations.find(org => org.id === showInactiveModal)?.is_active 
                ? 'Are you sure you want to deactivate this organization? It will be marked as inactive but can be reactivated later.'
                : 'Are you sure you want to activate this organization? It will be marked as active and available for use.'
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
                  const org = organizations.find(org => org.id === showInactiveModal);
                  if (org) {
                    handleToggleActive(showInactiveModal, !org.is_active);
                  }
                }}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${
                  organizations.find(org => org.id === showInactiveModal)?.is_active
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {organizations.find(org => org.id === showInactiveModal)?.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationsManagement;
