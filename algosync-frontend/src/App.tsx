import React, { useEffect } from 'react';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import { routes } from './router/routes';
import { initializeAuth } from './stores/authStore';

// 路由组件
const AppRoutes = () => {
  const element = useRoutes(routes);
  return element;
};

function App() {
  // 初始化认证状态
  useEffect(() => {
    initializeAuth();
  }, []);
  
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;