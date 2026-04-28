<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Icon Rule

- 禁止重新引入 Google Material Symbols 外链。
- 继续使用 `material-symbols-outlined` 时，必须复用 `frontend/public/fonts/` 下的本地图标资源。
- 新增 Material Symbols 图标时，同步更新本地图标清单与字体文件。
