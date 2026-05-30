// 统一 API 响应
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  pagination?: Pagination
}

export interface Pagination {
  page: number
  page_size: number
  total: number
  total_pages: number
}

// 用户
export interface UserBrief {
  id: string
  username: string
  display_name: string
  role: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  user: UserBrief
}

// 客户
export interface Customer {
  id: string
  customer_code: string
  name: string
  contact_person: string
  contact_phone: string
  contact_email: string
  address: string
  notes: string
  status: string
  created_at: string
  updated_at: string
}

// 项目
export interface Project {
  id: string
  project_code: string
  name: string
  customer_id: string | null
  manager_id: string | null
  start_date: string | null
  go_live_date: string | null
  completion_date: string | null
  status: string
  description: string
  created_at: string
  updated_at: string
  customer?: Customer
  manager?: UserBrief
}

// 任务 (v0.2: 去assignee,去工时)
export interface Task {
  id: string
  task_type: string
  title: string
  description: string
  project_id: string | null
  customer_id: string | null
  status: string
  priority: string
  due_date: string | null
  created_at: string
  updated_at: string
  project?: Project
  customer?: Customer
}

// 需求 (v0.2: 去submitter,增requirement_code/scheduled_date)
export interface Requirement {
  id: string
  req_type: string
  requirement_code: string
  title: string
  description: string
  project_id: string | null
  customer_id: string | null
  priority: string
  status: string
  scheduled_date: string | null
  created_at: string
  updated_at: string
  project?: Project
  customer?: Customer
}

// 工时记录
export interface WorkLog {
  id: string
  task_id: string | null
  user_id: string
  project_id: string | null
  customer_id: string | null
  log_date: string
  hours: number
  description: string
  created_at: string
}

// 周报
export interface WeeklyReport {
  id: string
  user_id: string
  week_start: string
  week_end: string
  report_type: string
  project_id: string | null
  content: string
  ai_raw_content: string | null
  status: string
  created_at: string
  updated_at: string
}
