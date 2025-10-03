import React, { useState } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';

interface Room {
  id: string;
  name: string;
  description: string;
  members: number;
  maxMembers: number;
  status: 'waiting' | 'in-progress' | 'completed';
  difficulty: 'easy' | 'medium' | 'hard';
  host: string;
  createdAt: string;
}

const RoomPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'waiting' | 'in-progress'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const rooms: Room[] = [
    {
      id: '1',
      name: '算法竞赛训练',
      description: '一起刷LeetCode中等难度题目',
      members: 3,
      maxMembers: 5,
      status: 'waiting',
      difficulty: 'medium',
      host: 'Alice',
      createdAt: '10分钟前'
    },
    {
      id: '2',
      name: '数据结构基础',
      description: '复习基础数据结构，适合初学者',
      members: 2,
      maxMembers: 4,
      status: 'in-progress',
      difficulty: 'easy',
      host: 'Bob',
      createdAt: '30分钟前'
    },
    {
      id: '3',
      name: '动态规划专题',
      description: '深入学习DP算法',
      members: 4,
      maxMembers: 6,
      status: 'waiting',
      difficulty: 'hard',
      host: 'Charlie',
      createdAt: '1小时前'
    }
  ];

  const getStatusColor = (status: Room['status']) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-100 text-yellow-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
    }
  };

  const getDifficultyColor = (difficulty: Room['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
    }
  };

  const breadcrumbItems = [
    { label: '首页', href: '/home' },
    { label: '协作房间', active: true }
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} className="mb-4" />
      
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">协作房间</h2>
            <p className="text-gray-600 mt-1">加入房间，与他人一起学习算法</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-shadow flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>创建房间</span>
          </button>
        </div>

        <div className="mt-6 flex space-x-4">
          {[
            { key: 'all', label: '全部房间' },
            { key: 'waiting', label: '等待中' },
            { key: 'in-progress', label: '进行中' }
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key as typeof activeFilter)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                activeFilter === filter.key
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <p className="text-blue-100 text-sm">在线房间</p>
          <p className="text-2xl font-bold">12</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
          <p className="text-green-100 text-sm">在线用户</p>
          <p className="text-2xl font-bold">48</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <p className="text-purple-100 text-sm">今日创建</p>
          <p className="text-2xl font-bold">5</p>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <p className="text-orange-100 text-sm">参与次数</p>
          <p className="text-2xl font-bold">23</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <div key={room.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{room.description}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(room.status)}`}>
                  {room.status === 'waiting' ? '等待中' : 
                   room.status === 'in-progress' ? '进行中' : '已完成'}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">房主</span>
                  <span className="font-medium text-gray-900">{room.host}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">人数</span>
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    <span className="font-medium">{room.members}/{room.maxMembers}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">难度</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(room.difficulty)}`}>
                    {room.difficulty === 'easy' ? '简单' : 
                     room.difficulty === 'medium' ? '中等' : '困难'}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {room.createdAt}
                </div>
              </div>

              <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                加入房间
              </button>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">创建房间功能待实现</h3>
            <button
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomPage;