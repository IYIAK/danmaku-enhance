/**
 * B 站适配所需的最小运行器。
 *
 * 上游 `src/runtime` 是一个多站点调度器：维护所有注册项、跨 iframe 通信（
 * 通过 postMessage 问父窗口要 href / animeScope）、搜索动作列表，并按域名
 * 选出一个「激活的注册项」。B 站只用得到其中很小一部分：
 *
 *   - `run-at document-end`，DOM 就绪后跑一次
 *   - SPA 软跳转（pushState / replaceState / popstate / hashchange）时
 *     dispose 上一轮、再跑下一轮
 *   - 派发 `routechange` 事件（panel.ts 自己在监听）
 *
 * 这里直接实现这三件事，不引入多站点调度、iframe 通信与搜索列表。
 */

type Dispose = () => void
type Run = () => void | Promise<void> | Dispose

export interface SiteHooks {
  /** 仅包含 pathname + search */
  test: RegExp | ((path: string) => boolean)
  /** 只执行一次，SPA 切换时不会重跑 */
  setup?: () => void
  /** SPA 模式下可以返回 dispose 函数 */
  run?: Run
}

function matches(test: SiteHooks['test'], target: string) {
  return typeof test === 'function' ? test(target) : test.test(target)
}

function installRouteChangeListener(onRouteChange: () => void) {
  const wrap = (type: 'pushState' | 'replaceState') => {
    const original = history[type]
    history[type] = function (this: History, ...args: any[]) {
      const result = original.apply(this, args as any)
      window.dispatchEvent(new Event('routechange'))
      return result
    } as (typeof history)[typeof type]
  }

  wrap('pushState')
  wrap('replaceState')

  window.addEventListener('popstate', onRouteChange)
  window.addEventListener('hashchange', onRouteChange)
  window.addEventListener('routechange', onRouteChange)
}

export function createSiteRunner(hooks: SiteHooks) {
  let setupsRan = false
  let disposeList: Dispose[] = []

  const active = () =>
    matches(hooks.test, location.pathname + location.search)

  const runOnce = () => {
    if (!active()) return

    if (!setupsRan) {
      setupsRan = true
      hooks.setup?.()
    }

    const result = hooks.run?.()
    if (typeof result === 'function') disposeList.push(result)
  }

  return {
    start() {
      const init = () => {
        runOnce()
        installRouteChangeListener(() => {
          disposeList.forEach((dispose) => {
            try {
              dispose()
            } catch (error) {
              console.error('[danmaku-enhance]', error)
            }
          })
          disposeList = []
          runOnce()
        })
      }

      if (document.readyState !== 'loading') init()
      else window.addEventListener('DOMContentLoaded', init)
    },
  }
}
