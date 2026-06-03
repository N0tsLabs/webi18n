# Webi18n 网页翻译技能

## 触发条件

当用户说以下任意内容时触发：
- "翻译这个页面" / "汉化" / "translate"
- "翻译网页" / "本地化页面"
- 或用户运行 `/translate`

## 操作流程

### 1. 查找翻译文件

检查用户下载目录（通常为 `~/Downloads/`）或 `/tmp/webi18n/` 下的最新 JSON 文件。

文件名格式：`webi18n-{hostname}-{timestamp}.json`

### 2. 读取原文

```bash
# 找到最新的提取文件
ls -lt ~/Downloads/webi18n-*.json | head -1
```

读取 JSON，结构如下：
```json
{
  "meta": { "hostname": "github.com", "sourceLang": "en", "targetLang": "zh-CN" },
  "texts": [
    { "id": "t1", "original": "Code", "selector": null, "attribute": null, "translated": null }
  ]
}
```

### 3. 翻译

根据 `meta.targetLang` 翻译每条 `original` 文本，填写到 `translated` 字段。

**翻译规则：**
- 品牌名不翻译：GitHub, JavaScript, TypeScript, React, Vue, Node.js 等
- URL 不翻译
- 代码片段、命令不翻译
- 保持技术术语准确性（如 "Pull request" → "拉取请求"，"Commit" → "提交"）
- 保持语气一致

**翻译技巧：**
- 短文本（按钮、标签）：简洁直接
- 长文本（描述、说明）：通顺自然
- UI 文本：符合目标语言的表达习惯

### 4. 写回结果

将翻译结果写入新文件：`{原文件名}-translated.json`

```bash
# 写入翻译结果
cat > ~/Downloads/webi18n-github.com-1234567890-translated.json << 'EOF'
{
  "meta": { ... },
  "texts": [
    { "id": "t1", "original": "Code", "translated": "代码", ... }
  ]
}
EOF
```

### 5. 通知完成

告诉用户：
- 翻译已完成
- 文件位置
- 如何应用：点击 Webi18n 插件图标 → "应用翻译文件" → 选择翻译后的 JSON 文件

## 高级用法

### 批量翻译

如果 texts 数量很多（>100条），分批处理：
- 每批 50-100 条
- 保持 id 对应关系

### 多语言

目标语言不限于中文，支持所有常见语言。根据 `meta.targetLang` 字段决定目标语言。

### 自定义规则

如果用户指定了特殊规则（如"保留英文专有名词"），优先遵循用户指令。
