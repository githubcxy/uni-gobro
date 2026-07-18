<template>
  <view class="mine-container">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="user-info">
        <image class="avatar" src="/static/avatar-default.png" mode="aspectFill"></image>
        <view class="info-text">
          <text class="nickname">{{ userStore.userName }}</text>
          <text class="phone">{{ userStore.userPhone || '未绑定手机' }}</text>
        </view>
      </view>
      <u-button size="small" type="primary" @click="goToEditProfile">编辑</u-button>
    </view>
    
    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="menu-item" @click="goToGroups">
        <u-icon name="group" size="20"></u-icon>
        <text class="menu-text">我的群组</text>
        <u-icon name="arrow-right" size="14" color="#999"></u-icon>
      </view>
      
      <view class="menu-item" @click="goToMyRewards">
        <u-icon name="wallet" size="20"></u-icon>
        <text class="menu-text">我的悬赏</text>
        <u-icon name="arrow-right" size="14" color="#999"></u-icon>
      </view>
      
      <view class="menu-item" @click="showSettings = true">
        <u-icon name="setting" size="20"></u-icon>
        <text class="menu-text">设置</text>
        <u-icon name="arrow-right" size="14" color="#999"></u-icon>
      </view>
    </view>
    
    <!-- 隐私设置 -->
    <view class="privacy-section">
      <view class="section-title">隐私设置</view>
      
      <view class="setting-item">
        <text>全局共享开关</text>
        <u-switch 
          v-model="globalShare" 
          @change="handleGlobalShareChange"
        ></u-switch>
      </view>
      
      <view class="setting-desc">
        关闭后，所有群组中的成员都无法查看你的快递
      </view>
    </view>
    
    <!-- 退出登录 -->
    <view class="logout-section">
      <u-button type="error" @click="handleLogout">退出登录</u-button>
    </view>
    
    <!-- 设置弹窗 -->
    <u-popup v-model:show="showSettings" mode="bottom">
      <view class="settings-content">
        <view class="settings-header">
          <text>设置</text>
          <u-icon name="close" @click="showSettings = false"></u-icon>
        </view>
        
        <view class="setting-list">
          <view class="setting-item">
            <text>消息通知</text>
            <u-switch v-model="notifyEnabled"></u-switch>
          </view>
          
          <view class="setting-item">
            <text>显示手机号</text>
            <u-switch v-model="showPhone"></u-switch>
          </view>
          
          <view class="setting-item">
            <text>清除缓存</text>
            <u-button size="mini" @click="clearCache">清除</u-button>
          </view>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/src/stores/user.js'

const userStore = useUserStore()

// 数据
const globalShare = ref(true)
const showSettings = ref(false)
const notifyEnabled = ref(true)
const showPhone = ref(false)

/**
 * 处理全局共享开关变化
 */
const handleGlobalShareChange = async (value) => {
  await userStore.setGlobalShare(value)
}

/**
 * 跳转到编辑资料
 */
const goToEditProfile = () => {
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  })
}

/**
 * 跳转到我的群组
 */
const goToGroups = () => {
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  })
}

/**
 * 跳转到我的悬赏
 */
const goToMyRewards = () => {
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  })
}

/**
 * 清除缓存
 */
const clearCache = () => {
  uni.showModal({
    title: '提示',
    content: '确定清除缓存吗？',
    success: (res) => {
      if (res.confirm) {
        uni.clearStorageSync()
        uni.showToast({
          title: '清除成功',
          icon: 'success'
        })
      }
    }
  })
}

/**
 * 退出登录
 */
const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
      }
    }
  })
}

// 页面加载时
onMounted(() => {
  // 获取用户信息
  if (userStore.isLoggedIn) {
    globalShare.value = userStore.userInfo?.share_global ?? true
  }
})
</script>

<style lang="scss" scoped>
.mine-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.user-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: #fff;
}

.info-text {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.nickname {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
}

.phone {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

.menu-section {
  background: #fff;
  margin: 20rpx 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.menu-text {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.privacy-section {
  background: #fff;
  margin: 20rpx 0;
  padding: 30rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 24rpx;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
}

.setting-desc {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.logout-section {
  padding: 30rpx;
}

.settings-content {
  padding: 30rpx;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
}

.setting-list {
  .setting-item {
    padding: 24rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
  }
}
</style>
