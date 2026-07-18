<template>
  <view class="detail-container">
    <u-navbar 
      title="快递详情" 
      :autoBack="true" 
      placeholder
      height="88"
    />
    
    <scroll-view scroll-y class="main-content">
      <view class="express-card">
        <view class="card-header">
          <view class="company-info">
            <u-icon 
              :name="getCompanyIcon(expressInfo.company)" 
              size="40" 
              :color="getCompanyColor(expressInfo.company)"
            ></u-icon>
            <text class="company-name">{{ expressInfo.company }}</text>
            <u-tag 
              v-if="expressInfo.is_bulk" 
              text="大件" 
              type="warning" 
              size="mini"
            />
          </view>
          
          <view class="status-info">
            <u-status-bar 
              :status="expressInfo.status" 
              :is-bulk="expressInfo.is_bulk"
            />
          </view>
        </view>
        
        <view class="card-body">
          <view class="info-item">
            <text class="label">取件码</text>
            <text class="value">{{ expressInfo.code }}</text>
            <u-button 
              size="mini" 
              type="primary" 
              plain
              @click="copyCode"
            >复制</u-button>
          </view>
          
          <view class="info-item">
            <text class="label">取件地址</text>
            <text class="value">{{ expressInfo.address }}</text>
          </view>
          
          <view class="info-item">
            <text class="label">备注</text>
            <text class="value">{{ expressInfo.remark || '无' }}</text>
          </view>
          
          <view class="info-item">
            <text class="label">入库时间</text>
            <text class="value">{{ formatTime(expressInfo.created_at) }}</text>
          </view>
          
          <view 
            v-if="expressInfo.status === 'picked'" 
            class="info-item"
          >
            <text class="label">取件时间</text>
            <text class="value">{{ formatTime(expressInfo.picked_at) }}</text>
          </view>
          
          <view class="info-item">
            <text class="label">可见范围</text>
            <text class="value">{{ getVisibleScopeText() }}</text>
          </view>
          
          <view class="info-item">
            <text class="label">所属群组</text>
            <text class="value">{{ getGroupName() }}</text>
          </view>
        </view>
        
        <view class="card-footer">
          <u-button 
            v-if="expressInfo.status !== 'picked'" 
            type="success" 
            @click="markAsPicked"
          >
            标记为已取件
          </u-button>
          
          <u-button 
            v-else 
            type="info" 
            plain
          >
            已取件
          </u-button>
          
          <u-button 
            v-if="isOwner" 
            type="warning" 
            plain
            @click="showEditModal = true"
          >
            编辑
          </u-button>
          
          <u-button 
            v-if="isOwner" 
            type="error" 
            plain
            @click="confirmDelete"
          >
            删除
          </u-button>
        </view>
      </view>
      
      <!-- 悬赏信息 -->
      <view 
        v-if="hasRewardOrder" 
        class="reward-section"
      >
        <view class="section-header">
          <text class="title">悬赏信息</text>
        </view>
        
        <view class="reward-card">
          <view class="reward-header">
            <text class="reward-amount">赏金: {{ rewardOrder.reward_amount }}元</text>
            <u-tag 
              :text="getOrderStatusText()" 
              :type="getOrderStatusType()" 
              size="mini"
            />
          </view>
          
          <view class="reward-body">
            <view class="reward-item">
              <text class="label">发布人:</text>
              <text class="value">{{ getPublisherName() }}</text>
            </view>
            
            <view 
              v-if="rewardOrder.status !== 'pending'" 
              class="reward-item"
            >
              <text class="label">接单人:</text>
              <text class="value">{{ getAcceptorName() }}</text>
            </view>
            
            <view class="reward-item">
              <text class="label">发布时间:</text>
              <text class="value">{{ formatTime(rewardOrder.created_at) }}</text>
            </view>
            
            <view 
              v-if="rewardOrder.accepted_at" 
              class="reward-item"
            >
              <text class="label">接单时间:</text>
              <text class="value">{{ formatTime(rewardOrder.accepted_at) }}</text>
            </view>
            
            <view 
              v-if="rewardOrder.completed_at" 
              class="reward-item"
            >
              <text class="label">完成时间:</text>
              <text class="value">{{ formatTime(rewardOrder.completed_at) }}</text>
            </view>
            
            <view 
              v-if="rewardOrder.cancelled_at" 
              class="reward-item"
            >
              <text class="label">取消时间:</text>
              <text class="value">{{ formatTime(rewardOrder.cancelled_at) }}</text>
            </view>
          </view>
          
          <view class="reward-footer">
            <u-button 
              v-if="canCompleteOrder" 
              type="success" 
              @click="completeOrder"
            >
              确认完成
            </u-button>
            
            <u-button 
              v-if="canCancelOrder" 
              type="error" 
              plain
              @click="cancelOrder"
            >
              取消订单
            </u-button>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 编辑模态框 -->
    <u-modal 
      v-model="showEditModal" 
      title="编辑快递" 
      :showConfirmButton="false"
      closeOnClickOverlay
    >
      <view class="edit-form">
        <u-form :model="editForm" labelPosition="top">
          <u-form-item label="快递公司">
            <u-input 
              v-model="editForm.company" 
              placeholder="请输入快递公司"
            />
          </u-form-item>
          
          <u-form-item label="取件码">
            <u-input 
              v-model="editForm.code" 
              placeholder="请输入取件码"
            />
          </u-form-item>
          
          <u-form-item label="取件地址">
            <u-input 
              v-model="editForm.address" 
              placeholder="请输入取件地址"
            />
          </u-form-item>
          
          <u-form-item label="备注">
            <u-input 
              v-model="editForm.remark" 
              type="textarea" 
              placeholder="请输入备注"
            />
          </u-form-item>
          
          <u-form-item label="大件包裹">
            <u-switch 
              v-model="editForm.is_bulk" 
              activeColor="#f00"
            />
          </u-form-item>
        </u-form>
        
        <view class="modal-buttons">
          <u-button 
            @click="showEditModal = false" 
            plain
          >
            取消
          </u-button>
          <u-button 
            type="primary" 
            @click="updateExpress"
          >
            保存
          </u-button>
        </view>
      </view>
    </u-modal>
    
    <!-- 确认删除弹窗 -->
    <u-modal 
      v-model="showDeleteConfirm" 
      title="确认删除" 
      content="确定要删除这条快递记录吗？删除后无法恢复。"
      @confirm="deleteExpress"
    />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useExpressStore } from '@/src/stores/express.js'
import { useGroupStore } from '@/src/stores/group.js'
import { useRewardStore } from '@/src/stores/reward.js'
import { showToast, showError } from '@/src/utils/index.js'

// 获取store
const expressStore = useExpressStore()
const groupStore = useGroupStore()
const rewardStore = useRewardStore()

// 页面参数
const expressId = ref('')

// 状态
const expressInfo = ref({})
const showEditModal = ref(false)
const showDeleteConfirm = ref(false)
const editForm = ref({})
const rewardOrder = ref(null)

// 计算属性
const isOwner = computed(() => {
  const userInfo = uni.getStorageSync('userInfo')
  return expressInfo.value.owner_id === userInfo.id
})

const hasRewardOrder = computed(() => {
  return rewardOrder.value !== null
})

const canCompleteOrder = computed(() => {
  return rewardOrder.value && 
    rewardOrder.value.status === 'accepted' && 
    isOwner.value
})

const canCancelOrder = computed(() => {
  return rewardOrder.value && 
    ['pending', 'accepted'].includes(rewardOrder.value.status) && 
    (isOwner.value || rewardOrder.value.acceptor_id === uni.getStorageSync('userInfo').id)
})

// 生命周期
onLoad(async (options) => {
  expressId.value = options.id
  await loadExpressDetail()
})

// 方法
const loadExpressDetail = async () => {
  try {
    // 获取快递详情
    const res = await expressStore.updateExpress(expressId.value, {})
    if (res) {
      expressInfo.value = res
      
      // 初始化编辑表单
      editForm.value = {
        company: res.company,
        code: res.code,
        address: res.address,
        remark: res.remark,
        is_bulk: res.is_bulk
      }
    }
    
    // 获取悬赏订单
    await loadRewardOrder()
  } catch (error) {
    showError('获取快递详情失败')
  }
}

const loadRewardOrder = async () => {
  try {
    const res = await rewardStore.fetchOrderDetail(expressId.value)
    rewardOrder.value = res
  } catch (error) {
    console.error('获取悬赏订单失败:', error)
  }
}

const getCompanyIcon = (company) => {
  const icons = {
    '顺丰': 'logo-fangzheng',
    '圆通': 'logo-yuantong',
    '中通': 'logo-zhongtong',
    '申通': 'logo-shentong',
    '韵达': 'logo-yunda',
    '京东': 'logo-jd',
    '邮政': 'logo-youzheng'
  }
  return icons[company] || 'package'
}

const getCompanyColor = (company) => {
  const colors = {
    '顺丰': '#e4393c',
    '圆通': '#f57c00',
    '中通': '#0099ff',
    '申通': '#ff9800',
    '韵达': '#00c853',
    '京东': '#e4393c',
    '邮政': '#0099ff'
  }
  return colors[company] || '#999'
}

const getVisibleScopeText = () => {
  const scope = expressInfo.value.visible_scope
  const scopeMap = {
    'self': '仅自己可见',
    'appoint': '指定成员可见',
    'all': '全部成员可见'
  }
  return scopeMap[scope] || '全部成员可见'
}

const getGroupName = () => {
  const group = groupStore.groupList.find(g => g.id === expressInfo.value.group_id)
  return group ? group.name : '未知群组'
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return date.getFullYear() + '-' + 
    String(date.getMonth() + 1).padStart(2, '0') + '-' + 
    String(date.getDate()).padStart(2, '0') + ' ' + 
    String(date.getHours()).padStart(2, '0') + ':' + 
    String(date.getMinutes()).padStart(2, '0')
}

const getOrderStatusText = () => {
  const statusMap = {
    'pending': '待接单',
    'accepted': '进行中',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return statusMap[rewardOrder.value.status] || '未知状态'
}

const getOrderStatusType = () => {
  const typeMap = {
    'pending': 'warning',
    'accepted': 'primary',
    'completed': 'success',
    'cancelled': 'error'
  }
  return typeMap[rewardOrder.value.status] || 'info'
}

const getPublisherName = () => {
  const userInfo = uni.getStorageSync('userInfo')
  if (rewardOrder.value.publisher_id === userInfo.id) {
    return '我'
  }
  // 实际项目中应该从用户表获取姓名
  return '用户' + rewardOrder.value.publisher_id.slice(-4)
}

const getAcceptorName = () => {
  const userInfo = uni.getStorageSync('userInfo')
  if (rewardOrder.value.acceptor_id === userInfo.id) {
    return '我'
  }
  // 实际项目中应该从用户表获取姓名
  return '用户' + rewardOrder.value.acceptor_id.slice(-4)
}

const copyCode = () => {
  uni.setClipboardData({
    data: expressInfo.value.code,
    success: () => {
      showToast('取件码已复制')
    }
  })
}

const markAsPicked = async () => {
  const success = await expressStore.markAsPicked(expressId.value)
  if (success) {
    expressInfo.value.status = 'picked'
    expressInfo.value.picked_at = new Date().toISOString()
  }
}

const updateExpress = async () => {
  const success = await expressStore.updateExpress(expressId.value, editForm.value)
  if (success) {
    // 更新本地数据
    Object.assign(expressInfo.value, editForm.value)
    showEditModal.value = false
    showToast('更新成功')
  }
}

const confirmDelete = () => {
  showDeleteConfirm.value = true
}

const deleteExpress = async () => {
  const success = await expressStore.deleteExpress(expressId.value)
  if (success) {
    uni.navigateBack()
    showToast('删除成功')
  }
}

const completeOrder = async () => {
  const success = await rewardStore.completeOrder(rewardOrder.value.id)
  if (success) {
    rewardOrder.value.status = 'completed'
    rewardOrder.value.completed_at = new Date().toISOString()
    showToast('订单已完成')
  }
}

const cancelOrder = async () => {
  const success = await rewardStore.cancelOrder(rewardOrder.value.id)
  if (success) {
    rewardOrder.value.status = 'cancelled'
    rewardOrder.value.cancelled_at = new Date().toISOString()
    showToast('订单已取消')
  }
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

.express-card {
  background: #ffffff;
  margin: 20rpx;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.card-footer {
  padding: 20rpx 30rpx;
  display: flex;
  gap: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.reward-section {
  margin: 20rpx;
  background: #ffffff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.section-header {
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  
  .title {
    font-size: 32rpx;
    font-weight: bold;
  }
}

.reward-card {
  padding: 30rpx;
}

.reward-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  
  .reward-amount {
    font-size: 40rpx;
    font-weight: bold;
    color: #ff9800;
  }
}

.reward-body {
  .reward-item {
    display: flex;
    padding: 15rpx 0;
    
    .label {
      color: #666;
      font-size: 26rpx;
      width: 140rpx;
    }
    
    .value {
      color: #333;
      font-size: 26rpx;
      flex: 1;
    }
  }
}

.reward-footer {
  margin-top: 30rpx;
  display: flex;
  gap: 20rpx;
}

.edit-form {
  padding: 30rpx 0;
  
  .modal-buttons {
    display: flex;
    gap: 20rpx;
    padding: 30rpx;
  }
}
</style>
