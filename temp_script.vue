<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/src/stores/user.js'
import { useGroupStore } from '@/src/stores/group.js'
import { useExpressStore } from '@/src/stores/express.js'
import { showError, showToast } from '@/src/utils/index.js'

const userStore = useUserStore()
const groupStore = useGroupStore()
const expressStore = useExpressStore()

// 录入方式
const method = ref('manual')

// 短信导入
const smsContent = ref('')
const smsParsed = ref(false)
const showConfirmModal = ref(false)
const submitting = ref(false)
const showCompanyPicker = ref(false)

// iOS 过滤转发
const iosFilterEnabled = ref(false)
const filteredSmsList = ref([])
const iosFilterGuide = {
  steps: [
    '打开 iPhone 设置 → 信息 → 过滤未知发件人',
    '开启"允许应用过滤"并勾选我们的 App',
    '系统会自动将快递短信转发到此 App',
    'App 收到短信后自动解析快递信息并入库',
    '打开 App 即可查看自动录入的最新快递'
  ]
}

// OCR 相关
const ocrImage = ref('')
const ocrLoading = ref(false)

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

/** 选择快递公司 */
const onCompanyConfirm = (e) => {
  formData.value.company = e.value[0]
  showCompanyPicker.value = false
}

/** 解析短信 */
const parseSms = () => {
  if (!smsContent.value) { showError('请输入短信内容'); return }
  
  const result = expressStore.parseSmsContent(smsContent.value)
  
  if (result.company) formData.value.company = result.company
  if (result.code) formData.value.pickup_code = result.code
  if (result.address) formData.value.address = result.address
  
  if (result.company || result.code) {
    smsParsed.value = true
    showToast('解析成功')
  } else {
    showError('未能识别快递信息，请手动填写')
  }
}

/** 上传图片 */
const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => { ocrImage.value = e.target.result }
  reader.readAsDataURL(file)
}

/** 执行 OCR */
const performOCR = async () => {
  if (!ocrImage.value) return
  ocrLoading.value = true
  try {
    const base64 = ocrImage.value.split(',')[1]
    const res = await request.post('/ocr/express', { image: base64 })
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

/** 申请 Android 短信权限 */
const requestSmsPermission = async () => {
  #ifdef APP-PLUS
  try {
    const permission = uni.authorize
    if (permission) {
      const result = await permission({ scope: 'scope.userInfo' })
      if (result.authSetting['scope.userInfo']) {
        showToast('权限已授权，正在读取短信...')
        await readLatestSms()
      } else {
        showError('需要短信权限才能自动读取')
      }
    } else {
      showToast('当前平台不支持自动读取短信')
    }
  } catch (error) {
    console.error('权限申请失败:', error)
    showError('Android 短信权限申请失败，请使用短信导入方式')
  }
  #endif
}

/** 读取最新短信 (Android) */
const readLatestSms = async () => {
  #ifdef APP-PLUS
  try {
    const plus = plus.android.runtimeMainActivity()
    showToast('正在读取最新快递短信...')
    showError('当前平台限制，请使用"短信导入"粘贴短信内容')
  } catch (error) {
    console.error('读取短信失败:', error)
    showError('读取短信失败')
  }
  #endif
}

/** iOS 过滤转发开关 */
const toggleIosFilter = async (enabled) => {
  #ifdef APP-PLUS && ios
  if (enabled) {
    try {
      const result = await uni.requestSmsFilterPermission()
      if (result) {
        showToast('已开启短信过滤转发')
        iosFilterEnabled.value = true
        listenFilteredSms()
      } else {
        iosFilterEnabled.value = false
        showError('请前往系统设置开启短信过滤')
      }
    } catch (error) {
      iosFilterEnabled.value = false
      showError('请前往系统设置手动开启')
    }
  } else {
    showToast('已关闭短信过滤转发')
  }
  #endif
  
  #ifndef APP-PLUS || ios
  showError('iOS 过滤转发功能仅限 iOS 平台使用')
  iosFilterEnabled.value = false
  #endif
}

/** 监听过滤短信 */
const listenFilteredSms = () => {
  #ifdef APP-PLUS && ios
  showToast('监听中... 收到快递短信将自动录入')
  #endif
}

/** 提交表单 */
const handleSubmit = async () => {
  if (!formData.value.company) { showError('请选择快递公司'); return }
  if (!formData.value.pickup_code) { showError('请输入取件码'); return }
  if (selectedGroups.value.length === 0) { showError('请至少选择一个展示群组'); return }
  
  submitting.value = true
  
  try {
    const expressData = {
      ...formData.value,
      owner_id: userStore.userId,
      status: 'pending'
    }
    
    const express = await expressStore.createExpress(expressData)
    if (express) {
      for (const groupId of selectedGroups.value) {
        await expressStore.setGroupVisible(express.id, groupId, visibleScope.value)
      }
      showToast('录入成功')
      resetForm()
      setTimeout(() => {
        uni.switchTab({ url: '/pages/index/index' })
      }, 1000)
    }
  } finally {
    submitting.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = { company: '', pickup_code: '', address: '', remark: '' }
  selectedGroups.value = []
  smsContent.value = ''
}

onMounted(async () => {
  await groupStore.fetchGroupList()
  groupList.value = groupStore.groupList
  
  #ifdef APP-PLUS && ios
  try {
    const status = await uni.getSmsFilterStatus()
    if (status) {
      iosFilterEnabled.value = true
      listenFilteredSms()
    }
  } catch (e) {
    iosFilterEnabled.value = false
  }
  #endif
})
</script>