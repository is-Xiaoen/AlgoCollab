import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosError, AxiosResponse } from 'axios'
import { getAccessToken } from '../stores/token';
import tokenManager from './tokenManager';
import authService from '../services/auth';

// 主请求实例
const request: AxiosInstance = axios.create({
  baseURL:
    import.meta.env.VITE_APP_ENV === 'localhost' ? '/api' : import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

// 专门用于刷新令牌的独立axios实例，避免循环拦截
// const refreshTokenRequest: AxiosInstance = axios.create({
//   baseURL:
//     import.meta.env.VITE_APP_ENV === 'localhost' ? '/api' : import.meta.env.VITE_API_BASE_URL,
//   timeout: 10000,
// });

// 请求队列管理
interface QueueItem {
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
  config: InternalAxiosRequestConfig;
}

class RequestQueueManager {
  private isRefreshing = false;
  private failedQueue: QueueItem[] = [];

  /**
   * TODO(human): 实现请求重试机制
   * 要求：
   * 1. 添加重试次数限制
   * 2. 实现指数退避算法
   * 3. 针对不同错误类型决定是否重试
   * 
   * 提示：
   * - 网络错误可以重试
   * - 401/403错误不应重试
   * - 使用exponential backoff：delay = baseDelay * Math.pow(2, retryCount)
   */

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
        const { access_token } = await authService.refreshToken();
        this.isRefreshing = false;
        this.processQueue(null, access_token);
        
        originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
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

  /**
   * TODO(human): 实现请求去重机制
   * 功能：防止相同的请求重复发送
   * 要求：
   * 1. 根据URL和参数生成请求唯一标识
   * 2. 缓存进行中的请求Promise
   * 3. 相同请求返回缓存的Promise
   * 
   * getPendingKey(config: InternalAxiosRequestConfig): string {
   *   // 生成请求唯一标识
   * }
   */
}

const queueManager = new RequestQueueManager();

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 跳过认证的请求（如刷新token）
    if (config.headers['Skip-Auth']) {
      return config;
    }

    const accessToken = getAccessToken();
    if (accessToken) {
      if (!config.headers) {
        config.headers = new axios.AxiosHeaders();
      }
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // TODO(human): 添加请求签名
    // 提示：为请求添加时间戳和签名，防止重放攻击
    // config.headers['X-Request-Time'] = Date.now().toString();
    // config.headers['X-Request-Signature'] = generateSignature(config);

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
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
    // TODO(human): 实现错误上报机制
    // 提示：收集错误信息并上报到监控平台
    // 包括：请求URL、错误码、错误信息、用户信息等
    
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

/**
 * 处理Blob响应
 * TODO(human): 完善文件下载错误处理
 * 要求：
 * 1. 检测文件类型是否正确
 * 2. 处理下载失败的情况
 * 3. 添加下载进度回调
 */
function handleBlobResponse(response: AxiosResponse): Promise<any> {
  const { data } = response;
  const contentType = response.headers['content-type'] || '';
  
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

/**
 * TODO(human): 实现请求/响应日志记录
 * 功能：记录所有请求和响应用于调试
 * 要求：
 * 1. 开发环境开启，生产环境关闭
 * 2. 记录请求URL、方法、参数、响应时间
 * 3. 敏感信息脱敏（如密码、token）
 * 
 * class RequestLogger {
 *   log(config: InternalAxiosRequestConfig, response?: AxiosResponse): void {
 *     // 你的实现
 *   }
 * }
 */

export default request;
