// TCB 云函数 - 发送短信验证码
// 云函数名称: sms_send

// 依赖: 腾讯云短信服务
const smsClient = require('tencentcloud-sdk-nodejs/tencentcloud/services/sms/v20210111/sms_client.js')

// 验证码模板 ID
const TEMPLATE_ID = 'your-template-id' // 替换为你的模板 ID
const SIGN_NAME = 'your-sign-name' // 替换为你的签名
const SMS_APPID = 'your-sms-appid' // 替换为你的短信应用 ID

exports.main = async function(event, context) {
  try {
    // 1. 获取手机号
    const { phone } = event
    if (!phone) {
      return {
        code: 1,
        message: '缺少手机号'
      }
    }
    
    // 2. 生成 6 位验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    
    // 3. 调用腾讯云短信服务
    const clientConfig = {
      credential: {
        secretId: process.env.SECRET_ID,
        secretKey: process.env.SECRET_KEY
      },
      region: 'ap-beijing',
      profile: {
        httpProfile: {
          endpoint: 'sms.tencentcloudapi.com'
        }
      }
    }
    
    const client = new smsClient.Client(clientConfig)
    
    const params = {
      SmsSdkAppId: SMS_APPID,
      SignName: SIGN_NAME,
      TemplateId: TEMPLATE_ID,
      PhoneNumberSet: [`+86${phone}`],
      TemplateParamSet: [code]
    }
    
    const result = await client.SendSms(params)
    
    // 4. 保存验证码到数据库（有效期 5 分钟）
    const db = uniCloud.database()
    await db.collection('verification_codes').add({
      phone: phone,
      code: code,
      createTime: new Date(),
      expireTime: new Date(Date.now() + 5 * 60 * 1000) // 5 分钟后过期
    })
    
    return {
      code: 0,
      message: '验证码发送成功'
    }
    
  } catch (error) {
    console.error('发送验证码失败:', error)
    return {
      code: 1,
      message: error.message || '发送失败'
    }
  }
}
