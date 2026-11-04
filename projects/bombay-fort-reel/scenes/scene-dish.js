const { seg, eo, eio, eob, lerp, TextFx } = kit;
const c01 = (x) => Math.max(0, Math.min(1, x));
kit.scene('dish', {
  init(kit) {
    FortMap.load(kit);
    const row = (i, top, name, extra) => '<div class="dish-r' + i + '" style="position:absolute;left:70px;top:' + top + 'px;width:940px;height:90px">' +
      '<div class="dish-u' + i + '" style="position:absolute;left:0;top:0;width:100%;height:2px;background:color-mix(in srgb, var(--second) 24%, transparent);transform-origin:0 50%"></div>' +
      '<div style="position:absolute;left:0;top:20px;font-size:52px;font-weight:700">' + name + '</div>' + extra + '</div>';
    kit.stage.append(kit.h('<div class="ground">' +
      '<canvas class="mapc" width="1080" height="1920"></canvas>' +
      '<div style="position:absolute;left:0;right:0;top:840px;height:640px;background:linear-gradient(to bottom, transparent, var(--ground) 70%)"></div>' +
      '<svg style="position:absolute;left:0;top:0;width:1080px;height:1920px;overflow:visible" viewBox="0 0 1080 1920"><mask id="dish-m"><path class="dish-mp" d="M0 0" fill="none" stroke="#fff" stroke-width="14" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/></mask><path class="dish-ap" d="M0 0" fill="none" stroke="#E8B04A" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 14" mask="url(#dish-m)"/></svg>' +
      '<div class="mono dish-iran" style="position:absolute;left:56px;top:640px;color:var(--main)">Iran</div>' +
      '<div class="prog"><i></i></div>' +
      '<div class="hdr"><span>The dish</span><b>Since 1923</b></div>' +
      '<div class="words" style="left:56px;top:350px;width:968px"><h2 class="line">The berry pulao</h2></div>' +
      row(1, 1000, 'Saffron rice', '') + row(2, 1092, 'Chicken or mutton', '') + row(3, 1184, 'Barberries', '<div class="mono" style="position:absolute;right:0;top:36px;color:var(--main)">Imported from Iran</div>') +
      '<p class="cap dish-c1" style="top:1300px">And there is one reason people still make the trip.</p>' +
      '<p class="cap dish-c2" style="top:1300px">The berry pulao.</p>' +
      '<p class="cap dish-c3" style="top:1300px">Saffron rice, chicken or mutton,</p>' +
      '<p class="cap dish-c4" style="top:1300px">and tart barberries, still brought in from Iran.</p></div>'));
    const q = (s) => kit.stage.querySelector(s);
    this.ctx = q('canvas').getContext('2d'); this.bar = q('.prog i').style; this.line = q('.line');
    this.r = [1, 2, 3].map((i) => q('.dish-r' + i).style); this.u = [1, 2, 3].map((i) => q('.dish-u' + i).style);
    this.mp = q('.dish-mp'); this.ap = q('.dish-ap'); this.iran = q('.dish-iran').style;
    this.c = [1, 2, 3, 4].map((i) => q('.dish-c' + i));
  },
  render(t, kit) {
    const u = eio(seg(t, 0, 10));
    const cam = { W: 1080, H: 1500, fx: lerp(12, 0, u), fy: lerp(-10, 6, u), rot: lerp(0.4, 0.85, u), s: lerp(2.5, 3.2, u), k: 0.56, hk: 0.95 };
    this.ctx.clearRect(0, 0, 1080, 1920);
    FortMap.draw(this.ctx, cam, { rise: 1, pins: [{ x: 0, y: 0, t: t, a: 1 }] });
    const p = FortMap.project(cam, 0, 0, 0);
    const d = 'M 60 700 Q 330 470 ' + p[0].toFixed(1) + ' ' + (p[1] - 18).toFixed(1);
    this.mp.setAttribute('d', d); this.ap.setAttribute('d', d);
    this.mp.setAttribute('stroke-dashoffset', String(1 - eio(seg(t, 6.2, 8.6))));
    this.iran.opacity = seg(t, 6.0, 6.6);
    this.bar.transform = 'scaleX(' + c01((kit.start + t) / 52) + ')';
    const at = [3.4, 4.2, 5.0];
    for (let i = 0; i < 3; i++) {
      this.u[i].transform = 'scaleX(' + eio(seg(t, at[i] - 0.3, at[i] + 0.5)) + ')';
      this.r[i].opacity = seg(t, at[i], at[i] + 0.5); this.r[i].transform = 'translateY(' + (1 - eo(seg(t, at[i], at[i] + 0.6))) * 20 + 'px)';
    }
    const w = [[0.2, 3.3], [3.4, 5.1], [5.2, 7.7], [7.8, 10.2]];
    for (let i = 0; i < 4; i++) {
      TextFx.fadeFromRight(this.c[i], t, w[i][0], { stagger: 0.14 });
      this.c[i].style.visibility = t >= w[i][0] - 0.05 && t < w[i][1] ? 'visible' : 'hidden';
    }
    TextFx.fadeFromRight(this.line, t, -0.4);
  },
});
