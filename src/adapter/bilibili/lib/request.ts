/**
 * GM_xmlhttpRequest 的 Promise 封装。
 *
 * 从上游 `utils/request.ts` 内化，行为保持一致：GET/POST、query 参数拼接、
 * 以 `responseType: 'json'` 直接拿解析后的对象。
 */

export interface RequestOptions {
  url: string
  method?: 'GET' | 'POST'
  params?: Record<string, any>
  headers?: Record<string, string>
}

export function request<T = any>(opts: RequestOptions): Promise<T> {
  let { url, method, params } = opts

  if (params) {
    const u = new URL(url)
    Object.keys(params).forEach((key) => {
      const value = params[key]
      if (value !== undefined && value !== null) {
        u.searchParams.set(key, String(value))
      }
    })
    url = u.toString()
  }

  return new Promise<T>((resolve, reject) => {
    GM_xmlhttpRequest({
      url,
      method: method || 'GET',
      responseType: 'json',
      headers: opts.headers,
      onload: (res: any) => resolve(res.response),
      onerror: reject,
      ontimeout: () => reject(new Error('请求超时')),
    })
  })
}
