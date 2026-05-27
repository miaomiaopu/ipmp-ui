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
    ],
  },
]
