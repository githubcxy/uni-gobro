// TCB 云函数 - 用户登录
// 云函数名称：auth_login

exports.main = async function(event, context) {
  try {
    const { phone, code } = event
    if (!phone || !code) {
      return { code: 1, message: '缺少手机号或验证码' }
    }

    const db = cloud.database()
    const _ = db.command

    // 验证验证码（简单校验，实际应使用云函数验证）
    // 这里简化处理，实际应调用短信服务验证

    // 查询或创建用户
    let userRes = await db.collection('user').where({ phone }).get()
    let user

    if (userRes.data.length === 0) {
      // 新用户
      const newUser = {
        phone,
        nickName: `用户${phone.slice(-4)}`,
        defaultGroupId: '',
        createTime: Date.now()
      }
      const addRes = await db.collection('user').add(newUser)
      user = { _id: addRes._id, ...newUser }
    } else {
      user = userRes.data[0]
    }

    // 生成简单 token
    const token = `${user._id}-${Date.now()}`

    return {
      code: 0,
      message: '登录成功',
      data: {
        token,
        user
      }
    }
  } catch (err) {
    console.error('登录失败:', err)
    return { code: 1, message: err.message }
  }
}
