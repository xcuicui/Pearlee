## MODIFIED Requirements

### Requirement: Entry Publish
页面 MUST 在校验通过时上传已选图片并创建 entry；创建成功后触发贝壳发放（幂等），随后返回上一页。

#### Scenario: Publish success triggers earn shells
- **GIVEN** trim(text) 非空 或 选择了 1-9 张图片
- **WHEN** 用户点击主按钮“收好”
- **THEN** 页面上传图片（如有）并调用 `entry_create({ text, images })`
- **AND** 在 `entry_create` 成功返回 `{ ok: true, id }` 后调用 `points_earn({ type: "murmur", ref_id: id, content_len: trim(text).length, image_count })`
- **AND** 若 `points_earn` 返回 `earned_points > 0`，页面以轻 toast 提示 `收纳成功 +X 贝壳`
- **AND** `points_earn` 以 `ref_id = entry id` 实现幂等：重复调用不得重复发放
- **AND** 页面继续返回上一页（即使贝壳发放失败也不阻断发布成功回退）
