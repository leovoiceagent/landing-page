import { supabase } from './supabase';

/**
 * Dashboard Data Types
 */
export interface Property {
  id: string;
  name: string;
  organization_id: string;
  retell_agent_id: string | null;
  is_active: boolean;
  created_at: string;
  call_count?: number;
  lead_count?: number;
  conversion_count?: number;
}

export interface CallRecord {
  id: string;
  property_id: string;
  organization_id: string;
  call_status: string;
  start_timestamp: string;
  end_timestamp: string | null;
  duration_ms: number | null;
  call_successful: boolean | null;
  customer_first_name: string | null;
  customer_last_name: string | null;
  tour_scheduled_for: string | null;
  created_at: string;
  property_name?: string;
}

export interface ActivityItem {
  id: string;
  type: 'call' | 'lead' | 'property_update' | 'property_added';
  message: string;
  timestamp: string;
  property_name?: string;
}

export interface DashboardStats {
  total_calls: number;
  tour_rate: number;
  avg_call_duration: string;
  active_properties: number;
}

/**
 * Get the current user's organization ID from their user profile
 */
export const getCurrentUserOrganizationId = async (): Promise<string | null> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Error getting current user:', userError);
      return null;
    }

    // Query user_profiles table to get organization_id
    const { data, error } = await supabase
      .from('user_profiles')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user organization:', error);
      return null;
    }

    return data?.organization_id || null;
  } catch (error) {
    console.error('Unexpected error getting organization:', error);
    return null;
  }
};

/**
 * Fetch properties for the current user's organization with call statistics
 */
export const getUserProperties = async (): Promise<Property[]> => {
  try {
    const organizationId = await getCurrentUserOrganizationId();
    
    if (!organizationId) {
      console.error('No organization found for user');
      return [];
    }

    // Fetch properties for the organization
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (propertiesError) {
      console.error('Error fetching properties:', propertiesError);
      return [];
    }

    if (!properties || properties.length === 0) {
      return [];
    }

    // For each property, fetch call statistics
    const propertiesWithStats = await Promise.all(
      properties.map(async (property) => {
        // Get call statistics
        const { data: calls, error: callsError } = await supabase
          .from('call_records')
          .select('call_successful, tour_scheduled_for')
          .eq('property_id', property.id);

        if (callsError) {
          console.error('Error fetching call stats:', callsError);
        }

        const callCount = calls?.length || 0;
        const leadCount = calls?.filter(c => c.tour_scheduled_for).length || 0;
        const conversionCount = calls?.filter(c => c.call_successful === true).length || 0;

        return {
          ...property,
          call_count: callCount,
          lead_count: leadCount,
          conversion_count: conversionCount,
        };
      })
    );

    return propertiesWithStats;
  } catch (error) {
    console.error('Unexpected error fetching properties:', error);
    return [];
  }
};

/**
 * Fetch recent call records for the current user's organization
 */
export const getRecentCallRecords = async (limit: number = 10): Promise<CallRecord[]> => {
  try {
    const organizationId = await getCurrentUserOrganizationId();
    
    if (!organizationId) {
      console.error('No organization found for user');
      return [];
    }

    // Fetch recent call records
    const { data, error } = await supabase
      .from('call_records')
      .select(`
        id,
        property_id,
        organization_id,
        call_status,
        start_timestamp,
        end_timestamp,
        duration_ms,
        call_successful,
        customer_first_name,
        customer_last_name,
        tour_scheduled_for,
        created_at
      `)
      .eq('organization_id', organizationId)
      .order('start_timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching call records:', error);
      return [];
    }

    // Fetch property names for each call record
    if (data && data.length > 0) {
      const propertyIds = [...new Set(data.map(call => call.property_id))];
      
      const { data: properties, error: propError } = await supabase
        .from('properties')
        .select('id, name')
        .in('id', propertyIds);

      if (propError) {
        console.error('Error fetching property names:', propError);
        return data;
      }

      // Map property names to call records
      const propertyMap = new Map(properties?.map(p => [p.id, p.name]) || []);
      
      return data.map(call => ({
        ...call,
        property_name: propertyMap.get(call.property_id) || 'Unknown Property'
      }));
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching call records:', error);
    return [];
  }
};

/**
 * Convert call records to activity items
 */
export const getRecentActivity = async (limit: number = 10): Promise<ActivityItem[]> => {
  try {
    const calls = await getRecentCallRecords(limit);
    
    const activities: ActivityItem[] = calls.map(call => {
      let type: ActivityItem['type'] = 'call';
      let message = '';

      if (call.tour_scheduled_for) {
        type = 'lead';
        message = `Lead generated for ${call.property_name || 'property'}`;
      } else if (call.call_successful) {
        message = `Successful call completed for ${call.property_name || 'property'}`;
      } else {
        message = `Call completed for ${call.property_name || 'property'}`;
      }

      return {
        id: call.id,
        type,
        message,
        timestamp: call.start_timestamp,
        property_name: call.property_name
      };
    });

    return activities;
  } catch (error) {
    console.error('Unexpected error getting activity:', error);
    return [];
  }
};

/**
 * Calculate dashboard statistics
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const organizationId = await getCurrentUserOrganizationId();
    
    if (!organizationId) {
      return {
        total_calls: 0,
        tour_rate: 0,
        avg_call_duration: '0m 0s',
        active_properties: 0
      };
    }

    // Get all calls for the organization
    const { data: calls, error: callsError } = await supabase
      .from('call_records')
      .select('tour_scheduled_for, duration_ms')
      .eq('organization_id', organizationId);

    if (callsError) {
      console.error('Error fetching calls for stats:', callsError);
    }

    const totalCalls = calls?.length || 0;
    const toursScheduled = calls?.filter(c => c.tour_scheduled_for !== null && c.tour_scheduled_for !== '').length || 0;
    const tourRate = totalCalls > 0 ? (toursScheduled / totalCalls) * 100 : 0;

    // Calculate average call duration
    const validDurations = calls?.filter(c => c.duration_ms && c.duration_ms > 0) || [];
    const totalDuration = validDurations.reduce((sum, c) => sum + (c.duration_ms || 0), 0);
    const avgDurationMs = validDurations.length > 0 ? totalDuration / validDurations.length : 0;
    
    // Convert to minutes and seconds
    const avgMinutes = Math.floor(avgDurationMs / 60000);
    const avgSeconds = Math.floor((avgDurationMs % 60000) / 1000);
    const avgCallDuration = `${avgMinutes}m ${avgSeconds}s`;

    // Get active properties count
    const { data: properties, error: propError } = await supabase
      .from('properties')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('is_active', true);

    if (propError) {
      console.error('Error fetching properties count:', propError);
    }

    const activeProperties = properties?.length || 0;

    return {
      total_calls: totalCalls,
      tour_rate: Math.round(tourRate * 10) / 10, // Round to 1 decimal
      avg_call_duration: avgCallDuration,
      active_properties: activeProperties
    };
  } catch (error) {
    console.error('Unexpected error calculating stats:', error);
    return {
      total_calls: 0,
      tour_rate: 0,
      avg_call_duration: '0m 0s',
      active_properties: 0
    };
  }
};

