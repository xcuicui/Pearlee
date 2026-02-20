## ADDED Requirements

### Requirement: Date Plan List (open/done)
客户端 MUST 提供「约会清单」列表页，按未完成(open)与已完成(done)分组展示，并支持创建清单项。

#### Scenario: View open plans
- **GIVEN** 用户已加入未封存关系
- **WHEN** 用户进入约会清单页
- **THEN** 页面调用 `date_plan_list({ status: 'open' })` 并展示清单项列表

#### Scenario: View done plans
- **GIVEN** 用户已加入未封存关系
- **WHEN** 用户切换到已完成分组
- **THEN** 页面调用 `date_plan_list({ status: 'done' })` 并展示已完成清单项列表

### Requirement: Create date plan with tags
页面 MUST 提供创建入口以新增清单项（至少包含标题），并支持为清单项选择 tags。

#### Scenario: Create success
- **GIVEN** 用户输入标题并选择若干 tags
- **WHEN** 用户提交创建
- **THEN** 页面调用 `date_plan_create({ title, notes?, tagIds? })`
- **AND** 成功后清单列表刷新，新的清单项出现在 open 列表

### Requirement: Tag filter in list
清单列表页 MUST 支持按 tag 进行筛选展示。

#### Scenario: Filter by a tag
- **GIVEN** 列表页已加载 open 清单项
- **WHEN** 用户选择一个 tag 作为筛选条件
- **THEN** 页面调用 `date_plan_list({ status: 'open', tagIds: [tagId] })` 或在本地对同等数据进行筛选
- **AND** 列表仅展示匹配该 tag 的清单项

#### Scenario: Clear filter
- **GIVEN** 当前存在 tag 筛选条件
- **WHEN** 用户清除筛选
- **THEN** 列表恢复展示全部（open 或 done）清单项

### Requirement: Tag taxonomy management entry
列表页 MUST 提供一个轻量入口用于新增 tag 或新增 tag 类型（避免清单被固定枚举限制）。

#### Scenario: Add new tag
- **WHEN** 用户新增一个 tag（选择某个 tag 类型并输入名称）
- **THEN** 页面调用 `date_tag_create({ typeId, name })`
- **AND** 新 tag 可被用于选择与筛选

#### Scenario: Add new tag type
- **WHEN** 用户新增一个 tag 类型
- **THEN** 页面调用 `date_tag_type_create({ name })`
- **AND** 新类型出现在 tag 分类中

### Requirement: Tag empty-state prompts
当没有任何 tag 类型或某个类型下没有任何 tag 时，页面 MUST 给出明确提示与轻量示例，引导用户创建。

#### Scenario: No tag types
- **GIVEN** `date_tag_type_list()` 返回 items 为空
- **WHEN** 页面渲染标签选择/筛选区域
- **THEN** 展示提示：`还没有标签类型`
- **AND** 展示轻量示例：`你可以先从「地点」「氛围」开始`（示例，不要求完全一致）

#### Scenario: Tag type has no tags
- **GIVEN** 存在某个 tag 类型（例如“地点”）但 `date_tag_list({ typeId })` 返回为空
- **WHEN** 页面渲染该类型下的 tag 列表
- **THEN** 展示提示：`还没有「地点」标签`
- **AND** 展示示例：`比如：深圳 / 广州 / 上海`（根据类型不同可变化）

### Requirement: Tag deletion
页面 MUST 支持删除 tag（用于清理不再需要的标签），并在删除后更新可选项与筛选项。

#### Scenario: Delete a tag
- **GIVEN** 某 tag 存在且属于当前关系
- **WHEN** 用户在 tag 管理入口触发删除
- **THEN** 页面调用 `date_tag_delete({ tagId })`
- **AND** 删除成功后该 tag 不再出现在选择列表与筛选列表
