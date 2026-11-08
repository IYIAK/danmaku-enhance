/**
 * Danmaku Enhance —— 哔哩哔哩弹幕增强。
 *
 * 只做一件事：劫持 B 站的弹幕分段请求，把弹弹play、B 站 URL 源与巴哈姆特
 * 动画疯的弹幕合并进原生 protobuf 响应，因此样式、速度、屏蔽规则都与原生
 * 弹幕完全一致，不替换播放器。
 */
import './adapter/bilibili'
