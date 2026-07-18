# iOS 过滤短信转发功能说明

## 功能概述

利用 iOS 15+ 内置的 **过滤短信转发（Filtered SMS Forwarding）** 能力，让 App 自动接收由系统过滤过来的快递短信，自动解析快递信息并入库。

**核心机制：**
1. 用户在 `设置 → 信息 → 过滤未知发件人` 中勾选我们的 App
2. 系统自动将快递相关短信过滤并转发给我们的 App
3. App 收到短信后自动解析快递公司、取件码、地址等关键信息
4. 解析结果自动写入数据库，无需用户手动操作

## 系统设置路径

```
设置 → 信息 → 过滤未知发件人 → 允许过滤的应用 → 勾选"快递群组App"
```

## 技术实现

### iOS 原生实现

iOS 的过滤短信转发通过以下原生 API 实现：

1. **UNUserNotificationCenter** - 接收系统通知和过滤短信
2. **MessageUI Framework** - 处理短信内容
3. **本地通知** - 当 App 收到快递短信时通知用户

### uni-app 集成

由于 uni-app 的跨平台特性，iOS 过滤短信转发需要通过原生插件实现：

```
uni-app JS ← → 原生插件(Swift/ObjC) ← → iOS 系统 API
```

#### 方案一：使用原生插件

1. 在 HBuilderX 创建原生插件项目
2. 实现 `SMSFilterModule` 原生模块
3. 注册模块并在 JS 层调用

#### 方案二：使用插件市场现成插件

搜索 `uniapp-plugin-sms-filter` 等 iOS 短信过滤插件

### 数据流向

```
用户收到快递短信
    ↓
iOS 系统拦截 -> 过滤
    ↓
App 接收过滤短信
    ↓
解析快递信息 (公司/取件码/地址)
    ↓
自动写入数据库
    ↓
用户打开 App -> 首页自动显示最新快递
```

## 已实现的文件

| 文件 | 说明 |
|------|------|
| `pages/express/add.vue` | 包含 iOS 过滤转发的引导页面、开关控制、接收记录展示 |
| `src/utils/iosSmsForward.js` | iOS 原生插件实现文档、快递短信解析工具类 |
| `manifest.json` | iOS 配置已添加 filteredSms 能力声明 |

## 代码位置

### add.vue 中的相关方法

- `toggleIosFilter(enabled)` - iOS 过滤转发开关控制
- `listenFilteredSms()` - 监听过滤短信
- `expressStore.parseSmsContent()` - 解析快递短信内容

### iosSmsForward.js 中的工具方法

- `parseExpressSms(body)` - 解析快递短信的 JS 工具方法

## 后续步骤

1. 在 HBuilderX 中创建 iOS 原生插件 SMSFilterModule
2. 实现 `requestAuthorization`、`enableFilter`、`onSmsReceived` 等接口
3. 测试在真机上的短信过滤接收流程
4. 完善错误处理和用户引导

## 注意事项

- 需要 iOS 15.0+
- 需要在设置中手动开启过滤转发
- 首次使用需要用户授权通知权限
- 过滤规则由 iOS 系统决定，App 无法自定义过滤条件
