// TCB 腾讯云开发配置文件
export const CONFIG = {
  // TCB 环境配置
  TCB: {
    ENV: 'csy-hz-d3guudhcs5871eb53', // 您的实际 TCB 环境 ID
    APPID: 'your-wechat-appid', // 替换为你的微信 AppID（可选，用于微信登录）
  },
  
  // 应用配置
  APP: {
    VERSION: '1.0.0',
    TOKEN_EXPIRE: 7 * 24 * 60 * 60 * 1000, // Token 过期时间 7 天
    CACHE_EXPIRE: 5 * 60 * 1000, // 本地缓存过期时间 5 分钟
    RECONNECT_INTERVAL: 5000, // 重连间隔
    MAX_RECONNECT_TIMES: 10 // 最大重连次数
  },
  
  // 云函数配置
  CLOUD_FUNCTIONS: {
    OCR: 'ocr_parse', // OCR 图片识别云函数
    SMS_PARSE: 'sms_parse' // 短信解析云函数
  },
  
  // 云存储配置
  CLOUD_STORAGE: {
    MAX_SIZE: 5 * 1024 * 1024, // 最大上传大小 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/jpg'] // 允许的图片类型
  }
}

export default CONFIG
