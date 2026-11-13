// 畫面與流程：場景、對話框、選項、面板、深夜耳語、結局
window.App = (() => {
'use strict';
const W = WORLD, $ = (s) => document.querySelector(s);
const W320 = 320, H180 = 180;
let S = null, busy = false, hover = null;

// ================================================================ 素材
const IMG = {};
const loadImg = (k, src) => new Promise((ok, ng) => { const im = new Image(); im.onload = () => { IMG[k] = im; ok(); }; im.onerror = () => ng(src); im.src = src; });
const FR = {}, FACE = {};
// 頭像：48px 小人的頭部，每個表情各畫一張（只改眉毛、眼睛、嘴巴，見 src/chars/expressions.js）
function headOf(spec) {
  const f = Sprite48.frame(spec, { breath: 0, hair: 0 });
  // 裁切範圍集中在臉上（x10～33、y6～29），表情才看得清楚
  const c = document.createElement('canvas'); c.width = 24; c.height = 24;
  c.getContext('2d').drawImage(f, 10, 6, 24, 24, 0, 0, 24, 24);
  return c;
}
function prepChars() {
  for (const id of Object.keys(CHARS)) {
    const spec = CHARS[id];
    FR[id] = Sprite48.idle(spec);
    FACE[id] = { normal: headOf(spec) };
    for (const [ex, rows] of Object.entries((window.EXPR || {})[id] || {})) {
      const body = spec.body.map(r => r.slice());
      for (const [y, ...seg] of rows) for (let i = 0; i < seg.length; i += 2)
        [...seg[i + 1]].forEach((ch, k) => { if (ch !== '.') body[y][seg[i] + k] = ch; });
      FACE[id][ex] = headOf({ ...spec, body });
    }
  }
}

// ================================================================ 場景
const cv = $('#scene'), g = cv.getContext('2d');
cv.width = W320; cv.height = H180;
const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
const ICON = {
  anger: { col: '#e02828', bub: 0, m: ['.#.#.', '##.##', '.....', '##.##', '.#.#.'] },
  sweat: { col: '#7ac0ff', bub: 0, m: ['..#..', '.###.', '#####', '#####', '.###.'] },
  '?': { col: '#3060d0', bub: 1, m: ['.###.', '....#', '..##.', '.....', '..#..'] },
  drunk: { col: '#b0203c', bub: 1, m: ['#...#', '#####', '.###.', '..#..', '.###.'] },   // 紅酒杯
};
const STATE_ICON = { 憤怒: 'anger', 恐懼: 'sweat', 狼狽: 'sweat', 心虛: 'sweat', 多疑: '?', 醉酒: 'drunk' };
// 滑鼠移到人物身上時，名牌後面列出狀態和效果
const STATE_NOTE = {
  醉酒: '🍷醉酒（防備 −2，容易說溜嘴）', 憤怒: '💢憤怒（正在氣頭上，挑撥更容易）', 心虛: '💧心虛（試探、勒索更容易）',
  多疑: '❓多疑（對你起了戒心，指令更難）', 恐懼: '💧恐懼（很慌，可能會做傻事）', 狼狽: '💧狼狽（剛剛當眾出糗）',
};
function drawIcon(name, x, y) {
  const ic = ICON[name]; if (!ic) return;
  if (ic.bub) { R(x - 1, y - 1, 11, 10, '#140c14'); R(x, y, 9, 8, '#fff'); }
  ic.m.forEach((row, j) => [...row].forEach((ch, i) => { if (ch === '#') R(x + 2 + i, y + 1 + j, 1, 1, ic.col); }));
}
function actorsHere() {
  if (!S) return [];
  return Engine.present(S).map((id, i) => ({ id, x: W.SPOTS[i % W.SPOTS.length][0], y: W.SPOTS[i % W.SPOTS.length][1] }))
    .sort((a, b) => a.y - b.y);
}
const spotsHere = () => (S ? STORY.HOTSPOTS[S.room] || [] : []);
let tick = 0;
function frame(t) {
  tick = Math.floor(t / 125);
  g.drawImage((S && IMG[S.room]) || IMG.study, 0, 0);
  if (S) for (const ch of STORY.SCENE_CHANGES[S.room] || []) {
    if (IMG[ch.alt] && ch.when(S)) { const [x, y, w, h] = ch.rect; g.drawImage(IMG[ch.alt], x, y, w, h, x, y, w, h); }
  }
  if (S) {
    const rm = W.ROOMS[S.room];
    if (rm.tint) { g.fillStyle = rm.tint; g.fillRect(0, 0, W320, H180); }
    if (S.slot === 0) { g.fillStyle = 'rgba(255,240,210,.10)'; g.fillRect(0, 0, W320, H180); }
    if (S.slot === 2) { g.fillStyle = 'rgba(10,10,40,.22)'; g.fillRect(0, 0, W320, H180); }
    // 物件
    for (const h of spotsHere()) {
      const p = (Math.sin(t / 300 + h.x) + 1) / 2, hot = hover && hover.h === h;
      const c = hot ? '#fff6c0' : `rgba(255,220,120,${0.55 + p * 0.45})`;
      R(h.x, h.y - 3, 1, 7, c); R(h.x - 3, h.y, 7, 1, c); R(h.x - 1, h.y - 1, 3, 3, c);
    }
    // 人物
    for (const a of actorsHere()) {
      const sp = CHARS[a.id], f = FR[a.id][(tick + a.x) % 16];
      g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(a.x - 8, a.y, 16, 2);
      g.drawImage(f, a.x - sp.gx, a.y - sp.gy);
      if (hover && hover.id === a.id) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = .2; g.drawImage(f, a.x - sp.gx, a.y - sp.gy); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
      const st = S.chars[a.id].states.find(s => STATE_ICON[s]);
      if (st) drawIcon(STATE_ICON[st], a.x - 5, a.y - 62 + Math.round(Math.sin(t / 250) * 1.2));
    }
  }
  requestAnimationFrame(frame);
}
function pick(e) {
  const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * W320, y = (e.clientY - r.top) / r.height * H180;
  for (const h of spotsHere()) if (Math.abs(x - h.x) < 9 && Math.abs(y - h.y) < 9) return { h };
  const a = actorsHere().reverse().find(a => x > a.x - 11 && x < a.x + 11 && y > a.y - 50 && y < a.y + 2);
  return a ? { id: a.id, a } : null;
}
const tip = $('#tip');
cv.addEventListener('mousemove', (e) => {
  hover = busy || !S ? null : pick(e);
  cv.style.cursor = hover ? 'pointer' : 'default';
  if (!hover) { tip.style.display = 'none'; return; }
  const notes = hover.id ? S.chars[hover.id].states.map(st => STATE_NOTE[st]).filter(Boolean) : [];
  const [tx, ty, txt] = hover.h ? [hover.h.x, hover.h.y - 8, '✦ ' + hover.h.name] : [hover.a.x, hover.a.y - 64, [W.CHARS[hover.id].full, ...notes].join('　')];
  tip.style.display = 'block'; tip.textContent = txt; tip.style.left = tx / W320 * 100 + '%'; tip.style.top = ty / H180 * 100 + '%';
});
cv.addEventListener('click', (e) => {
  if (busy || !S) return;
  const p = pick(e); if (!p) return;
  hover = null; tip.style.display = 'none';
  if (p.h) inspect(p.h); else talk(p.id);
});

// ================================================================ 對話框（Promise 版）
const box = $('#box'), nameEl = $('#name'), textEl = $('#text'), more = $('#more'), pcan = $('#pcan'), pctx = pcan.getContext('2d');
const PBG = { uncle: '#a9b6cc', ergu: '#d8a8b4', junjie: '#e8c88a', qianqian: '#d4c0e8', qiu: '#c4c0cc', kui: '#f0b4b0' };
let queue = [], typing = null, full = '', onDone = null, choosing = false;
function show(l) {
  box.style.display = 'block'; choosing = false;
  const port = l.who && FACE[l.who];
  box.classList.toggle('noport', !port);
  box.classList.toggle('narr', !l.who);
  box.classList.toggle('sys', !!l.sys);
  box.classList.toggle('insight', !!l.insight);
  box.classList.toggle('me', l.who === 'me');
  nameEl.style.display = l.who ? 'block' : 'none';
  if (l.who) nameEl.textContent = l.who === 'lawyer' ? '陳律師' : l.who === 'me' ? '你' : W.CHARS[l.who].name;
  if (port) {
    const face = FACE[l.who][window.exprFor ? exprFor(S, l) : 'normal'] || FACE[l.who].normal;
    pcan.parentElement.style.background = PBG[l.who]; pctx.clearRect(0, 0, 24, 24); pctx.drawImage(face, 0, 0);
  }
  full = l.t; let i = 0; textEl.textContent = ''; more.style.display = 'none';
  clearInterval(typing);
  typing = setInterval(() => { textEl.textContent = full.slice(0, ++i); if (i >= full.length) finishType(); }, 24);
}
function finishType() { clearInterval(typing); typing = null; textEl.textContent = full; more.style.display = 'block'; }
function nextLine() {
  if (!queue.length) { const d = onDone; onDone = null; d && d(); return; }
  show(queue.shift());
}
function say(lines) {
  return new Promise(res => { if (!lines || !lines.length) return res(); queue = lines.slice(); onDone = res; nextLine(); });
}
const close = () => { box.style.display = 'none'; };
// options: [{ label, sub, disabled, value }]
function choose(options, header) {
  return new Promise(res => {
    box.style.display = 'block'; choosing = true; more.style.display = 'none';
    clearInterval(typing); typing = null;
    if (header) { box.classList.add('noport', 'narr'); box.classList.remove('sys'); nameEl.style.display = 'none'; }
    textEl.innerHTML = header ? `<div class="qhead">${header}</div>` : '';
    const anyTip = options.some(o => o.tip);
    const tipbar = document.createElement('div'); tipbar.className = 'tipbar';
    const idle = '（滑鼠移到選項上看說明）';
    if (anyTip) { tipbar.textContent = idle; textEl.appendChild(tipbar); }
    const wrap = document.createElement('div'); wrap.className = 'choices';
    options.forEach(o => {
      const b = document.createElement('button');
      b.innerHTML = o.label + (o.sub ? `<small>${o.sub}</small>` : '');
      if (o.tip) { b.onmouseenter = () => { tipbar.textContent = o.tip; tipbar.classList.add('on'); }; b.onmouseleave = () => { tipbar.textContent = idle; tipbar.classList.remove('on'); }; }
      if (o.disabled) b.disabled = true;
      b.onclick = (ev) => { ev.stopPropagation(); choosing = false; res(o.value); };
      wrap.appendChild(b);
    });
    textEl.appendChild(wrap);
  });
}
const advance = () => { if (choosing) return; if (typing) finishType(); else nextLine(); };
box.addEventListener('click', advance);

// ---------------------------------------------------------------- 快轉（按住 Ctrl）、Space / Enter 翻頁
// 快轉只跳過對話，遇到選項會停下來；輪盤會轉得很快並自動按「繼續」
let skipping = false;
const skipBadge = document.createElement('div'); skipBadge.id = 'skipBadge'; skipBadge.textContent = '⏩ 快轉中';
document.getElementById('stage').appendChild(skipBadge);
const setSkip = (v) => { skipping = v; skipBadge.classList.toggle('on', v); };
addEventListener('keydown', (e) => {
  if (e.key === 'Control') setSkip(true);
  if ((e.key === ' ' || e.key === 'Enter') && onDone && box.style.display === 'block') { e.preventDefault(); advance(); }
});
addEventListener('keyup', (e) => { if (e.key === 'Control') setSkip(false); });
addEventListener('blur', () => setSkip(false));
setInterval(() => { if (skipping && onDone && !choosing) { if (typing) finishType(); nextLine(); } }, 60);
Wheel.setSkip(() => skipping);

// ================================================================ HUD 與面板
function hud() {
  $('#hDay').textContent = `第 ${S.day} 天`;
  $('#hSlot').innerHTML = W.SLOTS.map((s, i) => `<span class="${i === S.slot ? 'on' : i < S.slot ? 'past' : ''}">${i === S.slot ? '●' : ''}${s}</span>`).join('');
  $('#hRoom').textContent = '📍 ' + W.ROOMS[S.room].name;
  $('#hMoney').textContent = `💰 ${Engine.fmt(S.money)} 萬`;
  const badge = $('#phoneBadge'); badge.textContent = S.unread > 99 ? '99+' : S.unread; badge.style.display = S.unread ? 'block' : 'none';
}
const toastEl = $('#toast'); let toastT;
function toast(s) { toastEl.textContent = s; toastEl.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('show'), 2200); }
function openPanel(id, html) { const p = $('#' + id); p.querySelector('.body').innerHTML = html; p.style.display = 'block'; }
document.querySelectorAll('[data-close]').forEach(b => b.onclick = () => b.closest('.panel').style.display = 'none');

$('#btnMap').onclick = () => {
  if (busy) return;
  const informed = S.chars.kui.bond >= 1 && S.chars.kui.motive !== '察覺被利用';
  const html = `<div class="mapgrid">` + W.ROOM_ORDER.map(rid => {
    const known = rid === S.room || informed;
    const who = Engine.present(S, rid);
    const chips = !known ? '<span class="chip unk">？</span>' : who.length ? who.map(id => `<span class="chip">${W.CHARS[id].name}</span>`).join('') : '<span class="chip unk">沒人</span>';
    return `<div class="room ${rid === S.room ? 'here' : ''}" data-room="${rid}" style="grid-area:${rid}"><h3>${W.ROOMS[rid].name}</h3>${chips}</div>`;
  }).join('') + `</div><div class="hint">${informed ? '小葵會告訴你大家在哪裡。' : '只看得到自己所在房間的人。（和小葵熟一點，她會告訴你）'}　移動不花時間。</div>`;
  openPanel('mapPanel', html);
  document.querySelectorAll('.room').forEach(el => el.onclick = () => {
    S.room = el.dataset.room; $('#mapPanel').style.display = 'none'; hud(); toast('移動到 ' + W.ROOMS[S.room].name); saveGame();
    maybeInterlude(0.45);
  });
};
$('#btnCards').onclick = () => {
  const cards = Object.entries(S.cards).sort((a, b) => b[1] - a[1]).map(([sid, lv]) => {
    const sc = W.SECRETS[sid];
    return `<div class="card lv${lv}"><span class="lv">【${W.LEVEL[lv]}】</span><b>${W.CHARS[sc.who].name}</b>　${sc.title}</div>`;
  }).join('') || '<div class="empty">還沒有任何把柄。去找人套話，或調查房間裡的東西。</div>';
  openPanel('cardPanel', `${cards}<div class="hint">傳聞：只能拿來挑撥　線索：可以告發　實證：可以告發、勒索、在宣讀時公開<br>拿到的東西在 🎒 道具。</div>`);
};
$('#btnGoal').onclick = () => {
  const html = STORY.goals(S).map(g => `<div class="goal ${g.late ? 'late' : ''}"><h3>${g.title}${g.late ? '<em>（……也許已經太遲了）</em>' : ''}</h3><p>${g.desc}</p>${g.steps.map(t => `<div class="gstep">${t}</div>`).join('')}</div>`).join('')
    + '<div class="hint">和大家熟一點、找到更多證據，也許會發現別的可能。</div>';
  openPanel('goalPanel', html);
};
$('#btnItems').onclick = () => {
  const own = Object.keys(W.ITEM_INFO).filter(k => S.items[k]);
  const card = (icon, name, use, tag) => `<div class="icard"><div class="iicon">${icon}</div><div><b>${name}</b>${tag}<p>${use}</p></div></div>`;
  const active = own.filter(k => W.ITEM_INFO[k].active), passive = own.filter(k => !W.ITEM_INFO[k].active);
  // 你發現、但還沒用的機關
  const tricks = [];
  if (S.flags.sawPeacock && !S.flags.peacockReleased) tricks.push(card('🦚', '車庫的孔雀', '到車庫點籠子【動手】放出去（不花時間，一局一次）：這個時段所有人都會跑去靈堂抓孔雀，其他房間會空出來。代價是小叔偷養孔雀的事曝光。', '<em class="ion">機關</em>'));
  if (S.flags.sawLiquor && !S.items.liquor && S.flags.liquorDay !== S.day) tricks.push(card('🍶', '廚房的高粱酒', '到廚房點櫥櫃拿一瓶（不花時間，每天一瓶）。', '<em class="ion">機關</em>'));
  const html = (active.length ? '<h4>可以主動使用</h4>' + active.map(k => card(W.ITEM_INFO[k].icon, W.ITEMS[k], W.ITEM_INFO[k].use, '<em class="ion">主動</em>')).join('') : '')
    + (tricks.length ? '<h4>你發現的機關</h4>' + tricks.join('') : '')
    + (passive.length ? '<h4>拿到就會生效</h4>' + passive.map(k => card(W.ITEM_INFO[k].icon, W.ITEMS[k], W.ITEM_INFO[k].use, '')).join('') : '')
    || '<div class="empty">還沒有任何道具。房間裡有 ✦ 的地方都可以調查看看。</div>';
  openPanel('itemPanel', html);
};
$('#btnStatus').onclick = () => {
  const st = Object.entries(W.STATS).map(([k, n]) => `<div class="stat"><span>${n}</span><b>${'●'.repeat(S.stats[k])}${'○'.repeat(5 - S.stats[k])}</b></div>`).join('');
  const sus = Math.min(S.exposure, 4);
  const rel = Object.keys(W.CHARS).map(id => {
    const c = S.chars[id];
    const tag = c.hostile >= 3 ? '<em class="bad">敵視你</em>' : c.hostile >= 1 ? '<em class="meh">有戒心</em>' : '';
    return `<div class="rel"><b>${W.CHARS[id].name}</b><span>${W.BOND[c.bond]}</span>${tag}<i>${c.states.join('・')}</i></div>`;
  }).join('');
  openPanel('statusPanel', `<div class="stats">${st}</div>
    <div class="stat"><span>可疑度</span><b class="sus">${'●'.repeat(sus)}${'○'.repeat(4 - sus)}</b></div>
    <div class="stat"><span>上香重轉</span><b>${S.rerolls ? '可用' : '—'}</b></div>
    <h4>人際關係</h4>${rel}<div class="hint">可疑度滿了，或被兩個人以上敵視，宣讀遺囑那天就會翻車。</div>`);
};

// ================================================================ 家族群組（手機）
const GROUP_NAME = '萬家相親相愛一家人';
const MEMBERS = ['uncle', 'ergu', 'junjie', 'qianqian', 'qiu'];
const SLOT_HOUR = [7, 12, 20];   // 早、午、晚的起始時間；同一個時段內，訊息時間只會往後走
const avatar = (id) => (FACE[id] ? FACE[id].normal.toDataURL() : '');
const esc = (t) => t.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
function openPhone() {
  if (busy && !S) return;
  const members = MEMBERS.filter(id => !S.chars[id].gone).length + 1;
  let last = '', html = '', lastSlot = '', mins = 0;
  S.group.forEach((m, i) => {
    const day = `第 ${m.day} 天`;
    if (day !== last) { html += `<div class="pday">${day}</div>`; last = day; }
    const sk = m.day + ':' + m.slot;
    if (sk !== lastSlot) { mins = SLOT_HOUR[m.slot] * 60 + (i * 13) % 40; lastSlot = sk; } else mins += 1 + (i * 7) % 6;
    const hh = String(Math.floor(mins / 60) % 24).padStart(2, '0'), mm = String(mins % 60).padStart(2, '0');
    if (m.who === 'sys') { html += `<div class="psys">${esc(m.t)}</div>`; return; }
    if (m.who === 'me') {
      const cls = m.kind === 'sticker' ? 'pbub mine sticker' : 'pbub mine';
      html += `<div class="pmsg me"><div class="prow"><span class="ptime">${hh}:${mm}</span><div class="${cls}">${esc(m.t).replace(/\n/g, '<br>')}</div></div></div>`;
      return;
    }
    const name = W.CHARS[m.who].name;
    const body = m.kind === 'recall' ? `<div class="pbub recall" title="${esc(m.t)}">${name}已收回訊息</div>`
      : m.kind === 'sticker' ? `<div class="pbub sticker">${esc(m.t).replace(/\n/g, '<br>')}</div>`
      : m.kind === 'media' ? `<div class="pbub media">▶ ${esc(m.t)}</div>`
      : `<div class="pbub">${esc(m.t)}</div>`;
    html += `<div class="pmsg"><img class="pav" src="${avatar(m.who)}" style="background:${PBG[m.who]}"><div><div class="pname">${name}</div><div class="prow">${body}<span class="ptime">${hh}:${mm}</span></div></div></div>`;
  });
  $('#phone').innerHTML = `<div class="pframe"><div class="phead"><span>${GROUP_NAME}（${members}）</span><button id="pclose">✕</button></div>
    <div class="plist">${html || '<div class="psys">還沒有訊息</div>'}</div>
    <div class="pfoot">${phoneFoot()}</div></div>`;
  $('#phone').style.display = 'flex';
  const list = $('#phone .plist'); list.scrollTop = list.scrollHeight;
  $('#pclose').onclick = () => { $('#phone').style.display = 'none'; };
  $('#phone').querySelectorAll('[data-reply]').forEach(b => b.onclick = async () => {
    const r = Engine.groupReplies(S, S.todayGroup)[+b.dataset.reply];
    S.flags['posted' + S.day] = true;
    const note = Engine.groupSend(S, r);
    openPhone();
    if (note) toast('📱 ' + note);
    saveGame();
  });
  S.unread = 0; hud();
}
// 手機下方：今天能說的話（一天一句）
function phoneFoot() {
  if (S.flags['posted' + S.day]) return '（今天已經在群組裡說過話了）';
  const list = Engine.groupReplies(S, S.todayGroup);
  if (!list.length) return '（今天群組裡沒什麼好回的）';
  return '<div class="preplies">' + list.map((r, k) => {
    const ok = !r.stat || S.stats[r.stat] >= r.min, sn = r.stat ? W.STATS[r.stat] : '';
    return `<button data-reply="${k}" ${ok ? '' : 'disabled'} title="${ok ? '' : '需要' + sn + ' ' + r.min}">${r.stat ? '【' + sn + '】' : ''}${esc(r.label)}</button>`;
  }).join('') + '</div><div class="phint">一天只能說一句</div>';
}
$('#btnPhone').onclick = () => { if (S) openPhone(); };

// ================================================================ 跨局紀錄（結局圖鑑用）
const META_KEY = 'tlwc_meta';
function loadMeta() {
  let m = null;
  try { m = JSON.parse(localStorage.getItem(META_KEY) || 'null'); } catch (e) {}
  m = m || { endings: {}, bonds: {}, flags: {} };
  // 舊版只記錄看過哪些結局
  try { (JSON.parse(localStorage.getItem('tlwc_endings') || '[]')).forEach(id => { m.endings[id] = m.endings[id] || { count: 1, subs: [] }; }); } catch (e) {}
  return m;
}
function saveMeta(m) { try { localStorage.setItem(META_KEY, JSON.stringify(m)); } catch (e) {} }
function recordRun(id) {
  const m = loadMeta(), E = STORY.ENDINGS[id];
  const rec = m.endings[id] = m.endings[id] || { count: 0, subs: [] };
  rec.count++;
  const sub = E.sub ? E.sub(S) : '';
  if (sub && !rec.subs.includes(sub)) rec.subs.push(sub);
  for (const cid of Object.keys(S.chars)) m.bonds[cid] = Math.max(m.bonds[cid] || 0, S.chars[cid].bond);
  if (S.flags.grandmaKnown) m.flags.grandmaKnown = true;
  if (S.flags.puddingClue) m.flags.puddingClue = true;
  saveMeta(m);
  return m;
}

// ================================================================ 結局圖鑑
function openGallery(tab = 'endings') {
  const m = loadMeta(), G = STORY.GALLERY;
  const seenN = G.filter(g => m.endings[g.id]).length;
  let body;
  if (tab === 'endings') {
    body = `<div class="gprog">已看過 ${seenN} / ${G.length} 種結局</div><div class="glist">` + G.map(g => {
      const r = m.endings[g.id];
      if (!r) return `<div class="gcard locked"><h4>？？？</h4><p>💡 ${g.hint}</p></div>`;
      return `<div class="gcard"><h4>${STORY.ENDINGS[g.id].title}<em>×${r.count}</em></h4><p>${g.blurb}</p>${r.subs.length ? `<div class="gsubs">${r.subs.map(x => `<span>${x}</span>`).join('')}</div>` : ''}</div>`;
    }).join('') + '</div>';
  } else {
    body = '<div class="gchars">' + Object.keys(W.CHARS).map(id => {
      const b = m.bonds[id] || 0, B = STORY.BONDS[id];
      const stage = (k) => (b >= k ? (B[k] || []).map(l => `<div class="gline">${esc(l.t)}</div>`).join('') : `<div class="gline locked">？？？（${W.BOND[k]}）</div>`);
      const extra = (id === 'qiu' && m.flags.puddingClue ? '<div class="gline">「你跟你爸一模一樣。」——布丁</div>' : '')
        + (id === 'qiu' && m.flags.grandmaKnown ? '<div class="gline gold">她是你的親奶奶。</div>' : '');
      const ends = (STORY.GALLERY_CHAR[id] || []).map(e => `<span class="${m.endings[e] ? '' : 'locked'}">${m.endings[e] ? STORY.ENDINGS[e].title : '？？？'}</span>`).join('');
      return `<div class="gchar"><div class="ghead"><img src="${FACE[id].normal.toDataURL()}" style="background:${PBG[id]}"><div><b>${W.CHARS[id].full}</b><small>最深的關係：${W.BOND[b]}</small></div></div>
        ${stage(1)}${stage(2)}${stage(3)}${extra}<div class="gsubs">${ends}</div></div>`;
    }).join('') + '</div>';
  }
  $('#gallery').innerHTML = `<div class="gbox"><div class="gtabs"><button data-tab="endings" class="${tab === 'endings' ? 'on' : ''}">結局</button><button data-tab="chars" class="${tab === 'chars' ? 'on' : ''}">人物</button><span class="spacer"></span><button id="gclose">✕</button></div><div class="gbody">${body}</div></div>`;
  $('#gallery').style.display = 'flex';
  $('#gallery').querySelectorAll('[data-tab]').forEach(b => b.onclick = () => openGallery(b.dataset.tab));
  $('#gclose').onclick = () => { $('#gallery').style.display = 'none'; };
}

// ================================================================ 自動存檔
const SAVE_KEY = 'tlwc_save';
function saveGame() { try { if (S && !S.ending) localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} }
function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} }
function loadSave() { try { const t = localStorage.getItem(SAVE_KEY); return t ? JSON.parse(t) : null; } catch (e) { return null; } }

// ================================================================ 互動：人物
const CMD_NAME = { probe: '試探', sow: '挑撥', bribe: '賄賂', expose: '告發', frame: '嫁禍', befriend: '示好', blackmail: '勒索' };
const RELATIVES = ['uncle', 'ergu', 'junjie', 'qianqian'];
const pct = (p) => Math.round(p * 100) + '%';
const oddsSub = (o) => (o.sure ? '✔ 穩贏' : `成功 ${pct(o.s)}`);

// 機率說明：「成功 74%｜道德 5、上過香 +1　vs　秋姨的心防 3」
const oddsDetail = (o) => `${o.sure ? '✔ 穩贏' : '成功 ' + pct(o.s) + (o.m > 0 ? '・出包 ' + pct(o.m) : '')}｜${[`${o.statLabel} ${o.stat}`, ...o.parts.map(p => `${p[0]} ${p[1] > 0 ? '+' : ''}${p[1]}`)].join('、')}　vs　${o.resistLabel} ${o.resist}`;
const H = STORY.CMD_HELP, NL = String.fromCharCode(10);   // 換行（說明列用 pre-line 顯示）

function talkOptions(id) {
  const T = W.CHARS[id], opts = [];
  const more = STORY.hasChat(S, id);
  opts.push({ label: '【閒聊】', sub: '不花時間', value: { c: 'chat' }, tip: H.chat });
  if (Engine.canDrink(S, id)) opts.push({ label: '【灌醉】請他喝一杯', sub: '不花時間・用掉高粱酒', value: { c: 'drink' }, tip: '他喝醉之後，這個時段內試探、挑撥、告發、嫁禍、勒索都更容易成功。先灌醉，再下指令。' });
  for (const c of ['probe', 'sow', 'expose', 'frame', 'befriend']) {
    if (c === 'expose' || c === 'frame') {
      const n = c === 'expose' ? Engine.exposeOptions(S, id).length : Engine.openCases(S, id).length;
      opts.push({ label: `【${CMD_NAME[c]}】`, sub: n ? (c === 'expose' ? '選擇要說誰的事' : `家裡有 ${n} 件事可以栽贓`) : (c === 'expose' ? '需要別人的線索或實證' : '家裡還沒出什麼事'),
        disabled: !n, value: n ? { c } : null, tip: H[c] + NL + '出包＝' + STORY.MISHAP[c] });
      continue;
    }
    const needB = c === 'sow';
    const o = needB ? null : Engine.odds(S, c, id);
    opts.push({ label: `【${CMD_NAME[c]}】`, sub: needB ? '選擇對象' : oddsSub(o), value: { c }, tip: H[c] + (o ? NL + oddsDetail(o) : '') + (o && o.m > 0 ? NL + '出包＝' + STORY.MISHAP[c] : '') });
  }
  if (T.bribe.length) T.bribe.forEach(b => {
    const o = Engine.odds(S, 'bribe', id);
    opts.splice(3, 0, { label: `【賄賂】${b.label}`, sub: S.money < b.cost ? `錢不夠（${b.cost} 萬）` : `${b.cost} 萬・${oddsSub(o)}`, disabled: S.money < b.cost, value: { c: 'bribe', opt: b.id }, tip: H.bribe + NL + oddsDetail(o) });
  });
  else opts.splice(3, 0, { label: '【賄賂】', sub: T.bribeReason, disabled: true, value: null, tip: H.bribe });
  if (T.blackmail && Engine.maxCard(S, id) >= 3) { const o = Engine.odds(S, 'blackmail', id); opts.push({ label: '【勒索】拿實證逼他', sub: oddsSub(o), value: { c: 'blackmail' }, tip: H.blackmail + NL + '可以拿到：' + T.blackmail.reward + (S.chars[id].bond >= 2 ? '　⚠ 你們已經交心，這是背叛' : '') + NL + oddsDetail(o) }); }
  if (id === 'qianqian' && !S.flags.showedQQ && !S.flags.qqDecided && S.chars.qianqian.bond >= 1 && Engine.lvl(S, 'uncle_embezzle') >= 3) {
    opts.splice(1, 0, { label: '【給她看】大伯的公款證據', sub: '不花時間', value: { c: 'showqq' }, tip: H.showqq });
  }
  if (id === 'qianqian' && S.chars.qianqian.motive === '親情vs流量' && !S.flags.qqDecided) {
    opts.splice(1, 0,
      { label: '【勸她】公開真相', sub: '花一個時段', value: { c: 'persuade', opt: 'publish' }, tip: H.persuade + NL + '→ 宣讀那天她會開直播（真相紀錄片）' },
      { label: '【勸她】保護爸爸', sub: '花一個時段', value: { c: 'persuade', opt: 'protect' }, tip: H.persuade + NL + '→ 她會把爺爺的影片交給你' });
  }
  // 屬性專屬選項：屬性不夠會變灰，告訴玩家「需要什麼」
  for (const sp of Engine.specialsFor(S, id)) {
    const ok = S.stats[sp.stat] >= sp.min, sn = W.STATS[sp.stat];
    opts.splice(opts.length, 0, { label: `【${sn}】${sp.label}`, sub: ok ? `${sn} ${sp.min} 專屬・花一個時段` : `需要${sn} ${sp.min}`,
      disabled: !ok, value: { c: 'special', sid: sp.id }, tip: sp.tip });
  }
  opts.push({ label: '離開', value: null, tip: H.leave });
  return opts;
}

async function talk(id) {
  busy = true;
  const T = W.CHARS[id];
  await say(STORY.greet(S, id));
  await handleReact();
  let v;
  // 閒聊不花時間：聊完回到選單，可以繼續聊或下指令
  for (;;) {
    v = await choose(talkOptions(id));
    if (v && v.c === 'drink') { await say(Engine.drink(S, id)); continue; }
    if (v && v.c === 'showqq') {   // 給芊芊看帳本：她會在今晚陷入掙扎
      S.flags.showedQQ = true;
      await say(STORY.SHOW_QQ);
      continue;
    }
    if (!v || v.c !== 'chat') break;
    // 閒聊：選話題（不花時間）
    const list = DIALOGUE.topics(S, id);
    const topts = list.map(t => ({ label: t.label, sub: t.fresh ? '' : '聊過了', value: t.id }));
    topts.push({ label: '隨便聊聊', sub: STORY.hasChat(S, id) ? '' : '沒什麼好聊的了', value: '_random' });
    topts.push({ label: '算了', value: null });
    const tid = await choose(topts, '要聊什麼？');
    if (tid === '_random') { await say(STORY.chat(S, id).lines); await flushMoments(); }
    else if (tid) await say(DIALOGUE.askTopic(S, id, tid));
  }
  if (v && v.c === 'expose') {
    const list = Engine.exposeOptions(S, id).map(x => {
      const o = Engine.odds(S, 'expose', id, { b: x.who, sid: x.sid });
      return { label: `${W.CHARS[x.who].name}：${W.SECRETS[x.sid].title}`, sub: `${W.LEVEL[x.lv]}・${oddsSub(o)}`, value: x, tip: oddsDetail(o) };
    });
    list.push({ label: '算了', value: null });
    const x = await choose(list, `要跟${T.name}說誰的事？`);
    v = x ? { ...v, b: x.who, sid: x.sid } : null;
  }
  if (v && v.c === 'frame') {
    const cs = Engine.openCases(S, id).map(K => ({ label: K.title, sub: K.note || '', value: K.id }));
    cs.push({ label: '算了', value: null });
    const k = await choose(cs, `要跟${T.name}說哪件事？`);
    let b = null;
    if (k) {
      const ts = Engine.caseSuspects(S, k, id).map(x => {
        const o = Engine.odds(S, 'frame', id, { b: x.b, case: k });
        return { label: W.CHARS[x.b].name, sub: oddsSub(o) + `｜${x.part[0]}`, value: x.b, tip: oddsDetail(o) };
      });
      ts.push({ label: '算了', value: null });
      b = await choose(ts, `要說「${STORY.CASES.find(K => K.id === k).title}」是誰做的？`);
    }
    v = b ? { ...v, case: k, b } : null;
  }
  if (v && v.c === 'sow') {
    const targets = RELATIVES.filter(r => r !== id && !S.chars[r].gone).map(b => {
      const o = Engine.odds(S, v.c, id, { b });
      return { label: W.CHARS[b].name, sub: oddsSub(o) + (Engine.maxCard(S, b) ? `・把柄：${W.LEVEL[Engine.maxCard(S, b)]}` : ''), value: b, tip: oddsDetail(o) };
    });
    targets.push({ label: '算了', value: null });
    const b = await choose(targets, `要讓${T.name}討厭誰？`);
    v = b ? { ...v, b } : null;
  }
  if (!v) { close(); busy = false; return; }
  if (v.c === 'special') {
    await say(Engine.special(S, v.sid).lines);
    await handleReact();
    await flushMoments();
    return afterAction();
  }
  if (v.c === 'persuade') {
    await say(Engine.persuade(S, v.opt).lines);
    await flushMoments();
    return afterAction();
  }
  const o = Engine.odds(S, v.c, id, v);
  close();
  const parts = [`${o.statLabel} ${o.stat}`, ...o.parts.map(p => `${p[0]} ${p[1] > 0 ? '+' : ''}${p[1]}`)].join('、');
  // 穩贏：不轉輪盤，直接成功
  const out = o.sure ? 's' : await Wheel.spin(o, {
    title: `【${CMD_NAME[v.c]}】${T.name}${v.b ? ' → ' + W.CHARS[v.b].name : ''}　（${parts}　vs　${o.resistLabel} ${o.resist}）`,
    canReroll: () => S.rerolls > 0, onReroll: () => { S.rerolls--; },
    mishap: STORY.MISHAP[v.c],
  });
  if (o.sure) toast(`穩贏！（${parts}　vs　${o.resistLabel} ${o.resist}）`);
  const r = Engine.resolve(S, v.c, id, v, out);
  await say(r.lines);
  await handleReact();
  await flushMoments();
  await afterAction();
}

// ================================================================ 互動：物件
async function inspect(h) {
  busy = true;
  await say(h.look(S));
  await flushMoments();
  if (h.act && h.act.can(S)) {
    const label = typeof h.act.label === 'function' ? h.act.label(S) : h.act.label;
    const who = Engine.present(S).filter(id => !(id === 'kui' && S.chars.kui.bond >= 2));
    const warn = h.act.sub ? h.act.sub(S) : h.act.free ? '不花時間' : h.act.innocent ? '花一個時段' : `花一個時段${who.length ? '・⚠ 會被' + who.map(id => W.CHARS[id].name).join('、') + '看到' : '・沒有人在'}`;
    const v = await choose([{ label: '【動手】' + label, sub: warn, value: 1 }, { label: '離開', value: 0 }]);
    if (v) {
      let pick;
      const q = h.act.ask && h.act.ask(S);
      if (q) { await say(q.lines); pick = await choose(q.options); }
      const r = Engine.doAct(S, h, pick);
      await say(r.lines);
      await flushMoments();
      if (S.ending) return ending(S.ending);
      if (r.costs) return afterAction();
    }
  }
  close(); hud(); busy = false;
}

// ================================================================ 時間推進
async function afterAction() {
  close();
  const res = Engine.endSlot(S);
  for (const sc of res.events) await say(sc);
  await flushMoments();
  if (S.ending) return ending(S.ending);
  if (res.reading) return reading();
  if (res.whispers) { await night(res.whispers, res.foresee || []); await groupPrompt(res.groupCtx || []); await flushMoments(); }
  close(); hud();
  await banner(Engine.slotLabel(S));
  if (S.unread) toast(`📱 家族群組有 ${S.unread} 則新訊息`);
  saveGame();
  busy = false;
  await maybeInterlude(0.35);
}
async function maybeInterlude(chance) {
  if (busy || !S) return;
  const lines = Engine.interlude(S, chance);
  if (!lines) return;
  busy = true; await say(lines); close(); busy = false; saveGame();
}
// 每天晚上：在家族群組說一句話（不花時間；公開的，會同時影響好幾個人）
async function groupPrompt(ctx) {
  const day = S.day - 1;   // 剛結束的那一天
  if (S.flags['posted' + day]) return;
  const list = Engine.groupReplies(S, ctx);
  if (!list.length) return;
  const i = await choose(list.map((r, k) => {
    const ok = !r.stat || S.stats[r.stat] >= r.min, sn = r.stat ? W.STATS[r.stat] : '';
    return { label: (r.stat ? `【${sn}】` : '') + r.label, sub: ok ? '' : `需要${sn} ${r.min}`, disabled: !ok, value: k };
  }), '📱 家族群組還在吵。要說點什麼嗎？');
  const r = list[i];
  S.flags['posted' + day] = true;
  const note = Engine.groupSend(S, r);
  close();
  if (r.msg) { openPhone(); await new Promise(res => { const b = $('#pclose'); const done = () => { $('#phone').style.display = 'none'; res(); }; b.onclick = done; }); }
  if (note) await say([{ sys: 1, t: '📱 ' + note }]);
}

// 關鍵時刻的回應選項：不花時間，但會改變對方的反應和後日談
async function handleReact() {
  const pr = S && S.pendingReact;
  if (!pr) return;
  S.pendingReact = null;
  const list = DIALOGUE.reactOptions(S, pr.id, pr.key);
  if (!list) return;
  const tag = await choose(list.map(o => {
    const ok = !o.stat || S.stats[o.stat] >= o.min, sn = o.stat ? W.STATS[o.stat] : '';
    return { label: (o.stat ? `【${sn}】` : '') + o.label, sub: ok ? '' : `需要${sn} ${o.min}`, disabled: !ok, value: o.tag };
  }));
  await say(DIALOGUE.applyReact(S, pr.id, pr.key, tag));
}

// 動心時刻：畫面變暗 → 內心獨白 → 「💭 新目標」
const GOAL_TITLE = STORY.GOAL_TITLE;
async function flushMoments() {
  while (S && S.moments.length) {
    const id = S.moments.shift();
    $('#stage').classList.add('moment');
    await say(STORY.MOMENTS[id].map(t => ({ t })));
    close();
    await banner('💭 新目標：' + GOAL_TITLE[id]);
    $('#stage').classList.remove('moment');
    $('#btnGoal').classList.add('ping'); setTimeout(() => $('#btnGoal').classList.remove('ping'), 2400);
  }
}
function banner(text) {
  const b = $('#banner'); b.textContent = text; b.classList.add('show');
  return new Promise(r => setTimeout(() => { b.classList.remove('show'); r(); }, skipping ? 150 : 1300));
}
async function night(list, foresee = []) {
  $('#stage').classList.add('night');
  const who = STORY.whisperer(S);
  await banner(`第 ${S.day - 1} 天・深夜`);
  const lines = [{ t: `深夜，${W.CHARS[who].name}悄悄來找你。` }];
  if (list.length) list.forEach(w => lines.push({ who, t: w }));
  else lines.push({ who, t: '今天……好像沒發生什麼特別的事。' });
  foresee.forEach(t => lines.push({ who, t }));   // 明天可能發生的事
  await say(lines);
  $('#stage').classList.remove('night');
}

// ================================================================ 宣讀遺囑與結局
async function reading() {
  S.room = 'hall'; hud();
  // 第 5 天沒有深夜耳語，當天發生的事在宣讀前補講
  if (S.log.length) {
    const who = STORY.whisperer(S);
    await say([{ t: `前往靈堂的路上，${W.CHARS[who].name}小聲跟你說了今天的事。` }, ...S.log.map(t => ({ who, t }))]);
    S.log = [];
  }
  await say(STORY.READING_INTRO);
  // 宣讀前的屬性選項（承認白包、致悼詞）——會改變可疑度與敵意，所以要在判定結局之前
  const pre = Engine.prereadOptions(S);
  if (pre.length) {
    const opts = pre.map(p => { const ok = S.stats[p.stat] >= p.min, sn = W.STATS[p.stat];
      return { label: `【${sn}】${p.label}`, sub: ok ? '' : `需要${sn} ${p.min}`, disabled: !ok, value: p.id }; });
    opts.push({ label: '什麼都不說', value: null });
    const pid = await choose(opts, '律師翻開遺囑之前——');
    if (pid) await say(Engine.preread(S, pid));
  }
  await say(STORY.camera(S));          // 芊芊的攝影機（會加可疑度，所以要在判定結局之前）
  const ro = Engine.readingOptions(S);
  let id = ro.forced;
  if (!id) id = await choose(ro.options.map(o => ({ label: o.label, value: o.id })), '律師正要開口。你要怎麼做？');
  close();
  return ending(id);
}
async function ending(id) {
  busy = true;
  await say(STORY.ENDINGS[id].lines(S));
  close();
  endingScreen(id);
}
function endingScreen(id) {
  clearSave();
  const E = STORY.ENDINGS[id];
  const meta = recordRun(id);
  const seen = Object.keys(meta.endings);
  const eps = STORY.epilogues(S, id);
  const all = Object.keys(STORY.ENDINGS);
  $('#ending').innerHTML = `<div class="ebox"><div class="etag">結局</div><h1>${E.title}</h1>${E.sub ? `<div class="esub">${E.sub(S)}</div>` : ''}
    <h3>他們後來……</h3><div class="eps">${eps.map(e => `<div class="ep ${e.who === 'me' ? 'me' : ''}"><b>${e.who === 'me' ? '你' : W.CHARS[e.who].name}</b><span>${e.t}</span></div>`).join('')}</div>
    ${(() => { const nm = STORY.nearMiss(S, id); return nm.length ? `<div class="nearmiss">${nm.map(t => `<div>💡 ${t}</div>`).join('')}</div>` : ''; })()}
    <div class="eseen">已看過的結局：${all.map(k => seen.includes(k) ? STORY.ENDINGS[k].title : '？？？').join('・')}</div>
    <div class="tbtns" style="justify-content:center"><button id="again">再玩一次</button><button id="egal">📖 圖鑑</button></div></div>`;
  $('#ending').style.display = 'flex';
  $('#again').onclick = () => location.reload();
  $('#egal').onclick = () => openGallery();
}

// ================================================================ 開場
async function newGame() {
  $('#title').style.display = 'none';
  busy = true;
  await say(STORY.INTRO);
  const stats = { moral: 1, know: 1, guile: 1, charm: 1 };
  for (const q of STORY.QUESTIONS) {
    // 已經到上限的屬性，選項變灰標示「已滿」，避免點數浪費
    const k = await choose(q.a.map(([label, key]) => ({ label, value: key, disabled: stats[key] >= 5, sub: stats[key] >= 5 ? '已滿' : '' })), q.q);
    stats[k] = Math.min(5, stats[k] + 2);
  }
  close();
  await showProfile(stats);
  S = Engine.newGame(stats);
  S.money += W.MONEY.allowance;
  $('#hud').style.display = 'flex';
  hud();
  await banner(Engine.slotLabel(S));
  await say(STORY.ARRIVE);
  Engine.unlockGoal(S, 'mystery');
  await flushMoments();
  close(); busy = false;
  toast('📱 你被拉進了家族群組');
  saveGame();
}

function showProfile(stats) {
  const p = STORY.profile(stats);
  const bars = Object.entries(W.STATS).map(([k, n]) =>
    `<div class="pstat"><span>${n}</span><b>${'●'.repeat(stats[k])}<i>${'○'.repeat(5 - stats[k])}</i></b></div>`).join('');
  const m = $('#modal');
  m.innerHTML = `<div class="mbox"><div class="etag">你是……</div><h1>${p.title}</h1><p>${p.desc}</p>
    <div class="pstats">${bars}</div><div class="proute">適合的路線：${p.route}</div>
    <div class="hint">屬性會影響每個指令的成功率。隨時可以從右上角「狀態」查看。</div>
    <button>開始守靈</button></div>`;
  m.style.display = 'flex';
  return new Promise(r => { m.querySelector('button').onclick = () => { m.style.display = 'none'; r(); }; });
}

async function boot() {
  Wheel.mount($('#stage'));
  try { await Promise.all(W.ROOM_ORDER.map(id => loadImg(id, `assets/scenes/${id}.png`))); }
  catch (src) { document.body.insertAdjacentHTML('beforeend', `<p style="position:fixed;top:8px;left:8px;color:#f88">載入失敗：${src}</p>`); return; }
  // 變化版背景：沒有也沒關係（只是畫面不會變）
  const alts = [...new Set(Object.values(STORY.SCENE_CHANGES).flat().map(x => x.alt))];
  await Promise.all(alts.map(a => loadImg(a, `assets/scenes/${a}.png`).catch(() => {})));
  prepChars();
  requestAnimationFrame(frame);
  $('#start').onclick = () => { clearSave(); newGame(); };
  $('#gal').onclick = () => openGallery();
  const saved = loadSave();
  if (saved) {
    const b = $('#continue'); b.style.display = 'inline-block';
    b.textContent = `繼續（第 ${saved.day} 天・${W.SLOTS[saved.slot]}）`;
    b.onclick = () => {
      $('#title').style.display = 'none';
      S = saved; S.pendingReact = null; S.todayGroup = S.todayGroup || []; S.group = S.group || []; S.moments = S.moments || [];
      $('#hud').style.display = 'flex'; hud();
      toast(`繼續遊戲：${Engine.slotLabel(S)}・${W.ROOMS[S.room].name}`);
    };
  }
  // 測試用：#quick 跳過開場（屬性各 3）；#talk 直接跟大伯對話；#wheel 直接轉輪盤；#map 打開地圖；#profile 看性格結果畫面
  const h = location.hash.slice(1);
  if (h === 'gallery' || h === 'gallery-chars') { $('#title').style.display = 'none'; openGallery(h === 'gallery' ? 'endings' : 'chars'); }
  if (h === 'faces') {
    $('#title').style.display = 'none';
    const exs = ['normal', 'smile', 'angry', 'shock', 'sad'];
    const html = Object.keys(FACE).map(id => `<div style="display:flex;gap:1cqw;align-items:center;margin:.6cqw 0"><b style="width:6cqw;color:#e8b84a">${W.CHARS[id].name}</b>` +
      exs.map(e => `<img src="${(FACE[id][e] || FACE[id].normal).toDataURL()}" style="width:8cqw;height:8cqw;image-rendering:pixelated;background:${PBG[id]};border:.3cqw solid #e8b84a">`).join('') + '</div>').join('');
    $('#modal').innerHTML = `<div class="mbox" style="width:60cqw"><div class="etag">普通・笑・生氣・驚訝・難過</div>${html}</div>`;
    $('#modal').style.display = 'flex';
  }
  if (h === 'endcats') {
    $('#title').style.display = 'none';
    S = Engine.newGame({ moral: 3, know: 3, guile: 3, charm: 3 });
    S.chars.kui.bond = 2; S.chars.junjie.bond = 2; S.cards.uncle_embezzle = 3; S.cards.ergu_debt = 3;
    endingScreen('cats');
  }
  if (h === 'endscreen') {
    $('#title').style.display = 'none';
    S = Engine.newGame({ moral: 3, know: 3, guile: 3, charm: 5 });
    Object.assign(S.items, { carKey: true, necklace: true }); S.flags.safeOpened = true; S.money = 32; S.day = 3; S.slot = 2;
    S.chars.junjie.gone = true; S.flags.junjieBlamed = true; S.chars.kui.motive = '信任你';
    endingScreen('escape');
  }
  if (h === 'profile') { $('#title').style.display = 'none'; showProfile({ moral: 3, know: 1, guile: 5, charm: 1 }); }
  // #room-kitchen 之類：直接看某個房間（測試背景與 ✦ 位置）
  if (h.startsWith('room-')) {
    $('#title').style.display = 'none';
    S = Engine.newGame({ moral: 3, know: 3, guile: 3, charm: 3 }); S.room = h.slice(5); S.slot = 1; Engine.locate(S);
    if (location.search.includes('changed')) Object.assign(S.flags, { safeOpened: 1, vaseHandled: 1, soldAntique: 1, peacockReleased: 1, carWrecked: 1 }), S.items.carKey = 1, S.items.liquor = 1;
    $('#hud').style.display = 'flex'; hud();
  }
  if (['quick', 'talk', 'frame', 'wheel', 'map', 'goal', 'phone', 'items'].includes(h)) {
    $('#title').style.display = 'none';
    S = Engine.newGame({ moral: 3, know: 3, guile: 3, charm: 3 }); S.money += W.MONEY.allowance;
    $('#hud').style.display = 'flex'; hud();
    if (h === 'talk') talk('uncle');
    if (h === 'frame') {   // 告發、嫁禍：案子全開，手上有把柄
      Object.assign(S.flags, { tookCondolence: 1, condolenceDay: 1, peacockReleased: 1 }); Object.assign(S.seen, { uncle_rush: 1, safe_found: 1, pudding_gone: 1 });
      Object.assign(S.cards, { ergu_antique: 3, junjie_loan: 2 }); talk('uncle');
    }
    if (h === 'map') $('#btnMap').onclick();
    if (h === 'items') { Object.assign(S.items, { liquor: 1, necklace: 1, page: 1, carKey: 1 }); S.flags.sawPeacock = 1; $('#btnItems').onclick(); }
    if (h === 'phone') { S.flags.tookCondolence = 1; S.flags.condolenceDay = 2; while (!(S.day === 4 && S.slot === 1)) Engine.endSlot(S); hud(); openPhone(); }
    if (h === 'goal') { S.chars.kui.bond = 1; S.cards.uncle_embezzle = 3; S.chars.qiu.bond = 1; $('#btnGoal').onclick(); }
    if (h === 'wheel') Wheel.spin(Engine.odds(S, 'sow', 'uncle', { b: 'junjie' }), { title: '【挑撥】大伯 → 小叔　（魅力 3　vs　大伯的城府 5）', canReroll: () => true, onReroll: () => {}, mishap: STORY.MISHAP.sow });
  }
}
boot();

return { get S() { return S; } };
})();
