<template>
  <view class="order-detail-container">
    <u-navbar 
      title="订单详情" 
      :autoBack="true" 
      placeholder
    />
    
    <scroll-view scroll-y class="main-content">
      <view class="order-card">
        <view class="order-header">
          <text class="order-title">悬赏订单</text>
          <u-tag 
            :text="getStatusText(orderInfo.status)" 
            :type="getStatusType(orderInfo.status)" 
            size="mini"
          />
        </view>
        
        <view class="order-body">
          <view class="info-item">
            <text class="label">快递公司</text>
            <view class="company-info">
              <u-icon 
                :name="getCompanyIcon(orderInfo.company)" 
                size="32" 
                :color="getCompanyColor(orderInfo.company)"
              ></u-icon>
              <text class="value">{{ orderInfo.company }}</text>
            </view>
          </view>
          
          <view class="info-item">
            <text class="label">取件码</text>
            <text class="value">{{ orderInfo.code }}</text>
          </view>
          
          <view class="info-item">
            <text class="label">取件地址</text>
            <text class="value">{{ orderInfo.address }}</text>
          </view>
          
          <view class="info-item">
            <text class="label">悬赏金额</text>
            <text class="value reward-amount">{{ orderInfo.reward_amount }}元</text>
          </view>
          
          <view class="info-item">
            <text class="label">发布人</text>
            <text class="value">{{ getPublisherName() }}</text>
          </view>
          
          <view v-if="orderInfo.acceptor_id" class="info-item">
            <text class="label">接单人</text>
            <text class="value">{{ getAcceptorName() }}</text>
          </view>
          
          <view class="info-item">
            <text class="label">发布时间</text>
            <text class="value">{{ formatTime(orderInfo.created_at) }}</text>
          </view>
          
          <view v-if="orderInfo.accepted_at" class="info-item">
            <text class="label">接单时间</text>
            <text class="value">{{ formatTime(orderInfo.accepted_at) }}</text>
          </view>
          
          <view v-if="orderInfo.completed_at" class="info-item">
            <text class="label">完成时间</text>
            <text class="value">{{ formatTime(orderInfo.completed_at) }}</text>
          </view>
          
          <view v-if="orderInfo.cancelled_at" class="info-item">
            <text class="label">取消时间</text>
            <text class="value">{{ formatTime(orderInfo.cancelled_at) }}</text>
          </view>
          
          <view v-if="orderInfo.remark" class="info-item">
            <text class="label">备注</text>
            <text class="value">{{ orderInfo.remark }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <view class="action-bar">
      <u-button 
        v-if="canCancelOrder" 
        type="error" 
        plain
        @click="cancelOrder"
      >
        取消订单
      </u-button>
      
      <u-button 
        v-if="canCompleteOrder" 
        type="success" 
        @click="completeOrder"
      >
        确认完成
      </u-button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useRewardStore } from '@/src/stores/reward.js'
import { useUserStore } from '@/src/stores/user.js'

const rewardStore = useRewardStore()
const userStore = useUserStore()

const orderId = ref('')
const orderInfo = ref({})

const canCancelOrder = computed(() => {
  return orderInfo.value.status && ['pending', 'accepted'].includes(orderInfo.value.status) && (isOwner.value || isAcceptor.value)
})

const canCompleteOrder = computed(() => {
  return orderInfo.value.status === 'accepted' && isOwner.value
})

const isOwner = computed(() => {
  return userStore.userInfo && orderInfo.value.publisher_id === userStore.userInfo.id
})

const isAcceptor = computed(() => {
  return userStore.userInfo && orderInfo.value.acceptor_id === userStore.userInfo.id
})

onLoad(async (options) => {
  orderId.value = options.id
  await loadOrderDetail()
})

const loadOrderDetail = async () => {
  try {
    const res = await rewardStore.fetchOrderDetail(orderId.value)
    orderInfo.value = res
  } catch (error) {
    console.error('获取订单详情失败:', error)
  }
}

const getStatusText = (status) => {
  const map = { pending: '待接单', accepted: '进行中', completed: '已完成', cancelled: '已取消' }
  return map[status] || '未知'
}

const getStatusType = (status) => {
  const typeMap = { pending: 'warning', accepted: 'primary', completed: 'success', cancelled: 'error' }
  return typeMap[status] || 'info'
}

const getCompanyIcon = (company) => {
  const icons = { '顺丰': 'logo-fangzheng', '圆通': 'logo-yuantong', '中通': 'logo-zhongtong', '申通': 'logo-shentong', '韵达': 'logo-yunda', '京东': 'logo-jd', '邮政': 'logo-youzheng' }
  return icons[company] || 'package'
}

const getCompanyColor = (company) => {
  const colors = { '顺丰': '#e4393c', '圆通': '#f57c00', '中通': '#0099ff', '申通': '#ff9800', '韵达': '#00c853', '京东': '#e4393c', '邮政': '#0099ff' }
  return colors[company] || '#999'
}

const getPublisherName = () => {
  if (!orderInfo.value.publisher_id) return '--'
  if (userStore.userInfo && orderInfo.value.publisher_id === userStore.userInfo.id) return '我'
  return '用户' + orderInfo.value.publisher_id.slice(-4)
}

const getAcceptorName = () => {
  if (!orderInfo.value.acceptor_id) return '--'
  if (userStore.userInfo && orderInfo.value.acceptor_id === userStore.userInfo.id) return '我'
  return '用户' + orderInfo.value.acceptor_id.slice(-4)
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const d = new Date(timeStr)
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
}

const cancelOrder = async () => {
  uni.showModal({
    title: '提示',
    content: '确定要取消该悬赏订单吗？',
    success: async (res) => {
      if (res.confirm) {
        const success = await rewardStore.cancelOrder(orderInfo.value.id)
        if (success) {
          orderInfo.value.status = 'cancelled'
          orderInfo.value.cancelled_at = new Date().toISOString()
          uni.showToast({ title: '订单已取消', icon: 'success' })
        }
      }
    }
  })
}

const completeOrder = async () => {
  const success = await rewardStore.completeOrder(orderInfo.value.id)
  if (success) {
    orderInfo.value.status = 'completed'
    orderInfo.value.completed_at = new Date().toISOString()
    uni.showToast({ title: '任务已完成', icon: 'success' })
  }
}
</script>

<style lang="scss" scoped>
.order-detail-container {
  min-height: 100vh;
  background-color: #f8f8f8;
}

.main-content {
  height: calc(100vh - 88px);
  padding: 20rpx;
}

.order-card {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.order-header {
  padding: 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1rpx solid #f5f5f5;
}

.order-title {
  font-size: 32rpx;
  font-weight: bold;
}

.order-body {
  padding: 0 30rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.info-item .label {
  font-size: 28rpx;
  color: #666;
}

.info-item .value {
  font-size: 28rpx;
  color: #333;
}

.reward-amount {
  font-weight: bold;
  color: #ff9800;
}

.company-info {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.action-bar {
  padding: 20rpx;
  display: flex;
  gap: 20rpx;
  justify-content: center;
  background: #fff;
  border-top: 1rpx solid #f0f0f0;
}
</style>
