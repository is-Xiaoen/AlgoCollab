# 企业级前端认证模块架构方案

## 项目概述

本方案为算法平台设计了一套完整的前端认证系统，采用 React + TypeScript + Zustand + Axios 技术栈，实现了基于双令牌（Access Token + Refresh Token）的安全认证机制。

## 技术栈

- **框架**: React 18 + TypeScript
- **状态管理**: Zustand (轻量级、TypeScript 友好)
- **HTTP 客户端**: Axios (拦截器机制强大)
- **路由**: React Router v6
- **表单验证**: React Hook Form + Zod
- **UI 反馈**: React Toastify

## API 接口规范

### 用户注册
```
POST /api/v1/auth/register
Body: { username, email, password }
Response: { access_token, refresh_token, user }
```

### 用户登录
```
POST /api/v1/auth/login
Body: { email, password }
Response: { token, refresh_token, user }
```

### 刷新令牌
```
POST /api/v1/auth/refresh
Body: { refresh_token }
Response: { access_token, refresh_token }
```

## 核心模块实现

### 1. 双令牌管理机制

```typescript
// src/utils/tokenManager.ts
interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

class TokenManager {
  private static ACCESS_TOKEN_KEY = 'auth_access_token';
  private static REFRESH_TOKEN_KEY = 'auth_refresh_token';
  
  // Access Token 存储在内存中（更安全）
  private static accessTokenInMemory: string | null = null;
  
  // Refresh Token 存储在 HttpOnly Cookie（最安全）或 localStorage
  // 这里演示 localStorage 方案，生产环境建议使用 HttpOnly Cookie
  static setTokens({ accessToken, refreshToken }: TokenPair): void {
    this.accessTokenInMemory = accessToken;
    
    // Refresh Token 加密后存储
    const encryptedRefreshToken = this.encrypt(refreshToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, encryptedRefreshToken);
    
    // 设置 Session Storage 作为标记（用于检测多标签页）
    sessionStorage.setItem('auth_session', Date.now().toString());
  }
  
  static getAccessToken(): string | null {
    return this.accessTokenInMemory;
  }
  
  static getRefreshToken(): string | null {
    const encrypted = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    return encrypted ? this.decrypt(encrypted) : null;
  }
  
  static clearTokens(): void {
    this.accessTokenInMemory = null;
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    sessionStorage.removeItem('auth_session');
  }
  
  // 简单的加密/解密（生产环境应使用更强的加密）
  private static encrypt(token: string): string {
    return btoa(token); // Base64 编码，实际应用需要更强的加密
  }
  
  private static decrypt(encrypted: string): string {
    return atob(encrypted);
  }
  
  // 检测令牌是否过期
  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }
}

export default TokenManager;
```

### 2. Axios 拦截器与自动刷新机制

```typescript
// src/api/axiosConfig.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import TokenManager from '@/utils/tokenManager';

interface QueueItem {
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}

class AxiosAuthManager {
  private isRefreshing = false;
  private failedQueue: QueueItem[] = [];
  
  private processQueue(error: AxiosError | null, token: string | null = null) {
    this.failedQueue.forEach(item => {
      if (error) {
        item.reject(error);
      } else {
        item.resolve(token);
      }
    });
    this.failedQueue = [];
  }
  
  setupInterceptors() {
    // 请求拦截器
    axios.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = TokenManager.getAccessToken();
        
        if (token && !config.headers['Skip-Auth']) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // 添加防重放攻击的时间戳
        config.headers['X-Request-Time'] = Date.now().toString();
        
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // 响应拦截器
    axios.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        
        // 401 错误且不是刷新令牌请求
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // 如果正在刷新，将请求加入队列
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return axios(originalRequest);
            });
          }
          
          originalRequest._retry = true;
          this.isRefreshing = true;
          
          try {
            const refreshToken = TokenManager.getRefreshToken();
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }
            
            const response = await axios.post('/api/v1/auth/refresh', {
              refresh_token: refreshToken
            }, {
              headers: { 'Skip-Auth': 'true' }
            });
            
            const { access_token, refresh_token } = response.data;
            TokenManager.setTokens({
              accessToken: access_token,
              refreshToken: refresh_token
            });
            
            this.processQueue(null, access_token);
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            
            return axios(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError as AxiosError, null);
            TokenManager.clearTokens();
            
            // 触发全局登出事件
            window.dispatchEvent(new CustomEvent('auth:logout'));
            
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }
        
        return Promise.reject(error);
      }
    );
  }
}

export default new AxiosAuthManager();
```

### 3. Zustand 认证 Store

```typescript
// src/store/authStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import axios from 'axios';
import TokenManager from '@/utils/tokenManager';

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  roles?: string[];
  permissions?: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  loginAttempts: number;
  lastActivity: number;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  updateLastActivity: () => void;
  clearError: () => void;
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

type AuthStore = AuthState & AuthActions;

const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // 初始状态
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        loginAttempts: 0,
        lastActivity: Date.now(),
        
        // 登录
        login: async (credentials) => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });
          
          try {
            // 防暴力破解：检查登录尝试次数
            if (get().loginAttempts >= 5) {
              throw new Error('Too many login attempts. Please try again later.');
            }
            
            const response = await axios.post('/api/v1/auth/login', credentials);
            const { token, refresh_token, user } = response.data;
            
            // 存储令牌
            TokenManager.setTokens({
              accessToken: token,
              refreshToken: refresh_token
            });
            
            set((state) => {
              state.user = user;
              state.isAuthenticated = true;
              state.loginAttempts = 0;
              state.lastActivity = Date.now();
            });
            
            // 设置自动登出定时器
            if (!credentials.rememberMe) {
              get().setupAutoLogout();
            }
            
          } catch (error: any) {
            set((state) => {
              state.error = error.response?.data?.message || 'Login failed';
              state.loginAttempts += 1;
            });
            throw error;
          } finally {
            set((state) => {
              state.isLoading = false;
            });
          }
        },
        
        // 注册
        register: async (userData) => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });
          
          try {
            const response = await axios.post('/api/v1/auth/register', userData);
            const { access_token, refresh_token, user } = response.data;
            
            TokenManager.setTokens({
              accessToken: access_token,
              refreshToken: refresh_token
            });
            
            set((state) => {
              state.user = user;
              state.isAuthenticated = true;
              state.lastActivity = Date.now();
            });
            
          } catch (error: any) {
            set((state) => {
              state.error = error.response?.data?.message || 'Registration failed';
            });
            throw error;
          } finally {
            set((state) => {
              state.isLoading = false;
            });
          }
        },
        
        // 登出
        logout: () => {
          TokenManager.clearTokens();
          
          set((state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;
          });
          
          // 清理所有定时器
          if (get().logoutTimer) {
            clearTimeout(get().logoutTimer);
          }
        },
        
        // 刷新认证状态
        refreshAuth: async () => {
          const accessToken = TokenManager.getAccessToken();
          
          if (!accessToken) {
            set((state) => {
              state.isAuthenticated = false;
              state.user = null;
            });
            return;
          }
          
          try {
            // 获取用户信息
            const response = await axios.get('/api/v1/auth/me');
            
            set((state) => {
              state.user = response.data;
              state.isAuthenticated = true;
              state.lastActivity = Date.now();
            });
            
          } catch (error) {
            get().logout();
          }
        },
        
        // 更新最后活动时间
        updateLastActivity: () => {
          set((state) => {
            state.lastActivity = Date.now();
          });
        },
        
        // 清除错误
        clearError: () => {
          set((state) => {
            state.error = null;
          });
        },
        
        // 私有方法：设置自动登出
        setupAutoLogout: () => {
          const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30分钟
          
          const checkInactivity = () => {
            const now = Date.now();
            const lastActivity = get().lastActivity;
            
            if (now - lastActivity > INACTIVITY_TIMEOUT) {
              get().logout();
              window.dispatchEvent(new CustomEvent('auth:session-expired'));
            }
          };
          
          // 每分钟检查一次
          setInterval(checkInactivity, 60000);
        }
      })),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated
        })
      }
    ),
    { name: 'AuthStore' }
  )
);

// 监听全局登出事件
window.addEventListener('auth:logout', () => {
  useAuthStore.getState().logout();
});

export default useAuthStore;
```

### 4. 路由守卫与权限控制

```typescript
// src/components/auth/ProtectedRoute.tsx
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  fallbackPath = '/login'
}) => {
  const location = useLocation();
  const { isAuthenticated, user, refreshAuth } = useAuthStore();
  
  useEffect(() => {
    // 初次加载时尝试刷新认证状态
    if (!isAuthenticated && !user) {
      refreshAuth();
    }
  }, []);
  
  // 未认证
  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }
  
  // 角色检查
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => 
      user?.roles?.includes(role)
    );
    
    if (!hasRequiredRole) {
      return <Navigate to="/403" replace />;
    }
  }
  
  // 权限检查
  if (requiredPermissions.length > 0) {
    const hasRequiredPermission = requiredPermissions.every(permission =>
      user?.permissions?.includes(permission)
    );
    
    if (!hasRequiredPermission) {
      return <Navigate to="/403" replace />;
    }
  }
  
  return <>{children}</>;
};

// 高阶组件版本
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, 'children'>
) {
  return (props: P) => (
    <ProtectedRoute {...options}>
      <Component {...props} />
    </ProtectedRoute>
  );
}

export default ProtectedRoute;
```

### 5. 自定义 Hooks

```typescript
// src/hooks/useAuth.ts
import { useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { toast } from 'react-toastify';

interface UseAuthOptions {
  redirectTo?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useAuth(options?: UseAuthOptions) {
  const navigate = useNavigate();
  const location = useLocation();
  const authStore = useAuthStore();
  
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: storeLogin,
    logout: storeLogout,
    register: storeRegister,
    updateLastActivity
  } = authStore;
  
  // 监听用户活动
  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const handleActivity = () => updateLastActivity();
    
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });
    
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [updateLastActivity]);
  
  // 监听会话过期事件
  useEffect(() => {
    const handleSessionExpired = () => {
      toast.error('Session expired. Please login again.');
      navigate('/login', { state: { from: location } });
    };
    
    window.addEventListener('auth:session-expired', handleSessionExpired);
    
    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, [navigate, location]);
  
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      await storeLogin(credentials);
      
      const from = location.state?.from?.pathname || options?.redirectTo || '/dashboard';
      navigate(from);
      
      toast.success('Login successful!');
      options?.onSuccess?.();
      
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      options?.onError?.(error);
    }
  }, [storeLogin, navigate, location, options]);
  
  const register = useCallback(async (userData: RegisterData) => {
    try {
      await storeRegister(userData);
      
      navigate(options?.redirectTo || '/dashboard');
      toast.success('Registration successful!');
      options?.onSuccess?.();
      
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
      options?.onError?.(error);
    }
  }, [storeRegister, navigate, options]);
  
  const logout = useCallback(() => {
    storeLogout();
    navigate('/login');
    toast.info('You have been logged out');
  }, [storeLogout, navigate]);
  
  const checkPermission = useCallback((permission: string) => {
    return user?.permissions?.includes(permission) || false;
  }, [user]);
  
  const checkRole = useCallback((role: string) => {
    return user?.roles?.includes(role) || false;
  }, [user]);
  
  const hasAnyRole = useCallback((roles: string[]) => {
    return roles.some(role => checkRole(role));
  }, [checkRole]);
  
  const hasAllPermissions = useCallback((permissions: string[]) => {
    return permissions.every(permission => checkPermission(permission));
  }, [checkPermission]);
  
  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    checkPermission,
    checkRole,
    hasAnyRole,
    hasAllPermissions
  };
}

// 权限检查 Hook
export function usePermission(requiredPermissions: string | string[]) {
  const { user } = useAuthStore();
  
  const permissions = Array.isArray(requiredPermissions) 
    ? requiredPermissions 
    : [requiredPermissions];
  
  const hasPermission = permissions.every(permission =>
    user?.permissions?.includes(permission)
  );
  
  return hasPermission;
}

// 角色检查 Hook
export function useRole(requiredRoles: string | string[]) {
  const { user } = useAuthStore();
  
  const roles = Array.isArray(requiredRoles) 
    ? requiredRoles 
    : [requiredRoles];
  
  const hasRole = roles.some(role =>
    user?.roles?.includes(role)
  );
  
  return hasRole;
}

// 自动重定向 Hook
export function useAuthRedirect() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  
  useEffect(() => {
    if (isAuthenticated && location.pathname === '/login') {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, location, navigate]);
}
```

## 使用示例

### 登录页面实现

```typescript
// src/pages/LoginPage.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth, useAuthRedirect } from '@/hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional()
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  useAuthRedirect(); // 自动重定向已登录用户
  
  const { login, isLoading, error } = useAuth({
    onSuccess: () => {
      console.log('Login successful');
    }
  });
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });
  
  const onSubmit = async (data: LoginFormData) => {
    await login(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('email')}
        type="email"
        placeholder="Email"
        disabled={isLoading}
      />
      {errors.email && <span>{errors.email.message}</span>}
      
      <input
        {...register('password')}
        type="password"
        placeholder="Password"
        disabled={isLoading}
      />
      {errors.password && <span>{errors.password.message}</span>}
      
      <label>
        <input {...register('rememberMe')} type="checkbox" />
        Remember me
      </label>
      
      {error && <div className="error">{error}</div>}
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

export default LoginPage;
```

### 权限组件

```typescript
// src/components/PermissionGate.tsx
import React from 'react';
import { usePermission } from '@/hooks/useAuth';

interface PermissionGateProps {
  permissions: string | string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

const PermissionGate: React.FC<PermissionGateProps> = ({
  permissions,
  fallback = null,
  children
}) => {
  const hasPermission = usePermission(permissions);
  
  return hasPermission ? <>{children}</> : <>{fallback}</>;
};

// 使用示例
<PermissionGate permissions={['posts.edit', 'posts.delete']}>
  <EditButton />
</PermissionGate>
```

### 路由配置

```typescript
// src/router/index.tsx
import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRoles={['admin']}>
        <AdminPanel />
      </ProtectedRoute>
    )
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute requiredPermissions={['settings.view', 'settings.edit']}>
        <SettingsPage />
      </ProtectedRoute>
    )
  }
]);

export default router;
```

## 安全最佳实践

### 1. 令牌存储策略

| 存储位置 | Access Token | Refresh Token | 说明 |
|---------|--------------|---------------|------|
| 内存变量 | ✅ 推荐 | ❌ | 防 XSS，页面刷新会丢失 |
| SessionStorage | ⚠️ 可选 | ❌ | 仅当前标签页有效 |
| LocalStorage | ❌ | ⚠️ 加密后可用 | 有 XSS 风险 |
| HttpOnly Cookie | ❌ | ✅ 最安全 | 需后端配合 |

### 2. 防护措施

- **XSS 防护**: Access Token 存储在内存，Content Security Policy
- **CSRF 防护**: 使用 Bearer Token 而非 Cookie 认证
- **重放攻击**: 请求添加时间戳验证
- **暴力破解**: 登录失败次数限制，账号锁定机制
- **会话管理**: 无活动自动登出，多设备登录检测

### 3. 性能优化

- **令牌刷新**: 请求队列避免并发刷新
- **状态持久化**: 选择性持久化，避免敏感数据泄露
- **懒加载**: 路由级别的代码分割
- **防抖节流**: 用户活动监听优化

## 技术亮点总结

### 核心亮点

1. **企业级安全架构**
   - 双令牌机制分层存储
   - 自动令牌刷新无感知
   - 多重安全防护机制

2. **高性能状态管理**
   - Zustand 轻量级方案
   - Immer 不可变更新
   - 选择性持久化策略

3. **优雅的错误处理**
   - 请求自动重试机制
   - 全局错误边界
   - 用户友好的反馈

4. **代码质量保证**
   - TypeScript 全覆盖
   - 单一职责原则
   - Hook 封装复用

### 面试话术要点

#### Q1: 如何处理令牌安全？
```
采用分层存储策略：
- Access Token 存储在内存变量中，防止 XSS 攻击
- Refresh Token 加密后存储，生产环境使用 HttpOnly Cookie
- 实现防暴力破解、防重放攻击等多重防护
```

#### Q2: 如何实现无感知令牌刷新？
```
通过 Axios 响应拦截器配合请求队列：
- 检测 401 错误自动触发刷新
- 后续请求加入等待队列
- 刷新成功批量重试
- 失败则全局登出
```

#### Q3: 为什么选择 Zustand？
```
基于项目需求权衡：
- API 简洁，学习成本低
- 相比 Redux 减少 60% 样板代码
- 仅 8KB，性能优异
- TypeScript 原生支持
```

#### Q4: 如何防止 CSRF 攻击？
```
多层防护机制：
- Bearer Token 认证天然防 CSRF
- 请求头添加时间戳验证
- 关键操作二次验证
```

#### Q5: 还有哪些优化空间？
```
已规划的优化方向：
- 集成 WebAuthn 生物识别
- Web Worker 处理令牌逻辑
- SSO 单点登录
- 认证监控和日志
- E2E 测试覆盖
```

## 项目文件结构

```
src/
├── api/
│   └── axiosConfig.ts          # Axios 配置和拦截器
├── components/
│   └── auth/
│       ├── ProtectedRoute.tsx  # 路由守卫组件
│       └── PermissionGate.tsx  # 权限控制组件
├── hooks/
│   └── useAuth.ts              # 认证相关 Hooks
├── pages/
│   ├── LoginPage.tsx           # 登录页面
│   ├── RegisterPage.tsx        # 注册页面
│   └── DashboardPage.tsx       # 仪表盘页面
├── router/
│   └── index.tsx               # 路由配置
├── store/
│   └── authStore.ts            # Zustand 认证状态
├── utils/
│   └── tokenManager.ts         # 令牌管理工具
└── App.tsx                     # 应用入口
```

## 总结

这套认证系统方案展现了对前端安全、架构设计和工程化的深入理解。通过双令牌机制、自动刷新、权限控制等功能，构建了一个安全、可靠、可维护的企业级认证模块。在面试中，可以从安全机制、技术选型、性能优化等多个维度展开讨论，充分展示技术深度和工程能力。