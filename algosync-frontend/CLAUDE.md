# CLAUDE.md - AlgoCollab 前端协作指南

This file provides guidance to Claude Code (claude.ai/code) when working with the AlgoCollab frontend.

---

## 🎯 当前开发任务

### 正在进行：登录注册模块
- **目标**：实现带Tab切换的登录注册页面
- **进度**：架构设计阶段
- **技术栈**：React + TypeScript + Tailwind CSS + React Hook Form + Zod

---

## 📐 项目架构

### 技术栈
- **框架**：React 19 + TypeScript
- **构建工具**：Vite
- **样式**：Tailwind CSS
- **状态管理**：Zustand
- **路由**：React Router DOM v7
- **表单**：React Hook Form + Zod
- **HTTP客户端**：Axios
- **代码质量**：ESLint + Prettier + Husky

### 目录结构规范
```
src/
├── components/        # 全局可复用组件
│   ├── common/       # 基础UI组件
│   └── layout/       # 布局组件
├── pages/            # 页面级组件
│   └── [page]/
│       ├── index.tsx           # 页面主文件
│       ├── components/         # 页面专属组件
│       ├── hooks/             # 页面专属hooks
│       └── types.ts           # 类型定义
├── services/         # API服务层
├── stores/          # Zustand状态存储
├── hooks/           # 全局自定义hooks
├── utils/           # 工具函数
├── types/           # 全局类型定义
└── config/          # 配置文件
```

---

## 🔄 协作节奏（Step-by-Step教学模式）

# 学习环节分级（确保教学深度）

- **跟随实现（20%）**：在框架下填充逻辑；
- **独立实现（60%）**：根据定义独立编码主要功能；
- **扩展实现（20%）**：性能优化或增加边界处理。

### 1️⃣ Step Plan（步骤规划）
- **核心概念讲解**：详细说明React概念、设计模式、性能考虑
- **技术选型理由**：解释为什么选择特定的库或实现方式
- **常见陷阱提醒**：React重渲染、闭包陷阱、异步状态更新等

### 2️⃣ Checklist（任务清单）
- 使用 `TODO(human)` 标记需要人工实现的关键部分
- 步长控制：
  - 最小步（10-15分钟）：单个组件或熟练使用hook
  - 标准步（15-25分钟）：完整功能模块
  - 组合步（25-35分钟）：多模块集成

### 3️⃣ Acceptance（验收标准）
- TypeScript类型检查通过
- ESLint无错误
- 组件可正常渲染
- 关键交互功能正常
- 响应式设计适配

### 4️⃣ After-Action（后续优化）
- 运行质量检查：`npm run lint`
- 性能优化：React.memo、useMemo、useCallback
- 代码重构：提取自定义hooks、组件拆分

---

## 🛠️ 开发命令

```bash
# 开发
npm run dev          # 启动开发服务器

# 构建
npm run build        # 生产构建
npm run preview      # 预览构建结果

# 质量检查
npm run lint         # ESLint检查
npm run type-check   # TypeScript类型检查
```

---

## 📝 当前任务：登录注册模块实现

### 架构设计
```
pages/auth/
├── index.tsx                 # 主容器，管理Tab状态
├── components/
│   ├── AuthTabs.tsx         # Tab切换组件
│   ├── LoginForm.tsx        # 登录表单
│   ├── RegisterForm.tsx     # 注册表单
│   └── shared/
│       ├── FormField.tsx    # 表单字段组件
│       ├── PasswordInput.tsx # 密码输入组件
│       └── validation.ts    # 表单验证规则
├── hooks/
│   ├── useAuth.ts           # 认证相关hook
│   └── useFormValidation.ts # 表单验证hook
└── types.ts                 # 类型定义
```

### 实现步骤

#### Step 1: 创建共享组件基础 (20分钟)
**技术要点**：
- 组件复用设计模式
- TypeScript泛型在表单中的应用
- Tailwind CSS响应式设计

**Checklist**：
- [ ] 创建FormField组件 - `TODO(human): 实现表单字段错误提示逻辑`
- [ ] 创建PasswordInput组件（带显示/隐藏功能）
- [ ] 设置Zod验证schema

**验收标准**：
- 组件支持错误状态显示
- 密码可切换显示/隐藏
- TypeScript类型完整

#### Step 2: 实现Tab切换容器 (15分钟)
**技术要点**：
- React状态管理最佳实践
- 动画过渡效果
- 无障碍访问(a11y)

**Checklist**：
- [ ] 创建AuthTabs组件
- [ ] 实现Tab切换动画
- [ ] 添加键盘导航支持

**验收标准**：
- Tab切换流畅
- 支持键盘Tab键导航
- 动画无卡顿

#### Step 3: 登录表单实现 (25分钟)
**技术要点**：
- React Hook Form集成
- 异步表单提交
- 错误处理策略

**Checklist**：
- [ ] 创建LoginForm组件
- [ ] 集成React Hook Form
- [ ] 实现提交逻辑 - `TODO(human): 实现API调用和错误处理`
- [ ] 添加loading状态

**验收标准**：
- 表单验证实时反馈
- 提交按钮防重复点击
- 错误信息友好展示

#### Step 4: 注册表单实现 (25分钟)
**技术要点**：
- 密码强度检测
- 表单字段联动验证
- 用户体验优化

**Checklist**：
- [ ] 创建RegisterForm组件
- [ ] 实现密码强度指示器
- [ ] 添加确认密码验证
- [ ] 实现条款同意checkbox

**验收标准**：
- 密码强度实时显示
- 两次密码输入一致性验证
- 所有必填字段验证通过

#### Step 5: 状态管理与路由集成 (20分钟)
**技术要点**：
- Zustand状态设计
- 路由守卫实现
- Token持久化策略

**Checklist**：
- [ ] 创建auth store
- [ ] 实现登录状态持久化
- [ ] 配置路由跳转 - `TODO(human): 实现登录成功后的重定向逻辑`

**验收标准**：
- 登录状态跨组件共享
- 刷新页面保持登录
- 路由跳转正确

---

## 🎨 UI/UX设计规范

### 颜色系统
- **主色**：蓝色系 (blue-600)
- **成功**：绿色系 (green-600)
- **错误**：红色系 (red-600)
- **警告**：黄色系 (yellow-600)

### 间距规范
- 组件内部：使用 p-4 (1rem)
- 组件之间：使用 space-y-4 或 gap-4
- 页面边距：使用 container mx-auto px-4

### 响应式断点
- mobile: 默认
- tablet: md (768px)
- desktop: lg (1024px)
- wide: xl (1280px)

---

## 🐛 调试技巧

### React DevTools
- 组件树检查
- Props/State实时查看
- 性能分析

### 常见问题排查
1. **重渲染问题**：使用React DevTools Profiler
2. **状态更新不生效**：检查是否直接修改state
3. **TypeScript错误**：查看tsconfig.json配置
4. **样式不生效**：检查Tailwind配置和类名

---

## 📚 学习资源

### 必读文档
- [React 19 新特性](https://react.dev/blog)
- [TypeScript with React](https://react-typescript-cheatsheet.netlify.app/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com/)

### 最佳实践
- 使用函数式组件和Hooks
- 保持组件单一职责
- 优先组合而非继承
- 状态提升最小化

---

## 🚀 性能优化清单

- [ ] 使用React.lazy进行代码分割
- [ ] 对昂贵计算使用useMemo
- [ ] 对回调函数使用useCallback
- [ ] 实施虚拟列表（长列表）
- [ ] 优化图片加载（lazy loading）
- [ ] 减少bundle大小（tree shaking）

---

## 📋 技术债务追踪

### 待优化项
- [ ] 添加单元测试（Jest + React Testing Library）
- [ ] 集成E2E测试（Playwright）
- [ ] 实现国际化（i18n）
- [ ] 添加错误边界（Error Boundaries）
- [ ] 集成Storybook组件文档

### 已知限制
- 暂无离线支持
- 未实现PWA功能
- 缺少性能监控

---

## 🔐 安全注意事项

- 永远不在前端存储敏感信息
- 使用HTTPS进行API通信
- 实施内容安全策略(CSP)
- 防止XSS攻击（使用dangerouslySetInnerHTML需谨慎）
- Token存储使用httpOnly cookie（生产环境）

---

## 版本记录

### v0.1.0 (2025-01-05)
- 初始化项目结构
- 添加登录注册模块架构设计
- 配置开发环境

---

*最后更新：2025-01-05*