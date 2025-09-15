/**
 * Token存储管理模块
 * 采用分层存储策略：
 * - Access Token: 存储在内存中（防XSS）
 * - Refresh Token: 加密后存储在localStorage
 */

const REFRESH_TOKEN_KEY = 'algo_refresh_token';
const TOKEN_TIMESTAMP_KEY = 'algo_token_timestamp';

let accessTokenInMemory: string | null = null;

/**
 * 简单的加密解密函数
 * TODO(human): 实现更强的加密算法
 * 提示：考虑使用 Web Crypto API 或引入专门的加密库
 * 要求：
 * 1. 使用对称加密算法（如AES）
 * 2. 生成并安全存储加密密钥
 * 3. 处理加密失败的边界情况
 */
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

export const setTokens = (accessToken: string, refreshToken?: string) => {
  accessTokenInMemory = accessToken;
  
  if (refreshToken) {
    const encodedToken = encode(refreshToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, encodedToken);
    localStorage.setItem(TOKEN_TIMESTAMP_KEY, Date.now().toString());
  }
  
  window.dispatchEvent(new CustomEvent('token-updated', { 
    detail: { hasToken: true } 
  }));
};


export const getAccessToken = (): string | null => {
  return accessTokenInMemory;
};

export const getRefreshToken = (): string | null => {
  const encodedToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!encodedToken) return null;
  
  try {
    return decode(encodedToken);
  } catch {
    return null;
  }
};

export const clearTokens = () => {
  accessTokenInMemory = null;
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(TOKEN_TIMESTAMP_KEY);
  
  window.dispatchEvent(new CustomEvent('token-updated', { 
    detail: { hasToken: false } 
  }));
};

export const hasValidTokens = (): boolean => {
  return !!(getAccessToken() && getRefreshToken());
};

/**
 * 从JWT中解析payload
 * TODO(human): 添加更详细的JWT验证
 * 提示：验证JWT的签名、发行者、受众等
 * 要求：
 * 1. 验证token的三部分结构是否完整
 * 2. 检查必要的声明（如iss, aud, sub）
 * 3. 添加类型定义for JWT payload
 */
export const parseJWT = (token: string): any => {
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

//检查Token是否过期
export const isTokenExpired = (token: string): boolean => {
  const payload = parseJWT(token);
  if (!payload || !payload.exp) return true;
  
  const expirationTime = payload.exp * 1000;
  const currentTime = Date.now();
  
  const bufferTime = 5 * 60 * 1000;
  return currentTime >= expirationTime - bufferTime;
};

/**
 * TODO(human): 实现Token自动刷新调度器
 * 功能描述：在Access Token即将过期前自动刷新
 * 要求：
 * 1. 创建 scheduleTokenRefresh 函数
 * 2. 计算最佳刷新时机（如过期前10分钟）
 * 3. 使用 setTimeout 调度刷新任务
 * 4. 提供取消调度的方法
 * 
 * 示例接口：
 * export const scheduleTokenRefresh = (
 *   token: string,
 *   onRefresh: () => Promise<void>
 * ): (() => void) => {
 *   // 你的实现
 * }
 */

export const getTokenRemainingTime = (token: string): number => {
  const payload = parseJWT(token);
  if (!payload || !payload.exp) return 0;
  
  const expirationTime = payload.exp * 1000;
  const currentTime = Date.now();
  const remaining = expirationTime - currentTime;
  
  return remaining > 0 ? remaining : 0;
};

export const initTokenListener = (callback: (hasToken: boolean) => void) => {
  const handleTokenUpdate = (event: Event) => {
    const customEvent = event as CustomEvent;
    callback(customEvent.detail.hasToken);
  };
  
  window.addEventListener('token-updated', handleTokenUpdate);
  
  // 返回清理函数
  return () => {
    window.removeEventListener('token-updated', handleTokenUpdate);
  };
};

export const initStorageListener = (onLogout: () => void) => {
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === REFRESH_TOKEN_KEY && !event.newValue) {
      accessTokenInMemory = null;
      onLogout();
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
};