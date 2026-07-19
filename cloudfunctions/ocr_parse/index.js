// TCB 云函数 - OCR 图片识别
// 云函数名称：ocr_parse

exports.main = async function(event, context) {
  try {
    const { imageUrl } = event
    if (!imageUrl) {
      return { code: 1, message: '缺少图片 URL' }
    }

    // 下载图片
    const response = await require('axios').get(imageUrl, { responseType: 'arraybuffer' })
    const imageBuffer = response.data

    // 使用 TCB 内置的 cloud 对象
    const cloud = require('cloud')
    const db = cloud.database()

    // 调用腾讯云 OCR
    const clientConfig = {
      credential: {
        secretId: process.env.SECRET_ID,
        secretKey: process.env.SECRET_KEY
      },
      region: 'ap-beijing',
      profile: {
        httpProfile: {
          endpoint: 'ocr.tencentcloudapi.com'
        }
      }
    }

    const ocr = require('tencentcloud-sdk-nodejs/tencentcloud/services/ocr/v20181119/ocr_client.js')
    const client = new ocr.Client(clientConfig)
    const params = {
      ImageBase64: Buffer.from(imageBuffer).toString('base64')
    }

    const ocrResult = await client.GeneralBasicOCR(params)
    const textItems = ocrResult.TextDetections || []

    // 提取信息
    const result = {
      code: '',
      address: '',
      company: ''
    }

    const companyKeywords = ['顺丰', '圆通', '中通', '申通', '韵达', '京东', '极兔', '德邦']
    const codeKeywords = ['取件码', '提货码', '验证码']

    textItems.forEach(item => {
      const text = item.DetectedText
      
      // 提取公司
      if (!result.company) {
        companyKeywords.forEach(k => {
          if (text.includes(k)) result.company = k
        })
      }
      
      // 提取取件码
      if (!result.code) {
        codeKeywords.forEach(k => {
          if (text.includes(k)) {
            const match = text.match(new RegExp(`${k}[:：\s]+([A-Za-z0-9]+)`))
            if (match) result.code = match[1]
          }
        })
      }
      
      // 提取地址
      if (!result.address && (text.includes('地址') || text.includes('收货'))) {
        const match = text.match(/地址[:：\s]+([^，。\n]+)/)
        if (match) result.address = match[1]
      }
    })

    return {
      code: 0,
      message: 'success',
      data: result
    }
  } catch (err) {
    console.error('OCR 失败:', err)
    return { code: 1, message: err.message }
  }
}