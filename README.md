# uni-gobro

UNI-GOBRO 快递群组协同管理

## 项目配置

### TCB 环境
- **环境 ID**: `your-tcb-env-id` (请替换为实际 ID)
- **控制台**: [https://console.cloud.tencent.com/tcb](https://console.cloud.tencent.com/tcb)

### 云函数
- `auth_login`: 用户登录
- `ocr_parse`: OCR 图片识别

### 数据库集合
1. `user` - 用户表
2. `group` - 群组表
3. `express` - 快递记录表
4. `reward` - 悬赏任务表

### 部署命令
```bash
cd D:\project\uni-gobro
npm install
tcb fn deploy auth_login ocr_parse
```

### 详细部署指南
请查看 [TCB_DEPLOYMENT_GUIDE.md](./TCB_DEPLOYMENT_GUIDE.md)
