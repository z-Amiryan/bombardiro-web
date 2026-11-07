// QR codes as inline SVG, made at build time (no client JavaScript, no third party).
import qrcode from 'qrcode-generator';

/** One SVG path drawing the dark modules of a QR code for `text`, with a quiet zone of `margin` modules (4, the standard). */
export function qrPath(text: string, margin = 4): { size: number; d: string } {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount();
  let d = '';
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      if (!qr.isDark(row, col)) continue;
      // Merge horizontal runs of dark modules into one rectangle.
      let run = 1;
      while (col + run < n && qr.isDark(row, col + run)) run++;
      d += `M${col + margin} ${row + margin}h${run}v1h-${run}z`;
      col += run - 1;
    }
  }
  return { size: n + margin * 2, d };
}
