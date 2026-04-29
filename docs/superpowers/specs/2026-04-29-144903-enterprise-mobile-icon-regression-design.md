# 企业端手机版图标样式回归修复设计

## 背景
- 目标范围：`frontend/src/app/mobile-enterprise` 及其宿主样式层。
- 对照基准：`C:\Users\x\Downloads\graphhire企业端1 (1)` 的企业端手机版原型。
- 当前回归：接入主项目后，企业端手机版多个 Material Symbols 图标缩小，且若干原本带圆形背景的图标容器显示为透明。

## 问题定位
- 全局样式 `frontend/src/styles/globals.css` 在 `.material-symbols-outlined` 上强制声明 `font-size: 1em`，覆盖了移动企业页中 `text-[24px]`、`text-[20px]`、`text-[18px]` 等局部字号类。
- 当前 Tailwind 主题配置缺少原型页使用的 `secondary-container` 颜色映射，导致 `bg-secondary-container` 不生成有效背景色。
- `bg-primary-fixed-dim/50` 依赖透明度叠加，而当前 CSS 变量映射方式无法稳定生成预期半透明背景，需要改成显式可渲染的写法。

## 目标
- 恢复企业端手机版图标与原型一致的尺寸层级，底部导航与顶部导航的主图标重新回到原型大小。
- 恢复快捷操作、职位列表等图标圆形背景，不再出现透明背景缺失。
- 保持现有 Next.js 路由、鉴权壳和页面结构不变，只修宿主样式与必要的颜色用法。

## 方案对比
- 方案 A：逐页把图标和背景改成内联样式。优点是见效快；缺点是重复且难维护，不适合作为宿主项目回归修复。
- 方案 B：重建独立图标组件体系。优点是长期规范；缺点是范围过大，与本次回归修复不匹配。
- 方案 C：修正宿主全局图标规则、补齐原型依赖的 Tailwind 颜色映射，并将少量不稳定透明度背景改为显式可渲染写法。这个方案改动最小、覆盖根因完整，采用该方案。

## 设计决策
- 删除全局 `.material-symbols-outlined` 上对字号的硬覆盖，保留本地图标字体、抗锯齿和 `FILL` 控制。
- 将图标默认 `opsz` 从当前宿主项目的 192 调整回 24，对齐原型 Material Symbols 的常规移动端展示。
- 在 `frontend/tailwind.config.ts` 中补齐 `secondary-container` 颜色映射，确保企业端移动页中复用的原型类名能够正常出样式。
- 对 `bg-primary-fixed-dim/50` 这类当前宿主环境无法可靠渲染的背景，改为显式可渲染的颜色写法，避免继续依赖无效透明度组合。
- 通过回归测试锁定两个契约：主题配置必须包含原型依赖颜色键；全局 Material Symbols 规则不得再次强制 `font-size: 1em`。

## 影响范围
- `frontend/src/styles/globals.css`
- `frontend/tailwind.config.ts`
- `frontend/src/app/mobile-enterprise/page.tsx`
- `frontend/tests/lib/*` 或现有相关测试文件

## 测试与验证
- 新增样式契约测试，验证企业端移动原型依赖的颜色映射存在，且全局图标规则不再覆盖局部字号类。
- 运行前端定向测试确认红绿循环成立，再执行前端全量测试与构建。
- 按仓库要求补跑后端 `mvn compile`、`mvn test`。
- 使用 CDP 浏览器复查企业端手机版首页，确认底部导航图标尺寸与快捷操作圆形背景恢复正常。

## 风险与控制
- 风险：调整全局 Material Symbols 规则可能影响其他页面图标观感。
- 控制：用现有本地图标测试和前端全量测试兜底，并在浏览器中复查企业端移动首页的关键图标区域。
