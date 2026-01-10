# CleanClip 本地测试指南

## 🚀 快速开始

### 1. 构建扩展

```bash
cd /Users/frank/Projects/CleanClip
npm install
npm run build
```

构建完成后，`dist/` 目录包含扩展文件。

---

## 📦 在 Chrome 中加载扩展

### 步骤 1: 打开 Chrome 扩展管理页面

在 Chrome 地址栏输入：
```
chrome://extensions/
```

或者通过菜单：
- Chrome 菜单 → 更多工具 → 扩展程序

### 步骤 2: 启用开发者模式

点击右上角的 **"开发者模式"** 开关

### 步骤 3: 加载已解压的扩展程序

1. 点击 **"加载已解压的扩展程序"** 按钮
2. 选择项目目录：`/Users/frank/Projects/CleanClip/dist`
3. 点击"选择"

✅ CleanClip 扩展现在已加载！

---

## 🔑 配置 Gemini API Key

### 获取 API Key

1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 登录 Google 账号
3. 点击 "Create API Key"
4. 复制生成的 API Key

### 在扩展中配置

1. 在 Chrome 扩展管理页面找到 CleanClip
2. 点击 **"详细信息"**
3. 点击 **"扩展程序选项"**
4. 在 API Key 输入框中粘贴你的 Key
5. 点击 **"保存"**
6. ✅ 会显示 "设置已保存！"

> ⚠️ **安全提示**: API Key 存储在浏览器本地存储中，请勿泄露

---

## 🧪 测试功能

### 功能 1: 右键图片 OCR

1. 打开任意包含图片的网页
2. **右键点击**任意图片
3. 选择 **"CleanClip: Recognize Text"**
4. 等待 OCR 处理完成
5. ✅ 文本已自动复制到剪贴板！
6. 粘贴 (Cmd+V) 查看结果

### 功能 2: 区域截图 OCR

1. 按快捷键 **`Cmd + Shift + C`**
2. 半透明遮罩层出现
3. **拖拽鼠标**选择要识别的区域
4. 释放鼠标，OCR 自动处理
5. ✅ 文本已自动复制到剪贴板！

### 功能 3: 历史记录面板

1. 在扩展管理页面点击 CleanClip 图标
2. 或点击扩展工具栏的 CleanClip 图标
3. 查看所有 OCR 历史记录
4. 每条记录可以：
   - 📋 **复制** - 点击复制按钮
   - 🗑️ **删除** - 点击删除按钮

### 功能 4: 设置页面

1. 打开扩展程序选项（见上方配置步骤）
2. 可配置项：
   - **输出格式**: Plain Text（纯文本）或 Markdown
   - **文本处理**:
     - ☑️ 移除多余换行
     - ☑️ 合并连续空格

---

## 🐛 调试技巧

### 查看后台脚本日志

1. 打开 `chrome://extensions/`
2. 找到 CleanClip 扩展
3. 点击 **"检查视图: service worker"**
4. 在 DevTools 中查看 Console 日志

### 常见问题

**Q: OCR 失败，显示 "API Key Missing"**
- A: 请先在设置中配置 Gemini API Key

**Q: 区域截图没反应**
- A: 确保在网页标签页中使用，不能在 chrome:// 页面使用

**Q: 右键菜单看不到 CleanClip 选项**
- A: 确保右键点击的是图片，不是其他元素

**Q: OCR 结果不准确**
- A: 这是 Gemini 2.0 Flash 的限制，可以尝试：
  - 使用更清晰的图片
  - 切换到 Markdown 格式保留结构

---

## 🔄 开发模式 (热更新)

如果你需要修改代码并实时更新：

### 启动开发服务器

```bash
npm run dev
```

### 在 Chrome 中启用自动刷新

1. 在 `chrome://extensions/` 页面
2. 找到 CleanClip
3. 点击 **"刷新"** 图标 (🔄)

每次代码修改后：
1. Vite 会自动重新构建
2. 在扩展页面点击刷新图标
3. 重新加载测试页面

---

## 📊 运行测试

### 单元测试

```bash
npm test
```

### E2E 测试 (需要 API Key)

```bash
# 1. 创建 .env 文件
echo "GEMINI_API_KEY=your_key_here" > .env

# 2. 运行 E2E 测试
npm run test:e2e
```

---

## 🗑️ 卸载扩展

1. 打开 `chrome://extensions/`
2. 找到 CleanClip
3. 点击 **"移除"**
4. 确认删除

> 注意：这只会删除扩展，**不会删除**你的设置和历史记录（存储在浏览器中）

---

## 📝 已知限制

1. **区域截图**: 只能截取当前可见的标签页区域
2. **跨域图片**: 右键 OCR 可能失败（CORS 限制），会自动降级到截图模式
3. **API 费用**: Gemini 2.0 Flash 很便宜，但请注意使用量
4. **隐私**: OCR 请求发送到 Google 服务器

---

## 🎯 下一步

- 查看 [README.md](./README.md) 了解完整功能
- 查看 [openspec/changes/001-prototype/](./openspec/changes/001-prototype/) 了解技术细节
- 提交 Issue 反馈问题

---

**享受 CleanClip 带来的高效复制体验！** 🎉
