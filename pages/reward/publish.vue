<template>
  <view class="publish-container">
    <u-navbar 
      title="发布悬赏" 
      :autoBack="true" 
      placeholder
    />
    
    <scroll-view scroll-y class="main-content">
      <u-form :model="form" ref="formRef" labelPosition="top">
        <u-form-item label="快递公司" prop="company" :rules="[{ required: true, message: '请输入快递公司', trigger: 'blur' }]">
          <u-input 
            v-model="form.company" 
            placeholder="请输入快递公司"
            clearable
          />
        </u-form-item>
        
        <u-form-item label="取件码" prop="code" :rules="[{ required: true, message: '请输入取件码', trigger: 'blur' }]">
          <u-input 
            v-model="form.code" 
            placeholder="请输入取件码"
            clearable
          />
        </u-form-item>
        
        <u-form-item label="取件地址" prop="address" :rules="[{ required: true, message: '请输入取件地址', trigger: 'blur' }]">
          <u-input 
            v-model="form.address" 
            placeholder="请输入取件地址"
            clearable
          />
        </u-form-item>
        
        <u-form-item label="悬赏金额" prop="rewardAmount" :rules="[{ required: true, message: '请输入悬赏金额', trigger: 'blur' }]">
          <view class="amount-input">
            <text class="currency">¥</text>
            <u-input 
              v-model="form.reward_amount" 
              type="digit"
              placeholder="0.00"
            />
          </view>
        </u-form-item>
        
        <u-form-item label="备注" prop="remark">
          <u-input 
            v-model="form.remark" 
            type="textarea" 
            placeholder="请输入备注（可选）"
            :maxlength="200"
          />
        </u-form-item>
        
        <u-form-item label="是否为大件" prop="is_bulk">
          <u-switch 
            v-model="form.is_bulk" 
            activeColor="#ff9800"
          />
        </u-form-item>
      </u-form>
    </scroll-view>
    
    <view class="footer">
      <u-button 
        type="primary" 
        @click="submitForm"
        :loading="loading"
      >
        发布悬赏
      </u-button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { useExpressStore } from '@/src/stores/express.js'
import { useRewardStore } from '@/src/stores/reward.js'
import { useUserStore } from '@/src/stores/user.js'

const expressStore = useExpressStore()
const rewardStore = useRewardStore()
const userStore = useUserStore()

const formRef = ref(null)
const loading = ref(false)
const form = ref({
  company: '',
  code: '',
  address: '',
  reward_amount: '',
  remark: '',
  is_bulk: false
})

const submitForm = async () => {
  if (!userStore.isLoggedIn) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  
  if (!form.value.reward_amount || parseFloat(form.value.reward_amount) <= 0) {
    uni.showToast({ title: '请输入有效的悬赏金额', icon: 'none' })
    return
  }
  
  loading.value = true
  
  try {
    const data = {
      company: form.value.company.trim(),
      code: form.value.code.trim(),
      address: form.value.address.trim(),
      reward_amount: parseFloat(form.value.reward_amount),
      remark: form.value.remark.trim(),
      is_bulk: form.value.is_bulk
    }
    
    const expressId = await expressStore.publishExpress(data)
    
    if (expressId) {
      // 创建悬赏订单
      const order = await rewardStore.publishOrder(expressId)
      if (order) {
        uni.showToast({ title: '悬赏发布成功', icon: 'success' })
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      }
    }
  } catch (error) {
    console.error('发布悬赏失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.publish-container {
  min-height: 100vh;
  background-color: #f8f8f8;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 20rpx;
}

.amount-input {
  display: flex;
  align-items: center;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  padding: 10rpx 20rpx;
}

.currency {
  font-size: 32rpx;
  font-weight: bold;
  color: #ff9800;
  margin-right: 10rpx;
}

.footer {
  padding: 20rpx;
  background-color: #ffffff;
  border-top: 1rpx solid #f0f0f0;
}
</style>
