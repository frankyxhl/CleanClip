# OpenSpec Proposal: 004-remove-line-breaks

## Metadata

- **Change ID**: 004-remove-line-breaks
- **Status**: Proposed
- **Created**: 2025-01-12
- **Version**: 0.6.4 → 0.7.0

---

## Why

用户反馈 OCR 识别的文字经常包含不需要的换行符和多余空格。

**现状分析：**
- `src/text-processing.ts` 已有 `removeLineBreaks` 和 `mergeSpaces` 函数
- Options 页面已有开关 UI (`removeLinebreaks`, `mergeSpaces`)
- **但缺少**：OCR 处理后没有调用 `processText`，导致设置不生效
- **缺少**：`text-processing.ts` 没有单元测试

---

## What Changes

### 功能列表

1. **集成 text-processing 到 OCR 流程**
   - 在 `src/background.ts` 中调用 `processText`
   - 从 storage 读取设置
   - 在 OCR 结果返回后应用处理

2. **添加单元测试**
   - `tests/text-processing.test.ts` - 测试 `removeLineBreaks`, `mergeSpaces`, `processText`
   - `tests/background.test.ts` - 测试集成逻辑

---

## Impact

### 影响的代码

| 文件 | 变更类型 | 说明 |
|------|---------|------|
| `src/background.ts` | 修改 | 在 OCR 处理中调用 `processText` |
| `tests/text-processing.test.ts` | 新建 | text-processing 单元测试 |
| `tests/background.test.ts` | 修改 | 添加集成测试 |

### 影响的 Specs

| Spec | 变更类型 | 说明 |
|------|---------|------|
| `specs/remove-line-breaks/spec.md` | 新建 | 文本处理功能需求 |

### Breaking Change

**No** - 只是激活已有功能，不破坏现有 API

### 向后兼容

**Yes** - 默认开启，行为与用户预期一致

---

## Current Implementation

### `src/text-processing.ts` (已存在)

```typescript
// removeLineBreaks: 将 3+ 个换行折叠为 2 个
"a\n\n\nb" → "a\n\nb"

// mergeSpaces: 合并连续空格/制表符
"a  b" → "a b"
"a\t\tb" → "a b"

// processText: 根据选项处理
processText(text, { removeLineBreaks: true, mergeSpaces: true })
```

### `src/options/main.ts` (已存在)

- `removeLinebreaks` checkbox (默认 true)
- `mergeSpaces` checkbox (默认 true)
- 存储到 `chrome.storage.local`

### Missing Parts

1. ❌ `src/background.ts` 没有调用 `processText`
2. ❌ 没有单元测试

---

## Risks

| 风险 | 影响程度 | 缓解措施 |
|------|---------|---------|
| 破坏段落格式 | Low | 只折叠 3+ 换行，保留单/双换行 |
| 测试覆盖不足 | Low | 添加完整单元测试 |
| CRLF 换行符处理 | Low | 当前只处理 \n，\r\n 保持不变（已知行为） |

---

## Rollback Strategy

- `git revert <commit-hash>` 即可回滚
- 删除测试文件

---

## Acceptance Criteria

### 集成到 OCR
- [ ] OCR 识别后读取 `removeLinebreaks` 和 `mergeSpaces` 设置
- [ ] 调用 `processText` 处理文本
- [ ] 设置关闭时保持原始文本

### 单元测试
- [ ] `removeLineBreaks`: 保留单换行
- [ ] `removeLineBreaks`: 保留双换行
- [ ] `removeLineBreaks`: 折叠 3+ 换行为 2 个
- [ ] `mergeSpaces`: 合并多空格
- [ ] `mergeSpaces`: 合并多制表符
- [ ] `mergeSpaces`: 合并混合空白
- [ ] `processText`: options 为 undefined 时原样返回
- [ ] `processText`: 只开启 removeLineBreaks
- [ ] `processText`: 只开启 mergeSpaces
- [ ] `processText`: 两者都开（验证顺序）

### 集成测试
- [ ] OCR 时调用 processText
- [ ] 设置读取正确
- [ ] 设置关闭时不处理

### 回归测试
- [ ] 所有现有测试通过

---

## Timeline

- **Estimated**: 1-2 hours
- **Phases**: 3 phases
- **Tasks**: 20 tasks (see tasks.md for detailed breakdown)
