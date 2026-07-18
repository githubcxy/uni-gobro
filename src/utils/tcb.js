import { CONFIG } from '@/src/config/index.js'
import uniCloud from 'uni-cloud'

/**
 * TCB 云数据库操作封装
 */
class TCBDatabase {
  constructor() {
    this.db = uniCloud.database()
    this.env = CONFIG.TCB.ENV
  }

  /**
   * 获取集合
   */
  collection(name) {
    return this.db.collection(name)
  }

  /**
   * 查询数据
   */
  async query(collectionName, where = {}, options = {}) {
    try {
      const { orderBy = 'createTime', order = 'desc', limit = 100, skip = 0 } = options
      
      let query = this.collection(collectionName)
      
      // 查询条件
      if (Object.keys(where).length > 0) {
        query = query.where(where)
      }
      
      // 排序
      if (orderBy) {
        query = query.orderBy(orderBy, order)
      }
      
      // 分页
      if (limit > 0) {
        query = query.limit(limit)
      }
      if (skip > 0) {
        query = query.skip(skip)
      }
      
      const res = await query.get()
      return res.data
    } catch (error) {
      console.error('查询失败:', error)
      throw error
    }
  }

  /**
   * 添加数据
   */
  async add(collectionName, data) {
    try {
      // 自动添加时间戳
      if (!data.createTime) {
        data.createTime = new Date()
      }
      
      const res = await this.collection(collectionName).add(data)
      return res._id
    } catch (error) {
      console.error('添加失败:', error)
      throw error
    }
  }

  /**
   * 更新数据
   */
  async update(collectionName, where, data) {
    try {
      const res = await this.collection(collectionName)
        .where(where)
        .update(data)
      return res.stats.updated
    } catch (error) {
      console.error('更新失败:', error)
      throw error
    }
  }

  /**
   * 删除数据
   */
  async remove(collectionName, where) {
    try {
      const res = await this.collection(collectionName)
        .where(where)
        .remove()
      return res.stats.removed
    } catch (error) {
      console.error('删除失败:', error)
      throw error
    }
  }

  /**
   * 监听数据变化（实时同步）
   */
  watch(collectionName, where, callback) {
    try {
      let query = this.collection(collectionName)
      
      if (Object.keys(where).length > 0) {
        query = query.where(where)
      }
      
      return query.watch({
        onChange: (snapshot) => {
          if (snapshot.type === 'updated') {
            callback(snapshot.doc, snapshot.type)
          }
        },
        onError: (err) => {
          console.error('监听错误:', err)
        }
      })
    } catch (error) {
      console.error('监听失败:', error)
      throw error
    }
  }

  /**
   * 聚合查询
   */
  async aggregate(collectionName, pipeline) {
    try {
      const res = await this.collection(collectionName).aggregate().pipeline(pipeline).end()
      return res.data
    } catch (error) {
      console.error('聚合查询失败:', error)
      throw error
    }
  }
}

export default new TCBDatabase()
