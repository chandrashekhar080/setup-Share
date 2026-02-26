import { useState, useEffect } from 'react';

// Create a singleton instance of the API service
const createApiService = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

  const handleResponse = async <T>(response: Response): Promise<T> => {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  };

  return {
    async getDashboardStats() {
      const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      const result = await handleResponse<any>(response);
      return result.data;
    },

    async getRecentActivity() {
      const response = await fetch(`${API_BASE_URL}/dashboard/activity`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      const result = await handleResponse<any>(response);
      return result.data;
    },

    async getTodaySchedule() {
      const response = await fetch(`${API_BASE_URL}/dashboard/schedule`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      const result = await handleResponse<any>(response);
      return result.data;
    },

    async getCareCircle() {
      const response = await fetch(`${API_BASE_URL}/dashboard/care-circle`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      const result = await handleResponse<any>(response);
      return result.data;
    },

    async createVisit(visitData: {
      title: string;
      date: string;
      time: string;
      assignee_id: number;
      type: 'visit' | 'appointment' | 'reminder';
      duration?: number;
      notes?: string;
    }) {
      const response = await fetch(`${API_BASE_URL}/dashboard/create-visit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(visitData),
      });
      return handleResponse<any>(response);
    },

    async addCareNote(noteData: {
      title: string;
      content: string;
      category: 'medical' | 'personal' | 'general' | 'emergency';
      priority: 'low' | 'medium' | 'high' | 'urgent';
    }) {
      const response = await fetch(`${API_BASE_URL}/dashboard/add-note`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(noteData),
      });
      return handleResponse<any>(response);
    },

    async sendUpdate(updateData: {
      message: string;
      recipients?: number[];
      priority: 'low' | 'medium' | 'high' | 'urgent';
    }) {
      const response = await fetch(`${API_BASE_URL}/dashboard/send-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      return handleResponse<any>(response);
    }
  };
};

const apiService = createApiService();

// Types
interface DashboardStats {
  active_care_members: number;
  upcoming_visits: number;
  care_hours_this_month: number;
  emergency_contacts: number;
  care_hours_growth: number;
  new_members_this_week: number;
}

interface Activity {
  id: number;
  user: string;
  action: string;
  time: string;
  status: string;
  timestamp: string;
}

interface ScheduleItem {
  id: number;
  time: string;
  title: string;
  assignee: string;
  type: string;
  status: string;
  duration: number;
}

interface CareCircleMember {
  id: number;
  name: string;
  role: string;
  status: string;
  avatar?: string;
  phone: string;
  email: string;
  specialization: string;
}

// Custom hooks
export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, refetch: fetchStats };
};

export const useRecentActivity = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getRecentActivity();
      setActivities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recent activity');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return { activities, loading, error, refetch: fetchActivities };
};

export const useTodaySchedule = () => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getTodaySchedule();
      setSchedule(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch today\'s schedule');
    } finally {
      setLoading(false);
    }
  };

  const addVisit = async (visitData: {
    title: string;
    date: string;
    time: string;
    assignee_id: number;
    type: 'visit' | 'appointment' | 'reminder';
    duration?: number;
    notes?: string;
  }) => {
    try {
      await apiService.createVisit(visitData);
      await fetchSchedule(); // Refresh the schedule
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to create visit' 
      };
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  return { schedule, loading, error, refetch: fetchSchedule, addVisit };
};

export const useCareCircle = () => {
  const [members, setMembers] = useState<CareCircleMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getCareCircle();
      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch care circle');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  return { members, loading, error, refetch: fetchMembers };
};

export const useQuickActions = () => {
  const [loading, setLoading] = useState(false);

  const addCareNote = async (noteData: {
    title: string;
    content: string;
    category: 'medical' | 'personal' | 'general' | 'emergency';
    priority: 'low' | 'medium' | 'high' | 'urgent';
  }) => {
    try {
      setLoading(true);
      await apiService.addCareNote(noteData);
      return { success: true, message: 'Care note added successfully' };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to add care note' 
      };
    } finally {
      setLoading(false);
    }
  };

  const sendUpdate = async (updateData: {
    message: string;
    recipients?: number[];
    priority: 'low' | 'medium' | 'high' | 'urgent';
  }) => {
    try {
      setLoading(true);
      await apiService.sendUpdate(updateData);
      return { success: true, message: 'Update sent successfully' };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to send update' 
      };
    } finally {
      setLoading(false);
    }
  };

  return { addCareNote, sendUpdate, loading };
};