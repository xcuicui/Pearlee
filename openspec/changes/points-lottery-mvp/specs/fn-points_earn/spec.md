## ADDED Requirements

### Requirement: Earn shells for murmur publish
函数 MUST 支持为碎碎念发布发放贝壳，并以 `ref_id = entry id` 做幂等。

计分 = 字数档位分 + 图片档位分，且单条最高获得 16 贝壳（cap=16）。

字数（trim 后，中文按字符计）：
- 1~10：+2
- 11~20：+4
- 21~50：+6
- 51~200：+8
- >200：+10
- 0 字但有图：字数分 = 0

图片：
- 0：+0
- 1：+2
- 2~3：+4
- 4~9：+6

#### Scenario: Earn shells by tiers
- **GIVEN** `type="murmur"` 且传入 `content_len` 与 `image_count`
- **WHEN** 调用 `points_earn({ type, ref_id, content_len, image_count })`
- **THEN** 服务端按上述规则计算 `earned_points` 并更新 `points_balance`
- **AND** 返回 `{ ok: true, earned_points, points_balance }`

#### Scenario: Idempotent earn for same ref_id
- **GIVEN** 同一用户、同一关系、同一 `type` 与 `ref_id` 已存在 ledger 记录
- **WHEN** 再次调用 `points_earn({ type, ref_id, ... })`
- **THEN** 返回 `{ ok: true, earned_points: 0 }`
- **AND** `points_balance` 不变化
