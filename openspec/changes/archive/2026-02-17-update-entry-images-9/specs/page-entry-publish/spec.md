## MODIFIED Requirements
### Requirement: Text Validation
页面 MUST 在提交前校验文本非空。

#### Scenario: Empty text blocked
- **GIVEN** 输入文本为空或仅空白
- **WHEN** 用户点击发布
- **THEN** 页面显示“写点什么吧。”并阻止提交（无论是否已选图片）

### Requirement: Entry Publish
页面 MUST 在校验通过时上传已选图片并创建 entry 后返回上一页。

#### Scenario: Publish success without images
- **GIVEN** 输入文本有效且未选择图片
- **WHEN** 用户点击发布
- **THEN** 页面调用 `entry_create({ text, images: [] })`，提示成功并返回上一页

#### Scenario: Publish success with images
- **GIVEN** 输入文本有效且选择了 1-9 张图片
- **WHEN** 用户点击发布
- **THEN** 页面先调用 `wx.cloud.uploadFile` 上传所有图片并收集 `fileID`
- **AND** 页面调用 `entry_create({ text, images })`
- **AND** 页面提示成功并返回上一页

### Requirement: Cancel Publish
页面 MUST 支持取消并返回。

#### Scenario: Cancel
- **GIVEN** 用户在发布页
- **WHEN** 点击取消
- **THEN** 页面返回上一页

## ADDED Requirements
### Requirement: Image Selection Management
页面 MUST 支持最多 9 张图片的选择、预览与移除。

#### Scenario: Select images
- **GIVEN** 当前已选图片少于 9 张
- **WHEN** 用户点击添加图片
- **THEN** 页面允许从相册/拍照选择并加入已选列表，累计不超过 9 张

#### Scenario: Select over limit blocked
- **GIVEN** 当前已选图片已达 9 张
- **WHEN** 用户尝试继续添加
- **THEN** 页面提示最多 9 张并不再添加

#### Scenario: Remove selected image
- **GIVEN** 已选列表存在图片
- **WHEN** 用户点击移除某张图片
- **THEN** 页面从已选列表删除该图片
