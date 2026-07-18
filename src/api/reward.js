import db from '@/src/utils/db.js'

/**
 * 悬赏 API（适配 TCB — 对应 reward 集合）
 * 字段：_id, publishUserId, code, address, rewardMoney, phone, expectTime,
 *       status, createTime
 */
export const rewardApi = {
  /**
   * 发布悬赏订单
   */
  async publish(data) {
    const userId = uni.getStorageSync('userInfo')?._id
    const userInfo = uni.getStorageSync('userInfo')

    const record = {
      publishUserId: userId,
      code: data.code,
      address: data.address,
      rewardMoney: data.rewardMoney,
      phone: userInfo.phone,
      expectTime: data.expectTime,
      status: 'wait', // 待接单
      createTime: Date.now()
    }

    const id = await db.add('reward', record)
    return { _id: id, ...record }
  },

  /**
   * 获取悬赏列表
   */
  async getList() {
    return db.query('reward', { status: 'wait' }, { orderBy: 'createTime', order: 'desc' })
  },

  /**
   * 获取悬赏详情
   */
  async getDetail(id) {
    const list = await db.query('reward', { _id: id })
    return list.length > 0 ? list[0] : null
  },

  /**
   * 接取悬赏
   */
  async accept(id) {
    return db.update('reward', { _id: id }, {
      status: 'doing',
      acceptTime: Date.now()
    })
  },

  /**
   * 完成悬赏
   */
  async finish(id) {
    return db.update('reward', { _id: id }, {
      status: 'finish',
      finishTime: Date.now()
    })
  },

  /**
   * 取消悬赏
   */
  async cancel(id) {
    return db.update('reward', { _id: id }, {
      status: 'cancel',
      cancelTime: Date.now()
    })
  }
}

export default rewardApi
