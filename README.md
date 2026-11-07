# 全域信息聚合搜索平台

一个以「搜索」为入口的内容平台。首页就是搜索框，输入关键词后从站内内容中检索并展示结果（标题、摘要、标签、点赞/收藏数），点击进入详情；未搜索时展示热门标签，可一键发起检索。内容由用户发布的帖子产生，配合个人中心与后台用户管理，形成「检索 → 浏览 → 发布 → 互动」的闭环。

检索数据源目前为帖子内容，同时走 MySQL 与 Elasticsearch 两条通道：列表接口读 MySQL，搜索接口走 Elasticsearch，并定时把新增帖子同步进索引。

## 功能

- **聚合搜索（首页）**：关键词检索帖子的标题与内容，展示命中总数与耗时，命中词高亮，支持分页、快速跳页、骨架屏加载与空结果提示；未搜索时展示热门标签（Java、前端、React、Spring Boot 等）供一键检索；支持 `?q=关键词` 直接带参进入搜索态
- **帖子社区**：帖子列表（MySQL 分页查询）、帖子详情（标签、点赞数、收藏数、作者信息）、发布帖子（标签多选 + 常用标签建议）
- **互动**：详情页点赞 / 取消点赞、收藏 / 取消收藏
- **个人中心**：我的帖子、我的收藏
- **用户**：注册、登录、退出，登录态存 Redis（30 天有效）
- **后台管理**：用户列表分页、新建用户、修改用户、删除用户，角色分为 `user` / `admin` / `ban`

## 技术栈

| 层次 | 技术 |
| --- | --- |
| 后端框架 | Java 8、Spring Boot 2.7、Spring MVC、Spring AOP、Spring Scheduler |
| 数据访问 | MyBatis-Plus（分页插件、逻辑删除、条件构造器）、MySQL |
| 检索 | Elasticsearch（`BoolQueryBuilder` 多条件组合查询、标签 AND / OR 匹配），全量 + 增量同步任务 |
| 缓存 / 会话 | Redis + Spring Session（分布式登录态） |
| 存储 | 腾讯云 COS 对象存储（文件上传） |
| 工具 | Knife4j（OpenAPI 接口文档）、EasyExcel、Hutool、FreeMarker 代码生成器 |
| 前端 | React 18、TypeScript、Ant Design 5、Ant Design Pro Components、Umi Max 4（含 OpenAPI 插件生成 service） |

## 目录结构

```
全域信息聚合搜索平台/
├── 全域信息聚合搜索平台(后端)/        Spring Boot 服务，端口 8101，接口前缀 /api
│   ├── src/main/java/com/fly/aggregatedsearch/
│   │   ├── controller/                接口层（user / post / post_thumb / post_favour / file）
│   │   ├── service/                   业务层，含 MySQL 查询与 ES 检索两种实现
│   │   ├── mapper/                    MyBatis-Plus Mapper
│   │   ├── model/                     entity / dto / vo / enums
│   │   ├── aop/                       @AuthCheck 权限切面、请求日志切面
│   │   ├── common/                    统一响应结构、错误码枚举、分页请求
│   │   ├── exception/                 自定义业务异常、全局异常处理器
│   │   ├── esdao/                     Elasticsearch 数据访问
│   │   ├── job/                       全量同步（启动时执行）与增量同步（每分钟）任务
│   │   ├── generate/                  FreeMarker 代码生成器
│   │   └── wxmp/                      微信公众号消息处理（模板预留）
│   ├── sql/create_table.sql           建库建表脚本（库名 search）
│   ├── sql/post_es_mapping.json       帖子索引 mapping
│   ├── Dockerfile
│   └── pom.xml
└── 全域信息聚合搜索平台(前端)/        Ant Design Pro 前端，开发端口 8000
    ├── config/                        路由、代理、OpenAPI 配置
    ├── src/pages/
    │   ├── Search/                    聚合搜索首页
    │   ├── Post/                      帖子列表 / 发布 / 详情
    │   ├── User/                      登录 / 注册 / 个人中心
    │   └── Admin/User                 后台用户管理
    ├── src/services/backend/          由 Swagger 生成的接口调用代码
    └── src/requestConfig.ts           统一请求配置（401 跳登录、错误码处理）
```

## 数据表

| 表名 | 说明 |
| --- | --- |
| `user` | 用户（账号、密码、昵称、头像、简介、角色） |
| `post` | 帖子（标题、内容、标签 JSON 数组、点赞数、收藏数、作者） |
| `post_thumb` | 点赞记录（用户 + 帖子，硬删除） |
| `post_favour` | 收藏记录（用户 + 帖子，硬删除） |

## 环境要求

- JDK 8、Maven 3.6+
- MySQL 5.7+ / 8.0
- Redis 5+
- Elasticsearch 7.x（必需：搜索接口与同步任务都依赖它）
- Node.js 16+（推荐 18）

## 快速开始

### 1. 初始化数据库

```bash
mysql -u root -p < "全域信息聚合搜索平台(后端)/sql/create_table.sql"
```

脚本创建数据库 `search` 及上述 4 张表。

### 2. 准备本地配置

数据库连接在 `application.yml` 里有默认值，`application-dev.yml`（已被 `.gitignore` 忽略）用于覆盖本地环境，仓库里只提供示例：

```bash
cd "全域信息聚合搜索平台(后端)/src/main/resources"
cp application-dev.yml.example application-dev.yml
# 按自己的 MySQL 账号密码修改
```

### 3. 启动 Elasticsearch 与 Redis

```bash
# Elasticsearch 默认 9200，Redis 默认 6379；连接地址在 application.yml 中
```

首次启动后端时，`FullSyncPostToEs`（CommandLineRunner）会把库里已有帖子全量写入 ES；之后 `IncSyncPostToEs` 每分钟把近 5 分钟的帖子增量同步一次。ES 未启动时这一步会报错，搜索接口也不可用。

### 4. 启动后端

```bash
cd "全域信息聚合搜索平台(后端)"
mvn spring-boot:run
```

- 服务地址：`http://localhost:8101/api`
- 接口文档（Knife4j）：`http://localhost:8101/api/doc.html`

### 5. 创建管理员账号

注册页注册一个普通账号后，在数据库里改角色：

```sql
UPDATE user SET userRole = 'admin' WHERE userAccount = '你的账号';
```

登录后左侧菜单出现「管理页」。

### 6. 启动前端

```bash
cd "全域信息聚合搜索平台(前端)"
npm install
npm start
```

- 访问地址：`http://localhost:8000`
- 开发环境请求走 `config/proxy.ts` 的代理：`/api` → `http://localhost:8101`，所以 `requestConfig.ts` 在 dev 下 `baseURL` 留空
- 接口代码由 Swagger 生成：后端启动后执行 `npm run openapi` 可重新生成 `src/services/backend`

## 接口概览

所有接口以 `/api` 为前缀，统一返回 `{ code, data, message }`。

| 模块 | 主要接口 | 说明 |
| --- | --- | --- |
| 搜索 | `/post/search/page/vo` | 走 Elasticsearch，支持关键词、标签、排序、分页 |
| 帖子 | `/post/list/page/vo`、`/post/add`、`/post/edit`、`/post/delete`、`/post/get/vo`、`/post/my/list/page/vo` | 列表与增删改查走 MySQL |
| 点赞 | `/post_thumb/` | 同一用户对同一帖子再次调用即为取消 |
| 收藏 | `/post_favour/`、`/post_favour/my/list/page` | 收藏与我的收藏 |
| 用户 | `/user/register`、`/user/login`、`/user/logout`、`/user/get/login`、`/user/update/my`、`/user/list/page` | 注册登录与后台用户管理 |
| 文件 | `/file/upload` | 上传到腾讯云 COS |

## 实现要点

- **双通道检索**：列表页读 MySQL（`getQueryWrapper` 拼动态条件），搜索页走 ES（`searchFromEs` 用 `BoolQueryBuilder`，`isDelete`、`id`、`userId` 走 `filter`，必须包含的标签逐个 `filter`，任一标签命中用 `should` + `minimumShouldMatch(1)`）。ES 的分页从 0 开始，与前端 1 起始的页号做了一次换算。
- **索引同步**：`FullSyncPostToEs` 实现 `CommandLineRunner`，启动时全量灌入；`IncSyncPostToEs` 用 `@Scheduled(fixedRate = 60 * 1000)` 每分钟拉取近 5 分钟数据增量更新，写入前先删同 id 文档再插，避免重复。
- **权限与响应**：自定义注解 `@AuthCheck` + AOP 切面做接口级角色校验；`BaseResponse` + `ErrorCode` + `ThrowUtils` + `@RestControllerAdvice` 收敛错误码与异常。
- **点赞 / 收藏一致性**：先按「用户 + 帖子」查重再落库，`thumbNum` / `favourNum` 用 SQL 原子自增自减，`@Transactional` 保证记录表与计数字段同成同败。
- **逻辑删除**：`@TableLogic` 标记 `isDelete`，查询自动过滤已删数据。
- **前端搜索体验**：结果列表做关键词高亮（前端匹配并清理索引里的标记符）、展示命中总数与请求耗时、热门标签一键检索、`?q=` 参数直达，空结果与加载态都有对应 UI。
- **代码生成**：`generate/CodeGenerator` 按 FreeMarker 模板生成 Controller / Service / DTO / VO。

## 说明

- 仓库不包含真实密钥与本地口令，`application-dev.yml` 已被忽略，按 `.example` 自行创建。
- 检索数据源目前只有「帖子」一类；若要扩展成真正的多源聚合（如文章、用户、图片），需要新增数据源适配与结果合并逻辑，当前代码里没有门面 / 适配器这一层抽象。
- 前端 `src/constants/index.ts` 的 `BACKEND_HOST_PROD` 仍是模板占位地址，部署前需替换为自己的后端域名。
- 生产环境 `application-prod.yml` 中的数据库、Redis、Elasticsearch、Knife4j 口令均为占位值，需按实际环境修改。
