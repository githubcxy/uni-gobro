import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi, expressApi, groupApi, rewardApi } from '@/src/api/index.js'

export const useUserStore = defineStore('user', () => {
  const token = ref(uni.getStorageSync('token') || '')
  const userInfo = ref(uni.getStorageSync('userInfo') || null)

  const isLoggedIn = computed(() => !!token.value)
  const userId = computed(() => userInfo.value?._id || null)
  const userPhone = computed(() => userInfo.value?.phone || '')
  const userName = computed(() => userInfo.value?.nickName || '未设置昵称')

  async function login(phone, code) {
    try {
      const res = await authApi.login(phone, code)
      token.value = res.token
      userInfo.value = res.user
      uni.setStorageSync('token', res.token)
      uni.setStorageSync('userInfo', res.user)
      return true
    } catch (err) {
      uni.showToast({ title: err.message, icon: 'none' })
      return false
    }
  }

  async function fetchUserInfo() {
    try {
      const user = await authApi.getCurrentUser()
      if (user) {
        userInfo.value = user
        uni.setStorageSync('userInfo', user)
      }
      return true
    } catch (err) {
      console.error('获取用户信息失败:', err)
      return false
    }
  }

  async function updateProfile(data) {
    try {
      await authApi.updateUser(data)
      userInfo.value = { ...userInfo.value, ...data }
      uni.setStorageSync('userInfo', userInfo.value)
      uni.showToast({ title: '更新成功' })
      return true
    } catch (err) {
      uni.showToast({ title: err.message, icon: 'none' })
      return false
    }
  }

  function logout() {
    authApi.logout()
    token.value = ''
    userInfo.value = null
    uni.reLaunch({ url: '/pages/auth/login' })
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    userId,
    userPhone,
    userName,
    login,
    fetchUserInfo,
    updateProfile,
    logout
  }
})
