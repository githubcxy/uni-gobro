# 📦 TCB 云函数部署指南

## ✅ 已修复的问题

### auth_login 云函数
- **问题**：缺少 `@cloudbase/node-sdk` 依赖
- **解决**：改用 TCB 内置的 `require('cloud')`，无需安装任何依赖包

### ocr_parse 云函数
- **问题**：缺少依赖包
- **解决**：保留了 `tencentcloud-sdk-nodejs` 依赖（用于 OCR 调用）

---

## 🚀 部署步骤

### 第一步：在 HBuilderX 中安装依赖

#### 1. auth_login（无需安装）
- ✅ 已改为使用 TCB 内置 `require('cloud')`
- ✅ 无需 `npm install`

#### 2. ocr_parse（需要安装）
1. 在 HBuilderX 中右键 `cloudfunctions\ocr_parse`
2. 选择"在终端中打开"
3. 运行：
```bash
npm install
```

---

### 第二步：上传到 TCB 控制台

#### 方法 1：在 HBuilderX 中一键上传（推荐）

1. 在 HBuilderX 中打开项目
2. 右键点击 `cloudfunctions` 文件夹
3. 选择 **"云函数管理"**
4. 点击 **"上传全部云函数"**
5. 选择您的环境 `csy-hz-d3guudhcs5871eb53`
6. 等待上传完成

#### 方法 2：在 TCB 控制台手动上传

1. 登录 [TCB 控制台](https://console.cloud.tencent.com/tcb)
2. 进入环境 `csy-hz-d3guudhcs5871eb53`
3. 点击 **"云函数"**
4. 点击 **"新建函数"**
5. 选择 **"本地上传"**
6. 上传对应的文件夹：
   - `auth_login` 文件夹
   - `ocr_parse` 文件夹
   - `sms_parse` 文件夹

---

### 第三步：测试云函数

#### 测试 auth_login
1. 在 TCB 控制台点击 `auth_login`
2. 点击 **"测试"** 标签页
3. 输入：
```json
{
  "username": "13800138000",
  "password": "138000"
}
```
4. 点击 **"运行"**

**预期输出**：
```json
{
  "code": 0,
  "message": "注册登录成功",
  "data": {
    "token": "xxx-1234567890",
    "user": {
      "_id": "xxx",
      "phone": "13800138000",
      "nickName": "用户 8000"
    }
  }
}
```

---

## 📝 云函数说明

| 云函数 | 用途 | 依赖包 |
|--------|------|--------|
| `auth_login` | 账号密码登录 | 无（使用 TCB 内置） |
| `ocr_parse` | OCR 图片识别 | `tencentcloud-sdk-nodejs` |
| `sms_parse` | 短信内容解析 | 无 |

---

## ✅ 验证清单

| 步骤 | 任务 | 状态 |
|------|------|------|
| 1 | 在 HBuilderX 中安装 `ocr_parse` 依赖 | ☐ |
| 2 | 上传 `auth_login` 到 TCB | ☐ |
| 3 | 上传 `ocr_parse` 到 TCB | ☐ |
| 4 | 上传 `sms_parse` 到 TCB | ☐ |
| 5 | 测试 `auth_login` 云函数 | ☐ |
| 6 | 测试 `ocr_parse` 云函数 | ☐ |
| 7 | 测试 `sms_parse` 云函数 | ☐ |

---

**现在可以重新测试登录功能了！**