# 练了么 · LianLeMe

> 今天，练了么？—— 302 个标准健身动作的开源 PWA 图鉴

**在线体验**：[main.lianleme.pages.dev](https://main.lianleme.pages.dev)

一款可以安装到手机主屏的健身动作速查工具：按部位找动作、看标准线稿动画、读专业要点、配训练计划、组间计时、记录打卡——全程离线可用。

## ✨ 功能

- **302 个动作 · 全中文** — 名称、肌群、器材、动作类型完整汉化，支持中英文搜索
- **3 帧线稿动画** — 每个动作配标准姿势动画，慢/中/快三档变速
- **专业要点库** — 302 个动作逐一手写：2~3 条标准做法 + 1 条常见错误
- **智能配计划** — 选部位 + 时长 + 难度，自动生成训练单（复合动作优先、部位轮转）
- **训练模式** — 当前动作大屏动画、组数打卡、全屏组间计时（语音倒数）
- **训练记录** — 本周打卡、近 4 周训练量图表、历史明细
- **PWA 离线** — Service Worker 全量缓存，健身房断网秒开
- **深浅双主题** — 跟随系统或手动切换

## 📱 安装到手机

用 Safari（iOS）/ Chrome（Android）打开 [在线地址](https://main.lianleme.pages.dev)，菜单里选「添加到主屏幕」即可获得全屏 App 体验。

## 🛠 技术栈

Vue 3 + Vite + vite-plugin-pwa。动作数据来自 [hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset)（1324 动作 · 10 语言说明），动图素材 © Gym visual（180×180，经许可分发），构建产物为纯静态文件。

```bash
npm install
npm run dev      # 开发
npm run build    # 构建
```

## 📄 许可

- 代码：[MIT](./LICENSE)
- 动作数据：[exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset) (MIT)
- 动作动图：© [Gym visual](https://gymvisual.com/) — 经许可以 180×180 分发，使用时保留署名

## 🙏 致谢

- [hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset) — 提供 1324 个动作的数据集与 10 语言说明
- [Gym visual](https://gymvisual.com/) — 动作演示动图（© Gym visual，经许可分发）
- [Everkinetic](https://github.com/everkinetic/data) — 最初的姿势库来源

---

## English

**LianLeMe** (lit. "Did you work out today?") is an open-source PWA fitness exercise guide with 302 exercises, full Chinese localization, hand-written form cues & common mistakes, an AI-style workout plan generator, rest timer with voice countdown, and offline support. Built with Vue 3 + Vite. Exercise data from [exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset) (MIT), animations © Gym visual.

Live demo: https://main.lianleme.pages.dev
