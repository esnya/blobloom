export const fileColors: Record<string, string> = {
  '.ts': '#2b7489',
  '.js': '#f1e05a',
  '.json': '#292929',
  '.md': '#083fa1',
  '.html': '#e34c26',
  '.css': '#563d7c',
};

const hashHue = (s: string): number =>
  Array.from(s).reduce((a, c) => a + c.charCodeAt(0), 0) % 360;

const hexToHsl = (
  hex: string,
): { h: number; s: number; l: number } => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: l * 100 };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  switch (max) {
    case r:
      h = (g - b) / d + (g < b ? 6 : 0);
      break;
    case g:
      h = (b - r) / d + 2;
      break;
    default:
      h = (r - g) / d + 4;
  }
  h *= 60;
  return { h, s: s * 100, l: l * 100 };
};

const hsl = ({ h, s, l }: { h: number; s: number; l: number }): string =>
  `hsl(${h},${s}%,${l}%)`;

export const colorForFile = (name: string): string => {
  const i = name.lastIndexOf('.');
  const ext = i >= 0 ? name.slice(i).toLowerCase() : '';
  const offset = (hashHue(name) % 20) - 10;
  const base = fileColors[ext];
  if (base) {
    const { h, s, l } = hexToHsl(base);
    return hsl({ h: (h + offset + 360) % 360, s, l });
  }
  const hue = (hashHue(ext) + offset + 360) % 360;
  return `hsl(${hue},60%,60%)`;
};
