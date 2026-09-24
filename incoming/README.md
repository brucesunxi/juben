# Nocturne 剧本自动入库

将 `.json` 或 `.md` 文件放入这个目录，后台服务会自动扫描并移动为已处理文件，同时写入 `data/scripts/`。

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
