import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthTabs from './components/AuthTabs';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import type { LoginFormData, RegisterFormData } from './utils/validation';
import { useAuthStore } from '../../stores/authStore';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  
  // 根据路径设置默认tab
  const defaultTab = location.pathname === '/register' ? 'register' : 'login';
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);
  
  // 获取重定向路径
  const from = location.state?.from || '/dashboard';
  
  // 初始化时检查是否有记住的邮箱
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberEmail');
    if (rememberedEmail) {
      console.log('找到记住的邮箱:', rememberedEmail);
    }
  }, []);

  // 登录处理逻辑
  const handleLogin = async (data: LoginFormData) => {
    console.log('登录数据:', data);
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (data.email === 'test@example.com' && data.password === 'Test123!') {
          console.log('登录成功！');
          localStorage.setItem('authToken', 'mock-jwt-token');
          localStorage.setItem('userEmail', data.email);
          
          if (data.rememberMe) {
            localStorage.setItem('rememberEmail', data.email);
          } else {
            localStorage.removeItem('rememberEmail');
          }
          login(
            { 
              id: 'user-123', 
              username: 'testuser', 
              email: data.email 
            },
            'mock-jwt-token'
          );
          alert('登录成功！欢迎回来！');
          navigate(from, { replace: true });
          resolve();
        } else {
          console.error('登录失败：邮箱或密码错误');
          reject(new Error('邮箱或密码错误'));
        }
      }, 1500);
    });
  };

  const handleRegister = async (data: RegisterFormData) => {
    console.log('注册数据:', data);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log('注册成功！');
        alert(`注册成功！欢迎加入 AlgoCollab，${data.username}！\n\n请使用您的邮箱地址登录。`);
        switchToLogin()
        resolve();
      }, 500);
    });
  };

  const handleForgotPassword = () => {
    console.log('忘记密码');
    const email = prompt('请输入您的注册邮箱地址：');
    if (email) {
      console.log(`发送重置邮件到: ${email}`);
      setTimeout(() => {
        alert(`重置密码链接已发送到 ${email}\n\n请查看您的邮箱并按照邮件中的说明重置密码。`);
      }, 1000);
    }
  };

  const switchToLogin = () => {
    setActiveTab('login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AlgoCollab</h1>
          <p className="text-gray-600 mt-2">算法协作学习平台</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6">
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