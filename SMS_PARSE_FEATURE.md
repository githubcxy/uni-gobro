# 短信解析功能实现说明

## 📱 短信读取功能

### 安卓端：支持静默读取短信

1. **权限配置**
   - 在 `manifest.json` 中添加权限：
   ```json
   {
     "permissions": {
       "scope.sms": {
         "description": "用于读取快递短信"
       }
     }
   }
   ```

2. **读取短信代码**
   ```javascript
   // 使用 H5+ API 读取短信
   plus.android.requestPermissions(['android.permission.READ_SMS'], function(result) {
     if (result.granted) {
       const Sms = plus.android.importClass('android.telephony.SmsManager')
       const cursor = plus.android.invoke('android.content.ContentResolver', 'query',
         plus.android.newObject('android.net.Uri', 'content://sms/inbox'),
         null, null, null, null)
       
       while (cursor.moveToNext()) {
         const body = cursor.getString(cursor.getColumnIndex('body'))
         // 解析短信内容
         parseSmsText(body)
       }
       cursor.close()
     }
   })
   ```

### iOS端：不支持静默读取

- 只能通过 **复制粘贴** 或 **截图OCR** 方式
- 无法直接访问短信数据库

## 🧩 短信内容解析

### 1. 解析逻辑（`sms_parse` 云函数）

```javascript
// TCB 云函数 - 短信内容解析
// 云函数名称：sms_parse

exports.main = async function(event, context) {
  try {
    const { smsText } = event
    if (!smsText) {
      return { code: 1, message: '缺少短信内容' }
    }

    const result = {
      code: '',
      address: '',
      company: ''
    }

    // 快递公司关键词
    const companyKeywords = ['顺丰', '圆通', '中通', '申通', '韵达', '京东', '极兔', '德邦']
    
    // 提取快递公司
    companyKeywords.forEach(company => {
      if (smsText.includes(company)) {
        result.company = company
      }
    })
    
    // 提取取件码（多种格式）
    const codeRegex = /取件码[:：\s]+([A-Za-z0-9]+)/
    const codeMatch = smsText.match(codeRegex)
    if (codeMatch) {
      result.code = codeMatch[1]
    }
    
    // 提取地址
    const addressRegex = /地址[:：\s]+([^，。\n]+)/
    const addressMatch = smsText.match(addressRegex)
    if (addressMatch) {
      result.address = addressMatch[1]
    }
    
    return {
      code: 0,
      message: 'success',
      data: result
    }
  } catch (err) {
    console.error('短信解析失败:', err)
    return { code: 1, message: err.message }
  }
}
```

### 2. 前端调用

```javascript
// 在 express.js 中添加短信解析方法
async parseSmsText(smsText) {
  return cloud.callFunction('sms_parse', { smsText })
}
```

## 🔧 部署步骤

1. **创建云函数**
   - 函数名：`sms_parse`
   - 运行环境：Node.js 18
   - 代码：使用上面的 `sms_parse` 代码

2. **更新前端代码**
   - 在 `src/api/express.js` 中添加 `parseSmsText` 方法

3. **安卓权限**
   - 在 `manifest.json` 中添加 `scope.sms` 权限

## 📝 状态

- [x] OCR 图片识别功能已完成 (`ocr_parse`)
- [ ] 短信解析云函数未创建 (`sms_parse`)
- [ ] 前端未添加短信解析调用
- [ ] 安卓权限未配置
