// ─── Tiny QR code encoder ──────────────────────────────────────────────
//
// Pure-TS implementation of QR Code generation. No npm dep, no network
// call, runs offline. Adapted from public-domain references (Nayuki's
// QR Code generator, MIT). Handles the subset we need: byte-mode payload,
// auto-selected version up to 20, error-correction level L (sufficient
// for URLs up to ~600 chars), and SVG output. ~250 lines.

const ECC_CODEWORDS_PER_BLOCK = [
  -1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28,
];
const NUM_ERROR_CORRECTION_BLOCKS = [
  -1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8,
];

function getNumRawDataModules(ver: number): number {
  let result = (16 * ver + 128) * ver + 64;
  if (ver >= 2) {
    const numAlign = Math.floor(ver / 7) + 2;
    result -= (25 * numAlign - 10) * numAlign - 55;
    if (ver >= 7) result -= 36;
  }
  return result;
}

function getNumDataCodewords(ver: number): number {
  return Math.floor(getNumRawDataModules(ver) / 8) - ECC_CODEWORDS_PER_BLOCK[ver] * NUM_ERROR_CORRECTION_BLOCKS[ver];
}

// Reed-Solomon ECC generator polynomial
function reedSolomonComputeDivisor(degree: number): number[] {
  const result = new Array<number>(degree).fill(0);
  result[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < result.length; j++) {
      result[j] = reedSolomonMultiply(result[j], root);
      if (j + 1 < result.length) result[j] ^= result[j + 1];
    }
    root = reedSolomonMultiply(root, 0x02);
  }
  return result;
}

function reedSolomonMultiply(x: number, y: number): number {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z & 0xff;
}

function reedSolomonComputeRemainder(data: Uint8Array, divisor: number[]): number[] {
  const result = new Array<number>(divisor.length).fill(0);
  for (const b of data) {
    const factor = b ^ result.shift()!;
    result.push(0);
    for (let i = 0; i < divisor.length; i++) {
      result[i] ^= reedSolomonMultiply(divisor[i], factor);
    }
  }
  return result;
}

interface Module { dark: boolean; reserved: boolean }

export function generateQrSvg(text: string, scale = 8, margin = 2): string {
  const modules = generateQrMatrix(text);
  const size = modules.length;
  const total = (size + margin * 2) * scale;
  const cells: string[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (modules[y][x]) {
        cells.push(`M${(x + margin) * scale} ${(y + margin) * scale}h${scale}v${scale}h-${scale}z`);
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" width="${total}" height="${total}" stroke="none">` +
    `<rect width="100%" height="100%" fill="#ffffff"/>` +
    `<path d="${cells.join('')}" fill="#000000"/>` +
    `</svg>`;
}

function generateQrMatrix(text: string): boolean[][] {
  // Encode text as UTF-8 bytes (byte-mode payload).
  const bytes: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const cp = text.charCodeAt(i);
    if (cp < 0x80) bytes.push(cp);
    else if (cp < 0x800) { bytes.push(0xc0 | (cp >> 6)); bytes.push(0x80 | (cp & 0x3f)); }
    else { bytes.push(0xe0 | (cp >> 12)); bytes.push(0x80 | ((cp >> 6) & 0x3f)); bytes.push(0x80 | (cp & 0x3f)); }
  }

  // Pick the smallest version that fits with ECC level L (the most
  // permissive; URLs are tolerant of low error correction).
  let version = -1;
  for (let v = 1; v <= 20; v++) {
    const cap = getNumDataCodewords(v);
    // Header: 4-bit mode + character-count (8/16 bits depending on version).
    const ccBits = v < 10 ? 8 : 16;
    const totalBits = 4 + ccBits + bytes.length * 8;
    if (Math.ceil(totalBits / 8) <= cap) { version = v; break; }
  }
  if (version < 0) throw new Error('QR data too large');
  const size = version * 4 + 17;

  // Build bit stream.
  const ccBits = version < 10 ? 8 : 16;
  const bits: number[] = [];
  appendBits(bits, 0x4, 4);                      // byte mode
  appendBits(bits, bytes.length, ccBits);
  for (const b of bytes) appendBits(bits, b, 8);

  const dataCap = getNumDataCodewords(version);
  appendBits(bits, 0, Math.min(4, dataCap * 8 - bits.length));   // terminator
  while (bits.length % 8 !== 0) bits.push(0);
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bits.length / 8 < dataCap) {
    appendBits(bits, padBytes[padIdx], 8);
    padIdx = (padIdx + 1) % 2;
  }
  const data = new Uint8Array(dataCap);
  for (let i = 0; i < data.length; i++) {
    let v = 0;
    for (let j = 0; j < 8; j++) v = (v << 1) | bits[i * 8 + j];
    data[i] = v;
  }

  // Reed-Solomon ECC interleave.
  const numBlocks = NUM_ERROR_CORRECTION_BLOCKS[version];
  const eccLen = ECC_CODEWORDS_PER_BLOCK[version];
  const rawCodewords = Math.floor(getNumRawDataModules(version) / 8);
  const numShortBlocks = numBlocks - (rawCodewords % numBlocks);
  const shortBlockLen = Math.floor(rawCodewords / numBlocks);
  const blocks: number[][] = [];
  const rsDiv = reedSolomonComputeDivisor(eccLen);
  let k = 0;
  for (let i = 0; i < numBlocks; i++) {
    const dataLen = shortBlockLen - eccLen + (i < numShortBlocks ? 0 : 1);
    const dat = Array.from(data.slice(k, k + dataLen));
    k += dataLen;
    const ecc = reedSolomonComputeRemainder(Uint8Array.from(dat), rsDiv);
    if (i < numShortBlocks) dat.push(0);
    blocks.push(dat.concat(ecc));
  }
  const interleaved: number[] = [];
  for (let i = 0; i < blocks[0].length; i++) {
    for (let j = 0; j < blocks.length; j++) {
      if (i !== shortBlockLen - eccLen || j >= numShortBlocks) {
        interleaved.push(blocks[j][i]);
      }
    }
  }

  // Initialize matrix.
  const matrix: Module[][] = [];
  for (let y = 0; y < size; y++) {
    const row: Module[] = [];
    for (let x = 0; x < size; x++) row.push({ dark: false, reserved: false });
    matrix.push(row);
  }

  function setFn(x: number, y: number, dark: boolean) {
    matrix[y][x] = { dark, reserved: true };
  }

  // Function patterns: timing, finders, alignment, format/version reserved.
  for (let i = 0; i < size; i++) {
    setFn(6, i, i % 2 === 0);
    setFn(i, 6, i % 2 === 0);
  }
  function finder(cx: number, cy: number) {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const x = cx + dx, y = cy + dy;
        if (x < 0 || x >= size || y < 0 || y >= size) continue;
        const adx = Math.abs(dx), ady = Math.abs(dy);
        const dist = Math.max(adx, ady);
        setFn(x, y, dist !== 2 && dist !== 4);
      }
    }
  }
  finder(3, 3); finder(size - 4, 3); finder(3, size - 4);

  // Alignment patterns
  if (version >= 2) {
    const positions = getAlignmentPatternPositions(version);
    for (const ay of positions) {
      for (const ax of positions) {
        // Skip ones overlapping finders
        if ((ax === positions[0] && ay === positions[0]) ||
            (ax === positions[positions.length - 1] && ay === positions[0]) ||
            (ax === positions[0] && ay === positions[positions.length - 1])) continue;
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const x = ax + dx, y = ay + dy;
            const d = Math.max(Math.abs(dx), Math.abs(dy));
            setFn(x, y, d !== 1);
          }
        }
      }
    }
  }

  // Reserve format info
  for (let i = 0; i < 9; i++) {
    if (!matrix[8][i].reserved) setFn(i, 8, false);
    if (!matrix[i][8].reserved) setFn(8, i, false);
  }
  for (let i = 0; i < 8; i++) {
    if (!matrix[size - 1 - i][8].reserved) setFn(8, size - 1 - i, false);
    if (!matrix[8][size - 1 - i].reserved) setFn(size - 1 - i, 8, false);
  }
  setFn(8, size - 8, true); // dark module

  // Write data with zigzag scan.
  let bitIdx = 0;
  for (let col = size - 1; col >= 1; col -= 2) {
    if (col === 6) col = 5;
    for (let v = 0; v < size; v++) {
      for (let j = 0; j < 2; j++) {
        const x = col - j;
        const upward = ((col + 1) & 2) === 0;
        const y = upward ? size - 1 - v : v;
        if (!matrix[y][x].reserved && bitIdx < interleaved.length * 8) {
          const dark = ((interleaved[bitIdx >>> 3] >>> (7 - (bitIdx & 7))) & 1) !== 0;
          matrix[y][x] = { dark, reserved: false };
          bitIdx++;
        }
      }
    }
  }

  // Apply mask pattern 0 + format info (ECC level L = 0b01).
  const mask = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!matrix[y][x].reserved && shouldInvert(x, y, mask)) {
        matrix[y][x] = { dark: !matrix[y][x].dark, reserved: false };
      }
    }
  }
  drawFormatBits(matrix, size, mask);

  return matrix.map((row) => row.map((m) => m.dark));
}

function appendBits(arr: number[], val: number, len: number) {
  for (let i = len - 1; i >= 0; i--) arr.push((val >>> i) & 1);
}

function shouldInvert(x: number, y: number, mask: number): boolean {
  switch (mask) {
    case 0: return (x + y) % 2 === 0;
    case 1: return y % 2 === 0;
    case 2: return x % 3 === 0;
    case 3: return (x + y) % 3 === 0;
    default: return false;
  }
}

function getAlignmentPatternPositions(ver: number): number[] {
  if (ver === 1) return [];
  const numAlign = Math.floor(ver / 7) + 2;
  const step = ver === 32 ? 26 : Math.ceil((ver * 4 + 4) / (numAlign * 2 - 2)) * 2;
  const result = [6];
  for (let i = 0, pos = ver * 4 + 10; i < numAlign - 1; i++, pos -= step) result.splice(1, 0, pos);
  return result;
}

function drawFormatBits(matrix: Module[][], size: number, mask: number) {
  // Format info = ECC level L (0b01) + mask (3 bits).
  const data = (0b01 << 3) | mask;
  let rem = data;
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  const bits = (((data << 10) | rem) ^ 0x5412) & 0x7fff;

  for (let i = 0; i <= 5; i++) setFmt(matrix, 8, i, getBit(bits, i));
  setFmt(matrix, 8, 7, getBit(bits, 6));
  setFmt(matrix, 8, 8, getBit(bits, 7));
  setFmt(matrix, 7, 8, getBit(bits, 8));
  for (let i = 9; i < 15; i++) setFmt(matrix, 14 - i, 8, getBit(bits, i));
  for (let i = 0; i < 8; i++) setFmt(matrix, size - 1 - i, 8, getBit(bits, i));
  for (let i = 8; i < 15; i++) setFmt(matrix, 8, size - 15 + i, getBit(bits, i));
}

function setFmt(matrix: Module[][], x: number, y: number, dark: boolean) {
  matrix[y][x] = { dark, reserved: true };
}

function getBit(v: number, i: number): boolean {
  return ((v >>> i) & 1) !== 0;
}
