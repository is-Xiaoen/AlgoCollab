import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface BackButtonProps {
  /** 自定义返回路径，如果不提供则使用浏览器历史记录返回 */
  to?: string;
  /** 按钮文本 */
  label?: string;
  /** 自定义样式类名 */
  className?: string;
  /** 是否显示图标 */
  showIcon?: boolean;
  /** 按钮变体 */
  variant?: 'default' | 'ghost' | 'minimal';
}

const BackButton: React.FC<BackButtonProps> = ({
  to,
  label = '返回',
  className = '',
  showIcon = true,
  variant = 'default'
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (to) {
      // 使用指定路径
      navigate(to);
    } else {
      // 使用浏览器历史记录返回
      // 如果没有历史记录，则导航到主页
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/home');
      }
    }
  };

  // 根据变体设置样式
  const getVariantStyles = () => {
    switch (variant) {
      case 'ghost':
        return 'text-gray-600 hover:text-gray-900 hover:bg-gray-100';
      case 'minimal':
        return 'text-gray-500 hover:text-gray-700';
      default:
        return 'text-gray-700 hover:text-gray-900 hover:bg-gray-50';
    }
  };

  // 检查是否应该显示返回按钮
  const shouldShowButton = () => {
    // 在登录页面不显示返回按钮
    if (location.pathname === '/login' || location.pathname === '/register') {
      return false;
    }
    return true;
  };

  if (!shouldShowButton()) {
    return null;
  }

  return (
    <button
      onClick={handleBack}
      className={`
        inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
        ${getVariantStyles()}
        ${className}
      `}
      title={label}
    >
      {showIcon && (
        <svg 
          className="w-4 h-4 mr-2" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 19l-7-7 7-7" 
          />
        </svg>
      )}
      <span>{label}</span>
    </button>
  );
};

export default BackButton;