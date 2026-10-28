/** 把 GM 请求、原生 Error 和普通对象统一成可读的提示文案。 */
export function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message
  if (typeof error === 'string' && error) return error

  if (error && typeof error === 'object') {
    const value = error as {
      message?: unknown
      status?: unknown
      statusText?: unknown
      type?: unknown
    }
    if (typeof value.message === 'string' && value.message) return value.message
    if (typeof value.status === 'number' && value.status > 0) {
      return `HTTP ${value.status}${value.statusText ? ` ${value.statusText}` : ''}`
    }
    if (typeof value.type === 'string' && value.type) {
      return `网络请求失败（${value.type}）`
    }
    try {
      const json = JSON.stringify(error)
      if (json && json !== '{}') return json
    } catch {
      // 忽略不可序列化对象，使用统一兜底文案
    }
  }

  return '未知错误'
}
