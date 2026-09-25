function readLocalePreference() {
  try {
    const saved = localStorage.getItem("nocturne-locale");
    return saved === "en" || saved === "zh" ? saved : null;
  } catch {
    return null;
  }
}

const state = { scripts: [], activeFilter: "all", selectedScript: null, locale: readLocalePreference() || "zh", localeSource: readLocalePreference() ? "manual" : "auto" };
const API_BASE = String(window.NOCTURNE_API_BASE || "").replace(/\/$/, "");
const apiFetch = (path, options) => fetch(`${API_BASE}${path}`, options);
const translations = {
  zh: {
    appTitle: "Nocturne · 剧本推理社交", brandCaption: "SCRIPT MYSTERY / SOCIAL PLAY", mobileCaption: "剧本探索社", navDiscover: "发现剧本", navRooms: "房间预览", navLibrary: "我的收藏", navStudio: "创作后台", mainNav: "主导航", mobileNav: "移动端主导航", mobileHome: "首页", mobileRooms: "房间", mobileLibrary: "收藏", mobileStudio: "创作", localPlay: "LOCAL PLAY", offlineCases: "4 个案件可离线试玩", profileAvatar: "凌", profileName: "凌 · 夜航员", profileLevel: "探索者 Lv.12", notification: "通知", heroCaseTitle: "月影审判", schemaExampleTitle: "月影审判", privacy: "隐私政策", terms: "用户协议", discover: "发现剧本", rooms: "房间预览", library: "我的收藏", studio: "创作后台",
    heroEyebrow: "今晚，进入另一个人生", heroTitleA: "真相藏在", heroTitleB: "每个人的沉默里。", heroDescription: "选择一段命运，和陌生人共同完成一场只发生一次的推理。", startTrial: "开始一局试玩", browseRooms: "浏览房间预览", curatedCases: "CURATED CASES", picksForYou: "为你挑选的剧本", all: "全部", mystery: "悬疑", emotion: "情感", sciFi: "科幻",
    roomKicker: "ROOM PREVIEW", roomTitle: "故事房间预览", roomDescription: "当前版本提供单人案件试玩；多人匹配和语音房间将在服务端接入后开放。", viewTrialEntry: "查看试玩入口", roomJoin: "加入", roomWatch: "观战", roomMissing: "还差 {count} 人", roomFull: "已满员", roomRequest: "{room}：已发送入场请求",
    archiveKicker: "YOUR ARCHIVE", archiveTitle: "收藏与足迹", archiveDescription: "保存那些值得二刷的故事，也记录你曾经成为谁。", archiveEmptyTitle: "你的档案还很安静", archiveEmptyDescription: "收藏剧本后，它们会出现在这里。", exploreScripts: "去探索剧本", studioKicker: "STUDIO / CONTENT OPS", studioTitle: "创作后台", studioDescription: "剧本文件进入指定目录后，Nocturne 会自动识别、整理并发布到剧本库。", syncEnabled: "自动同步已开启", synced: "已同步 {count} 个剧本", autoIngestion: "AUTO INGESTION", ingestionTitle: "剧本自动入库", live: "● LIVE", dropTitle: "拖入剧本文件", dropDescription: "支持 .json / .md · 上传后自动解析并发布为草稿", chooseFile: "选择文件", listening: "后台文件夹监听中", incomingFolder: "将文件放入 /incoming，每 4 秒自动同步", waiting: "等待数据", activity: "ACTIVITY FEED", recentActivity: "最近动态", scanNow: "立即扫描 ↗", schemaTitle: "内容格式提示", schemaDescription: "JSON 文件可直接提供 title、genre、players、duration、tags、description 和 content 字段；Markdown 文件会自动读取一级标题作为剧本名。",
    emptyFilterTitle: "还没有这个类型的剧本", emptyFilterDescription: "换一个筛选，或者去创作后台导入新剧本。", caseFile: "CASE FILE", privateCase: "CASE FILE / PRIVATE", players: "PLAYERS", duration: "DURATION", level: "LEVEL", defaultSubtitle: "一场关于真相、秘密与选择的沉浸式推理", defaultDescription: "一份新剧本已经抵达。请在所有人说出真话之前，找到唯一无法被伪造的证据。", detailStart: "开始试玩", cardStart: "查看详情 / 开始试玩",
    gamePlaying: "正在游玩", backToLibrary: "← 返回剧本库", livePlay: "剧情演绎中", yourRole: "你的角色", caseNote: "案件笔记", phaseBriefing: "序章 · 入场", phaseEvidence: "第一幕 · 搜证", phaseQuestion: "第二幕 · 质询", phaseVote: "终局 · 指认", phaseResult: "终局 · 复盘", gameTitleEvidence: "搜寻线索", gameTitleQuestion: "公开质询", gameTitleVote: "最终指认", gameTitleResult: "真相浮出水面", startEvidence: "开始搜证", continueEvidence: "继续搜证", continueQuestion: "继续质询", enterQuestion: "进入公开质询", enterVote: "进入最终指认", finalVote: "最终指认", closed: "案件已归档", replay: "再玩一次", evidenceHint: "先搜集至少 3 条线索，再进入质询。", evidenceCount: "已发现 {count} / 3 条关键线索", questionHint: "{count} 次质询记录 · 线索越多，判断越接近真相", voteHint: "你只有一次正式指认机会。", inspectEvidence: "选择物证 · 点击查看细节", recordEvidence: "记入案件笔记", noEnoughEvidence: "至少查看三件物证，才能进入下一幕", noEnoughQuestions: "至少完成三次质询，再做最终指认", questionTime: "你在关键时间段在哪里？", questionMotive: "谁最有动机？", questionKey: "你见过关键物证吗？", accuse: "指认 TA ↗", correct: "真相浮出水面", wrong: "这个答案无法解释全部证据，再想想", localResponse: "{name} 已回应", recorded: "已记录", close: "关闭", sceneAlt: "案件现场", roomTrialPrompt: "请选择一个案件开始试玩", scanComplete: "扫描完成，剧本库已更新", scanOffline: "当前为离线试玩模式，无法扫描服务端文件夹",
  },
  en: {
    appTitle: "Nocturne · Script Mystery Social", brandCaption: "SCRIPT MYSTERY / SOCIAL PLAY", mobileCaption: "Script mystery social", navDiscover: "Discover", navRooms: "Rooms", navLibrary: "My Archive", navStudio: "Studio", mainNav: "Main navigation", mobileNav: "Mobile navigation", mobileHome: "Home", mobileRooms: "Rooms", mobileLibrary: "Archive", mobileStudio: "Studio", localPlay: "LOCAL PLAY", offlineCases: "4 cases ready offline", profileAvatar: "L", profileName: "Ling · Night Watcher", profileLevel: "Explorer Lv.12", notification: "Notifications", heroCaseTitle: "The Trial of Moonlight", schemaExampleTitle: "The Trial of Moonlight", privacy: "Privacy", terms: "Terms", discover: "Discover", rooms: "Rooms", library: "My Archive", studio: "Studio",
    heroEyebrow: "TONIGHT, ENTER ANOTHER LIFE", heroTitleA: "Truth hides", heroTitleB: "inside every silence.", heroDescription: "Choose a fate and solve a one-night mystery with people you have never met.", startTrial: "Start a trial", browseRooms: "Browse rooms", curatedCases: "CURATED CASES", picksForYou: "Curated for you", all: "All", mystery: "Mystery", emotion: "Drama", sciFi: "Sci-fi",
    roomKicker: "ROOM PREVIEW", roomTitle: "Story rooms", roomDescription: "This version supports solo case trials. Multiplayer matching and voice rooms will open when the service layer is connected.", viewTrialEntry: "View trial entry", roomJoin: "Join", roomWatch: "Watch", roomMissing: "{count} spot(s) left", roomFull: "Full", roomRequest: "{room}: entry request sent",
    archiveKicker: "YOUR ARCHIVE", archiveTitle: "Saved stories", archiveDescription: "Keep the stories worth replaying and remember who you became.", archiveEmptyTitle: "Your archive is quiet", archiveEmptyDescription: "Saved scripts will appear here.", exploreScripts: "Explore scripts", studioKicker: "STUDIO / CONTENT OPS", studioTitle: "Creator studio", studioDescription: "Drop script files into the watched folder and Nocturne will parse, organize and publish them as drafts.", syncEnabled: "Auto-sync enabled", synced: "{count} scripts synced", autoIngestion: "AUTO INGESTION", ingestionTitle: "Script ingestion", live: "● LIVE", dropTitle: "Drop script files here", dropDescription: "Supports .json / .md · files are parsed into drafts automatically", chooseFile: "Choose file", listening: "Watching the incoming folder", incomingFolder: "Put files in /incoming; scan runs every 4 seconds", waiting: "Waiting for data", activity: "ACTIVITY FEED", recentActivity: "Recent activity", scanNow: "Scan now ↗", schemaTitle: "Content format", schemaDescription: "JSON may provide title, genre, players, duration, tags, description and content; Markdown uses its first-level heading as the script title.",
    emptyFilterTitle: "No scripts in this category", emptyFilterDescription: "Try another filter or import a new script from Studio.", caseFile: "CASE FILE", privateCase: "CASE FILE / PRIVATE", players: "PLAYERS", duration: "DURATION", level: "LEVEL", defaultSubtitle: "An immersive mystery about truth, secrets and choice", defaultDescription: "A new script has arrived. Find the one piece of evidence that cannot be forged before everyone tells you their version of the truth.", detailStart: "Start trial", cardStart: "View details / Start trial",
    gamePlaying: "Playing", backToLibrary: "← Back to archive", livePlay: "Story in progress", yourRole: "Your role", caseNote: "Case notes", phaseBriefing: "Prologue · Arrival", phaseEvidence: "Act I · Evidence", phaseQuestion: "Act II · Questions", phaseVote: "Final act · Accusation", phaseResult: "Final act · Review", gameTitleEvidence: "Evidence hunt", gameTitleQuestion: "Open questioning", gameTitleVote: "Final accusation", gameTitleResult: "The truth comes to light", startEvidence: "Start evidence hunt", continueEvidence: "Keep searching", continueQuestion: "Keep questioning", enterQuestion: "Open questioning", enterVote: "Make final accusation", finalVote: "Final accusation", closed: "Case archived", replay: "Play again", evidenceHint: "Collect at least 3 clues before questioning.", evidenceCount: "{count} / 3 key clues found", questionHint: "{count} questions asked · more clues, better judgment", voteHint: "You only get one formal accusation.", inspectEvidence: "Select an item · tap to inspect", recordEvidence: "Record in case notes", noEnoughEvidence: "Inspect at least three items before the next act", noEnoughQuestions: "Ask at least three questions before the final accusation", questionTime: "Where were you during the critical window?", questionMotive: "Who has the strongest motive?", questionKey: "Have you seen the key evidence?", accuse: "Accuse ↗", correct: "The truth comes to light", wrong: "That answer cannot explain all the evidence", localResponse: "{name} has responded", recorded: "Recorded", close: "Close", sceneAlt: "case scene", roomTrialPrompt: "Choose a case to start a trial", scanComplete: "Scan complete; the script library is updated", scanOffline: "Offline trial mode cannot scan the server folder",
  }
};

function t(key, vars = {}) {
  let value = translations[state.locale]?.[key] ?? translations.zh[key] ?? key;
  return Object.entries(vars).reduce((result, [name, replacement]) => result.replaceAll(`{${name}}`, String(replacement)), value);
}
const fallbackScripts = [
  { id: "moon-trial", title: "月影审判", subtitle: "The Trial of Moonlight", genre: "悬疑 · 古典", players: 6, duration: "90 分钟", difficulty: "进阶", tags: ["多线叙事", "情感沉浸"], author: "Nocturne Studio", cover: "violet", description: "一场发生在私人博物馆的晚宴，一枚失踪的月光宝石，和六段互相矛盾的记忆。", status: "可开局" },
  { id: "last-letter", title: "旧港来信", subtitle: "Letters from the Old Port", genre: "情感 · 时代", players: 5, duration: "75 分钟", difficulty: "入门", tags: ["情感还原", "双重结局"], author: "Morrow House", cover: "amber", description: "在潮水再次上涨之前，找出那封从未寄出的信，以及写信的人真正想留下什么。", status: "热度上升" },
  { id: "orbit-7", title: "轨道之外", subtitle: "Beyond the Orbit", genre: "科幻 · 密室", players: 7, duration: "110 分钟", difficulty: "硬核", tags: ["未来科幻", "机关线索"], author: "Signal / 07", cover: "blue", description: "空间站失去通讯的第七分钟，所有人都收到了来自未来的同一条讯息。", status: "可开局" },
  { id: "velvet-room", title: "绒幕之后", subtitle: "Behind the Velvet", genre: "情感 · 演绎", players: 6, duration: "80 分钟", difficulty: "进阶", tags: ["强角色", "语音演绎"], author: "Morrow House", cover: "rose", description: "剧院谢幕之后，真正的戏才刚刚开始。每个人都在争夺最后一个角色。", status: "新上线" }
];
const scriptTranslations = {
  "moon-trial": { title: "The Trial of Moonlight", subtitle: "THE TRIAL OF MOONLIGHT", genre: "Mystery · Classic", duration: "90 min", difficulty: "Advanced", tags: ["Multi-thread", "Emotional depth"], description: "At a private museum dinner, a moonstone vanishes while six memories begin to contradict one another.", status: "Ready to play" },
  "old-port-letter": { title: "Letters from the Old Port", subtitle: "LETTERS FROM THE OLD PORT", genre: "Drama · Period", duration: "75 min", difficulty: "Beginner", tags: ["Emotional reveal", "Dual ending"], description: "Before the tide rises again, find the never-sent letter and what its writer truly wanted to leave behind.", status: "Trending" },
  "last-letter": { title: "Letters from the Old Port", subtitle: "LETTERS FROM THE OLD PORT", genre: "Drama · Period", duration: "75 min", difficulty: "Beginner", tags: ["Emotional reveal", "Dual ending"], description: "Before the tide rises again, find the never-sent letter and what its writer truly wanted to leave behind.", status: "Trending" },
  "orbit-7": { title: "Beyond the Orbit", subtitle: "BEYOND THE ORBIT", genre: "Sci-fi · Locked room", duration: "110 min", difficulty: "Expert", tags: ["Future noir", "Mechanical clues"], description: "Seven minutes after a station loses contact, everyone receives the same message from the future.", status: "Ready to play" },
  "velvet-room": { title: "Behind the Velvet", subtitle: "BEHIND THE VELVET", genre: "Drama · Performance", duration: "80 min", difficulty: "Advanced", tags: ["Strong roles", "Voice acting"], description: "After the curtain falls, the real play begins. Everyone is fighting for the last role.", status: "New" }
};

function localizedScript(script) {
  if (!script || state.locale === "zh") return script;
  const custom = script.i18n?.en || {};
  const fallback = scriptTranslations[script.id] || {};
  return {
    ...script,
    ...fallback,
    ...custom,
    tags: custom.tags || fallback.tags || script.tags,
    title: custom.title || fallback.title || script.title,
    subtitle: custom.subtitle || fallback.subtitle || script.subtitle,
    genre: custom.genre || fallback.genre || script.genre,
    description: custom.description || fallback.description || script.description,
    status: custom.status || fallback.status || script.status
  };
}

const rooms = [
  { title: "月影审判", host: "Serein 的房间", players: "5 / 6", mood: "沉浸演绎", color: "violet", wait: "还差 1 人" },
  { title: "轨道之外", host: "ECHO-09", players: "4 / 7", mood: "硬核推理", color: "blue", wait: "还差 3 人" },
  { title: "旧港来信", host: "晚风不说话", players: "4 / 5", mood: "情感还原", color: "amber", wait: "还差 1 人" },
  { title: "绒幕之后", host: "Nocturne DM 03", players: "6 / 6", mood: "即将开始", color: "rose", wait: "已满员" }
];
const roomTranslations = {
  "月影审判": { title: "The Trial of Moonlight", host: "Serein's room", mood: "Immersive play", wait: "1 spot left" },
  "轨道之外": { title: "Beyond the Orbit", host: "ECHO-09", mood: "Hard mystery", wait: "3 spots left" },
  "旧港来信": { title: "Letters from the Old Port", host: "Late-night wind", mood: "Emotional reveal", wait: "1 spot left" },
  "绒幕之后": { title: "Behind the Velvet", host: "Nocturne DM 03", mood: "Starting soon", wait: "Full" }
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function applyStaticLocale() {
  document.documentElement.lang = state.locale === "zh" ? "zh-CN" : "en";
  document.title = t("appTitle");
  $(".brand-caption").textContent = t("brandCaption");
  $(".mobile-page-mark small").textContent = t("mobileCaption");
  $(".sidebar .nav-list").setAttribute("aria-label", t("mainNav"));
  $(".mobile-bottom-nav").setAttribute("aria-label", t("mobileNav"));
  const navLabels = { discover: "navDiscover", rooms: "navRooms", library: "navLibrary", studio: "navStudio" };
  $$(".sidebar .nav-item").forEach((item) => {
    const icon = item.querySelector(".nav-icon");
    item.innerHTML = `${icon ? icon.outerHTML : ""}${t(navLabels[item.dataset.view])}`;
  });
  const mobileLabels = { discover: "mobileHome", rooms: "mobileRooms", library: "mobileLibrary", studio: "mobileStudio" };
  $$(".mobile-nav-item").forEach((item) => { item.querySelector("small").textContent = t(mobileLabels[item.dataset.view]); });
  $(".online-signal strong").textContent = t("localPlay");
  $(".online-signal small").textContent = t("offlineCases");
  $(".profile-chip .avatar").textContent = t("profileAvatar");
  $(".profile-chip strong").textContent = t("profileName");
  $(".profile-chip small").textContent = t("profileLevel");
  $(".top-avatar").textContent = t("profileAvatar");
  $(".icon-button").title = t("notification");
  $(".legal-links a[href='privacy.html']").textContent = t("privacy");
  $(".legal-links a[href='terms.html']").textContent = t("terms");
  $(".hero-copy .eyebrow").textContent = t("heroEyebrow");
  $(".hero-copy h1").innerHTML = `${t("heroTitleA")}<br /><em>${t("heroTitleB")}</em>`;
  $(".hero-description").textContent = t("heroDescription");
  $("#quickStart").innerHTML = `${t("startTrial")} <span>↗</span>`;
  $(".hero-actions .ghost-button").textContent = t("browseRooms");
  $(".art-card strong").textContent = t("heroCaseTitle");
  $(".section-heading .eyebrow").textContent = t("curatedCases");
  $(".section-heading h2").textContent = t("picksForYou");
  const filterLabels = { all: "all", 悬疑: "mystery", 情感: "emotion", 科幻: "sciFi" };
  $$(".filter-tab").forEach((tab) => { tab.textContent = t(filterLabels[tab.dataset.filter] || "all"); });
  $("#roomsView .page-intro .eyebrow").textContent = t("roomKicker");
  $("#roomsView .page-intro h1").textContent = t("roomTitle");
  $("#roomsView .page-intro p:last-child").textContent = t("roomDescription");
  $("#createRoom").textContent = t("viewTrialEntry");
  $("#libraryView .page-intro .eyebrow").textContent = t("archiveKicker");
  $("#libraryView .page-intro h1").textContent = t("archiveTitle");
  $("#libraryView .page-intro p:last-child").textContent = t("archiveDescription");
  $("#libraryView .empty-library h3").textContent = t("archiveEmptyTitle");
  $("#libraryView .empty-library p").textContent = t("archiveEmptyDescription");
  $("#libraryView .empty-library .ghost-button").textContent = t("exploreScripts");
  $("#studioView .page-intro .eyebrow").textContent = t("studioKicker");
  $("#studioView .page-intro h1").textContent = t("studioTitle");
  $("#studioView .page-intro p:last-child").textContent = t("studioDescription");
  $("#syncBadge").innerHTML = `<span></span> ${t("syncEnabled")}`;
  const studioHeadings = $$("#studioView .panel-head h3");
  if (studioHeadings[0]) studioHeadings[0].textContent = t("ingestionTitle");
  if (studioHeadings[1]) studioHeadings[1].textContent = t("recentActivity");
  const studioEyebrows = $$("#studioView .panel-head .eyebrow");
  if (studioEyebrows[0]) studioEyebrows[0].textContent = t("autoIngestion");
  if (studioEyebrows[1]) studioEyebrows[1].textContent = t("activity");
  $("#studioView .panel-status").textContent = t("live");
  $(".dropzone h4").textContent = t("dropTitle");
  $(".dropzone p").textContent = t("dropDescription");
  $("#chooseFile").textContent = t("chooseFile");
  $(".sync-row strong").textContent = t("listening");
  $(".sync-row small").textContent = t("incomingFolder");
  $("#syncTime").textContent = t("waiting");
  $("#scanNow").textContent = t("scanNow");
  $(".schema-tip strong").textContent = t("schemaTitle");
  $(".schema-tip p").textContent = t("schemaDescription");
  $(".schema-tip code").textContent = `{ "title": "${t("schemaExampleTitle")}", "players": 6 }`;
  $("#modalCover .card-kicker").textContent = t("privateCase");
  $("#modalSubtitle").textContent = t("defaultSubtitle");
  $("#modalStart").innerHTML = `${t("detailStart")} <span>↗</span>`;
  $(".player-card span").textContent = t("yourRole");
  $(".back-button").textContent = t("backToLibrary");
  $(".case-note .eyebrow").textContent = t("caseNote");
  $(".live-pill").innerHTML = `<i></i> ${t("livePlay")}`;
  const gameNavLabels = { briefing: "phaseBriefing", evidence: "phaseEvidence", question: "phaseQuestion", vote: "phaseVote" };
  $$(".game-nav-item").forEach((item) => { const number = item.querySelector("span")?.textContent || ""; item.innerHTML = `<span>${number}</span>${t(gameNavLabels[item.dataset.gamePhase])}`; });
  $$("[data-locale]").forEach((button) => button.classList.toggle("active", button.dataset.locale === state.locale));
  if (!$("#gameView").classList.contains("active-view")) {
    const currentView = $(".sidebar .nav-item.active")?.dataset.view || "discover";
    $("#viewLabel").textContent = t(currentView);
  }
}

function setLocale(locale, { persist = true, source = "manual" } = {}) {
  if (locale !== "zh" && locale !== "en") return;
  state.locale = locale;
  state.localeSource = source;
  if (persist) {
    try { localStorage.setItem("nocturne-locale", locale); } catch { /* storage can be unavailable in private webviews */ }
  }
  applyStaticLocale();
  renderScripts();
  renderRooms();
  renderActivity();
  if ($("#gameView").classList.contains("active-view")) {
    activeCase = localizedCase(activeCase?.id || state.selectedScript?.id || "moon-trial");
    ({ briefing: renderBriefing, evidence: renderEvidence, question: renderQuestion, vote: renderVote, result: renderResult }[gameState.phase] || renderBriefing)();
  }
}

async function detectLocale() {
  if (state.localeSource === "manual") return;
  let locale = /^zh-cn/i.test(navigator.language || "") ? "zh" : "en";
  const endpoint = String(window.NOCTURNE_LOCALE_ENDPOINT || (API_BASE ? `${API_BASE}/api/locale` : "/api/locale")).trim();
  if (endpoint) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1800);
      const response = await fetch(endpoint, { signal: controller.signal, cache: "no-store" });
      clearTimeout(timeout);
      if (response.ok) {
        const data = await response.json();
        locale = String(data.country_code || data.countryCode || "").toUpperCase() === "CN" ? "zh" : "en";
      }
    } catch { /* country lookup is optional; browser language remains the safe fallback */ }
  }
  if (state.localeSource !== "manual") setLocale(locale, { persist: false, source: "auto" });
}

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
    <div class="script-cover cover-${script.cover || "violet"}" style="--cover-image: url('${coverImage}')"><span class="cover-kicker">${t("caseFile")} / ${String(script.id).slice(0, 8).toUpperCase()}</span><div class="cover-title"><strong>${script.title}</strong><small>${script.subtitle || "AN IMMERSIVE MYSTERY"}</small></div></div>
    <div class="script-body"><div class="script-top"><h3>${script.genre || "Narrative mystery"}</h3><small>${script.status || (state.locale === "en" ? "Ready to play" : "可开局")}</small></div><div class="script-meta"><span>${script.players || 6} ${state.locale === "en" ? "players" : "人"}</span><span>${script.duration || (state.locale === "en" ? "60–90 min" : "60–90 分钟")}</span><span>${script.difficulty || (state.locale === "en" ? "Advanced" : "进阶")}</span></div><div class="tag-list">${(script.tags || []).slice(0, 3).map((tag) => `<span class="tag">${tag}</span>`).join("")}</div><button class="card-start" data-start-script="${script.id}">${t("cardStart")} <span>↗</span></button></div>
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
  const scripts = state.scripts.map(localizedScript).filter((script) => filter === "all" || script.genre?.includes(filter) || script.tags?.some((tag) => tag.includes(filter)));
  $("#scriptGrid").innerHTML = scripts.map(scriptCard).join("") || `<div class="empty-library"><h3>${t("emptyFilterTitle")}</h3><p>${t("emptyFilterDescription")}</p></div>`;
  $$(".script-card").forEach((card) => card.addEventListener("click", () => openDetail(card.dataset.scriptId)));
  $$(".card-start").forEach((button) => button.addEventListener("click", (event) => { event.stopPropagation(); openDetail(button.dataset.startScript); }));
}

function renderRooms() {
  const roomScriptIds = { "月影审判": "moon-trial", "轨道之外": "orbit-7", "旧港来信": "last-letter", "绒幕之后": "velvet-room" };
  $("#roomGrid").innerHTML = rooms.map((room) => { const localized = state.locale === "en" ? (roomTranslations[room.title] || {}) : room; const title = localized.title || room.title; const host = localized.host || room.host; const mood = localized.mood || room.mood; const wait = localized.wait || room.wait; return `<article class="room-card"><div><span class="tag">${mood}</span><h3>${title}</h3><p>${host}<br />${wait}</p></div><div class="room-actions"><div class="room-players">${room.players}</div><button class="secondary-button join-room" data-script-id="${roomScriptIds[room.title] || "moon-trial"}">${room.players === "6 / 6" ? t("roomWatch") : t("roomJoin")} ↗</button></div></article>`; }).join("");
  $$(".join-room").forEach((button) => button.addEventListener("click", () => {
    state.selectedScript = state.scripts.find((script) => script.id === button.dataset.scriptId) || fallbackScripts.find((script) => script.id === button.dataset.scriptId) || fallbackScripts[0];
    startGame();
  }));
}

function openDetail(id) {
  const script = localizedScript(state.scripts.find((item) => item.id === id) || fallbackScripts.find((item) => item.id === id));
  if (!script) return;
  state.selectedScript = script;
  $("#modalCover").className = `modal-cover cover-${script.cover || "violet"}`;
  $("#modalCover").style.setProperty("--cover-image", `url('${coverAsset(script)}')`);
  $("#modalTitle").textContent = script.title;
  $("#modalSubtitle").textContent = script.subtitle || t("defaultSubtitle");
  $("#modalGenre").textContent = (script.genre || "叙事推理").toUpperCase();
  $("#modalDescription").textContent = script.description || t("defaultDescription");
  $("#modalStats").innerHTML = [[t("players"), `${script.players || 6} ${state.locale === "en" ? "players" : "人"}`], [t("duration"), script.duration || (state.locale === "en" ? "60–90 min" : "60–90 分钟")], [t("level"), script.difficulty || (state.locale === "en" ? "Advanced" : "进阶")]].map(([label, value]) => `<div class="modal-stat">${label}<strong>${value}</strong></div>`).join("");
  $("#modalTags").innerHTML = (script.tags || []).map((tag) => `<span class="tag">${tag}</span>`).join("");
  $("#modalBackdrop").classList.add("open");
  $("#modalBackdrop").setAttribute("aria-hidden", "false");
}

function closeModal() { $("#modalBackdrop").classList.remove("open"); $("#modalBackdrop").setAttribute("aria-hidden", "true"); }

function setView(view) {
  $$(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === view));
  $$(".view").forEach((item) => item.classList.toggle("active-view", item.id === `${view}View`));
  $("#viewLabel").textContent = view === "game" ? t("gamePlaying") : t(view);
}

function showToast(message) { const toast = $("#toast"); toast.textContent = message; toast.classList.add("show"); setTimeout(() => toast.classList.remove("show"), 2600); }

function formatTime(value) { if (!value) return t("waiting"); return new Intl.DateTimeFormat(state.locale === "zh" ? "zh-CN" : "en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(value)); }

async function refreshSync() {
  try {
    const response = await apiFetch("/api/sync");
    const data = await response.json();
    $("#syncTime").textContent = data.lastSync ? formatTime(data.lastSync) : t("waiting");
    if (data.lastFile) $("#syncBadge").innerHTML = `<span></span> ${t("synced", { count: data.total })}`;
    renderActivity(data);
  } catch { /* the static client remains usable without the API */ }
}

function renderActivity(data = {}) {
  const rows = [];
  if (data.lastFile) rows.push([state.locale === "zh" ? "新剧本已入库" : "New script ingested", `${data.lastFile} · ${formatTime(data.lastSync)}`]);
  rows.push([state.locale === "zh" ? "后台监听正常" : "Folder watcher is healthy", t("incomingFolder")]);
  rows.push([state.locale === "zh" ? "内容库已就绪" : "Script library ready", state.locale === "zh" ? `${state.scripts.length || 4} 个公开剧本可供匹配` : `${state.scripts.length || 4} public scripts ready`]);
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
  showToast(state.locale === "zh" ? `${script.title || file.name} 已自动入库` : `${script.title || file.name} was added to the library`);
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
const caseTranslations = {
  "moon-trial": {
    title: "The Trial of Moonlight", player: "Lin Che · Curator", badge: "Moonlight Observer", sceneKicker: "THE WHITE HALL / PRIVATE VIEWING",
    intro: "At 21:00, the private museum White Hall opens a moonstone viewing for six guests. Seven minutes later, the case is intact—but the stone is gone.",
    evidenceLead: "The gallery still looks exactly as it did when the dinner ended.", evidenceCopy: "Every item may change your read of the room. Inspect them one by one; discovered clues stay in your case notes.", questionCopy: "Choose someone in the room and ask a question. Some answers will not be lies—they will simply avoid what matters most.",
    voteLead: "You have heard every version. Now name the person who hid inside the details.", voteCopy: "The right answer must explain the access log, the rain on the window ledge and the partial print inside the case.", resultTitle: "The truth comes to light", resultText: "Correct. He Yunchuan used an old access credential and repair-room thread to fake an intrusion through the window. The partial print he thought no one would notice gave him away.",
    suspects: [
      { id: "shen", name: "Shen Yuan", role: "Gallery director", line: "I handled the guest list. Before the blackout, I stayed in the east lounge.", answers: { time: "The east lounge cameras can place me there—at least for most of the night.", motive: "If the stone disappears, the gallery loses its next round of funding. I need it found more than anyone.", key: "Only the curator and restorer handled the case key. I had no reason to go near it." } },
      { id: "gu", name: "Gu Yan", role: "Collector's counsel", line: "I came to confirm a will. The stone has nothing to do with me.", answers: { time: "I was on a long inheritance call—long enough to miss several things.", motive: "The motive is not the stone but the insurance. Ask Shen Yuan.", key: "I saw the small silver key in the upstairs study, but I never took it." } },
      { id: "he", name: "He Yunchuan", role: "Art restorer", line: "The lock was not forced. Someone used the right code, but that does not make it me.", answers: { time: "I was cleaning a painting in the studio. Rain came through the window, so I stayed there.", motive: "A restorer survives by protecting works. Destroying one would make no sense for me.", key: "The code changes monthly. Only the curator knew tonight's code—unless someone read her notes." } },
      { id: "su", name: "Su Mi", role: "Investigative reporter", line: "I was reporting on the gallery. Tonight's incident practically wrote the headline.", answers: { time: "I was recording outside the washroom. I heard heels, but the light was too poor to see who passed.", motive: "I need a truth, not a stone—unless the truth itself can pay well.", key: "I photographed a corner of the code book. One date had been crossed out: 21/17." } },
      { id: "luo", name: "Luo Xu", role: "Private security", line: "I guard the doors, not the display case. No one left through the front entrance with the stone.", answers: { time: "From 21:12 to 21:19, the main camera went dark. Someone sent me to check the power box.", motive: "I am paid for security. Do not confuse negligence with theft.", key: "The alarm was dismissed normally at 21:17. The credential belonged to an internal account." } }
    ],
    evidence: [
      { id: "rain", symbol: "◒", name: "Rain on the ledge", type: "Physical trace · East window", detail: "Rain marks run inward from the sill, but the window lock was never opened. The sole pattern stops at the restoration-room door." },
      { id: "log", symbol: "⌁", name: "Access log", type: "System record · 21:17", detail: "The display alarm was dismissed at 21:17:04 with Lin Che's old credential—one that should have expired three days ago." },
      { id: "note", symbol: "✎", name: "Crossed-out date", type: "Photo · Su Mi's camera", detail: "The edge of the code book reads 21/17. The final stroke is fresh, made with the pen on the restoration desk." },
      { id: "glass", symbol: "◇", name: "Print inside the glass", type: "Trace · Display case", detail: "Only half a print remains on the inside of the glass. The match points to He Yunchuan." },
      { id: "thread", symbol: "—", name: "Blue repair thread", type: "Fiber · Gallery floor", detail: "A blue fiber is caught beneath the case base. It matches the tool kit in He Yunchuan's studio." },
      { id: "letter", symbol: "▱", name: "Unsent letter", type: "Private item · Gu Yan", detail: "The letter mentions an insurance policy activating at 21:30 and an anonymous account as its recipient." }
    ],
    timeline: [["21:05", "He Yunchuan enters the east restoration room under the pretext of checking humidity."], ["21:12", "Luo Xu is sent to the power box and the main hall enters a camera blind spot."], ["21:17", "An old credential dismisses the alarm and opens the display case."], ["21:19", "A blue repair thread creates the false trail to the window."]]
  },
  "last-letter": {
    title: "Letters from the Old Port", player: "Zhou Yao · Port Archivist", badge: "Keeper of the Old Port", sceneKicker: "THE OLD PORT / LAST TIDE",
    intro: "The old port's tide will flood the warehouse cellar in an hour. Tonight, a letter that was never sent twenty years ago appears in the lighthouse archive—and its true recipient has just died at the harbor.",
    evidenceLead: "Before the tide rises, the dock warehouse remains sealed.", evidenceCopy: "Every item records a relationship partly washed away by the sea. First find where the letter came from, then decide who is most afraid of it being read.", questionCopy: "Everyone at the old port knows how to hide a letter. Choose someone and ask about the lighthouse, the tide and the brass key.",
    voteLead: "You have traced the letter's path. Now name the person most afraid of the tide going out.", voteCopy: "The right answer must explain the lighthouse key, the tide record and the postmark that was never sent.", resultTitle: "The tide recedes, and the letter arrives", resultText: "Correct. Jiang Yu forged the lighthouse seal record and planned to take the old letter before the cellar flooded. The salt inside the envelope and fresh scratches on the brass key exposed him.",
    suspects: [
      { id: "ye", name: "Ye Lan", role: "Old-port gallery director", line: "I only store a few paintings for the port. I have no interest in old archives.", answers: { time: "Before high tide I was counting crates at Pier Two. The dockworkers all saw me.", motive: "That letter could cost many people the identities they have now, but I stopped caring about the past.", key: "The lighthouse key hangs on the archive-room wall. Jiang Yu knows that wall better than I do." } },
      { id: "tang", name: "Tang Yan", role: "Shipping counsel", line: "The old port loses cargo every year. That does not make a letter relevant.", answers: { time: "I was on the phone in the customs office, handling a missing cargo report.", motive: "If the names in the letter become public, the shipping company's old accounts will be exposed.", key: "The brass key belonged to the lighthouse keeper. Jiang Yu kept it after taking over repairs." } },
      { id: "jiang", name: "Jiang Yu", role: "Lighthouse mechanic", line: "The lighthouse has been closed for years. There is nothing worth seeing there.", answers: { time: "I was checking the generator on the north breakwater. The rain was too heavy for anyone to come over.", motive: "The letter is just a misunderstanding. The real secret was carried away by the sea long ago.", key: "The key has always been in the archive room. I only borrowed it once last month." } },
      { id: "wan", name: "Lin Wan", role: "Harbor radio host", line: "I broadcast weather reports, not twenty-year-old family stories.", answers: { time: "I was recording the tide forecast at the station. The tape can prove the time.", motive: "The names in the old letter would make a good broadcast, but I never had it.", key: "The postmark was erased. Its numbers look like the figures on tonight's tide chart." } },
      { id: "qiao", name: "Qiao Qiao", role: "Harbor security officer", line: "The warehouse lock was intact. No one carried anything out through the front door.", answers: { time: "I was posted at the south gate. Only Jiang Yu entered the inner harbor with a repair pass.", motive: "I only want to keep my job. I do not want to be part of an old case.", key: "The seal wax is not from the harbor office. It is the blue wax used by the repair crew." } }
    ],
    evidence: [
      { id: "tide", symbol: "◒", name: "Tide record", type: "Sailing log · 22:10", detail: "The tide rose twelve minutes earlier than the official record. Only someone familiar with the old harbor gates would know that." },
      { id: "seal", symbol: "⌁", name: "Blue seal wax", type: "Sealed item · Archive room", detail: "The wax came from the repair crew, not the harbor office. A freshly pressed old crest remains on its surface." },
      { id: "letter", symbol: "✎", name: "Unsent letter", type: "Paper evidence · Lighthouse", detail: "The letter mentions a shift change from twenty years ago. Its recipient is the first person to leave the harbor tonight." },
      { id: "key", symbol: "◇", name: "Brass lighthouse key", type: "Metal evidence · North breakwater", detail: "Fresh scratches on the teeth show that it recently opened a lock that had not been used for years." },
      { id: "salt", symbol: "—", name: "Salt inside the envelope", type: "Trace · Envelope interior", detail: "The salt appears only inside the envelope, proving the letter was carried into a damp cellar rather than opened on a desk." },
      { id: "stamp", symbol: "▱", name: "Erased postmark", type: "Paper trace · Old post office", detail: "The year was deliberately rubbed away, but blue-black ink remains—the same ink used in the repair crew's register." }
    ],
    timeline: [["21:42", "Jiang Yu obtains the lighthouse key under the pretext of a repair."], ["21:55", "He alters the tide record so everyone underestimates how quickly the cellar will flood."], ["22:03", "Jiang Yu enters the archive room and takes the letter, leaving blue seal wax behind."], ["22:10", "The rising tide breaks open the cellar door and exposes where the letter was hidden."]]
  },
  "orbit-7": {
    title: "Beyond the Orbit", player: "Shen Zhu · Orbital Maintenance Officer", badge: "Orbit Observer", sceneKicker: "ORBITAL STATION / BLACKOUT",
    intro: "Seven minutes after Orbit Station Seven loses contact, everyone receives the same message from the future. Oxygen levels are stable, but seven minutes have disappeared from everyone's memory.",
    evidenceLead: "The station systems are still running; only the human records were rewritten.", evidenceCopy: "Inspect every item and determine where the impossible message really came from.", questionCopy: "In zero gravity, every movement leaves a trace. Choose a crew member and ask where they were during the seven-minute blackout.",
    voteLead: "Communications are about to return. Name the person who disguised an accident as a time echo.", voteCopy: "The right answer must explain the hatch access, the coolant trace and the message that arrived before it was sent.", resultTitle: "The message came from seven minutes ago", resultText: "Correct. Mu Cen used a maintenance clock to create a delay and disguised an unauthorized action as a message from the future. Directional coolant particles exposed his route.",
    suspects: [
      { id: "mu", name: "Mu Cen", role: "Systems engineer", line: "I keep the systems stable. I do not explain your hallucinations.", answers: { time: "During the blackout I restarted the coolant loop in the core module. The logs will show I never left.", motive: "When communications return, everyone will know who pushed this station into failure.", key: "The main-hatch credentials are shared by the captain and me, but I never changed the records." } },
      { id: "qiao", name: "Qiao An", role: "Deep-space cartographer", line: "I read star maps, not prophecies about the future.", answers: { time: "I was calibrating the telescope in the observation module. During the blackout I saw a reflection outside.", motive: "Someone wanted us to miss a route discovery, but it was not me.", key: "The hatch was opened before the message arrived." } },
      { id: "rui", name: "Ryan", role: "Medical officer", line: "A memory gap does not prove a lie. It can also mean oxygen deprivation.", answers: { time: "I was recording my heart rate in the medical bay and did not leave during the blackout.", motive: "I wanted to return home quickly, not damage communications.", key: "Mu Cen's gloves carry coolant, not medical disinfectant." } },
      { id: "yan", name: "Yan Chuan", role: "Cargo navigator", line: "Every item in the cargo bay has a number. Do not mix me up with a system failure.", answers: { time: "I was checking samples in the cargo bay. I heard the number-seven hatch open once.", motive: "I only want the cargo to reach the ground intact.", key: "The spare clock battery was replaced by someone with systems access." } },
      { id: "lin", name: "Lin Lan", role: "Communications commander", line: "The timestamp cannot be real, but the message definitely came from inside the station.", answers: { time: "I was reconnecting the ground channel at the comms console and received data with no source.", motive: "If the incident is ruled human-made, I will lose command.", key: "The message uses the old maintenance module's compression format." } }
    ],
    evidence: [
      { id: "signal", symbol: "◒", name: "Message from the future", type: "Comms record · 07:14", detail: "The timestamp is seven minutes earlier than the send time, but the compression format belongs to the retired maintenance module." },
      { id: "coolant", symbol: "⌁", name: "Coolant particles", type: "Physical trace · Core module", detail: "The particles drift in one direction in zero gravity, pointing to someone who left the maintenance module." },
      { id: "clock", symbol: "✎", name: "Spare clock battery", type: "Mechanical evidence · Module seven", detail: "The battery was replaced moments ago. The old battery has not cooled down yet." },
      { id: "door", symbol: "◇", name: "Hatch access", type: "System record · 07:09", detail: "The number-seven hatch opened before the message was sent. The authorization code belongs to the maintenance team." },
      { id: "glove", symbol: "—", name: "Maintenance glove", type: "Fiber trace · Medical bay", detail: "Coolant remains inside the glove, but there is no core-module dust outside it. Someone moved it after the fact." },
      { id: "route", symbol: "▱", name: "Deleted route", type: "Star chart · Observation module", detail: "The deleted route passes through the communications blind spot—the only window for creating the delayed message." }
    ],
    timeline: [["07:07", "Mu Cen enters the maintenance module and replaces the spare clock battery."], ["07:09", "The number-seven hatch opens with an old credential and coolant particles drift into the corridor."], ["07:14", "The delayed message is sent as data from the future."], ["07:21", "Communications return and the contradictory timestamp is exposed."]]
  },
  "velvet-room": {
    title: "Behind the Velvet", player: "Gu Mian · Stage Manager", badge: "After-Curtain Observer", sceneKicker: "THE VELVET STAGE / AFTER CURTAIN",
    intro: "Thirteen minutes after the curtain falls, the lead actor's understudy script disappears from the dressing room. No one leaves backstage, but everyone is fighting for the last role.",
    evidenceLead: "The stage lights are still on, but no backstage corridor can prove who is telling the truth.", evidenceCopy: "Every item comes from a different backstage corner. Find who could reach the backup script, then expose the rehearsed cry.", questionCopy: "Everyone knows how to hide emotion on stage. Choose a company member and ask where they went during the thirteen minutes after the curtain call.",
    voteLead: "The final scene is about to be performed again. Name the person who wrote the whole accident into the script.", voteCopy: "The right answer must explain the makeup dust, the backstage key and the footsteps recorded before the curtain call.", resultTitle: "The final role belongs to the truth", resultText: "Correct. Yin Tang recorded the footsteps early and used a backstage key to enter the dressing room. The reversed shoeprint in the makeup dust exposed her route.",
    suspects: [
      { id: "yin", name: "Yin Tang", role: "Understudy", line: "I only wanted to perform tonight's final scene. I did not want anyone's secrets.", answers: { time: "After the curtain call I waited for instructions at stage left. No one could see me behind the red curtain.", motive: "The backup script decides who gets next season's role, but I had no reason to steal it.", key: "The dressing-room key hangs at the stage manager's desk. Only Gu Mian and the director can take it." } },
      { id: "bo", name: "Bai Zhou", role: "Theater director", line: "A performance needs suspense, not missing property.", answers: { time: "I was discussing next season with investors in the audience. My assistant handled backstage.", motive: "A missing script would make investors withdraw, but I would not destroy my own production.", key: "The spare key was borrowed last night and returned with stage wax on it." } },
      { id: "xue", name: "Xue Ning", role: "Chief stage designer", line: "The lights and mechanisms worked on time. The problem is a person.", answers: { time: "I was checking the rigging above the stage and heard someone close the dressing-room door.", motive: "As long as the show continues, my stage contract is safe.", key: "The recorded footsteps come four minutes before the real curtain call." } },
      { id: "qi", name: "Qi Wu", role: "Chief makeup artist", line: "A mirror shows a face, not who is lying.", answers: { time: "I was cleaning the makeup table. Yin Tang came by once but did not stay.", motive: "The role in the script has nothing to do with me. I only prepare the actors.", key: "There is a reversed shoeprint in the dust. The heel pattern resembles Yin Tang's stage shoes." } },
      { id: "meng", name: "Meng Chuan", role: "Backstage supervisor", line: "All backstage keys are with me, but I never left the radio.", answers: { time: "I was counting silver props in the prop room. No one passed the main door for thirteen minutes.", motive: "I only wanted the theater to close smoothly.", key: "The spare key's label was turned around. Only someone familiar with the key cabinet would do that." } }
    ],
    evidence: [
      { id: "powder", symbol: "◒", name: "Makeup dust", type: "Trace · Dressing room", detail: "The shoeprint points toward the mirror rather than the door, showing that someone walked backward into the room." },
      { id: "key", symbol: "⌁", name: "Backstage spare key", type: "Metal evidence · Key cabinet", detail: "Wax from the stage mechanism is stuck to the key, and the same wax marks Yin Tang's understudy shoes." },
      { id: "recording", symbol: "✎", name: "Pre-recorded footsteps", type: "Audio · Radio", detail: "The footsteps come four minutes before the real curtain call. Only someone with console access could have recorded them early." },
      { id: "script", symbol: "◇", name: "Torn script page", type: "Paper evidence · Prop room", detail: "Red velvet fibers remain along the tear, from the inner curtain rather than the dressing room." },
      { id: "shoe", symbol: "—", name: "Reversed shoeprint", type: "Sole trace · Mirror", detail: "The direction is opposite to a normal exit. Whoever left it made a deliberate turn in front of the mirror." },
      { id: "curtain", symbol: "▱", name: "Velvet fiber", type: "Fiber · Script folder", detail: "Backstage curtain fibers are caught in the folder seam, proving the script was hidden behind the velvet." }
    ],
    timeline: [["22:14", "Yin Tang records the footsteps early to make it seem that someone left backstage."], ["22:18", "She uses the spare key to enter the dressing room and take the script."], ["22:21", "Yin Tang hides the script behind the velvet curtain and returns to stage left."], ["22:27", "The reversed shoeprint and velvet fibers make her route impossible to disguise."]]
  }
};

function localizedCase(caseId) {
  const base = caseLibrary[caseId] || demoCase;
  const override = state.locale === "en" ? (caseTranslations[caseId] || {}) : {};
  const baseEvidence = new Map((base.evidence || []).map((item) => [item.id, item]));
  const evidence = override.evidence
    ? override.evidence.map((item) => ({ ...baseEvidence.get(item.id), ...item }))
    : base.evidence;
  return { ...base, ...override, id: caseId, suspects: override.suspects || base.suspects, evidence, timeline: override.timeline || base.timeline };
}

let activeCase = demoCase;
const gameState = { phase: "briefing", discovered: new Set(), selectedEvidence: null, selectedSuspect: "shen", answers: new Set(), questionCount: 0, startedAt: 0, timer: null };

function setGameNav(phase) {
  gameState.phase = phase;
  const phases = { briefing: 1, evidence: 2, question: 3, vote: 4, result: 4 };
  $("#gameProgressFill").style.width = `${(phases[phase] / 4) * 100}%`;
  $$(".game-nav-item").forEach((item) => item.classList.toggle("active", item.dataset.gamePhase === phase));
  const labels = { briefing: t("phaseBriefing"), evidence: t("phaseEvidence"), question: t("phaseQuestion"), vote: t("phaseVote"), result: t("phaseResult") };
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
  const playerCopy = state.locale === "zh" ? `你是 <strong>${activeCase.player}</strong>。今晚的在场者都知道一部分真相，却没有人知道全部。你的目标不是马上找到答案，而是先确认：谁有机会，谁有动机，谁在说一个无法被证据支持的故事。` : `You are <strong>${activeCase.player}</strong>. Everyone here knows part of the truth, but no one knows all of it. Do not rush to an answer; first work out who had the chance, who had the motive and whose story the evidence cannot support.`;
  $("#gameContent").innerHTML = `<span class="game-kicker">${activeCase.sceneKicker}</span><div class="game-scene"><img src="${activeCase.sceneImage}" alt="${activeCase.title}" /></div><p class="game-lede">${activeCase.intro}</p><p class="game-copy">${playerCopy}</p><div class="scene-line"></div><div class="event-log">${activeCase.timeline.slice(0, 3).map(([time, text]) => `<div class="event-log-item"><b>${time}</b><span>${text}</span></div>`).join("")}</div>`;
  gameAction(null, t("evidenceHint"), t("startEvidence"), renderEvidence);
}

function renderEvidence() {
  setGameNav("evidence");
  $("#gameEyebrow").textContent = "ACT I / COLLECT EVIDENCE";
  $("#gameTitle").textContent = t("gameTitleEvidence");
  const selectedEvidence = activeCase.evidence.find((entry) => entry.id === gameState.selectedEvidence);
  const evidenceModal = selectedEvidence ? `<div class="evidence-modal open" id="evidenceModal" role="dialog" aria-modal="true" aria-label="${selectedEvidence.name}"><div class="evidence-modal-card"><button class="evidence-modal-close" data-evidence-close aria-label="${t("close")}">×</button><img class="evidence-modal-image" src="${selectedEvidence.image}" alt="${selectedEvidence.name}" /><div class="evidence-modal-body"><span class="game-kicker">CASE NOTE / EVIDENCE ${String(gameState.discovered.size).padStart(2, "0")}</span><h3>${selectedEvidence.name}</h3><p class="evidence-modal-type">${selectedEvidence.type}</p><p>${selectedEvidence.detail}</p><button class="primary-button evidence-modal-done" data-evidence-close>${t("recordEvidence")} <span>↗</span></button></div></div></div>` : "";
  $("#gameContent").innerHTML = `<span class="game-kicker">${t("inspectEvidence")}</span><div class="game-scene game-scene-evidence"><img src="${activeCase.sceneImage}" alt="${activeCase.title}" /></div><p class="game-lede">${activeCase.evidenceLead}</p><p class="game-copy">${activeCase.evidenceCopy}</p><div class="scene-line"></div><div class="evidence-grid">${activeCase.evidence.map((item) => `<button class="evidence-card ${gameState.discovered.has(item.id) ? "discovered" : ""}" data-evidence="${item.id}"><img class="evidence-thumb" src="${item.image}" alt="${item.name}" /><strong>${item.name}</strong><small>${item.type}</small><span class="discovered-badge">${t("recorded")}</span></button>`).join("")}</div>${evidenceModal}`;
  $$(".evidence-card").forEach((card) => card.addEventListener("click", () => inspectEvidence(card.dataset.evidence)));
  $$('[data-evidence-close]').forEach((button) => button.addEventListener("click", () => { gameState.selectedEvidence = null; renderEvidence(); }));
  const canContinue = gameState.discovered.size >= 3;
  gameAction(null, t("evidenceCount", { count: gameState.discovered.size }), canContinue ? t("enterQuestion") : t("continueEvidence"), canContinue ? renderQuestion : () => showToast(t("noEnoughEvidence")));
}

function inspectEvidence(id) {
  const item = activeCase.evidence.find((entry) => entry.id === id);
  if (!item) return;
  gameState.discovered.add(id);
  gameState.selectedEvidence = id;
  renderEvidence();
  showToast(state.locale === "zh" ? `已记录：${item.name}` : `${item.name}: ${t("recorded")}`);
}

function renderQuestion() {
  setGameNav("question");
  $("#gameEyebrow").textContent = "ACT II / OPEN QUESTIONING";
  $("#gameTitle").textContent = t("gameTitleQuestion");
  const suspect = activeCase.suspects.find((entry) => entry.id === gameState.selectedSuspect) || activeCase.suspects[0];
  const answered = gameState.answers.has(suspect.id);
  $("#gameContent").innerHTML = `<span class="game-kicker">SCRIPTED ROLEPLAY / RESPONSE</span><div class="game-scene game-scene-question"><img src="${activeCase.sceneImage}" alt="${activeCase.title}" /></div><p class="game-copy" style="margin:12px 0 20px">${activeCase.questionCopy}</p><div class="question-layout"><div class="suspect-list">${activeCase.suspects.map((entry) => `<button class="suspect-button ${entry.id === suspect.id ? "active" : ""}" data-suspect="${entry.id}"><img src="${entry.avatar}" alt="" /><span>${entry.name}<small>${entry.role}</small></span></button>`).join("")}</div><div class="dialogue-box"><div class="dialogue-person"><img src="${suspect.avatar}" alt="${suspect.name}" /><div><h3 class="dialogue-name">${suspect.name}</h3><span class="dialogue-role">${suspect.role}</span></div></div><p class="dialogue-text">${answered ? suspect.answers.time : suspect.line}</p><div class="question-options">${Object.entries({ time: t("questionTime"), motive: t("questionMotive"), key: t("questionKey") }).map(([key, label]) => `<button class="question-option ${gameState.answers.has(`${suspect.id}:${key}`) ? "used" : ""}" data-question="${key}" data-suspect="${suspect.id}">${label}</button>`).join("")}</div></div></div>`;
  $$(".suspect-button").forEach((button) => button.addEventListener("click", () => { gameState.selectedSuspect = button.dataset.suspect; renderQuestion(); }));
  $$(".question-option").forEach((button) => button.addEventListener("click", () => askQuestion(button.dataset.suspect, button.dataset.question)));
  gameAction(null, t("questionHint", { count: gameState.questionCount }), gameState.questionCount >= 3 ? t("enterVote") : t("continueQuestion"), gameState.questionCount >= 3 ? renderVote : () => showToast(t("noEnoughQuestions")));
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
  showToast(t("localResponse", { name: suspect.name }));
}

function renderVote() {
  setGameNav("vote");
  $("#gameEyebrow").textContent = "FINAL ACT / NAME THE CULPRIT";
  $("#gameTitle").textContent = t("gameTitleVote");
  $("#gameContent").innerHTML = `<span class="game-kicker">ONE ACCUSATION / ONE TRUTH</span><div class="game-scene game-scene-vote"><img src="${activeCase.sceneImage}" alt="${activeCase.title}" /></div><p class="game-lede">${activeCase.voteLead}</p><p class="game-copy">${activeCase.voteCopy}</p><div class="scene-line"></div><div class="vote-grid">${activeCase.suspects.map((suspect) => `<div class="vote-card"><img src="${suspect.avatar}" alt="" /><strong>${suspect.name}</strong><small>${suspect.role}</small><button class="vote-button" data-vote="${suspect.id}">${t("accuse")}</button></div>`).join("")}</div>`;
  $$(".vote-button").forEach((button) => button.addEventListener("click", () => castVote(button.dataset.vote)));
  gameAction(null, t("voteHint"), null, null);
}

function castVote(id) {
  if (id !== activeCase.solution) {
    const card = document.querySelector(`[data-vote="${id}"]`).parentElement;
    card.classList.add("wrong-vote");
    showToast(t("wrong"));
    setTimeout(() => card.classList.remove("wrong-vote"), 350);
    return;
  }
  renderResult();
}

function renderResult() {
  setGameNav("result");
  $("#gameEyebrow").textContent = `CASE CLOSED / ${activeCase.closeStamp}`;
  $("#gameTitle").textContent = t("gameTitleResult");
  $("#gameContent").innerHTML = `<div class="result-card"><div class="result-scene"><img src="${activeCase.sceneImage}" alt="${activeCase.title} ${t("sceneAlt")}" /></div><div class="result-symbol">✓</div><h2>${activeCase.resultTitle}</h2><p>${activeCase.resultText}</p><div class="timeline">${activeCase.timeline.map(([time, text]) => `<div class="timeline-item"><b>${time}</b><span>${text}</span></div>`).join("")}</div></div>`;
  gameAction(null, `${t("closed")} · ${activeCase.badge}`, t("replay"), () => { gameState.discovered = new Set(); gameState.selectedEvidence = null; gameState.answers = new Set(); gameState.questionCount = 0; gameState.selectedSuspect = activeCase.suspects[0].id; renderBriefing(); });
}

function startGame() {
  closeModal();
  activeCase = localizedCase(state.selectedScript?.id || "moon-trial");
  gameState.discovered = new Set();
  gameState.selectedEvidence = null;
  gameState.answers = new Set();
  gameState.questionCount = 0;
  gameState.selectedSuspect = activeCase.suspects[0].id;
  $("#gameCaseLabel").textContent = activeCase.caseLabel || "CASE 014 / MOONLIGHT";
  $("#playerRole").textContent = activeCase.player;
  $("#playerAvatarImage").src = activeCase.playerAvatar || "assets/characters/lin-che.jpg";
  $("#playerAvatarImage").alt = activeCase.player;
  $("#caseNoteText").textContent = activeCase.intro;
  gameState.startedAt = Date.now();
  setView("game");
  $("#viewLabel").textContent = t("gamePlaying");
  window.scrollTo({ top: 0, behavior: "instant" });
  renderBriefing();
  clearInterval(gameState.timer);
  gameState.timer = setInterval(() => { const seconds = Math.floor((Date.now() - gameState.startedAt) / 1000); $("#gameClock").textContent = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`; }, 1000);
}

function bindEvents() {
  $$(".nav-item").forEach((item) => item.addEventListener("click", () => setView(item.dataset.view)));
  $$('[data-locale]').forEach((button) => button.addEventListener("click", () => setLocale(button.dataset.locale)));
  $$(`[data-view-target]`).forEach((item) => item.addEventListener("click", () => setView(item.dataset.viewTarget)));
  $$(".filter-tab").forEach((tab) => tab.addEventListener("click", () => { state.activeFilter = tab.dataset.filter; $$(".filter-tab").forEach((item) => item.classList.toggle("active", item === tab)); renderScripts(); }));
  $("#quickStart").addEventListener("click", () => {
    state.selectedScript = state.scripts.find((script) => script.id === "moon-trial") || state.scripts[0] || fallbackScripts[0];
    startGame();
  });
  $("#createRoom").addEventListener("click", () => { setView("discover"); showToast(t("roomTrialPrompt")); });
  $("#modalClose").addEventListener("click", closeModal);
  $("#modalBackdrop").addEventListener("click", (event) => { if (event.target.id === "modalBackdrop") closeModal(); });
  $("#modalStart").addEventListener("click", startGame);
  $("#exitGame").addEventListener("click", () => { clearInterval(gameState.timer); setView("discover"); });
  $("#scanNow").addEventListener("click", async () => { try { await apiFetch("/api/scripts/scan", { method: "POST" }); await loadScripts(); await refreshSync(); showToast(t("scanComplete")); } catch { showToast(t("scanOffline")); } });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeModal(); });
  $("#chooseFile").addEventListener("click", () => $("#fileInput").click());
  $("#fileInput").addEventListener("change", async (event) => { const file = event.target.files[0]; if (file) { try { await importFile(file); } catch (error) { showToast(error.message); } event.target.value = ""; } });
  const dropzone = $("#dropzone");
  ["dragenter", "dragover"].forEach((eventName) => dropzone.addEventListener(eventName, (event) => { event.preventDefault(); dropzone.classList.add("dragging"); }));
  ["dragleave", "drop"].forEach((eventName) => dropzone.addEventListener(eventName, (event) => { event.preventDefault(); dropzone.classList.remove("dragging"); }));
  dropzone.addEventListener("drop", async (event) => { const file = event.dataTransfer.files[0]; if (file) { try { await importFile(file); } catch (error) { showToast(error.message); } } });
}

bindEvents();
applyStaticLocale();
renderRooms();
loadScripts();
detectLocale();
setInterval(refreshSync, 4500);
