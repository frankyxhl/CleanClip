# Tasks: 004-remove-line-breaks

## Phase 1: 创建换行符删除功能测试
目标: 先写测试验证换行符删除逻辑

### TDD Cycle
- [ ] 1.1 编写测试: 单个换行符被删除
  - **输入**: `"hello\nworld"`
  - **预期输出**: `"hello world"`
  - **Red**: 测试失败

- [ ] 1.2 编写测试: 双换行符保留
  - **输入**: `"para1\n\npara2"`
  - **预期输出**: `"para1\n\npara2"`
  - **Red**: 测试失败

- [ ] 1.3 编写测试: 空字符串处理
  - **输入**: `""`
  - **预期输出**: `""`
  - **Red**: 测试失败

- [ ] 1.4 编写测试: 纯换行符返回空
  - **输入**: `"\n\n\n"`
  - **预期输出**: `""`
  - **Red**: 测试失败

- [ ] 1.5 编写测试: 混合换行符
  - **输入**: `"line1\nline2\n\nline3\nline4"`
  - **预期输出**: `"line1 line2\n\nline3 line4"`
  - **Red**: 测试失败

- [ ] 1.6 运行测试确认失败
  - **Red**: 看到预期失败信息

## Phase 2: 实现换行符删除逻辑
目标: 实现核心功能

- [ ] 2.1 创建 `src/utils/lineBreaks.ts`
- [ ] 2.2 实现 `removeLineBreaks(text: string): string` 函数
  - **Green**: 所有 Phase 1 测试通过
- [ ] 2.3 运行回归测试
  - **验证**: 无测试被破坏
- [ ] 2.4 Commit: "feat: add line break removal function"

## Phase 3: Options 页面添加开关
目标: 添加设置 UI

### TDD Cycle
- [ ] 3.1 编写测试: 验证开关渲染
  - **Red**: 测试失败

- [ ] 3.2 实现: 在 `src/options/index.html` 添加复选框
  ```html
  <label class="option-item">
    <input type="checkbox" id="remove-line-breaks">
    <span>删除换行符</span>
  </label>
  ```
  - **Green**: 测试通过

- [ ] 3.3 编写测试: 验证设置保存到 storage
  - **Red**: 测试失败

- [ ] 3.4 实现: 在 `src/options/main.ts` 添加保存逻辑
  ```typescript
  const checkbox = document.getElementById('remove-line-breaks') as HTMLInputElement
  checkbox.addEventListener('change', async () => {
    await chrome.storage.local.set({
      'cleanclip-remove-line-breaks': checkbox.checked
    })
  })
  ```
  - **Green**: 测试通过

- [ ] 3.5 编写测试: 验证设置加载
  - **Red**: 测试失败

- [ ] 3.6 实现: 在 `src/options/main.ts` 添加加载逻辑
  ```typescript
  // Load saved setting
  const result = await chrome.storage.local.get('cleanclip-remove-line-breaks')
  const savedValue = result['cleanclip-remove-line-breaks']
  checkbox.checked = savedValue !== undefined ? savedValue : true // Default: true
  ```
  - **Green**: 测试通过

- [ ] 3.7 编写测试: 验证默认值为 true
  - **Red**: 测试失败

- [ ] 3.8 实现: 设置默认值
  - **Green**: 测试通过

- [ ] 3.9 运行回归测试
- [ ] 3.10 Commit: "feat: add remove line breaks option"

## Phase 4: 集成到 OCR 处理
目标: 在 OCR 时使用设置

### TDD Cycle
- [ ] 4.1 编写测试: OCR 时读取设置
  - 模拟 `chrome.storage.local.get`
  - **Red**: 测试失败

- [ ] 4.2 实现: 在 `src/background.ts` 添加读取设置函数
  ```typescript
  async function shouldRemoveLineBreaks(): Promise<boolean> {
    const result = await chrome.storage.local.get('cleanclip-remove-line-breaks')
    return result['cleanclip-remove-line-breaks'] !== false // Default: true
  }
  ```
  - **Green**: 测试通过

- [ ] 4.3 编写测试: 根据设置处理文本
  - **Red**: 测试失败

- [ ] 4.4 实现: 在 OCR 处理中调用 `removeLineBreaks`
  ```typescript
  // After OCR recognition
  let text = result.text
  if (await shouldRemoveLineBreaks()) {
    text = removeLineBreaks(text)
    console.log('[OCR] Line breaks removed')
  }
  ```
  - **Green**: 测试通过

- [ ] 4.5 编写测试: 设置关闭时不处理
  - **Red**: 测试失败

- [ ] 4.6 实现: 条件判断
  - **Green**: 测试通过

- [ ] 4.7 运行回归测试
- [ ] 4.8 Commit: "feat: integrate line break removal in OCR"

## Phase 5: 版本发布
目标: 发布新版本

- [ ] 5.1 更新 `package.json` 版本: 0.6.4 → 0.7.0
- [ ] 5.2 更新 `public/manifest.json` 版本: 0.6.4 → 0.7.0
- [ ] 5.3 运行 `npm run build`
- [ ] 5.4 运行 `npm test` 确保所有测试通过
- [ ] 5.5 Commit: "chore: bump version to 0.7.0"
- [ ] 5.6 手动测试: 重新加载扩展，测试完整流程
  - 打开 Options 页面，确认开关存在且默认开启
  - 截图 OCR，确认换行符被删除
  - 关闭开关，截图 OCR，确认换行符保留

---

## Summary

- **Total Phases**: 5
- **Total Tasks**: 30
- **Estimated Time**: 2-3 hours
