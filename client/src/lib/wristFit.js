/**
 * Estimate where and how to place a watch on a wrist from a single tap.
 *
 * 1. Downscale the photo/video frame and convert to YCbCr.
 * 2. Region-grow from the tapped point, accepting pixels whose skin tone is close to the tapped tone
 *    (chroma weighted more than brightness so shadows on the arm are still included).
 * 3. PCA of that region gives the arm's direction; the arm's width across the tapped point gives the size.
 *
 * Returns { x, y, scale, rotate } in the same units the try-on overlay uses
 * (x/y and scale as fractions of the image width/height, rotate in degrees) or null if it can't tell.
 */
export function fitWrist(source, nx, ny) {
  const sw = source.naturalWidth || source.videoWidth;
  const sh = source.naturalHeight || source.videoHeight;
  if (!sw || !sh) return null;

  const S = 220 / Math.max(sw, sh);
  const W = Math.max(8, Math.round(sw * S));
  const H = Math.max(8, Math.round(sh * S));
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(source, 0, 0, W, H);
  let px;
  try { px = ctx.getImageData(0, 0, W, H).data; } catch { return null; }

  const Y = new Float32Array(W * H), Cb = new Float32Array(W * H), Cr = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) {
    const r = px[i * 4], g = px[i * 4 + 1], b = px[i * 4 + 2];
    Y[i] = 0.299 * r + 0.587 * g + 0.114 * b;
    Cb[i] = 128 - 0.1687 * r - 0.3313 * g + 0.5 * b;
    Cr[i] = 128 + 0.5 * r - 0.4187 * g - 0.0813 * b;
  }

  const sx = Math.min(W - 1, Math.max(0, Math.round(nx * W)));
  const sy = Math.min(H - 1, Math.max(0, Math.round(ny * H)));

  // Reference tone: average of a small patch around the tap
  let mY = 0, mCb = 0, mCr = 0, n = 0;
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const x = sx + dx, y = sy + dy;
      if (x < 0 || y < 0 || x >= W || y >= H) continue;
      const i = y * W + x;
      mY += Y[i]; mCb += Cb[i]; mCr += Cr[i]; n++;
    }
  }
  mY /= n; mCb /= n; mCr /= n;

  const dist = (i) => Math.abs(Y[i] - mY) * 0.3 + Math.abs(Cb[i] - mCb) + Math.abs(Cr[i] - mCr);
  const maxR2 = (0.5 * Math.max(W, H)) ** 2;
  const T = 24;

  const seen = new Uint8Array(W * H);
  const queue = new Int32Array(W * H);
  let head = 0, tail = 0;
  const start = sy * W + sx;
  queue[tail++] = start; seen[start] = 1;
  const region = [];
  while (head < tail) {
    const i = queue[head++];
    region.push(i);
    const x = i % W, y = (i / W) | 0;
    const nbrs = [x > 0 && i - 1, x < W - 1 && i + 1, y > 0 && i - W, y < H - 1 && i + W];
    for (const j of nbrs) {
      if (j === false || seen[j]) continue;
      seen[j] = 1;
      const jx = j % W, jy = (j / W) | 0;
      if ((jx - sx) ** 2 + (jy - sy) ** 2 > maxR2) continue;
      if (dist(j) < T) queue[tail++] = j;
    }
  }
  if (region.length < 40) return null;

  // PCA -> arm direction
  let cx = 0, cy = 0;
  for (const i of region) { cx += i % W; cy += (i / W) | 0; }
  cx /= region.length; cy /= region.length;
  let sxx = 0, syy = 0, sxy = 0;
  for (const i of region) {
    const dx = (i % W) - cx, dy = ((i / W) | 0) - cy;
    sxx += dx * dx; syy += dy * dy; sxy += dx * dy;
  }
  const theta = 0.5 * Math.atan2(2 * sxy, sxx - syy); // radians, arm axis
  const ax = Math.cos(theta), ay = Math.sin(theta); // along the arm
  const px2 = -ay, py2 = ax; // across the arm

  // Arm width across the tap: walk both ways along the perpendicular until we leave the region
  const inRegion = new Uint8Array(W * H);
  for (const i of region) inRegion[i] = 1;
  // Distance from (ox, oy) to the region's edge along (dx, dy); tolerates small holes (hair, veins, shadows)
  const scan = (ox, oy, dx, dy) => {
    let gap = 0, last = 0;
    for (let t = 1; t < Math.max(W, H); t++) {
      const x = Math.round(ox + dx * t), y = Math.round(oy + dy * t);
      if (x < 0 || y < 0 || x >= W || y >= H) break;
      if (inRegion[y * W + x]) { last = t; gap = 0; } else if (++gap > 3) break;
    }
    return last;
  };
  // Three parallel scan lines across the arm for a steadier width
  const widths = [], mids = [];
  for (const off of [-3, 0, 3]) {
    const ox = sx + ax * off, oy = sy + ay * off;
    const a = scan(ox, oy, px2, py2), b = scan(ox, oy, -px2, -py2);
    widths.push(a + b); mids.push((a - b) / 2);
  }

  widths.sort((p, q) => p - q);
  const width = widths[1];
  const mid = mids.reduce((s, v) => s + v, 0) / mids.length;
  if (width < 6) return null;

  // Centre the watch across the arm, size the case to ~the arm's width
  const fx = sx + px2 * mid, fy = sy + py2 * mid;
  let deg = (theta * 180) / Math.PI; // strap (vertical in artwork) ends up perpendicular to the arm
  if (deg > 90) deg -= 180;
  if (deg < -90) deg += 180;

  return {
    x: fx / W,
    y: fy / H,
    // A real watch case covers ~2/3 of the wrist's width; the case is ~54% of the artwork's width
    scale: Math.min(0.9, Math.max(0.1, (width * 1.2) / W)),
    rotate: Math.round(deg),
  };
}
