import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/login.vue'),
    meta: { guest: true },
  },
  {
    path: '/',
    component: () => import('@/components/layout/AppLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/pages/dashboard.vue'),
        meta: { title: '仪表盘' },
      },
      {
        path: 'customers',
        name: 'CustomerList',
        component: () => import('@/pages/customer/List.vue'),
        meta: { title: '客户管理' },
      },
      {
        path: 'customers/:id',
        name: 'CustomerDetail',
        component: () => import('@/pages/customer/Detail.vue'),
        meta: { title: '客户详情' },
      },
      {
        path: 'projects',
        name: 'ProjectList',
        component: () => import('@/pages/project/List.vue'),
        meta: { title: '项目管理' },
      },
      {
        path: 'projects/:id',
        name: 'ProjectDetail',
        component: () => import('@/pages/project/Detail.vue'),
        meta: { title: '项目详情' },
      },
      {
        path: 'users',
        name: 'UserList',
        component: () => import('@/pages/user/List.vue'),
        meta: { title: '用户管理' },
      },
      {
        path: 'tasks',
        name: 'TaskList',
        component: () => import('@/pages/task/List.vue'),
        meta: { title: '任务管理' },
      },
      {
        path: 'tasks/:id',
        name: 'TaskDetail',
        component: () => import('@/pages/task/Detail.vue'),
        meta: { title: '任务详情' },
      },
      {
        path: 'requirements',
        name: 'RequirementList',
        component: () => import('@/pages/requirement/List.vue'),
        meta: { title: '需求管理' },
      },
      {
        path: 'work-logs',
        name: 'WorkLogPage',
        component: () => import('@/pages/work-log/Index.vue'),
        meta: { title: '工时录入' },
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/pages/settings/Index.vue'),
        meta: { title: '个人设置' },
      },
    ],
  },
]
