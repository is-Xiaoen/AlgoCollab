import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthTabs from './components/AuthTabs';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import type { LoginFormData, RegisterFormData } from './utils/validation';
import { useAuthStore } from '../../stores/authStore';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isAuthenticated, error, clearError } = useAuthStore();
  
  // 根据路径设置默认tab
  const defaultTab = location.pathname === '/register' ? 'register' : 'login';
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);
  
  // 获取重定向路径
  const from = location.state?.from || '/home';
  
  // 如果已登录，重定向
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);
  
  // 切换Tab时清除错误
  useEffect(() => {
    clearError();
  }, [activeTab, clearError]);

  // 登录处理逻辑
  const handleLogin = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password, data.rememberMe);
      // 登录成功后会通过useEffect自动跳转
    } catch (error: any) {
      console.error('登录失败:', error);
      // 错误信息已经在store中设置
    }
  };

  // 注册处理逻辑
  const handleRegister = async (data: RegisterFormData) => {
    try {
      await register(data.username, data.email, data.password);
      // 注册成功后自动登录并跳转
    } catch (error: any) {
      console.error('注册失败:', error);
      // 错误信息已经在store中设置
    }
  };

  // TODO(human): 实现忘记密码功能
  // 提示：调用authService.requestPasswordReset
  const handleForgotPassword = () => {
    console.log('忘记密码');
    const email = prompt('请输入您的注册邮箱地址：');
    if (email) {
      console.log(`发送重置邮件到: ${email}`);
      // 调用密码重置API
      alert(`重置密码链接已发送到 ${email}\n\n请查看您的邮箱并按照邮件中的说明重置密码。`);
    }
  };

  const switchToLogin = () => {
    setActiveTab('login');
    clearError();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AlgoCollab</h1>
          <p className="text-gray-600 mt-2">算法协作学习平台</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8" >
          {/* 全局错误提示 */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          <AuthTabs 
            defaultTab={activeTab}
            onTabChange={setActiveTab}
            showIndicator={false}
            showProgress={false}
            animationDirection="horizontal"
            variant="underline"
            iconType="emoji"
          >
            {{
              login: (
                <LoginForm 
                  onSubmit={handleLogin}
                  onForgotPassword={handleForgotPassword}
                />
              ),
              register: (
                <RegisterForm 
                  onSubmit={handleRegister}
                  onLoginClick={switchToLogin}
                />
              )
            }}
          </AuthTabs>
        </div>
        <div className="text-center mt-8 space-y-2">
          <div className="text-sm text-gray-600">
            <span>© 2025 AlgoCollab. All rights reserved.</span>
            <span className="mx-2">|</span>
            <button 
              className="text-blue-600 hover:text-blue-500 transition-colors"
              onClick={() => alert('帮助中心')}
            >
              帮助中心
            </button>
            <span className="mx-2">|</span>
            <button 
              className="text-blue-600 hover:text-blue-500 transition-colors"
              onClick={() => alert('联系我们: support@algocollab.com')}
            >
              联系我们
            </button>
          </div>
          
          <div className="flex items-center justify-center text-xs text-gray-500">
            <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>安全加密连接 · 您的数据已受保护</span>
          </div>
        </div>
      </div>

      {/* 扩展学习任务：
          TODO(human): 实现以下高级功能
          1. 添加背景动画效果（粒子效果、渐变动画等）
          2. 实现深色模式切换
          3. 添加国际化支持（中英文切换）
          4. 集成第三方登录（OAuth）
          5. 添加登录/注册成功的过渡动画
          6. 实现记住用户名功能
          7. 添加安全提示（密码强度、账号安全等）
      */}
    </div>
  );
};

export default AuthPage;