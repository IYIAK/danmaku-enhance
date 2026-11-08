// ==UserScript==
// @name         Danmaku Enhance
// @namespace    https://github.com/IYIAK/danmaku-enhance
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSIjZmI3Mjk5IiBkPSJNNCA0aDE2YTIgMiAwIDAgMSAyIDJ2OWEyIDIgMCAwIDEtMiAyaC03bC00LjYgMy41QTEgMSAwIDAgMSA3IDE5LjZWMTdINGEyIDIgMCAwIDEtMi0yVjZhMiAyIDAgMCAxIDItMlptMiA0djJoMlY4SDZabTQgMHYyaDhWOGgtOFptLTQgNHYyaDh2LTJINlptMTAgMHYyaDJ2LTJoLTJaIi8+PC9zdmc+
// @version      2.1.0
// @description  把弹弹play、哔哩哔哩 URL 源与巴哈姆特动画疯的弹幕合并进哔哩哔哩原生播放器
// @author       IYIAK
// @match        https://www.bilibili.com/*
// @match        https://bilibili.com/*
// @run-at       document-end
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_info
// @grant        GM_deleteValue
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @connect      dandanplay.net
// @connect      api.bilibili.com
// @connect      ani.gamer.com.tw
// @license      MIT
// @downloadURL  https://github.com/IYIAK/danmaku-enhance/raw/gh-pages/index.user.js
// @updateURL    https://github.com/IYIAK/danmaku-enhance/raw/gh-pages/index.user.js
// ==/UserScript==
/**
* 权限声明:
* 1. GM_xmlhttpRequest
*    脚本会请求有限的网络权限，仅用于查询弹弹play、哔哩哔哩与巴哈姆特动画疯的弹幕。
*    你可以从 脚本编辑/设置/XHR安全 中管理网络权限。
* 2. GM_getValue, GM_setValue, GM_deleteValue
*    脚本会使用本地存储保存匹配记忆、过滤器与白名单配置。
* 3. GM_registerMenuCommand
*    脚本会在油猴菜单中注册常用指令的按钮。
*/
(function() {
	//#region \0virtual:bocchi-style-runtime
	function injectStyle(css) {
		if (typeof document === "undefined") return;
		const style = document.createElement("style");
		style.setAttribute("data-bocchi", "");
		document.head.append(style);
		style.textContent = css;
	}
	//#endregion
	//#region src/adapter/bilibili/index.scss
	injectStyle("@charset \"UTF-8\";\n.k-bili-dm__btn {\n  margin: 0;\n  padding: 0;\n  border: 0;\n  background: none;\n  cursor: pointer;\n  opacity: 0.9;\n  transition: opacity 0.15s;\n  width: 36px;\n  height: 22px;\n  line-height: 22px;\n  font-size: 0;\n  text-align: center;\n  margin-right: 8px;\n  transform: translateY(1px);\n  visibility: hidden;\n}\n.k-bili-dm__btn.is-placed, .k-bili-dm__btn.is-floating {\n  visibility: visible;\n}\n.k-bili-dm__btn .bpx-player-ctrl-btn-icon {\n  width: 100%;\n}\n.k-bili-dm__btn .bpx-common-svg-icon {\n  display: inline-flex;\n  width: 100%;\n  height: 22px;\n  justify-content: center;\n  align-items: center;\n  vertical-align: middle;\n}\n.k-bili-dm__btn svg {\n  display: block;\n  width: 100%;\n  height: 100%;\n}\n.k-bili-dm__btn:hover, .k-bili-dm__btn.is-active {\n  opacity: 1;\n  color: #fb7299;\n}\n@media screen and (min-width: 750px) {\n  .bpx-player-container[data-screen=full] .k-bili-dm__btn, .bpx-player-container[data-screen=web] .k-bili-dm__btn {\n    width: 54px;\n    height: 43px;\n    line-height: 32px;\n  }\n  .bpx-player-container[data-screen=full] .k-bili-dm__btn .bpx-common-svg-icon, .bpx-player-container[data-screen=web] .k-bili-dm__btn .bpx-common-svg-icon {\n    height: 28px;\n  }\n  .bpx-player-container[data-screen=full] .k-bili-dm__btn.is-floating, .bpx-player-container[data-screen=web] .k-bili-dm__btn.is-floating {\n    width: 32px;\n    height: 32px;\n    line-height: 32px;\n  }\n  .bpx-player-container[data-screen=full] .k-bili-dm__btn.is-floating .bpx-common-svg-icon, .bpx-player-container[data-screen=web] .k-bili-dm__btn.is-floating .bpx-common-svg-icon {\n    height: 20px;\n  }\n}\n.k-bili-dm__btn.is-floating {\n  position: fixed;\n  right: 16px;\n  bottom: 104px;\n  z-index: 100001;\n  width: 32px;\n  height: 32px;\n  line-height: 32px;\n  border-radius: 50%;\n  background: rgba(24, 25, 28, 0.9);\n  color: #fff;\n}\n.k-bili-dm__btn.is-floating .bpx-common-svg-icon {\n  height: 20px;\n}\n.k-bili-dm__panel {\n  position: fixed;\n  z-index: 100002;\n  box-sizing: border-box;\n  display: flex;\n  flex-direction: column;\n  max-height: 70vh;\n  overflow: hidden;\n  border: 1px solid rgba(255, 255, 255, 0.08);\n  border-radius: 8px;\n  background: rgba(24, 25, 26, 0.95);\n  color: #e5e7eb;\n  font-size: 13px;\n  line-height: 1.5;\n  text-align: left;\n  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.6);\n  backdrop-filter: blur(10px) saturate(100%);\n  -webkit-backdrop-filter: blur(10px) saturate(100%);\n}\n.k-bili-dm__panel[hidden] {\n  display: none;\n}\n.k-bili-dm__header {\n  flex: 0 0 auto;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 8px 10px 8px 12px;\n  background: rgba(24, 25, 26, 0.95);\n  border-bottom: 1px solid rgba(255, 255, 255, 0.08);\n  border-radius: 8px 8px 0 0;\n}\n.k-bili-dm__title {\n  font-weight: 600;\n  font-size: 13px;\n  color: #fff;\n}\n.k-bili-dm__version {\n  flex: 0 0 auto;\n  margin-left: 6px;\n  margin-right: auto;\n  font-size: 11px;\n  color: #6b7280;\n  user-select: text;\n}\n.k-bili-dm__version:empty {\n  display: none;\n}\n.k-bili-dm__close {\n  width: 20px;\n  height: 20px;\n  padding: 0;\n  border: 0;\n  border-radius: 4px;\n  background: transparent;\n  color: #9ca3af;\n  font-size: 16px;\n  line-height: 1;\n  cursor: pointer;\n}\n.k-bili-dm__close:hover {\n  background: rgba(255, 255, 255, 0.12);\n  color: #fff;\n}\n.k-bili-dm__body {\n  flex: 1 1 auto;\n  min-height: 0;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  padding: 10px;\n  overflow-y: auto;\n  overscroll-behavior: contain;\n  border-radius: 0 0 8px 8px;\n  scrollbar-width: thin;\n  scrollbar-color: rgba(255, 255, 255, 0.22) transparent;\n}\n.k-bili-dm__body::-webkit-scrollbar {\n  width: 6px;\n}\n.k-bili-dm__body::-webkit-scrollbar-track {\n  background: transparent;\n}\n.k-bili-dm__body::-webkit-scrollbar-thumb {\n  border-radius: 3px;\n  background: rgba(255, 255, 255, 0.22);\n}\n.k-bili-dm__body > * {\n  flex: 0 0 auto;\n}\n.k-bili-dm__row {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.k-bili-dm__row--input {\n  gap: 6px;\n}\n.k-bili-dm__label {\n  flex: 1 1 auto;\n  color: #d1d5db;\n  user-select: none;\n}\n.k-bili-dm__switch {\n  position: relative;\n  display: inline-block;\n  flex: 0 0 auto;\n  width: 34px;\n  height: 18px;\n}\n.k-bili-dm__switch input {\n  position: absolute;\n  width: 0;\n  height: 0;\n  opacity: 0;\n}\n.k-bili-dm__slider {\n  position: absolute;\n  inset: 0;\n  border-radius: 9px;\n  background: rgba(255, 255, 255, 0.25);\n  cursor: pointer;\n  transition: background 0.15s ease;\n}\n.k-bili-dm__slider::before {\n  content: \"\";\n  position: absolute;\n  top: 2px;\n  left: 2px;\n  width: 14px;\n  height: 14px;\n  border-radius: 50%;\n  background: #fff;\n  transition: transform 0.15s ease;\n}\n.k-bili-dm__switch input:checked + .k-bili-dm__slider {\n  background: #fb7299;\n}\n.k-bili-dm__switch input:checked + .k-bili-dm__slider::before {\n  transform: translateX(16px);\n}\n.k-bili-dm__status {\n  padding: 6px 8px;\n  border-radius: 6px;\n  background: rgba(255, 255, 255, 0.06);\n  word-break: break-all;\n}\n.k-bili-dm__status-main {\n  color: #e5e7eb;\n}\n.k-bili-dm__status-sub {\n  margin-top: 2px;\n  color: #9ca3af;\n  font-size: 11px;\n  white-space: pre-line;\n}\n.k-bili-dm__status-actions {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin-top: 4px;\n}\n.k-bili-dm__status-reload {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 18px;\n  height: 18px;\n  margin-left: auto;\n  padding: 0;\n  border: 0;\n  border-radius: 4px;\n  background: none;\n  color: #60a5fa;\n  cursor: pointer;\n  transition: background-color 0.15s;\n}\n.k-bili-dm__status-reload svg {\n  width: 13px;\n  height: 13px;\n  display: block;\n}\n.k-bili-dm__status-reload:hover {\n  background: rgba(96, 165, 250, 0.18);\n  color: #93c5fd;\n}\n.k-bili-dm__status-reload[hidden] {\n  display: none;\n}\n.k-bili-dm__debug-toggle {\n  padding: 0;\n  border: 0;\n  background: none;\n  color: #60a5fa;\n  font-size: 11px;\n  line-height: 1;\n  cursor: pointer;\n}\n.k-bili-dm__debug-toggle:hover {\n  text-decoration: underline;\n}\n.k-bili-dm__debug {\n  margin-top: 4px;\n  padding-top: 4px;\n  border-top: 1px dashed rgba(255, 255, 255, 0.12);\n  color: #8b93a1;\n  font-size: 10px;\n  line-height: 1.5;\n  white-space: pre-wrap;\n  word-break: break-all;\n}\n.k-bili-dm__section {\n  margin-top: 2px;\n  padding-top: 8px;\n  border-top: 1px solid rgba(255, 255, 255, 0.08);\n  color: #9ca3af;\n  font-size: 11px;\n  font-weight: 600;\n  letter-spacing: 0.02em;\n}\n.k-bili-dm__section--row {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  cursor: pointer;\n}\n.k-bili-dm__section--row:hover {\n  color: #d1d5db;\n}\n.k-bili-dm__section--row > span:first-child {\n  flex: 1 1 auto;\n}\n.k-bili-dm__icon-text {\n  flex: 0 0 auto;\n  height: 20px;\n  padding: 0 6px;\n  border: 1px solid rgba(255, 255, 255, 0.16);\n  border-radius: 3px;\n  background: transparent;\n  color: #9ca3af;\n  font-size: 11px;\n  font-weight: 400;\n  cursor: pointer;\n  white-space: nowrap;\n}\n.k-bili-dm__icon-text:hover {\n  border-color: #fb7299;\n  color: #fff;\n}\n.k-bili-dm__fold-btn {\n  flex: 0 0 auto;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 20px;\n  height: 20px;\n  padding: 0;\n  border: 0;\n  background: transparent;\n  color: #9ca3af;\n  cursor: pointer;\n  transition: transform 0.15s, color 0.15s;\n}\n.k-bili-dm__fold-btn svg {\n  width: 16px;\n  height: 16px;\n  display: block;\n}\n.k-bili-dm__fold-btn:hover {\n  color: #fff;\n}\n.k-bili-dm__fold-btn.is-expanded {\n  transform: rotate(180deg);\n  color: #fb7299;\n}\n.k-bili-dm__textarea {\n  width: 100%;\n  box-sizing: border-box;\n  padding: 6px 8px;\n  border: 1px solid rgba(255, 255, 255, 0.16);\n  border-radius: 4px;\n  background: rgba(0, 0, 0, 0.35);\n  color: #e5e7eb;\n  font-size: 12px;\n  font-family: inherit;\n  line-height: 1.5;\n  resize: vertical;\n  outline: none;\n}\n.k-bili-dm__textarea:focus {\n  border-color: #fb7299;\n}\n.k-bili-dm__textarea::placeholder {\n  color: #6b7280;\n}\n.k-bili-dm__checks {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  flex-wrap: wrap;\n}\n.k-bili-dm__fold {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n.k-bili-dm__fold[hidden] {\n  display: none;\n}\n.k-bili-dm__check {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  color: #d1d5db;\n  font-size: 12px;\n  cursor: pointer;\n  user-select: none;\n}\n.k-bili-dm__check input {\n  width: 12px;\n  height: 12px;\n  margin: 0;\n  accent-color: #fb7299;\n  cursor: pointer;\n}\n.k-bili-dm__input {\n  flex: 1 1 auto;\n  min-width: 0;\n  height: 26px;\n  padding: 0 8px;\n  box-sizing: border-box;\n  border: 1px solid rgba(255, 255, 255, 0.16);\n  border-radius: 4px;\n  background: rgba(0, 0, 0, 0.35);\n  color: #e5e7eb;\n  font-size: 12px;\n  outline: none;\n}\n.k-bili-dm__input:focus {\n  border-color: #fb7299;\n}\n.k-bili-dm__input::placeholder {\n  color: #6b7280;\n}\n.k-bili-dm__mini {\n  flex: 0 0 auto;\n  height: 26px;\n  padding: 0 10px;\n  border: 1px solid rgba(255, 255, 255, 0.18);\n  border-radius: 4px;\n  background: rgba(255, 255, 255, 0.08);\n  color: #e5e7eb;\n  font-size: 12px;\n  cursor: pointer;\n  white-space: nowrap;\n}\n.k-bili-dm__mini:hover {\n  background: rgba(255, 255, 255, 0.16);\n}\n.k-bili-dm__fold-badge {\n  flex: 0 0 auto;\n  min-width: 16px;\n  height: 16px;\n  padding: 0 4px;\n  box-sizing: border-box;\n  border-radius: 8px;\n  background: rgba(251, 114, 153, 0.18);\n  color: #fb7299;\n  font-size: 10px;\n  font-weight: 600;\n  line-height: 16px;\n  text-align: center;\n}\n.k-bili-dm__fold-badge:empty {\n  display: none;\n}\n.k-bili-dm__minor {\n  width: 100%;\n  height: 26px;\n  padding: 0 8px;\n  border: 1px dashed rgba(255, 255, 255, 0.16);\n  border-radius: 4px;\n  background: transparent;\n  color: #9ca3af;\n  font-size: 11px;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 5px;\n}\n.k-bili-dm__minor svg {\n  width: 12px;\n  height: 12px;\n  flex: 0 0 auto;\n  display: block;\n}\n.k-bili-dm__minor:hover:not(:disabled) {\n  border-color: #fb7299;\n  color: #fff;\n}\n.k-bili-dm__minor:disabled {\n  opacity: 0.5;\n  cursor: default;\n}\n.k-bili-dm__select {\n  width: 100%;\n  height: 26px;\n  padding: 0 4px;\n  border: 1px solid rgba(255, 255, 255, 0.16);\n  border-radius: 4px;\n  background: rgba(0, 0, 0, 0.35);\n  color: #e5e7eb;\n  font-size: 12px;\n  outline: none;\n}\n.k-bili-dm__select option {\n  background: #1f2024;\n  color: #e5e7eb;\n}\n.k-bili-dm__list {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  max-height: 200px;\n  min-height: 0;\n  overflow-y: auto;\n  overscroll-behavior: contain;\n}\n.k-bili-dm__list[hidden] {\n  display: none;\n}\n.k-bili-dm__item {\n  flex: 0 0 auto;\n  display: block;\n  box-sizing: border-box;\n  width: 100%;\n  padding: 6px 10px;\n  border: 1px solid transparent;\n  border-radius: 4px;\n  background: rgba(255, 255, 255, 0.06);\n  color: #e5e7eb;\n  font-size: 12px;\n  line-height: 1.5;\n  text-align: left;\n  cursor: pointer;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.k-bili-dm__item:hover {\n  border-color: #fb7299;\n  background: rgba(251, 114, 153, 0.16);\n}\n.k-bili-dm__item.is-active {\n  border-color: #fb7299;\n  background: rgba(251, 114, 153, 0.16);\n  color: #fff;\n}\n.k-bili-dm__list {\n  overscroll-behavior: contain;\n}\n.k-bili-dm__url {\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n  padding: 6px 8px;\n  border-radius: 6px;\n  background: rgba(255, 255, 255, 0.06);\n}\n.k-bili-dm__url-head {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n.k-bili-dm__url-name {\n  flex: 1 1 auto;\n  min-width: 0;\n  color: #e5e7eb;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.k-bili-dm__url-name--link {\n  text-decoration: none;\n  cursor: pointer;\n  pointer-events: auto;\n}\n.k-bili-dm__url-name--link:hover {\n  color: #fb7299;\n  text-decoration: underline;\n}\n.k-bili-dm__icon {\n  flex: 0 0 auto;\n  width: 18px;\n  height: 18px;\n  padding: 0;\n  border: 0;\n  border-radius: 3px;\n  background: transparent;\n  color: #9ca3af;\n  font-size: 14px;\n  line-height: 1;\n  cursor: pointer;\n}\n.k-bili-dm__icon:hover {\n  background: rgba(255, 255, 255, 0.12);\n  color: #fff;\n}\n.k-bili-dm__url-ep {\n  color: #9ca3af;\n  font-size: 11px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.k-bili-dm__url-offset {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  color: #9ca3af;\n  font-size: 11px;\n}\n.k-bili-dm__offset {\n  width: 60px;\n  height: 20px;\n  padding: 0 4px;\n  box-sizing: border-box;\n  border: 1px solid rgba(255, 255, 255, 0.16);\n  border-radius: 3px;\n  background: rgba(0, 0, 0, 0.35);\n  color: #e5e7eb;\n  font-size: 11px;\n  outline: none;\n}\n.k-bili-dm__offset:focus {\n  border-color: #fb7299;\n}\n.k-bili-dm__url-progress {\n  color: #6ee7b7;\n  font-size: 11px;\n}\n.k-bili-dm__url-progress.is-error {\n  color: #fca5a5;\n}\n.k-bili-dm__tip {\n  color: #6b7280;\n  font-size: 11px;\n  line-height: 1.6;\n  /* 句式是中文夹英文产品名，break-all 会把 dandanplay 从中间劈开，\n     用 anywhere 让它优先在空格和标点处换，实在一行放不下再断词。 */\n  word-break: normal;\n  overflow-wrap: anywhere;\n}\n.k-bili-dm__tip.is-error {\n  color: #fca5a5;\n}\n\n/* ── 左下角轻提示 ────────────────────────────────────────────\n   刻意贴近 B 站自己的提示条：深色半透明、圆角、左边一个图标，\n   位置贴着播放器左下角、压在控制条上方。\n   可以叠多条（番剧名一条、条数一条），从下往上排。 */\n.k-bili-dm-toast {\n  position: fixed;\n  z-index: 100003;\n  box-sizing: border-box;\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n  gap: 6px;\n  max-width: min(480px, 70vw);\n  pointer-events: none;\n}\n.k-bili-dm-toast[hidden] {\n  display: none;\n}\n.k-bili-dm-toast__item {\n  box-sizing: border-box;\n  display: inline-flex;\n  align-items: center;\n  gap: 8px;\n  /* 单行不换行，和 B 站自己的提示一致；放不下就省略号 */\n  max-width: 100%;\n  padding: 9px 14px;\n  border-radius: 6px;\n  background: rgba(24, 25, 26, 0.95);\n  color: #e5e7eb;\n  font-size: 13px;\n  line-height: 1.4;\n  text-align: left;\n  white-space: nowrap;\n  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45);\n  backdrop-filter: blur(10px) saturate(100%);\n  -webkit-backdrop-filter: blur(10px) saturate(100%);\n  opacity: 0;\n  transform: translateY(6px);\n  transition: opacity 0.2s ease, transform 0.2s ease;\n}\n.k-bili-dm-toast__item.is-visible {\n  opacity: 1;\n  transform: translateY(0);\n}\n.k-bili-dm-toast__icon {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  flex: 0 0 auto;\n  width: 16px;\n  height: 16px;\n  color: #fb7299;\n  line-height: 0;\n}\n.k-bili-dm-toast__icon svg {\n  width: 16px;\n  height: 16px;\n  display: block;\n}\n.k-bili-dm-toast__text {\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.k-bili-dm-toast__action {\n  flex: 0 0 auto;\n  height: 24px;\n  padding: 0 12px;\n  border: 1px solid rgba(251, 114, 153, 0.6);\n  border-radius: 4px;\n  background: rgba(251, 114, 153, 0.16);\n  color: #fb7299;\n  font-size: 12px;\n  cursor: pointer;\n  pointer-events: auto;\n  white-space: nowrap;\n}\n.k-bili-dm-toast__action:hover {\n  background: rgba(251, 114, 153, 0.32);\n  color: #fff;\n}");
	//#endregion
	//#region src/adapter/bilibili/lib/storage.ts
	/**
	* 本地存储：油猴 API 优先，退化为 localStorage。
	*
	* 从上游 `utils/storage.ts` 内化而来，只保留 B 站适配需要的部分。
	* 双写（localStorage + GM）是为了脚本被禁用或降级时配置不丢。
	*/
	function createStorage$1(storage) {
		function getItem(key, defaultValue) {
			try {
				const value = storage.getItem(key);
				if (value) return JSON.parse(value);
				return defaultValue;
			} catch (_unused) {
				return defaultValue;
			}
		}
		return {
			getItem,
			setItem(key, value) {
				storage.setItem(key, JSON.stringify(value));
			},
			removeItem: storage.removeItem.bind(storage)
		};
	}
	const local = createStorage$1(window.localStorage);
	let gm;
	try {
		if (typeof GM_getValue === "undefined") throw new Error("GM_getValue missing");
		if (typeof GM_setValue === "undefined") throw new Error("GM_setValue missing");
		function getItem(key, defaultValue) {
			try {
				var _ref, _GM_getValue;
				return (_ref = (_GM_getValue = GM_getValue(key)) !== null && _GM_getValue !== void 0 ? _GM_getValue : local.getItem(key)) !== null && _ref !== void 0 ? _ref : defaultValue;
			} catch (_unused2) {
				return defaultValue;
			}
		}
		gm = {
			getItem,
			setItem(key, value) {
				local.setItem(key, value);
				GM_setValue(key, value);
			},
			removeItem(key) {
				local.removeItem(key);
				if (typeof GM_deleteValue !== "undefined") GM_deleteValue(key);
			}
		};
	} catch (_unused3) {
		gm = local;
	}
	//#endregion
	//#region \0@oxc-project+runtime@0.139.0/helpers/esm/typeof.js
	function _typeof(o) {
		"@babel/helpers - typeof";
		return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o) {
			return typeof o;
		} : function(o) {
			return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
		}, _typeof(o);
	}
	//#endregion
	//#region \0@oxc-project+runtime@0.139.0/helpers/esm/toPrimitive.js
	function toPrimitive(t, r) {
		if ("object" != _typeof(t) || !t) return t;
		var e = t[Symbol.toPrimitive];
		if (void 0 !== e) {
			var i = e.call(t, r || "default");
			if ("object" != _typeof(i)) return i;
			throw new TypeError("@@toPrimitive must return a primitive value.");
		}
		return ("string" === r ? String : Number)(t);
	}
	//#endregion
	//#region \0@oxc-project+runtime@0.139.0/helpers/esm/toPropertyKey.js
	function toPropertyKey(t) {
		var i = toPrimitive(t, "string");
		return "symbol" == _typeof(i) ? i : i + "";
	}
	//#endregion
	//#region \0@oxc-project+runtime@0.139.0/helpers/esm/defineProperty.js
	function _defineProperty(e, r, t) {
		return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
			value: t,
			enumerable: !0,
			configurable: !0,
			writable: !0
		}) : e[r] = t, e;
	}
	//#endregion
	//#region \0@oxc-project+runtime@0.139.0/helpers/esm/objectSpread2.js
	function ownKeys(e, r) {
		var t = Object.keys(e);
		if (Object.getOwnPropertySymbols) {
			var o = Object.getOwnPropertySymbols(e);
			r && (o = o.filter(function(r) {
				return Object.getOwnPropertyDescriptor(e, r).enumerable;
			})), t.push.apply(t, o);
		}
		return t;
	}
	function _objectSpread2(e) {
		for (var r = 1; r < arguments.length; r++) {
			var t = null != arguments[r] ? arguments[r] : {};
			r % 2 ? ownKeys(Object(t), !0).forEach(function(r) {
				_defineProperty(e, r, t[r]);
			}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r) {
				Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
			});
		}
		return e;
	}
	//#endregion
	//#region src/adapter/bilibili/filters.ts
	/**
	* 弹幕过滤器。
	*
	* 能力对齐 pakku.js 里真正有用的那几项：
	* - 屏蔽词（字符串 / 正则），对应 pakku 的 blacklist 与「读播放器屏蔽设定」
	* - 按弹幕类型过滤（滚动 / 顶部 / 底部），对应 PROC_TYPE4 / PROC_TYPE7
	* - 合并时间窗内内容相近的重复弹幕，对应 THRESHOLD / MAX_DIST / DANMU_MARK
	* - 每分钟条数上限，对应 SHRINK_THRESHOLD 一类密度控制
	*
	* 过滤发生在注入管线里（hook.ts 的 pickComments），第三方弹幕与 B 站原生
	* 弹幕走的是同一套规则：原生弹幕在重建响应时按同样的条件被剔除，
	* 所以「屏蔽词」「屏蔽顶部」这类开关对画面上的所有弹幕一视同仁。
	*/
	const FILTER_KEY = "bilibili-danmaku-filter-v1";
	const DEFAULT_FILTER = {
		enabled: true,
		keywords: [],
		hideScroll: false,
		hideTop: false,
		hideBottom: false,
		mergeSimilar: true,
		mergeWindowSec: 30,
		perMinute: 0
	};
	function loadFilter() {
		const raw = gm.getItem(FILTER_KEY, {});
		const base = raw && typeof raw === "object" ? raw : {};
		const config = _objectSpread2(_objectSpread2({}, DEFAULT_FILTER), base);
		config.keywords = Array.isArray(config.keywords) ? config.keywords.filter((o) => typeof o === "string") : [];
		if (!Number.isFinite(config.mergeWindowSec)) config.mergeWindowSec = DEFAULT_FILTER.mergeWindowSec;
		if (!Number.isFinite(config.perMinute)) config.perMinute = DEFAULT_FILTER.perMinute;
		return config;
	}
	function saveFilter(config) {
		gm.setItem(FILTER_KEY, config);
	}
	/** 把 B 站的 mode 归到面板上的三类开关 */
	function modeKind(mode) {
		if (mode === 5) return "top";
		if (mode === 4) return "bottom";
		if (mode >= 1 && mode <= 3) return "scroll";
		if (mode === 6) return "scroll";
		return "other";
	}
	function compileRule(raw) {
		const rule = raw.trim();
		if (!rule) return null;
		const regex = /^\/(.+)\/([a-z]*)$/.exec(rule) || (/^re:/i.test(rule) ? [
			rule,
			rule.slice(3),
			""
		] : null);
		if (regex) try {
			const re = new RegExp(regex[1], regex[2] || "i");
			return { test: (text) => re.test(text) };
		} catch (error) {
			console.warn("[danmaku-enhance] 屏蔽词正则无效，按子串处理", rule);
		}
		const needle = rule.toLowerCase();
		return { test: (text) => text.toLowerCase().includes(needle) };
	}
	function compileRules(keywords) {
		const rules = [];
		for (const keyword of keywords) {
			const rule = compileRule(keyword);
			if (rule) rules.push(rule);
		}
		return rules;
	}
	/** 去掉不参与比较的字符：空白、常见标点、全角转半角、统一小写 */
	function normalizeForCompare(text) {
		return text.replace(/[\uff01-\uff5e]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 65248)).replace(/[\s\u3000]+/g, "").replace(/[~!@#$%^&*()\-_=+[\]{}\\|;:'",.<>/?、。，！？；：""''《》【】「」『』…—·]/g, "").toLowerCase();
	}
	function levenshtein(a, b) {
		if (a === b) return 0;
		if (!a.length) return b.length;
		if (!b.length) return a.length;
		let prev = new Array(b.length + 1);
		let next = new Array(b.length + 1);
		for (let j = 0; j <= b.length; j++) prev[j] = j;
		for (let i = 1; i <= a.length; i++) {
			next[0] = i;
			for (let j = 1; j <= b.length; j++) {
				const cost = a[i - 1] === b[j - 1] ? 0 : 1;
				next[j] = Math.min(prev[j] + 1, next[j - 1] + 1, prev[j - 1] + cost);
			}
			const swap = prev;
			prev = next;
			next = swap;
		}
		return prev[b.length];
	}
	/**
	* 两条弹幕是否算「同一句」。pakku 用编辑距离 + 余弦相似度两路判断，
	* 这里用归一化后的编辑距离近似，够覆盖「哈哈哈」「哈哈哈哈哈」这类刷屏。
	*/
	function isSimilar(a, b) {
		const left = normalizeForCompare(a);
		const right = normalizeForCompare(b);
		if (!left || !right) return false;
		if (left === right) return true;
		const short = Math.min(left.length, right.length);
		const long = Math.max(left.length, right.length);
		if (short < 3) return false;
		if (long - short > Math.max(4, long * .5)) return false;
		if (long > 64) return left.includes(right) || right.includes(left);
		const dist = levenshtein(left, right);
		return dist <= 5 && dist / long <= .45;
	}
	/**
	* 编译成「这一条该不该拦」的判定函数。
	*
	* 用判定函数而不是批量过滤，是因为原生弹幕要按下标剔除 —— 它们的原始字节
	* 需要按位置对应回 protobuf 记录。
	*/
	function createBlockChecker(config) {
		if (!config.enabled) return () => null;
		const rules = compileRules(config.keywords);
		const { hideScroll, hideTop, hideBottom } = config;
		return (item) => {
			const kind = modeKind(item.mode);
			if (kind === "scroll" && hideScroll) return "mode";
			if (kind === "top" && hideTop) return "mode";
			if (kind === "bottom" && hideBottom) return "mode";
			if (rules.length && rules.some((rule) => rule.test(item.text))) return "keyword";
			return null;
		};
	}
	/**
	* 每分钟条数上限。输入应当是「同一分段里已经合并好的全部弹幕」（原生 + 第三方），
	* 这样画面上的密度才真的受控，而不是只限第三方那一半。
	* 超出时按等间距抽样，保留分布而不是砍掉尾巴。
	*/
	function applyDensity(items, perMinute) {
		const limit = Math.max(0, Math.round(perMinute));
		if (!limit || items.length <= limit) return {
			kept: items,
			blocked: 0
		};
		const byMinute = /* @__PURE__ */ new Map();
		for (const item of items) {
			const bucket = Math.floor(item.timeMs / 6e4);
			const list = byMinute.get(bucket);
			if (list) list.push(item);
			else byMinute.set(bucket, [item]);
		}
		const result = [];
		let blocked = 0;
		for (const list of byMinute.values()) {
			if (list.length <= limit) {
				result.push(...list);
				continue;
			}
			const step = list.length / limit;
			for (let i = 0; i < limit; i++) {
				const idx = Math.min(list.length - 1, Math.floor((i + .5) * step));
				result.push(list[idx]);
			}
			blocked += list.length - limit;
		}
		result.sort((a, b) => a.timeMs - b.timeMs);
		return {
			kept: result,
			blocked
		};
	}
	//#endregion
	//#region src/adapter/bilibili/proto.ts
	/**
	* B 站弹幕分段 DmSegMobileReply 的最小 protobuf 编解码。
	*
	* schema 来自播放器 bundle（bilibili.community.service.dm.v1）：
	*   message DmSegMobileReply {
	*     repeated DanmakuElem elems = 1;
	*     repeated DmColorful colorfulSrc = 5;
	*   }
	*   message DanmakuElem {
	*     int32 stime = 2;      // 出现时间，毫秒
	*     int32 mode = 3;       // 1-3 滚动，4 底部，5 顶部，6 逆向，7 高级，8 代码，9 BAS
	*     int32 size = 4;       // 字号 18/25/36
	*     uint32 color = 5;     // RGB888
	*     string uhash = 6;
	*     string text = 7;
	*     int64 date = 8;
	*     int32 weight = 9;
	*     string action = 10;
	*     int32 pool = 11;
	*     string dmid = 12;
	*     int32 attr = 13;
	*     string animation = 22;
	*     int64 oid = 26;
	*     int32 dmFrom = 27;
	*   }
	*
	* 合并方式：protobuf 允许 repeated 字段在字节流里拼接，因此直接在原响应
	* 末尾追加 field 1 的记录即可，B 站播放器用 protobufjs decode 时会拿到更多 elems。
	* 这里不依赖 protobufjs：播放器只在自己的 bundle 里内置了 schema，页面全局没有。
	*/
	const WIRE_VARINT = 0;
	const WIRE_FIXED64 = 1;
	const WIRE_LEN = 2;
	const WIRE_FIXED32 = 5;
	const encoder = new TextEncoder();
	const decoder = new TextDecoder();
	/** 读取一个 varint；超出安全整数范围的 64 位值会损失精度，这里只用于时间/颜色等小字段 */
	function readVarint(buf, pos) {
		let value = 0;
		let factor = 1;
		let p = pos;
		while (p < buf.length) {
			const byte = buf[p++];
			value += (byte & 127) * factor;
			if ((byte & 128) === 0) return {
				value,
				next: p
			};
			factor *= 128;
			if (factor > 2 ** 56) return {
				value,
				next: p
			};
		}
	}
	function skipField(buf, pos, wire) {
		var _readVarint;
		if (wire === WIRE_VARINT) return (_readVarint = readVarint(buf, pos)) === null || _readVarint === void 0 ? void 0 : _readVarint.next;
		if (wire === WIRE_FIXED64) return pos + 8 <= buf.length ? pos + 8 : void 0;
		if (wire === WIRE_FIXED32) return pos + 4 <= buf.length ? pos + 4 : void 0;
		if (wire === WIRE_LEN) {
			const len = readVarint(buf, pos);
			if (!len) return void 0;
			const end = len.next + len.value;
			return end <= buf.length ? end : void 0;
		}
	}
	function decodeElem(buf) {
		let pos = 0;
		let timeMs = 0;
		let mode = 1;
		let color = 16777215;
		let text = "";
		let dmid = "";
		while (pos < buf.length) {
			const key = readVarint(buf, pos);
			if (!key) break;
			pos = key.next;
			const field = Math.floor(key.value / 8);
			const wire = key.value % 8;
			if (wire === WIRE_LEN) {
				const len = readVarint(buf, pos);
				if (!len) break;
				const start = len.next;
				const end = start + len.value;
				if (end > buf.length) break;
				if (field === 7) text = decoder.decode(buf.subarray(start, end));
				else if (field === 12) dmid = decoder.decode(buf.subarray(start, end));
				pos = end;
				continue;
			}
			if (wire === WIRE_VARINT) {
				const val = readVarint(buf, pos);
				if (!val) break;
				pos = val.next;
				if (field === 2) timeMs = val.value;
				else if (field === 3) mode = val.value;
				else if (field === 5) color = val.value;
				continue;
			}
			const next = skipField(buf, pos, wire);
			if (next === void 0) break;
			pos = next;
		}
		return {
			timeMs,
			mode,
			color,
			text,
			dmid
		};
	}
	/**
	* 拆开一个分段响应。
	*
	* 只解析需要判断的字段，但每条弹幕的原始字节都留着 —— 过滤原生弹幕时要重建
	* 响应，重新编码会丢掉 weight/attr/animation/colorful 这些没建模的字段。
	*/
	function decodeReply(buf) {
		const records = [];
		const others = [];
		let pos = 0;
		while (pos < buf.length) {
			const start = pos;
			const key = readVarint(buf, pos);
			if (!key) break;
			pos = key.next;
			const field = Math.floor(key.value / 8);
			const wire = key.value % 8;
			if (wire === WIRE_LEN) {
				const len = readVarint(buf, pos);
				if (!len) break;
				const bodyStart = len.next;
				const end = bodyStart + len.value;
				if (end > buf.length) break;
				if (field === 1) {
					const body = buf.subarray(bodyStart, end);
					records.push({
						body,
						elem: decodeElem(body)
					});
				} else others.push(buf.subarray(start, end));
				pos = end;
				continue;
			}
			const next = skipField(buf, pos, wire);
			if (next === void 0) break;
			others.push(buf.subarray(start, next));
			pos = next;
		}
		return {
			records,
			others
		};
	}
	/** 解码一个分段响应里的原生弹幕（只取合并需要的字段） */
	function decodeElems(buf) {
		return decodeReply(buf).records.map((record) => record.elem);
	}
	var ByteWriter = class {
		constructor() {
			_defineProperty(this, "bytes", []);
		}
		varint(value) {
			let v = Math.max(0, Math.floor(value));
			while (v >= 128) {
				this.bytes.push(v % 128 + 128);
				v = Math.floor(v / 128);
			}
			this.bytes.push(v);
		}
		tag(field, wire) {
			this.varint(field * 8 + wire);
		}
		varintField(field, value) {
			this.tag(field, WIRE_VARINT);
			this.varint(value);
		}
		stringField(field, value) {
			const body = encoder.encode(value);
			this.tag(field, WIRE_LEN);
			this.varint(body.length);
			for (let i = 0; i < body.length; i++) this.bytes.push(body[i]);
		}
		finish() {
			return Uint8Array.from(this.bytes);
		}
	};
	function encodeElem(elem) {
		const w = new ByteWriter();
		w.varintField(2, elem.timeMs);
		w.varintField(3, elem.mode);
		w.varintField(4, 25);
		w.varintField(5, elem.color);
		w.stringField(6, "k-danmaku");
		w.stringField(7, elem.text);
		w.varintField(8, Math.floor(Date.now() / 1e3));
		w.varintField(9, 10);
		w.varintField(11, 0);
		w.stringField(12, elem.dmid);
		if (elem.oid) w.varintField(26, elem.oid);
		return w.finish();
	}
	function concat(parts) {
		let total = 0;
		for (const p of parts) total += p.length;
		const out = new Uint8Array(total);
		let offset = 0;
		for (const p of parts) {
			out.set(p, offset);
			offset += p.length;
		}
		return out;
	}
	function wrapElemBody(body) {
		const header = new ByteWriter();
		header.tag(1, WIRE_LEN);
		header.varint(body.length);
		return [header.finish(), body];
	}
	/**
	* 重建分段响应。
	*
	* 与 appendElems 的区别是保留哪些原生弹幕由调用方决定 —— 过滤器要对原生
	* 弹幕生效，就只能重建而不能追加。回调返回原始载荷表示原样写回，返回新载荷
	* 表示替换（合并相似弹幕时要改文字），返回 null 表示丢掉这条。
	*/
	function rebuildReply(decoded, bodyOf, inject) {
		const parts = [];
		for (let i = 0; i < decoded.records.length; i++) {
			const record = decoded.records[i];
			const body = bodyOf(record.elem, i);
			if (!body) continue;
			parts.push(...wrapElemBody(body));
		}
		for (const elem of inject) parts.push(...wrapElemBody(encodeElem(elem)));
		for (const other of decoded.others) parts.push(other);
		return concat(parts);
	}
	/**
	* 换掉一条原生记录的正文，其余字段按原字节拷贝。
	*
	* 合并相似弹幕时要在文字后面标出条数，但整体重新编码会丢掉没建模的字段，
	* 所以只重写 field 7，其他部分一个字节都不动。
	*/
	function replaceElemText(body, text) {
		const parts = [];
		let pos = 0;
		while (pos < body.length) {
			const start = pos;
			const key = readVarint(body, pos);
			if (!key) break;
			pos = key.next;
			const field = Math.floor(key.value / 8);
			const wire = key.value % 8;
			let end;
			if (wire === WIRE_LEN) {
				const len = readVarint(body, pos);
				if (!len) break;
				end = len.next + len.value;
				if (end > body.length) break;
			} else {
				end = skipField(body, pos, wire);
				if (end === void 0) break;
			}
			if (field === 7 && wire === WIRE_LEN) {
				const writer = new ByteWriter();
				writer.stringField(7, text);
				parts.push(writer.finish());
			} else parts.push(body.subarray(start, end));
			pos = end;
		}
		return concat(parts);
	}
	//#endregion
	//#region src/adapter/bilibili/store.ts
	/** B 站弹幕注入的本地配置与持久化 */
	const CONFIG_KEY = "bilibili-danmaku-config-v2";
	/** v3 起 URL 来源按「页面」分开存，避免在别的视频上加的来源跑过来 */
	const SOURCES_KEY = "bilibili-danmaku-sources-v3";
	const OFFSET_KEY = "bilibili-danmaku-offset-v2";
	/** UP 主白名单：这些作者的视频走「强制匹配」，匹配不出来就先别播 */
	const WHITELIST_KEY = "bilibili-danmaku-whitelist-v1";
	const DEFAULT_CONFIG = {
		enabled: false,
		dedupe: true
	};
	function loadConfig() {
		const raw = gm.getItem(CONFIG_KEY, {});
		return _objectSpread2(_objectSpread2({}, DEFAULT_CONFIG), raw && typeof raw === "object" ? raw : {});
	}
	function saveConfig(config) {
		gm.setItem(CONFIG_KEY, config);
	}
	function readSourceMap() {
		const raw = gm.getItem(SOURCES_KEY, {});
		if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
		const map = {};
		for (const [key, value] of Object.entries(raw)) {
			if (!Array.isArray(value)) continue;
			map[key] = value.filter((o) => o && typeof o.url === "string");
		}
		return map;
	}
	/** 读某个页面自己的 URL 来源列表 */
	function loadSources(pageKey) {
		if (!pageKey) return [];
		return readSourceMap()[pageKey] || [];
	}
	/** 覆盖某个页面的 URL 来源列表 */
	function saveSources(pageKey, list) {
		if (!pageKey) return;
		const map = readSourceMap();
		if (list.length) map[pageKey] = list;
		else delete map[pageKey];
		gm.setItem(SOURCES_KEY, map);
	}
	/** 读/写某条来源的时间偏移（毫秒） */
	function storageSourceOffset(url, offsetMs) {
		const map = gm.getItem(OFFSET_KEY, {}) || {};
		if (offsetMs !== void 0) {
			map[url] = offsetMs;
			gm.setItem(OFFSET_KEY, map);
			return offsetMs;
		}
		const value = Number(map[url]);
		return Number.isFinite(value) ? value : 0;
	}
	function loadWhitelist() {
		const raw = gm.getItem(WHITELIST_KEY, []);
		if (!Array.isArray(raw)) return [];
		const list = [];
		for (const item of raw) {
			const mid = Number(item === null || item === void 0 ? void 0 : item.mid);
			if (!Number.isFinite(mid) || mid <= 0) continue;
			if (list.some((o) => o.mid === mid)) continue;
			list.push({
				mid,
				name: String((item === null || item === void 0 ? void 0 : item.name) || "").trim()
			});
		}
		return list;
	}
	function saveWhitelist(list) {
		gm.setItem(WHITELIST_KEY, list);
	}
	//#endregion
	//#region src/adapter/bilibili/sources/net.ts
	function toUrl(url, params) {
		if (!params) return url;
		const u = new URL(url);
		Object.entries(params).forEach(([key, value]) => {
			if (value !== void 0 && value !== null) u.searchParams.set(key, String(value));
		});
		return u.toString();
	}
	function send(opts) {
		return new Promise((resolve, reject) => {
			var _opts$timeout;
			const url = toUrl(opts.url, opts.params);
			GM_xmlhttpRequest({
				url,
				method: opts.method || "GET",
				data: opts.data,
				headers: opts.headers,
				responseType: opts.responseType || "json",
				timeout: (_opts$timeout = opts.timeout) !== null && _opts$timeout !== void 0 ? _opts$timeout : 15e3,
				onload: (res) => {
					if (res.status < 200 || res.status >= 400) {
						reject(/* @__PURE__ */ new Error(`HTTP ${res.status} ${url}`));
						return;
					}
					resolve(res.response);
				},
				onerror: () => reject(/* @__PURE__ */ new Error(`网络错误 ${url}`)),
				ontimeout: () => reject(/* @__PURE__ */ new Error(`请求超时 ${url}`))
			});
		});
	}
	function getJson(url, params) {
		return send({
			url,
			params,
			responseType: "json"
		});
	}
	function getBytes(url, params) {
		return new Promise((resolve, reject) => {
			const full = toUrl(url, params);
			GM_xmlhttpRequest({
				url: full,
				method: "GET",
				responseType: "arraybuffer",
				timeout: 15e3,
				onload: (res) => {
					if (res.status === 304) {
						resolve({
							status: 304,
							bytes: null
						});
						return;
					}
					if (res.status < 200 || res.status >= 400) {
						reject(/* @__PURE__ */ new Error(`HTTP ${res.status} ${full}`));
						return;
					}
					resolve({
						status: res.status,
						bytes: new Uint8Array(res.response || [])
					});
				},
				onerror: () => reject(/* @__PURE__ */ new Error(`网络错误 ${full}`)),
				ontimeout: () => reject(/* @__PURE__ */ new Error(`请求超时 ${full}`))
			});
		});
	}
	function postJson(url, body, headers) {
		return new Promise((resolve, reject) => {
			GM_xmlhttpRequest({
				url,
				method: "POST",
				data: body,
				headers: _objectSpread2({ "Content-Type": "application/x-www-form-urlencoded" }, headers),
				responseType: "json",
				timeout: 15e3,
				onload: (res) => {
					if (res.status < 200 || res.status >= 400) {
						reject(/* @__PURE__ */ new Error(`HTTP ${res.status} ${url}`));
						return;
					}
					resolve({
						status: res.status,
						response: res.response
					});
				},
				onerror: () => reject(/* @__PURE__ */ new Error(`网络错误 ${url}`)),
				ontimeout: () => reject(/* @__PURE__ */ new Error(`请求超时 ${url}`))
			});
		});
	}
	//#endregion
	//#region src/adapter/bilibili/sources/index.ts
	/**
	* URL 弹幕源：从一个视频页 URL 解析出分集信息和弹幕。
	*
	* 目前内置两种站点：
	*   - bilibili.com   视频页/番剧页，弹幕走 seg.so 分段 protobuf
	*   - ani.gamer.com.tw 巴哈姆特动画疯，弹幕走 ajax/danmuGet.php 整集 JSON
	*
	* 新增站点只需实现 UrlSource，并注册到 SOURCES。
	*/
	function parseBiliRefs(url) {
		const refs = {};
		const path = url.pathname;
		const bv = path.match(/\/(BV[0-9A-Za-z]{10})/);
		if (bv) refs.bvid = bv[1];
		const bvQuery = url.searchParams.get("bvid");
		if (!refs.bvid && bvQuery) refs.bvid = bvQuery;
		const av = path.match(/\/av(\d+)/i);
		if (av) refs.aid = Number(av[1]);
		const avQuery = url.searchParams.get("aid");
		if (!refs.aid && avQuery) refs.aid = Number(avQuery);
		const epQuery = url.searchParams.get("ep_id");
		if (epQuery) refs.epId = Number(epQuery);
		const epPath = path.match(/\/ep(\d+)/);
		if (!refs.epId && epPath) refs.epId = Number(epPath[1]);
		const ssQuery = url.searchParams.get("season_id");
		if (ssQuery) refs.seasonId = Number(ssQuery);
		const ssPath = path.match(/\/ss(\d+)/);
		if (!refs.seasonId && ssPath) refs.seasonId = Number(ssPath[1]);
		const p = Number(url.searchParams.get("p"));
		if (Number.isFinite(p) && p > 0) refs.page = p;
		return refs;
	}
	const bilibiliSource = {
		id: "bilibili",
		label: "哔哩哔哩",
		match(url) {
			return /(^|\.)bilibili\.com$/.test(url.hostname);
		},
		async resolve(url) {
			const refs = parseBiliRefs(url);
			if (refs.epId || refs.seasonId) {
				const res = await getJson("https://api.bilibili.com/pgc/view/web/season", refs.epId ? { ep_id: refs.epId } : { season_id: refs.seasonId });
				if (res.code !== 0 || !res.result) throw new Error(`读取番剧信息失败（code=${res.code}）`);
				const all = [...res.result.episodes || []];
				for (const section of res.result.section || []) for (const ep of section.episodes || []) all.push(ep);
				let currentIndex = -1;
				const episodes = [];
				all.forEach((ep, i) => {
					if (!ep.cid) return;
					if (refs.epId && Number(ep.id) === Number(refs.epId)) currentIndex = episodes.length;
					episodes.push({
						id: String(ep.cid),
						title: String(ep.long_title || ep.title || `第${i + 1}集`).trim(),
						index: i + 1,
						durationSec: ep.duration ? Math.round(ep.duration / 1e3) : void 0
					});
				});
				const current = currentIndex >= 0 ? episodes[currentIndex] : void 0;
				return {
					source: "bilibili",
					title: String(res.result.title || "").trim(),
					episodes,
					current
				};
			}
			const params = {};
			if (refs.bvid) params.bvid = refs.bvid;
			else if (refs.aid) params.aid = refs.aid;
			if (!params.bvid && !params.aid) throw new Error("URL 里没有识别到 bvid / av 号 / ep_id");
			const res = await getJson("https://api.bilibili.com/x/web-interface/view", params);
			if (res.code !== 0 || !res.data) throw new Error(`读取视频信息失败（code=${res.code}）`);
			const pages = res.data.pages || [];
			const episodes = pages.length ? pages.map((p, i) => {
				var _p$page;
				return {
					id: String(p.cid || ""),
					title: pages.length > 1 ? String(p.part || `P${(_p$page = p.page) !== null && _p$page !== void 0 ? _p$page : i + 1}`) : String(res.data.title || ""),
					index: i + 1,
					durationSec: p.duration
				};
			}) : [{
				id: String(res.data.cid || ""),
				title: String(res.data.title || ""),
				index: 1
			}];
			const pageIndex = Math.max(1, refs.page || 1) - 1;
			return {
				source: "bilibili",
				title: String(res.data.title || "").trim(),
				episodes: episodes.filter((e) => e.id),
				current: episodes[pageIndex]
			};
		},
		async load(episode, onProgress) {
			if (!episode.id) return [];
			const out = [];
			for (let segment = 1; segment <= 60; segment++) {
				let result;
				try {
					result = await getBytes("https://api.bilibili.com/x/v2/dm/web/seg.so", {
						type: 1,
						oid: episode.id,
						segment_index: segment
					});
				} catch (error) {
					onProgress === null || onProgress === void 0 || onProgress(`第 ${segment} 段失败：${error.message}`);
					break;
				}
				if (result.status === 304 || !result.bytes || !result.bytes.length) {
					onProgress === null || onProgress === void 0 || onProgress(`共 ${segment - 1} 段 ${out.length} 条`);
					break;
				}
				const elems = decodeElems(result.bytes);
				if (!elems.length) {
					onProgress === null || onProgress === void 0 || onProgress(`共 ${segment - 1} 段 ${out.length} 条`);
					break;
				}
				for (const elem of elems) out.push({
					timeMs: elem.timeMs,
					mode: elem.mode || 1,
					color: elem.color,
					text: elem.text
				});
				onProgress === null || onProgress === void 0 || onProgress(`已拉 ${segment} 段 ${out.length} 条`);
			}
			return out.sort((a, b) => a.timeMs - b.timeMs);
		}
	};
	function parseHexColor(color) {
		if (typeof color === "string" && /^#[0-9a-f]{6}$/i.test(color)) return parseInt(color.slice(1), 16);
		return 16777215;
	}
	function bahamutPositionToMode(position) {
		if (position === 1) return 5;
		if (position === 2) return 4;
		return 1;
	}
	const SOURCES = [bilibiliSource, {
		id: "bahamut",
		label: "巴哈姆特动画疯",
		match(url) {
			return /(^|\.)gamer\.com\.tw$/.test(url.hostname);
		},
		async resolve(url) {
			const videoSn = Number(url.searchParams.get("sn"));
			if (!Number.isFinite(videoSn) || videoSn <= 0) throw new Error("巴哈姆特 URL 里没有 sn");
			const html = await new Promise((resolve, reject) => {
				GM_xmlhttpRequest({
					url: `https://ani.gamer.com.tw/animeVideo.php?sn=${videoSn}`,
					method: "GET",
					responseType: "text",
					headers: { Referer: "https://ani.gamer.com.tw/" },
					timeout: 15e3,
					onload: (res) => {
						if (res.status < 200 || res.status >= 400) {
							reject(/* @__PURE__ */ new Error(`HTTP ${res.status}`));
							return;
						}
						resolve(String(res.responseText || ""));
					},
					onerror: () => reject(/* @__PURE__ */ new Error("网络错误")),
					ontimeout: () => reject(/* @__PURE__ */ new Error("请求超时"))
				});
			});
			const titleMatch = html.match(/animefun\.title\s*=\s*'([^']*)'/);
			const rawTitle = titleMatch ? titleMatch[1] : "";
			const seriesTitle = rawTitle.replace(/\s*\[[^\]]*\]\s*$/, "").trim();
			const epPattern = /data-ani-video-sn="(\d+)">([^<]*)</g;
			const pairs = [];
			let epMatch;
			while (epMatch = epPattern.exec(html)) pairs.push({
				sn: epMatch[1],
				label: String(epMatch[2] || "").trim()
			});
			const episodes = pairs.length ? pairs.map((p, i) => ({
				id: p.sn,
				title: p.label ? `第 ${p.label} 集` : `第 ${i + 1} 集`,
				index: i + 1
			})) : [{
				id: String(videoSn),
				title: "当前集",
				index: 1
			}];
			const current = episodes.find((e) => e.id === String(videoSn)) || episodes[0];
			return {
				source: "bahamut",
				title: seriesTitle || rawTitle,
				episodes,
				current
			};
		},
		async load(episode, onProgress) {
			if (!episode.id) return [];
			const { response } = await postJson("https://ani.gamer.com.tw/ajax/danmuGet.php", `sn=${episode.id}`, { Referer: "https://ani.gamer.com.tw/" });
			const out = (Array.isArray(response) ? response : []).map((item) => ({
				timeMs: Math.round((item.time || 0) * 1e3),
				mode: bahamutPositionToMode(item.position),
				color: parseHexColor(item.color),
				text: String(item.text || "").trim()
			})).filter((item) => item.text);
			onProgress === null || onProgress === void 0 || onProgress(`共 ${out.length} 条`);
			return out.sort((a, b) => a.timeMs - b.timeMs);
		}
	}];
	function findSource(url) {
		return SOURCES.find((s) => s.match(url));
	}
	//#endregion
	//#region src/adapter/bilibili/error.ts
	/** 把 GM 请求、原生 Error 和普通对象统一成可读的提示文案。 */
	function errorMessage(error) {
		if (error instanceof Error && error.message) return error.message;
		if (typeof error === "string" && error) return error;
		if (error && typeof error === "object") {
			const value = error;
			if (typeof value.message === "string" && value.message) return value.message;
			if (typeof value.status === "number" && value.status > 0) return `HTTP ${value.status}${value.statusText ? ` ${value.statusText}` : ""}`;
			if (typeof value.type === "string" && value.type) return `网络请求失败（${value.type}）`;
			try {
				const json = JSON.stringify(error);
				if (json && json !== "{}") return json;
			} catch (_unused) {}
		}
		return "未知错误";
	}
	//#endregion
	//#region src/adapter/bilibili/sources/state.ts
	/**
	* URL 弹幕源的运行时状态：最多 3 条来源、各自的时间偏移、顺序预取。
	*
	* 预取由各 UrlSource.load() 自己按顺序发分段、并发 1、遇到 304/空段即停，
	* 这样不需要知道总时长也能拉完整集。
	*/
	const MAX_SOURCES = 3;
	let entries = [];
	/**
	* 当前页面标识。URL 来源按页面分开存：在 A 视频上加的来源不该出现在 B 视频里。
	*/
	let pageKey = "";
	/** 页面切换代数；丢弃跨页面完成的异步解析和拉取结果 */
	let pageGeneration = 0;
	const listeners = /* @__PURE__ */ new Set();
	/** 每条来源的加载序号，用来丢弃过期的回调 */
	const loadSeq = /* @__PURE__ */ new Map();
	function notify() {
		listeners.forEach((fn) => fn());
	}
	function subscribe(fn) {
		listeners.add(fn);
		return () => {
			listeners.delete(fn);
		};
	}
	function getEntries() {
		return entries;
	}
	/** 当前所有来源的弹幕，已应用各自的偏移 */
	function collectItems() {
		const out = [];
		for (const entry of entries) {
			if (!entry.items.length) continue;
			for (const item of entry.items) {
				const timeMs = item.timeMs + entry.offsetMs;
				if (timeMs < 0) continue;
				out.push(_objectSpread2(_objectSpread2({}, item), {}, { timeMs }));
			}
		}
		return out.sort((a, b) => a.timeMs - b.timeMs);
	}
	function getTotalCount() {
		return entries.reduce((sum, entry) => sum + entry.items.length, 0);
	}
	function setOffset(key, offsetSec) {
		const entry = entries.find((e) => e.key === key);
		if (!entry) return;
		entry.offsetMs = Math.round((Number.isFinite(offsetSec) ? offsetSec : 0) * 1e3);
		storageSourceOffset(entry.url, entry.offsetMs);
		notify();
	}
	/** 解析 URL 并加入列表；同一集不重复添加，只重新拉取 */
	async function addSource(rawUrl, expectedGeneration = pageGeneration) {
		if (expectedGeneration !== pageGeneration) throw new Error("页面已切换，放弃恢复旧来源");
		let url;
		try {
			url = new URL(rawUrl.trim());
		} catch (error) {
			throw new Error("URL 格式不对");
		}
		const source = findSource(url);
		if (!source) throw new Error("暂不支持这个网站（目前支持 bilibili.com 和 ani.gamer.com.tw）");
		const series = await source.resolve(url);
		if (expectedGeneration !== pageGeneration) throw new Error("页面已切换，放弃恢复旧来源");
		if (!series.episodes.length) throw new Error("没有解析到可用的分集");
		const episode = series.current || series.episodes[0];
		const key = `${source.id}:${episode.id}`;
		const existing = entries.find((e) => e.key === key);
		if (existing) {
			existing.url = rawUrl.trim();
			await loadEntry(existing, source, expectedGeneration);
			return existing;
		}
		if (entries.length >= MAX_SOURCES) throw new Error(`最多同时使用 ${MAX_SOURCES} 个 URL 来源`);
		const entry = {
			key,
			url: rawUrl.trim(),
			sourceId: source.id,
			sourceLabel: source.label,
			seriesTitle: series.title,
			episode,
			offsetMs: storageSourceOffset(rawUrl.trim()) || 0,
			items: [],
			loading: false,
			progress: ""
		};
		entries = [...entries, entry];
		persist();
		notify();
		await loadEntry(entry, source, expectedGeneration);
		return entry;
	}
	function removeSource(key) {
		entries = entries.filter((e) => e.key !== key);
		persist();
		notify();
	}
	/** 加载某一来源；失败只影响这条 */
	async function loadEntry(entry, source, expectedGeneration = pageGeneration) {
		if (expectedGeneration !== pageGeneration) return;
		const mine = (loadSeq.get(entry.key) || 0) + 1;
		loadSeq.set(entry.key, mine);
		entry.loading = true;
		entry.error = void 0;
		entry.progress = "开始拉取…";
		entry.items = [];
		notify();
		try {
			const items = await source.load(entry.episode, (msg) => {
				if (expectedGeneration !== pageGeneration || loadSeq.get(entry.key) !== mine) return;
				entry.progress = msg;
				notify();
			});
			if (expectedGeneration !== pageGeneration || loadSeq.get(entry.key) !== mine) return;
			entry.items = items;
			entry.progress = items.length ? `共 ${items.length} 条` : "这一集没有弹幕";
		} catch (error) {
			if (expectedGeneration !== pageGeneration || loadSeq.get(entry.key) !== mine) return;
			entry.items = [];
			entry.error = errorMessage(error);
			entry.progress = "";
		} finally {
			if (expectedGeneration === pageGeneration && loadSeq.get(entry.key) === mine) {
				entry.loading = false;
				notify();
			}
		}
	}
	function persist() {
		saveSources(pageKey, entries.map((e) => ({
			url: e.url,
			offsetMs: e.offsetMs
		})));
	}
	/** 切换页面时先设好 pageKey，再 restoreSources() */
	function setPageKey(next) {
		if (next === pageKey) return;
		pageGeneration++;
		pageKey = next;
		entries = [];
		loadSeq.clear();
		notify();
	}
	/** 切换到新页面/新分集时清空内存状态（持久化列表保留） */
	function resetUrlSources() {
		pageGeneration++;
		loadSeq.clear();
		entries = [];
		notify();
	}
	/**
	* 从持久化恢复**当前页面**上次使用的来源。
	*
	* 页面信息刚加载时可能只有 `vid:*`，稍后才补出 `cid:*`；调用方把旧 key
	* 作为 fallbackKeys 传进来，避免同一个页面因为识别时序不同而丢来源。
	* 成功恢复后 persist() 会把来源写到当前 key，完成迁移。
	*/
	async function restoreSources(fallbackKeys = []) {
		const keys = [pageKey, ...fallbackKeys].filter((key, index, list) => key && list.indexOf(key) === index);
		const savedByUrl = /* @__PURE__ */ new Map();
		for (const key of keys) for (const item of loadSources(key)) if (!savedByUrl.has(item.url)) savedByUrl.set(item.url, item);
		const saved = [...savedByUrl.values()];
		if (!saved.length) return;
		const mine = pageKey;
		const generation = pageGeneration;
		for (const item of saved.slice(0, MAX_SOURCES)) {
			try {
				const entry = await addSource(item.url, generation);
				if (entry && item.offsetMs) {
					entry.offsetMs = item.offsetMs;
					notify();
				}
			} catch (error) {
				console.warn("[danmaku-enhance] 恢复 URL 来源失败", item.url, error);
			}
			if (mine !== pageKey || generation !== pageGeneration) return;
		}
	}
	//#endregion
	//#region src/adapter/bilibili/hook.ts
	/**
	* B 站播放器通过 XHR 请求 /x/v2/dm/(wbi/)web/seg.so 获取弹幕分段，
	* 响应是 DmSegMobileReply 的 protobuf 字节。这里在网络层拦截响应，
	* 把第三方弹幕追加成 protobuf 记录后再交给播放器，
	* 这样 B 站的弹幕渲染、过滤、设置都保持原样。
	*/
	const SEG_PATH = /\/x\/v2\/dm\/(?:wbi\/)?(?:web|list)\/seg\.so/;
	const SEGMENT_MS = 360 * 1e3;
	/** 每个分段最多追加多少条，避免异常数据拖慢解码 */
	const MAX_PER_SEGMENT = 3e3;
	/** 等待弹幕匹配完成的最长时间（毫秒）。超过就放行，宁可这一段没三方弹幕也不能卡住播放器 */
	const LOAD_WAIT_MS = 8e3;
	/** 与原生弹幕去重的时间窗口（毫秒） */
	const NATIVE_DEDUPE_MS = 1500;
	/** 第三方来源之间的去重窗口（巴哈姆特时间只精确到秒，放宽一点） */
	const INJECT_DEDUPE_MS = 1800;
	const state = {
		enabled: false,
		dedupe: true,
		comments: null,
		loading: null,
		expecting: false,
		hold: false,
		holdReleased: false,
		stats: emptyStats()
	};
	let installed = false;
	function setEnabled(enabled) {
		state.enabled = enabled;
	}
	function setDedupe(dedupe) {
		state.dedupe = dedupe;
	}
	function setCid(cid) {
		state.cid = cid;
	}
	function setComments(comments) {
		state.comments = comments;
		commentsEpoch++;
	}
	function getComments$1() {
		return state.comments;
	}
	function setLoading(loading) {
		state.loading = loading;
	}
	/**
	* 预登记「马上要去匹配」。
	*
	* 必须在真正开始匹配**之前**调用：页面加载时首段请求往往比 ensureMatch 早
	* 一到两百毫秒到达，中间这段时间是唯一会丢首段的窗口。
	*/
	function setExpecting(expecting) {
		state.expecting = expecting;
	}
	/**
	* 切换「强制匹配」模式：置真后分段请求会被扣住不放行。
	*
	* 只给白名单 UP 主用。扣住期间播放器画面里没有弹幕，用户要么等匹配
	* 出结果，要么自己点播放——一点播放就 `releaseHold()`。
	*/
	function setHold(hold) {
		state.hold = hold;
		state.holdReleased = false;
	}
	/** 立刻放行所有扣住的响应（用户手动播放 / 主动放弃等待时调用） */
	function releaseHold() {
		state.holdReleased = true;
		holdEverReleased = true;
	}
	function getStats() {
		return _objectSpread2({}, state.stats);
	}
	/** 切集/换页面时重置，保留开关状态 */
	function resetPageState() {
		state.comments = null;
		state.loading = null;
		state.expecting = false;
		state.holdReleased = false;
		state.cid = void 0;
		state.stats = emptyStats();
		lastRequestOid = null;
		holdEverReleased = false;
		lastInjectedOid = null;
		commentsEpoch = 0;
		lastInjectedEpoch = -1;
	}
	function emptyStats() {
		return {
			requests: 0,
			armed: 0,
			reads: 0,
			xhrs: 0,
			fetches: 0,
			segments: 0,
			injected: 0,
			lastDetail: "",
			lastSeg: null,
			lastMergedSeg: null,
			available: 0,
			filtered: 0,
			droppedNative: 0,
			merged: 0,
			missed: 0,
			held: 0,
			lastState: "",
			hook: ""
		};
	}
	function toNumber$1(value) {
		if (!value) return void 0;
		const n = Number(value);
		return Number.isFinite(n) ? n : void 0;
	}
	function parseSegRequest(rawUrl) {
		if (!SEG_PATH.test(rawUrl)) return void 0;
		let url;
		try {
			url = new URL(rawUrl, location.href);
		} catch (error) {
			return;
		}
		const params = url.searchParams;
		const oid = toNumber$1(params.get("oid"));
		const segment = toNumber$1(params.get("segment_index"));
		const ps = toNumber$1(params.get("ps"));
		const pe = toNumber$1(params.get("pe"));
		if (ps !== void 0 && pe !== void 0 && pe > ps && pe - ps >= 30 * 1e3) return {
			oid,
			startMs: ps,
			endMs: pe
		};
		const index = segment && segment > 0 ? segment : 1;
		return {
			oid,
			startMs: (index - 1) * SEGMENT_MS,
			endMs: index * SEGMENT_MS,
			index
		};
	}
	function normalizeText(text) {
		return text.replace(/[\s\u3000]+/g, "").toLowerCase();
	}
	function addTime(map, key, timeMs) {
		const list = map.get(key);
		if (list) list.push(timeMs);
		else map.set(key, [timeMs]);
	}
	function hasNear(map, key, timeMs, tolerance) {
		const list = map.get(key);
		if (!list) return false;
		for (const t of list) if (Math.abs(t - timeMs) <= tolerance) return true;
		return false;
	}
	function toBiliMode(mode) {
		if (mode === "top") return 5;
		if (mode === "bottom") return 4;
		return 1;
	}
	function parseColor(color) {
		if (typeof color === "string" && color.startsWith("#")) {
			const hex = color.slice(1);
			if (/^[0-9a-f]{3,6}$/i.test(hex)) {
				const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
				return parseInt(full, 16) & 16777215;
			}
		}
		return 16777215;
	}
	/** 生成稳定、数字形态的 dmid，避免和 B 站真实 id 冲突 */
	function makeDmid(text, timeMs) {
		let hash = 2166136261;
		const source = `${text}@${timeMs}`;
		for (let i = 0; i < source.length; i++) {
			hash ^= source.charCodeAt(i);
			hash = Math.imul(hash, 16777619);
		}
		return String(0x38d7ea4c68000 + Math.abs(hash) % 9e14);
	}
	function candidatesFromComments(comments) {
		return comments.map((comment) => {
			var _comment$style;
			return {
				timeMs: Math.round((comment.time || 0) * 1e3),
				mode: toBiliMode(comment.mode),
				color: parseColor((_comment$style = comment.style) === null || _comment$style === void 0 ? void 0 : _comment$style.color),
				text: String(comment.text || "").trim()
			};
		});
	}
	/**
	* 一次分段合并的全部工作。
	*
	* 过滤器对「画面上的所有弹幕」生效，所以原生记录也走同一条管线：屏蔽词和类型
	* 开关命中就从响应里剔掉，合并相似弹幕会把它的文字改成带计数的样子，每分钟上限
	* 则是在原生 + 第三方合起来之后统一抽样。只有真的要改写时才重建响应。
	*/
	function pickComments(candidates, request, raw, filter) {
		const decoded = decodeReply(raw);
		const blocked = createBlockChecker(filter);
		let blockedNative = 0;
		const entries = [];
		decoded.records.forEach((record, index) => {
			if (blocked(record.elem)) {
				blockedNative++;
				return;
			}
			entries.push({
				timeMs: record.elem.timeMs,
				mode: record.elem.mode,
				text: record.elem.text,
				nativeIndex: index,
				count: 1
			});
		});
		let outOfWindow = 0;
		let empty = 0;
		let blockedCandidate = 0;
		for (const item of candidates) {
			if (item.timeMs < request.startMs || item.timeMs >= request.endMs) {
				outOfWindow++;
				continue;
			}
			if (!item.text) {
				empty++;
				continue;
			}
			if (blocked(item)) {
				blockedCandidate++;
				continue;
			}
			entries.push({
				timeMs: item.timeMs,
				mode: item.mode,
				text: item.text,
				nativeIndex: -1,
				candidate: item,
				count: 1
			});
		}
		const nativeTimes = /* @__PURE__ */ new Map();
		for (const entry of entries) {
			if (entry.nativeIndex < 0) continue;
			addTime(nativeTimes, normalizeText(entry.text), entry.timeMs);
		}
		let dupNative = 0;
		let dupInjected = 0;
		if (state.dedupe) {
			const injectedTimes = /* @__PURE__ */ new Map();
			for (let i = entries.length - 1; i >= 0; i--) {
				const entry = entries[i];
				if (entry.nativeIndex >= 0) continue;
				if (hasNear(nativeTimes, normalizeText(entry.text), entry.timeMs, NATIVE_DEDUPE_MS)) {
					dupNative++;
					entries.splice(i, 1);
				}
			}
			entries.sort((a, b) => a.timeMs - b.timeMs);
			for (let i = entries.length - 1; i >= 0; i--) {
				const entry = entries[i];
				if (entry.nativeIndex >= 0) continue;
				const key = normalizeText(entry.text);
				if (hasNear(injectedTimes, key, entry.timeMs, INJECT_DEDUPE_MS)) {
					dupInjected++;
					entries.splice(i, 1);
					continue;
				}
				addTime(injectedTimes, key, entry.timeMs);
			}
		} else for (const entry of entries) {
			if (entry.nativeIndex >= 0) continue;
			addTime(nativeTimes, normalizeText(entry.text), entry.timeMs);
		}
		entries.sort((a, b) => a.timeMs - b.timeMs);
		const windowMs = Math.max(0, filter.mergeWindowSec) * 1e3;
		const reps = [];
		let merged = 0;
		const mergeOn = filter.enabled && filter.mergeSimilar && windowMs > 0;
		for (const entry of entries) {
			if (mergeOn) {
				for (let i = reps.length - 1; i >= 0; i--) {
					const rep = reps[i];
					if (entry.timeMs - rep.timeMs > windowMs) break;
					if (rep.mode !== entry.mode) continue;
					if (!isSimilar(rep.text, entry.text)) continue;
					rep.count++;
					entry.absorbedBy = rep;
					merged++;
					break;
				}
				if (entry.absorbedBy) continue;
			}
			reps.push(entry);
		}
		const slots = reps.map((entry) => ({
			timeMs: entry.timeMs,
			mode: entry.mode,
			text: entry.count > 1 ? `${entry.text} (${entry.count})` : entry.text,
			entry
		}));
		const survived = new Set(applyDensity(slots, filter.perMinute).kept);
		const finalBodies = new Array(decoded.records.length).fill(null);
		const finalInjected = [];
		let injected = 0;
		let droppedNative = 0;
		let nativeChanged = blockedNative > 0;
		for (const slot of slots) {
			var _entry$candidate$colo, _entry$candidate;
			if (!survived.has(slot)) {
				if (slot.entry.nativeIndex >= 0) {
					droppedNative++;
					nativeChanged = true;
				}
				continue;
			}
			const { entry } = slot;
			if (entry.nativeIndex >= 0) {
				if (entry.count > 1) {
					finalBodies[entry.nativeIndex] = replaceElemText(decoded.records[entry.nativeIndex].body, `${entry.text} (${entry.count})`);
					nativeChanged = true;
				} else finalBodies[entry.nativeIndex] = decoded.records[entry.nativeIndex].body;
				continue;
			}
			if (injected >= MAX_PER_SEGMENT) continue;
			injected++;
			finalInjected.push({
				timeMs: entry.timeMs,
				mode: entry.mode,
				color: (_entry$candidate$colo = (_entry$candidate = entry.candidate) === null || _entry$candidate === void 0 ? void 0 : _entry$candidate.color) !== null && _entry$candidate$colo !== void 0 ? _entry$candidate$colo : 16777215,
				text: slot.text,
				dmid: makeDmid(entry.text, entry.timeMs),
				oid: request.oid
			});
		}
		return {
			bytes: nativeChanged || finalInjected.length > 0 ? rebuildReply(decoded, (_elem, index) => finalBodies[index], finalInjected) : null,
			injected: finalInjected.length,
			droppedNative,
			outOfWindow,
			filtered: blockedNative + blockedCandidate,
			merged,
			dupNative,
			dupInjected,
			empty
		};
	}
	/** 当前播放位置（毫秒），拿不到返回 -1 */
	function playbackMs() {
		try {
			const video = document.querySelector("video");
			return video && isFinite(video.currentTime) ? Math.round(video.currentTime * 1e3) : -1;
		} catch (error) {
			return -1;
		}
	}
	/** 记录本次合并被丢弃的原因，面板上直接展示，方便一轮定位 */
	function detail(reason) {
		state.stats.lastDetail = reason;
		return null;
	}
	function buildInjections(request, bytes) {
		var _request$index, _request$oid, _request$index2;
		state.stats.lastSeg = (_request$index = request.index) !== null && _request$index !== void 0 ? _request$index : null;
		if (!state.enabled) return detail("开关未开启");
		if (state.cid && request.oid && state.cid !== request.oid) return detail(`cid 不匹配：页面 ${state.cid} / 请求 ${request.oid}`);
		const fromComments = state.comments ? candidatesFromComments(state.comments) : [];
		let fromUrls = [];
		try {
			fromUrls = collectItems();
		} catch (error) {
			return detail(`读取 URL 源失败：${errorMessage(error)}`);
		}
		const candidates = [...fromComments, ...fromUrls];
		candidates.sort((a, b) => a.timeMs - b.timeMs);
		const now = playbackMs();
		const ahead = now >= 0 && request.startMs > now + 30 * 1e3;
		const behind = now >= 0 && request.endMs < now - 60 * 1e3;
		state.stats.available = candidates.length;
		if (!candidates.length && !ahead && !behind) state.stats.missed++;
		const result = pickComments(candidates, request, bytes, loadFilter());
		if (result.filtered) state.stats.filtered += result.filtered;
		if (result.merged) state.stats.merged += result.merged;
		if (result.droppedNative) state.stats.droppedNative += result.droppedNative;
		if (!result.bytes) {
			const nativeTotal = decodeReply(bytes).records.length;
			if (!candidates.length) return detail(`没有候选弹幕，原生 ${nativeTotal} 条也不需要过滤，本段原样放行`);
			if (ahead || behind) return detail(`预取段（当前播放 ${Math.round(now / 1e3)}s，本段 ${Math.round(request.startMs / 1e3)}-${Math.round(request.endMs / 1e3)}s），无需注入`);
			let min = Infinity;
			let max = -Infinity;
			for (const item of candidates) {
				if (item.timeMs < min) min = item.timeMs;
				if (item.timeMs > max) max = item.timeMs;
			}
			return detail(`候选 ${candidates.length} 条全被丢弃（窗外 ${result.outOfWindow}／过滤 ${result.filtered}／合并 ${result.merged}／撞原生 ${result.dupNative}／自撞 ${result.dupInjected}／空 ${result.empty}；本段 ${Math.round(request.startMs / 1e3)}-${Math.round(request.endMs / 1e3)}s，原生 ${nativeTotal} 条，候选 ${(min / 1e3).toFixed(1)}-${(max / 1e3).toFixed(1)}s）`);
		}
		state.stats.segments++;
		state.stats.injected += result.injected;
		lastInjectedOid = (_request$oid = request.oid) !== null && _request$oid !== void 0 ? _request$oid : null;
		lastInjectedEpoch = commentsEpoch;
		state.stats.lastMergedSeg = (_request$index2 = request.index) !== null && _request$index2 !== void 0 ? _request$index2 : null;
		const touches = [
			result.droppedNative ? `密度裁剪原生 ${result.droppedNative}` : "",
			result.filtered ? `过滤 ${result.filtered}` : "",
			result.merged ? `合并 ${result.merged}` : ""
		].filter(Boolean).join("，");
		state.stats.lastDetail = result.injected ? `本段注入 ${result.injected} 条${touches ? `，${touches}` : ""}` : `本段未注入${touches ? `，只做了${touches}` : ""}`;
		return result.bytes;
	}
	/**
	* 播放器实际请求的 cid 变了（切了分P / 切了集）。
	*
	* 为什么需要这个：切分P 时 URL 上的 `?p=` 不一定更新，`__INITIAL_STATE__`
	* 更是只在首屏写过一次，于是面板那边靠读页面信息压根发现不了换集；
	* 但播放器每次换集都必须用新 cid 去请求弹幕。所以这里把「拦截到的 cid」
	* 当成换集的最可靠信号，让面板据此重新匹配集数。
	*/
	const cidListeners = /* @__PURE__ */ new Set();
	function onCidChange(listener) {
		cidListeners.add(listener);
		return () => {
			cidListeners.delete(listener);
		};
	}
	function notifyCid(cid) {
		if (!cidListeners.size) return;
		for (const listener of cidListeners) try {
			listener(cid);
		} catch (error) {
			console.warn("[danmaku-enhance] cid 变化回调出错", error);
		}
	}
	/** 上一次见到的请求 cid，用来发现「换集了」 */
	let lastRequestOid = null;
	/** 本页面上是否放行过扣留（releaseHold 置位，resetPageState 清零） */
	let holdEverReleased = false;
	/** 最近一次成功注入分段时的 oid；面板用它判断「当前段合并自哪次候选」 */
	let lastInjectedOid = null;
	/** 候选代数：setComments 每换一版候选就 +1（重选集数/换番剧都会变） */
	let commentsEpoch = 0;
	/** 最近一次成功注入分段时用的候选代数 */
	let lastInjectedEpoch = -1;
	/**
	* 当前段是否仍按旧候选合并（stale）。
	*
	* 两个触发场景，判据合一：
	* 1. 弹弹play匹配区**重选集数/换番剧**——视频与 cid 都不变，唯一信号是
	*    setComments 换了候选代数，而已注入分段还停留在旧代数上；
	* 2. **切分P/换集**（cid 变）——旧 cid 的分段还挂在播放器里，新 cid 的
	*    分段尚未注入成功（lastInjectedOid 停在旧 cid 上）。
	*/
	function isStaleSegment() {
		if (lastInjectedEpoch < 0) return false;
		if (commentsEpoch !== lastInjectedEpoch) return true;
		if (state.cid && lastInjectedOid !== state.cid) return true;
		return false;
	}
	/** 记一次弹幕分段请求（不管开关是否开启都记，方便诊断） */
	function countRequest(request) {
		if (!request) return;
		state.stats.requests++;
		if (state.enabled) state.stats.armed++;
		const oid = request.oid;
		if (oid && oid !== lastRequestOid) {
			lastRequestOid = oid;
			notifyCid(oid);
		}
	}
	/**
	* 让播放器重新拉一遍弹幕。
	*
	* 播放器按 cid 把分段缓存在内存里，开关是在视频已经在播之后才打开的，
	* 这时当前分段早已请求过、不会再发请求，hook 也就没机会合并。
	* 这里挨个试常见的重新加载手段，每种都等一会儿看请求计数有没有涨。
	*/
	const RELOAD_WAIT_MS = 800;
	function requestTicks() {
		return state.stats.requests;
	}
	function sleep(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
	/** 播放器控制器（不同版本挂在不同的全局变量上） */
	function playerController() {
		var _win$playerConfig;
		const win = window;
		return win.player || win.bilibiliPlayer || win.__BILI_PLAYER__ || ((_win$playerConfig = win.playerConfig) === null || _win$playerConfig === void 0 ? void 0 : _win$playerConfig.player);
	}
	async function forceReloadDanmaku() {
		playerController();
		const before = requestTicks();
		await sleep(RELOAD_WAIT_MS);
		return requestTicks() > before ? "播放器自行重载" : "";
	}
	function toArrayBuffer(bytes) {
		return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
	}
	/** 记下模块加载时的构造器，换成页面 realm 之前也能用 */
	const XmlHttpRequestCtor = XMLHttpRequest;
	/**
	* 记录一个分段请求的完整生命周期。播放器不读 response 时，靠这些字段区分
	* 「请求被取消了」「请求还在路上」「请求完成了但没人读」三种情况。
	*/
	function trackRequest(xhr, request) {
		const describe = (why) => {
			const seg = request.index ? `第${request.index}段` : "分段";
			state.stats.lastState = `${seg} ${why} readyState=${xhr.readyState} status=${xhr.status} responseType=${JSON.stringify(xhr.responseType)} read=${xhr.__kdRead ? "yes" : "no"}`;
		};
		describe("发出");
		try {
			xhr.addEventListener("load", () => describe("load"));
			xhr.addEventListener("error", () => describe("error"));
			xhr.addEventListener("abort", () => describe("abort"));
			xhr.addEventListener("timeout", () => describe("timeout"));
			xhr.addEventListener("readystatechange", () => {
				if (xhr.readyState >= 2) describe(`rs${xhr.readyState}`);
			});
		} catch (error) {}
	}
	/**
	* 等匹配出结果。播放器往往在弹弹play 返回之前就请求了第一段，
	* 现在请求由我们接管，可以放心地等数据到齐再回填回调。
	*
	* 两种模式：
	*
	* **普通页面**：判据是 `expecting || loading`，上界 LOAD_WAIT_MS。
	*   - `expecting` 由 panel 在决定匹配的那一刻置真，覆盖「请求比匹配更早到」
	*     这个首段必踩的窗口；
	*   - `loading` 是匹配真的在跑。
	*   两者都没有 = 这次页面压根不打算匹配（开关关着、或匹配已失败收场），
	*   立刻放行，不要让播放器等一个永远不来的结果。
	*
	* **白名单页面（hold）**：**没有超时**，一直扣到有结果 / 用户手动点播放。
	*   匹配失败也照样扣住——用户要的就是「没匹配上就先别浪费这一段」，
	*   只有他自己点播放（`releaseHold()`）才放行。
	*   扣住的只是弹幕那一路请求，视频本身照常能放，所以无限期挂着不会
	*   让播放器转圈；页面换了（`state.hold` 变假）也会立刻收手，避免旧页面
	*   上残留的请求把内存吊死。
	*/
	async function waitForLoading() {
		if (state.comments) return;
		const hold = state.hold;
		if (hold) state.stats.held++;
		const deadline = Date.now() + LOAD_WAIT_MS;
		while (true) {
			if (state.comments) return;
			if (hold) {
				if (state.holdReleased) return;
				if (!state.hold) return;
				await new Promise((resolve) => setTimeout(resolve, 100));
				const loading = state.loading;
				if (loading) await loading.then(() => void 0, () => void 0);
				continue;
			}
			if (Date.now() >= deadline) return;
			const loading = state.loading;
			if (!loading) {
				if (!state.expecting) return;
				await new Promise((resolve) => setTimeout(resolve, 50));
				continue;
			}
			await loading.then(() => void 0, () => void 0);
			if (!state.comments) return;
		}
	}
	const LOAD_EVENTS = [
		"load",
		"readystatechange",
		"loadend"
	];
	/** 自己把分段字节取回来（GM 请求，绕过页面 CORS 与缓存） */
	function fetchSegBytes(url) {
		return new Promise((resolve, reject) => {
			GM_xmlhttpRequest({
				url,
				method: "GET",
				responseType: "arraybuffer",
				timeout: 8e3,
				onload: (res) => {
					if (res.status === 304) {
						resolve(/* @__PURE__ */ new Uint8Array(0));
						return;
					}
					if (res.status >= 200 && res.status < 400) {
						resolve(new Uint8Array(res.response || /* @__PURE__ */ new ArrayBuffer(0)));
						return;
					}
					reject(/* @__PURE__ */ new Error(`HTTP ${res.status}`));
				},
				onerror: () => reject(/* @__PURE__ */ new Error("网络错误")),
				ontimeout: () => reject(/* @__PURE__ */ new Error("请求超时"))
			});
		});
	}
	/** 把合并后的字节写成这个 xhr 自己的响应 */
	function writeResponse(xhr, bytes, url) {
		for (const key of [
			"response",
			"responseText",
			"responseURL",
			"readyState",
			"status",
			"statusText",
			"getAllResponseHeaders",
			"getResponseHeader"
		]) try {
			Object.defineProperty(xhr, key, {
				configurable: true,
				writable: true
			});
		} catch (error) {}
		const type = xhr.responseType;
		const buffer = toArrayBuffer(bytes);
		if (type === "arraybuffer" || type === "blob") {
			xhr.response = type === "blob" ? new Blob([buffer], { type: "application/octet-stream" }) : buffer;
			xhr.responseText = "";
		} else {
			const text = new TextDecoder("utf-8").decode(bytes);
			xhr.response = text;
			xhr.responseText = text;
		}
		xhr.responseURL = url;
		xhr.readyState = 4;
		xhr.status = 200;
		xhr.statusText = "OK";
		xhr.getAllResponseHeaders = () => "Content-Type: application/octet-stream\r\n";
		xhr.getResponseHeader = (name) => String(name).toLowerCase() === "content-type" ? "application/octet-stream" : null;
	}
	/** 按注册顺序调用播放器自己的回调，事件对象照着 LoadEvent 伪造 */
	function fireCallbacks(xhr, callbacks) {
		for (const [type, cb] of callbacks) {
			const event = {
				type,
				target: xhr,
				currentTarget: xhr,
				srcElement: xhr,
				isTrusted: true,
				bubbles: false,
				cancelable: false,
				composed: false,
				defaultPrevented: false,
				eventPhase: 2,
				timeStamp: 0,
				lengthComputable: false,
				loaded: 1,
				total: 1
			};
			try {
				cb.call(xhr, event);
			} catch (error) {
				console.warn("[danmaku-enhance] 播放器回调执行失败", type, error);
			}
		}
	}
	function patchXHR(target) {
		const Ctor = (target === null || target === void 0 ? void 0 : target.XMLHttpRequest) || XmlHttpRequestCtor;
		const proto = Ctor === null || Ctor === void 0 ? void 0 : Ctor.prototype;
		if (!proto) return false;
		if (proto.__kdPatched) return true;
		const originalOpen = proto.open;
		const originalSend = proto.send;
		const originalAddEventListener = proto.addEventListener;
		proto.open = function(method, url, ...rest) {
			this.__kdCallbacks = void 0;
			this.__kdAborted = false;
			this.__kdMerged = void 0;
			this.__kdRead = false;
			try {
				const href = typeof url === "string" ? url : url.href;
				this.__kdUrl = new URL(href, location.href).href;
				this.__kdCtx = parseSegRequest(href);
			} catch (error) {
				this.__kdCtx = void 0;
				this.__kdUrl = void 0;
			}
			return originalOpen.apply(this, [
				method,
				url,
				...rest
			]);
		};
		proto.addEventListener = function(name, cb, options) {
			if (LOAD_EVENTS.indexOf(name) >= 0 && typeof cb === "function") {
				if (!this.__kdCallbacks) this.__kdCallbacks = [];
				this.__kdCallbacks.push([name, cb]);
			}
			if (name === "abort") {
				const mark = () => {
					this.__kdAborted = true;
				};
				try {
					originalAddEventListener.call(this, "abort", mark, options);
				} catch (error) {}
				return;
			}
			return originalAddEventListener.call(this, name, cb, options);
		};
		proto.send = function(body) {
			const request = this.__kdCtx;
			countRequest(request);
			if (!request || !state.enabled) return originalSend.call(this, body);
			const xhr = this;
			state.stats.xhrs++;
			trackRequest(xhr, request);
			const callbacks = (xhr.__kdCallbacks || []).slice();
			const onReadyState = xhr.onreadystatechange;
			const onLoad = xhr.onload;
			const onLoadEnd = xhr.onloadend;
			if (typeof onReadyState === "function") callbacks.push(["readystatechange", onReadyState]);
			if (typeof onLoad === "function") callbacks.push(["load", onLoad]);
			if (typeof onLoadEnd === "function") callbacks.push(["loadend", onLoadEnd]);
			const url = xhr.__kdUrl;
			if (!callbacks.length || !url) {
				state.stats.lastDetail = callbacks.length ? "没拿到请求 URL，退回原生请求" : "播放器没注册 load 回调，退回原生请求";
				return originalSend.call(this, body);
			}
			(async () => {
				let bytes = null;
				try {
					bytes = await fetchSegBytes(url);
				} catch (error) {
					state.stats.lastDetail = `自行拉取失败退回原生：${errorMessage(error)}`;
				}
				if (xhr.__kdAborted) {
					state.stats.lastDetail = "接管期间播放器取消了请求";
					return;
				}
				if (!bytes) {
					try {
						originalSend.call(xhr, body);
					} catch (error) {
						state.stats.lastDetail = `退回原生发送失败：${errorMessage(error)}`;
					}
					return;
				}
				await waitForLoading();
				let merged = bytes;
				try {
					const injected = buildInjections(request, bytes);
					if (injected) merged = injected;
				} catch (error) {
					state.stats.lastDetail = `合并异常：${errorMessage(error)}`;
				}
				writeResponse(xhr, merged, url);
				state.stats.reads++;
				fireCallbacks(xhr, callbacks);
			})();
		};
		proto.__kdPatched = true;
		return true;
	}
	function patchFetch(target) {
		const originalFetch = target.fetch;
		if (typeof originalFetch !== "function") return;
		const ResponseCtor = target.Response || Response;
		target.fetch = function(input, init) {
			var _this = this;
			let request;
			try {
				request = parseSegRequest(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
			} catch (error) {
				request = void 0;
			}
			countRequest(request);
			if (!request || !state.enabled) return originalFetch.call(this, input, init);
			state.stats.fetches++;
			const ctx = request;
			return (async () => {
				await waitForLoading();
				const response = await originalFetch.call(_this, input, init);
				if (!state.enabled) {
					state.stats.lastDetail = "响应返回时开关已关闭";
					return response;
				}
				if (response.status === 304) {
					state.stats.reads++;
					const merged = buildInjections(ctx, /* @__PURE__ */ new Uint8Array(0));
					if (!merged) return response;
					return new ResponseCtor(toArrayBuffer(merged), {
						status: 200,
						statusText: "OK",
						headers: { "content-type": "application/octet-stream" }
					});
				}
				if (!response.ok) {
					state.stats.lastDetail = `fetch 响应状态 ${response.status}`;
					return response;
				}
				state.stats.reads++;
				try {
					const bytes = new Uint8Array(await response.clone().arrayBuffer());
					const merged = buildInjections(ctx, bytes);
					if (!merged) return response;
					const headers = new Headers(response.headers);
					headers.delete("content-length");
					headers.delete("content-encoding");
					return new ResponseCtor(toArrayBuffer(merged), {
						status: response.status,
						statusText: response.statusText,
						headers
					});
				} catch (error) {
					const msg = errorMessage(error);
					state.stats.lastDetail = `合并 fetch 弹幕异常：${msg}`;
					console.warn("[danmaku-enhance] 合并 fetch 弹幕失败", error);
					return response;
				}
			})();
		};
	}
	/**
	* 油猴沙箱里的 window 是代理对象，直接改 window.fetch / 全局变量
	* 常常打不到页面自己的那份。优先拿到页面真实的 window。
	*/
	function pageWindow() {
		const win = window;
		return win.unsafeWindow || win.wrappedJSObject || win;
	}
	function installHook() {
		var _script$version, _GM_info;
		if (installed) return;
		installed = true;
		const page = pageWindow();
		patchXHR(window);
		patchFetch(window);
		if (page !== window) {
			try {
				patchXHR(page);
			} catch (error) {
				console.warn("[danmaku-enhance] 无法拦截页面 XHR", error);
			}
			try {
				patchFetch(page);
			} catch (error) {
				console.warn("[danmaku-enhance] 无法拦截页面 fetch", error);
			}
		}
		console.info("[danmaku-enhance] 已安装弹幕拦截", {
			version: typeof GM_info !== "undefined" ? (_script$version = (_GM_info = GM_info) === null || _GM_info === void 0 || (_GM_info = _GM_info.script) === null || _GM_info === void 0 ? void 0 : _GM_info.version) !== null && _script$version !== void 0 ? _script$version : "" : "",
			sameWindow: page === window,
			hookUrl: SEG_PATH.source,
			mode: "接管 XHR",
			hasGM: typeof GM_xmlhttpRequest !== "undefined"
		});
	}
	//#endregion
	//#region node_modules/lodash-es/_freeGlobal.js
	/** Detect free variable `global` from Node.js. */
	var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
	//#endregion
	//#region node_modules/lodash-es/_root.js
	/** Detect free variable `self`. */
	var freeSelf = typeof self == "object" && self && self.Object === Object && self;
	/** Used as a reference to the global object. */
	var root = freeGlobal || freeSelf || Function("return this")();
	//#endregion
	//#region node_modules/lodash-es/_Symbol.js
	/** Built-in value references. */
	var Symbol$1 = root.Symbol;
	//#endregion
	//#region node_modules/lodash-es/_getRawTag.js
	/** Used for built-in method references. */
	var objectProto$1 = Object.prototype;
	/** Used to check objects for own properties. */
	var hasOwnProperty$3 = objectProto$1.hasOwnProperty;
	/**
	* Used to resolve the
	* [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	* of values.
	*/
	var nativeObjectToString$1 = objectProto$1.toString;
	/** Built-in value references. */
	var symToStringTag$1 = Symbol$1 ? Symbol$1.toStringTag : void 0;
	/**
	* A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
	*
	* @private
	* @param {*} value The value to query.
	* @returns {string} Returns the raw `toStringTag`.
	*/
	function getRawTag(value) {
		var isOwn = hasOwnProperty$3.call(value, symToStringTag$1), tag = value[symToStringTag$1];
		try {
			value[symToStringTag$1] = void 0;
			var unmasked = true;
		} catch (e) {}
		var result = nativeObjectToString$1.call(value);
		if (unmasked) if (isOwn) value[symToStringTag$1] = tag;
		else delete value[symToStringTag$1];
		return result;
	}
	//#endregion
	//#region node_modules/lodash-es/_objectToString.js
	/**
	* Used to resolve the
	* [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	* of values.
	*/
	var nativeObjectToString = Object.prototype.toString;
	/**
	* Converts `value` to a string using `Object.prototype.toString`.
	*
	* @private
	* @param {*} value The value to convert.
	* @returns {string} Returns the converted string.
	*/
	function objectToString(value) {
		return nativeObjectToString.call(value);
	}
	//#endregion
	//#region node_modules/lodash-es/_baseGetTag.js
	/** `Object#toString` result references. */
	var nullTag = "[object Null]";
	var undefinedTag = "[object Undefined]";
	/** Built-in value references. */
	var symToStringTag = Symbol$1 ? Symbol$1.toStringTag : void 0;
	/**
	* The base implementation of `getTag` without fallbacks for buggy environments.
	*
	* @private
	* @param {*} value The value to query.
	* @returns {string} Returns the `toStringTag`.
	*/
	function baseGetTag(value) {
		if (value == null) return value === void 0 ? undefinedTag : nullTag;
		return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
	}
	//#endregion
	//#region node_modules/lodash-es/isObject.js
	/**
	* Checks if `value` is the
	* [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
	* of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	*
	* @static
	* @memberOf _
	* @since 0.1.0
	* @category Lang
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is an object, else `false`.
	* @example
	*
	* _.isObject({});
	* // => true
	*
	* _.isObject([1, 2, 3]);
	* // => true
	*
	* _.isObject(_.noop);
	* // => true
	*
	* _.isObject(null);
	* // => false
	*/
	function isObject(value) {
		var type = typeof value;
		return value != null && (type == "object" || type == "function");
	}
	//#endregion
	//#region node_modules/lodash-es/isFunction.js
	/** `Object#toString` result references. */
	var asyncTag = "[object AsyncFunction]";
	var funcTag = "[object Function]";
	var genTag = "[object GeneratorFunction]";
	var proxyTag = "[object Proxy]";
	/**
	* Checks if `value` is classified as a `Function` object.
	*
	* @static
	* @memberOf _
	* @since 0.1.0
	* @category Lang
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is a function, else `false`.
	* @example
	*
	* _.isFunction(_);
	* // => true
	*
	* _.isFunction(/abc/);
	* // => false
	*/
	function isFunction(value) {
		if (!isObject(value)) return false;
		var tag = baseGetTag(value);
		return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
	}
	//#endregion
	//#region node_modules/lodash-es/_coreJsData.js
	/** Used to detect overreaching core-js shims. */
	var coreJsData = root["__core-js_shared__"];
	//#endregion
	//#region node_modules/lodash-es/_isMasked.js
	/** Used to detect methods masquerading as native. */
	var maskSrcKey = function() {
		var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
		return uid ? "Symbol(src)_1." + uid : "";
	}();
	/**
	* Checks if `func` has its source masked.
	*
	* @private
	* @param {Function} func The function to check.
	* @returns {boolean} Returns `true` if `func` is masked, else `false`.
	*/
	function isMasked(func) {
		return !!maskSrcKey && maskSrcKey in func;
	}
	//#endregion
	//#region node_modules/lodash-es/_toSource.js
	/** Used to resolve the decompiled source of functions. */
	var funcToString$1 = Function.prototype.toString;
	/**
	* Converts `func` to its source code.
	*
	* @private
	* @param {Function} func The function to convert.
	* @returns {string} Returns the source code.
	*/
	function toSource(func) {
		if (func != null) {
			try {
				return funcToString$1.call(func);
			} catch (e) {}
			try {
				return func + "";
			} catch (e) {}
		}
		return "";
	}
	//#endregion
	//#region node_modules/lodash-es/_baseIsNative.js
	/**
	* Used to match `RegExp`
	* [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
	*/
	var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
	/** Used to detect host constructors (Safari). */
	var reIsHostCtor = /^\[object .+?Constructor\]$/;
	/** Used for built-in method references. */
	var funcProto = Function.prototype;
	var objectProto = Object.prototype;
	/** Used to resolve the decompiled source of functions. */
	var funcToString = funcProto.toString;
	/** Used to check objects for own properties. */
	var hasOwnProperty$2 = objectProto.hasOwnProperty;
	/** Used to detect if a method is native. */
	var reIsNative = RegExp("^" + funcToString.call(hasOwnProperty$2).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");
	/**
	* The base implementation of `_.isNative` without bad shim checks.
	*
	* @private
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is a native function,
	*  else `false`.
	*/
	function baseIsNative(value) {
		if (!isObject(value) || isMasked(value)) return false;
		return (isFunction(value) ? reIsNative : reIsHostCtor).test(toSource(value));
	}
	//#endregion
	//#region node_modules/lodash-es/_getValue.js
	/**
	* Gets the value at `key` of `object`.
	*
	* @private
	* @param {Object} [object] The object to query.
	* @param {string} key The key of the property to get.
	* @returns {*} Returns the property value.
	*/
	function getValue(object, key) {
		return object == null ? void 0 : object[key];
	}
	//#endregion
	//#region node_modules/lodash-es/_getNative.js
	/**
	* Gets the native function at `key` of `object`.
	*
	* @private
	* @param {Object} object The object to query.
	* @param {string} key The key of the method to get.
	* @returns {*} Returns the function if it's native, else `undefined`.
	*/
	function getNative(object, key) {
		var value = getValue(object, key);
		return baseIsNative(value) ? value : void 0;
	}
	//#endregion
	//#region node_modules/lodash-es/eq.js
	/**
	* Performs a
	* [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	* comparison between two values to determine if they are equivalent.
	*
	* @static
	* @memberOf _
	* @since 4.0.0
	* @category Lang
	* @param {*} value The value to compare.
	* @param {*} other The other value to compare.
	* @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	* @example
	*
	* var object = { 'a': 1 };
	* var other = { 'a': 1 };
	*
	* _.eq(object, object);
	* // => true
	*
	* _.eq(object, other);
	* // => false
	*
	* _.eq('a', 'a');
	* // => true
	*
	* _.eq('a', Object('a'));
	* // => false
	*
	* _.eq(NaN, NaN);
	* // => true
	*/
	function eq(value, other) {
		return value === other || value !== value && other !== other;
	}
	//#endregion
	//#region node_modules/lodash-es/_nativeCreate.js
	var nativeCreate = getNative(Object, "create");
	//#endregion
	//#region node_modules/lodash-es/_hashClear.js
	/**
	* Removes all key-value entries from the hash.
	*
	* @private
	* @name clear
	* @memberOf Hash
	*/
	function hashClear() {
		this.__data__ = nativeCreate ? nativeCreate(null) : {};
		this.size = 0;
	}
	//#endregion
	//#region node_modules/lodash-es/_hashDelete.js
	/**
	* Removes `key` and its value from the hash.
	*
	* @private
	* @name delete
	* @memberOf Hash
	* @param {Object} hash The hash to modify.
	* @param {string} key The key of the value to remove.
	* @returns {boolean} Returns `true` if the entry was removed, else `false`.
	*/
	function hashDelete(key) {
		var result = this.has(key) && delete this.__data__[key];
		this.size -= result ? 1 : 0;
		return result;
	}
	//#endregion
	//#region node_modules/lodash-es/_hashGet.js
	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED$1 = "__lodash_hash_undefined__";
	/** Used to check objects for own properties. */
	var hasOwnProperty$1 = Object.prototype.hasOwnProperty;
	/**
	* Gets the hash value for `key`.
	*
	* @private
	* @name get
	* @memberOf Hash
	* @param {string} key The key of the value to get.
	* @returns {*} Returns the entry value.
	*/
	function hashGet(key) {
		var data = this.__data__;
		if (nativeCreate) {
			var result = data[key];
			return result === HASH_UNDEFINED$1 ? void 0 : result;
		}
		return hasOwnProperty$1.call(data, key) ? data[key] : void 0;
	}
	//#endregion
	//#region node_modules/lodash-es/_hashHas.js
	/** Used to check objects for own properties. */
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	/**
	* Checks if a hash value for `key` exists.
	*
	* @private
	* @name has
	* @memberOf Hash
	* @param {string} key The key of the entry to check.
	* @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	*/
	function hashHas(key) {
		var data = this.__data__;
		return nativeCreate ? data[key] !== void 0 : hasOwnProperty.call(data, key);
	}
	//#endregion
	//#region node_modules/lodash-es/_hashSet.js
	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = "__lodash_hash_undefined__";
	/**
	* Sets the hash `key` to `value`.
	*
	* @private
	* @name set
	* @memberOf Hash
	* @param {string} key The key of the value to set.
	* @param {*} value The value to set.
	* @returns {Object} Returns the hash instance.
	*/
	function hashSet(key, value) {
		var data = this.__data__;
		this.size += this.has(key) ? 0 : 1;
		data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED : value;
		return this;
	}
	//#endregion
	//#region node_modules/lodash-es/_Hash.js
	/**
	* Creates a hash object.
	*
	* @private
	* @constructor
	* @param {Array} [entries] The key-value pairs to cache.
	*/
	function Hash(entries) {
		var index = -1, length = entries == null ? 0 : entries.length;
		this.clear();
		while (++index < length) {
			var entry = entries[index];
			this.set(entry[0], entry[1]);
		}
	}
	Hash.prototype.clear = hashClear;
	Hash.prototype["delete"] = hashDelete;
	Hash.prototype.get = hashGet;
	Hash.prototype.has = hashHas;
	Hash.prototype.set = hashSet;
	//#endregion
	//#region node_modules/lodash-es/_listCacheClear.js
	/**
	* Removes all key-value entries from the list cache.
	*
	* @private
	* @name clear
	* @memberOf ListCache
	*/
	function listCacheClear() {
		this.__data__ = [];
		this.size = 0;
	}
	//#endregion
	//#region node_modules/lodash-es/_assocIndexOf.js
	/**
	* Gets the index at which the `key` is found in `array` of key-value pairs.
	*
	* @private
	* @param {Array} array The array to inspect.
	* @param {*} key The key to search for.
	* @returns {number} Returns the index of the matched value, else `-1`.
	*/
	function assocIndexOf(array, key) {
		var length = array.length;
		while (length--) if (eq(array[length][0], key)) return length;
		return -1;
	}
	//#endregion
	//#region node_modules/lodash-es/_listCacheDelete.js
	/** Built-in value references. */
	var splice = Array.prototype.splice;
	/**
	* Removes `key` and its value from the list cache.
	*
	* @private
	* @name delete
	* @memberOf ListCache
	* @param {string} key The key of the value to remove.
	* @returns {boolean} Returns `true` if the entry was removed, else `false`.
	*/
	function listCacheDelete(key) {
		var data = this.__data__, index = assocIndexOf(data, key);
		if (index < 0) return false;
		if (index == data.length - 1) data.pop();
		else splice.call(data, index, 1);
		--this.size;
		return true;
	}
	//#endregion
	//#region node_modules/lodash-es/_listCacheGet.js
	/**
	* Gets the list cache value for `key`.
	*
	* @private
	* @name get
	* @memberOf ListCache
	* @param {string} key The key of the value to get.
	* @returns {*} Returns the entry value.
	*/
	function listCacheGet(key) {
		var data = this.__data__, index = assocIndexOf(data, key);
		return index < 0 ? void 0 : data[index][1];
	}
	//#endregion
	//#region node_modules/lodash-es/_listCacheHas.js
	/**
	* Checks if a list cache value for `key` exists.
	*
	* @private
	* @name has
	* @memberOf ListCache
	* @param {string} key The key of the entry to check.
	* @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	*/
	function listCacheHas(key) {
		return assocIndexOf(this.__data__, key) > -1;
	}
	//#endregion
	//#region node_modules/lodash-es/_listCacheSet.js
	/**
	* Sets the list cache `key` to `value`.
	*
	* @private
	* @name set
	* @memberOf ListCache
	* @param {string} key The key of the value to set.
	* @param {*} value The value to set.
	* @returns {Object} Returns the list cache instance.
	*/
	function listCacheSet(key, value) {
		var data = this.__data__, index = assocIndexOf(data, key);
		if (index < 0) {
			++this.size;
			data.push([key, value]);
		} else data[index][1] = value;
		return this;
	}
	//#endregion
	//#region node_modules/lodash-es/_ListCache.js
	/**
	* Creates an list cache object.
	*
	* @private
	* @constructor
	* @param {Array} [entries] The key-value pairs to cache.
	*/
	function ListCache(entries) {
		var index = -1, length = entries == null ? 0 : entries.length;
		this.clear();
		while (++index < length) {
			var entry = entries[index];
			this.set(entry[0], entry[1]);
		}
	}
	ListCache.prototype.clear = listCacheClear;
	ListCache.prototype["delete"] = listCacheDelete;
	ListCache.prototype.get = listCacheGet;
	ListCache.prototype.has = listCacheHas;
	ListCache.prototype.set = listCacheSet;
	//#endregion
	//#region node_modules/lodash-es/_Map.js
	var Map$1 = getNative(root, "Map");
	//#endregion
	//#region node_modules/lodash-es/_mapCacheClear.js
	/**
	* Removes all key-value entries from the map.
	*
	* @private
	* @name clear
	* @memberOf MapCache
	*/
	function mapCacheClear() {
		this.size = 0;
		this.__data__ = {
			"hash": new Hash(),
			"map": new (Map$1 || ListCache)(),
			"string": new Hash()
		};
	}
	//#endregion
	//#region node_modules/lodash-es/_isKeyable.js
	/**
	* Checks if `value` is suitable for use as unique object key.
	*
	* @private
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is suitable, else `false`.
	*/
	function isKeyable(value) {
		var type = typeof value;
		return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
	}
	//#endregion
	//#region node_modules/lodash-es/_getMapData.js
	/**
	* Gets the data for `map`.
	*
	* @private
	* @param {Object} map The map to query.
	* @param {string} key The reference key.
	* @returns {*} Returns the map data.
	*/
	function getMapData(map, key) {
		var data = map.__data__;
		return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
	}
	//#endregion
	//#region node_modules/lodash-es/_mapCacheDelete.js
	/**
	* Removes `key` and its value from the map.
	*
	* @private
	* @name delete
	* @memberOf MapCache
	* @param {string} key The key of the value to remove.
	* @returns {boolean} Returns `true` if the entry was removed, else `false`.
	*/
	function mapCacheDelete(key) {
		var result = getMapData(this, key)["delete"](key);
		this.size -= result ? 1 : 0;
		return result;
	}
	//#endregion
	//#region node_modules/lodash-es/_mapCacheGet.js
	/**
	* Gets the map value for `key`.
	*
	* @private
	* @name get
	* @memberOf MapCache
	* @param {string} key The key of the value to get.
	* @returns {*} Returns the entry value.
	*/
	function mapCacheGet(key) {
		return getMapData(this, key).get(key);
	}
	//#endregion
	//#region node_modules/lodash-es/_mapCacheHas.js
	/**
	* Checks if a map value for `key` exists.
	*
	* @private
	* @name has
	* @memberOf MapCache
	* @param {string} key The key of the entry to check.
	* @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	*/
	function mapCacheHas(key) {
		return getMapData(this, key).has(key);
	}
	//#endregion
	//#region node_modules/lodash-es/_mapCacheSet.js
	/**
	* Sets the map `key` to `value`.
	*
	* @private
	* @name set
	* @memberOf MapCache
	* @param {string} key The key of the value to set.
	* @param {*} value The value to set.
	* @returns {Object} Returns the map cache instance.
	*/
	function mapCacheSet(key, value) {
		var data = getMapData(this, key), size = data.size;
		data.set(key, value);
		this.size += data.size == size ? 0 : 1;
		return this;
	}
	//#endregion
	//#region node_modules/lodash-es/_MapCache.js
	/**
	* Creates a map cache object to store key-value pairs.
	*
	* @private
	* @constructor
	* @param {Array} [entries] The key-value pairs to cache.
	*/
	function MapCache(entries) {
		var index = -1, length = entries == null ? 0 : entries.length;
		this.clear();
		while (++index < length) {
			var entry = entries[index];
			this.set(entry[0], entry[1]);
		}
	}
	MapCache.prototype.clear = mapCacheClear;
	MapCache.prototype["delete"] = mapCacheDelete;
	MapCache.prototype.get = mapCacheGet;
	MapCache.prototype.has = mapCacheHas;
	MapCache.prototype.set = mapCacheSet;
	//#endregion
	//#region node_modules/lodash-es/memoize.js
	/** Error message constants. */
	var FUNC_ERROR_TEXT = "Expected a function";
	/**
	* Creates a function that memoizes the result of `func`. If `resolver` is
	* provided, it determines the cache key for storing the result based on the
	* arguments provided to the memoized function. By default, the first argument
	* provided to the memoized function is used as the map cache key. The `func`
	* is invoked with the `this` binding of the memoized function.
	*
	* **Note:** The cache is exposed as the `cache` property on the memoized
	* function. Its creation may be customized by replacing the `_.memoize.Cache`
	* constructor with one whose instances implement the
	* [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
	* method interface of `clear`, `delete`, `get`, `has`, and `set`.
	*
	* @static
	* @memberOf _
	* @since 0.1.0
	* @category Function
	* @param {Function} func The function to have its output memoized.
	* @param {Function} [resolver] The function to resolve the cache key.
	* @returns {Function} Returns the new memoized function.
	* @example
	*
	* var object = { 'a': 1, 'b': 2 };
	* var other = { 'c': 3, 'd': 4 };
	*
	* var values = _.memoize(_.values);
	* values(object);
	* // => [1, 2]
	*
	* values(other);
	* // => [3, 4]
	*
	* object.a = 2;
	* values(object);
	* // => [1, 2]
	*
	* // Modify the result cache.
	* values.cache.set(object, ['a', 'b']);
	* values(object);
	* // => ['a', 'b']
	*
	* // Replace `_.memoize.Cache`.
	* _.memoize.Cache = WeakMap;
	*/
	function memoize(func, resolver) {
		if (typeof func != "function" || resolver != null && typeof resolver != "function") throw new TypeError(FUNC_ERROR_TEXT);
		var memoized = function() {
			var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
			if (cache.has(key)) return cache.get(key);
			var result = func.apply(this, args);
			memoized.cache = cache.set(key, result) || cache;
			return result;
		};
		memoized.cache = new (memoize.Cache || MapCache)();
		return memoized;
	}
	memoize.Cache = MapCache;
	//#endregion
	//#region src/adapter/bilibili/lib/request.ts
	function request(opts) {
		let { url, method, params } = opts;
		if (params) {
			const u = new URL(url);
			Object.keys(params).forEach((key) => {
				const value = params[key];
				if (value !== void 0 && value !== null) u.searchParams.set(key, String(value));
			});
			url = u.toString();
		}
		return new Promise((resolve, reject) => {
			GM_xmlhttpRequest({
				url,
				method: method || "GET",
				responseType: "json",
				headers: opts.headers,
				onload: (res) => resolve(res.response),
				onerror: reject,
				ontimeout: () => reject(/* @__PURE__ */ new Error("请求超时"))
			});
		});
	}
	//#endregion
	//#region src/adapter/bilibili/lib/dandanplay.ts
	/**
	* 弹弹play 接口封装。
	*
	* 从上游 `player/plugins/danmaku/apis.ts` 内化。原始文件通过
	* `danmaku/utils.ts` 间接依赖 KPlayer（值导入），会把整个 K 播放器打进
	* B 站脚本，这里只保留真正用到的三个接口。
	*
	* https://api.dandanplay.net/swagger/index.html
	*/
	const headers = JSON.parse(atob("eyJYLUFwcElkIjoiaHZmNnB6dnhjbSIsIlgtQXBwU2VjcmV0IjoiSVpoY1VJYWtveEZhSzl4QkJESjlCczFPVTJzNGtLNXQifQ=="));
	const baseURL = "https://api.dandanplay.net";
	const client = (opts) => request(_objectSpread2(_objectSpread2({}, opts), {}, {
		headers,
		url: baseURL + opts.url
	}));
	function convert32ToHex(color) {
		return "#" + parseInt(color).toString(16);
	}
	async function getComments(episodeId) {
		return (await client({
			url: `/api/v2/comment/${episodeId}`,
			params: {
				chConvert: 1,
				withRelated: true
			}
		})).comments.map((o) => {
			const [time, type, color] = o.p.split(",");
			return {
				mode: {
					1: "rtl",
					4: "bottom",
					5: "top"
				}[type] || "rtl",
				text: o.m,
				time: parseFloat(time),
				style: { color: convert32ToHex(color) }
			};
		}).sort((a, b) => a.time - b.time);
	}
	async function queryAnimes(anime) {
		const res = await client({
			url: `/api/v2/search/anime`,
			params: { keyword: anime }
		});
		if (!res.success) throw new Error(res.errorMessage);
		const nameCountMap = /* @__PURE__ */ new Map();
		res.animes.forEach((o) => {
			nameCountMap.set(o.animeTitle, (nameCountMap.get(o.animeTitle) || 0) + 1);
		});
		return res.animes.map((o) => ({
			id: o.bangumiId,
			name: nameCountMap.get(o.animeTitle) > 1 ? `${o.animeTitle}(${o.typeDescription})` : o.animeTitle
		}));
	}
	const queryEpisodes = memoize(async function(animeId) {
		const res = await client({ url: `/api/v2/bangumi/${animeId}` });
		if (!res.success) {
			setTimeout(() => {
				var _queryEpisodes$cache$, _queryEpisodes$cache;
				return (_queryEpisodes$cache$ = (_queryEpisodes$cache = queryEpisodes.cache).clear) === null || _queryEpisodes$cache$ === void 0 ? void 0 : _queryEpisodes$cache$.call(_queryEpisodes$cache);
			}, 100);
			throw new Error(res.errorMessage);
		}
		return res.bangumi.episodes.map((o) => ({
			id: o.episodeId,
			name: o.episodeTitle
		}));
	});
	//#endregion
	//#region src/adapter/bilibili/lib/remember.ts
	/**
	* 番剧/集数的本地记忆。
	*
	* 上游把这两个存储写在 `player/plugins/danmaku/utils.ts`，而那个文件同时
	* 导入了 `KPlayer`，导致只要引用其中的存储函数，整个 K 播放器（连带快捷键
	* 插件、plyr.css、hls）都会被打进产物。这里只保留存储部分。
	*
	* 存储键沿用上游的名字，用户已记住的映射在升级后依然有效。
	*/
	function createStorage(storageKey) {
		const storage = ((key, value) => {
			const store = local.getItem(storageKey, {});
			if (value !== void 0) {
				store[key] = value;
				local.setItem(storageKey, store);
			} else return store[key];
		});
		storage.entries = () => Object.entries(local.getItem(storageKey, {}));
		return storage;
	}
	/** 记忆「页面番名 → 弹弹play 番剧 id」 */
	const storageAnimeName = createStorage("k-player-danmaku-anime-name-v3");
	/** 记忆「番名.集数 → 弹弹play 集数 id」 */
	const storageEpisodeName = createStorage("k-player-danmaku-episode-name-v3");
	//#endregion
	//#region src/adapter/bilibili/match.ts
	/**
	* 弹弹play 的匹配：候选关键词生成、番剧/集数选择、弹幕拉取。
	*
	* 弹弹play 的搜索是纯子串包含（LIKE %keyword%），没有分词和模糊匹配，
	* 而且最多只回 25 条、按 bangumiId 升序、不支持翻页。所以这里把“页面标题
	* 和库里的番名不完全一致”拆成若干个仍然保证是子串的候选关键词，逐个试。
	*/
	/** 生成候选关键词时最多发几个搜索请求 */
	const MAX_KEYWORD_TRIES = 12;
	/** 关键词与返回番名的最长公共子串低于这个长度就认为无关 */
	const MIN_LCS = 3;
	/** 关键词最短长度，弹弹play 少于 2 字会直接报错 */
	const MIN_KEYWORD_LEN = 3;
	/** 滑窗长度上下限：太短定位不到番剧，太长又躲不开译名里多出来的词 */
	const WINDOW_MIN_LEN = 6;
	const WINDOW_MAX_LEN = 14;
	var MatchError = class extends Error {
		constructor(message, context = {}) {
			super(message);
			_defineProperty(this, "context", void 0);
			this.name = "MatchError";
			this.context = _objectSpread2({
				tried: [],
				animes: []
			}, context);
		}
	};
	/**
	* 弹幕缓存：按集数存一份，换集之后旧的就没用了。
	*
	* 之前是无上限的 Map —— 一口气翻十几集长番，十几个 3000 条级的
	* Comment 数组全留在内存里不释放。现在只保留最近两集（面板允许
	* 在上一集/下一集之间来回切），更早的丢掉，需要时重新拉一次。
	*/
	const COMMENT_CACHE_SIZE = 2;
	const commentCache = /* @__PURE__ */ new Map();
	function cacheComments(episodeId, comments) {
		while (commentCache.size >= COMMENT_CACHE_SIZE) {
			const oldest = commentCache.keys().next();
			if (oldest.done) break;
			commentCache.delete(oldest.value);
		}
		commentCache.set(episodeId, comments);
	}
	/** 集数标记：第3话 / 第 12 集 / 第1~4话 / 全25话 / [1] / EP12 */
	const EPISODE_MARKERS = [
		/第\s*[0-9]+(?:\.[0-9]+)?\s*[~～\-–—至到]\s*[0-9]+(?:\.[0-9]+)?\s*[集话話期回]/g,
		/第\s*[0-9]+(?:\.[0-9]+)?\s*[集话話期回]/g,
		/全\s*[0-9]+\s*[集话話期回]/g,
		/[0-9]+(?:\.[0-9]+)?\s*[~～\-–—至到]\s*[0-9]+(?:\.[0-9]+)?\s*[集话話期回]/g,
		/\[\s*[0-9]+(?:\.[0-9]+)?\s*\]/g,
		/\bEP?\.?\s*[0-9]+\b/gi
	];
	/**
	* 更新状态词。番剧列表页会把这些词塞进标题，
	* 但弹弹play 的番名里不会有，留着就整串搜不到。
	* 只收「一定不是作品名一部分」的写法 —— 像光秃秃的「完结」
	* 有可能是「XX 完结篇」这种真标题，不敢动。
	*/
	const STATUS_WORDS = /(?:每周|每週|周更|週更|周更新|更新至|更新到|连载中|連載中|已完结|已完結)/g;
	/**
	* 画质/编码标签。B 站不少投稿会在标题前面堆这些东西：
	* `4K超清 赛博朋克：边缘行者 第二季`。
	*
	* 它们本来无害（整串搜不到还能退到后面的短候选），但 `buildKeywords` 的
	* 兜底逻辑是「取最长的片段」，而 `4K超清` 正好和真正的番名片段一样长，
	* 排序还排在前面 —— 于是所有兜底候选都变成了画质标签，一次搜索全落空，
	* 面板报「未找到」。(实测：`4K超清 赛博朋克：边缘行者 第二季` 只生成
	* `['4K超清 赛博朋克：边缘行者 第二季', '4K超清']` 两个候选。)
	*/
	const TECH_TAGS = /\b(?:4K|8K|1080P|720P|2160P|HDR|HEVC|AVC|BDRip|BluRay|WEB-?DL)\b/gi;
	/** 中文画质词没有词边界，单独一遍 */
	const TECH_TAGS_CN = /(?:超清|蓝光(?:原盘)?|高清|极清|原画|杜比视界|60帧|120帧)/g;
	/** 首尾要剥掉的标点与括号（成对出现的两边都剥） */
	const EDGE_PUNCT = /[\s\/／\-–—_:：、,，.。!！?？|~～【】［］\[\]（）()《》<>『』「」“”"'‘’]+/g;
	/** 成对的括号：页面标题里经常只有一半，另一半被集数标记啃掉了 */
	const BRACKET_PAIRS = [
		["【", "】"],
		["［", "］"],
		["[", "]"],
		["（", "）"],
		["(", ")"],
		["《", "》"],
		["<", ">"],
		["『", "』"],
		["「", "」"],
		["〖", "〗"]
	];
	/**
	* 丢掉纯画质标签的片段。
	*
	* 只在「整个片段都是画质词」时才丢：`4K超清`、`1080P`、`BLURAY` 整段消失，
	* 但 `高清战队`、`4K之恋` 这种带着画质词的真正番名会原样保留——
	* 宁可漏清也不能把番名本身啃掉。片段之间有分隔符的（空格、点、竖线）才算，
	* 所以 `赛博朋克：边缘行者` 不会被拆开。
	*/
	function dropTechTags(title) {
		const parts = title.split(/([\s\u3000\/／|·、]+)/);
		let touched = false;
		const kept = parts.map((part) => {
			if (!part.trim()) return part;
			if (!part.replace(TECH_TAGS, " ").replace(TECH_TAGS_CN, " ").trim()) {
				touched = true;
				return " ";
			}
			return part;
		});
		return touched ? kept.join(" ") : title;
	}
	/**
	* 把所有成对括号字符替换成空格，但保留括号里的文字。
	*
	* `【A】第8集『B』第7话` 这类复合标题里，配对括号必须整对消失：
	* 之前 dropLoneBrackets 只删数量不配对的一侧，配对括号原样保留，
	* 结果「文本中间的括号去不掉」（用户实测）。这里一口气全部换成空格，
	* 番名文字不动；画质标签（【4K】之类）里的词随后由 dropTechTags 清掉。
	*/
	function stripBracketChars(text) {
		let out = text;
		for (const [open, close] of BRACKET_PAIRS) out = out.split(open).join(" ").split(close).join(" ");
		return out;
	}
	/** 清洗标题：去掉集数标记、更新状态、落单括号与首尾装饰，保留内部分隔符 */
	function cleanTitle(raw) {
		let title = String(raw || "").trim();
		for (const pattern of EPISODE_MARKERS) title = title.replace(pattern, " ");
		title = title.replace(STATUS_WORDS, " ");
		title = dropTechTags(title);
		title = title.replace(/\s*[-_|]\s*(在线观看|線上看|免费观看|高清).*$/g, " ");
		title = stripBracketChars(title);
		title = title.replace(new RegExp(`^${EDGE_PUNCT.source}`), "");
		title = title.replace(new RegExp(`${EDGE_PUNCT.source}$`), "");
		title = dropTechTags(title);
		title = title.replace(new RegExp(`^${EDGE_PUNCT.source}`), "");
		title = title.replace(new RegExp(`${EDGE_PUNCT.source}$`), "");
		return title.replace(/\s+/g, " ").trim();
	}
	/**
	* 从「转发合集」式的复合标题里拆出当前在播的番名与集数。
	*
	* `【向日葵马戏团】第8集『花织同学就算是转生后还是想干架』第7话`
	* —— 第一个集数「第8集」属于被转发的原作，真正在播的是『花织同学…』，
	* 集数是**最后一个**标记对应的「第7话」。这类标题的规律是：
	* 「番名段 + 它自己的集数标记」成对出现，最后那对才是当前视频。
	*
	* 返回 undefined 表示标题里没有集数标记，调用方走原有兜底。
	*/
	function splitCompoundTitle(raw) {
		const title = String(raw || "").trim();
		if (!title) return void 0;
		const marker = /第\s*([0-9]+(?:\.[0-9]+)?|[零一二两三四五六七八九十]+)\s*[集话話期回]/g;
		const marks = [];
		for (let match = marker.exec(title); match; match = marker.exec(title)) {
			const num = match[1];
			marks.push({
				index: match.index,
				end: match.index + match[0].length,
				episode: /^[0-9]/.test(num) ? String(parseFloat(num)) : num
			});
		}
		if (!marks.length) return void 0;
		const last = marks[marks.length - 1];
		const prevEnd = marks.length > 1 ? marks[marks.length - 2].end : 0;
		let series = title.slice(prevEnd, last.index);
		series = stripBracketChars(series);
		if (marks.length > 1) {
			const parts = segments(series);
			if (parts.length) series = parts.reduce((a, b) => b.length > a.length ? b : a);
		}
		series = series.trim();
		if (!cleanTitle(series)) series = cleanTitle(title.slice(last.end));
		if (!series) return void 0;
		return {
			seriesName: series,
			episode: last.episode
		};
	}
	/** 去掉所有分隔符与空格，处理全角半角差异 */
	function squash(title) {
		return String(title || "").replace(/[\s\u3000\-–—_:：、,，.。!！?？|~～【】\[\]（）()《》<>『』「」“”・·'’"’]+/g, "");
	}
	/** 按分隔符切段 */
	function segments(title) {
		return title.split(/[\s\u3000\-–—_:：、,，.。!！?？|~～【】\[\]（）()《》<>『』「」“”・·]+/).map((s) => s.trim()).filter(Boolean);
	}
	function half(text, which) {
		const middle = Math.ceil(text.length / 2);
		return which === "head" ? text.slice(0, middle) : text.slice(middle);
	}
	/** 纯季数、纯集数、纯画质这种片段当关键词毫无意义，选 longest/first 时要跳过 */
	function isNoiseSegment(text) {
		const key = squash(text);
		if (!key) return true;
		if (/^第?[0-9一二两三四五六七八九十]+[季期部]$/.test(key)) return true;
		if (/^[0-9]{1,3}$/.test(key)) return true;
		if (EPISODE_MARKERS.some((re) => new RegExp(`^(?:${re.source})$`, re.flags).test(text.trim()))) return true;
		if (dropTechTags(text).trim() === "") return true;
		return false;
	}
	/** 2~10 的罗马数字。番剧续作里 II、III 很常见，而且往往就写在大标题后面 */
	const ROMAN = {
		2: "II",
		3: "III",
		4: "IV",
		5: "V",
		6: "VI",
		7: "VII",
		8: "VIII",
		9: "IX",
		10: "X"
	};
	const ROMAN_TO_NUMBER = (() => {
		const table = {};
		for (const key of Object.keys(ROMAN)) table[ROMAN[Number(key)]] = Number(key);
		return table;
	})();
	/** 从「第几季」里取出季数，取不到返回 undefined */
	function seasonNumber(title) {
		const marked = /第\s*([0-9]+|[零一二两三四五六七八九十]+)\s*[季期部]/.exec(title);
		if (!marked) return void 0;
		return parseCount(marked[1]);
	}
	/**
	* 把「第二季」这一处改写成库里可能用的各种续作写法。
	*
	* 弹弹play 里续作命名很不统一，同一个「第二季」可能被写成：
	*   赛博朋克：边缘行者 2
	*   赛博朋克：边缘行者 II
	*   赛博朋克：边缘行者 Season 2
	*   赛博朋克：边缘行者 S2
	* 页面标题几乎总是写「第二季」，于是整串必然搜不到，只能退化成
	* 「赛博朋克」这种短片段，结果搜回一堆对不上季数的条目。
	* 这里把这几种写法都造出来各试一次：它们只改季数后缀、番名一字不差，
	* 属于精确候选，命中质量远高于短片段，所以排在退化手段之前。
	*/
	function seasonVariants(title) {
		const season = seasonNumber(title);
		if (season === void 0) return [];
		const marked = /第\s*(?:[0-9]+|[零一二两三四五六七八九十]+)\s*[季期部]/.exec(title);
		if (!marked) return [];
		const head = title.slice(0, marked.index).trim();
		const tail = title.slice(marked.index + marked[0].length).trim();
		if (!head) return [];
		const joined = [head, tail].filter(Boolean).join(" ");
		const variants = [
			`${joined} ${season}`,
			`${joined} Season ${season}`,
			`${joined} S${season}`
		];
		const roman = ROMAN[season];
		if (roman) variants.splice(1, 0, `${joined} ${roman}`);
		return variants;
	}
	/**
	* 生成候选关键词。顺序即尝试顺序，前面的更可能是精确命中。
	*
	* 例：`克雷瓦提斯-魔兽之王与婴儿与尸之勇者`
	*   ① 原样                       → 库里写法一致时直接命中
	*   ② 去掉全部分隔符              → 库里用空格/顿号代替横线时命中
	*   ③ 最长的片段                  → 副标题独立成条时命中
	*   ④ 该片段前半                  → 差异在尾部时命中
	*   ⑤ 第一个片段（通常是主标题）    → 库里只收了主标题时命中
	*   ⑥ 该片段后半                  → 差异在头部时命中
	*   ⑦ 该片段的滑窗                → 译名中间被加了词，整串搜不到时兜底
	*
	* ⑦ 是最后手段：页面标题常常在译名里多塞「身为」「迷情」这类词，
	* 于是整串必然不是库名的子串，只有退化成一段仍然连续的子串才搜得到。
	* 窗口长度取最长片段的一半，位置按剩余请求预算均匀取样，避免把预算
	* 全花在开头几个字上。
	*/
	function buildKeywords(rawTitle) {
		const title = cleanTitle(rawTitle);
		if (!title) return [];
		const all = segments(title);
		const meaningful = all.filter((seg) => !isNoiseSegment(seg));
		const pool = meaningful.length ? meaningful : all;
		const longest = [...pool].sort((a, b) => b.length - a.length)[0];
		const first = pool[0];
		const candidates = [
			title,
			squash(title),
			...seasonVariants(title),
			longest,
			longest && longest.length >= 6 ? half(longest, "head") : "",
			first,
			longest && longest.length >= 6 ? half(longest, "tail") : ""
		];
		const seen = /* @__PURE__ */ new Set();
		const out = [];
		const push = (raw, minLength = MIN_KEYWORD_LEN) => {
			const text = (raw || "").trim();
			if (text.length < minLength) return;
			const key = squash(text);
			if (!key || seen.has(key)) return;
			seen.add(key);
			out.push(text);
		};
		candidates.forEach((raw, index) => {
			if (out.length >= MAX_KEYWORD_TRIES) return;
			push(raw, index === 0 ? 2 : MIN_KEYWORD_LEN);
		});
		if (longest && out.length < MAX_KEYWORD_TRIES) {
			const budget = MAX_KEYWORD_TRIES - out.length;
			const length = Math.max(WINDOW_MIN_LEN, Math.min(WINDOW_MAX_LEN, Math.floor(longest.length / 2)));
			const total = longest.length - length + 1;
			if (total > 0) {
				const stride = Math.max(1, Math.ceil(total / budget));
				for (let offset = 0; offset < total; offset += stride) {
					if (out.length >= MAX_KEYWORD_TRIES) break;
					push(longest.slice(offset, offset + length));
				}
			}
		}
		return out;
	}
	/** 最长公共子串长度，用来判断搜索结果是否跟关键词有关 */
	function longestCommonSubstring(a, b) {
		const x = squash(a);
		const y = squash(b);
		if (!x || !y) return 0;
		let best = 0;
		let prev = new Array(y.length + 1).fill(0);
		for (let i = 1; i <= x.length; i++) {
			const cur = new Array(y.length + 1).fill(0);
			for (let j = 1; j <= y.length; j++) if (x[i - 1] === y[j - 1]) {
				cur[j] = prev[j - 1] + 1;
				if (cur[j] > best) best = cur[j];
			}
			prev = cur;
		}
		return best;
	}
	function normalizeName(name) {
		return squash(name).toLowerCase();
	}
	const CN_DIGITS = {
		零: 0,
		一: 1,
		二: 2,
		两: 2,
		三: 3,
		四: 4,
		五: 5,
		六: 6,
		七: 7,
		八: 8,
		九: 9
	};
	/** 解析「十二」「二十」「三」这类中文数字，纯数字原样返回 */
	function parseCount(text) {
		if (/^\d+$/.test(text)) return Number(text);
		const tensAt = text.indexOf("十");
		if (tensAt < 0) return text.length === 1 ? CN_DIGITS[text] : void 0;
		const head = text.slice(0, tensAt);
		const tail = text.slice(tensAt + 1);
		const tens = head ? CN_DIGITS[head] : 1;
		const ones = tail ? CN_DIGITS[tail] : 0;
		if (tens === void 0 || ones === void 0) return void 0;
		return tens * 10 + ones;
	}
	/**
	* 从番名里读出「第几季」。
	*
	* 这是为了防止把别的季的弹幕当成这一季：弹弹play 的搜索是子串匹配，
	* 页面写「镇魂街 第五季」而库里只有「镇魂街 第四季」时，搜索照样返回
	* 第四季。要是那成了唯一结果又被自动选中，屏幕上飘的就是上一季的弹幕，
	* 而状态行看着一切正常 —— 这种错比匹配失败更难发现。
	*/
	function seasonOf(title) {
		const marked = /第\s*([0-9]+|[零一二两三四五六七八九十]+)\s*[季期部]/.exec(title);
		if (marked) return parseCount(marked[1]);
		const english = /\b(?:season|s)\s*([0-9]{1,2})\b/i.exec(title);
		if (english) return Number(english[1]);
		const roman = /(?:^|[\s\u3000：:·・、,，\-–—_~～])(II|III|IV|V|VI|VII|VIII|IX|X)$/i.exec(title);
		if (roman) {
			const season = ROMAN_TO_NUMBER[roman[1].toUpperCase()];
			if (season !== void 0) return season;
		}
		const trailing = /(?:^|[\s\u3000：:·・、,，\-–—_~～])([2-9])$/.exec(title);
		if (trailing) return Number(trailing[1]);
	}
	function escapeRegExp(text) {
		return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	}
	function sameId(a, b) {
		return String(a) === String(b);
	}
	function searchAnime(keyword) {
		return queryAnimes(keyword);
	}
	/**
	* 手动搜索：直接搜用户输入的内容，不再做候选生成。
	* 结果按与关键词的相关度（公共子串长度）排序，方便用户挑。
	*/
	async function manualSearch(keyword) {
		const text = keyword.trim();
		if (squash(text).length < 2) return [];
		return [...await searchAnime(text)].sort((a, b) => longestCommonSubstring(text, b.name) - longestCommonSubstring(text, a.name));
	}
	async function episodeList(animeId) {
		return queryEpisodes(animeId);
	}
	async function commentsOf(episodeId) {
		const cached = commentCache.get(episodeId);
		if (cached) return cached;
		const comments = await getComments(episodeId);
		cacheComments(episodeId, comments);
		return comments;
	}
	/** 逐个试候选关键词，命中即停 */
	async function findAnime(rawTitle, log) {
		const keywords = buildKeywords(rawTitle);
		if (!keywords.length) throw new MatchError("没有可用的番剧名", { tried: [] });
		const title = cleanTitle(rawTitle);
		const tried = [];
		for (const keyword of keywords) {
			tried.push(keyword);
			let list;
			try {
				list = await searchAnime(keyword);
			} catch (error) {
				log === null || log === void 0 || log(`搜索「${keyword}」失败：${errorMessage(error)}`);
				continue;
			}
			const need = Math.min(MIN_LCS, squash(keyword).length);
			let relevant = list.filter((o) => longestCommonSubstring(keyword, o.name) >= need);
			if (!relevant.length && list.length === 1) relevant = list;
			if (relevant.length) {
				const needsConfirm = relevant.length === 1 && longestCommonSubstring(keyword, relevant[0].name) < need;
				log === null || log === void 0 || log(`「${keyword}」命中 ${relevant.length} 条`);
				const want = seasonOf(title);
				return {
					animes: [...relevant].sort((a, b) => {
						if (want !== void 0) {
							const pa = seasonOf(a.name) === want ? 1 : 0;
							const pb = seasonOf(b.name) === want ? 1 : 0;
							if (pa !== pb) return pb - pa;
						}
						return longestCommonSubstring(title, b.name) - longestCommonSubstring(title, a.name);
					}),
					keyword,
					tried,
					needsConfirm
				};
			}
			log === null || log === void 0 || log(`「${keyword}」${list.length} 条结果都不相关`);
		}
		throw new MatchError(`弹弹play 未找到「${title}」`, { tried });
	}
	/** 从候选里挑最可能的番剧；只有高置信才自动选中 */
	function chooseAnime(animes, info, hints = {}) {
		if (hints.animeId) {
			const hit = animes.find((o) => sameId(o.id, hints.animeId));
			if (hit) return hit;
		}
		const stored = storageAnimeName(info.seriesName);
		if (stored) {
			const hit = animes.find((o) => sameId(o.id, stored.id));
			if (hit) return hit;
		}
		const target = normalizeName(info.seriesName);
		const exact = animes.find((o) => normalizeName(o.name) === target);
		if (exact) return exact;
		const want = seasonOf(info.seriesName);
		if (want !== void 0) {
			const sameSeason = animes.filter((o) => seasonOf(o.name) === want);
			if (sameSeason.length === 1) return sameSeason[0];
			if (sameSeason.length > 1) return void 0;
			const seasonless = animes.filter((o) => seasonOf(o.name) === void 0);
			if (seasonless.length === 1 && seasonless.length === animes.length) return seasonless[0];
			return;
		}
		if (animes.length === 1) return animes[0];
	}
	/** 从候选里挑出之前记住的那一部（用户在面板里手动选过） */
	function rememberedAnime(animes, seriesName) {
		const stored = storageAnimeName(seriesName);
		if (!stored) return void 0;
		return animes.find((o) => sameId(o.id, stored.id));
	}
	/**
	* 直接读取用户之前手动确认过的番剧。
	*
	* 不能只在本轮搜索结果里查记忆：页面标题可能每次清洗结果略有不同，
	* 甚至这次搜索直接没有结果；这两种情况都会让原来的 rememberedAnime
	* 失去机会。先按原 key，再按归一化后的系列名找回手动映射。
	*/
	function rememberedAnimeFor(seriesName) {
		const direct = storageAnimeName(seriesName);
		if (direct) return {
			id: String(direct.id),
			name: String(direct.name)
		};
		const target = normalizeName(seriesName);
		if (!target) return void 0;
		const hit = storageAnimeName.entries().find(([key, value]) => {
			return normalizeName(key) === target || normalizeName(value.keyword || "") === target;
		});
		if (!hit) return void 0;
		return {
			id: String(hit[1].id),
			name: String(hit[1].name)
		};
	}
	function parseEpisodeNumber(episode) {
		const match = episode.match(/([0-9]+(?:\.[0-9]+)?)/);
		return match ? match[1] : void 0;
	}
	function chooseEpisode(episodes, info, hints = {}) {
		if (hints.episodeId) {
			const hit = episodes.find((o) => sameId(o.id, hints.episodeId));
			if (hit) return hit;
		}
		const storedId = storageEpisodeName(`${info.seriesName}.${info.episode}`);
		if (storedId) {
			const hit = episodes.find((o) => sameId(o.id, storedId));
			if (hit) return hit;
		}
		if (info.episode) {
			const num = parseEpisodeNumber(info.episode);
			if (num) {
				const target = String(parseFloat(num));
				const strong = episodes.find((o) => new RegExp(`第\\s*0*${escapeRegExp(target)}\\s*[集话話期回]`).test(o.name));
				if (strong) return strong;
				const loose = episodes.find((o) => new RegExp(`(^|[^0-9])0*${escapeRegExp(target)}([^0-9]|$)`).test(o.name));
				if (loose) return loose;
			} else {
				const hit = episodes.find((o) => o.name.includes(info.episode));
				if (hit) return hit;
			}
		}
		if (episodes.length === 1) return episodes[0];
	}
	/** 记住用户/自动选中的映射，下次打开同系列/同集时直接命中 */
	function rememberMatch(info, anime, episode) {
		storageAnimeName(info.seriesName, {
			id: anime.id,
			name: anime.name,
			keyword: info.seriesName
		});
		if (episode) storageEpisodeName(`${info.seriesName}.${info.episode}`, String(episode.id));
	}
	//#endregion
	//#region src/adapter/bilibili/info.ts
	/**
	* 读取 B 站当前页面正在播放的视频信息。
	*
	* 视频页：window.__INITIAL_STATE__（videoData / p）
	* 番剧页：window.__playinfo__（result.arc / result.supplement）
	* 兜底：document.title + 页面 DOM
	*/
	function toNumber(value) {
		const n = Number(value);
		return Number.isFinite(n) && n > 0 ? n : void 0;
	}
	/** 当前 URL 上的视频号。软跳转（相关推荐）时只有它一定会变。 */
	function readBvid() {
		var _location$pathname$ma;
		return (_location$pathname$ma = location.pathname.match(/\/video\/(BV[0-9A-Za-z]+)/)) === null || _location$pathname$ma === void 0 ? void 0 : _location$pathname$ma[1];
	}
	/**
	* 当前 URL 上的番剧集号（ep_id）。
	*
	* 番剧页没有 bvid，换集/点相关推荐时 URL 上变的是 `/bangumi/play/ep123`，
	* 所以这一路要单独有一个「不会撒谎」的信号，否则番剧页永远发现不了换集。
	*/
	function readEpisodeId() {
		const fromPath = location.pathname.match(/\/bangumi\/play\/ep(\d+)/);
		if (fromPath) return toNumber(fromPath[1]);
		return toNumber(new URLSearchParams(location.search).get("ep_id"));
	}
	/**
	* 当前视频的 UP 主。
	*
	* 内存状态里 `videoData.owner` 直接给了 `{mid, name, face}`，连网络都不用；
	* 但它只属于「当前 URL 那个视频」（软跳转后可能是上一个视频的），
	* 所以先交给 `currentVideoData()` 把不属于当前 bvid 的情况挡掉，
	* 挡掉了再问 `x/web-interface/view?bvid=`（匿名可用）。
	*/
	function readOwner() {
		const videoData = currentVideoData();
		const owner = videoData === null || videoData === void 0 ? void 0 : videoData.owner;
		const mid = toNumber(owner === null || owner === void 0 ? void 0 : owner.mid);
		if (mid) return {
			mid,
			name: String((owner === null || owner === void 0 ? void 0 : owner.name) || "").trim()
		};
	}
	const ownerCache = /* @__PURE__ */ new Map();
	/** 内存里没有 owner 时的接口兜底（按 bvid 缓存，同一视频只会问一次） */
	async function fetchOwner(bvid) {
		const cached = ownerCache.get(bvid);
		if (cached) return cached;
		try {
			var _body$data, _body$data2;
			const body = await (await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`, { credentials: "omit" })).json();
			if ((body === null || body === void 0 ? void 0 : body.code) !== 0) return void 0;
			const mid = toNumber((_body$data = body.data) === null || _body$data === void 0 || (_body$data = _body$data.owner) === null || _body$data === void 0 ? void 0 : _body$data.mid);
			if (!mid) return void 0;
			const owner = {
				mid,
				name: String(((_body$data2 = body.data) === null || _body$data2 === void 0 || (_body$data2 = _body$data2.owner) === null || _body$data2 === void 0 ? void 0 : _body$data2.name) || "").trim()
			};
			ownerCache.set(bvid, owner);
			return owner;
		} catch (_unused) {
			return;
		}
	}
	/** 当前视频的 UP 主：先内存、再接口。用于白名单比对与「添加当前 UP 主」。 */
	async function resolveOwner() {
		const local = readOwner();
		if (local) return local;
		const bvid = readBvid();
		if (!bvid) return void 0;
		return fetchOwner(bvid);
	}
	/**
	* 按 mid 查名字，只给白名单做展示用。
	*
	* 用 `x/web-interface/card`（匿名可用，实测 code 0）；
	* `space/wbi/acc/info` 会报 -352 风控、按名字搜人的 `search/type` 报 412，
	* 两条都不能用。拿不到就返回空字符串，白名单照旧按 mid 生效。
	*/
	async function fetchUserName(mid) {
		try {
			var _body$data3;
			const body = await (await fetch(`https://api.bilibili.com/x/web-interface/card?mid=${mid}`, { credentials: "omit" })).json();
			if ((body === null || body === void 0 ? void 0 : body.code) !== 0) return "";
			return String(((_body$data3 = body.data) === null || _body$data3 === void 0 || (_body$data3 = _body$data3.card) === null || _body$data3 === void 0 ? void 0 : _body$data3.name) || "").trim();
		} catch (_unused2) {
			return "";
		}
	}
	/**
	* 当前分P 序号。B 站不会给 p=1 写参数，所以没有 p 就是第 1 分P；
	* `__INITIAL_STATE__.p` 在站内切换后是过期值，不能用来兜底。
	*/ function readUrlPage() {
		var _toNumber;
		return (_toNumber = toNumber(new URLSearchParams(location.search).get("p"))) !== null && _toNumber !== void 0 ? _toNumber : 1;
	}
	/**
	* 多分P 时用分P 名当集名；单P 视频没有「集」的概念，交给手动选择。
	* UGC 合集（投稿的「视频选集」）分P 名常常就是纯数字 `01`、`02`，
	* 这时归一成 `2`，交给 chooseEpisode 的强匹配去对「第2话」；
	* 分P 名为空也退回分P 序号，否则合集里永远匹配不到集数。
	*/
	function episodeOf(pages, index) {
		var _pages$index;
		if (pages.length <= 1) return "";
		const rawPart = String(((_pages$index = pages[index]) === null || _pages$index === void 0 ? void 0 : _pages$index.part) || "").trim();
		if (/^[0-9]+(?:\.[0-9]+)?$/.test(rawPart)) return String(parseFloat(rawPart));
		return rawPart || String(index + 1);
	}
	/** 直播页没有可注入的 cid，且播放器实现完全不同 */
	function isLivePage() {
		if (/(^|\.)live\.bilibili\.com$/.test(location.hostname)) return true;
		return /^\/(live|blanc|p\/html\/blanc|room)\b/.test(location.pathname);
	}
	function readVideoInfo() {
		const videoData = currentVideoData();
		if (!videoData) return void 0;
		return buildVideoInfo(videoData, readUrlPage());
	}
	/**
	* 按 cid 反查分P。
	*
	* 为什么需要它：切分P 时 URL 上的 `?p=` 并不总是更新（有的入口是纯前端切，
	* 有的合集页干脆没有 p 参数），`__INITIAL_STATE__` 更是只在首屏渲染时写过一次。
	* 但播放器每次换集都必须用新的 cid 去请求弹幕——这个 cid 我们拦得到，
	* 拿它回查 pages 就能定出到底是第几分P，比猜 URL 可靠。
	*
	* 注意：某些页面（如新版「视频播客」合集页）在运行时会把
	* `__INITIAL_STATE__.videoData.pages` 替换或清空，SSR 里明明有 19 条、
	* 运行时却查不到。所以这里做两层：先查内存里的 pages，查不到再
	* 异步拉 `x/player/pagelist` 接口（匿名可用，返回全量分P）。
	*/
	function readVideoInfoByCid(cid) {
		const videoData = currentVideoData();
		if (!videoData) return void 0;
		const index = (Array.isArray(videoData.pages) ? videoData.pages : []).findIndex((o) => toNumber(o === null || o === void 0 ? void 0 : o.cid) === cid);
		if (index < 0) return void 0;
		return buildVideoInfo(videoData, index + 1);
	}
	/**
	* 内存里的视频状态，只在它确实属于当前 URL 的视频时才返回。
	*
	* 点相关推荐软跳转时 `__INITIAL_STATE__` 不重写，里面还是上一个视频的
	* title 和 pages —— 直接拿来用就会「换了视频还在用旧标题匹配」，
	* 而且旧视频的 pages 里查不到新视频的 cid，cid 反查也会跟着失效。
	*/
	function currentVideoData() {
		const state = window.__INITIAL_STATE__;
		const videoData = state === null || state === void 0 ? void 0 : state.videoData;
		if (!videoData) return void 0;
		const urlBvid = readBvid();
		if (urlBvid && videoData.bvid && videoData.bvid !== urlBvid) return void 0;
		return videoData;
	}
	/**
	* cid 反查的接口兜底：`x/player/pagelist?bvid=`（匿名可用，零 header）。
	* 结果按 bvid 缓存——一个视频的分P 列表不会变。
	*/
	const pageListCache = /* @__PURE__ */ new Map();
	const titleCache = /* @__PURE__ */ new Map();
	/** 拿不到页面标题时的接口兜底（软跳转到新视频、DOM 还没刷出新标题时） */
	async function fetchVideoTitle(bvid) {
		const cached = titleCache.get(bvid);
		if (cached) return cached;
		try {
			var _body$data4;
			const body = await (await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`, { credentials: "omit" })).json();
			if ((body === null || body === void 0 ? void 0 : body.code) !== 0) return "";
			const title = String(((_body$data4 = body.data) === null || _body$data4 === void 0 ? void 0 : _body$data4.title) || "").trim();
			if (title) titleCache.set(bvid, title);
			return title;
		} catch (_unused3) {
			return "";
		}
	}
	async function readVideoInfoByCidAsync(cid) {
		const local = readVideoInfoByCid(cid);
		if (local) return local;
		const bvid = readBvid();
		if (!bvid) return void 0;
		let pages = pageListCache.get(bvid);
		if (!pages) try {
			const body = await (await fetch(`https://api.bilibili.com/x/player/pagelist?bvid=${bvid}`, { credentials: "omit" })).json();
			if ((body === null || body === void 0 ? void 0 : body.code) !== 0 || !Array.isArray(body.data)) return void 0;
			pages = body.data;
			pageListCache.set(bvid, pages);
		} catch (_unused4) {
			return;
		}
		const index = pages.findIndex((o) => toNumber(o === null || o === void 0 ? void 0 : o.cid) === cid);
		if (index < 0) return void 0;
		const videoData = currentVideoData();
		const title = videoData ? String(videoData.title || "").trim() : await fetchVideoTitle(bvid) || readDomInfo().seriesName;
		if (!title) return void 0;
		const compound = splitCompoundTitle(title);
		return {
			live: false,
			seriesName: (compound === null || compound === void 0 ? void 0 : compound.seriesName) || title,
			episode: episodeOf(pages, index) || (compound === null || compound === void 0 ? void 0 : compound.episode) || "",
			cid,
			aid: toNumber(videoData === null || videoData === void 0 ? void 0 : videoData.aid),
			source: "video"
		};
	}
	/**
	* 按 bvid 拿当前页面视频的信息。
	*
	* 专门用于「点相关推荐软跳到另一个视频」：URL 已经是新 bvid，但
	* `__INITIAL_STATE__` 还在上一个视频上（`currentVideoData()` 会因此返回
	* undefined），`document.title` 也可能慢半拍。这时只能问接口。
	*/
	async function readVideoInfoByBvidAsync(bvid) {
		var _pages;
		const local = currentVideoData();
		if (local) {
			const info = buildVideoInfo(local, readUrlPage());
			if (info) return info;
		}
		const title = await fetchVideoTitle(bvid);
		if (!title) return void 0;
		const page = readUrlPage();
		let pages = pageListCache.get(bvid);
		if (!pages) try {
			const body = await (await fetch(`https://api.bilibili.com/x/player/pagelist?bvid=${bvid}`, { credentials: "omit" })).json();
			if ((body === null || body === void 0 ? void 0 : body.code) === 0 && Array.isArray(body.data)) {
				pages = body.data;
				pageListCache.set(bvid, pages);
			}
		} catch (_unused5) {
			pages = void 0;
		}
		const compound = splitCompoundTitle(title);
		return {
			live: false,
			seriesName: (compound === null || compound === void 0 ? void 0 : compound.seriesName) || title,
			episode: (pages ? episodeOf(pages, page - 1) : "") || (compound === null || compound === void 0 ? void 0 : compound.episode) || "",
			cid: toNumber(pages === null || pages === void 0 || (_pages = pages[page - 1]) === null || _pages === void 0 ? void 0 : _pages.cid),
			source: "video"
		};
	}
	function buildVideoInfo(videoData, page) {
		var _toNumber2;
		const pages = Array.isArray(videoData.pages) ? videoData.pages : [];
		const pageData = pages[page - 1];
		const cid = (_toNumber2 = toNumber(pageData === null || pageData === void 0 ? void 0 : pageData.cid)) !== null && _toNumber2 !== void 0 ? _toNumber2 : toNumber(videoData.cid);
		const title = String(videoData.title || "").trim();
		if (!cid && !title) return void 0;
		const compound = splitCompoundTitle(title);
		return {
			live: false,
			seriesName: (compound === null || compound === void 0 ? void 0 : compound.seriesName) || title,
			episode: episodeOf(pages, page - 1) || (compound === null || compound === void 0 ? void 0 : compound.episode) || "",
			cid,
			aid: toNumber(videoData.aid),
			source: "video"
		};
	}
	function readBangumiInfo() {
		var _playinfo__, _result$supplement, _result$supplement2, _result$play_view_bus, _toNumber3, _result$video_info, _ref, _episodeInfo$index_ti, _toNumber4;
		const result = (_playinfo__ = window.__playinfo__) === null || _playinfo__ === void 0 ? void 0 : _playinfo__.result;
		if (!result) return void 0;
		const arc = result.arc || {};
		const episodeInfo = (_result$supplement = result.supplement) === null || _result$supplement === void 0 ? void 0 : _result$supplement.ogv_episode_info;
		const seasonInfo = (_result$supplement2 = result.supplement) === null || _result$supplement2 === void 0 ? void 0 : _result$supplement2.ogv_season_info;
		const business = (_result$play_view_bus = result.play_view_business_info) === null || _result$play_view_bus === void 0 ? void 0 : _result$play_view_bus.episode_info;
		const cid = (_toNumber3 = toNumber(arc.cid)) !== null && _toNumber3 !== void 0 ? _toNumber3 : toNumber(business === null || business === void 0 ? void 0 : business.cid);
		const seriesName = String((seasonInfo === null || seasonInfo === void 0 ? void 0 : seasonInfo.title) || arc.title || ((_result$video_info = result.video_info) === null || _result$video_info === void 0 ? void 0 : _result$video_info.title) || "").trim();
		const episode = (readDomInfo().episode || String((_ref = (_episodeInfo$index_ti = episodeInfo === null || episodeInfo === void 0 ? void 0 : episodeInfo.index_title) !== null && _episodeInfo$index_ti !== void 0 ? _episodeInfo$index_ti : episodeInfo === null || episodeInfo === void 0 ? void 0 : episodeInfo.long_title) !== null && _ref !== void 0 ? _ref : "")).trim();
		if (!cid && !seriesName) return void 0;
		return {
			live: false,
			seriesName,
			episode,
			cid,
			aid: (_toNumber4 = toNumber(arc.aid)) !== null && _toNumber4 !== void 0 ? _toNumber4 : toNumber(business === null || business === void 0 ? void 0 : business.aid),
			source: "bangumi"
		};
	}
	function readDomInfo() {
		const queryMeta = (selector) => {
			var _query$call;
			const query = document.querySelector;
			return typeof query === "function" ? ((_query$call = query.call(document, selector)) === null || _query$call === void 0 ? void 0 : _query$call.getAttribute("content")) || "" : "";
		};
		const title = document.title || queryMeta("meta[property=\"og:title\"]") || queryMeta("meta[name=\"title\"]");
		const compound = splitCompoundTitle(title);
		const mediaTitle = document.querySelector("a[class*=\"mediainfo_mediaTitle\"]");
		let seriesName = String((mediaTitle === null || mediaTitle === void 0 ? void 0 : mediaTitle.getAttribute("title")) || "").trim();
		if (!seriesName) {
			const heading = document.querySelector("h1.video-title, .video-title, [class*=\"videoTitle\"]");
			seriesName = String((heading === null || heading === void 0 ? void 0 : heading.textContent) || "").trim();
		}
		if (!seriesName) seriesName = String(title.split(/[-_|]/)[0] || "").trim();
		const episodeMatch = title.match(/第\s*([0-9]+(?:\.[0-9]+)?)\s*[集话話期回]/);
		let episode = episodeMatch ? episodeMatch[1] : "";
		if (compound) {
			seriesName = compound.seriesName;
			episode = compound.episode;
		} else if (seriesName && episode) seriesName = cleanTitle(seriesName) || seriesName;
		return {
			live: false,
			seriesName,
			episode,
			source: seriesName ? "dom" : "none"
		};
	}
	function readPageInfo() {
		var _ref2, _readVideoInfo;
		if (isLivePage()) return {
			live: true,
			seriesName: "",
			episode: "",
			source: "none"
		};
		return (_ref2 = (_readVideoInfo = readVideoInfo()) !== null && _readVideoInfo !== void 0 ? _readVideoInfo : readBangumiInfo()) !== null && _ref2 !== void 0 ? _ref2 : readDomInfo();
	}
	//#endregion
	//#region src/adapter/bilibili/overlay.ts
	/**
	* 浮层的挂载点。
	*
	* B 站进全屏用的是元素全屏（Fullscreen API）：全屏元素一旦成为「顶层」，
	* 只有它的后代会被绘制出来——挂在 `document.body` 上的面板、提示、兜底按钮
	* 在全屏下会整个消失（用户报的「全屏后看不到面板」就是这个）。
	*
	* 所以浮层不能固定挂 body，要跟着 `document.fullscreenElement` 走，
	* 并在进出全屏时搬一次家。
	*/
	/** 当前应该挂浮层的宿主：全屏元素优先，否则 body */
	function overlayHost() {
		const fullscreen = document.fullscreenElement;
		return fullscreen instanceof HTMLElement ? fullscreen : document.body;
	}
	/** 把节点挪到当前宿主里；已经在里面就不动（避免每帧无谓的 DOM 操作） */
	function mountOverlay(node) {
		const host = overlayHost();
		if (node.parentElement !== host) host.append(node);
	}
	/**
	* 监听全屏切换。捕获阶段是为了拿到播放器内部元素全屏的事件
	* （事件目标可能不是 document，但 fullscreenchange 会冒泡到 document）。
	*/
	function onFullscreenChange(handler) {
		const events = ["fullscreenchange", "webkitfullscreenchange"];
		for (const name of events) document.addEventListener(name, handler, true);
		return () => {
			for (const name of events) document.removeEventListener(name, handler, true);
		};
	}
	//#endregion
	//#region src/adapter/bilibili/toast.ts
	/**
	* 播放器左下角的轻提示。
	*
	* 用途：匹配成功后不用打开面板也能知道「用的是哪部番、加载了多少条弹幕」。
	* 样式刻意做得像 B 站自己的提示（深色半透明圆角条、左侧带图标、自动淡出），
	* 位置贴着播放器左下角、控制条上方一点。
	*
	* 支持多条同时存在：番剧名一条、条数一条，竖着叠起来，像第三方站点播放器
	* 进场时那种「标题 + 提示」的效果。用 key 区分，同一个 key 再来一次就替换
	* 原来那条并重新计时，不会越堆越多。
	*/
	const ROOT_CLASS$1 = "k-bili-dm-toast";
	const ITEM_CLASS = `${ROOT_CLASS$1}__item`;
	/** 播放器根节点，用来算提示的位置 */
	const PLAYER_SELECTORS$1 = [
		"#bilibili-player",
		".bpx-player-container",
		"#playerWrap",
		"#player"
	];
	/** 控制条，提示要压在它上方 */
	const CONTROL_BAR_SELECTORS$1 = [
		".bpx-player-control-wrap",
		".bpx-player-control-bottom",
		".bpx-player-control",
		".bilibili-player-video-control"
	];
	/** 视频画面，提示贴它的左沿（比播放器容器更准：容器含控制条和黑边） */
	const VIDEO_SELECTORS = [
		"video.bpx-player-video",
		".bpx-player-video-wrap video",
		"video"
	];
	const DEFAULT_DURATION = 3e3;
	/** 最多同时挂几条，超了就把最老的挤掉 */
	const MAX_ITEMS = 3;
	let host = null;
	let items = [];
	let placeRaf = 0;
	let onScrollBound = false;
	/** 全屏监听的注销函数，宿主存在期间保持一份 */
	let unbindFullscreen = null;
	function el$1(tag, className) {
		const node = document.createElement(tag);
		if (className) node.className = className;
		return node;
	}
	function findOne$1(selectors) {
		for (const selector of selectors) {
			const node = document.querySelector(selector);
			if (node) return node;
		}
		return null;
	}
	/**
	* 播放器左下角、控制条上方一点。
	*
	* 边距是照着用户反馈调的：左右各留 16px 时看起来像「浮在画面中间」，
	* 收到 4px 又贴得太死、像是被画面边框切了一半，现在取 12px；
	* 纵向离控制条 26px，免得跟那排按钮挤在一起、也躲开弹幕最密的那一横条。
	*
	* 横向锚的是 <video> 而不是播放器容器：容器在网页全屏/剧场模式下会带黑边，
	* 按容器算出来的位置会明显偏里。
	*/
	const TOAST_INSET_X = 12;
	const TOAST_GAP_BAR = 26;
	function place(node) {
		const player = findOne$1(PLAYER_SELECTORS$1);
		const playerRect = player ? player.getBoundingClientRect() : null;
		const video = findOne$1(VIDEO_SELECTORS);
		const videoRect = video ? video.getBoundingClientRect() : null;
		const bar = findOne$1(CONTROL_BAR_SELECTORS$1);
		const barRect = bar ? bar.getBoundingClientRect() : null;
		const leftEdge = videoRect && videoRect.width > 0 ? videoRect.left : playerRect === null || playerRect === void 0 ? void 0 : playerRect.left;
		if (leftEdge !== void 0) {
			var _playerRect$bottom;
			node.style.left = `${Math.max(TOAST_INSET_X, leftEdge + TOAST_INSET_X)}px`;
			node.style.bottom = barRect ? `${Math.max(8, window.innerHeight - barRect.top + TOAST_GAP_BAR)}px` : `${Math.max(8, window.innerHeight - ((_playerRect$bottom = playerRect === null || playerRect === void 0 ? void 0 : playerRect.bottom) !== null && _playerRect$bottom !== void 0 ? _playerRect$bottom : window.innerHeight) + 68)}px`;
			return;
		}
		node.style.left = `${TOAST_INSET_X}px`;
		node.style.bottom = "136px";
	}
	function reposition() {
		if (!host || host.hidden) return;
		if (placeRaf) return;
		placeRaf = window.requestAnimationFrame(() => {
			placeRaf = 0;
			if (host && !host.hidden) place(host);
		});
	}
	/**
	* 拖动播放器或页面滚动时提示会脱离播放器，所以显示期间要跟着重算。
	* 提示很短命（三秒左右），监听用完就摘掉。
	*/
	function bindFollow() {
		if (onScrollBound) return;
		onScrollBound = true;
		window.addEventListener("scroll", reposition, true);
		window.addEventListener("resize", reposition);
	}
	function unbindFollow() {
		if (!onScrollBound) return;
		onScrollBound = false;
		window.removeEventListener("scroll", reposition, true);
		window.removeEventListener("resize", reposition);
		if (placeRaf) {
			window.cancelAnimationFrame(placeRaf);
			placeRaf = 0;
		}
	}
	function ensureHost() {
		if (host && host.isConnected) {
			mountOverlay(host);
			return host;
		}
		host = el$1("div", ROOT_CLASS$1);
		host.hidden = true;
		mountOverlay(host);
		items = [];
		if (!unbindFullscreen) unbindFullscreen = onFullscreenChange(() => {
			if (!host || host.hidden) return;
			mountOverlay(host);
			place(host);
		});
		return host;
	}
	function removeItem(item) {
		if (item.hideTimer !== void 0) window.clearTimeout(item.hideTimer);
		item.hideTimer = void 0;
		item.node.classList.remove("is-visible");
		const node = item.node;
		window.setTimeout(() => {
			node.remove();
			if (!host) return;
			if (!items.length) {
				host.hidden = true;
				unbindFollow();
			}
		}, 220);
	}
	function createItem(text, action) {
		const node = el$1("div", ITEM_CLASS);
		const icon = el$1("span", `${ROOT_CLASS$1}__icon`);
		icon.innerHTML = "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-7l-4.6 3.5A1 1 0 0 1 7 19.6V17H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z\"/></svg>";
		const label = el$1("span", `${ROOT_CLASS$1}__text`);
		label.textContent = text;
		node.append(icon, label);
		if (action) {
			const btn = el$1("button", `${ROOT_CLASS$1}__action`);
			btn.type = "button";
			btn.textContent = action.label;
			btn.addEventListener("click", () => action.onClick());
			node.append(btn);
		}
		return {
			key: text,
			node,
			action
		};
	}
	/**
	* 弹一条提示。
	*
	* - 不带 key：每次都是新的一条（同名文本也复用，避免重复刷屏）
	* - 带 key：同一 key 更新原来那条并重新计时
	*/
	function showToast(text, options = {}) {
		var _opts$duration;
		const opts = typeof options === "number" ? { duration: options } : options;
		const key = opts.key || text;
		const duration = (_opts$duration = opts.duration) !== null && _opts$duration !== void 0 ? _opts$duration : DEFAULT_DURATION;
		const root = ensureHost();
		let item = items.find((o) => o.key === key);
		if (item) {
			const label = item.node.querySelector(`.${ROOT_CLASS$1}__text`);
			if (label) label.textContent = text;
			const oldBtn = item.node.querySelector(`.${ROOT_CLASS$1}__action`);
			if (oldBtn) oldBtn.remove();
			if (opts.action) {
				const btn = el$1("button", `${ROOT_CLASS$1}__action`);
				btn.type = "button";
				btn.textContent = opts.action.label;
				btn.addEventListener("click", () => opts.action.onClick());
				item.node.append(btn);
			}
			item.action = opts.action;
			if (item.hideTimer !== void 0) {
				window.clearTimeout(item.hideTimer);
				item.hideTimer = void 0;
			}
		} else {
			item = createItem(text, opts.action);
			item.key = key;
			root.append(item.node);
			items.push(item);
			while (items.length > MAX_ITEMS) {
				const oldest = items.shift();
				if (oldest) removeItem(oldest);
			}
		}
		const target = item;
		root.hidden = false;
		place(root);
		bindFollow();
		target.node.offsetWidth;
		target.node.classList.add("is-visible");
		if (!opts.action || opts.autoHide) target.hideTimer = window.setTimeout(() => {
			target.hideTimer = void 0;
			items = items.filter((o) => o !== target);
			removeItem(target);
		}, duration);
	}
	/**
	* 清掉提示。
	*
	* - 不带参数：全清（换视频时用）
	* - 带 key：只清那一条（白名单的暂停说明用得上——匹配成功后要把它收掉，
	*   否则「已暂停」会一直挂在画面上，跟已经播起来的视频自相矛盾）
	*/
	function clearToast(key) {
		if (key === void 0) {
			const list = items;
			items = [];
			list.forEach((item) => removeItem(item));
			return;
		}
		const target = items.find((o) => o.key === key);
		if (!target) return;
		items = items.filter((o) => o !== target);
		removeItem(target);
	}
	/** 面板销毁时一并清掉，避免留下孤儿节点和监听 */
	function disposeToast() {
		unbindFollow();
		items.forEach((item) => {
			if (item.hideTimer !== void 0) window.clearTimeout(item.hideTimer);
		});
		items = [];
		host === null || host === void 0 || host.remove();
		host = null;
		unbindFullscreen === null || unbindFullscreen === void 0 || unbindFullscreen();
		unbindFullscreen = null;
	}
	//#endregion
	//#region src/adapter/bilibili/panel.ts
	/**
	* B 站播放器的弹幕增强面板。
	*
	* 入口是控制条右侧的一个图标按钮，点开才显示面板（点面板外面自动收起），
	* 找不到控制条时退化成一个右下角的小胶囊。
	*/
	const ROOT_CLASS = "k-bili-dm";
	/**
	* 当前运行的脚本版本。
	*
	* 之前 @version 一直停在 1.60.3，改了多少轮都不变，结果就是：Tampermonkey
	* 判断不出版本更新，用户重装后也没法确认跑的是不是新脚本，只能靠肉眼比对
	* 界面差异，非常容易误判成「改了没生效」。把版本显示在面板标题旁边，
	* 一眼就能确认。
	*/
	function runningVersion() {
		try {
			var _info$script;
			const info = typeof GM_info !== "undefined" ? GM_info : void 0;
			return (info === null || info === void 0 || (_info$script = info.script) === null || _info$script === void 0 ? void 0 : _info$script.version) || "";
		} catch (_unused) {
			return "";
		}
	}
	/**
	* 优先插到「清晰度」左边。这里只认清晰的单个节点，找不到再退回控制条右侧容器。
	* 注意不能拿控制条里任意按钮当兜底——兜底会命中左边的音量之类，
	* 图标就一会在左一会在右。
	*/
	const ICON_BEFORE_SELECTORS = [
		".bpx-player-ctrl-quality",
		".bpx-player-ctrl-quality-result",
		".bpx-player-ctrl-btn[aria-label*=\"清晰度\"]",
		".bilibili-player-video-btn-quality"
	];
	const CONTROL_BAR_SELECTORS = [
		".bpx-player-control-bottom-right",
		".bilibili-player-video-control-bottom-right",
		".bilibili-player-video-control .bilibili-player-video-btn-widescreen"
	];
	/** 播放器根节点，用来给面板定位 */
	const PLAYER_SELECTORS = [
		"#bilibili-player",
		".bpx-player-container",
		"#playerWrap",
		"#player"
	];
	const ANCHOR_RETRY = 12;
	const ANCHOR_RETRY_MS = 500;
	function el(tag, className, text) {
		const node = document.createElement(tag);
		if (className) node.className = className;
		if (text !== void 0) node.textContent = text;
		return node;
	}
	function findOne(selectors) {
		for (const selector of selectors) {
			const node = document.querySelector(selector);
			if (node) return node;
		}
		return null;
	}
	function formatOffset(offsetMs) {
		const value = Math.round(offsetMs / 100) / 10;
		return String(value);
	}
	/**
	* 从用户输入里抠出 mid。
	*
	* 支持的写法：纯数字 UID、`space.bilibili.com/123`、
	* `space.bilibili.com/123/video`、带 `?mid=123` 的链接。
	* 不支持按名字：搜人的接口实测 412（要 cookie + wbi 签名），
	* 存名字既校验不了也没法用来比对，白名单只认 mid。
	*/
	function parseMid(input) {
		const text = input.trim();
		if (!text) return void 0;
		if (/^\d+$/.test(text)) {
			const n = Number(text);
			return Number.isFinite(n) && n > 0 ? n : void 0;
		}
		const fromQuery = text.match(/[?&]mid=(\d+)/);
		if (fromQuery) {
			const n = Number(fromQuery[1]);
			return Number.isFinite(n) && n > 0 ? n : void 0;
		}
		const fromPath = text.match(/(\d{3,})/);
		if (fromPath) {
			const n = Number(fromPath[1]);
			return Number.isFinite(n) && n > 0 ? n : void 0;
		}
	}
	/**
	* URL 来源的页面标识。优先用 cid（同一集的不同分P、不同线路都能区分开），
	* 拿不到 cid 时用「当前 URL 上的 bvid + 集数」。
	*
	* 不能只用「番名 + 集数」：点相关推荐软跳转到另一个视频时，页面标题和
	* `__INITIAL_STATE__` 都可能还是上一个视频的，两条视频又都没读到 cid，
	* key 就一模一样，于是「换了视频还是上一个视频的匹配结果」。
	* bvid 是 URL 里唯一不会骗人的东西。
	*/
	function pageKeyOf(info) {
		var _info$episode, _info$episode2;
		if (info.cid) return `cid:${info.cid}`;
		const vid = readBvid();
		if (vid) return `vid:${vid}#${(_info$episode = info.episode) !== null && _info$episode !== void 0 ? _info$episode : ""}`;
		return `${info.seriesName || ""}#${(_info$episode2 = info.episode) !== null && _info$episode2 !== void 0 ? _info$episode2 : ""}`;
	}
	/** 页面尚未拿到 cid 时使用的持久化 key；用于恢复旧 key 下的 URL 来源。 */
	function vidPageKeyOf(info, bvid = readBvid()) {
		var _info$episode3;
		return bvid ? `vid:${bvid}#${(_info$episode3 = info.episode) !== null && _info$episode3 !== void 0 ? _info$episode3 : ""}` : "";
	}
	function mountPanel(info) {
		const config = loadConfig();
		let currentInfo = info;
		let currentPageKey = pageKeyOf(info);
		let currentVid = readBvid();
		let currentEp = readEpisodeId();
		const button = el("div", `${ROOT_CLASS}__btn bpx-player-ctrl-btn`);
		button.setAttribute("role", "button");
		button.tabIndex = 0;
		button.title = "第三方弹幕";
		button.innerHTML = "<div class=\"bpx-player-ctrl-btn-icon\"><span class=\"bpx-common-svg-icon\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-7l-4.6 3.5A1 1 0 0 1 7 19.6V17H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm2 4v2h2V8H6Zm4 0v2h8V8h-8Zm-4 4v2h8v-2H6Zm10 0v2h2v-2h-2Z\"/></svg></span></div>";
		const panel = el("div", `${ROOT_CLASS}__panel`);
		panel.hidden = true;
		const header = el("div", `${ROOT_CLASS}__header`);
		const titleText = el("span", `${ROOT_CLASS}__title`, "第三方弹幕");
		const version = runningVersion();
		const versionText = el("span", `${ROOT_CLASS}__version`, version ? `v${version}` : "");
		versionText.title = "当前运行的脚本版本，用来确认装的是不是最新的";
		const closeBtn = el("button", `${ROOT_CLASS}__close`, "×");
		closeBtn.title = "收起";
		header.append(titleText, versionText, closeBtn);
		const switchRow = el("label", `${ROOT_CLASS}__row`);
		const switchLabel = el("span", `${ROOT_CLASS}__label`, "启用注入");
		const switchBox = el("span", `${ROOT_CLASS}__switch`);
		const switchInput = el("input");
		switchInput.type = "checkbox";
		switchInput.checked = config.enabled;
		switchBox.append(switchInput, el("span", `${ROOT_CLASS}__slider`));
		switchRow.append(switchLabel, switchBox);
		const dedupeRow = el("label", `${ROOT_CLASS}__row`);
		const dedupeLabel = el("span", `${ROOT_CLASS}__label`, "与原生去重");
		const dedupeBox = el("span", `${ROOT_CLASS}__switch`);
		const dedupeInput = el("input");
		dedupeInput.type = "checkbox";
		dedupeInput.checked = config.dedupe;
		dedupeBox.append(dedupeInput, el("span", `${ROOT_CLASS}__slider`));
		dedupeRow.append(dedupeLabel, dedupeBox);
		const status = el("div", `${ROOT_CLASS}__status`);
		const statusMain = el("div", `${ROOT_CLASS}__status-main`);
		const statusSub = el("div", `${ROOT_CLASS}__status-sub`);
		const statusActions = el("div", `${ROOT_CLASS}__status-actions`);
		const debugToggle = el("button", `${ROOT_CLASS}__debug-toggle`, "详情");
		debugToggle.type = "button";
		const debugBox = el("div", `${ROOT_CLASS}__debug`);
		debugBox.hidden = true;
		debugToggle.addEventListener("click", () => {
			debugBox.hidden = !debugBox.hidden;
			debugToggle.textContent = debugBox.hidden ? "详情" : "收起";
		});
		const pageReloadBtn = el("button", `${ROOT_CLASS}__status-reload`);
		pageReloadBtn.type = "button";
		pageReloadBtn.hidden = true;
		pageReloadBtn.title = "本段弹幕已按之前的结果缓存，播放器不会重发；点这里刷新页面";
		pageReloadBtn.innerHTML = "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M21 12a9 9 0 1 1-2.64-6.36\"/><path d=\"M21 3v6h-6\"/></svg>";
		pageReloadBtn.addEventListener("click", () => location.reload());
		statusActions.append(debugToggle, pageReloadBtn);
		status.append(statusMain, statusSub, statusActions, debugBox);
		const urlTitle = el("div", `${ROOT_CLASS}__section ${ROOT_CLASS}__section--row`);
		urlTitle.append(el("span", void 0, "URL 弹幕源"));
		const urlCount = el("span", `${ROOT_CLASS}__fold-badge`);
		urlTitle.append(urlCount);
		const urlFold = el("button", `${ROOT_CLASS}__fold-btn`);
		urlFold.type = "button";
		urlFold.title = "展开 URL 弹幕源";
		urlFold.setAttribute("aria-expanded", "false");
		urlFold.innerHTML = "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"m6 9 6 6 6-6\"/></svg>";
		urlTitle.append(urlFold);
		const urlInputRow = el("div", `${ROOT_CLASS}__row ${ROOT_CLASS}__row--input`);
		const urlInput = el("input", `${ROOT_CLASS}__input`);
		urlInput.type = "text";
		urlInput.placeholder = "粘贴 B站 / 巴哈姆特 视频链接";
		const urlPasteBtn = el("button", `${ROOT_CLASS}__mini`, "粘贴");
		const urlAddBtn = el("button", `${ROOT_CLASS}__mini`, "添加");
		urlInputRow.append(urlInput, urlPasteBtn, urlAddBtn);
		const urlList = el("div", `${ROOT_CLASS}__list`);
		const urlTip = el("div", `${ROOT_CLASS}__tip`);
		const urlBody = el("div", `${ROOT_CLASS}__fold`);
		urlBody.append(urlInputRow, urlList, urlTip);
		urlBody.hidden = true;
		urlFold.addEventListener("click", () => {
			urlBody.hidden = !urlBody.hidden;
			urlFold.classList.toggle("is-expanded", !urlBody.hidden);
			urlFold.setAttribute("aria-expanded", String(!urlBody.hidden));
			urlFold.title = urlBody.hidden ? "展开 URL 弹幕源" : "收起 URL 弹幕源";
		});
		urlTitle.addEventListener("click", (event) => {
			var _event$target, _closest;
			if ((_event$target = event.target) === null || _event$target === void 0 || (_closest = _event$target.closest) === null || _closest === void 0 ? void 0 : _closest.call(_event$target, "button")) return;
			urlFold.click();
		});
		const whitelistTitle = el("div", `${ROOT_CLASS}__section ${ROOT_CLASS}__section--row`);
		whitelistTitle.append(el("span", void 0, "强制匹配UP主名单"));
		const whitelistCount = el("span", `${ROOT_CLASS}__fold-badge`);
		whitelistTitle.append(whitelistCount);
		const whitelistFold = el("button", `${ROOT_CLASS}__fold-btn`);
		whitelistFold.type = "button";
		whitelistFold.title = "展开名单管理";
		whitelistFold.setAttribute("aria-expanded", "false");
		whitelistFold.innerHTML = "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"m6 9 6 6 6-6\"/></svg>";
		whitelistTitle.append(whitelistFold);
		const whitelistRow = el("div", `${ROOT_CLASS}__row ${ROOT_CLASS}__row--input`);
		const whitelistInput = el("input", `${ROOT_CLASS}__input`);
		whitelistInput.type = "text";
		whitelistInput.placeholder = "UP 主 UID 或主页链接";
		const whitelistPasteBtn = el("button", `${ROOT_CLASS}__mini`, "粘贴");
		const whitelistAddBtn = el("button", `${ROOT_CLASS}__mini`, "添加");
		whitelistRow.append(whitelistInput, whitelistPasteBtn, whitelistAddBtn);
		const whitelistSelfBtn = el("button", `${ROOT_CLASS}__minor`);
		whitelistSelfBtn.type = "button";
		whitelistSelfBtn.title = "把当前视频的 UP 主加进白名单";
		whitelistSelfBtn.innerHTML = "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" d=\"M12 5v14M5 12h14\"/></svg><span>添加当前视频up主</span>";
		const whitelistList = el("div", `${ROOT_CLASS}__list`);
		const whitelistTip = el("div", `${ROOT_CLASS}__tip`);
		const whitelistBody = el("div", `${ROOT_CLASS}__fold`);
		whitelistBody.append(whitelistRow, whitelistSelfBtn, whitelistList, whitelistTip);
		whitelistBody.hidden = true;
		whitelistFold.addEventListener("click", () => {
			whitelistBody.hidden = !whitelistBody.hidden;
			whitelistFold.classList.toggle("is-expanded", !whitelistBody.hidden);
			whitelistFold.setAttribute("aria-expanded", String(!whitelistBody.hidden));
			whitelistFold.title = whitelistBody.hidden ? "展开名单管理" : "收起名单管理";
		});
		whitelistTitle.addEventListener("click", (event) => {
			var _event$target2, _closest2;
			if ((_event$target2 = event.target) === null || _event$target2 === void 0 || (_closest2 = _event$target2.closest) === null || _closest2 === void 0 ? void 0 : _closest2.call(_event$target2, "button")) return;
			whitelistFold.click();
		});
		const ddpTitle = el("div", `${ROOT_CLASS}__section`, "弹弹play匹配");
		const searchRow = el("div", `${ROOT_CLASS}__row ${ROOT_CLASS}__row--input`);
		const searchInput = el("input", `${ROOT_CLASS}__input`);
		searchInput.type = "text";
		searchInput.placeholder = "番剧名（子串匹配）";
		searchInput.value = cleanTitle(currentInfo.seriesName);
		const searchBtn = el("button", `${ROOT_CLASS}__mini`, "搜索");
		searchRow.append(searchInput, searchBtn);
		const candidates = el("div", `${ROOT_CLASS}__list`);
		const candidatesTip = el("div", `${ROOT_CLASS}__tip`);
		const episodeSelect = el("select", `${ROOT_CLASS}__select`);
		const matchTip = el("div", `${ROOT_CLASS}__tip`);
		let filterConfig = loadFilter();
		const filterTitle = el("div", `${ROOT_CLASS}__section ${ROOT_CLASS}__section--row`);
		const filterFold = el("button", `${ROOT_CLASS}__fold-btn`);
		filterFold.type = "button";
		filterFold.title = "展开过滤设置";
		filterFold.setAttribute("aria-expanded", "false");
		filterFold.innerHTML = "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"m6 9 6 6 6-6\"/></svg>";
		const filterLabel = el("span", void 0, "过滤器");
		filterTitle.append(filterLabel);
		const filterToggle = el("button", `${ROOT_CLASS}__icon-text`, filterConfig.enabled ? "已启用" : "已关闭");
		filterToggle.type = "button";
		filterToggle.title = "过滤对原生与第三方弹幕一起生效";
		const filterReload = el("button", `${ROOT_CLASS}__icon-text`, "刷新生效");
		filterReload.type = "button";
		filterReload.title = "改动已保存；刷新页面后重新拉取弹幕";
		filterReload.addEventListener("click", () => location.reload());
		filterTitle.append(filterToggle, filterReload, filterFold);
		const keywordBox = el("textarea", `${ROOT_CLASS}__textarea`);
		keywordBox.rows = 3;
		keywordBox.placeholder = "屏蔽词，一行一个；/正则/i 也行";
		keywordBox.value = filterConfig.keywords.join("\n");
		const modeRow = el("div", `${ROOT_CLASS}__checks`);
		const modeItems = [
			{
				key: "hideScroll",
				label: "滚动"
			},
			{
				key: "hideTop",
				label: "顶部"
			},
			{
				key: "hideBottom",
				label: "底部"
			}
		];
		const modeInputs = {};
		for (const item of modeItems) {
			const label = el("label", `${ROOT_CLASS}__check`);
			const input = el("input");
			input.type = "checkbox";
			input.checked = filterConfig[item.key];
			modeInputs[item.key] = input;
			label.append(input, el("span", void 0, `屏蔽${item.label}`));
			modeRow.append(label);
		}
		const mergeRow = el("div", `${ROOT_CLASS}__row ${ROOT_CLASS}__row--input`);
		const mergeLabel = el("label", `${ROOT_CLASS}__check`);
		const mergeInput = el("input");
		mergeInput.type = "checkbox";
		mergeInput.checked = filterConfig.mergeSimilar;
		mergeLabel.append(mergeInput, el("span", void 0, "合并相似弹幕"));
		const mergeWindow = el("input", `${ROOT_CLASS}__offset`);
		mergeWindow.type = "number";
		mergeWindow.min = "0";
		mergeWindow.step = "5";
		mergeWindow.value = String(filterConfig.mergeWindowSec);
		mergeRow.append(mergeLabel, mergeWindow, el("span", void 0, "秒内"));
		const densityRow = el("div", `${ROOT_CLASS}__row ${ROOT_CLASS}__row--input`);
		densityRow.append(el("span", void 0, "每分钟最多"));
		const densityInput = el("input", `${ROOT_CLASS}__offset`);
		densityInput.type = "number";
		densityInput.min = "0";
		densityInput.step = "10";
		densityInput.value = String(filterConfig.perMinute);
		densityRow.append(densityInput, el("span", void 0, "条（0 = 不限）"));
		const filterTip = el("div", `${ROOT_CLASS}__tip`, "改动即时保存，对之后的弹幕生效；点「刷新生效」全部重取");
		const filterBody = el("div", `${ROOT_CLASS}__fold`);
		filterBody.append(keywordBox, modeRow, mergeRow, densityRow, filterTip);
		filterBody.hidden = true;
		filterFold.addEventListener("click", () => {
			filterBody.hidden = !filterBody.hidden;
			filterFold.classList.toggle("is-expanded", !filterBody.hidden);
			filterFold.setAttribute("aria-expanded", String(!filterBody.hidden));
			filterFold.title = filterBody.hidden ? "展开过滤设置" : "收起过滤设置";
		});
		filterTitle.addEventListener("click", (event) => {
			var _event$target3, _closest3;
			if ((_event$target3 = event.target) === null || _event$target3 === void 0 || (_closest3 = _event$target3.closest) === null || _closest3 === void 0 ? void 0 : _closest3.call(_event$target3, "button")) return;
			filterFold.click();
		});
		function readFilterFromDom() {
			var _modeInputs$hideScrol, _modeInputs$hideTop, _modeInputs$hideBotto;
			const next = _objectSpread2(_objectSpread2({}, filterConfig), {}, {
				keywords: keywordBox.value.split("\n").map((line) => line.trim()).filter(Boolean),
				hideScroll: !!((_modeInputs$hideScrol = modeInputs.hideScroll) === null || _modeInputs$hideScrol === void 0 ? void 0 : _modeInputs$hideScrol.checked),
				hideTop: !!((_modeInputs$hideTop = modeInputs.hideTop) === null || _modeInputs$hideTop === void 0 ? void 0 : _modeInputs$hideTop.checked),
				hideBottom: !!((_modeInputs$hideBotto = modeInputs.hideBottom) === null || _modeInputs$hideBotto === void 0 ? void 0 : _modeInputs$hideBotto.checked),
				mergeSimilar: mergeInput.checked,
				mergeWindowSec: Number(mergeWindow.value),
				perMinute: Number(densityInput.value)
			});
			if (!Number.isFinite(next.mergeWindowSec) || next.mergeWindowSec < 0) next.mergeWindowSec = 0;
			if (!Number.isFinite(next.perMinute) || next.perMinute < 0) next.perMinute = 0;
			return next;
		}
		function onFilterChange() {
			filterConfig = readFilterFromDom();
			saveFilter(filterConfig);
			filterTip.textContent = "已保存，点「刷新生效」全部重取";
			render();
		}
		keywordBox.addEventListener("change", onFilterChange);
		for (const item of modeItems) {
			var _modeInputs$item$key;
			(_modeInputs$item$key = modeInputs[item.key]) === null || _modeInputs$item$key === void 0 || _modeInputs$item$key.addEventListener("change", onFilterChange);
		}
		mergeInput.addEventListener("change", onFilterChange);
		mergeWindow.addEventListener("change", onFilterChange);
		densityInput.addEventListener("change", onFilterChange);
		filterToggle.addEventListener("click", () => {
			filterConfig = _objectSpread2(_objectSpread2({}, readFilterFromDom()), {}, { enabled: !filterConfig.enabled });
			saveFilter(filterConfig);
			filterToggle.textContent = filterConfig.enabled ? "已启用" : "已关闭";
			filterTip.textContent = filterConfig.enabled ? "已启用：屏蔽词 / 类型 / 合并 / 密度对原生和第三方弹幕一起生效" : "已关闭：原生弹幕与注入弹幕都原样显示";
			render();
		});
		const body = el("div", `${ROOT_CLASS}__body`);
		body.append(switchRow, dedupeRow, status, ddpTitle, searchRow, candidatesTip, candidates, episodeSelect, matchTip, urlTitle, urlBody, whitelistTitle, whitelistBody, filterTitle, filterBody);
		panel.append(header, body);
		mountOverlay(panel);
		panel.classList.add("is-floating");
		let anchorRetry = 0;
		let anchorTimer;
		let detached = false;
		let anchorEl = null;
		/**
		* 把按钮挂回控制条。优先插在「清晰度」左边（用户指定），插不进去就退回
		* 控制条右侧容器的末尾。B 站切全屏/宽屏时会重建控制条，原来的节点被丢掉，
		* 所以这事不能只做一次——挂丢了就重新挂。
		*/
		function placeButton() {
			if (detached) return;
			const before = findOne(ICON_BEFORE_SELECTORS);
			if (before && before.parentElement) {
				const target = before.parentElement;
				anchorEl = target;
				if (button.parentElement !== target || button.nextElementSibling !== before) {
					target.insertBefore(button, before);
					button.classList.remove("is-floating");
				}
				button.classList.add("is-placed");
				return;
			}
			const anchor = findOne(CONTROL_BAR_SELECTORS);
			if (anchor) {
				anchorEl = anchor;
				if (button.parentElement !== anchorEl) {
					anchorEl.append(button);
					button.classList.remove("is-floating");
				}
				button.classList.add("is-placed");
				return;
			}
			if (button.parentElement) return;
			if (anchorRetry++ >= ANCHOR_RETRY) {
				button.classList.add("is-floating");
				mountOverlay(button);
				return;
			}
			anchorTimer = window.setTimeout(placeButton, ANCHOR_RETRY_MS);
		}
		placeButton();
		let opened = false;
		/**
		* 控制条的位置。面板要贴着它的上沿浮起来——用播放器 rect.bottom 算不准，
		* 页面滚动或播放器比视口高的时候 bottom 会跑到屏幕外面去。
		*/
		function controlBarRect() {
			for (const selector of [
				".bpx-player-control-wrap",
				".bpx-player-control-bottom",
				".bpx-player-control",
				".bilibili-player-video-control"
			]) {
				const node = document.querySelector(selector);
				if (!node) continue;
				const rect = node.getBoundingClientRect();
				if (rect.height > 0) return rect;
			}
			return null;
		}
		/**
		* 面板高度。只在打开、窗口尺寸变化、进出全屏时重算。
		*
		* 位置跟着滚动走（用户要求「面板要跟着页面滚动」），但高度钉住不动——
		* 滚动时播放器在动，跟着重算高度就会把面板越压越矮，那是上一版的毛病。
		*/
		let pinnedMaxHeight = 0;
		function placePanel(refit = false) {
			var _playerRect$bottom;
			const recalcHeight = refit || !pinnedMaxHeight;
			const bar = controlBarRect();
			const player = findOne(PLAYER_SELECTORS);
			if (!bar && !player) {
				panel.style.left = "auto";
				panel.style.right = "16px";
				panel.style.bottom = "96px";
				if (recalcHeight) pinnedMaxHeight = Math.round(window.innerHeight * .7);
				panel.style.maxHeight = `${pinnedMaxHeight}px`;
				return;
			}
			const playerRect = player ? player.getBoundingClientRect() : null;
			const right = Math.min(playerRect ? playerRect.right : window.innerWidth, bar ? bar.right : window.innerWidth);
			const width = Math.min(320, Math.max(280, ((playerRect === null || playerRect === void 0 ? void 0 : playerRect.width) || 640) * .32));
			const barTop = bar ? bar.top : (_playerRect$bottom = playerRect === null || playerRect === void 0 ? void 0 : playerRect.bottom) !== null && _playerRect$bottom !== void 0 ? _playerRect$bottom : window.innerHeight;
			const bottom = Math.max(8, window.innerHeight - barTop + 10);
			panel.style.width = `${width}px`;
			panel.style.left = `${Math.max(8, right - width - 8)}px`;
			panel.style.right = "auto";
			panel.style.bottom = `${bottom}px`;
			if (recalcHeight) {
				const room = playerRect && playerRect.height > 240 ? playerRect.height - 56 : window.innerHeight * .7;
				pinnedMaxHeight = Math.round(Math.max(220, Math.min(room, window.innerHeight * .86)));
			}
			panel.style.maxHeight = `${pinnedMaxHeight}px`;
		}
		function open(next) {
			opened = next;
			panel.hidden = !next;
			button.classList.toggle("is-active", next);
			if (next) {
				placeButton();
				placePanel(true);
				render();
			}
		}
		let pressedInside = false;
		function onDocumentMouseDown(e) {
			const target = e.target;
			if (panel.contains(target) || button.contains(target)) {
				pressedInside = true;
				return;
			}
			pressedInside = false;
		}
		function onDocumentClick(e) {
			var _window$getSelection;
			if (!opened) return;
			const target = e.target;
			if (panel.contains(target) || button.contains(target)) return;
			if (pressedInside) {
				pressedInside = false;
				return;
			}
			if ((((_window$getSelection = window.getSelection()) === null || _window$getSelection === void 0 ? void 0 : _window$getSelection.toString()) || "").length > 0) return;
			open(false);
		}
		function onResize() {
			if (!opened) return;
			pinnedMaxHeight = 0;
			placeButton();
			placePanel(true);
		}
		/**
		* 面板是 position:fixed，不重算就会在页面滚动后脱离播放器停在原地。
		* 这里只重算位置、不动高度（高度跟着重算会越滚越矮，那是上一版的毛病）。
		* 用捕获阶段监听，播放器内部滚动容器的滚动也能收到；再用 rAF 合并成每帧一次。
		*/
		let scrollRaf = 0;
		function onScroll() {
			if (!opened || scrollRaf) return;
			scrollRaf = window.requestAnimationFrame(() => {
				scrollRaf = 0;
				if (opened) placePanel(false);
			});
		}
		button.addEventListener("click", (e) => {
			e.stopPropagation();
			open(!opened);
		});
		button.addEventListener("keydown", (e) => {
			if (e.key !== "Enter" && e.key !== " ") return;
			e.preventDefault();
			e.stopPropagation();
			open(!opened);
		});
		closeBtn.addEventListener("click", () => open(false));
		panel.addEventListener("click", (e) => e.stopPropagation());
		document.addEventListener("mousedown", onDocumentMouseDown, true);
		document.addEventListener("click", onDocumentClick, true);
		window.addEventListener("resize", onResize);
		window.addEventListener("scroll", onScroll, true);
		/**
		* 进出全屏时搬家。
		*
		* 全屏元素只绘制自己的后代，浮层必须跟着进/出全屏元素，否则全屏下面板
		* 和提示都看不见。搬完还要重新定位：fixed 的参照系从视口变成了全屏元素，
		* 高度也该按新的可用空间重算。
		*/
		function onFullscreen() {
			if (detached) return;
			mountOverlay(panel);
			if (!button.parentElement) mountOverlay(button);
			pinnedMaxHeight = 0;
			placeButton();
			if (opened) placePanel(true);
		}
		const unbindFullscreen = onFullscreenChange(onFullscreen);
		switchInput.addEventListener("change", () => {
			config.enabled = switchInput.checked;
			saveConfig(config);
			setEnabled(config.enabled);
			render();
			if (config.enabled) ensureMatch();
			else {
				setComments(null);
				setLoading(null);
				setExpecting(false);
				clearToast();
			}
		});
		dedupeInput.addEventListener("change", () => {
			config.dedupe = dedupeInput.checked;
			saveConfig(config);
			setDedupe(config.dedupe);
			render();
		});
		let whitelist = loadWhitelist();
		/** 当前页面是否命中白名单（命中就走强制匹配） */
		let forced = false;
		/** 是我们把视频按住的（用户自己暂停的不算，也就不能替他恢复） */
		let pausedByUs = false;
		/** 用户自己动过播放器：强制匹配让位，别再暂停他 */
		let userStarted = false;
		/** 播放是我们自己发起的那一次 play（别把它当成用户想绕过匹配） */
		let selfResuming = false;
		/**
		* 最近一次「真的由人做出来」的操作时刻。
		*
		* `play` 事件本身分不清是谁让它播的：用户点播放、播放器自动播放、
		* 我们自己调 `video.play()` 都会触发，`isTrusted` 也全是 true。
		* 只有输入事件（pointerdown / keydown）能标出人的动作，所以用它给
		* play 定性。窗口取 1.5 秒：点了到真正开播之间会隔一会儿。
		*/
		let userGestureAt = 0;
		let resumeTimer;
		function isWhitelisted(mid) {
			if (!mid) return false;
			return whitelist.some((o) => o.mid === mid);
		}
		function persistWhitelist() {
			saveWhitelist(whitelist);
			renderWhitelist();
		}
		function renderWhitelist() {
			whitelistCount.textContent = whitelist.length ? String(whitelist.length) : "";
			whitelistList.textContent = "";
			if (!whitelist.length) whitelistList.append(el("div", `${ROOT_CLASS}__tip`, "还没有强制匹配的 UP 主"));
			else for (const item of whitelist) {
				const row = el("div", `${ROOT_CLASS}__url`);
				const head = el("div", `${ROOT_CLASS}__url-head`);
				const name = el("a", `${ROOT_CLASS}__url-name ${ROOT_CLASS}__url-name--link`, item.name || `UID ${item.mid}`);
				name.href = `https://space.bilibili.com/${item.mid}`;
				name.target = "_blank";
				name.rel = "noopener noreferrer";
				name.title = `UID ${item.mid}（点击打开主页）`;
				const remove = el("button", `${ROOT_CLASS}__icon`, "×");
				remove.title = "移出白名单";
				remove.addEventListener("click", (e) => {
					e.stopPropagation();
					whitelist = whitelist.filter((o) => o.mid !== item.mid);
					persistWhitelist();
					syncForced();
				});
				head.append(name, remove);
				row.append(head);
				whitelistList.append(row);
			}
			whitelistTip.textContent = forced ? "当前视频的 UP 主在白名单里：匹配出结果前先按住播放" : "白名单 UP 主的视频会先暂停，等匹配出结果再开始";
		}
		/**
		* 判定当前页面要不要走强制匹配，并把结论同步给 hook。
		*
		* 只认 mid：按名字搜人的接口实测 412（要 cookie + wbi 签名），
		* 名字既无法校验也没法比对。
		*
		* 拿不到 UP 主时要重试：`resolveOwner()` 在软跳转刚发生时可能既读不到
		* `__INITIAL_STATE__.videoData.owner`（还是上一个视频的，被 bvid 校验挡掉），
		* 接口也可能正好抖一下。只判一次的话结论就永久停在「不在白名单」——
		* 用户看到的正是「有的白名单视频不暂停，也不匹配」。
		*/
		let forcedSeq = 0;
		/**
		* 真正「开始按住」这件事的全部动作。
		*
		* 抽出来是因为结论和动作必须一起重做：换集、切分P、点相关推荐之后，
		* 上一页的扣留、暂停监视、提示态全部作废了，而白名单结论往往**没变**
		* （还是同一个 UP 主）。早先 `syncForced()` 把「结论没变」当成
		* 「什么都不用做」直接 return，于是换页之后一次都没重新按住——
		* 用户看到的就是「白名单 UP 主切分P / 点相关推荐不暂停」。
		*/
		function beginForced() {
			if (detached) return;
			setHold(true);
			userStarted = false;
			showToast("当前 UP 主在强制匹配名单：匹配完成前暂停播放", {
				key: "hold-tip",
				duration: 8e3
			});
			startPauseWatch();
		}
		async function syncForced() {
			if (detached) return;
			const seq = ++forcedSeq;
			let owner = await resolveOwner().catch(() => void 0);
			for (let attempt = 0; !owner && attempt < 3 && !detached; attempt++) {
				await new Promise((resolve) => setTimeout(resolve, 800));
				if (detached || seq !== forcedSeq) return;
				owner = await resolveOwner().catch(() => void 0);
			}
			if (detached || seq !== forcedSeq) return;
			const nextForced = isWhitelisted(owner === null || owner === void 0 ? void 0 : owner.mid);
			if (nextForced === forced) {
				renderWhitelist();
				if (forced) beginForced();
				return;
			}
			forced = nextForced;
			setHold(forced);
			renderWhitelist();
			if (forced) beginForced();
			else {
				stopPauseWatch();
				releaseHold();
				resumeIfWePaused();
			}
		}
		/**
		* 白名单页面上「匹配没出结果就先暂停」。
		*
		* 要求是「一秒都不播」：一进页面就按住，匹配出结果才放。所以这里是
		* 每 200ms 的持续观察，而不是「等一会儿再检查一次」——播放器可能在
		* 任何时候自己开始播（自动播放、续播），按得不及时就等于没按。
		*/
		let pauseWatch;
		/** 上一次弹出的「为什么停住」，避免每 200ms 重弹把提示永久钉在屏幕上 */
		let lastHoldReason = "";
		function startPauseWatch() {
			stopPauseWatch();
			pauseWatch = window.setInterval(tickPause, 200);
			tickPause();
		}
		function stopPauseWatch() {
			if (pauseWatch === void 0) return;
			window.clearInterval(pauseWatch);
			pauseWatch = void 0;
		}
		/** 能不能放弹幕了：番名和集数都定下来才叫定下来 */
		function matchReady() {
			return !!anime && !!episode;
		}
		function pauseVideoIfNeeded() {
			if (!forced || userStarted) return;
			const video = findOne(["video"]);
			if (!video || video.paused) return;
			pausedByUs = true;
			try {
				video.pause();
			} catch (_unused2) {
				pausedByUs = false;
			}
		}
		function tickPause() {
			if (!forced || detached) return;
			if (matchSettled) {
				pauseVideoIfNeeded();
				return;
			}
			if (matchReady()) return;
			if (userStarted) {
				releaseHold();
				return;
			}
			pauseVideoIfNeeded();
			const reason = matchSettled ? anime ? `已匹配「${anime.name}」，请手动选择集数` : "未匹配到番剧，请手动选择" : anime ? "正在匹配集数" : "正在匹配番剧";
			if (reason !== lastHoldReason) {
				lastHoldReason = reason;
				showToast(reason, {
					key: "hold",
					duration: 8e3
				});
			}
		}
		/** 匹配成功后把我们自己按下的视频放开 */
		function resumeIfWePaused() {
			stopPauseWatch();
			clearToast("hold");
			clearToast("hold-tip");
			if (!pausedByUs) return;
			pausedByUs = false;
			if (resumeTimer !== void 0) window.clearTimeout(resumeTimer);
			resumeTimer = window.setTimeout(() => {
				resumeTimer = void 0;
				if (detached) return;
				const video = findOne(["video"]);
				if (!video || !video.paused) return;
				selfResuming = true;
				try {
					const played = video.play();
					if (played && typeof played.catch === "function") played.catch(() => void 0);
				} finally {
					window.setTimeout(() => {
						selfResuming = false;
					}, 0);
				}
			}, 300);
		}
		/**
		* 这一轮匹配确定拿不到能注入的弹幕了（这集真没弹幕、番剧没有集数列表、
		* 搜索彻底失败、或者要人来选）。
		*
		* 白名单页面**什么都不放**：扣留没有超时，只有用户手动点播放才放行
		* （`onVideoPlay()` 里的 `releaseHold()`）。这里要是放掉，播放器就会
		* 把「只有原生弹幕」的那一段缓存进内存，之后再选对集也救不回来——
		* 那正是白名单要防的事。
		*
		* 非白名单没有扣留这回事，调一下 `releaseHold()` 只是把标志位归位。
		*/
		function giveUpHold() {
			matchSettled = true;
			if (forced) return;
			releaseHold();
		}
		/**
		* 白名单页面上「匹配这条路走到头了」的收尾：放开扣住的响应 + 保持暂停 +
		* 用 toast 把结论说清楚。
		*
		* 非白名单页面**不弹**：那里没有强制暂停，匹配失败只是面板里一句话，
		* 突然在屏幕上弹一条失败提示反而打扰。
		*/
		function settleForced(reason) {
			giveUpHold();
			if (!forced) return;
			pauseVideoIfNeeded();
			if (reason === lastHoldReason) return;
			lastHoldReason = reason;
			showToast(reason, {
				key: "hold",
				duration: 8e3
			});
		}
		/**
		* 用户自己点了播放 = 他不想等匹配了。
		*
		* 立刻放行所有扣住的响应（否则播放器会一直等我们那一段），
		* 并把 pausedByUs 清掉——之后匹配成功也不要再去暂停/恢复他的视频。
		*/
		function onVideoPlay() {
			if (!forced) return;
			if (selfResuming) return;
			if (Date.now() - userGestureAt > 1500) return;
			userStarted = true;
			pausedByUs = false;
			releaseHold();
			stopPauseWatch();
			clearToast("hold");
			clearToast("hold-tip");
		}
		function addWhitelistByMid(mid) {
			if (whitelist.some((o) => o.mid === mid)) return;
			whitelist = [...whitelist, {
				mid,
				name: ""
			}];
			persistWhitelist();
			syncForced();
			fetchUserName(mid).then((name) => {
				if (detached || !name) return;
				whitelist = whitelist.map((o) => o.mid === mid ? _objectSpread2(_objectSpread2({}, o), {}, { name }) : o);
				persistWhitelist();
			});
		}
		whitelistAddBtn.addEventListener("click", () => {
			const mid = parseMid(whitelistInput.value);
			if (!mid) {
				whitelistTip.textContent = "填 UID（纯数字）或 space.bilibili.com/123 这样的主页链接";
				return;
			}
			addWhitelistByMid(mid);
			whitelistInput.value = "";
		});
		whitelistPasteBtn.addEventListener("click", async () => {
			whitelistTip.classList.remove("is-error");
			try {
				var _navigator$clipboard;
				if (!((_navigator$clipboard = navigator.clipboard) === null || _navigator$clipboard === void 0 ? void 0 : _navigator$clipboard.readText)) throw new Error("clipboard-unavailable");
				const text = (await navigator.clipboard.readText()).trim();
				if (!text) {
					whitelistTip.textContent = "剪贴板为空";
					return;
				}
				whitelistInput.value = text;
				whitelistInput.focus();
			} catch (_unused3) {
				whitelistTip.textContent = "浏览器未授予剪贴板权限，请使用 Ctrl+V";
				whitelistTip.classList.add("is-error");
			}
		});
		whitelistInput.addEventListener("keydown", (e) => {
			if (e.key === "Enter") whitelistAddBtn.click();
		});
		whitelistSelfBtn.addEventListener("click", () => {
			const owner = readOwner();
			if (owner) {
				addWhitelistByMid(owner.mid);
				return;
			}
			whitelistSelfBtn.disabled = true;
			resolveOwner().then((resolved) => {
				if (detached) return;
				if (resolved) addWhitelistByMid(resolved.mid);
				else whitelistTip.textContent = "拿不到当前视频的 UP 主";
			}).finally(() => {
				whitelistSelfBtn.disabled = false;
			});
		});
		function markGesture() {
			userGestureAt = Date.now();
		}
		document.addEventListener("pointerdown", markGesture, true);
		document.addEventListener("keydown", markGesture, true);
		document.addEventListener("play", onVideoPlay, true);
		let anime;
		let episode;
		let candidateList = [];
		let episodeOptions = [];
		let tried = [];
		let notice = "";
		let busy = false;
		/** 这一轮匹配已经有结论了（成功或失败都算），白名单的暂停监视靠它收手 */
		let matchSettled = false;
		/** 当前集弹弹play无弹幕时，已经用 URL 来源接管到的条数 */
		let urlFallbackCount = 0;
		/** URL 来源加入时播放器已经请求过弹幕，需要提醒刷新当前分段 */
		let urlFallbackNeedsRefresh = false;
		/** 播放已经开始后手动加入 URL 来源，需要提醒当前分段刷新 */
		let urlSourceNotice = "";
		let urlSourceNeedsRefresh = false;
		let announcedMatch = null;
		let reloadHint = "";
		let reloading = false;
		function showReloadToast(text, key = "segment-refresh") {
			showToast(text, {
				key,
				duration: 6e3,
				autoHide: true,
				action: {
					label: "刷新",
					onClick: () => location.reload()
				}
			});
		}
		let matchSeq = 0;
		/** 当前页面已保存的 URL 来源恢复任务；匹配结果要等它完成后再确定。 */
		let urlRestorePromise = Promise.resolve();
		function resetMatch(nextNotice = "") {
			matchSeq++;
			matchSettled = false;
			anime = void 0;
			episode = void 0;
			candidateList = [];
			episodeOptions = [];
			tried = [];
			notice = nextNotice;
			urlFallbackCount = 0;
			urlFallbackNeedsRefresh = false;
			urlSourceNotice = "";
			urlSourceNeedsRefresh = false;
			announcedMatch = null;
			setComments(null);
		}
		/** 异步链路里每个 await 之后都要问一句：我还是当前这一轮吗？ */
		function isCurrentMatch(seq) {
			return !detached && seq === matchSeq;
		}
		function startUrlRestore(keys) {
			const task = restoreSources(keys).then(() => render()).catch((error) => {
				console.warn("[danmaku-enhance] 恢复 URL 来源失败", error);
			});
			urlRestorePromise = task;
			return task;
		}
		function render() {
			if (opened) placePanel();
			renderStatus();
			renderCandidates();
			renderEpisodes();
			renderUrls();
			renderWhitelist();
			urlTip.classList.remove("is-error");
			urlTip.textContent = config.enabled ? "URL来源和弹弹play可同时生效；支持时间轴偏移" : "先打开上面的开关";
		}
		/**
		* 「选了集但这一段没注入」的提示统一带上整集弹幕总数：
		* 弹弹play 已加载的集数弹幕 + 各 URL 来源的全部条目，
		* 口径与成功时的 announceMatch 一致。数据没就绪时不加尾巴。
		* 括号内容放第二行：状态行宽度有限，连着排会折成难看的三行。
		*/
		function availableTotal() {
			var _getComments$length, _getComments;
			return ((_getComments$length = (_getComments = getComments$1()) === null || _getComments === void 0 ? void 0 : _getComments.length) !== null && _getComments$length !== void 0 ? _getComments$length : 0) + getTotalCount();
		}
		function withTotal(base) {
			const total = availableTotal();
			return total ? `${base}\n弹幕已就绪：共 ${total} 条` : base;
		}
		/** 「详情」里展开的技术细节 */
		function debugLine(stats) {
			var _stats$lastSeg, _stats$lastMergedSeg;
			let line = [
				`请求 ${stats.requests}`,
				`开闸 ${stats.armed}`,
				`接管 ${stats.reads}`,
				`通道 xhr${stats.xhrs}/fetch${stats.fetches}`,
				`合并 ${stats.segments} 段/${stats.injected} 条`,
				`错失 ${stats.missed} 段`,
				...stats.held ? [`扣住 ${stats.held} 段`] : [],
				`过滤 ${stats.filtered} 条／合并重复 ${stats.merged} 条` + (stats.droppedNative ? `／密度裁剪 ${stats.droppedNative} 条` : ""),
				`段 ${(_stats$lastSeg = stats.lastSeg) !== null && _stats$lastSeg !== void 0 ? _stats$lastSeg : "-"}／合至 ${(_stats$lastMergedSeg = stats.lastMergedSeg) !== null && _stats$lastMergedSeg !== void 0 ? _stats$lastMergedSeg : "-"}`
			].join(" · ");
			if (stats.lastDetail) line += `\n${stats.lastDetail}`;
			if (stats.lastState) line += `\n${stats.lastState}`;
			if (stats.hook && stats.hook !== "ok") line += `\nhook：${stats.hook}`;
			return line;
		}
		function renderStatus() {
			const stats = getStats();
			pageReloadBtn.hidden = true;
			if (!config.enabled) {
				statusMain.textContent = "未开启";
				statusSub.textContent = "打开开关后才会向播放器注入弹幕";
				debugBox.textContent = "";
				return;
			}
			if (urlSourceNotice && urlSourceNeedsRefresh) {
				statusMain.textContent = urlSourceNotice;
				const total = availableTotal();
				statusSub.textContent = total ? `共 ${total} 条，当前分段可能已缓存，刷新后生效` : "当前分段可能已缓存，刷新后生效";
				pageReloadBtn.hidden = false;
				debugBox.textContent = debugLine(stats);
				return;
			}
			if (urlFallbackCount > 0 && notice) {
				statusMain.textContent = notice;
				statusSub.textContent = urlFallbackNeedsRefresh ? "当前分段可能已缓存，刷新后生效" : "后续分段会自动生效";
				pageReloadBtn.hidden = !urlFallbackNeedsRefresh;
				debugBox.textContent = debugLine(stats);
				return;
			}
			if (busy && notice) {
				statusMain.textContent = notice;
				statusSub.textContent = "";
				return;
			}
			if (notice) {
				statusMain.textContent = notice;
				const shown = tried.slice(0, 5);
				const more = tried.length > shown.length ? ` …（共 ${tried.length} 个）` : "";
				statusSub.textContent = shown.length ? `试过：${shown.join(" / ")}${more}` : "";
				return;
			}
			if (anime && episode) {
				statusMain.textContent = `${anime.name} · ${episode.name}`;
				const extra = [stats.filtered ? `过滤 ${stats.filtered}` : "", stats.merged ? `合并 ${stats.merged}` : ""].filter(Boolean).join(" · ");
				if (isStaleSegment()) {
					statusSub.textContent = withTotal("本段为切换集数前的弹幕，刷新后生效");
					pageReloadBtn.hidden = false;
				} else if (reloadHint) {
					statusSub.textContent = withTotal(reloadHint);
					pageReloadBtn.hidden = false;
				} else if (stats.injected > 0) {
					const total = availableTotal();
					statusSub.textContent = total ? `共 ${total} 条，当前分段已注入 ${stats.injected} 条${extra ? `（${extra}）` : ""}` : `已注入 ${stats.injected} 条（${stats.segments} 段）${extra ? `（${extra}）` : ""}`;
				} else if (stats.requests > 0 && stats.segments === 0 && stats.missed > 0) {
					var _getComments$length2, _getComments2;
					const total = ((_getComments$length2 = (_getComments2 = getComments$1()) === null || _getComments2 === void 0 ? void 0 : _getComments2.length) !== null && _getComments$length2 !== void 0 ? _getComments$length2 : 0) + getTotalCount();
					statusSub.textContent = total ? `本段已缓存，刷新生效\n弹幕已就绪：共 ${total} 条` : "本段已缓存，刷新生效";
					pageReloadBtn.hidden = false;
				} else if (stats.filtered > 0 || stats.droppedNative > 0) statusSub.textContent = `当前分段没有可注入的弹幕，过滤器已作用在原生弹幕上（过滤 ${stats.filtered}${stats.droppedNative ? ` · 密度裁剪 ${stats.droppedNative}` : ""}）`;
				else if (stats.requests === 0) statusSub.textContent = "等待播放器请求弹幕…";
				else if (stats.reads === 0) statusSub.textContent = withTotal("已拦截请求，但还没有接管到响应");
				else statusSub.textContent = withTotal("已接管请求，当前分段没有可注入的弹幕");
				debugBox.textContent = debugLine(stats);
				return;
			}
			if (anime) {
				statusMain.textContent = anime.name;
				statusSub.textContent = "请手动选择集数";
				return;
			}
			statusMain.textContent = "等待匹配";
			statusSub.textContent = "";
		}
		function renderCandidates() {
			candidates.textContent = "";
			if (!candidateList.length) {
				candidates.hidden = true;
				candidatesTip.hidden = true;
				return;
			}
			candidates.hidden = false;
			candidatesTip.hidden = false;
			candidatesTip.textContent = anime ? "换一部：" : "找到多部可能匹配的番剧，请选择：";
			for (const item of candidateList) {
				const row = el("button", `${ROOT_CLASS}__item`, item.name);
				row.title = item.name;
				row.classList.toggle("is-active", !!anime && anime.id === item.id);
				row.addEventListener("click", () => void pickAnime(item));
				candidates.append(row);
			}
		}
		function renderEpisodes() {
			episodeSelect.textContent = "";
			if (anime && episodeOptions.length) {
				episodeSelect.hidden = false;
				const placeholder = el("option");
				placeholder.value = "";
				placeholder.textContent = "选择集数…";
				episodeSelect.append(placeholder);
				for (const ep of episodeOptions) {
					const opt = el("option");
					opt.value = String(ep.id);
					opt.textContent = ep.name;
					opt.selected = !!episode && episode.id === ep.id;
					episodeSelect.append(opt);
				}
				episodeSelect.value = episode ? String(episode.id) : "";
				return;
			}
			episodeSelect.hidden = true;
		}
		episodeSelect.addEventListener("change", () => {
			const id = episodeSelect.value;
			if (!id) return;
			const ep = episodeOptions.find((o) => String(o.id) === id);
			if (ep) pickEpisode(ep);
		});
		function renderUrls() {
			const entries = getEntries();
			urlCount.textContent = entries.length ? String(entries.length) : "";
			urlCount.hidden = !entries.length;
			urlList.textContent = "";
			if (!entries.length) {
				urlList.append(el("div", `${ROOT_CLASS}__tip`, "还没有 URL 来源（最多 3 条）"));
				return;
			}
			for (const entry of entries) urlList.append(renderUrlEntry(entry));
		}
		function renderUrlEntry(entry) {
			const box = el("div", `${ROOT_CLASS}__url`);
			const head = el("div", `${ROOT_CLASS}__url-head`);
			const name = el("span", `${ROOT_CLASS}__url-name`, `${entry.sourceLabel} · ${entry.seriesTitle || "未命名"}`);
			name.title = `${entry.url}\n${entry.seriesTitle}`;
			const remove = el("button", `${ROOT_CLASS}__icon`, "×");
			remove.title = "移除这条来源";
			remove.addEventListener("click", (e) => {
				e.stopPropagation();
				removeSource(entry.key);
			});
			head.append(name, remove);
			const epLine = el("div", `${ROOT_CLASS}__url-ep`);
			epLine.textContent = entry.episode.title + (entry.items.length ? ` · ${entry.items.length} 条` : "");
			const offsetRow = el("div", `${ROOT_CLASS}__url-offset`);
			offsetRow.append(el("span", void 0, "偏移"));
			const offsetInput = el("input", `${ROOT_CLASS}__offset`);
			offsetInput.type = "number";
			offsetInput.step = "0.5";
			offsetInput.value = formatOffset(entry.offsetMs);
			offsetInput.addEventListener("change", () => {
				const sec = Number(offsetInput.value);
				setOffset(entry.key, Number.isFinite(sec) ? sec : 0);
			});
			offsetRow.append(offsetInput, el("span", void 0, "秒"));
			const progress = el("div", `${ROOT_CLASS}__url-progress`, entry.error ? `失败：${entry.error}` : entry.progress || (entry.loading ? "拉取中…" : ""));
			if (entry.error) progress.classList.add("is-error");
			box.append(head, epLine, offsetRow, progress);
			return box;
		}
		/**
		* 换集后给播放器 800ms 自己重发弹幕请求（它换 cid 时本来就会重拉），
		* 看到了就清掉缓存提示。不再主动触发任何 seek/重载——那些方案都会
		* 把播放位置挪走，用户明确要求删干净。
		*/
		function reloadDanmaku(showCachedHint = false) {
			if (reloading) return;
			const before = getStats();
			const hadCachedRequest = showCachedHint && before.requests > 0 && before.missed > 0;
			reloading = true;
			reloadHint = "";
			render();
			forceReloadDanmaku().then((method) => {
				reloading = false;
				if (method) reloadHint = "";
				else if (hadCachedRequest && !isStaleSegment()) {
					reloadHint = "本段已缓存，刷新生效";
					showReloadToast("当前分段已缓存，刷新页面后生效");
				} else reloadHint = "";
				if (method) console.info("[danmaku-enhance]", method, "弹幕已重新加载");
				render();
			});
		}
		/**
		* 弹弹play明确返回空集时，URL来源可以作为本集的弹幕结果。
		*
		* URL来源的加载是异步的，可能早于或晚于 pickEpisode() 得到空结果，
		* 所以这个函数既在两条路径上调用，也按总条数去重。白名单视频原本会
		* 因为「该集没有弹幕」保持暂停；URL源有数据后应按匹配成功处理，放行
		* 已扣留的响应、恢复播放，并让当前分段重新探测。
		*/
		function applyUrlFallback() {
			if (detached || !config.enabled) return false;
			const comments = getComments$1();
			const total = getTotalCount();
			if (!comments || comments.length > 0 || total <= 0) return false;
			if (total === urlFallbackCount) return true;
			urlFallbackCount = total;
			urlFallbackNeedsRefresh = getStats().requests > 0;
			busy = false;
			matchSettled = true;
			notice = `URL来源已加载 ${total} 条弹幕`;
			releaseHold();
			clearToast("hold");
			clearToast("hold-tip");
			showToast(notice, {
				key: "count",
				duration: 4e3
			});
			resumeIfWePaused();
			reloadDanmaku(announcedMatch !== null || getStats().missed > 0);
			return true;
		}
		async function ensureMatch() {
			if (!config.enabled) return;
			setExpecting(true);
			busy = true;
			resetMatch("匹配中…");
			const seq = matchSeq;
			render();
			const task = (async () => {
				try {
					const keyword = cleanTitle(currentInfo.seriesName);
					if (!keyword) throw new MatchError("未识别到当前视频的标题");
					const remembered = rememberedAnimeFor(currentInfo.seriesName);
					if (remembered) {
						tried = [];
						await pickAnime(remembered, { silent: true });
						return;
					}
					const found = await findAnime(keyword, (msg) => {
						if (!isCurrentMatch(seq)) return;
						notice = msg;
						if (opened) renderStatus();
					});
					if (!isCurrentMatch(seq)) return;
					tried = found.tried;
					const picked = autoPick(found.animes);
					if (picked) {
						await pickAnime(picked, { silent: true });
						return;
					}
					candidateList = found.animes.slice(0, 8);
					busy = false;
					if (found.needsConfirm && candidateList.length === 1) {
						const item = candidateList[0];
						notice = `找到唯一匹配「${item.name}」，请确认`;
						matchSettled = true;
						render();
						showToast(`找到唯一匹配「${item.name}」，请确认是否正确`, {
							key: "hold",
							duration: 8e3,
							action: {
								label: "确认",
								onClick: () => {
									if (detached) return;
									clearToast("hold");
									pickAnime(item, { silent: true });
								}
							}
						});
						return;
					}
					matchSettled = true;
					notice = "请手动选择番剧名";
					render();
					if (forced) {
						lastHoldReason = "请手动选择番剧名";
						showToast(lastHoldReason, {
							key: "hold",
							duration: 8e3
						});
					}
				} catch (error) {
					if (!isCurrentMatch(seq)) return;
					busy = false;
					notice = error instanceof MatchError ? error.message : `匹配失败：${errorMessage(error)}`;
					if (error instanceof MatchError) {
						tried = error.context.tried;
						candidateList = error.context.animes.slice(0, 8);
						matchTip.textContent = "搜索结果由弹弹play返回，未搜到可尝试更换关键词。";
					}
					settleForced("未匹配到番剧，请手动选择");
					render();
				}
			})();
			setLoading(task.then(() => void 0, () => void 0));
			await task;
			if (isCurrentMatch(seq)) {
				setLoading(null);
				setExpecting(false);
			}
		}
		function autoPick(list) {
			if (!list.length) return void 0;
			const remembered = rememberedAnime(list, currentInfo.seriesName);
			if (remembered) return remembered;
			const target = squash(currentInfo.seriesName).toLowerCase();
			const exact = list.find((o) => squash(o.name).toLowerCase() === target);
			if (exact) return exact;
			return chooseAnime(list, currentInfo);
		}
		async function pickAnime(item, opts = {}) {
			const seq = matchSeq;
			busy = true;
			notice = "读取集数…";
			anime = item;
			candidateList = [];
			episode = void 0;
			render();
			try {
				const list = await episodeList(item.id);
				if (!isCurrentMatch(seq)) return;
				if (!list.length) {
					busy = false;
					notice = "该番剧没有可用集数";
					anime = void 0;
					settleForced("该番剧没有可用集数");
					render();
					return;
				}
				episodeOptions = list;
				const guess = chooseEpisode(list, currentInfo);
				if (guess) {
					await pickEpisode(guess, opts);
					return;
				}
				busy = false;
				notice = "";
				matchSettled = true;
				render();
				if (forced) settleForced(`已匹配「${item.name}」，请手动选择集数`);
			} catch (error) {
				if (!isCurrentMatch(seq)) return;
				busy = false;
				notice = `读取集数失败：${errorMessage(error)}`;
				anime = void 0;
				settleForced(`读取集数失败：${errorMessage(error)}`);
				render();
			}
		}
		async function pickEpisode(ep, opts = {}) {
			const current = anime;
			if (!current) return;
			const seq = matchSeq;
			busy = true;
			notice = `加载「${ep.name}」弹幕…`;
			episode = ep;
			render();
			try {
				const comments = await commentsOf(ep.id);
				if (!isCurrentMatch(seq)) return;
				if (!comments.length) {
					await urlRestorePromise;
					if (!isCurrentMatch(seq)) return;
					busy = false;
					notice = "该集没有弹幕";
					setComments([]);
					if (!applyUrlFallback()) settleForced("该集没有弹幕");
					render();
					return;
				}
				await urlRestorePromise;
				if (!isCurrentMatch(seq)) return;
				notice = "";
				busy = false;
				setComments(comments);
				const staleSeg = isStaleSegment();
				const rematching = announcedMatch !== null || staleSeg || getStats().missed > 0;
				releaseHold();
				rememberMatch(currentInfo, current, ep);
				render();
				if (staleSeg) {
					clearToast("hold");
					showToast(`已切换到「${current.name}」${ep.name}`, {
						key: "title",
						duration: 4e3
					});
					showReloadToast("已注入的分段仍是原集数，刷新页面后生效", "hold");
				} else {
					announceMatch(current.name, ep.name, comments.length + getTotalCount());
					resumeIfWePaused();
				}
				reloadDanmaku(rematching);
			} catch (error) {
				if (!isCurrentMatch(seq)) return;
				busy = false;
				notice = `加载弹幕失败：${errorMessage(error)}`;
				render();
			}
		}
		async function doSearch() {
			const keyword = searchInput.value.trim();
			if (keyword.length < 2) {
				notice = "关键词至少 2 个字";
				render();
				return;
			}
			matchSeq++;
			const seq = matchSeq;
			busy = true;
			notice = "搜索中…";
			candidateList = [];
			anime = void 0;
			episode = void 0;
			episodeOptions = [];
			setExpecting(true);
			setComments(null);
			render();
			try {
				const found = await manualSearch(keyword);
				if (!isCurrentMatch(seq)) return;
				busy = false;
				if (!found.length) {
					setExpecting(false);
					notice = "未找到匹配番剧";
					matchTip.textContent = "搜索结果由弹弹play返回，未搜到可尝试更换关键词。";
					render();
					return;
				}
				tried = [keyword];
				notice = "";
				candidateList = found.slice(0, 8);
				matchTip.textContent = `「${keyword}」共 ${found.length} 条`;
				render();
				setExpecting(true);
			} catch (error) {
				if (!isCurrentMatch(seq)) return;
				busy = false;
				setExpecting(false);
				notice = `搜索失败：${errorMessage(error)}`;
				render();
			}
		}
		searchBtn.addEventListener("click", () => void doSearch());
		searchInput.addEventListener("keydown", (e) => {
			if (e.key === "Enter") doSearch();
		});
		let adding = false;
		async function onAddUrl() {
			const url = urlInput.value.trim();
			if (!url || adding) return;
			adding = true;
			urlAddBtn.textContent = "…";
			urlTip.classList.remove("is-error");
			try {
				const entry = await addSource(url);
				urlInput.value = "";
				if (entry.items.length > 0 && getStats().requests > 0) {
					urlSourceNotice = `URL来源已加载 ${entry.items.length} 条弹幕`;
					urlSourceNeedsRefresh = true;
					const total = availableTotal();
					showToast(urlSourceNotice, {
						key: "url-source-count",
						duration: 4e3
					});
					showReloadToast(total ? `共 ${total} 条，刷新页面后当前段生效` : "刷新页面后当前段生效", "url-source-refresh");
				}
				applyUrlFallback();
			} catch (error) {
				urlTip.textContent = `添加失败：${errorMessage(error)}`;
				urlTip.classList.add("is-error");
			} finally {
				adding = false;
				urlAddBtn.textContent = "添加";
				render();
			}
		}
		async function onPasteUrl() {
			urlTip.classList.remove("is-error");
			try {
				var _navigator$clipboard2;
				if (!((_navigator$clipboard2 = navigator.clipboard) === null || _navigator$clipboard2 === void 0 ? void 0 : _navigator$clipboard2.readText)) throw new Error("clipboard-unavailable");
				const text = (await navigator.clipboard.readText()).trim();
				if (!text) {
					urlTip.textContent = "剪贴板为空";
					return;
				}
				urlInput.value = text;
				urlInput.focus();
			} catch (_unused4) {
				urlTip.textContent = "浏览器未授予剪贴板权限，请使用 Ctrl+V";
				urlTip.classList.add("is-error");
			}
		}
		urlAddBtn.addEventListener("click", () => void onAddUrl());
		urlPasteBtn.addEventListener("click", () => void onPasteUrl());
		urlInput.addEventListener("keydown", (e) => {
			if (e.key === "Enter") onAddUrl();
		});
		const unsubscribe = subscribe(() => {
			if (opened) renderUrls();
			applyUrlFallback();
			refreshAnnouncedCount();
			renderStatus();
		});
		/**
		* 匹配成功时在播放器左下角弹两条提示，像第三方站点播放器进场那样：
		* 一条番剧名 + 集名，一条「已加载 N 条第三方弹幕」。
		*
		* 触发点是「匹配成功」而不是「这一分段注入了」——
		* 当前分段命中 0 条不代表整集没有弹幕，按分段算会让人以为没生效。
		* 条数也用整集的总数。
		*/
		function announceMatch(name, episodeName, count) {
			if (detached) return;
			announcedMatch = {
				name,
				episodeName,
				count
			};
			const title = [name, episodeName].filter(Boolean).join(" · ");
			if (title) showToast(title, {
				key: "title",
				duration: 4e3
			});
			if (count > 0) showToast(`匹配成功，已加载 ${count} 条第三方弹幕`, {
				key: "count",
				duration: 4e3
			});
		}
		/** URL 来源是后台恢复的，晚于弹弹play匹配时补发一次完整总数。 */
		function refreshAnnouncedCount() {
			if (detached || !announcedMatch) return;
			const count = availableTotal();
			if (count <= announcedMatch.count) return;
			announcedMatch.count = count;
		}
		let replaceRaf = 0;
		const onBodyMutation = new MutationObserver(() => {
			if (detached || replaceRaf) return;
			if (button.isConnected && button.parentElement) return;
			replaceRaf = window.requestAnimationFrame(() => {
				replaceRaf = 0;
				placeButton();
			});
		});
		onBodyMutation.observe(document.body, {
			childList: true,
			subtree: true
		});
		setPageKey(currentPageKey);
		setEnabled(config.enabled);
		setDedupe(config.dedupe);
		resetUrlSources();
		render();
		setHold(false);
		if (config.enabled) setExpecting(true);
		syncForced();
		(async () => {
			const restoreKeys = /* @__PURE__ */ new Set();
			if (currentPageKey) restoreKeys.add(currentPageKey);
			const initialVidKey = vidPageKeyOf(info, currentVid);
			if (initialVidKey) restoreKeys.add(initialVidKey);
			if (currentVid && currentPageKey.startsWith("vid:")) {
				const fresh = await readVideoInfoByBvidAsync(currentVid).catch(() => void 0);
				if (detached) return;
				const freshKey = fresh ? pageKeyOf(fresh) : "";
				if (fresh && fresh.seriesName && (freshKey !== currentPageKey || fresh.seriesName !== currentInfo.seriesName || fresh.episode !== currentInfo.episode)) {
					console.info("[danmaku-enhance] 挂载时按 bvid 校正标题", {
						bvid: currentVid,
						from: currentInfo.seriesName,
						to: fresh.seriesName
					});
					restoreKeys.add(currentPageKey);
					const freshVidKey = vidPageKeyOf(fresh, currentVid);
					if (freshVidKey) restoreKeys.add(freshVidKey);
					currentInfo = fresh;
					currentPageKey = freshKey;
					searchInput.value = cleanTitle(fresh.seriesName);
					setCid(fresh.cid);
					setPageKey(currentPageKey);
					render();
				}
			}
			startUrlRestore([...restoreKeys]);
			if (config.enabled) ensureMatch();
		})();
		/**
		* 页面换了（换视频、切分P、切集）就整体重置一遍。
		*
		* 触发源（都不靠定时轮询）：
		*   1. `<title>` 的 MutationObserver —— B 站换视频/切分P 一定会改标题；
		*   2. runtime 派发的 `routechange` —— 走 pushState 的那部分跳转；
		*   3. 用户点开面板时再核对一次 —— 少数软跳转可能连标题都没改。
		*
		* 只比 cid / 番名+集数这一组 key，key 没变就直接返回，
		* 所以误报的代价只是几次属性读取。
		*/
		function checkPage() {
			if (detached) return;
			const next = readPageInfo();
			if (next.live) return;
			const nextVid = readBvid();
			if (nextVid && currentVid && nextVid !== currentVid) {
				console.info("[danmaku-enhance] 检测到换视频", {
					from: currentVid,
					to: nextVid
				});
				resetForPage(next, pageKeyOf(next), nextVid);
				return;
			}
			const nextEp = readEpisodeId();
			if (nextEp && currentEp && nextEp !== currentEp) {
				console.info("[danmaku-enhance] 检测到换集（URL ep_id 路径）", {
					from: currentEp,
					to: nextEp
				});
				resetForPage(next, pageKeyOf(next), nextVid);
				return;
			}
			if (nextEp !== currentEp) currentEp = nextEp;
			if (currentPageKey.startsWith("cid:") && !next.cid) return;
			const nextKey = pageKeyOf(next);
			if (nextKey === currentPageKey) {
				if (!(currentInfo.source === "video" || currentInfo.source === "bangumi") && next.seriesName && next.seriesName !== currentInfo.seriesName) {
					console.info("[danmaku-enhance] 标题信息已补全", {
						from: currentInfo.seriesName,
						to: next.seriesName
					});
					currentInfo = next;
					searchInput.value = cleanTitle(next.seriesName);
					resetMatch("");
					setCid(next.cid);
					render();
					if (config.enabled) ensureMatch();
				}
				return;
			}
			console.info("[danmaku-enhance] 检测到页面变化（title/url 路径）", {
				href: location.href,
				from: currentPageKey,
				to: nextKey,
				episode: next.episode,
				cid: next.cid
			});
			resetForPage(next, nextKey, nextVid);
		}
		/** 换页面后的统一重置：面板状态、URL 源、播放器 cid 全部重新来一遍。 */
		function resetForPage(next, nextKey, nextVid) {
			currentInfo = next;
			currentPageKey = nextKey;
			currentVid = nextVid;
			currentEp = readEpisodeId();
			clearToast();
			searchInput.value = cleanTitle(next.seriesName);
			matchTip.textContent = "";
			resetMatch("");
			lastHoldReason = "";
			setCid(next.cid);
			setPageKey(nextKey);
			resetUrlSources();
			render();
			if (forced) beginForced();
			syncForced();
			(async () => {
				const restoreKeys = /* @__PURE__ */ new Set();
				if (nextKey) restoreKeys.add(nextKey);
				const nextVidKey = vidPageKeyOf(next, nextVid);
				if (nextVidKey) restoreKeys.add(nextVidKey);
				if (nextVid && currentPageKey.startsWith("vid:")) {
					const fresh = await readVideoInfoByBvidAsync(nextVid).catch(() => void 0);
					if (detached) return;
					if (fresh && fresh.seriesName) {
						console.info("[danmaku-enhance] 按 bvid 重新取到标题", {
							bvid: nextVid,
							title: fresh.seriesName,
							episode: fresh.episode
						});
						const freshKey = pageKeyOf(fresh);
						restoreKeys.add(currentPageKey);
						const freshVidKey = vidPageKeyOf(fresh, nextVid);
						if (freshVidKey) restoreKeys.add(freshVidKey);
						currentInfo = fresh;
						currentPageKey = freshKey;
						searchInput.value = cleanTitle(fresh.seriesName);
						setCid(fresh.cid);
						setPageKey(currentPageKey);
						render();
					}
				}
				startUrlRestore([...restoreKeys]);
				if (config.enabled) ensureMatch();
			})();
		}
		/**
		* 播放器请求的 cid 变了 = 真的换集了（切分P / 切集）。
		*
		* 这条路和 checkPage() 互补：checkPage 靠读页面信息，切分P 时
		* `?p=` 不一定更新、`__INITIAL_STATE__` 也不会重写，于是它发现不了；
		* 但播放器换集必须用新 cid 去请求弹幕，这个 cid 我们拦得到。
		*/
		let lastCidHandled = null;
		let cidInFlight = null;
		let cidGeneration = 0;
		const unsubscribeCid = onCidChange((cid) => {
			if (detached) return;
			if (cid === cidInFlight) return;
			if (cid === lastCidHandled && currentInfo.cid === cid) return;
			cidInFlight = cid;
			const attempt = ++cidGeneration;
			readVideoInfoByCidAsync(cid).then((next) => {
				if (cidInFlight === cid) cidInFlight = null;
				if (detached) return;
				if (attempt !== cidGeneration) return;
				if (!next) {
					console.info("[danmaku-enhance] 播放器换了 cid，但 pages/接口都没找到", { cid });
					return;
				}
				lastCidHandled = cid;
				const nextKey = pageKeyOf(next);
				if (nextKey === currentPageKey) return;
				if (!currentPageKey.startsWith("cid:") && !currentInfo.cid && currentVid === readBvid() && currentEp === readEpisodeId()) {
					var _next$aid;
					console.info("[danmaku-enhance] 用首个 cid 补全当前页面", {
						cid,
						pageKey: currentPageKey,
						to: nextKey
					});
					currentInfo = _objectSpread2(_objectSpread2({}, currentInfo), {}, {
						cid,
						aid: (_next$aid = next.aid) !== null && _next$aid !== void 0 ? _next$aid : currentInfo.aid
					});
					currentPageKey = nextKey;
					setCid(cid);
					setPageKey(nextKey);
					render();
					return;
				}
				console.info("[danmaku-enhance] 检测到换集（cid 路径）", {
					cid,
					from: currentPageKey,
					to: nextKey,
					episode: next.episode
				});
				currentInfo = next;
				currentPageKey = nextKey;
				currentVid = readBvid();
				currentEp = readEpisodeId();
				clearToast();
				searchInput.value = cleanTitle(next.seriesName);
				matchTip.textContent = "";
				resetMatch("");
				lastHoldReason = "";
				setCid(cid);
				setPageKey(nextKey);
				resetUrlSources();
				render();
				if (forced) beginForced();
				(async () => {
					startUrlRestore([nextKey, vidPageKeyOf(next, currentVid)].filter(Boolean));
					if (config.enabled) ensureMatch();
				})();
			}).catch((error) => {
				if (cidInFlight === cid) cidInFlight = null;
				console.warn("[danmaku-enhance] cid 反查失败", {
					cid,
					error
				});
			});
		});
		let checkTimer;
		function scheduleCheck() {
			if (detached) return;
			if (checkTimer !== void 0) window.clearTimeout(checkTimer);
			checkTimer = window.setTimeout(() => {
				checkTimer = void 0;
				checkPage();
			}, 300);
		}
		const titleWatch = new MutationObserver(scheduleCheck);
		titleWatch.observe(document.head, {
			childList: true,
			subtree: true,
			characterData: true
		});
		window.addEventListener("routechange", scheduleCheck);
		window.addEventListener("popstate", scheduleCheck);
		/**
		* 直接盯 location.href。
		*
		* 前面几条路都可能哑火：站内切分P 时 title 不见得会改，而 B 站自己的
		* router 如果在我们打补丁之前就把原生 pushState 存进了闭包，那
		* runtime 包装出来的 routechange 也收不到。只有 location.href 一定会变
		* ——切分P 的 URL 上带着 `?p=N`。
		*
		* 每 500ms 比一次字符串，代价可以忽略；发现变化再走 300ms 防抖那套完整流程。
		*/
		let watchedHref = location.href;
		const urlWatch = window.setInterval(() => {
			if (detached) return;
			if (location.href === watchedHref) return;
			watchedHref = location.href;
			scheduleCheck();
		}, 500);
		button.addEventListener("click", scheduleCheck);
		return { dispose() {
			detached = true;
			setHold(false);
			if (anchorTimer !== void 0) window.clearTimeout(anchorTimer);
			if (checkTimer !== void 0) window.clearTimeout(checkTimer);
			stopPauseWatch();
			if (resumeTimer !== void 0) window.clearTimeout(resumeTimer);
			window.clearInterval(urlWatch);
			titleWatch.disconnect();
			window.removeEventListener("routechange", scheduleCheck);
			window.removeEventListener("popstate", scheduleCheck);
			document.removeEventListener("click", onDocumentClick, true);
			document.removeEventListener("mousedown", onDocumentMouseDown, true);
			document.removeEventListener("pointerdown", markGesture, true);
			document.removeEventListener("keydown", markGesture, true);
			document.removeEventListener("play", onVideoPlay, true);
			window.removeEventListener("resize", onResize);
			window.removeEventListener("scroll", onScroll, true);
			unbindFullscreen();
			if (scrollRaf) window.cancelAnimationFrame(scrollRaf);
			if (replaceRaf) window.cancelAnimationFrame(replaceRaf);
			onBodyMutation.disconnect();
			unsubscribe();
			unsubscribeCid();
			disposeToast();
			button.remove();
			panel.remove();
		} };
	}
	//#endregion
	//#region src/adapter/bilibili/lib/site-runner.ts
	function matches(test, target) {
		return typeof test === "function" ? test(target) : test.test(target);
	}
	function installRouteChangeListener(onRouteChange) {
		const wrap = (type) => {
			const original = history[type];
			history[type] = function(...args) {
				const result = original.apply(this, args);
				window.dispatchEvent(new Event("routechange"));
				return result;
			};
		};
		wrap("pushState");
		wrap("replaceState");
		window.addEventListener("popstate", onRouteChange);
		window.addEventListener("hashchange", onRouteChange);
		window.addEventListener("routechange", onRouteChange);
	}
	function createSiteRunner(hooks) {
		let setupsRan = false;
		let disposeList = [];
		const active = () => matches(hooks.test, location.pathname + location.search);
		const runOnce = () => {
			var _hooks$run;
			if (!active()) return;
			if (!setupsRan) {
				var _hooks$setup;
				setupsRan = true;
				(_hooks$setup = hooks.setup) === null || _hooks$setup === void 0 || _hooks$setup.call(hooks);
			}
			const result = (_hooks$run = hooks.run) === null || _hooks$run === void 0 ? void 0 : _hooks$run.call(hooks);
			if (typeof result === "function") disposeList.push(result);
		};
		return { start() {
			const init = () => {
				runOnce();
				installRouteChangeListener(() => {
					disposeList.forEach((dispose) => {
						try {
							dispose();
						} catch (error) {
							console.error("[danmaku-enhance]", error);
						}
					});
					disposeList = [];
					runOnce();
				});
			};
			if (document.readyState !== "loading") init();
			else window.addEventListener("DOMContentLoaded", init);
		} };
	}
	//#endregion
	//#region src/adapter/bilibili/index.ts
	createSiteRunner({
		test: /^\/(video|bangumi\/play|cheese\/play|list|festival|medialist)\b/,
		setup: installHook,
		run() {
			if (isLivePage()) return;
			const info = readPageInfo();
			if (info.live) return;
			const config = loadConfig();
			resetPageState();
			setEnabled(config.enabled);
			setDedupe(config.dedupe);
			setCid(info.cid);
			const panel = mountPanel(info);
			return () => panel.dispose();
		}
	}).start();
	//#endregion
})();
