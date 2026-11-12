// 頭像表情：在 48px 小人的臉上，只改眉毛、眼睛、嘴巴那幾格（跟眨眼同一招）
// 格式：[y, x, 字串, x, 字串…]，'.' 不改；顏色字母沿用各角色自己的調色盤
// 臉的位置：遠側眼睛 x19～21、近側眼睛 x24～26、嘴巴在第 24 列附近（二姑整張臉往上 2 格）
// 表情：smile 笑、angry 生氣、shock 驚訝、sad 難過（normal 就是原本的臉）
window.EXPR = {
  uncle: {   // 金框眼鏡在第 20～22 列，八字鬍第 24 列，嘴第 25 列
    smile: [[21, 19, 'tt', 24, 'tt'], [25, 20, 'uuuu']],
    angry: [[18, 19, 'c', 26, 'c'], [19, 19, 'scc', 24, 'ccs'], [25, 21, 'KK']],
    shock: [[18, 19, 'ccc', 24, 'ccc'], [19, 19, 'sss', 24, 'sss'], [21, 19, 'wL', 24, 'Lw'], [25, 21, 'KK'], [26, 21, 'KK']],
    sad:   [[18, 21, 'c', 24, 'c'], [19, 19, 'ccs', 24, 'scc'], [21, 19, 'tL', 24, 'Lt'], [25, 21, 'ss'], [26, 21, 'uu']],
  },
  ergu: {    // 長睫毛第 18 列、瞳孔第 19 列、紅唇第 22 列
    smile: [[18, 19, 'tttt', 24, 'ttttt'], [19, 19, 'LLLL', 24, 'LLLL'], [22, 21, 'RRRR']],
    angry: [[19, 18, 'ssJJsssJJs'], [22, 21, 'uRRu']],
    shock: [[18, 19, 'tLLt', 24, 'tLLLt'], [19, 19, 'LJIL', 24, 'LJIL'], [20, 20, 'LL', 25, 'LL'], [22, 22, 'RR'], [23, 22, 'RR']],
    sad:   [[18, 19, 'ttLL', 24, 'LLttt'], [20, 19, 'x'], [21, 19, 'x'], [22, 22, 'tR']],
  },
  junjie: {  // 眼皮第 20 列、眼白＋瞳孔第 21 列、嘴第 24 列（第 23 列 x24 是痞笑的嘴角）
    smile: [[20, 19, 'sss', 24, 'sss'], [21, 19, 'LsL', 24, 'LsL'], [23, 24, 's'], [24, 20, 'uxxxu']],
    angry: [[20, 19, 'sLL', 24, 'LLs'], [21, 19, 'xJs', 24, 'sJx'], [23, 24, 's'], [24, 21, 'uuu']],
    shock: [[20, 19, 'LLL', 24, 'LLL'], [21, 19, 'xJx', 24, 'xJx'], [22, 19, 'LLL', 24, 'LLL'], [23, 24, 's'], [24, 21, 'uu'], [25, 21, 'uu']],
    sad:   [[20, 19, 'ssL', 24, 'Lss'], [21, 19, 'xJs', 24, 'sJx'], [23, 24, 's'], [24, 21, 'sus']],
  },
  qianqian: { // 動漫大眼：第 20～22 列，嘴第 24 列
    smile: [[20, 18, 'tsLsstsLs'], [21, 18, 'sLsLssLsL'], [22, 18, 'sssssssss'], [24, 22, 'uuu']],
    angry: [[19, 19, 'cc', 25, 'cc'], [20, 18, 'sLLLssLLL'], [21, 18, 'sLJLssLJL'], [24, 22, 'uuu']],
    shock: [[20, 18, 'tLLLstLLL'], [21, 18, 'sLhLssLhL'], [22, 18, 'sLLLssLLL'], [24, 22, 'uu'], [25, 22, 'uu']],
    sad:   [[20, 18, 'tsLLstsLL'], [23, 19, 'h'], [24, 22, 'tut']],
  },
  qiu: {     // 細眉第 19 列、細長眼第 20～21 列、薄唇第 24 列
    smile: [[20, 19, 'sss', 24, 'sss'], [21, 19, 'LsL', 24, 'LsL'], [24, 22, 'uuu'], [23, 21, 't', 25, 't']],
    angry: [[19, 19, 'stL', 24, 'Lts'], [21, 19, 'sJs', 24, 'sJs'], [24, 21, 'uuuu']],
    shock: [[19, 20, 'LL', 25, 'LL'], [21, 19, 'LJL', 24, 'LJL'], [24, 22, 'uu'], [25, 22, 'uu']],
    sad:   [[19, 19, 'tt', 25, 'tt'], [20, 19, 'sLL', 24, 'LLs'], [22, 19, 'x'], [24, 22, 'tut']],
  },
  kui: {     // 動漫大眼：第 20～22 列，嘴第 24 列（x27 是側髮，不要動）
    smile: [[20, 18, 'tsLsstsLs'], [21, 18, 'sLsLssLsL'], [22, 18, 'sssssssss'], [24, 22, 'uuu']],
    angry: [[19, 19, 'cc', 25, 'cc'], [20, 18, 'sLLLssLLL'], [21, 18, 'sLJLssLJL'], [24, 22, 'uuu']],
    shock: [[20, 18, 'tLLLstLLL'], [21, 18, 'sLhLssLhL'], [22, 18, 'sLLLssLLL'], [24, 22, 'uu'], [25, 22, 'uu']],
    sad:   [[20, 18, 'tsLLstsLL'], [23, 19, 'x'], [24, 22, 'tut']],
  },
};

// 自動判斷表情：依台詞內容、角色當下的狀態與動機（不用每句手動標）
// 台詞可以自己指定 e: 'smile' 之類，會優先使用
window.exprFor = (S, line) => {
  if (line.e) return line.e;
  const t = line.t || '', who = line.who, c = S && S.chars && S.chars[who];
  if (/(滾|你敢|給我|夠了|走著瞧|閉嘴|算帳|多管閒事|威脅|羞恥|騙不了|少來)/.test(t)) return 'angry';
  if (/(哈哈|嘿嘿|呵呵)/.test(t)) return 'smile';   // 明顯在笑，比結巴優先
  if (/(！！|？！|咦|哇啊|什麼？|怎麼會|你、你|我、我|噓——)/.test(t)) return 'shock';
  if (/(對不起|想他|哭|一個人|太晚了|好累|沒有了|不值得|傻孩子|……謝謝|謝謝你沒有)/.test(t)) return 'sad';
  if (/(哈哈|嘿嘿|呵呵|謝謝|太好了|兄弟|恩人|好可愛|真懂事|有眼光|開心|夠意思)/.test(t)) return 'smile';
  if (c) {
    if (c.states.includes('憤怒')) return 'angry';
    if (c.states.includes('恐懼') || c.motive === '急躁') return 'shock';
    if (c.states.includes('狼狽') || ['察覺被利用', '心灰意冷'].includes(c.motive)) return 'sad';
  }
  return 'normal';
};
