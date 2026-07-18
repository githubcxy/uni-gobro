<template>
  <view class="container">
    <view class="title">快递群组管理APP - TCB适配版</view>
    
    <view class="section">
      <text class="section-title">项目状态</text>
      <view class="status-item">
        <text class="label">数据库</text>
        <text class="value">腾讯云TCB (MongoDB)</text>
      </view>
      <view class="status-item">
        <text class="label">认证方式</text>
        <text class="value">手机号 + 验证码</text>
      </view>
      <view class="status-item">
        <text class="label">实时同步</text>
        <text class="value">TCB 实时数据库</text>
      </view>
    </view>
    
    <view class="section">
      <text class="section-title">主要功能</text>
      <view class="feature-item">
        <text>✓</text>
        <text>短信自动解析</text>
      </view>
      <view class="feature-item">
        <text>✓</text>
        <text>系统分享导入</text>
      </view>
      <view class="feature-item">
        <text>✓</text>
        <text>OCR图片识别</text>
      </view>
      <view class="feature-item">
        <text>✓</text>
        <text>手动录入</text>
      </view>
      <view class="feature-item">
        <text>✓</text>
        <text>多群组管理</text>
      </view>
      <view class="feature-item">
        <text>✓</text>
        <text>悬赏订单</text>
      </view>
    </view>
    
    <view class="section">
      <text class="section-title">下一步</text>
      <view class="next-step">
        <text>1. 部署云函数</text>
      </view>
      <view class="next-step">
        <text>2. 创建数据库集合</text>
      </view>
      <view class="next-step">
        <text>3. 配置TCB环境</text>
      </view>
      <view class="next-step">
        <text>4. 测试登录功能</text>
      </view>
    </view>
    
    <view class="footer">
      <text>快递群组管理APP - TCB适配版</text>
      <text>v1.0.0</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      
    }
  },
  methods: {
    
  }
}
</script>

<style>
.container {
  padding: 20px;
  background-color: #f8f8f8;
  min-height: 100vh;
}

.title {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.section {
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
  display: block;
}

.status-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.status-item:last-child {
  border-bottom: none;
}

.label {
  color: #666;
  font-size: 16px;
}

.value {
  color: #333;
  font-size: 16px;
  font-weight: 500;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  color: #333;
  font-size: 16px;
}

.next-step {
  padding: 8px 0;
  color: #333;
  font-size: 16px;
}

.footer {
  text-align: center;
  margin-top: 30px;
  color: #999;
  font-size: 14px;
}

.footer text:last-child {
  margin-left: 10px;
}
</style>