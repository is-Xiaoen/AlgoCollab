import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="text-center">
        {/* 404 大标题 */}
        <h1 className="text-9xl font-bold text-blue-600 animate-bounce">404</h1>
        
        {/* 错误信息 */}
        <h2 className="text-3xl font-semibold text-gray-800 mt-4">页面未找到</h2>
        <p className="text-gray-600 mt-2 max-w-md mx-auto">
          抱歉，您访问的页面不存在或已被移除。请检查URL是否正确。
        </p>
        
        {/* 插图 */}
        <div className="mt-8 mb-8">
          <svg 
            className="w-64 h-64 mx-auto" 
            viewBox="0 0 400 300" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="200" cy="150" r="80" fill="#EBF8FF" />
            <path 
              d="M170 130 Q200 110, 230 130" 
              stroke="#3B82F6" 
              strokeWidth="4" 
              strokeLinecap="round" 
              fill="none"
            />
            <circle cx="180" cy="140" r="8" fill="#3B82F6" />
            <circle cx="220" cy="140" r="8" fill="#3B82F6" />
            <path 
              d="M180 170 Q200 160, 220 170" 
              stroke="#3B82F6" 
              strokeWidth="4" 
              strokeLinecap="round" 
              fill="none"
            />
          </svg>
        </div>
        
        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              返回上一页
            </span>
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              返回首页
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;