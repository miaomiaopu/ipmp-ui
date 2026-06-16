import api from './request'

export function generateAIReport(data: { content?: string }) {
  return api.post('/ai/generate-report', data)
}

export function summarize(data: { content: string }) {
  return api.post('/ai/summarize', data)
}
