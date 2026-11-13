// 劇情文字：開場、對白、深交、物件、事件、轉折、結局
// 一行台詞的格式：{ who: 角色id, t: '台詞' }、旁白 { t }、系統提示 { sys: 1, t }
// 寫劇情主要改這個檔案。
window.STORY = (() => {
'use strict';
const W = WORLD;
const name = (id) => (W.CHARS[id] ? W.CHARS[id].name : id);
const L = (who, t) => ({ who, t });
const N = (t) => ({ t });
const SYS = (t) => ({ sys: 1, t });

// ================================================================ 開場
const INTRO = [
  N('你二十四歲，背著 30 萬的學貸，白天上課，晚上在超商值大夜班。'),
  N('上個禮拜，房東傳來訊息：「下個月起房租漲三千。不能接受的話，月底前搬走。」'),
  N('就在你算著還能再兼哪一份工的時候，一封律師信寄到了你的雅房。'),
  N('信上說：萬家老爺・萬德福過世了。而你，是他從沒公開過的孫子。'),
  L('lawyer', '你就是萬德福先生的孫子？……我是陳律師，負責老爺的遺囑。'),
  L('lawyer', '遺囑會在五天後宣讀。在那之前，所有繼承人都必須住在豪宅裡守靈。'),
  L('lawyer', '這是守靈津貼，一萬元。……老爺生前交代的。'),
  L('lawyer', '還有——老爺生前特別交代過，無論如何，一定要找到你。'),
];

// ================================================================ 動心時刻（新目標出現時的內心獨白）
const MOMENTS = {
  mystery: ['（一個從沒見過面的爺爺，臨死前，為什麼一定要找我？）'],
  escape: ['（離開……）', '（我也想離開。離開大夜班、離開房東、離開學貸。）', '（如果是和她一起的話——）'],
  legal: ['（老爺還留了東西？）', '（如果他真正的意思，和律師手上那份遺囑不一樣……）'],
  revenge: ['（這就是我的「家人」。）', '（每個人都有見不得人的事。只要證據夠多……）'],
  company: ['（三百個員工……）', '（他是個爛人。但也許，不只是個爛人。）'],
  daughter: ['（三年的看護費。她一個字都沒說過。）', '（這個家最死要面子的人，原來是最孝順的那一個。）'],
  brothers: ['（每一間店倒掉，背後都是同一個人。）', '（如果我手上有證據……）'],
  film: ['（親情，還是真相？）', '（她在等一個人，推她一把。）'],
  name: ['（奶奶……）', '（她守了這個家一輩子。現在，換我守她。）'],
};
const GOAL_TITLE = {
  escape: '和小葵一起離開', legal: '正大光明地繼承', revenge: '讓這個家付出代價', mystery: '老爺為什麼叫你回來？',
  company: '幫大伯保住公司', daughter: '替二姑說出真相', brothers: '幫小叔翻身', film: '芊芊的選擇', name: '守住老爺的名聲',
};
// 第 2 天深夜，小葵自己講出夢想（沒去閒聊的玩家也不會錯過）
const KUI_DREAM = ['……孫少爺，你看過海嗎？我只在月曆上看過。', '我一直好想離開這棟房子，去看海。……嘿嘿，說說而已啦。'];
const QUESTIONS = [
  { q: '第一次看到老爺的遺照，你的第一個念頭是？', a: [
    ['「……爺爺，我來晚了。」', 'moral'], ['「右下角的簽名，是名攝影師的作品。」', 'know'],
    ['「這個金框，應該值不少錢。」', 'guile'], ['「我們長得還真像，我比較帥就是了。」', 'charm']] },
  { q: '大伯當眾說你是來騙錢的，你？', a: [
    ['默默上香，不跟他吵。', 'moral'], ['引用民法繼承編反駁他。', 'know'],
    ['笑著說「大伯說得對」，記在心裡。', 'guile'], ['當場哭出來，讓弔唁的客人同情你。', 'charm']] },
  { q: '實習女僕不小心把茶灑在你身上，你？', a: [
    ['「沒關係，妳有沒有燙到？」', 'moral'], ['「茶漬要用冷水和小蘇打處理。」', 'know'],
    ['「這次就算了，妳欠我一次。」', 'guile'], ['「這杯茶，是命運的安排吧。」', 'charm']] },
];
// 三問之後的性格結果：依最高的屬性決定稱號、描述、適合的路線
const PROFILE = {
  moral: { adj: '老實', noun: '老實人', desc: '你是個老實人。在這個家，老實人通常活不久。', route: '合法繼承、深交秋姨' },
  know:  { adj: '博學', noun: '讀書人', desc: '你相信證據。這個家最缺的，就是證據。', route: '蒐集實證、看穿假貨' },
  guile: { adj: '深沉', noun: '笑面虎', desc: '你很會笑。笑著把每一筆帳記在心裡。', route: '幕後黑手、勒索、嫁禍' },
  charm: { adj: '迷人', noun: '萬人迷', desc: '你很會討人喜歡——包括不該喜歡你的人。', route: '攜美潛逃、深交芊芊、挑撥' },
};
function profile(stats) {
  const keys = Object.keys(PROFILE), max = Math.max(...keys.map(k => stats[k]));
  const tops = keys.filter(k => stats[k] === max);
  if (tops.length === 1) { const p = PROFILE[tops[0]]; return { title: p.noun, desc: p.desc, route: p.route }; }
  if (tops.length === 2) {
    const [a, b] = tops.map(k => PROFILE[k]);
    return { title: `${a.adj}的${b.noun}`, desc: `${a.desc.split('。')[0]}。${b.desc.split('。')[0]}。`, route: `${a.route.split('、')[0]}、${b.route.split('、')[0]}` };
  }
  return { title: '普通人', desc: '你什麼都會一點，什麼都不太會。在這個家，這可能是最安全的。', route: '都可以試試看' };
}

const ARRIVE = [
  N('靈堂裡，親戚們看你的眼神，像在看一隻闖進來的野狗。'),
  // 開場的人物介紹：每個人一出場就露出個性
  L('uncle', '（對著弔唁的客人鞠躬）感謝各位。家父生前，最疼的就是我了。'),
  L('uncle', '……你就是那個「孫子」？'),
  L('ergu', '哎呀，國棟，別嚇到人家。（她上下打量你）……衣服哪裡買的？'),
  L('junjie', '欸！新來的！你對區塊鏈珍奶有沒有興趣？穩賺的！'),
  L('qianqian', '（手機對著你）家人們，這位就是傳說中的私生孫——'),
  L('uncle', '芊芊，收起來。'),
  L('qiu', '孫少爺，請上香。……老爺等你很久了。'),
  L('kui', '孫、孫少爺請用茶！——啊！'),
  N('（茶灑在你的鞋子上。）'),
  N('（……只要分到一點點就好。只要能還清學貸，不用再每天睡四個小時。）'),
  SYS('點人物可以對話、下指令；點 ✦ 可以調查物件。\n下指令或「動手」調查會花掉一個時段，移動、閒聊和看東西不花時間。\n右上角「🎯 目標」可以看你現在想要什麼、離它還有多遠。'),
];

// ================================================================ 家裡的案子（嫁禍用）
// 家裡出了事、大家開始追究，案子才會出現；一件案子只能栽一次（S.flags['case_' + id] = 被栽的人，失敗是 'me'）
// suspects：可以栽給誰、可信度加成；victim：栽失敗時，誰會記恨你；say：你說的話（{B} 換成被栽的人）
const CASES = [
  { id: 'condolence', title: '白包被偷', victim: null,
    note: '明天就會爆開',
    open: (S) => S.flags.tookCondolence && !S.seen.condolence,
    suspects: { junjie: ['他欠了一屁股債', 2], ergu: ['聽說她破產了', 1], qianqian: ['她不缺錢', -1] },
    witness: (S) => (S.flags.condolenceSeen ? ['有人看到你在靈堂附近', -2] : null),
    say: ['白包的事……我昨晚看到{B}一個人在靈堂待了很久。', '奠儀簿少一包的那天，{B}剛好一直說手頭很緊。'],
    done: (S, b, notes) => notes.push(SYS(`🕯 明天白包的事爆開時，大家會懷疑${name(b)}。`)) },
  { id: 'pudding', title: '冰箱的布丁被偷吃', victim: 'qiu',
    open: (S) => S.seen.pudding_gone && !S.flags.puddingConfessed,
    suspects: (S) => ({ junjie: S.flags.puddingJunjie ? ['他真的吃了一半', 3] : ['他最愛吃甜的', 2], ergu: ['她半夜會偷吃宵夜', 1],
      qianqian: ['她說她在減肥', -1], uncle: ['大伯不吃甜的', -2] }),
    say: ['布丁啊……我看到{B}在冰箱前面鬼鬼祟祟的。', '{B}的嘴角，剛剛還沾著焦糖。'],
    done: (S, b, notes) => {
      S.log.push({ junjie: '秋姨罰小叔洗了一整晚的碗。他一邊洗一邊喊冤。', ergu: '二姑被冤枉偷吃布丁，在群組連發了三張長輩圖。',
        qianqian: '芊芊被秋姨唸了半小時「減肥還偷吃」。她說要告你誹謗。', uncle: '大伯被秋姨用看垃圾的眼神，看了一整頓晚餐。' }[b]);
      if (S.flags.puddingLied && !S.flags.puddingForgiven) { S.flags.puddingForgiven = true; S.chars.kui.hostile = Math.max(0, S.chars.kui.hostile - 1); notes.push(SYS('小葵的冤屈洗清了。（小葵敵意 −1）')); }
    } },
  { id: 'page', title: '帳本被撕了一頁', victim: 'uncle',
    open: (S) => S.seen.uncle_rush,
    suspects: { ergu: ['她也想抓大伯的把柄', 2], qianqian: ['她最愛挖八卦', 1], junjie: ['他看不懂帳本', -1] },
    say: ['帳本那一頁……我看到{B}從書房出來，手上拿著一張紙。', '書房的事，您去問{B}吧。那天只有{B}進去過。'],
    done: (S, b) => { S.chars.uncle.hate[b] = (S.chars.uncle.hate[b] || 0) + 3; S.log.push(`大伯認定是${name(b)}偷了帳本那一頁，兩個人在書房吵翻了。`); } },
  { id: 'safe', title: '保險箱被打開', victim: 'uncle',
    open: (S) => S.seen.safe_found,
    suspects: (S) => ({ uncle: ['他一直在找鑰匙', 2], junjie: ['他急著要錢', 2],
      kui: S.chars.kui.bond >= 2 ? ['項鍊在你手上，她心裡有數', -3] : ['打開它的是她的項鍊', 1] }),
    say: ['保險箱的事……我半夜看到{B}在書房。', '那個保險箱的鑰匙，{B}一直很清楚在哪裡。'],
    done: (S, b, notes) => {
      if (b === 'kui') {
        Engine.setMotive(S, 'kui', '察覺被利用'); S.chars.qiu.hostile += 2;
        S.log.push('大家都說是小葵用項鍊開了保險箱。秋姨護著她，但看你的眼神變了。');
        notes.push(SYS('💔 小葵知道是誰害她的。（秋姨敵意 +2）'));
      } else if (b === 'uncle') {
        ['ergu', 'junjie', 'qianqian'].forEach(o => { S.chars[o].hate.uncle = (S.chars[o].hate.uncle || 0) + 1; });
        S.log.push('全家都認定是大伯開了保險箱。他越解釋，大家越不信。');
      } else {
        S.chars.uncle.hate.junjie = (S.chars.uncle.hate.junjie || 0) + 2;
        S.log.push('大伯認定是小叔開了保險箱，追著他繞了豪宅三圈。');
      }
    } },
  { id: 'carKey', title: '車庫的鑰匙不見了', victim: 'qiu',
    open: (S) => S.seen.key_missing && S.items.carKey,
    suspects: { junjie: ['他一直想跑路', 2], kui: ['她負責打掃車庫', 1], qianqian: ['她說想拍古董車', 0] },
    say: ['車鑰匙啊……我看到{B}在車庫晃來晃去。', '{B}前天還在問，那台車還能不能開。'],
    done: (S, b) => { S.chars.qiu.hate[b] = (S.chars.qiu.hate[b] || 0) + 2;
      S.log.push({ junjie: '秋姨認定是小叔拿了車鑰匙，把他的房門從外面鎖了一整晚。', kui: '秋姨把小葵叫去問了一個下午。小葵哭著說她只是去餵孔雀。', qianqian: '秋姨沒收了芊芊的自拍棒，說等鑰匙找到再還她。' }[b]); } },
  // 不是你做的：二姑的假古董被拆穿之後，說是別人調包的（替二姑解圍）
  { id: 'antique', title: '客廳的古董是假貨', victim: null, mine: false, noTell: ['ergu'],
    note: '這件不是你做的・替二姑解圍',
    open: (S) => S.seen.d4_stream,
    suspects: { junjie: ['他缺錢缺瘋了', 2], uncle: ['家裡的帳都是他在管', 1] },
    say: ['花瓶的事……我覺得不是二姑。我看過{B}半夜搬東西出門。', '二姑是被冤枉的。真的花瓶，是{B}拿去賣的。'],
    done: (S, b, notes) => {
      S.chars.ergu.hostile = Math.max(0, S.chars.ergu.hostile - 2); S.flags.erguCovered = true;
      S.log.push(`大家開始懷疑，花瓶其實是${name(b)}調包的。二姑終於敢走出房間了。`);
      notes.push(SYS('二姑欠你一次。（二姑敵意 −2）'));
    } },
  { id: 'peacock', title: '孔雀被放出來', victim: 'junjie',
    open: (S) => S.flags.peacockReleased,
    suspects: { qianqian: ['她拍了孔雀大鬧靈堂的影片', 2], kui: ['她負責打掃車庫', 0], ergu: ['她最怕鳥', -2] },
    say: ['孔雀的事……我看到{B}在車庫附近。', '籠子被打開之前，{B}剛好從車庫走出來。'],
    done: (S, b) => { S.chars.junjie.hate[b] = (S.chars.junjie.hate[b] || 0) + 3;
      S.log.push(`小叔認定是${name(b)}放走了小明（孔雀），` + (b === 'qianqian' ? '說她為了流量什麼都做得出來。' : '難過得一整晚沒講話。')); } },
];

// ================================================================ 偷吃布丁（冰箱）
function puddingRun(S, notes, v) {
  const h = Engine.present(S), relax = (id) => { S.chars[id].hostile = Math.max(0, S.chars[id].hostile - 1); };
  S.flags.puddingEaten = true;
  // 秋姨在：她不阻止你
  if (h.includes('qiu')) {
    S.flags.puddingRemade = true;
    const out = [N('（你打開冰箱，拿出布丁。背後的秋姨停下了手上的動作。）'), N('（你們對看了很久。）'), L('qiu', '……吃慢點。')];
    if (h.includes('junjie')) {
      relax('junjie');
      out.push(L('junjie', '欸欸！那我也要！'), L('qiu', '你小時候偷吃，被老爺罰跪了一個下午。'),
        L('junjie', '那次明明是阿明哥吃的！他吃完還把湯匙塞進我口袋！'), N('（阿明。你父親的名字。）'),
        L('junjie', '……結果被抓到的時候，他自己跑去跟爸自首，陪我一起跪。'), N('（秋姨沒有說話，又從冰箱裡拿出一個布丁，放在小叔面前。）'));
    }
    if (S.chars.qiu.bond >= 2) {
      S.flags.puddingClue = true;
      out.push(L('qiu', '你父親以前也是這樣。被抓到了，還是要把它吃完。'), N('（她說「你父親」的時候，聲音很輕。）'));
    }
    out.push(N('（她轉身從櫥櫃裡拿出雞蛋和糖。……她要再做一盒給小葵。）'));
    Engine.addBond(S, 'qiu', notes);
    return out;
  }
  // 只有小葵在：分不分她
  if (h.includes('kui') && v) {
    if (v === 'share') {
      S.flags.puddingShared = true;
      Engine.addBond(S, 'kui', notes);
      return [L('kui', '……一半喔！只有一半喔！'), N('（你們蹲在冰箱前面，一人一口，把布丁吃完了。）'),
        L('kui', '嘿嘿……這樣我們就是共犯了。秋姨問的話，就說是被貓吃掉的！')];
    }
    S.chars.kui.hostile++;
    S.log.push('小葵哭著跟秋姨說，孫少爺當著她的面把布丁吃掉了。');
    notes.push(SYS('小葵的敵意 +1。……秋姨晚上就會知道了。'));
    return [N('（你在她面前，一口一口把布丁吃完。）'), L('kui', '……'), L('kui', '沒、沒關係！我本來就……沒有很想吃……'),
      N('（她轉過身去擦桌子。同一個地方，擦了很久。）')];
  }
  // 沒有秋姨、也沒有小葵：真正的偷吃（下一個時段，群組會出事）
  S.flags.puddingAlone = true;
  if (h.includes('junjie')) {
    S.flags.puddingJunjie = true;
    return [L('junjie', '欸！分我一口！'), N('（你分了他一口。他吃掉了半盒。）'), L('junjie', '噓——我們什麼都沒看到。')];
  }
  const out = [N('（你打開冰箱，拿出布丁。）'), N('很甜。是手工的，焦糖還帶著一點苦。'), N('（你把空盒子塞回冰箱最裡面。）')];
  if (h.length) out.splice(1, 0, N(`（${h.map(id => W.CHARS[id].name).join('、')}看了你一眼，沒說什麼。）`));
  return out;
}

// ================================================================ 招呼（依動機）
const GREET = {
  uncle: { 奪權: '哼，是你。律師說爸在外面還有個「孫子」，我還以為是詐騙集團。', 報復: '你還有臉來找我？', 急躁: '……走開，我在忙。（他一直盯著保險箱）' },
  ergu: { 撐場面: '哎呀，是那個……孫子啊。我們萬家的人，一向很歡迎遠房親戚的。', 報復芊芊: '那個死丫頭……你也看到了吧？她毀了我！', 投靠: '來來來，坐姑姑旁邊。你比那幾個有出息多了。' },
  junjie: { 找錢: '欸！新來的！你對區塊鏈珍奶有沒有興趣？穩賺的！', 恐懼: '……你有沒有看到穿黑西裝的人在門口？沒有？那就好……', 跟班: '老大！今天要我做什麼？' },
  qianqian: { 爆紅: '等一下，我在錄。……好了，你要幹嘛？', 得意: '欸你知道我昨天那支片衝到多少觀看嗎？', 親情vs流量: '……我現在不想拍東西。' },
  qiu: { 守護名聲: '孫少爺。書房和老爺的房間，請不要隨便進去。', 託付: '……老爺如果看到你，應該會很高興。', 心灰意冷: '要拿什麼就拿吧。這個家，已經不值得守了。' },
  kui: { 保住工作: '孫、孫少爺好！我在打掃！很認真地在打掃！', 信任你: '孫少爺！……嘿嘿，看到你就安心了。', 察覺被利用: '……孫少爺要問什麼，就問吧。反正你也只是想問這個。', 被盯上: '孫少爺……大伯一直在看我的項鍊，好可怕……' },
};
function greet(S, id) {
  if (id === 'lawyer') return [L('lawyer', '有事等宣讀遺囑那天再說。')];
  if (id === 'qiu' && S.chars.qiu.bond >= 3 && (S.items.diary || S.flags.sawPhoto || S.flags.puddingClue) && !S.flags.grandmaKnown) {
    S.flags.grandmaKnown = true; Engine.unlockGoal(S, 'name');
    S.pendingReact = { id: 'qiu', key: 'grandma' };
    return [
      L('qiu', '……你都知道了吧。'),
      L('qiu', '那張照片上的人，是你父親。我是……他的母親。'),
      L('qiu', '當年老爺的太太不肯讓我進門。我只能用女僕的身分回來，遠遠看著他長大。'),
      L('qiu', '後來他還是被趕出去了。我什麼都做不了。'),
      L('qiu', '……你不用叫我奶奶。只是，讓我再多看你幾眼就好。'),
    ];
  }
  if (id === 'qiu' && S.flags.puddingConfessed && !S.flags.puddingTalk && S.chars.qiu.hostile < 3) {
    S.flags.puddingTalk = true; S.flags.puddingClue = true;
    const notes = [];
    Engine.addBond(S, 'qiu', notes);
    return [L('qiu', '……布丁好吃嗎。'), { who: 'me', t: '……很好吃。對不起。' },
      L('qiu', '你跟你爸一模一樣。偷吃完，還會自己跑來認。'), N('（她轉過身去。但你看到，她的嘴角動了一下。）')].concat(notes);
  }
  if (id === 'kui' && S.flags.puddingLied && !S.flags.puddingForgiven) {
    S.flags.puddingForgiven = true;
    S.chars.kui.hostile = Math.max(0, S.chars.kui.hostile - 1);
    return [L('kui', '孫少爺……秋姨說我偷吃布丁，罵了我好久。'), L('kui', '……可是我知道是你吃的啦。垃圾桶裡的湯匙，是給客人用的那種。'),
      L('kui', '下次要吃的話，跟我說嘛。我分你一半。'), SYS('小葵原諒你了。（小葵敵意 −1）')];
  }
  const c = S.chars[id];
  let t = (GREET[id] && GREET[id][c.motive]) || '……';
  if (c.hostile >= 3) t = { uncle: '滾。', ergu: '我跟你沒什麼好說的。', junjie: '你離我遠一點！', qianqian: '你再靠近我就開直播。', qiu: '請自重。', kui: '……' }[id] || t;
  const D = window.DIALOGUE;
  return (D ? [D.meGreet(S, id)] : []).concat([L(id, t)], D ? D.attitude(S, id) : [], D ? D.insights(S, id, 'greet') : []);
}

// ================================================================ 灌醉（高粱酒）
const DRINK = {
  uncle: [{ who: 'me', t: '大伯，喝一杯吧。這幾天您太累了。' }, L('uncle', '……一杯就好。'), N('（他喝了三杯。）')],
  ergu: [{ who: 'me', t: '二姑，我陪您喝一杯。' }, L('ergu', '你這孩子，真懂事～'), N('（她把杯子倒滿，一口乾了。）')],
  junjie: [{ who: 'me', t: '小叔，來，乾杯！' }, L('junjie', '乾啦！！！'), N('（他喝完，臉紅得像關公。）')],
  qianqian: [{ who: 'me', t: '喝一點嗎？' }, L('qianqian', '我不喝酒的……好啦，一口。'), N('（她喝了半瓶。）')],
};

// ================================================================ 隨機小插曲（進房間時有機率發生，每段只發生一次）
// room：在哪個房間；need：需要誰在場；slot：限定時段；when：其他條件
const INTERLUDES = [
  { id: 'mistake', room: 'hall', need: ['uncle'], lines: [N('（一位來弔唁的阿姨拉住你的手。）'), N('「這位就是長孫吧？長得真像國棟！」'), L('uncle', '……他不是。'), N('（阿姨尷尬地走開了。大伯的臉色很難看。）')] },
  { id: 'boba', room: 'hall', need: ['junjie'], lines: (S) => [L('junjie', '阿姨～喪禮限定，珍奶買一送一喔！'), N('（弔唁的阿姨愣了三秒，然後買了兩杯。）'),
    ...(Engine.present(S).includes('uncle') ? [L('uncle', '俊傑！！')] : [])] },
  { id: 'ringtone', room: 'hall', lines: [N('（誦經聲停了一下。師父的手機響了。）'), N('（鈴聲是〈小蘋果〉。）'), N('（全場沒有人敢笑。）')] },
  { id: 'selfie', room: 'hall', need: ['qianqian'], lines: [N('（芊芊背對著遺照自拍，比了一個 YA。）'), L('qianqian', '爺爺，這張幫你拍得很好看喔。'), N('（她拍了很多張。每一張，都有好好拍到遺照。）')] },
  { id: 'lawyer', room: 'hall', when: (S) => S.day >= 3, lines: [N('（陳律師來靈堂上香。他經過你身邊時，壓低聲音說了一句。）'), L('lawyer', '……老爺生前說過，你父親是他最驕傲的兒子。'), N('（他沒有再多說，就走了。）')] },
  { id: 'salt', room: 'kitchen', need: ['kui'], lines: [L('kui', '孫少爺！我煮了紅豆湯！'), N('（你喝了一口。是鹹的。）'), L('kui', '……咦？那個罐子不是糖嗎？')] },
  { id: 'soup', room: 'kitchen', need: ['qiu'], when: (S) => S.chars.qiu.bond >= 1, lines: [L('qiu', '孫少爺，喝湯要先吹。'), L('qiu', '……你父親小時候，也總是燙到舌頭。')] },
  { id: 'drama', room: 'living', slot: 2, need: ['ergu'], lines: [N('（二姑對著電視裡的韓劇，哭得稀里嘩啦。）'), L('ergu', '他為什麼不回頭……為什麼……'), L('ergu', '……看什麼看！沒看過女人哭嗎！')] },
  { id: 'remote', room: 'living', need: ['ergu', 'junjie'], lines: [L('junjie', '二姊！我要看球賽啦！'), L('ergu', '韓劇最後一集！你敢轉台試試看！'), N('（遙控器飛進了魚缸。）')] },
  { id: 'stocks', room: 'study', need: ['uncle'], lines: [L('uncle', '（講電話）對，股票先不要賣……爸的事？後天辦完。'), L('uncle', '……花圈？要最大的。比美鳳送的大。')] },
  { id: 'cry', room: 'garage', when: (S) => !S.flags.peacockReleased, lines: [N('（帆布底下傳來一聲淒厲的叫聲。）'), N('（……是孔雀。應該是。）')] },
];

// ================================================================ 屬性專屬選項（對話選單裡）
// when：什麼情況下出現；屬性不夠時會變灰，標示「需要○○ 4」
const ME_ = (t) => ({ who: 'me', t });
const SPECIALS = [
  { id: 'sp_uncle', who: 'uncle', stat: 'know', min: 4, label: '指出帳目的破綻',
    tip: '你看得懂帳。把破綻攤在他面前，他會亂了陣腳。',
    when: (S) => Engine.lvl(S, 'uncle_embezzle') >= 1 && ['奪權', '急躁'].includes(S.chars.uncle.motive),
    run: (S, notes) => {
      Engine.raise(S, 'uncle_embezzle', Math.max(2, Engine.lvl(S, 'uncle_embezzle')), notes); Engine.addState(S, 'uncle', '心虛');
      notes.push(SYS('😰 大伯陷入心虛：之後試探、勒索他都更容易。'));
      return [ME_('大伯，去年第三季那幾筆顧問費，收款公司的統編，是一間三年前就解散的空殼公司。'), L('uncle', '……你，到底是什麼人？'), N('（他的手在發抖。）')];
    } },
  { id: 'sp_ergu', who: 'ergu', stat: 'charm', min: 4, label: '陪她喝到最後一杯',
    tip: '她喝醉了。陪她喝下去，她會把心裡的話全倒出來。',
    when: (S) => Engine.has(S, 'ergu', '醉酒'),
    run: (S, notes) => {
      Engine.gossip(S, 'ergu', 2, notes); Engine.gossip(S, 'ergu', 2, notes); Engine.addBond(S, 'ergu', notes);
      return [ME_('二姑，今晚我陪您喝到最後一杯。'), L('ergu', '……你這孩子。好，今天姑姑不裝了。'), N('（她喝到第五杯，把這個家的事，一件一件全說了出來。）')];
    } },
  { id: 'sp_junjie', who: 'junjie', stat: 'moral', min: 4, label: '陪他一起面對債主',
    tip: '不用錢，也能讓他冷靜下來——只要有人站在他旁邊。',
    when: (S) => S.chars.junjie.motive === '恐懼',
    run: (S, notes) => {
      Engine.setMotive(S, 'junjie', '跟班'); Engine.delState(S, 'junjie', '恐懼'); S.flags.facedDebt = true;
      notes.push(SYS('小叔冷靜下來了。他不會再想著偷車跑路。'));
      return [ME_('小叔，下次他們打電話來，我陪你一起接。'), L('junjie', '……你說真的？'), L('junjie', '我從來沒想過，會有人願意站在我旁邊。')];
    } },
  { id: 'sp_qq', who: 'qianqian', stat: 'know', min: 4, label: '教她剪一支不傷人的片',
    tip: '你懂剪接。告訴她，真相不一定要傷人才有力量。',
    when: (S) => S.chars.qianqian.bond >= 1,
    run: (S, notes) => {
      Engine.addBond(S, 'qianqian', notes);
      return [ME_('這支片如果換個角度剪，可以不傷到任何人，還是很有力量。'), L('qianqian', '……你怎麼會懂這個？'), L('qianqian', '好。這支，我照你說的剪剪看。')];
    } },
  { id: 'sp_qiu', who: 'qiu', stat: 'moral', min: 4, label: '今晚替老爺守靈',
    tip: '老爺的靈前，很久沒有家人守過了。',
    when: (S) => S.slot === 2,
    run: (S, notes) => {
      S.flags.respect = true; Engine.addBond(S, 'qiu', notes);
      return [ME_('秋姨，今晚我來守靈。您去休息吧。'), L('qiu', '……老爺的靈前，很久沒有家人守過了。'), N('（那一夜，你在靈堂守到天亮。清晨醒來，身上多了一條毯子。）')];
    } },
  { id: 'sp_kui', who: 'kui', stat: 'guile', min: 4, label: '放話說項鍊是夜市貨',
    tip: '大伯在找那條項鍊。讓他相信那只是便宜貨，他就不會再找小葵麻煩。',
    when: (S) => S.chars.uncle.motive === '急躁' && !S.items.necklace,
    run: (S, notes) => {
      S.flags.necklaceSafe = true;
      notes.push(SYS('大伯不會再去搶小葵的項鍊了。'));
      return [ME_('小葵，明天我會在大伯面前「不小心」說，你這條項鍊是夜市買的。'), L('kui', '咦？咦？可是這是老爺送的……'), N('（隔天，大伯聽說項鍊是夜市貨，再也沒看過小葵的脖子一眼。）')];
    } },
];

// ================================================================ 宣讀遺囑前的屬性選項
const PREREAD = [
  { id: 'confess', stat: 'moral', min: 4, label: '當眾承認，白包是你拿的',
    when: (S) => S.flags.tookCondolence && !S.flags.condolenceSeen && (S.flags.junjieBlamed || S.flags.erguBlamed),
    run: (S) => {
      S.flags.confessed = true; S.exposure++; S.lawyer++;
      const who = S.flags.junjieBlamed ? 'junjie' : 'ergu';
      return [ME_('在律師開始之前……我有件事要說。白包，是我拿的。'), N(`（所有人都轉頭看你。${name(who)}張大了嘴，說不出話來。）`), L('lawyer', '……你能說出來，很不容易。'), SYS('你洗清了別人的冤屈。可疑度 +1，律師對你的印象變好了。')];
    } },
  { id: 'eulogy', stat: 'charm', min: 4, label: '上台致悼詞',
    when: () => true,
    run: (S) => {
      Object.values(S.chars).forEach(c => { c.hostile = Math.max(0, c.hostile - 1); });
      S.exposure = Math.max(0, S.exposure - 1); S.lawyer++;
      return [N('你走到遺照前面，說了一段話。你沒有準備稿子。'), N('說到一半，二姑哭了。小叔用袖子擦眼睛。連大伯都低下了頭。'), SYS('所有人對你的敵意 −1，可疑度 −1，律師對你的印象變好了。')];
    } },
];

// ================================================================ 代位繼承（學識 4 的結局）

// ================================================================ 閒聊（不花時間，不影響數值，只是更認識這個人）
// 條件：alone（true 只有你們兩個／false 旁邊有人／不寫＝都可以）、bond（至少幾階）、motive（特定動機時才講）
// 每句只講一次；符合條件的話題裡，優先講「動機限定」，其次講「越熟才講」的
const CHAT = {
  uncle: [
    { alone: false, t: ['（他正在跟弔唁的客人握手）感謝、感謝。家父生前，最疼的就是我了。'] },
    { alone: true, t: ['（他對著遺照整理領帶）……爸，你看，我把喪禮辦得多體面。', '……你什麼時候進來的？'] },
    { alone: false, bond: 1, t: ['你知道這間豪宅一年的地價稅多少嗎？……不，你不會想知道的。'] },
    { alone: true, bond: 1, t: ['我小時候，這個書房連門都不能碰。現在我天天坐在這裡。', '……感覺也沒有比較好。'] },
    { alone: true, bond: 2, t: ['你喝酒嗎？……算了，你還年輕。', '爸以前常說，喝酒的人做不了大事。他自己每晚都喝。'] },
    { motive: '報復', t: ['我不會忘記今天的事。誰笑過我，我都記著。'] },
    { motive: '急躁', t: ['（他一直盯著保險箱的鎖孔，嘴裡念著一串數字。）'] },
  ],
  ergu: [
    { alone: false, t: ['你這件西裝哪裡買的？……哦，那種地方啊。沒關係，年輕人嘛。'] },
    { alone: true, t: ['（她對著小鏡子補妝。補完，又補了一次。）'] },
    { alone: false, bond: 1, t: ['我年輕的時候，追我的人可以從這裡排到大門口。', '……現在大門口只剩記者。'] },
    { alone: true, bond: 1, t: ['我跟你說喔……這瓶酒是我從法國帶回來的。', '……騙你的，是好市多買的。'] },
    { alone: true, bond: 2, t: ['我前夫最後一次送我禮物，是離婚協議書。', '還是用名牌信封裝的。他就是這種人。'] },
    { motive: '投靠', t: ['有姑姑在，這個家沒人敢欺負你。', '……雖然姑姑自己也快被欺負死了。'] },
    { motive: '報復芊芊', t: ['那個死丫頭，從小就愛拿相機對著人。我早就說過她會出事。'] },
  ],
  junjie: [
    { alone: false, t: ['你有沒有 IG？我幫你按讚！互讚啦互讚！'] },
    { alone: true, t: ['欸，你覺得榴槤珍奶真的很難喝嗎？', '……我自己是覺得還好啦。'] },
    { alone: false, bond: 1, t: ['我下一個點子是「喪禮直播帶貨」。你覺得芊芊會不會跟我合作？'] },
    { alone: true, bond: 1, t: ['小時候大哥會揹我去上學。', '……後來就沒有了。'] },
    { alone: true, bond: 2, t: ['你知道嗎，我每間店開幕，爸都會偷偷來。', '他從來沒進去過，就站在對面看。'] },
    { motive: '恐懼', t: ['……你有沒有聽到摩托車的聲音？', '沒有？那就好。那就好。'] },
    { motive: '跟班', t: ['老大，我想好了！等遺產下來，我要開一間「老大珍奶」，招牌放你的臉！'] },
  ],
  qianqian: [
    { alone: false, t: ['（她對著手機）家人們，這裡就是我爺爺的靈堂，記得按讚訂閱——', '你擋到我了。'] },
    { alone: true, t: ['你不要看我這樣，我其實很討厭拍東西。', '……騙你的，我超愛。'] },
    { alone: false, bond: 1, t: ['我的觀眾說你很有記憶點。「那個突然冒出來的私生孫」。', '恭喜，你紅了。'] },
    { alone: true, bond: 1, t: ['爺爺是唯一一個看過我所有影片的人。', '連最爛的那幾支，他都有按讚。'] },
    { alone: true, bond: 2, t: ['我小時候想當新聞記者。後來發現，新聞沒有網紅賺錢。', '……也沒有網紅那麼假。'] },
    { motive: '親情vs流量', t: ['你覺得……一個人做了壞事，但也是為了別人，該被拍出來嗎？'] },
  ],
  qiu: [
    { alone: false, t: ['孫少爺，靈堂的香不能斷。你如果閒著，可以幫忙看一下。'] },
    { alone: true, t: ['（她在擦一個已經很乾淨的杯子。）', '……有事嗎？'] },
    { alone: false, bond: 1, t: ['小葵又把鹽當成糖了。這孩子……算了。'] },
    { alone: true, bond: 1, t: ['老爺最後那幾年，每天晚上都要我陪他聽同一張唱片。', '我到現在，還背得出每一首歌。'] },
    { alone: true, bond: 2, t: ['你父親離開這個家的那天，是我幫他提行李到門口的。', '他那時候，跟你現在差不多大。'] },
    { motive: '心灰意冷', t: ['這棟房子以前很熱鬧的。', '……現在只剩下吵鬧。'] },
  ],
  kui: [
    { alone: false, t: ['孫少爺！要喝茶嗎！這次我不會灑出來了！', '……應該。'] },
    { alone: true, t: ['這棟房子好大喔，我上禮拜還迷路了。', '在廁所。'] },
    { alone: false, bond: 1, t: ['秋姨說，在客人面前不能笑太大聲。可是我忍不住……嘿嘿。'] },
    { alone: true, bond: 1, t: ['我沒有爸爸媽媽。可是有一個叔叔一直寄錢給孤兒院，說是要給我的。', '我一直很想跟他說謝謝。'] },
    { alone: true, bond: 2, unlock: 'escape', t: ['孫少爺，你看過海嗎？', '我只在月曆上看過。藍藍的，好像很好吃。', '……我一直想離開這棟房子。去看海。'] },
    { motive: '察覺被利用', t: ['……孫少爺要問什麼，就問吧。'] },
    { motive: '被盯上', t: ['大伯一直在看我的脖子……我是不是做錯什麼了？'] },
  ],
};
const CHAT_DONE = {
  uncle: '（他看了看手錶。）我很忙。', ergu: '（她又拿出了小鏡子。）', junjie: '欸我先去回個訊息喔！',
  qianqian: '（她低頭滑手機，沒再理你。）', qiu: '我還有事要忙。', kui: '嘿嘿……我、我想不到要聊什麼了！',
};
function chat(S, id) {
  const c = S.chars[id], alone = Engine.present(S).filter(o => o !== id).length === 0;
  S.chatSeen = S.chatSeen || {};
  const ok = CHAT[id].map((e, i) => ({ e, i })).filter(({ e, i }) => !S.chatSeen[id + i]
    && (e.alone === undefined || e.alone === alone) && c.bond >= (e.bond || 0) && (!e.motive || e.motive === c.motive));
  ok.sort((a, b) => (b.e.motive ? 10 : 0) + (b.e.bond || 0) - ((a.e.motive ? 10 : 0) + (a.e.bond || 0)));
  if (!ok.length) return { lines: [L(id, CHAT_DONE[id])], more: false };
  S.chatSeen[id + ok[0].i] = true;
  if (ok[0].e.unlock) Engine.unlockGoal(S, ok[0].e.unlock);
  return { lines: ok[0].e.t.map(t => (t.startsWith('（') ? N(t) : L(id, t))), more: true };
}
// 還有沒有新話題（選項上顯示用）
function hasChat(S, id) {
  const c = S.chars[id], alone = Engine.present(S).filter(o => o !== id).length === 0, seen = S.chatSeen || {};
  return CHAT[id].some((e, i) => !seen[id + i] && (e.alone === undefined || e.alone === alone) && c.bond >= (e.bond || 0) && (!e.motive || e.motive === c.motive));
}

// 勸芊芊（她陷入「親情 vs 流量」時）
const PERSUADE = {
  publish: [L('qianqian', '……你也覺得，該讓大家知道嗎？'), L('qianqian', '好。宣讀那天，我開直播。全部。'), N('（她的手在發抖。但她已經決定了。）')],
  protect: [L('qianqian', '……你是說，我可以不拍嗎？'), L('qianqian', '我一直以為，把東西拍出來，才是我唯一能做的事。'), L('qianqian', '這個給你。爺爺的影片。……對的人，應該就是你吧。')],
};

// 給芊芊看大伯的帳本（她因此陷入「親情 vs 流量」）
const SHOW_QQ = [
  N('（你把公款的證據拿給芊芊看。）'),
  L('qianqian', '……這是什麼？這是我爸的簽名？'),
  L('qianqian', '你給我看這個幹嘛？你想要我拍嗎？……我、我要想一下。'),
];

// 出包＝成功了，但附帶一個代價（選項說明、輪盤上都會顯示）
const MISHAP = {
  probe: '拿到情報，但對方起了疑心；芊芊在場的話會被她錄下來',
  sow: '挑撥成功，但對方也開始懷疑你（敵意 +1）',
  bribe: '他收了錢，卻到處張揚',
  expose: '他信了，但有人注意到是你在放話（可疑度 +1）',
  frame: '栽贓成功，但他覺得你知道得太清楚（可疑度 +1）',
  befriend: '關係變好了，但旁邊的人看不順眼（敵意 +1）',
  blackmail: '只拿到一半，而且可疑度 +1',
};

// 選項說明（滑鼠移到選項上會顯示）
const CMD_HELP = {
  chat: '隨便聊聊，更認識這個人。不花時間。旁邊有沒有人、你們熟不熟，他會講的話不一樣。',
  probe: '套話。成功可以拿到或升級他的把柄（傳聞 → 線索）。對小葵、秋姨試探，是打聽別人的八卦。',
  sow: '讓他討厭另一個人。可能引發吵架、改變他之後的行動。說得出對方把柄的細節會更容易。',
  bribe: '花錢換情報或立場。不是每個人都收錢。',
  expose: '把別人真正做過的事告訴他（要有那個人的線索或實證）。說的是實話，不算說謊。被告發的人會當眾出糗，有實證的話秘密會被揭穿。',
  frame: '把家裡出的事（通常是你幹的）栽到別人頭上。先選案子，再選要說是誰；對方越有動機越可信。成功：嫌疑轉走、可疑度 −1。失敗：嫌疑回到你身上。被拆穿、或秋姨聽得到（她在場、跟她說、跟小葵說）的話，算你說了一次謊。',
  befriend: '拉近關係。深交到某個程度，會知道他的另一面，也可能拿到關鍵道具。',
  blackmail: '拿實證逼他就範。每個人能給的東西不一樣，但都會讓他對你有敵意；如果你們已經交心，這就是背叛。',
  leave: '結束對話。不花時間。',
  persuade: '她正在猶豫要不要公開爸爸的事。你的一句話，會決定她站在哪一邊。花一個時段。',
  showqq: '把大伯挪用公款的證據拿給她看。她是大伯的女兒，也是網紅——她會怎麼做？不花時間。',
};

// ================================================================ 指令反應
// s 成功、m 出包（成功但有代價）、f 失敗；{B} 會換成第三個人的名字
const CMD = {
  uncle: {
    probe: { s: '……你聽誰說的？那筆帳是爸生前的意思，你別亂講。', m: '（他壓低聲音）這種話，你最好別在律師面前說。', f: '年輕人，想套我的話？再修練二十年吧。' },
    sow: { s: '{B}？哼，我早就覺得他不對勁了。', m: '有意思……不過，你為什麼要告訴我這個？', f: '挑撥離間？你以為我第一天出來混？' },
    frame: { s: '原來是{B}幹的！我這就去找{B}算帳！', m: '好，我會處理。……你最好也別給我惹麻煩。', f: '你拿這種東西來騙我？我會讓律師知道你是什麼樣的人。' },
    befriend: { s: '……你倒是比那幾個沒用的懂事。', m: '哼。（他沒拒絕，但也沒看你）', f: '少來這套。我不需要朋友。' },
    blackmail: { s: '……多少？（他從西裝內袋掏出支票本，手在抖）', m: '這是最後一次。你給我記住。', f: '你敢威脅我？我們走著瞧。' },
  },
  ergu: {
    probe: { s: '（她湊過來）你可別說出去……其實那個花瓶……哎呀我什麼都沒說！', m: '你問這個做什麼？……我們萬家的人，不做這種事。', f: '小孩子別問大人的事。' },
    sow: { s: '{B}這樣說我？好啊，我倒要看看誰比較丟臉。', m: '真的假的？……你該不會是想看我們吵架吧？', f: '你說這種話，是想讓姑姑出醜嗎？' },
    frame: { s: '天啊，{B}居然做出這種事！我要讓全家都知道！', m: '我就知道！……不過這種事，你怎麼會知道？', f: '你騙誰啊？姑姑在社交圈混了三十年。' },
    befriend: { s: '你這孩子嘴真甜。來，姑姑跟你說個秘密……下次再說。', m: '呵呵，你很會說話嘛。（她瞄了一眼旁邊的人）', f: '油嘴滑舌，跟你爸一個樣。' },
    blackmail: { s: '你……你以為我還有錢嗎？（她當場崩潰大哭，睫毛膏流了滿臉）……好，你想知道什麼？這個家的醜事，我全都知道。', m: '嗚……你要什麼都拿去吧……反正我什麼都沒有了……', f: '你敢！我會告訴所有人你是什麼東西！' },
  },
  junjie: {
    probe: { s: '你怎麼知道？……好啦好啦，我是有欠一點點錢，一點點啦！', m: '噓——你小聲一點！大哥會聽到！', f: '我？我超有錢的好嗎！這次的生意穩賺！' },
    sow: { s: '{B}說我壞話？我現在就去找他！', m: '靠，真的假的……欸，你幹嘛跟我說這個？', f: '你少騙我了，{B}才不會這樣說。……應該不會吧？' },
    frame: { s: '是{B}？我就知道！我去找{B}理論！', m: '好！交給我！……欸等等，你為什麼這麼清楚？', f: '欸你這樣不對喔，我雖然笨但我不是白痴。' },
    befriend: { s: '兄弟！你是這個家裡第一個正眼看我的人！', m: '哈哈哈對吧！我就說我們很合！（他講得很大聲，大家都在看）', f: '你人很好啦，可是我現在沒空。' },
    blackmail: { s: '好啦好啦！你千萬別說出去！……我、我跟你說一個大哥的秘密，跟你換！', m: '你真的很過分欸……好啦，我跟你說。但你要保密喔！', f: '你去講啊！反正我已經夠慘了！' },
  },
  qianqian: {
    probe: { s: '好啦，跟你交換。我的小帳？……你怎麼知道的！', m: '你在套我話？等一下，我開個錄影。', f: '想知道？給我獨家，我再考慮。' },
    sow: { s: '{B}？這可以做成一集了。謝啦。', m: '有梗。不過你講這個，我要標註你喔。', f: '這種爛梗，我的觀眾不會買單。' },
    frame: { s: '天啊，{B}居然……我現在就開直播！', m: '我拍到了。……順便也拍到你了，別介意。', f: '證據呢？我做網紅的，最懂什麼叫造假。' },
    befriend: { s: '……你跟他們不一樣耶。你不會一直想上我的鏡頭。', m: '可以啊，那我們合拍一支？（她已經在錄了）', f: '謝謝，但我不缺朋友，我缺流量。' },
    blackmail: { s: '……好，算你狠。拍到你的影片，我全部刪掉。', m: '刪了。……但我會記住你。', f: '你以為我怕炎上？炎上就是流量。' },
  },
  qiu: {
    probe: { s: '……大小姐（二姑）的花瓶，小少爺（小叔）的電話。這個家什麼事我不知道。', m: '我可以告訴你。但你記住，我看著你。', f: '孫少爺，打聽別人的事，不是好習慣。' },
    sow: { s: '{B}……我會留意的。', m: '你說的話，我會判斷。包括你為什麼要說。', f: '在老爺的靈前挑撥家人，你不覺得羞恥嗎？' },
    frame: { s: '……原來如此。我會處理。', m: '我會處理。……但這件事，我也會記住是你說的。', f: '我服侍這個家三十年。這種謊話，騙不了我。' },
    befriend: { s: '……你的眼睛，跟一個人很像。', m: '謝謝。（她的語氣緩和了一點，但手上的抹布沒停）', f: '孫少爺請自便，我還有事。' },
  },
  kui: {
    probe: { s: '我什麼都沒說喔！……可是我聽說喔……（她左右看了一下）', m: '這個……我好像不該講……（她講了，而且講得很大聲）', f: '我、我不知道！我只是實習生！' },
    sow: { s: '咦？{B}是那種人嗎？我、我以後會小心的！', m: '真的嗎！我去跟秋姨說！', f: '孫少爺，你為什麼要說別人壞話……' },
    frame: { s: '是{B}嗎？好可怕……', m: '我會跟秋姨說的！……咦，秋姨會問是誰說的耶。', f: '孫少爺……{B}人很好的，不會做這種事吧？' },
    befriend: { s: '孫少爺人好好喔！秋姨很兇，可是會偷偷留布丁給我，下次分你一半！', m: '嘿嘿！（她笑得太開心，打翻了水桶）', f: '謝、謝謝……我要去打掃了！' },
  },
};
const BRIBE = {
  bag: { s: '哎呀，這……既然你這麼有心，姑姑就收下了。以後有什麼事，姑姑挺你。', m: '收下了。……不過你可別到處說。', f: '你以為我缺錢？我們萬家的人，不做這種事！' },
  info: { s: '夠意思！我跟你說，我聽到一件事……', m: '謝啦兄弟！欸你知道嗎我剛剛跟大哥說你人超好的！', f: '……五千？你在打發乞丐喔？' },
  lend: { s: '兄弟！你是我的再生父母！這筆錢下禮拜一定還你！（他不會還）', m: '太好了！我現在就去跟大哥炫耀我有新金主！', f: '……算了，兩萬不夠啦。我自己想辦法。' },
};
const GENERIC = {
  probe: { s: '……好吧，我跟你說。', m: '你問這個做什麼？……算了。', f: '我沒什麼好說的。' },
  sow: { s: '{B}真的這樣？', m: '……你為什麼要告訴我？', f: '我不信。' },
  frame: { s: '是{B}？！', m: '我知道了。', f: '你在騙我。' },
  befriend: { s: '……謝謝。', m: '嗯。', f: '……' },
  blackmail: { s: '……你要多少？', m: '拿去。', f: '你敢？' },
};
function cmd(c, S, ctx) {
  const id = ctx.t, D = window.DIALOGUE;
  let mine = D ? D.me(S, c, ctx) : null;
  if (c === 'frame') { const K = CASES.find(k => k.id === ctx.case); mine = { who: 'me', t: pickLine(S, 'frame:' + K.id, K.say).split('{B}').join(name(ctx.b)) }; }
  if (c === 'expose') {
    const X = W.SECRETS[ctx.sid].title, proof = Engine.lvl(S, ctx.sid) >= 3;
    const pool = proof ? ['我手上有證據：{B}{X}。', '你看這個。{B}{X}，白紙黑字。'] : ['我聽說……{B}{X}。你不覺得奇怪嗎？', '這件事我還在查，但{B}好像{X}。'];
    mine = { who: 'me', t: pickLine(S, 'expose', pool).split('{B}').join(name(ctx.b)).split('{X}').join(X) };
  }
  if (c === 'expose') c = 'frame';   // 對方的反應：告發和嫁禍共用（「原來是{B}幹的！」）
  const pre = mine ? [mine] : [];
  // 示好升階時只講深交台詞（不然每次都重複同一句）；已經託付之後改講 AFTER
  if (c === 'befriend' && ctx.stage) {
    if (ctx.stage >= 2 && D && D.reactOptions(S, id, ctx.stage)) S.pendingReact = { id, key: ctx.stage };
    return pre.concat(BONDS[id][ctx.stage], qiuHold(S, ctx));
  }
  if (c === 'befriend' && ctx.out !== 'f' && S.chars[id].bond >= 3) return pre.concat([L(id, AFTER[id])]);
  const book = c === 'bribe' ? BRIBE[ctx.opt] : ((CMD[id] && CMD[id][c]) || GENERIC[c]);
  const t = (c !== 'bribe' && D && D.reply(S, c, ctx)) || ((book && book[ctx.out]) || '……').split('{B}').join(ctx.b ? name(ctx.b) : '');
  return pre.concat([L(id, t)], D ? D.insights(S, id, c, ctx.out, { b: ctx.b }) : []);
}
function pickLine(S, key, arr) { S.said = S.said || {}; const i = S.said[key] || 0; S.said[key] = i + 1; return arr[i % arr.length]; }
function qiuHold(S, ctx) {
  return ctx.stage === 3 && ctx.t === 'qiu' && !S.items.will2 ? [L('qiu', '……我還有一樣東西要交給「配得上的人」。但現在的你，還不是。')] : [];
}
// 已經託付之後再示好
const AFTER = {
  uncle: '……陪我喝一杯吧。不談公司。',
  ergu: '你這孩子，怎麼老是跑來陪姑姑。……謝謝。',
  junjie: '兄弟！等我這次翻身，第一個請你吃大餐！',
  qianqian: '我今天沒開鏡頭喔。……跟你聊天不用。',
  qiu: '布丁在冰箱第二層。別讓小葵知道是我說的。',
  kui: '孫少爺！海邊的照片，我存了好多張喔！',
};

// ================================================================ 深交（伏筆）
const BONDS = {
  uncle: {
    1: [N('（你注意到，他說「爸」的時候，會不自覺看向遺照。）')],
    2: [L('uncle', '我十六歲就跟著爸跑工地。他從來沒誇過我一句。一句都沒有。')],
    3: [L('uncle', '……公款的事，你大概也聽說了。那是爸三年前投資失敗的洞。我不填，公司三百個員工明天就沒飯吃。'), L('uncle', '我是個爛人。但我不想讓爸的公司，在我手上倒掉。')],
  },
  ergu: {
    1: [N('（你注意到，她手上的名牌包，邊角已經磨到脫皮了。）')],
    2: [L('ergu', '你以為我回娘家是為了錢？……算了，跟你說這個幹嘛。')],
    3: [L('ergu', '爸生病那三年，看護費是我付的。國棟說公司周轉不靈，一毛都不出。'), L('ergu', '賣古董的錢，全都拿去付這個了。……你敢說出去，我就跟你拚命。')],
  },
  junjie: {
    1: [N('（你注意到，每次提到大伯，小叔就會突然安靜下來。）')],
    2: [L('junjie', '我也不是天生就這麼廢啦……只是每次快要成功的時候，就會出事。')],
    3: [L('junjie', '其實我知道。我每一間店倒，背後都是大哥在搞。他要我一輩子靠家裡。'), L('junjie', '我只是……不想承認而已。承認了，就連最後一個家人都沒有了。')],
  },
  qianqian: {
    1: [N('（你注意到，她的頻道裡，從來沒有拍過任何家人的臉。）')],
    2: [L('qianqian', '我爸只在乎公司，我媽只在乎我爸。我拍片，至少有人會看我。'), L('qianqian', '……對了，我在靈堂裝了一台攝影機拍直播素材。你在那邊做什麼，最好小心一點。'), L('qianqian', '還有……爺爺走之前，好像交代過我一件事。我還沒想好要不要跟你說。')],
    3: [L('qianqian', '……爺爺走之前，叫我錄了一段影片。他說，等「對的人」來了再給。'), L('qianqian', '我本來以為是我爸。後來才知道，他說的人是你。拿去吧。')],
  },
  qiu: {
    1: [N('（你注意到，秋姨看你的眼神，像在找某個人的影子。）')],
    2: [L('qiu', '你父親小時候，也常常躲在廚房偷吃布丁。……跟小葵一樣。'), L('qiu', '……老爺還留了一樣東西。要交給「配得上的人」。')],
    3: [L('qiu', '我和老爺……年輕的時候，曾經差點在一起。'), L('qiu', '他當年把你父親趕出這個家，不是因為不愛。是因為怕這個家，把他也變成這副模樣。')],
  },
  kui: {
    1: [N('（你注意到，小葵脖子上那條項鍊的墜子，形狀很奇怪，像一把小鑰匙。）')],
    2: [L('kui', '老爺以前常叫我陪他下象棋。他每次都輸，然後說「這局不算」。……我有點想他。')],
    3: [L('kui', '孫少爺，這個給你。老爺說，如果有一天我遇到想一起離開這裡的人，就把它交給那個人。'), L('kui', '……我一直想離開這棟房子。去看海。')],
  },
};

// ================================================================ 物件
// look：免費；act：動手，除非 free，否則花一個時段、有人在場會被看到
const HOTSPOTS = {
  hall: [
    { id: 'altar', name: '老爺的遺照', x: 160, y: 40,
      look: () => [N('遺照裡的老爺，嘴角好像在笑。')],
      act: { label: '上香（每天一次，換一次重轉）', free: true, can: (S) => S.prayedDay !== S.day,
        run: (S, notes) => { S.prayedDay = S.day; S.rerolls = 1; if (Engine.present(S).includes('qiu')) S.flags.respect = true;
          notes.push(SYS('🙏 今天的判定若不如意，可以重轉一次。')); return [N('你點了三炷香。煙往上飄，好像有人在聽。')]; } } },
    { id: 'book', name: '奠儀簿', x: 229, y: 100,
      look: () => [N('白包疊得厚厚一疊。大家包得都不小，看來比起老爺，大家更怕被別人說小氣。')],
      act: { label: `偷拿一包白包（+${W.MONEY.condolence} 萬）`, can: (S) => !S.flags.tookCondolence,
        run: (S) => { S.flags.tookCondolence = true; S.flags.condolenceDay = S.day; S.money += W.MONEY.condolence; return [N('你把一包白包塞進口袋。老爺在遺照裡繼續笑著。'), SYS(`💰 +${W.MONEY.condolence} 萬`)]; },
        seen: (S) => { S.flags.condolenceSeen = true; } } },
  ],
  study: [
    { id: 'ledger', name: '書桌上的帳本', x: 150, y: 92,
      look: (S) => {
        if (S.items.page) return [N('那一頁現在在你口袋裡。')];
        if (S.flags.pageTorn) return [N('有一頁被撕掉了，撕口很新。')];
        const n = []; Engine.raise(S, 'uncle_embezzle', 1, n);
        return [N('翻到去年第三季，有好幾筆「顧問費」數字大得離譜，經手人都是同一個簽名。'), ...n];
      },
      act: { label: '撕下那一頁帶走', can: (S) => !S.items.page && !S.flags.pageTorn,
        run: (S, notes) => { S.items.page = true; Engine.raise(S, 'uncle_embezzle', 3, notes); notes.push(SYS(W.got('page'))); return [N('你小心地撕下那一頁，折好收進口袋。')]; } } },
    { id: 'willcopy', name: '遺囑副本', x: 172, y: 94,
      look: (S) => S.flags.willFlaw
        ? [N('見證人欄只有一個簽名。你已經知道這份遺囑的問題在哪裡了。')]
        : S.stats.know >= 4
          ? [N('律師留在書房的遺囑副本。「代筆遺囑」——這四個字讓你多看了一眼。')]
          : [N('律師留在書房的遺囑副本。密密麻麻的法律條文……你看不太懂。'), SYS('（學識再高一點，也許能看出什麼。）')],
      act: { label: '仔細研讀遺囑副本', innocent: true, can: (S) => S.stats.know >= 4 && !S.flags.willFlaw,
        run: (S, notes) => {
          S.flags.willFlaw = true;
          notes.push(SYS('📜 你發現遺囑的破綻了。宣讀時，可以主張代位繼承。'));
          return [N('你一條一條對照民法。代筆遺囑，需要三位以上的見證人。'), N('見證人欄裡，只有一個簽名。'), N('（……這份遺囑，是無效的。）')];
        } } },
    { id: 'drawer', name: '書桌抽屜', x: 120, y: 118,
      look: (S) => S.flags.erguTruth && !S.items.careReceipt
        ? [N('抽屜深處有一疊醫院的單據。付款人一欄，每一張都寫著「萬美鳳」。')]
        : (S.flags.sawLetters = true, [N('抽屜裡都是老爺的舊信。每一封都沒有寄出去，收件人寫著「阿秋」。')]),
      act: { label: '把看護費的收據拿走', can: (S) => S.flags.erguTruth && !S.items.careReceipt,
        run: (S, notes) => { S.items.careReceipt = true; notes.push(SYS(W.got('careReceipt'))); return [N('三年份的收據，疊起來有一個手掌那麼厚。')]; } } },
    { id: 'safe', name: '保險箱', x: 300, y: 104,
      look: (S) => S.flags.safeOpened ? [N('保險箱已經空了。')] : S.flags.necklaceLost ? [N('保險箱門開著一條縫……裡面空了。有人先來過。')] : [N('鎖孔的形狀很奇怪，不是一般的鑰匙。比較像……某種墜子。')],
      act: { label: '用項鍊打開保險箱', can: (S) => S.items.necklace && !S.flags.safeOpened && !S.flags.necklaceLost,
        run: (S, notes) => {
          S.flags.safeOpened = true; S.money += W.MONEY.safe; S.items.diary = true;
          ['uncle_record', 'junjie_loan'].forEach(s => Engine.raise(S, s, 3, notes));
          S.items.sabotage = true; S.items.careReceipt = true;
          return [N('項鍊的墜子剛好卡進鎖孔。「喀」的一聲。'), N('裡面有一疊鈔票，還有一本老爺的日記，記滿了每個家人的秘密。'),
            N('日記的最後一頁，只寫了一行字：「阿秋，對不起。我們的兒子，我沒有守住。」'),
            SYS(`💰 +${W.MONEY.safe} 萬`), SYS(W.got('diary')), SYS(`📄 日記裡也記著：${W.ITEMS.sabotage}、${W.ITEMS.careReceipt}（都放進 🎒 道具了）`)];
        } } },
  ],
  kitchen: [
    { id: 'trash', name: '垃圾桶', x: 61, y: 106,
      look: (S) => Engine.lvl(S, 'ergu_debt') >= 3 ? [N('只剩廚餘。')] : [N('最上面有一張揉爛的信用卡帳單，收件人是萬美鳳。')],
      act: { label: '把帳單撿出來', can: (S) => Engine.lvl(S, 'ergu_debt') < 3,
        run: (S, notes) => { Engine.raise(S, 'ergu_debt', 3, notes); return [N('「某某醫美診所　分期第 18 期／共 36 期」。')]; } } },
    { id: 'liquor', name: '櫥櫃裡的高粱酒', x: 276, y: 70,
      look: (S) => (S.flags.sawLiquor = true, S.items.liquor ? [N('你手上已經有一瓶了。')] : [N('料理用的高粱酒，58 度。標籤上有人用奇異筆寫著「二小姐勿動」。')]),
      act: { label: '拿一瓶走（之後可以拿去灌醉別人）', free: true, can: (S) => !S.items.liquor && S.flags.liquorDay !== S.day,
        run: (S, notes) => { S.items.liquor = true; S.flags.liquorDay = S.day; notes.push(SYS(W.got('liquor'))); return [N('你把酒瓶藏進外套。很沉。')]; } } },
    { id: 'fridge', name: '冰箱', x: 211, y: 76,
      look: (S) => !S.flags.puddingEaten ? [N('冰箱裡有一盒布丁，上面貼著便條：「小葵的，偷吃者死。——秋」')]
        : S.flags.puddingRemade ? [N('冰箱裡多了一盒新的布丁。便條換了一張：「小葵的。這次是真的。——秋」')]
        : [N('布丁的位置空了。便條還貼在那裡，看起來比剛才更兇。')],
      // 一局一次，不花時間；誰在廚房，反應就不一樣
      act: { label: '偷吃布丁', free: true, can: (S) => !S.flags.puddingEaten,
        sub: (S) => { const h = Engine.present(S); return '不花時間・' + (h.length ? h.map(id => W.CHARS[id].name).join('、') + '在旁邊' : '四下無人'); },
        // 只有小葵在：她會先叫出來，讓你選要不要分她
        ask: (S) => { const h = Engine.present(S); if (!h.includes('kui') || h.includes('qiu')) return null;
          return { lines: [N('（你打開冰箱，手才剛碰到布丁——）'), L('kui', '孫、孫少爺！那、那是我的布丁！')],
            options: [{ label: '「分妳一半？」', value: 'share' }, { label: '（當著她的面，全部吃掉）', value: 'all' }] }; },
        run: (S, notes, v) => puddingRun(S, notes, v) } },
  ],
  living: [
    { id: 'vase', name: '古董花瓶', x: 141, y: 92,
      look: (S) => {
        if (S.flags.vaseHandled) return [N('花瓶原本的位置，現在只剩一圈灰塵印。')];
        if (S.stats.know >= 3) { const n = []; Engine.raise(S, 'ergu_antique', 2, n); return [N('底部的款識是「印」上去的，不是燒出來的。這是假貨。'), ...n]; }
        return [N('看起來很貴。你不太懂古董。')];
      },
      act: { label: '把假花瓶藏起來', can: (S) => !S.flags.vaseHandled,
        run: (S, notes) => { S.flags.vaseHandled = true; S.items.fakeVase = true; Engine.raise(S, 'ergu_antique', 3, notes); notes.push(SYS(W.got('fakeVase'))); return [N('你把花瓶塞進大衣裡。至少，不會有人在直播上看到它了。')]; } } },
    { id: 'celadon', name: '櫃子裡的青瓷', x: 40, y: 62,
      look: () => [N('這個是真的。光看釉色就知道，可以賣不少錢。')],
      act: { label: `偷去賣掉（+${W.MONEY.antique} 萬）`, can: (S) => !S.flags.soldAntique,
        run: (S) => { S.flags.soldAntique = true; S.money += W.MONEY.antique; if (S.chars.qiu.bond > 0) S.chars.qiu.bond--; return [N('你用手機找了一個收古董的，他在後門等你。'), SYS(`💰 +${W.MONEY.antique} 萬　（秋姨大概會發現）`)]; } } },
    { id: 'fireplace', name: '壁爐', x: 231, y: 98,
      look: (S) => {
        if (!S.flags.pageBurned) return [N('冷冷的壁爐，好像很久沒用了。')];
        const n = []; Engine.raise(S, 'uncle_embezzle', 2, n);
        return [N('灰燼裡有一角沒燒完的紙，印著「萬福集團」的抬頭和一串數字。'), ...n];
      } },
  ],
  garage: [
    { id: 'car', name: '老爺的古董車', x: 166, y: 124,
      look: (S) => S.flags.carGone ? [N('車庫是空的。小叔連車一起跑了。')] : S.flags.carWrecked ? [N('車頭整個凹進去了。小叔的傑作。')] : [N('擦得發亮的老賓士。油箱是滿的。')] },
    { id: 'door', name: '後門', x: 303, y: 90,
      look: (S) => Engine.kuiWilling(S)
        ? (S.slot === 2 ? [N('後門外是下山的路。今晚，可以走了。')] : [N('後門外是下山的路。……要走的話，等天黑吧。')])
        : [N('後門外是下山的路。一個人走的話，什麼都不會改變。')],
      act: { label: (S) => `今晚就帶小葵離開${S.day < 5 ? `（放棄遺產，還有 ${5 - S.day} 天才宣讀）` : ''}`, free: true, can: (S) => Engine.canEscape(S),
        run: (S) => { S.ending = S.chars.qiu.bond >= 3 ? 'blessing' : 'escape'; return []; } } },
    { id: 'key', name: '牆上的車鑰匙', x: 281, y: 59,
      look: (S) => S.items.carKey ? [N('鉤子是空的。鑰匙在你這。')] : S.flags.keyStolen ? [N('鉤子是空的。有人先拿走了。')] : [N('古董車的鑰匙就掛在鉤子上。')],
      act: { label: '拿走車鑰匙', can: (S) => !S.items.carKey && !S.flags.keyStolen,
        run: (S, notes) => { S.items.carKey = true; S.flags.keyTakenAt = Engine.slotIdx(S); notes.push(SYS(W.got('carKey'))); return [N('你把鑰匙收進口袋。')]; } } },
    { id: 'cage', name: '蓋著帆布的籠子', x: 51, y: 104,
      look: (S) => {
        if (S.flags.peacockReleased) return [N('籠子是空的。地上只剩幾根羽毛。')];
        S.flags.sawPeacock = true;
        const n = []; Engine.raise(S, 'junjie_peacock', 3, n); return [N('帆布底下有東西在動。你掀開一角——一隻孔雀正瞪著你。'), ...n];
      },
      act: { label: '把孔雀放出去（大家都會跑去靈堂抓孔雀，其他房間會空出來）', free: true, can: (S) => !S.flags.peacockReleased,
        run: (S, notes) => {
          S.flags.peacockReleased = true; S.flags.peacockAt = Engine.slotIdx(S);
          Engine.raise(S, 'junjie_peacock', 3); Engine.addState(S, 'junjie', '狼狽');
          Engine.locate(S);
          Engine.post(S, [['ergu', '靈堂有孔雀！！！！！'], ['uncle', '誰把孔雀放出來的'], ['uncle', '俊傑 你養孔雀？？？'], ['junjie', '牠叫小明'], ['qianqian', '[影片] 孔雀大鬧靈堂 🦚🔥', 'media']]);
          S.todayGroup.push('peacock');
          notes.push(SYS('🦚 這個時段，所有人都在靈堂抓孔雀。其他房間沒有人——現在動手不會被看到。'));
          return [N('你打開籠子。孔雀愣了一秒，然後尖叫著衝出車庫。'), N('遠處傳來碰撞聲、尖叫聲，和二姑的「我的頭髮！！」'), N('（小叔偷養孔雀的事，全家都知道了。）')];
        } } },
  ],
};

// ================================================================ 場景的變化
// 狀態改變時，把變化版背景（assets/scenes/<alt>.png）的 rect 範圍剪下來，蓋在原本的背景上
// 變化版由 art/*.px.js 輸出：同一套光影，所以貼上去不會有色差
const SCENE_CHANGES = {
  study: [
    { alt: 'study_alt', rect: [278, 94, 38, 28], when: (S) => S.flags.safeOpened || S.flags.necklaceLost },   // 保險箱打開
  ],
  kitchen: [
    { alt: 'kitchen_alt', rect: [252, 39, 8, 18], when: (S) => S.items.liquor },                             // 酒櫃少一瓶
  ],
  living: [
    { alt: 'living_alt', rect: [132, 78, 20, 28], when: (S) => S.flags.vaseHandled },                         // 花瓶不見
    { alt: 'living_alt', rect: [30, 52, 22, 22], when: (S) => S.flags.soldAntique },                          // 青瓷賣掉
  ],
  garage: [
    { alt: 'garage_alt', rect: [274, 52, 14, 14], when: (S) => S.items.carKey || S.flags.keyStolen },         // 鑰匙不見
    { alt: 'garage_alt', rect: [14, 82, 74, 40], when: (S) => S.flags.peacockReleased },                     // 籠子打開
    { alt: 'garage_alt2', rect: [90, 94, 144, 58], when: (S) => S.flags.carGone },                            // 車被開走
    { alt: 'garage_alt', rect: [90, 94, 144, 58], when: (S) => S.flags.carWrecked && !S.flags.carGone },      // 車撞爛
  ],
};

// ================================================================ 預設時間線
// 條件還成立就照表發生；room 是事件發生的房間，玩家剛好在場才會看到 scene
const TIMELINE = [
  { id: 'd1_drunk', day: 1, slot: 2, run: (S) => {
    S.chars.junjie.hate.ergu = (S.chars.junjie.hate.ergu || 0) + 1;
    return { whisper: '二姑在客廳喝到第三瓶，把小叔的「榴槤珍奶」笑了一整晚。小叔一直沒講話。',
      room: 'living', scene: [L('ergu', '俊傑啊，你那個……榴槤珍奶？哈哈哈哈哈！'), L('junjie', '……')] };
  } },
  { id: 'd2_tear', day: 2, slot: 1, if: (S) => !S.items.page && S.chars.uncle.loc === 'study', run: (S) => {
    S.flags.pageTorn = true;
    const n = [];
    if (S.room === 'study') Engine.raise(S, 'uncle_embezzle', 2, n);
    return { ugly: true, whisper: '大伯下午一個人關在書房，出來的時候西裝口袋鼓鼓的。',
      room: 'study', scene: [N('（大伯翻開帳本，把其中一頁撕下來，塞進西裝口袋。他沒發現你在看。）'), ...n] };
  } },
  { id: 'd2_burn', day: 2, slot: 2, if: (S) => S.flags.pageTorn && !S.items.page && S.chars.uncle.loc === 'living', run: (S) => {
    S.flags.pageBurned = true;
    return { ugly: true, whisper: '大伯在客廳的壁爐前燒東西，說是在燒紙錢給老爺。可是那天沒有人買紙錢。', room: 'living',
      scene: [N('（大伯把一張紙丟進壁爐。火光映在他的眼鏡上。）'), L('uncle', '……爸，對不起。')] };
  } },
  { id: 'd3_debt', day: 3, slot: 1, if: (S) => !S.flags.lentJunjie, run: (S) => {
    Engine.setMotive(S, 'junjie', '恐懼'); Engine.addState(S, 'junjie', '恐懼');
    const n = [];
    if (S.room === 'garage') Engine.raise(S, 'junjie_loan', 3, n);
    return { whisper: '小叔在車庫講電話，一直說「再給我兩天」，臉白得像紙。', room: 'garage',
      scene: [L('junjie', '大哥我真的會還！再兩天！遺產下來我馬上——喂？喂？'), ...n] };
  } },
  { id: 'd3_key', day: 3, slot: 2, if: (S) => S.chars.junjie.motive === '恐懼' && !S.items.carKey, run: (S) => {
    if (S.room === 'garage') {   // 你在車庫，他不敢當著你的面拿
      S.seen.d3_key_tried = true;
      return { whisper: '小叔今晚在車庫晃了好久，一直偷看牆上的鑰匙。你在那裡，他最後什麼都沒拿就走了。', room: 'garage',
        scene: [L('junjie', '呃……我、我只是來看看孔雀！晚安！'), N('（他走之前，又看了牆上的車鑰匙一眼。）')] };
    }
    S.flags.keyStolen = true;
    return { whisper: '車庫牆上的車鑰匙不見了。秋姨說，小叔今晚一直在車庫附近晃。' };
  } },
  { id: 'd4_stream', day: 4, slot: 0, if: (S) => !S.flags.vaseHandled && S.chars.ergu.motive !== '投靠'
      && ['爆紅', '得意'].includes(S.chars.qianqian.motive) && S.chars.qianqian.loc === 'living', run: (S) => {
    Engine.addState(S, 'ergu', '狼狽'); Engine.setMotive(S, 'ergu', '報復芊芊'); S.flags.erguAngryAt = slotIndex(S);
    S.chars.ergu.exposed = true; Engine.raise(S, 'ergu_antique', 3);
    S.chars.ergu.hate.qianqian = (S.chars.ergu.hate.qianqian || 0) + 3;
    return { ugly: true, whisper: '芊芊的直播拍到客廳那個古董花瓶底下印著「Made in」，留言區炸了。二姑當場崩潰。', room: 'living',
      scene: [L('qianqian', '各位觀眾！這就是我們萬家客廳的傳家寶——欸？這底下寫什麼？'), L('ergu', '關掉！給我關掉！！')] };
  } },
  { id: 'ergu_revenge', if: (S) => S.chars.ergu.motive === '報復芊芊' && slotIndex(S) > S.flags.erguAngryAt && S.chars.ergu.loc === 'hall', run: (S) => {
    Engine.addState(S, 'uncle', '狼狽'); Engine.raise(S, 'uncle_record', 2);
    S.chars.qianqian.hate.ergu = (S.chars.qianqian.hate.ergu || 0) + 2;
    const here = S.chars.uncle.loc === 'hall';
    return { ugly: true, whisper: '二姑在靈堂當著弔唁客人的面，把大伯偷錄老爺講話的事全抖出來了。', room: 'hall',
      scene: [L('ergu', '大家知道嗎？國棟在爸病床前偷錄音！想證明爸老糊塗！'),
        here ? L('uncle', '美鳳妳——！') : N('（大伯不在場。等他聽到消息趕來，弔唁的客人已經傳開了。）')] };
  } },
  { id: 'd4_kui', day: 4, slot: 2, if: (S) => !S.items.necklace && !S.flags.necklaceSafe && S.chars.kui.loc === 'study' && S.chars.uncle.motive === '急躁', run: (S) => {
    if (S.room === 'study') {
      S.flags.protectedKui = true; S.chars.kui.hostile = 0;
      if (S.chars.kui.bond < 3) S.chars.kui.bond++;
      S.chars.uncle.hostile++;
      return { whisper: '你在書房擋住了大伯。小葵說，她會記得這件事。', room: 'study',
        scene: [L('uncle', '小葵，那條項鍊給我看看——'), N('（你站到小葵前面。大伯瞪了你一眼，悻悻地走了。）'), L('kui', '孫、孫少爺……謝謝你。')] };
    }
    S.flags.necklaceLost = true; Engine.addState(S, 'kui', '恐懼');
    return { whisper: '大伯把小葵堵在書房，扯走了她的項鍊。之後保險箱就空了。小葵哭著跑回廚房。' };
  } },
  { id: 'd5_crash', day: 5, slot: 0, if: (S) => S.flags.keyStolen && !S.chars.junjie.gone && S.chars.junjie.motive === '恐懼', run: (S) => {
    S.flags.carWrecked = true; Engine.addState(S, 'junjie', '狼狽');
    return { whisper: '小叔一大早開著老爺的古董車想跑，直接撞上大門柱子。車頭全毀，人沒事。' };
  } },
];

// ================================================================ 動機轉折
// 目前是第幾個時段（0 起算），用來判斷「之後的時段」
const slotIndex = (S) => (S.day - 1) * 3 + S.slot;

// 白包的後果：偷的隔天早上，秋姨清點奠儀簿。誰背鍋要看當下誰最可疑。
function condolenceFallout(S) {
  const c = S.chars, pin = S.flags.case_condolence;
  if (pin === 'qianqian') {
    Engine.addState(S, 'qianqian', '狼狽'); S.flags.qianqianBlamed = true;
    return { whisper: '白包少了一包。有人說是芊芊拿去當直播抽獎的獎品，她氣到當場關台。', room: 'hall',
      scene: [L('qianqian', '我？偷白包？我一支業配就比那包多好嗎！'), L('ergu', '妳那個頻道，誰知道呢。')] };
  }
  if (pin === 'junjie' && c.junjie.motive !== '恐懼') {
    Engine.addState(S, 'junjie', '狼狽'); S.flags.junjieBlamed = true;
    c.uncle.hate.junjie = (c.uncle.hate.junjie || 0) + 1;
    return { whisper: '白包少了一包。大伯當眾質問小叔，小叔一直說他沒拿，可是沒有人相信他。', room: 'hall',
      scene: [L('uncle', '俊傑，是不是你？欠錢欠到連爸的白包都敢拿？'), L('junjie', '我沒有！我真的沒有！……我、我昨天是有喝一點啦……')] };
  }
  if (pin === 'me' || (S.flags.condolenceSeen && !pin))
    return { whisper: '（秋姨）奠儀簿少了一包。……有人跟我說，看到孫少爺在那附近。', room: 'hall',
      scene: [L('qiu', '白包少了一包。'), N('（秋姨沒有看任何人。但所有人都在看你。）')] };
  // 小叔已經借到錢、變成你的跟班 → 嫌疑落到二姑頭上（她破產的傳聞早就傳開了）
  if (pin === 'ergu' || (!pin && c.junjie.motive === '跟班' && c.ergu.motive !== '報復芊芊')) {
    Engine.addState(S, 'ergu', '狼狽'); S.flags.erguBlamed = true;
    Engine.setMotive(S, 'ergu', '報復芊芊'); S.flags.erguAngryAt = slotIndex(S);
    c.ergu.hate.qianqian = (c.ergu.hate.qianqian || 0) + 2;
    return { whisper: '白包少了一包。大家的眼神都飄向二姑——聽說她早就破產了。二姑當場摔了杯子，說一定是芊芊在背後亂傳。', room: 'hall',
      scene: [L('ergu', '看我幹什麼？你們以為我會偷白包？我們萬家的人——'), L('ergu', '……是芊芊對不對？是妳到處說我破產的！')] };
  }
  // 小叔已經在恐懼裡 → 被冤枉讓他崩潰，當晚翻牆跑了
  if (c.junjie.motive === '恐懼') {
    S.flags.junjieBlamed = true; c.junjie.gone = true;
    if (S.flags.keyStolen) S.flags.carGone = true;
    return { whisper: '白包少了一包，大伯當眾說是小叔偷的。小叔沒有辯解，當天晚上就翻牆跑了' + (S.flags.carGone ? '，連老爺的車一起。' : '。'), room: 'hall',
      scene: [L('uncle', '俊傑，是不是你？欠錢欠到連爸的白包都敢拿？'), L('junjie', '我、我沒有……算了。反正你們也不會信。')] };
  }
  // 預設：大家都知道小叔缺錢
  Engine.addState(S, 'junjie', '狼狽'); S.flags.junjieBlamed = true;
  c.uncle.hate.junjie = (c.uncle.hate.junjie || 0) + 1;
  return { whisper: '白包少了一包。大伯當眾質問小叔，小叔一直說他沒拿，可是沒有人相信他。', room: 'hall',
    scene: [L('uncle', '俊傑，是不是你？欠錢欠到連爸的白包都敢拿？'), L('junjie', '我沒有！我真的沒有！……我、我昨天是有喝一點啦……')] };
}

const TURNS = [
  { id: 'key_missing', if: (S) => S.items.carKey && S.flags.keyTakenAt !== undefined && Engine.slotIdx(S) > S.flags.keyTakenAt,
    run: () => ({ whisper: '（秋姨）車庫的鑰匙不見了。老爺的車，誰都不准動。' }) },
  { id: 'safe_found', if: (S) => S.flags.safeOpened, run: () => ({ whisper: '書房的保險箱被打開了，裡面空了。大伯在書房吼了一整個下午。' }) },
  { id: 'pudding_gone', if: (S) => S.flags.puddingAlone, run: () => ({}) },   // 群組訊息在 group.js
  { id: 'qiu_photo', if: (S) => S.chars.qiu.bond >= 2 && S.room === 'kitchen' && S.slot === 2 && S.chars.qiu.loc === 'kitchen', run: (S) => {
    S.flags.sawPhoto = true;
    return { room: 'kitchen', scene: [
      N('（深夜的廚房。秋姨坐在燈下，對著一張泛黃的照片說話。）'),
      N('（照片上是一個年輕人。長得……跟你很像。）'),
      L('qiu', '……阿明，你兒子回來了。長得跟你一模一樣。'),
    ] };
  } },
  { id: 'condolence', if: (S) => S.flags.condolenceDay && S.day > S.flags.condolenceDay && !S.chars.junjie.gone, run: condolenceFallout },
  { id: 'uncle_revenge', if: (S) => S.chars.uncle.disgraced && S.chars.uncle.motive === '奪權', run: (S) => {
    Engine.setMotive(S, 'uncle', '報復');
    return { whisper: '大伯在靈堂丟了臉，現在見誰都像仇人。' };
  } },
  { id: 'uncle_rush', if: (S) => S.chars.uncle.motive === '奪權'
      && ((S.items.page && slotIndex(S) >= 4) || (S.flags.pageBurned && S.day >= 3)), run: (S) => {
    Engine.setMotive(S, 'uncle', '急躁'); Engine.addState(S, 'uncle', '心虛');
    return { whisper: S.items.page
      ? '大伯發現帳本少了一頁，臉都白了。他現在整天守在書房，好像在找保險箱的鑰匙。'
      : '大伯這兩天一直在書房打轉。帳本燒掉了，他好像還在擔心保險箱裡的什麼東西。' };
  } },
  { id: 'kui_used', if: (S) => S.chars.kui.probed >= 2 && S.chars.kui.befriended === 0 && S.chars.kui.bond < 2, run: (S) => {
    Engine.setMotive(S, 'kui', '察覺被利用');
    if (S.chars.qiu.bond > 0) S.chars.qiu.bond--;
    return { whisper: '（秋姨）小葵哭著跟我說，孫少爺只是在利用她。我會記住的。' };
  } },
  { id: 'qiu_despair', if: (S) => Object.values(S.chars).filter(c => c.exposed).length >= 2 && S.chars.qiu.motive === '守護名聲', run: (S) => {
    Engine.setMotive(S, 'qiu', '心灰意冷');
    return { whisper: '秋姨今晚沒有收拾餐桌。她說，這個家已經不值得守了。' };
  } },
  { id: 'qq_proud', if: (S) => S.exposure >= 2 && S.chars.qianqian.motive === '爆紅', run: (S) => {
    Engine.setMotive(S, 'qianqian', '得意');
    return { whisper: '芊芊的頻道這兩天訂閱暴增。她說，這個家根本是素材寶庫。' };
  } },
  { id: 'qq_dilemma', if: (S) => S.flags.showedQQ && S.chars.qianqian.motive !== '親情vs流量' && !S.flags.qqDecided, run: (S) => {
    Engine.setMotive(S, 'qianqian', '親情vs流量'); Engine.unlockGoal(S, 'film');
    return { whisper: '芊芊今晚一支片都沒發。她一直盯著爸爸的房門。' };
  } },
];

// ================================================================ 深夜耳語的預告
// day 是「明天」；條件成立才講，讓玩家知道明天有個時機窗口
const FORESHADOW = [
  { day: 2, if: (S) => !S.items.page, t: '對了……大伯今天翻了好久的帳本，還問秋姨壁爐能不能用。' },
  { day: 3, if: (S) => !S.flags.lentJunjie, t: '小叔今天一直盯著手機，臉色好差。秋姨說，好像有人在找他討債。' },
  { day: 3, if: (S) => !S.items.carKey && !S.flags.lentJunjie, t: '車庫的車鑰匙一直掛在牆上耶……小叔今天問了我兩次車有沒有油。' },
  { day: 4, if: (S) => !S.flags.vaseHandled && S.chars.ergu.motive !== '投靠' && ['爆紅', '得意'].includes(S.chars.qianqian.motive),
    t: '芊芊說明天早上要在客廳開直播，主題是「萬家的傳家寶」。二姑那個花瓶好像也要入鏡。' },
  { day: 4, if: (S) => !S.items.necklace && S.chars.uncle.motive === '急躁', t: '大伯今天一直盯著我的項鍊看……明天晚上我要去書房打掃，有點怕。' },
];
function foreshadow(S) { return FORESHADOW.filter(f => f.day === S.day && f.if(S)).map(f => f.t); }

// ================================================================ 目標面板
// 一開始只有「還清學貸」；其他方向要深交、蒐集證據才會出現
function goals(S) {
  const c = S.chars, it = S.items, on = S.goalOn, out = [];
  const mark = (ok) => (ok ? '✔' : '✗');
  const money = Engine.fmt(S.money), left = Engine.slotsLeft(S);
  out.push({ title: '還清學貸', desc: '只要拿到錢，就不用再每天睡四個小時。',
    steps: [`💰 ${money} / ${W.MONEY.debt} 萬`, '遺產會怎麼分？要等第 5 天晚上宣讀才知道',
      '💡 遺產之外，這棟房子裡也有錢：靈堂的奠儀簿、客廳的古董、書房的保險箱……或是某個人的把柄',
      ...(S.stats.know >= 4 && !S.flags.willFlaw ? ['💡 書房桌上有一份遺囑副本。以你的學識，仔細看的話也許會發現什麼。'] : []),
      ...(S.flags.willFlaw ? ['✔ 你發現了遺囑的破綻：宣讀時可以主張代位繼承'] : [])] });
  if (on.escape) {
    const willing = Engine.kuiWilling(S), need = Math.max(0, 3 - c.kui.bond);
    out.push({ title: '和小葵一起離開', late: !willing && need > left,
      desc: '錢不用多。兩個人一起打拼，也許也可以。',
      steps: [`${mark(willing)} 小葵願意跟你走（唯一必要）`,
        ...(willing ? [] : [`💡 和她更熟（目前：${W.BOND[c.kui.bond]}，要到託付），或在她遇到危險的時候站在她身邊`]),
        '— 會讓離開比較順利 —',
        `${mark(it.carKey && !S.flags.carWrecked && !S.flags.carGone)} 車鑰匙`, `${mark(S.money >= W.MONEY.escape)} 跑路費 ${money} / ${W.MONEY.escape} 萬`,
        `${mark(S.flags.safeOpened)} 保險箱`, '任何一天晚上，從車庫的後門離開'] });
  }
  if (on.legal) out.push({ title: '正大光明地繼承', late: S.day === 5 && !it.will2 && !it.video && c.qiu.bond < 2 && c.qianqian.bond < 2,
    desc: '如果老爺真正的意思，和律師手上那份遺囑不一樣……',
    steps: [`${mark(it.will2 || it.video)} 證明老爺真意的東西（第二份遺囑，或老爺的影片）`,
      ...(it.will2 || it.video ? [] : ['💡 第二份遺囑：秋姨只交給「配得上的人」（託付、道德夠高、沒在她面前說過謊）', '💡 老爺的影片：在芊芊手上（和她更熟，或在她猶豫時勸她保護爸爸）']),
      `律師對你的印象：${['差', '普通', '不錯', '很好'][Math.max(0, Math.min(3, Engine.lawyerTrust(S) + 1))]}`,
      '💡 律師看重：你的道德、親戚們在靈堂出糗的次數；偷白包被看到會大扣分'] });
  const proofs = Engine.proofCount(S);
  if (on.revenge) {
    const lv = Object.values(S.cards), rumor = lv.filter(v => v === 1).length, clue = lv.filter(v => v === 2).length;
    out.push({ title: '讓這個家付出代價', desc: '每個人都有見不得人的事。只要證據夠多……',
      steps: [`${mark(proofs >= 3)} 實證 ${proofs} / 3${rumor + clue ? `（另外還有 ${clue} 個線索、${rumor} 個傳聞，要再查清楚）` : ''}`,
        '💡 證據可能在：書房的帳本、廚房的垃圾桶、客廳的花瓶、車庫的籠子……',
        '💡 試探可以把傳聞變成線索；實證通常要動手調查才拿得到',
        '宣讀遺囑時，當眾公開'] });
  }
  if (on.company) out.push({ title: '幫大伯保住公司', desc: '他是個爛人。但公司倒了，三百個員工也會跟著倒。',
    steps: [`${mark(Engine.lvl(S, 'uncle_embezzle') >= 3)} 挪用公款的實證（${S.flags.pageBurned && !it.page ? '帳本那一頁已經被燒掉了，只剩老爺的日記' : '帳本那一頁，或老爺的日記'}）`, '宣讀遺囑時，把證據交給大伯'] });
  if (on.daughter) out.push({ title: '替二姑說出真相', desc: '她死要面子，不會自己說。',
    steps: [`${mark(it.careReceipt)} 看護費的收據（書房的抽屜？）`, '宣讀遺囑時，當眾說出來'] });
  if (on.brothers) out.push({ title: '幫小叔翻身', desc: '每一間店倒掉，背後都是大伯。',
    steps: [`${mark(it.sabotage)} 大伯搞鬼的證據（試探大伯，或老爺的日記）`, '宣讀遺囑時，揭穿大伯'] });
  if (on.film) out.push({ title: '芊芊的選擇', desc: '她在猶豫要不要公開爸爸的事。',
    steps: [S.flags.qqDecided ? (S.flags.qqPublish ? '✔ 她決定公開' : '✔ 她決定保護爸爸') : '✗ 去勸她（公開，或保護爸爸）'] });
  if (on.name) out.push({ title: '守住老爺的名聲', desc: '奶奶守了這個家一輩子。',
    late: !it.will2 && (S.lies > 0 || S.stats.moral < 3),
    steps: [`${mark(it.will2)} 第二份遺囑${!it.will2 && S.lies > 0 ? '　（你在她面前說過謊。她不會交出來了）' : !it.will2 && S.stats.moral < 3 ? '　（她要交給道德夠高的人，你還不夠）' : ''}`, `${mark(it.diary || Engine.proofCount(S) >= 1)} 手上有醜事的證據（才有東西可以「燒掉」）`, '宣讀遺囑時，交出遺囑、燒掉日記'] });
  const pieces = [it.necklace, it.diary, it.will2, it.video, S.flags.grandmaKnown].filter(Boolean).length;
  if (on.mystery) out.push({ title: '老爺為什麼叫你回來？', desc: '一個從沒見過的爺爺，為什麼臨死前一定要找你？',
    steps: [`拼圖 ${pieces} / 5`,
      `${mark(it.necklace)} ${it.necklace ? '小葵的項鍊' : '一條形狀奇怪的項鍊'}`, `${mark(it.diary)} ${it.diary ? '老爺的日記' : '保險箱裡的東西'}`,
      `${mark(it.will2)} ${it.will2 ? '第二份遺囑' : '秋姨在守的東西'}`, `${mark(it.video)} ${it.video ? '老爺的最後一段影片' : '芊芊沒說出口的事'}`,
      `${mark(S.flags.grandmaKnown)} ${S.flags.grandmaKnown ? '秋姨的真實身分' : '秋姨看你的眼神'}`] });
  return out;
}

// ================================================================ 深夜耳語的旁白者
function whisperer(S) {
  return S.chars.kui.motive !== '察覺被利用' && !S.flags.necklaceLost ? 'kui' : 'qiu';
}

// ================================================================ 結局
function camera(S) {
  if (!S.flags.tookCondolence || S.flags.condolenceDay < 4 || S.chars.qianqian.bond >= 2 || S.flags.silencedQQ) return [];
  S.exposure += 2; S.flags.caughtOnCamera = true;   // 當著全家和律師的面被抓包 → 直接翻車
  return [L('qianqian', '在律師開始之前，我想先給大家看一段影片。'), N('（螢幕上，是你從奠儀簿裡抽出白包的畫面。靈堂裡一陣騷動。）'), SYS('📹 芊芊的攝影機錄到了你偷白包。')];
}
const READING_INTRO = [
  N('第五天・晚上。靈堂裡擠滿了人。'),
  L('lawyer', '各位，現在開始宣讀萬德福先生的遺囑。'),
];
const ENDINGS = {
  escape: { title: '攜美潛逃',
    sub: (S) => { const w = Engine.escapeWay(S); return (w.car ? '開著老爺的車' : w.money ? '搭夜車' : '走下山') + (w.early ? '・提早離開' : ''); },
    lines: (S) => {
      const w = Engine.escapeWay(S), out = [];
      if (w.car) out.push(N('你發動老爺的古董車。小葵坐在副駕，緊張得一直在笑。'));
      else if (w.money) out.push(N('你叫了一台計程車到火車站。小葵抱著小小的行李，在後座一直回頭看。'));
      else out.push(N('你們沒有車，也沒什麼錢。兩個人沿著山路走到山下，搭上最後一班公車。'));
      out.push(L('kui', '孫少爺……我們真的要走了嗎？'));
      if (w.safe) out.push(L('kui', '……那些錢，是老爺的吧？'), N('你沒有回答。她也沒有再問。'));
      if (w.early) out.push(N(`離宣讀遺囑還有 ${5 - S.day} 天。那份遺囑寫了什麼，你們永遠不會知道了。`));
      out.push(N(w.car ? '後照鏡裡，豪宅的燈一盞一盞亮起來。他們大概發現了。' : '回頭看，豪宅的燈還亮著。沒有人發現你們離開。'));
      out.push(N('學貸還是學貸，房租還是房租。'));
      out.push(N('但身邊多了一個人，好像就沒那麼可怕了。'));
      return out;
    } },
  legal: { title: '合法繼承', lines: (S) => [
    L('lawyer', '……這份遺囑的日期比較新。依法，以這份為準。'),
    N('老爺把公司和豪宅，留給了「唯一一個沒有為了遺產互相撕咬的人」。'),
    N('親戚們看著你的眼神，從看野狗，變成看仇人。'),
    N('你拿到了一切。也繼承了老爺當年的孤單。'),
  ] },
  mastermind: { title: '幕後黑手', lines: (S) => [
    N('你站起來，一個一個念出每個人的秘密。'),
    N('靈堂安靜得只剩下蠟燭燒的聲音。然後，所有人同時開始尖叫。'),
    L('lawyer', '……看來，遺囑的事，要等法院處理完再說了。'),
    N('萬家完了。而你，是唯一一個站著離開靈堂的人。'),
  ] },
  blessing: { title: '奶奶的祝福', sub: (S) => STORY.ENDINGS.escape.sub(S),
    lines: (S) => [
      N('你牽著小葵走到車庫的後門。門外，有一個人已經在等了。'),
      L('qiu', '……我就知道，你會從這裡走。'),
      N('秋姨把一個舊信封塞進你手裡。裡面是一疊鈔票，用橡皮筋綁得整整齊齊。'),
      L('qiu', '這是我存了一輩子的錢。本來，是要給你父親的。'),
      L('qiu', '……阿明的兒子。我是你奶奶。'),
      N('你還來不及說話，她已經轉身走回屋裡了。'),
      ...STORY.ENDINGS.escape.lines(S).slice(1),
    ],
    ep: { qiu: '她留在萬家。每年夏天，都會收到一張海邊的明信片，署名是「孫子和孫媳婦」。' } },
  keepName: { title: '守住老爺的名聲', lines: (S) => [
    L('lawyer', '……這份遺囑的日期比較新。依法，以這份為準。'),
    N('老爺把一切留給了你。條件只有一個：「好好照顧阿秋。」'),
    N('那天晚上，你在壁爐前燒掉了老爺的日記。大伯的公款、二姑的假古董、小叔的債，全都化成了灰。'),
    L('qiu', '……這樣好嗎？'),
    N('你沒有回答。你只是叫了她一聲「奶奶」。'),
  ], ep: {
    me: '你繼承了一切，也繼承了全家的秘密。每次大伯對你笑，你都知道他笑的背後是什麼。',
    qiu: '她終於以「奶奶」的身分，坐上了家族晚餐的主位。那本日記，再也沒有人提起。',
  } },
  documentary: { title: '真相紀錄片', lines: (S) => [
    N('律師還沒開口，芊芊就站了起來。她的手機架在三腳架上，直播已經開了。'),
    L('qianqian', '各位觀眾。接下來，是我們萬家真正的樣子。'),
    N('你和她一起，把每一份證據都攤在鏡頭前。觀看人數一路往上跳。'),
    N('大伯想搶手機，被芊芊推開了。那是她第一次推開她爸爸。'),
  ], ep: {
    me: '紀錄片《最後的遺囑》拿下了影展大獎。領獎那天，萬家沒有一個人來。',
    qianqian: '她改了名字。新的名字裡，沒有「萬」這個字。',
    uncle: '被起訴的那天，他在法院門口看見女兒的攝影機。他沒有躲。',
  } },
  saveCompany: { title: '保住公司', lines: (S) => [
    N('宣讀遺囑前，你把公款的證據塞進大伯的西裝口袋。'),
    L('uncle', '……你為什麼？'),
    N('你沒有回答。大伯看了你很久，最後只說了一句「我欠你一次」。'),
    N('遺產照舊捐給了流浪貓基金會。但隔週，你收到萬福集團的聘書：「特別顧問」。'),
  ], ep: {
    me: '你成了萬福集團的特別顧問。學貸還清了，但每次在文件上簽名，你都覺得那個名字很髒。',
    uncle: '公司保住了。他第一次在老爺的墓前，哭得像個孩子。',
    junjie: '又開了一間店，三個月後又倒了。這一次，你知道是誰做的。',
  } },
  daughter: { title: '最孝順的女兒', lines: (S) => [
    N('律師唸完遺囑，靈堂裡一片哀號。你站了起來，把一疊收據放在桌上。'),
    N('「老爺生病那三年，看護費每一筆，都是二姑付的。」'),
    N('所有人都轉頭看大伯。大伯的臉一陣青一陣白。'),
    L('ergu', '你……多管閒事！誰要你說的！'),
    N('她一邊罵，一邊哭花了妝。'),
  ], ep: {
    me: '二姑塞給你一個紅包，說是「封口費」。金額剛好付清這學期的學費。',
    ergu: '她成了萬家最受尊敬的長輩。她說你多管閒事，然後每個禮拜都約你吃飯。',
    uncle: '「連爸的看護費都不出的長子」。這句話跟了他一輩子。',
  } },
  brothers: { title: '兄弟創業', lines: (S) => [
    N('你把那份證據攤在桌上：小叔每一間店倒閉前，都有一筆從萬福集團流出去的「顧問費」。'),
    L('junjie', '……大哥，真的是你？'),
    N('大伯沒有否認。小叔站在那裡，很久很久，然後笑了。'),
    L('junjie', '好。那我這次，不靠家裡。'),
  ], ep: {
    me: '你們的店撐過了第一年。學貸還在，但你第一次覺得，自己在做一件有意思的事。',
    junjie: '新的店叫「不靠家裡」。你是股東，也是唯一的員工。',
    uncle: '他再也沒有跟你說過一句話。',
  } },
  reconcile: { title: '兄弟和解', lines: (S) => [
    N('你把兩件事一起說了出來：大伯挪用公款，是為了填老爺的洞；大伯搞垮小叔，是怕小叔離開這個家。'),
    L('junjie', '……你就這麼怕我走？'),
    L('uncle', '爸只會罵我。你是這個家裡，唯一還會叫我「大哥」的人。'),
    N('兩個中年男人在靈堂裡吵了半個小時，最後抱在一起哭。律師默默地把遺囑收了起來。'),
  ], ep: {
    me: '你什麼都沒分到。但那年過年，萬家第一次有人記得打電話叫你回去吃飯。',
    uncle: '他和小叔在老爺墓前喝了一整晚的酒。誰都沒有提公司的事。',
    junjie: '大哥投資了他的新店。這一次，店沒有倒。',
  } },
  fatherDaughter: { title: '父女', lines: (S) => [
    N('你把公款的證據交給了芊芊。她看了很久，最後沒有開直播。'),
    N('她走到大伯面前，把證據放在他手裡。'),
    L('qianqian', '爸。你自己說。'),
    N('大伯在所有人面前站了起來。他說了很久，聲音一直在抖。'),
  ], ep: {
    me: '你沒有拿到任何東西，學貸也還在。但芊芊說，你是她第一個「家人」。',
    uncle: '他辭去副董的位置，在記者面前鞠了很久的躬。那是他這輩子第一次低頭。',
    qianqian: '她的第一支沒有濾鏡的影片，拍的是爸爸在廚房裡，笨拙地煮了一碗麵。',
  } },
  truth: { title: '老爺的真意', lines: (S) => [
    N('律師先唸了第二份遺囑，然後，芊芊按下了播放鍵。'),
    N('螢幕上，是病床上的老爺。他瘦得幾乎認不出來。'),
    { who: 'lawyer', t: '（影片）「我這輩子，用錢把每個人綁在身邊。結果，一個真心的都沒有。」' },
    { who: 'lawyer', t: '（影片）「阿明是唯一一個不要我錢的人。所以我把他趕走了。我怕他變得跟我們一樣。」' },
    { who: 'lawyer', t: '（影片）「孫子，我叫你回來，不是要給你錢。是想讓你看看這個家變成什麼樣子——然後，你自己決定，要不要成為我們。」' },
    { who: 'lawyer', t: '（影片）「最後……替我跟阿秋說，對不起。」' },
    N('影片結束。靈堂裡，沒有一個人說話。'),
  ], ep: {
    me: '你繼承了一切。也繼承了老爺最後的那句話。',
    qiu: '你轉告了那句對不起。她沒有哭，只是說：「……他每次都這樣，太晚了。」',
  } },
  statutory: { title: '代位繼承', lines: (S) => [
    N('律師唸完，你舉起了手。'),
    ME_('這是一份代筆遺囑，卻只有一位見證人簽名。依民法第一一九四條，代筆遺囑需要三位以上的見證人。'),
    L('lawyer', '……這、這……'),
    N('靈堂一片譁然。遺囑無效，遺產依法分配——而你過世的父親那一份，由你代位繼承。'),
    N('大伯當場摔了茶杯。二姑笑了，笑完又哭了。'),
  ], ep: {
    me: '你拿到了父親那一份。學貸還清了，房東的訊息你也終於敢不回了。但從此，萬家每一場官司，被告欄上都有你的名字。',
    uncle: '他上訴了三次，三次都輸。',
    qiu: '她聽說之後，只說了一句：「阿明的兒子，果然像他。」',
  } },
  cats: { title: '流浪貓', lines: (S) => [
    L('lawyer', '「本人全部遺產，捐贈給萬德福流浪貓基金會。」'),
    N('靈堂裡一片死寂。接著，二姑昏倒了。'),
    N('你什麼也沒拿到。離開的時候，一隻橘貓跟著你走出大門。'),
    N('……至少，你沒有傷害任何人。'),
  ] },
  fiasco: { title: '翻車喜劇', lines: (S) => [
    N('律師還沒開口，大伯就指著你大吼。'),
    L('uncle', '就是他！這幾天搞得全家雞犬不寧的，就是這個野種！'),
    N('所有人都轉過來看你。你做過的每一件事，他們好像都知道了。'),
    N('你翻過後院的圍牆，褲子被勾破了一大塊。身後傳來小叔的叫聲：「別跑！先還錢！」'),
  ] },
};

// ================================================================ 結局圖鑑
// blurb：看過之後顯示的一句話；hint：還沒看過時的提示（指方向，不給答案）
const GALLERY = [
  { id: 'escape',         blurb: '帶著小葵，從後門離開。', hint: '和某個想離開這棟房子的人……' },
  { id: 'blessing',       blurb: '有人在後門等你，把一輩子的積蓄塞進你手裡。', hint: '要離開的那晚，也許會有人來送你。' },
  { id: 'legal',          blurb: '老爺真正的意思，寫在另一份遺囑裡。', hint: '老爺真正的意思，也許寫在別的地方。' },
  { id: 'keepName',       blurb: '你燒掉了老爺的日記，守住了奶奶。', hint: '有些秘密，燒掉比較好。' },
  { id: 'documentary',    blurb: '你和芊芊，把萬家拍成了一部紀錄片。', hint: '真相，要有人拍下來。' },
  { id: 'saveCompany',    blurb: '你把證據塞進大伯的口袋，成了共犯。', hint: '他是個爛人。但也許，不只是個爛人。' },
  { id: 'daughter',       blurb: '你說出了是誰付的看護費。', hint: '這個家最死要面子的人……' },
  { id: 'brothers',       blurb: '你和小叔，開了一間「不靠家裡」。', hint: '每一間店倒掉，背後都是同一個人。' },
  { id: 'reconcile',      blurb: '兩個中年男人，在靈堂抱頭痛哭。', hint: '兩兄弟之間，需要有人同時說出兩件事。' },
  { id: 'fatherDaughter', blurb: '芊芊選擇不拍。她爸爸第一次低頭。', hint: '她可以選擇不拍。' },
  { id: 'truth',          blurb: '老爺最後的話，終於被聽見了。', hint: '遺囑和影片，缺一不可。' },
  { id: 'statutory',      blurb: '那份遺囑無效。你拿回了父親的那一份。', hint: '那份遺囑，真的有效嗎？' },
  { id: 'mastermind',     blurb: '你一個一個念出了所有人的秘密。', hint: '每個人都有見不得人的事。' },
  { id: 'cats',           blurb: '遺產給了流浪貓。你帶了一隻回家。', hint: '什麼都不做，也是一種結局。' },
  { id: 'fiasco',         blurb: '你翻過圍牆，褲子破了一大塊。', hint: '做壞事，記得別被看到。' },
];
// 人物頁：和每個人有關的結局
const GALLERY_CHAR = {
  uncle: ['saveCompany', 'reconcile', 'fatherDaughter'],
  ergu: ['daughter'],
  junjie: ['brothers', 'reconcile'],
  qianqian: ['documentary', 'fatherDaughter', 'truth'],
  qiu: ['legal', 'keepName', 'blessing', 'truth'],
  kui: ['escape', 'blessing'],
};

// 每個人的後日談（依最後的狀態決定）
function epilogues(S, ending) {
  // 奶奶的祝福＝私奔的後日談，只有秋姨不同
  if (ending === 'blessing') {
    const o = epilogues(S, 'escape');
    o.forEach(e => { if (ENDINGS.blessing.ep[e.who]) e.t = ENDINGS.blessing.ep[e.who]; });
    return o;
  }
  const c = S.chars, out = [];
  const E = (who, t) => out.push({ who, t });
  const rich = S.money >= W.MONEY.debt;
  // 你
  if (ending === 'escape') {
    const w = Engine.escapeWay(S);
    E('me', (rich ? '學貸一次還清，你們在海邊開了一間小小的早餐店。'
      : w.money ? '錢不夠還清學貸，但夠租一間看得到海的小套房。你們各打一份工。'
      : '身上只有幾千塊。你們在海邊小鎮各打兩份工。很累，但你第一次覺得，辛苦是有意義的。')
      + (w.car ? '老爺的古董車還上了社會新聞，標題是「豪門私生孫偷車私奔」。' : ''));
  }
  else if (ending === 'legal') E('me', '學貸一次還清，你封鎖了房東。……然後發現，在空蕩蕩的豪宅裡，沒有人可以傳訊息給你。');
  else if (ending === 'mastermind') E('me', rich ? '你還清了學貸，卻再也睡不好覺。' : '萬家完了。你的學貸還在。');
  else if (ending === 'cats') E('me', Object.values(c).some(x => x.bond >= 2)
    ? '你沒拿到遺產，學貸也還在。但手機通訊錄裡，多了幾個「家人」。……還有一隻橘貓。'
    : '你回到分租雅房。房東漲了房租，你多兼了一份差。……現在，還多了一隻橘貓要養。');
  else E('me', '你連夜逃回雅房，發現門鎖被換了。房東說，下個月的房租，現在就要。');
  // 大伯
  if (ending === 'mastermind' && S.flags.uncleTruth) E('uncle', '他沒有反駁。只說了一句「爸說得對，我果然不配」，然後一個人走出靈堂。');
  else if (c.uncle.exposed || ending === 'mastermind') E('uncle', '被董事會趕下台。最後一次出現在新聞上，是在法院門口被記者包圍。');
  else if (S.flags.uncleTruth) E('uncle', '公司保住了。有人看到他一個人在老爺的墓前，哭得像個孩子。');
  else E('uncle', '繼續當他的副董。每年老爺的忌日，他都是第一個到的。');
  // 二姑
  if (S.flags.erguTruth && !c.ergu.exposed) E('ergu', '她把看護費的收據全部燒了。到現在，還是沒有人知道那三年是誰付的錢。');
  else if (S.flags.erguBlamed && !c.ergu.exposed) E('ergu', '白包的事，她到死都認定是芊芊陷害她。兩個人再也沒說過話。');
  else if (c.ergu.exposed) E('ergu', '社交圈再也沒有人邀請她。聽說她在夜市開了一間小酒館，生意意外地好。');
  else E('ergu', '繼續撐著。名牌包的邊角，又磨破了一點。');
  // 小叔
  if (S.chars.junjie.gone) E('junjie', '被冤枉的那天晚上，他翻牆跑了。之後只寄回來一張明信片，上面寫著：「我真的沒拿。」');
  else if (S.flags.lentJunjie) E('junjie', '用你借的錢還了一部分債。他到現在還是沒還你錢，但每年都會寄珍奶給你。');
  else if (S.flags.carWrecked) E('junjie', '撞爛古董車之後，他被債主找到了。據說現在在遠洋漁船上「創業」。');
  else if (S.flags.junjieTruth) E('junjie', '他終於離開了大伯的陰影。新的店叫「不靠家裡」，開幕那天你收到了邀請函。');
  else if (S.flags.junjieBlamed && S.flags.confessed) E('junjie', '你當眾替他洗清冤屈的那天，他哭得比喪禮那天還慘。之後每次見面，他都叫你「恩人」。');
  else if (S.flags.junjieBlamed) E('junjie', '到最後，他都以為那包白包是自己喝醉的時候拿的。');
  else E('junjie', '又開了一間店。三個月後倒了。');
  // 芊芊
  if (S.items.video && ending === 'legal') E('qianqian', '她刪掉了頻道。現在在念紀錄片研究所，第一部作品拍的是爺爺。');
  else if (ending === 'mastermind') E('qianqian', '那一晚的直播破了一千萬觀看。她得到了想要的一切，卻再也沒回過家。');
  else E('qianqian', '頻道的訂閱數持續成長。她還是一次都沒有拍過家人的臉。');
  // 秋姨
  if (c.qiu.motive === '託付' && ending === 'legal') E('qiu', '她留在豪宅，繼續每天擦那個空了的保險箱。偶爾，她會對著你笑。');
  else if (ending === 'escape') E('qiu', S.day < 5 ? '你們走的那天晚上，廚房的燈一直亮著。隔天早上，冰箱裡少了兩個布丁。' : '你走後，她一個人收拾了整棟房子。最後關上大門的，是她。');
  else if (c.qiu.motive === '心灰意冷') E('qiu', '宣讀遺囑的隔天，她就辭職了。沒有人知道她去了哪裡。');
  else E('qiu', '她繼續守著這個家。守著一個已經沒有老爺的家。');
  // 小葵
  if (ending === 'escape') E('kui', S.flags.safeOpened ? '她終於看到了海。只是偶爾，她會看著那袋錢發呆。' : '你們在海邊的小鎮住了下來。她終於看到了海，而且每天都看。');
  else if (c.kui.motive === '察覺被利用') E('kui', '她再也不跟你說話了。實習期滿，她離開了萬家，沒有留下聯絡方式。');
  else if (S.flags.necklaceLost) E('kui', '她一直沒有拿回那條項鍊。有時候，她會下意識地摸摸空空的脖子。');
  else E('kui', '她繼續在萬家當女僕。偶爾會在廚房，偷偷留一個布丁給你。');
  // 結局專屬的後日談覆寫
  const ov = ENDINGS[ending] && ENDINGS[ending].ep;
  if (ov) out.forEach(e => { if (ov[e.who]) e.t = ov[e.who]; });
  // 流浪貓：你什麼都沒拿到，但交心過的人會來找你
  if (ending === 'cats') out.forEach(e => { if (e.who !== 'me' && c[e.who].bond >= 2 && CONTACT[e.who]) e.t = CONTACT[e.who]; });
  // 你在關鍵時刻的回應，會在後日談留下一句
  if (window.DIALOGUE) out.forEach(e => { if (e.who !== 'me') { const x = DIALOGUE.epiAppend(S, e.who, ending); if (x) e.t += x; } });
  return out;
}
const CONTACT = {
  kui: '幾個月後，你在超商值大夜班時，她推門進來：「孫少爺！我辭職了！……這裡還缺人嗎？」',
  junjie: '每個月都寄一箱珍奶給你，附上紙條：「兄弟，下次一定成功。」',
  qiu: '你收到一盒布丁，沒有署名。紙條上的字跡，和冰箱上那張便條一模一樣。',
  qianqian: '她的新影片標題是〈我那個什麼都沒拿到的堂哥〉。留言區都在罵她，也有人說想認識你。',
  uncle: '某天你收到萬福集團的錄取通知。人事主管的簽名欄上，寫著萬國棟。',
  ergu: '她的小酒館開張那天，寄了邀請函給你：「姑姑請客，不准不來。」',
};

// ================================================================ 差一點（結局畫面的提示，告訴玩家這局最接近哪條路）
// 回傳 [{ near: 越小越接近, t: 提示 }]，畫面上顯示最接近的兩條
function nearMiss(S, ending) {
  const c = S.chars, it = S.items, out = [];
  const add = (near, t) => out.push({ near, t });
  if (ending !== 'escape') {
    if (Engine.kuiWilling(S)) add(0, '小葵其實願意跟你走。車庫的後門，每天晚上都開著。');
    else if (c.kui.bond >= 1) add(3 - c.kui.bond, `和小葵的關係，再 ${3 - c.kui.bond} 步就能一起離開了。`);
  }
  if (ending !== 'legal') {
    if (it.will2 || it.video) add(0, '你手上明明有證明老爺真意的東西。也許律師需要對你多一點信任。');
    else if (c.qiu.bond >= 3 && S.flags.qiuWaiting) add(1, '秋姨還在等一個「配得上的人」。她在意的是道德，和你有沒有說過謊。');
    else if (c.qiu.bond >= 1) add(3 - c.qiu.bond, `秋姨好像有東西要交給你。再和她熟 ${3 - c.qiu.bond} 步看看。`);
    else if (c.qianqian.bond >= 1) add(3 - c.qianqian.bond, `芊芊好像知道什麼關於爺爺的事。再和她熟 ${3 - c.qianqian.bond} 步看看。`);
  }
  const f = S.flags;
  if (f.uncleTruth && Engine.lvl(S, 'uncle_embezzle') < 3 && !['saveCompany', 'reconcile'].includes(ending)) add(1, '你知道大伯的苦衷。手上要是有公款的實證，也許能幫他一把。');
  if (f.erguTruth && !it.careReceipt && ending !== 'daughter') add(1, '二姑付看護費的事，要有證據才說得出口。書房的抽屜裡，也許有收據。');
  if (f.junjieTruth && !it.sabotage && !['brothers', 'reconcile'].includes(ending)) add(1, '小叔說大伯在搞鬼。試著去試探大伯，也許能套出證據。');
  if (c.qiu.bond >= 3 && !f.grandmaKnown) add(1, '秋姨好像還有話沒說。老爺的日記，或深夜的廚房，也許有答案。');
  if (c.qianqian.motive === '親情vs流量' && !f.qqDecided) add(1, '芊芊一直在猶豫要不要公開。也許她只是需要有人推一把。');
  const proofs = Engine.proofCount(S);
  if (ending !== 'mastermind' && proofs >= 1 && proofs < 3) add(3 - proofs, `你手上有 ${proofs} 個實證，再 ${3 - proofs} 個就能讓這個家付出代價。`);
  if (ending === 'fiasco') add(-1, S.flags.caughtOnCamera ? '芊芊在靈堂裝了攝影機。和她熟一點，她會先提醒你。'
    : S.exposure >= 4 ? '你做的壞事被太多人看到了。動手之前，先確認房間裡沒有人。'
    : '你樹敵太多了。被兩個人以上敵視，宣讀那天就會出事。');
  if (ending === 'cats' && S.stats.know === 3) add(2, '如果你的學識再高一點，也許看得出那份遺囑有什麼問題。');
  if (ending !== 'statutory' && S.stats.know >= 4 && !S.flags.willFlaw) add(1, '書房桌上那份遺囑副本，你仔細看過了嗎？以你的學識，也許會發現它的破綻。');
  if (!out.length && ending === 'cats') add(9, '這一局，你誰都沒有深交。試著和某個人多聊聊、多示好看看。');
  return out.sort((a, b) => a.near - b.near).slice(0, 2).map(x => x.t);
}

return { CASES, SCENE_CHANGES, DRINK, INTERLUDES, MISHAP, SPECIALS, PREREAD, GALLERY, GALLERY_CHAR, nearMiss, SHOW_QQ, PERSUADE, GOAL_TITLE, INTRO, MOMENTS, KUI_DREAM, QUESTIONS, profile, foreshadow, goals, ARRIVE, greet, chat, hasChat, CMD_HELP, cmd, BONDS, HOTSPOTS, timeline: TIMELINE, turns: TURNS, whisperer, camera, READING_INTRO, ENDINGS, epilogues };
})();
