const { seg, eo, eio, eob, lerp, TextFx } = kit;
const c01 = (x) => Math.max(0, Math.min(1, x));
kit.scene('story', {
  init(kit) {
    FortMap.load(kit);
    const node = (id, x, al, yr, tx) => '<div class="story-n' + id + '"><div class="mono" style="position:absolute;left:' + (al === 'left' ? x : al === 'right' ? x - 300 : x - 150) + 'px;top:1078px;width:300px;text-align:' + al + '">' + yr + '</div>' +
      '<div class="story-d' + id + '" style="position:absolute;left:' + (al === 'left' ? x : al === 'right' ? x - 28 : x - 14) + 'px;top:1164px;width:28px;height:28px;border-radius:50%;background:var(--main)"></div>' +
      '<div style="position:absolute;left:' + (al === 'left' ? x : al === 'right' ? x - 300 : x - 150) + 'px;top:1212px;width:300px;text-align:' + al + ';font-size:32px;line-height:1.15;font-weight:700">' + tx + '</div></div>';
    kit.stage.append(kit.h('<div class="ground">' +
      '<canvas class="mapc" width="1080" height="1920"></canvas>' +
      '<div class="prog"><i></i></div>' +
      '<div class="hdr"><span>1923 to now</span><b>Still open</b></div>' +
      '<div class="words" style="left:56px;top:350px;width:968px"><h2 class="line">A family business since 1923</h2></div>' +
      '<div class="story-rail" style="position:absolute;left:70px;top:1176px;width:940px;height:4px;background:var(--main);transform-origin:0 50%"></div>' +
      node(1, 70, 'left', '1923', 'Rashid Kohinoor opens Britannia') + node(2, 540, 'center', 'Age 20', 'Son Boman takes over') + node(3, 1010, 'right', '2019', 'Boman passes at 97. The family carries on.') +
      '<p class="cap story-c1">An Iranian immigrant, Rashid Kohinoor, opened it.</p>' +
      '<p class="cap story-c2">His son Boman took over at twenty,</p>' +
      '<p class="cap story-c3">and kept it going until he died at ninety seven.</p></div>'));
    const q = (s) => kit.stage.querySelector(s);
    this.ctx = q('canvas').getContext('2d'); this.bar = q('.prog i').style; this.rail = q('.story-rail').style; this.line = q('.line');
    this.n = [1, 2, 3].map((i) => q('.story-n' + i).style); this.d = [1, 2, 3].map((i) => q('.story-d' + i).style);
    this.c = [1, 2, 3].map((i) => q('.story-c' + i));
  },
  render(t, kit) {
    const u = seg(t, 0, 9);
    const cam = { W: 1080, H: 1920, fx: lerp(0, 12, u), fy: lerp(0, -10, u), rot: lerp(-0.2, 0.4, eio(u)), s: lerp(2.1, 2.5, eio(u)), k: 0.56, hk: 0.95 };
    FortMap.draw(this.ctx, cam, { rise: 1, pins: [{ x: 0, y: 0, t: t, a: 1 }] });
    this.bar.transform = 'scaleX(' + c01((kit.start + t) / 52) + ')';
    this.rail.transform = 'scaleX(' + eio(seg(t, 0.5, 8)) + ')';
    const at = [0.8, 3.2, 5.6];
    for (let i = 0; i < 3; i++) {
      const p = eob(seg(t, at[i], at[i] + 0.6), 1.7);
      this.n[i].opacity = seg(t, at[i], at[i] + 0.4); this.n[i].transform = 'translateY(' + (1 - eo(seg(t, at[i], at[i] + 0.6))) * 18 + 'px)';
      this.d[i].transform = 'scale(' + p + ')';
    }
    const w = [[0.2, 3.0], [3.2, 5.4], [5.6, 9.2]];
    for (let i = 0; i < 3; i++) {
      TextFx.fadeFromRight(this.c[i], t, w[i][0], { stagger: 0.14 });
      this.c[i].style.visibility = t >= w[i][0] - 0.05 && t < w[i][1] ? 'visible' : 'hidden';
    }
    TextFx.fadeFromRight(this.line, t, -0.4);
  },
});
