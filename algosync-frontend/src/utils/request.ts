import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosError, AxiosResponse } from 'axios'
import tokenManager from './tokenManager';
import authService from '../services/auth';

const request: AxiosInstance = axios.create({
  baseURL:
    import.meta.env.VITE_APP_ENV === 'localhost' ? '/api' : import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

const refreshTokenRequest: AxiosInstance = axios.create({
  baseURL:
    import.meta.env.VITE_APP_ENV === 'localhost' ? '/api' : import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

interface QueueItem {
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
  config: InternalAxiosRequestConfig;
}

class RequestQueueManager {
  private isRefreshing = false;
  private failedQueue: QueueItem[] = [];

  private maxRetries = 3; 
  private baseDelay = 1000; 
  private retryableErrors = ['ECONNABORTED', 'ETIMEDOUT', 'ENOTFOUND', 'ENETUNREACH'];  
  
 
  private isRetryableError(error: AxiosError): boolean {
    // 检查是否是网络错误
    if (error.code && this.retryableErrors.includes(error.code)) {
      return true;
    }
    
    // 检查HTTP状态码：5xx服务器错误可重试，4xx客户端错误不重试
    const status = error.response?.status;
    if (status) {
      // 500, 502, 503, 504 等服务器错误可以重试
      return status >= 500 && status < 600;
    }
    
    // 没有响应的情况（网络超时等）可以重试
    return !error.response;
  }
  
  /**
   * 执行请求重试
   */
  async retryRequest(config: InternalAxiosRequestConfig, retryCount: number = 0): Promise<any> {
    if (retryCount >= this.maxRetries) {
      throw new Error(`请求重试${this.maxRetries}次后仍然失败`);
    }
    
    try {
      // 计算延迟时间（指数退避）
      const delay = this.baseDelay * Math.pow(2, retryCount);
      // 添加抖动因子避免同时重试
      const jitteredDelay = delay + Math.random() * 1000;
      
      console.log(`第${retryCount + 1}次重试，延迟${Math.round(jitteredDelay)}ms...`);
      
      // 等待延迟
      await new Promise(resolve => setTimeout(resolve, jitteredDelay));
      
      // 发起重试请求
      return await request(config);
    } catch (error) {
      // 如果错误可以重试且未达到最大次数，递归重试
      if (this.isRetryableError(error as AxiosError)) {
        return this.retryRequest(config, retryCount + 1);
      }
      
      // 否则抛出错误
      throw error;
    }
  }

  //添加失败的请求到队列
  addToQueue(item: QueueItem) {
    this.failedQueue.push(item);
  }

  //处理队列中的请求
  processQueue(error: Error | null, token: string | null = null) {
    this.failedQueue.forEach(item => {
      if (error) {
        item.reject(error);
      } else if (token) {
        item.config.headers['Authorization'] = `Bearer ${token}`;
        request(item.config).then(item.resolve).catch(item.reject);
      }
    });
    this.failedQueue = [];
  }

  async refreshAndRetry(originalRequest: InternalAxiosRequestConfig): Promise<any> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      try {
        // 获取refreshToken并调用刷新API
        const refreshToken = tokenManager.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const tokens = await authService.refreshToken(refreshToken);
        tokenManager.setTokenPair(tokens.accessToken, tokens.refreshToken);
        
        this.isRefreshing = false;
        this.processQueue(null, tokens.accessToken);
        
        originalRequest.headers['Authorization'] = `Bearer ${tokens.accessToken}`;
        return request(originalRequest);
      } catch (error) {
        this.isRefreshing = false;
        this.processQueue(error as Error);
        tokenManager.clearAll();
        window.dispatchEvent(new CustomEvent('auth:logout'));
        throw error;
      }
    }
    return new Promise((resolve, reject) => {
      this.addToQueue({ resolve, reject, config: originalRequest });
    });
  }

  private pendingRequests = new Map<string, Promise<any>>(); // 存储进行中的请求
  
  /**
   * 生成请求的唯一标识
   */
  private getPendingKey(config: InternalAxiosRequestConfig): string {
    // 组合 method + url + params + data 生成唯一标识
    const method = config.method || 'GET';
    const url = config.url || '';
    const params = config.params ? JSON.stringify(config.params) : '';
    const data = config.data ? JSON.stringify(config.data) : '';
    
    return `${method.toUpperCase()}|${url}|${params}|${data}`;
  }
  
  /**
   * 检查是否有重复请求
   */
  checkDuplicateRequest(config: InternalAxiosRequestConfig): Promise<any> | null {
    const key = this.getPendingKey(config);
    
    // 检查是否存在重复请求
    if (this.pendingRequests.has(key)) {
      console.log(`检测到重复请求：${config.method} ${config.url}`);
      return this.pendingRequests.get(key)!;
    }
    
    return null;
  }
}

const queueManager = new RequestQueueManager();

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 记录请求日志
    logger.logRequest(config);
    
    // 跳过认证的请求（如刷新token）
    if (config.headers['Skip-Auth']) {
      return config;
    }

    const accessToken = tokenManager.getAccessToken();
    if (accessToken) {
      if (!config.headers) {
        config.headers = new axios.AxiosHeaders();
      }
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // 添加请求签名（防止重放攻击）
    const timestamp = Date.now().toString();
    config.headers['X-Request-Time'] = timestamp;
    
    // 生成请求签名
    const method = config.method?.toUpperCase() || 'GET';
    const url = config.url || '';
    const data = config.data ? JSON.stringify(config.data) : '';
    const signStr = `${method}|${url}|${timestamp}|${data}`;
    
    // 简单的签名算法（生产环境建议使用HMAC-SHA256）
    const secretKey = import.meta.env.VITE_API_SECRET_KEY || 'default-dev-key';
    const signature = btoa(signStr + secretKey).slice(0, 32);
    config.headers['X-Request-Signature'] = signature;

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    // 记录响应日志
    logger.logResponse(response);
    
    const { data } = response;
    
    if (response.config.responseType === 'blob') {
      return handleBlobResponse(response);
    }
    
    if (data && (data.code === 4010 || data.code === 401)) {
      const originalRequest = response.config as InternalAxiosRequestConfig & { _retry?: boolean };
      if (originalRequest._retry) {
        return Promise.reject(createError(response.config, data.code, 'Token refresh failed'));
      }  
      originalRequest._retry = true;
      return queueManager.refreshAndRetry(originalRequest);
    }
    
    if (data && data.code && data.code !== 200 && data.code !== 2000) {
      const errorMessage = data.error || data.message || `请求失败，错误码：${data.code}`;
      return Promise.reject(createError(response.config, data.code, errorMessage));
    }
    
    return data;
  },
  async (error: AxiosError) => {
    logger.logError(error);
    
    const errorInfo = {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      userId: 'anonymous',  
      stack: error.stack,
    };
    
    const shouldReport = error.response?.status !== 401 && error.response?.status !== 403;
    if (shouldReport) {
      if (typeof window !== 'undefined' && (window as any).Sentry) {
        (window as any).Sentry.captureException(error, { extra: errorInfo });
      } else {
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/errors', JSON.stringify(errorInfo));
        } else {
          fetch('/api/errors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(errorInfo),
          }).catch(() => {});  
        }
      }
    }
    if (!error.isAxiosError || !error.response) {
      console.error('Network error:', error);
      return Promise.reject(error);
    }
    const { status } = error.response;
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      if (originalRequest.url?.includes('/auth/refresh')) {
        tokenManager.clearAll();
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(error);
      }
      return queueManager.refreshAndRetry(originalRequest);
    }
    if (status === 403) {
      window.dispatchEvent(new CustomEvent('auth:forbidden', { 
        detail: { message: '您没有权限访问此资源' } 
      }));
    }
    return Promise.reject(error);
  },
);

//处理Blob响应（文件下载）
function handleBlobResponse(response: AxiosResponse): Promise<any> {
  const { data } = response;
  const contentType = response.headers['content-type'] || '';
  
  // 验证文件类型
  const expectedType = response.config.headers?.['Accept'];
  if (expectedType && !contentType.includes(expectedType)) {
    return Promise.reject(new Error(`文件类型不匹配：期望 ${expectedType}，实际 ${contentType}`));
  }
  
  // 检查文件大小
  const contentLength = response.headers['content-length'];
  const maxSize = 100 * 1024 * 1024;  
  if (contentLength && parseInt(contentLength) > maxSize) {
    return Promise.reject(new Error('文件过大，超过100MB限制'));
  }
  
  // 检查是否是错误响应
  if (contentType.includes('application/json')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const jsonData = JSON.parse(reader.result as string);
          if (jsonData.code && jsonData.code !== 200 && jsonData.code !== 2000) {
            reject(createError(response.config, jsonData.code, jsonData.message));
          } else {
            resolve(data);
          }
        } catch {
          resolve(data);
        }
      };
      reader.onerror = () => reject(new Error('读取响应失败'));
      reader.readAsText(data);
    });
  }
  
  return Promise.resolve(data);
}

//创建错误对象
function createError(
  config: InternalAxiosRequestConfig,
  code: number | undefined,
  message: string,
): AxiosError {
  const error = new Error(message) as AxiosError;
  error.config = config;
  error.isAxiosError = true;
  error.response = {
    data: { code, message },
    status: code === 4010 || code === 401 ? 401 : 500,
    statusText: message,
    headers: {},
    config: config as any,
  };
  return error;
}

//请求/响应日志记录器
class RequestLogger {
  private enabled = import.meta.env.DEV;  
  private sensitiveFields = ['password', 'token', 'authorization', 'secret', 'key']; 
  
  //脱敏处理敏感数据
  private sanitize(data: any): any {
    if (!data) return data;
    
    if (typeof data === 'string') {
      const lowerData = data.toLowerCase();
      if (this.sensitiveFields.some(field => lowerData.includes(field))) {
        return '***REDACTED***';
      }
      return data;
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitize(item));
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized = { ...data };
      for (const key in sanitized) {
        if (this.sensitiveFields.some(field => key.toLowerCase().includes(field))) {
          sanitized[key] = '***REDACTED***';
        } else if (typeof sanitized[key] === 'object') {
          sanitized[key] = this.sanitize(sanitized[key]);
        }
      }
      return sanitized;
    }
    
    return data;
  }
  
  //记录请求日志
  logRequest(config: InternalAxiosRequestConfig): void {
    if (!this.enabled) return;
    
    console.group(`🚀 [${config.method?.toUpperCase()}] ${config.url}`);
    console.log('Headers:', this.sanitize(config.headers));
    console.log('Params:', this.sanitize(config.params));
    console.log('Data:', this.sanitize(config.data));
    console.log('Time:', new Date().toISOString());
    console.groupEnd();
  }
  
  //记录响应日志
  logResponse(response: AxiosResponse, duration?: number): void {
    if (!this.enabled) return;
    
    const status = response.status;
    const statusEmoji = status >= 200 && status < 300 ? '✅' : '❌';
    console.group(`${statusEmoji} [${status}] ${response.config.url}`);
    console.log('Data:', this.sanitize(response.data));
    if (duration) console.log('Duration:', `${duration}ms`);
    console.log('Time:', new Date().toISOString());
    console.groupEnd();
  }
  
  //记录错误日志
  logError(error: AxiosError): void {
    if (!this.enabled) return;
    
    console.group(`❌ [ERROR] ${error.config?.url}`);
    console.error('Message:', error.message);
    console.error('Status:', error.response?.status);
    console.error('Data:', this.sanitize(error.response?.data));
    console.groupEnd();
  }
}

const logger = new RequestLogger();

// 导出主请求实例和辅助工具
export default request;
export { refreshTokenRequest, queueManager, logger };
