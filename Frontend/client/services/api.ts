/**
 * API Service for Share2care Admin Panel
 * Handles all API calls to the Laravel backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
console.log('🔧 API_BASE_URL:', API_BASE_URL);

interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  status?: string;
  success?: boolean;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  name?: string; // For backward compatibility
  email: string;
  mobile: string;
  country_code: string;
  gender: number;
  type: string;
  status: number;
  lat: string;
  lng: string;
  age?: number;
  location?: string;
  created_at: string;
  updated_at: string;
  documents?: Array<{
    type: string;
    number: string;
    file: string;
  }>;
  others?: any;
  approval_status?: string; // Added for user approval functionality
  admin_comments?: string;
  approval_date?: string;
}

interface Category {
  id: number;
  name: string;
  status: string;
  max_guests?: number;
  created_at: string;
  updated_at: string;
}

interface Setting {
  id: number;
  key: string;
  value: string;
  type: string;
  created_at: string;
  updated_at: string;
}

interface Contact {
  id: number;
  name: string;
  email: string;
  phone?: string;
  mobile?: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

interface Page {
  id: number;
  name?: string;
  title?: string;
  content: string;
  slug?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Event {
  id: number;
  title: string;
  description: string;
  category: string;
  category_id: number;
  location: string;
  event_date: string;
  start_time: string;
  end_time: string;
  max_participants: number;
  current_participants: number;
  available_spots: number;
  organizer: string;
  organizer_id: number;
  status: string;
  image_url?: string;
  requirements?: string[];
  contact_info?: string;
  is_featured: boolean;
  registration_deadline?: string;
  event_type: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  is_full: boolean;
  status_badge: string;
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('admin_token');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  private getUserAuthHeaders(): HeadersInit {
    // Import token manager dynamically to avoid circular dependencies
    let token: string | null = null;
    
    try {
      // Try to get token from token manager first
      const tokenManager = require('../utils/tokenManager').default;
      token = tokenManager.getToken();
    } catch (error) {
      // Fallback to localStorage if token manager is not available
      token = localStorage.getItem('userToken');
    }
    
    console.log('User token for API call:', token ? `Token exists (length: ${token.length})` : 'No token found');
    if (token) {
      console.log('Token preview:', token.substring(0, 20) + '...');
    }
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response, isAdminCall: boolean = false): Promise<T> {
    const data = await response.json();

    if (!response.ok) {
      // Handle authentication errors for admin API calls without forcing a global redirect
      if (response.status === 401 && isAdminCall) {
        // Clear admin auth and let the caller or route guards handle navigation
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        console.warn('Admin API returned 401. Cleared admin auth; route guards should handle redirect.');
      }
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  }

  // Separate handler for user API calls
  private async handleUserResponse<T>(response: Response): Promise<T> {
    const data = await response.json();
    
    if (!response.ok) {
      // For user API calls, don't redirect to admin login on 401
      // Just throw the error and let the calling component handle it
      console.error('User API Error:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        data: data
      });
      
      if (response.status === 401) {
        console.error('Authentication failed - token may be expired or invalid');
      }
      
      throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  }

  // Helper method for admin API calls
  private async handleAdminResponse<T>(response: Response): Promise<T> {
    return this.handleResponse<T>(response, true);
  }

  // Authentication APIs
  async adminLogin(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/admin-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await this.handleResponse<LoginResponse>(response, true);
    
    // Store token and user info (handle both response formats)
    const token = data.access_token || data.token;
    if (token) {
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_user', JSON.stringify(data.user));
    }
    
    return data;
  }

  // Email OTP Authentication APIs
  async sendEmailOtp(email: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/auth/sendEmailOtp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    return this.handleUserResponse<any>(response);
  }

  async verifyEmailOtp(data: {
    email: string;
    otp: string;
    otp_id: number;
    first_name?: string;
    last_name?: string;
  }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/auth/verifyEmailOtp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await this.handleUserResponse<any>(response);
    
    // Store user token and info if login successful
    if (result.success && result.access_token) {
      try {
        // Use token manager to store token with expiration tracking
        const tokenManager = require('../utils/tokenManager').default;
        tokenManager.storeToken(result.access_token, result.expires_in || 21600);
      } catch (error) {
        // Fallback to localStorage
        localStorage.setItem('userToken', result.access_token);
      }
      localStorage.setItem('user', JSON.stringify(result.user));
    }
    
    return result;
  }

  async resendEmailOtp(email: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/auth/resendEmailOtp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    return this.handleUserResponse<any>(response);
  }

  // Mobile OTP Authentication APIs
  async sendMobileOtp(mobile: string, country_code: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/auth/sendMobileOtp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ mobile, country_code }),
    });

    return this.handleUserResponse<any>(response);
  }

  async verifyMobileOtp(data: {
    mobile: string;
    otp: string;
    otp_id: number;
    first_name?: string;
    last_name?: string;
  }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/auth/verifyMobileOtp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await this.handleUserResponse<any>(response);
    
    // Store user token and info if login successful
    if (result.success && result.access_token) {
      try {
        // Use token manager to store token with expiration tracking
        const tokenManager = require('../utils/tokenManager').default;
        tokenManager.storeToken(result.access_token, result.expires_in || 21600);
      } catch (error) {
        // Fallback to localStorage
        localStorage.setItem('userToken', result.access_token);
      }
      localStorage.setItem('user', JSON.stringify(result.user));
    }
    
    return result;
  }

  async resendMobileOtp(mobile: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/auth/resendMobileOtp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ mobile }),
    });

    return this.handleUserResponse<any>(response);
  }

  async adminLogout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/admin_logout`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    }
  }

  // Token refresh method for user tokens
  async refreshUserToken(): Promise<string | null> {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const newToken = data.access_token || data.token;
        if (newToken) {
          localStorage.setItem('userToken', newToken);
          console.log('Token refreshed successfully');
          return newToken;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }

  // Enhanced user response handler with automatic token refresh
  private async handleUserResponseWithRefresh<T>(response: Response, retryCount: number = 0): Promise<T> {
    const data = await response.json();
    
    if (!response.ok) {
      // If token expired and we haven't retried yet, try to refresh
      if (response.status === 401 && retryCount === 0) {
        console.log('Token expired, attempting to refresh...');
        const newToken = await this.refreshUserToken();
        
        if (newToken) {
          // Retry the original request with new token
          const originalUrl = response.url;
          const originalMethod = 'POST'; // Most of our API calls are POST
          
          try {
            const retryResponse = await fetch(originalUrl, {
              method: originalMethod,
              headers: this.getUserAuthHeaders(),
              body: JSON.stringify({}), // This would need to be the original body
            });
            
            if (retryResponse.ok) {
              return this.handleUserResponseWithRefresh<T>(retryResponse, retryCount + 1);
            }
          } catch (retryError) {
            console.error('Retry after token refresh failed:', retryError);
          }
        }
        
        // If refresh failed, clear tokens and let user re-authenticate
        localStorage.removeItem('userToken');
        localStorage.removeItem('user');
      }
      
      console.error('User API Error:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        data: data
      });
      
      if (response.status === 401) {
        console.error('Authentication failed - token may be expired or invalid');
      }
      
      throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  }

  // Token check method (for debugging)
  async checkTokenStatus(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/check-token`, {
        method: 'POST',
        headers: this.getUserAuthHeaders(),
      });

      return this.handleUserResponse<any>(response);
    } catch (error) {
      console.error('Token check failed:', error);
      throw error;
    }
  }

  // User Management APIs
  async getAllUsers(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/users/getAll`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    const result = await this.handleResponse<ApiResponse<any>>(response, true);
    return result.data || [];
  }

  async getUserInfo(userId: number): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/userInfoAdmin`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ user_id: userId }),
    });
    return this.handleAdminResponse<User>(response);
  }

  async getUserProfileDetails(userId: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/users/getUserProfileDetails`, {
      method: 'POST',
      headers: this.getUserAuthHeaders(),
      body: JSON.stringify({ user_id: userId }),
    });
    const result = await this.handleUserResponse<any>(response);
    return result.data;
  }

  async getUserActivity(userId: number): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/users/getUserActivity`, {
      method: 'POST',
      headers: this.getUserAuthHeaders(),
      body: JSON.stringify({ user_id: userId }),
    });
    const result = await this.handleUserResponse<any>(response);
    return result.data;
  }

  async getProfile(data: { id: number }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/profile/getProfile`, {
      method: 'POST',
      headers: this.getUserAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleUserResponse<any>(response);
  }

  async updateUserProfile(userId: number, profileData: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/profile/update`, {
      method: 'POST',
      headers: this.getUserAuthHeaders(),
      body: JSON.stringify({ id: userId, ...profileData }),
    });
    return this.handleUserResponse<any>(response);
  }

  async getUserJoinedEvents(userId: number): Promise<Array<{
    id: number;
    title: string;
    description: string;
    event_date: string;
    start_time: string;
    end_time: string;
    location: string;
    organizer_name: string;
    current_participants: number;
    max_participants: number;
    status: string;
    created_at: string;
  }>> {
    const response = await fetch(`${API_BASE_URL}/events/getUserJoinedEvents`, {
      method: 'POST',
      headers: this.getUserAuthHeaders(),
      body: JSON.stringify({ user_id: userId }),
    });
    const result = await this.handleUserResponse<any>(response);
    return result.data || [];
  }

  async getUserPastEvents(userId: number): Promise<Array<{
    id: number;
    title: string;
    description: string;
    event_date: string;
    start_time: string;
    end_time: string;
    location: string;
    organizer_name: string;
    rating: number;
    review: string;
    status: string;
    created_at: string;
  }>> {
    const response = await fetch(`${API_BASE_URL}/events/getUserPastEvents`, {
      method: 'POST',
      headers: this.getUserAuthHeaders(),
      body: JSON.stringify({ user_id: userId }),
    });
    const result = await this.handleUserResponse<any>(response);
    return result.data || [];
  }

  async getUserNotifications(userId: number, options?: {
    limit?: number;
    offset?: number;
    unread_only?: boolean;
  }): Promise<{
    data: Array<{
      id: number;
      type: string;
      title: string;
      message: string;
      timestamp: string;
      read: boolean;
      from: string;
      event_title?: string;
      read_at?: string;
      data?: any;
    }>;
    unread_count: number;
    total: number;
  }> {
    const response = await fetch(`${API_BASE_URL}/notifications/getUserNotifications`, {
      method: 'POST',
      headers: this.getUserAuthHeaders(),
      body: JSON.stringify({ 
        user_id: userId,
        ...options
      }),
    });
    const result = await this.handleUserResponse<any>(response);
    return {
      data: result.data || [],
      unread_count: result.unread_count || 0,
      total: result.total || 0
    };
  }

  async markNotificationAsRead(notificationId: number, userId: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/notifications/markAsRead`, {
      method: 'POST',
      headers: this.getUserAuthHeaders(),
      body: JSON.stringify({ 
        notification_id: notificationId,
        user_id: userId
      }),
    });
    return this.handleUserResponse<any>(response);
  }

  async markAllNotificationsAsRead(userId: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/notifications/markAllAsRead`, {
      method: 'POST',
      headers: this.getUserAuthHeaders(),
      body: JSON.stringify({ user_id: userId }),
    });
    return this.handleUserResponse<any>(response);
  }

  async deleteNotification(notificationId: number, userId: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/notifications/delete`, {
      method: 'POST',
      headers: this.getUserAuthHeaders(),
      body: JSON.stringify({ 
        notification_id: notificationId,
        user_id: userId
      }),
    });
    return this.handleUserResponse<any>(response);
  }

  async getNotificationStats(userId: number): Promise<{
    total: number;
    unread: number;
    read: number;
    by_type: Record<string, number>;
  }> {
    const response = await fetch(`${API_BASE_URL}/notifications/stats`, {
      method: 'POST',
      headers: this.getUserAuthHeaders(),
      body: JSON.stringify({ user_id: userId }),
    });
    const result = await this.handleUserResponse<any>(response);
    return result.data || { total: 0, unread: 0, read: 0, by_type: {} };
  }

  async updateUserStatus(userId: number, status: string): Promise<any> {
    console.log("API updateUserStatus called with:", { userId, status });
    const response = await fetch(`${API_BASE_URL}/users/updateStatus`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ 
        user_id: userId, 
        status: status === 'active' ? 1 : 0 
      }),
    });
    return this.handleResponse<any>(response);
  }

  async getAdmins(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/users/admins`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    const result = await this.handleResponse<ApiResponse<User[]>>(response);
    return result.data || [];
  }

  async createAdmin(userData: {
    name: string;
    email: string;
    password: string;
    mobile: string;
  }): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/adminNewAdmin`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return this.handleResponse<User>(response);
  }

  // Categories Management APIs
  async getAllCategories(): Promise<Category[]> {
    console.log('Fetching categories from:', `${API_BASE_URL}/categories/getAll`);
    const response = await fetch(`${API_BASE_URL}/categories/getAll`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    console.log('Categories response status:', response.status);
    const result = await this.handleUserResponse<ApiResponse<Category[]>>(response);
    console.log('Categories result:', result);
    return result.data || [];
  }

  async getCategoryById(categoryId: number): Promise<Category> {
    const response = await fetch(`${API_BASE_URL}/categories/getById`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ id: categoryId }),
    });
    return this.handleResponse<Category>(response);
  }

  async createCategory(categoryData: {
    name: string;
    status: string;
    max_guests?: number;
  }): Promise<Category> {
    const response = await fetch(`${API_BASE_URL}/categories/create`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(categoryData),
    });
    return this.handleResponse<Category>(response);
  }

  async updateCategory(categoryData: {
    id: number;
    name: string;
    status: string;
    max_guests?: number;
  }): Promise<Category> {
    const response = await fetch(`${API_BASE_URL}/categories/update`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(categoryData),
    });
    return this.handleResponse<Category>(response);
  }

  async deleteCategory(categoryId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/categories/destroy`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ id: categoryId }),
    });
    return this.handleResponse<void>(response);
  }

  // Settings Management APIs
  async getAllSettings(): Promise<Setting[]> {
    const response = await fetch(`${API_BASE_URL}/settings/getAll`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    const result = await this.handleResponse<ApiResponse<Setting[]>>(response);
    return result.data || [];
  }

  async getSettingById(settingId: number): Promise<Setting> {
    const response = await fetch(`${API_BASE_URL}/settings/getById`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<Setting>(response);
  }

  async createSetting(settingData: {
    key: string;
    value: string;
    type: string;
  }): Promise<Setting> {
    const response = await fetch(`${API_BASE_URL}/settings/save`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(settingData),
    });
    return this.handleResponse<Setting>(response);
  }

  async updateSetting(settingData: {
    id: number;
    key: string;
    value: string;
    type: string;
  }): Promise<Setting> {
    const response = await fetch(`${API_BASE_URL}/settings/update`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(settingData),
    });
    return this.handleResponse<Setting>(response);
  }

  async deleteSetting(settingId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/settings/delete`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ id: settingId }),
    });
    return this.handleResponse<void>(response);
  }

  // Public API to get default settings (accessible without admin auth)
  async getDefaultSettings(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/settings/getDefault`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    return this.handleResponse<any>(response);
  }

  // Get OTP method setting (public API for login page)
  async getOtpMethod(): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/otp-method`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      const result = await this.handleResponse<any>(response);
      return result.data?.otp_method || 'email';
    } catch (error) {
      console.error('Failed to get OTP method:', error);
      return 'email'; // Default to email if error
    }
  }

  // Update OTP method setting (admin API)
  async updateOtpMethod(otpMethod: 'email' | 'mobile'): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/settings/otp-method`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ otp_method: otpMethod }),
    });
    return this.handleAdminResponse<any>(response);
  }

  // Pages Management APIs (Terms & Conditions)
  async getAllPages(): Promise<Page[]> {
    const response = await fetch(`${API_BASE_URL}/pages/getAll`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    const result = await this.handleResponse<ApiResponse<Page[]>>(response);
    return result.data || [];
  }

  // Public API to get pages (for Terms & Conditions page)
  async getPublicPages(): Promise<Page[]> {
    const response = await fetch(`${API_BASE_URL}/pages/getActive`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    const result = await this.handleResponse<ApiResponse<Page[]>>(response);
    return result.data || [];
  }

  // Get specific page content by ID (public)
  async getPageContent(pageId: number): Promise<Page> {
    const response = await fetch(`${API_BASE_URL}/pages/getContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ id: pageId }),
    });
    return this.handleResponse<Page>(response);
  }

  async getPageById(pageId: number): Promise<Page> {
    const response = await fetch(`${API_BASE_URL}/pages/getById`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ id: pageId }),
    });
    return this.handleResponse<Page>(response);
  }

  async createPage(pageData: {
    name: string;
    content: string;
    status: string;
    extra_fields?: string;
  }): Promise<Page> {
    const response = await fetch(`${API_BASE_URL}/pages/create`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        ...pageData,
        extra_fields: pageData.extra_fields || '{}',
      }),
    });
    return this.handleResponse<Page>(response);
  }

  async updatePage(pageData: {
    id: number;
    title: string;
    content: string;
    status: string;
  }): Promise<Page> {
    const response = await fetch(`${API_BASE_URL}/pages/update`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(pageData),
    });
    return this.handleResponse<Page>(response);
  }

  async deletePage(pageId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/pages/delete`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ id: pageId }),
    });
    return this.handleResponse<void>(response);
  }

  // Contact Management APIs
  async getAllContacts(): Promise<Contact[]> {
    const response = await fetch(`${API_BASE_URL}/contacts/getAll`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    const result = await this.handleResponse<ApiResponse<Contact[]>>(response);
    return result.data || [];
  }

  async updateContact(contactData: {
    id: number;
    status: string;
  }): Promise<Contact> {
    const response = await fetch(`${API_BASE_URL}/contacts/update`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(contactData),
    });
    return this.handleResponse<Contact>(response);
  }

  async replyToContact(contactData: {
    contact_id: number;
    subject: string;
    message: string;
  }): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/mails/replyContactForm`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(contactData),
    });
    return this.handleResponse<void>(response);
  }

  // Public contact form submission
  async submitContactForm(contactData: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }): Promise<Contact> {
    const response = await fetch(`${API_BASE_URL}/contacts/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(contactData),
    });
    return this.handleResponse<Contact>(response);
  }

  // Dashboard APIs
  async getAdminDashboard(): Promise<{
    total_users: number;
    pending_users: number;
    active_events: number;
    total_contacts: number;
    recent_users: User[];
    recent_contacts: Contact[];
  }> {
    // Temporarily test with public endpoint
    const response = await fetch(`${API_BASE_URL}/test/dashboard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    return this.handleResponse(response);
  }

  // Care Dashboard APIs
  async getDashboardStats(): Promise<{
    active_care_members: number;
    upcoming_visits: number;
    care_hours_this_month: number;
    emergency_contacts: number;
    care_hours_growth: number;
    new_members_this_week: number;
  }> {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    const result = await this.handleResponse<any>(response);
    return result.data;
  }

  async getRecentActivity(): Promise<Array<{
    id: number;
    user: string;
    action: string;
    time: string;
    status: string;
    timestamp: string;
  }>> {
    const response = await fetch(`${API_BASE_URL}/dashboard/activity`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    const result = await this.handleResponse<any>(response);
    return result.data;
  }

  async getTodaySchedule(): Promise<Array<{
    id: number;
    time: string;
    title: string;
    assignee: string;
    type: string;
    status: string;
    duration: number;
  }>> {
    const response = await fetch(`${API_BASE_URL}/dashboard/schedule`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    const result = await this.handleResponse<any>(response);
    return result.data;
  }

  async getCareCircle(): Promise<Array<{
    id: number;
    name: string;
    role: string;
    status: string;
    avatar?: string;
    phone: string;
    email: string;
    specialization: string;
  }>> {
    const response = await fetch(`${API_BASE_URL}/dashboard/care-circle`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    const result = await this.handleResponse<any>(response);
    return result.data;
  }

  async createVisit(visitData: {
    title: string;
    date: string;
    time: string;
    assignee_id: number;
    type: 'visit' | 'appointment' | 'reminder';
    duration?: number;
    notes?: string;
  }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/dashboard/create-visit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(visitData),
    });
    return this.handleResponse<any>(response);
  }

  async addCareNote(noteData: {
    title: string;
    content: string;
    category: 'medical' | 'personal' | 'general' | 'emergency';
    priority: 'low' | 'medium' | 'high' | 'urgent';
  }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/dashboard/add-note`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(noteData),
    });
    return this.handleResponse<any>(response);
  }

  async sendUpdate(updateData: {
    message: string;
    recipients?: number[];
    priority: 'low' | 'medium' | 'high' | 'urgent';
  }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/dashboard/send-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    return this.handleResponse<any>(response);
  }

  // Notification APIs
  async sendNotificationToAllUsers(notificationData: {
    title: string;
    message: string;
  }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/notification/sendToAllUsers`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(notificationData),
    });
    return this.handleAdminResponse<any>(response);
  }

  async sendEmailToAllUsers(emailData: {
    subject: string;
    message: string;
  }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/users/sendMailToAll`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(emailData),
    });
    return this.handleAdminResponse<any>(response);
  }

  // Send notification to specific user
  async sendNotificationToUser(userId: number, notificationData: {
    title: string;
    message: string;
    type?: string;
  }): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/notification/sendToUser`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        user_id: userId,
        ...notificationData,
      }),
    });
    return this.handleResponse<void>(response);
  }

  // Send email to specific user
  async sendEmailToUser(userId: number, emailData: {
    subject: string;
    message: string;
    template?: string;
  }): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/users/sendMailToUser`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        user_id: userId,
        ...emailData,
      }),
    });
    return this.handleResponse<void>(response);
  }

  // Profile Management
  async updateProfile(profileData: {
    name: string;
    email: string;
    password?: string;
  }): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/profile/update`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return this.handleResponse<User>(response);
  }

  // Events Management APIs
  async getAllEvents(): Promise<Event[]> {
    const response = await fetch(`${API_BASE_URL}/events/getAll`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    const result = await this.handleUserResponse<ApiResponse<Event[]>>(response);
    return result.data || [];
  }

  async getEventById(eventId: number): Promise<Event> {
    const response = await fetch(`${API_BASE_URL}/events/getById`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ id: eventId }),
    });
    return this.handleResponse<Event>(response);
  }

  async createEvent(eventData: {
    title: string;
    description: string;
    category_id: number;
    location: string;
    event_date: string;
    start_time: string;
    end_time: string;
    max_participants: number;
    organizer_id: number;
    status: string;
    image_url?: string;
    requirements?: string[];
    contact_info?: string;
    is_featured?: boolean;
    registration_deadline?: string;
    event_type: string;
    tags?: string[];
  }): Promise<Event> {
    const response = await fetch(`${API_BASE_URL}/events/create`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(eventData),
    });
    return this.handleResponse<Event>(response);
  }

  // User create event method
  async createUserEvent(eventData: {
    title: string;
    description: string;
    category_id: number;
    location: string;
    event_date: string;
    start_time: string;
    end_time: string;
    max_participants: number;
    organizer_id: number;
    status: string;
    image_url?: string;
    requirements?: string[];
    contact_info?: string;
    is_featured?: boolean;
    registration_deadline?: string;
    event_type: string;
    tags?: string[];
  }): Promise<Event> {
    const response = await fetch(`${API_BASE_URL}/events/createUserEvent`, {
      method: 'POST',
      headers: this.getUserAuthHeaders(),
      body: JSON.stringify(eventData),
    });
    return this.handleUserResponse<Event>(response);
  }

  async updateEvent(eventData: {
    id: number;
    title: string;
    description: string;
    category_id: number;
    location: string;
    event_date: string;
    start_time: string;
    end_time: string;
    max_participants: number;
    organizer_id: number;
    status: string;
    image_url?: string;
    requirements?: string[];
    contact_info?: string;
    is_featured?: boolean;
    registration_deadline?: string;
    event_type: string;
    tags?: string[];
  }): Promise<Event> {
    const response = await fetch(`${API_BASE_URL}/events/update`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(eventData),
    });
    return this.handleResponse<Event>(response);
  }

  async deleteEvent(eventId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/events/delete`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ id: eventId }),
    });
    return this.handleResponse<void>(response);
  }

  async updateEventStatus(eventId: number, status: string): Promise<Event> {
    const response = await fetch(`${API_BASE_URL}/events/updateStatus`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ id: eventId, status }),
    });
    return this.handleResponse<Event>(response);
  }

  async getEventStats(): Promise<{
    total_events: number;
    active_events: number;
    upcoming_events: number;
    completed_events: number;
    featured_events: number;
    total_participants: number;
  }> {
    const response = await fetch(`${API_BASE_URL}/events/getStats`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Image Upload
  async uploadImage(imageFile: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const token = localStorage.getItem('admin_token');
    const response = await fetch(`${API_BASE_URL}/uploadImage`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    });
    return this.handleResponse<{ url: string }>(response, true);
  }

  async uploadProfileImage(imageFile: File): Promise<{ data: { image_name: string; mime: string } }> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${API_BASE_URL}/uploadImage`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      body: formData,
    });
    return this.handleResponse<{ data: { image_name: string; mime: string } }>(response, true);
  }

  // User Profile Submission
  async submitUserProfile(profileData: FormData): Promise<any> {
    const token = localStorage.getItem('userToken');
    const response = await fetch(`${API_BASE_URL}/profile/submitUserProfile`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: profileData,
    });
    return this.handleUserResponse<any>(response);
  }

  // Get User Approval Status
  async getUserApprovalStatus(userId: number): Promise<any> {
    const token = localStorage.getItem('userToken');
    const response = await fetch(`${API_BASE_URL}/profile/getUserApprovalStatus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify({ user_id: userId }),
    });
    return this.handleUserResponse<any>(response);
  }

  // Admin: Approve User Profile
  async approveUserProfile(userId: number, approvalStatus: string, adminComments?: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/users/approveUserProfile`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ 
        user_id: userId, 
        approval_status: approvalStatus,
        admin_comments: adminComments 
      }),
    });
    return this.handleAdminResponse<any>(response);
  }

  // User Dashboard APIs
  async getUserDashboardStats(userId: number): Promise<{
    events_created: number;
    events_joined: number;
    average_rating: number;
    total_reviews: number;
  }> {
    console.log('API: getUserDashboardStats called with userId:', userId);
    const response = await fetch(`${API_BASE_URL}/events/getUserDashboardStats`, {
      method: 'POST',
      headers: this.getUserAuthHeaders(),
      body: JSON.stringify({ user_id: userId }),
    });
    console.log('API: getUserDashboardStats response status:', response.status);
    const result = await this.handleUserResponse<any>(response);
    console.log('API: getUserDashboardStats result:', result);
    return result.data || { events_created: 0, events_joined: 0, average_rating: 0, total_reviews: 0 };
  }

  async getUserTodayEvents(userId: number): Promise<Array<{
    id: number;
    title: string;
    time: string;
    location: string;
    status: string;
    role: string;
    category: string;
    current_participants?: number;
    max_participants?: number;
  }>> {
    const response = await fetch(`${API_BASE_URL}/events/getUserTodayEvents`, {
      method: 'POST',
      headers: this.getUserAuthHeaders(),
      body: JSON.stringify({ user_id: userId }),
    });
    const result = await this.handleUserResponse<any>(response);
    return result.data;
  }

  async getUserCreatedEvents(userId: number): Promise<Array<{
    id: number;
    title: string;
    description: string;
    category: string;
    location: string;
    event_date: string;
    start_time: string;
    end_time: string;
    current_participants: number;
    max_participants: number;
    status: string;
    created_at: string;
  }>> {
    console.log('API: getUserCreatedEvents called with userId:', userId);
    const response = await fetch(`${API_BASE_URL}/events/getUserCreatedEvents`, {
      method: 'POST',
      headers: this.getUserAuthHeaders(),
      body: JSON.stringify({ user_id: userId }),
    });
    console.log('API: getUserCreatedEvents response status:', response.status);
    const result = await this.handleUserResponse<any>(response);
    console.log('API: getUserCreatedEvents result:', result);
    return result.data || [];
  }

  // Join an event
  async joinEvent(eventId: number, userId: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/events/joinEvent`, {
      method: 'POST',
      headers: this.getUserAuthHeaders(),
      body: JSON.stringify({ 
        event_id: eventId,
        user_id: userId,
        // Send numeric status to satisfy strict SQL modes (0=pending)
        status: 0 
      }),
    });
    return this.handleUserResponse<any>(response);
  }

  // Leave an event
  async leaveEvent(eventId: number, userId: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/events/leaveEvent`, {
      method: 'POST',
      headers: this.getUserAuthHeaders(),
      body: JSON.stringify({ 
        event_id: eventId,
        user_id: userId 
      }),
    });
    return this.handleUserResponse<any>(response);
  }

  // Submit a review for an event
  async submitEventReview(eventId: number, userId: number, rating: number, review?: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/events/submitReview`, {
      method: 'POST',
      headers: this.getUserAuthHeaders(),
      body: JSON.stringify({ 
        event_id: eventId,
        user_id: userId,
        rating: rating,
        review: review 
      }),
    });
    return this.handleUserResponse<any>(response);
  }

  // Check if user can review an event
  async canUserReviewEvent(eventId: number, userId: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/events/canUserReview`, {
      method: 'POST',
      headers: this.getUserAuthHeaders(),
      body: JSON.stringify({ 
        event_id: eventId,
        user_id: userId 
      }),
    });
    return this.handleUserResponse<any>(response);
  }

  // Get reviews for an event
  async getEventReviews(eventId: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/events/getEventReviews`, {
      method: 'POST',
      headers: this.getUserAuthHeaders(),
      body: JSON.stringify({ 
        event_id: eventId 
      }),
    });
    return this.handleUserResponse<any>(response);
  }

  // Admin: Get all reviews
  async getAllReviews(options?: {
    page?: number;
    limit?: number;
    search?: string;
    event_id?: number;
    rating?: number;
  }): Promise<{
    reviews: Array<{
      id: number;
      event_id: number;
      event_title: string;
      event_date: string;
      user_id: number;
      reviewer_name: string;
      rating: number;
      review: string;
      created_at: string;
      formatted_date: string;
    }>;
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
      has_more: boolean;
    };
    stats: {
      total_reviews: number;
      average_rating: number;
      rating_distribution: {
        '1': number;
        '2': number;
        '3': number;
        '4': number;
        '5': number;
      };
    };
  }> {
    const queryParams = new URLSearchParams();
    if (options?.page) queryParams.append('page', options.page.toString());
    if (options?.limit) queryParams.append('limit', options.limit.toString());
    if (options?.search) queryParams.append('search', options.search);
    if (options?.event_id) queryParams.append('event_id', options.event_id.toString());
    if (options?.rating) queryParams.append('rating', options.rating.toString());

    const response = await fetch(`${API_BASE_URL}/events/getAllReviews?${queryParams}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    const result = await this.handleAdminResponse<any>(response);
    return result.data;
  }

  // Event Participant Management APIs
  async getUserEvents(userId: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/events/getUserCreatedEvents`, {
      method: 'POST',
      headers: this.getUserAuthHeaders(),
      body: JSON.stringify({ 
        user_id: userId 
      }),
    });
    return this.handleUserResponse<any>(response);
  }

  async getEventParticipants(eventId: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/events/getEventParticipants`, {
      method: 'POST',
      headers: this.getUserAuthHeaders(),
      body: JSON.stringify({ 
        event_id: eventId 
      }),
    });
    return this.handleUserResponse<any>(response);
  }

  async approveParticipant(participantId: number, approvedBy: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/events/approveParticipant`, {
      method: 'POST',
      headers: this.getUserAuthHeaders(),
      body: JSON.stringify({ 
        participant_id: participantId,
        approved_by: approvedBy 
      }),
    });
    return this.handleUserResponse<any>(response);
  }

  async rejectParticipant(participantId: number, rejectedBy: number, rejectionReason?: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/events/rejectParticipant`, {
      method: 'POST',
      headers: this.getUserAuthHeaders(),
      body: JSON.stringify({ 
        participant_id: participantId,
        rejected_by: rejectedBy,
        rejection_reason: rejectionReason 
      }),
    });
    return this.handleUserResponse<any>(response);
  }

  // Form Options APIs
  async getAllFormOptions(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/form-options/getAll`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    return this.handleUserResponse<any>(response);
  }

  async getFormOptionsByType(type: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/form-options/getByType`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ type }),
    });
    return this.handleUserResponse<any>(response);
  }

  // Admin Form Options APIs
  async getAllFormOptionsForAdmin(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/form-options/getAllForAdmin`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleAdminResponse<any>(response);
  }

  async createFormOption(optionData: {
    type: string;
    name: string;
    value?: string;
    description?: string;
    is_active?: boolean;
    sort_order?: number;
  }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/form-options/create`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(optionData),
    });
    return this.handleAdminResponse<any>(response);
  }

  async updateFormOption(optionData: {
    id: number;
    type: string;
    name: string;
    value?: string;
    description?: string;
    is_active?: boolean;
    sort_order?: number;
  }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/form-options/update`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(optionData),
    });
    return this.handleAdminResponse<any>(response);
  }

  async deleteFormOption(optionId: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/form-options/delete`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ id: optionId }),
    });
    return this.handleAdminResponse<any>(response);
  }

  async toggleFormOptionStatus(optionId: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/form-options/toggleStatus`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ id: optionId }),
    });
    return this.handleAdminResponse<any>(response);
  }

  async updateFormOptionsSortOrder(options: Array<{id: number; sort_order: number}>): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/form-options/updateSortOrder`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ options }),
    });
    return this.handleAdminResponse<any>(response);
  }

  // Reports APIs
  async getReportsData(period: string = 'last_6_months'): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/reports/getAnalytics?period=${period}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleAdminResponse<any>(response);
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

// Export types for use in components
export type {
  ApiResponse,
  LoginResponse,
  User,
  Category,
  Setting,
  Contact,
  Page,
  Event,
};