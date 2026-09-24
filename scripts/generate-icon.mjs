import fs from "node:fs";
import zlib from "node:zlib";

const size = 1024;
const pixels = Buffer.alloc(size * size * 4);
const background = [9, 11, 16, 255];
const lime = [216, 255, 100, 255];
const violet = [158, 130, 255, 255];
const white = [242, 241, 236, 255];

function blend(index, color, alpha = 1) {
  const offset = index * 4;
  for (let channel = 0; channel < 4; channel += 1) pixels[offset + channel] = Math.round(pixels[offset + channel] * (1 - alpha) + color[channel] * alpha);
}

for (let index = 0; index < size * size; index += 1) pixels.set(background, index * 4);
function distanceToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) {
  const index = y * size + x;
  const distance = Math.hypot(x - 512, y - 512);
  if (Math.abs(distance - 296) < 12) blend(index, lime, 1);
  if (Math.hypot(x - 360, y - 370) < 68) blend(index, lime, 1);
  const segments = [[256, 668, 378, 560], [378, 560, 512, 520], [512, 520, 660, 560], [660, 560, 782, 668]];
  if (segments.some(([ax, ay, bx, by]) => distanceToSegment(x, y, ax, ay, bx, by) < 18)) blend(index, violet, 1);
  if (Math.hypot(x - 512, y - 512) < 31) blend(index, white, 1);
}

function chunk(type, data) {
  const header = Buffer.alloc(8);
  header.writeUInt32BE(data.length, 0);
  header.write(type, 4, 4, "ascii");
  const body = Buffer.concat([Buffer.from(type), data]);
  let crc = 0xffffffff;
  for (const byte of body) { crc ^= byte; for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1)); }
  const footer = Buffer.alloc(4); footer.writeUInt32BE((crc ^ 0xffffffff) >>> 0, 0);
  return Buffer.concat([header, data, footer]);
}

const raw = Buffer.alloc(size * (size * 4 + 1));
for (let y = 0; y < size; y += 1) { raw[y * (size * 4 + 1)] = 0; pixels.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4); }
const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", (() => { const data = Buffer.alloc(13); data.writeUInt32BE(size, 0); data.writeUInt32BE(size, 4); data[8] = 8; data[9] = 6; return data; })()), chunk("IDAT", zlib.deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);

fs.writeFileSync("ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png", png);
fs.writeFileSync("public/icons/icon.png", png);
