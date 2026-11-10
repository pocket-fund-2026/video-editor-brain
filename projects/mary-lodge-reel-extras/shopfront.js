// Scene 2: the generated Mary Lodge storefront image, pushed in toward the arched doorway on a slightly curved sheet so the push has parallax.
// The ink pass runs colour-edge detection on this scene (see ink.set) so the picture matches the illustrated look of the 3D scenes.
(function () {
window.SCENES.shopfront = { dur: 8, ink: { colEdge: 1.0, bands: 5, sat: 0.6, hatch: 0.16, line: 2.2 }, build(THREE, ctx) {
  const { seg, lerp, eio, eo } = window.C;
  const group = new THREE.Group();
  const tex = new THREE.Texture(); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  window.pending = (window.pending || 0) + 1; const img = new Image(); img.onload = () => { tex.image = img; tex.needsUpdate = true; window.pending--; }; img.src = window.SHOP_IMG;
  // sheet bowed toward the viewer at the doorway: cheap depth for parallax
  const g = new THREE.PlaneGeometry(1, 1, 48, 48), P = g.attributes.position;
  for (let i = 0; i < P.count; i++) { const x = P.getX(i), y = P.getY(i); const d = Math.hypot(x + 0.03, y + 0.12); P.setZ(i, 0.07 * Math.exp(-d * d * 14) - 0.05 * Math.abs(x)); }
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: tex })); group.add(m);
  function setT(t) {
    const a = eio(seg(t, 0, 8)), tg = [lerp(0, -0.03, a), lerp(0.02, -0.1, a), 0.02];
    const dist = lerp(3.45, 1.75, a), sway = Math.sin(t * 0.7) * 0.05 * (0.4 + a);
    return { pos: [tg[0] + sway + lerp(0.12, 0, a), tg[1] + 0.02 * Math.sin(t * 0.9), dist], look: tg, fov: 30, near: 0.1, far: 30 };
  }
  return { group, lights: [], bg: '#10201f', fog: null, setT };
} };
})();
