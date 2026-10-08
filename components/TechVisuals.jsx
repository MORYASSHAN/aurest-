// Small looping line illustrations, one per technology.
// All motion is CSS (see .viz rules in globals.css) and pauses for reduced motion.

const VB = '0 0 400 200';

/** V Seal — blood leaks from a torn vessel, then a seal closes the tear. */
function SealVisual() {
  return (
    <svg viewBox={VB} className="viz viz-seal" aria-hidden="true">
      {/* vessel walls, with a tear in the top wall */}
      <path className="wall" d="M20 70 H178 M222 70 H380 M20 130 H380" />
      {/* blood cells flowing through */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <ellipse key={i} className="rbc" cx="0" cy={i % 2 ? 108 : 92} rx="9" ry="6" style={{ '--i': i }} />
      ))}
      {/* droplets escaping the tear */}
      {[0, 1, 2].map((i) => (
        <circle key={i} className="leak" cx={192 + i * 8} cy="66" r="4" style={{ '--i': i }} />
      ))}
      {/* the seal */}
      <rect className="seal" x="168" y="60" width="64" height="20" rx="10" />
    </svg>
  );
}

/** Venom Seal — scattered particles rush together into a clot mesh. */
const CLOT = [
  [200, 100], [178, 86], [222, 86], [170, 112], [230, 112], [200, 72], [200, 128], [186, 100], [214, 100],
];
const FROM = [
  [60, 40], [40, 150], [350, 30], [90, 180], [360, 170], [200, 10], [210, 195], [20, 90], [385, 100],
];

function ClotVisual() {
  return (
    <svg viewBox={VB} className="viz viz-clot" aria-hidden="true">
      <g className="mesh">
        {CLOT.slice(1).map(([x, y], i) => (
          <line key={i} x1="200" y1="100" x2={x} y2={y} />
        ))}
        <polygon points="178,86 200,72 222,86 230,112 200,128 170,112" />
      </g>
      {CLOT.map(([x, y], i) => (
        <circle
          key={i}
          className="particle"
          cx={x}
          cy={y}
          r={i === 0 ? 7 : 5}
          style={{ '--dx': `${FROM[i][0] - x}px`, '--dy': `${FROM[i][1] - y}px`, '--i': i }}
        />
      ))}
    </svg>
  );
}

/** Cell Fuse — damaged cells are rescued one by one. */
function hexPath(cx, cy, r) {
  const pts = Array.from({ length: 6 }, (_, k) => {
    const a = (Math.PI / 3) * k + Math.PI / 6;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  });
  return `M${pts.join('L')}Z`;
}
const CELLS = [];
for (let row = 0; row < 3; row += 1) {
  for (let col = 0; col < 7; col += 1) {
    const r = 24;
    const cx = 74 + col * r * 1.75 + (row % 2 ? r * 0.875 : 0);
    const cy = 48 + row * r * 1.52;
    CELLS.push({ cx, cy, r, damaged: (row + col) % 3 === 0 || (row === 1 && col > 1 && col < 5) });
  }
}

function CellsVisual() {
  let order = 0;
  return (
    <svg viewBox={VB} className="viz viz-cells" aria-hidden="true">
      <circle className="wave" cx="200" cy="100" r="20" />
      {CELLS.map((c, i) => (
        <path
          key={i}
          d={hexPath(c.cx, c.cy, c.r - 3)}
          className={c.damaged ? 'cell damaged' : 'cell'}
          style={c.damaged ? { '--i': order++ } : undefined}
        />
      ))}
    </svg>
  );
}

/** Aurest Kage — a shielded capsule travels past threats and releases at the target. */
function KageVisual() {
  const route = 'M30 150 C 110 150, 120 50, 200 50 S 300 150, 360 100';
  return (
    <svg viewBox={VB} className="viz viz-kage" aria-hidden="true">
      <path className="route" d={route} />
      {/* immune "threats" along the way */}
      {[
        [110, 70],
        [250, 140],
        [170, 120],
      ].map(([x, y], i) => (
        <g key={i} className="threat" transform={`translate(${x} ${y})`}>
          <circle r="7" />
          <path d="M-11 0H-7M7 0H11M0 -11V-7M0 7V11" />
        </g>
      ))}
      {/* target tissue */}
      <circle className="target" cx="360" cy="100" r="16" />
      <circle className="burst" cx="360" cy="100" r="16" />
      {/* shielded capsule */}
      <g className="capsule">
        <circle className="shield" r="15" />
        <rect x="-9" y="-5" width="18" height="10" rx="5" />
        <animateMotion dur="4.8s" repeatCount="indefinite" rotate="auto" keyPoints="0;1;1" keyTimes="0;0.72;1" calcMode="linear" path={route} />
        <animate attributeName="opacity" dur="4.8s" repeatCount="indefinite" values="1;1;0;0" keyTimes="0;0.72;0.8;1" />
      </g>
    </svg>
  );
}

const VISUALS = { seal: SealVisual, clot: ClotVisual, cells: CellsVisual, kage: KageVisual };

export default function TechVisual({ type }) {
  const Visual = VISUALS[type];
  return Visual ? <Visual /> : null;
}
