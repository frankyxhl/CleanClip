# CleanClip MVP – Product Requirements Document

## 1. 产品背景

在 AI 时代，用户获取信息的方式越来越“视觉化”（截图、PDF、网页、图片），  
但粘贴到实际工作场景（写邮件、做笔记、写文章、做表格）时，  
仍然高度依赖原始、脆弱的复制粘贴行为。

CleanClip 的目标是：
**把“截图复制”升级为“智能粘贴”。**

---

## 2. MVP 产品定义

**CleanClip 是一个 Chrome 插件，用于：**
- 从网页或屏幕中截图复制内容
- 使用 OCR + AI 理解内容结构
- 在粘贴时，根据目标网站自动输出最合适的格式

---

## 3. 核心用户

### 主要用户（MVP）
- 知识工作者
- 内容创作者
- 学生 / 研究人员
- 重度使用 Gmail / Notion / Medium / Google Docs / Sheets 的用户

### 非目标用户（MVP）
- 纯桌面办公（Excel / Word 桌面）
- 移动端用户
- 企业级自动化用户

---

## 4. 核心使用流程（MVP）

1. 用户在浏览器中触发 CleanClip（按钮或快捷键）
2. 选择截图区域（Snip-like UX）
3. CleanClip 对截图进行：
   - OCR
   - 基础清理
   - 结构识别（段落 / 列表 / 表格 / 公式）
4. 用户在任意网页编辑器中粘贴
5. CleanClip 根据当前网站自动选择粘贴格式

---

## 5. 核心功能（Must Have）

### 5.1 截图复制（Copy）

- 区域截图
- 可见区域截图
- 截图即进入处理流程（无需另存）

---

### 5.2 基础文本清理（Baseline）

必须至少达到现有工具（如 Copy Plain Text）的能力：
- 去除 HTML / 样式
- 规范换行
- 去除多余空格
- 保证可预测的纯文本输出

---

### 5.3 AI 内容理解

- OCR（英文优先，其他语言可后置）
- 识别：
  - 段落
  - 列表
  - 表格
  - 数学公式（基础 LaTeX）

---

### 5.4 Target-Aware Smart Paste（核心差异）

CleanClip 在粘贴时必须检测当前网站，并自动选择输出格式。

#### MVP 需支持的网站与行为：

| 网站 | 粘贴格式 |
|----|--------|
| Gmail | Rich Text (HTML) |
| Google Docs | Structured text |
| Google Sheets | Table (TSV) |
| Notion Web | Markdown |
| Medium | Clean HTML |
| Slack Web | Markdown |
| 其他网站 | Smart Plain Text |

---

### 5.5 手动兜底（但不打断）

- 提供一个轻量方式（如二次点击 / 子菜单）让用户：
  - 手动选择粘贴类型（Markdown / Table / Image）
- **默认路径必须零配置**

---

## 6. 非目标（Non-Goals）

- 不支持桌面 App 粘贴
- 不支持复杂模板系统
- 不支持多账号 / 多设备
- 不追求 OCR 极致准确率
- 不保证 100% 语义正确

---

## 7. 成功指标（MVP）

### 第一阶段成功定义：
- 有至少 1 个非团队成员在 GitHub 提交 Issue（Bug 或需求）

### 次级信号：
- Issue 被回复后，用户继续互动
- 同一用户提交第二个 Issue

---

## 8. 风险与假设

- OCR 质量不足 → 提供 image fallback
- 不同网站编辑器差异 → 优先支持主流
- 用户不理解价值 → 必须通过 Demo 展示

---

## 9. MVP 之后的方向（不实现，仅记录）

- macOS Native 版本
- 桌面 App 粘贴
- 更复杂的模板 / Profile
- 团队 / 企业模式

