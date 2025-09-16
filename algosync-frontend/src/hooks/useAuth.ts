import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface UseAuthOptions {
  redirectTo?: string;
  requireAuth?: boolean;
  requiredRoles?: string[];
  requiredPermissions?: string[];
}

/**
 * 认证相关的自定义Hook
 * 提供认证状态和操作的便捷访问
 */
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
    updateLastActivity,
    clearError
  } = authStore;

  // TODO(human): 实现自动活动监听
  // 功能：监听用户活动并更新最后活动时间
  // 要求：
  // 1. 监听鼠标、键盘、触摸事件
  // 2. 使用防抖减少更新频率
  // 3. 组件卸载时清理监听器
  useEffect(() => {
    // const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    // const handleActivity = debounce(() => updateLastActivity(), 5000);
    // 
    // events.forEach(event => {
    //   window.addEventListener(event, handleActivity);
    // });
    // 
    // return () => {
    //   events.forEach(event => {
    //     window.removeEventListener(event, handleActivity);
    //   });
    // };
  }, [updateLastActivity]);

  // 监听会话过期事件
  useEffect(() => {
    const handleSessionExpired = () => {
      console.log('会话已过期，请重新登录');
      navigate('/login', { state: { from: location } });
    };
    
    window.addEventListener('auth:session-expired', handleSessionExpired);
    
    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, [navigate, location]);

  // 检查权限要求
  useEffect(() => {
    if (options?.requireAuth && !isAuthenticated && !isLoading) {
      navigate('/login', { state: { from: location } });
    }
  }, [options?.requireAuth, isAuthenticated, isLoading, navigate, location]);

  /**
   * 增强的登录方法
   */
  const login = useCallback(async (
    email: string, 
    password: string, 
  ) => {
    try {
      await storeLogin(email, password);
      
      // 登录成功后跳转
      const from = location.state?.from?.pathname || options?.redirectTo || '/dashboard';
      navigate(from);
      
      return { success: true };
    } catch (error: any) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        error: error.message || '登录失败' 
      };
    }
  }, [storeLogin, navigate, location, options?.redirectTo]);

  /**
   * 增强的注册方法
   */
  const register = useCallback(async (
    username: string,
    email: string, 
    password: string
  ) => {
    try {
      await storeRegister(username, email, password);
      
      // 注册成功后跳转
      navigate(options?.redirectTo || '/dashboard');
      
      return { success: true };
    } catch (error: any) {
      console.error('Registration failed:', error);
      return { 
        success: false, 
        error: error.message || '注册失败' 
      };
    }
  }, [storeRegister, navigate, options?.redirectTo]);

  /**
   * 增强的登出方法
   */
  const logout = useCallback(async () => {
    await storeLogout();
    navigate('/login');
  }, [storeLogout, navigate]);


  /**
   * 检查用户角色
   */
  const checkRole = useCallback((role: string) => {
    if (!user?.role) return false;
    return user.role === role || user.role === 'admin';
  }, [user]);

  /**
   * 检查是否有任意一个角色
   */
  const hasAnyRole = useCallback((roles: string[]) => {
    return roles.some(role => checkRole(role));
  }, [checkRole]);


  // TODO(human): 实现权限守卫装饰器
  // 功能：为方法添加权限检查
  // 示例：
  // const guardedAction = usePermissionGuard(
  //   () => console.log('执行敏感操作'),
  //   ['admin.write']
  // );

  /**
   * 计算用户显示名称
   */
  const displayName = useMemo(() => {
    if (!user) return '';
    return user.username || user.email?.split('@')[0] || 'User';
  }, [user]);

  /**
   * 计算用户头像URL
   */
  const avatarUrl = useMemo(() => {
    if (!user) return '';
    // 安全访问avatar字段，因为并非所有User类型都有avatar
    const avatar = 'avatar' in user ? user.avatar : undefined;
    return avatar || `https://ui-avatars.com/api/?name=${displayName}&background=random`;
  }, [user, displayName]);

  return {
    // 状态
    user,
    isAuthenticated,
    isLoading,
    error,
    displayName,
    avatarUrl,
    
    // 操作
    login,
    register,
    logout,
    clearError,
    
    // 权限检查
    checkRole,
    hasAnyRole,
  };
}



/**
 * Hook：检查角色
 */
export function useRole(role: string): boolean {
  const { checkRole } = useAuth();
  return checkRole(role);
}

/**
 * Hook：自动重定向已登录用户
 */
export function useAuthRedirect(redirectTo = '/dashboard') {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);
}

/**
 * TODO(human): 实现认证状态持久化Hook
 * 功能：在页面刷新时恢复认证状态
 * export function useAuthPersistence() {
 *   // 1. 检查localStorage中的token
 *   // 2. 验证token有效性
 *   // 3. 恢复用户信息
 *   // 4. 设置自动刷新
 * }
 */

/**
 * TODO(human): 实现社交登录Hook
 * 功能：支持第三方OAuth登录
 * export function useSocialAuth(provider: 'google' | 'github' | 'wechat') {
 *   // 1. 初始化OAuth流程
 *   // 2. 处理回调
 *   // 3. 交换token
 *   // 4. 获取用户信息
 * }
 */