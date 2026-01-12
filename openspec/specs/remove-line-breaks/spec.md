# Spec: Remove Line Breaks Feature

## Overview

CleanClip 扩展允许用户在 OCR 识别后自动删除不必要的换行符。

## User Story

As a 用户,
I want OCR 识别时自动删除换行符,
So that 我粘贴文本时不需要手动删除多余的换行.

## Functional Requirements

### REQ-004-001: Options 开关

扩展 MUST 在 Options 页面提供"删除换行符"开关：

**Given** 用户打开 Options 页面
**When** 页面加载完成
**Then** 显示一个复选框，标签为"删除换行符"
**And** 复选框默认为选中状态

### REQ-004-002: 设置持久化

扩展 MUST 将开关状态保存到 chrome.storage.local：

**Given** 用户改变"删除换行符"开关状态
**When** 状态改变
**Then** 设置保存到 `cleanclip-remove-line-breaks` key
**And** 刷新页面后设置保持

### REQ-004-003: 默认值

扩展 MUST 默认开启删除换行符功能：

**Given** 用户首次安装扩展或清除设置
**When** Options 页面加载
**Then** "删除换行符"开关默认为选中
**And** OCR 处理时默认删除换行符

### REQ-004-004: 单个换行符删除

扩展 MUST 删除单个换行符：

**Given** OCR 识别结果包含单个换行符 `\n`
**When** "删除换行符"开关开启
**Then** 单个换行符被替换为空格
**Example**:
- 输入: `"Hello\nWorld"`
- 输出: `"Hello World"`

### REQ-004-005: 双换行符保留

扩展 MUST 保留双换行符作为段落分隔：

**Given** OCR 识别结果包含双换行符 `\n\n`
**When** "删除换行符"开关开启
**Then** 双换行符保持不变
**Example**:
- 输入: `"Paragraph 1\n\nParagraph 2"`
- 输出: `"Paragraph 1\n\nParagraph 2"`

### REQ-004-006: 开关关闭时保留原文本

扩展 MUST 在开关关闭时保留原始文本：

**Given** OCR 识别结果包含换行符
**When** "删除换行符"开关关闭
**Then** 文本保持不变
**Example**:
- 输入: `"Line 1\nLine 2"`
- 输出: `"Line 1\nLine 2"`（保持原样）

## Non-Functional Requirements

### NFR-004-001: 性能

换行符删除操作 MUST 在 100ms 内完成（10k 字符文本）。

### NFR-004-002: 可用性

设置变更 MUST 立即生效，无需重启扩展。

## Scenarios

### Scenario 1: 删除单个换行符

**Given** OCR 识别结果为 `"Hello\nWorld"`
**And** "删除换行符"开关开启
**When** OCR 处理完成
**Then** 输出为 `"Hello World"`

### Scenario 2: 保留段落分隔

**Given** OCR 识别结果为 `"Para 1\n\nPara 2\n\nPara 3"`
**And** "删除换行符"开关开启
**When** OCR 处理完成
**Then** 输出为 `"Para 1\n\nPara 2\n\nPara 3"`

### Scenario 3: 混合换行符处理

**Given** OCR 识别结果为 `"Line 1\nLine 2\n\nLine 3\nLine 4"`
**And** "删除换行符"开关开启
**When** OCR 处理完成
**Then** 输出为 `"Line 1 Line 2\n\nLine 3 Line 4"`

### Scenario 4: 开关关闭

**Given** OCR 识别结果为 `"Line 1\nLine 2"`
**And** "删除换行符"开关关闭
**When** OCR 处理完成
**Then** 输出为 `"Line 1\nLine 2"`

## Test Cases

| # | Description | Input | Expected Output | Setting |
|---|-------------|-------|-----------------|---------|
| 1 | 单个换行符 | `"Hello\nWorld"` | `"Hello World"` | On |
| 2 | 双换行符 | `"A\n\nB"` | `"A\n\nB"` | On |
| 3 | 混合换行 | `"L1\nL2\n\nL3"` | `"L1 L2\n\nL3"` | On |
| 4 | 空字符串 | `""` | `""` | On |
| 5 | 纯换行 | `"\n\n"` | `""` | On |
| 6 | 设置关闭 | `"Hello\nWorld"` | `"Hello\nWorld"` | Off |

## Edge Cases

- 空字符串 → 返回空字符串
- 纯换行符 → 返回空字符串
- 多个连续换行符 → 偶数保留为双换行，奇数最后一个变空格
- Windows 换行 `\r\n` → 统一处理为 `\n`
