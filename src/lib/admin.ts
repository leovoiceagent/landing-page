import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

// Types for admin management
export interface AdminPermissions {
  is_admin: boolean;
  admin_level: string;
  can_manage_organizations: boolean;
  can_manage_properties: boolean;
  can_manage_users: boolean;
  can_view_all_data: boolean;
  organization_id: string;
}

export interface Organization {
  id: string;
  name: string;
  created_at: string;
  is_active?: boolean;
  properties_count?: number;
  users_count?: number;
}

export interface Property {
  id: string;
  organization_id: string;
  name: string;
  retell_agent_id?: string;
  created_at: string;
  is_active?: boolean;
  organization_name?: string;
  calls_count?: number;
}

export interface UserProfile {
  id: string;
  user_id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  created_at: string;
  is_active?: boolean;
  email?: string;
  organization_name?: string;
  is_admin?: boolean;
  admin_level?: string;
}

export interface AdminUser {
  id: string;
  user_id: string;
  organization_id: string;
  admin_level: string;
  can_manage_organizations: boolean;
  can_manage_properties: boolean;
  can_manage_users: boolean;
  can_view_all_data: boolean;
  is_active: boolean;
  granted_by?: string;
  granted_at: string;
  created_at: string;
  user_email?: string;
  user_name?: string;
  organization_name?: string;
}

// Check if current user has admin permissions
export const getCurrentUserAdminPermissions = async (): Promise<AdminPermissions | null> => {
  try {
    const { data, error } = await supabase.rpc('get_user_admin_permissions');
    
    if (error) {
      console.error('Error getting admin permissions:', error);
      return null;
    }

    return data?.[0] || null;
  } catch (error) {
    console.error('Unexpected error getting admin permissions:', error);
    return null;
  }
};

// Check if user is admin
export const isUserAdmin = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('is_user_admin');
    
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error('Unexpected error checking admin status:', error);
    return false;
  }
};

// ORGANIZATIONS MANAGEMENT
export const getOrganizations = async (): Promise<Organization[]> => {
  try {
    // First try to get organizations with the is_active column
    let { data, error } = await supabase
      .from('organizations')
      .select(`
        id,
        name,
        created_at,
        is_active,
        properties:properties(count),
        user_profiles:user_profiles(count)
      `)
      .order('created_at', { ascending: false });

    // If that fails (column doesn't exist), try without is_active
    if (error && error.message.includes('is_active')) {
      console.log('is_active column not found, fetching without it...');
      const result = await supabase
        .from('organizations')
        .select(`
          id,
          name,
          created_at,
          properties:properties(count),
          user_profiles:user_profiles(count)
        `)
        .order('created_at', { ascending: false });
      
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Error fetching organizations:', error);
      return [];
    }

    return data?.map(org => ({
      ...org,
      is_active: org.is_active ?? true, // Default to true if not set
      properties_count: org.properties?.[0]?.count || 0,
      users_count: org.user_profiles?.[0]?.count || 0,
    })) || [];
  } catch (error) {
    console.error('Unexpected error fetching organizations:', error);
    return [];
  }
};

export const createOrganization = async (name: string): Promise<{ success: boolean; error?: string; data?: Organization }> => {
  try {
    // Try to create with is_active column first
    let { data, error } = await supabase
      .from('organizations')
      .insert({ name, is_active: true })
      .select()
      .single();

    // If that fails (column doesn't exist), try without is_active
    if (error && error.message.includes('is_active')) {
      console.log('is_active column not found, creating without it...');
      const result = await supabase
        .from('organizations')
        .insert({ name })
        .select()
        .single();
      
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Error creating organization:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: { ...data, is_active: true } };
  } catch (error) {
    console.error('Unexpected error creating organization:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

export const updateOrganization = async (id: string, name: string, isActive?: boolean): Promise<{ success: boolean; error?: string }> => {
  try {
    const updateData: any = { name };
    if (isActive !== undefined) {
      updateData.is_active = isActive;
    }

    let { error } = await supabase
      .from('organizations')
      .update(updateData)
      .eq('id', id);

    // If that fails (is_active column doesn't exist), try without it
    if (error && error.message.includes('is_active') && isActive !== undefined) {
      console.log('is_active column not found, updating without it...');
      const result = await supabase
        .from('organizations')
        .update({ name })
        .eq('id', id);
      
      error = result.error;
    }

    if (error) {
      console.error('Error updating organization:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error updating organization:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

export const deleteOrganization = async (id: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('organizations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting organization:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error deleting organization:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

// PROPERTIES MANAGEMENT
export const getProperties = async (organizationId?: string): Promise<Property[]> => {
  try {
    // First try to get properties with the is_active column
    let query = supabase
      .from('properties')
      .select(`
        id,
        organization_id,
        name,
        retell_agent_id,
        created_at,
        is_active,
        organizations!inner(name),
        call_records(count)
      `)
      .order('created_at', { ascending: false });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    let { data, error } = await query;

    // If that fails (is_active column doesn't exist), try without it
    if (error && error.message.includes('is_active')) {
      console.log('is_active column not found in properties, fetching without it...');
      query = supabase
        .from('properties')
        .select(`
          id,
          organization_id,
          name,
          retell_agent_id,
          created_at,
          organizations!inner(name),
          call_records(count)
        `)
        .order('created_at', { ascending: false });

      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const result = await query;
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Error fetching properties:', error);
      return [];
    }

    return data?.map(property => ({
      ...property,
      is_active: property.is_active ?? true, // Default to true if not set
      organization_name: property.organizations?.name,
      calls_count: property.call_records?.[0]?.count || 0,
    })) || [];
  } catch (error) {
    console.error('Unexpected error fetching properties:', error);
    return [];
  }
};

export const createProperty = async (organizationId: string, name: string, retellAgentId?: string): Promise<{ success: boolean; error?: string; data?: Property }> => {
  try {
    // Try to create with is_active column first
    let { data, error } = await supabase
      .from('properties')
      .insert({ 
        organization_id: organizationId, 
        name,
        retell_agent_id: retellAgentId,
        is_active: true
      })
      .select(`
        id,
        organization_id,
        name,
        retell_agent_id,
        created_at,
        is_active,
        organizations!inner(name)
      `)
      .single();

    // If that fails (is_active column doesn't exist), try without it
    if (error && error.message.includes('is_active')) {
      console.log('is_active column not found in properties, creating without it...');
      const result = await supabase
        .from('properties')
        .insert({ 
          organization_id: organizationId, 
          name,
          retell_agent_id: retellAgentId
        })
        .select(`
          id,
          organization_id,
          name,
          retell_agent_id,
          created_at,
          organizations!inner(name)
        `)
        .single();
      
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Error creating property:', error);
      return { success: false, error: error.message };
    }

    return { 
      success: true, 
      data: {
        ...data,
        is_active: data.is_active ?? true,
        organization_name: data.organizations?.name,
      }
    };
  } catch (error) {
    console.error('Unexpected error creating property:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

export const updateProperty = async (id: string, name: string, retellAgentId?: string, isActive?: boolean): Promise<{ success: boolean; error?: string }> => {
  try {
    const updateData: any = { 
      name,
      retell_agent_id: retellAgentId 
    };
    if (isActive !== undefined) {
      updateData.is_active = isActive;
    }

    let { error } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', id);

    // If that fails (is_active column doesn't exist), try without it
    if (error && error.message.includes('is_active') && isActive !== undefined) {
      console.log('is_active column not found in properties, updating without it...');
      const result = await supabase
        .from('properties')
        .update({ 
          name,
          retell_agent_id: retellAgentId 
        })
        .eq('id', id);
      
      error = result.error;
    }

    if (error) {
      console.error('Error updating property:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error updating property:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

export const deleteProperty = async (id: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting property:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error deleting property:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

// USERS MANAGEMENT
export const getUserProfiles = async (organizationId?: string): Promise<UserProfile[]> => {
  try {
    // Try to use the view first (if it exists)
    let query = supabase
      .from('user_profiles_with_email')
      .select(`
        id,
        user_id,
        organization_id,
        first_name,
        last_name,
        created_at,
        is_active,
        email,
        organizations!inner(name)
      `)
      .order('created_at', { ascending: false });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    let { data, error } = await query;

    // If the view doesn't exist or is_active column doesn't exist, fallback to user_profiles table
    if (error) {
      console.log('Falling back to user_profiles table...', error.message);
      query = supabase
        .from('user_profiles')
        .select(`
          id,
          user_id,
          organization_id,
          first_name,
          last_name,
          created_at,
          is_active,
          organizations!inner(name)
        `)
        .order('created_at', { ascending: false });

      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const result = await query;
      data = result.data;
      error = result.error;

      // If still failing with is_active, try without it
      if (error && error.message.includes('is_active')) {
        console.log('is_active column not found, fetching without it...');
        query = supabase
          .from('user_profiles')
          .select(`
            id,
            user_id,
            organization_id,
            first_name,
            last_name,
            created_at,
            organizations!inner(name)
          `)
          .order('created_at', { ascending: false });

        if (organizationId) {
          query = query.eq('organization_id', organizationId);
        }

        const result2 = await query;
        data = result2.data;
        error = result2.error;
      }
    }

    if (error) {
      console.error('Error fetching user profiles:', error);
      return [];
    }

    // Fetch admin status separately for each user
    const profiles = data || [];
    const adminMap: Record<string, { is_active: boolean; admin_level: string }> = {};
    
    try {
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('user_id, is_active, admin_level')
        .in('user_id', profiles.map(p => p.user_id));
      
      if (adminData) {
        adminData.forEach(admin => {
          adminMap[admin.user_id] = {
            is_active: admin.is_active,
            admin_level: admin.admin_level
          };
        });
      }
    } catch (adminError) {
      console.log('Could not fetch admin data:', adminError);
    }

    // Map the profiles
    return profiles.map(profile => ({
      ...profile,
      is_active: profile.is_active ?? true, // Default to true if not set
      email: profile.email || `user-${profile.user_id.substring(0, 8)}`, // Use email from view or placeholder
      organization_name: profile.organizations?.name,
      is_admin: adminMap[profile.user_id]?.is_active || false,
      admin_level: adminMap[profile.user_id]?.admin_level || 'user',
    }));
  } catch (error) {
    console.error('Unexpected error fetching user profiles:', error);
    return [];
  }
};

export const createUserProfile = async (
  userId: string, 
  organizationId: string, 
  firstName: string, 
  lastName: string,
  email?: string
): Promise<{ success: boolean; error?: string; data?: UserProfile }> => {
  try {
    // Try to create with is_active column first
    let { data, error } = await supabase
      .from('user_profiles')
      .insert({ 
        user_id: userId,
        organization_id: organizationId,
        first_name: firstName,
        last_name: lastName,
        is_active: true
      })
      .select(`
        id,
        user_id,
        organization_id,
        first_name,
        last_name,
        created_at,
        is_active,
        organizations!inner(name)
      `)
      .single();

    // If that fails (is_active column doesn't exist), try without it
    if (error && error.message.includes('is_active')) {
      console.log('is_active column not found in user_profiles, creating without it...');
      const result = await supabase
        .from('user_profiles')
        .insert({ 
          user_id: userId,
          organization_id: organizationId,
          first_name: firstName,
          last_name: lastName
        })
        .select(`
          id,
          user_id,
          organization_id,
          first_name,
          last_name,
          created_at,
          organizations!inner(name)
        `)
        .single();
      
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Error creating user profile:', error);
      return { success: false, error: error.message };
    }

    return { 
      success: true, 
      data: {
        ...data,
        is_active: data.is_active ?? true,
        email: email || data.auth?.users?.email || `user-${data.user_id.substring(0, 8)}`,
        organization_name: data.organizations?.name,
      }
    };
  } catch (error) {
    console.error('Unexpected error creating user profile:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

export const updateUserProfile = async (
  id: string, 
  firstName: string, 
  lastName: string,
  isActive?: boolean
): Promise<{ success: boolean; error?: string }> => {
  try {
    const updateData: any = { 
      first_name: firstName,
      last_name: lastName
    };
    if (isActive !== undefined) {
      updateData.is_active = isActive;
    }

    let { error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', id);

    // If that fails (is_active column doesn't exist), try without it
    if (error && error.message.includes('is_active') && isActive !== undefined) {
      console.log('is_active column not found in user_profiles, updating without it...');
      const result = await supabase
        .from('user_profiles')
        .update({ 
          first_name: firstName,
          last_name: lastName
        })
        .eq('id', id);
      
      error = result.error;
    }

    if (error) {
      console.error('Error updating user profile:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error updating user profile:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

export const deleteUserProfile = async (id: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting user profile:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error deleting user profile:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

// ADMIN USERS MANAGEMENT
export const getAdminUsers = async (): Promise<AdminUser[]> => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select(`
        *,
        organizations!inner(name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin users:', error);
      return [];
    }

    // Get user profiles separately to avoid auth.users join issues
    const adminUsers = data || [];
    const userIds = adminUsers.map(admin => admin.user_id);
    
    // Fetch user profiles for these admin users
    const { data: userProfiles } = await supabase
      .from('user_profiles')
      .select('user_id, first_name, last_name')
      .in('user_id', userIds);

    // Create a map for quick lookup
    const userMap: Record<string, { first_name: string; last_name: string }> = {};
    if (userProfiles) {
      userProfiles.forEach(user => {
        userMap[user.user_id] = {
          first_name: user.first_name,
          last_name: user.last_name
        };
      });
    }

    return adminUsers.map(admin => ({
      ...admin,
      user_email: `user-${admin.user_id.substring(0, 8)}`, // Placeholder email
      user_name: userMap[admin.user_id] 
        ? `${userMap[admin.user_id].first_name} ${userMap[admin.user_id].last_name}`
        : 'Unknown User',
      organization_name: admin.organizations?.name,
    }));
  } catch (error) {
    console.error('Unexpected error fetching admin users:', error);
    return [];
  }
};

export const createAdminUser = async (
  userId: string,
  organizationId: string,
  adminLevel: string = 'admin',
  permissions: {
    can_manage_organizations?: boolean;
    can_manage_properties?: boolean;
    can_manage_users?: boolean;
    can_view_all_data?: boolean;
  } = {}
): Promise<{ success: boolean; error?: string; data?: AdminUser }> => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        user_id: userId,
        organization_id: organizationId,
        admin_level: adminLevel,
        can_manage_organizations: permissions.can_manage_organizations ?? true,
        can_manage_properties: permissions.can_manage_properties ?? true,
        can_manage_users: permissions.can_manage_users ?? true,
        can_view_all_data: permissions.can_view_all_data ?? true,
      })
      .select(`
        *,
        organizations!inner(name)
      `)
      .single();

    if (error) {
      console.error('Error creating admin user:', error);
      return { success: false, error: error.message };
    }

    // Get user profile separately
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('first_name, last_name')
      .eq('user_id', userId)
      .single();

    return { 
      success: true, 
      data: {
        ...data,
        user_email: `user-${data.user_id.substring(0, 8)}`, // Placeholder email
        user_name: userProfile 
          ? `${userProfile.first_name} ${userProfile.last_name}`
          : 'Unknown User',
        organization_name: data.organizations?.name,
      }
    };
  } catch (error) {
    console.error('Unexpected error creating admin user:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

export const updateAdminUser = async (
  id: string,
  adminLevel?: string,
  permissions?: {
    can_manage_organizations?: boolean;
    can_manage_properties?: boolean;
    can_manage_users?: boolean;
    can_view_all_data?: boolean;
    is_active?: boolean;
  }
): Promise<{ success: boolean; error?: string }> => {
  try {
    const updateData: any = {};
    
    if (adminLevel) updateData.admin_level = adminLevel;
    if (permissions) {
      Object.keys(permissions).forEach(key => {
        updateData[key] = permissions[key as keyof typeof permissions];
      });
    }

    const { error } = await supabase
      .from('admin_users')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating admin user:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error updating admin user:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

export const deleteAdminUser = async (id: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting admin user:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error deleting admin user:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};
