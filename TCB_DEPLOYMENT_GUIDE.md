# 🚀 uni-gobro 腾讯云 TCB 配置完整指南

## 第一步：登录腾讯云 TCB 控制台

### 1.1 打开浏览器
访问：[https://console.cloud.tencent.com/tcb](https://console.cloud.tencent.com/tcb)

### 1.2 登录账号
- 使用您的腾讯云账号登录
- 如果没有账号，点击 **"注册"** 创建新账号（需要手机号）

---

## 第二步：创建 TCB 环境

### 2.1 新建环境
1. 在控制台首页，点击 **"新建环境"** 按钮
2. 填写环境信息：
   - **环境名称**：`uni-gobro`
   - **环境 ID**：系统自动生成（例如 `uni-gobro-123456`）
   - **服务模板**：选择 **"空白环境"**
3. 点击 **"确定"** 创建

> ⚠️ **重要**：创建后，系统会显示 **环境 ID**，请复制并保存！
> 例如：`uni-gobro-abc123`

### 2.2 记录环境 ID
将生成的环境 ID 复制下来，稍后需要填入代码。

---

## 第三步：创建数据库集合

### 3.1 进入数据库管理
1. 在左侧菜单点击 **"数据库"**
2. 点击 **"添加集合"** 按钮

### 3.2 创建 4 个集合
依次创建以下集合（名称必须完全匹配）：

| 序号 | 集合名称 | 说明 |
|------|---------|------|
| 1 | `user` | 用户表 |
| 2 | `group` | 群组表 |
| 3 | `express` | 快递记录表 |
| 4 | `reward` | 悬赏任务表 |

**创建步骤**：
1. 点击 **"添加集合"**
2. 输入集合名称（如 `user`）
3. 存储类型选择 **"非关系型数据库"**
4. 点击 **"确定"**
5. 重复以上步骤创建其他 3 个集合

### 3.3 为 `user` 集合添加索引
1. 在数据库列表中点击 `user` 集合
2. 点击 **"索引"** 标签页
3. 点击 **"添加索引"**
4. 配置：
   - **字段名**：`phone`
   - **类型**：`String`
   - **唯一索引**：✅ 勾选
5. 点击 **"确定"**

---

## 第四步：配置项目环境 ID

### 4.1 打开配置文件
在您的项目目录中打开：
```
D:\project\uni-gobro\src\config\index.js
```

### 4.2 修改环境 ID
找到以下代码：
```javascript
TCB: {
  ENV: 'your-tcb-env-id', // 请替换为你的实际 TCB 环境 ID
}
```

将 `'your-tcb-env-id'` 替换为您在第二步中记录的 **环境 ID**。

**示例**：
```javascript
TCB: {
  ENV: 'uni-gobro-abc123', // 替换为您实际的环境 ID
}
```

### 4.3 保存文件
按 `Ctrl + S` 保存文件。

---

## 第五步：部署云函数

### 5.1 安装依赖
打开命令行（CMD 或 PowerShell），执行：
```powershell
cd D:\project\uni-gobro\cloudfunctions\ocr_parse
npm install tencentcloud-sdk-nodejs axios @cloudbase/node-sdk
```

### 5.2 配置腾讯云密钥
1. 登录 [腾讯云访问管理控制台](https://console.cloud.tencent.com/cam/capi)
2. 创建或获取您的 **SecretId** 和 **SecretKey**
3. 回到 TCB 控制台：
   - 进入您的环境
   - 点击 **"云函数"**
   - 点击 **"环境配置"**
   - 添加环境变量：	
     - `SECRET_ID` = 您的 SecretId
     - `SECRET_KEY` = 您的 SecretKey

### 5.3 部署云函数
在项目根目录执行：
```powershell
cd D:\project\uni-gobro
tcb fn deploy auth_login ocr_parse
```

或使用 uniCloud CLI：
```powershell
uniCloud deploy
```

---

## 第六步：测试应用

### 6.1 启动项目
1. 打开 HBuilderX
2. 打开项目 `D:\project\uni-gobro`
3. 点击 **"运行"** → **"运行到浏览器"**

### 6.2 测试登录功能
1. 在登录页面输入手机号（如 `13800138000`）
2. 点击 **"获取验证码"**
3. 输入任意 6 位数字（当前云函数简化处理）
4. 点击 **"登录"**

**成功标志**：
- ✅ 跳转到首页
- ✅ TCB 数据库的 `user` 集合中出现新用户记录

### 6.3 验证数据库
1. 回到 TCB 控制台
2. 进入 **"数据库"** → 点击 `user` 集合
3. 查看是否有新用户数据

---

## 第七步：设置数据库安全规则（可选但推荐）

### 7.1 为每个集合设置安全规则
在 TCB 控制台，进入每个集合，点击 **"安全规则"** 标签页，设置如下：

**user 集合**：
```json
{
  "read": "auth.uid() != null",
  "write": "auth.uid() != null"
}
```

**group 集合**：
```json
{
  "read": "auth.uid() in resource.memberList",
  "write": "auth.uid() == resource.createUserId"
}
```

**express 集合**：
```json
{
  "read": "resource.showGroupIdList.contains(auth.uid()) || resource.createUserId == auth.uid()",
  "write": "auth.uid() != null"
}
```

**reward 集合**：
```json
{
  "read": "auth.uid() != null",
  "write": "auth.uid() != null"
}
```

---

## ✅ 完成检查清单

| 步骤 | 任务 | 状态 |
|------|------|------|
| 1 | 登录 TCB 控制台 | ☐ |
| 2 | 创建 TCB 环境 | ☐ |
| 3 | 记录环境 ID | ☐ |
| 4 | 创建 4 个集合 | ☐ |
| 5 | 为 `user.phone` 添加唯一索引 | ☐ |
| 6 | 修改 `src/config/index.js` | ☐ |
| 7 | 安装云函数依赖 | ☐ |
| 8 | 配置 SecretId/SecretKey | ☐ |
| 9 | 部署云函数 | ☐ |
| 10 | 测试登录功能 | ☐ |
| 11 | 设置数据库安全规则 | ☐ |

---

## 🆘 常见问题

### Q1: 找不到 TCB 控制台入口？
A: 直接访问 [https://console.cloud.tencent.com/tcb](https://console.cloud.tencent.com/tcb)

### Q2: 环境 ID 在哪里查看？
A: 在 TCB 控制台首页，环境列表中可以看到环境 ID

### Q3: 云函数部署失败？
A: 检查是否已安装 `tcb-cli` 或 `uniCloud` CLI 工具

### Q4: 登录时提示"云函数调用失败"？
A: 检查 `src/config/index.js` 中的环境 ID 是否正确

---

## 📞 需要帮助？

如果在配置过程中遇到问题，请随时告诉我具体步骤和错误信息，我会帮您解决！
