// 萬家家族群組「萬家相親相愛一家人」的訊息
// 事件發生時，群組裡也會跟著吵起來。成員：大伯、二姑、小叔、芊芊、秋姨、你（第一天被芊芊拉進來）
//
// 訊息格式：
//   [角色id, '文字']                  一般訊息
//   [角色id, '文字', 'sticker']       長輩圖（用卡片顯示）
//   [角色id, '文字', 'media']         影片、錄音檔
//   [角色id, '文字', 'recall']        傳出去又收回（只顯示「已收回訊息」，滑鼠移上去看得到原文）
//   ['sys', '文字']                    系統訊息（加入、退出、已讀……）
window.GROUP = (() => {
'use strict';

// 遊戲開始：芊芊把你拉進群組
const WELCOME = [
  ['sys', '芊芊 將 你 加入群組'],
  ['uncle', '？'],
  ['ergu', '這位是？'],
  ['qianqian', '爺爺的孫子啦 你們都不看新聞喔'],
  ['junjie', '歡迎歡迎！！！要不要投資珍奶！！'],
  ['uncle', '俊傑'],
  ['junjie', '好啦'],
  ['sys', '秋姨 已讀'],
];

// 每天早上：二姑的長輩圖
const MORNING = {
  2: [['ergu', '🌸 早安 🌸\n人生就像一杯茶\n不會苦一輩子\n但總會苦一陣子', 'sticker'], ['junjie', '早安二姊！'], ['sys', '已讀 4']],
  3: [['ergu', '🌻 平安喜樂 🌻\n心若向陽\n無畏悲傷', 'sticker'], ['qianqian', '二姑 這張昨天傳過了']],
  4: [['ergu', '🍵 早安 🍵\n家和萬事興\n吵架傷感情', 'sticker'], ['sys', '已讀 2']],
  5: [['ergu', '🙏 祝福 🙏\n今天是重要的日子\n願大家心想事成', 'sticker'], ['uncle', '今晚七點 靈堂 宣讀遺囑 請準時'], ['junjie', '收到！！'], ['qianqian', '我會開直播（開玩笑的）'], ['uncle', '芊芊']],
};

// 事件 → 群組訊息（key 是事件的 id；可以是陣列，或依狀態回傳陣列的函式）
const ON = {
  d1_drunk: [
    ['ergu', '俊傑的珍奶 好好喝喔 哈哈哈哈哈哈', 'recall'],
    ['ergu', '傳錯群組'],
    ['junjie', '……'],
  ],
  d2_burn: [
    ['qianqian', '爸 你剛剛在客廳燒什麼 好香'],
    ['uncle', '紙錢'],
    ['qianqian', '今天沒有人買紙錢喔'],
    ['sys', '大伯 已讀'],
  ],
  d3_debt: [
    ['junjie', '請問群組有人可以借我兩萬嗎 急', 'recall'],
    ['junjie', '請問群組有人可以借我一萬嗎'],
    ['ergu', '俊傑你又來了'],
    ['uncle', '不要在家族群組借錢'],
  ],
  d3_key: [
    ['qiu', '車庫的鑰匙，請物歸原處。'],
    ['sys', '已讀 4'],
  ],
  d4_stream: [
    ['qianqian', '[影片] 萬家傳家寶開箱 🔥 觀看次數 52 萬', 'media'],
    ['ergu', '芊芊妳給我刪掉！！！！', 'recall'],
    ['ergu', '芊芊 刪掉'],
    ['junjie', '底下寫 Made in 什麼 我看不清楚'],
    ['ergu', '俊傑你閉嘴'],
  ],
  ergu_revenge: [
    ['ergu', '[錄音檔] 國棟在爸病床前說的話', 'media'],
    ['uncle', '美鳳 妳夠了'],
    ['junjie', '哇'],
    ['qianqian', '已存'],
  ],
  d5_crash: [
    ['junjie', '請問古董車的保險有包括大門嗎'],
    ['uncle', '俊傑你給我回來'],
    ['qianqian', '大門的柱子還好嗎'],
  ],
  condolence: (S) => {
    if (S.flags.condolenceSeen) return [['ergu', '有人偷白包 太丟臉了 🙏'], ['qianqian', '聽說有人看到是誰喔 👀'], ['sys', '已讀 5']];
    if (S.flags.erguBlamed) return [['ergu', '我們萬家的人 不偷白包'], ['ergu', '芊芊 是不是妳在外面亂講我破產'], ['qianqian', '？？？'], ['qianqian', '我什麼都沒說'], ['ergu', '（已退出群組）', 'recall'], ['sys', '二姑 重新加入群組']];
    if (S.chars.junjie.gone) return [['uncle', '俊傑 出來說清楚'], ['sys', '小叔 已退出群組']];
    return [['ergu', '有人偷白包 太丟臉了 🙏'], ['uncle', '俊傑 出來說清楚'], ['junjie', '不是我！！！！'], ['junjie', '我昨天是有喝一點啦', 'recall']];
  },
  uncle_revenge: [
    ['uncle', '有些人 不要以為我不知道你在做什麼'],
    ['junjie', '大哥你在說我嗎'],
    ['uncle', '不是你'],
  ],
  uncle_rush: [
    ['uncle', '請問有人看到爸的印章嗎'],
    ['qianqian', '爸你要印章幹嘛'],
    ['sys', '大伯 已讀'],
  ],
  qq_dilemma: [
    ['sys', '芊芊 正在輸入……'],
    ['sys', '芊芊 正在輸入……'],
  ],
  pudding_gone: (S) => [
    ['qiu', '冰箱的布丁，是誰吃的。'],
    ['qianqian', '不是我 我在減肥'],
    ...(S.chars.junjie.gone ? [] : S.flags.puddingJunjie
      ? [['junjie', '我發誓不是我！！！'], ['junjie', '我只吃了一半', 'recall']]
      : [['junjie', '我發誓不是我！！！']]),
    ['uncle', '這種小事不要發群組'],
    ['ergu', '我們家有布丁？'],
    ['qiu', '那是小葵的。'],
    ['sys', '已讀 5'],
  ],
  qiu_despair: [
    ['qiu', '明天的早餐，請各位自理。'],
    ['junjie', '秋姨？？'],
    ['sys', '已讀 5'],
  ],
};

// 你做的壞事被看到時（可疑度上升）
const SUSPICIOUS = [
  ['qianqian', '今天有人鬼鬼祟祟的喔 👀'],
  ['ergu', '誰？'],
  ['qianqian', '不告訴你'],
];

// ================================================================ 你在群組發言（每天晚上一次）
// on：今天群組裡發生過的事（事件 id、'welcome'、'morning'、'susp'、'peacock'）；'any' 永遠可以選
// msg：你發的訊息；replies：大家的回應；fx：效果（回傳要顯示的系統提示）
// 群組是公開的：一句話會同時影響好幾個人
const relax = (S, id, n = 1) => { S.chars[id].hostile = Math.max(0, S.chars[id].hostile - n); };
const REPLIES = [
  { on: 'welcome', label: '大家好，請多指教 🙇', msg: '大家好，請多指教 🙇',
    replies: [['junjie', '歡迎！！！'], ['ergu', '還算有禮貌'], ['sys', '大伯 已讀']], fx: (S) => { relax(S, 'ergu'); return '二姑覺得你還算有禮貌。'; } },
  { on: 'welcome', label: '（傳一張自拍）', stat: 'charm', min: 4, msg: '[照片] 自拍',
    replies: [['qianqian', '可以喔 很上鏡'], ['ergu', '果然是我們萬家的人 😍'], ['uncle', '……']], fx: (S) => { relax(S, 'ergu'); relax(S, 'qianqian'); return '二姑和芊芊對你的印象變好了。'; } },

  { on: 'morning', label: '回「早安 🌸」', msg: '早安 🌸',
    replies: [['ergu', '還是你有禮貌 🙏'], ['junjie', '早安！！（跟風）']], fx: (S) => { relax(S, 'ergu'); return '二姑對你的敵意 −1。'; } },
  { on: 'morning', label: '回傳一張更花的長輩圖', msg: '🌺🌺 早安 🌺🌺\n福如東海長流水\n壽比南山不老松\n天天開心沒煩惱', kind: 'sticker',
    replies: [['ergu', '哎呀好漂亮！！！我要轉傳'], ['junjie', '我也要！！'], ['qianqian', '？？？']],
    fx: (S) => { relax(S, 'ergu', 2); S.flags.stickerFriend = true; return '二姑非常開心。……她以後每天都會 tag 你。'; } },

  { on: 'condolence', when: (S) => S.flags.junjieBlamed && !S.chars.junjie.gone, label: '「不是小叔，我可以作證」', msg: '不是小叔，我可以作證',
    replies: [['junjie', '😭😭😭 恩人'], ['uncle', '你憑什麼作證？'], ['sys', '秋姨 已讀']],
    fx: (S) => { relax(S, 'junjie', 3); S.chars.uncle.hostile++; S.flags.defendedJunjie = true; return '小叔把你當成恩人。大伯覺得你多管閒事（大伯敵意 +1）。'; } },
  { on: 'condolence', label: '「真的很過分」', msg: '真的很過分',
    replies: [['ergu', '對啊 🙏']], fx: () => '你跟著大家一起罵。沒有人注意到你。' },
  { on: 'condolence', when: (S) => S.flags.junjieBlamed && !S.chars.junjie.gone, label: '「我昨晚好像看到二姑在靈堂……」', stat: 'guile', min: 4,
    msg: '我昨晚好像看到二姑在靈堂……不知道是不是我看錯',
    replies: [['ergu', '你說什麼？？？'], ['uncle', '美鳳？'], ['junjie', '！！！']],
    fx: (S) => { S.chars.junjie.hostile = 0; S.chars.ergu.hostile += 2; S.lies++; S.exposure++; S.chars.uncle.hate.ergu = (S.chars.uncle.hate.ergu || 0) + 1;
      return '⚠ 公開嫁禍：小叔的嫌疑轉到二姑身上。二姑恨你（敵意 +2），可疑度 +1。'; } },

  { on: 'd3_debt', label: '「小叔，我私訊你」', msg: '小叔，我私訊你',
    replies: [['junjie', '！！！兄弟！！！'], ['uncle', '不要借他']], fx: (S) => { relax(S, 'junjie'); return '小叔私訊你：「借我兩萬，下禮拜還」。（明天找他就可以借錢給他）'; } },
  { on: 'd3_debt', label: '「小叔加油 💪」', msg: '小叔加油 💪', replies: [['junjie', '謝謝……']], fx: () => '小叔好像有點失望。' },

  { on: 'd4_stream', label: '「芊芊，刪掉吧，給二姑留點面子」', msg: '芊芊，刪掉吧，給二姑留點面子',
    replies: [['ergu', '……謝謝'], ['qianqian', '好啦 但我已經賺到觀看了']], fx: (S) => { relax(S, 'ergu', 2); S.chars.qianqian.hostile++; return '二姑很感激（敵意 −2）。芊芊有點不爽（敵意 +1）。'; } },
  { on: 'd4_stream', label: '（按讚）', msg: '👍',
    replies: [['ergu', '誰按讚的！！！！'], ['qianqian', '謝謝支持 🥰']], fx: (S) => { S.chars.ergu.hostile++; relax(S, 'qianqian'); return '芊芊很開心。二姑記住你了（敵意 +1）。'; } },

  { on: 'ergu_revenge', label: '「大家冷靜一點」', msg: '大家冷靜一點', replies: [['junjie', '對啊冷靜'], ['sys', '大伯 已讀']], fx: () => '沒有人理你。' },
  { on: 'ergu_revenge', label: '「爸都走了，不要再互相傷害了」', stat: 'moral', min: 4, msg: '爸都走了，不要再互相傷害了',
    replies: [['qiu', '……孫少爺說得對。'], ['ergu', '……'], ['uncle', '……']], fx: (S) => { relax(S, 'uncle'); relax(S, 'ergu'); S.flags.respect = true; return '群組安靜了很久。秋姨第一次在群組裡說話。'; } },

  { on: 'uncle_revenge', label: '「大伯，您在說我嗎？」', msg: '大伯，您在說我嗎？', replies: [['uncle', '你自己心裡清楚']], fx: (S) => { S.chars.uncle.hostile++; return '大伯的敵意 +1。'; } },

  { on: 'susp', label: '「是誰啊？好可怕」', msg: '是誰啊？好可怕', replies: [['qianqian', '你說呢 😏']], fx: () => '芊芊好像知道什麼。' },
  { on: 'susp', label: '「可能是小偷吧，最近不太平靜」', stat: 'guile', min: 4, msg: '可能是小偷吧，最近外面不太平靜',
    replies: [['ergu', '真的嗎好可怕'], ['junjie', '我要把孔雀關好']], fx: (S) => { S.exposure = Math.max(0, S.exposure - 1); return '大家的注意力被帶開了（可疑度 −1）。'; } },

  { on: 'peacock', label: '「孔雀好漂亮 😂」', msg: '孔雀好漂亮 😂', replies: [['junjie', '對吧！！！'], ['uncle', '俊傑']], fx: (S) => { relax(S, 'junjie'); return '只有小叔很開心。'; } },

  { on: 'pudding_gone', label: '「是我吃的，對不起 🙇」', msg: '是我吃的 對不起 🙇',
    replies: [['junjie', '哈哈哈哈哈 勇者'], ['qianqian', '截圖了'], ['sys', '秋姨 已讀']],
    fx: (S) => { S.flags.puddingConfessed = true; return '秋姨已讀了很久，沒有回。……也許她有話想私下跟你說。'; } },
  { on: 'pudding_gone', label: '「我也不知道耶」', msg: '我也不知道耶',
    replies: [['qiu', '嗯。']],
    fx: (S) => { S.flags.puddingLied = true; S.chars.kui.hostile++; return '秋姨沒有再追問。……小葵被唸了一頓（小葵敵意 +1）。'; } },
  { on: 'pudding_gone', when: (S) => !S.chars.junjie.gone, label: '「應該是小叔吧」', stat: 'guile', min: 4, msg: '應該是小叔吧 他最愛吃甜的',
    replies: [['junjie', '？？？？？'], ['uncle', '俊傑'], ['ergu', '俊傑你幾歲了'], ['junjie', '不是我啦！！！！']],
    fx: (S) => { S.chars.junjie.hostile++; S.lies++; return '大家都信了。小叔百口莫辯（小叔敵意 +1）。……你又說了一個謊。'; } },
  { on: 'd5_crash', label: '「R.I.P. 大門柱子」', msg: 'R.I.P. 大門柱子 🕯️', replies: [['qianqian', '哈哈哈哈哈哈'], ['junjie', '你們好過分']], fx: (S) => { relax(S, 'qianqian'); return '芊芊笑了。'; } },

  { on: 'any', label: '（已讀不回）', msg: null, replies: [], fx: () => null },
];

return { WELCOME, MORNING, ON, SUSPICIOUS, REPLIES };
})();
