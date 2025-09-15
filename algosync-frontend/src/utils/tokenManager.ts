import { 
  setTokens, 
  getAccessToken, 
  getRefreshToken, 
  clearTokens,
  isTokenExpired,
  getTokenRemainingTime,
  parseJWT,
  initStorageListener
} from '../stores/token';

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
    initStorageListener(() => {
      this.onLogout();
    });
  }

  /**
   * TODO(human): 实现安全的Token存储策略
   * 要求：
   * 1. 实现setSecureTokens方法，增强安全性
   * 2. 考虑使用sessionStorage作为备选方案
   * 3. 实现Token指纹（fingerprint）防止CSRF攻击
   * 
   * 示例：
   * setSecureTokens(accessToken: string, refreshToken: string, options?: {
   *   rememberMe?: boolean;
   *   fingerprint?: string;
   * }): void {
   *   // 你的实现
   * }
   */

  setTokenPair(accessToken: string, refreshToken: string) {
    setTokens(accessToken, refreshToken);
    
    this.scheduleRefresh(accessToken);
  }

  getAccessToken(): string | null {
    const token = getAccessToken();
    
    // TODO(human): 添加Token有效性检查
    // 提示：检查token是否过期，如果过期则尝试刷新
    
    return token;
  }

  getRefreshToken(): string | null {
    return getRefreshToken();
  }

  private scheduleRefresh(accessToken: string) {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    const remainingTime = getTokenRemainingTime(accessToken);
    if (remainingTime <= 0) return;

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
   * TODO(human): 实现Token刷新队列管理
   * 功能：防止并发刷新请求
   * 要求：
   * 1. 如果正在刷新，新请求应该等待当前刷新完成
   * 2. 实现订阅者模式，刷新成功后通知所有等待者
   * 3. 处理刷新失败的情况
   * 
   * 提示：使用 this.refreshSubscribers 数组存储等待的回调
   */
  private onAccessTokenFetched(token: string) {
    this.refreshSubscribers.forEach(callback => callback(token));
    this.refreshSubscribers = [];
  }

  async refreshToken(): Promise<string | null> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.handleRefreshFailure();
      return null;
    }

    this.isRefreshing = true;

    // TODO(human): 实现实际的刷新API调用
    // 这里需要调用后端的刷新接口
    this.refreshPromise = new Promise((resolve) => {
      setTimeout(() => {
        console.log('Token refresh simulation - replace with real API call');
        resolve(null);
      }, 1000);
    });

    try {
      const result = await this.refreshPromise;
      this.isRefreshing = false;
      this.refreshPromise = null;
      
      if (result) {
        this.onAccessTokenFetched(result);
      }
      
      return result;
    } catch (error) {
      this.isRefreshing = false;
      this.refreshPromise = null;
      this.handleRefreshFailure();
      throw error;
    }
  }

  //处理刷新失败
  private handleRefreshFailure() {
    this.clearAll();
    // 触发全局登出事件
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }

  /**
   * TODO(human): 实现Token撤销功能
   * 功能：在登出时撤销Token（通知后端）
   * 要求：
   * 1. 创建 revokeToken 方法
   * 2. 调用后端的Token撤销接口
   * 3. 确保清理本地存储
   * 
   * async revokeToken(): Promise<void> {
   *   // 你的实现
   * }
   */

  //清除所有Token和定时器
  clearAll() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    
    clearTokens();
    
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
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();
    
    if (!accessToken || !refreshToken) {
      return false;
    }
    
    if (!isTokenExpired(accessToken)) {
      return true;
    }
    
    return !!refreshToken;
  }

  /**
   * TODO(human): 实现Token预加载功能
   * 功能：应用启动时从存储恢复Token状态
   * 要求：
   * 1. 创建 initialize 方法
   * 2. 检查localStorage中的refresh token
   * 3. 如果存在且有效，尝试刷新获取新的access token
   * 4. 设置自动刷新调度
   * 
   * async initialize(): Promise<boolean> {
   *   // 你的实现
   * }
   */

  //获取用户信息（从Token中解析）
  getUserFromToken(): any {
    const token = getAccessToken();
    if (!token) return null;
    
    const payload = parseJWT(token);
    
    // TODO(human): 添加用户信息的类型定义和字段映射
    // 根据你的JWT payload结构调整
    return payload ? {
      id: payload.sub,
      email: payload.email,
      username: payload.username,
      roles: payload.roles || []
    } : null;
  }
}

export default TokenManager.getInstance();