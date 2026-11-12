// 手畫點陣角色的合成器（移植自 PixelArtChar/lab/hand.js，拿掉耳朵、鹿角與走路，留下待機）
// 角色用「每列 [y, x, 字串, x, 字串…]」描述；身體幾乎不動，生命感來自呼吸、後髮飄動、眨眼。
window.Sprite48 = (() => {
'use strict';

function build(W, H, rows) {
  const g = [...Array(H)].map(() => Array(W).fill('.'));
  for (const [y, ...ch] of rows) {
    for (let i = 0; i < ch.length; i += 2) {
      const x = ch[i], s = ch[i + 1];
      for (let k = 0; k < s.length; k++) if (s[k] !== '.' && s[k] !== ' ') {
        if (x + k >= W) throw new Error(`第 ${y} 列超出寬度：x=${x + k}`);
        g[y][x + k] = s[k];
      }
    }
  }
  return g;
}

// f = { breath: 上半身下沉 px, hair: 後髮尾端位移 px, blink: 是否閉眼 }
function frame(spec, f) {
  const cv = document.createElement('canvas');
  cv.width = spec.W; cv.height = spec.H + 2;
  const ctx = cv.getContext('2d');
  const put = (x, y, ch) => { const c = spec.PAL[ch]; if (c) { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); } };
  const dy = f.breath || 0;

  const bodyPx = (row, y, oy) => {
    const hairRow = y >= spec.hairRows[0] && y <= spec.hairRows[1];
    row.forEach((ch, x) => {
      if (ch === '.') return;
      // 後髮髮尾：越下面飄越多；只推頭髮的顏色，同一列的衣服不動
      const isHair = hairRow && x <= spec.hairMaxX && 'abc'.includes(ch);
      const hx = isHair ? Math.round(f.hair * (y - spec.hairRows[0] + 1) / (spec.hairRows[1] - spec.hairRows[0] + 1)) : 0;
      let c = ch;
      if (f.blink && spec.blink[y]) {
        const [bx, s] = spec.blink[y];
        if (x >= bx && x < bx + s.length) c = s[x - bx];
      }
      put(x + hx, y + oy, c);
    });
  };
  spec.body.forEach((row, y) => { if (y >= spec.splitY) bodyPx(row, y, 0); });
  spec.body.forEach((row, y) => { if (y < spec.splitY) bodyPx(row, y, dy); });
  for (const o of spec.over || []) o.map.forEach((r, i) => [...r].forEach((ch, j) => ch !== '.' && put(o.x + j, o.y + i + dy, ch)));
  return cv;
}

// 待機 16 格：呼吸（第 5～11 格上半身下沉 1px）、後髮飄、第 13 格眨眼
const IDLE = [...Array(16)].map((_, i) => {
  const ph = i / 16 * Math.PI * 2;
  return { breath: (i >= 5 && i <= 11) ? 1 : 0, hair: Math.round(-1.2 * Math.sin(ph - 1.2)), blink: i === 13 };
});

function idle(spec) { return IDLE.map(f => frame(spec, f)); }

return { build, frame, idle };
})();
