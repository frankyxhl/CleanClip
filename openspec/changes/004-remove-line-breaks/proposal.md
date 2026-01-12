# OpenSpec Proposal: 004-remove-line-breaks

## Metadata

- **Change ID**: 004-remove-line-breaks
- **Status**: Proposed
- **Created**: 2025-01-12
- **Version**: 0.6.4 → 0.7.0

---

## Why

用户反馈 OCR 识别的文字经常包含不需要的换行符，粘贴时需要手动删除，影响使用体验。
特别是在从截图、PDF 复制文字时，会产生大量不必要的换行。

---

## What Changes

### 功能列表

1. **删除换行符选项**
   - Options 页面添加"删除换行符"开关
   - 默认开启
   - 设置保存到 chrome.storage.local

2. **智能换行符处理**
   - 删除单个换行符（\n）
   - 保留双换行符（\n\n）作为段落分隔
   - 可选：保留列表项前的换行

**Note**: 此功能在 Options 页面可随时开关，不影响其他功能。

---

## Impact

### 影响的代码

| 文件 | 变更类型 | 说明 |
|------|---------|------|
| `src/options/index.html` | 修改 | 添加删除换行符开关 UI |
| `src/options/main.ts` | 修改 | 添加设置保存/读取逻辑 |
| `src/background.ts` | 修改 | OCR 处理时调用换行符删除函数 |
| `src/utils/lineBreaks.ts` | 新建 | 换行符处理工具函数 |
| `tests/lineBreaks.test.ts` | 新建 | 换行符删除测试 |

### 影响的 Specs

| Spec | 变更类型 | 说明 |
|------|---------|------|
| `specs/remove-line-breaks/spec.md` | 新建 | 删除换行符功能需求 |

### Breaking Change

**No** - 新增功能，不破坏现有 API

### 向后兼容

**Yes** - 现有功能保持不变，新设置默认开启

---

## Risks

| 风险 | 影响程度 | 缓解措施 |
|------|---------|---------|
| **删除换行符破坏段落结构** | **High** | 只删除单个换行，保留双换行作为段落分隔 |
| **用户不知道有此功能** | Low | 默认开启，Options 页面清晰标注 |
| **列表格式被破坏** | Medium | 保留列表识别后的换行（如 - 开头） |

---

## Rollback Strategy

- 每个 Phase 独立 commit，可按需 revert
- 无数据迁移，回滚无副作用
- 回滚命令: `git revert <commit-hash>`
- 清除 chrome.storage 中的 `cleanclip-remove-line-breaks` key

---

## Acceptance Criteria

### 删除换行符选项
- [ ] Options 页面显示"删除换行符"复选框
- [ ] 默认状态为选中（开启）
- [ ] 设置变更后立即保存到 storage

### 换行符处理逻辑
- [ ] 单个换行符被删除（`hello\nworld` → `hello world`）
- [ ] 双换行符保留为段落分隔（`para1\n\npara2` → `para1\n\npara2`）
- [ ] 空字符串返回空字符串
- [ ] 纯换行符字符串返回空字符串

### OCR 集成
- [ ] OCR 识别时读取 storage 设置
- [ ] 设置开启时调用换行符删除函数
- [ ] 设置关闭时保持原始文本

### 测试
- [ ] 所有现有测试通过
- [ ] 新增测试覆盖换行符删除逻辑
- [ ] 新增测试覆盖 Options 页面 UI

---

## Timeline

- **Estimated**: 2-3 hours
- **Phases**: 5 phases
- **Tasks**: 19 tasks (see tasks.md for detailed breakdown)
