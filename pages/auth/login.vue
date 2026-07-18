<template>
  <view class="login-container">
    <!-- 顶部装饰 -->
    <view class="header-decoration">
      <view class="decoration-circle circle-1"></view>
      <view class="decoration-circle circle-2"></view>
    </view>
    
    <!-- Logo和标题 -->
    <view class="logo-section">
      <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
      <text class="app-name">快递群组</text>
      <text class="app-desc">家庭/宿舍快递共享与悬赏互助</text>
    </view>
    
    <!-- 登录表单 -->
    <view class="form-section">
      <view class="input-group">
        <u-input 
          v-model="phone" 
          placeholder="请输入手机号" 
          type="number"
          maxlength="11"
          prefixIcon="phone"
          clearable
        ></u-input>
      </view>
      
      <view class="input-group code-input-group">
        <u-input 
          v-model="code" 
          placeholder="请输入验证码" 
          type="number"
          maxlength="6"
          prefixIcon="lock"
        ></u-input>
        <u-button 
          :disabled="countdown > 0" 
          @click="sendCode"
          size="small"
          type="primary"
        >
          {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
        </u-button>
      </view>
      
      <view class="agreement">
        <u-checkbox v-model="agreeAgreement" label="我已阅读并同意《用户协议》和《隐私政策》"></u-checkbox>
      </view>
      
      <u-button 
        type="primary" 
        size="large"
        :loading="loading"
        @click="handleLogin"
        class="login-btn"
      >
        登录
      </u-button>
    </view>
    
    <!-- 底部提示 -->
    <view class="footer-tip">
      <text>首次登录即自动注册</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/src/stores/user.js'
import { validatePhone, validateCode, showError } from '@/src/utils/index.js'

const userStore = useUserStore()

// 表单数据
const phone = ref('')
const code = ref('')
const agreeAgreement = ref(false)
const loading = ref(false)
const countdown = ref(0)
let timer = null

/**
 * 发送验证码
 */
const sendCode = async () => {
  if (!validatePhone(phone.value)) {
    showError('请输入正确的手机号')
    return
  }
  
  const success = await userStore.sendVerificationCode(phone.value)
  if (success) {
    // 开始倒计时
    countdown.value = 60
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
        timer = null
      }
    }, 1000)
  }
}

/**
 * 处理登录
 */
const handleLogin = async () => {
  // 验证
  if (!validatePhone(phone.value)) {
    showError('请输入正确的手机号')
    return
  }
  
  if (!validateCode(code.value)) {
    showError('请输入6位验证码')
    return
  }
  
  if (!agreeAgreement.value) {
    showError('请同意用户协议和隐私政策')
    return
  }
  
  // 登录
  loading.value = true
  try {
    const success = await userStore.login(phone.value, code.value)
    if (success) {
      // 跳转到首页
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/index/index'
        })
      }, 500)
    }
  } finally {
    loading.value = false
  }
}

// 页面卸载时清除定时器
import { onUnmounted } from 'vue'
onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 40rpx;
  position: relative;
  overflow: hidden;
}

.header-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 400rpx;
  pointer-events: none;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.circle-1 {
  width: 300rpx;
  height: 300rpx;
  top: -100rpx;
  right: -50rpx;
}

.circle-2 {
  width: 200rpx;
  height: 200rpx;
  top: 100rpx;
  left: -80rpx;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 120rpx;
  margin-bottom: 80rpx;
}

.logo {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 30rpx;
}

.app-name {
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 16rpx;
}

.app-desc {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.form-section {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.input-group {
  margin-bottom: 30rpx;
}

.code-input-group {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.code-input-group ::v-deep .u-input {
  flex: 1;
}

.agreement {
  margin: 30rpx 0;
}

.login-btn {
  margin-top: 20rpx;
}

.footer-tip {
  text-align: center;
  margin-top: 40rpx;
  color: rgba(255, 255, 255, 0.8);
  font-size: 26rpx;
}
</style>
