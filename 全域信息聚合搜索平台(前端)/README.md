# 全域信息聚合搜索平台 · 前端

Ant Design Pro（Umi Max）前端，开发端口 8000。项目整体说明见仓库根目录的 [README](../README.md)。

- 启动：`npm install` 后 `npm start`，访问 http://localhost:8000
- 开发环境走 `config/proxy.ts` 的代理：`/api` → `http://localhost:8101`
- 接口代码由 Swagger 生成：后端启动后执行 `npm run openapi`