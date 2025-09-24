import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/common/Breadcrumb';

type Difficulty = 'easy' | 'medium' | 'hard';
// type Category = 'all' | 'array' | 'string' | 'tree' | 'dp' | 'graph';

interface Problem {
  id: number;
  title: string;
  difficulty: Difficulty;
  category: string;
  acceptance: string;
  completed: boolean;
  tags: string[];
}

const AlgorithmPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const problems: Problem[] = [
    {
      id: 1,
      title: '两数之和',
      difficulty: 'easy',
      category: 'array',
      acceptance: '47.5%',
      completed: true,
      tags: ['数组', '哈希表']
    },
    {
      id: 2,
      title: '无重复字符的最长子串',
      difficulty: 'medium',
      category: 'string',
      acceptance: '33.8%',
      completed: false,
      tags: ['字符串', '滑动窗口']
    },
    {
      id: 3,
      title: '二叉树的最大深度',
      difficulty: 'easy',
      category: 'tree',
      acceptance: '62.7%',
      completed: true,
      tags: ['树', '深度优先搜索']
    },
    {
      id: 4,
      title: '最长回文子串',
      difficulty: 'medium',
      category: 'string',
      acceptance: '29.4%',
      completed: false,
      tags: ['字符串', '动态规划']
    },
    {
      id: 5,
      title: '正则表达式匹配',
      difficulty: 'hard',
      category: 'dp',
      acceptance: '21.3%',
      completed: false,
      tags: ['字符串', '动态规划']
    }
  ];

  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'hard': return 'text-red-600 bg-red-50';
    }
  };

  // const filterProblems = (problems: Problem[]) => {
  //   // 用户需要实现根据难度、分类和搜索关键词筛选题目的逻辑
  //   
  //   return problems;
  // };

  const handleStartPractice = (problemId: number) => {
    // 跳转到编辑器页面
    navigate(`/editor/${problemId}`);
  };

  const breadcrumbItems = [
    { label: '首页', href: '/home' },
    { label: '算法题库', active: true }
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} className="mb-4" />
      
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">算法题库</h2>
            <p className="text-gray-600 mt-1">挑战自我，提升编程能力</p>
          </div>
          
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索题目..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">难度：</span>
            {(['all', 'easy', 'medium', 'hard'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setSelectedDifficulty(level)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedDifficulty === level
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {level === 'all' ? '全部' : 
                 level === 'easy' ? '简单' : 
                 level === 'medium' ? '中等' : '困难'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">总进度</p>
              <p className="text-2xl font-bold text-gray-900">45 / 200</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold">23%</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">今日完成</p>
              <p className="text-2xl font-bold text-gray-900">5</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">连续打卡</p>
              <p className="text-2xl font-bold text-gray-900">7 天</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-3 text-sm font-semibold text-gray-700">状态</th>
                  <th className="pb-3 text-sm font-semibold text-gray-700">题目</th>
                  <th className="pb-3 text-sm font-semibold text-gray-700">难度</th>
                  <th className="pb-3 text-sm font-semibold text-gray-700">通过率</th>
                  <th className="pb-3 text-sm font-semibold text-gray-700">标签</th>
                  <th className="pb-3 text-sm font-semibold text-gray-700">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {problems.map((problem) => (
                  <tr key={problem.id} className="hover:bg-gray-50">
                    <td className="py-4">
                      {problem.completed ? (
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                      )}
                    </td>
                    <td className="py-4">
                      <div className="font-medium text-gray-900">{problem.title}</div>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty === 'easy' ? '简单' : 
                         problem.difficulty === 'medium' ? '中等' : '困难'}
                      </span>
                    </td>
                    <td className="py-4 text-gray-600">{problem.acceptance}</td>
                    <td className="py-4">
                      <div className="flex flex-wrap gap-1">
                        {problem.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4">
                      <button 
                        onClick={() => handleStartPractice(problem.id)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                      >
                        开始练习
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlgorithmPage;