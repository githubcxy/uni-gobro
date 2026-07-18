import db from '@/src/utils/db.js'
import cloud from '@/src/utils/cloud.js'

/**
 * 认证相关 API
 */
export const authApi = {
  /**
   * 发送验证码
   */
  async sendCode(phone) {
    return db.callFunction('sms_send', { phone })
  },

  /**
   * 登录（手机号 + 验证码）
   */
  async login(phone, code) {
    const res = await db.callFunction('auth_login', { phone, code })
    if (res.code === 0) {
      uni.setStorageSync('token', res.data.token)
      uni.setStorageSync('userInfo', res.data.user)
      return res.data
    }
    throw new Error(res.message || '登录失败')
  },

  /**
   * 获取当前用户信息
   */
  async getCurrentUser() {
    const userId = uni.getStorageSync('userInfo')?._id
    if (!userId) return null

    const users = await db.query('user', { _id: userId })
    return users.length > 0 ? users[0] : null
  },

  /**
   * 更新用户信息
   */
  async updateUser(data) {
    const userId = uni.getStorageSync('userInfo')?._id
    if (!userId) throw new Error('用户未登录')

    await db.update('user', { _id: userId }, data)
    return true
  },

  /**
   * 退出登录
   */
  logout() {
    uni.removeStorageSync('token')
    uni.removeStorageSync('userInfo')
  }
}

export default authApi
