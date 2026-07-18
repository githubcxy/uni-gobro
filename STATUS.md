# uni-gobro 项目配置状态

## ✅ 已完成
- [x] 项目名称改为 `uni-gobro`
- [x] 项目路径更新为 `D:\project\uni-gobro`
- [x] 登录方式改为账号密码（不再使用短信验证码）
- [x] `auth_login` 云函数已更新（支持自动注册）
- [x] `auth.js` API 层已更新
- [x] `db.js` 工具层已更新

## 🚀 待完成
- [ ] 在 TCB 控制台创建 4 个集合：`user`, `group`, `express`, `reward`
- [ ] 部署 `auth_login` 云函数
- [ ] 部署 `ocr_parse` 云函数
- [ ] 在 `ocr_parse` 中配置 SecretId 和 SecretKey 环境变量
- [ ] 更新 `src/config/index.js` 中的环境 ID

## 📝 说明

现在用户登录流程为：
1. 输入手机号（账号）和密码
2. 如果是新用户，系统自动注册（密码默认为手机号后 6 位）
3. 登录成功后跳转首页

不需要再处理短信，简化了流程。
