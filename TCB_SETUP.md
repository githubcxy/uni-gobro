# TCB 项目配置与部署指南

## 1. 环境配置
- 在 `src/config/index.js` 中设置您的 TCB 环境 ID
- 在云函数中配置腾讯云 SecretId 和 SecretKey

## 2. 云函数部署
需要部署以下云函数：
- `auth_login` - 用户登录
- `ocr_parse` - OCR 图片识别

## 3. 数据库集合
在 TCB 控制台创建以下 4 个集合（严格按照文档）：
1. `user` - 用户表
2. `group` - 群组表
3. `express` - 快递记录表
4. `reward` - 悬赏任务表

## 4. 安全规则
为每个集合设置读写权限（参考 `DATABASE_SCHEMA.md`）

## 5. 依赖安装
```bash
# 进入云函数目录
cd D:\hiclaw-workspace\express-group-app\cloudfunctions

# 为 ocr_parse 安装依赖
cd ocr_parse && npm install tencentcloud-sdk-nodejs axios @cloudbase/node-sdk
```

## 6. 部署命令
```bash
# 使用 TCB CLI 部署
tcb fn deploy auth_login ocr_parse

# 或使用 uniCloud CLI
uniCloud deploy
```

## 7. 注意事项
- 替换 `src/config/index.js` 中的 `your-tcb-env-id`
- 在 `ocr_parse` 云函数中替换 `process.env.SECRET_ID` 和 `process.env.SECRET_KEY`
- 确保腾讯云账号已开通 OCR 服务
- 所有集合名称必须完全匹配（user, group, express, reward）
