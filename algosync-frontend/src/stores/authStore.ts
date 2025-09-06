import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

interface AuthState {
  // 状态
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // 操作
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  checkAuth: () => boolean;
}

// 创建认证 store，使用 persist 中间件持久化
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      
      // 登录操作
      login: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
        
        // 可选：设置 axios 默认 header
        // axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      },
      
      // 登出操作
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        
        // 清除本地存储
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        
        // 清除 axios header
        // delete axios.defaults.headers.common['Authorization'];
      },
      
      // 更新用户信息
      updateUser: (updatedUser) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : null,
        }));
      },
      
      // 设置加载状态
      setLoading: (loading) => {
        set({ isLoading: loading });
      },
      
      // 检查认证状态
      checkAuth: () => {
        const state = get();
        return state.isAuthenticated && !!state.token;
      },
    }),
    {
      name: 'auth-storage', // localStorage 的 key
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// 初始化函数：应用启动时检查认证状态
export const initializeAuth = () => {
  const { token, user, isAuthenticated } = useAuthStore.getState();
  
  if (token && user && isAuthenticated) {
    // 设置 axios 默认 header
    // axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // 可选：验证 token 是否过期
    // validateToken(token).catch(() => {
    //   useAuthStore.getState().logout();
    // });
  }
};