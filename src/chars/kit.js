// 48px 手畫角色的工具包
// 大的色塊（頭、身體、裙子）用形狀函式鋪底，臉、眼睛、髮束、道具再逐列手寫（[y, x, 字串]，'.' 不畫）。
// 規則（沿用 PixelArtChar 手畫版）：不畫黑框、每種材質 2～3 色、大而平的色塊、3/4 側身面向右。
// 光從右前方來：同一塊材質，左邊（背面）暗、右邊（正面）亮。
window.Kit = (() => {
'use strict';
const W = 34, H = 56;

const blank = () => [...Array(H)].map(() => Array(W).fill('.'));
function set(g, x, y, c) {
  x = Math.round(x); y = Math.round(y);
  if (c !== '.' && c !== ' ' && x >= 0 && y >= 0 && x < W && y < H) g[y][x] = c;
}
// [y, x, 字串, x, 字串…]
function rows(g, list, dy = 0) {
  for (const [y, ...seg] of list) for (let i = 0; i < seg.length; i += 2) {
    const x = seg[i], s = seg[i + 1];
    for (let k = 0; k < s.length; k++) set(g, x + k, y + dy, s[k]);
  }
}
function ell(g, cx, cy, rx, ry, c, keep) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++)
      if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1 && (!keep || keep(x, y))) set(g, x, y, c);
}
function rect(g, x, y, w, h, c) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) set(g, x + i, y + j, c); }
// 梯形：第 y0 列從 l0 到 r0，第 y1 列從 l1 到 r1
function trap(g, y0, y1, l0, r0, l1, r1, c) {
  for (let y = y0; y <= y1; y++) {
    const t = y1 === y0 ? 0 : (y - y0) / (y1 - y0);
    const l = Math.round(l0 + (l1 - l0) * t), r = Math.round(r0 + (r1 - r0) * t);
    for (let x = l; x <= r; x++) set(g, x, y, c);
  }
}
// 多邊形（頂點用像素中心）：用來畫一撮一撮的髮束
function poly(g, pts, c) {
  const ys = pts.map(p => p[1]), y0 = Math.floor(Math.min(...ys)), y1 = Math.ceil(Math.max(...ys));
  for (let y = y0; y <= y1; y++) {
    const xs = [];
    for (let i = 0; i < pts.length; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
      if ((ay <= y && by > y) || (by <= y && ay > y)) xs.push(ax + (y - ay) * (bx - ax) / (by - ay));
    }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) for (let x = Math.round(xs[i]); x <= Math.round(xs[i + 1]); x++) set(g, x, y, c);
  }
  // 細尖端：掃描線可能漏掉頂點本身，補上
  for (const [x, y] of pts) set(g, x, y, c);
}
function line(g, x0, y0, x1, y1, c) {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let k = 0; k <= n; k++) set(g, x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n, c);
}
// 邊緣明暗：每列同一材質的連續色塊，最左 n 格換暗色、最右 m 格換亮色
function rim(g, mat, dark, light, n = 1, m = 1, y0 = 0, y1 = H - 1) {
  for (let y = y0; y <= y1; y++) {
    let x = 0;
    while (x < W) {
      if (g[y][x] !== mat) { x++; continue; }
      let e = x; while (e + 1 < W && g[y][e + 1] === mat) e++;
      const len = e - x + 1;
      if (dark) for (let i = 0; i < Math.min(n, len - 1); i++) g[y][x + i] = dark;
      if (light && len > n + 1) for (let i = 0; i < m; i++) g[y][e - i] = light;
      x = e + 1;
    }
  }
}
function recolor(g, map, keep) {
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++)
    if (map[g[y][x]] && (!keep || keep(x, y))) g[y][x] = map[g[y][x]];
}

// 共用的臉：面向右，臉的範圍 x18～27、第 19～27 列（dy 可整張臉上下移）
// fore：額頭那一列的顏色（有瀏海用陰影色 t，沒瀏海用 s）
function face(g, { dy = 0, fore = 't' } = {}) {
  rows(g, [
    [19, 18, fore.repeat(9)],
    [20, 18, 'ssssssssss'], [21, 18, 'ssssssssss'], [22, 18, 'ssssssssss'], [23, 18, 'ssssssssss'],
    // 第 27 列是下巴下緣接脖子：起點要跟第 26 列對齊（x19），不然沒頭髮擋的角色會凸出 1 格變成鋸齒
    [24, 18, 'sssssssst'], [25, 18, 'tsssssst'], [26, 19, 'tsssst'], [27, 19, 'ttsst'],
  ], dy);
}

return { W, H, blank, set, rows, ell, rect, trap, poly, line, rim, recolor, face };
})();
