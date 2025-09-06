import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface PublicGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * 公共路由守卫 - 用于登录、注册等页面
 * 已登录用户访问这些页面会被重定向到首页
 */
const PublicGuard: React.FC<PublicGuardProps> = ({ 
  children, 
  redirectTo = '/dashboard' 
}) => {
  const { isAuthenticated } = useAuthStore();
  
  // 已登录用户重定向到首页
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  
  return <>{children}</>;
};

export default PublicGuard;