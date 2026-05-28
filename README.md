# IPMP UI — 项目管理系统前端

![Vue](https://img.shields.io/badge/Vue-3.x-4FC08D?logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![Naive UI](https://img.shields.io/badge/Naive%20UI-2.x-18a058)
![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite)
![CI](https://img.shields.io/badge/CI-typecheck%20%7C%20lint%20%7C%20build-green?logo=githubactions)
![Version](https://img.shields.io/badge/Version-0.1.0-blue)
![License](https://img.shields.io/badge/License-Apache%202.0-blue)

IPMP（Intelligent Project Management Platform）前端应用，提供项目管理、工时录入、周报查看等交互界面。AI 周报优先支持 DeepSeek。

## 目录

- [特性](#特性)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [页面路由](#页面路由)
- [组件架构](#组件架构)
- [CI/CD](#cicd)
- [Docker 部署](#docker-部署)
- [安全](#安全)
- [扩展计划](#扩展计划)
- [贡献指南](#贡献指南)
- [许可证](#许可证)

## 特性

- **仪表盘**: 项目与工时概览、本周数据卡片
- **客户管理**: 客户列表、详情、搜索筛选
- **项目管理**: 项目全生命周期管理、关联客户与任务
- **任务管理**: 统一任务面板，支持项目/客户/日常三类任务的快速创建与状态流转
- **需求跟踪**: 项目需求与售后需求的管理面板
- **工时录入**: 周网格视图快速录入每日工时，支持描述编辑
- **周报查看**: 个人工作周报 + 项目周报，支持 AI 生成与编辑
- **个人设置**: AI Key 配置（DeepSeek/OpenAI/Claude），加密传输、不明文回显

## 技术栈

| 类别 | 选型 |
|------|------|
| 框架 | Vue 3 (Composition API) |
| 语言 | TypeScript 5 |
| 组件库 | Naive UI 2 |
| 构建工具 | Vite 6 |
| 状态管理 | Pinia |
| 路由 | Vue Router 4 |
| HTTP 客户端 | Axios |
| 测试 | Vitest |
| 日期处理 | dayjs |
| 工具库 | @vueuse/core |

## 快速开始

```bash
git clone <repo-url> ipmp-ui
cd ipmp-ui
pnpm install
cp .env.example .env
pnpm dev
# 默认监听 http://localhost:5173
```

生产构建：

```bash
pnpm build
# 输出到 dist/ 目录，由 Nginx 托管
```

## 项目结构

```
ipmp-ui/
├── src/
│   ├── api/                       # API 调用层 (Axios, 仅 GET/POST)
│   ├── components/
│   │   ├── layout/                # AppLayout, Sidebar, Navbar
│   │   ├── common/                # DataTable, SearchForm, StatusTag
│   │   ├── task/                  # TaskForm, KanbanCard
│   │   ├── work-log/              # DailyLogForm, WeeklyGrid
│   │   └── report/                # WeeklyReportViewer, ReportEditor
│   ├── pages/                     # 页面组件
│   ├── router/                    # 路由 + 守卫
│   ├── store/                     # Pinia 状态管理
│   ├── composables/               # 组合式函数
│   ├── types/                     # TypeScript 类型定义
│   └── utils/                     # 工具函数
├── .github/workflows/
│   ├── ci.yml                     # CI: typecheck + lint + test + build
│   └── deploy.yml                 # CD: 静态资源部署
├── index.html
├── vite.config.ts
└── .env.example
```

## 页面路由

| 路由 | 页面 | 说明 |
|------|------|------|
| `/login` | LoginPage | 登录页 |
| `/dashboard` | DashboardPage | 仪表盘概览 |
| `/customers` | CustomerListPage | 客户列表 |
| `/customers/:id` | CustomerDetailPage | 客户详情 |
| `/projects` | ProjectListPage | 项目列表 |
| `/projects/:id` | ProjectDetailPage | 项目详情（含任务 Tab） |
| `/tasks` | TaskListPage | 任务列表（按类型筛选） |
| `/tasks/:id` | TaskDetailPage | 任务详情 |
| `/requirements` | RequirementListPage | 需求列表 |
| `/requirements/:id` | RequirementDetailPage | 需求详情 |
| `/work-logs` | WorkLogPage | 工时录入（周网格） |
| `/reports/weekly` | WeeklyReportPage | 个人周报 |
| `/reports/project` | ProjectReportPage | 项目周报 |
| `/settings` | SettingsPage | 个人设置 + AI 配置 |

## 组件架构

```
AppLayout
├── Sidebar (Naive UI Menu)
│   ├── 仪表盘 / 客户管理 / 项目管理 / 任务管理
│   ├── 需求管理 / 工时录入 / 周报 / 设置
├── Navbar (面包屑 + 通知 + 用户菜单)
└── <router-view />
```

## CI/CD

| Pipeline | 触发 | 内容 |
|----------|------|------|
| **CI** | push / PR to main | typecheck → lint → test → gitleaks → build |
| **CD-Dev** | tag `dev*` | build → rsync dist/ → 云服务器 Nginx |
| **Pages** | push to main | build → deploy to GitHub Pages |

## 部署

前端静态资源与后端共用 docker-compose，Nginx 反向代理：

```
/opt/ipmp/www/  ← CD-Dev 自动部署 dist/
    ↓ (docker-compose 挂载)
/var/www/html   ← nginx container root
```

## 安全

- **认证**: JWT Token 存储于 Pinia store，Axios 拦截器自动附加 Authorization 头
- **传输**: 所有 API 请求仅使用 GET/POST 方法
- **AI Key**: 前端密码框输入，不明文回显，仅返回掩码预览
- **XSS**: Naive UI 默认转义 + CSP 响应头

## 扩展计划

- [x] 客户/项目页面 + 双主题 + 响应式 + CI/CD (Phase 1)
- [ ] 任务管理 + 需求跟踪 + 工时录入 + 个人设置 (Phase 2)
- [ ] 周报查看 + AI 生成交互 (Phase 3-4)
- [ ] 暗色模式 + 通知系统 (Phase 5)

## 许可证

本项目基于 Apache License 2.0 开源。详见 [LICENSE](LICENSE)。

Copyright 2026 miaomiaopu
