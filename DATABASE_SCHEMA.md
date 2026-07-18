# TCB 数据库设计（严格按照文档）

## 4 个集合

### 1. user（用户表）
```javascript
{
  _id: String,           // 用户唯一 ID
  phone: String,         // 手机号
  nickName: String,      // 用户昵称
  defaultGroupId: String, // 默认快递可见群组 ID（核心字段）
  createTime: Number     // 创建时间
}
```

### 2. group（群组表）
```javascript
{
  _id: String,           // 群组 ID
  groupName: String,     // 群组名称
  createUserId: String,  // 创建管理员 ID
  memberList: Array,     // [用户 ID 数组]
  createTime: Number     // 创建时间
}
```

### 3. express（快递记录表）
```javascript
{
  _id: String,           // 快递 ID
  createUserId: String,  // 创建人 ID
  code: String,          // 取件码
  address: String,       // 取件地址
  company: String,       // 快递公司
  isPick: Boolean,       // 是否已取件
  hasInsurance: Boolean, // 是否含运费险
  imgUrl: String,        // TCB 云存储图片地址
  showGroupIdList: Array, // [允许查看的群组 ID 数组]
  isPrivate: Boolean,    // 是否私密仅本人可见
  remark: String,        // 备注
  createTime: Number,    // 创建时间
  pickTime: Number       // 取件时间
}
```

### 4. reward（悬赏任务表）
```javascript
{
  _id: String,           // 悬赏单 ID
  publishUserId: String, // 发布人 ID
  code: String,          // 取件码
  address: String,       // 取件地址
  rewardMoney: String,   // 悬赏金额文本
  phone: String,         // 发布人手机号
  expectTime: String,    // 期望取件时间
  status: String,        // 待接单/已完成/已取消
  createTime: Number     // 创建时间
}
```

## 安全规则

### user
```json
{
  "read": "auth.uid() != null",
  "write": "auth.uid() != null"
}
```

### group
```json
{
  "read": "auth.uid() in resource.memberList",
  "write": "auth.uid() == resource.createUserId"
}
```

### express
```json
{
  "read": "resource.showGroupIdList.contains(auth.uid()) || resource.createUserId == auth.uid()",
  "write": "auth.uid() != null"
}
```

### reward
```json
{
  "read": "auth.uid() != null",
  "write": "auth.uid() != null"
}
```

## 索引建议

- `user.phone` (unique)
- `group.createUserId`
- `express.createUserId`
- `express.showGroupIdList` (array)
- `reward.publishUserId`
