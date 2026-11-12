// 總覽（只用來檢查，不給遊戲用）
include("chars.px.js")
scene("contact", { w: 4 * 86 + 4, h: 2 * 86 + 50, bg: "#d8a8a8" },
  ...["kui_normal", "kui_smile", "kui_shock", "kui_sad"].map((n, i) => stamp(n, 4 + i * 86, 4)),
  ...["uncle_normal", "uncle_angry", "uncle_shock", "uncle_smug"].map((n, i) => stamp(n, 4 + i * 86, 90)),
  stamp("kui_chibi", 20, 178), stamp("uncle_chibi", 60, 178))
