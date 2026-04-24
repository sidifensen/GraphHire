# Admin Skill Tags Display Fix Acceptance

- [ ] 当接口返回 `createTime/updateTime` 时，列表“创建时间/更新时间”列可见且不为 `-`。
- [ ] 当接口返回 `create_time/update_time` 时，列表“创建时间/更新时间”列可见且不为 `-`。
- [ ] 当接口返回 `synonyms` 为 JSON 字符串（如 `"[\"JDK\",\"Java SE\"]"`）时，页面可展示同义词标签。
- [ ] 当接口返回 `synonyms` 为逗号字符串（如 `"JDK,Java SE"`）时，页面可展示拆分后的同义词标签。
- [ ] 当接口返回标准结构（`createdAt/updatedAt + string[]`）时，现有行为不回归。
