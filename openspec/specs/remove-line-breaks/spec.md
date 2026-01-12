# Spec: Remove Line Breaks Feature

## Overview

CleanClip 扩展在 OCR 识别后自动清理多余的换行符和空格。

**注意**：此功能激活已有的 `text-processing.ts` 模块，而不是从头实现。

## User Story

As a 用户,
I want OCR 识别时自动清理多余的换行符和空格,
So that 我粘贴文本时不需要手动清理格式.

## Current Implementation Status

### ✅ 已实现
- `src/text-processing.ts` - 包含 `removeLineBreaks`, `mergeSpaces`, `processText` 函数
- `src/options/main.ts` - Options 页面已有 `removeLinebreaks` 和 `mergeSpaces` 复选框（默认开启）

### ❌ 缺失
- `src/background.ts` - OCR 处理后没有调用 `processText`
- `tests/text-processing.test.ts` - 没有单元测试

## Functional Requirements

### REQ-004-001: removeLineBreaks 行为

扩展 MUST 将连续 3 个或更多换行符折叠为 2 个：

**Given** OCR 识别结果包含 3+ 个连续换行符
**When** `removeLinebreaks` 设置开启
**Then** 连续换行符被折叠为 2 个

**Examples**:
- `"a\nb"` → `"a\nb"` (单换行保留)
- `"a\n\nb"` → `"a\n\nb"` (双换行保留)
- `"a\n\n\nb"` → `"a\n\nb"` (三连折叠)
- `"a\n\n\n\nb"` → `"a\n\nb"` (四连折叠)

### REQ-004-002: mergeSpaces 行为

扩展 MUST 将连续空格和制表符合并为单个空格：

**Given** OCR 识别结果包含连续空白
**When** `mergeSpaces` 设置开启
**Then** 连续空白被合并为单个空格

**Examples**:
- `"a  b"` → `"a b"` (多空格)
- `"a\t\tb"` → `"a b"` (多制表符)
- `"a \t b"` → `"a b"` (混合空白)

### REQ-004-003: processText 组合处理

扩展 MUST 按顺序应用处理：先折叠换行，再合并空格

**Given** OCR 识别结果包含换行和空格
**When** 两个设置都开启
**Then** 先调用 `removeLineBreaks`，再调用 `mergeSpaces`

**Example**:
- 输入: `"a\n\n\n  b"`
- 第1步: `"a\n\n  b"` (折叠换行)
- 第2步: `"a\n\n b"` (合并空格)
- 输出: `"a\n\n b"`

### REQ-004-004: Options 未传入时原样返回

扩展 MUST 在 options 为 undefined 时不处理文本：

**Given** OCR 识别结果
**When** `processText` 的 options 参数为 undefined
**Then** 文本保持不变

### REQ-004-005: 设置读取

扩展 MUST 从 `chrome.storage.local` 读取设置：

| Key | Type | Default |
|-----|------|---------|
| `removeLinebreaks` | boolean | true |
| `mergeSpaces` | boolean | true |

### REQ-004-006: OCR 集成

扩展 MUST 在 OCR 识别后应用文本处理：

**Given** OCR 返回识别结果
**When** 结果处理流程开始
**Then** 读取设置并调用 `processText`

### REQ-004-007: CRLF 换行符处理

扩展 MAY 不处理 `\r\n`（Windows 换行符）：

**当前行为**: `\r\n` 保持不变（只匹配 `\n`）
**如需支持**: 需更新 regex 为 `/(\r?\n){3,}/g`

## Scenarios

### Scenario 1: 保留段落分隔

**Given** OCR 识别结果为 `"Para 1\n\nPara 2"`
**And** `removeLinebreaks` 开启
**When** OCR 处理完成
**Then** 输出为 `"Para 1\n\nPara 2"`

### Scenario 2: 清理多余换行

**Given** OCR 识别结果为 `"Line 1\n\n\n\nLine 2"`
**And** `removeLinebreaks` 开启
**When** OCR 处理完成
**Then** 输出为 `"Line 1\n\nLine 2"`

### Scenario 3: 合并空格

**Given** OCR 识别结果为 `"Hello    World"`
**And** `mergeSpaces` 开启
**When** OCR 处理完成
**Then** 输出为 `"Hello World"`

### Scenario 4: 设置关闭时保持原样

**Given** OCR 识别结果
**And** 两个设置都关闭
**When** OCR 处理完成
**Then** 文本保持不变

## Test Cases

| # | Description | Input | Options | Expected Output |
|---|-------------|-------|---------|-----------------|
| 1 | 保留单换行 | `"a\nb"` | `{rLB: true, mS: false}` | `"a\nb"` |
| 2 | 保留双换行 | `"a\n\nb"` | `{rLB: true, mS: false}` | `"a\n\nb"` |
| 3 | 折叠三连 | `"a\n\n\nb"` | `{rLB: true, mS: false}` | `"a\n\nb"` |
| 4 | 折叠四连 | `"a\n\n\n\nb"` | `{rLB: true, mS: false}` | `"a\n\nb"` |
| 5 | 合并空格 | `"a  b"` | `{rLB: false, mS: true}` | `"a b"` |
| 6 | 合并制表 | `"a\t\tb"` | `{rLB: false, mS: true}` | `"a b"` |
| 7 | 两者都开 | `"a\n\n\n  b"` | `{rLB: true, mS: true}` | `"a\n\n b"` |
| 8 | options 空 | `"a\n\n\nb"` | `undefined` | `"a\n\n\nb"` |
| 9 | 两者都关 | `"a\n\n\n  b"` | `{rLB: false, mS: false}` | `"a\n\n\n  b"` |

*(rLB = removeLineBreaks, mS = mergeSpaces)*

## Edge Cases

- 空字符串 → 返回空字符串
- 纯换行符 `"\n\n\n"` → `"\n\n"`
- 纯空白 `" \t\t "` → `" "`
