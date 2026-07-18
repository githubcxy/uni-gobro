import { defineStore } from 'pinia'
import { ref } from 'vue'
import { expressApi } from '@/src/api/index.js'

export const useExpressStore = defineStore('express', () => {
  const expressList = ref([])
  const privateExpressList = ref([])

  async function fetchExpressList(groupId) {
    try {
      const list = await expressApi.getList(groupId)
      expressList.value = list
      return list
    } catch (err) {
      console.error('获取快递列表失败:', err)
      return []
    }
  }

  async function fetchPrivateExpressList() {
    try {
      const list = await expressApi.getMyPrivateList()
      privateExpressList.value = list
      return list
    } catch (err) {
      console.error('获取私人快递失败:', err)
      return []
    }
  }

  async function createExpress(data) {
    try {
      const res = await expressApi.create(data)
      uni.showToast({ title: '录入成功' })
      return res
    } catch (err) {
      uni.showToast({ title: err.message, icon: 'none' })
      return null
    }
  }

  async function updateExpress(id, data) {
    try {
      await expressApi.update(id, data)
      uni.showToast({ title: '更新成功' })
      return true
    } catch (err) {
      uni.showToast({ title: err.message, icon: 'none' })
      return false
    }
  }

  async function deleteExpress(id) {
    try {
      await expressApi.delete(id)
      uni.showToast({ title: '删除成功' })
      return true
    } catch (err) {
      uni.showToast({ title: err.message, icon: 'none' })
      return false
    }
  }

  async function markAsPicked(id) {
    try {
      await expressApi.markAsPick(id)
      uni.showToast({ title: '已标记取件' })
      return true
    } catch (err) {
      return false
    }
  }

  return {
    expressList,
    privateExpressList,
    fetchExpressList,
    fetchPrivateExpressList,
    createExpress,
    updateExpress,
    deleteExpress,
    markAsPicked
  }
})
