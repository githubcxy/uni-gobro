# 快递群组 App - iOS 过滤短信转发功能实现总结

## 实现的功能

### 1. iOS 过滤短信转发 (核心功能)

利用 iOS 15+ 系统内置的 **Filtered SMS Forwarding** 能力，实现快递短信自动接收、解析、入库。

**工作流程：**
1. 用户在系统设置中开启短信过滤并勾选本 App
2. iOS 系统自动过滤快递短信并转发给 App
3. App 接收短信后自动解析快递信息（公司、取件码、地址）
4. 解析结果自动写入数据库
5. 用户打开 App 即可看到最新快递

**设置路径：**
```
设置 → 信息 → 过滤未知发件人 → 允许过滤的应用 → 勾选"快递群组 App"
```

### 2. 其他录入方式

| 方式 | 说明 |
|------|------|
| **手动录入** | 传统表单填写快递公司、取件码、地址 |
| **短信导入** | 粘贴短信内容，智能解析快递信息，二次确认 |
| **自动读取** | Android 动态申请短信权限，读取最新短信（平台限制，提示用户粘贴） |
| **分享导入** | 预留接口，支持从其他 App 分享快递信息 |
| **截图识别** | 上传快递截图，调用后端 OCR 接口识别 |
| **iOS 过滤转发** | iOS 系统级短信过滤，自动接收并入库 |

## 修改的文件

### 1. `pages/express/add.vue` (20,315 bytes)

完整重写，包含：

**Template 部分：**
- 6 个录入方式 tab 切换
- 手动录入表单（快递公司选择器、取件码、地址、备注）
- 短信粘贴 + 智能解析 + 二次确认弹窗
- Android 自动读取权限申请
- **iOS 过滤转发引导页面**（步骤说明、开关控制、接收记录展示）
- 截图 OCR 上传 + 识别
- 群组选择 + 隐私设置
- 提交按钮

**Script 部分：**
- `method` 状态管理（manual/sms/auto/ios_filter/share/ocr）
- `formData` 表单数据
- `iosFilterEnabled` iOS 过滤开关状态
- `filteredSmsList` 过滤短信接收记录
- `parseSms()` 短信解析
- `toggleIosFilter()` iOS 过滤开关控制
- `listenFilteredSms()` 监听过滤短信
- `requestSmsPermission()` Android 权限申请
- `handleSubmit()` 提交表单

**Style 部分：**
- iOS 过滤转发引导样式
- 步骤编号圆形图标
- 状态开关样式
- 过滤短信列表样式

### 2. `src/utils/iosSmsForward.js` (6,226 bytes)

包含：

- iOS 原生插件实现思路（Swift 代码示例）
- `SmsFilterService` 类设计
- `parseExpressSms()` 快递短信解析工具函数
- uni-app 原生插件集成说明
- 快递公司、取件码、地址提取正则

### 3. `manifest.json`

**Android 权限：**
```json
"permissions": [
  "<uses-permission android:name=\"android.permission.READ_SMS\"/>",
  "<uses-permission android:name=\"android.permission.RECEIVE_SMS\"/>",
  "<uses-permission android:name=\"android.permission.SEND_SMS\"/>"
]
```

**iOS 能力声明：**
```json
"ios": {
  "capabilities": {
    "filteredSms": {
      "enabled": true,
      "description": "过滤快递短信并自动解析入库"
    },
    "userMessagingPermission": true
  }
}
```

### 4. `IOS_SMS_FILTER.md` (1,553 bytes)

iOS 过滤短信转发功能说明文档，包含：

- 功能概述
- 系统设置路径
- 技术实现方案
- 数据流向图
- 后续开发步骤
- 注意事项

## 文件编码

所有文件使用 **UTF-8 with BOM** 编码，防止 uni-app 编译时出现乱码。

## 后续步骤

### 必须完成

1. **创建 iOS 原生插件**
   - 在 HBuilderX 创建"App 原生插件云更新"项目
   - 实现 `SMSFilterModule` Swift 原生模块
   - 使用 `UNUserNotificationCenter` 接收过滤短信
   - 实现 `requestAuthorization`、`enableFilter`、`onSmsReceived` 接口

2. **真机测试**
   - 在 iOS 真机上测试短信过滤接收流程
   - 验证快递短信自动入库功能
   - 测试错误处理和用户引导

### 可选优化

1. **完善短信解析**
   - 增加更多快递公司的识别规则
   - 优化取件码提取正则
   - 支持更多地址格式

2. **用户体验**
   - 添加短信接收通知
   - 优化引导流程
   - 增加解析失败重试

3. **Android 原生短信**
   - 完善 `readLatestSms()` 实现
   - 通过 `plus.android` 调用原生 SMS API

## 技术要点

### iOS 过滤短信转发原理

```
用户收到快递短信
    ↓
iOS 系统拦截短信
    ↓
根据过滤规则判断是否为快递短信
    ↓
是 → 转发给已注册的 App
    ↓
App 通过 UNUserNotificationCenter 接收
    ↓
解析快递信息（公司/取件码/地址）
    ↓
自动写入数据库
    ↓
用户打开 App 看到最新快递
```

### uni-app 原生插件集成

```javascript
// JS 层调用原生模块
const smsFilter = plus.requireModule('SMSFilter')

// 请求权限
await smsFilter.requestAuthorization()

// 开启过滤
await smsFilter.enable()

// 监听短信
smsFilter.onSmsReceived = (sms) => {
  const parsed = parseExpressSms(sms.body)
  // 写入数据库
  saveToDatabase(parsed)
}
```

## 注意事项

- **iOS 15.0+** 才支持过滤短信转发
- 需要用户在系统设置中手动开启
- 首次使用需要授权通知权限
- 过滤规则由 iOS 系统决定，App 无法自定义
- Android 短信自动读取受平台限制，建议用户粘贴短信内容
