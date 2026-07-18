import db from '@/src/utils/db.js'

/**
 * 群组 API（适配 TCB — 对应 group 集合）
 * 字段：_id, groupName, createUserId, memberList, createTime
 */
export const groupApi = {
  /**
   * 创建群组
   */
  async create(data) {
    const userId = uni.getStorageSync('userInfo')?._id
    const record = {
      createUserId: userId,
      groupName: data.groupName,
      memberList: [userId], // 创建者自动加入
      createTime: Date.now()
    }

    const id = await db.add('group', record)
    return { _id: id, ...record }
  },

  /**
   * 获取我创建的群组列表
   */
  async getMyCreatedGroups() {
    const userId = uni.getStorageSync('userInfo')?._id
    return db.query('group', { createUserId: userId }, { orderBy: 'createTime', order: 'desc' })
  },

  /**
   * 获取我加入的群组列表
   */
  async getMyJoinedGroups() {
    const userId = uni.getStorageSync('userInfo')?._id
    const _ = db.getDB().command

    // 查询 memberList 包含当前用户的群组
    const groups = await db.query('group', {
      memberList: _.in([userId])
    }, { orderBy: 'createTime', order: 'desc' })

    return groups.filter(g => g.createUserId !== userId)
  },

  /**
   * 获取群组详情
   */
  async getDetail(id) {
    const list = await db.query('group', { _id: id })
    return list.length > 0 ? list[0] : null
  },

  /**
   * 更新群组信息
   */
  async update(id, data) {
    return db.update('group', { _id: id }, data)
  },

  /**
   * 添加成员
   */
  async addMember(groupId, userId) {
    const group = await this.getDetail(groupId)
    if (!group) throw new Error('群组不存在')

    if (!group.memberList.includes(userId)) {
      group.memberList.push(userId)
      await this.update(groupId, { memberList: group.memberList })
    }
    return true
  },

  /**
   * 移除成员
   */
  async removeMember(groupId, userId) {
    const group = await this.getDetail(groupId)
    if (!group) throw new Error('群组不存在')

    group.memberList = group.memberList.filter(id => id !== userId)
    await this.update(groupId, { memberList: group.memberList })
    return true
  },

  /**
   * 解散群组
   */
  async dissolve(groupId) {
    // 删除群组
    await db.remove('group', { _id: groupId })
    // 删除相关快递记录
    const _ = db.getDB().command
    await db.remove('express', {
      showGroupIdList: _.in([groupId])
    })
    return true
  }
}

export default groupApi
