// TCB 云函数 - 用户登录（账号密码）
// 云函数名称：auth_login

exports.main = async function(event, context) {
  try {
    const { username, password } = event
    if (!username || !password) {
      return { code: 1, message: '账号或密码不能为空' }
    }

    // 使用 TCB 内置的 cloud 对象（无需安装 @cloudbase/node-sdk）
    const cloud = require('cloud')
    const db = cloud.database()

    // 查询用户
    let userRes = await db.collection('user').where({ phone: username }).get()
    
    if (userRes.data.length === 0) {
      // 新用户自动注册，使用手机号作为账号，密码默认为手机号后 6 位
      const defaultPassword = username.slice(-6)
      const newUser = {
        phone: username,
        nickName: `用户${username.slice(-4)}`,
        password: defaultPassword, // 默认密码
        defaultGroupId: '',
        createTime: Date.now()
      }
      const addRes = await db.collection('user').add(newUser)
      const user = { _id: addRes._id, ...newUser }
      
      // 生成 token
      const token = `${user._id}-${Date.now()}`

      return {
        code: 0,
        message: '注册登录成功',
        data: {
          token,
          user: {
            _id: user._id,
            phone: user.phone,
            nickName: user.nickName,
            defaultGroupId: user.defaultGroupId
          }
        }
      }
    }

    const user = userRes.data[0]

    // 验证密码
    if (!user.password || user.password !== password) {
      return { code: 1, message: '密码错误' }
    }

    // 生成 token
    const token = `${user._id}-${Date.now()}`

    return {
      code: 0,
      message: '登录成功',
      data: {
        token,
        user: {
          _id: user._id,
          phone: user.phone,
          nickName: user.nickName,
          defaultGroupId: user.defaultGroupId
        }
      }
    }
  } catch (err) {
    console.error('登录失败:', err)
    return { code: 1, message: err.message }
  }
}