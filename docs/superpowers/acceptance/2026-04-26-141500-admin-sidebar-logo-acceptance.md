# 管理端侧边栏 Logo 验收标准

## 功能验收
- [ ] 管理端侧边栏品牌 logo 使用 `/favicon.svg`。
- [ ] 展开态显示 logo 与品牌文字，折叠态显示 logo。
- [ ] 展开/折叠切换时 logo 尺寸保持一致，无明显抽搐。

## 非功能验收
- [ ] 不影响菜单项点击与高亮逻辑。
- [ ] 不引入新的控制台错误。

## 验证命令
- [ ] `frontend: npm run test:run`
- [ ] `frontend: npm run build`
- [ ] `backend: mvn compile`
- [ ] `backend: mvn test`
