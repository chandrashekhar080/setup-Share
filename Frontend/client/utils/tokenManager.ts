/**
 * Token Management Utility
 * Handles token expiration checking and automatic refresh
 */

interface TokenData {
  token: string;
  expiresAt: number;
  refreshAt: number;
}

class TokenManager {
  private static instance: TokenManager;
  private refreshTimer: NodeJS.Timeout | null = null;

  private constructor() {}

  public static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  /**
   * Store token with expiration tracking
   */
  public storeToken(token: string, expiresInMinutes: number = 21600): void {
    const now = Date.now();
    const expiresAt = now + (expiresInMinutes * 60 * 1000); // Convert minutes to milliseconds
    const refreshAt = now + ((expiresInMinutes - 60) * 60 * 1000); // Refresh 1 hour before expiry

    const tokenData: TokenData = {
      token,
      expiresAt,
      refreshAt
    };

    localStorage.setItem('userToken', token);
    localStorage.setItem('tokenData', JSON.stringify(tokenData));

    // Set up automatic refresh
    this.scheduleTokenRefresh();
  }

  /**
   * Get current token if valid
   */
  public getToken(): string | null {
    const token = localStorage.getItem('userToken');
    const tokenDataStr = localStorage.getItem('tokenData');

    if (!token || !tokenDataStr) {
      return null;
    }

    try {
      const tokenData: TokenData = JSON.parse(tokenDataStr);
      const now = Date.now();

      // Check if token is expired
      if (now >= tokenData.expiresAt) {
        console.log('Token has expired');
        this.clearToken();
        return null;
      }

      return token;
    } catch (error) {
      console.error('Error parsing token data:', error);
      return token; // Fallback to basic token
    }
  }

  /**
   * Check if token needs refresh
   */
  public needsRefresh(): boolean {
    const tokenDataStr = localStorage.getItem('tokenData');
    
    if (!tokenDataStr) {
      return false;
    }

    try {
      const tokenData: TokenData = JSON.parse(tokenDataStr);
      const now = Date.now();

      return now >= tokenData.refreshAt && now < tokenData.expiresAt;
    } catch (error) {
      console.error('Error checking refresh need:', error);
      return false;
    }
  }

  /**
   * Clear token and cancel refresh timer
   */
  public clearToken(): void {
    localStorage.removeItem('userToken');
    localStorage.removeItem('tokenData');
    localStorage.removeItem('user');
    
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Schedule automatic token refresh
   */
  private scheduleTokenRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    const tokenDataStr = localStorage.getItem('tokenData');
    if (!tokenDataStr) {
      return;
    }

    try {
      const tokenData: TokenData = JSON.parse(tokenDataStr);
      const now = Date.now();
      const timeUntilRefresh = tokenData.refreshAt - now;

      if (timeUntilRefresh > 0) {
        this.refreshTimer = setTimeout(() => {
          this.attemptTokenRefresh();
        }, timeUntilRefresh);

        console.log(`Token refresh scheduled in ${Math.round(timeUntilRefresh / 1000 / 60)} minutes`);
      } else if (this.needsRefresh()) {
        // Needs immediate refresh
        this.attemptTokenRefresh();
      }
    } catch (error) {
      console.error('Error scheduling token refresh:', error);
    }
  }

  /**
   * Attempt to refresh the token
   */
  private async attemptTokenRefresh(): Promise<void> {
    try {
      console.log('Attempting automatic token refresh...');
      
      // Import API service dynamically to avoid circular dependencies
      const { default: apiService } = await import('../services/api');
      const newToken = await apiService.refreshUserToken();
      
      if (newToken) {
        // Store the new token with fresh expiration
        this.storeToken(newToken, 21600); // 15 days
        console.log('Token refreshed automatically');
        
        // Dispatch custom event to notify components
        window.dispatchEvent(new CustomEvent('tokenRefreshed', { 
          detail: { token: newToken } 
        }));
      } else {
        console.log('Token refresh failed, user will need to re-authenticate');
        this.clearToken();
        
        // Dispatch event to notify components of auth failure
        window.dispatchEvent(new CustomEvent('authExpired'));
      }
    } catch (error) {
      console.error('Automatic token refresh failed:', error);
      this.clearToken();
      window.dispatchEvent(new CustomEvent('authExpired'));
    }
  }

  /**
   * Get time until token expires (in minutes)
   */
  public getTimeUntilExpiry(): number | null {
    const tokenDataStr = localStorage.getItem('tokenData');
    
    if (!tokenDataStr) {
      return null;
    }

    try {
      const tokenData: TokenData = JSON.parse(tokenDataStr);
      const now = Date.now();
      const timeUntilExpiry = tokenData.expiresAt - now;
      
      return Math.max(0, Math.round(timeUntilExpiry / 1000 / 60)); // Convert to minutes
    } catch (error) {
      console.error('Error calculating expiry time:', error);
      return null;
    }
  }

  /**
   * Initialize token manager on app start
   */
  public initialize(): void {
    // Check if there's an existing token and set up refresh if needed
    const token = this.getToken();
    if (token && this.needsRefresh()) {
      this.attemptTokenRefresh();
    } else if (token) {
      this.scheduleTokenRefresh();
    }

    // Listen for storage changes (multi-tab support)
    window.addEventListener('storage', (e) => {
      if (e.key === 'userToken' || e.key === 'tokenData') {
        if (e.newValue) {
          this.scheduleTokenRefresh();
        } else {
          this.clearToken();
        }
      }
    });
  }
}

export default TokenManager.getInstance();