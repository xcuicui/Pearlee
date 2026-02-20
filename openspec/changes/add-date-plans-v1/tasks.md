## 1. Implementation
- [ ] 1.1 设计数据模型：
  - DatePlan（open/done、doneAt、logCount、lastOccurAt、tags）
  - TagType / Tag（支持默认类型与新增）
- [ ] 1.2 新增云函数：date_plan_create / date_plan_list / date_plan_done
- [ ] 1.3 新增云函数：date_tag_type_list / date_tag_type_create / date_tag_list / date_tag_create
- [ ] 1.4 新增页面：约会清单列表（open/done 分组、创建入口、tag 筛选）
- [ ] 1.5 新增页面：清单项详情（标题/备注、tags 展示、关联日记区域占位、完成按钮）
- [ ] 1.6 权限与 relationship 约束（仅未封存关系可用；无关系引导创建/加入）
- [ ] 1.7 真机自测：创建/完成/取消完成、tag 新增/筛选、失败提示不白屏
