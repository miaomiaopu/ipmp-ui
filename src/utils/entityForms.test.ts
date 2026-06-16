import { describe, expect, it } from 'vitest'
import {
  buildWorkLogPayload,
  maskAddress,
  maskEmail,
  maskName,
  maskPhone,
  projectStatusOptions,
  requirementStatusOptions,
} from './entityForms'

describe('sensitive field masking', () => {
  it('masks customer contact fields consistently', () => {
    expect(maskName('张三')).toBe('张*')
    expect(maskPhone('13800138000')).toBe('138****8000')
    expect(maskEmail('alice@example.com')).toBe('a****@example.com')
    expect(maskAddress('北京市朝阳区')).toBe('北京市****')
  })
})

describe('status options', () => {
  it('uses the required requirement status workflow', () => {
    expect(requirementStatusOptions).toEqual([
      { label: '待处理', value: 'pending' },
      { label: '待测试', value: 'testing' },
      { label: '已关闭', value: 'closed' },
      { label: '已测试', value: 'tested' },
      { label: '已上线', value: 'online' },
    ])
  })

  it('exposes project statuses for direct list updates', () => {
    expect(projectStatusOptions.map((option) => option.value)).toEqual([
      'planning',
      'in_progress',
      'online',
      'completed',
    ])
  })
})

describe('work log form payload', () => {
  it('allows creating work logs without a task while keeping project and customer associations', () => {
    expect(buildWorkLogPayload({
      task_id: null,
      project_id: 'project-1',
      customer_id: 'customer-1',
      log_date: '2026-06-16',
      hours: '2.5',
      description: '客户沟通',
    })).toEqual({
      task_id: null,
      project_id: 'project-1',
      customer_id: 'customer-1',
      log_date: '2026-06-16',
      hours: 2.5,
      description: '客户沟通',
    })
  })

  it('normalizes blank relation fields to null', () => {
    expect(buildWorkLogPayload({
      task_id: '',
      project_id: '',
      customer_id: '',
      log_date: '2026-06-16',
      hours: '8',
      description: '',
    })).toMatchObject({
      task_id: null,
      project_id: null,
      customer_id: null,
      hours: 8,
    })
  })
})
