# 快递群组协同管理APP

> 家庭/宿舍快递共享与悬赏互助平台

## 📱 项目简介

这是一个基于UniApp开发的跨平台移动应用，主要解决家庭、宿舍等小群体内的快递代收代取问题。通过群组管理和隐私权限控制，实现快递信息共享，并提供悬赏机制激励成员互助。

## ✨ 核心功能

- **用户认证**：手机号验证码登录
- **群组管理**：创建/加入群组，成员管理
- **快递录入**：手动录入、短信导入、分享导入、OCR识别
- **隐私权限**：四层可见性控制（全局开关、群组授权、指定成员）
- **悬赏广场**：发布悬赏、接单、完成订单
- **实时同步**：WebSocket实时推送更新

## 🛠️ 技术栈

- **前端框架**：UniApp + Vue3
- **UI组件库**：uView Plus
- **状态管理**：Pinia
- **后端服务**：MemFire Cloud (PostgreSQL + REST API + WebSocket)
- **快递查询**：快递鸟API
- **实时通信**：WebSocket

## 📦 项目结构

```
express-group-app/
├── pages/                  # 页面目录
│   ├── auth/              # 认证相关页面
│   │   └── login.vue      # 登录页
│   ├── index/             # 首页
│   │   └── index.vue      # 快递列表页
│   ├── express/           # 快递相关页面
│   │   ├── add.vue        # 录入快递页
│   │   └── detail.vue     # 快递详情页
│   ├── group/             # 群组相关页面
│   │   ├── create.vue     # 创建群组页
│   │   └── detail.vue     # 群组详情页
│   ├── reward/            # 悬赏相关页面
│   │   ├── reward.vue     # 悬赏广场
│   │   ├── publish.vue    # 发布悬赏
│   │   └── order-detail.vue # 订单详情
│   └── mine/              # 个人中心
│       └── mine.vue       # 个人主页
├── src/                   # 源代码目录
│   ├── api/               # API接口封装
│   │   ├── auth.js        # 认证API
│   │   ├── group.js       # 群组API
│   │   ├── express.js     # 快递API
│   │   └── reward.js      # 悬赏API
│   ├── stores/            # Pinia状态管理
│   │   ├── user.js        # 用户状态
│   │   ├── group.js       # 群组状态
│   │   └── express.js     # 快递状态
│   ├── utils/             # 工具函数
│   │   ├── request.js     # HTTP请求封装
│   │   ├── websocket.js   # WebSocket服务
│   │   └── index.js       # 通用工具函数
│   └── config/            # 配置文件
│       └── index.js       # 应用配置
├── static/                # 静态资源
├── App.vue                # 应用入口
├── main.js                # 主入口文件
├── pages.json             # 页面配置
├── manifest.json          # 应用配置
└── package.json           # 依赖配置
```

## 🚀 快速开始

### 1. 环境准备

确保已安装以下软件：
- Node.js v18+
- HBuilderX App开发版
- 微信开发者工具（用于小程序调试）

### 2. 安装依赖

```bash
cd express-group-app
npm install
```

### 3. 配置环境变量

编辑 `src/config/index.js`，填入你的实际配置：

```javascript
export const CONFIG = {
  MEMFIRE: {
    BASE_URL: 'https://your-project-id.memfiredb.com/rest/v1',
    WS_URL: 'wss://your-project-id.memfiredb.com/realtime',
    API_KEY: 'your-api-key-here'
  },
  KDNIAO: {
    USER_ID: 'your-user-id',
    API_KEY: 'your-api-key'
  }
}
```

### 4. 运行项目

#### H5端
```bash
npm run dev:h5
```

#### 微信小程序
```bash
npm run dev:mp-weixin
```

然后在HBuilderX中选择"运行 > 运行到小程序模拟器 > 微信开发者工具"

#### APP端
在HBuilderX中选择"运行 > 运行到手机或模拟器"

### 5. 打包发布

#### Android APK
1. 在HBuilderX中选择"发行 > 原生App-云打包"
2. 填写包名、版本号等信息
3. 选择正式包或调试包
4. 等待云端打包完成（约5-10分钟）
5. 下载APK文件

#### iOS IPA
需要Apple Developer账号和证书，流程类似Android

## 📝 开发说明

### 数据库表结构

项目使用以下7张核心表：

1. **users** - 用户表
2. **group_info** - 群组信息表
3. **group_member** - 群组成员表
4. **express_info** - 快递信息表
5. **express_group_visible** - 快递群组可见表
6. **express_appoint_visible** - 快递指定成员可见表
7. **reward_order** - 悬赏订单表

详细的建表SQL请参考《概要设计文档》

### API接口

所有API都封装在 `src/api/` 目录下，使用统一的request工具。

### 状态管理

使用Pinia进行全局状态管理，主要包括：
- userStore - 用户信息和登录状态
- groupStore - 群组和成员信息
- expressStore - 快递数据和操作

### 实时同步

通过WebSocket实现实时数据同步：
- 订阅个人频道：`user:{userId}`
- 订阅群组频道：`group:{groupId}`
- 监听事件：`express.created`、`express.updated`、`express.deleted`

## 🔐 隐私与安全

### 四层隐私控制

1. **全局开关**：用户可关闭所有群组的共享
2. **群组授权**：入群时需同意查看他人快递
3. **展示范围**：每个快递可设置可见群组
4. **指定成员**：可精确到具体可见人员

### 数据安全

- 敏感信息加密存储
- RLS行级权限控制
- Token自动过期机制
- 短信内容本地解析后立即销毁

## 📊 性能优化

- 虚拟滚动：长列表性能优化
- 图片懒加载：减少首屏加载时间
- 离线缓存：网络异常时仍可浏览
- 请求合并：减少HTTP请求次数

## 🐛 常见问题

### Q: WebSocket连接失败？
A: 检查网络连接和API Key是否正确，确认MemFire Cloud服务正常

### Q: Android短信监听不生效？
A: 确认真机测试，已在manifest.json中申请READ_SMS权限

### Q: 快递鸟API返回签名错误？
A: 检查User ID和API Key，确认DataSign签名算法正确

更多问题请查看《快速开始指南》

## 📄 许可证

MIT License

## 👥 贡献指南

欢迎提交Issue和Pull Request！

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- GitHub Issues
- 邮件：your-email@example.com

---

**祝你使用愉快！** 🎉
