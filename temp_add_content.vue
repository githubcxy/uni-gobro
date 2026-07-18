<template>
  <view class="add-container">
    <scroll-view class="form-scroll" scroll-y>
      <!-- 录入方式选择 -->
      <view class="section">
        <view class="section-title">录入方式</view>
        <view class="method-tabs">
          <view 
            class="method-tab" 
            :class="{ active: method === 'manual' }"
            @click="method = 'manual'"
          >
            手动录入
          </view>
          <view 
            class="method-tab" 
            :class="{ active: method === 'sms' }"
            @click="method = 'sms'"
          >
            短信导入
          </view>
          <view 
            class="method-tab" 
            :class="{ active: method === 'auto' }"
            @click="requestSmsPermission()"
          >
            自动读取
          </view>
          <view 
            class="method-tab" 
            :class="{ active: method === 'share' }"
            @click="method = 'share'"
          >
            分享导入
          </view>
          <view 
            class="method-tab" 
            :class="{ active: method === 'ocr' }"
            @click="method = 'ocr'"
          >
            截图识别
          </view>
          <view 
            class="method-tab" 
            :class="{ active: method === 'ios' }"
            @click="showIosForwardGuide()"
          >
            iOS转发
          </view>
        </view>
      </view>
      
      <!-- 手动录入表单 -->
      <view v-if="method === 'manual'" class="section">
        <view class="form-item">
          <text class="label">快递公司 <text class="required">*</text></text>
          <u-input 
            v-model="formData.company" 
            placeholder="请选择快递公司"
            readonly
            suffixIcon="arrow-right"
            @click="showCompanyPicker = true"
          ></u-input>
        </view>
        
        <view class="form-item">
          <text class="label">取件码 <text class="required">*</text></text>
          <u-input 
            v-model="formData.pickup_code" 
            placeholder="请输入取件码"
            maxlength="20"
          ></u-input>
        </view>
        
        <view class="form-item">
          <text class="label">取件地址</text>
          <u-textarea 
            v-model="formData.address" 
            placeholder="请输入取件地址（可选）"
            maxlength="200"
            count
          ></u-textarea>
        </view>
        
        <view class="form-item">
          <text class="label">备注</text>
          <u-input 
            v-model="formData.remark" 
            placeholder="其他备注信息（可选）"
            maxlength="100"
          ></u-input>
        </view>
      </view>
      
      <!-- 短信导入 -->
      <view v-if="method === 'sms'" class="section">
        <view class="section-title">短信内容</view>
        <u-textarea 
          v-model="smsContent" 
          placeholder="请粘贴快递短信内容，系统将自动解析"
          maxlength="500"
          count
          height="200"
        ></u-textarea>
        <u-button type="primary" @click="parseSms" class="parse-btn">
          智能解析
        </u-button>
        
        <!-- 解析结果预览 -->
        <view v-if="smsParsed" class="parse-result">
          <view class="result-title">解析结果</view>
          <view class="result-item">
            <text class="result-label">快递公司：</text>
            <text class="result-value">{{ formData.company || '未识别' }}</text>
          </view>
          <view class="result-item">
            <text class="result-label">取件码：</text>
            <text class="result-value">{{ formData.pickup_code || '未识别' }}</text>
          </view>
          <view class="result-item">
            <text class="result-label">地址：</text>
            <text class="result-value">{{ formData.address || '未识别' }}</text>
          </view>
          <u-button type="primary" @click="showConfirmModal = true" class="confirm-btn">
            确认并提交
          </u-button>
        </view>
      </view>
      
      <!-- OCR 识别 -->
      <view v-if="method === 'ocr'" class="section">
        <view class="section-title">截图识别</view>
        <view class="ocr-upload">
          <u-icon name="image" size="80" color="#2979ff"></u-icon>
          <text class="ocr-text">点击上传快递截图</text>
          <input 
            type="file" 
            accept="image/*" 
            @change="handleImageUpload"
            class="ocr-input"
          />
        </view>
        
        <view v-if="ocrImage" class="ocr-preview">
          <image :src="ocrImage" mode="aspectFit" class="preview-image"></image>
          <u-button type="primary" @click="performOCR" :loading="ocrLoading">
            开始识别
          </u-button>
        </view>
      </view>
      
      <!-- iOS 转发引导 -->
      <view v-if="method === 'ios'" class="section">
        <view class="section-title">iOS 短信转发</view>
        <view class="ios-guide">
          <view class="guide-item" v-for="(step, index) in iosForwardGuide.steps" :key="index">
            <view class="step-number">{{ index + 1 }}</view>
            <text class="step-text">{{ step }}</text>
          </view>
          <view class="guide-note">
            <u-icon name="info" size="24" color="#999"></u-icon>
            <text class="note-text">{{ iosForwardGuide.note }}</text>
          </view>
          <view class="forward-number">
            <text class="label">转发号码：</text>
            <text class="number">{{ iosForwardGuide.forwardNumber }}</text>
            <u-button size="mini" @click="copyNumber">复制</u-button>
          </view>
        </view>
      </view>
      
      <!-- 展示群组选择 -->
      <view class="section">
        <view class="section-title">展示群组</view>
        <view class="group-list">
          <view 
            v-for="group in groupList" 
            :key="group.id"
            class="group-item"
          >
            <u-checkbox 
              v-model="selectedGroups" 
              :label="group.group_name" 
              :name="group.id"
            ></u-checkbox>
          </view>
        </view>
        <view v-if="groupList.length === 0" class="empty-tip">
          暂无可展示的群组，请先加入群组
        </view>
      </view>
      
      <!-- 隐私设置 -->
      <view class="section">
        <view class="section-title">隐私设置</view>
        <view class="privacy-options">
          <view class="option-item">
            <text>可见范围</text>
            <u-radio-group v-model="visibleScope">
              <u-radio name="all" label="全员可见"></u-radio>
              <u-radio name="appoint" label="指定成员"></u-radio>
              <u-radio name="self" label="仅自己"></u-radio>
            </u-radio-group>
          </view>
        </view>
      </view>
      
      <!-- 提交按钮 -->
      <view class="submit-section">
        <u-button 
          v-if="method !== 'sms' || !smsParsed" 
          type="primary" 
          size="large"
          :loading="submitting"
          @click="handleSubmit"
        >
          提交
        </u-button>
      </view>
      
      <!-- 确认弹窗 -->
      <u-modal 
        v-model="showConfirmModal" 
        title="确认快递信息" 
        :showConfirmButton="false" 
        closeOnClickOverlay
      >
        <view class="confirm-content">
          <view class="confirm-item">
            <text class="confirm-label">快递公司：</text>
            <text class="confirm-value">{{ formData.company }}</text>
          </view>
          <view class="confirm-item">
            <text class="confirm-label">取件码：</text>
            <text class="confirm-value">{{ formData.pickup_code }}</text>
          </view>
          <view class="confirm-item">
            <text class="confirm-label">取件地址：</text>
            <text class="confirm-value">{{ formData.address }}</text>
          </view>
          <view class="confirm-actions">
            <u-button @click="showConfirmModal = false" size="mini">
              修改
            </u-button>
            <u-button type="primary" @click="handleSubmit" size="mini">
              确认提交
            </u-button>
          </view>
        </view>
      </u-modal>
    </scroll-view>
  </view>
</template>