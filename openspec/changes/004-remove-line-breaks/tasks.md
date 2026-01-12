# Tasks: 004-remove-line-breaks

## Phase 0: 创建 feature 分支
目标: 创建独立分支开发

- [x] 0.1 创建 feature 分支
  - `git checkout -b feature-004-remove-line-breaks`
  - 基于 main 分支

- [x] 0.2 确认分支状态
  - `git status` 确保工作区干净

---

## Phase 1: 单元测试 removeLineBreaks（基于现有实现）
目标: 只折叠 3+ 连续换行，保留单/双换行

### TDD Cycle
- [ ] 1.1 编写测试: 单换行保留
  - **输入**: "hello\nworld"
  - **预期输出**: "hello\nworld"
  - **Red**: 测试失败

- [ ] 1.2 编写测试: 双换行保留
  - **输入**: "para1\n\npara2"
  - **预期输出**: "para1\n\npara2"
  - **Red**: 测试失败

- [ ] 1.3 编写测试: 三连换行折叠为双换行
  - **输入**: "para1\n\n\npara2"
  - **预期输出**: "para1\n\npara2"
  - **Red**: 测试失败

- [ ] 1.4 编写测试: 四连及以上折叠为双换行
  - **输入**: "a\n\n\n\nb"
  - **预期输出**: "a\n\nb"
  - **Red**: 测试失败

- [ ] 1.5 编写测试: 混合场景
  - **输入**: "line1\n\n\nline2\n\nline3"
  - **预期输出**: "line1\n\nline2\n\nline3"
  - **Red**: 测试失败

- [ ] 1.6 编写测试: 空字符串
  - **输入**: ""
  - **预期输出**: ""
  - **Red**: 测试失败

- [ ] 1.7 运行测试确认失败
  - **Red**: 看到预期失败信息

- [ ] 1.8 验证实现（函数已存在）
  - `src/text-processing.ts` 中 `removeLineBreaks` 函数已实现
  - **Green**: 测试通过

- [ ] 1.9 运行完整测试
  - 所有测试通过

- [ ] 1.10 Commit
  - `git commit -m "test: add removeLineBreaks unit tests"`

---

## Phase 2: 单元测试 mergeSpaces（基于现有实现）
目标: 合并连续空格/制表符

### TDD Cycle
- [ ] 2.1 编写测试: 连续空格合并
  - **输入**: "a  b"
  - **预期输出**: "a b"
  - **Red**: 测试失败

- [ ] 2.2 编写测试: 连续制表符合并
  - **输入**: "a\t\tb"
  - **预期输出**: "a b"
  - **Red**: 测试失败

- [ ] 2.3 编写测试: 混合空格与制表符合并
  - **输入**: "a \t b"
  - **预期输出**: "a b"
  - **Red**: 测试失败

- [ ] 2.4 编写测试: 空字符串
  - **输入**: ""
  - **预期输出**: ""
  - **Red**: 测试失败

- [ ] 2.5 运行测试确认失败
  - **Red**: 看到预期失败信息

- [ ] 2.6 验证实现（函数已存在）
  - `src/text-processing.ts` 中 `mergeSpaces` 函数已实现
  - **Green**: 测试通过

- [ ] 2.7 运行完整测试
  - 所有测试通过

- [ ] 2.8 Commit
  - `git commit -m "test: add mergeSpaces unit tests"`

---

## Phase 3: 单元测试 processText（组合处理 + 选项控制）
目标: 验证选项控制与处理顺序

### TDD Cycle
- [ ] 3.1 编写测试: options 未传入时原样返回
  - **输入**: "a\n\n\nb"
  - **预期输出**: "a\n\n\nb"
  - **Red**: 测试失败

- [ ] 3.2 编写测试: 仅 removeLineBreaks 生效
  - **输入**: "a\n\n\nb"
  - **预期输出**: "a\n\nb"
  - **Red**: 测试失败

- [ ] 3.3 编写测试: 仅 mergeSpaces 生效
  - **输入**: "a  b\t\tc"
  - **预期输出**: "a b c"
  - **Red**: 测试失败

- [ ] 3.4 编写测试: 两者同时生效
  - **输入**: "a\n\n\nb  c\t\t"
  - **预期输出**: "a\n\nb c"
  - **Red**: 测试失败

- [ ] 3.5 运行测试确认失败
  - **Red**: 看到预期失败信息

- [ ] 3.6 验证实现（函数已存在）
  - `src/text-processing.ts` 中 `processText` 函数已实现
  - **Green**: 测试通过

- [ ] 3.7 运行完整测试
  - 所有测试通过

- [ ] 3.8 Commit
  - `git commit -m "test: add processText unit tests"`

---

## Phase 4: 集成到 OCR 流程（读取现有设置）
目标: Options 已有 UI，仅需在 OCR 流程读取并应用处理

### TDD Cycle
- [x] 4.1 编写测试: OCR 时读取设置（键名为 camel case）
  - 模拟 `chrome.storage.local.get` 返回 `{ removeLinebreaks, mergeSpaces }`
  - **Red**: 测试失败

- [x] 4.2 实现: 在 `src/background.ts` 读取设置
  - 使用现有 key: `removeLinebreaks` / `mergeSpaces`
  - **Green**: 测试通过

- [ ] 4.3 编写测试: 根据设置调用 `processText`
  - **Red**: 测试失败

- [ ] 4.4 实现: OCR 结果进入 `processText`
  - 仅在 outputFormat 为 `text` 时应用
  - **Green**: 测试通过

- [ ] 4.5 编写测试: 关闭选项时不处理
  - **Red**: 测试失败

- [ ] 4.6 实现: 条件判断
  - **Green**: 测试通过

- [ ] 4.7 运行回归测试
  - 所有测试通过

- [ ] 4.8 Commit
  - `git commit -m "feat: apply text processing in OCR pipeline"`

---

## Phase 5: 版本发布
目标: 发布新版本

- [ ] 5.1 更新 `package.json` 版本: 0.6.4 → 0.7.0
- [ ] 5.2 更新 `public/manifest.json` 版本: 0.6.4 → 0.7.0
- [ ] 5.3 运行 `npm run build`
- [ ] 5.4 运行 `npm test` 确保所有测试通过
- [ ] 5.5 Commit
  - `git commit -m "chore: bump version to 0.7.0"`

- [ ] 5.6 手动测试: 重新加载扩展，测试完整流程
  - 打开 Options 页面，确认开关存在且默认开启
  - 截图 OCR，确认 3+ 换行被折叠为双换行
  - 关闭 Remove line breaks / Merge spaces，确认处理逻辑不生效

---

## Summary

- **Total Phases**: 6 (包括 Phase 0)
- **Total Tasks**: 38
- **Estimated Time**: 1-2 hours
- **Branch**: feature-004-remove-line-breaks
