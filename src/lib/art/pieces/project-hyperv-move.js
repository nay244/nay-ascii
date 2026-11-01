/* project-hyperv-move: the migration, drawn literally. Blocks lift out of the VMware rack and cross to the Hyper-V rack one at a time, their lights blinking all the way over, and the heartbeat along the floor never drops. No block stands for a real number of machines. */
import { clamp } from "../vendor/ascii-magic/lib/kit.js";
import { H, HYPER, canvas, ease, hex, mix, sceneMeta } from "./scene.js";

export const meta = sceneMeta({
  slug: "project-hyperv-move", name: "Hyper-V rack to rack",
  note: "Blocks cross from a VMware rack to a Hyper-V rack one at a time, lights blinking throughout, over a heartbeat that never drops.",
  tags: ["servers", "racks", "migration", "hyper-v", "vmware"],
  pal: HYPER, wide: 324, tone: { curve: 0.54 },
});

// One colour per team named in the résumé: network, server, application.
const TEAMS = [hex("#5a8fd8"), hex("#f0c050"), hex("#d97fb0")];
const COUNT = 12, EVERY = 1.3, MOVE = 1.05, HOLD = 3, RESET = 0.9, RUN = COUNT * EVERY, LOOP = RUN + HOLD + RESET, START = 5 * EVERY + 0.55;
const GREEN = hex("#6fcf8e"), FRAME = hex("#565664"), INSIDE = hex("#0a0a12"), EMPTY = hex("#161430"), WARM = hex("#f7ae60"), COOL = hex("#a8cde0");
// A heartbeat, as a repeating shape along the line.
const beat = (u) => (u < 0.1 ? Math.sin((u / 0.1) * Math.PI) * 0.22 : u < 0.16 ? 0 : u < 0.19 ? -0.3 : u < 0.23 ? 1 : u < 0.27 ? -0.45 : u < 0.4 ? 0 : u < 0.5 ? Math.sin(((u - 0.4) / 0.1) * Math.PI) * 0.3 : 0);

export default function create(cols = meta.cols) {
  const s = canvas(cols, HYPER), CX = cols / 2, D = 54 * (cols / meta.cols), LX = CX - D, RX = CX + D;
  const slot = (rack, i) => [rack - 8.5 + (i % 2) * 17, 25 + Math.floor(i / 2) * 10];
  for (let y = 0; y < 86; y++) for (let x = 0; x < cols; x++) s.add(x, y, mix(hex("#241f4c"), hex("#3a3070"), clamp(y / 80 + 0.25 * Math.sin(x / 11) * Math.sin(y / 9) * 0.3)));
  // The floor: lines running back to the middle of the room.
  for (let y = 86; y < H; y++) for (let x = 0; x < cols; x++) {
    const k = (y - 84) / 24, radial = Math.abs(((x - CX) / k) % 22) < 1.1, row = Math.abs(Math.sin(Math.log(k + 0.2) * 8)) < 0.1;
    s.add(x, y, mix(hex("#161430"), hex("#584a98"), radial || row ? 0.32 : 0));
  }
  s.glow(LX, 50, 52, WARM, 0.14);
  s.glow(RX, 50, 62, COOL, 0.24);
  // The cable the blocks cross along.
  for (let i = 0; i <= 120; i++) { const u = i / 120, a = (1 - u) ** 2, b = 2 * u * (1 - u), c = u * u; s.add(a * (LX + 20) + b * CX + c * (RX - 20), a * 30 + b * 2 + c * 30, hex("#8270bc")); }
  for (const [rack, name, col, k] of [[LX, "VMWARE", hex("#f7ae60"), 0.7], [RX, "HYPER-V", hex("#fff3cc"), 1]]) {
    s.word(name, rack, 8, col, 2, k);
    s.box(rack, 49, 40, 66, 2, FRAME);
    s.box(rack, 49, 36, 62, 1, INSIDE);
    for (let i = 0; i < COUNT; i++) { const [x, y] = slot(rack, i); s.box(x, y, 15, 7, 1, EMPTY); }
    s.bar(rack - 22, 82, rack + 22, 82, 2, FRAME);
    // The rack's reflection in the floor.
    for (let y = 84; y < 100; y++) for (let x = rack - 20; x <= rack + 20; x++) s.add(x, y, hex("#30303e"), 0.5 * (1 - (y - 84) / 16));
  }
  s.freeze();
  const block = (x, y, i, t, k = 1, a = 1) => {
    const c = TEAMS[Math.floor(i / 2) % 3];
    s.box(x, y, 15 * k, 7 * k, k, c, a);
    s.rect(x - 6 * k, y - 1.6 * k, x + 1.5 * k, y - 1.6 * k, INSIDE, a);
    s.rect(x - 6 * k, y + 1.2 * k, x + 1.5 * k, y + 1.2 * k, INSIDE, a);
    // Its lights keep blinking wherever it is: that's the point.
    for (let n = 0; n < 2; n++) s.disc(x + (3.8 + n * 2.6) * k, y, 0.9 * k, 0.9 * k, Math.sin(t * (5 + i * 0.7 + n * 2.3) + i * 3) > -0.2 ? GREEN : INSIDE, a);
  };
  return (t) => {
    s.begin();
    const lt = (t + START) % LOOP, m = Math.min(COUNT, Math.floor(lt / EVERY)), p = (lt - m * EVERY) / MOVE, back = lt > RUN + HOLD ? (lt - RUN - HOLD) / RESET : 0;
    // The old rack goes quiet as it empties, and the new one comes up.
    s.glow(LX, 52, 30, WARM, 0.2 * (1 - m / COUNT));
    s.glow(RX, 52, 34, COOL, 0.08 + 0.2 * (m / COUNT));
    for (let i = 0; i < COUNT; i++) {
      const [lx, ly] = slot(LX, i), [rx, ry] = slot(RX, i);
      if (i > m) block(lx, ly, i, t);
      if (i < m) block(rx, ry, i, t, 1, 1 - back);
      if (i < m && back > 0) block(lx, ly, i, t, 1, back);
    }
    if (m < COUNT) {
      const [lx, ly] = slot(LX, m), [rx, ry] = slot(RX, m), u = ease(p), a = (1 - u) ** 2, b = 2 * u * (1 - u), c = u * u, x = a * lx + b * CX + c * rx, y = a * ly + b * 2 + c * ry;
      if (p >= 1) block(rx, ry, m, t);
      else {
        for (let k = 1; k <= 5; k++) { const w = clamp(u - k * 0.022), wa = (1 - w) ** 2, wb = 2 * w * (1 - w), wc = w * w; s.star(wa * lx + wb * CX + wc * rx, wa * ly + wb * 2 + wc * ry, 0.7 * (1 - k / 6), TEAMS[Math.floor(m / 2) % 3]); }
        block(x, y, m, t, 1 + 0.18 * Math.sin(u * Math.PI));
      }
    }
    // Everything over, and in time: a flag goes up on the new rack.
    if (m === COUNT) { const up = ease((lt - RUN) / 0.5) * (1 - back); s.bar(RX + 22, 16, RX + 22, 16 - up * 9, 0.9, hex("#fff3cc")); s.poly([[RX + 22, 16 - up * 9], [RX + 30, 16 - up * 7], [RX + 22, 16 - up * 5]], hex("#f0c050"), up); }
    // The heartbeat runs on underneath everything and never flattens out.
    let py = null;
    for (let x = 0; x < cols; x++) {
      const y = 100 - beat((((x - t * 26) % 56) + 56) % 56 / 56) * 7;
      if (py !== null) s.bar(x - 1, py, x, y, 0.8, GREEN);
      py = y;
    }
    return s.finish();
  };
}
