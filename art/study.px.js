// 萬家豪宅・書房（夜）— 320×180 背景
// 光源：書桌檯燈（暖）、遺照前兩根蠟燭（暖）、窗外月光（冷）。人物在遊戲裡另外疊上去。
pal({ k: "#120c16", K: "#0a0810" })
shades("1234", "#3e5e4a")   // 壁紙綠
shades("5678", "#7a4a2c")   // 深色木頭（護牆板、家具）
shades("fghi", "#9a6438")   // 地板
shades("rstu", "#8e2636")   // 紅絲絨（窗簾、地毯）
shades("vwxy", "#caa046")   // 金
shades("lmno", "#26346a")   // 夜空
shades("STUV", "#646c78")   // 保險箱金屬
shades("pqP", "#2f7a48")    // 檯燈燈罩
pal({ E: "#b8846a", F: "#e2b896", G: "#f4d6b8", M: "#f6eccc", Y: "#fff2b8", Z: "#ffb24a", z: "#ece4cf", W: "#e4e4e4",
      B: "#2a4a7a", b: "#3a5e94", C: "#35603a", c: "#4a7c4a", D: "#5e2a4e", d: "#7a3e66", A: "#9a7434", a: "#b8924a" })

const W = 320, H = 180, FLOOR = 121

// ---------------------------------------------------------------- 材質
sprite("_damask", `
  222222322222
  222223232222
  222232223222
  222322322322
  222232223222
  222223232222
  222222322222
  222222222222
  322222222223
  222222222222
  222222222222
  222222222222`)

sprite("_panel", { w: 26, h: 24 },
  rect(0, 0, 26, 24, "6"),
  hline(3, 3, 20, "5"), vline(3, 3, 18, "5"), hline(3, 20, 20, "7"), vline(22, 3, 18, "7"),
  hline(6, 6, 14, "7"), vline(6, 6, 12, "7"), hline(6, 17, 14, "5"), vline(19, 6, 12, "5"))

sprite("_plank", { w: 48, h: 7 },
  rect(0, 0, 48, 7, "g"), hline(0, 0, 48, "f"), vline(47, 0, 7, "f"), hline(0, 1, 47, "h"),
  hline(5, 3, 11, "f"), hline(24, 5, 9, "f"), hline(36, 3, 5, "h"))

// ---------------------------------------------------------------- 家具與道具
sprite("bookshelf", { w: 68, h: 103 },
  rect(0, 0, 68, 103, "6"), rect(0, 0, 68, 4, "7"), hline(0, 0, 68, "8"), hline(0, 4, 68, "5"),
  vline(0, 0, 103, "7"), vline(67, 0, 103, "5"),
  (c) => {
    const r = c.rng(7)
    const BOOK = [["r", "s"], ["B", "b"], ["C", "c"], ["D", "d"], ["A", "a"], ["5", "6"], ["t", "u"]]
    for (let s = 0; s < 5; s++) {
      const sy = 6 + s * 19
      c.rect(3, sy, 62, 16, "5"); c.hline(3, sy, 62, "K")
      let x = 4
      while (x < 64) {
        if (s === 2 && x > 46) {                                   // 地球儀
          c.rect(52, sy + 13, 7, 3, "6"); c.vline(55, sy + 10, 3, "w")
          c.circ(55, sy + 6, 5, "B"); c.rect(52, sy + 3, 3, 4, "c"); c.rect(56, sy + 7, 2, 2, "c"); c.px(53, sy + 3, "b")
          break
        }
        const bw = 2 + Math.floor(r() * 3), bh = 10 + Math.floor(r() * 6)
        if (x + bw > 65) break
        const [d, l] = BOOK[Math.floor(r() * BOOK.length)]
        const top = sy + 16 - bh
        c.rect(x, top, bw, bh, d); c.vline(x, top, bh, l)
        if (bw > 2 && r() < 0.6) c.hline(x, top + 2, bw, "w")
        x += bw + (r() < 0.1 ? 1 : 0)
      }
      c.rect(2, sy + 16, 64, 3, "6"); c.hline(2, sy + 16, 64, "8"); c.hline(2, sy + 18, 64, "5")
    }
  })

sprite("curtain", { w: 18, h: 108 }, (c) => {
  for (let y = 0; y < 108; y++) {
    // 繫帶在 y=56：上方垂直，繫帶處收窄，下方散開
    const pinch = y < 56 ? 18 - Math.max(0, (y - 36) * 0.3) : 12 + Math.min(6, (y - 56) * 0.25)
    const w = Math.round(pinch)
    for (let x = 0; x < w; x++) {
      const f = (x + Math.floor(y < 56 ? 0 : (y - 56) / 12)) % 5
      c.px(x, y, f === 0 ? "r" : f === 1 ? "s" : f === 3 ? "u" : "t")
    }
  }
  c.rect(0, 54, 14, 3, "w"); c.hline(0, 54, 14, "y"); c.hline(0, 56, 14, "v")
})

sprite("portrait", { w: 44, h: 54 },
  rect(0, 2, 44, 52, "w"), hline(0, 2, 44, "y"), vline(0, 2, 52, "x"), hline(0, 53, 44, "v"), vline(43, 2, 52, "v"),
  rect(3, 5, 38, 46, "v"), grad(4, 6, 36, 44, "432", "v", 0), hline(4, 6, 36, "K"), vline(4, 6, 44, "K"),
  // 老爺
  poly([7, 50, 11, 40, 33, 40, 37, 50], "K"), poly([18, 40, 26, 40, 22, 47], "z"), rect(21, 41, 2, 6, "r"),
  rect(19, 35, 6, 6, "E"),
  rect(12, 25, 2, 4, "E"), rect(31, 25, 2, 4, "E"),
  ellipse(22, 26, 9, 10, "F"), clip([27, 15, 32, 15, 32, 37, 27, 37], ellipse(22, 26, 9, 10, "E")),
  hline(17, 18, 5, "G"), hline(16, 19, 3, "G"),
  rect(13, 22, 2, 5, "W"), rect(30, 22, 2, 5, "W"),
  hline(17, 24, 3, "W"), hline(24, 24, 3, "W"), px(18, 26, "k"), px(25, 26, "k"), vline(22, 27, 3, "E"),
  ellipse(22, 34, 6, 3, "W"), hline(19, 31, 7, "W"), hline(21, 32, 3, "E"),
  // 黑紗
  rect(18, 0, 8, 5, "K"), ellipse(14, 2, 4, 2, "K"), ellipse(29, 2, 4, 2, "K"),
  poly([19, 4, 22, 4, 16, 14, 14, 13], "K"), poly([22, 4, 25, 4, 30, 13, 28, 14], "K"))

sprite("clock", { w: 28, h: 86 },
  rect(4, 10, 20, 72, "6"), vline(4, 10, 72, "7"), vline(23, 10, 72, "5"),
  rect(0, 0, 28, 12, "6"), hline(0, 0, 28, "8"), hline(0, 11, 28, "5"), rect(2, 2, 24, 8, "7"),
  circ(14, 19, 7, "w"), circ(14, 19, 6, "z"), px(14, 14, "k"), px(19, 19, "k"), px(9, 19, "k"), px(14, 24, "k"),
  vline(14, 15, 4, "k"), hline(14, 19, 4, "k"),
  rect(8, 32, 12, 34, "K"), box(8, 32, 12, 34, "5"), vline(14, 33, 22, "v"), circ(14, 57, 3, "w"), px(13, 56, "y"),
  rect(2, 80, 24, 6, "5"), hline(2, 80, 24, "6"))

sprite("safe", { w: 26, h: 26 },
  rect(0, 0, 26, 26, "T"), hline(0, 0, 26, "V"), vline(0, 0, 26, "U"), vline(25, 0, 26, "S"), hline(0, 25, 26, "S"),
  rect(3, 3, 20, 19, "U"), box(3, 3, 20, 19, "S"), hline(4, 4, 18, "V"),
  circ(11, 12, 4, "V"), circ(11, 12, 2, "S"), px(11, 8, "z"), rect(18, 9, 2, 8, "w"), px(18, 9, "y"))

// 打開的保險箱（門往左邊敞開，裡面空了）
sprite("safe_open", { w: 34, h: 26 },
  rect(8, 0, 26, 26, "T"), hline(8, 0, 26, "V"), vline(33, 0, 26, "S"), hline(8, 25, 26, "S"),
  rect(11, 3, 20, 19, "K"), hline(11, 12, 20, "S"), hline(11, 3, 20, "k"),
  rect(0, 2, 8, 23, "U"), vline(0, 2, 23, "V"), vline(7, 2, 23, "S"), rect(2, 10, 3, 5, "V"), rect(5, 6, 2, 8, "w"))

sprite("desk", { w: 84, h: 32 },
  rect(0, 0, 84, 6, "7"), hline(0, 0, 84, "8"), hline(0, 5, 84, "5"),
  rect(3, 6, 78, 24, "6"), hline(3, 6, 78, "5"),
  (c) => {
    for (const dx of [7, 55]) for (const dy of [9, 19]) {
      c.rect(dx, dy, 22, 8, "6"); c.hline(dx, dy, 22, "7"); c.vline(dx, dy, 8, "7"); c.hline(dx, dy + 7, 22, "5"); c.vline(dx + 21, dy, 8, "5")
      c.rect(dx + 10, dy + 3, 2, 2, "w")
    }
  },
  rect(32, 8, 20, 22, "K"), vline(32, 8, 22, "5"),
  rect(3, 29, 78, 3, "5"))

sprite("bankerlamp", { w: 18, h: 16 },
  rect(6, 13, 7, 3, "w"), hline(6, 13, 7, "y"), rect(8, 6, 2, 7, "w"),
  poly([3, 0, 15, 0, 18, 6, 0, 6], "q"), hline(3, 0, 12, "P"), hline(0, 5, 18, "p"), hline(4, 6, 10, "Y"),
  lamp(9, 7, { r: 135, color: "#ffcf8a", power: 0.9 }))

sprite("candle", { w: 5, h: 12 },
  px(2, 0, "Y"), rect(1, 1, 3, 2, "Z"), px(2, 1, "Y"),
  rect(1, 3, 3, 6, "z"), vline(3, 3, 6, "W"),
  rect(0, 9, 5, 3, "w"), hline(0, 9, 5, "y"),
  lamp(2, 1, { r: 46, color: "#ffb060" }))

sprite("papers", { w: 18, h: 5 },
  rect(1, 1, 16, 4, "z"), hline(0, 0, 14, "W"), hline(1, 4, 16, "W"), rect(12, 2, 2, 1, "r"))

sprite("inkpot", { w: 8, h: 12 },
  rect(1, 7, 5, 5, "K"), hline(2, 6, 3, "b"), vline(6, 0, 9, "W"), vline(7, 0, 4, "z"))

// ---------------------------------------------------------------- 場景
// alt＝變化版：會改變的物件畫成改變後的樣子（遊戲裡只剪下那一塊蓋上去）
function studyScene(name, alt) {
scene(name, { w: W, h: H, bg: "2" },
  // 牆
  layer("wall",
    pattern("_damask", 0, 7, W, 84),
    rect(0, 0, W, 6, "6"), hline(0, 0, W, "5"), hline(0, 5, W, "8"), hline(0, 6, W, "K"),
    rect(0, 89, W, 4, "7"), hline(0, 89, W, "8"), hline(0, 92, W, "5"),
    pattern("_panel", 0, 93, W, 24),
    rect(0, 117, W, 4, "5"), hline(0, 117, W, "6")),
  // 窗外夜空（不受光照影響）
  layer("sky", { unlit: true },
    grad(188, 18, 56, 66, "lmno"),
    (c) => {
      const r = c.rng(5)
      for (let i = 0; i < 14; i++) c.px(189 + Math.floor(r() * 54), 19 + Math.floor(r() * 30), "o")
      for (let x = 188; x < 244; x++) { const h = 7 + Math.round(4 * Math.sin(x * 0.35) + 3 * Math.sin(x * 0.13)); c.vline(x, 84 - h, h, "K") }
    },
    circ(230, 31, 6, "M"), px(228, 29, "o"), px(232, 33, "o"), px(229, 33, "o")),
  // 地板
  layer("floor",
    (c) => { for (let row = 0; row * 7 < H - FLOOR; row++) c.pattern("_plank", -((row * 19) % 48), FLOOR + row * 7, W + 48, 7) },
    // 地毯
    rect(76, 136, 168, 38, "s"), box(76, 136, 168, 38, "r"), rect(80, 140, 160, 30, "w"), rect(82, 142, 156, 26, "t"),
    ellipse(160, 155, 30, 10, "s"), ellipse(160, 155, 22, 7, "w"), ellipse(160, 155, 20, 6, "t"), ellipse(160, 155, 6, 2, "w"),
    (c) => { for (let x = 77; x < 244; x += 2) { c.vline(x, 174, 2, "z"); c.vline(x, 134, 2, "z") } }),
  // 家具
  layer("props",
    lamp(216, 56, { r: 150, color: "#8494e8", power: 0.7 }),
    stamp("bookshelf", 6, 18),
    rect(184, 14, 64, 4, "5"), rect(184, 84, 64, 2, "5"), vline(184, 14, 72, "5"), vline(185, 14, 72, "6"),
    vline(244, 14, 72, "5"), vline(245, 14, 72, "6"), vline(246, 14, 72, "5"), vline(247, 14, 72, "6"),
    rect(215, 18, 2, 66, "5"), rect(188, 49, 56, 2, "5"),
    rect(180, 84, 72, 4, "7"), hline(180, 84, 72, "8"), hline(180, 88, 72, "K"),
    stamp("curtain", 170, 8), stamp("curtain", 244, 8, { flip: "x" }),
    rect(168, 5, 96, 8, "s"), hline(168, 5, 96, "u"),
    (c) => { for (let x = 168; x < 264; x += 8) c.ellipse(x + 4, 13, 4, 2, "s") },
    rect(166, 3, 100, 2, "w"), hline(166, 3, 100, "y"),
    stamp("portrait", 116, 14),
    stamp("clock", 262, 36),
    alt ? stamp("safe_open", 280, 96) : stamp("safe", 288, 96),
    stamp("desk", 98, 100),
    stamp("bankerlamp", 104, 84),
    stamp("candle", 124, 88), stamp("candle", 167, 88),
    stamp("papers", 132, 95), stamp("inkpot", 154, 88)),
  // 投影
  layer("shadow", { shade: 1, density: 0.6 },
    poly([98, 132, 182, 132, 190, 138, 92, 138], "k"),
    poly([6, 121, 74, 121, 80, 126, 6, 126], "k"),
    poly([262, 121, 290, 121, 296, 125, 262, 125], "k"),
    poly([288, 122, 316, 122, 320, 125, 288, 125], "k")),
  lighting({ cell: 2, smooth: true, ambient: 0.27, ambientColor: "#7078c0", emit: "lmnoMYZ" }),
  glow("Y", { r: 8, bands: 3, strength: 0.3 }),
  glow("Z", { r: 5, bands: 2, strength: 0.35 }),
  glow("M", { where: [222, 23, 17, 17], r: 6, bands: 2, strength: 0.3 }))
}
studyScene("study", false)
studyScene("study_alt", true)
