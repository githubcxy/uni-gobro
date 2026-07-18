import { CONFIG } from '@/src/config/index.js'

/**
 * HTTP请求封装
 */
class Request {
  constructor() {
    this.baseURL = CONFIG.MEMFIRE.BASE_URL
    this.apiKey = CONFIG.MEMFIRE.API_KEY
    this.timeout = 10000
  }

  /**
   * 获取请求头
   */
  getHeaders() {
    const token = uni.getStorageSync('token')
    return {
      'Content-Type': 'application/json',
      'apikey': this.apiKey,
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  }

  /**
   * 通用请求方法
   */
  request(options) {
    return new Promise((resolve, reject) => {
      uni.request({
        url: this.baseURL + options.url,
        method: options.method || 'GET',
        data: options.data || {},
        header: this.getHeaders(),
        timeout: this.timeout,
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else if (res.statusCode === 401) {
            // Token过期，跳转登录
            uni.removeStorageSync('token')
            uni.removeStorageSync('userInfo')
            uni.reLaunch({
              url: '/pages/auth/login'
            })
            reject(new Error('登录已过期，请重新登录'))
          } else {
            reject(new Error(res.data.message || '请求失败'))
          }
        },
        fail: (err) => {
          reject(new Error(err.errMsg || '网络错误'))
        }
      })
    })
  }

  /**
   * GET请求
   */
  get(url, params = {}) {
    const query = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&')
    const fullUrl = query ? `${url}?${query}` : url
    return this.request({
      method: 'GET',
      url: fullUrl
    })
  }

  /**
   * POST请求
   */
  post(url, data = {}) {
    return this.request({
      method: 'POST',
      url,
      data
    })
  }

  /**
   * PUT请求
   */
  put(url, data = {}) {
    return this.request({
      method: 'PUT',
      url,
      data
    })
  }

  /**
   * DELETE请求
   */
  delete(url) {
    return this.request({
      method: 'DELETE',
      url
    })
  }
}

export default new Request()
