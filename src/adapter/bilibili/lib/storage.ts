/**
 * 本地存储：油猴 API 优先，退化为 localStorage。
 *
 * 从上游 `utils/storage.ts` 内化而来，只保留 B 站适配需要的部分。
 * 双写（localStorage + GM）是为了脚本被禁用或降级时配置不丢。
 */

function createStorage(storage: Storage) {
  function getItem<T = any>(key: string): T | undefined
  function getItem<T = any>(key: string, defaultValue: T): T
  function getItem<T = any>(key: string, defaultValue?: T): T | undefined {
    try {
      const value = storage.getItem(key)
      if (value) return JSON.parse(value)
      return defaultValue
    } catch {
      return defaultValue
    }
  }

  return {
    getItem,
    setItem(key: string, value: any) {
      storage.setItem(key, JSON.stringify(value))
    },
    removeItem: storage.removeItem.bind(storage),
  }
}

export const local = createStorage(window.localStorage)

type GmStorage = Pick<
  ReturnType<typeof createStorage>,
  'getItem' | 'setItem' | 'removeItem'
>

let gm: GmStorage
try {
  if (typeof GM_getValue === 'undefined') throw new Error('GM_getValue missing')
  if (typeof GM_setValue === 'undefined') throw new Error('GM_setValue missing')

  function getItem<T = any>(key: string): T | undefined
  function getItem<T = any>(key: string, defaultValue: T): T
  function getItem<T = any>(key: string, defaultValue?: T): T | undefined {
    try {
      return GM_getValue(key) ?? local.getItem(key) ?? defaultValue
    } catch {
      return defaultValue
    }
  }

  gm = {
    getItem,
    setItem(key: string, value: any) {
      local.setItem(key, value)
      GM_setValue(key, value)
    },
    removeItem(key: string) {
      local.removeItem(key)
      if (typeof GM_deleteValue !== 'undefined') GM_deleteValue(key)
    },
  }
} catch {
  gm = local
}

export { gm }
