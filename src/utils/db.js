// TCB 云数据库操作封装
import tcb from '@cloudbase/database'

// TCB 初始化（在 App.vue 或 main.js 中配置）
let tcbApp = null

/**
 * 初始化 TCB
 */
export function initTCB(config) {
  if (!tcbApp) {
    tcbApp = tcb.init(config)
  }
  return tcbApp
}

/**
 * 获取数据库实例
 */
export function getDB() {
  if (!tcbApp) {
    throw new Error('TCB 未初始化，请先调用 initTCB')
  }
  return tcbApp.database()
}

/**
 * 添加文档
 */
export async function add(collection, data) {
  const db = getDB()
  const res = await db.collection(collection).add(data)
  return res._id
}

/**
 * 查询文档
 */
export async function query(collection, where = {}, options = {}) {
  const db = getDB()
  let query = db.collection(collection).where(where)
  
  if (options.orderBy) {
    query = query.orderBy(options.orderBy, options.order || 'desc')
  }
  if (options.limit) {
    query = query.limit(options.limit)
  }
  
  const res = await query.get()
  return res.data
}

/**
 * 更新文档
 */
export async function update(collection, where, data) {
  const db = getDB()
  const res = await db.collection(collection).where(where).update(data)
  return res.stats.updated
}

/**
 * 删除文档
 */
export async function remove(collection, where) {
  const db = getDB()
  const res = await db.collection(collection).where(where).remove()
  return res.stats.removed
}

/**
 * 监听实时变化
 */
export function onSnapshot(collection, where, callback) {
  const db = getDB()
  return db.collection(collection).where(where).onSnapshot(callback)
}

export default {
  init: initTCB,
  add,
  query,
  update,
  remove,
  onSnapshot,
  callFunction(name, data = {}) {
    return uniCloud.callFunction({
      name,
      data
    }).then(res => {
      // 确保返回的是 result
      return res.result || res
    })
  }
}
