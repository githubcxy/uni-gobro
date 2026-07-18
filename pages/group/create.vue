<template>
  <view class="create-container">
    <u-navbar 
      title="创建群组" 
      :autoBack="true" 
      placeholder
    />
    
    <scroll-view scroll-y class="form-content">
      <u-form :model="form" ref="formRef" labelPosition="top">
        <u-form-item label="群组名称" prop="name" :rules="[{ required: true, message: '请输入群组名称', trigger: 'blur' }]">
          <u-input 
            v-model="form.name" 
            placeholder="请输入群组名称"
            clearable
          />
        </u-form-item>
        
        <u-form-item label="群组描述" prop="description">
          <u-input 
            v-model="form.description" 
            type="textarea" 
            placeholder="请输入群组描述（可选）"
            :maxlength="200"
            :autosize="{ fixed: false, minHeight: 100 }"
          />
        </u-form-item>
        
        <u-form-item label="群组头像" prop="avatar">
          <view class="avatar-upload" @click="chooseAvatar">
            <image 
              v-if="form.avatar" 
              :src="form.avatar" 
              mode="aspectFill"
              class="avatar-preview"
            ></image>
            <view v-else class="avatar-placeholder">
              <u-icon name="photo" size="40" color="#999"></u-icon>
              <text class="upload-text">上传头像</text>
            </view>
          </view>
        </u-form-item>
        
        <u-form-item label="验证方式" prop="authRequired">
          <u-radio-group v-model="form.authRequired" direction="column">
            <u-radio label="true">需要验证</u-radio>
            <u-radio label="false">无需验证</u-radio>
          </u-radio-group>
        </u-form-item>
      </u-form>
    </scroll-view>
    
    <view class="footer">
      <u-button 
        type="primary" 
        @click="submitForm"
        :loading="loading"
      >
        创建群组
      </u-button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useGroupStore } from '@/src/stores/group.js'

const groupStore = useGroupStore()

const formRef = ref(null)
const loading = ref(false)
const form = ref({
  name: '',
  description: '',
  avatar: '',
  auth_required: false
})

onLoad(() => {
  // 页面加载时的初始化
})

const chooseAvatar = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0]
      
      // 上传头像到服务器
      uni.uploadFile({
        url: 'https://your-cdn-url.com/upload',
        filePath: tempFilePath,
        name: 'file',
        formData: { type: 'avatar' },
        success: (uploadRes) => {
          const res = JSON.parse(uploadRes.data)
          form.value.avatar = res.url
        },
        fail: (err) => {
          uni.showToast({ title: '上传失败', icon: 'none' })
        }
      })
    }
  })
}

const submitForm = async () => {
  // 表单验证
  if (!form.value.name.trim()) {
    uni.showToast({ title: '请输入群组名称', icon: 'none' })
    return
  }
  
  loading.value = true
  
  try {
    const data = {
      name: form.value.name.trim(),
      description: form.value.description.trim(),
      avatar: form.value.avatar,
      auth_required: form.value.authRequired === 'true'
    }
    
    const result = await groupStore.createGroup(data)
    
    if (result) {
      uni.showToast({ title: '群组创建成功', icon: 'success' })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  } catch (error) {
    console.error('创建群组失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.create-container {
  min-height: 100vh;
  background-color: #f8f8f8;
  display: flex;
  flex-direction: column;
}

.form-content {
  flex: 1;
  padding: 20rpx;
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  cursor: pointer;
}

.avatar-preview {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
}

.avatar-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
}

.upload-text {
  font-size: 24rpx;
  color: #999;
}

.footer {
  padding: 20rpx;
  background-color: #ffffff;
  border-top: 1rpx solid #f0f0f0;
}
</style>
