// 萬家豪宅的其他四個房間：靈堂、廚房、客廳、車庫（320×180，比照書房）
// 物件位置要對齊 story.js 裡 HOTSPOTS 的座標；地板從 y=121 開始（人物站在 150～172）
include("study.px.js")          // 借用書房的遺照、蠟燭

pal({ k: "#120c16", K: "#0a0810" })
shades("1234", "#3e5e4a")   // 壁紙綠
shades("5678", "#7a4a2c")   // 深色木頭
shades("fghi", "#9a6438")   // 木地板
shades("rstu", "#8e2636")   // 紅絲絨
shades("vwxy", "#caa046")   // 金
shades("lmno", "#26346a")   // 夜空
shades("STUV", "#646c78")   // 金屬
shades("pqP", "#2f7a48")    // 綠
pal({ E: "#b8846a", F: "#e2b896", G: "#f4d6b8", M: "#f6eccc", Y: "#fff2b8", Z: "#ffb24a", z: "#ece4cf", W: "#e4e4e4",
      B: "#2a4a7a", b: "#3a5e94", C: "#35603a", c: "#4a7c4a", D: "#5e2a4e", d: "#7a3e66", A: "#9a7434", a: "#b8924a",
      J: "#f2d24a", j: "#c8a030",                       // 菊花黃
      e: "#dfe8ea", R: "#a8bcc4", X: "#5a8aa0",          // 廚房磁磚
      H: "#3a3a4a", I: "#ece0c8",                        // 深色、奶油
      L: "#8a8a90", O: "#55555e", Q: "#6e6e76",          // 水泥
      9: "#d8c4a0", 0: "#b8a27e" })                      // 客廳壁紙
// W、H、FLOOR 沿用 study.px.js 的定義（320、180、121）

// ================================================================ 共用小零件
sprite("_plank2", { w: 48, h: 7 },
  rect(0, 0, 48, 7, "g"), hline(0, 0, 48, "f"), vline(47, 0, 7, "f"), hline(0, 1, 47, "h"), hline(6, 3, 12, "f"), hline(26, 5, 8, "f"))
const woodFloor = (c) => { for (let row = 0; row * 7 < H - FLOOR; row++) c.pattern("_plank2", -((row * 19) % 48), FLOOR + row * 7, W + 48, 7) }
sprite("_chrys", `
  .J.
  JjJ
  .J.`)
sprite("_whitef", `
  .z.
  zWz
  .z.`)

// ================================================================ 靈堂
sprite("wreath", { w: 40, h: 96 },
  // 花圈：外圈白、內圈黃，中間一條輓聯
  vline(10, 60, 36, "6"), vline(29, 60, 36, "6"), line(10, 95, 4, 95, "6"), line(29, 95, 35, 95, "6"),
  circ(20, 30, 19, "z"), circ(20, 30, 14, "J"), circ(20, 30, 9, "z"),
  (c) => { const r = c.rng(3); for (let i = 0; i < 40; i++) { const a = r() * 6.28, d = 15 + r() * 4; c.px(20 + Math.round(Math.cos(a) * d), 30 + Math.round(Math.sin(a) * d), r() < .5 ? "W" : "z") }
    for (let i = 0; i < 30; i++) { const a = r() * 6.28, d = 10 + r() * 4; c.px(20 + Math.round(Math.cos(a) * d), 30 + Math.round(Math.sin(a) * d), r() < .5 ? "j" : "J") } },
  rect(16, 14, 8, 56, "z"), box(16, 14, 8, 56, "W"),
  (c) => { for (let y = 18; y < 66; y += 5) c.hline(18, y, 4, "K") })

scene("hall", { w: W, h: H, bg: "6" },
  layer("wall",
    rect(0, 0, W, FLOOR, "6"),
    (c) => { for (let x = 0; x < W; x += 32) { c.vline(x, 0, FLOOR, "5"); c.vline(x + 1, 0, FLOOR, "7") } },
    rect(0, 90, W, 31, "5"), hline(0, 90, W, "7"), rect(0, 117, W, 4, "K"),
    // 白色布幔
    rect(0, 0, W, 9, "z"), hline(0, 9, W, "W"),
    (c) => { for (let x = 0; x < W; x += 16) c.ellipse(x + 8, 9, 8, 3, "z") },
    rect(0, 10, 18, 100, "z"), rect(302, 10, 18, 100, "z"),
    (c) => { for (let y = 10; y < 110; y += 3) { c.px(5, y, "W"); c.px(12, y, "W"); c.px(307, y, "W"); c.px(314, y, "W") } }),
  layer("floor", woodFloor,
    rect(118, FLOOR, 84, H - FLOOR, "s"), vline(118, FLOOR, H - FLOOR, "w"), vline(201, FLOOR, H - FLOOR, "w")),
  layer("altar",
    // 花牆：白菊與黃菊圍成拱形
    (c) => { const r = c.rng(11);
      const inBand = (x, y) => { const dx = (x - 160) / 70, dy = (y - 72) / 64, d = dx * dx + dy * dy; return d <= 1 && d >= 0.32 && y < 82 };
      // 先鋪一層深綠的葉子，花才會跳出來
      for (let y = 6; y < 82; y++) for (let x = 88; x < 232; x++) if (inBand(x, y)) c.px(x, y, (x + y) % 3 ? "C" : "c");
      for (let i = 0; i < 1400; i++) { const x = 88 + Math.floor(r() * 144), y = 6 + Math.floor(r() * 76);
        if (!inBand(x, y)) continue;
        const dx = (x - 160) / 70, dy = (y - 72) / 64, d = dx * dx + dy * dy;
        c.stamp(d > 0.7 ? "_whitef" : (r() < 0.55 ? "_chrys" : "_whitef"), x, y) } },
    stamp("portrait", 138, 16),
    // 供桌
    rect(100, 80, 120, 4, "u"), hline(100, 80, 120, "w"), rect(104, 84, 112, 37, "s"), hline(104, 84, 112, "w"),
    (c) => { for (let x = 108; x < 214; x += 12) c.vline(x, 88, 30, "t") },
    rect(104, 117, 112, 4, "r"),
    // 香爐、水果、蠟燭
    rect(152, 72, 16, 8, "w"), hline(152, 72, 16, "y"), rect(150, 79, 20, 2, "v"),
    (c) => { for (const x of [156, 160, 164]) { c.vline(x, 62, 10, "E"); c.px(x, 61, "Z") } },
    ellipse(126, 77, 8, 2, "W"), circ(123, 74, 3, "Z"), circ(129, 74, 3, "Z"), circ(126, 71, 3, "Z"),
    ellipse(194, 77, 8, 2, "W"), circ(191, 74, 3, "r"), circ(197, 74, 3, "r"), circ(194, 71, 3, "t"),
    stamp("candle", 110, 68), stamp("candle", 205, 68)),
  layer("props",
    stamp("wreath", 34, 20), stamp("wreath", 246, 20),
    // 奠儀簿的桌子
    rect(210, 104, 40, 3, "z"), rect(212, 107, 36, 14, "W"), vline(214, 107, 14, "6"), vline(245, 107, 14, "6"),
    rect(218, 99, 22, 5, "z"), vline(229, 99, 5, "W"), rect(221, 101, 6, 1, "K"), rect(231, 101, 6, 1, "K"), rect(236, 98, 6, 6, "r"),
    // 摺疊椅
    (c) => { for (const x of [60, 76, 244, 260]) { c.rect(x, 140, 10, 2, "H"); c.vline(x, 128, 22, "H"); c.vline(x + 9, 140, 12, "H"); c.vline(x, 142, 10, "H") } }),
  lamp(160, 2, { r: 190, color: "#ffe6c0", power: 0.55 }),
  lamp(112, 69, { r: 70, color: "#ffb060" }), lamp(207, 69, { r: 70, color: "#ffb060" }),
  lighting({ cell: 2, smooth: true, ambient: 0.4, ambientColor: "#8078b0", emit: "YZ" }),
  glow("Y", { r: 6, bands: 2, strength: 0.35 }), glow("Z", { r: 4, bands: 2, strength: 0.3 }))

// ================================================================ 廚房
sprite("_tile", { w: 8, h: 8 }, rect(0, 0, 8, 8, "e"), hline(0, 7, 8, "R"), vline(7, 0, 8, "R"), px(1, 1, "W"))
sprite("_checker", { w: 16, h: 16 }, rect(0, 0, 8, 8, "e"), rect(8, 8, 8, 8, "e"), rect(8, 0, 8, 8, "X"), rect(0, 8, 8, 8, "X"))   // 淡藍白格，不要太刺眼
sprite("pan", { w: 12, h: 16 }, vline(5, 0, 6, "S"), circ(5, 10, 5, "T"), circ(5, 10, 3, "S"), px(3, 8, "V"))

function kitchenScene(name, alt) {
scene(name, { w: W, h: H, bg: "e" },
  layer("wall",
    pattern("_tile", 0, 0, W, FLOOR),
    rect(0, 58, W, 4, "X"), hline(0, 58, W, "b"),
    rect(18, 12, 54, 38, "6"), rect(21, 15, 48, 32, "m")),
  // 窗外的夜空（不受光照影響）
  layer("sky", { unlit: true }, grad(21, 15, 48, 32, "lmn"), circ(58, 24, 4, "M"),
    (c) => { for (let x = 21; x < 69; x++) { const h = 4 + Math.round(3 * Math.sin(x * .4)); c.vline(x, 47 - h, h, "K") } }),
  layer("frame", vline(45, 15, 32, "6"), hline(21, 31, 48, "6"), rect(16, 50, 58, 3, "7")),
  layer("floor", pattern("_checker", 0, FLOOR, W, H - FLOOR)),
  layer("props",
    // 吊櫃
    rect(80, 8, 104, 36, "6"), hline(80, 8, 104, "8"), hline(80, 43, 104, "5"),
    (c) => { for (let x = 82; x < 182; x += 26) { c.rect(x, 11, 24, 30, "7"); c.box(x, 11, 24, 30, "5"); c.rect(x + 19, 24, 2, 4, "w") } },
    // 吊掛的鍋子
    hline(86, 52, 70, "S"), stamp("pan", 92, 53), stamp("pan", 112, 53), stamp("pan", 132, 53),
    // 流理台與下櫃
    rect(0, 84, 190, 4, "V"), hline(0, 84, 190, "W"), rect(0, 88, 190, 33, "6"),
    (c) => { for (let x = 4; x < 186; x += 26) { c.rect(x, 91, 24, 27, "7"); c.box(x, 91, 24, 27, "5"); c.rect(x + 11, 94, 2, 3, "w") } },
    // 水槽與水龍頭
    rect(84, 84, 30, 3, "S"), vline(98, 72, 12, "U"), hline(98, 72, 7, "U"), vline(104, 72, 4, "U"),
    // 瓦斯爐與湯鍋
    rect(130, 82, 40, 3, "H"), circ(140, 82, 3, "K"), circ(160, 82, 3, "K"),
    rect(150, 68, 20, 14, "T"), hline(150, 68, 20, "V"), rect(148, 70, 2, 3, "S"), rect(170, 70, 2, 3, "S"),
    (c) => { for (let i = 0; i < 4; i++) c.px(155 + i * 3, 64 - i, "W") },
    // 冰箱
    rect(196, 30, 30, 91, "I"), vline(196, 30, 91, "W"), vline(225, 30, 91, "0"), hline(196, 62, 30, "0"),
    rect(220, 40, 2, 14, "S"), rect(220, 70, 2, 20, "S"), rect(202, 36, 8, 6, "J"), rect(204, 37, 4, 1, "K"),
    // 酒櫃（玻璃門，一排排的酒）
    rect(248, 34, 56, 87, "5"), rect(251, 37, 50, 70, "6"),
    (c) => { const r = c.rng(5); for (const y of [44, 64, 84]) { c.hline(251, y + 12, 50, "7");
      for (let x = 254; x < 298; x += 7) { const col = r() < .4 ? "c" : r() < .6 ? "A" : "z"; c.rect(x, y, 4, 12, col); c.rect(x + 1, y - 3, 2, 3, col); c.px(x, y + 2, "W") } } },
    ...(alt ? [rect(253, 40, 6, 16, "6")] : []),   // 被拿走的那一瓶
    vline(276, 37, 70, "5"), rect(251, 108, 50, 13, "6"), box(251, 108, 50, 13, "5"),
    // 垃圾桶
    rect(50, 100, 22, 21, "O"), rect(48, 98, 26, 3, "L"), vline(52, 102, 18, "L"), rect(56, 96, 6, 3, "z")),
  layer("shadow", { shade: 1, density: 0.5 }, poly([0, 121, 190, 121, 196, 126, 0, 126], "K"), poly([196, 121, 304, 121, 310, 126, 196, 126], "K")),
  lamp(130, 2, { r: 200, color: "#fff0d0", power: 0.9 }),
  lighting({ cell: 2, smooth: true, ambient: 0.45, ambientColor: "#9098c0", emit: "lmnMK" }),
  glow("M", { where: [52, 18, 12, 12], r: 5, bands: 2, strength: 0.3 }))
}
kitchenScene("kitchen", false)
kitchenScene("kitchen_alt", true)

// ================================================================ 客廳
sprite("_stripe", { w: 12, h: 8 }, rect(0, 0, 12, 8, "9"), vline(0, 0, 8, "0"), vline(6, 0, 8, "0"))
sprite("fish", `
  .ZZ.Z
  ZZZZZ
  .ZZ.Z`)

function livingScene(name, alt) {
scene(name, { w: W, h: H, bg: "9" },
  layer("wall",
    pattern("_stripe", 0, 6, W, 84),
    rect(0, 0, W, 6, "6"), hline(0, 5, W, "8"), hline(0, 6, W, "K"),
    rect(0, 89, W, 32, "6"), hline(0, 89, W, "8"), hline(0, 92, W, "5"),
    (c) => { for (let x = 4; x < W; x += 26) { c.rect(x, 96, 22, 18, "5"); c.hline(x, 113, 22, "7"); c.vline(x + 21, 96, 18, "7") } },
    rect(0, 117, W, 4, "5")),
  layer("floor", woodFloor,
    rect(64, 140, 192, 34, "s"), box(64, 140, 192, 34, "r"), rect(68, 144, 184, 26, "t"), ellipse(160, 157, 40, 8, "w"), ellipse(160, 157, 36, 6, "t")),
  layer("props",
    // 水晶燈
    vline(160, 0, 8, "w"), ellipse(160, 12, 18, 4, "w"), (c) => { for (let x = 144; x <= 176; x += 4) { c.vline(x, 14, 4, "W"); c.px(x, 18, "Y") } },
    // 展示櫃（青瓷在中層）
    rect(14, 26, 52, 95, "5"), rect(17, 29, 46, 80, "6"), rect(19, 31, 42, 76, "4"),
    hline(19, 50, 42, "7"), hline(19, 72, 42, "7"), hline(19, 94, 42, "7"),
    ...(alt ? [ellipse(40, 71, 5, 1, "6")] : [ellipse(40, 63, 6, 8, "c"), rect(37, 54, 6, 3, "c"), px(37, 60, "W"), rect(36, 70, 8, 2, "C")]),
    ellipse(28, 46, 6, 4, "z"), ellipse(52, 46, 6, 4, "z"), rect(24, 86, 10, 8, "A"), rect(46, 84, 8, 10, "B"),
    rect(14, 109, 52, 12, "5"), vline(40, 29, 80, "5"),
    // 沙發
    rect(74, 98, 56, 10, "s"), rect(72, 108, 60, 13, "t"), rect(70, 100, 6, 21, "s"), rect(128, 100, 6, 21, "s"),
    hline(74, 98, 56, "u"), rect(80, 104, 14, 6, "u"), rect(110, 104, 14, 6, "u"),
    // 古董花瓶（在台座上）
    rect(134, 104, 14, 17, "5"), hline(134, 104, 14, "7"),
    ...(alt ? [ellipse(141, 104, 5, 1, "6")]   // 只剩一圈灰塵印
      : [ellipse(141, 92, 7, 10, "z"), rect(138, 80, 7, 4, "z"), hline(136, 90, 11, "B"), hline(136, 95, 11, "B"), px(139, 87, "B"), px(143, 98, "B"), px(137, 85, "W")]),
    // 壁爐
    rect(196, 54, 70, 67, "L"), rect(192, 50, 78, 6, "7"), hline(192, 50, 78, "8"),
    (c) => { for (let y = 58; y < 121; y += 6) for (let x = 196 + ((y / 6) % 2) * 6; x < 266; x += 12) c.rect(x, y, 11, 5, (x + y) % 3 ? "L" : "Q") },
    rect(210, 82, 42, 39, "K"), ellipse(231, 82, 21, 8, "K"),
    rect(214, 112, 34, 4, "6"), (c) => { for (let i = 0; i < 6; i++) { const x = 218 + i * 5, h = 8 + (i * 7) % 9; c.vline(x, 112 - h, h, i % 2 ? "Z" : "Y"); c.vline(x + 1, 113 - h + 3, h - 3, "Z") } },
    rect(216, 44, 10, 6, "w"), rect(240, 42, 12, 8, "6"), rect(242, 44, 8, 4, "F"),
    // 魚缸（遙控器就是飛進這裡）
    rect(272, 64, 40, 32, "b"), box(272, 64, 40, 32, "S"), rect(273, 65, 38, 4, "B"),
    (c) => { for (let x = 276; x < 310; x += 5) c.vline(x, 84 + (x % 3), 11 - (x % 3), "c") },
    stamp("fish", 282, 74), stamp("fish", 296, 82, { flip: "x" }),
    rect(274, 96, 36, 25, "5"), hline(274, 96, 36, "7")),
  layer("shadow", { shade: 1, density: 0.5 }, poly([70, 121, 134, 121, 140, 126, 70, 126], "K"), poly([192, 121, 270, 121, 276, 125, 192, 125], "K")),
  lamp(160, 16, { r: 190, color: "#ffe2b0", power: 0.8 }),
  lamp(231, 104, { r: 80, color: "#ff9a40", power: 1 }),
  lighting({ cell: 2, smooth: true, ambient: 0.4, ambientColor: "#9088b8", emit: "YZ" }),
  glow("Y", { r: 6, bands: 2, strength: 0.35 }), glow("Z", { where: [212, 96, 40, 20], r: 8, bands: 3, strength: 0.4 }))
}
livingScene("living", false)
livingScene("living_alt", true)

// ================================================================ 車庫
sprite("_block", { w: 16, h: 8 }, rect(0, 0, 16, 8, "L"), hline(0, 7, 16, "Q"), vline(15, 0, 8, "Q"))
sprite("car", { w: 132, h: 50 },
  // 老賓士（側面）：車身酒紅、鍍鉻保險桿
  poly([6, 32, 14, 22, 38, 20, 50, 6, 92, 6, 106, 20, 124, 22, 130, 32, 130, 40, 4, 40], "s"),
  poly([54, 9, 72, 9, 72, 20, 44, 20], "B"), poly([76, 9, 90, 9, 100, 20, 76, 20], "B"), px(56, 11, "b"), px(78, 11, "b"),
  hline(14, 23, 112, "u"), hline(6, 31, 124, "t"), rect(4, 38, 128, 3, "V"), rect(2, 36, 4, 4, "V"), rect(128, 36, 4, 4, "V"),
  rect(124, 27, 6, 4, "Y"), rect(4, 28, 4, 3, "r"),
  circ(32, 42, 8, "K"), circ(32, 42, 4, "V"), circ(102, 42, 8, "K"), circ(102, 42, 4, "V"),
  vline(73, 22, 14, "t"), rect(78, 26, 6, 1, "V"))

// 撞爛的車：車頭（右邊）凹進去、大燈破掉、保險桿掉下來
sprite("car_wrecked", { w: 132, h: 50 },
  stamp("car", 0, 0),
  poly([112, 20, 131, 26, 131, 41, 114, 41], "_"),
  poly([106, 20, 118, 24, 122, 31, 118, 40, 106, 40], "s"), line(108, 22, 118, 34, "u"), line(112, 24, 106, 38, "u"),
  rect(116, 30, 3, 3, "K"), px(117, 31, "W"),
  line(104, 39, 124, 44, "V"), line(104, 40, 124, 45, "S"),
  px(124, 18, "Q"), px(126, 15, "Q"), px(125, 12, "O"))

// car：'normal' 平常、'wrecked' 撞爛、'gone' 被開走；alt：鑰匙不見、籠子打開
function garageScene(name, alt, car) {
scene(name, { w: W, h: H, bg: "L" },
  layer("wall",
    pattern("_block", 0, 0, W, FLOOR),
    // 鐵捲門
    rect(6, 10, 114, 111, "T"), (c) => { for (let y = 12; y < 121; y += 4) { c.hline(6, y, 114, "S"); c.hline(6, y + 1, 114, "U") } },
    rect(4, 8, 118, 4, "S"), rect(56, 108, 14, 3, "V"),
    // 日光燈
    rect(130, 4, 60, 3, "S"), rect(132, 7, 56, 2, "W")),
  layer("floor", rect(0, FLOOR, W, H - FLOOR, "Q"),
    (c) => { for (let x = 0; x < W; x += 40) c.vline(x, FLOOR, H - FLOOR, "O"); c.hline(0, 150, W, "O") },
    ellipse(170, 150, 30, 4, "O"), ellipse(160, 151, 14, 2, "H")),
  layer("props",
    // 工具牆
    rect(196, 28, 56, 44, "6"), box(196, 28, 56, 44, "5"),
    (c) => { for (let y = 32; y < 70; y += 4) for (let x = 200; x < 250; x += 4) c.px(x, y, "5") },
    line(204, 34, 204, 60, "S"), rect(201, 34, 7, 4, "T"), line(216, 36, 224, 58, "U", 2), rect(232, 34, 10, 3, "r"), vline(236, 37, 20, "V"),
    // 掛鑰匙的板子
    rect(274, 52, 14, 14, "6"), box(274, 52, 14, 14, "5"), px(278, 56, "V"), px(284, 56, "V"),
    ...(alt ? [] : [rect(277, 57, 3, 5, "w"), px(278, 61, "y")]),
    // 後門
    rect(290, 46, 26, 75, "6"), box(290, 46, 26, 75, "5"), rect(294, 52, 18, 16, "m"), box(294, 52, 18, 16, "5"),
    rect(294, 74, 18, 40, "7"), box(294, 74, 18, 40, "5"), rect(296, 92, 3, 3, "w"),
    // 孔雀籠（蓋著帆布）
    ...(alt
      // 帆布被掀開、籠門開著，裡面空了，地上剩幾根羽毛
      ? [rect(28, 96, 46, 25, "K"), box(28, 96, 46, 25, "S"), (c) => { for (let x = 32; x < 72; x += 6) c.vline(x, 97, 23, "S") },
         rect(28, 96, 12, 25, "K"), line(28, 96, 18, 104, "S"), line(28, 120, 18, 116, "S"), vline(18, 104, 13, "S"),
         poly([50, 116, 80, 112, 84, 121, 46, 121], "O"), hline(52, 116, 28, "L"),
         px(40, 119, "c"), px(41, 118, "B"), px(60, 120, "c"), px(64, 119, "J")]
      : [rect(28, 92, 46, 29, "O"), poly([26, 92, 50, 84, 76, 92], "O"), hline(28, 92, 46, "L"),
         (c) => { for (let x = 32; x < 72; x += 8) c.vline(x, 94, 26, "Q") }, rect(48, 116, 4, 5, "J")]),
    ...(car === 'gone' ? [] : [stamp(car === 'wrecked' ? "car_wrecked" : "car", 96, 98)])),
  layer("shadow", { shade: 1, density: 0.6 }, ...(car === 'gone' ? [px(0, 0, "K")] : [ellipse(162, 142, 66, 5, "K")])),
  lamp(160, 8, { r: 220, color: "#e8f0ff", power: 0.85 }),
  lighting({ cell: 2, smooth: true, ambient: 0.35, ambientColor: "#8090b8", emit: "Wm" }))
}
garageScene("garage", false, 'normal')
garageScene("garage_alt", true, 'wrecked')
garageScene("garage_alt2", true, 'gone')
