# Nocturne 上架与审核清单

## 当前结论

项目已经具备移动端响应式页面、Capacitor 原生工程、可离线单人案件和 Neon 房间同步，但还不是“可直接提交商店”的最终版本。完成正式签名、隐私政策真实信息和商店资料后，才能产出 Android App Bundle 与 iOS Archive。

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
npm run mobile:preflight
```

`mobile:preflight` 只做本地环境和发布文件检查，不会替代签名或商店后台校验。Android 需要可用的 JDK；iOS 需要 Xcode、Team、证书和 Provisioning Profile。本项目已验证 iOS Simulator Debug 构建，未将该结果误当成可提交的 App Store Archive。

当前 `public/runtime-config.js` 已指向 `https://juben-lyart.vercel.app`；正式换域名时必须同步修改 API 地址，并在服务端设置 `CORS_ORIGINS`（至少包含 `capacitor://localhost` 和 `http://localhost`）。

## 提交前必须完成

- 替换 `public/privacy.html`、`public/terms.html` 中的运营主体、客服联系方式、数据保存期限和真实第三方服务信息，并将隐私政策部署到公开 HTTPS URL。
- 创建 1024px App Store 图标、Android 自适应图标、启动图、应用截图、年龄分级和商店文案；图标不得使用未获授权的第三方品牌。
- 只声明实际使用的权限。目前不需要相机、定位、通讯录、短信或后台定位权限；麦克风只在用户主动点击“加入语音”时请求，不要为了“以后使用”提前申请。
- 当前版本使用匿名访客身份，已提供应用内删除访客资料入口；房间包含角色预选、文字聊天和可选 WebRTC 语音。正式提交前必须补齐真实隐私政策中的麦克风、WebRTC/STUN、聊天内容和保存期限说明，并在审核设备上验证拒绝麦克风权限后仍可正常游玩。
- 房间聊天已提供消息举报入口并记录到服务端；正式运营前仍应配置审核人员、处理时限、封禁/拉黑策略和客服渠道，不要在商店描述中承诺“全天候人工审核”除非确实具备该能力。
- 当前多人房间同步剧本阶段、搜证、质询、投票、聊天和可选语音；商店描述应准确说明多人房间需要网络，单人案件可离线试玩。
- 用真实设备验证冷启动、弱网、无网、深色模式、动态字体、刘海/安全区域、横竖屏策略、返回键、键盘和权限拒绝路径。
- Android 使用正式签名的 AAB；iOS 使用正确 Bundle ID、Team、证书、Provisioning Profile、隐私清单和 App Store Connect 元数据。

## 审核备注建议

1. 打开应用后点击“发现剧本”。
2. 点击任一剧本卡片，再点击“开始试玩”。
3. 依次查看 3 条物证、完成 3 次质询、提交最终指认并查看复盘。
4. 如需验证多人能力，进入“房间预览”，创建房间后由房主开始剧本；可选点击“加入语音”测试麦克风，拒绝权限后仍可使用文字聊天和案件流程。
5. 说明当前版本无需注册登录、无付费；麦克风只在用户主动点击“加入语音”时请求，核心单人试玩可离线使用，访客资料可在应用内删除。

这些准备可以明显降低常见的“功能不可用、误导性描述、隐私信息不完整、仅网页包装”风险，但不能保证平台一定通过审核。
