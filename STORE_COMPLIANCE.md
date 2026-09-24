# Nocturne 上架与审核清单

## 当前结论

项目已经具备移动端响应式页面和 Capacitor 配置入口，但还不是“可直接提交商店”的最终版本。完成 `npm install`、生成原生工程、签名、隐私政策真实信息和商店资料后，才能产出 Android App Bundle 与 iOS Archive。

Apple 会特别关注应用是否只是重新包装的网站；因此正式版本必须让单人案件、搜证、质询、投票和复盘在无须安装其他应用的情况下可用，并在审核备注中提供完整试玩路径。Google Play 也要求稳定、响应式、可用并且不得误导用户。

## 本地准备

```bash
npm install
npm run mobile:add:android
npm run mobile:add:ios
```

首次生成平台工程后：

```bash
npm run mobile:sync
npm run mobile:open:android
npm run mobile:open:ios
```

构建前请把 `public/runtime-config.js` 中的 `NOCTURNE_API_BASE` 改成真实 HTTPS API 地址，并在服务端设置 `CORS_ORIGINS`（至少包含 `capacitor://localhost` 和 `http://localhost`）；如果不需要远程剧本后台，可保持为空，应用仍可用内置剧本试玩。

## 提交前必须完成

- 替换 `public/privacy.html`、`public/terms.html` 中的运营主体、客服联系方式、数据保存期限和真实第三方服务信息，并将隐私政策部署到公开 HTTPS URL。
- 创建 1024px App Store 图标、Android 自适应图标、启动图、应用截图、年龄分级和商店文案；图标不得使用未获授权的第三方品牌。
- 只声明实际使用的权限。目前不需要相机、麦克风、定位、通讯录、短信或后台定位权限；不要为了“以后使用”提前申请。
- 如果未来加入账号，必须提供应用内注销入口和网页注销入口；如果加入语音/UGC/多人房间，还需加入举报、拉黑、内容审核、未成年人保护和服务端鉴权。
- 商店描述不要写“实时语音”“AI 对话”“多人匹配”等尚未接入的能力；当前版本应描述为本地脚本化演绎和单人案件试玩。
- 用真实设备验证冷启动、弱网、无网、深色模式、动态字体、刘海/安全区域、横竖屏策略、返回键、键盘和权限拒绝路径。
- Android 使用正式签名的 AAB；iOS 使用正确 Bundle ID、Team、证书、Provisioning Profile、隐私清单和 App Store Connect 元数据。

## 审核备注建议

1. 打开应用后点击“发现剧本”。
2. 点击任一剧本卡片，再点击“开始试玩”。
3. 依次查看 3 条物证、完成 3 次质询、提交最终指认并查看复盘。
4. 说明当前版本无需登录、无付费、无敏感权限，所有核心试玩内容可离线使用。

这些准备可以明显降低常见的“功能不可用、误导性描述、隐私信息不完整、仅网页包装”风险，但不能保证平台一定通过审核。
