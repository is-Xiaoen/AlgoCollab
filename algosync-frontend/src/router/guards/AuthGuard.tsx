import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * 路由守卫组件
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireAuth = true,
  redirectTo = '/login' 
}) => {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuthStore();
 
  
  // 加载中状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg 
            className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-gray-600">验证身份中...</p>
        </div>
      </div>
    );
  }
  
  // 需要认证但未登录
  if (requireAuth && !isAuthenticated) {
    // 保存当前路径，登录后可以跳转回来
    const from = location.pathname + location.search;
    return <Navigate to={redirectTo} state={{ from }} replace />;
  }
  
  // 已登录但访问登录页，重定向到首页
  if (!requireAuth && isAuthenticated) {
    const from = location.state?.from || '/home';
    return <Navigate to={from} replace />;
  }
  
  // 验证通过，渲染子组件
  return <>{children}</>;
};

export default AuthGuard;