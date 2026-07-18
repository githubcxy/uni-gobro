# 🔧 云函数依赖包说明

## auth_login 云函数依赖

### 1. 需要安装的包
- `@cloudbase/node-sdk` - TCB Node.js SDK

### 2. package.json 配置
```json
{
  "name": "auth_login",
  "version": "1.0.0",
  "description": "用户登录云函数",
  "main": "index.js",
  "dependencies": {
    "@cloudbase/node-sdk": "^2.7.0"
  }
}
```

### 3. 在 HBuilderX 中安装依赖

由于安全策略限制，我无法直接运行 `npm install` 命令。

**请手动在 HBuilderX 中操作**：

1. 打开 HBuilderX
2. 进入项目 `D:\project\uni-gobro`
3. 右键点击 `cloudfunctions\auth_login` 文件夹
4. 选择 **"在终端中打开"**
5. 在终端输入：
```bash
npm install @cloudbase/node-sdk
```

### 4. 其他云函数依赖

| 云函数 | 依赖包 |
|--------|--------|
| `ocr_parse` | `@cloudbase/node-sdk`, `tencentcloud-sdk-nodejs` |
| `sms_parse` | 无 |

---

## 📝 说明

我已经修复了 `auth_login` 云函数的代码：
- [x] 添加了 `const tcb = require('@cloudbase/node-sdk')`
- [x] 使用 `tcb.init()` 初始化 TCB

现在只需要在 HBuilderX 中安装依赖包即可。