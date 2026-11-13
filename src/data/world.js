// 世界資料：房間、物件、角色數值、作息、把柄、金錢
// 調整平衡只要改這個檔案；文字在 story.js，規則在 engine.js。
window.WORLD = (() => {
'use strict';

const SLOTS = ['早', '午', '晚'];
const DAYS = 5;

// 屬性
const STATS = { moral: '道德', know: '學識', guile: '城府', charm: '魅力' };

// 把柄等級
const LEVEL = ['', '傳聞', '線索', '實證'];

// ---------------------------------------------------------------- 房間
// 每個房間的背景：assets/scenes/<id>.png（由 art/study.px.js、art/rooms.px.js 輸出）
const ROOMS = {
  hall:    { name: '靈堂', tint: null },
  study:   { name: '書房', tint: null },
  kitchen: { name: '廚房', tint: null },
  living:  { name: '客廳', tint: null },
  garage:  { name: '車庫', tint: null },
};
const ROOM_ORDER = ['hall', 'study', 'kitchen', 'living', 'garage'];

// 人物在房間裡站的位置（腳底座標，320×180）
const SPOTS = [[64, 166], [124, 172], [196, 168], [258, 170], [30, 160]];

// ---------------------------------------------------------------- 角色
// befriend：示好用哪個屬性、對方的心防
// bribe：可以花錢的選項（空陣列＝錢對他沒用，reason 會顯示在選項上）
// blackmail：手上有他的「實證」時可以勒索。gain 錢、hostile 敵意、gossip 抖出別人的秘密（到第幾級）、
//            info 交換某個把柄、silence 刪掉拍到你的影片；reward 是選項上的說明
// schedule：依動機決定早／午／晚在哪個房間；'roam' 與 'conflict' 由 engine 計算
const CHARS = {
  uncle: {
    name: '大伯', full: '大伯 萬國棟',
    stats: { moral: 1, know: 3, guile: 5, charm: 2 },
    befriend: { stat: 'moral', resist: 4 },
    bribe: [], bribeReason: '小錢對他沒用',
    blackmail: { gain: 5, hostile: 3, reward: '5 萬（他會恨你，而且會報復）' },
    motive: '奪權',
    schedule: { 奪權: ['hall', 'study', 'living'], 報復: ['hall', 'living', 'study'], 急躁: ['study', 'study', 'study'] },   // 奪權：晚上在客廳陪二姑喝酒
    secrets: ['uncle_embezzle', 'uncle_record'],
  },
  ergu: {
    name: '二姑', full: '二姑 萬美鳳',
    stats: { moral: 2, know: 2, guile: 3, charm: 5 },
    befriend: { stat: 'charm', resist: 3 },
    bribe: [{ id: 'bag', label: '送她名牌包', cost: 3 }],
    blackmail: { gain: 0, hostile: 2, gossip: 2, reward: '她沒錢，但會哭著把別人的秘密抖出來' },
    motive: '撐場面',
    schedule: { 撐場面: ['living', 'hall', 'living'], 報復芊芊: ['living', 'hall', 'living'], 投靠: ['living', 'hall', 'living'] },   // 報復：下午去靈堂，等弔唁客人
    secrets: ['ergu_antique', 'ergu_debt'],
  },
  junjie: {
    name: '小叔', full: '小叔 萬俊傑',
    stats: { moral: 3, know: 1, guile: 1, charm: 4 },
    befriend: { stat: 'charm', resist: 1 },
    bribe: [{ id: 'info', label: '塞他 0.5 萬換情報', cost: 0.5 }, { id: 'lend', label: '借他 2 萬還債', cost: 2 }],
    blackmail: { gain: 0, hostile: 1, info: 'uncle_embezzle', reward: '他沒錢，但會拿大伯的秘密跟你交換' },
    motive: '找錢',
    schedule: { 找錢: ['kitchen', 'garage', 'living'], 恐懼: ['garage', 'garage', 'garage'], 跟班: ['kitchen', 'hall', 'living'] },
    secrets: ['junjie_loan', 'junjie_peacock'],
  },
  qianqian: {
    name: '芊芊', full: '堂妹 萬芊芊',
    stats: { moral: 2, know: 3, guile: 2, charm: 4 },
    befriend: { stat: 'charm', resist: 3 },
    bribe: [], bribeReason: '錢對她沒用，她要的是獨家',
    blackmail: { gain: 0, hostile: 2, silence: true, reward: '刪掉所有拍到你的影片（她的攝影機不會再抓包你）' },
    motive: '爆紅',
    schedule: { 爆紅: ['living', 'hall', 'conflict'], 得意: ['living', 'hall', 'conflict'], 親情vs流量: ['living', 'living', 'study'] },   // 早上在客廳拍「傳家寶」、下午在靈堂拍弔唁
    secrets: ['qianqian_alt'],
  },
  qiu: {
    name: '秋姨', full: '女僕長 秋姨',
    stats: { moral: 4, know: 4, guile: 4, charm: 1 },
    befriend: { stat: 'moral', resist: 3 },
    bribe: [], bribeReason: '想用錢收買秋姨？她會記住你',
    blackmail: null,
    motive: '守護名聲',
    schedule: { 守護名聲: ['kitchen', 'hall', 'kitchen'], 託付: ['kitchen', 'hall', 'kitchen'], 心灰意冷: ['kitchen', 'kitchen', 'kitchen'] },
    secrets: [],
  },
  kui: {
    name: '小葵', full: '實習女僕 小葵',
    stats: { moral: 4, know: 1, guile: 1, charm: 5 },
    befriend: { stat: 'charm', resist: 0 },
    bribe: [], bribeReason: '「我、我不能收！」',
    blackmail: null,
    motive: '保住工作',
    schedule: { 保住工作: ['hall', 'kitchen', 'roam'], 信任你: ['hall', 'kitchen', 'roam'], 察覺被利用: ['kitchen', 'kitchen', 'kitchen'], 被盯上: ['hall', 'kitchen', 'roam'] },
    secrets: [],
  },
};
// 小葵晚上到處打掃：第 1～5 天依序在這些房間
const KUI_ROAM = ['living', 'study', 'garage', 'study', 'hall'];

// ---------------------------------------------------------------- 把柄
const SECRETS = {
  uncle_embezzle: { who: 'uncle', title: '挪用集團公款', major: true },
  uncle_record:   { who: 'uncle', title: '在老爺病床前偷錄音' },
  ergu_antique:   { who: 'ergu', title: '把家裡的古董換成假貨變賣', major: true },
  ergu_debt:      { who: 'ergu', title: '整形欠了一屁股卡債' },
  junjie_loan:    { who: 'junjie', title: '欠地下錢莊一大筆錢', major: true },
  junjie_peacock: { who: 'junjie', title: '在車庫偷養一隻孔雀' },
  qianqian_alt:   { who: 'qianqian', title: '用小帳在網路上罵自己家人' },
};

// ---------------------------------------------------------------- 道具
const ITEMS = {
  page:     '帳本被撕下的那一頁',
  carKey:   '古董車的車鑰匙',
  necklace: '小葵的項鍊（保險箱鑰匙）',
  diary:    '老爺的日記',
  will2:    '第二份遺囑',
  video:    '老爺的最後一段影片',
  fakeVase: '假花瓶',
  careReceipt: '老爺的看護費收據（付款人：萬美鳳）',
  liquor: '高粱酒（可以灌醉人）',
  sabotage: '大伯搞垮小叔生意的證據',
};

// 道具的圖示與用途（🎒 道具面板、拿到時的提示都用這裡的文字）
// active：要主動使用的道具；其他的拿到就自動生效
const ITEM_INFO = {
  liquor:      { icon: '🍶', active: true, use: '和大伯、二姑、小叔、芊芊說話時，選【灌醉】（不花時間）。灌醉後這個時段內，試探、挑撥、告發、嫁禍、勒索都更容易成功。' },
  necklace:    { icon: '🔑', use: '到書房點保險箱，可以用它打開。' },
  carKey:      { icon: '🚗', use: '私奔時改成開車離開（從車庫的後門）。' },
  page:        { icon: '📄', use: '大伯挪用公款的實證。可以拿去勒索、告發、在宣讀遺囑時公開，或交給大伯保住公司。' },
  diary:       { icon: '📖', use: '記滿了每個家人的秘密（已經變成你手上的實證）。最後一頁……好像跟秋姨有關。' },
  will2:       { icon: '📜', use: '宣讀遺囑時，可以交給律師。' },
  video:       { icon: '📱', use: '宣讀遺囑時，可以放給大家看。' },
  fakeVase:    { icon: '🏺', use: '藏起來，第 4 天就不會被芊芊直播拍到。也是二姑變賣古董的實證。' },
  careReceipt: { icon: '🧾', use: '宣讀遺囑時，可以當眾說出看護費是誰付的。' },
  sabotage:    { icon: '🗂', use: '宣讀遺囑時，可以揭穿大伯搞垮小叔生意的事。' },
};
// 拿到道具時的提示：名稱＋用途
const got = (id) => `${ITEM_INFO[id].icon} 得到：${ITEMS[id]}\n→ ${ITEM_INFO[id].use}`;

// ---------------------------------------------------------------- 金錢與門檻
const MONEY = {
  start: 0,
  allowance: 1,      // 律師 D1 發的守靈津貼
  condolence: 1,     // 偷拿白包
  antique: 2,        // 偷賣真古董
  safe: 30,          // 保險箱
  escape: 10,        // 跑路費
  debt: 30,          // 主角的學貸（還清的目標）
};

// 深交階段名稱
const BOND = ['陌生', '留意', '交心', '託付'];

return { SLOTS, DAYS, STATS, LEVEL, ROOMS, ROOM_ORDER, SPOTS, CHARS, KUI_ROAM, SECRETS, ITEMS, ITEM_INFO, got, MONEY, BOND };
})();
