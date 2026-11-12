// 小葵（20）實習女僕：天然呆、私奔路線女主角
// 骨架沿用 PixelArtChar 的鹿角兔娘 48px；改成直長髮、公主切瀏海、女僕頭飾，手拿雞毛撢子。
window.CHARS = window.CHARS || {};
CHARS.kui = (() => {
'use strict';
const W = 34, H = 56;
const PAL = {
  a: '#9a6650', b: '#64402f', c: '#3e2622',                   // 髮：亮帶、本色、髮束線
  s: '#fde3ca', t: '#f0b48e', u: '#c26a48',                   // 膚
  w: '#ffffff', x: '#e2d6ea', y: '#a993bf', p: '#f7a3bb',     // 白
  d: '#55547e', e: '#36345a', f: '#1f1d36',                   // 女僕裝（深藍）
  k: '#4a4054', K: '#2a2632', Q: '#16141c',                   // 鞋
  L: '#3a1e2a', J: '#4a2a7a', I: '#a070d8', h: '#f2e6ff', r: '#f7a0ac', R: '#e23a52',
  o: '#9a6a3a', O: '#5e3e24', P: '#e8c8d4', G: '#b08aa0',     // 雞毛撢子
};
const g = Kit.blank();
Kit.rows(g, [
  // 頭髮：髮束線（c）從頭頂往下放射，頭頂一道亮帶（a），不放零散的點
  [8, 16, 'cbaabb'],
  [9, 14, 'bbbaaaabbb'],
  [10, 12, 'cbbbaaaaabbbb'],
  [11, 11, 'cbbbbbbaaaabbbb'],
  [12, 10, 'cbbbbcbbbaaabbbbb'],
  [13, 10, 'cbbbcbbbaacbbcbbbb'],
  [14, 9, 'cbbabcbbbbacbbcbbbb'],
  [15, 9, 'cbaabbcbbbbcbacbbbb'],
  [16, 9, 'cbabbbcbcbbcbbcbbbb'],
  [17, 8, 'c' + 'bbbbcbbcc' + 'bbbcbbcbbb'],
  // 瀏海尖端往下參差（尖端用 c）；瀏海正下方的皮膚是陰影色 t
  [18, 8, 'c' + 'bbbbcbbbc' + 'bcbtcbtccb'],
  [19, 8, 'c' + 'bbbcbbbcc' + 'ctcstcsttb'],
  // 眼睛：上眼瞼 L、瞳孔 J/I、亮點 h
  [20, 8, 'c' + 'bbbcbbbbc' + 'tLLLstLLsc'],
  [21, 8, 'c' + 'bcbbcbbbc' + 'sJJhssJIss'],
  [22, 8, 'c' + 'bbbbcbbcc' + 'sIIIssIIss'],
  [23, 8, 'c' + 'bbbbcbbbc' + 'srrssssrrs'],
  [24, 8, 'c' + 'bcbbbcbbc' + 'sssssusst'],
  [25, 8, 'c' + 'bbcbbcbbc' + 'tsssssst'],
  [26, 8, 'c' + 'bcbbbcbcc' + 'ctsssst'],
  [27, 9, 'cbcbcbbcc', 18, 'tttsst'],
  // 後髮髮尾分三束＋領子
  [28, 8, 'cbbcbcbc', 16, 'xwwwwwwwx'],
  [29, 8, 'cbbcbcc', 16, 'xwwwwRwwwx'],
  // 身體：遠側袖子在左，近側泡泡袖在右，近側手沿身體前緣垂下
  [30, 8, 'cbbcbc', 14, 'feeeeeedddd'],
  [31, 8, 'cbbc', 13, 'feeeeeeeddddd'],
  [32, 8, 'cb', 13, 'ffeeeeeeeeeef'],
  [33, 8, 'c', 14, 'feeeeeeeest'],
  [34, 14, 'feeeeeeeest'],
  [35, 14, 'feewwwwwest'],
  [36, 13, 'tfeexwwwwwxst'],
  [37, 12, 'tfeeexwwwwwxest'],
  [38, 11, 'feeeexwwwwwxee', 25, 'stu'],
  [39, 10, 'ffeeeeexwwwwwxed', 26, 'u'],
  [40, 10, 'feeeeeexwwwwwxeddd'],
  [41, 10, 'wxwwxwwwxwwwwxwwxw'],
  [42, 11, 'xx.xxx.xxx.xxx.xx'],
  // 腳：遠側直立撐重心（較暗），近側往前斜
  [43, 14, 'ttt', 19, 'sst'],
  [44, 14, 'ttt', 19, 'sst'],
  [45, 15, 'tt', 20, 'st'],
  [46, 15, 'tt', 20, 'st'],
  [47, 15, 'yx', 20, 'xw'],
  [48, 15, 'yx', 21, 'xw'],
  [49, 15, 'yx', 21, 'xw'],
  [50, 15, 'yx', 21, 'xw'],
  [51, 15, 'yx', 22, 'xw'],
  [52, 15, 'Kk', 22, 'kk'],
  [53, 14, 'KKkk', 21, 'Kkkkk'],
  [54, 14, 'KKKkk', 21, 'KKkkkk'],
  [55, 14, 'KKKKK', 21, 'KKKKKK'],
]);
// ---- 改造 ----
Kit.rows(g, [
  // 公主切：瀏海在眉毛上一刀切齊，下面一排額頭陰影
  [18, 17, 'cbbbbbbbbcb'],
  [19, 17, 'cttttttttt', 27, 'b'],
  // 直長髮垂到腰（被裙子擋住的部分不用畫）
  [31, 8, 'cbbcb'], [32, 8, 'cbbcb'], [33, 8, 'cbbcb'], [34, 8, 'cbbcb'], [35, 8, 'cbbcb'],
  [36, 8, 'cbbc'], [37, 8, 'cbbc'], [38, 8, 'cbc'], [39, 8, 'cc'],
]);
const BLINK = { 20: [18, 'tssssttss'], 21: [18, 'sLLLssLLs'], 22: [18, 'ssssssss'] };

// 疊在上面的部件（跟著呼吸動）
const OVER = [
  { x: 13, y: 8, map: ['.w.w.w.w.w.', 'wwwwwwwwwwx', 'xxxxxxxxxxy'] },   // 頭飾
  { x: 25, y: 13, map: ['RR', 'Rr'] },                                    // 髮夾
  { x: 27, y: 23, map: [                                                  // 雞毛撢子
    '..PP..', '.PPPG.', '.PPPPG', '.GPPGG', '..GGG.', '....o.',
    '....o.', '....o.', '...o..', '...o..', '..o...', '..o...', '.o....', '.o....', 'o.....'] },
];

return { name: '小葵', W, H, PAL, body: g, blink: BLINK, over: OVER,
  splitY: 37, hairRows: [28, 39], hairMaxX: 12, gx: 19, gy: 55 };
})();
