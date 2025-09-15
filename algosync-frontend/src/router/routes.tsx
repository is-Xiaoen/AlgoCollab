import { lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import AuthGuard from './guards/AuthGuard';
import PublicGuard from './guards/PublicGuard';
import { Navigate } from 'react-router-dom';
// 懒加载组件
const AuthPage = lazy(() => import('../pages/auth'));
const Home = lazy(() => import('../pages/layout'));
const NotFound = lazy(() => import('../pages/404'));

// Loading 组件
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">加载中...</p>
    </div>
  </div>
);

// 路由配置
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to="/home" replace />,
  },
  {
    path: '/login',
    element: (
      <PublicGuard>
        <Suspense fallback={<PageLoader />}>
          <AuthPage />
        </Suspense>
      </PublicGuard>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicGuard>
        <Suspense fallback={<PageLoader />}>
          <AuthPage />
        </Suspense>
      </PublicGuard>
    ),
  },
  {
    path: '/home',
    element: (
      <AuthGuard>
        <Suspense fallback={<PageLoader />}>
          <Home />
        </Suspense>
      </AuthGuard>
    ),
  },
  {
    path: '/profile',
    element: (
      <AuthGuard>
        <Suspense fallback={<PageLoader />}>
          {/* <Profile /> */}
        </Suspense>
      </AuthGuard>
    ),
  },
  {
    path: '/settings',
    element: (
      <AuthGuard>
        <Suspense fallback={<PageLoader />}>
          {/* <Settings /> */}
        </Suspense>
      </AuthGuard>
    ),
  },
  {
    path: '*',
    element: (
      <Suspense fallback={<PageLoader />}>
        <NotFound />
      </Suspense>
    ),
  },
];

// // 临时组件（后续替换为实际页面）
// const Profile = () => (
//   <div className="min-h-screen bg-gray-50 p-8">
//     <div className="max-w-4xl mx-auto">
//       <h1 className="text-3xl font-bold mb-4">个人资料</h1>
//       <p className="text-gray-600">这是个人资料页面</p>
//     </div>
//   </div>
// );

// const Settings = () => (
//   <div className="min-h-screen bg-gray-50 p-8">
//     <div className="max-w-4xl mx-auto">
//       <h1 className="text-3xl font-bold mb-4">设置</h1>
//       <p className="text-gray-600">这是设置页面</p>
//     </div>
//   </div>
// );

