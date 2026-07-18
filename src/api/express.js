import db from '@/src/utils/db.js'
import cloud from '@/src/utils/cloud.js'

/**
 * 快递 API（适配 TCB — 对应 express 集合）
 * 字段：_id, createUserId, code, address, company, isPick, hasInsurance,
 *       imgUrl, showGroupIdList, isPrivate, remark, createTime, pickTime
 */
export const expressApi = {
  /**
   * 创建快递记录
   */
  async create(data) {
    const userId = uni.getStorageSync('userInfo')?._id
    const record = {
      createUserId: userId,
      code: data.code || '',
      address: data.address || '',
      company: data.company || '',
      isPick: data.isPick || false,
      hasInsurance: data.hasInsurance || false,
      imgUrl: data.imgUrl || '',
      showGroupIdList: data.showGroupIdList || [],
      isPrivate: data.isPrivate || false,
      remark: data.remark || '',
      createTime: Date.now()
    }

    const id = await db.add('express', record)
    return { _id: id, ...record }
  },

  /**
   * 获取群组可见的快递列表
   */
  async getList(groupId) {
    const _ = db.getDB().command
    return db.query('express', {
      showGroupIdList: _.in([groupId]),
      isPrivate: false
    }, { orderBy: 'createTime', order: 'desc' })
  },

  /**
   * 获取我的私人快递
   */
  async getMyPrivateList() {
    const userId = uni.getStorageSync('userInfo')?._id
    return db.query('express', {
      createUserId: userId,
      isPrivate: true
    }, { orderBy: 'createTime', order: 'desc' })
  },

  /**
   * 获取快递详情
   */
  async getDetail(id) {
    const list = await db.query('express', { _id: id })
    return list.length > 0 ? list[0] : null
  },

  /**
   * 更新快递
   */
  async update(id, data) {
    return db.update('express', { _id: id }, data)
  },

  /**
   * 删除快递
   */
  async delete(id) {
    return db.remove('express', { _id: id })
  },

  /**
   * 标记已取件
   */
  async markAsPick(id) {
    return db.update('express', { _id: id }, {
      isPick: true,
      pickTime: Date.now()
    })
  },

  /**
   * 设置群组可见性
   */
  async setGroupVisible(id, groupIds) {
    return db.update('express', { _id: id }, {
      showGroupIdList: groupIds
    })
  },

  /**
   * OCR 图片识别
   */
  async ocrParse(imageUrl) {
    return cloud.ocrParse(imageUrl)
  },

  /**
   * 短信内容解析
   */
  async smsParse(smsText) {
    return cloud.smsParse(smsText)
  }
}

export default expressApi
