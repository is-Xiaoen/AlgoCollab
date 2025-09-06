import React, { useState, useCallback, useEffect, useRef } from 'react';

type TabType = 'login' | 'register';

interface AuthTabsProps {
  defaultTab?: TabType; //默认是登录和注册的类型
  children: {
    login: React.ReactNode;
    register: React.ReactNode;
    [key: string]: React.ReactNode; // 添加索引签名以支持动态访问
  };
  onTabChange?: (tab: TabType) => void;
  showIndicator?: boolean; // 是否显示数量指示器
  showProgress?: boolean; // 是否显示进度条
  showKeyboardHints?: boolean; // 是否显示键盘快捷键提示
  animationDirection?: 'horizontal' | 'vertical' | 'fade'; // 动画方向配置
  disabledTabs?: TabType[]; // 禁用的标签页
  variant?: 'default' | 'pills' | 'underline' | 'bordered'; // 样式变体
  iconType?: 'emoji' | 'svg' | 'none'; // 图标类型
  showTooltips?: boolean; // 是否显示工具提示
}

// SVG 图标组件
const LoginIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
  </svg>
);

const RegisterIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
  </svg>
);

const AuthTabs: React.FC<AuthTabsProps> = ({ 
  defaultTab = 'login',
  children,
  onTabChange,
  showIndicator = false,
  showProgress = false,
  showKeyboardHints = false,
  animationDirection = 'horizontal',
  disabledTabs = [],
  variant = 'default',
  iconType = 'emoji',
  showTooltips = false
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
  const [previousTab, setPreviousTab] = useState<TabType>(defaultTab);
  const [hoveredTab, setHoveredTab] = useState<TabType | null>(null);
  
  // 当外部的 defaultTab 改变时，同步更新内部状态
  React.useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);
 
  // 使用 useRef 存储每个 tab 按钮的引用
  // Map 结构可以方便地存储和获取每个 tab 的 DOM 元素
  const tabRefs = useRef<Map<TabType, HTMLButtonElement | null>>(new Map());
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  //计算指示器位置的核心函数
  const updateIndicatorPosition = useCallback((tab: TabType) => {
    const tabElement = tabRefs.current.get(tab);
    const containerElement = containerRef.current;
    
    if (tabElement && containerElement) {
      const tabRect = tabElement.getBoundingClientRect();
      const containerRect = containerElement.getBoundingClientRect();
      
      const relativeLeft = tabRect.left - containerRect.left;
      
      setIndicatorStyle({
        left: relativeLeft,
        width: tabRect.width
      });
    }
  }, []);

  // Tab 配置 - 支持多种图标类型
  const tabs: { 
    key: TabType; 
    label: string; 
    emoji?: string;
    Icon?: React.ComponentType<{ className?: string }>;
    description?: string;
  }[] = [
    { 
      key: 'login', 
      label: '登录', 
      emoji: '🔐',
      Icon: LoginIcon,
      description: '登录到您的账户'
    },
    { 
      key: 'register', 
      label: '注册', 
      emoji: '📝',
      Icon: RegisterIcon,
      description: '创建新账户'
    }
  ];

  const handleTabChange = useCallback((tab: TabType) => {
    // 检查是否禁用
    if (disabledTabs.includes(tab)) {
      return;
    }
    
    setPreviousTab(activeTab);
    setActiveTab(tab);
    onTabChange?.(tab);
    
    // 切换 tab 时更新指示器位置
    updateIndicatorPosition(tab);
  }, [activeTab, onTabChange, updateIndicatorPosition, disabledTabs]);

  // 实现键盘导航功能
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const currentIndex = tabs.findIndex(tab => tab.key === activeTab);
    let newIndex = currentIndex;
  
    if (e.key === 'ArrowLeft') {
      e.preventDefault(); 
      // 如果是第一个，循环到最后一个
      newIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
      
      // 跳过禁用的标签
      while (disabledTabs.includes(tabs[newIndex].key) && newIndex !== currentIndex) {
        newIndex = newIndex === 0 ? tabs.length - 1 : newIndex - 1;
      }
    }
    
    else if (e.key === 'ArrowRight') {
      e.preventDefault();
      // 如果是最后一个，循环到第一个
      newIndex = currentIndex === tabs.length - 1 ? 0 : currentIndex + 1;
      
      // 跳过禁用的标签
      while (disabledTabs.includes(tabs[newIndex].key) && newIndex !== currentIndex) {
        newIndex = newIndex === tabs.length - 1 ? 0 : newIndex + 1;
      }
    }
    
    // Enter 或 Space 键 - 激活当前聚焦的 tab
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const target = e.target as HTMLElement;
      const tabKey = target.getAttribute('data-tab') as TabType;
      if (tabKey && !disabledTabs.includes(tabKey)) {
        handleTabChange(tabKey);
        return;
      }
    }
    
    // 如果索引改变了，切换到新的 tab
    if (newIndex !== currentIndex && !disabledTabs.includes(tabs[newIndex].key)) {
      const newTab = tabs[newIndex].key;
      handleTabChange(newTab);
      
      // 将焦点移动到新的 tab 按钮
      setTimeout(() => {
        const newTabElement = tabRefs.current.get(newTab);
        newTabElement?.focus();
      }, 0);
    }
  }, [activeTab, tabs, handleTabChange, disabledTabs]);

  //初始化和响应式更新指示器位置
  useEffect(() => {
    // 初始化时设置指示器位置
    updateIndicatorPosition(activeTab);
    
    // 处理窗口大小变化
    const handleResize = () => {
      updateIndicatorPosition(activeTab);
    };
    
    // 添加事件监听器
    window.addEventListener('resize', handleResize);
    
    // 清理函数：移除事件监听器
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [activeTab, updateIndicatorPosition]);

  // 获取当前进度百分比
  const getProgressPercentage = () => {
    const currentIndex = tabs.findIndex(t => t.key === activeTab);
    return ((currentIndex + 1) / tabs.length) * 100;
  };

  // 获取变体样式
  const getVariantStyles = () => {
    switch (variant) {
      case 'pills':
        return {
          container: 'bg-gray-100 p-1 rounded-lg',
          button: 'rounded-md',
          activeButton: 'bg-white shadow-sm',
          indicator: 'hidden'
        };
      case 'bordered':
        return {
          container: 'border-2 border-gray-200 rounded-lg',
          button: 'border-r-2 last:border-r-0 border-gray-200',
          activeButton: 'bg-blue-50',
          indicator: 'bg-blue-600 h-full opacity-10'
        };
      case 'underline':
        return {
          container: '',
          button: '',
          activeButton: '',
          indicator: 'bg-blue-600 h-1'
        };
      default:
        return {
          container: 'border-b border-gray-200',
          button: '',
          activeButton: '',
          indicator: 'bg-blue-600 h-0.5'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="w-full max-w-md mx-auto">
      {/* 扩展功能区 */}
      <div className="mb-4 space-y-2">
        {/* 1. Tab 数量指示器 */}
        {showIndicator && (
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>步骤 {tabs.findIndex(t => t.key === activeTab) + 1} / {tabs.length}</span>
            <span className="text-xs">{tabs.find(t => t.key === activeTab)?.label}</span>
          </div>
        )}
        
        {/* 2. 进度条 */}
        {showProgress && (
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        )}
        
        {/* 3. 键盘快捷键提示 */}
        {showKeyboardHints && (
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">←</kbd>
              <span>上一步</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">→</kbd>
              <span>下一步</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Enter</kbd>
              <span>确认</span>
            </span>
          </div>
        )}
      </div>

      {/* Tab 导航 */}
      <div 
        ref={containerRef} 
        className={`relative flex ${styles.container}`}
        role="tablist"
        onKeyDown={handleKeyDown}
      >
        {tabs.map((tab) => {
          const isDisabled = disabledTabs.includes(tab.key);
          const isActive = activeTab === tab.key;
          
          return (
            <button
              key={tab.key}
              ref={(el) => {
                if (el) {
                  tabRefs.current.set(tab.key, el);
                } else {
                  tabRefs.current.delete(tab.key);
                }
              }}
              type="button"
              onClick={() => handleTabChange(tab.key)}
              onMouseEnter={() => setHoveredTab(tab.key)}
              onMouseLeave={() => setHoveredTab(null)}
              disabled={isDisabled}
              className={`
                flex-1 py-3 px-4 text-center font-medium text-sm
                transition-all duration-200 relative z-10
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset
                ${styles.button}
                ${isDisabled 
                  ? 'opacity-50 cursor-not-allowed text-gray-400' 
                  : isActive 
                    ? `text-blue-600 ${styles.activeButton}` 
                    : 'text-gray-500 hover:text-gray-700'
                }
              `}
              role="tab"
              {...(isActive && { 'aria-selected': 'true' })}
              {...{ 'aria-controls': `tabpanel-${tab.key}` }}
              {...(isDisabled && { 'aria-disabled': 'true' })}
              id={`tab-${tab.key}`}
              tabIndex={isActive ? 0 : -1}
              data-tab={tab.key}
            >
            {/* 图标和文字布局 */}
            <span className="flex items-center justify-center gap-2">
              {/* 条件渲染图标 - 支持多种类型 */}
              {iconType !== 'none' && (
                <>
                  {iconType === 'emoji' && tab.emoji && (
                    <span 
                      className={`
                        inline-block text-lg
                        transition-all duration-300 ease-in-out
                        ${isDisabled 
                          ? 'opacity-30'
                          : isActive 
                            ? 'transform scale-110 rotate-12' 
                            : 'transform scale-100 rotate-0 opacity-70'
                        }
                      `}
                      aria-hidden="true"
                    >
                      {tab.emoji}
                    </span>
                  )}
                  {iconType === 'svg' && tab.Icon && (
                    <span className="relative">
                      <tab.Icon 
                        className={`
                          w-5 h-5
                          transition-all duration-300 ease-out
                          ${isDisabled
                            ? 'text-gray-300'
                            : isActive 
                              ? 'text-blue-600 transform scale-110' 
                              : 'text-gray-400'
                          }
                          ${hoveredTab === tab.key && !isActive && !isDisabled
                            ? 'transform scale-105 text-gray-600'
                            : ''
                          }
                        `}
                      />
                      {/* 脉冲动画 - 仅在激活时显示 */}
                      {isActive && !isDisabled && (
                        <span className="absolute inset-0 -z-10">
                          <span className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20" />
                        </span>
                      )}
                    </span>
                  )}
                </>
              )}
              
              {/* 文字标签 */}
              <span className={`
                transition-all duration-200
                ${isActive ? 'font-semibold' : 'font-medium'}
              `}>
                {tab.label}
              </span>
              
              {/* 禁用标记 */}
              {isDisabled && (
                <span className="ml-1 text-xs text-gray-400">(禁用)</span>
              )}
            </span>
            
            {/* 工具提示 - 悬停时显示描述 */}
            {showTooltips && hoveredTab === tab.key && tab.description && (
              <span className="
                absolute top-full left-1/2 transform -translate-x-1/2 mt-2
                px-2 py-1 text-xs text-white bg-gray-800 rounded
                opacity-90 pointer-events-none
                whitespace-nowrap z-20
                shadow-lg
              ">
                {tab.description}
              </span>
            )}
            </button>
          );
        })}

        
        {/* 【实现9】: 滑动下划线指示器
            - 使用绝对定位 (absolute bottom-0)
            - 动态设置 left 和 width 样式
            - transition-all 实现平滑动画
        */}
        <span 
          className="absolute bottom-0 h-0.5 bg-blue-600 transition-all duration-300 ease-in-out"
          style={{
            left: `${indicatorStyle.left}px`,
            width: `${indicatorStyle.width}px`
          }}
          aria-hidden="true"
        />
      </div>

      {/* Tab 内容区域 - 实现平滑切换动画 */}
      <div className="mt-6 relative overflow-hidden">
        {/* 内容容器 - 设置最小高度防止跳动 */}
        <div className="relative" style={{ minHeight: '200px' }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            const isPrevious = previousTab === tab.key;
            const tabIndex = tabs.findIndex(t => t.key === tab.key);
            const activeIndex = tabs.findIndex(t => t.key === activeTab);
            
            // 根据配置的动画方向计算动画类
            const getAnimationClass = () => {
              if (animationDirection === 'fade') {
                // 淡入淡出动画
                if (isActive) {
                  return 'opacity-100 transition-opacity duration-500 ease-out';
                } else if (isPrevious) {
                  return 'opacity-0 transition-opacity duration-300 ease-in absolute inset-0';
                } else {
                  return 'opacity-0 absolute inset-0 pointer-events-none';
                }
              } else if (animationDirection === 'vertical') {
                // 垂直滑动动画
                if (isActive) {
                  return 'opacity-100 translate-y-0 transition-all duration-500 ease-out delay-75';
                } else if (isPrevious) {
                  const direction = tabIndex < activeIndex ? '-translate-y-full' : 'translate-y-full';
                  return `opacity-0 ${direction} transition-all duration-300 ease-in absolute inset-0`;
                } else {
                  return 'opacity-0 translate-y-full absolute inset-0 pointer-events-none';
                }
              } else {
                // 默认水平滑动动画
                if (isActive) {
                  return 'opacity-100 translate-x-0 scale-100 transition-all duration-500 ease-out delay-75';
                } else if (isPrevious) {
                  const direction = tabIndex < activeIndex ? '-translate-x-full' : 'translate-x-full';
                  return `opacity-0 ${direction} scale-95 transition-all duration-300 ease-in absolute inset-0`;
                } else {
                  return 'opacity-0 scale-95 absolute inset-0 pointer-events-none';
                }
              }
            };
            
            return (
              <div
                key={tab.key}
                id={`tabpanel-${tab.key}`}
                role="tabpanel"
                {...{ 'aria-labelledby': `tab-${tab.key}` }}
                {...(!isActive && { 'aria-hidden': 'true' })}
                className={`
                  transform-gpu
                  ${getAnimationClass()}
                `}
                style={{
                  visibility: isActive || isPrevious ? 'visible' : 'hidden',
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden'
                }}
              >
                {/* 内容淡入效果 */}
                <div className={`
                  transition-opacity duration-300
                  ${isActive ? 'opacity-100 delay-200' : 'opacity-0'}
                `}>
                  {children[tab.key]}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* 加载指示器 - 可以通过传入 isLoading prop 来控制显示 */}
      </div>

     
    </div>
  );
};

export default AuthTabs;
