# OpenSpec Proposal: 003-ux-improvements

## Metadata

- **Change ID**: 003-ux-improvements
- **Status**: Completed ✅
- **Created**: 2025-01-12
- **Completed**: 2025-01-12
- **Version**: 0.5.4 → 0.6.4 (including bug fixes)

---

## Why

用户反馈 CleanClip 缺少关键 UX 功能：
- 详情页按钮无作用（Copy 按钮未实现）
- 截图流程无进度提示，用户不知道发生什么
- 无法在详情页浏览历史记录
- Markdown 预览不支持常用语法（列表、链接、代码块等）

这些改进将显著提升用户体验和工具可用性。

---

## What Changes

### 功能列表

1. **Copy 按钮**
   - 复制文本到剪贴板
   - 显示成功通知

2. **进度通知**
   - 截图成功后显示 "Screenshot captured! Sending to AI..."
   - OCR 完成后显示 "OCR complete! Result copied to clipboard"

3. **历史导航侧边栏**
   - 180px 左侧导航栏
   - 显示时间 + 文本预览（最多2行）
   - 当前项背景高亮（蓝色 #007AFF）
   - 点击历史项动态切换内容（无页面刷新）

4. **三栏布局**
   - 左: 历史导航（180px）
   - 中: 文本 + 按钮
   - 右: 截图图片

5. **Markdown 预览修复**
   - 支持无序列表（`- item`）
   - 支持链接（`[text](url)`）
   - 修复代码块内换行符问题
   - 支持引用（`> quote`）
   - 支持分隔线（`---`）
   - **XSS 防护：HTML 转义、链接安全属性**

**Note**: 图标替换不在本次实现范围内，等待用户提供图标文件后单独处理。

---

## Impact

### 影响的代码

| 文件 | 变更类型 | 说明 |
|------|---------|------|
| `src/detail/main.ts` | 修改 | 添加 Copy 按钮、历史导航、修复 Markdown 解析器（XSS 安全） |
| `src/detail/index.html` | 修改 | 三栏布局、历史导航容器 |
| `src/background.ts` | 修改 | 添加进度通知 |
| `tests/detail.test.ts` | 新建 | 详情页测试 |
| `tests/background.test.ts` | 修改 | 添加通知测试 |

### 影响的 Specs

| Spec | 变更类型 | 说明 |
|------|---------|------|
| `specs/detail-copy-button/spec.md` | 新建 | Copy 按钮功能需求 |
| `specs/progress-notifications/spec.md` | 新建 | 进度通知需求 |
| `specs/history-navigation/spec.md` | 新建 | 历史导航需求 |
| `specs/markdown-preview/spec.md` | 新建 | Markdown 预览需求和 XSS 安全 |

### Breaking Change

**No** - 所有新增功能，不破坏现有 API

### 向后兼容

**Yes** - 现有功能保持不变

---

## Risks

| 风险 | 影响程度 | 缓解措施 |
|------|---------|---------|
| **Markdown 解析器 XSS 漏洞** | **Critical** | HTML 转义 + 链接过滤 + XSS 测试覆盖 |
| 历史记录加载性能 | Medium | 测试大量历史项，必要时添加虚拟滚动 |
| 浏览器剪贴板 API 兼容 | Low | 现代浏览器均支持，已有 fallback 通知 |

---

## Rollback Strategy

- 每个 Phase 独立 commit，可按需 revert
- 无数据迁移，回滚无副作用
- 回滚命令: `git revert <commit-hash>`

---

## Acceptance Criteria

### Copy 按钮
- [x] 点击 Copy 按钮复制文本到剪贴板
- [x] 显示 "Text copied to clipboard" 通知

### 进度通知
- [x] 截图成功后显示 "Screenshot captured! Sending to AI..." 通知
- [x] OCR 完成后显示 "OCR complete! Result copied to clipboard" 通知

### 历史导航
- [x] 详情页左侧显示 180px 导航栏
- [x] 历史项显示时间（如 "5m ago", "2h ago"）
- [x] 历史项显示文本预览（最多2行，超出省略）
- [x] 当前查看项背景高亮（#007AFF）
- [x] 点击历史项更新中间和右侧内容
- [x] 点击时 URL 更新但页面不刷新

### Markdown 预览
- [x] 支持无序列表（`- item` → `<ul><li>`)
- [x] 支持链接（`[text](url)` → `<a href="..." rel="noopener noreferrer">`）
- [x] 代码块内换行符不转换为 `<br>`
- [x] 支持引用（`> quote` → `<blockquote>`)
- [x] 支持分隔线（`---` → `<hr>`）
- [x] **XSS 安全：HTML 被转义**
- [x] **XSS 安全：javascript: 链接被过滤**
- [x] **XSS 安全：事件处理器被移除**

### 测试
- [x] 所有现有测试通过（70+ 测试）
- [x] 新增测试覆盖所有新功能
- [x] **XSS 测试向量全部通过**

---

## Timeline

- **Estimated**: 3-4 hours
- **Phases**: 9 phases
- **Tasks**: 107 tasks (see tasks.md for detailed breakdown)

---

## Completion Summary

**Status**: ✅ All 107 tasks completed

**Additional work completed beyond original scope**:
- Bug fix: Auto-inject content script when not loaded (multiple screenshots)
- Bug fix: Offscreen clipboard DOM ready fix
- Bug fix: Notification async/await error handling
- Feature: App icon replacement (1024x1024 source → 16/48/128)

**Final version**: 0.6.4

**Merge to main**: Commit 571eb22

**All acceptance criteria met** ✅
