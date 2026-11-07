# 全域信息聚合搜索平台 · 后端

Spring Boot 服务，端口 8101，接口前缀 `/api`。项目整体说明（功能、技术栈、目录结构、启动步骤）见仓库根目录的 [README](../README.md)。

- 启动：`mvn spring-boot:run`（需先启动 MySQL、Redis、Elasticsearch）
- 接口文档（Knife4j）：http://localhost:8101/api/doc.html
- 建表脚本：`sql/create_table.sql`（库名 `search`）；帖子索引 mapping：`sql/post_es_mapping.json`
- 本地私有配置：`src/main/resources/application-dev.yml`，由 `application-dev.yml.example` 复制后填写，该文件不入库