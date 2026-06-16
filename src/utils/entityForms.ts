type WorkLogForm = {
  task_id: string | null
  project_id: string | null
  customer_id: string | null
  log_date: string
  hours: string | number
  description: string
}

export const projectStatusOptions = [
  { label: '立项', value: 'planning' },
  { label: '实施中', value: 'in_progress' },
  { label: '已上线', value: 'online' },
  { label: '已竣工', value: 'completed' },
]

export const projectStatusLabel = Object.fromEntries(
  projectStatusOptions.map((option) => [option.value, option.label]),
) as Record<string, string>

export const requirementStatusOptions = [
  { label: '待处理', value: 'pending' },
  { label: '待测试', value: 'testing' },
  { label: '已关闭', value: 'closed' },
  { label: '已测试', value: 'tested' },
  { label: '已上线', value: 'online' },
]

export const requirementStatusLabel = Object.fromEntries(
  requirementStatusOptions.map((option) => [option.value, option.label]),
) as Record<string, string>

function normalizeRelation(value: string | null) {
  return value && value.trim() !== '' ? value : null
}

export function buildWorkLogPayload(form: WorkLogForm) {
  return {
    task_id: normalizeRelation(form.task_id),
    project_id: normalizeRelation(form.project_id),
    customer_id: normalizeRelation(form.customer_id),
    log_date: form.log_date,
    hours: typeof form.hours === 'number' ? form.hours : parseFloat(form.hours),
    description: form.description,
  }
}

export function maskName(name: string) {
  if (!name) return '-'
  return name[0] + '*'.repeat(Math.max(name.length - 1, 0))
}

export function maskPhone(phone: string) {
  if (!phone || phone.length < 8) return phone || '-'
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`
}

export function maskEmail(email: string) {
  if (!email) return '-'
  const [account, domain] = email.split('@')
  if (!domain || !account) return '****'
  return `${account[0]}****@${domain}`
}

export function maskAddress(address: string) {
  if (!address) return '-'
  if (address.length <= 3) return `${address[0]}**`
  return `${address.slice(0, 3)}****`
}
