import db from '@/src/utils/db.js'
import cloud from '@/src/utils/cloud.js'

/**
 * 认证相关 API
 */
export const authApi = {
  /**
   * 登录（账号密码）
   */
  async login(username, password) {
    // 直接调用 auth_login 云函数
    const res = await db.callFunction('auth_login', { username, password })
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
