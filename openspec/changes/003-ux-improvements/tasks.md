# Tasks: 003-ux-improvements

## Phase 0: 准备工作

目标: 创建 feature 分支和测试基础

- [ ] 0.1 创建 feature-003-ux-improvements 分支
  - `git checkout -b feature-003-ux-improvements`

- [ ] 0.2 创建 tests/detail.test.ts 测试文件
  - 文件创建，包含 `// @vitest-environment happy-dom`

- [ ] 0.3 运行测试确认框架正常
  - `npm test tests/detail.test.ts` 无配置错误

---

## Phase 1: Copy 按钮功能

目标: 实现 Copy 按钮复制文本到剪贴板并显示通知

参考 Spec: `specs/detail-copy-button/spec.md`

- [ ] 1.1 编写测试: 验证 setupCopyButton 函数存在
  - 预期失败: "setupCopyButton is not defined"

- [ ] 1.2 运行测试确认失败
  - 看到预期失败信息

- [ ] 1.3 实现 setupCopyButton 函数（空函数）
  - 测试通过（函数存在）

- [ ] 1.4 编写测试: 验证点击按钮调用 clipboard.writeText
  - 预期失败: clipboard 未被调用

- [ ] 1.5 运行测试确认失败
  - 看到 `mockClipboard.writeText` 未被调用

- [ ] 1.6 实现剪贴板写入逻辑
  - 测试通过，writeText 被调用

- [ ] 1.7 编写测试: 验证成功后调用 showNotification
  - 预期失败: 通知未显示

- [ ] 1.8 运行测试确认失败
  - 通知未创建

- [ ] 1.9 实现成功通知逻辑
  - 测试通过，showNotification 被调用

- [ ] 1.10 在 init() 中调用 setupCopyButton
  - 测试通过

- [ ] 1.11 编写测试: 验证剪贴板错误时显示错误通知
  - 预期失败: 错误处理未实现

- [ ] 1.12 运行测试确认失败
  - 错误时无通知

- [ ] 1.13 实现错误处理逻辑
  - 测试通过，错误时显示 "Failed to copy text"

- [ ] 1.14 运行回归测试
  - 所有测试通过

- [ ] 1.15 Commit
  - `git commit -m "feat: add copy button functionality with notification"`

---

## Phase 2: 截图成功通知

目标: 在 background.ts 中添加截图成功后的通知

参考 Spec: `specs/progress-notifications/spec.md` - REQ-003-010

- [ ] 2.1 编写测试: 验证截图成功后创建通知
  - 预期失败: notifications.create 未被调用

- [ ] 2.2 运行测试确认失败
  - 看到预期失败

- [ ] 2.3 在 captureVisibleTab 成功后添加通知调用
  - 测试通过

- [ ] 2.4 创建 showSuccessNotification 辅助函数
  - 代码复用，测试通过

- [ ] 2.5 编写测试: 验证通知包含正确的消息
  - 预期失败: 消息内容不正确

- [ ] 2.6 运行测试确认失败
  - 消息不是 "Screenshot captured! Sending to AI..."

- [ ] 2.7 实现正确的通知消息
  - 测试通过

- [ ] 2.8 运行回归测试
  - 所有测试通过

- [ ] 2.9 Commit
  - `git commit -m "feat: add screenshot success notification"`

---

## Phase 3: OCR 完成通知

目标: 在 OCR 完成后显示通知

参考 Spec: `specs/progress-notifications/spec.md` - REQ-003-011

- [ ] 3.1 编写测试: 验证 OCR 完成后创建通知
  - 预期失败

- [ ] 3.2 运行测试确认失败
  - 看到预期失败

- [ ] 3.3 在 writeToClipboardViaOffscreen 成功后添加通知
  - 测试通过

- [ ] 3.4 编写测试: 验证通知消息包含 "clipboard"
  - 预期失败: 消息不正确

- [ ] 3.5 运行测试确认失败
  - 消息不是 "OCR complete! Result copied to clipboard"

- [ ] 3.6 实现正确的通知消息
  - 测试通过

- [ ] 3.7 运行回归测试
  - 所有测试通过

- [ ] 3.8 Commit
  - `git commit -m "feat: add OCR completion notification"`

---

## Phase 4: 三栏布局重构

目标: 将详情页改为三栏布局（导航 + 文本 + 截图）

参考 Spec: `specs/history-navigation/spec.md` - REQ-003-024

- [ ] 4.1 修改 HTML: 添加 data-history-nav 容器
  - DOM 结构更新

- [ ] 4.2 修改 HTML: 将 left-section 改为 right-section
  - 截图容器移到右侧

- [ ] 4.3 修改 HTML: 创建 data-middle-section 包含文本和按钮
  - 文本和按钮居中

- [ ] 4.4 更新 CSS: 三栏 flex 布局
  - 布局正确显示

- [ ] 4.5 更新 CSS: 历史导航 180px 宽度
  - 导航栏宽度正确

- [ ] 4.6 更新 CSS: 历史项样式（悬停、激活）
  - 样式正确

- [ ] 4.7 更新 CSS: 中间栏和右栏 flex: 1
  - 两栏平均分配剩余空间

- [ ] 4.8 运行回归测试
  - 所有测试通过

- [ ] 4.9 Commit
  - `git commit -m "refactor: update detail page to three-column layout"`

---

## Phase 5: 历史导航渲染

目标: 实现历史导航列表渲染和当前项高亮

参考 Spec: `specs/history-navigation/spec.md` - REQ-003-020, REQ-003-021, REQ-003-022

- [ ] 5.1 编写测试: 验证历史列表渲染
  - 预期失败: 列表未渲染

- [ ] 5.2 运行测试确认失败
  - 看到预期失败

- [ ] 5.3 实现 formatTimestamp 函数
  - 时间格式化正确（"Just now", "5m ago", "2h ago"）

- [ ] 5.4 编写测试: 验证 formatTimestamp 边界情况
  - 预期失败: 边界情况未处理

- [ ] 5.5 运行测试确认失败
  - 边界情况处理不正确

- [ ] 5.6 完善时间格式化逻辑
  - 测试通过

- [ ] 5.7 实现 renderHistoryNavigation 函数
  - 测试通过，列表渲染

- [ ] 5.8 编写测试: 验证当前项高亮
  - 预期失败: 无高亮

- [ ] 5.9 运行测试确认失败
  - 看到预期失败

- [ ] 5.10 实现当前项高亮逻辑（基于 URL 参数）
  - 测试通过，.active 类正确

- [ ] 5.11 在 init() 中调用 renderHistoryNavigation
  - 页面加载时渲染

- [ ] 5.12 运行回归测试
  - 所有测试通过

- [ ] 5.13 Commit
  - `git commit -m "feat: add history navigation sidebar with current item highlight"`

---

## Phase 6: 动态内容切换

目标: 点击历史项时无刷新更新内容

参考 Spec: `specs/history-navigation/spec.md` - REQ-003-023

- [ ] 6.1 编写测试: 验证点击历史项更新内容
  - 预期失败: 内容未更新

- [ ] 6.2 运行测试确认失败
  - 内容未更新

- [ ] 6.3 实现 loadHistoryItemDynamic 函数
  - 测试通过

- [ ] 6.4 更新 URL (pushState) 无刷新
  - URL 更新

- [ ] 6.5 更新导航栏激活状态
  - 高亮正确切换

- [ ] 6.6 绑定点击事件到历史项
  - 点击触发更新

- [ ] 6.7 编写测试: 验证浏览器历史记录
  - 预期失败: pushState 未被调用

- [ ] 6.8 运行测试确认失败
  - pushState 未被调用

- [ ] 6.9 验证 pushState 被正确调用
  - 测试通过

- [ ] 6.10 运行回归测试
  - 所有测试通过

- [ ] 6.11 Commit
  - `git commit -m "feat: add dynamic content switching for history navigation"`

---

## Phase 7: Markdown 解析器修复 - XSS 安全优先

目标: 修复 XSS 安全漏洞，然后添加新语法支持

参考 Spec: `specs/markdown-preview/spec.md` - **REQ-003-035 (Critical)**

### Phase 7.1: XSS 安全修复（Critical）

- [ ] 7.1.1 编写测试: HTML 标签被转义
  - 输入: `<script>alert('XSS')</script>`
  - 预期: `&lt;script&gt;alert('XSS')&lt;/script&gt;`
  - 预期失败: HTML 未被转义

- [ ] 7.1.2 运行测试确认失败
  - XSS 漏洞存在

- [ ] 7.1.3 实现 escapeHtml 函数
  - 转义 &, <, >, ", '

- [ ] 7.1.4 修改 simpleMarkdownParse 先转义 HTML
  - 所有 markdown 处理前先转义

- [ ] 7.1.5 编写测试: img 标签 onerror 事件被转义
  - 输入: `<img src=x onerror=alert(1)>`
  - 预期: 全部转义

- [ ] 7.1.6 运行测试确认通过
  - XSS 被阻止

- [ ] 7.1.7 编写测试: javascript: 链接被过滤
  - 输入: `[click](javascript:alert(1))`
  - 预期: 渲染为纯文本，不是链接

- [ ] 7.1.8 运行测试确认失败
  - javascript: 链接未被过滤

- [ ] 7.1.9 实现链接过滤逻辑
  - 过滤 javascript:, data:, vbscript: 等危险协议

- [ ] 7.1.10 运行测试确认通过
  - 危险链接被过滤

- [ ] 7.1.11 编写测试: 链接包含 rel="noopener noreferrer"
  - 输入: `[text](https://example.com)`
  - 预期: `<a href="https://example.com" rel="noopener noreferrer" target="_blank">`

- [ ] 7.1.12 运行测试确认失败
  - 安全属性缺失

- [ ] 7.1.13 实现链接安全属性
  - 添加 rel 和 target

- [ ] 7.1.14 运行回归测试
  - 所有 XSS 测试通过

- [ ] 7.1.15 Commit
  - `git commit -m "security: fix XSS vulnerabilities in markdown parser"`

### Phase 7.2: 添加新语法支持

- [ ] 7.2.1 编写测试: 列表语法解析
  - 预期失败

- [ ] 7.2.2 编写测试: 链接语法解析
  - 预期失败

- [ ] 7.2.3 编写测试: 代码块换行不转 br
  - 预期失败

- [ ] 7.2.4 编写测试: 引用语块解析
  - 预期失败

- [ ] 7.2.5 编写测试: 分隔线解析
  - 预期失败

- [ ] 7.2.6 运行所有新测试确认失败
  - 所有新测试失败

- [ ] 7.2.7 扩展 simpleMarkdownParse 函数
  - 保持 XSS 安全，添加新语法支持
  - 保护代码块不被处理
  - 实现列表、链接、引用、分隔线

- [ ] 7.2.8 运行测试确认通过
  - 所有测试通过

- [ ] 7.2.9 导出 simpleMarkdownParse 用于测试
  - 测试可访问

- [ ] 7.2.10 运行完整回归测试
  - 所有测试通过（包括 XSS）

- [ ] 7.2.11 Commit
  - `git commit -m "feat: improve markdown parser with lists, links, blockquotes (XSS safe)"`

---

## Phase 8: 版本发布

目标: 版本升级和最终验证

- [ ] 8.1 更新 package.json 版本到 0.6.0
  - `"version": "0.6.0"`

- [ ] 8.2 更新 public/manifest.json 版本到 0.6.0
  - `"version": "0.6.0"`

- [ ] 8.3 运行 npm run build
  - 构建成功，无错误

- [ ] 8.4 验证 dist/manifest.json 版本
  - 版本为 0.6.0

- [ ] 8.5 运行完整测试套件
  - 所有测试通过

- [ ] 8.6 手动测试: 加载扩展验证功能
  - 所有新功能正常

- [ ] 8.7 手动测试: XSS 安全验证
  - 尝试 XSS 攻击被阻止

- [ ] 8.8 Commit
  - `git commit -m "chore: bump version to 0.6.0"`

---

## Phase 9: 合并到主分支

目标: 合并并清理

- [ ] 9.1 切换到 main 分支
  - `git checkout main`

- [ ] 9.2 拇取最新代码
  - `git pull origin main`

- [ ] 9.3 合并 feature 分支
  - `git merge feature-003-ux-improvements`

- [ ] 9.4 推送到远程
  - `git push origin main`

- [ ] 9.5 删除 feature 分支
  - `git branch -d feature-003-ux-improvements`

---

## Summary

- **总计**: 9 个 Phase, 约 70 个 Tasks
- **优先级顺序**:
  1. Copy 按钮功能
  2. 进度通知（截图 + OCR）
  3. 历史导航侧边栏
  4. 三栏布局
  5. **Markdown XSS 安全修复（Critical）**
  6. Markdown 新语法支持
- **预计时间**: 3-4 小时
- **版本**: 0.5.4 → 0.6.0

## 安全提醒

**Phase 7.1 是 Critical 安全修复，必须在添加任何新 markdown 功能前完成！**

XSS 测试向量（必须全部通过）:
- `<script>alert('XSS')</script>` → 转义
- `<img src=x onerror=alert(1)>` → 转义
- `[click](javascript:alert(1))` → 过滤
- `![x](x "onmouseover=alert(1)")` → 移除事件处理器
- 所有外部链接 → `rel="noopener noreferrer"`
