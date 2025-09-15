import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import authService from '../services/auth';
import type { IUser } from '../services/auth/types';
import tokenManager from '../utils/tokenManager';

interface User extends IUser {
  // 扩展用户类型（如果需要）
}

interface AuthState {
  // 状态
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  loginAttempts: number;
  lastActivity: number;
  
  // 操作
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  checkAuth: () => Promise<boolean>;
  refreshAuth: () => Promise<void>;
  updateLastActivity: () => void;
  clearError: () => void;
  
  // TODO(human): 实现会话管理
  // 添加以下方法：
  // setupInactivityTimer: () => void;
  // resetInactivityTimer: () => void;
  // handleInactiveLogout: () => void;
}

// 无活动超时时间（30分钟）
const INACTIVITY_TIMEOUT = 30 * 60 * 1000;

// 最大登录尝试次数
const MAX_LOGIN_ATTEMPTS = 5;

// 创建认证 store，使用 persist 和 immer 中间件
export const useAuthStore = create<AuthState>()(
  persist(
    immer((set, get) => ({
      // 初始状态
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      loginAttempts: 0,
      lastActivity: Date.now(),
      
      // 登录操作
      login: async (email: string, password: string, rememberMe = false) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });
        
        try {
          // 检查登录尝试次数
          if (get().loginAttempts >= MAX_LOGIN_ATTEMPTS) {
            throw new Error('登录尝试次数过多，请稍后再试');
          }
          
          // 调用登录API
          const response = await authService.login(email, password);
          
          if (response.data) {
            const { user } = response.data;
            
            set((state) => {
              state.user = user;
              state.isAuthenticated = true;
              state.loginAttempts = 0;
              state.lastActivity = Date.now();
              state.isLoading = false;
            });
            
            // TODO(human): 实现记住我功能
            // 提示：根据rememberMe参数决定token存储策略
            // if (rememberMe) {
            //   // 长期存储
            // } else {
            //   // 会话存储
            // }
          }
        } catch (error: any) {
          set((state) => {
            state.error = error.response?.data?.message || error.message || '登录失败';
            state.loginAttempts += 1;
            state.isLoading = false;
          });
          throw error;
        }
      },
      
      // 注册操作
      register: async (username: string, email: string, password: string) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });
        
        try {
          const response = await authService.register({ username, email, password });
          
          if (response.data) {
            const { user } = response.data;
            
            set((state) => {
              state.user = user;
              state.isAuthenticated = true;
              state.lastActivity = Date.now();
              state.isLoading = false;
            });
          }
        } catch (error: any) {
          set((state) => {
            state.error = error.response?.data?.message || error.message || '注册失败';
            state.isLoading = false;
          });
          throw error;
        }
      },
      
      // 登出操作
      logout: async () => {
        try {
          await authService.logout();
        } finally {
          set((state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;
            state.loginAttempts = 0;
          });
        }
      },
      
      // 更新用户信息
      updateUser: (updatedUser) => {
        set((state) => {
          if (state.user) {
            Object.assign(state.user, updatedUser);
          }
        });
      },
      
      // 设置加载状态
      setLoading: (loading) => {
        set((state) => {
          state.isLoading = loading;
        });
      },
      
      // 设置错误信息
      setError: (error) => {
        set((state) => {
          state.error = error;
        });
      },
      
      // 清除错误
      clearError: () => {
        set((state) => {
          state.error = null;
        });
      },
      
      // 检查认证状态
      checkAuth: async () => {
        try {
          // 检查本地token
          if (!tokenManager.isAuthenticated()) {
            return false;
          }
          
          // 验证token有效性
          const isValid = await authService.validateToken();
          if (!isValid) {
            get().logout();
            return false;
          }
          
          return true;
        } catch {
          return false;
        }
      },
      
      // 刷新认证状态
      refreshAuth: async () => {
        const isAuthenticated = tokenManager.isAuthenticated();
        
        if (!isAuthenticated) {
          set((state) => {
            state.isAuthenticated = false;
            state.user = null;
          });
          return;
        }
        
        try {
          // 获取最新的用户信息
          const user = await authService.getCurrentUser();
          
          set((state) => {
            state.user = user;
            state.isAuthenticated = true;
            state.lastActivity = Date.now();
          });
        } catch (error) {
          console.error('Failed to refresh auth:', error);
          get().logout();
        }
      },
      
      // 更新最后活动时间
      updateLastActivity: () => {
        set((state) => {
          state.lastActivity = Date.now();
        });
        
        // TODO(human): 重置无活动定时器
        // 提示：调用 resetInactivityTimer 方法
      },
      
      // TODO(human): 实现无活动自动登出
      // setupInactivityTimer: () => {
      //   // 设置定时器，检查无活动时间
      // },
      // 
      // resetInactivityTimer: () => {
      //   // 重置定时器
      // },
      // 
      // handleInactiveLogout: () => {
      //   // 处理无活动登出
      // },
    })),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        lastActivity: state.lastActivity,
      }),
      onRehydrateStorage: () => (state) => {
        // 存储恢复后的处理
        if (state) {
          // TODO(human): 实现自动刷新认证
          // 提示：如果有token，尝试刷新用户信息
          // state.refreshAuth();
        }
      },
    }
  )
);

// 初始化认证系统
export const initializeAuth = async () => {
  const store = useAuthStore.getState();
  
  // 检查并刷新认证状态
  await store.refreshAuth();
  
  // 监听全局登出事件
  window.addEventListener('auth:logout', () => {
    store.logout();
  });
  
  // 监听权限错误事件
  window.addEventListener('auth:forbidden', (event: any) => {
    console.error('权限错误:', event.detail?.message);
    // TODO(human): 实现权限错误提示
    // 提示：显示toast或弹窗提醒用户
  });
  
  // TODO(human): 实现活动监听
  // 提示：监听用户鼠标、键盘活动，更新lastActivity
  // const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
  // events.forEach(event => {
  //   window.addEventListener(event, store.updateLastActivity);
  // });
};

// TODO(human): 实现会话过期检查
// 功能：定期检查会话是否过期
// export const startSessionMonitor = () => {
//   setInterval(() => {
//     const { lastActivity, isAuthenticated } = useAuthStore.getState();
//     if (isAuthenticated && Date.now() - lastActivity > INACTIVITY_TIMEOUT) {
//       // 会话过期，自动登出
//       useAuthStore.getState().logout();
//       window.dispatchEvent(new CustomEvent('auth:session-expired'));
//     }
//   }, 60000); // 每分钟检查一次
// };