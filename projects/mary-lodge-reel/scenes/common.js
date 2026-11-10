// Shared helpers for every scene module. Scenes register themselves: window.SCENES.<id> = { dur, build(THREE, ctx) }.
// build() returns { group, lights:[THREE.Light], bg:'#hex', fog:[near,far]|null, setT(t) -> {pos:[x,y,z], look:[x,y,z], fov} }.
// Coordinates are local to the scene (origin at its own centre, y up, metres). The film manager moves the group far away from other scenes.
window.SCENES = window.SCENES || {};
window.C = {
  clamp: (x) => Math.max(0, Math.min(1, x)),
  seg(t, a, b) { return Math.max(0, Math.min(1, (t - a) / (b - a))); },
  lerp: (a, b, t) => a + (b - a) * t,
  eo: (x) => 1 - Math.pow(1 - x, 3),
  eio: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  eob(x, o = 1.5) { const c3 = o + 1; return 1 + c3 * Math.pow(x - 1, 3) + o * Math.pow(x - 1, 2); },
  rng(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; },
  mat(THREE, c, r = 0.9, m = 0) { return new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m }); },
};
