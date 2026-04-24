# 管理端夜间模式验收标准

## AC-1 菜单栏背景
- Given 管理端页面处于暗色模式
- Then 左侧菜单栏背景为黑色

## AC-2 主内容区背景
- Given 管理端页面处于暗色模式
- Then 右侧主内容区背景为灰色

## AC-3 卡片背景
- Given 管理端页面处于暗色模式
- Then 主内容区内卡片背景为黑色

## AC-4 自动化校验
- `src/tests/pages/admin-shell.test.tsx` 通过，且包含暗色样式类名断言
