# Webi18n · 网页翻译

AI 驱动的多语言网站翻译浏览器插件。

## 特点

- **AI 驱动** — 翻译工作由本地 AI 助手完成，质量远超传统机器翻译
- **通用性** — 支持任意网站，不限于特定平台
- **多语言** — 支持翻译为中文、英文、日文、韩文等十余种语言
- **双语模式** — 原文与译文并排显示，方便对照
- **隐私安全** — 翻译在本地完成，数据不上传云端

## 工作原理

```
浏览器插件 (提取/展示)  ←→  本地 AI (翻译)
         ↓                        ↓
    提取页面文本              读取 skill.md
    写入 JSON 文件    →     翻译所有文本
    应用翻译结果      ←     写回翻译文件
```

1. 插件提取网页文本，生成 JSON 文件
2. 本地 AI（Claude Code / Cursor 等）读取文件并翻译
3. 插件读取翻译结果，替换或并排显示

## 安装

### 开发模式

```bash
git clone https://github.com/N0tsLabs/webi18n.git
cd webi18n
npm install
npm run dev
```

Chrome 浏览器：
1. 打开 `chrome://extensions/`
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 `.output/chrome-mv3` 目录

### 使用方法

1. 打开任意网页
2. 点击 Webi18n 图标
3. 选择目标语言和翻译模式
4. 点击"📥 提取页面文本"
5. 在 AI 助手中运行翻译（参考 `skill.md`）
6. 点击"📂 应用翻译文件"，选择翻译后的 JSON 文件

## 项目结构

```
webi18n/
├── skill.md                # AI 技能文件
├── src/
│   ├── entrypoints/
│   │   ├── content.ts      # 内容脚本
│   │   ├── background.ts   # 后台脚本
│   │   └── popup/          # 弹出页面
│   ├── utils/
│   │   ├── dom-scraper.ts  # DOM 文本提取
│   │   ├── translator.ts   # 翻译应用
│   │   ├── file-bridge.ts  # 文件桥接
│   │   └── settings.ts     # 设置管理
│   └── types/
│       └── index.ts        # 类型定义
└── wxt.config.ts           # WXT 配置
```

## 支持的语言

| 语言 | 代码 |
|------|------|
| 简体中文 | zh-CN |
| 繁體中文 | zh-TW |
| English | en |
| 日本語 | ja |
| 한국어 | ko |
| Français | fr |
| Deutsch | de |
| Español | es |
| Русский | ru |
| Português | pt |
| العربية | ar |
| Italiano | it |

## 技术栈

- [WXT](https://wxt.dev/) — 浏览器扩展框架
- [Vue 3](https://vuejs.org/) — UI 框架
- TypeScript — 类型安全

## 相关项目

- [maboloshi/github-chinese](https://github.com/maboloshi/github-chinese) — GitHub 中文汉化（静态字典方案）
- [immersive-translate/immersive-translate](https://github.com/immersive-translate/immersive-translate) — 沉浸式翻译

## License

MIT
