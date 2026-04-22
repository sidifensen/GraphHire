# 用户端 Header 头像下拉弹窗定位修复设计

- 时间: 2026-04-22 13:35:47
- 范围: `frontend/src/components/Header.tsx` 与对应测试

## 背景

用户端顶部导航中，点击头像后显示的下拉弹窗没有紧贴头像按钮右边缘，视觉上偏移到页面右侧固定位置，造成交互错位。

## 目标

将下拉弹窗锚定到头像触发按钮容器：
- 水平: 与头像按钮右边缘对齐
- 垂直: 位于按钮正下方，保留固定间距
- 不改变已有点击外部关闭、菜单项行为、登出行为

## 方案对比

### 方案 A（推荐）: 局部定位上下文

- 在头像按钮与下拉弹窗共同父容器上增加 `relative`
- 下拉层改为 `absolute right-0 top-full mt-2`

优点:
- 修改最小，风险最低
- 与现有 Tailwind 结构兼容
- 易于通过单元测试断言 class

缺点:
- 定位能力仅限当前层级，不支持未来跨容器浮层需求

### 方案 B: Portal + 计算定位

- 将弹窗渲染到 `body`，通过 `getBoundingClientRect` 计算位置

优点:
- 可解决复杂 overflow/层叠上下文问题

缺点:
- 实现复杂度高，不符合当前问题规模
- 需要额外滚动/resize 监听逻辑

## 选型

采用方案 A。

## 详细设计

1. 结构调整
- 头像触发区域父容器 class 由 `flex items-center gap-4` 调整为 `relative flex items-center gap-4`

2. 下拉弹窗定位
- class 由 `absolute right-8 top-full mt-2 ...` 调整为 `absolute right-0 top-full mt-2 ...`

3. 行为保持
- 保留 `showDropdown` 状态控制
- 保留 document click 关闭逻辑
- 保留“个人空间/退出登录”按钮行为

## 测试设计

新增单元测试：
- 登录态下点击头像按钮显示弹窗
- 断言弹窗元素包含 `right-0 top-full`，且不包含 `right-8`

## 风险与回滚

风险:
- 低，仅影响用户端 Header 下拉定位

回滚:
- 回退 `Header.tsx` 两处 class 调整即可
