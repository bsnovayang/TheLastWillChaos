// 輪盤：成功／出包／失敗三塊，大小照機率分配，轉幾圈後指針停在結果那一塊
// Wheel.spin(odds, info) → Promise<'s'|'m'|'f'>；可以重轉時會出現「上香重轉」按鈕
window.Wheel = (() => {
'use strict';
const COLORS = { s: ['#3f9a5a', '#5cc07a'], m: ['#c8902a', '#f0b84a'], f: ['#a83a46', '#d45a64'] };
const LABEL = { s: '成功', m: '出包', f: '失敗' };
let el, cv, g, info, btns;
let isSkipping = () => false;   // 由 App 設定：按住 Ctrl 時快轉
const setSkip = (fn) => { isSkipping = fn; };

function mount(stage) {
  el = document.createElement('div');
  el.id = 'wheel';
  el.innerHTML = `<div class="wbox"><div class="wtitle"></div><div class="wodds"></div>
    <div class="wmishap"></div><canvas width="220" height="220"></canvas><div class="wresult"></div><div class="wbtns"></div></div>`;
  stage.appendChild(el);
  cv = el.querySelector('canvas'); g = cv.getContext('2d');
  info = el.querySelector('.wtitle'); btns = el.querySelector('.wbtns');
}

// 三塊的起訖角度（0 在正上方，順時針）
function segs(o) {
  const order = [['s', o.s], ['m', o.m], ['f', o.f]];
  let a = 0; return order.map(([k, p]) => { const r = { k, a0: a, a1: a + p * Math.PI * 2 }; a = r.a1; return r; });
}
function draw(o, rot, hi) {
  const cx = 110, cy = 112, R = 96;
  g.clearRect(0, 0, 220, 220);
  for (const sgm of segs(o)) {
    if (sgm.a1 - sgm.a0 < 1e-4) continue;
    g.beginPath(); g.moveTo(cx, cy);
    g.arc(cx, cy, R, sgm.a0 + rot - Math.PI / 2, sgm.a1 + rot - Math.PI / 2);
    g.closePath();
    g.fillStyle = COLORS[sgm.k][hi === sgm.k ? 1 : 0]; g.fill();
    g.strokeStyle = '#0e1330'; g.lineWidth = 3; g.stroke();
    const mid = (sgm.a0 + sgm.a1) / 2 + rot - Math.PI / 2;
    if (sgm.a1 - sgm.a0 > 0.35) {
      g.fillStyle = '#fff'; g.font = 'bold 15px "Microsoft JhengHei", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(LABEL[sgm.k], cx + Math.cos(mid) * R * 0.6, cy + Math.sin(mid) * R * 0.6);
    }
  }
  g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.strokeStyle = '#e8b84a'; g.lineWidth = 5; g.stroke();
  g.beginPath(); g.arc(cx, cy, 12, 0, Math.PI * 2); g.fillStyle = '#e8b84a'; g.fill();
  // 指針（固定在正上方）
  g.beginPath(); g.moveTo(cx, cy - R + 14); g.lineTo(cx - 11, 2); g.lineTo(cx + 11, 2); g.closePath();
  g.fillStyle = '#fff4d0'; g.fill(); g.strokeStyle = '#0e1330'; g.lineWidth = 2; g.stroke();
}

// 讓結果那一塊停在指針下：指針在 0 度，所以輪盤要轉到 -（目標角度）
function animate(o, out) {
  const sg = segs(o).find(x => x.k === out);
  const span = sg.a1 - sg.a0;
  const target = sg.a0 + span * (0.15 + Math.random() * 0.7);
  // 圈數必須是整數，不然多出來的角度會讓指針停到別塊（隨機感由上面「在該塊裡隨機挑停點」提供）
  const end = Math.PI * 2 * (4 + Math.floor(Math.random() * 2)) - target;
  const dur = isSkipping() ? 250 : 2600, t0 = performance.now();
  return new Promise(ok => {
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - t, 4);
      draw(o, end * e, t >= 1 ? out : null);
      if (t < 1) requestAnimationFrame(step); else ok();
    };
    requestAnimationFrame(step);
  });
}

const pct = (p) => Math.round(p * 100) + '%';
function spin(o, { title, canReroll, onReroll, mishap }) {
  el.style.display = 'flex';
  info.textContent = title;
  el.querySelector('.wodds').innerHTML =
    `<span class="s">成功 ${pct(o.s)}</span>${o.m > 0 ? `<span class="m">出包 ${pct(o.m)}</span>` : ''}<span class="f">失敗 ${pct(o.f)}</span>`;
  el.querySelector('.wmishap').textContent = o.m > 0 && mishap ? `出包＝${mishap}` : '';
  const res = el.querySelector('.wresult');
  return new Promise(async (done) => {
    const go = async () => {
      btns.innerHTML = ''; res.textContent = ''; res.className = 'wresult';
      const out = Engine.roll(o);
      await animate(o, out);
      res.textContent = { s: '成功！', m: '成功了……但出包了', f: '失敗' }[out];
      res.classList.add(out);
      const ok = document.createElement('button'); ok.textContent = '繼續';
      ok.onclick = () => { el.style.display = 'none'; done(out); };
      if (isSkipping()) setTimeout(() => ok.onclick(), 120);
      btns.appendChild(ok);
      if (out !== 's' && canReroll()) {
        const rr = document.createElement('button'); rr.textContent = '🙏 上香重轉'; rr.className = 'alt';
        rr.onclick = () => { onReroll(); go(); };
        btns.appendChild(rr);
      }
    };
    draw(o, 0, null);
    await new Promise(r => setTimeout(r, isSkipping() ? 0 : 350));
    go();
  });
}

return { mount, spin, draw, setSkip };
})();
