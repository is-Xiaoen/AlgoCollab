/**
 * 统一的Token管理器 - 集成了存储、刷新、生命周期管理
 * 这是所有token操作的唯一入口
 */

import type { JWTPayload, RefreshTokenCallback } from '../types/token';
import { TOKEN_KEYS } from '../types/token';

// 内存中的Access Token（防XSS）
let accessTokenInMemory: string | null = null;

// 简单的加密解密函数
const encode = (str: string): string => {
  try {
    return btoa(encodeURIComponent(str));
  } catch {
    return str;
  }
};

const decode = (str: string): string => {
  try {
    return decodeURIComponent(atob(str));
  } catch {
    return str;
  }
};

// JWT解析函数
const parseJWT = (token: string): JWTPayload | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

// 检查Token是否过期
const isTokenExpired = (token: string): boolean => {
  const payload = parseJWT(token);
  if (!payload || !payload.exp) return true;
  
  const expirationTime = payload.exp * 1000;
  const currentTime = Date.now();
  
  const bufferTime = 5 * 60 * 1000; // 5分钟缓冲时间
  return currentTime >= expirationTime - bufferTime;
};

// 获取Token剩余时间
const getTokenRemainingTime = (token: string): number => {
  const payload = parseJWT(token);
  if (!payload || !payload.exp) return 0;
  
  const expirationTime = payload.exp * 1000;
  const currentTime = Date.now();
  const remaining = expirationTime - currentTime;
  
  return remaining > 0 ? remaining : 0;
};

class TokenManager {
  private static instance: TokenManager;
  private refreshTimer: NodeJS.Timeout | null = null;
  private refreshPromise: Promise<any> | null = null;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  private constructor() {
    this.initCrossTabSync();
  }

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  private initCrossTabSync() {
    // 监听localStorage变化，实现跨标签页同步
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === TOKEN_KEYS.REFRESH_TOKEN && !event.newValue) {
        accessTokenInMemory = null;
        this.onLogout();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
  }

  /**
   * 设置token对 - 这是存储token的唯一入口
   */
  setTokenPair(accessToken: string, refreshToken: string) {
    // 存储tokens
    accessTokenInMemory = accessToken;
    
    if (refreshToken) {
      const encodedToken = encode(refreshToken);
      localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, encodedToken);
      localStorage.setItem(TOKEN_KEYS.TOKEN_TIMESTAMP, Date.now().toString());
    }
    
    // 触发token更新事件
    window.dispatchEvent(new CustomEvent('token-updated', { 
      detail: { hasToken: true } 
    }));
    
    // 调度自动刷新
    this.scheduleRefresh(accessToken);
  }

  /**
   * 获取Access Token
   */
  getAccessToken(): string | null {
    return accessTokenInMemory;
  }

  /**
   * 获取Refresh Token
   */
  getRefreshToken(): string | null {
    const encodedToken = localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
    if (!encodedToken) return null;
    
    try {
      return decode(encodedToken);
    } catch {
      return null;
    }
  }

  /**
   * 调度token自动刷新
   */
  private scheduleRefresh(accessToken: string) {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    const remainingTime = getTokenRemainingTime(accessToken);
    if (remainingTime <= 0) return;

    // 在过期前80%的时间或过期前10分钟刷新（取较小值）
    const refreshTime = Math.min(
      remainingTime * 0.8,
      remainingTime - 10 * 60 * 1000
    );

    if (refreshTime > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refreshToken();
      }, refreshTime);
    }
  }

  /**
   * 刷新token - 通过回调函数调用API
   */
  async refreshToken(apiRefreshFn?: RefreshTokenCallback): Promise<string | null> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.handleRefreshFailure();
      return null;
    }

    this.isRefreshing = true;

    this.refreshPromise = new Promise(async (resolve, reject) => {
      try {
        if (apiRefreshFn) {
          const result = await apiRefreshFn(refreshToken);
          if (result) {
            this.setTokenPair(result.accessToken, result.refreshToken);
            this.onAccessTokenFetched(result.accessToken);
            resolve(result.accessToken);
          } else {
            this.handleRefreshFailure();
            resolve(null);
          }
        } else {
          // 如果没有提供API函数，返回null
          console.warn('No refresh API function provided');
          resolve(null);
        }
      } catch (error) {
        this.handleRefreshFailure();
        reject(error);
      }
    });

    try {
      const result = await this.refreshPromise;
      this.isRefreshing = false;
      this.refreshPromise = null;
      return result;
    } catch (error) {
      this.isRefreshing = false;
      this.refreshPromise = null;
      throw error;
    }
  }

  //通知所有等待刷新的订阅者
  private onAccessTokenFetched(token: string) {
    this.refreshSubscribers.forEach(callback => callback(token));
    this.refreshSubscribers = [];
  }

  private handleRefreshFailure() {
    this.clearAll();
    // 触发全局登出事件
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }

 
  clearAll() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
   
    accessTokenInMemory = null;
    localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.TOKEN_TIMESTAMP);
    // 触发token清除事件
    window.dispatchEvent(new CustomEvent('token-updated', { 
      detail: { hasToken: false } 
    }));
    this.isRefreshing = false;
    this.refreshPromise = null;
    this.refreshSubscribers = [];
  }

  //登出处理
  private onLogout() {
    this.clearAll();
  }

  //检查是否已认证
  isAuthenticated(): boolean {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    if (!accessToken || !refreshToken) {
      return false;
    }
    if (!isTokenExpired(accessToken)) {
      return true;
    }
    
    return !!refreshToken;
  }
  //从Token中解析用户信息
  getUserFromToken(): any {
    const token = this.getAccessToken();
    if (!token) return null;
    const payload = parseJWT(token);
    return payload ? {
      id: payload.sub,
      email: payload.email,
      username: payload.username,
      roles: payload.roles || []
    } : null;
  }
  //初始化token监听器
  initTokenListener(callback: (hasToken: boolean) => void): (() => void) {
    const handleTokenUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      callback(customEvent.detail.hasToken);
    };
    window.addEventListener('token-updated', handleTokenUpdate);
    // 返回清理函数
    return () => {
      window.removeEventListener('token-updated', handleTokenUpdate);
    };
  }

  //检查token是否即将过期（用于主动刷新）
  isTokenExpiring(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    const remainingTime = getTokenRemainingTime(token);
    return remainingTime <= 15 * 60 * 1000;  
  }
}

export default TokenManager.getInstance();