import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  fallbackPath?: string;
  loadingComponent?: React.ReactNode;
}

/**
 * 路由守卫组件
 * 用于保护需要认证的路由
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  fallbackPath = '/login',
  loadingComponent = <div>Loading...</div>
}) => {
  const location = useLocation();
  const { 
    isAuthenticated, 
    user, 
    isLoading,
  } = useAuthStore();
  // TODO(human): 实现加载状态的优雅展示
  // 提示：创建一个专门的LoadingSpinner组件
  // 要求：
  // 1. 显示加载动画
  // 2. 可配置加载文字
  // 3. 支持全屏或局部加载
  if (isLoading) {
    return <>{loadingComponent}</>;
  }

  // 未认证，重定向到登录页
  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // 角色检查
  if (requiredRoles.length > 0 && user) {
    const userRole = user.role || '';
    const hasRequiredRole = requiredRoles.some(role => 
      userRole === role || userRole === 'admin' // admin拥有所有权限
    );
    
    if (!hasRequiredRole) {
      // TODO(human): 实现403权限不足页面
      // 提示：创建一个ForbiddenPage组件显示权限不足信息
      return <Navigate to="/403" replace />;
    }
  }

  // // 权限检查
  // if (requiredPermissions.length > 0 && user) {
  //   const userPermissions = user.permissions || [];
  //   const hasAllPermissions = requiredPermissions.every(permission =>
  //     userPermissions.includes(permission)
  //   );
    
  //   if (!hasAllPermissions) {
  //     return <Navigate to="/403" replace />;
  //   }
  // }

  // TODO(human): 实现路由切换动画
  // 提示：使用React Transition Group或Framer Motion
  // 要求：
  // 1. 页面切换时有淡入淡出效果
  // 2. 可配置动画类型
  // 3. 支持禁用动画

  return <>{children}</>;
};

/**
 * 高阶组件版本
 * 用于装饰需要保护的组件
 */
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

/**
 * TODO(human): 实现基于路由的权限配置
 * 功能：集中管理路由权限配置
 * 示例：
 * export const routePermissions = {
 *   '/admin': { requiredRoles: ['admin'] },
 *   '/settings': { requiredPermissions: ['settings.view'] },
 *   '/profile': { requiredRoles: ['user', 'admin'] }
 * };
 * 
 * export function useRoutePermission(path: string) {
 *   // 根据路径获取权限配置
 * }
 */

export default ProtectedRoute;