## 1. Implementation
- [ ] 1.1 Repo 扫描：列出高风险重复点击点（创建/删除/提交/领取/完成）
- [ ] 1.2 新增 util：tap guard（短防抖 + in-flight lock），提供简单 API
- [ ] 1.3 接入关键按钮（至少覆盖：清单创建/标签删除/类型删除/回忆页提交/碎碎念发布/打卡）
- [ ] 1.4 真机自测：连点不重复触发；失败后可再次点击；加载态/禁用态一致

## 2. Validation
- [ ] 2.1 openspec validate add-ui-tap-guard-debounce-v1 --strict --no-interactive
