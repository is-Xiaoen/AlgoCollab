# AlgoCollab 前端技术文档

## 目录
1. [项目概述](#1-项目概述)
2. [功能需求分析](#2-功能需求分析)
3. [技术架构设计](#3-技术架构设计)
4. [技术选型](#4-技术选型)
5. [项目结构](#5-项目结构)
6. [核心模块设计](#6-核心模块设计)
7. [实时协作实现](#7-实时协作实现)
8. [Monaco Editor集成](#8-monaco-editor集成)
9. [WebSocket通信](#9-websocket通信)
10. [状态管理](#10-状态管理)
11. [UI组件设计](#11-ui组件设计)
12. [性能优化](#12-性能优化)
13. [安全实践](#13-安全实践)
14. [测试策略](#14-测试策略)
15. [部署方案](#15-部署方案)

---

## 1. 项目概述

### 1.1 项目定位
AlgoCollab前端是一个现代化的实时协作代码编辑平台，基于React/Vue3构建，集成了Monaco Editor（VS Code核心编辑器）和Yjs CRDT库，提供企业级的实时协作编码体验。

### 1.2 技术特点
- **实时协作**：基于CRDT的无冲突协作编辑
- **高性能渲染**：虚拟列表、懒加载、代码分割
- **响应式设计**：适配桌面、平板、移动端
- **离线支持**：PWA + IndexedDB本地存储
- **TypeScript**：全面类型安全

### 1.3 核心价值
- 展示**现代前端架构**设计能力
- 掌握**实时协作技术**（CRDT、WebSocket）
- 实践**性能优化**技巧
- 体现**工程化**思维

## 2. 功能需求分析

### 2.1 页面规划

#### 2.1.1 公共页面
- **首页**：平台介绍、热门房间展示
- **登录/注册**：JWT认证、OAuth登录
- **个人中心**：用户信息、编码统计、历史记录

#### 2.1.2 核心页面
- **房间列表**：浏览、搜索、筛选房间
- **协作编辑器**：实时编码、多人协作
- **代码执行**：运行代码、查看结果
- **AI助手**：代码解释、算法提示

#### 2.1.3 管理页面
- **房间管理**：创建、配置、邀请成员
- **团队管理**：成员列表、权限设置
- **数据分析**：使用统计、性能监控

### 2.2 功能模块
#### 2.2.1 实时协作编辑
- **多光标显示**：实时显示所有用户光标
- **选区同步**：显示其他用户的选中区域
- **协作感知**：用户在线状态、编辑状态
- **冲突解决**：CRDT自动解决编辑冲突

#### 2.2.2 代码编辑器
- **语法高亮**：支持50+编程语言
- **智能提示**：代码补全、参数提示
- **代码折叠**：函数、类、区块折叠
- **多主题**：明暗主题切换

#### 2.2.3 通信功能
- **实时聊天**：文字消息、代码片段分享
- **语音通话**：WebRTC音频通信
- **屏幕共享**：分享编辑器视图

#### 2.2.4 AI功能
- **代码解释**：选中代码获取AI解释
- **智能提示**：算法优化建议
- **错误诊断**：运行错误分析

## 3. 技术架构设计

### 3.1 整体架构

```
┌────────────────────────────────────────────────────┐
│                    用户界面层                        │
│         React/Vue3 + TypeScript + Tailwind         │
└────────────────────┬───────────────────────────────┘
                     │
┌────────────────────┴───────────────────────────────┐
│                    组件层                           │
├─────────────┬──────────────┬───────────────────────┤
│  业务组件    │   通用组件    │     布局组件          │
│  Editor     │   Button     │     Layout           │
│  Room       │   Modal      │     Header           │
│  Chat       │   Form       │     Sidebar          │
└─────────────┴──────────────┴───────────────────────┘
                     │
┌────────────────────┴───────────────────────────────┐
│                    状态管理层                        │
│          Zustand/Pinia + React Query               │
└────────────────────┬───────────────────────────────┘
                     │
┌────────────────────┴───────────────────────────────┐
│                    服务层                           │
├─────────────┬──────────────┬───────────────────────┤
│   API服务   │  WebSocket   │    Storage服务        │
│   Axios     │  Socket.io   │    IndexedDB         │
└─────────────┴──────────────┴───────────────────────┘
                     │
┌────────────────────┴───────────────────────────────┐
│                    工具层                           │
│     CRDT(Yjs) + Monaco Editor + WebRTC            │
└────────────────────────────────────────────────────┘
```

### 3.2 数据流设计

```typescript
// 单向数据流
User Action → Dispatch → Store → Update State → Re-render UI
     ↑                                                    ↓
     └──────────── Side Effects (API/WebSocket) ←────────┘

// 实时协作数据流
Local Edit → CRDT Operation → WebSocket → Server
                                   ↓
Other Clients ← WebSocket ← Broadcast
       ↓
Apply CRDT Operation → Update UI
```

### 3.3 模块划分

```
src/
├── modules/           # 业务模块
│   ├── auth/         # 认证模块
│   ├── editor/       # 编辑器模块
│   ├── room/         # 房间模块
│   ├── chat/         # 聊天模块
│   └── ai/           # AI模块
├── shared/           # 共享模块
│   ├── components/   # 通用组件
│   ├── hooks/        # 自定义Hooks
│   ├── utils/        # 工具函数
│   └── types/        # 类型定义
└── core/             # 核心模块
    ├── api/          # API封装
    ├── websocket/    # WebSocket封装
    └── storage/      # 存储封装
```

## 4. 技术选型

### 4.1 核心技术栈

| 技术类别 | 选型                  | 选择理由                      |
| ---- | ------------------- | ------------------------- |
| 框架   | React 18 / Vue 3    | 最新特性、并发渲染、Composition API |
| 语言   | TypeScript 5        | 类型安全、开发体验好                |
| 编辑器  | Monaco Editor       | VS Code同款、功能强大            |
| 实时协作 | Yjs                 | 成熟的CRDT实现、生态完善            |
| 状态管理 | Zustand/Pinia       | 轻量、TypeScript友好           |
| 样式   | Tailwind CSS        | 原子化CSS、开发效率高              |
| 构建工具 | Vite                | 快速启动、HMR、优化好              |
| 包管理  | pnpm                | 速度快、磁盘占用少                 |
| 代码规范 | ESLint + Prettier   | 统一代码风格                    |
| 测试   | Vitest + Playwright | 单元测试 + E2E测试              |
| 部署   | Vercel/Netlify      | 自动部署、CDN加速                |

### 4.2 主要依赖库

```json
{
  "dependencies": {
    // React生态
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    
    // Vue生态（二选一）
    "vue": "^3.3.0",
    "vue-router": "^4.2.0",
    "pinia": "^2.1.0",
    
    // 编辑器
    "monaco-editor": "^0.44.0",
    "@monaco-editor/react": "^4.6.0",
    
    // 实时协作
    "yjs": "^13.6.0",
    "y-websocket": "^1.5.0",
    "y-monaco": "^0.1.5",
    
    // 状态管理
    "zustand": "^4.4.0",
    "@tanstack/react-query": "^5.0.0",
    
    // HTTP请求
    "axios": "^1.6.0",
    "socket.io-client": "^4.5.0",
    
    // UI组件
    "antd": "^5.11.0",
    "@headlessui/react": "^1.7.0",
    
    // 工具库
    "dayjs": "^1.11.0",
    "lodash-es": "^4.17.0",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "tailwindcss": "^3.3.0",
    "eslint": "^8.54.0",
    "prettier": "^3.1.0",
    "vitest": "^1.0.0",
    "@playwright/test": "^1.40.0"
  }
}
```

## 5. 项目结构

### 5.1 完整目录结构

```
algo-collab-frontend/
├── public/
│   ├── favicon.ico
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── assets/              # 静态资源
│   │   ├── images/
│   │   ├── fonts/
│   │   └── styles/
│   ├── components/          # 通用组件
│   │   ├── common/
│   │   ├── layout/
│   │   └── business/
│   ├── modules/             # 业务模块
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── stores/
│   │   │   └── types/
│   │   ├── editor/
│   │   ├── room/
│   │   ├── chat/
│   │   └── ai/
│   ├── core/                # 核心功能
│   │   ├── api/
│   │   ├── websocket/
│   │   ├── crdt/
│   │   └── storage/
│   ├── hooks/               # 全局Hooks
│   ├── utils/               # 工具函数
│   ├── types/               # 全局类型
│   ├── router/              # 路由配置
│   ├── stores/              # 全局状态
│   ├── App.tsx
│   └── main.tsx
├── tests/                   # 测试文件
├── .env                     # 环境变量
├── .env.production
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── package.json
└── README.md
```

### 5.2 模块组织规范

```typescript
// 每个业务模块的标准结构
modules/editor/
├── components/           # 模块组件
│   ├── Editor.tsx       # 主组件
│   ├── Toolbar.tsx      # 工具栏
│   └── StatusBar.tsx    # 状态栏
├── hooks/               # 模块Hooks
│   ├── useEditor.ts
│   └── useCollaboration.ts
├── services/            # 模块服务
│   ├── editorService.ts
│   └── executionService.ts
├── stores/              # 模块状态
│   └── editorStore.ts
├── types/               # 模块类型
│   └── editor.types.ts
├── utils/               # 模块工具
│   └── editorHelpers.ts
└── index.ts             # 模块导出
```

## 6. 核心模块设计

### 6.1 认证模块

```typescript
// src/modules/auth/services/authService.ts
import axios from '@/core/api/axios';
import { storage } from '@/core/storage';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
}

class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user_info';

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await axios.post<LoginResponse>('/auth/login', credentials);
    const { token, refreshToken, user } = response.data;
    
    // 保存认证信息
    this.setTokens(token, refreshToken);
    this.setUser(user);
    
    // 设置axios默认请求头
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    return response.data;
  }

  async register(data: RegisterRequest): Promise<User> {
    const response = await axios.post<User>('/auth/register', data);
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await axios.post('/auth/logout');
    } finally {
      this.clearAuth();
    }
  }

  async refreshToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token');
    }

    const response = await axios.post<{ token: string }>('/auth/refresh', {
      refreshToken,
    });

    const { token } = response.data;
    this.setToken(token);
    
    return token;
  }

  // Token管理
  setTokens(token: string, refreshToken: string): void {
    storage.set(this.TOKEN_KEY, token);
    storage.set(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  setToken(token: string): void {
    storage.set(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return storage.get(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return storage.get(this.REFRESH_TOKEN_KEY);
  }

  // 用户信息管理
  setUser(user: User): void {
    storage.set(this.USER_KEY, user);
  }

  getUser(): User | null {
    return storage.get(this.USER_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  clearAuth(): void {
    storage.remove(this.TOKEN_KEY);
    storage.remove(this.REFRESH_TOKEN_KEY);
    storage.remove(this.USER_KEY);
    delete axios.defaults.headers.common['Authorization'];
  }
}

export const authService = new AuthService();
```

```typescript
// src/modules/auth/hooks/useAuth.ts
import { create } from 'zustand';
import { authService, User } from '../services/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await authService.login({ email, password });
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    
    try {
      await authService.logout();
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  checkAuth: () => {
    const user = authService.getUser();
    const isAuthenticated = authService.isAuthenticated();
    
    set({ user, isAuthenticated });
  },
}));

// 自定义Hook
export function useAuth() {
  const store = useAuthStore();
  
  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    login: store.login,
    logout: store.logout,
    checkAuth: store.checkAuth,
  };
}
```

### 6.2 路由守卫

```typescript
// src/router/guards.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true,
  requireAdmin = false 
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (requireAuth && !isAuthenticated) {
    // 重定向到登录页，保存原始路径
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    // 无权限访问
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}

// 路由配置
export const routes = [
  {
    path: '/',
    element: <Home />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'rooms',
        element: <RoomListPage />,
      },
      {
        path: 'room/:id',
        element: (
          <ProtectedRoute>
            <EditorPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin',
        element: (
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  }
];
```

## 7. 实时协作实现

### 7.1 CRDT集成

```typescript
// src/core/crdt/collaboration.ts
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
import { editor } from 'monaco-editor';

export interface CollaborationOptions {
  roomId: string;
  userId: string;
  username: string;
  color: string;
}

export class CollaborationManager {
  private ydoc: Y.Doc;
  private provider: WebsocketProvider;
  private binding: MonacoBinding | null = null;
  private awareness: any;
  private roomId: string;
  private userId: string;

  constructor(options: CollaborationOptions) {
    this.roomId = options.roomId;
    this.userId = options.userId;

    // 初始化Yjs文档
    this.ydoc = new Y.Doc();

    // 初始化WebSocket Provider
    const wsUrl = `${import.meta.env.VITE_WS_URL}/collaboration`;
    this.provider = new WebsocketProvider(
      wsUrl,
      options.roomId,
      this.ydoc,
      {
        params: {
          userId: options.userId,
          username: options.username,
        },
      }
    );

    // 初始化Awareness（协作感知）
    this.awareness = this.provider.awareness;
    this.awareness.setLocalState({
      user: {
        id: options.userId,
        name: options.username,
        color: options.color,
      },
    });

    // 监听连接状态
    this.setupEventListeners();
  }

  // 绑定到Monaco编辑器
  bindMonacoEditor(
    monacoEditor: editor.IStandaloneCodeEditor,
    model: editor.ITextModel
  ): void {
    // 获取Yjs文本类型
    const ytext = this.ydoc.getText('monaco');

    // 创建Monaco绑定
    this.binding = new MonacoBinding(
      ytext,
      model,
      new Set([monacoEditor]),
      this.awareness
    );

    // 设置用户光标样式
    this.setupCursorStyles(monacoEditor);
  }

  // 设置光标样式
  private setupCursorStyles(monacoEditor: editor.IStandaloneCodeEditor): void {
    // 监听其他用户的光标变化
    this.awareness.on('change', () => {
      const states = Array.from(this.awareness.getStates().entries());
      
      states.forEach(([clientId, state]: [number, any]) => {
        if (clientId === this.awareness.clientID) return;
        
        const user = state.user;
        if (!user) return;

        // 创建光标装饰
        this.createCursorDecoration(monacoEditor, clientId, user);
      });
    });
  }

  // 创建光标装饰
  private createCursorDecoration(
    monacoEditor: editor.IStandaloneCodeEditor,
    clientId: number,
    user: any
  ): void {
    const style = document.createElement('style');
    style.textContent = `
      .yRemoteSelection-${clientId} {
        background-color: ${user.color}30;
      }
      .yRemoteSelectionHead-${clientId} {
        position: absolute;
        border-left: 2px solid ${user.color};
        border-top: 2px solid ${user.color};
        height: 20px;
        box-sizing: border-box;
      }
      .yRemoteSelectionHead-${clientId}::after {
        content: "${user.name}";
        position: absolute;
        top: -20px;
        left: 0;
        background-color: ${user.color};
        color: white;
        padding: 2px 4px;
        border-radius: 3px;
        font-size: 12px;
        white-space: nowrap;
      }
    `;
    document.head.appendChild(style);
  }

  // 设置事件监听
  private setupEventListeners(): void {
    // 连接状态变化
    this.provider.on('status', (event: any) => {
      console.log('Connection status:', event.status);
    });

    // 同步状态变化
    this.provider.on('sync', (isSynced: boolean) => {
      console.log('Sync status:', isSynced);
    });

    // 文档更新
    this.ydoc.on('update', (update: Uint8Array, origin: any) => {
      console.log('Document updated');
    });
  }

  // 获取当前在线用户
  getOnlineUsers(): any[] {
    const states = Array.from(this.awareness.getStates().entries());
    return states
      .filter(([clientId]) => clientId !== this.awareness.clientID)
      .map(([clientId, state]) => state.user)
      .filter(Boolean);
  }

  // 发送聊天消息
  sendMessage(message: string): void {
    const yMessages = this.ydoc.getArray('messages');
    yMessages.push([{
      id: generateId(),
      userId: this.userId,
      message,
      timestamp: Date.now(),
    }]);
  }

  // 监听聊天消息
  onMessage(callback: (messages: any[]) => void): void {
    const yMessages = this.ydoc.getArray('messages');
    
    // 初始消息
    callback(yMessages.toArray());
    
    // 监听变化
    yMessages.observe(() => {
      callback(yMessages.toArray());
    });
  }

  // 获取文档内容
  getContent(): string {
    const ytext = this.ydoc.getText('monaco');
    return ytext.toString();
  }

  // 设置文档内容
  setContent(content: string): void {
    const ytext = this.ydoc.getText('monaco');
    this.ydoc.transact(() => {
      ytext.delete(0, ytext.length);
      ytext.insert(0, content);
    });
  }

  // 销毁
  destroy(): void {
    if (this.binding) {
      this.binding.destroy();
    }
    this.provider.destroy();
    this.ydoc.destroy();
  }
}
```

### 7.2 协作状态管理

```typescript
// src/modules/editor/stores/collaborationStore.ts
import { create } from 'zustand';
import { CollaborationManager } from '@/core/crdt/collaboration';

interface CollaborationUser {
  id: string;
  name: string;
  color: string;
  cursor?: {
    line: number;
    column: number;
  };
  selection?: {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
  };
}

interface CollaborationState {
  manager: CollaborationManager | null;
  isConnected: boolean;
  isSynced: boolean;
  onlineUsers: CollaborationUser[];
  messages: ChatMessage[];
  
  initCollaboration: (options: any) => void;
  sendMessage: (message: string) => void;
  updateCursor: (position: any) => void;
  updateSelection: (selection: any) => void;
  destroy: () => void;
}

export const useCollaborationStore = create<CollaborationState>((set, get) => ({
  manager: null,
  isConnected: false,
  isSynced: false,
  onlineUsers: [],
  messages: [],

  initCollaboration: (options) => {
    const manager = new CollaborationManager(options);
    
    // 监听在线用户
    setInterval(() => {
      const users = manager.getOnlineUsers();
      set({ onlineUsers: users });
    }, 1000);
    
    // 监听消息
    manager.onMessage((messages) => {
      set({ messages });
    });
    
    set({ manager, isConnected: true });
  },

  sendMessage: (message) => {
    const { manager } = get();
    manager?.sendMessage(message);
  },

  updateCursor: (position) => {
    const { manager } = get();
    // 更新光标位置
  },

  updateSelection: (selection) => {
    const { manager } = get();
    // 更新选区
  },

  destroy: () => {
    const { manager } = get();
    manager?.destroy();
    set({ 
      manager: null, 
      isConnected: false,
      onlineUsers: [],
      messages: [],
    });
  },
}));
```

## 8. Monaco Editor集成

### 8.1 编辑器组件

```typescript
// src/modules/editor/components/CodeEditor.tsx
import React, { useRef, useEffect, useState } from 'react';
import * as monaco from 'monaco-editor';
import { loader } from '@monaco-editor/react';
import { useCollaborationStore } from '../stores/collaborationStore';
import { useEditorStore } from '../stores/editorStore';

// 配置Monaco Loader
loader.config({ monaco });

interface CodeEditorProps {
  roomId: string;
  language: string;
  theme?: 'vs-dark' | 'vs-light';
  readOnly?: boolean;
  onExecute?: (code: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  roomId,
  language,
  theme = 'vs-dark',
  readOnly = false,
  onExecute,
}) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { initCollaboration, manager } = useCollaborationStore();
  const { code, setCode, cursorPosition, setCursorPosition } = useEditorStore();

  useEffect(() => {
    if (!containerRef.current) return;

    // 创建编辑器实例
    const editor = monaco.editor.create(containerRef.current, {
      value: code || '',
      language,
      theme,
      readOnly,
      automaticLayout: true,
      fontSize: 14,
      minimap: {
        enabled: true,
      },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      formatOnPaste: true,
      formatOnType: true,
      suggestOnTriggerCharacters: true,
      quickSuggestions: {
        other: true,
        comments: true,
        strings: true,
      },
      parameterHints: {
        enabled: true,
      },
      tabSize: 2,
    });

    editorRef.current = editor;

    // 初始化协作
    if (roomId && manager) {
      const model = editor.getModel();
      if (model) {
        manager.bindMonacoEditor(editor, model);
      }
    }

    // 监听编辑器事件
    setupEditorEvents(editor);

    // 注册快捷键
    registerShortcuts(editor);

    return () => {
      editor.dispose();
    };
  }, [roomId, language, theme]);

  // 设置编辑器事件
  const setupEditorEvents = (editor: monaco.editor.IStandaloneCodeEditor) => {
    // 内容变化
    editor.onDidChangeModelContent((event) => {
      const value = editor.getValue();
      setCode(value);
    });

    // 光标位置变化
    editor.onDidChangeCursorPosition((event) => {
      setCursorPosition({
        lineNumber: event.position.lineNumber,
        column: event.position.column,
      });
    });

    // 选区变化
    editor.onDidChangeCursorSelection((event) => {
      const selection = event.selection;
      // 更新选区状态
    });

    // 焦点变化
    editor.onDidFocusEditorText(() => {
      console.log('Editor focused');
    });

    editor.onDidBlurEditorText(() => {
      console.log('Editor blurred');
    });
  };

  // 注册快捷键
  const registerShortcuts = (editor: monaco.editor.IStandaloneCodeEditor) => {
    // Ctrl/Cmd + Enter 执行代码
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      () => {
        const code = editor.getValue();
        onExecute?.(code);
      }
    );

    // Ctrl/Cmd + S 保存
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
      () => {
        console.log('Save triggered');
        // 触发保存逻辑
      }
    );

    // Ctrl/Cmd + / 注释
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash,
      () => {
        editor.trigger('keyboard', 'editor.action.commentLine', {});
      }
    );
  };

  // 更新编辑器配置
  const updateEditorOptions = (options: Partial<monaco.editor.IEditorOptions>) => {
    if (editorRef.current) {
      editorRef.current.updateOptions(options);
    }
  };

  // 格式化代码
  const formatCode = () => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'editor.action.formatDocument', {});
    }
  };

  // 插入代码片段
  const insertSnippet = (snippet: string) => {
    if (editorRef.current) {
      const position = editorRef.current.getPosition();
      if (position) {
        const range = new monaco.Range(
          position.lineNumber,
          position.column,
          position.lineNumber,
          position.column
        );
        
        editorRef.current.executeEdits('insert-snippet', [
          {
            range,
            text: snippet,
          },
        ]);
      }
    }
  };

  return (
    <div className="editor-container flex flex-col h-full">
      {/* 工具栏 */}
      <EditorToolbar
        onFormat={formatCode}
        onThemeChange={(theme) => updateEditorOptions({ theme })}
        onFontSizeChange={(fontSize) => updateEditorOptions({ fontSize })}
      />
      
      {/* 编辑器 */}
      <div ref={containerRef} className="flex-1" />
      
      {/* 状态栏 */}
      <EditorStatusBar
        language={language}
        cursorPosition={cursorPosition}
        onlineUsers={useCollaborationStore((state) => state.onlineUsers)}
      />
    </div>
  );
};
```

### 8.2 编辑器工具栏

```typescript
// src/modules/editor/components/EditorToolbar.tsx
import React from 'react';
import { 
  PlayIcon, 
  DocumentDuplicateIcon,
  AdjustmentsHorizontalIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';

interface EditorToolbarProps {
  onFormat: () => void;
  onThemeChange: (theme: 'vs-dark' | 'vs-light') => void;
  onFontSizeChange: (size: number) => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onFormat,
  onThemeChange,
  onFontSizeChange,
}) => {
  const [theme, setTheme] = useState<'vs-dark' | 'vs-light'>('vs-dark');
  const [fontSize, setFontSize] = useState(14);

  const handleThemeToggle = () => {
    const newTheme = theme === 'vs-dark' ? 'vs-light' : 'vs-dark';
    setTheme(newTheme);
    onThemeChange(newTheme);
  };

  const handleFontSizeChange = (delta: number) => {
    const newSize = Math.max(10, Math.min(24, fontSize + delta));
    setFontSize(newSize);
    onFontSizeChange(newSize);
  };

  return (
    <div className="editor-toolbar flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
      <div className="flex items-center space-x-2">
        {/* 执行按钮 */}
        <button
          className="toolbar-btn p-2 rounded hover:bg-gray-700 transition-colors"
          title="Run Code (Ctrl+Enter)"
        >
          <PlayIcon className="w-5 h-5 text-green-500" />
        </button>

        {/* 格式化按钮 */}
        <button
          onClick={onFormat}
          className="toolbar-btn p-2 rounded hover:bg-gray-700 transition-colors"
          title="Format Code"
        >
          <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-400" />
        </button>

        {/* 复制按钮 */}
        <button
          className="toolbar-btn p-2 rounded hover:bg-gray-700 transition-colors"
          title="Copy Code"
        >
          <DocumentDuplicateIcon className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="flex items-center space-x-4">
        {/* 字体大小调整 */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handleFontSizeChange(-1)}
            className="px-2 py-1 text-sm text-gray-400 hover:bg-gray-700 rounded"
          >
            A-
          </button>
          <span className="text-sm text-gray-400 mx-2">{fontSize}px</span>
          <button
            onClick={() => handleFontSizeChange(1)}
            className="px-2 py-1 text-sm text-gray-400 hover:bg-gray-700 rounded"
          >
            A+
          </button>
        </div>

        {/* 主题切换 */}
        <button
          onClick={handleThemeToggle}
          className="p-2 rounded hover:bg-gray-700 transition-colors"
          title="Toggle Theme"
        >
          {theme === 'vs-dark' ? (
            <SunIcon className="w-5 h-5 text-yellow-400" />
          ) : (
            <MoonIcon className="w-5 h-5 text-gray-400" />
          )}
        </button>
      </div>
    </div>
  );
};
```

## 9. WebSocket通信

### 9.1 WebSocket管理器

```typescript
// src/core/websocket/WebSocketManager.ts
import { io, Socket } from 'socket.io-client';
import { EventEmitter } from 'events';

export interface WebSocketConfig {
  url: string;
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

export class WebSocketManager extends EventEmitter {
  private socket: Socket | null = null;
  private config: WebSocketConfig;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnected: boolean = false;
  private messageQueue: any[] = [];

  constructor(config: WebSocketConfig) {
    super();
    this.config = {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      ...config,
    };

    if (this.config.autoConnect) {
      this.connect();
    }
  }

  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    // 获取认证token
    const token = localStorage.getItem('auth_token');

    this.socket = io(this.config.url, {
      auth: {
        token,
      },
      transports: ['websocket'],
      reconnection: this.config.reconnection,
      reconnectionAttempts: this.config.reconnectionAttempts,
      reconnectionDelay: this.config.reconnectionDelay,
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    // 连接成功
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.emit('connected');
      
      // 发送队列中的消息
      this.flushMessageQueue();
    });

    // 断开连接
    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnected = false;
      this.emit('disconnected', reason);
      
      // 自动重连
      if (this.config.reconnection && reason !== 'io client disconnect') {
        this.scheduleReconnect();
      }
    });

    // 连接错误
    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.emit('error', error);
    });

    // 重连尝试
    this.socket.on('reconnect_attempt', (attempt) => {
      console.log(`Reconnection attempt ${attempt}`);
      this.emit('reconnecting', attempt);
    });

    // 重连成功
    this.socket.on('reconnect', (attempt) => {
      console.log(`Reconnected after ${attempt} attempts`);
      this.emit('reconnected', attempt);
    });

    // 重连失败
    this.socket.on('reconnect_failed', () => {
      console.error('Failed to reconnect');
      this.emit('reconnect_failed');
    });
  }

  // 发送消息
  emit(event: string, data?: any): void {
    if (!this.isConnected) {
      // 加入消息队列
      this.messageQueue.push({ event, data });
      return;
    }

    this.socket?.emit(event, data);
  }

  // 监听消息
  on(event: string, callback: (...args: any[]) => void): void {
    this.socket?.on(event, callback);
  }

  // 移除监听
  off(event: string, callback?: (...args: any[]) => void): void {
    this.socket?.off(event, callback);
  }

  // 加入房间
  joinRoom(roomId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket?.emit('join_room', { roomId }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve();
        }
      });
    });
  }

  // 离开房间
  leaveRoom(roomId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket?.emit('leave_room', { roomId }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve();
        }
      });
    });
  }

  // 发送房间消息
  sendToRoom(roomId: string, event: string, data: any): void {
    this.socket?.emit('room_message', {
      roomId,
      event,
      data,
    });
  }

  // 清空消息队列
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const { event, data } = this.messageQueue.shift();
      this.emit(event, data);
    }
  }

  // 计划重连
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, this.config.reconnectionDelay);
  }

  // 断开连接
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.socket?.disconnect();
    this.socket = null;
    this.isConnected = false;
  }

  // 获取连接状态
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // 获取Socket ID
  getSocketId(): string | undefined {
    return this.socket?.id;
  }
}

// 单例实例
let wsManager: WebSocketManager | null = null;

export function getWebSocketManager(): WebSocketManager {
  if (!wsManager) {
    wsManager = new WebSocketManager({
      url: import.meta.env.VITE_WS_URL || 'http://localhost:8003',
    });
  }
  return wsManager;
}
```

### 9.2 WebSocket Hooks

```typescript
// src/hooks/useWebSocket.ts
import { useEffect, useRef, useCallback } from 'react';
import { getWebSocketManager } from '@/core/websocket/WebSocketManager';

interface UseWebSocketOptions {
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: Error) => void;
  autoConnect?: boolean;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const wsManager = getWebSocketManager();
  const listenersRef = useRef<Map<string, Function>>(new Map());

  useEffect(() => {
    if (options.onConnect) {
      wsManager.on('connected', options.onConnect);
    }

    if (options.onDisconnect) {
      wsManager.on('disconnected', options.onDisconnect);
    }

    if (options.onError) {
      wsManager.on('error', options.onError);
    }

    if (options.autoConnect !== false) {
      wsManager.connect();
    }

    return () => {
      // 清理监听器
      listenersRef.current.forEach((listener, event) => {
        wsManager.off(event, listener as any);
      });
      listenersRef.current.clear();
    };
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    wsManager.emit(event, data);
  }, []);

  const on = useCallback((event: string, callback: Function) => {
    wsManager.on(event, callback as any);
    listenersRef.current.set(event, callback);
  }, []);

  const off = useCallback((event: string) => {
    const listener = listenersRef.current.get(event);
    if (listener) {
      wsManager.off(event, listener as any);
      listenersRef.current.delete(event);
    }
  }, []);

  const joinRoom = useCallback((roomId: string) => {
    return wsManager.joinRoom(roomId);
  }, []);

  const leaveRoom = useCallback((roomId: string) => {
    return wsManager.leaveRoom(roomId);
  }, []);

  const sendToRoom = useCallback((roomId: string, event: string, data: any) => {
    wsManager.sendToRoom(roomId, event, data);
  }, []);

  return {
    emit,
    on,
    off,
    joinRoom,
    leaveRoom,
    sendToRoom,
    isConnected: wsManager.getConnectionStatus(),
    socketId: wsManager.getSocketId(),
  };
}

// 房间专用Hook
export function useRoomWebSocket(roomId: string) {
  const ws = useWebSocket();
  const [roomState, setRoomState] = useState({
    members: [],
    messages: [],
    isJoined: false,
  });

  useEffect(() => {
    if (!roomId) return;

    // 加入房间
    ws.joinRoom(roomId).then(() => {
      setRoomState(prev => ({ ...prev, isJoined: true }));
    });

    // 监听房间事件
    ws.on(`room:${roomId}:user_joined`, (user) => {
      setRoomState(prev => ({
        ...prev,
        members: [...prev.members, user],
      }));
    });

    ws.on(`room:${roomId}:user_left`, (userId) => {
      setRoomState(prev => ({
        ...prev,
        members: prev.members.filter(m => m.id !== userId),
      }));
    });

    ws.on(`room:${roomId}:message`, (message) => {
      setRoomState(prev => ({
        ...prev,
        messages: [...prev.messages, message],
      }));
    });

    return () => {
      ws.leaveRoom(roomId);
    };
  }, [roomId]);

  const sendMessage = useCallback((message: string) => {
    ws.sendToRoom(roomId, 'message', { text: message });
  }, [roomId]);

  return {
    ...roomState,
    sendMessage,
  };
}
```

## 10. 状态管理

### 10.1 全局状态Store

```typescript
// src/stores/globalStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'zh';
  editorTheme: 'vs-dark' | 'vs-light';
  fontSize: number;
  autoSave: boolean;
  autoSaveInterval: number;
}

interface GlobalState {
  // 应用设置
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  
  // 通知
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  
  // 全局加载状态
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  
  // 侧边栏状态
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useGlobalStore = create<GlobalState>()(
  devtools(
    persist(
      immer((set) => ({
        // 默认设置
        settings: {
          theme: 'dark',
          language: 'en',
          editorTheme: 'vs-dark',
          fontSize: 14,
          autoSave: true,
          autoSaveInterval: 30000,
        },
        
        updateSettings: (newSettings) =>
          set((state) => {
            state.settings = { ...state.settings, ...newSettings };
          }),
        
        // 通知管理
        notifications: [],
        
        addNotification: (notification) =>
          set((state) => {
            state.notifications.push({
              ...notification,
              id: notification.id || generateId(),
              createdAt: Date.now(),
            });
          }),
        
        removeNotification: (id) =>
          set((state) => {
            state.notifications = state.notifications.filter(
              (n) => n.id !== id
            );
          }),
        
        // 加载状态
        isLoading: false,
        setLoading: (loading) =>
          set((state) => {
            state.isLoading = loading;
          }),
        
        // 侧边栏
        isSidebarOpen: true,
        toggleSidebar: () =>
          set((state) => {
            state.isSidebarOpen = !state.isSidebarOpen;
          }),
      })),
      {
        name: 'algo-collab-storage',
        partialize: (state) => ({
          settings: state.settings,
        }),
      }
    )
  )
);
```

### 10.2 React Query集成

```typescript
// src/core/api/queryClient.ts
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5分钟
      gcTime: 10 * 60 * 1000, // 10分钟
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 404) return false;
        if (error?.response?.status === 401) return false;
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
  queryCache: new QueryCache({
    onError: (error: any) => {
      if (error?.response?.status === 401) {
        // 处理认证错误
        window.location.href = '/login';
      } else {
        toast.error(error?.message || 'Something went wrong');
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Operation failed');
    },
  }),
});

// 查询键管理
export const queryKeys = {
  auth: {
    user: () => ['auth', 'user'],
    session: () => ['auth', 'session'],
  },
  rooms: {
    all: () => ['rooms'],
    list: (filters: any) => ['rooms', 'list', filters],
    detail: (id: string) => ['rooms', 'detail', id],
    members: (id: string) => ['rooms', 'members', id],
  },
  code: {
    snapshots: (roomId: string) => ['code', 'snapshots', roomId],
    executions: (roomId: string) => ['code', 'executions', roomId],
  },
  users: {
    profile: (id: string) => ['users', 'profile', id],
    stats: (id: string) => ['users', 'stats', id],
  },
};
```

### 10.3 API Hooks

```typescript
// src/hooks/useApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomService } from '@/modules/room/services/roomService';
import { queryKeys } from '@/core/api/queryClient';

// 获取房间列表
export function useRooms(filters?: any) {
  return useQuery({
    queryKey: queryKeys.rooms.list(filters),
    queryFn: () => roomService.getRooms(filters),
    staleTime: 30000,
  });
}

// 获取房间详情
export function useRoom(roomId: string) {
  return useQuery({
    queryKey: queryKeys.rooms.detail(roomId),
    queryFn: () => roomService.getRoom(roomId),
    enabled: !!roomId,
  });
}

// 创建房间
export function useCreateRoom() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: roomService.createRoom,
    onSuccess: (data) => {
      // 使列表缓存失效
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.rooms.all() 
      });
      
      // 预填充详情缓存
      queryClient.setQueryData(
        queryKeys.rooms.detail(data.id),
        data
      );
    },
  });
}

// 加入房间
export function useJoinRoom() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ roomId, password }: any) => 
      roomService.joinRoom(roomId, password),
    onSuccess: (data, variables) => {
      // 更新房间成员缓存
      queryClient.invalidateQueries({
        queryKey: queryKeys.rooms.members(variables.roomId),
      });
    },
  });
}

// 执行代码
export function useExecuteCode() {
  return useMutation({
    mutationFn: (params: ExecuteCodeParams) => 
      codeService.execute(params),
    onSuccess: (data, variables) => {
      // 更新执行历史缓存
      queryClient.invalidateQueries({
        queryKey: queryKeys.code.executions(variables.roomId),
      });
    },
  });
}
```

## 11. UI组件设计

### 11.1 组件库架构

```typescript
// src/components/ui/Button.tsx
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
        outline: 'border border-gray-300 bg-transparent hover:bg-gray-100',
        ghost: 'hover:bg-gray-100 hover:text-gray-900',
        danger: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        sm: 'h-9 px-3',
        md: 'h-10 px-4 py-2',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    loading,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props 
  }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

### 11.2 Modal组件

```typescript
// src/components/ui/Modal.tsx
import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-7xl',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  closeOnOverlayClick = true,
}) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={closeOnOverlayClick ? onClose : () => {}}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={cn(
                  'w-full transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all',
                  sizeClasses[size]
                )}
              >
                {title && (
                  <Dialog.Title
                    as="div"
                    className="flex items-center justify-between mb-4"
                  >
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      {title}
                    </h3>
                    <button
                      onClick={onClose}
                      className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </Dialog.Title>
                )}
                
                {description && (
                  <Dialog.Description className="text-sm text-gray-500 mb-4">
                    {description}
                  </Dialog.Description>
                )}
                
                <div className="mt-2">{children}</div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
```

### 11.3 通知组件

```typescript
// src/components/ui/Notification.tsx
import React, { useEffect } from 'react';
import { Transition } from '@headlessui/react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationProps {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const icons = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
};

const colors = {
  success: 'text-green-400',
  error: 'text-red-400',
  warning: 'text-yellow-400',
  info: 'text-blue-400',
};

export const Notification: React.FC<NotificationProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
}) => {
  const [show, setShow] = useState(true);
  const Icon = icons[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(() => onClose(id), 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  return (
    <Transition
      show={show}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Icon className={cn('h-6 w-6', colors[type])} />
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className="text-sm font-medium text-gray-900">{title}</p>
              {message && (
                <p className="mt-1 text-sm text-gray-500">{message}</p>
              )}
            </div>
            <div className="ml-4 flex flex-shrink-0">
              <button
                className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={() => {
                  setShow(false);
                  setTimeout(() => onClose(id), 300);
                }}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  );
};

// 通知容器
export const NotificationContainer: React.FC = () => {
  const notifications = useGlobalStore((state) => state.notifications);
  const removeNotification = useGlobalStore((state) => state.removeNotification);

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-4">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          {...notification}
          onClose={removeNotification}
        />
      ))}
    </div>
  );
};
```

## 12. 性能优化

### 12.1 代码分割

```typescript
// src/router/index.tsx
import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { LoadingScreen } from '@/components/LoadingScreen';

// 懒加载页面组件
const HomePage = lazy(() => import('@/pages/HomePage'));
const EditorPage = lazy(() => import('@/pages/EditorPage'));
const RoomListPage = lazy(() => import('@/pages/RoomListPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));

// 路由懒加载包装器
function LazyPage({ Component }: { Component: React.LazyExoticComponent<any> }) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Component />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <LazyPage Component={HomePage} />,
      },
      {
        path: 'rooms',
        element: <LazyPage Component={RoomListPage} />,
      },
      {
        path: 'room/:id',
        element: <LazyPage Component={EditorPage} />,
      },
      {
        path: 'profile',
        element: <LazyPage Component={ProfilePage} />,
      },
      {
        path: 'admin',
        element: <LazyPage Component={AdminDashboard} />,
      },
    ],
  },
]);
```

### 12.2 虚拟列表

```typescript
// src/components/VirtualList.tsx
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

interface VirtualListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
}

export function VirtualList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  overscan = 5,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan,
  });

  return (
    <div
      ref={parentRef}
      className="overflow-auto"
      style={{ height }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 12.3 防抖与节流

```typescript
// src/hooks/useDebounce.ts
import { useEffect, useState, useRef, useCallback } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  ) as T;

  return debouncedCallback;
}

// src/hooks/useThrottle.ts
export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdated = useRef<number>(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastUpdated.current >= interval) {
        setThrottledValue(value);
        lastUpdated.current = Date.now();
      }
    }, interval - (Date.now() - lastUpdated.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, interval]);

  return throttledValue;
}
```

### 12.4 图片懒加载

```typescript
// src/components/LazyImage.tsx
import { useState, useEffect, useRef } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder = '/placeholder.svg',
  className,
  onLoad,
  onError,
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadImage();
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src]);

  const loadImage = () => {
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
      onLoad?.();
    };
    
    img.onerror = () => {
      setIsLoading(false);
      onError?.();
    };
  };

  return (
    <div className={cn('relative', className)}>
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoading ? 'opacity-50' : 'opacity-100'
        )}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      )}
    </div>
  );
};
```

## 13. 安全实践

### 13.1 XSS防护

```typescript
// src/utils/sanitize.ts
import DOMPurify from 'dompurify';

export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });
}

export function escapeHTML(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 安全渲染HTML
export const SafeHTML: React.FC<{ html: string }> = ({ html }) => {
  const sanitized = sanitizeHTML(html);
  
  return (
    <div
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
};
```

### 13.2 CSP配置

```html
<!-- index.html -->
<meta
  http-equiv="Content-Security-Policy"
  content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self' data:;
    connect-src 'self' ws://localhost:* wss://* https://api.algocollab.com;
    frame-src 'none';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    upgrade-insecure-requests;
  "
/>
```

### 13.3 敏感数据处理

```typescript
// src/utils/crypto.ts
import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_CRYPTO_SECRET || 'default-secret';

export function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
}

export function decrypt(ciphertext: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// 安全存储
export class SecureStorage {
  static setItem(key: string, value: any, encrypt = false): void {
    const data = JSON.stringify(value);
    const stored = encrypt ? encrypt(data) : data;
    localStorage.setItem(key, stored);
  }

  static getItem(key: string, decrypt = false): any {
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    
    try {
      const data = decrypt ? decrypt(stored) : stored;
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  static removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  static clear(): void {
    localStorage.clear();
  }
}
```

## 14. 测试策略

### 14.1 单元测试

```typescript
// src/components/Button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables when loading', () => {
    render(<Button loading>Click me</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toBeDisabled();
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('applies variant styles', () => {
    const { rerender } = render(<Button variant="primary">Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-blue-600');
    
    rerender(<Button variant="danger">Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-red-600');
  });
});
```

### 14.2 集成测试

```typescript
// src/modules/auth/auth.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { authService } from './services/authService';

const server = setupServer(
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.json({
        token: 'test-token',
        refreshToken: 'test-refresh-token',
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
        },
      })
    );
  })
);

beforeAll(() => server.listen());
afterAll(() => server.close());

describe('Auth Integration', () => {
  it('logs in successfully', async () => {
    const response = await authService.login({
      email: 'test@.com',
      password: 'password123',
    });
    
    expect(response.token).toBe('test-token');
    expect(response.user.email).toBe('test@example.com');
    expect(authService.isAuthenticated()).toBe(true);
  });

  it('handles login errors', async () => {
    server.use(
      rest.post('/api/auth/login', (req, res, ctx) => {
        return res(
          ctx.status(401),
          ctx.json({ message: 'Invalid credentials' })
        );
      })
    );
    
    await expect(
      authService.login({
        email: 'wrong@example.com',
        password: 'wrong',
      })
    ).rejects.toThrow('Invalid credentials');
  });
});
```

### 14.3 E2E测试

```typescript
// tests/e2e/editor.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Editor Page', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('creates and joins a room', async ({ page }) => {
    // 创建房间
    await page.goto('/rooms');
    await page.click('button:has-text("Create Room")');
    
    await page.fill('[name="name"]', 'Test Room');
    await page.selectOption('[name="language"]', 'javascript');
    await page.click('button:has-text("Create")');
    
    // 等待跳转到编辑器
    await page.waitForURL(/\/room\/\w+/);
    
    // 验证编辑器加载
    await expect(page.locator('.monaco-editor')).toBeVisible();
  });

  test('executes code', async ({ page }) => {
    await page.goto('/room/test-room');
    
    // 输入代码
    await page.click('.monaco-editor');
    await page.keyboard.type('console.log("Hello World");');
    
    // 执行代码
    await page.keyboard.press('Control+Enter');
    
    // 验证输出
    await expect(page.locator('.output-panel')).toContainText('Hello World');
  });

  test('real-time collaboration', async ({ page, context }) => {
    // 第一个用户
    await page.goto('/room/collab-test');
    
    // 第二个用户
    const page2 = await context.newPage();
    await page2.goto('/room/collab-test');
    
    // 第一个用户输入
    await page.click('.monaco-editor');
    await page.keyboard.type('// User 1 was here');
    
    // 验证第二个用户看到更新
    await expect(page2.locator('.monaco-editor')).toContainText('// User 1 was here');
    
    // 验证光标显示
    await expect(page2.locator('.yRemoteSelectionHead')).toBeVisible();
  });
});
```

## 15. 部署方案

### 15.1 构建配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'gzip',
      ext: '.gz',
    }),
    visualizer({
      template: 'treemap',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'editor': ['monaco-editor', '@monaco-editor/react'],
          'collaboration': ['yjs', 'y-websocket', 'y-monaco'],
          'ui': ['antd', '@headlessui/react'],
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:8003',
        ws: true,
      },
    },
  },
});
```

### 15.2 Docker部署

```dockerfile
# Dockerfile
# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 安装pnpm
RUN npm install -g pnpm

# 复制package文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建
RUN pnpm build

# 运行阶段
FROM nginx:alpine

# 复制构建结果
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml application/atom+xml image/svg+xml text/javascript application/vnd.ms-fontobject application/x-font-ttf font/opentype;

    # 缓存静态资源
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API代理
    location /api {
        proxy_pass http://backend:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket代理
    location /ws {
        proxy_pass http://backend:8003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # SPA路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

### 15.3 CI/CD配置

```yaml
# .github/workflows/deploy.yml
name: Deploy Frontend

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install pnpm
        run: npm install -g pnpm
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run tests
        run: |
          pnpm test
          pnpm test:e2e
      
      - name: Build
        run: pnpm build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: |
          docker build -t algocollab/frontend:${{ github.sha }} .
          docker tag algocollab/frontend:${{ github.sha }} algocollab/frontend:latest
      
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push algocollab/frontend:${{ github.sha }}
          docker push algocollab/frontend:latest
      
      - name: Deploy to Vercel
        run: |
          npm i -g vercel
          vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

## 总结

本文档详细介绍了AlgoCollab前端的完整技术架构和实现细节，包括：

1. **技术架构**：基于React/Vue3的现代化架构设计
2. **实时协作**：CRDT + WebSocket实现无冲突协作
3. **编辑器集成**：Monaco Editor深度定制
4. **状态管理**：Zustand + React Query组合方案
5. **性能优化**：代码分割、虚拟列表、懒加载
6. **安全实践**：XSS防护、CSP配置、敏感数据处理
7. **测试策略**：单元测试、集成测试、E2E测试
8. **部署方案**：Docker容器化、CI/CD自动化

该项目展示了现代前端开发的最佳实践，涵盖了大厂面试中重点考察的技术点，包括实时协作技术、性能优化、工程化实践等。通过实现这个项目，可以全面提升前端开发能力，为进入大厂打下坚实基础。