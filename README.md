# Nocturne

Nocturne 是一个高质感线上剧本推理社交 MVP，包含：

- 剧本发现、分类筛选和详情弹窗
- 房间入口预览与单人试玩
- Neon 房间大厅：创建、加入、退出、房主开局与关闭
- 快速组局：按剧本寻找可加入的等待房间，没有合适房间时自动创建
- 房间码入场：可输入 8 位房间码打开等待大厅，也可继续使用邀请链接
- 每个剧本详情都支持单人试玩、创建房间和针对当前剧本快速组局
- 房间准备状态与开局前校验
- 房间语音：基于 WebRTC 的麦克风语音、静音和成员连接状态；Neon 仅负责安全转发信令
- 房间大厅支持准备状态、角色预选与自动补位；《轨道之外》支持 7 人房间
- 房间聊天支持消息举报与成员拉黑，服务端会过滤已拉黑成员的聊天内容
- 房间内多人游戏状态同步：阶段、搜证、质询和投票事件通过 `game_sessions` / `game_events` 增量同步；房主可使用 DM 控场面板推进搜证、质询、指认和复盘阶段
- 游戏内推理桌：可标记已发现物证、选择两条线索建立或解除关联，关联状态仅保留在当前案件
- 剧本详情可直接创建多人房间；开局后按成员分配角色，并在序章展示各自的角色剧本、个人目标和持有线索
- 探索榜：完成案件后的进度会去重写入 Neon，并以公开昵称展示社区榜单；网络不可用时仍保留本地成长记录
- 创作后台与剧本文件导入
- 剧本审核队列：上传内容先进入待审核，审核通过后才进入待制作素材仓库
- 制作仓库状态：待制作、剧情制作、音频制作、质检、待上架、已上架和阻塞
- 自动主持人与角色音频：支持 Neon 音频素材、剧本内嵌音频 URL；没有录音时使用设备中文/英文语音兜底
- `incoming/` 文件夹自动扫描并写入 `data/scripts/`
- JSON / Markdown 剧本解析
- 导入剧本可直接生成可玩的通用案件流程；如果 JSON 提供 `content.suspects`、`content.evidence`、`content.timeline` 和 `content.solution`，会优先使用自定义角色、线索、时间线与真相
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

生产服务使用 Vercel 的 `DATABASE_URL` 连接 Neon。数据库结构位于 [db/schema.sql](db/schema.sql)，包括用户、剧本、剧本版本、角色、证物、时间线、剧本审核字段、制作工作项、音频素材、房间、房间成员、游戏 session 和事件日志。首次部署后，服务会以幂等方式补齐兼容字段；不会删除或覆盖已有剧本和房间数据。

生产接口可用性检查：

```text
GET https://juben-lyart.vercel.app/api/health
GET https://juben-lyart.vercel.app/api/scripts
GET https://juben-lyart.vercel.app/api/rooms?status=waiting
POST https://juben-lyart.vercel.app/api/rooms/match
```

### 剧本审核与制作仓库

后台上传支持 `.json` 和 `.md`。上传后剧本会写入 Neon，但 `published = false`，不会出现在玩家剧本库。内容管理员在创作后台输入 `ADMIN_REVIEW_TOKEN` 后，可以查看待审核剧本、通过或驳回，并推进剧情、音频、质检和上架状态。

生产环境必须配置 Vercel 环境变量 `ADMIN_REVIEW_TOKEN`。令牌只通过 `x-admin-token` 请求头传递，不写入公开前端资源；没有配置令牌时，审核 API 会返回 503，避免后台误开放。

音频素材接口：

```text
POST /api/admin/scripts/:id/audio
GET  /api/scripts/:id/audio?locale=zh|en
```

游戏页的“自动主持人与角色音频”面板会优先播放已审核的 `script_audio_assets.audio_url`；没有音频 URL 时，使用当前选择的中文或英文设备语音播放对应台词。剧本 JSON 也可以在 `content.audio` 中提供 `host`、`roles`、`sceneKey`、`text` 和 `audioUrl`。

## Android / iOS 打包

项目已加入 Capacitor 配置。先安装依赖并生成平台工程：

```bash
npm install
npm run mobile:add:android
npm run mobile:add:ios
npm run mobile:sync
npm run mobile:preflight
```

然后使用 Android Studio 生成签名的 AAB，或在 Xcode 打开 `ios/App/App.xcodeproj` 生成 Archive 并提交 TestFlight / App Store。Android Release 支持通过 `ANDROID_KEYSTORE_PATH`、`ANDROID_KEYSTORE_PASSWORD`、`ANDROID_KEY_ALIAS` 和 `ANDROID_KEY_PASSWORD` 注入正式签名，未配置时只会生成未签名 AAB。当前 `public/runtime-config.js` 已配置生产 HTTPS API 地址，服务端默认允许 `capacitor://localhost` 和 `http://localhost`；如果更换域名，需要同步修改 API 地址和 `CORS_ORIGINS`。核心单人试玩仍内置在应用中，房间与剧本后台通过 Neon 服务同步。

`npm run mobile:preflight` 会检查 Node、Capacitor、Java、Xcode 命令行工具、原生工程、生产 API 配置和隐私页面。Android 构建需要 JDK；iOS 模拟器 Debug 构建已验证通过，正式 Archive 仍需要在 Xcode 中配置 Team、证书和 Provisioning Profile。

审核前检查见 [STORE_COMPLIANCE.md](STORE_COMPLIANCE.md)。当前工程不能保证商店审核通过，尤其还需要补齐真实隐私政策、客服联系方式、商店素材、签名和平台元数据。

## 自动导入剧本

将 `.json` 或 `.md` 文件放入 `incoming/`。本地服务会定期扫描并把解析后的剧本提交到待审核流程；Vercel 生产环境使用创作后台上传接口。说明文件和已处理文件会被忽略。

JSON 最小格式：

```json
{
  "title": "剧本名称",
  "genre": "悬疑 · 都市",
  "players": 6,
  "duration": "60 分钟",
  "tags": ["搜证", "角色演绎"],
  "description": "剧本简介",
  "i18n": {
    "en": {
      "title": "Script title",
      "description": "English description"
    }
  },
  "content": {
    "audio": {
      "host": {
        "zh": { "briefing": { "text": "欢迎进入案件。", "audioUrl": "/audio/case-zh.mp3" } },
        "en": { "briefing": { "text": "Welcome to the case.", "audioUrl": "/audio/case-en.mp3" } }
      },
      "roles": {}
    }
  }
}
```

当前版本使用原生 Node HTTP 服务和 Neon 持久化数据；剧本内容和推理关卡已可独立试玩，房间内的核心游戏状态已支持多人轮询同步，完成记录可进入社区探索榜。房间语音使用浏览器 WebRTC 和公共 STUN 服务，正式大规模上线前建议配置自有 TURN 服务，以提高复杂 NAT 和移动网络下的接通率。第三方账号登录、支付、举报审核和运营后台权限仍属于商业化上线前的后续模块。
