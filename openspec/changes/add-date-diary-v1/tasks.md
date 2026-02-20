## 1. Implementation
- [x] 1.1 设计数据模型：DateDiary（planId 可空、occurAt、text、images）
- [x] 1.2 新增云函数：date_diary_create（上传图文、写入 occurAt）
- [x] 1.3 新增云函数：date_diary_list_by_plan（用于清单项详情页展示关联日记）
- [x] 1.4 新增页面：约会日记发布页（独立于碎碎念发布页）
- [x] 1.5 发生时间选择：默认=当前，可编辑选择日期/时间
- [x] 1.6 图片规则复用：最多 3 张，上传前压缩（与碎碎念一致）
- [ ] 1.7 真机自测：关联清单/临时约会、发生时间修改、失败提示不白屏

## Notes (self-test checklist)
- [ ] 约会日记/回忆页：关联清单 bottom sheet 可用，临时约会明显区分
- [ ] occurAt（日期/时间）可编辑且提交写入正确
- [ ] 图片：无图/单图/多图展示符合规则；上传成功
