# CleanClip MVP – Implementation Checklist

## 1. Chrome Extension 基础

- [ ] Manifest V3
- [ ] Toolbar icon
- [ ] Background service worker
- [ ] Content script 注入

---

## 2. 截图模块（Copy）

- [ ] 区域选择 UI（overlay）
- [ ] 获取截图 image data
- [ ] 基本截图预览（可选）

---

## 3. 后端处理（AI Pipeline）

- [ ] 接收图片
- [ ] OCR（初期可用第三方）
- [ ] 基础文本清理
- [ ] 结构识别（段落 / 列表 / 表格）
- [ ] 生成多种输出格式：
  - Plain text
  - Markdown
  - HTML
  - TSV
  - LaTeX（基础）

---

## 4. Paste Context Detection（浏览器侧）

- [ ] 获取当前 tab URL
- [ ] 解析 domain
- [ ] 映射 domain → paste profile

---

## 5. Smart Paste 注入

- [ ] 识别当前编辑器（contenteditable / textarea）
- [ ] 注入对应格式内容
- [ ] 确保不破坏原有焦点

---

## 6. Fallback & Manual Override

- [ ] 简单菜单：Paste as…
- [ ] Image fallback（始终可用）

---

## 7. 用户反馈入口（极重要）

- [ ] README 明确写 GitHub Issues
- [ ] 插件内「Report Issue」按钮
- [ ] Issue 模板（Bug / Feature）

---

## 8. 发布准备

- [ ] Chrome Store Listing（清晰 Demo）
- [ ] README（5 分钟能跑起来）
- [ ] Demo GIF（截图 → 粘贴表格 / 邮件）


