<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/src/stores/user.js'
import { useGroupStore } from '@/src/stores/group.js'
import { useExpressStore } from '@/src/stores/express.js'
import { showError, showToast } from '@/src/utils/index.js'

const userStore = useUserStore()
const groupStore = useGroupStore()
const expressStore = useExpressStore()

// 数据
const method = ref('manual')
const smsContent = ref('')
const smsParsed = ref(false)
const showConfirmModal = ref(false)
const submitting = ref(false)
const showCompanyPicker = ref(false)

// OCR 相关
const ocrImage = ref('')
const ocrLoading = ref(false)

// iOS 转发相关
const iosForwardGuide = ref({
  title: 'iOS 短信转发说明',
  steps: [
    '1. 打开"设置" > "信息"',
    '2. 找到"短信转发"功能',
    '3. 开启转发到指定号码',
    '4. 将快递短信转发到服务器号码'
  ],
  note: '请确保您的设备支持短信转发功能',
  forwardNumber: '10086' // 服务器号码
})

// 表单数据
const formData = ref({
  company: '',
  pickup_code: '',
  address: '',
  remark: ''
})

// 群组相关
const groupList = ref([])
const selectedGroups = ref([])
const visibleScope = ref('all')

// 快递公司列表
const companies = [
  '顺丰速运', '圆通速递', '中通快递', '申通快递', 
  '韵达快递', '百世快递', '京东物流', '德邦快递',
  '极兔速递', '邮政EMS', '其他'
]

/**
 * 选择公司
 */
const onCompanyConfirm = (e) => {
  formData.value.company = e.value[0]
  showCompanyPicker.value = false
}

/**
 * 解析短信
 */
const parseSms = () => {
  if (!smsContent.value) {
    showError('请输入短信内容')
    return
  }
  
  const result = expressStore.parseSmsContent(smsContent.value)
  
  if (result.company) {
    formData.value.company = result.company
  }
  if (result.code) {
    formData.value.pickup_code = result.code
  }
  if (result.address) {
    formData.value.address = result.address
  }
  
  if (result.company || result.code) {
    smsParsed.value = true
    showToast('解析成功')
  } else {
    showError('未能识别快递信息，请手动填写')
  }
}

/**
 * OCR 上传图片
 */
const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    ocrImage.value = e.target.result
  }
  reader.readAsDataURL(file)
}

/**
 * 执行 OCR 识别
 */
const performOCR = async () => {
  if (!ocrImage.value) return
  
  ocrLoading.value = true
  
  try {
    // Base64 编码图片
    const base64 = ocrImage.value.split(',')[1]
    
    // 调用后端 OCR 识别接口
    const res = await request.post('/ocr/express', {
      image: base64
    })
    
    if (res && res.company) {
      formData.value.company = res.company
      formData.value.pickup_code = res.code
      formData.value.address = res.address || ''
      
      showToast('识别成功')
      method.value = 'manual'
    } else {
      showError('识别失败，请重试或手动填写')
    }
  } catch (error) {
    showError(error.message || 'OCR 识别失败')
  } finally {
    ocrLoading.value = false
  }
}

/**
 * 申请短信权限
 */
const requestSmsPermission = async () => {
  #ifdef APP-PLUS
  try {
    // 检查权限
    const hasPermission = await uni.getSystemInfoSync().sms
    
    if (hasPermission) {
      // 已有权限，直接读取
      await readLatestSms()
    } else {
      // 申请权限
      const result = await uni.authorize({
        scope: 'scope.sms'
      })
      
      if (result.authSetting['scope.sms']) {
        await readLatestSms()
      } else {
        showError('需要短信权限才能自动读取')
      }
    }
  } catch (error) {
    console.error('权限申请失败:', error)
    showError('权限申请失败')
  }
  #endif
}

/**
 * 读取最新短信
 */
const readLatestSms = async () => {
  #ifdef APP-PLUS
  try {
    // 获取短信列表
    const res = await uni.getSystemInfoSync().sms
    const smsList = res.smsList || []
    
    // 按时间排序，取最新的
    const latestSms = smsList
      .filter(sms => sms.type === 'inbox')
      .sort((a, b) => b.date - a.date)
      .find(sms => {
        // 筛选快递短信
        const content = sms.body.toLowerCase()
        return content.includes('快递') || 
               content.includes('取件') || 
               content.includes('包裹') || 
               content.includes('收件')
      })
    
    if (latestSms) {
      // 设置为短信导入模式
      method.value = 'sms'
      smsContent.value = latestSms.body
      parseSms()
    } else {
      showError('未找到快递短信')
    }
  } catch (error) {
    console.error('读取短信失败:', error)
    showError('读取短信失败')
  }
  #endif
}

/**
 * iOS 转发引导
 */
const showIosForwardGuide = () => {
  method.value = 'ios'
}

/**
 * 复制转发号码
 */
const copyNumber = () => {
  uni.setClipboardData({
    data: iosForwardGuide.value.forwardNumber,
    success: () => {
      showToast('号码已复制')
    }
  })
}

/**
 * 提交表单
 */
const handleSubmit = async () => {
  // 验证
  if (!formData.value.company) {
    showError('请选择快递公司')
    return
  }
  
  if (!formData.value.pickup_code) {
    showError('请输入取件码')
    return
  }
  
  if (selectedGroups.value.length === 0) {
    showError('请至少选择一个展示群组')
    return
  }
  
  submitting.value = true
  
  try {
    // 创建快递记录
    const expressData = {
      ...formData.value,
      owner_id: userStore.userId,
      status: 'pending'
    }
    
    const express = await expressStore.createExpress(expressData)
    
    if (express) {
      // 设置群组可见性
      for (const groupId of selectedGroups.value) {
        await expressStore.setGroupVisible(express.id, groupId, visibleScope.value)
      }
      
      showToast('录入成功')
      
      // 重置表单
      resetForm()
      
      // 跳转到首页
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/index/index'
        })
      }, 1000)
    }
  } finally {
    submitting.value = false
  }
}

/**
 * 重置表单
 */
const resetForm = () => {
  formData.value = {
    company: '',
    pickup_code: '',
    address: '',
    remark: ''
  }
  selectedGroups.value = []
  smsContent.value = ''
}

// 页面加载时
onMounted(async () => {
  // 加载群组列表
  await groupStore.fetchGroupList()
  groupList.value = groupStore.groupList
})
</script>