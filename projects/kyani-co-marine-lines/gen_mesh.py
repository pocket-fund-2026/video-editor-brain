#!/usr/bin/env python3
"""OSM region (data/map.json) -> raea BufferMesh arrays (src/mapdata.ts).
World: 1 unit = 1 metre, x east, z south (toward the viewer), y up. Heights come from the OSM levels (map.json 'h').
Outputs three meshes: city (all buildings except Jer Mahal), jer (the Kyani building, separate so it can be lit red),
roads (flat ribbons), plus the Jer Mahal footprint/centre/edge data the hand-modelled detail pass is placed from.
Run from projects/kyani-co-marine-lines:  python3 gen_mesh.py"""
import json, math, os

KY = 425  # index of the OSM building that contains the Kyani & Co. node (checked by point-in-polygon)
d = json.load(open("data/map.json"))

def hexrgb(h):
    h = h.lstrip("#"); return [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]

def area2(P):
    return sum(P[i][0] * P[(i + 1) % len(P)][1] - P[(i + 1) % len(P)][0] * P[i][1] for i in range(len(P)))

def ear_clip(P):
    """Triangulate a simple polygon (list of (x,y)); returns index triples into P."""
    n = len(P)
    if n < 3: return []
    idx = list(range(n))
    if area2(P) < 0: idx.reverse()
    tris = []; guard = 0
    def cross(a, b, c): return (P[b][0] - P[a][0]) * (P[c][1] - P[a][1]) - (P[b][1] - P[a][1]) * (P[c][0] - P[a][0])
    def inside(p, a, b, c):
        return cross(a, b, p) >= 0 and cross(b, c, p) >= 0 and cross(c, a, p) >= 0
    while len(idx) > 3 and guard < 5000:
        guard += 1; ear = False
        for k in range(len(idx)):
            a, b, c = idx[k - 1], idx[k], idx[(k + 1) % len(idx)]
            if cross(a, b, c) <= 1e-9: continue
            if any(inside(o, a, b, c) for o in idx if o not in (a, b, c)): continue
            tris.append((a, b, c)); idx.pop(k); ear = True; break
        if not ear:
            for k in range(1, len(idx) - 1): tris.append((idx[0], idx[k], idx[k + 1]))
            return tris
    if len(idx) == 3: tris.append(tuple(idx))
    return tris

class Mesh:
    def __init__(self): self.pos = []; self.nor = []; self.col = []; self.idx = []
    def v(self, p, n, c):
        self.pos += [round(p[0], 2), round(p[1], 2), round(p[2], 2)]; self.nor += [round(n[0], 3), round(n[1], 3), round(n[2], 3)]
        self.col += [round(c[0] ** 2.2, 4), round(c[1] ** 2.2, 4), round(c[2] ** 2.2, 4), 1]; return len(self.pos) // 3 - 1
    def tri(self, a, b, c): self.idx += [a, b, c]
    def quad(self, a, b, c, dd): self.tri(a, b, c); self.tri(a, c, dd)
    def out(self): return {"positions": self.pos, "normals": self.nor, "colors": self.col, "indices": self.idx}

def extrude(M, P, h, wall, roof, y0=0.0):
    if P[0] == P[-1]: P = P[:-1]
    if len(P) < 3: return
    if area2(P) < 0: P = P[::-1]   # counter-clockwise in (x, z-south) plane
    n = len(P)
    for i in range(n):
        (x1, z1), (x2, z2) = P[i], P[(i + 1) % n]
        dx, dz = x2 - x1, z2 - z1; L = math.hypot(dx, dz) or 1
        nn = (dz / L, 0, -dx / L)   # outward for this winding (verified by the cull test render)
        shade = 0.82 + 0.18 * (nn[0] * 0.5 + nn[2] * 0.6)
        c = [wall[0] * shade, wall[1] * shade, wall[2] * shade]
        a = M.v((x1, y0, z1), nn, c); b = M.v((x2, y0, z2), nn, c); cc = M.v((x2, h, z2), nn, c); dd = M.v((x1, h, z1), nn, c)
        M.quad(a, dd, cc, b)
    ids = [M.v((p[0], h, p[1]), (0, 1, 0), roof) for p in P]
    for a, b, c in ear_clip(P): M.tri(ids[a], ids[c], ids[b])

def ribbon(M, pts, w, y, col):
    for i in range(len(pts) - 1):
        (x1, z1), (x2, z2) = pts[i], pts[i + 1]; dx, dz = x2 - x1, z2 - z1; L = math.hypot(dx, dz)
        if L < 0.01: continue
        nx, nz = -dz / L * w / 2, dx / L * w / 2
        a = M.v((x1 - nx, y, z1 - nz), (0, 1, 0), col); b = M.v((x1 + nx, y, z1 + nz), (0, 1, 0), col)
        c = M.v((x2 + nx, y, z2 + nz), (0, 1, 0), col); e = M.v((x2 - nx, y, z2 - nz), (0, 1, 0), col)
        M.quad(a, b, c, e)

city, jer, roads, green = Mesh(), Mesh(), Mesh(), Mesh()
PAL = [hexrgb(x) for x in ("#15171d", "#1a1d26", "#1f232e", "#181b23", "#222634")]
for i, b in enumerate(d["b"]):
    P = list(zip(b["p"][0::2], b["p"][1::2])); h = float(b.get("h") or 9)
    if i == KY:
        extrude(jer, P, h, hexrgb("#d0344a"), hexrgb("#f1f4f6")); continue
    base = PAL[(i * 7) % len(PAL)]
    extrude(city, P, h, base, [min(1, c + 0.07) for c in base])
for r in d["r"]:
    P = list(zip(r["p"][0::2], r["p"][1::2])); w = float(r.get("w") or 8)
    ribbon(roads, P, min(11.0, max(3.5, w * 0.55)), 0.15, hexrgb("#2b303c"))
for g in d["g"]:
    P = list(zip(g["p"][0::2], g["p"][1::2]))
    if len(P) >= 4:
        if P[0] == P[-1]: P = P[:-1]
        if area2(P) < 0: P = P[::-1]
        ids = [green.v((p[0], 0.1, p[1]), (0, 1, 0), hexrgb("#1f4a3a")) for p in P]
        for a, b, c in ear_clip(P): green.tri(ids[a], ids[c], ids[b])

# Mumbai island silhouette + city streets from the Britannia film's outline (metres from Britannia), re-centred on Kyani
bm = json.load(open("../bombay-fort-reel/data/mumbai.json"))
kx = 111320 * math.cos(math.radians(18.9441069)); ky = 110574
bx = (72.840358 - 72.8287886) * kx; by = -(18.934473 - 18.9441069) * ky
sil, sroad, edge = Mesh(), Mesh(), Mesh()
allp = []
for ring in bm["rings"]:
    P = [(ring[i] + bx, ring[i + 1] + by) for i in range(0, len(ring) - 1, 2)]
    if P[0] == P[-1]: P = P[:-1]
    if len(P) < 4: continue
    allp += P
    ids = [sil.v((p[0], -3.0, p[1]), (0, 1, 0), hexrgb("#16212d")) for p in P]
    if area2(P) < 0: ids = ids[::-1]; Q = P[::-1]
    else: Q = P
    for a, b, c in ear_clip(Q): sil.tri(ids[a], ids[c], ids[b]) if False else sil.tri(ids[a], ids[c], ids[b])
    ribbon(edge, P + [P[0]], 90.0, -2.0, hexrgb("#8be0b5") if False else hexrgb("#d0344a"))
for r in bm["roads"]:
    P = [(r[i] + bx, r[i + 1] + by) for i in range(0, len(r) - 1, 2)]
    ribbon(sroad, P, 70.0, -2.5, hexrgb("#46546a"))
bb = [min(p[0] for p in allp), min(p[1] for p in allp), max(p[0] for p in allp), max(p[1] for p in allp)]
# ---- hand-modelled detail pass for the Jer Mahal building (L042): windows by floor, parapet, rooftop box, shopfront band
jer_lit, jer_dark, jer_det = Mesh(), Mesh(), Mesh()
Pj = list(zip(d["b"][KY]["p"][0::2], d["b"][KY]["p"][1::2]))
if Pj[0] == Pj[-1]: Pj = Pj[:-1]
if area2(Pj) < 0: Pj = Pj[::-1]
HJ = float(d["b"][KY].get("h") or 18); gcx = sum(p[0] for p in Pj) / len(Pj); gcz = sum(p[1] for p in Pj) / len(Pj)
floors = 5; fh = (HJ - 3.2) / (floors - 1)
def facequad(M, p1, p2, y0, y1, off, col):
    (x1, z1), (x2, z2) = p1, p2; dx, dz = x2 - x1, z2 - z1; L = math.hypot(dx, dz) or 1; nn = (dz / L, 0, -dx / L)
    a = M.v((x1 + nn[0] * off, y0, z1 + nn[2] * off), nn, col); b = M.v((x2 + nn[0] * off, y0, z2 + nn[2] * off), nn, col)
    c = M.v((x2 + nn[0] * off, y1, z2 + nn[2] * off), nn, col); e = M.v((x1 + nn[0] * off, y1, z1 + nn[2] * off), nn, col)
    M.quad(a, e, c, b)
win_i = 0
for i in range(len(Pj)):
    (x1, z1), (x2, z2) = Pj[i], Pj[(i + 1) % len(Pj)]; L = math.hypot(x2 - x1, z2 - z1)
    if L < 7: continue
    n = int((L - 2.0) // 3.2); ux, uz = (x2 - x1) / L, (z2 - z1) / L
    for f in range(floors):
        y = 3.4 + f * fh if f else 0.0
        if f == 0: continue                         # ground floor is the shopfront band below
        for k in range(n):
            s0 = 1.6 + k * 3.2; s1 = s0 + 1.5
            p1 = (x1 + ux * s0, z1 + uz * s0); p2 = (x1 + ux * s1, z1 + uz * s1)
            win_i += 1; lit = (win_i * 7 + f * 3) % 5 in (0, 2)
            facequad(jer_lit if lit else jer_dark, p1, p2, y + 0.5, y + 2.4, 0.12, hexrgb("#f1f4f6") if lit else hexrgb("#10151e"))
            facequad(jer_det, p1, p2, y + 2.4, y + 2.7, 0.14, hexrgb("#f1f4f6"))      # lintel
            facequad(jer_det, p1, p2, y + 0.3, y + 0.5, 0.18, hexrgb("#f1f4f6"))      # sill
    # shopfront band: dark arcade with a red fascia, a marble plinth below the first floor
    ps, pe = (x1 + ux * 1.0, z1 + uz * 1.0), (x2 - ux * 1.0, z2 - uz * 1.0)
    facequad(jer_dark, ps, pe, 0.3, 3.0, 0.14, hexrgb("#0d1016"))
    facequad(jer_det, ps, pe, 3.0, 3.5, 0.2, hexrgb("#d0344a"))
    facequad(jer_det, ps, pe, 0.0, 0.3, 0.2, hexrgb("#f1f4f6"))
# parapet ring + rooftop water tank + stair box
Pin = [(gcx + (x - gcx) * 1.025, gcz + (z - gcz) * 1.025) for x, z in Pj]
extrude(jer_det, Pin, HJ + 1.1, hexrgb("#f1f4f6"), hexrgb("#d9dde2"), y0=HJ - 0.2)
box = [(gcx - 3, gcz - 2.5), (gcx + 3, gcz - 2.5), (gcx + 3, gcz + 2.5), (gcx - 3, gcz + 2.5)]
extrude(jer_det, box, HJ + 3.6, hexrgb("#c7ccd4"), hexrgb("#e6e9ee"), y0=HJ)
tank = [(gcx + 10 + 2.2 * math.cos(a * math.pi / 6), gcz + 6 + 2.2 * math.sin(a * math.pi / 6)) for a in range(12)]
extrude(jer_det, tank, HJ + 2.8, hexrgb("#d0344a"), hexrgb("#d0344a"), y0=HJ)

# Jer Mahal footprint facts for the hand-modelled detail pass
b = d["b"][KY]; P = list(zip(b["p"][0::2], b["p"][1::2]))
if P[0] == P[-1]: P = P[:-1]
cx = sum(p[0] for p in P) / len(P); cz = sum(p[1] for p in P) / len(P)
edges = sorted(((math.hypot(P[(i + 1) % len(P)][0] - P[i][0], P[(i + 1) % len(P)][1] - P[i][1]), i) for i in range(len(P))), reverse=True)
facts = {"h": float(b.get("h") or 18), "centre": [round(cx, 1), round(cz, 1)], "footprint": [[round(x, 1), round(z, 1)] for x, z in P],
         "longEdges": [[round(L, 1), [round(P[i][0], 1), round(P[i][1], 1)], [round(P[(i + 1) % len(P)][0], 1), round(P[(i + 1) % len(P)][1], 1)]] for L, i in edges[:3]]}
os.makedirs("src", exist_ok=True)
open("src/mapdata.ts", "w").write("// generated by gen_mesh.py from OpenStreetMap data (c) OpenStreetMap contributors, do not edit\n"
    + "export const CITY = " + json.dumps(city.out(), separators=(",", ":")) + ";\n"
    + "export const JER = " + json.dumps(jer.out(), separators=(",", ":")) + ";\n"
    + "export const ROADS = " + json.dumps(roads.out(), separators=(",", ":")) + ";\n"
    + "export const JERWINLIT = " + json.dumps(jer_lit.out(), separators=(",", ":")) + ";\n"
    + "export const JERWINDARK = " + json.dumps(jer_dark.out(), separators=(",", ":")) + ";\n"
    + "export const JERDETAIL = " + json.dumps(jer_det.out(), separators=(",", ":")) + ";\n"
    + "export const SIL = " + json.dumps(sil.out(), separators=(",", ":")) + ";\n"
    + "export const SILEDGE = " + json.dumps(edge.out(), separators=(",", ":")) + ";\n"
    + "export const SILROADS = " + json.dumps(sroad.out(), separators=(",", ":")) + ";\n"
    + "export const ISLAND_BBOX = " + json.dumps([round(x) for x in bb]) + ";\n"
    + "export const JER_FACTS = " + json.dumps(facts) + ";\n")
print("city tris", len(city.idx) // 3, "roads tris", len(roads.idx) // 3, "jer", facts)
