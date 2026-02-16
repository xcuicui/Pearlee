## MODIFIED Requirements
### Requirement: Text Validation
页面 MUST 允许纯图片发布，但禁止全空。

#### Scenario: Empty content blocked
- **GIVEN** 文本为空且未选图
- **WHEN** 点击发布
- **THEN** 阻止提交并提示

## ADDED Requirements
### Requirement: Image Limit 3
页面 MUST 限制图片最多 3 张。

#### Scenario: Max images
- **GIVEN** 已选 3 张
- **WHEN** 继续选择
- **THEN** 提示“最多 3 张图片”

### Requirement: Image Compression
页面 MUST 在上传前按规则压缩图片。

#### Scenario: Compress before upload
- **WHEN** 上传前处理
- **THEN** 宽 1080px、JPEG 0.75、不裁剪
