<template>
  <view class="reward-container">
    <u-navbar 
      title="悬赏广场" 
      :autoBack="true" 
      placeholder
    />
    
    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view 
        v-for="tab in tabs" 
        :key="tab.value"
        :class="['filter-tab', currentTab === tab.value ? 'active' : '']"
        @click="currentTab = tab.value"
      >
        {{ tab.label }}
      </view>
      <view class="filter-btn" @click="showFilter = true">
        <u-icon name="filter" size="24" color="#666"></u-icon>
      </view>
    </view>
    
    <!-- 悬赏列表 -->
    <scroll-view scroll-y class="main-content" @scrolltolower="loadMore">
      <view class="reward-list">
        <view 
          v-for="item in filteredList" 
          :key="item.id" 
          class="reward-card"
          @click="goDetail(item.id)"
        >
          <view class="reward-card-header">
            <view class="company-info">
              <u-icon 
                :name="getCompanyIcon(item.company)" 
                size="36" 
                :color="getCompanyColor(item.company)"
              ></u-icon>
              <text class="company-name">{{ item.company }}</text>
              <u-tag 
                v-if="item.is_bulk" 
                text="大件" 
                type="warning" 
                size="mini"
              />
            </view>
            <text class="reward-amount">{{ item.reward_amount }}元</text>
          </view>
          
          <view class="reward-card-body">
            <text class="code-text">取件码: {{ item.code }}</text>
            <text class="address-text">{{ item.address }}</text>
            <text class="time-text">{{ formatTime(item.created_at) }}</text>
          </view>
          
          <view class="reward-card-footer">
            <view class="publisher-info">
              <u-avatar size="28"></u-avatar>
              <text class="publisher-name">发布人: {{ getPublisherName(item.publisher_id) }}</text>
            </view>
            <u-button 
              v-if="canAccept(item)" 
              type="primary" 
              size="mini"
              @click.stop="acceptOrder(item.id)"
            >
              我要接单
            </u-button>
          </view>
        </view>
      </view>
      
      <view v-if="filteredList.length === 0 && !loading" class="empty-state">
        <u-empty text="暂无悬赏任务" mode="list"></u-empty>
      </view>
      
      <view v-if="loading" class="loading-tip">
        <u-loading-icon mode="spinner" size="24"></u-loading-icon>
        <text>加载中...</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRewardStore } from '@/src/stores/reward.js'
import { useUserStore } from '@/src/stores/user.js'

const rewardStore = useRewardStore()
const userStore = useUserStore()

const currentTab = ref('all')
const loading = ref(false)
const rewardList = ref([])

const tabs = [
  { label: '全部', value: 'all' },
  { label: '大件', value: 'bulk' },
  { label: '小件', value: 'small' }
]

const filteredList = computed(() => {
  switch (currentTab.value) {
    case 'bulk':
      return rewardList.value.filter(item => item.is_bulk)
    case 'small':
      return rewardList.value.filter(item => !item.is_bulk)
    default:
      return rewardList.value
  }
})

onMounted(async () => {
  await loadRewardList()
})

const loadRewardList = async () => {
  loading.value = true
  try {
    const res = await rewardStore.fetchRewardList()
    rewardList.value = res
  } catch (error) {
    console.error('获取悬赏列表失败:', error)
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  // 加载更多数据
}

const getCompanyIcon = (company) => {
  const icons = { '顺丰': 'logo-fangzheng', '圆通': 'logo-yuantong', '中通': 'logo-zhongtong', '申通': 'logo-shentong', '韵达': 'logo-yunda', '京东': 'logo-jd', '邮政': 'logo-youzheng' }
  return icons[company] || 'package'
}

const getCompanyColor = (company) => {
  const colors = { '顺丰': '#e4393c', '圆通': '#f57c00', '中通': '#0099ff', '申通': '#ff9800', '韵达': '#00c853', '京东': '#e4393c', '邮政': '#0099ff' }
  return colors[company] || '#999'
}

const getPublisherName = (publisherId) => {
  if (userStore.userInfo && publisherId === userStore.userInfo.id) return '我'
  return '用户' + (publisherId || '').slice(-4)
}

const canAccept = (item) => {
  return item.status === 'pending' && userStore.isLoggedIn
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const d = new Date(timeStr)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  return (d.getMonth() + 1) + '/' + d.getDate()
}

const goDetail = (id) => {
  uni.navigateTo({ url: '/pages/reward/order-detail?id=' + id })
}

const acceptOrder = async (orderId) => {
  if (!userStore.isLoggedIn) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  uni.showModal({
    title: '提示',
    content: '确定要接单吗？接单后请按时取件。',
    success: async (res) => {
      if (res.confirm) {
        await rewardStore.acceptOrder(orderId)
        loadRewardList()
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.reward-container {
  min-height: 100vh;
  background-color: #f8f8f8;
}

.filter-bar {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}

.filter-tab {
  padding: 8rpx 24rpx;
  font-size: 26rpx;
  color: #666;
  border-radius: 20rpx;
  background: #f5f5f5;
  margin-right: 16rpx;
}

.filter-tab.active {
  background: #e8f4ff;
  color: #2979ff;
}

.filter-btn {
  margin-left: auto;
  padding: 10rpx;
}

.main-content {
  height: calc(100vh - 140px);
}

.reward-list {
  padding: 0 20rpx;
}

.reward-card {
  background: #fff;
  padding: 30rpx;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
}

.reward-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.company-info {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.company-name {
  font-size: 28rpx;
  font-weight: bold;
}

.reward-amount {
  font-size: 36rpx;
  font-weight: bold;
  color: #ff9800;
}

.reward-card-body {
  margin-bottom: 20rpx;
}

.code-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.address-text {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-bottom: 10rpx;
}

.time-text {
  font-size: 22rpx;
  color: #ccc;
}

.reward-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.publisher-info {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.publisher-name {
  font-size: 24rpx;
  color: #999;
}

.empty-state {
  padding: 60rpx 0;
  text-align: center;
}

.loading-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  padding: 30rpx 0;
  font-size: 24rpx;
  color: #999;
}
</style>