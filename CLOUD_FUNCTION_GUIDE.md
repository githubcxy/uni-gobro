# 🆘 云函数配置指引

## 如何找到 TCB 控制台中的环境配置

### 1. 登录后界面
```
腾讯云控制台
├── 云开发 TCB
│   ├── 环境列表
│   │   ├── uni-gobro ← 点击这个环境
│   │   └── 其他环境
│   └── 新建环境
```

### 2. 环境详情页
```
环境详情
├── 概览
├── 云函数 ← 点击这里
├── 数据库
├── 云存储
├── 云开发扩展
└── 环境配置 ← 这个就是！
```

### 3. 环境配置页面
- 在"环境配置"页面中，找到"环境变量"部分
- 点击"添加环境变量"
- 添加：
  - 变量名：SECRET_ID，变量值：您的 SecretId
  - 变量名：SECRET_KEY，变量值：您的 SecretKey

### 4. 临时解决方案
如果还是找不到，可以先在代码中临时配置：

1. 打开 `D:\project\uni-gobro\cloudfunctions\ocr_parse\index.js`
2. 找到以下代码：
```javascript
      credential: {
        secretId: 'your-secret-id',
        secretKey: 'your-secret-key'
      },
```
3. 将 `your-secret-id` 和 `your-secret-key` 替换为您的实际密钥
4. 部署云函数

> ⚠️ 注意：这只是临时方案，完成后请务必在控制台中删除代码中的密钥，改用环境变量

### 5. 获取 SecretId 和 SecretKey
1. 访问：[https://console.cloud.tencent.com/cam/capi](https://console.cloud.tencent.com/cam/capi)
2. 点击"新建密钥"
3. 复制生成的 SecretId 和 SecretKey

---

## 📞 需要帮助？

如果您仍然找不到，请告诉我您在控制台看到的具体界面，我可以更精确地指导您。