import React, { useState } from 'react';

interface Problem {
  id: number;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
}

interface ProblemPanelProps {
  problem: Problem;
}

const ProblemPanel: React.FC<ProblemPanelProps> = ({ problem }) => {
  const [activeTab, setActiveTab] = useState<'description' | 'solutions' | 'discuss'>('description');

  return (
    <div className="h-full flex flex-col">
      <div className="flex border-b">
        {[
          { key: 'description', label: '题目描述' },
          { key: 'solutions', label: '题解' },
          { key: 'discuss', label: '讨论' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'description' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">题目描述</h3>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {problem.description}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">示例</h3>
              <div className="space-y-4">
                {problem.examples.map((example, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      示例 {index + 1}:
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs font-medium text-gray-500">输入：</span>
                        <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {example.input}
                        </code>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500">输出：</span>
                        <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {example.output}
                        </code>
                      </div>
                      {example.explanation && (
                        <div>
                          <span className="text-xs font-medium text-gray-500">解释：</span>
                          <span className="ml-2 text-sm text-gray-700">
                            {example.explanation}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">约束条件</h3>
              <ul className="space-y-1">
                {problem.constraints.map((constraint, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start">
                    <span className="text-gray-400 mr-2">•</span>
                    <code className="bg-gray-100 px-1 rounded text-xs font-mono">
                      {constraint}
                    </code>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">💡 进阶思考</h4>
              <p className="text-sm text-blue-700">
                你能设计一个时间复杂度为 O(n) 的算法来解决这个问题吗？
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">相关话题</h4>
              <div className="flex flex-wrap gap-2">
                {['数组', '哈希表', '双指针'].map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'solutions' && (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 text-sm">题解功能开发中...</p>
          </div>
        )}
        {activeTab === 'discuss' && (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-gray-500 text-sm">讨论功能开发中...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemPanel;