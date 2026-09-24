# Nocturne

Nocturne 是一个高质感线上剧本推理社交 MVP，包含：

- 剧本发现、分类筛选和详情弹窗
- 房间入口预览与单人试玩
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

## Android / iOS 打包

项目已加入 Capacitor 配置。先安装依赖并生成平台工程：

```bash
npm install
npm run mobile:add:android
npm run mobile:add:ios
npm run mobile:sync
```

然后使用 Android Studio 生成签名的 AAB，或使用 Xcode 生成 Archive 并提交 TestFlight / App Store。正式移动端构建前，请在 `public/runtime-config.js` 配置真实的 HTTPS API 地址，并在服务端设置 `CORS_ORIGINS`（至少包含 `capacitor://localhost` 和 `http://localhost`）；留空时核心单人试玩仍可通过内置剧本离线运行，创作后台的服务端同步不可用。

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

当前版本使用原生 Node HTTP 服务和内置剧本；试玩关卡为本地脚本化演绎。实时语音、真实多人匹配、账号和支付尚未接入，下一阶段可以基于现有界面和剧本数据模型继续扩展。
