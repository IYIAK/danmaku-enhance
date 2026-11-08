/**
 * 番剧/集数的本地记忆。
 *
 * 上游把这两个存储写在 `player/plugins/danmaku/utils.ts`，而那个文件同时
 * 导入了 `KPlayer`，导致只要引用其中的存储函数，整个 K 播放器（连带快捷键
 * 插件、plyr.css、hls）都会被打进产物。这里只保留存储部分。
 *
 * 存储键沿用上游的名字，用户已记住的映射在升级后依然有效。
 */
import { local } from './storage'

type StorageAccessor<T> = {
  (key: string): T | undefined
  (key: string, value: T): void
  entries(): [string, T][]
}

function createStorage<T = string>(storageKey: string): StorageAccessor<T> {
  const storage = ((key: string, value?: T) => {
    const store = local.getItem<Record<string, T>>(storageKey, {})
    if (value !== undefined) {
      store[key] = value
      local.setItem(storageKey, store)
    } else {
      return store[key]
    }
  }) as StorageAccessor<T>
  storage.entries = () =>
    Object.entries(local.getItem<Record<string, T>>(storageKey, {}))
  return storage
}

/** 记忆「页面番名 → 弹弹play 番剧 id」 */
export const storageAnimeName = createStorage<{
  id: string
  name: string
  keyword: string
}>('k-player-danmaku-anime-name-v3')

/** 记忆「番名.集数 → 弹弹play 集数 id」 */
export const storageEpisodeName = createStorage<string>(
  'k-player-danmaku-episode-name-v3'
)
