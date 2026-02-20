## 1. Implementation
- [x] 1.1 设计数据模型：
  - DatePlan（open/done、doneAt、logCount、lastOccurAt、tags）
  - TagType / Tag（支持默认类型与新增）
- [x] 1.2 新增云函数：date_plan_create / date_plan_list / date_plan_done
- [x] 1.3 新增云函数：date_plan_update（编辑清单项 tags）
- [x] 1.4 新增云函数：date_tag_type_list / date_tag_type_create / date_tag_list / date_tag_create
- [x] 1.5 新增云函数：date_tag_delete（删除 tag）
- [x] 1.6 新增云函数：date_tag_type_delete（删除 tag 类型，级联处理 tags）
- [x] 1.7 新增页面：约会清单列表（open/done 分组、创建入口、tag 筛选、空态提示、tag/tag类型 删除入口）
- [x] 1.7 新增页面：清单项详情（标题/备注、tags 展示与编辑、关联日记区域占位、完成按钮）
- [ ] 1.8 权限与 relationship 约束（仅未封存关系可用；无关系引导创建/加入）
- [ ] 1.9 真机自测：创建/完成/取消完成、tag 新增/编辑/删除/筛选、空态提示、失败提示不白屏

## Notes (self-test checklist)
- [ ] 已部署所有 date_* 云函数到目标环境
- [ ] 约会清单页：创建/筛选/长按删除标签/长按删除类型均正常
- [ ] 清单详情：编辑标签选中态、保存后持久化正常
