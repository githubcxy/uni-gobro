<template>
  <view class="detail-container">
    <u-navbar 
      title="群组详情" 
      :autoBack="true" 
      placeholder
    />
    
    <scroll-view scroll-y class="main-content">
      <!-- 群基本信息 -->
      <view class="group-card">
        <view class="group-header">
          <image 
            v-if="groupInfo.avatar" 
            :src="groupInfo.avatar" 
            mode="aspectFill"
            class="group-avatar"
          ></image>
          <view v-else class="group-avatar-placeholder">
            <u-icon name="home" size="60" color="#2979ff"></u-icon>
          </view>
          <view class="group-info">
            <text class="group-name">{{ groupInfo.name }}</text>
            <text class="group-desc">{{ groupInfo.description || '暂无描述' }}</text>
          </view>
        </view>
        
        <view class="group-stats">
          <view class="stat-item">
            <text class="stat-value">{{ members.length }}</text>
            <text class="stat-label">成员数</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ expressCount }}</text>
            <text class="stat-label">快递数</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ joinedAt }}</text>
            <text class="stat-label">加入时间</text>
          </view>
        </view>
      </view>
      
      <!-- 群成员列表 -->
      <view class="members-card">
        <view class="card-title">
          <text>群成员</text>
          <text class="add-btn" @click="showInvite">邀请</text>
        </view>
        
        <view class="member-list">
          <view 
            v-for="member in members" 
            :key="member.id" 
            class="member-item"
          >
            <u-avatar :src="member.avatar || member.avatar" size="60"></u-avatar>
            <view class="member-info">
              <text class="member-name">{{ member.nickname || '用户' + (member.id || '').slice(-4) }}</text>
              <text class="member-role" v-if="member.role === 'owner'">群主</text>
              <u-tag 
                v-else-if="member.role === 'admin'" 
                text="管理员" 
                type="primary" 
                size="mini"
              />
            </view>
          </view>
        </view>
      </view>
      
      <!-- 快递列表 -->
      <view class="express-card">
        <view class="card-title">
          <text>快递列表</text>
          <view class="filter-tabs">
            <view 
              v-for="tab in statusTabs" 
              :key="tab.value"
              :class="['tab-item', currentTab === tab.value ? 'active' : '']"
              @click="currentTab = tab.value"
            >
              {{ tab.label }}
            </view>
          </view>
        </view>
        
        <view class="express-list">
          <view 
            v-for="item in filteredList" 
            :key="item.id" 
            class="express-item"
            @click="goDetail(item.id)"
          >
            <view class="express-header">
              <view class="company-info">
                <u-icon 
                  :name="getCompanyIcon(item.company)" 
                  size="32" 
                  :color="getCompanyColor(item.company)"
                ></u-icon>
                <text class="company-name">{{ item.company }}</text>
              </view>
              <u-tag 
                :text="getStatusText(item.status)" 
                :type="getStatusType(item.status)" 
                size="mini"
              />
            </view>
            <view class="express-body">
              <text class="code-label">取件码: {{ item.code }}</text>
              <text class="address-text">{{ item.address }}</text>
            </view>
            <text class="time-text">{{ formatTime(item.created_at) }}</text>
          </view>
        </view>
        
        <view v-if="filteredList.length === 0" class="empty-state">
          <u-empty text="暂无快递记录" mode="list"></u-empty>
        </view>
      </view>
    </scroll-view>
    
    <!-- 群操作菜单 -->
    <view class="action-bar">
      <u-button 
        v-if="role === 'owner' || role === 'admin'" 
        type="primary" 
        @click="showQRCode"
        size="small"
      >
        群二维码
      </u-button>
      <u-button 
        v-else 
        type="primary" 
        @click="leaveGroup"
        size="small"
      >
        退出群组
      </u-button>
    </view>
    
    <!-- 邀请二维码弹窗 -->
    <u-modal 
      v-model="showQR" 
      :showConfirmButton="false" 
      closeOnClickOverlay
    >
      <view class="qr-modal">
        <view class="qr-title">邀请加入群组</view>
        <view class="qr-placeholder">
          <u-icon name="qrcode" size="200"></u-icon>
        </view>
        <view class="qr-desc">
          <text>群名称: {{ groupInfo.name }}</text>
          <text>成员数: {{ members.length }}</text>
        </view>
        <view class="qr-actions">
          <u-button @click="shareGroup" type="primary" size="mini">
            分享给好友
          </u-button>
          <u-button @click="showQR = false" size="mini">
            关闭
          </u-button>
        </view>
      </view>
    </u-modal>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useGroupStore } from '@/src/stores/group.js'
import { useExpressStore } from '@/src/stores/express.js'

const groupStore = useGroupStore()
const expressStore = useExpressStore()

const groupId = ref('')
const groupInfo = ref({})
const members = ref([])
const expressList = ref([])
const currentTab = ref('pending')
const showQR = ref(false)
const role = ref('')

const statusTabs = [
  { label: '全部', value: '' },
  { label: '待取', value: 'pending' },
  { label: '已取', value: 'picked' }
]

const expressCount = computed(() => expressList.value.length)

const joinedAt = computed(() => {
  if (!groupInfo.value.joined_at) return '--'
  return formatTimeShort(groupInfo.value.joined_at)
})

const filteredList = computed(() => {
  if (!currentTab.value) return expressList.value
  return expressList.value.filter(item => item.status === currentTab.value)
})

onLoad(async (options) => {
  groupId.value = options.id
  await loadGroupDetail()
})

const loadGroupDetail = async () => {
  try {
    // 获取群组详情
    const groups = await groupStore.fetchGroupList()
    const group = groups.find(g => g.id === groupId.value)
    if (group) {
      groupInfo.value = group
      
      // 获取群组成员
      await groupStore.fetchMembers(group.id)
      members.value = groupStore.members
      
      // 确定当前用户角色
      const member = groupStore.members.find(m => m.group_id === group.id)
      if (member) role.value = member.role
      
      // 获取快递列表
      await expressStore.fetchExpressList(group.id, {})
      expressList.value = expressStore.expressList
    }
  } catch (error) {
    console.error('加载群组详情失败:', error)
  }
}

const getCompanyIcon = (company) => {
  const icons = { '顺丰': 'logo-fangzheng', '圆通': 'logo-yuantong', '中通': 'logo-zhongtong', '申通': 'logo-shentong', '韵达': 'logo-yunda', '京东': 'logo-jd', '邮政': 'logo-youzheng' }
  return icons[company] || 'package'
}

const getCompanyColor = (company) => {
  const colors = { '顺丰': '#e4393c', '圆通': '#f57c00', '中通': '#0099ff', '申通': '#ff9800', '韵达': '#00c853', '京东': '#e4393c', '邮政': '#0099ff' }
  return colors[company] || '#999'
}

const getStatusText = (status) => {
  const map = { pending: '待取', picked: '已取' }
  return map[status] || '未知'
}

const getStatusType = (status) => {
  const map = { pending: 'warning', picked: 'success' }
  return map[status] || 'info'
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const d = new Date(timeStr)
  return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate() + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
}

const formatTimeShort = (timeStr) => {
  if (!timeStr) return '--'
  const d = new Date(timeStr)
  return (d.getMonth() + 1) + '/' + d.getDate()
}

const goDetail = (id) => {
  uni.navigateTo({ url: '/pages/express/detail?id=' + id })
}

const showInvite = () => {
  showQR.value = true
}

const showQRCode = () => {
  showQR.value = true
}

const leaveGroup = () => {
  uni.showModal({
    title: '提示',
    content: '确定退出该群组吗？',
    success: async (res) => {
      if (res.confirm) {
        await groupStore.leaveGroup(groupId.value)
      }
    }
  })
}

const shareGroup = () => {
  uni.showToast({ title: '分享功能开发中', icon: 'none' })
}
</script>

<style lang="scss" scoped>
.detail-container {
  min-height: 100vh;
  background-color: #f8f8f8;
}

.main-content {
  height: calc(100vh - 88px);
}

.group-card {
  background: #fff;
  margin: 20rpx;
  padding: 40rpx;
  border-radius: 20rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
}

.group-header {
  display: flex;
  align-items: center;
  gap: 30rpx;
}

.group-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
}

.group-avatar-placeholder {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: #e8f4ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.group-info {
  flex: 1;
}

.group-name {
  font-size: 36rpx;
  font-weight: bold;
  display: block;
}

.group-desc {
  font-size: 26rpx;
  color: #999;
  margin-top: 10rpx;
  display: block;
}

.group-stats {
  display: flex;
  justify-content: space-around;
  margin-top: 30rpx;
  padding-top: 30rpx;
  border-top: 1rpx solid #f5f5f5;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 32rpx;
  font-weight: bold;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.members-card,
.express-card {
  background: #fff;
  margin: 20rpx;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
}

.card-title {
  padding: 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1rpx solid #f5f5f5;
}

.add-btn {
  font-size: 26rpx;
  color: #2979ff;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.member-info {
  display: flex;
  flex-direction: column;
}

.member-name {
  font-size: 28rpx;
}

.member-role {
  font-size: 22rpx;
  color: #2979ff;
  margin-top: 4rpx;
}

.express-item {
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.express-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
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

.express-body {
  display: flex;
  gap: 20rpx;
  align-items: center;
}

.code-label {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.address-text {
  font-size: 24rpx;
  color: #999;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.time-text {
  font-size: 22rpx;
  color: #ccc;
  margin-top: 10rpx;
  display: block;
}

.filter-tabs {
  display: flex;
  gap: 10rpx;
}

.tab-item {
  padding: 6rpx 20rpx;
  font-size: 24rpx;
  color: #666;
  border-radius: 20rpx;
  background: #f5f5f5;
}

.tab-item.active {
  background: #e8f4ff;
  color: #2979ff;
}

.empty-state {
  padding: 40rpx 0;
}

.action-bar {
  padding: 20rpx;
  display: flex;
  justify-content: flex-end;
  background: #fff;
  border-top: 1rpx solid #f0f0f0;
}

.qr-modal {
  padding: 30rpx;
  text-align: center;
}

.qr-title {
  font-size: 30rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
}

.qr-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx;
  background: #f9f9f9;
  border-radius: 12rpx;
}

.qr-desc {
  margin-top: 30rpx;
  font-size: 26rpx;
  color: #666;
  line-height: 2;
}

.qr-actions {
  display: flex;
  gap: 20rpx;
  justify-content: center;
  margin-top: 40rpx;
}
</style>
