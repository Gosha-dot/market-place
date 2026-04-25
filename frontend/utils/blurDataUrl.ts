type ShimmerOptions = {
  base?: string;
  highlight?: string;
};

export function shimmerDataUrl(width: number, height: number, options: ShimmerOptions = {}) {
  const base = options.base ?? '#eef1f7';
  const highlight = options.highlight ?? '#f7f8fb';

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="g">
      <stop stop-color="${base}" offset="20%"/>
      <stop stop-color="${highlight}" offset="50%"/>
      <stop stop-color="${base}" offset="70%"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="${base}"/>
  <rect id="r" width="${width}" height="${height}" fill="url(#g)"/>
  <animate href="#r" attributeName="x" from="-${width}" to="${width}" dur="1.1s" repeatCount="indefinite" />
</svg>`;

  const encoded = encodeURIComponent(svg.trim()).replace(/%0A/g, '');
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}
