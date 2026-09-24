const state = { scripts: [], activeFilter: "all", selectedScript: null };
const API_BASE = String(window.NOCTURNE_API_BASE || "").replace(/\/$/, "");
const apiFetch = (path, options) => fetch(`${API_BASE}${path}`, options);
const fallbackScripts = [
  { id: "moon-trial", title: "月影审判", subtitle: "The Trial of Moonlight", genre: "悬疑 · 古典", players: 6, duration: "90 分钟", difficulty: "进阶", tags: ["多线叙事", "情感沉浸"], author: "Nocturne Studio", cover: "violet", description: "一场发生在私人博物馆的晚宴，一枚失踪的月光宝石，和六段互相矛盾的记忆。", status: "可开局" },
  { id: "last-letter", title: "旧港来信", subtitle: "Letters from the Old Port", genre: "情感 · 时代", players: 5, duration: "75 分钟", difficulty: "入门", tags: ["情感还原", "双重结局"], author: "Morrow House", cover: "amber", description: "在潮水再次上涨之前，找出那封从未寄出的信，以及写信的人真正想留下什么。", status: "热度上升" },
  { id: "orbit-7", title: "轨道之外", subtitle: "Beyond the Orbit", genre: "科幻 · 密室", players: 7, duration: "110 分钟", difficulty: "硬核", tags: ["未来科幻", "机关线索"], author: "Signal / 07", cover: "blue", description: "空间站失去通讯的第七分钟，所有人都收到了来自未来的同一条讯息。", status: "可开局" },
  { id: "velvet-room", title: "绒幕之后", subtitle: "Behind the Velvet", genre: "情感 · 演绎", players: 6, duration: "80 分钟", difficulty: "进阶", tags: ["强角色", "语音演绎"], author: "Morrow House", cover: "rose", description: "剧院谢幕之后，真正的戏才刚刚开始。每个人都在争夺最后一个角色。", status: "新上线" }
];
const rooms = [
  { title: "月影审判", host: "Serein 的房间", players: "5 / 6", mood: "沉浸演绎", color: "violet", wait: "还差 1 人" },
  { title: "轨道之外", host: "ECHO-09", players: "4 / 7", mood: "硬核推理", color: "blue", wait: "还差 3 人" },
  { title: "旧港来信", host: "晚风不说话", players: "4 / 5", mood: "情感还原", color: "amber", wait: "还差 1 人" },
  { title: "绒幕之后", host: "Nocturne DM 03", players: "6 / 6", mood: "即将开始", color: "rose", wait: "已满员" }
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

async function loadScripts() {
  try {
    const response = await apiFetch("/api/scripts");
    const data = await response.json();
    state.scripts = data.scripts?.length ? data.scripts : fallbackScripts;
  } catch {
    state.scripts = fallbackScripts;
  }
  renderScripts();
  renderActivity();
}

function scriptCard(script) {
  const coverImage = coverAsset(script);
  return `<article class="script-card" data-script-id="${script.id}">
    <div class="script-cover cover-${script.cover || "violet"}" style="--cover-image: url('${coverImage}')"><span class="cover-kicker">CASE FILE / ${String(script.id).slice(0, 8).toUpperCase()}</span><div class="cover-title"><strong>${script.title}</strong><small>${script.subtitle || "AN IMMERSIVE MYSTERY"}</small></div></div>
    <div class="script-body"><div class="script-top"><h3>${script.genre || "叙事推理"}</h3><small>${script.status || "可开局"}</small></div><div class="script-meta"><span>${script.players || 6} 人</span><span>${script.duration || "60–90 分钟"}</span><span>${script.difficulty || "进阶"}</span></div><div class="tag-list">${(script.tags || []).slice(0, 3).map((tag) => `<span class="tag">${tag}</span>`).join("")}</div><button class="card-start" data-start-script="${script.id}">查看详情 / 开始试玩 <span>↗</span></button></div>
  </article>`;
}

function coverAsset(script) {
  if (script?.coverImage) return script.coverImage;
  const assets = {
    violet: "assets/covers/moon-trial.jpg",
    amber: "assets/covers/old-port-letter.jpg",
    blue: "assets/covers/orbit-7.jpg",
    rose: "assets/covers/velvet-room.jpg"
  };
  return assets[script?.cover] || assets.violet;
}

function renderScripts() {
  const filter = state.activeFilter;
  const scripts = state.scripts.filter((script) => filter === "all" || script.genre?.includes(filter) || script.tags?.some((tag) => tag.includes(filter)));
  $("#scriptGrid").innerHTML = scripts.map(scriptCard).join("") || `<div class="empty-library"><h3>还没有这个类型的剧本</h3><p>换一个筛选，或者去创作后台导入新剧本。</p></div>`;
  $$(".script-card").forEach((card) => card.addEventListener("click", () => openDetail(card.dataset.scriptId)));
  $$(".card-start").forEach((button) => button.addEventListener("click", (event) => { event.stopPropagation(); openDetail(button.dataset.startScript); }));
}

function renderRooms() {
  $("#roomGrid").innerHTML = rooms.map((room) => `<article class="room-card"><div><span class="tag">${room.mood}</span><h3>${room.title}</h3><p>${room.host}<br />${room.wait}</p></div><div class="room-actions"><div class="room-players">${room.players}</div><button class="secondary-button join-room" data-room="${room.title}">${room.players === "6 / 6" ? "观战" : "加入"} ↗</button></div></article>`).join("");
  $$(".join-room").forEach((button) => button.addEventListener("click", () => showToast(`${button.dataset.room}：已发送入场请求`)));
}

function openDetail(id) {
  const script = state.scripts.find((item) => item.id === id) || fallbackScripts.find((item) => item.id === id);
  if (!script) return;
  state.selectedScript = script;
  $("#modalCover").className = `modal-cover cover-${script.cover || "violet"}`;
  $("#modalCover").style.setProperty("--cover-image", `url('${coverAsset(script)}')`);
  $("#modalTitle").textContent = script.title;
  $("#modalSubtitle").textContent = script.subtitle || "一场关于真相、秘密与选择的沉浸式推理";
  $("#modalGenre").textContent = (script.genre || "叙事推理").toUpperCase();
  $("#modalDescription").textContent = script.description || "一份新剧本已经抵达。请在所有人说出真话之前，找到唯一无法被伪造的证据。";
  $("#modalStats").innerHTML = [["PLAYERS", `${script.players || 6} 人`], ["DURATION", script.duration || "60–90 分钟"], ["LEVEL", script.difficulty || "进阶"]].map(([label, value]) => `<div class="modal-stat">${label}<strong>${value}</strong></div>`).join("");
  $("#modalTags").innerHTML = (script.tags || []).map((tag) => `<span class="tag">${tag}</span>`).join("");
  $("#modalBackdrop").classList.add("open");
  $("#modalBackdrop").setAttribute("aria-hidden", "false");
}

function closeModal() { $("#modalBackdrop").classList.remove("open"); $("#modalBackdrop").setAttribute("aria-hidden", "true"); }

function setView(view) {
  $$(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === view));
  $$(".view").forEach((item) => item.classList.toggle("active-view", item.id === `${view}View`));
  $("#viewLabel").textContent = ({ discover: "发现剧本", rooms: "房间预览", library: "我的收藏", studio: "创作后台" })[view];
}

function showToast(message) { const toast = $("#toast"); toast.textContent = message; toast.classList.add("show"); setTimeout(() => toast.classList.remove("show"), 2600); }

function formatTime(value) { if (!value) return "尚未同步"; return new Intl.DateTimeFormat("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(value)); }

async function refreshSync() {
  try {
    const response = await apiFetch("/api/sync");
    const data = await response.json();
    $("#syncTime").textContent = data.lastSync ? formatTime(data.lastSync) : "等待数据";
    if (data.lastFile) $("#syncBadge").innerHTML = `<span></span> 已同步 ${data.total} 个剧本`;
    renderActivity(data);
  } catch { /* the static client remains usable without the API */ }
}

function renderActivity(data = {}) {
  const rows = [];
  if (data.lastFile) rows.push(["新剧本已入库", `${data.lastFile} · ${formatTime(data.lastSync)}`]);
  rows.push(["后台监听正常", "incoming 文件夹 · 自动扫描每 4 秒"]);
  rows.push(["内容库已就绪", `${state.scripts.length || 4} 个公开剧本可供匹配`]);
  $("#activityFeed").innerHTML = rows.map(([title, detail]) => `<div class="activity-item"><span class="activity-dot"></span><div><strong>${title}</strong><small>${detail}</small></div></div>`).join("");
}

async function importFile(file) {
  const content = await file.text();
  let script;
  if (file.name.toLowerCase().endsWith(".json")) script = JSON.parse(content);
  else {
    const title = (content.match(/^#\s+(.+)$/m) || [null, file.name.replace(/\.md$/i, "")])[1];
    script = { title, content: { markdown: content }, description: content.split(/\r?\n/).filter(Boolean).slice(1, 4).join(" ") };
  }
  const response = await apiFetch("/api/scripts/import", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ filename: file.name, script }) });
  if (!response.ok) throw new Error("导入失败");
  showToast(`${script.title || file.name} 已自动入库`);
  await loadScripts();
  await refreshSync();
}

const demoCase = {
  title: "月影审判",
  player: "林澈 · 馆长",
  caseLabel: "CASE 014 / MOONLIGHT", openingStamp: "21:00", closeStamp: "21:29", playerAvatar: "assets/characters/lin-che.jpg", sceneKicker: "THE WHITE HALL / PRIVATE VIEWING", sceneImage: "assets/game/white-hall.jpg", solution: "he", solutionName: "贺云川", badge: "月影观察者",
  evidenceLead: "展厅仍保持着晚宴结束前的样子。", evidenceCopy: "每一件物证都可能改变你对某个人的判断。你可以逐一查看，已发现的线索会保留在你的案件笔记中。", questionCopy: "选择一位在场者，向他提出一个问题。注意：有些回答不会直接撒谎，但会刻意避开最重要的部分。", voteLead: "你已经听过所有人的说法。现在，指出那个把自己藏进细节里的人。", voteCopy: "不要只看谁最可疑。真正的答案应该同时解释：权限日志、窗台雨痕，以及展柜里的半枚指纹。", resultTitle: "真相浮出水面", resultText: "正确。贺云川用旧权限解除警报，又利用修复室的蓝色工具线制造了“窗外潜入”的假象。真正暴露他的，是他以为没人会注意到的半枚指纹。",
  intro: "今晚 21:00，私人博物馆「白昼厅」举行一场只对六人开放的月光宝石展。七分钟后，展柜仍然完好，宝石却消失了。",
  suspects: [
    { id: "shen", name: "沈鸢", role: "画廊主理人", avatar: "assets/characters/shen-yuan.jpg", line: "我负责今晚的宾客名单。停电前，我一直在东侧酒廊。", answers: { time: "东侧酒廊的监控能证明我在那里。至少，大部分时间可以。", motive: "如果宝石丢失，画廊会失去下一轮融资。我比任何人都希望它还在。", key: "展柜钥匙只有馆长和修复师碰过，我没有理由接近它。" } },
    { id: "gu", name: "顾砚", role: "收藏家律师", avatar: "assets/characters/gu-yan.jpg", line: "我来这里只是为了确认一份遗嘱。宝石和我没有关系。", answers: { time: "我在电话里处理一桩继承案。时间很长，长到足够让我错过很多事情。", motive: "真正的动机不在宝石，而在它附带的保险金。你应该去问沈鸢。", key: "那把银色小钥匙？我在二楼书房见过，但没有拿过。" } },
    { id: "he", name: "贺云川", role: "文物修复师", avatar: "assets/characters/he-yunchuan.jpg", line: "展柜的锁没有被破坏。有人用了正确的密码，但这不代表是我。", answers: { time: "我在工作室清理一幅画。雨水从窗边进来，我擦了很久。", motive: "修复师只能靠作品活着。毁掉一件藏品，对我没有好处。", key: "密码每月更换一次。今晚的密码只有馆长知道——除非有人看过她的记录。" } },
    { id: "su", name: "苏弥", role: "调查记者", avatar: "assets/characters/su-mi.jpg", line: "我正在写一篇关于这间画廊的报道。今晚发生的事，正好给了我一个标题。", answers: { time: "我在洗手间外录音。有人经过，但灯光太暗，我只听到鞋跟声。", motive: "我只需要一个真相，不需要一颗宝石。除非真相本身能卖个好价钱。", key: "我拍到过密码本的一角。上面有一个被划掉的日期：21/17。" } },
    { id: "luo", name: "罗序", role: "私人安保", avatar: "assets/characters/luo-xu.jpg", line: "我守的是门，不是展柜。没有人从正门带着宝石离开。", answers: { time: "21:12 到 21:19，主厅摄像头短暂断线。有人让我去检查配电箱。", motive: "我只收安保费。别把失职和盗窃混在一起。", key: "展柜的警报在 21:17 被正常解除，权限记录显示是内部账号。" } }
  ],
  evidence: [
    { id: "rain", symbol: "◒", name: "窗台雨痕", type: "物证 · 东侧窗", image: "assets/covers/moon-trial.jpg", detail: "雨痕从窗台向内延伸，但窗锁没有被打开。鞋底纹路只到修复室门口。" },
    { id: "log", symbol: "⌁", name: "权限日志", type: "电子记录 · 21:17", image: "assets/game/security-console.jpg", detail: "展柜警报在 21:17:04 被解除，使用的是馆长林澈的旧权限。旧权限本应在三天前失效。" },
    { id: "note", symbol: "✎", name: "被划掉的日期", type: "照片 · 苏弥相机", image: "assets/evidence/moon-crossed-date.jpg", detail: "密码本边缘写着 21/17。最后一笔很新，墨水与修复室桌上的钢笔一致。" },
    { id: "glass", symbol: "◇", name: "玻璃内侧指纹", type: "痕迹 · 展柜", image: "assets/game/fingerprint-thread.jpg", detail: "指纹只有半枚，来自触碰玻璃内侧的人。比对结果指向贺云川。" },
    { id: "thread", symbol: "—", name: "蓝色修复线", type: "纤维 · 展厅", image: "assets/evidence/moon-blue-thread.jpg", detail: "展柜底座卡着一截蓝色修复线，与贺云川工作室的工具包完全一致。" },
    { id: "letter", symbol: "▱", name: "未寄出的信", type: "私人物证 · 顾砚", image: "assets/game/wet-note.jpg", detail: "信中提到保险金将在 21:30 后生效，收信人是一个匿名账户。" }
  ],
  timeline: [
    ["21:05", "贺云川借口检查湿度，进入东侧修复室。"],
    ["21:12", "罗序被叫去检查配电箱，主厅进入监控盲区。"],
    ["21:17", "贺云川利用旧权限解除警报，打开展柜取走宝石。"],
    ["21:19", "他用蓝色修复线伪装成从窗外潜入，再回到人群中。"]
  ]
};
const caseLibrary = {
  "moon-trial": demoCase,
  "last-letter": {
    title: "旧港来信", player: "周遥 · 旧港档案员", caseLabel: "CASE 027 / OLD PORT", openingStamp: "22:10", closeStamp: "22:27", playerAvatar: "assets/characters/su-mi.jpg", sceneKicker: "THE OLD PORT / LAST TIDE", sceneImage: "assets/covers/old-port-letter.jpg", solution: "jiang", solutionName: "江屿", badge: "旧港拾信人",
    intro: "旧港的潮水将在一小时后漫过仓库地窖。今晚，一封二十年前未寄出的信从灯塔档案室里出现，而真正的收信人刚刚死在港口。",
    evidenceLead: "潮水上涨前，码头仓库仍保持着封存状态。", evidenceCopy: "每件物证都记录着一段被海水冲淡的关系。先确认信从哪里来，再判断谁最怕它被读完。", questionCopy: "旧港的每个人都熟悉如何隐藏一封信。选择一位在场者，追问他与灯塔、潮汐和那只铜钥匙的关系。",
    voteLead: "你已经拼起了这封信的去向。现在，指出那个最害怕潮水退去的人。", voteCopy: "真正的答案应该同时解释：灯塔钥匙、潮汐记录，以及信封上没有寄出的邮戳。",
    resultTitle: "潮水退去，信终于抵达", resultText: "正确。江屿伪造了灯塔的封存记录，想在潮水淹没地窖前取走旧信。真正暴露他的，是信封内侧留下的盐渍和铜钥匙上的新刮痕。",
    suspects: [
      { id: "ye", name: "叶岚", role: "旧港画廊主理人", avatar: "assets/characters/shen-yuan.jpg", line: "我只是替港口保管几幅画，没兴趣碰那些旧档案。", answers: { time: "涨潮前我一直在二号码头清点木箱，工人都看见了。", motive: "那封信会让很多人失去现在的身份，但我已经不在乎过去。", key: "灯塔钥匙挂在档案室墙上，江屿比我更熟悉那面墙。" } },
      { id: "tang", name: "唐砚", role: "航运公司律师", avatar: "assets/characters/gu-yan.jpg", line: "旧港每年都有失踪的货物，不代表和一封信有关。", answers: { time: "我在海关办公室打电话，处理一份遗失货单。", motive: "信里的名字如果公开，航运公司的旧账会全部被翻出来。", key: "铜钥匙原本属于灯塔管理员，后来由江屿代为保管。" } },
      { id: "jiang", name: "江屿", role: "灯塔维修师", avatar: "assets/characters/he-yunchuan.jpg", line: "灯塔已经停用很多年了，那里没有值得看的东西。", answers: { time: "我在北堤检查发电机，雨太大，没人愿意过去。", motive: "那封信只是一个误会，真正的秘密早就被海水带走了。", key: "钥匙一直在档案室，我只在上个月借过一次。" } },
      { id: "wan", name: "林晚", role: "港口电台主播", avatar: "assets/characters/su-mi.jpg", line: "我播报的是天气，不是二十年前的家族故事。", answers: { time: "我在电台录潮汐预报，录音带可以证明时间。", motive: "旧信里的人名很适合做一期节目，但我还没拿到它。", key: "邮戳日期被擦过，和今晚潮汐表上的数字很像。" } },
      { id: "qiao", name: "乔峤", role: "港务安检员", avatar: "assets/characters/luo-xu.jpg", line: "仓库的门锁完好，没有人从正门带走任何东西。", answers: { time: "我在南门值班，只有江屿拿着维修通行证进过内港。", motive: "我只想保住这份工作，不想卷入旧案。", key: "封条上的蜡不是港务处的颜色，是维修组常用的蓝蜡。" } }
    ],
    evidence: [
      { id: "tide", symbol: "◒", name: "潮汐记录", type: "航海日志 · 22:10", image: "assets/covers/old-port-letter.jpg", detail: "潮水比官方记录提前了十二分钟，只有熟悉旧港闸门的人才会知道这件事。" },
      { id: "seal", symbol: "⌁", name: "蓝色封蜡", type: "封存物 · 档案室", image: "assets/evidence/old-wax.jpg", detail: "封蜡来自维修组，不是港务处。蜡面上有刚刚压过的旧徽章纹路。" },
      { id: "letter", symbol: "✎", name: "未寄出的信", type: "纸质物证 · 灯塔", image: "assets/game/wet-note.jpg", detail: "信中提到二十年前的一次换班，收信人正是今晚第一个离开港口的人。" },
      { id: "key", symbol: "◇", name: "铜制灯塔钥匙", type: "金属物证 · 北堤", image: "assets/game/security-console.jpg", detail: "钥匙齿口有新鲜刮痕，说明它刚刚打开过一把长期未使用的锁。" },
      { id: "salt", symbol: "—", name: "信封盐渍", type: "痕迹 · 信封内侧", image: "assets/evidence/old-salt.jpg", detail: "盐渍只出现在信封内侧，说明信曾被带进潮湿的地窖，而不是在桌上被打开。" },
      { id: "stamp", symbol: "▱", name: "被擦掉的邮戳", type: "纸面痕迹 · 旧邮局", image: "assets/evidence/old-erased-stamp.jpg", detail: "邮戳年份被刻意擦掉，但残留的蓝黑墨水与维修组登记簿上的印泥一致。" }
    ],
    timeline: [["21:42", "江屿借维修名义拿到灯塔钥匙。"], ["21:55", "他修改潮汐记录，让所有人低估地窖进水时间。"], ["22:03", "江屿进入档案室取走信件，留下蓝色封蜡。"], ["22:10", "涨潮冲开地窖门，盐渍暴露了信件真正被藏过的位置。"]]
  },
  "orbit-7": {
    title: "轨道之外", player: "沈逐 · 轨道维护官", caseLabel: "CASE 071 / ORBIT-7", openingStamp: "07:07", closeStamp: "07:21", playerAvatar: "assets/characters/gu-yan.jpg", sceneKicker: "ORBITAL STATION / BLACKOUT", sceneImage: "assets/covers/orbit-7.jpg", solution: "mu", solutionName: "穆岑", badge: "轨道观测者",
    intro: "轨道七号站失去通讯的第七分钟，所有人都收到了一条来自未来的讯息。氧气没有减少，记忆却出现了七分钟的空白。",
    evidenceLead: "空间站的系统还在运转，只有人的记录被人为改写。", evidenceCopy: "点击查看每一件物证，确认这条来自未来的讯息究竟从哪里发出。", questionCopy: "在失重环境里，每个人的动作都会留下轨迹。选择一名船员，追问他在黑屏七分钟里的真实位置。",
    voteLead: "通讯即将恢复。现在，指认那个把事故伪装成时间回声的人。", voteCopy: "真正的答案应该同时解释：舱门权限、冷却液痕迹，以及那条不可能提前抵达的讯息。",
    resultTitle: "讯息来自七分钟前", resultText: "正确。穆岑利用维护舱的备用时钟制造了延迟，把自己的越权操作伪装成未来讯息。真正暴露他的，是冷却液在失重状态下留下的方向性颗粒。",
    suspects: [
      { id: "mu", name: "穆岑", role: "系统工程师", avatar: "assets/characters/gu-yan.jpg", line: "我只负责维持系统稳定，不负责解释你们的幻觉。", answers: { time: "黑屏时我在核心舱重启冷却回路，日志会证明我没离开。", motive: "如果通讯恢复，所有人都会知道是谁把这座站拖进故障。", key: "主舱权限在舰长和我之间共享，但我没有改过记录。" } },
      { id: "qiao", name: "乔安", role: "深空测绘员", avatar: "assets/characters/shen-yuan.jpg", line: "我看见的是星图，不是你们说的未来。", answers: { time: "我在观景舱校准望远镜，黑屏时看见外侧有一道反光。", motive: "有人想让我们错过一次航线发现，但这和我无关。", key: "七号舱的门在讯息抵达前就被打开过。" } },
      { id: "rui", name: "瑞恩", role: "医疗官", avatar: "assets/characters/su-mi.jpg", line: "记忆缺口不等于有人撒谎，也可能是缺氧造成的。", answers: { time: "我在医疗舱给自己做心率记录，黑屏期间没有离开。", motive: "我想尽快返航，但没有必要破坏通讯。", key: "穆岑的手套上有冷却液，不是医疗舱的消毒液。" } },
      { id: "yan", name: "颜川", role: "货运领航员", avatar: "assets/characters/luo-xu.jpg", line: "货舱的每一件东西都有编号，别把我和系统故障混在一起。", answers: { time: "我在货舱核对样本，听到七号舱门开合了一次。", motive: "我只想让货物完整抵达地面。", key: "备用时钟的电池被换过，只有系统工程师能调取。" } },
      { id: "lin", name: "林澜", role: "通讯指挥", avatar: "assets/characters/he-yunchuan.jpg", line: "那条讯息的时间戳不可能是真的，但它确实从站内发出。", answers: { time: "我在通讯台重连地面频道，黑屏后收到一段无来源数据。", motive: "如果事故被定性为人为，我会失去指挥资格。", key: "讯息的压缩格式来自维护舱旧系统。" } }
    ],
    evidence: [
      { id: "signal", symbol: "◒", name: "未来讯息", type: "通讯记录 · 07:14", image: "assets/covers/orbit-7.jpg", detail: "讯息的时间戳比发出时间早七分钟，但压缩格式属于已经停用的维护舱系统。" },
      { id: "coolant", symbol: "⌁", name: "冷却液颗粒", type: "物理痕迹 · 核心舱", image: "assets/evidence/orbit-coolant.jpg", detail: "颗粒在失重状态下形成单向漂移，来源指向从维护舱离开的人。" },
      { id: "clock", symbol: "✎", name: "备用时钟电池", type: "机械物证 · 七号舱", image: "assets/evidence/orbit-clock.jpg", detail: "电池刚被更换，旧电池的温度还没有降下来。" },
      { id: "door", symbol: "◇", name: "舱门权限", type: "电子记录 · 07:09", image: "assets/evidence/orbit-hatch.jpg", detail: "七号舱门在讯息发出前已被打开，授权码属于系统维护组。" },
      { id: "glove", symbol: "—", name: "维护手套", type: "纤维痕迹 · 医疗舱", image: "assets/evidence/orbit-glove.jpg", detail: "手套内侧残留冷却液，外侧却没有核心舱的金属粉尘，说明它被事后转移过。" },
      { id: "route", symbol: "▱", name: "被删航线", type: "星图 · 观景舱", image: "assets/evidence/orbit-chart.jpg", detail: "被删掉的航线正好经过通讯盲区，是制造延迟讯息的唯一窗口。" }
    ],
    timeline: [["07:07", "穆岑进入维护舱，替换备用时钟电池。"], ["07:09", "七号舱门被旧权限打开，冷却液颗粒漂入通道。"], ["07:14", "延迟讯息被伪装成未来数据发送。"], ["07:21", "通讯恢复，时间戳矛盾暴露。"]]
  },
  "velvet-room": {
    title: "绒幕之后", player: "顾眠 · 舞台监督", caseLabel: "CASE 044 / VELVET", openingStamp: "22:14", closeStamp: "22:27", playerAvatar: "assets/characters/shen-yuan.jpg", sceneKicker: "THE VELVET STAGE / AFTER CURTAIN", sceneImage: "assets/covers/velvet-room.jpg", solution: "yin", solutionName: "尹棠", badge: "谢幕后观察者",
    intro: "剧院谢幕后的第十三分钟，女主角的备用剧本从化妆间消失。没有人离开后台，但所有人都在争夺最后一个角色。",
    evidenceLead: "舞台灯还亮着，后台却没有一条走廊能证明谁说了真话。", evidenceCopy: "每件物证都来自不同的后台角落。先找出谁能接触备用剧本，再拆穿那段排练过的哭声。", questionCopy: "每个人都知道如何在舞台上隐藏情绪。选择一位剧团成员，追问他在谢幕后的十三分钟去了哪里。",
    voteLead: "最后一幕即将重演。现在，指认那个把整场事故写进剧本的人。", voteCopy: "真正的答案应该同时解释：化妆镜粉尘、后台钥匙，以及录音里提前出现的脚步声。",
    resultTitle: "最后一个角色属于真相", resultText: "正确。尹棠提前录下脚步声，又用后台备用钥匙进入化妆间取走剧本。真正暴露她的，是镜前粉尘里倒置的鞋印方向。",
    suspects: [
      { id: "yin", name: "尹棠", role: "替补女主角", avatar: "assets/characters/shen-yuan.jpg", line: "我只是想演好今晚的最后一幕，不想抢任何人的秘密。", answers: { time: "谢幕后我一直在侧台等通知，红色幕布后没有人看见我。", motive: "备用剧本决定谁能出演下一季，但我没有必要偷走它。", key: "化妆间钥匙挂在舞台监督台，只有顾眠和导演能取。" } },
      { id: "bo", name: "柏舟", role: "剧院导演", avatar: "assets/characters/gu-yan.jpg", line: "演出需要悬念，但不需要真的丢东西。", answers: { time: "我在观众席和投资人谈下一季，后台的事交给了助理。", motive: "剧本消失会让投资人撤资，但我不会毁掉自己的作品。", key: "备用钥匙昨晚被借走过，归还时上面有舞台蜡油。" } },
      { id: "xue", name: "薛宁", role: "首席舞美", avatar: "assets/characters/he-yunchuan.jpg", line: "灯光和机关都按时工作，出问题的是人。", answers: { time: "我在吊景区检查绳索，听到化妆间有人关门。", motive: "只要演出继续，我的舞美合同就不会受影响。", key: "录音里的脚步声比实际谢幕早了四分钟。" } },
      { id: "qi", name: "祁雾", role: "首席化妆师", avatar: "assets/characters/su-mi.jpg", line: "镜子照出的是脸，不会照出谁在撒谎。", answers: { time: "我在清理化妆台，尹棠来过一次，但没有停留。", motive: "剧本里的角色和我无关，我只负责让演员上台。", key: "粉尘里有一枚倒置鞋印，鞋跟纹路像尹棠的演出鞋。" } },
      { id: "meng", name: "孟川", role: "后台领班", avatar: "assets/characters/luo-xu.jpg", line: "后台钥匙都在我这里，但我没有离开过对讲机旁。", answers: { time: "我在道具间盘点银杯，十三分钟里没有人经过正门。", motive: "我只想保证剧院顺利收场。", key: "备用钥匙的铜牌朝向被换过，只有熟悉钥匙柜的人会这么放。" } }
    ],
    evidence: [
      { id: "powder", symbol: "◒", name: "镜前粉尘", type: "痕迹 · 化妆间", image: "assets/evidence/velvet-powder.jpg", detail: "粉尘里的鞋印方向朝向镜子，而不是门口，说明有人倒着走进过化妆间。" },
      { id: "key", symbol: "⌁", name: "后台备用钥匙", type: "金属物证 · 钥匙柜", image: "assets/game/security-console.jpg", detail: "钥匙上的蜡油来自舞台机关区，尹棠的替补鞋底也沾有同样的蜡。" },
      { id: "recording", symbol: "✎", name: "提前录好的脚步声", type: "音频 · 对讲机", image: "assets/evidence/velvet-recorder.jpg", detail: "录音里的脚步声比真正的谢幕早四分钟，只有能接触控制台的人能提前录制。" },
      { id: "script", symbol: "◇", name: "撕下的剧本页", type: "纸面物证 · 道具间", image: "assets/evidence/velvet-script.jpg", detail: "撕口边缘残留红色绒线，来自后台幕布内侧，而不是化妆间。" },
      { id: "shoe", symbol: "—", name: "倒置鞋印", type: "鞋底痕迹 · 镜前", image: "assets/evidence/velvet-shoe.jpg", detail: "鞋印方向与普通离开动作相反，留下者在镜前完成了一个刻意的回身。" },
      { id: "curtain", symbol: "▱", name: "绒幕纤维", type: "纤维 · 剧本夹", image: "assets/covers/velvet-room.jpg", detail: "剧本夹的缝隙里卡着后台幕布纤维，说明它曾被藏在绒幕后。" }
    ],
    timeline: [["22:14", "尹棠提前录下脚步声，制造有人离开后台的假象。"], ["22:18", "她借备用钥匙进入化妆间取走剧本。"], ["22:21", "尹棠把剧本藏到绒幕后，再回到侧台。"], ["22:27", "镜前倒置鞋印和绒幕纤维让她的路线无法伪装。"]]
  }
};
caseLibrary["old-port-letter"] = caseLibrary["last-letter"];
let activeCase = demoCase;
const gameState = { phase: "briefing", discovered: new Set(), selectedEvidence: null, selectedSuspect: "shen", answers: new Set(), questionCount: 0, startedAt: 0, timer: null };

function setGameNav(phase) {
  gameState.phase = phase;
  const phases = { briefing: 1, evidence: 2, question: 3, vote: 4, result: 4 };
  $("#gameProgressFill").style.width = `${(phases[phase] / 4) * 100}%`;
  $$(".game-nav-item").forEach((item) => item.classList.toggle("active", item.dataset.gamePhase === phase));
  const labels = { briefing: "序章 · 入场", evidence: "第一幕 · 搜证", question: "第二幕 · 质询", vote: "终局 · 指认", result: "终局 · 复盘" };
  $("#gamePhaseLabel").textContent = labels[phase];
}

function gameAction(content, hint, button, handler) {
  $("#gameActionBar").innerHTML = `<span class="action-hint">${hint}</span>${button ? `<button class="primary-button" id="gameNextAction">${button} <span>↗</span></button>` : ""}`;
  if (handler) $("#gameNextAction").addEventListener("click", handler);
}

function renderBriefing() {
  setGameNav("briefing");
  $("#gameEyebrow").textContent = `PROLOGUE / ${activeCase.openingStamp}`;
  $("#gameTitle").textContent = activeCase.title;
  $("#gameContent").innerHTML = `<span class="game-kicker">${activeCase.sceneKicker}</span><div class="game-scene"><img src="${activeCase.sceneImage}" alt="${activeCase.title}案发现场" /></div><p class="game-lede">${activeCase.intro}</p><p class="game-copy">你是 <strong>${activeCase.player}</strong>。今晚的在场者都知道一部分真相，却没有人知道全部。你的目标不是马上找到答案，而是先确认：谁有机会，谁有动机，谁在说一个无法被证据支持的故事。</p><div class="scene-line"></div><div class="event-log">${activeCase.timeline.slice(0, 3).map(([time, text]) => `<div class="event-log-item"><b>${time}</b><span>${text}</span></div>`).join("")}</div>`;
  gameAction(null, "先搜集至少 3 条线索，再进入质询。", "开始搜证", renderEvidence);
}

function renderEvidence() {
  setGameNav("evidence");
  $("#gameEyebrow").textContent = "ACT I / COLLECT EVIDENCE";
  $("#gameTitle").textContent = "搜寻线索";
  const selectedEvidence = activeCase.evidence.find((entry) => entry.id === gameState.selectedEvidence);
  const evidenceModal = selectedEvidence ? `<div class="evidence-modal open" id="evidenceModal" role="dialog" aria-modal="true" aria-label="${selectedEvidence.name}"><div class="evidence-modal-card"><button class="evidence-modal-close" data-evidence-close aria-label="关闭">×</button><img class="evidence-modal-image" src="${selectedEvidence.image}" alt="${selectedEvidence.name}" /><div class="evidence-modal-body"><span class="game-kicker">CASE NOTE / EVIDENCE ${String(gameState.discovered.size).padStart(2, "0")}</span><h3>${selectedEvidence.name}</h3><p class="evidence-modal-type">${selectedEvidence.type}</p><p>${selectedEvidence.detail}</p><button class="primary-button evidence-modal-done" data-evidence-close>记入案件笔记 <span>↗</span></button></div></div></div>` : "";
  $("#gameContent").innerHTML = `<span class="game-kicker">选择物证 · 点击查看细节</span><div class="game-scene game-scene-evidence"><img src="${activeCase.sceneImage}" alt="${activeCase.title}案发现场" /></div><p class="game-lede">${activeCase.evidenceLead}</p><p class="game-copy">${activeCase.evidenceCopy}</p><div class="scene-line"></div><div class="evidence-grid">${activeCase.evidence.map((item) => `<button class="evidence-card ${gameState.discovered.has(item.id) ? "discovered" : ""}" data-evidence="${item.id}"><img class="evidence-thumb" src="${item.image}" alt="${item.name}" /><strong>${item.name}</strong><small>${item.type}</small><span class="discovered-badge">已记录</span></button>`).join("")}</div>${evidenceModal}`;
  $$(".evidence-card").forEach((card) => card.addEventListener("click", () => inspectEvidence(card.dataset.evidence)));
  $$('[data-evidence-close]').forEach((button) => button.addEventListener("click", () => { gameState.selectedEvidence = null; renderEvidence(); }));
  const canContinue = gameState.discovered.size >= 3;
  gameAction(null, `已发现 ${gameState.discovered.size} / 3 条关键线索`, canContinue ? "进入公开质询" : "继续搜证", canContinue ? renderQuestion : () => showToast("至少查看三件物证，才能进入下一幕"));
}

function inspectEvidence(id) {
  const item = activeCase.evidence.find((entry) => entry.id === id);
  if (!item) return;
  gameState.discovered.add(id);
  gameState.selectedEvidence = id;
  renderEvidence();
  showToast(`已记录：${item.name}`);
}

function renderQuestion() {
  setGameNav("question");
  $("#gameEyebrow").textContent = "ACT II / OPEN QUESTIONING";
  $("#gameTitle").textContent = "公开质询";
  const suspect = activeCase.suspects.find((entry) => entry.id === gameState.selectedSuspect) || activeCase.suspects[0];
  const answered = gameState.answers.has(suspect.id);
  $("#gameContent").innerHTML = `<span class="game-kicker">SCRIPTED ROLEPLAY / RESPONSE</span><div class="game-scene game-scene-question"><img src="${activeCase.sceneImage}" alt="${activeCase.title}现场" /></div><p class="game-copy" style="margin:12px 0 20px">${activeCase.questionCopy}</p><div class="question-layout"><div class="suspect-list">${activeCase.suspects.map((entry) => `<button class="suspect-button ${entry.id === suspect.id ? "active" : ""}" data-suspect="${entry.id}"><img src="${entry.avatar}" alt="" /><span>${entry.name}<small>${entry.role}</small></span></button>`).join("")}</div><div class="dialogue-box"><div class="dialogue-person"><img src="${suspect.avatar}" alt="${suspect.name}" /><div><h3 class="dialogue-name">${suspect.name}</h3><span class="dialogue-role">${suspect.role}</span></div></div><p class="dialogue-text">${answered ? suspect.answers.time : suspect.line}</p><div class="question-options">${Object.entries({ time: "你在关键时间段在哪里？", motive: "谁最有动机？", key: "你见过关键物证吗？" }).map(([key, label]) => `<button class="question-option ${gameState.answers.has(`${suspect.id}:${key}`) ? "used" : ""}" data-question="${key}" data-suspect="${suspect.id}">${label}</button>`).join("")}</div></div></div>`;
  $$(".suspect-button").forEach((button) => button.addEventListener("click", () => { gameState.selectedSuspect = button.dataset.suspect; renderQuestion(); }));
  $$(".question-option").forEach((button) => button.addEventListener("click", () => askQuestion(button.dataset.suspect, button.dataset.question)));
  gameAction(null, `${gameState.questionCount} 次质询记录 · 线索越多，判断越接近真相`, gameState.questionCount >= 3 ? "进入最终指认" : "继续质询", gameState.questionCount >= 3 ? renderVote : () => showToast("至少完成三次质询，再做最终指认"));
}

function askQuestion(suspectId, question) {
  const suspect = activeCase.suspects.find((entry) => entry.id === suspectId);
  const answerKey = `${suspectId}:${question}`;
  if (!gameState.answers.has(answerKey)) gameState.questionCount += 1;
  gameState.answers.add(answerKey);
  gameState.answers.add(suspectId);
  renderQuestion();
  const box = $(".dialogue-text");
  box.textContent = suspect.answers[question];
  showToast(`${suspect.name} 已回应`);
}

function renderVote() {
  setGameNav("vote");
  $("#gameEyebrow").textContent = "FINAL ACT / NAME THE CULPRIT";
  $("#gameTitle").textContent = "最终指认";
  $("#gameContent").innerHTML = `<span class="game-kicker">ONE ACCUSATION / ONE TRUTH</span><div class="game-scene game-scene-vote"><img src="${activeCase.sceneImage}" alt="${activeCase.title}现场" /></div><p class="game-lede">${activeCase.voteLead}</p><p class="game-copy">${activeCase.voteCopy}</p><div class="scene-line"></div><div class="vote-grid">${activeCase.suspects.map((suspect) => `<div class="vote-card"><img src="${suspect.avatar}" alt="" /><strong>${suspect.name}</strong><small>${suspect.role}</small><button class="vote-button" data-vote="${suspect.id}">指认 TA ↗</button></div>`).join("")}</div>`;
  $$(".vote-button").forEach((button) => button.addEventListener("click", () => castVote(button.dataset.vote)));
  gameAction(null, "你只有一次正式指认机会。", null, null);
}

function castVote(id) {
  if (id !== activeCase.solution) {
    const card = document.querySelector(`[data-vote="${id}"]`).parentElement;
    card.classList.add("wrong-vote");
    showToast("这个答案无法解释全部证据，再想想");
    setTimeout(() => card.classList.remove("wrong-vote"), 350);
    return;
  }
  renderResult();
}

function renderResult() {
  setGameNav("result");
  $("#gameEyebrow").textContent = `CASE CLOSED / ${activeCase.closeStamp}`;
  $("#gameTitle").textContent = "真相浮出水面";
  $("#gameContent").innerHTML = `<div class="result-card"><div class="result-scene"><img src="${activeCase.sceneImage}" alt="${activeCase.title}案件现场" /></div><div class="result-symbol">✓</div><h2>${activeCase.resultTitle}</h2><p>${activeCase.resultText}</p><div class="timeline">${activeCase.timeline.map(([time, text]) => `<div class="timeline-item"><b>${time}</b><span>${text}</span></div>`).join("")}</div></div>`;
  gameAction(null, `案件已归档 · 你获得「${activeCase.badge}」徽记`, "再玩一次", () => { gameState.discovered = new Set(); gameState.selectedEvidence = null; gameState.answers = new Set(); gameState.questionCount = 0; gameState.selectedSuspect = activeCase.suspects[0].id; renderBriefing(); });
}

function startGame() {
  closeModal();
  activeCase = caseLibrary[state.selectedScript?.id] || demoCase;
  gameState.discovered = new Set();
  gameState.selectedEvidence = null;
  gameState.answers = new Set();
  gameState.questionCount = 0;
  gameState.selectedSuspect = activeCase.suspects[0].id;
  $("#gameCaseLabel").textContent = activeCase.caseLabel || "CASE 014 / MOONLIGHT";
  $("#playerRole").textContent = activeCase.player;
  $("#playerAvatarImage").src = activeCase.playerAvatar || "assets/characters/lin-che.jpg";
  $("#caseNoteText").textContent = activeCase.intro;
  gameState.startedAt = Date.now();
  setView("game");
  $("#viewLabel").textContent = "正在游玩";
  renderBriefing();
  clearInterval(gameState.timer);
  gameState.timer = setInterval(() => { const seconds = Math.floor((Date.now() - gameState.startedAt) / 1000); $("#gameClock").textContent = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`; }, 1000);
}

function bindEvents() {
  $$(".nav-item").forEach((item) => item.addEventListener("click", () => setView(item.dataset.view)));
  $$(`[data-view-target]`).forEach((item) => item.addEventListener("click", () => setView(item.dataset.viewTarget)));
  $$(".filter-tab").forEach((tab) => tab.addEventListener("click", () => { state.activeFilter = tab.dataset.filter; $$(".filter-tab").forEach((item) => item.classList.toggle("active", item === tab)); renderScripts(); }));
  $("#quickStart").addEventListener("click", () => { setView("rooms"); showToast("已打开试玩入口预览"); });
  $("#createRoom").addEventListener("click", () => { setView("discover"); showToast("请选择一个案件开始试玩"); });
  $("#modalClose").addEventListener("click", closeModal);
  $("#modalBackdrop").addEventListener("click", (event) => { if (event.target.id === "modalBackdrop") closeModal(); });
  $("#modalStart").addEventListener("click", startGame);
  $("#exitGame").addEventListener("click", () => { clearInterval(gameState.timer); setView("discover"); });
  $("#scanNow").addEventListener("click", async () => { try { await apiFetch("/api/scripts/scan", { method: "POST" }); await loadScripts(); await refreshSync(); showToast("扫描完成，剧本库已更新"); } catch { showToast("当前为离线试玩模式，无法扫描服务端文件夹"); } });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeModal(); });
  $("#chooseFile").addEventListener("click", () => $("#fileInput").click());
  $("#fileInput").addEventListener("change", async (event) => { const file = event.target.files[0]; if (file) { try { await importFile(file); } catch (error) { showToast(error.message); } event.target.value = ""; } });
  const dropzone = $("#dropzone");
  ["dragenter", "dragover"].forEach((eventName) => dropzone.addEventListener(eventName, (event) => { event.preventDefault(); dropzone.classList.add("dragging"); }));
  ["dragleave", "drop"].forEach((eventName) => dropzone.addEventListener(eventName, (event) => { event.preventDefault(); dropzone.classList.remove("dragging"); }));
  dropzone.addEventListener("drop", async (event) => { const file = event.dataTransfer.files[0]; if (file) { try { await importFile(file); } catch (error) { showToast(error.message); } } });
}

bindEvents();
renderRooms();
loadScripts();
setInterval(refreshSync, 4500);
