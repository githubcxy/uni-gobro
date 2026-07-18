import { defineStore } from 'pinia'
import { ref } from 'vue'
import { rewardApi } from '@/src/api/index.js'

export const useRewardStore = defineStore('reward', () => {
  const rewardList = ref([])

  async function fetchRewardList() {
    try {
      const list = await rewardApi.getList()
      rewardList.value = list
      return list
    } catch (err) {
      console.error('获取悬赏列表失败:', err)
      return []
    }
  }

  async function publishReward(data) {
    try {
      const res = await rewardApi.publish(data)
      uni.showToast({ title: '发布成功' })
      await fetchRewardList()
      return res
    } catch (err) {
      uni.showToast({ title: err.message, icon: 'none' })
      return null
    }
  }

  async function acceptReward(id) {
    try {
      await rewardApi.accept(id)
      uni.showToast({ title: '接单成功' })
      await fetchRewardList()
      return true
    } catch (err) {
      uni.showToast({ title: err.message, icon: 'none' })
      return false
    }
  }

  return {
    rewardList,
    fetchRewardList,
    publishReward,
    acceptReward
  }
})
