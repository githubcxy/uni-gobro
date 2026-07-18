import { defineStore } from 'pinia'
import { ref } from 'vue'
import { groupApi } from '@/src/api/index.js'

export const useGroupStore = defineStore('group', () => {
  const currentGroup = ref(null)
  const myCreatedGroups = ref([])
  const myJoinedGroups = ref([])

  async function fetchGroups() {
    try {
      const [created, joined] = await Promise.all([
        groupApi.getMyCreatedGroups(),
        groupApi.getMyJoinedGroups()
      ])
      myCreatedGroups.value = created
      myJoinedGroups.value = joined
      return { created, joined }
    } catch (err) {
      console.error('获取群组列表失败:', err)
      return { created: [], joined: [] }
    }
  }

  async function createGroup(data) {
    try {
      const res = await groupApi.create(data)
      uni.showToast({ title: '群组创建成功' })
      await fetchGroups()
      return res
    } catch (err) {
      uni.showToast({ title: err.message, icon: 'none' })
      return null
    }
  }

  async function joinGroup(groupId) {
    try {
      const userId = uni.getStorageSync('userInfo')?._id
      await groupApi.addMember(groupId, userId)
      uni.showToast({ title: '加入成功' })
      await fetchGroups()
      return true
    } catch (err) {
      uni.showToast({ title: err.message, icon: 'none' })
      return false
    }
  }

  function setCurrentGroup(group) {
    currentGroup.value = group
  }

  return {
    currentGroup,
    myCreatedGroups,
    myJoinedGroups,
    fetchGroups,
    createGroup,
    joinGroup,
    setCurrentGroup
  }
})
