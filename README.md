# Nocturne

Nocturne 是一个高质感线上剧本推理社交 MVP，包含：

- 剧本发现、分类筛选和详情弹窗
- 房间入口预览与单人试玩
- Neon 房间大厅：创建、加入、退出、房主开局与关闭
- 房间内多人游戏状态同步：阶段、搜证、质询和投票事件通过 `game_sessions` / `game_events` 增量同步
- 创作后台与剧本文件导入
- `incoming/` 文件夹自动扫描并写入 `data/scripts/`
- JSON / Markdown 剧本解析
- 四套写实场景封面素材（玻璃水滴、旧港雨窗、轨道观景舱、剧院后台）与立体玻璃质感 UI
- 游戏内写实场景与证物素材：白厅、安保控制台、指纹修复线、湿纸条、侧厅群像
- 《月影审判》角色肖像：林澈、沈鸢、顾砚、贺云川、苏弥、罗序
- 四个剧本均有独立单人可试玩案件：序章、搜证、脚本化质询、最终指认和结局复盘

## 本地运行

```bash
npm run dev
```

然后打开 <http://localhost:4173>。

## 双语与地区默认

界面支持中文和英文，右上角可以手动切换，选择会保存在当前设备。首次打开时，应用请求同源的 `/api/locale`：如果部署边缘提供 `CF-IPCountry`、`X-Vercel-IP-Country` 或 `X-Country-Code`，中国大陆默认中文，其他国家/地区默认英文；没有地区头时使用浏览器语言作为兜底。Capacitor 生产构建可在 `public/runtime-config.js` 将 `NOCTURNE_LOCALE_ENDPOINT` 指向部署 API。

导入剧本可增加 `i18n.en` 对象，为 `title`、`subtitle`、`genre`、`tags`、`description` 和 `status` 提供英文内容；未提供时会保留原始剧本文本。

## Neon 数据库

生产服务使用 Vercel 的 `DATABASE_URL` 连接 Neon。数据库结构位于 [db/schema.sql](db/schema.sql)，包括用户、剧本、剧本版本、角色、证物、时间线、房间、房间成员、游戏 session 和事件日志。首次部署后，服务会以幂等方式补齐 `game_events.user_id` 兼容字段；不会删除或覆盖已有剧本和房间数据。

生产接口可用性检查：

```text
GET https://juben-lyart.vercel.app/api/health
GET https://juben-lyart.vercel.app/api/scripts
GET https://juben-lyart.vercel.app/api/rooms?status=waiting
```

## Android / iOS 打包

项目已加入 Capacitor 配置。先安装依赖并生成平台工程：

```bash
npm install
npm run mobile:add:android
npm run mobile:add:ios
npm run mobile:sync
```

然后使用 Android Studio 生成签名的 AAB，或使用 Xcode 生成 Archive 并提交 TestFlight / App Store。当前 `public/runtime-config.js` 已配置生产 HTTPS API 地址，服务端默认允许 `capacitor://localhost` 和 `http://localhost`；如果更换域名，需要同步修改 API 地址和 `CORS_ORIGINS`。核心单人试玩仍内置在应用中，房间与剧本后台通过 Neon 服务同步。

审核前检查见 [STORE_COMPLIANCE.md](STORE_COMPLIANCE.md)。当前工程不能保证商店审核通过，尤其还需要补齐真实隐私政策、客服联系方式、商店素材、签名和平台元数据。

## 自动导入剧本

将 `.json` 或 `.md` 文件放入 `incoming/`。后台服务会定期扫描并把解析后的剧本写入 `data/scripts/`。说明文件和已处理文件会被忽略。

JSON 最小格式：

```json
{
  "title": "剧本名称",
  "genre": "悬疑 · 都市",
  "players": 6,
  "duration": "60 分钟",
  "tags": ["搜证", "语音演绎"],
  "description": "剧本简介"
}
```

当前版本使用原生 Node HTTP 服务和 Neon 持久化数据；剧本内容和推理关卡已可独立试玩，房间内的核心游戏状态已支持多人轮询同步。实时语音、第三方账号登录、支付、举报审核和运营后台权限仍属于商业化上线前的后续模块。
