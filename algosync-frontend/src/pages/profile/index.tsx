import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import Breadcrumb from '../../components/common/Breadcrumb';

interface ProfilePageProps {
  onLogout: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onLogout }) => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'achievements' | 'settings'>('profile');

  const achievements = [
    { id: 1, title: '初学者', description: '完成第一道题目', icon: '🎯', unlocked: true },
    { id: 2, title: '坚持不懈', description: '连续7天打卡', icon: '🔥', unlocked: true },
    { id: 3, title: '算法新手', description: '完成10道题目', icon: '⭐', unlocked: true },
    { id: 4, title: '算法达人', description: '完成50道题目', icon: '🏆', unlocked: false },
    { id: 5, title: '算法大师', description: '完成100道题目', icon: '👑', unlocked: false },
    { id: 6, title: '团队协作', description: '参与10个房间', icon: '🤝', unlocked: false }
  ];

  const stats = [
    { label: '总题数', value: 45 },
    { label: '简单', value: 20, color: 'text-green-600' },
    { label: '中等', value: 18, color: 'text-yellow-600' },
    { label: '困难', value: 7, color: 'text-red-600' }
  ];

  const breadcrumbItems = [
    { label: '首页', href: '/home' },
    { label: '个人中心', active: true }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Breadcrumb items={breadcrumbItems} className="mb-4" />
      
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-12">
            <div className="flex items-end space-x-4">
              <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <span className="text-3xl font-bold text-gray-700">
                  {(user?.username || user?.email || 'U')[0].toUpperCase()}
                </span>
              </div>
              <div className="mb-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {user?.username || user?.email || '用户'}
                </h2>
                <p className="text-gray-600">算法爱好者</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="mt-4 sm:mt-0 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              退出登录
            </button>
          </div>
        </div>

        <div className="border-t px-6">
          <div className="flex space-x-8">
            {[
              { key: 'profile', label: '个人信息' },
              { key: 'achievements', label: '成就' },
              { key: 'settings', label: '设置' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`py-3 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">用户名</label>
                <p className="text-gray-900 font-medium">{user?.username || '未设置'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">邮箱</label>
                <p className="text-gray-900 font-medium">{user?.email || '未设置'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">注册时间</label>
                <p className="text-gray-900 font-medium">2025年1月1日</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">个人简介</label>
                <p className="text-gray-900 font-medium">热爱算法，追求极致的代码效率</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">练习统计</h3>
            <div className="space-y-4">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-600">{stat.label}</span>
                  <span className={`text-xl font-bold ${stat.color || 'text-gray-900'}`}>
                    {stat.value}
                  </span>
                </div>
              ))}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">完成进度</span>
                  <span className="text-sm font-medium text-gray-900">22.5%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '22.5%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">最近活动</h3>
            <div className="space-y-3">
              {[1].map((item) => (
                <div key={item} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">完成了"两数之和"题目</p>
                    <p className="text-xs text-gray-500">2小时前</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">我的成就</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border-2 ${
                  achievement.unlocked
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-gray-200 bg-gray-50 opacity-50'
                }`}
              >
                <div className="text-3xl mb-2">{achievement.icon}</div>
                <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                {achievement.unlocked && (
                  <span className="inline-block mt-2 text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                    已解锁
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">账号设置</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                修改密码
              </label>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                更改密码
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                通知设置
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700">接收练习提醒</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700">接收房间邀请</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                隐私设置
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                <span className="ml-2 text-sm text-gray-700">公开个人资料</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;