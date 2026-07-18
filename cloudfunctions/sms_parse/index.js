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