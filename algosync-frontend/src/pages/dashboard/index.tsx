import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">AlgoCollab</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                欢迎回来，{user?.username || user?.email || '用户'}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">仪表板</h2>
          
          {/* 用户信息卡片 */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">用户信息</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">用户名：</span>{user?.username || '未设置'}</p>
              <p><span className="font-medium">邮箱：</span>{user?.email || '未设置'}</p>
              <p><span className="font-medium">用户ID：</span>{user?.id || '未设置'}</p>
            </div>
          </div>
          
          {/* 快速导航 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              onClick={() => navigate('/profile')}
              className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
            >
              <svg className="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <h3 className="text-lg font-semibold">个人资料</h3>
              <p className="text-sm opacity-90">管理您的个人信息</p>
            </div>
            
            <div 
              onClick={() => navigate('/settings')}
              className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
            >
              <svg className="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              <h3 className="text-lg font-semibold">设置</h3>
              <p className="text-sm opacity-90">自定义您的偏好</p>
            </div>
            
            <div className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg cursor-pointer hover:shadow-lg transition-shadow">
              <svg className="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 100 4h2a2 2 0 100 4h2a1 1 0 100 2 2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2z" clipRule="evenodd" />
              </svg>
              <h3 className="text-lg font-semibold">算法练习</h3>
              <p className="text-sm opacity-90">开始您的学习之旅</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;