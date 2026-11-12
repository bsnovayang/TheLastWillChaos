// 角色：Q 版小人（場景用）＋ 80×80 對話立繪（各 4 種表情）
// 光源一律在左上；對稱的部分用 mx 畫左半邊，不對稱的細節和陰影在衍生 sprite 裡補上。
pal({
  k: "#1c1020",
  // 小葵
  1: "#c98c76", 2: "#e8b298", 3: "#f6d2bc", 4: "#fde8d8",          // 膚
  5: "#2e1a1e", 6: "#4a2c2a", 7: "#6e4438", 8: "#966250",          // 髮
  a: "#1c1828", b: "#2e2a40", c: "#47425e",                        // 女僕裝
  d: "#a8a0b4", e: "#dcd6e0", f: "#fbf8f2",                        // 白
  g: "#7a1a2e", h: "#c43048", i: "#f06c7c",                        // 紅緞帶
  j: "#3a2050", l: "#7a4aa8", m: "#b88ae0",                        // 紫眼
  n: "#f59aa4",                                                    // 腮紅
  // 大伯
  o: "#a06a52", p: "#cc9676", q: "#eabd9c", r: "#f8dcc2",          // 膚
  s: "#55535e", t: "#8c8a96", u: "#c4c2cc",                        // 灰髮
  v: "#121828", w: "#232c48", x: "#38466c",                        // 西裝
  y: "#8a6420", z: "#d4a640", A: "#f6dc86",                        // 金框眼鏡
  // 共用
  E: "#22122a", W: "#ffffff", M: "#7a2236", N: "#e2687a", K: "#0c0a10",
  B: "#8fd0ff", R: "#e42a2a", F: "#ec8c84",
})
ramps("k1234", "k5678", "kabc", "kdef", "kghi", "kjlm", "kopqr", "kstu", "kvwx", "kyzA")

const mirrorRows = (rows) => rows.map((r) => [...r].reverse().join(""))
const pair = (lx, rx, y, rows) => [grid(lx, y, rows.join("\n")), grid(rx, y, mirrorRows(rows).join("\n"))]

// ================================================================ 小葵 立繪
sprite("_kui_base", { w: 80, h: 80, mx: true },
  ellipse(40, 36, 27, 27, "6"), rect(13, 36, 14, 44, "6"),                 // 後髮
  poly([4, 80, 9, 69, 22, 62, 40, 60, 40, 80], "b"),                       // 洋裝
  poly([23, 66, 28, 64, 31, 80, 25, 80], "f"), rect(33, 71, 7, 9, "f"),     // 圍裙
  rect(34, 49, 6, 13, "2"), rect(34, 49, 6, 3, "1"),                       // 脖子
  poly([29, 59, 40, 63, 40, 68, 26, 64], "f"), hline(27, 64, 13, "e"),      // 衣領
  ellipse(35, 64, 4, 3, "h"), rect(38, 62, 2, 4, "g"), poly([37, 66, 34, 74, 39, 71], "h"),  // 緞帶
  ellipse(40, 37, 18, 16, "3"), ellipse(40, 44, 13, 11, "3"),              // 臉
  clip([0, 0, 80, 0, 80, 29, 0, 29], ellipse(40, 27, 21, 14, "6")),        // 瀏海
  poly([19, 27, 27, 27, 23, 40], "6"), poly([26, 27, 34, 27, 30, 37], "6"), poly([33, 27, 40, 27, 40, 32, 37, 37], "6"),
  poly([17, 27, 24, 27, 23, 58, 20, 62, 17, 56], "6"),                     // 側髮
  clip([0, 0, 80, 0, 80, 20, 0, 20], ellipse(40, 26, 21, 13, "f")),        // 頭飾
  clip([0, 0, 80, 0, 80, 20, 0, 20], ellipse(40, 30, 21, 13, "6")),
  (c) => { for (let x = 21; x <= 39; x += 5) { const t = 26 - 13 * Math.sqrt(Math.max(0, 1 - ((x - 40) / 21) ** 2)); c.circ(x, Math.round(t), 2, "f") } },
  rect(24, 45, 5, 2, "n"))                                                 // 腮紅

// 月牙形陰影：在「往左上偏移的同形橢圓」之外的部分變暗
const outside = (cx, cy, rx, ry) => (x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 > 1
const KUI_SHADE = [
  recolor({ 3: "2" }, outside(36, 34, 18, 17)),
  recolor({ 3: "2" }, (x, y) => y >= 28 && y <= 30),                       // 瀏海投影
  recolor({ 2: "1" }, outside(34, 32, 20, 19)),
  recolor({ 6: "5" }, (x, y) => x > 57 || outside(36, 33, 27, 30)(x, y)),
  recolor({ 6: "7" }, (x, y) => y >= 20 && y <= 21 && x >= 22 && x <= 46), // 髮光澤
  vline(18, 32, 18, "7"), vline(19, 36, 10, "7"), vline(16, 50, 14, "7"),
  px(28, 20, "8"), px(29, 20, "8"),
  recolor({ b: "a" }, (x, y) => x > 52), recolor({ b: "c" }, (x, y) => x < 20 && y < 70),
  recolor({ f: "e" }, (x, y) => x > 47 && y > 40),
  rect(53, 23, 5, 3, "h"), hline(53, 23, 5, "i"), px(57, 25, "g"),       // 髮夾
]
const KUI_EYE = ["EEEEEEE.", "EEEEEEEE", "EWWjjjjE", "EWWjEEjE", "EjjjEEjE", "EjjllljE", "EjllllWE", ".EmmmmE.", "..EEEE.."]
const KUI_EYE_SMILE = ["........", "..EEEE..", ".EE..EE.", "EE....EE"]
const KUI_EYE_SHOCK = [".EEEEEE.", "EWWWWWWE", "EWWWWWWE", "EWWEEWWE", "EWWEEWWE", "EWWWWWWE", ".EEEEEE."]
const KUI = {
  normal: [...pair(25, 47, 32, KUI_EYE), hline(38, 51, 4, "M")],
  smile: [...pair(25, 47, 35, KUI_EYE_SMILE), hline(36, 49, 8, "M"), rect(37, 50, 6, 2, "N"), hline(38, 52, 4, "M")],
  shock: [...pair(25, 47, 33, KUI_EYE_SHOCK), ellipse(40, 51, 2, 2, "M"), px(40, 51, "N"),
    grid(62, 22, ".B.\nBBB\nBWB\n.B.")],
  sad: [...pair(25, 47, 32, KUI_EYE), hline(24, 30, 3, "5"), hline(27, 29, 3, "5"), hline(50, 29, 3, "5"), hline(53, 30, 3, "5"),
    hline(38, 51, 4, "M"), px(37, 52, "M"), px(42, 52, "M"), vline(27, 42, 4, "B"), px(27, 46, "W")],
}
for (const [ex, ops] of Object.entries(KUI)) sprite("kui_" + ex, { base: "_kui_base", selout: "k" }, ...KUI_SHADE, ...ops)

// ================================================================ 大伯 立繪
sprite("_uncle_base", { w: 80, h: 80, mx: true },
  poly([1, 80, 5, 68, 20, 60, 40, 58, 40, 80], "w"),                       // 西裝
  poly([24, 62, 31, 59, 40, 74, 40, 80, 34, 80], "x"),                     // 翻領
  poly([31, 58, 40, 58, 40, 71], "f"),                                     // 襯衫
  rect(37, 59, 3, 3, "K"), rect(38, 62, 2, 13, "K"),                       // 黑領帶
  rect(32, 47, 8, 13, "p"), rect(32, 47, 8, 3, "o"),                       // 脖子
  ellipse(21, 38, 3, 5, "p"),                                              // 耳朵
  ellipse(40, 34, 19, 19, "q"), ellipse(40, 44, 17, 11, "q"),              // 頭
  poly([19, 29, 25, 25, 25, 42, 20, 45], "t"),                             // 側髮
  hline(25, 19, 15, "t"), hline(23, 22, 17, "t"),                          // 地中海
  box(26, 32, 11, 8, "z"), hline(37, 34, 3, "z"), hline(21, 34, 5, "z"),   // 眼鏡
  poly([29, 47, 40, 46, 40, 50, 27, 51], "s"),                             // 鬍子
  hline(33, 57, 7, "p"))                                                   // 雙下巴

const UNCLE_SHADE = [
  recolor({ q: "p" }, outside(36, 31, 20, 21)), recolor({ p: "o" }, outside(35, 30, 25, 25)),
  ellipse(33, 20, 5, 2, "r"), px(30, 21, "r"),                            // 禿頭反光
  vline(40, 38, 6, "p"), px(41, 43, "o"), px(39, 44, "p"),                 // 鼻子
  recolor({ t: "s" }, (x, y) => x > 52), recolor({ t: "u" }, (x, y) => x < 24 && y < 34),
  recolor({ w: "v" }, (x, y) => x > 50), recolor({ x: "w" }, (x, y) => x > 50),
  recolor({ z: "A" }, (x, y) => x < 30 && y < 34),
  hline(27, 33, 2, "W"), hline(48, 33, 2, "W"),                            // 鏡片反光
  rect(4, 70, 10, 4, "K"),                                                 // 黑紗臂章
  rect(52, 64, 5, 2, "f"),                                                 // 口袋巾
]
const UNCLE = {
  normal: [rect(26, 28, 10, 2, "s"), rect(44, 28, 10, 2, "s"),
    hline(28, 36, 6, "E"), hline(29, 37, 4, "E"), hline(46, 36, 6, "E"), hline(47, 37, 4, "E"),
    hline(36, 53, 7, "M"), px(43, 52, "M")],
  angry: [(c) => { for (let i = 0; i < 10; i++) { c.rect(26 + i, 26 + Math.floor(i / 3), 1, 2, "s"); c.rect(53 - i, 26 + Math.floor(i / 3), 1, 2, "s") } },
    rect(28, 35, 6, 2, "E"), rect(46, 35, 6, 2, "E"), px(30, 35, "W"), px(48, 35, "W"),
    rect(34, 52, 12, 5, "M"), hline(34, 52, 12, "W"), hline(35, 56, 10, "W"),
    rect(23, 44, 5, 2, "F"), rect(52, 44, 5, 2, "F"),
    grid(58, 14, "R.R\n...\nR.R"), grid(57, 13, ".R.R.\nR...R\n.....\nR...R\n.R.R.")],
  shock: [hline(26, 26, 10, "s"), hline(44, 26, 10, "s"),
    ring(31, 36, 3, "E"), px(31, 36, "E"), ring(48, 36, 3, "E"), px(48, 36, "E"),
    ellipse(40, 54, 3, 3, "M"),
    grid(62, 26, ".B.\nBBB\nBWB\n.B."), grid(14, 30, ".B.\nBBB\n.B.")],
  smug: [rect(26, 29, 10, 2, "s"), (c) => { for (let i = 0; i < 10; i++) c.px(44 + i, 27 + (i < 5 ? 1 : 0), "s") },
    hline(28, 37, 6, "E"), hline(46, 36, 6, "E"), hline(47, 37, 4, "E"),
    hline(35, 53, 9, "M"), px(44, 52, "M"), px(45, 51, "M")],
}
for (const [ex, ops] of Object.entries(UNCLE)) sprite("uncle_" + ex, { base: "_uncle_base", selout: "k" }, ...UNCLE_SHADE, ...ops)

// ================================================================ Q 版小人（場景用）
sprite("_kui_chibi", { w: 24, h: 40, mx: true },
  rect(9, 33, 2, 5, "f"), rect(8, 37, 3, 3, "E"),                          // 腿、鞋
  poly([7, 20, 12, 20, 12, 34, 3, 34], "b"),                               // 洋裝
  poly([9, 23, 12, 23, 12, 33, 7, 33], "f"),                               // 圍裙
  rect(4, 22, 2, 8, "b"), rect(4, 30, 2, 2, "3"),                          // 手
  rect(9, 20, 3, 2, "f"), px(11, 21, "h"),                                 // 領子
  ellipse(12, 12, 10, 10, "6"), rect(2, 12, 4, 11, "6"),                   // 頭髮
  ellipse(12, 14, 7, 6, "3"),
  rect(5, 7, 7, 3, "6"), px(6, 10, "6"), px(9, 10, "6"), px(11, 10, "6"),  // 瀏海
  rect(4, 4, 8, 2, "f"),                                                   // 頭飾
  rect(8, 13, 2, 3, "E"), px(8, 13, "W"),                                  // 眼睛
  px(6, 16, "n"), px(11, 17, "M"))
sprite("kui_chibi", { base: "_kui_chibi", selout: "k" },
  recolor({ 6: "5" }, (x, y) => x > 15), recolor({ 6: "7" }, (x, y) => y === 5 && x > 4 && x < 13),
  recolor({ 3: "2" }, (x, y) => x > 15 || y === 11),
  recolor({ b: "a" }, (x, y) => x > 14), recolor({ f: "e" }, (x, y) => x > 13 && y > 18),
  px(17, 8, "h"), px(18, 8, "i"))

sprite("_uncle_chibi", { w: 24, h: 40, mx: true },
  rect(8, 33, 3, 5, "v"), rect(7, 37, 4, 3, "K"),
  poly([5, 20, 12, 20, 12, 34, 3, 34], "w"),
  poly([9, 20, 12, 20, 12, 27], "f"), rect(11, 21, 1, 8, "K"),
  rect(1, 22, 3, 9, "w"), rect(1, 31, 3, 2, "q"),
  ellipse(12, 12, 8, 8, "q"),
  rect(3, 10, 3, 5, "t"), hline(7, 5, 5, "t"),
  rect(6, 11, 4, 3, "z"), rect(7, 12, 2, 1, "E"), hline(10, 12, 2, "z"),
  rect(8, 16, 4, 2, "s"), hline(11, 18, 1, "M"))
sprite("uncle_chibi", { base: "_uncle_chibi", selout: "k" },
  recolor({ q: "p" }, (x, y) => x > 15), recolor({ w: "v" }, (x, y) => x > 14), recolor({ t: "s" }, (x, y) => x > 15),
  px(9, 6, "r"), px(10, 6, "r"),
  rect(1, 25, 3, 2, "K"))
