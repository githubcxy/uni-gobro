# TCB 云函数部署指南（更新版）

## 需要部署的 2 个云函数

### 1. auth_login —— 用户登录/注册

| 配置项 | 值 |
|--------|-----|
| 函数名 | `auth_login` |
| 运行环境 | Node.js 18 |
| 入口文件 | `index.main` |
| 代码位置 | `D:\project\uni-gobro\cloudfunctions\auth_login\index.js` |

**功能**：
- 账号密码登录
- 首次登录自动注册（密码默认为手机号后 6 位）
- 生成 token

### 2. ocr_parse —— OCR 图片识别

| 配置项 | 值 |
|--------|-----|
| 函数名 | `ocr_parse` |
| 运行环境 | Node.js 18 |
| 入口文件 | `index.main` |
| 代码位置 | `D:\project\uni-gobro\cloudfunctions\ocr_parse\index.js` |

**功能**：
- 识别快递单图片
- 提取取件码、快递公司、地址
- 需要配置 SecretId 和 SecretKey 环境变量

## 前置需求

在 TCB 控制台创建 4 个数据库集合：
- `user`
- `group`
- `express`
- `reward`
