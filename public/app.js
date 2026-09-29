function readLocalePreference() {
  try {
    const saved = localStorage.getItem("nocturne-locale");
    return saved === "en" || saved === "zh" ? saved : null;
  } catch {
    return null;
  }
}

function readAdminToken() {
  try { return sessionStorage.getItem("nocturne-admin-token") || ""; } catch { return ""; }
}

function browserFallbackLocale() {
  return /^zh(?:-|$)/i.test(navigator.language || "") ? "zh" : "en";
}

function readArchive() {
  try {
    const saved = JSON.parse(localStorage.getItem("nocturne-archive") || "[]");
    return Array.isArray(saved) ? saved.filter((entry) => entry && entry.id) : [];
  } catch {
    return [];
  }
}

function readFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem("nocturne-favorites") || "[]");
    return Array.isArray(saved) ? saved.filter(Boolean).slice(0, 50) : [];
  } catch {
    return [];
  }
}

function readProfileName() {
  try {
    const saved = localStorage.getItem("nocturne-profile-name");
    return saved ? String(saved).slice(0, 80) : "";
  } catch {
    return "";
  }
}

function readNotifications() {
  try {
    const saved = JSON.parse(localStorage.getItem("nocturne-notifications") || "[]");
    return Array.isArray(saved) ? saved.filter((entry) => entry && entry.id && entry.title).slice(0, 30) : [];
  } catch {
    return [];
  }
}

function readPlayerStats() {
  try {
    const saved = JSON.parse(localStorage.getItem("nocturne-player-stats") || "null");
    return { played: Number(saved?.played) || 0, solved: Number(saved?.solved) || 0, clues: Number(saved?.clues) || 0, questions: Number(saved?.questions) || 0, completed: Array.isArray(saved?.completed) ? saved.completed.filter(Boolean).slice(-50) : [] };
  } catch {
    return { played: 0, solved: 0, clues: 0, questions: 0, completed: [] };
  }
}

function savePlayerStats() {
  try { localStorage.setItem("nocturne-player-stats", JSON.stringify(state.stats)); } catch { /* storage can be unavailable in private webviews */ }
}

function playerLevel() {
  return Math.min(30, 1 + Math.floor((state.stats.played || 0) / 2) + Math.floor((state.stats.solved || 0) / 3));
}

function readActiveRoom() {
  try {
    const saved = JSON.parse(localStorage.getItem("nocturne-active-room") || "null");
    return saved && saved.id ? { id: String(saved.id), spectator: saved.spectator === true } : null;
  } catch {
    return null;
  }
}

function saveActiveRoom(roomId, spectator = false) {
  try { localStorage.setItem("nocturne-active-room", JSON.stringify({ id: String(roomId), spectator: spectator === true })); } catch { /* storage can be unavailable in private webviews */ }
}

function clearActiveRoom() {
  try { localStorage.removeItem("nocturne-active-room"); } catch { /* storage can be unavailable in private webviews */ }
}

const savedLocale = readLocalePreference();
const state = { scripts: [], archive: readArchive(), favorites: readFavorites(), notifications: readNotifications(), stats: readPlayerStats(), leaderboard: [], profileName: readProfileName(), adminToken: readAdminToken(), adminQueue: [], activeFilter: "all", searchQuery: "", selectedScript: null, locale: savedLocale || browserFallbackLocale(), audioLocale: savedLocale || browserFallbackLocale(), localeSource: savedLocale ? "manual" : "auto", liveRooms: [], activeRoom: null, roomMember: false, roomPollTimer: null, roomChatTimer: null, roomVoiceTimer: null, roomChatRoomId: null, roomChatCursor: "0", roomMessages: [], blockedUsers: new Set(), voiceRoomId: null, voiceCursor: "0", voiceSelfId: null, voiceJoined: false, voiceMuted: false, voiceStream: null, voicePeers: new Map(), voicePendingCandidates: new Map(), audioAssets: {} };
const API_BASE = String(window.NOCTURNE_API_BASE || "").replace(/\/$/, "");
const apiFetch = (path, options) => fetch(`${API_BASE}${path}`, options);
const translations = {
  zh: {
    appTitle: "Nocturne · 剧本推理社交", brandCaption: "剧本推理 / 社交玩法", mobileCaption: "剧本探索社", navDiscover: "发现剧本", navRooms: "房间预览", navLibrary: "我的收藏", navStudio: "创作后台", mainNav: "主导航", mobileNav: "移动端主导航", mobileHome: "首页", mobileRooms: "房间", mobileLibrary: "收藏", mobileStudio: "创作", localPlay: "本地试玩", offlineCases: "4 个案件可离线试玩", profileAvatar: "凌", profileName: "凌 · 夜航员", profileLevel: "探索者 Lv.12", notification: "通知", notificationTitle: "消息中心", notificationEmpty: "暂时没有新消息", notificationClear: "清空已读", notificationRoomCreated: "房间已创建", notificationRoomJoined: "已加入房间", notificationRoleUpdated: "角色选择已更新", notificationRoomStarted: "剧本已开始", notificationRoomCreatedBody: "可以复制邀请链接，邀请朋友加入。", notificationRoomJoinedBody: "你现在可以在大厅准备、选角并加入语音。", notificationRoleUpdatedBody: "你的角色已锁定，准备后等待房主开局。", notificationRoomStartedBody: "案件已经开始，进入房间即可继续推理。", heroCaseTitle: "月影审判", heroCaseKicker: "案件 014 / 未封存", heroCaseSubtitle: "月影审判", heroNoteTop: "记忆<br /><b>也是犯罪现场</b>", schemaExampleTitle: "月影审判", privacy: "隐私政策", terms: "用户协议", discover: "发现剧本", rooms: "房间预览", library: "我的收藏", studio: "创作后台",
    heroEyebrow: "今晚，进入另一个人生", heroTitleA: "真相藏在", heroTitleB: "每个人的沉默里。", heroDescription: "选择一段命运，和陌生人共同完成一场只发生一次的推理。", startTrial: "开始一局试玩", browseRooms: "浏览房间预览", curatedCases: "精选案件", picksForYou: "为你挑选的剧本", searchPlaceholder: "搜索剧本、题材或标签", searchAria: "搜索剧本", all: "全部", mystery: "悬疑", emotion: "情感", sciFi: "科幻",
    roomKicker: "房间预览", roomTitle: "故事房间", roomDescription: "创建或加入一个真实房间，等待成员到齐后由房主开始剧本。", viewTrialEntry: "创建房间", roomQuickMatch: "快速组局", roomMatchSuccess: "已匹配到房间", roomMatchCreated: "已为你创建房间，等待其他玩家加入", roomJoin: "加入房间", roomWatch: "查看房间", roomMissing: "还差 {count} 人", roomFull: "已满员", roomRequest: "{room}：已进入房间", roomLobbyTitle: "房间大厅", roomLobbyPlayers: "房间成员", roomLobbyWaiting: "等待房主开始游戏", roomLobbyLive: "剧本已经开始", roomStart: "开始剧本", roomLeave: "离开房间", roomClose: "关闭房间", roomCreateSuccess: "房间已创建", roomJoinSuccess: "已加入房间", roomLeaveSuccess: "已离开房间", roomStartSuccess: "剧本已开始", roomReady: "准备就绪", roomUnready: "取消准备", roomReadySuccess: "准备状态已更新", roomReadyCount: "已准备 {ready} / {total}", roomNotReady: "还有玩家未准备，全部准备后才能开始", roomYou: "你", roomOffline: "服务端暂不可用，已切换为单人试玩", roomNoRooms: "当前还没有公开房间，创建一个吧。", roomHost: "房主", roomPlayer: "玩家", roomSpectator: "观战", roomRoleTitle: "选择你的角色", roomRoleAuto: "由房主自动分配", roomRoleHint: "选好角色后再点击准备；每个角色只能被一人选择。", roomRoleUpdated: "角色选择已更新", roomRoleTaken: "这个角色已被其他玩家选择", roomRoleUnavailable: "角色暂不可用", roomCodeLabel: "输入房间码", roomCodePlaceholder: "例如：A1B2C3D4", roomCodeJoin: "进入房间 ↗", roomCodeHint: "输入朋友分享的 8 位房间码，直接进入大厅。", roomCodeInvalid: "请输入有效的房间码", roomCodeNotFound: "没有找到这个房间", roomChatTitle: "房间聊天", roomChatOnline: "实时同步", roomChatEmpty: "还没有消息，先打个招呼吧。", roomChatPlaceholder: "输入消息…", roomChatSend: "发送", roomChatReport: "举报", roomChatReported: "已提交举报", roomChatAlreadyReported: "你已经举报过这条消息", roomChatBlock: "拉黑", roomChatBlocked: "已拉黑该用户", roomChatAlreadyBlocked: "该用户已被拉黑", roomChatUnavailable: "聊天服务暂不可用", roomVoiceTitle: "房间语音", roomVoiceJoin: "加入语音", roomVoiceLeave: "退出语音", roomVoiceMute: "静音", roomVoiceUnmute: "取消静音", roomVoiceReady: "语音已连接", roomVoiceConnecting: "正在连接语音…", roomVoiceOff: "未加入语音", roomVoiceUnsupported: "当前设备不支持语音通话", roomVoicePermission: "请允许麦克风权限后加入语音", roomVoiceEmpty: "加入后可与房间成员语音交流",
    archiveKicker: "我的档案", archiveTitle: "收藏与足迹", archiveDescription: "保存那些值得二刷的故事，也记录你曾经成为谁。", archiveEmptyTitle: "你的档案还很安静", archiveEmptyDescription: "收藏或完成一局试玩后，案件会自动归档到这里。", archiveCompleted: "已完成", archiveReplay: "重新开始", exploreScripts: "去探索剧本", favoriteAdd: "收藏剧本", favoriteRemove: "取消收藏", favoriteSaved: "已收藏", favoriteRemoved: "已取消收藏", profileEdit: "编辑资料", profileSave: "保存资料", profileNameLabel: "显示名称", profileNamePlaceholder: "输入你在房间里显示的名称", profileGuestNote: "当前为匿名访客身份；名称仅用于房间成员展示。", profileSaved: "资料已保存", profileDelete: "删除访客资料", profileDeleteConfirm: "确定删除本设备的访客资料和房间记录吗？", profileDeleted: "访客资料已删除", studioKicker: "创作后台 / 内容管理", studioTitle: "创作后台", studioDescription: "剧本文件进入指定目录后，Nocturne 会自动识别、整理并发布到剧本库。", syncEnabled: "自动同步已开启", synced: "已同步 {count} 个剧本", autoIngestion: "自动入库", ingestionTitle: "剧本自动入库", live: "● 在线", dropTitle: "拖入剧本文件", dropDescription: "支持 .json / .md · 上传后自动解析并发布为草稿", chooseFile: "选择文件", listening: "后台文件夹监听中", incomingFolder: "将文件放入 /incoming，每 4 秒自动同步", waiting: "等待数据", activity: "动态记录", recentActivity: "最近动态", scanNow: "立即扫描 ↗", schemaTitle: "内容格式提示", schemaDescription: "JSON 文件可直接提供 title、genre、players、duration、tags、description 和 content 字段；Markdown 文件会自动读取一级标题作为剧本名。",
    emptyFilterTitle: "还没有这个类型的剧本", emptyFilterDescription: "换一个筛选，或者去创作后台导入新剧本。", emptySearchTitle: "没有找到匹配的剧本", emptySearchDescription: "试试其他关键词，或清空搜索继续探索。", caseFile: "案件档案", privateCase: "私人案件", players: "人数", duration: "时长", level: "难度", defaultGenre: "叙事推理", defaultSubtitle: "一场关于真相、秘密与选择的沉浸式推理", defaultDescription: "一份新剧本已经抵达。请在所有人说出真话之前，找到唯一无法被伪造的证据。", detailStart: "开始试玩", cardStart: "查看详情 / 开始试玩",
    gamePlaying: "正在游玩", backToLibrary: "← 返回剧本库", livePlay: "剧情演绎中", yourRole: "你的角色", caseNote: "案件笔记", phaseBriefing: "序章 · 入场", phaseEvidence: "第一幕 · 搜证", phaseQuestion: "第二幕 · 质询", phaseVote: "终局 · 指认", phaseResult: "终局 · 复盘", gameTitleEvidence: "搜寻线索", gameTitleQuestion: "公开质询", gameTitleVote: "最终指认", gameTitleResult: "真相浮出水面", gamePrologue: "序章", gameEvidenceKicker: "第一幕 / 搜证", gameEvidenceModalKicker: "案件笔记 / 线索 {count}", gameQuestionKicker: "第二幕 / 公开质询", gameQuestionRoleplay: "角色演绎 / 回应", gameVoteKicker: "终局 / 最终指认", gameVoteSubkicker: "一次指认 / 一个真相", gameClosedKicker: "案件结束", startEvidence: "开始搜证", continueEvidence: "继续搜证", continueQuestion: "继续质询", enterQuestion: "进入公开质询", enterVote: "进入最终指认", finalVote: "最终指认", closed: "案件已归档", replay: "再玩一次", evidenceHint: "先搜集至少 3 条线索，再进入质询。", evidenceCount: "已发现 {count} / 3 条关键线索", questionHint: "{count} 次质询记录 · 线索越多，判断越接近真相", voteHint: "你只有一次正式指认机会。", voteSubmitted: "已提交指认", voteWaiting: "等待其他玩家完成指认", inspectEvidence: "选择物证 · 点击查看细节", recordEvidence: "记入案件笔记", noEnoughEvidence: "至少查看三件物证，才能进入下一幕", noEnoughQuestions: "至少完成三次质询，再做最终指认", questionTime: "你在关键时间段在哪里？", questionMotive: "谁最有动机？", questionKey: "你见过关键物证吗？", accuse: "指认 TA ↗", correct: "真相浮出水面", wrong: "这个答案无法解释全部证据，再想想", localResponse: "{name} 已回应", recorded: "已记录", close: "关闭", sceneAlt: "案件现场", roomTrialPrompt: "请选择一个案件开始试玩", scanComplete: "扫描完成，剧本库已更新", scanOffline: "当前为离线试玩模式，无法扫描服务端文件夹",
  },
  en: {
    appTitle: "Nocturne · Script Mystery Social", brandCaption: "SCRIPT MYSTERY / SOCIAL PLAY", mobileCaption: "Script mystery social", navDiscover: "Discover", navRooms: "Rooms", navLibrary: "My Archive", navStudio: "Studio", mainNav: "Main navigation", mobileNav: "Mobile navigation", mobileHome: "Home", mobileRooms: "Rooms", mobileLibrary: "Archive", mobileStudio: "Studio", localPlay: "LOCAL PLAY", offlineCases: "4 cases ready offline", profileAvatar: "L", profileName: "Ling · Night Watcher", profileLevel: "Explorer Lv.12", notification: "Notifications", notificationTitle: "Notifications", notificationEmpty: "Nothing new yet", notificationClear: "Clear read", notificationRoomCreated: "Room created", notificationRoomJoined: "Joined room", notificationRoleUpdated: "Character selected", notificationRoomStarted: "Case started", notificationRoomCreatedBody: "Copy the invite link to bring friends into the room.", notificationRoomJoinedBody: "You can now ready up, choose a character and join voice.", notificationRoleUpdatedBody: "Your character is reserved; ready up and wait for the host.", notificationRoomStartedBody: "The case is live. Enter the room to continue the mystery.", heroCaseTitle: "The Trial of Moonlight", heroCaseKicker: "CASE 014 / UNSEALED", heroCaseSubtitle: "THE TRIAL OF MOONLIGHT", heroNoteTop: "MEMORY<br /><b>IS A CRIME SCENE</b>", schemaExampleTitle: "The Trial of Moonlight", privacy: "Privacy", terms: "Terms", discover: "Discover", rooms: "Rooms", library: "My Archive", studio: "Studio",
    heroEyebrow: "TONIGHT, ENTER ANOTHER LIFE", heroTitleA: "Truth hides", heroTitleB: "inside every silence.", heroDescription: "Choose a fate and solve a one-night mystery with people you have never met.", startTrial: "Start a trial", browseRooms: "Browse rooms", curatedCases: "CURATED CASES", picksForYou: "Curated for you", searchPlaceholder: "Search scripts, genres or tags", searchAria: "Search scripts", all: "All", mystery: "Mystery", emotion: "Drama", sciFi: "Sci-fi",
    roomKicker: "ROOM PREVIEW", roomTitle: "Story rooms", roomDescription: "Create or join a live room, then let the host start the case when everyone is ready.", viewTrialEntry: "Create room", roomQuickMatch: "Quick match", roomMatchSuccess: "Matched with a room", roomMatchCreated: "A room is ready for you; waiting for more players", roomJoin: "Join room", roomWatch: "View room", roomMissing: "{count} spot(s) left", roomFull: "Full", roomRequest: "{room}: you are in", roomLobbyTitle: "Room lobby", roomLobbyPlayers: "Room members", roomLobbyWaiting: "Waiting for the host to start", roomLobbyLive: "The case is live", roomStart: "Start case", roomLeave: "Leave room", roomClose: "Close room", roomCreateSuccess: "Room created", roomJoinSuccess: "You joined the room", roomLeaveSuccess: "You left the room", roomStartSuccess: "The case has started", roomReady: "Ready", roomUnready: "Not ready", roomReadySuccess: "Ready status updated", roomReadyCount: "{ready} / {total} ready", roomNotReady: "Some players are not ready yet", roomYou: "You", roomOffline: "The service is unavailable; opening a solo trial instead", roomNoRooms: "No public rooms yet. Create the first one.", roomHost: "Host", roomPlayer: "Player", roomSpectator: "Spectator", roomRoleTitle: "Choose your character", roomRoleAuto: "Assign automatically", roomRoleHint: "Choose a character before marking ready. Each character can be selected by one player only.", roomRoleUpdated: "Character selection updated", roomRoleTaken: "That character is already taken", roomRoleUnavailable: "Character selection is unavailable", roomCodeLabel: "Enter room code", roomCodePlaceholder: "For example: A1B2C3D4", roomCodeJoin: "Enter room ↗", roomCodeHint: "Paste the 8-character room code shared by your friends.", roomCodeInvalid: "Enter a valid room code", roomCodeNotFound: "That room could not be found", roomChatTitle: "Room chat", roomChatOnline: "Live sync", roomChatEmpty: "No messages yet. Say hello.", roomChatPlaceholder: "Type a message…", roomChatSend: "Send", roomChatReport: "Report", roomChatReported: "Report submitted", roomChatAlreadyReported: "You already reported this message", roomChatBlock: "Block", roomChatBlocked: "User blocked", roomChatAlreadyBlocked: "User already blocked", roomChatUnavailable: "Chat is temporarily unavailable", roomVoiceTitle: "Room voice", roomVoiceJoin: "Join voice", roomVoiceLeave: "Leave voice", roomVoiceMute: "Mute", roomVoiceUnmute: "Unmute", roomVoiceReady: "Voice connected", roomVoiceConnecting: "Connecting voice…", roomVoiceOff: "Voice not joined", roomVoiceUnsupported: "Voice calls are not supported on this device", roomVoicePermission: "Allow microphone access to join voice", roomVoiceEmpty: "Join to talk with room members",
    archiveKicker: "YOUR ARCHIVE", archiveTitle: "Saved stories", archiveDescription: "Keep the stories worth replaying and remember who you became.", archiveEmptyTitle: "Your archive is quiet", archiveEmptyDescription: "Favorite or complete a trial and it will appear here.", archiveCompleted: "Completed", archiveReplay: "Replay", exploreScripts: "Explore scripts", favoriteAdd: "Save script", favoriteRemove: "Remove saved script", favoriteSaved: "Saved", favoriteRemoved: "Removed from archive", profileEdit: "Edit profile", profileSave: "Save profile", profileNameLabel: "Display name", profileNamePlaceholder: "Name shown to room members", profileGuestNote: "You are using an anonymous guest identity; this name is only shown in rooms.", profileSaved: "Profile saved", profileDelete: "Delete guest data", profileDeleteConfirm: "Delete this device's guest profile and room records?", profileDeleted: "Guest data deleted", studioKicker: "STUDIO / CONTENT OPS", studioTitle: "Creator studio", studioDescription: "Drop script files into the watched folder and Nocturne will parse, organize and publish them as drafts.", syncEnabled: "Auto-sync enabled", synced: "{count} scripts synced", autoIngestion: "AUTO INGESTION", ingestionTitle: "Script ingestion", live: "● LIVE", dropTitle: "Drop script files here", dropDescription: "Supports .json / .md · files are parsed into drafts automatically", chooseFile: "Choose file", listening: "Watching the incoming folder", incomingFolder: "Put files in /incoming; scan runs every 4 seconds", waiting: "Waiting for data", activity: "ACTIVITY FEED", recentActivity: "Recent activity", scanNow: "Scan now ↗", schemaTitle: "Content format", schemaDescription: "JSON may provide title, genre, players, duration, tags, description and content; Markdown uses its first-level heading as the script title.",
    emptyFilterTitle: "No scripts in this category", emptyFilterDescription: "Try another filter or import a new script from Studio.", emptySearchTitle: "No matching scripts", emptySearchDescription: "Try another keyword or clear the search to keep exploring.", caseFile: "CASE FILE", privateCase: "CASE FILE / PRIVATE", players: "PLAYERS", duration: "DURATION", level: "LEVEL", defaultGenre: "Narrative mystery", defaultSubtitle: "An immersive mystery about truth, secrets and choice", defaultDescription: "A new script has arrived. Find the one piece of evidence that cannot be forged before everyone tells you their version of the truth.", detailStart: "Start trial", cardStart: "View details / Start trial",
    gamePlaying: "Playing", backToLibrary: "← Back to archive", livePlay: "Story in progress", yourRole: "Your role", caseNote: "Case notes", phaseBriefing: "Prologue · Arrival", phaseEvidence: "Act I · Evidence", phaseQuestion: "Act II · Questions", phaseVote: "Final act · Accusation", phaseResult: "Final act · Review", gameTitleEvidence: "Evidence hunt", gameTitleQuestion: "Open questioning", gameTitleVote: "Final accusation", gameTitleResult: "The truth comes to light", gamePrologue: "PROLOGUE", gameEvidenceKicker: "ACT I / COLLECT EVIDENCE", gameEvidenceModalKicker: "CASE NOTE / EVIDENCE {count}", gameQuestionKicker: "ACT II / OPEN QUESTIONING", gameQuestionRoleplay: "SCRIPTED ROLEPLAY / RESPONSE", gameVoteKicker: "FINAL ACT / NAME THE CULPRIT", gameVoteSubkicker: "ONE ACCUSATION / ONE TRUTH", gameClosedKicker: "CASE CLOSED", startEvidence: "Start evidence hunt", continueEvidence: "Keep searching", continueQuestion: "Keep questioning", enterQuestion: "Open questioning", enterVote: "Make final accusation", finalVote: "Final accusation", closed: "Case archived", replay: "Play again", evidenceHint: "Collect at least 3 clues before questioning.", evidenceCount: "{count} / 3 key clues found", questionHint: "{count} questions asked · more clues, better judgment", voteHint: "You only get one formal accusation.", voteSubmitted: "Accusation submitted", voteWaiting: "Waiting for the other players to vote", inspectEvidence: "Select an item · tap to inspect", recordEvidence: "Record in case notes", noEnoughEvidence: "Inspect at least three items before the next act", noEnoughQuestions: "Ask at least three questions before the final accusation", questionTime: "Where were you during the critical window?", questionMotive: "Who has the strongest motive?", questionKey: "Have you seen the key evidence?", accuse: "Accuse ↗", correct: "The truth comes to light", wrong: "That answer cannot explain all the evidence", localResponse: "{name} has responded", recorded: "Recorded", close: "Close", sceneAlt: "case scene", roomTrialPrompt: "Choose a case to start a trial", scanComplete: "Scan complete; the script library is updated", scanOffline: "Offline trial mode cannot scan the server folder",
  }
};

translations.zh.roomRestored = "已恢复你的房间";
translations.en.roomRestored = "Your room has been restored";
translations.zh.roomVoteTitle = "房间指认结果";
translations.en.roomVoteTitle = "Room accusation results";
translations.zh.roomVoteConsensus = "票数汇总";
translations.en.roomVoteConsensus = "Vote tally";
translations.zh.roomVoteYourChoice = "你的指认";
translations.en.roomVoteYourChoice = "Your accusation";
translations.zh.roomVoteCorrect = "指认正确";
translations.en.roomVoteCorrect = "Correct accusation";
translations.zh.roomVoteWrong = "指认偏离真相";
translations.en.roomVoteWrong = "The truth was elsewhere";
translations.zh.roomVoteVotes = "{count} 票";
translations.en.roomVoteVotes = "{count} vote(s)";
translations.zh.roomVoteNoVotes = "暂无投票记录";
translations.en.roomVoteNoVotes = "No votes recorded";
translations.zh.roomVoteReveal = "真相：{name}";
translations.en.roomVoteReveal = "Truth: {name}";
translations.zh.profileLevel = "探索者 Lv.{level}";
translations.en.profileLevel = "Explorer Lv.{level}";
translations.zh.profileStatsTitle = "推理档案";
translations.en.profileStatsTitle = "Investigation record";
translations.zh.statsPlayed = "完成案件";
translations.en.statsPlayed = "Cases played";
translations.zh.statsSolved = "正确指认";
translations.en.statsSolved = "Correct calls";
translations.zh.statsClues = "发现线索";
translations.en.statsClues = "Clues found";
translations.zh.statsQuestions = "公开质询";
translations.en.statsQuestions = "Questions asked";
translations.zh.achievementsTitle = "探索成就";
translations.en.achievementsTitle = "Explorer achievements";
translations.zh.achievementFirstCase = "初次入案";
translations.en.achievementFirstCase = "First case";
translations.zh.achievementFirstCaseDesc = "完成一局案件，建立你的第一条推理记录。";
translations.en.achievementFirstCaseDesc = "Complete one case and start your investigation record.";
translations.zh.achievementTruthSeeker = "真相追踪者";
translations.en.achievementTruthSeeker = "Truth seeker";
translations.zh.achievementTruthSeekerDesc = "成功完成一次最终指认。";
translations.en.achievementTruthSeekerDesc = "Make one correct final accusation.";
translations.zh.achievementEvidence = "证物收藏家";
translations.en.achievementEvidence = "Evidence collector";
translations.zh.achievementEvidenceDesc = "累计发现 12 条线索。";
translations.en.achievementEvidenceDesc = "Discover 12 clues across your cases.";
translations.zh.achievementQuestioner = "公开质询官";
translations.en.achievementQuestioner = "Open questioner";
translations.zh.achievementQuestionerDesc = "累计完成 6 次公开质询。";
translations.en.achievementQuestionerDesc = "Ask six questions across your cases.";
translations.zh.achievementUnlocked = "已解锁";
translations.zh.useHint = "查看提示";
translations.en.useHint = "Use hint";
translations.zh.hintUsed = "提示 {count}/2";
translations.en.hintUsed = "Hint {count}/2";
translations.zh.hintLimit = "本局提示已用完，请继续从物证中寻找答案。";
translations.en.hintLimit = "You have used both hints. Keep reading the evidence for the answer.";
translations.zh.hintFirst = "先按时间线检查最早出现的异常记录。";
translations.en.hintFirst = "Start with the earliest anomaly in the timeline.";
translations.zh.hintSecond = "把物证放在一起看：真正关键的是能同时解释机会与动机的细节。";
translations.en.hintSecond = "Read the evidence together: the key detail should explain both opportunity and motive.";
translations.zh.hintLabel = "案件提示";
translations.en.hintLabel = "Case hint";
translations.zh.notebookTitle = "推理桌";
translations.en.notebookTitle = "Deduction board";
translations.zh.notebookEmpty = "把重要物证放到这里，整理你的推理路径。";
translations.en.notebookEmpty = "Pin important evidence here and build your line of reasoning.";
translations.zh.notebookPin = "加入推理桌";
translations.en.notebookPin = "Pin to board";
translations.zh.notebookUnpin = "移出推理桌";
translations.en.notebookUnpin = "Remove from board";
translations.zh.notebookPinned = "已标记关键";
translations.en.notebookPinned = "Pinned clue";
translations.zh.notebookCount = "已标记 {count} 条线索";
translations.en.notebookCount = "{count} clue(s) pinned";
translations.zh.notebookSelect = "选择两条线索建立关联";
translations.en.notebookSelect = "Select two clues to connect";
translations.zh.notebookSelected = "已选 {count}/2";
translations.en.notebookSelected = "{count}/2 selected";
translations.zh.notebookConnect = "建立关联";
translations.en.notebookConnect = "Connect clues";
translations.zh.notebookConnections = "线索关联";
translations.en.notebookConnections = "Clue connections";
translations.zh.notebookNoConnections = "还没有建立关联。";
translations.en.notebookNoConnections = "No connections yet.";
translations.zh.notebookLinked = "已建立线索关联";
translations.en.notebookLinked = "Clues connected";
translations.zh.notebookUnlink = "解除关联";
translations.en.notebookUnlink = "Remove connection";
translations.zh.dmTitle = "主持人控场";
translations.en.dmTitle = "DM control room";
translations.zh.dmHint = "由房主推进剧情，所有玩家会在同步后看到变化。";
translations.en.dmHint = "The host advances the story; every player sees the change after sync.";
translations.zh.dmCurrent = "当前阶段";
translations.en.dmCurrent = "Current phase";
translations.zh.dmAdvance = "推进到 {phase}";
translations.en.dmAdvance = "Advance to {phase}";
translations.zh.dmAdvanced = "已推进到 {phase}";
translations.en.dmAdvanced = "Advanced to {phase}";
translations.en.achievementUnlocked = "Unlocked";
translations.zh.achievementLocked = "未解锁";
translations.en.achievementLocked = "Locked";
translations.zh.resultAward = "本局记录";
translations.en.resultAward = "This case";
translations.zh.resultAwardFirst = "首次完成案件，档案已建立";
translations.en.resultAwardFirst = "First case complete; your record has begun";
translations.zh.resultAwardSolved = "最终指认命中真相";
translations.en.resultAwardSolved = "Final accusation matched the truth";
translations.zh.resultAwardObserver = "你以观战身份见证了本局";
translations.en.resultAwardObserver = "You witnessed this case as a spectator";
translations.zh.navLeaderboard = "探索榜";
translations.en.navLeaderboard = "Ranking";
translations.zh.leaderboard = "探索榜";
translations.en.leaderboard = "Ranking";
translations.zh.mobileLeaderboard = "榜单";
translations.en.mobileLeaderboard = "Rank";
translations.zh.leaderboardKicker = "探索榜 / 社区记录";
translations.en.leaderboardKicker = "EXPLORER RANKING";
translations.zh.leaderboardTitle = "探索榜";
translations.en.leaderboardTitle = "Explorer ranking";
translations.zh.leaderboardDescription = "完成案件、找出真相，在探索记录里留下你的名字。";
translations.en.leaderboardDescription = "Complete cases, find the truth and leave your name in the explorer record.";
translations.zh.leaderboardRefresh = "刷新榜单 ↗";
translations.en.leaderboardRefresh = "Refresh ranking ↗";
translations.zh.leaderboardHeroKicker = "NOCTURNE / 社区记录";
translations.en.leaderboardHeroKicker = "NOCTURNE / COMMUNITY";
translations.zh.leaderboardHeroTitle = "谁在今晚更接近真相？";
translations.en.leaderboardHeroTitle = "Who is closer to the truth tonight?";
translations.zh.leaderboardHeroDescription = "榜单只展示公开昵称和案件完成记录，不展示邮箱或设备信息。";
translations.en.leaderboardHeroDescription = "The ranking shows public names and case records only—not emails or device details.";
translations.zh.leaderboardEmpty = "还没有公开探索记录。完成第一局案件后，你会出现在这里。";
translations.en.leaderboardEmpty = "No public explorer records yet. Complete your first case to appear here.";
translations.zh.leaderboardOffline = "暂时无法读取社区榜单，仍可继续离线游玩。";
translations.en.leaderboardOffline = "The community ranking is temporarily unavailable; you can still play offline.";
translations.zh.leaderboardYou = "你";
translations.en.leaderboardYou = "You";
translations.zh.leaderboardSolved = "命中真相";
translations.en.leaderboardSolved = "Solved";
translations.zh.leaderboardPlayed = "完成案件";
translations.en.leaderboardPlayed = "Played";
translations.zh.leaderboardClues = "发现线索";
translations.en.leaderboardClues = "Clues";
translations.zh.leaderboardQuestions = "质询次数";
translations.en.leaderboardQuestions = "Questions";
translations.zh.leaderboardLocal = "本设备记录";
translations.en.leaderboardLocal = "This device";
translations.zh.reviewKicker = "审核 / 制作队列";
translations.en.reviewKicker = "REVIEW / PRODUCTION QUEUE";
translations.zh.reviewTitle = "审核与制作仓库";
translations.en.reviewTitle = "Review & production warehouse";
translations.zh.adminTokenPlaceholder = "后台审核令牌";
translations.en.adminTokenPlaceholder = "Admin review token";
translations.zh.adminLoadQueue = "加载队列";
translations.en.adminLoadQueue = "Load queue";
translations.zh.adminHelp = "上传内容不会直接公开。审核通过后会进入待制作仓库，再按剧情、音频、质检和上架逐步推进。";
translations.en.adminHelp = "Uploads never become public immediately. Approved scripts enter the production warehouse and move through writing, audio, QA and publishing.";
translations.zh.reviewFilter = "审核状态";
translations.en.reviewFilter = "Review status";
translations.zh.productionFilter = "制作状态";
translations.en.productionFilter = "Production status";
translations.zh.adminRefresh = "刷新队列 ↗";
translations.en.adminRefresh = "Refresh queue ↗";
translations.zh.adminQueueEmpty = "输入后台令牌后加载审核队列。";
translations.en.adminQueueEmpty = "Enter an admin token to load the review queue.";
translations.zh.adminUnauthorized = "审核令牌无效或后台未配置";
translations.en.adminUnauthorized = "The admin token is invalid or review access is not configured";
translations.zh.adminNotConfigured = "生产环境尚未配置 ADMIN_REVIEW_TOKEN，请先在 Vercel 环境变量中设置。";
translations.en.adminNotConfigured = "ADMIN_REVIEW_TOKEN is not configured in production. Add it in Vercel environment variables first.";
translations.zh.adminPasswordTitle = "修改管理员密码";
translations.en.adminPasswordTitle = "Change admin password";
translations.zh.adminPasswordHelp = "先用当前令牌加载队列，再设置新的管理员密码。新密码会安全保存到数据库。";
translations.en.adminPasswordHelp = "Load the queue with your current token, then set a new admin password. The new password is stored securely in the database.";
translations.zh.adminNewPasswordPlaceholder = "新密码（至少 12 位）";
translations.en.adminNewPasswordPlaceholder = "New password (at least 12 characters)";
translations.zh.adminConfirmPasswordPlaceholder = "再次输入新密码";
translations.en.adminConfirmPasswordPlaceholder = "Confirm the new password";
translations.zh.adminChangePassword = "保存新密码";
translations.en.adminChangePassword = "Save new password";
translations.zh.adminPasswordChanged = "管理员密码已更新";
translations.en.adminPasswordChanged = "Admin password updated";
translations.zh.adminPasswordMismatch = "两次输入的新密码不一致";
translations.en.adminPasswordMismatch = "The new passwords do not match";
translations.zh.adminPasswordTooShort = "新密码至少需要 12 位";
translations.en.adminPasswordTooShort = "The new password must be at least 12 characters";
translations.zh.ttsNotConfigured = "Azure TTS 尚未配置";
translations.en.ttsNotConfigured = "Azure TTS is not configured";
translations.zh.ttsGenerated = "Azure 音频素材已生成";
translations.en.ttsGenerated = "Azure audio asset generated";
translations.zh.ttsPanelTitle = "Azure 声音素材";
translations.en.ttsPanelTitle = "Azure voice assets";
translations.zh.ttsPanelHelp = "主持人和每个角色都可以单独选择语言、声音和台词，避免角色声线混用。";
translations.en.ttsPanelHelp = "Choose a language, voice and line for the host or each role so character voices stay consistent.";
translations.zh.ttsGenerate = "生成音频素材";
translations.en.ttsGenerate = "Generate voice asset";
translations.zh.ttsSpeakerPlaceholder = "角色标识，如 he / player";
translations.en.ttsSpeakerPlaceholder = "Speaker key, e.g. he / player";
translations.zh.ttsTextPlaceholder = "输入主持人或角色台词";
translations.en.ttsTextPlaceholder = "Enter the host or character line";
translations.zh.ttsHost = "主持人";
translations.en.ttsHost = "Host";
translations.zh.ttsRole = "角色";
translations.en.ttsRole = "Role";
translations.zh.uploadSubmitted = "已提交审核，审核通过后进入待制作仓库";
translations.en.uploadSubmitted = "Submitted for review; approval will move it into the production warehouse";
translations.zh.reviewPending = "待审核";
translations.en.reviewPending = "Pending review";
translations.zh.reviewApproved = "已通过";
translations.en.reviewApproved = "Approved";
translations.zh.reviewRejected = "已驳回";
translations.en.reviewRejected = "Rejected";
translations.zh.productionNotStarted = "未开始";
translations.en.productionNotStarted = "Not started";
translations.zh.productionQueued = "待制作";
translations.en.productionQueued = "Queued";
translations.zh.productionWriting = "剧情制作";
translations.en.productionWriting = "Writing";
translations.zh.productionAudio = "音频制作";
translations.en.productionAudio = "Audio";
translations.zh.productionQa = "质检";
translations.en.productionQa = "QA";
translations.zh.productionReady = "待上架";
translations.en.productionReady = "Ready to publish";
translations.zh.productionPublished = "已上架";
translations.en.productionPublished = "Published";
translations.zh.productionBlocked = "已阻塞";
translations.en.productionBlocked = "Blocked";
translations.zh.reviewApprove = "通过并进入待制作";
translations.en.reviewApprove = "Approve & queue";
translations.zh.reviewReject = "驳回";
translations.en.reviewReject = "Reject";
translations.zh.reviewNotesPrompt = "填写审核备注（可选）";
translations.en.reviewNotesPrompt = "Review notes (optional)";
translations.zh.productionNext = "下一步";
translations.en.productionNext = "Next step";
translations.zh.productionUpdate = "更新制作状态";
translations.en.productionUpdate = "Update production";
translations.zh.audioAssets = "音频素材 {count} 条";
translations.en.audioAssets = "{count} audio asset(s)";
translations.zh.audioTitle = "自动主持人与角色音频";
translations.en.audioTitle = "Auto host & character audio";
translations.zh.audioHost = "主持人播放";
translations.en.audioHost = "Play host narration";
translations.zh.audioRole = "角色播放";
translations.en.audioRole = "Play character voice";
translations.zh.audioStop = "停止播放";
translations.en.audioStop = "Stop audio";
translations.zh.audioFallback = "当前没有录音，将使用设备语音播放";
translations.en.audioFallback = "No recording is attached; device speech will be used";
translations.zh.audioUnavailable = "当前设备不支持语音播放";
translations.en.audioUnavailable = "Speech playback is not available on this device";
translations.zh.audioLang = "播放语言";
translations.en.audioLang = "Playback language";

function t(key, vars = {}) {
  let value = translations[state.locale]?.[key] ?? translations.zh[key] ?? key;
  return Object.entries(vars).reduce((result, [name, replacement]) => result.replaceAll(`{${name}}`, String(replacement)), value);
}
const fallbackScripts = [
  { id: "moon-trial", title: "月影审判", subtitle: "The Trial of Moonlight", genre: "悬疑 · 古典", players: 6, duration: "90 分钟", difficulty: "进阶", tags: ["多线叙事", "情感沉浸"], author: "Nocturne Studio", cover: "violet", description: "一场发生在私人博物馆的晚宴，一枚失踪的月光宝石，和六段互相矛盾的记忆。", status: "可开局" },
  { id: "last-letter", title: "旧港来信", subtitle: "Letters from the Old Port", genre: "情感 · 时代", players: 5, duration: "75 分钟", difficulty: "入门", tags: ["情感还原", "双重结局"], author: "Morrow House", cover: "amber", description: "在潮水再次上涨之前，找出那封从未寄出的信，以及写信的人真正想留下什么。", status: "热度上升" },
  { id: "orbit-7", title: "轨道之外", subtitle: "Beyond the Orbit", genre: "科幻 · 密室", players: 7, duration: "110 分钟", difficulty: "硬核", tags: ["未来科幻", "机关线索"], author: "Signal / 07", cover: "blue", description: "空间站失去通讯的第七分钟，所有人都收到了来自未来的同一条讯息。", status: "可开局" },
  { id: "velvet-room", title: "绒幕之后", subtitle: "Behind the Velvet", genre: "情感 · 演绎", players: 6, duration: "80 分钟", difficulty: "进阶", tags: ["强角色", "角色演绎"], author: "Morrow House", cover: "rose", description: "剧院谢幕之后，真正的戏才刚刚开始。每个人都在争夺最后一个角色。", status: "新上线" }
];
const scriptTranslations = {
  "moon-trial": { title: "The Trial of Moonlight", subtitle: "THE TRIAL OF MOONLIGHT", genre: "Mystery · Classic", duration: "90 min", difficulty: "Advanced", tags: ["Multi-thread", "Emotional depth"], description: "At a private museum dinner, a moonstone vanishes while six memories begin to contradict one another.", status: "Ready to play" },
  "old-port-letter": { title: "Letters from the Old Port", subtitle: "LETTERS FROM THE OLD PORT", genre: "Drama · Period", duration: "75 min", difficulty: "Beginner", tags: ["Emotional reveal", "Dual ending"], description: "Before the tide rises again, find the never-sent letter and what its writer truly wanted to leave behind.", status: "Trending" },
  "last-letter": { title: "Letters from the Old Port", subtitle: "LETTERS FROM THE OLD PORT", genre: "Drama · Period", duration: "75 min", difficulty: "Beginner", tags: ["Emotional reveal", "Dual ending"], description: "Before the tide rises again, find the never-sent letter and what its writer truly wanted to leave behind.", status: "Trending" },
  "orbit-7": { title: "Beyond the Orbit", subtitle: "BEYOND THE ORBIT", genre: "Sci-fi · Locked room", duration: "110 min", difficulty: "Expert", tags: ["Future noir", "Mechanical clues"], description: "Seven minutes after a station loses contact, everyone receives the same message from the future.", status: "Ready to play" },
  "velvet-room": { title: "Behind the Velvet", subtitle: "BEHIND THE VELVET", genre: "Drama · Performance", duration: "80 min", difficulty: "Advanced", tags: ["Strong roles", "Roleplay"], description: "After the curtain falls, the real play begins. Everyone is fighting for the last role.", status: "New" }
};
const scriptChineseTranslations = {
  "moon-trial": { subtitle: "月影审判", duration: "90 分钟" },
  "old-port-letter": { subtitle: "旧港来信", duration: "75 分钟" },
  "last-letter": { subtitle: "旧港来信", duration: "75 分钟" },
  "orbit-7": { subtitle: "轨道之外", duration: "110 分钟" },
  "velvet-room": { subtitle: "绒幕之后", duration: "80 分钟" }
};

function localizedScript(script) {
  if (!script) return script;
  if (state.locale === "zh") return { ...script, ...(scriptChineseTranslations[script.id] || {}) };
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
  const navLabels = { discover: "navDiscover", rooms: "navRooms", library: "navLibrary", leaderboard: "navLeaderboard", studio: "navStudio" };
  $$(".sidebar .nav-item").forEach((item) => {
    const icon = item.querySelector(".nav-icon");
    item.innerHTML = `${icon ? icon.outerHTML : ""}${t(navLabels[item.dataset.view])}`;
  });
  const mobileLabels = { discover: "mobileHome", rooms: "mobileRooms", library: "mobileLibrary", leaderboard: "mobileLeaderboard", studio: "mobileStudio" };
  $$(".mobile-nav-item").forEach((item) => { item.querySelector("small").textContent = t(mobileLabels[item.dataset.view]); });
  $(".online-signal strong").textContent = t("localPlay");
  $(".online-signal small").textContent = t("offlineCases");
  const displayName = state.profileName || t("profileName");
  $(".profile-chip .avatar").textContent = displayName.slice(0, 1);
  $(".profile-chip strong").textContent = displayName;
  $(".profile-chip small").textContent = t("profileLevel", { level: playerLevel() });
  $(".profile-chip").setAttribute("aria-label", t("profileEdit"));
  $(".top-avatar").textContent = displayName.slice(0, 1);
  $(".top-avatar").setAttribute("aria-label", t("profileEdit"));
  $(".icon-button").title = t("notification");
  renderNotifications();
  $(".legal-links a[href='privacy.html']").textContent = t("privacy");
  $(".legal-links a[href='terms.html']").textContent = t("terms");
  $(".hero-copy .eyebrow").textContent = t("heroEyebrow");
  $(".hero-copy h1").innerHTML = `${t("heroTitleA")}<br /><em>${t("heroTitleB")}</em>`;
  $(".hero-description").textContent = t("heroDescription");
  $("#quickStart").innerHTML = `${t("startTrial")} <span>↗</span>`;
  $(".hero-actions .ghost-button").textContent = t("browseRooms");
  if ($("#gameRoomButton")) $("#gameRoomButton").textContent = t("roomLobbyTitle");
  $(".art-card .card-kicker").textContent = t("heroCaseKicker");
  $(".art-card strong").textContent = t("heroCaseTitle");
  $(".art-card small").textContent = t("heroCaseSubtitle");
  $(".note-a").innerHTML = t("heroNoteTop");
  $(".section-heading .eyebrow").textContent = t("curatedCases");
  $(".section-heading h2").textContent = t("picksForYou");
  const filterLabels = { all: "all", mystery: "mystery", emotion: "emotion", sciFi: "sciFi" };
  $$(".filter-tab").forEach((tab) => { tab.textContent = t(filterLabels[tab.dataset.filter] || "all"); });
  const scriptSearch = $("#scriptSearch");
  if (scriptSearch) {
    scriptSearch.placeholder = t("searchPlaceholder");
    scriptSearch.setAttribute("aria-label", t("searchAria"));
    scriptSearch.value = state.searchQuery;
  }
  $("#roomsView .page-intro .eyebrow").textContent = t("roomKicker");
  $("#roomsView .page-intro h1").textContent = t("roomTitle");
  $("#roomsView .page-intro p:last-child").textContent = t("roomDescription");
  $("#createRoom").textContent = t("viewTrialEntry");
  $("#quickMatchRoom").textContent = `${t("roomQuickMatch")} ↗`;
  $("#roomCodeLabel").textContent = t("roomCodeLabel");
  $("#roomCodeInput").placeholder = t("roomCodePlaceholder");
  $("#joinRoomCode").textContent = t("roomCodeJoin");
  $("#roomCodeHint").textContent = t("roomCodeHint");
  $("#libraryView .page-intro .eyebrow").textContent = t("archiveKicker");
  $("#libraryView .page-intro h1").textContent = t("archiveTitle");
  $("#libraryView .page-intro p:last-child").textContent = t("archiveDescription");
  const archiveEmptyTitle = $("#libraryView .empty-library h3");
  const archiveEmptyDescription = $("#libraryView .empty-library p");
  const archiveExploreButton = $("#libraryView .empty-library .ghost-button");
  if (archiveEmptyTitle) archiveEmptyTitle.textContent = t("archiveEmptyTitle");
  if (archiveEmptyDescription) archiveEmptyDescription.textContent = t("archiveEmptyDescription");
  if (archiveExploreButton) archiveExploreButton.textContent = t("exploreScripts");
  $("#leaderboardView .page-intro .eyebrow").textContent = t("leaderboardKicker");
  $("#leaderboardView .page-intro h1").textContent = t("leaderboardTitle");
  $("#leaderboardView .page-intro p:last-child").textContent = t("leaderboardDescription");
  $("#leaderboardRefresh").textContent = t("leaderboardRefresh");
  $("#leaderboardHeroKicker").textContent = t("leaderboardHeroKicker");
  $("#leaderboardHeroTitle").textContent = t("leaderboardHeroTitle");
  $("#leaderboardHeroDescription").textContent = t("leaderboardHeroDescription");
  renderLeaderboard();
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
  $("#reviewKicker").textContent = t("reviewKicker");
  $("#reviewTitle").textContent = t("reviewTitle");
  $("#adminTokenInput").placeholder = t("adminTokenPlaceholder");
  $("#adminLoadQueue").textContent = t("adminLoadQueue");
  $("#adminHelp").textContent = t("adminHelp");
  $("#adminPasswordTitle").textContent = t("adminPasswordTitle");
  $("#adminPasswordHelp").textContent = t("adminPasswordHelp");
  $("#adminNewPassword").placeholder = t("adminNewPasswordPlaceholder");
  $("#adminConfirmPassword").placeholder = t("adminConfirmPasswordPlaceholder");
  $("#adminChangePassword").textContent = t("adminChangePassword");
  $("#reviewFilterLabel").textContent = t("reviewFilter");
  $("#productionFilterLabel").textContent = t("productionFilter");
  $("#adminRefreshQueue").textContent = t("adminRefresh");
  const reviewOptions = { all: state.locale === "zh" ? "全部" : "All", pending: t("reviewPending"), approved: t("reviewApproved"), rejected: t("reviewRejected") };
  $$("#reviewStatusFilter option").forEach((option) => { option.textContent = reviewOptions[option.value] || option.textContent; });
  const productionOptions = { all: state.locale === "zh" ? "全部" : "All", queued: t("productionQueued"), writing: t("productionWriting"), audio: t("productionAudio"), qa: t("productionQa"), ready: t("productionReady"), published: t("productionPublished") };
  $$("#productionStatusFilter option").forEach((option) => { option.textContent = productionOptions[option.value] || option.textContent; });
  $("#adminTokenInput").value = state.adminToken;
  $(".schema-tip strong").textContent = t("schemaTitle");
  $(".schema-tip p").textContent = t("schemaDescription");
  $(".schema-tip code").textContent = `{ "title": "${t("schemaExampleTitle")}", "players": 6 }`;
  $("#modalCover .card-kicker").textContent = t("privateCase");
  $("#modalSubtitle").textContent = t("defaultSubtitle");
  $("#modalStart").innerHTML = `${t("detailStart")} <span>↗</span>`;
  $("#modalMatch").innerHTML = `${t("roomQuickMatch")} <span>↗</span>`;
  $("#modalRoom").innerHTML = `${state.locale === "zh" ? "创建房间" : "Create room"} <span>↗</span>`;
  $(".player-card span").textContent = t("yourRole");
  $(".back-button").textContent = t("backToLibrary");
  $(".case-note .eyebrow").textContent = t("caseNote");
  $(".live-pill").innerHTML = `<i></i> ${t("livePlay")}`;
  renderProfileModal();
  const gameNavLabels = { briefing: "phaseBriefing", evidence: "phaseEvidence", question: "phaseQuestion", vote: "phaseVote" };
  $$(".game-nav-item").forEach((item) => { const number = item.querySelector("span")?.textContent || ""; item.innerHTML = `<span>${number}</span>${t(gameNavLabels[item.dataset.gamePhase])}`; });
  $$("[data-locale]").forEach((button) => button.classList.toggle("active", button.dataset.locale === state.locale));
  const activeView = $(".view.active-view")?.id.replace(/View$/, "") || $(".sidebar .nav-item.active")?.dataset.view || "discover";
  $("#viewLabel").textContent = activeView === "game" ? t("gamePlaying") : t(activeView);
  renderAdminQueue();
}

function setLocale(locale, { persist = true, source = "manual" } = {}) {
  if (locale !== "zh" && locale !== "en") return;
  state.locale = locale;
  state.audioLocale = locale;
  state.localeSource = source;
  const toast = $("#toast");
  toast?.classList.remove("show");
  if (toast) toast.textContent = "";
  if (persist) {
    try { localStorage.setItem("nocturne-locale", locale); } catch { /* storage can be unavailable in private webviews */ }
  }
  try {
    applyStaticLocale();
    renderScripts();
    renderRooms();
    renderRoomLobby();
    renderLibrary();
    renderActivity();
  } catch {
    // A partially mounted view must not leave the active game in the old language.
  } finally {
    // Always rebuild the visible game from the new locale, even when another view
    // was not mounted yet or a non-critical static label is missing.
    if ($("#gameView")?.classList.contains("active-view")) {
      syncActiveCaseLocale();
      ({ briefing: renderBriefing, evidence: renderEvidence, question: renderQuestion, vote: renderVote, result: renderResult }[gameState.phase] || renderBriefing)();
    }
  }
}

async function detectLocale() {
  if (state.localeSource === "manual") return;
  let locale = browserFallbackLocale();
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

async function loadScriptAudio(scriptId) {
  if (!scriptId) return;
  try {
    const response = await apiFetch(`/api/scripts/${encodeURIComponent(scriptId)}/audio?locale=${encodeURIComponent(state.audioLocale)}`);
    if (!response.ok) return;
    const data = await response.json();
    state.audioAssets[scriptId] = Array.isArray(data.assets) ? data.assets : [];
    if (activeCase?.id === scriptId && document.querySelector("#gameView.active-view")) {
      activeCase = localizedCase(scriptId);
      renderCurrentGamePhase();
    }
  } catch { /* recorded audio is optional; device speech remains available */ }
}

function currentUserProfile() {
  let externalKey = "";
  try {
    externalKey = localStorage.getItem("nocturne-user-key") || "";
    if (!externalKey) {
      externalKey = `guest-${crypto.randomUUID()}`;
      localStorage.setItem("nocturne-user-key", externalKey);
    }
  } catch {
    externalKey = `guest-${Date.now()}`;
  }
  return { externalKey, displayName: state.profileName || t("profileName"), locale: state.locale };
}

async function loadRooms() {
  try {
    const profile = currentUserProfile();
    const [waitingResponse, liveResponse] = await Promise.all([
      apiFetch(`/api/rooms?status=waiting&externalKey=${encodeURIComponent(profile.externalKey)}`),
      apiFetch(`/api/rooms?status=live&externalKey=${encodeURIComponent(profile.externalKey)}`)
    ]);
    if (!waitingResponse.ok || !liveResponse.ok) throw new Error("rooms unavailable");
    const [waitingData, liveData] = await Promise.all([waitingResponse.json(), liveResponse.json()]);
    state.liveRooms = [...(Array.isArray(waitingData.rooms) ? waitingData.rooms : []), ...(Array.isArray(liveData.rooms) ? liveData.rooms : [])];
  } catch {
    state.liveRooms = [];
  }
  renderRooms();
}

function scriptCard(script) {
  const coverImage = coverAsset(script);
  const favorite = state.favorites.includes(script.id);
  const favoriteText = favorite ? t("favoriteRemove") : t("favoriteAdd");
  return `<article class="script-card" data-script-id="${script.id}">
    <div class="script-cover cover-${script.cover || "violet"}" style="--cover-image: url('${coverImage}')"><span class="cover-kicker">${t("caseFile")} / ${String(script.id).slice(0, 8).toUpperCase()}</span><div class="cover-title"><strong>${script.title}</strong><small>${script.subtitle || t("defaultSubtitle")}</small></div></div>
    <div class="script-body"><button class="favorite-toggle${favorite ? " active" : ""}" data-favorite="${script.id}" aria-label="${favoriteText}" title="${favoriteText}">${favorite ? "★" : "☆"}</button><div class="script-top"><h3>${script.genre || t("defaultGenre")}</h3><small>${script.status || (state.locale === "en" ? "Ready to play" : "可开局")}</small></div><div class="script-meta"><span>${script.players || 6} ${state.locale === "en" ? "players" : "人"}</span><span>${script.duration || (state.locale === "en" ? "60–90 min" : "60–90 分钟")}</span><span>${script.difficulty || (state.locale === "en" ? "Advanced" : "进阶")}</span></div><div class="tag-list">${(script.tags || []).slice(0, 3).map((tag) => `<span class="tag">${tag}</span>`).join("")}</div><button class="card-start" data-start-script="${script.id}">${t("cardStart")} <span>↗</span></button></div>
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
  const query = state.searchQuery.trim().toLocaleLowerCase();
  const filterTerms = {
    all: [],
    mystery: state.locale === "en" ? ["mystery"] : ["悬疑"],
    emotion: state.locale === "en" ? ["drama", "emotion"] : ["情感"],
    sciFi: state.locale === "en" ? ["sci-fi", "science fiction"] : ["科幻"]
  };
  const scripts = state.scripts.map((rawScript) => ({ rawScript, script: localizedScript(rawScript) })).filter(({ rawScript, script }) => {
    const searchableTags = [script.genre, ...(script.tags || [])].filter(Boolean).join(" ").toLocaleLowerCase();
    const matchesFilter = filter === "all" || (filterTerms[filter] || []).some((term) => searchableTags.includes(term.toLocaleLowerCase()));
    const searchable = [script.title, script.subtitle, script.genre, script.description, script.status, ...(script.tags || []), rawScript.title, rawScript.subtitle, rawScript.genre, rawScript.description, rawScript.status, ...(rawScript.tags || []), JSON.stringify(rawScript.i18n || {})].filter(Boolean).join(" ").toLocaleLowerCase();
    return matchesFilter && (!query || searchable.includes(query));
  }).map(({ script }) => script);
  const emptyTitle = query ? t("emptySearchTitle") : t("emptyFilterTitle");
  const emptyDescription = query ? t("emptySearchDescription") : t("emptyFilterDescription");
  $("#scriptGrid").innerHTML = scripts.map(scriptCard).join("") || `<div class="empty-library"><h3>${emptyTitle}</h3><p>${emptyDescription}</p></div>`;
  $$(".script-card").forEach((card) => card.addEventListener("click", () => openDetail(card.dataset.scriptId)));
  $$(".card-start").forEach((button) => button.addEventListener("click", (event) => { event.stopPropagation(); openDetail(button.dataset.startScript); }));
  $$("#scriptGrid [data-favorite]").forEach((button) => button.addEventListener("click", (event) => { event.stopPropagation(); toggleFavorite(button.dataset.favorite); }));
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

function saveNotifications() {
  try { localStorage.setItem("nocturne-notifications", JSON.stringify(state.notifications.slice(0, 30))); } catch { /* storage can be unavailable in private webviews */ }
}

function addNotification(titleKey, bodyKey, detail = "") {
  const item = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, title: t(titleKey), body: detail || t(bodyKey), createdAt: new Date().toISOString(), read: false };
  state.notifications = [item, ...state.notifications].slice(0, 30);
  saveNotifications();
  renderNotifications();
}

function formatNotificationTime(value) {
  if (!value) return t("waiting");
  return new Intl.DateTimeFormat(state.locale === "zh" ? "zh-CN" : "en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function ensureNotificationCenter() {
  if ($("#notificationPopover")) return;
  document.body.insertAdjacentHTML("beforeend", `<section class="notification-popover" id="notificationPopover" aria-hidden="true" aria-labelledby="notificationPopoverTitle"><div class="notification-popover-head"><div><span class="eyebrow" id="notificationPopoverKicker">NOCTURNE / INBOX</span><h2 id="notificationPopoverTitle">${t("notificationTitle")}</h2></div><button class="modal-close" id="notificationClose" type="button" aria-label="${t("close")}">×</button></div><div class="notification-list" id="notificationList"></div><button class="notification-clear" id="notificationClear" type="button">${t("notificationClear")}</button></section>`);
  $("#notificationClose").addEventListener("click", closeNotifications);
  $("#notificationClear").addEventListener("click", () => {
    state.notifications = state.notifications.filter((entry) => !entry.read);
    saveNotifications();
    renderNotifications();
  });
  renderNotifications();
}

function renderNotifications() {
  const panel = $("#notificationPopover");
  const list = $("#notificationList");
  if (!panel || !list) return;
  const unread = state.notifications.filter((entry) => !entry.read).length;
  $(".notification-dot")?.classList.toggle("hidden", unread === 0);
  $(".icon-button")?.setAttribute("aria-label", `${t("notification")} · ${unread}`);
  $("#notificationPopoverTitle").textContent = t("notificationTitle");
  $("#notificationClear").textContent = t("notificationClear");
  list.innerHTML = state.notifications.length
    ? state.notifications.map((entry) => `<article class="notification-item${entry.read ? " read" : ""}"><i></i><div><strong>${escapeHtml(entry.title)}</strong><p>${escapeHtml(entry.body)}</p><small>${escapeHtml(formatNotificationTime(entry.createdAt))}</small></div></article>`).join("")
    : `<div class="notification-empty">${t("notificationEmpty")}</div>`;
}

function openNotifications() {
  ensureNotificationCenter();
  state.notifications = state.notifications.map((entry) => ({ ...entry, read: true }));
  saveNotifications();
  renderNotifications();
  $("#notificationPopover").classList.add("open");
  $("#notificationPopover").setAttribute("aria-hidden", "false");
}

function closeNotifications() {
  $("#notificationPopover")?.classList.remove("open");
  $("#notificationPopover")?.setAttribute("aria-hidden", "true");
}

function renderRooms() {
  const roomScriptIds = { "月影审判": "moon-trial", "轨道之外": "orbit-7", "旧港来信": "last-letter", "绒幕之后": "velvet-room" };
  const liveCards = state.liveRooms.map((room) => {
    const script = localizedScript(state.scripts.find((item) => item.id === room.scriptId) || fallbackScripts.find((item) => item.id === room.scriptId) || fallbackScripts[0]);
    const spots = Math.max(0, Number(room.spotsLeft || 0));
    const isFull = spots === 0;
    const isLive = room.status === "live";
    const previewOnly = !isLive && isFull;
    const title = state.locale === "en" ? script.title : (room.title || script.title);
    const actionLabel = isLive || previewOnly ? t("roomWatch") : t("roomJoin");
    return `<article class="room-card live-room-card"><div><span class="tag">${escapeHtml(isLive ? t("livePlay") : isFull ? t("roomFull") : t("roomJoin"))}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(room.hostName || t("roomHost"))}<br />${isLive ? t("roomLobbyLive") : isFull ? t("roomFull") : t("roomMissing", { count: spots })}</p></div><div class="room-actions"><div class="room-players">${escapeHtml(room.players)} / ${escapeHtml(room.maxPlayers)}</div><button class="secondary-button join-room" data-room-id="${escapeHtml(room.id)}" data-script-id="${escapeHtml(room.scriptId)}" data-member-role="${isLive ? "spectator" : "player"}" data-preview="${previewOnly ? "true" : "false"}">${actionLabel} ↗</button></div></article>`;
  });
  const fallbackCards = rooms.map((room) => { const localized = state.locale === "en" ? (roomTranslations[room.title] || {}) : room; const title = localized.title || room.title; const host = localized.host || room.host; const mood = localized.mood || room.mood; const wait = localized.wait || room.wait; return `<article class="room-card"><div><span class="tag">${mood}</span><h3>${title}</h3><p>${host}<br />${wait}</p></div><div class="room-actions"><div class="room-players">${room.players}</div><button class="secondary-button join-room" data-script-id="${roomScriptIds[room.title] || "moon-trial"}">${room.players === "6 / 6" ? t("roomWatch") : t("roomJoin")} ↗</button></div></article>`; });
  $("#roomGrid").innerHTML = (liveCards.length ? liveCards : fallbackCards).join("");
  $$(".join-room").forEach((button) => button.addEventListener("click", async () => {
    if (button.dataset.roomId) {
      const room = state.liveRooms.find((entry) => entry.id === button.dataset.roomId);
      if (button.dataset.preview === "true") return openRoomLobby(room);
      return joinRoom(button.dataset.roomId, button.dataset.memberRole || "player");
    }
    state.selectedScript = state.scripts.find((script) => script.id === button.dataset.scriptId) || fallbackScripts.find((script) => script.id === button.dataset.scriptId) || fallbackScripts[0];
    startGame();
  }));
}

function ensureProfileModal() {
  if ($("#profileModalBackdrop")) return;
  document.body.insertAdjacentHTML("beforeend", `<div class="room-lobby-backdrop" id="profileModalBackdrop" aria-hidden="true"><section class="room-lobby-card profile-modal-card" role="dialog" aria-modal="true" aria-labelledby="profileModalTitle"><button class="modal-close" id="profileModalClose">×</button><p class="eyebrow">NOCTURNE / PROFILE</p><h2 id="profileModalTitle">${t("profileEdit")}</h2><label class="profile-field"><span id="profileNameLabel">${t("profileNameLabel")}</span><input id="profileNameInput" maxlength="80" autocomplete="nickname" /></label><p class="profile-note" id="profileGuestNote">${t("profileGuestNote")}</p><section class="profile-stats" aria-labelledby="profileStatsTitle"><span class="eyebrow" id="profileStatsTitle">${t("profileStatsTitle")}</span><div id="profileStats"></div></section><section class="profile-achievements" aria-labelledby="profileAchievementsTitle"><span class="eyebrow" id="profileAchievementsTitle">${t("achievementsTitle")}</span><div id="profileAchievements"></div></section><div class="room-lobby-actions"><button class="primary-button" id="profileModalSave">${t("profileSave")}</button><button class="ghost-button" id="profileModalCancel">${t("close")}</button></div><button class="profile-delete-button" id="profileDeleteButton">${t("profileDelete")}</button></section></div>`);
  $("#profileModalClose").addEventListener("click", closeProfileModal);
  $("#profileModalCancel").addEventListener("click", closeProfileModal);
  $("#profileModalBackdrop").addEventListener("click", (event) => { if (event.target.id === "profileModalBackdrop") closeProfileModal(); });
  $("#profileModalSave").addEventListener("click", saveProfile);
  $("#profileDeleteButton").addEventListener("click", deleteProfile);
}

function renderProfileModal() {
  if (!$("#profileModalBackdrop")) return;
  $("#profileModalTitle").textContent = t("profileEdit");
  $("#profileNameLabel").textContent = t("profileNameLabel");
  $("#profileNameInput").placeholder = t("profileNamePlaceholder");
  $("#profileGuestNote").textContent = t("profileGuestNote");
  $("#profileStatsTitle").textContent = t("profileStatsTitle");
  $("#profileStats").innerHTML = [[t("statsPlayed"), state.stats.played], [t("statsSolved"), state.stats.solved], [t("statsClues"), state.stats.clues], [t("statsQuestions"), state.stats.questions]].map(([label, value]) => `<div class="profile-stat"><strong>${value}</strong><span>${label}</span></div>`).join("");
  const missions = [
    ["achievementFirstCase", "achievementFirstCaseDesc", state.stats.played, 1],
    ["achievementTruthSeeker", "achievementTruthSeekerDesc", state.stats.solved, 1],
    ["achievementEvidence", "achievementEvidenceDesc", state.stats.clues, 12],
    ["achievementQuestioner", "achievementQuestionerDesc", state.stats.questions, 6]
  ];
  $("#profileAchievementsTitle").textContent = t("achievementsTitle");
  $("#profileAchievements").innerHTML = missions.map(([titleKey, descriptionKey, current, target]) => {
    const value = Math.min(Number(current) || 0, target);
    const unlocked = value >= target;
    return `<article class="achievement-card${unlocked ? " unlocked" : ""}"><div class="achievement-mark">${unlocked ? "✦" : "○"}</div><div class="achievement-copy"><strong>${t(titleKey)}</strong><small>${t(descriptionKey)}</small><div class="achievement-progress"><span style="width:${Math.round((value / target) * 100)}%"></span></div></div><em>${unlocked ? t("achievementUnlocked") : `${value}/${target}`}</em></article>`;
  }).join("");
  $("#profileModalSave").textContent = t("profileSave");
  $("#profileModalCancel").textContent = t("close");
  $("#profileDeleteButton").textContent = t("profileDelete");
}

function openProfileModal() {
  ensureProfileModal();
  renderProfileModal();
  $("#profileNameInput").value = state.profileName || t("profileName");
  $("#profileModalBackdrop").classList.add("open");
  $("#profileModalBackdrop").setAttribute("aria-hidden", "false");
  setTimeout(() => $("#profileNameInput")?.focus(), 0);
}

function closeProfileModal() {
  $("#profileModalBackdrop")?.classList.remove("open");
  $("#profileModalBackdrop")?.setAttribute("aria-hidden", "true");
}

function saveProfile() {
  const value = $("#profileNameInput").value.trim().slice(0, 80);
  state.profileName = value || t("profileName");
  try { localStorage.setItem("nocturne-profile-name", state.profileName); } catch { /* storage can be unavailable in private webviews */ }
  applyStaticLocale();
  closeProfileModal();
  showToast(t("profileSaved"));
}

async function deleteProfile() {
  if (!window.confirm(t("profileDeleteConfirm"))) return;
  try {
    const response = await apiFetch("/api/profile", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ user: currentUserProfile() }) });
    if (!response.ok) throw new Error("profile delete failed");
  } catch {
    // Local data is still removed when the API is unavailable.
  }
  try {
    localStorage.removeItem("nocturne-user-key");
    localStorage.removeItem("nocturne-active-room");
    localStorage.removeItem("nocturne-profile-name");
    localStorage.removeItem("nocturne-archive");
    localStorage.removeItem("nocturne-favorites");
    localStorage.removeItem("nocturne-notifications");
    localStorage.removeItem("nocturne-player-stats");
  } catch { /* storage can be unavailable in private webviews */ }
  state.profileName = "";
  state.archive = [];
  state.favorites = [];
  state.notifications = [];
  state.stats = readPlayerStats();
  closeProfileModal();
  applyStaticLocale();
  renderLibrary();
  showToast(t("profileDeleted"));
}

function ensureRoomLobby() {
  if ($("#roomLobbyBackdrop")) return;
  document.body.insertAdjacentHTML("beforeend", `<div class="room-lobby-backdrop" id="roomLobbyBackdrop" aria-hidden="true"><section class="room-lobby-card" role="dialog" aria-modal="true" aria-labelledby="roomLobbyTitle"><button class="modal-close" id="roomLobbyClose">×</button><p class="eyebrow">ROOM LOBBY</p><h2 id="roomLobbyTitle">${t("roomLobbyTitle")}</h2><p class="room-lobby-status" id="roomLobbyStatus"></p><div class="room-invite-meta" id="roomInviteMeta"></div><div class="room-lobby-members" id="roomLobbyMembers"></div><div class="room-lobby-actions" id="roomLobbyActions"></div><section class="room-voice" id="roomVoicePanel" aria-label="${t("roomVoiceTitle")}"><div class="room-chat-header"><div><span class="eyebrow" id="roomVoiceTitle">${t("roomVoiceTitle")}</span></div><small id="roomVoiceState">${t("roomVoiceOff")}</small></div><div class="room-voice-members" id="roomVoiceMembers"><span class="room-voice-empty">${t("roomVoiceEmpty")}</span></div><div class="room-voice-audio" id="roomVoiceAudio"></div><div class="room-voice-actions"><button class="primary-button" type="button" id="roomVoiceToggle">${t("roomVoiceJoin")}</button><button class="ghost-button" type="button" id="roomVoiceMute" hidden>${t("roomVoiceMute")}</button></div></section><section class="room-chat" aria-label="${t("roomChatTitle")}"><div class="room-chat-header"><div><span class="eyebrow" id="roomChatTitle">${t("roomChatTitle")}</span></div><small id="roomChatState">${t("roomChatOnline")}</small></div><div class="room-chat-messages" id="roomChatMessages"></div><form class="room-chat-form" id="roomChatForm"><input id="roomChatInput" maxlength="500" autocomplete="off" placeholder="${t("roomChatPlaceholder")}" /><button class="primary-button" type="submit" id="roomChatSend">${t("roomChatSend")}</button></form></section></section></div>`);
  $("#roomLobbyClose").addEventListener("click", () => closeRoomLobby());
  $("#roomLobbyBackdrop").addEventListener("click", (event) => { if (event.target.id === "roomLobbyBackdrop") closeRoomLobby(); });
  $("#roomChatForm").addEventListener("submit", (event) => { event.preventDefault(); void sendRoomMessage(); });
  $("#roomVoiceToggle").addEventListener("click", () => { if (state.voiceJoined) leaveRoomVoice(); else void joinRoomVoice(); });
  $("#roomVoiceMute").addEventListener("click", toggleRoomVoiceMute);
}

function closeRoomLobby({ preserveRoom = false } = {}) {
  const keepRoom = preserveRoom || (typeof gameState !== "undefined" && Boolean(gameState.roomId));
  if (!keepRoom) {
    clearInterval(state.roomPollTimer);
    clearInterval(state.roomChatTimer);
    clearInterval(state.roomVoiceTimer);
    leaveRoomVoice();
    state.roomPollTimer = null;
    state.roomChatTimer = null;
    state.roomVoiceTimer = null;
    state.activeRoom = null;
    state.roomMember = false;
    state.roomChatRoomId = null;
    state.roomChatCursor = "0";
    state.roomMessages = [];
    state.blockedUsers = new Set();
  }
  $("#roomLobbyBackdrop")?.classList.remove("open");
  $("#roomLobbyBackdrop")?.setAttribute("aria-hidden", "true");
}

function renderRoomChat() {
  const container = $("#roomChatMessages");
  if (!container) return;
  const visibleMessages = state.roomMessages.filter((message) => !state.blockedUsers.has(message.userId));
  container.innerHTML = visibleMessages.length
    ? visibleMessages.map((message) => `<div class="room-chat-message"><div><strong>${escapeHtml(message.displayName)}</strong><small>${escapeHtml(formatTime(message.createdAt))}</small><button class="room-chat-report" type="button" data-message-id="${escapeHtml(message.id)}">${t("roomChatReport")}</button><button class="room-chat-block" type="button" data-user-id="${escapeHtml(message.userId || "")}">${t("roomChatBlock")}</button></div><p>${escapeHtml(message.body)}</p></div>`).join("")
    : `<div class="room-chat-empty">${t("roomChatEmpty")}</div>`;
  container.scrollTop = container.scrollHeight;
  $$(".room-chat-report").forEach((button) => button.addEventListener("click", () => void reportRoomMessage(button.dataset.messageId)));
  $$(".room-chat-block").forEach((button) => button.addEventListener("click", () => void blockRoomUser(button.dataset.userId)));
}

async function reportRoomMessage(messageId) {
  if (!state.activeRoom || !state.roomMember || !messageId) return;
  try {
    const response = await apiFetch(`/api/rooms/${encodeURIComponent(state.activeRoom.id)}/messages/${encodeURIComponent(messageId)}/report`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ user: currentUserProfile(), reason: "other" })
    });
    const data = await response.json();
    if (!response.ok) {
      if (data.code === "REPORT_DUPLICATE") { showToast(t("roomChatAlreadyReported")); return; }
      throw new Error(data.error || t("roomChatUnavailable"));
    }
    showToast(t("roomChatReported"));
  } catch (error) {
    showToast(error.message || t("roomChatUnavailable"));
  }
}

async function blockRoomUser(userId) {
  const selfId = state.activeRoom?.members?.find((member) => member.isSelf)?.userId;
  if (!state.activeRoom || !state.roomMember || !userId || userId === selfId) return;
  if (state.blockedUsers.has(userId)) { showToast(t("roomChatAlreadyBlocked")); return; }
  try {
    const response = await apiFetch(`/api/rooms/${encodeURIComponent(state.activeRoom.id)}/users/${encodeURIComponent(userId)}/block`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ user: currentUserProfile() })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || t("roomChatUnavailable"));
    state.blockedUsers.add(userId);
    renderRoomChat();
    showToast(t("roomChatBlocked"));
  } catch (error) {
    showToast(error.message || t("roomChatUnavailable"));
  }
}

async function loadRoomMessages(roomId) {
  if (!state.activeRoom || state.activeRoom.id !== roomId || !state.roomMember) return;
  try {
    const profile = currentUserProfile();
    const query = new URLSearchParams({ externalKey: profile.externalKey, displayName: profile.displayName, locale: profile.locale, since: state.roomChatCursor });
    const response = await apiFetch(`/api/rooms/${encodeURIComponent(roomId)}/messages?${query.toString()}`);
    if (!response.ok) throw new Error("chat unavailable");
    const data = await response.json();
    const existing = new Set(state.roomMessages.map((message) => message.id));
    const incoming = (Array.isArray(data.messages) ? data.messages : []).filter((message) => !existing.has(message.id));
    state.roomMessages = [...state.roomMessages, ...incoming].slice(-100);
    state.roomChatCursor = String(data.nextCursor || state.roomChatCursor || "0");
    $("#roomChatState") && ($("#roomChatState").textContent = t("roomChatOnline"));
    renderRoomChat();
  } catch {
    $("#roomChatState") && ($("#roomChatState").textContent = t("roomChatUnavailable"));
  }
}

async function sendRoomMessage() {
  const input = $("#roomChatInput");
  if (!input || !state.activeRoom || !state.roomMember) return;
  const body = input.value.trim();
  if (!body) return;
  const button = $("#roomChatSend");
  if (button) button.disabled = true;
  try {
    const response = await apiFetch(`/api/rooms/${encodeURIComponent(state.activeRoom.id)}/messages`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ user: currentUserProfile(), body }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || t("roomChatUnavailable"));
    if (data.message) {
      state.roomMessages = [...state.roomMessages, data.message].slice(-100);
      state.roomChatCursor = String(data.message.id || state.roomChatCursor);
    }
    input.value = "";
    renderRoomChat();
    input.focus();
  } catch (error) {
    showToast(error.message || t("roomChatUnavailable"));
  } finally {
    if (button) button.disabled = false;
  }
}

function voiceMember(userId) {
  return (state.activeRoom?.members || []).find((member) => member.userId === userId);
}

function renderRoomVoice() {
  const panel = $("#roomVoicePanel");
  if (!panel) return;
  const isMember = Boolean(state.roomMember && state.activeRoom);
  const peers = [...state.voicePeers.values()];
  const connected = peers.filter((peer) => peer.connected).length;
  $("#roomVoiceTitle").textContent = t("roomVoiceTitle");
  $("#roomVoiceState").textContent = !isMember
    ? t("roomVoiceEmpty")
    : state.voiceJoined
      ? `${connected ? t("roomVoiceReady") : t("roomVoiceConnecting")} · ${connected + 1}`
      : t("roomVoiceOff");
  $("#roomVoiceToggle").textContent = state.voiceJoined ? t("roomVoiceLeave") : t("roomVoiceJoin");
  $("#roomVoiceToggle").disabled = !isMember;
  $("#roomVoiceMute").textContent = state.voiceMuted ? t("roomVoiceUnmute") : t("roomVoiceMute");
  $("#roomVoiceMute").hidden = !state.voiceJoined;
  $("#roomVoiceMembers").innerHTML = state.voiceJoined
    ? peers.map((peer) => `<span class="room-voice-member${peer.connected ? " connected" : ""}"><i></i>${escapeHtml(peer.name)}</span>`).join("") || `<span class="room-voice-member connected"><i></i>${escapeHtml(t("roomYou"))}</span>`
    : `<span class="room-voice-empty">${t("roomVoiceEmpty")}</span>`;
}

function removeVoiceAudio(userId) {
  const audio = [...($("#roomVoiceAudio")?.children || [])].find((element) => element.dataset.userId === userId);
  audio?.remove();
}

function closeVoicePeer(userId) {
  const peer = state.voicePeers.get(userId);
  if (!peer) return;
  peer.pc.ontrack = null;
  peer.pc.onicecandidate = null;
  peer.pc.close();
  state.voicePeers.delete(userId);
  state.voicePendingCandidates.delete(userId);
  removeVoiceAudio(userId);
}

function createVoicePeer(member) {
  const userId = String(member.userId);
  const existing = state.voicePeers.get(userId);
  if (existing) return existing;
  const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
  const peer = { id: userId, name: member.displayName || t("roomPlayer"), pc, connected: false };
  state.voicePeers.set(userId, peer);
  state.voiceStream?.getTracks().forEach((track) => pc.addTrack(track, state.voiceStream));
  pc.onicecandidate = (event) => { if (event.candidate) void sendVoiceSignal(userId, "candidate", event.candidate.toJSON ? event.candidate.toJSON() : event.candidate); };
  pc.ontrack = (event) => {
    const container = $("#roomVoiceAudio");
    if (!container || !event.streams[0]) return;
    let audio = [...container.children].find((element) => element.dataset.userId === userId);
    if (!audio) {
      audio = document.createElement("audio");
      audio.dataset.userId = userId;
      audio.autoplay = true;
      audio.playsInline = true;
      audio.setAttribute("aria-label", peer.name);
      container.appendChild(audio);
    }
    audio.srcObject = event.streams[0];
    void audio.play().catch(() => {});
  };
  pc.onconnectionstatechange = () => {
    peer.connected = pc.connectionState === "connected";
    if (["failed", "closed"].includes(pc.connectionState)) closeVoicePeer(userId);
    renderRoomVoice();
  };
  return peer;
}

async function sendVoiceSignal(receiverUserId, signalType, payload = {}) {
  if (!state.activeRoom || !state.voiceJoined) return;
  try {
    await apiFetch(`/api/rooms/${encodeURIComponent(state.activeRoom.id)}/voice/signals`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ user: currentUserProfile(), receiverUserId, signalType, payload })
    });
  } catch {
    // A transient signaling failure is recovered by the next polling cycle.
  }
}

async function flushVoiceCandidates(userId, peer) {
  if (!peer.pc.remoteDescription) return;
  const queued = state.voicePendingCandidates.get(userId) || [];
  state.voicePendingCandidates.delete(userId);
  for (const candidate of queued) {
    try { await peer.pc.addIceCandidate(candidate); } catch { /* stale ICE candidates are safe to ignore */ }
  }
}

async function createVoiceOffer(member) {
  if (!state.voiceSelfId || String(state.voiceSelfId) >= String(member.userId)) return;
  const peer = createVoicePeer(member);
  if (peer.pc.localDescription) return;
  const offer = await peer.pc.createOffer();
  await peer.pc.setLocalDescription(offer);
  await sendVoiceSignal(member.userId, "offer", peer.pc.localDescription.toJSON ? peer.pc.localDescription.toJSON() : peer.pc.localDescription);
}

async function handleVoiceSignal(signal) {
  if (!state.voiceJoined || signal.senderUserId === state.voiceSelfId) return;
  const member = voiceMember(signal.senderUserId);
  if (!member) return;
  if (signal.type === "leave") { closeVoicePeer(signal.senderUserId); renderRoomVoice(); return; }
  const peer = createVoicePeer(member);
  if (signal.type === "hello") {
    await createVoiceOffer(member);
    return;
  }
  if (signal.type === "offer") {
    await peer.pc.setRemoteDescription(signal.payload);
    await flushVoiceCandidates(signal.senderUserId, peer);
    const answer = await peer.pc.createAnswer();
    await peer.pc.setLocalDescription(answer);
    await sendVoiceSignal(signal.senderUserId, "answer", peer.pc.localDescription.toJSON ? peer.pc.localDescription.toJSON() : peer.pc.localDescription);
    return;
  }
  if (signal.type === "answer") {
    await peer.pc.setRemoteDescription(signal.payload);
    await flushVoiceCandidates(signal.senderUserId, peer);
    return;
  }
  if (signal.type === "candidate") {
    if (peer.pc.remoteDescription) {
      try { await peer.pc.addIceCandidate(signal.payload); } catch { /* ICE can expire between polls */ }
    } else {
      state.voicePendingCandidates.set(signal.senderUserId, [...(state.voicePendingCandidates.get(signal.senderUserId) || []), signal.payload]);
    }
  }
}

async function loadRoomVoiceSignals(roomId) {
  if (!state.activeRoom || state.activeRoom.id !== roomId || !state.roomMember || !state.voiceJoined) return;
  try {
    const profile = currentUserProfile();
    const query = new URLSearchParams({ externalKey: profile.externalKey, displayName: profile.displayName, locale: profile.locale, since: state.voiceCursor });
    const response = await apiFetch(`/api/rooms/${encodeURIComponent(roomId)}/voice/signals?${query.toString()}`);
    if (!response.ok) throw new Error("voice unavailable");
    const data = await response.json();
    state.voiceCursor = String(data.nextCursor || state.voiceCursor || "0");
    for (const signal of data.signals || []) await handleVoiceSignal(signal);
    renderRoomVoice();
  } catch {
    $("#roomVoiceState") && ($("#roomVoiceState").textContent = t("roomVoiceConnecting"));
  }
}

async function joinRoomVoice() {
  if (!state.activeRoom || !state.roomMember || state.voiceJoined) return;
  if (!navigator.mediaDevices?.getUserMedia || !window.RTCPeerConnection) { showToast(t("roomVoiceUnsupported")); return; }
  try {
    state.voiceStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
    state.voiceJoined = true;
    state.voiceMuted = false;
    state.voiceRoomId = state.activeRoom.id;
    state.voiceCursor = "0";
    state.voiceSelfId = state.activeRoom.members.find((member) => member.isSelf)?.userId || null;
    renderRoomVoice();
    const members = (state.activeRoom.members || []).filter((member) => member.userId !== state.voiceSelfId && member.role !== "spectator");
    await Promise.all(members.map(async (member) => {
      await sendVoiceSignal(member.userId, "hello", {});
      await createVoiceOffer(member);
    }));
    await loadRoomVoiceSignals(state.activeRoom.id);
    clearInterval(state.roomVoiceTimer);
    state.roomVoiceTimer = setInterval(() => { void loadRoomVoiceSignals(state.activeRoom?.id); }, 1200);
  } catch {
    state.voiceStream?.getTracks().forEach((track) => track.stop());
    state.voiceStream = null;
    state.voiceJoined = false;
    showToast(t("roomVoicePermission"));
    renderRoomVoice();
  }
}

function leaveRoomVoice() {
  if (state.voiceJoined && state.activeRoom) {
    for (const userId of state.voicePeers.keys()) void sendVoiceSignal(userId, "leave", {});
  }
  clearInterval(state.roomVoiceTimer);
  state.roomVoiceTimer = null;
  for (const userId of [...state.voicePeers.keys()]) closeVoicePeer(userId);
  state.voiceStream?.getTracks().forEach((track) => track.stop());
  state.voiceStream = null;
  state.voiceJoined = false;
  state.voiceMuted = false;
  state.voiceRoomId = null;
  state.voiceSelfId = null;
  state.voiceCursor = "0";
  renderRoomVoice();
}

function toggleRoomVoiceMute() {
  if (!state.voiceStream) return;
  state.voiceMuted = !state.voiceMuted;
  state.voiceStream.getAudioTracks().forEach((track) => { track.enabled = !state.voiceMuted; });
  renderRoomVoice();
}

function roomRoleOptions(room, selectedKey = "") {
  const script = localizedCase(room.scriptId);
  const roles = [{ key: "player", name: state.locale === "zh" ? "调查者" : "Investigator", role: state.locale === "zh" ? "主视角角色" : "Lead investigator" }, ...(script.suspects || []).map((suspect) => ({ key: suspect.id, name: suspect.name, role: suspect.role }))];
  return roles.map((role) => `<option value="${escapeHtml(role.key)}"${role.key === selectedKey ? " selected" : ""}>${escapeHtml(role.name)} · ${escapeHtml(role.role)}</option>`).join("");
}

function renderRoomLobby({ show = true } = {}) {
  if (!state.activeRoom) return;
  ensureRoomLobby();
  const room = state.activeRoom;
  if (state.roomChatRoomId !== room.id) {
    if (state.voiceRoomId && state.voiceRoomId !== room.id) leaveRoomVoice();
    state.roomChatRoomId = room.id;
    state.roomChatCursor = "0";
    state.roomMessages = [];
    state.voiceRoomId = room.id;
    state.voiceCursor = "0";
  }
  const profile = currentUserProfile();
  const script = localizedScript(state.scripts.find((item) => item.id === room.scriptId) || fallbackScripts.find((item) => item.id === room.scriptId) || fallbackScripts[0]);
  const members = room.members || [];
  const playerMembers = members.filter((member) => member.role !== "spectator");
  const readyCount = playerMembers.filter((member) => member.ready === true).length;
  const selfMember = members.find((member) => member.isSelf === true);
  $("#roomLobbyTitle").textContent = `${t("roomLobbyTitle")} · ${state.locale === "en" ? script.title : (room.title || script.title)}`;
  $("#roomLobbyStatus").textContent = room.status === "live" ? t("roomLobbyLive") : `${t("roomLobbyWaiting")} · ${t("roomReadyCount", { ready: readyCount, total: playerMembers.length })}`;
  const shortCode = String(room.id).slice(0, 8).toUpperCase();
  $("#roomInviteMeta").innerHTML = `<span>${state.locale === "zh" ? "房间码" : "ROOM CODE"} · ${shortCode}</span><button class="text-button" id="roomInvite">${state.locale === "zh" ? "复制邀请链接 ↗" : "Copy invite link ↗"}</button>`;
  $("#roomLobbyMembers").innerHTML = `<div class="room-lobby-count">${t("roomLobbyPlayers")} · ${room.players} / ${room.maxPlayers}</div>${members.map((member) => `<div class="room-member"><span class="room-member-avatar">${escapeHtml(String(member.displayName || "?").slice(0, 1))}</span><strong>${escapeHtml(member.displayName)}</strong><small class="${member.ready ? "ready" : "not-ready"}">${member.role === "host" ? t("roomHost") : t(member.role === "spectator" ? "roomSpectator" : "roomPlayer")}${member.isSelf ? ` · ${t("roomYou")}` : ""}${member.role !== "spectator" ? ` · ${member.ready ? t("roomReady") : t("roomUnready")}` : ""}</small></div>`).join("")}`;
  const isHost = room.isHost === true;
  const isMember = state.roomMember === true;
  const buttons = [];
  if (isMember && room.status === "waiting" && selfMember?.role !== "spectator") {
    buttons.push(`<label class="room-role-picker"><span>${t("roomRoleTitle")}</span><select id="roomRoleSelect"><option value="">${t("roomRoleAuto")}</option>${roomRoleOptions(room, selfMember?.characterKey || "")}</select><small>${t("roomRoleHint")}</small></label>`);
  }
  if (!isMember && room.status === "waiting" && Number(room.spotsLeft) > 0) buttons.push(`<button class="primary-button" id="roomJoinFromLobby">${t("roomJoin")} ↗</button>`);
  if (!isMember && room.status === "live") buttons.push(`<button class="primary-button" id="roomWatchFromLobby">${t("roomWatch")} ↗</button>`);
  else if (room.status === "live" && isMember) buttons.push(`<button class="primary-button" id="roomEnterGame">${selfMember?.role === "spectator" ? t("roomWatch") : t("startTrial")} ↗</button>`);
  else if (isHost) buttons.push(`<button class="primary-button" id="roomStartGame">${t("roomStart")} ↗</button>`);
  if (isMember && room.status === "waiting") buttons.push(`<button class="${selfMember?.ready ? "ghost-button" : "primary-button"}" id="roomReady">${selfMember?.ready ? t("roomUnready") : t("roomReady")}</button>`);
  if (isMember) buttons.push(`<button class="ghost-button" id="roomLeave">${isHost ? t("roomClose") : t("roomLeave")}</button>`);
  $("#roomLobbyActions").innerHTML = buttons.join("");
  $("#roomChatTitle").textContent = t("roomChatTitle");
  $("#roomChatInput").placeholder = t("roomChatPlaceholder");
  $("#roomChatSend").textContent = t("roomChatSend");
  renderRoomChat();
  renderRoomVoice();
  if (show) {
    $("#roomLobbyBackdrop").classList.add("open");
    $("#roomLobbyBackdrop").setAttribute("aria-hidden", "false");
  }
  $("#roomInvite")?.addEventListener("click", async () => {
    const invite = new URL(window.location.href);
    invite.search = `?room=${encodeURIComponent(room.id)}`;
    invite.hash = "";
    try {
      await navigator.clipboard.writeText(invite.toString());
      showToast(state.locale === "zh" ? "邀请链接已复制" : "Invite link copied");
    } catch {
      showToast(state.locale === "zh" ? "请复制当前房间链接" : "Copy the room link from the address bar");
    }
  });
  $("#roomJoinFromLobby")?.addEventListener("click", () => joinRoom(room.id));
  $("#roomWatchFromLobby")?.addEventListener("click", () => joinRoom(room.id, "spectator"));
  $("#roomStartGame")?.addEventListener("click", () => roomAction(room.id, "start"));
  $("#roomReady")?.addEventListener("click", () => roomAction(room.id, "ready", !(selfMember?.ready === true)));
  $("#roomRoleSelect")?.addEventListener("change", (event) => void roomAction(room.id, "role", event.target.value));
  $("#roomEnterGame")?.addEventListener("click", () => {
    state.selectedScript = state.scripts.find((item) => item.id === room.scriptId) || fallbackScripts.find((item) => item.id === room.scriptId) || fallbackScripts[0];
    const roomId = room.id;
    closeRoomLobby({ preserveRoom: true });
    startGame({ roomId, spectator: selfMember?.role === "spectator", host: selfMember?.role === "host" });
  });
  $("#roomLeave")?.addEventListener("click", () => roomAction(room.id, isHost ? "close" : "leave"));
}

async function openRoomLobby(room) {
  if (!room) return;
  const previousRoomId = state.activeRoom?.id;
  state.activeRoom = room;
  if (previousRoomId !== room.id) state.roomMember = Boolean(room.members?.some((member) => member.isSelf === true));
  renderRoomLobby();
  clearInterval(state.roomPollTimer);
  clearInterval(state.roomChatTimer);
  clearInterval(state.roomVoiceTimer);
  const roomId = room.id;
  state.roomPollTimer = setInterval(async () => {
    try {
      const profile = currentUserProfile();
      const response = await apiFetch(`/api/rooms/${encodeURIComponent(roomId)}?externalKey=${encodeURIComponent(profile.externalKey)}`);
      if (!response.ok) throw new Error("room closed");
      const lobbyIsOpen = Boolean($("#roomLobbyBackdrop")?.classList.contains("open"));
      state.activeRoom = (await response.json()).room;
      renderRoomLobby({ show: lobbyIsOpen });
      renderRooms();
    } catch {
      clearActiveRoom();
      closeRoomLobby({ preserveRoom: false });
      await loadRooms();
    }
  }, 2500);
  state.roomChatTimer = setInterval(() => { void loadRoomMessages(roomId); }, 2500);
  state.roomVoiceTimer = setInterval(() => { void loadRoomVoiceSignals(roomId); }, 1200);
  void loadRoomMessages(roomId);
  void loadRoomVoiceSignals(roomId);
}

async function refreshActiveRoomState({ revealLobby = false } = {}) {
  const gameRoomId = typeof gameState !== "undefined" ? gameState.roomId : null;
  const activeRoomId = state.activeRoom?.id || gameRoomId;
  if (!activeRoomId) return;
  try {
    const profile = currentUserProfile();
    const response = await apiFetch(`/api/rooms/${encodeURIComponent(activeRoomId)}?externalKey=${encodeURIComponent(profile.externalKey)}`);
    if (!response.ok) throw new Error("room unavailable");
    const data = await response.json();
    const room = data.room;
    if (!room) throw new Error("room missing");
    state.activeRoom = room;

    // Keep the case screen stable while refreshing room membership in the background.
    if (gameRoomId && String(gameRoomId) === String(room.id)) {
      if (room.status === "live") void syncRoomSession();
      return;
    }

    const selfMember = room.members?.find((member) => member.isSelf === true);
    if (!selfMember || room.status === "closed") throw new Error("room membership expired");
    state.roomMember = true;
    const lobbyIsOpen = Boolean($("#roomLobbyBackdrop")?.classList.contains("open"));
    renderRoomLobby({ show: revealLobby || lobbyIsOpen });
    renderRooms();
  } catch {
    // Do not interrupt an active case during a brief network/mobile resume gap.
    if (gameRoomId) return;
    clearActiveRoom();
    closeRoomLobby({ preserveRoom: false });
    await loadRooms();
  }
}

async function roomAction(roomId, action, ready = true) {
  try {
    const body = { user: currentUserProfile(), ...(action === "ready" ? { ready } : {}), ...(action === "role" ? { characterKey: ready } : {}) };
    const response = await apiFetch(`/api/rooms/${encodeURIComponent(roomId)}/${action}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json();
    if (!response.ok) { const error = new Error(data.error || "Room action failed"); error.code = data.code; throw error; }
    if (action === "leave" || action === "close") {
      clearActiveRoom();
      closeRoomLobby({ preserveRoom: false });
      showToast(t(action === "close" ? "roomClose" : "roomLeaveSuccess"));
    } else {
      state.activeRoom = data.room;
      renderRoomLobby();
      if (action === "role") addNotification("notificationRoleUpdated", "notificationRoleUpdatedBody");
      if (action === "start") addNotification("notificationRoomStarted", "notificationRoomStartedBody", data.room?.title || "");
      showToast(t(action === "ready" ? "roomReadySuccess" : action === "role" ? "roomRoleUpdated" : "roomStartSuccess"));
    }
    await loadRooms();
  } catch (error) {
    showToast(error.code === "ROOM_NOT_READY" ? t("roomNotReady") : error.code === "ROLE_TAKEN" ? t("roomRoleTaken") : action === "role" ? t("roomRoleUnavailable") : (error.message || t("roomOffline")));
  }
}

async function joinRoom(roomId, memberRole = "player") {
  try {
    const response = await apiFetch(`/api/rooms/${encodeURIComponent(roomId)}/join`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ user: currentUserProfile(), memberRole }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Unable to join room");
    state.roomMember = true;
    saveActiveRoom(roomId, memberRole === "spectator");
    addNotification("notificationRoomJoined", "notificationRoomJoinedBody", data.room?.title || "");
    showToast(t("roomJoinSuccess"));
    await openRoomLobby(data.room);
    await loadRooms();
  } catch (error) {
    if (error instanceof TypeError || /service|network|fetch/i.test(error.message || "")) {
      state.selectedScript = state.scripts.find((script) => script.id === "moon-trial") || fallbackScripts[0];
      showToast(t("roomOffline"));
      startGame();
      return;
    }
    showToast(error.message || t("roomOffline"));
  }
}

async function createRoom(scriptId = "moon-trial") {
  closeModal();
  try {
    const selectedScript = state.scripts.find((script) => script.id === scriptId) || fallbackScripts.find((script) => script.id === scriptId);
    const maxPlayers = Math.min(Math.max(Number(selectedScript?.players) || 6, 2), 8);
    const response = await apiFetch("/api/rooms", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ scriptId, user: currentUserProfile(), maxPlayers }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Unable to create room");
    state.roomMember = true;
    state.activeRoom = data.room;
    saveActiveRoom(data.room.id, false);
    addNotification("notificationRoomCreated", "notificationRoomCreatedBody", data.room?.title || "");
    showToast(t("roomCreateSuccess"));
    await openRoomLobby(data.room);
    await loadRooms();
  } catch {
    setView("discover");
    showToast(t("roomOffline"));
  }
}

async function quickMatch(scriptId = "moon-trial") {
  closeModal();
  try {
    const selectedScript = state.scripts.find((script) => script.id === scriptId) || fallbackScripts.find((script) => script.id === scriptId);
    const maxPlayers = Math.min(Math.max(Number(selectedScript?.players) || 6, 2), 8);
    const response = await apiFetch("/api/rooms/match", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ scriptId, user: currentUserProfile(), maxPlayers }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Unable to match a room");
    state.roomMember = true;
    state.activeRoom = data.room;
    saveActiveRoom(data.room.id, false);
    addNotification(data.matched ? "notificationRoomJoined" : "notificationRoomCreated", data.matched ? "notificationRoomJoinedBody" : "notificationRoomCreatedBody", data.room?.title || "");
    showToast(t(data.matched ? "roomMatchSuccess" : "roomMatchCreated"));
    await openRoomLobby(data.room);
    await loadRooms();
  } catch (error) {
    showToast(error.message || t("roomOffline"));
  }
}

async function handleRoomInvite() {
  const roomId = new URLSearchParams(window.location.search).get("room");
  if (!roomId) return false;
  setView("rooms");
  await joinRoom(roomId);
  const cleanUrl = new URL(window.location.href);
  cleanUrl.searchParams.delete("room");
  window.history.replaceState({}, "", cleanUrl.toString());
  return true;
}

async function joinRoomByCode(rawCode) {
  const code = String(rawCode || "").trim().replace(/[^a-f0-9-]/gi, "").toLowerCase();
  if (!/^[a-f0-9]{8}(?:[a-f0-9-]{0,28})$/.test(code)) {
    showToast(t("roomCodeInvalid"));
    return;
  }
  try {
    const profile = currentUserProfile();
    const response = await apiFetch(`/api/rooms/code/${encodeURIComponent(code)}?externalKey=${encodeURIComponent(profile.externalKey)}`);
    const data = await response.json();
    if (!response.ok || !data.room) {
      showToast(t("roomCodeNotFound"));
      return;
    }
    setView("rooms");
    state.activeRoom = data.room;
    state.roomMember = Boolean(data.room.members?.some((member) => member.isSelf === true));
    await openRoomLobby(data.room);
  } catch {
    showToast(t("roomOffline"));
  }
}

async function restoreActiveRoom() {
  const saved = readActiveRoom();
  if (!saved) return;
  try {
    const profile = currentUserProfile();
    const response = await apiFetch(`/api/rooms/${encodeURIComponent(saved.id)}?externalKey=${encodeURIComponent(profile.externalKey)}`);
    if (!response.ok) throw new Error("saved room unavailable");
    const data = await response.json();
    const selfMember = data.room?.members?.find((member) => member.isSelf === true);
    if (!selfMember || data.room.status === "closed") throw new Error("saved room membership expired");
    state.roomMember = true;
    state.activeRoom = data.room;
    await openRoomLobby(data.room);
    if (data.room.status === "live") {
      state.selectedScript = state.scripts.find((script) => script.id === data.room.scriptId) || fallbackScripts.find((script) => script.id === data.room.scriptId) || fallbackScripts[0];
      closeRoomLobby({ preserveRoom: true });
      startGame({ roomId: data.room.id, spectator: selfMember.role === "spectator", host: selfMember.role === "host", characterKey: selfMember.characterKey || "player" });
      showToast(t("roomRestored"));
      return;
    }
    setView("rooms");
    showToast(t("roomRestored"));
  } catch {
    clearActiveRoom();
  }
}

function rememberArchive(scriptId) {
  const script = state.scripts.find((entry) => entry.id === scriptId) || fallbackScripts.find((entry) => entry.id === scriptId);
  if (!script) return;
  state.archive = [{ id: scriptId, completedAt: new Date().toISOString() }, ...state.archive.filter((entry) => entry.id !== scriptId)].slice(0, 20);
  try { localStorage.setItem("nocturne-archive", JSON.stringify(state.archive)); } catch { /* storage can be unavailable in private webviews */ }
}

function toggleFavorite(scriptId) {
  if (!scriptId) return;
  const saved = state.favorites.includes(scriptId);
  state.favorites = saved ? state.favorites.filter((id) => id !== scriptId) : [scriptId, ...state.favorites].slice(0, 50);
  try { localStorage.setItem("nocturne-favorites", JSON.stringify(state.favorites)); } catch { /* storage can be unavailable in private webviews */ }
  renderScripts();
  renderLibrary();
  if (state.selectedScript?.id === scriptId) updateModalFavorite();
  showToast(t(saved ? "favoriteRemoved" : "favoriteSaved"));
}

function updateModalFavorite() {
  const button = $("#modalFavorite");
  if (!button || !state.selectedScript) return;
  const saved = state.favorites.includes(state.selectedScript.id);
  button.innerHTML = `${saved ? t("favoriteRemove") : t("favoriteAdd")} <span>${saved ? "★" : "☆"}</span>`;
  button.setAttribute("aria-label", saved ? t("favoriteRemove") : t("favoriteAdd"));
}

function renderLibrary() {
  const container = $("#libraryView");
  if (!container) return;
  const existing = container.querySelector(".empty-library");
  const savedIds = [...new Set([...state.favorites, ...state.archive.map((entry) => entry.id)])];
  const completed = savedIds
    .map((id) => state.scripts.find((script) => script.id === id) || fallbackScripts.find((script) => script.id === id))
    .filter(Boolean);
  if (!completed.length) {
    if (!existing) container.insertAdjacentHTML("beforeend", `<div class="empty-library"><div class="empty-orbit">✦</div><h3></h3><p></p><button class="ghost-button" data-view-target="discover"></button></div>`);
    applyStaticLocale();
    return;
  }
  if (existing) existing.remove();
  let grid = container.querySelector(".archive-grid");
  if (!grid) {
    grid = document.createElement("div");
    grid.className = "archive-grid script-grid";
    container.appendChild(grid);
  }
  grid.innerHTML = completed.map((script) => scriptCard(localizedScript(script))).join("");
  $$(".archive-grid .script-card").forEach((card) => card.addEventListener("click", () => openDetail(card.dataset.scriptId)));
  $$(".archive-grid .card-start").forEach((button) => button.addEventListener("click", (event) => { event.stopPropagation(); openDetail(button.dataset.startScript); }));
  $$(".archive-grid [data-favorite]").forEach((button) => button.addEventListener("click", (event) => { event.stopPropagation(); toggleFavorite(button.dataset.favorite); }));
}

function renderLeaderboard() {
  const container = $("#leaderboardList");
  if (!container) return;
  const rows = Array.isArray(state.leaderboard) ? state.leaderboard : [];
  const local = state.stats || readPlayerStats();
  if (!rows.length) {
    container.innerHTML = `<div class="leaderboard-empty"><div class="empty-orbit">✦</div><h3>${t("leaderboardEmpty")}</h3><p>${t("leaderboardLocal")} · ${local.played} ${t("leaderboardPlayed")} · ${local.solved} ${t("leaderboardSolved")}</p></div>`;
    return;
  }
  container.innerHTML = rows.map((row) => {
    const rank = Number(row.rank || 0);
    const medal = rank === 1 ? "✦" : rank === 2 ? "◇" : rank === 3 ? "◈" : String(rank).padStart(2, "0");
    return `<article class="leaderboard-row${row.isSelf ? " is-self" : ""}"><div class="leaderboard-rank"><span>${medal}</span><small>${String(rank).padStart(2, "0")}</small></div><div class="leaderboard-person"><div class="leaderboard-avatar">${escapeHtml(String(row.displayName || "?").slice(0, 1))}</div><div><strong>${escapeHtml(row.displayName || "Night Watcher")}${row.isSelf ? ` <em>${t("leaderboardYou")}</em>` : ""}</strong><small>${t("leaderboardPlayed")} ${Number(row.played || 0)} · ${t("leaderboardClues")} ${Number(row.clues || 0)}</small></div></div><div class="leaderboard-score"><strong>${Number(row.solved || 0)}</strong><small>${t("leaderboardSolved")}</small></div><div class="leaderboard-questions"><strong>${Number(row.questions || 0)}</strong><small>${t("leaderboardQuestions")}</small></div></article>`;
  }).join("");
}

async function loadLeaderboard() {
  try {
    const profile = currentUserProfile();
    const response = await apiFetch(`/api/leaderboard?limit=20&externalKey=${encodeURIComponent(profile.externalKey)}`);
    if (!response.ok) throw new Error("leaderboard unavailable");
    const data = await response.json();
    state.leaderboard = Array.isArray(data.leaderboard) ? data.leaderboard : [];
  } catch {
    state.leaderboard = [];
  }
  renderLeaderboard();
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
  updateModalFavorite();
  $("#modalBackdrop").classList.add("open");
  $("#modalBackdrop").setAttribute("aria-hidden", "false");
}

function closeModal() { $("#modalBackdrop").classList.remove("open"); $("#modalBackdrop").setAttribute("aria-hidden", "true"); }

function setView(view) {
  $$(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === view));
  $$(".view").forEach((item) => item.classList.toggle("active-view", item.id === `${view}View`));
  $("#viewLabel").textContent = view === "game" ? t("gamePlaying") : t(view);
  if (view === "leaderboard") void loadLeaderboard();
}

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
    toast.textContent = "";
  }, 2600);
}

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

function adminStatusLabel(prefix, status) {
  const key = `${prefix}${String(status || "").replace(/(^|_)([a-z])/g, (_, separator, letter) => letter.toUpperCase())}`;
  return t(key);
}

const ttsVoiceChoices = [
  ["zh-CN-YunjianNeural", "中文 · 云健 / 稳重主持"],
  ["zh-CN-XiaoxiaoNeural", "中文 · 晓晓 / 温和女声"],
  ["zh-CN-YunxiNeural", "中文 · 云希 / 年轻男声"],
  ["zh-CN-XiaoyiNeural", "中文 · 晓伊 / 清晰女声"],
  ["zh-CN-YunyangNeural", "中文 · 云扬 / 冷静男声"],
  ["en-US-GuyNeural", "English · Guy / steady narrator"],
  ["en-US-RyanMultilingualNeural", "English · Ryan / multilingual backup"],
  ["en-US-JennyNeural", "English · Jenny / warm character"],
  ["en-US-AriaNeural", "English · Aria / expressive character"],
  ["en-US-DavisNeural", "English · Davis / calm character"]
];

const ttsVoiceDefaults = {
  zh: { host: "zh-CN-YunjianNeural", role: "zh-CN-XiaoxiaoNeural" },
  en: { host: "en-US-GuyNeural", role: "en-US-JennyNeural" }
};

function ttsVoiceOptions(locale = "zh", kind = "host", selectedVoice = "") {
  const prefix = locale === "zh" ? "zh-CN-" : "en-US-";
  const voices = ttsVoiceChoices.filter(([value]) => value.startsWith(prefix));
  const fallback = selectedVoice || ttsVoiceDefaults[locale]?.[kind] || voices[0]?.[0] || "";
  return voices.map(([value, label]) => `<option value="${value}"${value === fallback ? " selected" : ""}>${label}</option>`).join("");
}

function renderAdminQueue() {
  const container = $("#adminQueue");
  if (!container) return;
  if (!state.adminQueue.length) {
    container.innerHTML = `<div class="admin-queue-empty" id="adminQueueEmpty">${t("adminQueueEmpty")}</div>`;
    return;
  }
  const productionChoices = ["queued", "writing", "audio", "qa", "ready", "published", "blocked"];
  container.innerHTML = state.adminQueue.map(({ script, workItem, audioAssetCount }) => {
    const localized = localizedScript(script);
    const reviewClass = `review-${script.reviewStatus || "pending"}`;
    const productionStatus = workItem?.status || script.productionStatus || "not_started";
    const productionClass = `production-${productionStatus}`;
    const reviewActions = script.reviewStatus === "pending" || script.reviewStatus === "rejected"
      ? `<button class="primary-button" type="button" data-admin-review="approved" data-script-id="${escapeHtml(script.id)}">${t("reviewApprove")}</button>`
      : "";
    const rejectAction = script.reviewStatus === "pending" ? `<button class="ghost-button" type="button" data-admin-review="rejected" data-script-id="${escapeHtml(script.id)}">${t("reviewReject")}</button>` : "";
    const productionActions = script.reviewStatus === "approved"
      ? `<select data-production-select="${escapeHtml(script.id)}" aria-label="${t("productionUpdate")}">${productionChoices.map((status) => `<option value="${status}"${status === productionStatus ? " selected" : ""}>${adminStatusLabel("production", status)}</option>`).join("")}</select><button class="ghost-button" type="button" data-production-update="${escapeHtml(script.id)}">${t("productionUpdate")}</button>`
      : "";
    const audioComposer = script.reviewStatus === "approved"
      ? `<div class="admin-tts-composer"><div class="admin-tts-heading"><strong>${t("ttsPanelTitle")}</strong><small>${t("ttsPanelHelp")}</small></div><div class="admin-tts-fields"><select data-tts-locale aria-label="Audio language"><option value="zh" selected>中文</option><option value="en">English</option></select><select data-tts-kind aria-label="Audio kind"><option value="host" selected>${t("ttsHost")}</option><option value="role">${t("ttsRole")}</option></select><input data-tts-speaker value="host" placeholder="${t("ttsSpeakerPlaceholder")}" aria-label="Speaker key" /><select data-tts-voice aria-label="Azure voice">${ttsVoiceOptions("zh", "host")}</select></div><textarea data-tts-text placeholder="${t("ttsTextPlaceholder")}">${escapeHtml(localized.intro || localized.description || script.description || "")}</textarea><button class="ghost-button" type="button" data-generate-audio="${escapeHtml(script.id)}">${t("ttsGenerate")}</button></div>`
      : "";
    return `<article class="admin-queue-card"><div class="admin-queue-card-head"><div><h4>${escapeHtml(localized.title || script.title)}</h4><small>${escapeHtml(script.sourceFilename || script.id)} · ${escapeHtml(script.author || "Nocturne")}</small></div><div class="admin-queue-meta"><span class="admin-status ${reviewClass}">${adminStatusLabel("review", script.reviewStatus)}</span><span class="admin-status ${productionClass}">${adminStatusLabel("production", productionStatus)}</span></div></div><p>${escapeHtml(script.reviewNotes || workItem?.nextStep || (state.locale === "zh" ? "等待内容审核。" : "Waiting for content review."))}</p><small>${t("audioAssets", { count: audioAssetCount || 0 })}</small><div class="admin-queue-actions">${reviewActions}${rejectAction}${productionActions}</div>${audioComposer}</article>`;
  }).join("");
  $$('[data-admin-review]').forEach((button) => button.addEventListener("click", () => void reviewAdminScript(button.dataset.scriptId, button.dataset.adminReview)));
  $$('[data-production-update]').forEach((button) => button.addEventListener("click", () => {
    const select = $$('[data-production-select]').find((element) => element.dataset.productionSelect === button.dataset.productionUpdate);
    void updateAdminProduction(button.dataset.productionUpdate, select?.value || "queued");
  }));
  $$('[data-tts-locale], [data-tts-kind]').forEach((field) => field.addEventListener("change", () => {
    const card = field.closest(".admin-queue-card");
    const locale = card?.querySelector("[data-tts-locale]")?.value || "zh";
    const kind = card?.querySelector("[data-tts-kind]")?.value || "host";
    const voice = card?.querySelector("[data-tts-voice]");
    if (voice) voice.innerHTML = ttsVoiceOptions(locale, kind);
  }));
  $$('[data-generate-audio]').forEach((button) => button.addEventListener("click", () => void generateAdminAudio(button)));
}

async function generateAdminAudio(button) {
  const card = button.closest(".admin-queue-card");
  const scriptId = button.dataset.generateAudio;
  if (!state.adminToken || !card || !scriptId) return loadAdminQueue();
  const asset = {
    locale: card.querySelector("[data-tts-locale]")?.value || "zh",
    kind: card.querySelector("[data-tts-kind]")?.value || "host",
    speakerKey: card.querySelector("[data-tts-speaker]")?.value || "host",
    sceneKey: "briefing",
    text: card.querySelector("[data-tts-text]")?.value || "",
    voiceName: card.querySelector("[data-tts-voice]")?.value || "",
    status: "ready"
  };
  button.disabled = true;
  try {
    const response = await apiFetch(`/api/admin/scripts/${encodeURIComponent(scriptId)}/audio/generate`, { method: "POST", headers: { "content-type": "application/json", "x-admin-token": state.adminToken }, body: JSON.stringify({ asset, displayName: "Voice Producer", locale: state.locale }) });
    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data.error || t("ttsNotConfigured"));
      error.code = data.code;
      throw error;
    }
    showToast(t("ttsGenerated"));
    await loadAdminQueue();
  } catch (error) {
    showToast(error.code === "TTS_NOT_CONFIGURED" ? t("ttsNotConfigured") : (error.message || t("adminUnauthorized")));
  } finally {
    button.disabled = false;
  }
}

async function loadAdminQueue() {
  const token = String($("#adminTokenInput")?.value || state.adminToken || "").trim();
  state.adminToken = token;
  if (!token) { state.adminQueue = []; renderAdminQueue(); return; }
  try {
    const params = new URLSearchParams({ reviewStatus: $("#reviewStatusFilter")?.value || "all", productionStatus: $("#productionStatusFilter")?.value || "all" });
    const response = await apiFetch(`/api/admin/scripts?${params.toString()}`, { headers: { "x-admin-token": token } });
    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data.error || "admin queue unavailable");
      error.code = data.code;
      throw error;
    }
    try { sessionStorage.setItem("nocturne-admin-token", token); } catch { /* session storage may be unavailable */ }
    state.adminQueue = Array.isArray(data.scripts) ? data.scripts : [];
    renderAdminQueue();
  } catch (error) {
    state.adminQueue = [];
    renderAdminQueue();
    showToast(error.code === "ADMIN_NOT_CONFIGURED" ? t("adminNotConfigured") : (/token|configured|admin/i.test(error.message || "") ? t("adminUnauthorized") : (error.message || t("roomOffline"))));
  }
}

async function changeAdminPassword(event) {
  event.preventDefault();
  const currentToken = String($("#adminTokenInput")?.value || state.adminToken || "").trim();
  const newPassword = String($("#adminNewPassword")?.value || "");
  const confirmPassword = String($("#adminConfirmPassword")?.value || "");
  if (!currentToken) return showToast(t("adminUnauthorized"));
  if (newPassword.length < 12) return showToast(t("adminPasswordTooShort"));
  if (newPassword !== confirmPassword) return showToast(t("adminPasswordMismatch"));
  try {
    const response = await apiFetch("/api/admin/password", {
      method: "POST",
      headers: { "content-type": "application/json", "x-admin-token": currentToken },
      body: JSON.stringify({ newPassword, displayName: "Content Administrator", locale: state.locale })
    });
    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data.error || t("adminUnauthorized"));
      error.code = data.code;
      throw error;
    }
    state.adminToken = newPassword;
    try { sessionStorage.setItem("nocturne-admin-token", newPassword); } catch { /* session storage may be unavailable */ }
    $("#adminTokenInput").value = newPassword;
    $("#adminNewPassword").value = "";
    $("#adminConfirmPassword").value = "";
    showToast(t("adminPasswordChanged"));
    await loadAdminQueue();
  } catch (error) {
    showToast(error.code === "INVALID_ADMIN_PASSWORD" ? t("adminPasswordTooShort") : (error.message || t("adminUnauthorized")));
  }
}

async function reviewAdminScript(scriptId, decision) {
  if (!state.adminToken || !scriptId) return loadAdminQueue();
  const notes = window.prompt(t("reviewNotesPrompt"), "") ?? "";
  try {
    const response = await apiFetch(`/api/admin/scripts/${encodeURIComponent(scriptId)}/review`, { method: "POST", headers: { "content-type": "application/json", "x-admin-token": state.adminToken }, body: JSON.stringify({ decision, notes, displayName: "Content Reviewer", locale: state.locale }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "review failed");
    showToast(decision === "approved" ? t("reviewApproved") : t("reviewRejected"));
    await loadAdminQueue();
    await loadScripts();
  } catch (error) { showToast(error.message || t("adminUnauthorized")); }
}

async function updateAdminProduction(scriptId, status) {
  if (!state.adminToken || !scriptId) return loadAdminQueue();
  try {
    const response = await apiFetch(`/api/admin/scripts/${encodeURIComponent(scriptId)}/production`, { method: "POST", headers: { "content-type": "application/json", "x-admin-token": state.adminToken }, body: JSON.stringify({ status, displayName: "Content Producer", locale: state.locale }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "production update failed");
    showToast(adminStatusLabel("production", status));
    await loadAdminQueue();
    await loadScripts();
  } catch (error) { showToast(error.message || t("adminUnauthorized")); }
}

async function importFile(file) {
  const content = await file.text();
  let script;
  if (file.name.toLowerCase().endsWith(".json")) script = JSON.parse(content);
  else {
    const title = (content.match(/^#\s+(.+)$/m) || [null, file.name.replace(/\.md$/i, "")])[1];
    script = { title, content: { markdown: content }, description: content.split(/\r?\n/).filter(Boolean).slice(1, 4).join(" ") };
  }
  const response = await apiFetch("/api/scripts/import", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ filename: file.name, script, user: currentUserProfile() }) });
  if (!response.ok) throw new Error("导入失败");
  showToast(t("uploadSubmitted"));
  await loadAdminQueue();
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
caseTranslations["old-port-letter"] = caseTranslations["last-letter"];

const caseChineseTranslations = {
  "moon-trial": { caseLabel: "案件 014 / 月影", sceneKicker: "白昼厅 / 私人展览" },
  "last-letter": { caseLabel: "案件 027 / 旧港", sceneKicker: "旧港 / 最后潮汐" },
  "old-port-letter": { caseLabel: "案件 027 / 旧港", sceneKicker: "旧港 / 最后潮汐" },
  "orbit-7": { caseLabel: "案件 071 / 轨道七号", sceneKicker: "轨道空间站 / 通讯中断" },
  "velvet-room": { caseLabel: "案件 044 / 绒幕", sceneKicker: "绒幕舞台 / 谢幕后" }
};

function gameAsset(value, fallback) {
  const candidate = String(value || "").trim();
  return /^(?:https?:\/\/|\/|assets\/)/i.test(candidate) ? candidate : fallback;
}

function contentText(value, fallback = "") {
  if (typeof value === "string") return value.trim() || fallback;
  if (Array.isArray(value)) return value.filter(Boolean).join(" ") || fallback;
  return fallback;
}

function buildImportedCase(script) {
  const localized = localizedScript(script) || script || {};
  const template = localizedCase("moon-trial");
  const content = localized.content && typeof localized.content === "object" ? localized.content : {};
  const zhNames = ["沈默的馆长", "失约的收藏家", "夜班修复师", "记录者", "最后的守门人"];
  const enNames = ["The Curator", "The Collector", "The Restorer", "The Recorder", "The Gatekeeper"];
  const names = state.locale === "zh" ? zhNames : enNames;
  const defaultRoles = state.locale === "zh" ? ["现场负责人", "私人收藏家", "技术顾问", "调查记者", "安保负责人"] : ["Venue curator", "Private collector", "Technical consultant", "Investigative reporter", "Security lead"];
  const rawSuspects = Array.isArray(content.suspects) && content.suspects.length >= 2 ? content.suspects : names.map((name, index) => ({ name, role: defaultRoles[index] }));
  const suspects = rawSuspects.slice(0, 8).map((suspect, index) => {
    const id = String(suspect.id || `suspect-${index + 1}`);
    const name = contentText(suspect[state.locale === "zh" ? "name_zh" : "name_en"], contentText(suspect.name, names[index] || `${state.locale === "zh" ? "嫌疑人" : "Suspect"} ${index + 1}`));
    const answers = suspect.answers && typeof suspect.answers === "object" ? suspect.answers : {};
    return {
      id,
      name,
      role: contentText(suspect[state.locale === "zh" ? "role_zh" : "role_en"], contentText(suspect.role, defaultRoles[index] || (state.locale === "zh" ? "在场者" : "Witness"))),
      avatar: gameAsset(suspect.avatar || suspect.avatarUrl, template.suspects[index % template.suspects.length].avatar),
      line: contentText(suspect.line, state.locale === "zh" ? "我知道的并不比你多。" : "I know no more than you do."),
      answers: {
        time: contentText(answers.time || suspect.time, state.locale === "zh" ? "我会在行动记录里说明自己的去向。" : "My movements are in the activity record."),
        motive: contentText(answers.motive || suspect.motive, state.locale === "zh" ? "每个人都有理由，但理由不等于证据。" : "Everyone has a reason, but a reason is not proof."),
        key: contentText(answers.key || suspect.key, state.locale === "zh" ? "真正的线索藏在物证之间。" : "The real clue is hidden between the pieces of evidence.")
      }
    };
  });
  const solutionId = String(content.solution || content.solutionId || suspects[0].id);
  const solutionSuspect = suspects.find((suspect) => suspect.id === solutionId) || suspects[0];
  const rawEvidence = Array.isArray(content.evidence) && content.evidence.length >= 3 ? content.evidence : template.evidence;
  const evidence = rawEvidence.slice(0, 8).map((item, index) => ({
    id: String(item.id || item.key || `evidence-${index + 1}`),
    symbol: item.symbol || template.evidence[index % template.evidence.length].symbol,
    name: contentText(item[state.locale === "zh" ? "name_zh" : "name_en"], contentText(item.name, state.locale === "zh" ? `关键物证 ${index + 1}` : `Key evidence ${index + 1}`)),
    type: contentText(item[state.locale === "zh" ? "type_zh" : "type_en"], contentText(item.type, state.locale === "zh" ? "案件物证" : "Case evidence")),
    image: gameAsset(item.image || item.imageUrl, template.evidence[index % template.evidence.length].image),
    detail: contentText(item[state.locale === "zh" ? "detail_zh" : "detail_en"], contentText(item.detail, state.locale === "zh" ? "这件物证可能改变你对案件的判断。" : "This piece of evidence may change your read of the case."))
  }));
  const timeline = Array.isArray(content.timeline) && content.timeline.length
    ? content.timeline.map((entry, index) => Array.isArray(entry) ? [String(entry[0] || `${index + 1}`), String(entry[1] || "")] : [String(entry.time || `${index + 1}`), contentText(entry.text, "")]).filter((entry) => entry[1])
    : template.timeline;
  const caseCode = String(script.id || "imported").slice(0, 12).toUpperCase();
  return {
    ...template,
    id: script.id,
    title: localized.title || script.title || template.title,
    player: localized.player || (state.locale === "zh" ? "调查者 · 案件记录员" : "Investigator · Case recorder"),
    caseLabel: `CASE / ${caseCode}`,
    sceneKicker: state.locale === "zh" ? "新案件 / 私人调查" : "NEW CASE / PRIVATE INVESTIGATION",
    sceneImage: gameAsset(localized.sceneImage || content.sceneImage, coverAsset(localized)),
    intro: contentText(content.opening || content.briefing, localized.description || template.intro),
    evidenceLead: contentText(content.evidenceLead, state.locale === "zh" ? "现场仍然保持着事件发生时的样子。" : "The scene remains exactly as it was when the incident happened."),
    evidenceCopy: contentText(content.evidenceCopy, state.locale === "zh" ? "逐一检查物证，已经发现的线索会保留在你的案件笔记中。" : "Inspect each item. Discovered clues stay in your case notes."),
    questionCopy: contentText(content.questionCopy, state.locale === "zh" ? "选择一名在场者，追问他的时间线、动机和关键线索。" : "Choose someone in the room and question their timeline, motive and key clue."),
    voteLead: contentText(content.voteLead, state.locale === "zh" ? "所有说法都已摆在你面前。现在做出最终指认。" : "Every version is on the table. Make your final accusation."),
    voteCopy: contentText(content.voteCopy, state.locale === "zh" ? "正确答案必须能够解释现场留下的关键证据。" : "The right answer must explain the key evidence left at the scene."),
    resultTitle: contentText(content.resultTitle, state.locale === "zh" ? "真相浮出水面" : "The truth comes to light"),
    resultText: contentText(content.resultText, state.locale === "zh" ? `最终证据指向${solutionSuspect.name}。重新检查时间线，看看真相如何被隐藏。` : `The final evidence points to ${solutionSuspect.name}. Revisit the timeline to see how the truth was hidden.`),
    audio: content.audio && typeof content.audio === "object" ? content.audio : {},
    solution: solutionSuspect.id,
    solutionName: solutionSuspect.name,
    suspects,
    evidence,
    timeline
  };
}

function localizedCase(caseId) {
  const script = state.scripts.find((entry) => entry.id === caseId) || fallbackScripts.find((entry) => entry.id === caseId);
  const base = caseLibrary[caseId] || (script ? buildImportedCase(script) : demoCase);
  const override = state.locale === "en" ? (caseTranslations[caseId] || {}) : (caseChineseTranslations[caseId] || {});
  const baseEvidence = new Map((base.evidence || []).map((item) => [item.id, item]));
  const evidence = override.evidence
    ? override.evidence.map((item) => ({ ...baseEvidence.get(item.id), ...item }))
    : base.evidence;
  return { ...base, ...override, id: caseId, audioAssets: state.audioAssets[caseId] || [], suspects: override.suspects || base.suspects, evidence, timeline: override.timeline || base.timeline };
}

let activeCase = demoCase;
let activeCaseLocale = state.locale;
const gameState = { phase: "briefing", discovered: new Set(), pinnedEvidence: new Set(), boardSelection: new Set(), evidenceLinks: [], selectedEvidence: null, selectedSuspect: "shen", answers: new Set(), questionCount: 0, hintsUsed: 0, votedSuspect: null, roomVotes: [], startedAt: 0, timer: null, nextAction: null, roomId: null, sessionId: null, characterKey: "player", playerUserId: null, spectator: false, isHost: false, suppressPhaseEmit: false, eventCursor: 0, roomPollTimer: null, lastEmittedPhase: null };

function syncActiveCaseLocale() {
  const caseId = activeCase?.id || state.selectedScript?.id || "moon-trial";
  if (activeCaseLocale !== state.locale || activeCase?.id !== caseId) {
    activeCase = localizedCase(caseId);
    activeCaseLocale = state.locale;
    if (!activeCase.suspects.some((entry) => entry.id === gameState.selectedSuspect)) gameState.selectedSuspect = activeCase.suspects[0]?.id;
    applyCurrentRole();
    $("#gameCaseLabel").textContent = activeCase.caseLabel || "CASE 014 / MOONLIGHT";
    $("#caseNoteText").textContent = activeCase.intro;
  }
  return activeCase;
}

function currentRoleProfile() {
  const key = gameState.characterKey || "player";
  if (key !== "player") {
    const suspect = activeCase.suspects.find((entry) => entry.id === key);
    if (suspect) return { label: `${suspect.name} · ${suspect.role}`, avatar: suspect.avatar };
  }
  return { label: activeCase.player, avatar: activeCase.playerAvatar || "assets/characters/lin-che.jpg" };
}

function applyCurrentRole() {
  const role = currentRoleProfile();
  $("#playerRole").textContent = role.label;
  $("#playerAvatarImage").src = role.avatar;
  $("#playerAvatarImage").alt = role.label;
}

function roleCopy(key) {
  const copy = {
    zh: {
      dossier: "角色剧本",
      identity: "公开身份",
      objective: "个人目标",
      clue: "你掌握的线索",
      detectiveObjective: "厘清自己的行动线，并找出真正的凶手。",
      culpritObjective: "保护自己的行动路线，不要让证据把你与真相连在一起。",
      playerClue: "你可以询问所有人，但不要急着相信第一个听起来合理的解释。"
    },
    en: {
      dossier: "Role dossier",
      identity: "Public identity",
      objective: "Personal objective",
      clue: "A clue you hold",
      detectiveObjective: "Protect your own timeline and identify the real culprit.",
      culpritObjective: "Protect your route and keep the evidence from linking you to the truth.",
      playerClue: "You may question everyone, but do not trust the first explanation that sounds reasonable."
    }
  };
  return copy[state.locale]?.[key] || copy.en[key];
}

function currentRoleDossier() {
  const key = gameState.characterKey || "player";
  const suspect = key === "player" ? null : activeCase.suspects.find((entry) => entry.id === key);
  const isCulprit = key !== "player" && key === activeCase.solution;
  return {
    name: suspect?.name || activeCase.player,
    role: suspect?.role || (state.locale === "zh" ? "调查者" : "Investigator"),
    objective: isCulprit ? roleCopy("culpritObjective") : roleCopy("detectiveObjective"),
    clue: suspect?.answers?.key || roleCopy("playerClue")
  };
}

let currentVoiceAudio = null;

function stopVoicePlayback() {
  if (currentVoiceAudio) {
    currentVoiceAudio.pause();
    currentVoiceAudio.src = "";
    currentVoiceAudio = null;
  }
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

function audioAssetFor(kind, speakerKey, sceneKey) {
  const assets = Array.isArray(activeCase?.audioAssets) ? activeCase.audioAssets : [];
  return assets.find((asset) => asset.locale === state.audioLocale && asset.kind === kind && asset.speakerKey === speakerKey && asset.sceneKey === sceneKey)
    || assets.find((asset) => asset.locale === state.audioLocale && asset.kind === kind && asset.speakerKey === speakerKey)
    || null;
}

function contentAudioClip(kind, speakerKey, sceneKey) {
  const audio = activeCase?.audio && typeof activeCase.audio === "object" ? activeCase.audio : {};
  const branch = kind === "host" ? (audio.host || audio.narrator || {}) : (audio.roles?.[speakerKey] || audio[speakerKey] || {});
  const localized = branch?.[state.audioLocale] || branch?.[state.locale] || branch;
  if (typeof localized === "string") return { text: localized };
  if (!localized || typeof localized !== "object") return null;
  const clip = localized[sceneKey] || localized.default || localized;
  return typeof clip === "string" ? { text: clip } : clip;
}

async function playVoice(kind, speakerKey, sceneKey, fallbackText) {
  stopVoicePlayback();
  const asset = audioAssetFor(kind, speakerKey, sceneKey);
  const inlineClip = contentAudioClip(kind, speakerKey, sceneKey) || {};
  const text = String(asset?.text || inlineClip.text || fallbackText || "").trim();
  const audioUrl = gameAsset(asset?.audioUrl || inlineClip.audioUrl, "");
  if (audioUrl) {
    currentVoiceAudio = new Audio(audioUrl);
    currentVoiceAudio.addEventListener("ended", () => { currentVoiceAudio = null; });
    try { await currentVoiceAudio.play(); } catch { showToast(t("audioUnavailable")); }
    return;
  }
  if (!text || !window.speechSynthesis || typeof window.SpeechSynthesisUtterance !== "function") {
    showToast(t("audioUnavailable"));
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = state.audioLocale === "zh" ? "zh-CN" : "en-US";
  utterance.rate = 0.94;
  utterance.pitch = kind === "host" ? 0.96 : 1.02;
  const voiceName = asset?.voiceName || inlineClip.voiceName;
  const voice = voiceName ? window.speechSynthesis.getVoices().find((candidate) => candidate.name === voiceName) : null;
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}

function hostNarrationText() {
  return ({
    briefing: activeCase.intro,
    evidence: `${activeCase.evidenceLead} ${activeCase.evidenceCopy}`,
    question: activeCase.questionCopy,
    vote: `${activeCase.voteLead} ${activeCase.voteCopy}`,
    result: `${activeCase.resultTitle} ${activeCase.resultText}`
  }[gameState.phase] || activeCase.intro);
}

function roleNarrationText() {
  const suspect = activeCase.suspects.find((entry) => entry.id === gameState.selectedSuspect) || activeCase.suspects[0];
  if (!suspect) return currentRoleDossier().clue;
  const answered = gameState.answers.has(suspect.id);
  return answered ? suspect.answers.time : suspect.line;
}

function renderVoiceDirector() {
  $(".voice-director-panel")?.remove();
  const suspect = activeCase.suspects.find((entry) => entry.id === gameState.selectedSuspect) || activeCase.suspects[0];
  if (!suspect) return;
  const hasRecordedHost = Boolean(audioAssetFor("host", "host", gameState.phase) || contentAudioClip("host", "host", gameState.phase));
  const hasRecordedRole = Boolean(audioAssetFor("role", suspect.id, gameState.phase) || contentAudioClip("role", suspect.id, gameState.phase));
  const fallbackLabel = hasRecordedHost || hasRecordedRole ? "" : `<small>${t("audioFallback")}</small>`;
  const panel = `<section class="voice-director-panel" aria-label="${t("audioTitle")}"><div class="voice-director-heading"><div><span class="game-kicker">${t("audioTitle")}</span>${fallbackLabel}</div><label>${t("audioLang")} <select id="voiceLocaleSelect"><option value="zh"${state.audioLocale === "zh" ? " selected" : ""}>中文</option><option value="en"${state.audioLocale === "en" ? " selected" : ""}>English</option></select></label></div><div class="voice-director-actions"><button class="ghost-button" type="button" id="playHostVoice">◉ ${t("audioHost")}</button><button class="ghost-button" type="button" id="playRoleVoice">◉ ${t("audioRole")} · ${escapeHtml(suspect.name)}</button><button class="text-button" type="button" id="stopVoice">${t("audioStop")}</button></div></section>`;
  // Keep playback controls above the case file so players can start narration
  // before scrolling through evidence, questions or the final accusation.
  $("#gameContent")?.insertAdjacentHTML("beforebegin", panel);
  $("#playHostVoice")?.addEventListener("click", () => void playVoice("host", "host", gameState.phase, hostNarrationText()));
  $("#playRoleVoice")?.addEventListener("click", () => void playVoice("role", suspect.id, gameState.phase, roleNarrationText()));
  $("#stopVoice")?.addEventListener("click", stopVoicePlayback);
  $("#voiceLocaleSelect")?.addEventListener("change", (event) => {
    state.audioLocale = event.target.value === "zh" ? "zh" : "en";
    void loadScriptAudio(activeCase.id);
    renderVoiceDirector();
  });
}

function setGameNav(phase) {
  gameState.phase = phase;
  const phases = { briefing: 1, evidence: 2, question: 3, vote: 4, result: 4 };
  $("#gameProgressFill").style.width = `${(phases[phase] / 4) * 100}%`;
  $$(".game-nav-item").forEach((item) => item.classList.toggle("active", item.dataset.gamePhase === phase));
  const labels = { briefing: t("phaseBriefing"), evidence: t("phaseEvidence"), question: t("phaseQuestion"), vote: t("phaseVote"), result: t("phaseResult") };
  $("#gamePhaseLabel").textContent = labels[phase];
  if (!gameState.suppressPhaseEmit && gameState.roomId && gameState.sessionId && gameState.lastEmittedPhase !== phase) {
    gameState.lastEmittedPhase = phase;
    void emitRoomEvent("phase_changed", { phase });
  }
}

function gameAction(content, hint, button, handler) {
  gameState.nextAction = gameState.spectator ? null : (handler || null);
  const actionHint = gameState.spectator ? `${t("roomSpectator")} · ${t("roomLobbyLive")}` : hint;
  const hintButton = gameState.phase === "evidence" && !gameState.spectator
    ? `<button class="ghost-button game-hint-button" id="gameHintAction" type="button">${t("useHint")} · ${gameState.hintsUsed}/2</button>`
    : "";
  $("#gameActionBar").innerHTML = `<div class="action-hint-wrap"><span class="action-hint">${actionHint}</span>${hintButton}</div>${!gameState.spectator && button ? `<button class="primary-button" id="gameNextAction">${button} <span>↗</span></button>` : ""}`;
  $("#gameHintAction")?.addEventListener("click", showEvidenceHint);
  renderDmPanel();
  renderVoiceDirector();
}

function renderDmPanel() {
  $(".dm-panel")?.remove();
  if (!gameState.roomId || !gameState.isHost || gameState.spectator) return;
  const phaseLabels = { briefing: t("phaseBriefing"), evidence: t("phaseEvidence"), question: t("phaseQuestion"), vote: t("phaseVote"), result: t("phaseResult") };
  const phases = ["briefing", "evidence", "question", "vote", "result"];
  const buttons = phases.filter((phase) => phase !== gameState.phase).map((phase) => `<button class="ghost-button dm-phase-button" type="button" data-dm-phase="${phase}">${t("dmAdvance", { phase: phaseLabels[phase] })} ↗</button>`).join("");
  $("#gameActionBar").insertAdjacentHTML("afterend", `<section class="dm-panel" aria-label="${t("dmTitle")}"><div class="dm-panel-heading"><div><span class="game-kicker">${t("dmTitle")}</span><strong>${t("dmCurrent")}: ${phaseLabels[gameState.phase]}</strong></div><span class="dm-panel-mark">⌘</span></div><p>${t("dmHint")}</p><div class="dm-panel-actions">${buttons}</div></section>`);
}

function advanceHostPhase(phase) {
  if (!gameState.isHost || !gameState.roomId || !gamePhasesForClient.has(phase) || phase === gameState.phase) return;
  gameState.lastEmittedPhase = phase;
  gameState.suppressPhaseEmit = true;
  gameState.phase = phase;
  renderCurrentGamePhase();
  gameState.suppressPhaseEmit = false;
  void emitRoomEvent("host_phase_changed", { phase });
  const phaseLabels = { briefing: t("phaseBriefing"), evidence: t("phaseEvidence"), question: t("phaseQuestion"), vote: t("phaseVote"), result: t("phaseResult") };
  showToast(t("dmAdvanced", { phase: phaseLabels[phase] }));
}

function stopRoomSessionSync() {
  clearInterval(gameState.roomPollTimer);
  gameState.roomPollTimer = null;
}

function roomSessionQuery() {
  const profile = currentUserProfile();
  const params = new URLSearchParams({ externalKey: profile.externalKey, displayName: profile.displayName, locale: profile.locale, since: String(gameState.eventCursor) });
  return params.toString();
}

const gamePhasesForClient = new Set(["briefing", "evidence", "question", "vote", "result"]);

function renderCurrentGamePhase() {
  syncActiveCaseLocale();
  ({ briefing: renderBriefing, evidence: renderEvidence, question: renderQuestion, vote: renderVote, result: renderResult }[gameState.phase] || renderBriefing)();
}

function applyRoomEvent(event) {
  const payload = event.payload || {};
  if ((event.type === "phase_changed" || event.type === "host_phase_changed") && gamePhasesForClient.has(payload.phase)) gameState.phase = payload.phase;
  if (event.type === "evidence_found" && payload.evidenceId) gameState.discovered.add(String(payload.evidenceId));
  if (event.type === "question_asked" && payload.answerKey && !gameState.answers.has(payload.answerKey)) {
    gameState.answers.add(payload.answerKey);
    gameState.questionCount += 1;
  }
  if (event.type === "vote_cast" && payload.suspectId && event.userId) {
    gameState.roomVotes = [...gameState.roomVotes.filter((vote) => vote.userId !== String(event.userId)), { suspectId: String(payload.suspectId), userId: String(event.userId) }];
  }
  if (event.type === "result_shown") gameState.phase = "result";
}

async function syncRoomSession() {
  if (!gameState.roomId) return;
  try {
    const response = await apiFetch(`/api/rooms/${encodeURIComponent(gameState.roomId)}/session?${roomSessionQuery()}`);
    if (!response.ok) throw new Error("room session unavailable");
    const data = await response.json();
    if (gameState.sessionId && data.session?.id !== gameState.sessionId) gameState.eventCursor = 0;
    gameState.sessionId = data.session?.id || gameState.sessionId;
    if (data.player?.characterKey) {
      gameState.characterKey = data.player.characterKey;
      applyCurrentRole();
    }
    if (data.player?.userId) gameState.playerUserId = data.player.userId;
    const remoteState = data.session?.state || {};
    if (Array.isArray(remoteState.discovered)) remoteState.discovered.forEach((id) => gameState.discovered.add(String(id)));
    if (Array.isArray(remoteState.answers)) remoteState.answers.forEach((answer) => gameState.answers.add(String(answer)));
    if (Array.isArray(remoteState.votes)) {
      gameState.roomVotes = remoteState.votes.map((vote) => ({ suspectId: String(vote.suspectId || ""), userId: vote.userId ? String(vote.userId) : null })).filter((vote) => vote.suspectId);
      if (gameState.playerUserId) {
        const ownVote = gameState.roomVotes.find((vote) => vote.userId === gameState.playerUserId);
        if (ownVote?.suspectId) gameState.votedSuspect = String(ownVote.suspectId);
      }
    }
    gameState.questionCount = Math.max(gameState.questionCount, Number(remoteState.questionCount || 0));
    for (const event of data.events || []) applyRoomEvent(event);
    gameState.eventCursor = Math.max(gameState.eventCursor, Number(data.nextSequence || 0));
    const remotePhase = data.session?.phase;
    if (remotePhase && remotePhase !== gameState.phase) gameState.phase = remotePhase;
    if (data.session && document.querySelector("#gameView.active-view")) {
      gameState.suppressPhaseEmit = true;
      renderCurrentGamePhase();
      gameState.suppressPhaseEmit = false;
    }
  } catch {
    // The local case remains playable if the room service briefly disconnects.
  }
}

async function connectRoomSession(roomId) {
  stopRoomSessionSync();
  gameState.roomId = roomId;
  gameState.sessionId = null;
  gameState.eventCursor = 0;
  gameState.lastEmittedPhase = null;
  await syncRoomSession();
  gameState.roomPollTimer = setInterval(syncRoomSession, 1800);
}

async function emitRoomEvent(type, payload = {}) {
  if (!gameState.roomId || !gameState.sessionId || gameState.spectator) return;
  try {
    const response = await apiFetch(`/api/rooms/${encodeURIComponent(gameState.roomId)}/session/events`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ user: currentUserProfile(), eventType: type, payload }) });
    if (!response.ok) return;
    const data = await response.json();
    if (data.event?.sequence) gameState.eventCursor = Math.max(gameState.eventCursor, Number(data.event.sequence));
    if (data.session?.id) gameState.sessionId = data.session.id;
    if (Array.isArray(data.session?.state?.votes)) {
      gameState.roomVotes = data.session.state.votes.map((vote) => ({ suspectId: String(vote.suspectId || ""), userId: vote.userId ? String(vote.userId) : null })).filter((vote) => vote.suspectId);
    }
    if (data.session?.phase && data.session.phase !== gameState.phase && document.querySelector("#gameView.active-view")) {
      gameState.phase = data.session.phase;
      gameState.suppressPhaseEmit = true;
      renderCurrentGamePhase();
      gameState.suppressPhaseEmit = false;
    }
  } catch {
    // Keep local play responsive while a remote event retries on the next interaction.
  }
}

function renderBriefing() {
  setGameNav("briefing");
  $("#gameEyebrow").textContent = `${t("gamePrologue")} / ${activeCase.openingStamp}`;
  $("#gameTitle").textContent = activeCase.title;
  const role = currentRoleProfile();
  const playerCopy = state.locale === "zh" ? `你是 <strong>${role.label}</strong>。今晚的在场者都知道一部分真相，却没有人知道全部。你的目标不是马上找到答案，而是先确认：谁有机会，谁有动机，谁在说一个无法被证据支持的故事。` : `You are <strong>${role.label}</strong>. Everyone here knows part of the truth, but no one knows all of it. Do not rush to an answer; first work out who had the chance, who had the motive and whose story the evidence cannot support.`;
  const dossier = currentRoleDossier();
  $("#gameContent").innerHTML = `<span class="game-kicker">${activeCase.sceneKicker}</span><div class="game-scene"><img src="${activeCase.sceneImage}" alt="${activeCase.title}" /></div><p class="game-lede">${activeCase.intro}</p><p class="game-copy">${playerCopy}</p><section class="role-dossier"><div class="role-dossier-heading"><span class="game-kicker">${roleCopy("dossier")}</span><strong>${dossier.name}</strong><small>${dossier.role}</small></div><div class="role-dossier-grid"><div><span>${roleCopy("identity")}</span><p>${dossier.role}</p></div><div><span>${roleCopy("objective")}</span><p>${dossier.objective}</p></div><div><span>${roleCopy("clue")}</span><p>${dossier.clue}</p></div></div></section><div class="scene-line"></div><div class="event-log">${activeCase.timeline.slice(0, 3).map(([time, text]) => `<div class="event-log-item"><b>${time}</b><span>${text}</span></div>`).join("")}</div>`;
  gameAction(null, t("evidenceHint"), t("startEvidence"), renderEvidence);
}

function renderDeductionBoard() {
  const pinnedItems = activeCase.evidence.filter((item) => gameState.pinnedEvidence.has(item.id));
  const connections = gameState.evidenceLinks.map((link, index) => ({ index, first: activeCase.evidence.find((item) => item.id === link[0]), second: activeCase.evidence.find((item) => item.id === link[1]) })).filter((link) => link.first && link.second);
  const boardItems = pinnedItems.length
    ? `<div class="deduction-board-items">${pinnedItems.map((item) => `<article class="deduction-board-item${gameState.boardSelection.has(item.id) ? " selected" : ""}" data-note-select="${item.id}" role="button" tabindex="0" aria-pressed="${gameState.boardSelection.has(item.id) ? "true" : "false"}"><img src="${item.image}" alt="${item.name}" /><div><strong>${item.name}</strong><small>${item.type}</small></div>${!gameState.spectator ? `<button class="text-button" type="button" data-note-unpin="${item.id}" aria-label="${t("notebookUnpin")}">×</button>` : ""}</article>`).join("")}</div>`
    : `<p class="deduction-board-empty">${t("notebookEmpty")}</p>`;
  const connectControls = !gameState.spectator && pinnedItems.length >= 2 ? `<div class="deduction-board-connect"><div><span>${t("notebookSelect")}</span><small>${t("notebookSelected", { count: gameState.boardSelection.size })}</small></div><button class="ghost-button" type="button" data-note-connect${gameState.boardSelection.size === 2 ? "" : " disabled"}>${t("notebookConnect")} ↗</button></div>` : "";
  const connectionList = connections.length
    ? `<div class="deduction-connections"><div class="deduction-connections-heading"><span>${t("notebookConnections")}</span><small>${connections.length}</small></div>${connections.map(({ index, first, second }) => `<div class="deduction-connection"><span>${first.name}</span><i>↔</i><span>${second.name}</span>${!gameState.spectator ? `<button class="text-button" type="button" data-note-unlink="${index}" aria-label="${t("notebookUnlink")}">×</button>` : ""}</div>`).join("")}</div>`
    : `<div class="deduction-connections empty"><div class="deduction-connections-heading"><span>${t("notebookConnections")}</span><small>0</small></div><p>${t("notebookNoConnections")}</p></div>`;
  return `<section class="deduction-board" aria-label="${t("notebookTitle")}"><div class="deduction-board-heading"><div><span class="game-kicker">${t("notebookTitle")}</span><strong>${t("notebookCount", { count: pinnedItems.length })}</strong></div><span class="deduction-board-mark">✦</span></div>${boardItems}${connectControls}${connectionList}</section>`;
}

function renderEvidence() {
  setGameNav("evidence");
  $("#gameEyebrow").textContent = t("gameEvidenceKicker");
  $("#gameTitle").textContent = t("gameTitleEvidence");
  const selectedEvidence = activeCase.evidence.find((entry) => entry.id === gameState.selectedEvidence);
  const evidenceModal = selectedEvidence ? `<div class="evidence-modal open" id="evidenceModal" role="dialog" aria-modal="true" aria-label="${selectedEvidence.name}"><div class="evidence-modal-card"><button class="evidence-modal-close" data-evidence-close aria-label="${t("close")}">×</button><img class="evidence-modal-image" src="${selectedEvidence.image}" alt="${selectedEvidence.name}" /><div class="evidence-modal-body"><span class="game-kicker">${t("gameEvidenceModalKicker", { count: String(gameState.discovered.size).padStart(2, "0") })}</span><h3>${selectedEvidence.name}</h3><p class="evidence-modal-type">${selectedEvidence.type}</p><p>${selectedEvidence.detail}</p><div class="evidence-modal-actions">${!gameState.spectator ? `<button class="ghost-button" data-evidence-pin>${gameState.pinnedEvidence.has(selectedEvidence.id) ? t("notebookUnpin") : t("notebookPin")}</button>` : ""}<button class="primary-button evidence-modal-done" data-evidence-close>${t("recordEvidence")} <span>↗</span></button></div></div></div></div>` : "";
  const deductionBoard = renderDeductionBoard();
  $("#gameContent").innerHTML = `<span class="game-kicker">${t("inspectEvidence")}</span><div class="game-scene game-scene-evidence"><img src="${activeCase.sceneImage}" alt="${activeCase.title}" /></div><p class="game-lede">${activeCase.evidenceLead}</p><p class="game-copy">${activeCase.evidenceCopy}</p><div class="scene-line"></div><div class="evidence-grid">${activeCase.evidence.map((item) => `<button class="evidence-card ${gameState.discovered.has(item.id) ? "discovered" : ""}" data-evidence="${item.id}"><img class="evidence-thumb" src="${item.image}" alt="${item.name}" /><strong>${item.name}</strong><small>${item.type}</small><span class="discovered-badge">${t("recorded")}</span></button>`).join("")}</div>${deductionBoard}${evidenceModal}`;
  $$(".evidence-card").forEach((card) => card.addEventListener("click", () => inspectEvidence(card.dataset.evidence)));
  $$('[data-evidence-close]').forEach((button) => button.addEventListener("click", () => { gameState.selectedEvidence = null; renderEvidence(); }));
  $("[data-evidence-pin]")?.addEventListener("click", () => toggleEvidencePin(selectedEvidence.id));
  $$('[data-note-unpin]').forEach((button) => button.addEventListener("click", () => toggleEvidencePin(button.dataset.noteUnpin)));
  $$('[data-note-select]').forEach((item) => {
    item.addEventListener("click", (event) => { if (!event.target.closest("[data-note-unpin]")) toggleEvidenceSelection(item.dataset.noteSelect); });
    item.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      toggleEvidenceSelection(item.dataset.noteSelect);
    });
  });
  $$('[data-note-connect]').forEach((button) => button.addEventListener("click", connectSelectedEvidence));
  $$('[data-note-unlink]').forEach((button) => button.addEventListener("click", () => unlinkEvidence(Number(button.dataset.noteUnlink))));
  const canContinue = gameState.discovered.size >= 3;
  gameAction(null, t("evidenceCount", { count: gameState.discovered.size }), canContinue ? t("enterQuestion") : t("continueEvidence"), canContinue ? renderQuestion : () => showToast(t("noEnoughEvidence")));
}

function inspectEvidence(id) {
  const item = activeCase.evidence.find((entry) => entry.id === id);
  if (!item) return;
  gameState.discovered.add(id);
  gameState.selectedEvidence = id;
  renderEvidence();
  void emitRoomEvent("evidence_found", { evidenceId: id });
  showToast(state.locale === "zh" ? `已记录：${item.name}` : `${item.name}: ${t("recorded")}`);
}

function toggleEvidencePin(id) {
  const item = activeCase.evidence.find((entry) => entry.id === id);
  if (!item) return;
  if (gameState.pinnedEvidence.has(id)) {
    gameState.pinnedEvidence.delete(id);
    gameState.boardSelection.delete(id);
    gameState.evidenceLinks = gameState.evidenceLinks.filter((link) => !link.includes(id));
    showToast(state.locale === "zh" ? `${item.name} 已移出推理桌` : `${item.name} removed from the board`);
  } else {
    gameState.pinnedEvidence.add(id);
    showToast(state.locale === "zh" ? `${item.name} 已加入推理桌` : `${item.name} pinned to the board`);
  }
  renderEvidence();
}

function toggleEvidenceSelection(id) {
  if (gameState.boardSelection.has(id)) gameState.boardSelection.delete(id);
  else if (gameState.boardSelection.size < 2) gameState.boardSelection.add(id);
  else {
    showToast(t("notebookSelect"));
    return;
  }
  renderEvidence();
}

function connectSelectedEvidence() {
  if (gameState.boardSelection.size !== 2) return;
  const link = [...gameState.boardSelection].sort();
  const exists = gameState.evidenceLinks.some((entry) => entry[0] === link[0] && entry[1] === link[1]);
  if (!exists) {
    gameState.evidenceLinks.push(link);
    showToast(t("notebookLinked"));
  }
  gameState.boardSelection = new Set();
  renderEvidence();
}

function unlinkEvidence(index) {
  if (!Number.isInteger(index) || !gameState.evidenceLinks[index]) return;
  gameState.evidenceLinks.splice(index, 1);
  renderEvidence();
}

function showEvidenceHint() {
  if (gameState.hintsUsed >= 2) {
    showToast(t("hintLimit"));
    return;
  }
  const hintKey = gameState.hintsUsed === 0 ? "hintFirst" : "hintSecond";
  gameState.hintsUsed += 1;
  renderEvidence();
  showToast(`${t("hintLabel")} · ${t(hintKey)}`);
}

function renderQuestion() {
  setGameNav("question");
  $("#gameEyebrow").textContent = t("gameQuestionKicker");
  $("#gameTitle").textContent = t("gameTitleQuestion");
  const suspect = activeCase.suspects.find((entry) => entry.id === gameState.selectedSuspect) || activeCase.suspects[0];
  const answered = gameState.answers.has(suspect.id);
  $("#gameContent").innerHTML = `<span class="game-kicker">${t("gameQuestionRoleplay")}</span><div class="game-scene game-scene-question"><img src="${activeCase.sceneImage}" alt="${activeCase.title}" /></div><p class="game-copy" style="margin:12px 0 20px">${activeCase.questionCopy}</p><div class="question-layout"><div class="suspect-list">${activeCase.suspects.map((entry) => `<button class="suspect-button ${entry.id === suspect.id ? "active" : ""}" data-suspect="${entry.id}"><img src="${entry.avatar}" alt="" /><span>${entry.name}<small>${entry.role}</small></span></button>`).join("")}</div><div class="dialogue-box"><div class="dialogue-person"><img src="${suspect.avatar}" alt="${suspect.name}" /><div><h3 class="dialogue-name">${suspect.name}</h3><span class="dialogue-role">${suspect.role}</span></div></div><p class="dialogue-text">${answered ? suspect.answers.time : suspect.line}</p><div class="question-options">${Object.entries({ time: t("questionTime"), motive: t("questionMotive"), key: t("questionKey") }).map(([key, label]) => `<button class="question-option ${gameState.answers.has(`${suspect.id}:${key}`) ? "used" : ""}" data-question="${key}" data-suspect="${suspect.id}">${label}</button>`).join("")}</div></div></div>`;
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
  void emitRoomEvent("question_asked", { suspectId, question, answerKey });
  const box = $(".dialogue-text");
  box.textContent = suspect.answers[question];
  showToast(t("localResponse", { name: suspect.name }));
}

function renderVote() {
  setGameNav("vote");
  $("#gameEyebrow").textContent = t("gameVoteKicker");
  $("#gameTitle").textContent = t("gameTitleVote");
  const hasVoted = Boolean(gameState.votedSuspect);
  const voteDisabled = hasVoted || gameState.spectator;
  $("#gameContent").innerHTML = `<span class="game-kicker">${t("gameVoteSubkicker")}</span><div class="game-scene game-scene-vote"><img src="${activeCase.sceneImage}" alt="${activeCase.title}" /></div><p class="game-lede">${activeCase.voteLead}</p><p class="game-copy">${activeCase.voteCopy}</p><div class="scene-line"></div><div class="vote-grid">${activeCase.suspects.map((suspect) => `<div class="vote-card${gameState.votedSuspect === suspect.id ? " selected" : ""}"><img src="${suspect.avatar}" alt="" /><strong>${suspect.name}</strong><small>${suspect.role}</small><button class="vote-button" data-vote="${suspect.id}"${voteDisabled ? " disabled" : ""}>${hasVoted ? t("voteSubmitted") : gameState.spectator ? t("roomWatch") : t("accuse")}</button></div>`).join("")}</div>`;
  $$(".vote-button").forEach((button) => button.addEventListener("click", () => castVote(button.dataset.vote)));
  gameAction(null, gameState.roomId && hasVoted ? t("voteWaiting") : t("voteHint"), null, null);
}

function castVote(id) {
  if (gameState.votedSuspect || gameState.spectator) return;
  if (gameState.roomId) {
    gameState.votedSuspect = id;
    renderVote();
    void emitRoomEvent("vote_cast", { suspectId: id });
    showToast(t("voteSubmitted"));
    return;
  }
  void emitRoomEvent("vote_cast", { suspectId: id });
  if (id !== activeCase.solution) {
    const card = document.querySelector(`[data-vote="${id}"]`).parentElement;
    card.classList.add("wrong-vote");
    showToast(t("wrong"));
    setTimeout(() => card.classList.remove("wrong-vote"), 350);
    return;
  }
  void emitRoomEvent("result_shown", { suspectId: id });
  renderResult();
}

function renderRoomVoteSummary() {
  if (!gameState.roomId) return "";
  const votes = Array.isArray(gameState.roomVotes) ? gameState.roomVotes : [];
  const counts = new Map();
  votes.forEach((vote) => counts.set(vote.suspectId, (counts.get(vote.suspectId) || 0) + 1));
  const ownVote = activeCase.suspects.find((suspect) => suspect.id === gameState.votedSuspect);
  const rows = activeCase.suspects
    .map((suspect) => ({ suspect, count: counts.get(suspect.id) || 0 }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count)
    .map(({ suspect, count }) => `<div class="room-vote-row${suspect.id === activeCase.solution ? " truth" : ""}"><span>${escapeHtml(suspect.name)}</span><strong>${t("roomVoteVotes", { count })}</strong></div>`)
    .join("");
  const yourVote = ownVote ? escapeHtml(ownVote.name) : t("roomVoteNoVotes");
  const voteResult = ownVote?.id === activeCase.solution ? t("roomVoteCorrect") : t("roomVoteWrong");
  return `<section class="room-vote-summary"><div class="room-vote-summary-head"><span class="game-kicker">${t("roomVoteTitle")}</span><strong>${t("roomVoteReveal", { name: escapeHtml(activeCase.solutionName || activeCase.solution) })}</strong></div><div class="room-vote-grid"><div><span>${t("roomVoteConsensus")}</span>${rows || `<small>${t("roomVoteNoVotes")}</small>`}</div><div><span>${t("roomVoteYourChoice")}</span><strong>${yourVote}</strong><small class="${ownVote?.id === activeCase.solution ? "correct" : "wrong"}">${voteResult}</small></div></div></section>`;
}

function recordCaseCompletion() {
  const solved = gameState.votedSuspect === activeCase.solution;
  if (gameState.spectator) return { solved: false, first: false, spectator: true };
  const completionKey = `${activeCase.id}:${gameState.roomId || "solo"}`;
  if (state.stats.completed.includes(completionKey)) return { solved, first: false, spectator: false };
  const first = state.stats.played === 0;
  state.stats = {
    ...state.stats,
    played: state.stats.played + 1,
    solved: state.stats.solved + (solved ? 1 : 0),
    clues: state.stats.clues + gameState.discovered.size,
    questions: state.stats.questions + gameState.questionCount,
    completed: [...state.stats.completed, completionKey].slice(-50)
  };
  savePlayerStats();
  void syncProgressCompletion({ completionKey, solved, scriptId: activeCase.id, roomId: gameState.roomId, clues: gameState.discovered.size, questions: gameState.questionCount });
  applyStaticLocale();
  return { solved, first, spectator: false };
}

async function syncProgressCompletion({ completionKey, solved, scriptId, roomId, clues, questions }) {
  try {
    await apiFetch("/api/progression", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        user: currentUserProfile(),
        scriptId,
        roomId,
        completionKey,
        solved,
        clues,
        questions
      })
    });
    await loadLeaderboard();
  } catch {
    // Local progression remains the source of truth when the service is offline.
  }
}

function renderResult() {
  rememberArchive(activeCase.id);
  const completion = recordCaseCompletion();
  renderLibrary();
  setGameNav("result");
  $("#gameEyebrow").textContent = `${t("gameClosedKicker")} / ${activeCase.closeStamp}`;
  $("#gameTitle").textContent = t("gameTitleResult");
  const awardText = completion.spectator ? t("resultAwardObserver") : completion.solved ? t("resultAwardSolved") : completion.first ? t("resultAwardFirst") : t("resultAward");
  $("#gameContent").innerHTML = `<div class="result-card"><div class="result-scene"><img src="${activeCase.sceneImage}" alt="${activeCase.title} ${t("sceneAlt")}" /></div><div class="result-symbol">✓</div><h2>${activeCase.resultTitle}</h2><p>${activeCase.resultText}</p>${renderRoomVoteSummary()}<section class="result-award"><span class="game-kicker">${t("resultAward")}</span><strong>${awardText}</strong><small>${t("profileLevel", { level: playerLevel() })} · ${t("statsSolved")}: ${state.stats.solved}</small></section><div class="timeline">${activeCase.timeline.map(([time, text]) => `<div class="timeline-item"><b>${time}</b><span>${text}</span></div>`).join("")}</div></div>`;
  gameAction(null, `${t("closed")} · ${activeCase.badge}`, gameState.roomId ? null : t("replay"), () => { gameState.discovered = new Set(); gameState.pinnedEvidence = new Set(); gameState.boardSelection = new Set(); gameState.evidenceLinks = []; gameState.selectedEvidence = null; gameState.answers = new Set(); gameState.questionCount = 0; gameState.hintsUsed = 0; gameState.votedSuspect = null; gameState.selectedSuspect = activeCase.suspects[0].id; renderBriefing(); });
}

function startGame(options = {}) {
  closeModal();
  stopRoomSessionSync();
  gameState.roomId = options.roomId || null;
  gameState.sessionId = null;
  gameState.spectator = options.spectator === true;
  gameState.isHost = options.host === true;
  gameState.suppressPhaseEmit = false;
  $("#gameRoomButton").hidden = !gameState.roomId;
  $("#gameRoomButton").textContent = t("roomLobbyTitle");
  gameState.playerUserId = null;
  gameState.eventCursor = 0;
  gameState.lastEmittedPhase = null;
  activeCase = localizedCase(state.selectedScript?.id || "moon-trial");
  activeCaseLocale = state.locale;
  gameState.discovered = new Set();
  gameState.pinnedEvidence = new Set();
  gameState.boardSelection = new Set();
  gameState.evidenceLinks = [];
  gameState.selectedEvidence = null;
  gameState.answers = new Set();
  gameState.questionCount = 0;
  gameState.hintsUsed = 0;
  gameState.votedSuspect = null;
  gameState.roomVotes = [];
  gameState.selectedSuspect = activeCase.suspects[0].id;
  gameState.characterKey = options.characterKey || "player";
  $("#gameCaseLabel").textContent = activeCase.caseLabel || "CASE 014 / MOONLIGHT";
  applyCurrentRole();
  $("#caseNoteText").textContent = activeCase.intro;
  gameState.startedAt = Date.now();
  setView("game");
  $("#viewLabel").textContent = t("gamePlaying");
  window.scrollTo({ top: 0, behavior: "instant" });
  renderBriefing();
  void loadScriptAudio(activeCase.id);
  clearInterval(gameState.timer);
  gameState.timer = setInterval(() => { const seconds = Math.floor((Date.now() - gameState.startedAt) / 1000); $("#gameClock").textContent = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`; }, 1000);
  if (gameState.roomId) void connectRoomSession(gameState.roomId);
}

function bindEvents() {
  $$(".nav-item").forEach((item) => item.addEventListener("click", () => setView(item.dataset.view)));
  $$('[data-locale]').forEach((button) => button.addEventListener("click", () => setLocale(button.dataset.locale)));
  $$(`[data-view-target]`).forEach((item) => item.addEventListener("click", () => setView(item.dataset.viewTarget)));
  $$(".filter-tab").forEach((tab) => tab.addEventListener("click", () => { state.activeFilter = tab.dataset.filter; $$(".filter-tab").forEach((item) => item.classList.toggle("active", item === tab)); renderScripts(); }));
  $("#scriptSearch").addEventListener("input", (event) => { state.searchQuery = event.target.value; renderScripts(); });
  $("#quickStart").addEventListener("click", () => {
    state.selectedScript = state.scripts.find((script) => script.id === "moon-trial") || state.scripts[0] || fallbackScripts[0];
    startGame();
  });
  $(".profile-chip").addEventListener("click", openProfileModal);
  $(".profile-chip").addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openProfileModal(); } });
  $(".top-avatar").addEventListener("click", openProfileModal);
  $(".icon-button").addEventListener("click", openNotifications);
  $("#createRoom").addEventListener("click", () => createRoom("moon-trial"));
  $("#quickMatchRoom").addEventListener("click", () => quickMatch("moon-trial"));
  $("#roomCodeForm").addEventListener("submit", (event) => { event.preventDefault(); void joinRoomByCode($("#roomCodeInput").value); });
  $("#leaderboardRefresh").addEventListener("click", () => void loadLeaderboard());
  $("#modalClose").addEventListener("click", closeModal);
  $("#modalBackdrop").addEventListener("click", (event) => { if (event.target.id === "modalBackdrop") closeModal(); });
  $("#modalStart").addEventListener("click", startGame);
  $("#modalMatch").addEventListener("click", () => quickMatch(state.selectedScript?.id || "moon-trial"));
  $("#modalRoom").addEventListener("click", () => createRoom(state.selectedScript?.id || "moon-trial"));
  $("#modalFavorite").addEventListener("click", () => toggleFavorite(state.selectedScript?.id || ""));
  $("#gameRoomButton").addEventListener("click", () => { if (state.activeRoom) openRoomLobby(state.activeRoom); });
  $("#exitGame").addEventListener("click", () => {
    clearInterval(gameState.timer);
    stopVoicePlayback();
    const room = state.activeRoom;
    const wasRoomGame = Boolean(gameState.roomId && room);
    stopRoomSessionSync();
    gameState.roomId = null;
    gameState.sessionId = null;
    gameState.spectator = false;
    gameState.isHost = false;
    $(".dm-panel")?.remove();
    $("#gameRoomButton").hidden = true;
    if (wasRoomGame) {
      setView("rooms");
      openRoomLobby(room);
    } else {
      setView("discover");
    }
  });
  $("#scanNow").addEventListener("click", async () => { try { await apiFetch("/api/scripts/scan", { method: "POST" }); await loadScripts(); await refreshSync(); showToast(t("scanComplete")); } catch { showToast(t("scanOffline")); } });
  $("#adminTokenForm").addEventListener("submit", (event) => { event.preventDefault(); void loadAdminQueue(); });
  $("#adminPasswordForm").addEventListener("submit", (event) => { void changeAdminPassword(event); });
  $("#adminRefreshQueue").addEventListener("click", () => void loadAdminQueue());
  $("#reviewStatusFilter").addEventListener("change", () => { if (state.adminToken) void loadAdminQueue(); });
  $("#productionStatusFilter").addEventListener("change", () => { if (state.adminToken) void loadAdminQueue(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") { closeModal(); closeProfileModal(); closeNotifications(); } });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    const roomId = typeof gameState !== "undefined" ? gameState.roomId : null;
    if (roomId) {
      void refreshActiveRoomState();
      void syncRoomSession();
    } else if (state.activeRoom) {
      void refreshActiveRoomState();
    }
  });
  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;
    if (typeof gameState !== "undefined" && gameState.roomId) {
      void refreshActiveRoomState();
      void syncRoomSession();
    }
  });
  $("#chooseFile").addEventListener("click", () => $("#fileInput").click());
  $("#fileInput").addEventListener("change", async (event) => { const file = event.target.files[0]; if (file) { try { await importFile(file); } catch (error) { showToast(error.message); } event.target.value = ""; } });
  document.addEventListener("click", (event) => {
    const actionButton = event.target.closest("#gameNextAction");
    if (actionButton && gameState.nextAction) gameState.nextAction();
    const dmButton = event.target.closest("[data-dm-phase]");
    if (dmButton) advanceHostPhase(dmButton.dataset.dmPhase);
    if (!event.target.closest("#notificationPopover") && !event.target.closest(".icon-button")) closeNotifications();
  });
  const dropzone = $("#dropzone");
  ["dragenter", "dragover"].forEach((eventName) => dropzone.addEventListener(eventName, (event) => { event.preventDefault(); dropzone.classList.add("dragging"); }));
  ["dragleave", "drop"].forEach((eventName) => dropzone.addEventListener(eventName, (event) => { event.preventDefault(); dropzone.classList.remove("dragging"); }));
  dropzone.addEventListener("drop", async (event) => { const file = event.dataTransfer.files[0]; if (file) { try { await importFile(file); } catch (error) { showToast(error.message); } } });
}

ensureNotificationCenter();
bindEvents();
applyStaticLocale();
ensureRoomLobby();
renderRooms();
renderLibrary();
loadScripts();
loadRooms();
loadLeaderboard();
if (state.adminToken) void loadAdminQueue();
detectLocale();
void handleRoomInvite();
setInterval(refreshSync, 4500);
