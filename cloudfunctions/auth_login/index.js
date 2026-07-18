// TCB 云函数 - 用户登录（账号密码）
// 云函数名称：auth_login

exports.main = async function(event, context) {
  try {
    const { username, password } = event
    if (!username || !password) {
      return { code: 1, message: '账号或密码不能为空' }
    }

    // 使用 TCB 云函数内置的数据库对象
    // 检查是否有内置的数据库对象
    let db
    if (typeof cloud !== 'undefined' && cloud.database) {
      db = cloud.database()
    } else if (typeof wx !== 'undefined' && wx.cloud) {
      db = wx.cloud.database()
    } else if (typeof uni !== 'undefined' && uni.cloud) {
      db = uni.cloud.database()
    } else {
      // 如果都没有，尝试直接使用 TCB 内置对象
      try {
        const tcb = require('@cloudbase/node-sdk')
        const app = tcb.init({ env: 'csy-hz-d3guudhcs5871eb53' })
        db = app.database()
      } catch (err) {
        // 如果还不行，使用简单的内存数据库模拟
        return { code: 1, message: '数据库连接失败，请检查云函数环境配置' }
      }
    }

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