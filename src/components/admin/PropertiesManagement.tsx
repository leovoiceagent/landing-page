import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Pause, Play, Home, Building2, Phone } from 'lucide-react';
import { 
  getProperties, 
  createProperty, 
  updateProperty,
  getOrganizations,
  type Property,
  type Organization 
} from '../../lib/admin';

const PropertiesManagement: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInactiveModal, setShowInactiveModal] = useState<string | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    organization_id: '', 
    retell_agent_id: '' 
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [propertiesData, organizationsData] = await Promise.all([
        getProperties(),
        getOrganizations()
      ]);
      setProperties(propertiesData);
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
    if (!formData.name.trim() || !formData.organization_id) return;

    try {
      setIsCreating(true);
      setError(null);
      const result = await createProperty(
        formData.organization_id,
        formData.name.trim(),
        formData.retell_agent_id.trim() || undefined
      );
      
      if (result.success) {
        setShowCreateModal(false);
        setFormData({ name: '', organization_id: '', retell_agent_id: '' });
        await loadData();
      } else {
        setError(result.error || 'Failed to create property');
      }
    } catch (error) {
      console.error('Error creating property:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (id: string, name: string, retellAgentId: string) => {
    try {
      setError(null);
      const result = await updateProperty(id, name, retellAgentId || undefined);
      
      if (result.success) {
        setIsEditing(null);
        await loadData();
      } else {
        setError(result.error || 'Failed to update property');
      }
    } catch (error) {
      console.error('Error updating property:', error);
      setError('An unexpected error occurred');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      setError(null);
      const result = await updateProperty(id, '', '', isActive);
      
      if (result.success) {
        setShowInactiveModal(null);
        await loadData();
      } else {
        setError(result.error || `Failed to ${isActive ? 'activate' : 'deactivate'} property`);
      }
    } catch (error) {
      console.error('Error toggling property status:', error);
      setError('An unexpected error occurred');
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.organization_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOrg = selectedOrg === 'all' || property.organization_id === selectedOrg;
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
            <h2 className="text-2xl font-bold text-[#1E293B]">Properties</h2>
            <p className="text-[#64748B]">Manage properties and their Retell agent configurations</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-[#38BDF8] text-white px-4 py-2 rounded-lg hover:bg-[#0EA5E9] transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Property</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search properties..."
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

      {/* Properties List */}
      <div className="bg-white rounded-xl overflow-hidden">
        {filteredProperties.length === 0 ? (
          <div className="p-8 text-center">
            <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#1E293B] mb-2">No properties found</h3>
            <p className="text-[#64748B] mb-4">
              {searchTerm || selectedOrg !== 'all' 
                ? 'Try adjusting your search or filter terms' 
                : 'Get started by creating your first property'
              }
            </p>
            {!searchTerm && selectedOrg === 'all' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-[#38BDF8] text-white px-4 py-2 rounded-lg hover:bg-[#0EA5E9] transition-colors"
              >
                Create Property
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredProperties.map((property) => (
              <div key={property.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {isEditing === property.id ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          const name = formData.get('name') as string;
                          const retellAgentId = formData.get('retell_agent_id') as string;
                          if (name.trim()) {
                            handleUpdate(property.id, name.trim(), retellAgentId);
                          }
                        }}
                        className="space-y-3"
                      >
                        <input
                          type="text"
                          name="name"
                          defaultValue={property.name}
                          className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent"
                          placeholder="Property name"
                          autoFocus
                        />
                        <input
                          type="text"
                          name="retell_agent_id"
                          defaultValue={property.retell_agent_id || ''}
                          className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent"
                          placeholder="Retell Agent ID (optional)"
                        />
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
                        <h3 className="text-lg font-semibold text-[#1E293B]">{property.name}</h3>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-[#64748B]">
                          <div className="flex items-center space-x-1">
                            <Building2 className="w-4 h-4" />
                            <span>{property.organization_name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Phone className="w-4 h-4" />
                            <span>{property.calls_count || 0} calls</span>
                          </div>
                          {property.retell_agent_id && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Agent: {property.retell_agent_id}
                            </span>
                          )}
                          <span>Created {new Date(property.created_at).toLocaleDateString()}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            property.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {property.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {isEditing !== property.id && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsEditing(property.id)}
                        className="p-2 text-[#64748B] hover:text-[#38BDF8] hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit property"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowInactiveModal(property.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          property.is_active
                            ? 'text-[#64748B] hover:text-orange-600 hover:bg-orange-50'
                            : 'text-[#64748B] hover:text-green-600 hover:bg-green-50'
                        }`}
                        title={property.is_active ? 'Deactivate property' : 'Activate property'}
                      >
                        {property.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
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
            <h3 className="text-lg font-semibold text-[#1E293B] mb-4">Create Property</h3>
            <form onSubmit={handleCreate}>
              <div className="space-y-4">
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
                    Property Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent"
                    placeholder="Enter property name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-2">
                    Retell Agent ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.retell_agent_id}
                    onChange={(e) => setFormData({ ...formData, retell_agent_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent"
                    placeholder="Enter Retell agent ID"
                  />
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
              {properties.find(prop => prop.id === showInactiveModal)?.is_active ? 'Deactivate' : 'Activate'} Property
            </h3>
            <p className="text-[#64748B] mb-6">
              {properties.find(prop => prop.id === showInactiveModal)?.is_active 
                ? 'Are you sure you want to deactivate this property? It will be marked as inactive but can be reactivated later.'
                : 'Are you sure you want to activate this property? It will be marked as active and available for use.'
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
                  const property = properties.find(prop => prop.id === showInactiveModal);
                  if (property) {
                    handleToggleActive(showInactiveModal, !property.is_active);
                  }
                }}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${
                  properties.find(prop => prop.id === showInactiveModal)?.is_active
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {properties.find(prop => prop.id === showInactiveModal)?.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertiesManagement;
