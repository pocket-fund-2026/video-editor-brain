kit.score(function (S, T) {
  const BPM = 100, B = 60 / BPM;
  S.tempo(BPM, { t0: 0 });
  S.program('pad', 'pad', { rev: 0.7 }); S.program('keys', 'ep', { rev: 0.35 }); S.program('bass', 'bass');
  S.program('mallet', 'marimba', { rev: 0.3 }); S.program('pluck', 'pluck', { rev: 0.4 });
  const prog = [['C3', ['C4', 'E4', 'G4', 'B4']], ['A2', ['C4', 'E4', 'A4', 'C5']], ['F2', ['C4', 'F4', 'A4', 'C5']], ['G2', ['B3', 'D4', 'G4', 'D5']]];
  S.note('pad', 'C3', { beat: 0, beats: 12, vel: 34 }); S.note('pad', 'G3', { beat: 0, beats: 12, vel: 26 });
  for (let bar = 3; bar < 21; bar++) {
    const c = prog[bar % 4], b = bar * 4;
    S.chord('keys', c[1], { beat: b, beats: 3.5, vel: bar < 5 ? 38 : 50, spread: 0.03 });
    if (bar >= 3) S.note('bass', c[0], { beat: b, beats: 1.5, vel: 66 }); if (bar >= 3) S.note('bass', c[0], { beat: b + 2.5, beats: 1, vel: 56 });
  }
  const m = ['E5', 'G5', 'C6', 'G5', 'E5', 'A5'];
  S.pattern('mallet', 'x.x.X.x.', { from: 12, repeat: 18, pitch: m, vel: 52 });
  S.drums({ kick: 'x...x...', sidestick: '..x...x.', hat: 'oxoxoxox' }, { from: 16, repeat: 14 });
  S.fx('whoosh', T.hook + 1.9, { dur: 0.9 }); S.fx('revswell', T.hook + 5.4, { dur: 1.1 }); S.fx('thud', T.hook + 5.4); S.fx('pop', T.hook + 5.8);
  for (let i = 0; i < 12; i++) S.fx('tick', T.hook + 4.9 + i * 0.14, { vel: 28 });
  [1.14, 3.46, 6.09].forEach((a) => S.fx('pop', T.story + a));
  [4.04, 4.87, 5.96].forEach((a) => S.fx('ding', T.dish + a, { vel: 55 }));
  S.fx('whoosh', T.dish + 6.94, { dur: 1.7 }); S.fx('sparkle', T.dish + 8.64);
  S.fx('thud', T.verdict + 2.51); S.fx('ding', T.verdict + 2.9); S.fx('pop', T.verdict + 8.0);
  S.fx('roll', T.verdict + 8.72, { dur: 1.7 }); S.fx('chime', T.verdict + 10.42);
  [0.3, 0.55, 2.31, 3.49].forEach((a) => S.fx('pop', T.visit + a)); S.fx('whoosh', T.visit + 0.1, { dur: 0.7 }); S.fx('thud', T.visit + 4.14);
  S.fx('whoosh', T.nearby + 0.19, { dur: 1.4 }); S.fx('boing', T.nearby + 1.42); S.fx('chime', T.nearby + 1.5);
  S.fx('whoosh', T.end, { dur: 2.2 }); S.fx('boing', T.end + 0.9); S.fx('chime', T.end + 1.5); S.fx('sparkle', T.end + 1.1);
  [1.11, 1.29, 1.47].forEach((a) => S.fx('pop', T.end + a));
  S.run('pluck', ['C5', 'E5', 'G5', 'C6', 'E6'], { t: T.end + 1.0, step: 0.12, vel: 52, cresc: 10 });
  S.chord('keys', ['C4', 'E4', 'G4', 'B4', 'D5'], { t: T.end + 1.5, dur: 2.6, vel: 70 });
  S.note('bass', 'C2', { t: T.end + 1.5, dur: 2.5, vel: 74 });
  S.master({ gain: -6, fadeOut: 1.4 });
});
