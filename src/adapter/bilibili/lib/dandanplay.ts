/**
 * 弹弹play 接口封装。
 *
 * 从上游 `player/plugins/danmaku/apis.ts` 内化。原始文件通过
 * `danmaku/utils.ts` 间接依赖 KPlayer（值导入），会把整个 K 播放器打进
 * B 站脚本，这里只保留真正用到的三个接口。
 *
 * https://api.dandanplay.net/swagger/index.html
 */
import { memoize } from 'lodash-es'
import { request, type RequestOptions } from './request'

const KEY =
  'eyJYLUFwcElkIjoiaHZmNnB6dnhjbSIsIlgtQXBwU2VjcmV0IjoiSVpoY1VJYWtveEZhSzl4QkJESjlCczFPVTJzNGtLNXQifQ=='
const headers = JSON.parse(atob(KEY))

const baseURL = 'https://api.dandanplay.net'

const client = <T = unknown>(opts: RequestOptions) =>
  request<T>({ ...opts, headers, url: baseURL + opts.url })

type DDPResult<T> = {
  errorCode: number
  success: boolean
  errorMessage: string
} & T

/** 弹幕模式，与原生播放器的轨道定义一致 */
export type CommentMode = 'ltr' | 'rtl' | 'top' | 'bottom'

export interface DanmakuComment {
  text?: string
  mode?: CommentMode
  /** 秒 */
  time: number
  style?: Partial<CSSStyleDeclaration>
}

type RawComments = {
  count: number
  comments: {
    m: string
    /** time,type,color,uid */
    p: string
  }[]
}

function convert32ToHex(color: string) {
  return '#' + parseInt(color).toString(16)
}

export async function getComments(
  episodeId: number | string
): Promise<DanmakuComment[]> {
  const res = await client<RawComments>({
    url: `/api/v2/comment/${episodeId}`,
    params: { chConvert: 1, withRelated: true },
  })

  const cmts = res.comments.map((o) => {
    const [time, type, color] = o.p.split(',')

    return {
      mode: ({ 1: 'rtl', 4: 'bottom', 5: 'top' } as const)[type] || 'rtl',
      text: o.m,
      time: parseFloat(time),
      style: { color: convert32ToHex(color) },
    }
  })

  return cmts.sort((a, b) => a.time - b.time)
}

type DDPSearchAnimeResponse = DDPResult<{
  animes: {
    animeId: number
    animeTitle: string
    bangumiId: string
    episodeCount: number
    imageUrl: string
    isFavorited: boolean
    rating: number
    startDate: string
    type: string
    typeDescription: string
  }[]
}>

export interface Anime {
  id: string
  name: string
}

export async function queryAnimes(anime: string): Promise<Anime[]> {
  const res = await client<DDPSearchAnimeResponse>({
    url: `/api/v2/search/anime`,
    params: { keyword: anime },
  })

  if (!res.success) throw new Error(res.errorMessage)

  const nameCountMap = new Map<string, number>()
  res.animes.forEach((o) => {
    nameCountMap.set(o.animeTitle, (nameCountMap.get(o.animeTitle) || 0) + 1)
  })

  return res.animes.map((o) => ({
    id: o.bangumiId,
    name:
      nameCountMap.get(o.animeTitle)! > 1
        ? `${o.animeTitle}(${o.typeDescription})`
        : o.animeTitle,
  }))
}

type DDPBangumiResponse = DDPResult<{
  bangumi: {
    episodes: {
      episodeId: number
      episodeTitle: string
    }[]
  }
}>

export interface Episode {
  id: number
  name: string
}

export const queryEpisodes = memoize(async function (
  animeId: string
): Promise<Episode[]> {
  const res = await client<DDPBangumiResponse>({
    url: `/api/v2/bangumi/${animeId}`,
  })

  if (!res.success) {
    setTimeout(() => queryEpisodes.cache.clear?.(), 100)
    throw new Error(res.errorMessage)
  }
  return res.bangumi.episodes.map((o) => ({
    id: o.episodeId,
    name: o.episodeTitle,
  }))
})
