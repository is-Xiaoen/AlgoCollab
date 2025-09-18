import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import authService from '../services/auth';
import type { IUser, IRegisterUser, IUserInfo } from '../services/auth/types';
import tokenManager from '../utils/tokenManager';

type User = (IRegisterUser | IUser | IUserInfo) & {
  user_id?: number; // 兼容字段
};

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  loginAttempts: number;
  lastActivity: number;

  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  refreshAuth: () => Promise<void>;
  updateLastActivity: () => void;
  clearError: () => void;

  // 会话管理
  setupInactivityTimer: () => void;
  resetInactivityTimer: () => void;
  handleInactiveLogout: () => void;
}

// 无活动超时时间（30分钟）
const INACTIVITY_TIMEOUT = 30 * 60 * 1000;

// 最大登录尝试次数
const MAX_LOGIN_ATTEMPTS = 5;

let inactivityTimer: NodeJS.Timeout | null = null;

export const useAuthStore = create<AuthState>()(
  persist(
    immer((set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      loginAttempts: 0,
      lastActivity: Date.now(),

      // 登录
      login: async (email: string, password: string) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });
        try {
          if (get().loginAttempts >= MAX_LOGIN_ATTEMPTS) {
            throw new Error('登录尝试次数过多，请稍后再试');
          }
          const { user, tokens } = await authService.login(email, password);
          tokenManager.setTokenPair(tokens.accessToken, tokens.refreshToken);
          set((state) => {
            state.user = user as User;
            state.isAuthenticated = true;
            state.loginAttempts = 0;
            state.lastActivity = Date.now();
            state.isLoading = false;
          });
          get().setupInactivityTimer();
        } catch (error: any) {
          set((state) => {
            state.error = error.response?.data?.message || error.message || '登录失败';
            state.loginAttempts += 1;
            state.isLoading = false;
          });
          throw error;
        }
      },

      // 注册
      register: async (username: string, email: string, password: string) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });
        try {
          const { user, tokens } = await authService.register({ username, email, password });
          tokenManager.setTokenPair(tokens.accessToken, tokens.refreshToken);
          set((state) => {
            state.user = user as User;
            state.isAuthenticated = true;
            state.lastActivity = Date.now();
            state.isLoading = false;
          });
          get().setupInactivityTimer();
        } catch (error: any) {
          set((state) => {
            state.error = error.response?.data?.message || error.message || '注册失败';
            state.isLoading = false;
          });
          throw error;
        }
      },

      // 登出 
      logout: async () => {
        try {
          await authService.logout();
        } finally {
          tokenManager.clearAll();
          if (inactivityTimer) {
            clearTimeout(inactivityTimer);
            inactivityTimer = null;
          }
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

      setLoading: (loading) => {
        set((state) => {
          state.isLoading = loading;
        });
      },

      setError: (error) => {
        set((state) => {
          state.error = error;
        });
      },

      clearError: () => {
        set((state) => {
          state.error = null;
        });
      },

      // 重新获取用户信息
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
        get().resetInactivityTimer();
      },

      setupInactivityTimer: () => {
        if (inactivityTimer) {
          clearTimeout(inactivityTimer);
          inactivityTimer = null;
        }

        const { isAuthenticated } = get();
        if (!isAuthenticated) return;

        inactivityTimer = setTimeout(() => {
          get().handleInactiveLogout();
        }, INACTIVITY_TIMEOUT);
      },

      resetInactivityTimer: () => {
        get().setupInactivityTimer();
      },

      handleInactiveLogout: () => {
        if (inactivityTimer) {
          clearTimeout(inactivityTimer);
          inactivityTimer = null;
        }
        get().logout();
        window.dispatchEvent(new CustomEvent('auth:session-expired', {
          detail: { message: '会话已过期，请重新登录' }
        }));
      },
    })),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        lastActivity: state.lastActivity,
      }),
      onRehydrateStorage: () => (state) => {
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
  const refreshApiFunction = async (refreshToken: string) => {
    try {
      return await authService.refreshToken(refreshToken);
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  };

  // 重写tokenManager的自动刷新逻辑
  const originalScheduleRefresh = (tokenManager as any).scheduleRefresh?.bind(tokenManager);
  if (originalScheduleRefresh) {
    (tokenManager as any).scheduleRefresh = (accessToken: string) => {
      const remainingTime = (tokenManager as any).getTokenRemainingTime?.(accessToken) || 0;
      if (remainingTime <= 0) return;

      const refreshTime = Math.min(
        remainingTime * 0.8,
        remainingTime - 10 * 60 * 1000
      );

      if (refreshTime > 0) {
        setTimeout(() => {
          tokenManager.refreshToken(refreshApiFunction);
        }, refreshTime);
      }
    };
  }

  // 检查并刷新认证状态
  await store.refreshAuth();

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