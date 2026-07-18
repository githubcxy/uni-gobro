import { CONFIG } from '@/src/config/index.js'

/**
 * WebSocket实时同步服务
 */
class WebSocketService {
  constructor() {
    this.ws = null
    this.isConnected = false
    this.reconnectTimer = null
    this.reconnectCount = 0
    this.maxReconnectTimes = CONFIG.APP.MAX_RECONNECT_TIMES
    this.reconnectInterval = CONFIG.APP.RECONNECT_INTERVAL
    this.subscriptions = new Map()
    this.messageHandlers = new Map()
  }
  
  /**
   * 连接WebSocket
   */
  connect(token) {
    if (this.ws && this.isConnected) {
      console.log('WebSocket已连接')
      return
    }
    
    const wsUrl = `${CONFIG.MEMFIRE.WS_URL}/websocket?apikey=${CONFIG.MEMFIRE.API_KEY}`
    
    try {
      this.ws = uni.connectSocket({
        url: wsUrl,
        header: {
          'Authorization': `Bearer ${token}`
        },
        success: () => {
          console.log('WebSocket连接成功')
        },
        fail: (err) => {
          console.error('WebSocket连接失败:', err)
          this.handleReconnect()
        }
      })
      
      // 监听消息
      this.ws.onMessage((res) => {
        this.handleMessage(res.data)
      })
      
      // 监听关闭
      this.ws.onClose(() => {
        console.log('WebSocket连接关闭')
        this.isConnected = false
        this.handleReconnect()
      })
      
      // 监听错误
      this.ws.onError((err) => {
        console.error('WebSocket错误:', err)
        this.handleReconnect()
      })
      
      // 监听打开
      this.ws.onOpen(() => {
        console.log('WebSocket连接打开')
        this.isConnected = true
        this.reconnectCount = 0
        
        // 重新订阅
        this.resubscribeAll()
      })
      
    } catch (error) {
      console.error('WebSocket初始化失败:', error)
      this.handleReconnect()
    }
  }
  
  /**
   * 处理接收到的消息
   */
  handleMessage(data) {
    try {
      const message = JSON.parse(data)
      
      // 根据事件类型分发处理
      const eventType = message.event
      if (eventType && this.messageHandlers.has(eventType)) {
        const handlers = this.messageHandlers.get(eventType)
        handlers.forEach(handler => handler(message.payload))
      }
      
      // 广播给所有监听器
      if (this.messageHandlers.has('*')) {
        const handlers = this.messageHandlers.get('*')
        handlers.forEach(handler => handler(message))
      }
      
    } catch (error) {
      console.error('处理WebSocket消息失败:', error)
    }
  }
  
  /**
   * 订阅频道
   */
  subscribe(channel, callback) {
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, [])
      
      // 发送订阅消息
      if (this.isConnected) {
        this.send({
          event: 'subscribe',
          channel: channel
        })
      }
    }
    
    this.subscriptions.get(channel).push(callback)
    
    // 返回取消订阅函数
    return () => this.unsubscribe(channel, callback)
  }
  
  /**
   * 取消订阅
   */
  unsubscribe(channel, callback) {
    if (this.subscriptions.has(channel)) {
      const callbacks = this.subscriptions.get(channel)
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
      
      // 如果没有回调了，取消订阅
      if (callbacks.length === 0) {
        this.subscriptions.delete(channel)
        if (this.isConnected) {
          this.send({
            event: 'unsubscribe',
            channel: channel
          })
        }
      }
    }
  }
  
  /**
   * 重新订阅所有频道
   */
  resubscribeAll() {
    for (const [channel] of this.subscriptions) {
      this.send({
        event: 'subscribe',
        channel: channel
      })
    }
  }
  
  /**
   * 监听事件
   */
  on(eventType, callback) {
    if (!this.messageHandlers.has(eventType)) {
      this.messageHandlers.set(eventType, [])
    }
    this.messageHandlers.get(eventType).push(callback)
    
    // 返回取消监听函数
    return () => this.off(eventType, callback)
  }
  
  /**
   * 取消监听事件
   */
  off(eventType, callback) {
    if (this.messageHandlers.has(eventType)) {
      const handlers = this.messageHandlers.get(eventType)
      const index = handlers.indexOf(callback)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }
  
  /**
   * 发送消息
   */
  send(data) {
    if (this.isConnected && this.ws) {
      this.ws.send({
        data: JSON.stringify(data)
      })
    } else {
      console.warn('WebSocket未连接，无法发送消息')
    }
  }
  
  /**
   * 处理重连
   */
  handleReconnect() {
    if (this.reconnectCount >= this.maxReconnectTimes) {
      console.error('达到最大重连次数，停止重连')
      return
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }
    
    // 指数退避策略
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectCount)
    this.reconnectCount++
    
    console.log(`${delay}ms后尝试第${this.reconnectCount}次重连`)
    
    this.reconnectTimer = setTimeout(() => {
      const token = uni.getStorageSync('token')
      if (token) {
        this.connect(token)
      }
    }, delay)
  }
  
  /**
   * 断开连接
   */
  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    
    this.isConnected = false
    this.subscriptions.clear()
    this.messageHandlers.clear()
  }
}

// 导出单例
export default new WebSocketService()
