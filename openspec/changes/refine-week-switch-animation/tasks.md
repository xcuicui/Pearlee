## 1. Spec
- [ ] 1.1 Review proposal
- [ ] 1.2 openspec validate refine-week-switch-animation --strict --no-interactive

## 2. Implementation (after approval)
- [ ] 2.1 week bar 改为 swiper（三页循环：prev/current/next）
- [ ] 2.2 切周逻辑：滑动完成后更新 weekStart 并复位到中间页
- [ ] 2.3 移除文字按钮，增加左右淡箭头（不抢视觉）
- [ ] 2.4 回归：点击日期/情绪卡片/发布入口不受影响

## 3. Tests
- [ ] 3.1 swipe 动效存在且顺滑
- [ ] 3.2 连续滑动多周不会错位
- [ ] 3.3 进入日详情 date 正确
