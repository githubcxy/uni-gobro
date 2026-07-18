// TCB 云函数 - 短信内容解析
// 云函数名称: sms_parse

exports.main = async function(event, context) {
  try {
    // 1. 获取短信内容
    const { smsText } = event
    if (!smsText) {
      return {
        code: 1,
        message: '缺少短信内容'
      }
    }
    
    // 2. 提取快递信息
    const result = {
      company: '',
      code: '',
      address: ''
    }
    
    // 常见快递短信格式正则
    const patterns = [
      // 【快递公司】您的快递已到...取件码：XXX
      /【(.+?)】.*?(?:取件码|提货码)[:：]?\s*(\S+)/,
      // 取件码 XXX
      /(?:取件码|提货码)[:：]?\s*(\S+)/,
      // 地址：XXX
      /地址[:：]\s*(.+?)(?:，|。|$)/
    ]
    
    for (const pattern of patterns) {
      const match = smsText.match(pattern)
      if (match) {
        if (pattern.source.includes('【')) {
          result.company = match[1]
          result.code = match[2]
        } else if (pattern.source.includes('取件码')) {
          result.code = match[1]
        } else if (pattern.source.includes('地址')) {
          result.address = match[1]
        }
      }
    }
    
    return {
      code: 0,
      message: 'success',
      data: result
    }
    
  } catch (error) {
    console.error('短信解析失败:', error)
    return {
      code: 1,
      message: error.message || '短信解析失败'
    }
  }
}
