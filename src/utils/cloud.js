// TCB 云函数调用封装
import { CONFIG } from '@/src/config/index.js'

class CloudFunctions {
  constructor() {
    this.env = CONFIG.TCB.ENV
  }

  /**
   * 调用云函数
   */
  async callFunction(name, data = {}) {
    try {
      const res = await uniCloud.callFunction({
        name,
        data
      })
      if (res.result.code === 0) {
        return res.result.data
      }
      throw new Error(res.result.message || '云函数调用失败')
    } catch (err) {
      console.error(`云函数 ${name} 调用失败:`, err)
      throw err
    }
  }

  /**
   * OCR 图片识别 - 上传图片到 TCB 云存储后调用云函数识别
   */
  async ocrParse(imageUrl) {
    return this.callFunction('ocr_parse', { imageUrl })
  }

  /**
   * 短信内容解析
   */
  async smsParse(smsText) {
    return this.callFunction('sms_parse', { smsText })
  }

  /**
   * 上传统计信息
   */
  async uploadFile(filePath, cloudPath) {
    try {
      const res = await uniCloud.uploadFile({
        cloudPath: cloudPath || `images/${Date.now()}.jpg`,
        filePath
      })
      return res.fileID
    } catch (err) {
      console.error('上传文件失败:', err)
      throw err
    }
  }
}

export default new CloudFunctions()
