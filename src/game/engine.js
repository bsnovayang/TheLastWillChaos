// 遊戲規則：時間推進、機率、指令效果、深交、轉折、結局判定
// 不碰畫面；文字從 STORY 拿，數值從 WORLD 拿。
window.Engine = (() => {
'use strict';
const W = WORLD;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const IDS = Object.keys(W.CHARS);
const SURE_DIFF = 4;   // 屬性＋加成比對方抗性高出這麼多，就 100% 成功

// ================================================================ 狀態
function newGame(stats) {
  const S = {
    day: 1, slot: 0, room: 'hall', stats: { ...stats },
    money: W.MONEY.start, rerolls: 0, prayedDay: 0,
    items: {}, cards: {}, flags: {}, seen: {},
    exposure: 0,      // 你幹的壞事被看到的次數
    lies: 0,          // 說謊（嫁禍）次數，秋姨在意
    lawyer: 0,        // 律師印象
    log: [],          // 今天的耳語
    ending: null,
    goalOn: { loan: true },   // 已出現的目標（動心時刻解鎖）
    moments: [],              // 待播放的動心時刻
    group: [], unread: 0,     // 家族群組的訊息、未讀數
    todayGroup: ['welcome'],  // 今天群組裡發生過的事（決定晚上能回什麼）
    chars: {},
  };
  for (const id of IDS) S.chars[id] = {
    motive: W.CHARS[id].motive, states: [], bond: 0, hostile: 0, hate: {},
    exposed: false, disgraced: false, probed: 0, befriended: 0, loc: null,
  };
  locate(S);
  post(S, window.GROUP ? GROUP.WELCOME : []);
  return S;
}

// 家族群組：發訊息（記下第幾天、哪個時段）
function post(S, msgs) {
  for (const m of msgs || []) { S.group.push({ who: m[0], t: m[1], kind: m[2] || 'text', day: S.day, slot: S.slot }); S.unread++; }
}

const slotLabel = (S) => `第 ${S.day} 天・${W.SLOTS[S.slot]}`;
const has = (S, id, st) => S.chars[id].states.includes(st);
function addState(S, id, st) {
  const c = S.chars[id];
  if (!c.states.includes(st)) c.states.push(st);
  if (st === '狼狽') c.disgraced = true;
}
const delState = (S, id, st) => { S.chars[id].states = S.chars[id].states.filter(s => s !== st); };
const setMotive = (S, id, m) => { S.chars[id].motive = m; };

// ---------------------------------------------------------------- 位置
const slotIdx = (S) => (S.day - 1) * 3 + S.slot;
function roomOf(S, id) {
  const def = W.CHARS[id], c = S.chars[id];
  if (c.gone) return null;
  if (S.flags.peacockAt === slotIdx(S)) return 'hall';   // 孔雀大鬧靈堂：大家都去抓孔雀
  const sch = def.schedule[c.motive] || def.schedule[def.motive];
  let r = sch[S.slot];
  if (r === 'roam') r = W.KUI_ROAM[S.day - 1];
  if (r === 'conflict') {   // 芊芊晚上追著衝突跑
    const hot = IDS.find(o => o !== 'qianqian' && (has(S, o, '憤怒') || has(S, o, '狼狽')) && S.chars[o].loc);
    r = hot ? S.chars[hot].loc : 'living';
  }
  return r;
}
function locate(S) {
  for (const id of IDS) if (id !== 'qianqian') S.chars[id].loc = roomOf(S, id);
  S.chars.qianqian.loc = roomOf(S, 'qianqian');
}
const present = (S, room = S.room) => IDS.filter(id => S.chars[id].loc === room);

// ---------------------------------------------------------------- 把柄
const lvl = (S, sid) => S.cards[sid] || 0;
const maxCard = (S, who) => Math.max(0, ...W.CHARS[who].secrets.map(s => lvl(S, s)));
function raise(S, sid, to, notes) {
  if (lvl(S, sid) >= to) return false;
  S.cards[sid] = to;
  if (to >= 3) unlockGoal(S, 'revenge');
  const sc = W.SECRETS[sid];
  notes && notes.push({ sys: 1, t: `📁 把柄：${W.CHARS[sc.who].name}「${sc.title}」→【${W.LEVEL[to]}】` });
  return true;
}
// 小葵、秋姨、小叔講的八卦：挑一個你還不夠清楚的把柄
function gossip(S, from, upTo, notes) {
  const sid = Object.keys(W.SECRETS).find(s => W.SECRETS[s].who !== from && lvl(S, s) < upTo);
  if (sid) raise(S, sid, Math.min(upTo, lvl(S, sid) + 1), notes);
  return sid;
}
const proofCount = (S) => Object.keys(S.cards).filter(s => S.cards[s] >= 3).length;

// ================================================================ 機率
// 屬性＋加成 vs 抗性 → 成功／出包／失敗三塊
function odds(S, cmd, t, extra = {}) {
  const T = W.CHARS[t], P = S.stats, parts = [];
  let stat, statLabel, resist, resistLabel;
  const best = (a, b) => (P[a] >= P[b] ? a : b);
  const b = extra.b;
  switch (cmd) {
    case 'probe': {
      const k = best('know', 'guile'); stat = P[k]; statLabel = W.STATS[k];
      resist = T.stats.guile; resistLabel = `${T.name}的城府`;
      const lv = T.secrets.length ? maxCard(S, t) : 0;
      if (lv >= 2) parts.push(['手上有他的把柄', 2]); else if (lv === 1) parts.push(['聽過他的傳聞', 1]);
      if (t === 'kui') parts.push(['小葵藏不住話', 2]);
      break;
    }
    case 'sow':
      stat = P.charm; statLabel = '魅力'; resist = T.stats.guile; resistLabel = `${T.name}的城府`;
      if ((S.chars[t].hate[b] || 0) > 0) parts.push(['本來就看不順眼', 1]);
      if (has(S, t, '憤怒')) parts.push(['正在氣頭上', 2]);
      if (maxCard(S, b) >= 1) parts.push(['你說得出細節', 1]);
      break;
    case 'bribe':
      stat = P.guile; statLabel = '城府'; resist = T.stats.moral; resistLabel = `${T.name}的道德`;
      if (t === 'junjie' && S.chars.junjie.motive === '恐懼') parts.push(['急著要錢', 2]);
      if (t === 'ergu') parts.push(['她其實破產了', 1]);
      break;
    case 'expose': {   // 告發：說實話，靠學識或道德說服
      const k = best('know', 'moral'); stat = P[k]; statLabel = W.STATS[k];
      resist = T.stats.guile; resistLabel = `${T.name}的城府`;
      if (lvl(S, extra.sid) >= 3) parts.push(['拿得出實證', 3]); else parts.push(['有線索佐證', 1]);
      if ((S.chars[t].hate[b] || 0) > 0) parts.push(['本來就看不順眼', 1]);
      break;
    }
    case 'frame': {    // 嫁禍：說謊，靠城府
      stat = P.guile; statLabel = '城府'; resist = T.stats.know; resistLabel = `${T.name}的學識`;
      const sus = caseSuspects(S, extra.case, t).find(x => x.b === b);
      if (sus && sus.part[1]) parts.push(sus.part);
      const K = STORY.CASES.find(k => k.id === extra.case), w = K && K.witness && K.witness(S);
      if (w) parts.push(w);
      if ((S.chars[t].hate[b] || 0) > 0) parts.push(['本來就懷疑他', 1]);
      break;
    }
    case 'befriend': {
      const bf = T.befriend; stat = P[bf.stat]; statLabel = W.STATS[bf.stat];
      resist = bf.resist; resistLabel = `${T.name}的心防`;
      if (['投靠', '跟班'].includes(S.chars[t].motive)) parts.push(['已經站在你這邊', 2]);
      if (t === 'qiu' && S.flags.respect) parts.push(['你為老爺上過香', 1]);
      if (S.chars[t].hostile >= 2) parts.push(['對你有敵意', -2]);
      break;
    }
    case 'blackmail':
      stat = P.guile; statLabel = '城府'; resist = T.stats.guile; resistLabel = `${T.name}的城府`;
      parts.push(['手上有實證', 3]);
      break;
  }
  if (cmd !== 'befriend') {
    if (has(S, t, '醉酒')) parts.push(['他喝醉了', 2]);
    if (has(S, t, '心虛') && ['probe', 'blackmail'].includes(cmd)) parts.push(['他很心虛', 1]);
    if (has(S, t, '多疑')) parts.push(['他起了疑心', -1]);
  }
  const bonus = parts.reduce((a, p) => a + p[1], 0);
  const diff = stat + bonus - resist;
  // 優勢夠大就穩贏（不轉輪盤）；不利時保留最低 8%，讓玩家可以賭一把
  if (diff >= SURE_DIFF) return { s: 1, m: 0, f: 0, sure: true, diff, stat, statLabel, resist, resistLabel, parts };
  let s = clamp(0.5 + 0.12 * diff, 0.08, 0.92);
  let m = clamp((1 - s) * 0.35, 0.04, 0.22);
  // 示好的出包是「旁邊的人看不順眼」——沒有其他人在場，就不會出包
  if (cmd === 'befriend' && !present(S).some(id => id !== t)) { s += m; m = 0; }
  return { s, m, f: Math.max(0, 1 - s - m), sure: false, diff, stat, statLabel, resist, resistLabel, parts };
}
const roll = (o) => { const r = Math.random(); return r < o.s ? 's' : r < o.s + o.m ? 'm' : 'f'; };

// ================================================================ 指令
// 回傳 { lines }：先是角色的反應（STORY），再是系統提示
function resolve(S, cmd, t, extra, out) {
  const ch = S.chars[t], T = W.CHARS[t], notes = [];
  const ctx = { t, b: extra.b, opt: extra.opt, case: extra.case, sid: extra.sid, out, stage: 0, gainSid: null };
  const others = present(S).filter(id => id !== t);
  switch (cmd) {
    case 'probe':
      if (t === 'kui') ch.probed++;
      if (out !== 'f') {
        if (t === 'kui') ctx.gainSid = gossip(S, t, 1, notes);
        else if (t === 'qiu') ctx.gainSid = gossip(S, t, 2, notes);
        else if (t === 'uncle' && S.flags.junjieTruth && !S.items.sabotage) {
          S.items.sabotage = true; ctx.sabotage = true;
          notes.push({ sys: 1, t: W.got('sabotage') });
        }
        else {
          const sid = T.secrets.find(s => lvl(S, s) < 2);
          if (sid) { raise(S, sid, lvl(S, sid) + 1, notes); ctx.gainSid = sid; }
        }
        if (out === 'm') {
          addState(S, t, '多疑'); notes.push({ sys: 1, t: `⚠ 出包：${T.name}起了疑心。` });
          if (others.includes('qianqian')) { S.exposure++; notes.push({ sys: 1, t: '📱 芊芊把剛才的對話錄下來了。' }); }
        }
      } else { addState(S, t, '多疑'); ch.hostile++; }
      break;
    case 'sow':
      if (out === 'f') { ch.hostile++; ch.hate[ctx.b] = (ch.hate[ctx.b] || 0) + 1; notes.push({ sys: 1, t: `${T.name}開始懷疑你在挑撥，不過對${W.CHARS[ctx.b].name}的疑心也多了一點。` }); }
      else {
        ch.hate[ctx.b] = (ch.hate[ctx.b] || 0) + 2; addState(S, t, '憤怒');
        S.log.push(`${T.name}和${W.CHARS[ctx.b].name}今天吵了一架。`);
        notes.push({ sys: 1, t: `💢 ${T.name}對${W.CHARS[ctx.b].name}的敵意上升了。` });
        if (out === 'm') { ch.hostile++; notes.push({ sys: 1, t: `⚠ 出包：${T.name}看你的眼神也怪怪的。（${T.name}敵意 +1）` }); }
      }
      break;
    case 'bribe': {
      const opt = T.bribe.find(o => o.id === ctx.opt);
      if (out === 'f') { ch.hostile++; break; }
      S.money -= opt.cost;
      notes.push({ sys: 1, t: `💰 付出 ${opt.cost} 萬（剩 ${fmt(S.money)} 萬）` });
      if (opt.id === 'bag') setMotive(S, 'ergu', '投靠');
      if (opt.id === 'info') ctx.gainSid = gossip(S, 'junjie', 1, notes);
      if (opt.id === 'lend') { S.flags.lentJunjie = true; delState(S, 'junjie', '恐懼'); setMotive(S, 'junjie', '跟班'); }
      if (out === 'm') { S.chars.uncle.hostile++; S.log.push(`${T.name}到處跟人說你給了他錢，大伯聽到了。`); notes.push({ sys: 1, t: `⚠ 出包：${T.name}到處張揚你給了他錢。（大伯敵意 +1）` }); }
      break;
    }
    case 'expose': {   // 告發：說的是實話，不算說謊
      const B = W.CHARS[ctx.b].name;
      if (out === 'f') { S.exposure++; ch.hostile++; notes.push({ sys: 1, t: `${T.name}不想聽你講別人的閒話。（${T.name}敵意 +1、可疑度 +1）` }); break; }
      ch.hate[ctx.b] = (ch.hate[ctx.b] || 0) + 3;
      addState(S, ctx.b, '狼狽');
      if (lvl(S, ctx.sid) >= 3 || t === 'qianqian') { S.chars[ctx.b].exposed = true; notes.push({ sys: 1, t: `📢 ${B}「${W.SECRETS[ctx.sid].title}」的事被揭穿了。` }); }
      S.log.push(`${B}被${T.name}當眾質問「${W.SECRETS[ctx.sid].title}」的事，場面很難看。`);
      if (out === 'm') { S.exposure++; notes.push({ sys: 1, t: '⚠ 出包：有人注意到是你在背後放話。（可疑度 +1）' }); }
      break;
    }
    case 'frame': {    // 嫁禍：一定算說謊
      const K = STORY.CASES.find(k => k.id === ctx.case), B = W.CHARS[ctx.b].name;
      S.lies++;
      if (out === 'f') {
        S.exposure += 2; ch.hostile += 2; S.flags['case_' + K.id] = 'me';
        if (K.victim && K.victim !== t) S.chars[K.victim].hostile += 2;
        notes.push({ sys: 1, t: `⚠ ${T.name}不信。「${K.title}」的嫌疑，現在落到你頭上了。（可疑度 +2）` });
        break;
      }
      S.flags['case_' + K.id] = ctx.b;
      ch.hate[ctx.b] = (ch.hate[ctx.b] || 0) + 2;
      addState(S, ctx.b, '狼狽');
      if (t === 'qianqian' || t === 'kui') {   // 芊芊開直播、小葵到處講：全家都知道
        RELATIVES.filter(o => o !== ctx.b && o !== t).forEach(o => { S.chars[o].hate[ctx.b] = (S.chars[o].hate[ctx.b] || 0) + 1; });
        notes.push({ sys: 1, t: t === 'qianqian' ? '📹 芊芊開了直播，全家都知道了。' : '📢 小葵到處講，全家都知道了。' });
      }
      K.done(S, ctx.b, notes);
      notes.push({ sys: 1, t: `🕵 「${K.title}」→ 大家認定是${B}做的。` });
      if (out === 's') { if (S.exposure > 0) { S.exposure--; notes.push({ sys: 1, t: '嫌疑轉走了。（可疑度 −1）' }); } }
      else { S.exposure++; notes.push({ sys: 1, t: `⚠ 出包：${T.name}覺得你知道得太清楚了。（可疑度 +1）` }); }
      break;
    }
      break;
    case 'befriend':
      if (out !== 'f') {
        ch.befriended++;
        if (ch.bond < 3) { ch.bond++; ctx.stage = ch.bond; onBond(S, t, ch.bond, notes); }
        if (out === 'm' && others.length) { S.chars[others[0]].hostile++; notes.push({ sys: 1, t: `⚠ 出包：旁邊的${W.CHARS[others[0]].name}看你們這麼親近，對你多了一分戒心。（${W.CHARS[others[0]].name}敵意 +1）` }); }
      }
      break;
    case 'blackmail': {
      const B = T.blackmail;
      if (ch.bond >= 2) { S.flags[t + 'Betrayed'] = true; ch.bond = 0; notes.push({ sys: 1, t: `💔 你背叛了${T.name}的信任。` }); }
      if (out === 'f') { ch.hostile += 3; S.exposure++; break; }
      ch.hostile += B.hostile;
      const got = out === 'm' ? B.gain / 2 : B.gain;
      if (got) { S.money += got; notes.push({ sys: 1, t: `💰 拿到 ${got} 萬（共 ${fmt(S.money)} 萬）` }); }
      if (B.gossip) gossip(S, t, B.gossip, notes);
      if (B.info) raise(S, B.info, Math.min(3, lvl(S, B.info) + 1), notes);
      if (B.silence) { S.flags.silencedQQ = true; notes.push({ sys: 1, t: '📹 芊芊刪掉了所有拍到你的影片。' }); }
      if (t === 'uncle') setMotive(S, 'uncle', '報復');
      if (t === 'ergu') addState(S, 'ergu', '狼狽');
      if (out === 'm') { S.exposure++; notes.push({ sys: 1, t: '⚠ 出包：只拿到一半，而且有人察覺了。（可疑度 +1）' }); }
      break;
    }
  }
  const lines = STORY.cmd(cmd, S, ctx);
  return { lines: lines.concat(notes) };
}

// ---------------------------------------------------------------- 告發、嫁禍的選項
const RELATIVES = ['uncle', 'ergu', 'junjie', 'qianqian'];
// 告發：你手上有線索或實證的秘密（不能告發對方自己）
function exposeOptions(S, t) {
  return Object.keys(W.SECRETS).filter(sid => { const w = W.SECRETS[sid].who; return w !== t && !S.chars[w].gone && lvl(S, sid) >= 2; })
    .map(sid => ({ sid, who: W.SECRETS[sid].who, lv: lvl(S, sid) }));
}
// 嫁禍：這件案子可以栽給誰（不能栽給聽的人自己）
function caseSuspects(S, kid, t) {
  const K = STORY.CASES.find(k => k.id === kid);
  if (!K) return [];
  const sus = typeof K.suspects === 'function' ? K.suspects(S) : K.suspects;
  return Object.keys(sus).filter(b => b !== t && !S.chars[b].gone).map(b => ({ b, part: sus[b] }));
}
// 還沒結案、可以拿來嫁禍的案子
const openCases = (S, t) => STORY.CASES.filter(K => !S.flags['case_' + K.id] && K.open(S) && caseSuspects(S, K.id, t).length);

// 深交階段的效果
function onBond(S, t, stage, notes) {
  notes.push({ sys: 1, t: `🤝 和${W.CHARS[t].name}的關係：${W.BOND[stage]}` });
  if (t === 'kui' && stage >= 3) unlockGoal(S, 'escape');
  if ((t === 'qiu' || t === 'qianqian') && stage >= 2) unlockGoal(S, 'legal');
  if (stage < 3) return;
  if (t === 'kui') { setMotive(S, 'kui', '信任你'); S.items.necklace = true; notes.push({ sys: 1, t: W.got('necklace') }); }
  if (t === 'qiu') {
    if (S.stats.moral >= 3 && S.lies === 0) { setMotive(S, 'qiu', '託付'); S.items.will2 = true; notes.push({ sys: 1, t: W.got('will2') }); }
    else S.flags.qiuWaiting = true;
  }
  if (t === 'qianqian') { S.items.video = true; notes.push({ sys: 1, t: W.got('video') }); }
  if (t === 'uncle') { S.flags.uncleTruth = true; unlockGoal(S, 'company'); }
  if (t === 'ergu') { S.flags.erguTruth = true; unlockGoal(S, 'daughter'); }
  if (t === 'junjie') { S.flags.junjieTruth = true; unlockGoal(S, 'brothers'); }
}

// ================================================================ 屬性專屬選項
// 每個選項一局只能用一次
function specialsFor(S, id) {
  return STORY.SPECIALS.filter(sp => sp.who === id && !S.flags[sp.id] && sp.when(S));
}
function special(S, sid) {
  const sp = STORY.SPECIALS.find(x => x.id === sid), notes = [];
  S.flags[sid] = true;
  return { lines: sp.run(S, notes).concat(notes) };
}
function prereadOptions(S) { return STORY.PREREAD.filter(p => p.when(S)); }
function preread(S, pid) { return STORY.PREREAD.find(p => p.id === pid).run(S); }
// 深交 +1（屬性選項用；會觸發深交的效果）
function addBond(S, id, notes) {
  const c = S.chars[id];
  c.befriended++;
  if (c.bond < 3) {
    c.bond++; onBond(S, id, c.bond, notes); notes.push(...(STORY.BONDS[id][c.bond] || []));
    if (c.bond >= 2 && window.DIALOGUE && DIALOGUE.reactOptions(S, id, c.bond)) S.pendingReact = { id, key: c.bond };
  }
}

// ================================================================ 你在群組發言（每天晚上一次）
function groupReplies(S, ctx) {
  if (!window.GROUP) return [];
  const list = GROUP.REPLIES.filter(r => (r.on === 'any' || ctx.includes(r.on)) && (!r.when || r.when(S)));
  return list.some(r => r.on !== 'any') ? list : [];   // 今天沒什麼好回的，就不問
}
function groupSend(S, r) {
  if (r.msg) post(S, [['me', r.msg, r.kind]]);
  post(S, r.replies);
  S.unread = 0;
  return r.fx(S);
}

// ================================================================ 灌醉（用掉一瓶高粱酒，不花時間）
const DRINKERS = ['uncle', 'ergu', 'junjie', 'qianqian'];
const canDrink = (S, id) => S.items.liquor && DRINKERS.includes(id) && !has(S, id, '醉酒');
function drink(S, id) {
  S.items.liquor = false; addState(S, id, '醉酒');
  return STORY.DRINK[id].concat([{ sys: 1, t: `🍶 ${W.CHARS[id].name}喝醉了：這個時段內，試探、挑撥、告發、嫁禍、勒索他都更容易。` }]);
}

// ================================================================ 隨機小插曲（進房間時有機率發生，每段只發生一次）
function interlude(S, chance) {
  const here = present(S);
  const ok = STORY.INTERLUDES.filter(x => !S.seen['il_' + x.id] && x.room === S.room && (x.slot === undefined || x.slot === S.slot)
    && (x.need || []).every(id => here.includes(id)) && (!x.when || x.when(S)));
  if (!ok.length || Math.random() > chance) return null;
  const x = ok[Math.floor(Math.random() * ok.length)];
  S.seen['il_' + x.id] = true;
  return typeof x.lines === 'function' ? x.lines(S) : x.lines;
}

// ================================================================ 勸芊芊（親情 vs 流量）
function persuade(S, opt) {
  S.flags.qqDecided = true;
  const notes = [];
  if (opt === 'publish') { S.flags.qqPublish = true; setMotive(S, 'qianqian', '得意'); notes.push({ sys: 1, t: '📹 芊芊決定公開。宣讀遺囑那天，她會開直播。' }); }
  else { S.flags.qqProtect = true; setMotive(S, 'qianqian', '爆紅'); S.items.video = true; notes.push({ sys: 1, t: '芊芊把爺爺的影片交給你了。' }, { sys: 1, t: W.got('video') }); }
  return { lines: STORY.PERSUADE[opt].concat(notes) };
}

// ================================================================ 調查物件
// 看：免費；動手：花一個時段，有人在場會被看到
function doAct(S, h, pick) {
  const notes = [];
  const lines = h.act.run(S, notes, pick) || [];
  if (!h.act.free && !h.act.innocent) {
    const wit = present(S).filter(id => !(id === 'kui' && S.chars.kui.bond >= 2));
    if (wit.length) {
      S.exposure++;
      wit.forEach(id => S.chars[id].hostile++);
      if (wit.includes('qianqian')) S.exposure++;
      notes.push({ sys: 1, t: `👀 被${wit.map(id => W.CHARS[id].name).join('、')}看到了。` });
      S.log.push(`有人看到你在${W.ROOMS[S.room].name}鬼鬼祟祟。`);
      if (window.GROUP && !S.flags['susp' + S.day]) { S.flags['susp' + S.day] = true; post(S, GROUP.SUSPICIOUS); S.todayGroup.push('susp'); }
      if (h.act.seen) h.act.seen(S, wit);
    }
  }
  return { lines: lines.concat(notes), costs: !h.act.free };
}

// ================================================================ 時間推進
function endSlot(S) {
  const out = { events: [], whispers: null, reading: false };
  const fire = (list) => {
    for (const ev of list) {
      if (S.seen[ev.id]) continue;
      if (ev.day && (ev.day !== S.day || ev.slot !== S.slot)) continue;
      if (ev.if && !ev.if(S)) continue;
      S.seen[ev.id] = true;
      const r = ev.run(S) || {};
      if (r.whisper) S.log.push(r.whisper);
      const g = window.GROUP && GROUP.ON[ev.id];
      if (g) { post(S, typeof g === 'function' ? g(S) : g); S.todayGroup.push(ev.id); }
      // 安全網：劇情裡有台詞的角色都要真的在那個房間，否則只透過耳語傳達（不播劇情）
      const present = !r.scene || r.scene.every(l => !l.who || l.who === 'lawyer' || S.chars[l.who].loc === r.room);
      if (r.scene && present && (!r.room || r.room === S.room)) { out.events.push(r.scene); if (r.ugly) unlockGoal(S, 'revenge'); }
    }
  };
  fire(STORY.timeline);
  fire(STORY.turns);
  IDS.forEach(id => delState(S, id, '醉酒'));
  if (S.slot === 2) {
    if (S.day === W.DAYS) { out.reading = true; return out; }
    out.whispers = S.log.slice(); S.log = [];
    IDS.forEach(id => { delState(S, id, '憤怒'); delState(S, id, '多疑'); delState(S, id, '狼狽'); });
    S.day++; S.slot = 0;
    out.foresee = STORY.foreshadow(S);   // 預告「明天」可能發生的事
    out.groupCtx = S.todayGroup; S.todayGroup = [];
    if (window.GROUP && GROUP.MORNING[S.day]) { post(S, GROUP.MORNING[S.day]); S.todayGroup.push('morning'); }
    if (S.day === 3 && S.chars.kui.bond >= 1 && !S.goalOn.escape && STORY.whisperer(S) === 'kui') {
      out.foresee.unshift(...STORY.KUI_DREAM); unlockGoal(S, 'escape');
    }
  } else S.slot++;
  locate(S);
  if (S.slot === 2 && S.chars.ergu.loc === 'living') addState(S, 'ergu', '醉酒');   // 二姑每晚都在客廳喝
  return out;
}

// ================================================================ 結局
function lawyerTrust(S) {
  let v = S.lawyer;
  v += IDS.filter(id => S.chars[id].disgraced && W.CHARS[id].secrets.length).length;
  if (S.stats.moral >= 4) v++;
  if (S.flags.condolenceSeen) v -= 2;
  return v;
}
function fiasco(S) {
  return S.flags.caughtOnCamera || S.exposure >= 4 || IDS.filter(id => S.chars[id].hostile >= 3).length >= 2;
}
function endingAvail(S) {
  const c = S.chars, it = S.items, f = S.flags, a = {};
  // 第二份遺囑本身就是合法文件；只有影片需要律師對你有一點信任
  a.legal = (it.will2 && lawyerTrust(S) >= 0) || (it.video && lawyerTrust(S) >= 1);
  a.keepName = c.qiu.bond >= 3 && f.grandmaKnown && it.will2 && (it.diary || proofCount(S) >= 1);
  a.documentary = c.qianqian.bond >= 2 && f.qqPublish && proofCount(S) >= 2;
  a.saveCompany = f.uncleTruth && lvl(S, 'uncle_embezzle') >= 3;
  a.daughter = f.erguTruth && it.careReceipt;
  a.brothers = f.junjieTruth && it.sabotage;
  a.mastermind = proofCount(S) >= 3 || (S.stats.guile >= 4 && proofCount(S) >= 2);
  a.statutory = S.stats.know >= 4 && S.flags.willFlaw;   // 要先在書房研讀過遺囑副本
  // 雙人結局
  a.reconcile = a.saveCompany && a.brothers;
  a.fatherDaughter = f.qqProtect && f.uncleTruth;
  a.truth = it.will2 && it.video && c.qiu.bond >= 3 && c.qianqian.bond >= 3;
  return a;
}
const READING_LABEL = {
  truth: '把第二份遺囑和老爺的影片，一起交給律師',
  keepName: '交出第二份遺囑，然後燒掉老爺的日記',
  legal: null,   // 依手上的東西決定文字
  documentary: '和芊芊一起，當場開直播',
  fatherDaughter: '把公款的證據交給芊芊，讓她決定',
  reconcile: '同時說出公款的真相，和大伯搞鬼的事',
  saveCompany: '把公款的證據交給大伯',
  daughter: '當眾說出看護費是誰付的',
  brothers: '揭穿大伯搞垮小叔生意的事',
  mastermind: null,
};
function readingOptions(S) {
  if (fiasco(S)) return { forced: 'fiasco', options: [] };
  const a = endingAvail(S);
  // 雙人結局取代它包含的單人結局
  if (a.reconcile) { a.saveCompany = false; a.brothers = false; }
  if (a.fatherDaughter) a.saveCompany = false;
  if (a.truth) a.legal = false;
  const order = ['truth', 'keepName', 'legal', 'documentary', 'fatherDaughter', 'reconcile', 'saveCompany', 'daughter', 'brothers', 'mastermind', 'statutory'];
  const o = order.filter(id => a[id]).map(id => ({ id, label:
    id === 'legal' ? (S.items.will2 ? '把第二份遺囑交給律師' : '把老爺的影片放給大家看')
    : id === 'mastermind' ? (proofCount(S) >= 3 ? `當眾公開手上 ${proofCount(S)} 個實證` : `【城府】手上只有 ${proofCount(S)} 個實證——讓他們互相指控`)
    : id === 'statutory' ? '【學識】指出遺囑無效，主張代位繼承父親的那一份'
    : READING_LABEL[id] }));
  o.push({ id: 'cats', label: '什麼都不做，聽律師唸完' });
  return { forced: null, options: o };
}
// 小葵願意跟你走：深交到託付，或交心而且在第 4 天晚上保護過她
const kuiWilling = (S) => S.chars.kui.motive === '信任你' || (S.chars.kui.bond >= 2 && S.flags.protectedKui);
function canEscape(S) { return S.slot === 2 && kuiWilling(S); }
// 離開的方式（決定結局差分）
function escapeWay(S) {
  const car = S.items.carKey && !S.flags.carWrecked && !S.flags.carGone;
  return { car, money: S.money >= W.MONEY.escape, safe: !!S.flags.safeOpened, rich: S.money >= W.MONEY.debt, early: S.day < W.DAYS };
}

// ================================================================ 目標與動心時刻
function unlockGoal(S, id) {
  if (S.goalOn[id]) return false;
  S.goalOn[id] = true; S.moments.push(id);
  return true;
}
// 剩下幾個可以行動的時段（含現在）
const slotsLeft = (S) => (W.DAYS - S.day) * 3 + (3 - S.slot);

const fmt = (n) => (Math.round(n * 10) / 10).toString();

return {
  newGame, slotLabel, has, addState, delState, setMotive, present, locate,
  lvl, maxCard, raise, gossip, proofCount,
  post, groupReplies, groupSend, canDrink, drink, interlude, slotIdx, odds, roll, resolve, doAct, persuade, specialsFor, special, prereadOptions, preread, addBond, exposeOptions, caseSuspects, openCases, endSlot, endingAvail, readingOptions, canEscape, kuiWilling, escapeWay, unlockGoal, slotsLeft, lawyerTrust, fiasco, fmt,
};
})();
