<style lang="scss" scoped>
.add-container { min-height: 100vh; background: #f5f5f5; }
.form-scroll { height: calc(100vh - 88rpx); }
.section { background: #fff; margin-bottom: 20rpx; padding: 30rpx; }
.section-title { font-size: 30rpx; font-weight: bold; color: #333; margin-bottom: 24rpx; }
.method-tabs { display: flex; gap: 16rpx; }
.method-tab { flex: 1; text-align: center; padding: 16rpx 0; background: #f5f5f5; border-radius: 8rpx; font-size: 26rpx; color: #666; }
.method-tab.active { background: #2979ff; color: #fff; }
.form-item { margin-bottom: 30rpx; }
.label { font-size: 28rpx; color: #333; margin-bottom: 16rpx; display: block; }
.required { color: #f56c6c; }
.parse-btn { margin-top: 20rpx; width: 100%; }
.parse-result { margin-top: 20rpx; padding: 20rpx; background: #e8f4ff; border-radius: 12rpx; border: 1rpx solid #b3d8ff; }
.result-title { font-size: 28rpx; font-weight: bold; color: #2979ff; margin-bottom: 15rpx; }
.result-item { display: flex; margin-bottom: 10rpx; }
.result-label { font-size: 24rpx; color: #666; width: 120rpx; flex-shrink: 0; }
.result-value { font-size: 26rpx; color: #333; flex: 1; font-weight: bold; }
.confirm-btn { margin-top: 15rpx; width: 100%; }

/* iOS 过滤转发样式 */
.ios-guide { margin-bottom: 30rpx; }
.guide-item { display: flex; align-items: flex-start; margin-bottom: 20rpx; }
.step-number { width: 40rpx; height: 40rpx; border-radius: 50%; background: #2979ff; color: #fff; font-size: 24rpx; font-weight: bold; text-align: center; line-height: 40rpx; margin-right: 16rpx; flex-shrink: 0; }
.step-text { font-size: 26rpx; color: #333; flex: 1; }
.ios-filter-info { padding: 20rpx 20rpx 20rpx 0; margin-bottom: 20rpx; }
.info-row { display: flex; align-items: center; margin-bottom: 16rpx; }
.info-text { font-size: 24rpx; color: #666; margin-left: 10rpx; }
.status-switch { display: flex; align-items: center; justify-content: space-between; padding: 20rpx 0; border-top: 1rpx solid #eee; margin-bottom: 20rpx; }
.status-label { font-size: 28rpx; color: #333; font-weight: bold; }
.filtered-list { background: #f9f9f9; border-radius: 12rpx; padding: 20rpx; }
.list-title { font-size: 26rpx; font-weight: bold; color: #333; margin-bottom: 16rpx; }
.filtered-item { display: flex; align-items: center; padding: 16rpx 0; border-bottom: 1rpx solid #eee; }
.filtered-item:last-child { border-bottom: none; }
.item-company { font-size: 26rpx; color: #333; font-weight: bold; flex: 1; }
.item-code { font-size: 28rpx; color: #2979ff; font-weight: bold; margin: 0 20rpx; padding: 4rpx 12rpx; background: #e8f4ff; border-radius: 4rpx; }
.item-time { font-size: 22rpx; color: #999; }
.empty-list { font-size: 24rpx; color: #999; text-align: center; padding: 20rpx 0; }

/* 其余样式 */
.group-list { padding: 20rpx 0; }
.group-item { margin-bottom: 20rpx; }
.empty-tip { font-size: 26rpx; color: #999; text-align: center; padding: 40rpx 0; }
.privacy-options { padding: 20rpx 0; }
.option-item { margin-bottom: 30rpx; }
.option-item text { font-size: 28rpx; color: #333; display: block; margin-bottom: 16rpx; }
.submit-section { padding: 30rpx; background: #fff; }

.ocr-upload { border: 2rpx dashed #ddd; border-radius: 12rpx; padding: 40rpx; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; }
.ocr-text { font-size: 24rpx; color: #999; margin-top: 15rpx; }
.ocr-input { position: absolute; width: 100%; height: 100%; opacity: 0; cursor: pointer; }
.ocr-preview { margin-top: 20rpx; }
.preview-image { width: 100%; height: 400rpx; border-radius: 12rpx; margin-bottom: 20rpx; }
.confirm-content { padding: 20rpx; }
.confirm-item { display: flex; margin-bottom: 20rpx; padding-bottom: 15rpx; border-bottom: 1rpx solid #f0f0f0; }
.confirm-label { font-size: 26rpx; color: #666; width: 160rpx; flex-shrink: 0; }
.confirm-value { font-size: 28rpx; color: #333; flex: 1; font-weight: bold; }
.confirm-actions { display: flex; justify-content: flex-end; gap: 20rpx; margin-top: 20rpx; }
</style>