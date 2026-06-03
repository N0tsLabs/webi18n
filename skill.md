# Webi18n 网页翻译技能

## 触发条件

当用户说以下任意内容时触发：
- "翻译这个页面" / "汉化" / "translate"
- "翻译 github.com" / "翻译 stackoverflow"
- 或用户运行 `/translate`

## 工作原理

翻译结果存放在仓库 `translations/` 目录下，插件会自动从 GitHub 拉取并应用。
你只需要完成翻译并 commit，所有用户自动获得更新。

## 操作流程

### 1. 打开目标页面

用浏览器工具打开用户指定的网站，截图了解页面结构。

### 2. 提取页面文本

遍历页面 DOM，提取所有可见文本节点和属性文本（placeholder、aria-label、title、alt）。

提取规则：
- 跳过 `<script>`、`<style>`、`<code>`、`<pre>` 等标签
- 跳过少于 2 个字符或超过 500 字符的文本
- 跳过纯数字、纯符号

### 3. 翻译

将提取的文本翻译为目标语言（默认中文）。

翻译规则：
- 品牌名不翻译：GitHub, JavaScript, TypeScript, React, Vue, Node.js 等
- URL 不翻译
- 代码片段、命令不翻译
- 保持技术术语准确性（如 "Pull request" → "拉取请求"，"Commit" → "提交"）
- 短文本（按钮、标签）：简洁直接
- 长文本（描述、说明）：通顺自然

### 4. 写入翻译文件

将翻译结果写入 `translations/{hostname}.json`，格式如下：

```json
{
  "meta": {
    "hostname": "github.com",
    "sourceLang": "en",
    "targetLang": "zh-CN",
    "updatedAt": "2026-06-03T10:00:00Z"
  },
  "texts": [
    { "id": "t1", "original": "Code", "translated": "代码", "attribute": null },
    { "id": "t2", "original": "Pull requests", "translated": "拉取请求", "attribute": null },
    { "id": "t3", "original": "Search or jump to...", "translated": "搜索或跳转到...", "attribute": "placeholder" }
  ]
}
```

### 5. 提交到仓库

```bash
git add translations/{hostname}.json
git commit -m "翻译 {hostname} 页面"
git push
```

完成后告知用户翻译已上线，插件会在下次访问时自动加载。

## 批量翻译

如果页面文本量很大（>100条），分批处理：
- 每批 50-100 条
- 保持 id 连续
- 最终合并为一个文件

## 多语言

目标语言不限于中文。根据用户指定的语言翻译，文件中 `meta.targetLang` 字段记录目标语言代码。
