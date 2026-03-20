import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as d3 from "d3";

const ICONIFY_PREFIX = "emojione-v1";
const FLAG_ICON_NAMES = {
  "flag-for-china": "flag-for-china",
  "flag-for-india": "flag-for-india",
  "flag-for-russia": "flag-for-russia",
  "flag-for-united-states": "flag-for-united-states",
  "flag-for-iran": "flag-for-iran",
  "flag-for-indonesia": "flag-for-indonesia",
  "flag-for-pakistan": "flag-for-pakistan",
  "flag-for-egypt": "flag-for-egypt",
  "flag-for-qatar": "flag-for-qatar",
  "flag-for-saudi-arabia": "flag-for-saudi-arabia",
  "flag-for-canada": "flag-for-canada",
  "flag-for-brazil": "flag-for-brazil",
  "flag-for-argentina": "flag-for-argentina",
  "flag-for-turkey": "flag-for-turkey",
  "flag-for-australia": "flag-for-australia",
  "flag-for-thailand": "flag-for-thailand",
  "flag-for-nigeria": "flag-for-nigeria",
  "flag-for-algeria": "flag-for-algeria",
  "flag-for-mexico": "flag-for-mexico",
  "flag-for-colombia": "flag-for-colombia",
  "flag-for-uruguay": "flag-for-uruguay",
  "flag-for-ecuador": "flag-for-ecuador",
  "flag-for-paraguay": "flag-for-paraguay"
};

const FALLBACK_FLAG_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48"><rect width="64" height="48" rx="6" fill="#e5e7eb"/><path d="M8 36V12l12 8 12-8 12 8 12-8v24H8Z" fill="#cbd5e1"/><circle cx="22" cy="18" r="5" fill="#94a3b8"/></svg>',
)}`;

const flagUrl = (iconName, loadedFlags) => loadedFlags[iconName] || FALLBACK_FLAG_URL;

async function fetchFlagDataUri(iconName) {
  const slug = FLAG_ICON_NAMES[iconName];
  if (!slug) return FALLBACK_FLAG_URL;
  const response = await fetch(`https://api.iconify.design/${ICONIFY_PREFIX}/${slug}.svg`);
  if (!response.ok) {
    throw new Error(`Failed to load flag ${iconName}`);
  }
  const svg = await response.text();
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const COUNTRY_DB = {
  China: { id: "156", icon: "flag-for-china" },
  India: { id: "356", icon: "flag-for-india" },
  Russia: { id: "643", icon: "flag-for-russia" },
  Rusia: { id: "643", icon: "flag-for-russia" },
  EEUU: { id: "840", icon: "flag-for-united-states" },
  "United States": { id: "840", icon: "flag-for-united-states" },
  USA: { id: "840", icon: "flag-for-united-states" },
  Iran: { id: "364", icon: "flag-for-iran" },
  "Irán": { id: "364", icon: "flag-for-iran" },
  Indonesia: { id: "360", icon: "flag-for-indonesia" },
  Pakistan: { id: "586", icon: "flag-for-pakistan" },
  "Pakistán": { id: "586", icon: "flag-for-pakistan" },
  Egypt: { id: "818", icon: "flag-for-egypt" },
  Egipto: { id: "818", icon: "flag-for-egypt" },
  Qatar: { id: "634", icon: "flag-for-qatar" },
  "Saudi Arabia": { id: "682", icon: "flag-for-saudi-arabia" },
  "Arabia Saudita": { id: "682", icon: "flag-for-saudi-arabia" },
  Canada: { id: "124", icon: "flag-for-canada" },
  "Canadá": { id: "124", icon: "flag-for-canada" },
  Brazil: { id: "076", icon: "flag-for-brazil" },
  Brasil: { id: "076", icon: "flag-for-brazil" },
  Argentina: { id: "032", icon: "flag-for-argentina" },
  Turkey: { id: "792", icon: "flag-for-turkey" },
  "Turquía": { id: "792", icon: "flag-for-turkey" },
  Australia: { id: "036", icon: "flag-for-australia" },
  Thailand: { id: "764", icon: "flag-for-thailand" },
  Nigeria: { id: "566", icon: "flag-for-nigeria" },
  Algeria: { id: "012", icon: "flag-for-algeria" },
  Argelia: { id: "012", icon: "flag-for-algeria" },
  Mexico: { id: "484", icon: "flag-for-mexico" },
  "México": { id: "484", icon: "flag-for-mexico" },
  Colombia: { id: "170", icon: "flag-for-colombia" },
  Uruguay: { id: "858", icon: "flag-for-uruguay" },
  Ecuador: { id: "218", icon: "flag-for-ecuador" },
  Paraguay: { id: "600", icon: "flag-for-paraguay" }
};

const CENTROIDS = {
  "156": [105, 35],
  "356": [79, 22],
  "643": [100, 60],
  "840": [-97, 38],
  "364": [53, 32],
  "360": [120, -2],
  "586": [70, 30],
  "818": [30, 27],
  "634": [51.2, 25.3],
  "682": [45, 24],
  "124": [-106, 56],
  "076": [-52, -10],
  "032": [-64, -34],
  "792": [35, 39],
  "036": [134, -25],
  "764": [101, 15],
  "566": [8, 10],
  "012": [3, 28],
  "484": [-102, 23],
  "170": [-74, 4],
  "858": [-56, -33],
  "218": [-78, -2],
  "600": [-58, -23]
};

const ANTARCTICA_ID = "010";

const INITIAL_POSITIONS = {
  China: { x: 830, y: 215 },
  India: { x: 780, y: 280 },
  Rusia: { x: 770, y: 88 },
  EEUU: { x: 340, y: 165 },
  "Irán": { x: 590, y: 238 },
  Indonesia: { x: 855, y: 330 },
  "Pakistán": { x: 695, y: 210 },
  Egipto: { x: 530, y: 290 },
  Qatar: { x: 605, y: 395 },
  "Arabia Saudita": { x: 565, y: 350 }
};

const DEFAULT_DATA = [
  { country: "China", value: 34 },
  { country: "India", value: 16 },
  { country: "Rusia", value: 6 },
  { country: "EEUU", value: 5 },
  { country: "Irán", value: 4 },
  { country: "Indonesia", value: 4 },
  { country: "Pakistán", value: 3 },
  { country: "Egipto", value: 3 },
  { country: "Qatar", value: 3 },
  { country: "Arabia Saudita", value: 3 }
];

const BASE_COLOR_HEX = "#4086FF";
const BADGE_STROKE_COLOR = "#4086FF";
const NO_DATA_COLOR = "#EDEDED";
const BG_COLOR = "#F5F1E8";

function hexToRgb(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16)
  };
}

function luminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const value = c / 255;
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(l1, l2) {
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function shouldUseWhiteText(opacity) {
  const base = hexToRgb(BASE_COLOR_HEX);
  const bg = hexToRgb(BG_COLOR);
  const r = Math.round(base.r * opacity + bg.r * (1 - opacity));
  const g = Math.round(base.g * opacity + bg.g * (1 - opacity));
  const b = Math.round(base.b * opacity + bg.b * (1 - opacity));
  const bgLum = luminance(r, g, b);
  return contrastRatio(luminance(255, 255, 255), bgLum) > contrastRatio(luminance(0, 61, 165), bgLum);
}

function decodeTopojson(topo, objectName) {
  const obj = topo.objects[objectName];
  const arcs = topo.arcs;
  const transform = topo.transform;

  function decodeArc(arcIndex) {
    const arc = arcs[arcIndex < 0 ? ~arcIndex : arcIndex];
    let x = 0;
    let y = 0;
    const coords = arc.map((point) => {
      x += point[0];
      y += point[1];
      return [x * transform.scale[0] + transform.translate[0], y * transform.scale[1] + transform.translate[1]];
    });
    return arcIndex < 0 ? coords.reverse() : coords;
  }

  function decodeRing(ring) {
    let coords = [];
    ring.forEach((arcIndex) => {
      coords = coords.concat(decodeArc(arcIndex));
    });
    return coords;
  }

  return {
    type: "FeatureCollection",
    features: obj.geometries.map((geom) => {
      let coordinates;
      if (geom.type === "Polygon") coordinates = geom.arcs.map(decodeRing);
      else if (geom.type === "MultiPolygon") coordinates = geom.arcs.map((polygon) => polygon.map(decodeRing));
      else coordinates = [];

      return {
        type: "Feature",
        id: geom.id,
        properties: geom.properties || {},
        geometry: { type: geom.type, coordinates }
      };
    })
  };
}

function estimateBadgeWidth(country, badgeScale, badgePadding) {
  return (
    (BADGE_LEFT_PAD + badgePadding) +
    BADGE_FLAG_W * badgeScale +
    BADGE_TEXT_GAP +
    country.length * (8.4 * badgeScale) +
    (BADGE_RIGHT_PAD + badgePadding)
  );
}

function getBadgeHeight(badgeScale, badgePadding) {
  return BADGE_H * badgeScale + badgePadding * 2;
}

const BADGE_H = 42;
const BADGE_PAD = 8;
const BADGE_TEXT_COLOR = "#4086FF";
const BADGE_FLAG_W = 38;
const BADGE_FLAG_H = 26;
const BADGE_FLAG_RADIUS = 8;
const BADGE_LEFT_PAD = 6;
const BADGE_RIGHT_PAD = 9;
const BADGE_TEXT_GAP = 3;
const BADGE_RADIUS = 10;
const BADGE_BORDER = 1.8013;
const BADGE_FONT_SIZE = 9.8;

function resolveOverlaps(positions, data, badgeScale, badgePadding, iterations = 30) {
  const badgeHeight = getBadgeHeight(badgeScale, badgePadding);
  const items = data
    .map((d) => {
      const pos = positions[d.country];
      if (!pos) return null;
      return { country: d.country, x: pos.x, y: pos.y, w: estimateBadgeWidth(d.country, badgeScale, badgePadding), h: badgeHeight };
    })
    .filter(Boolean);

  for (let iter = 0; iter < iterations; iter += 1) {
    let moved = false;
    for (let i = 0; i < items.length; i += 1) {
      for (let j = i + 1; j < items.length; j += 1) {
        const a = items[i];
        const b = items[j];
        const aL = a.x - a.w / 2 - BADGE_PAD;
        const aR = a.x + a.w / 2 + BADGE_PAD;
        const aT = a.y - a.h - BADGE_PAD;
        const aB = a.y + BADGE_PAD;
        const bL = b.x - b.w / 2 - BADGE_PAD;
        const bR = b.x + b.w / 2 + BADGE_PAD;
        const bT = b.y - b.h - BADGE_PAD;
        const bB = b.y + BADGE_PAD;
        if (aL < bR && aR > bL && aT < bB && aB > bT) {
          moved = true;
          const overlapX = Math.min(aR - bL, bR - aL);
          const overlapY = Math.min(aB - bT, bB - aT);
          if (overlapY < overlapX) {
            const pushY = overlapY / 2 + 1;
            if (a.y < b.y) {
              a.y -= pushY;
              b.y += pushY;
            } else {
              a.y += pushY;
              b.y -= pushY;
            }
          } else {
            const pushX = overlapX / 2 + 1;
            if (a.x < b.x) {
              a.x -= pushX;
              b.x += pushX;
            } else {
              a.x += pushX;
              b.x -= pushX;
            }
          }
        }
      }
    }
    if (!moved) break;
  }

  const result = {};
  items.forEach((item) => {
    result[item.country] = { x: Math.round(item.x), y: Math.round(item.y) };
  });
  return result;
}

function FlagIcon({ icon, flagData, x, y, w, h }) {
  const clipId = `flag-${icon}-${Math.round(x)}-${Math.round(y)}`;
  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          <rect x={x} y={y} width={w} height={h} rx={BADGE_FLAG_RADIUS} ry={BADGE_FLAG_RADIUS} />
        </clipPath>
      </defs>
      <image
        href={flagUrl(icon, flagData)}
        x={x}
        y={y}
        width={w}
        height={h}
        preserveAspectRatio="xMidYMid meet"
        clipPath={`url(#${clipId})`}
      />
    </g>
  );
}

function Slider({ label, value, onChange, min, max, step, unit }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 1 }}>
        <span style={{ fontSize: 9, fontWeight: 600, color: "#888" }}>{label}</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: "#031A42" }}>
          {value}
          {unit || ""}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "#4086FF", height: 3 }}
      />
    </div>
  );
}

function useMapDrag(setMapOffset) {
  const [dragging, setDragging] = useState(false);
  const startRef = useRef({ x: 0, y: 0 });
  const offsetRef = useRef({ x: 0, y: 0 });

  const onMouseDown = useCallback(
    (e) => {
      if (e.target.tagName !== "path" && e.target.tagName !== "svg") return;
      const fill = e.target.getAttribute("fill");
      if (fill === "white") return;
      e.preventDefault();
      setDragging(true);
      startRef.current = { x: e.clientX, y: e.clientY };
      setMapOffset((prev) => {
        offsetRef.current = prev;
        return prev;
      });
    },
    [setMapOffset],
  );

  useEffect(() => {
    if (!dragging) return undefined;

    const onMove = (e) => {
      const dx = e.clientX - startRef.current.x;
      const dy = e.clientY - startRef.current.y;
      setMapOffset({ x: offsetRef.current.x + dx * 0.7, y: offsetRef.current.y + dy * 0.7 });
    };

    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, setMapOffset]);

  return { onMouseDown, dragging };
}

function BadgeDraggable({
  country,
  icon,
  flagData,
  badgeRadius,
  badgeStroke,
  badgeScale,
  badgePadding,
  flagScale,
  onDrag,
  posX,
  posY
}) {
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const textRef = useRef(null);
  const [textW, setTextW] = useState(58);

  useEffect(() => {
    if (textRef.current) setTextW(textRef.current.getBBox().width);
  }, [country]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
    setOffset({ x: e.clientX - posX, y: e.clientY - posY });
  };

  useEffect(() => {
    if (!dragging) return undefined;
    const handleMove = (e) => onDrag(e.clientX - offset.x, e.clientY - offset.y);
    const handleUp = () => setDragging(false);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [dragging, offset, onDrag]);

  const padX = BADGE_LEFT_PAD + badgePadding;
  const flagBoxW = BADGE_FLAG_W * badgeScale;
  const flagBoxH = BADGE_FLAG_H * badgeScale;
  const flagW = flagBoxW * flagScale;
  const flagH = flagBoxH * flagScale;
  const gap = BADGE_TEXT_GAP;
  const totalW = padX + flagBoxW + gap + textW + (BADGE_RIGHT_PAD + badgePadding);
  const badgeH = getBadgeHeight(badgeScale, badgePadding);
  const badgeX = -totalW / 2;
  const badgeY = -badgeH;
  const flagX = badgeX + padX + (flagBoxW - flagW) / 2;
  const flagY = badgeY + (badgeH - flagH) / 2;

  return (
    <g onMouseDown={handleMouseDown} style={{ cursor: dragging ? "grabbing" : "grab" }}>
      <rect
        x={badgeX}
        y={badgeY}
        width={totalW}
        height={badgeH}
        rx={badgeRadius}
        fill="white"
        stroke={BADGE_STROKE_COLOR}
        strokeWidth={badgeStroke}
      />
      <FlagIcon icon={icon} flagData={flagData} x={flagX} y={flagY} w={flagW} h={flagH} />
      <text
        ref={textRef}
        x={badgeX + padX + flagBoxW + gap}
        y={badgeY + badgeH / 2 + 0.8}
        fontSize={BADGE_FONT_SIZE * badgeScale}
        fontWeight={700}
        fill={BADGE_TEXT_COLOR}
        fontFamily="'DM Sans', sans-serif"
        dominantBaseline="central"
        style={{ pointerEvents: "none" }}
      >
        {country}
      </text>
    </g>
  );
}

export default function App() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [flagData, setFlagData] = useState({});
  const [geoData, setGeoData] = useState(null);
  const [labelPositions, setLabelPositions] = useState(INITIAL_POSITIONS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("PRINCIPALES PRODUCTORES (*)");
  const [source, setSource] = useState("(*) Fuente: IFA 2024.");
  const [includeMeta, setIncludeMeta] = useState(false);
  const [copied, setCopied] = useState(false);

  const [strokeWidth, setStrokeWidth] = useState(0.5);
  const [pctSize, setPctSize] = useState(10);
  const [badgeRadius, setBadgeRadius] = useState(9);
  const [badgeStroke, setBadgeStroke] = useState(BADGE_BORDER);
  const [badgeScale, setBadgeScale] = useState(0.75);
  const [badgePadding, setBadgePadding] = useState(-1);
  const [flagScale, setFlagScale] = useState(1.4);
  const [connectorStroke, setConnectorStroke] = useState(0.4);
  const [mapScale, setMapScale] = useState(155);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });

  const svgRef = useRef(null);
  const width = 960;
  const height = 540;

  const { onMouseDown: onMapMouseDown, dragging: mapDragging } = useMapDrag(setMapOffset);

  const projection = useMemo(
    () => d3.geoNaturalEarth1().scale(mapScale).translate([width / 2 + mapOffset.x, height / 2 + 20 + mapOffset.y]),
    [mapScale, mapOffset],
  );
  const pathGenerator = useMemo(() => d3.geoPath().projection(projection), [projection]);

  useEffect(() => {
    let cancelled = false;
    const icons = [...new Set(Object.values(COUNTRY_DB).map((entry) => entry.icon))];

    Promise.all(
      icons.map(async (icon) => {
        try {
          return [icon, await fetchFlagDataUri(icon)];
        } catch {
          return [icon, FALLBACK_FLAG_URL];
        }
      }),
    ).then((entries) => {
      if (!cancelled) {
        setFlagData(Object.fromEntries(entries));
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then((r) => r.json())
      .then((topo) => {
        const geo = decodeTopojson(topo, "countries");
        geo.features = geo.features.filter((f) => String(f.id).padStart(3, "0") !== ANTARCTICA_ID);
        setGeoData(geo);
        setLoading(false);
      })
      .catch(() => {
        setError("No se pudo cargar el mapa.");
        setLoading(false);
      });
  }, []);

  const getCountryCenter = useCallback(
    (countryName) => {
      const info = COUNTRY_DB[countryName];
      if (!info || !CENTROIDS[info.id]) return null;
      const [lon, lat] = CENTROIDS[info.id];
      const [px, py] = projection([lon, lat]);
      return { x: px, y: py };
    },
    [projection],
  );

  useEffect(() => {
    if (!geoData) return;
    const newCountries = data.filter((d) => {
      const info = COUNTRY_DB[d.country];
      return info && getCountryCenter(d.country) && !labelPositions[d.country];
    });
    if (newCountries.length > 0) {
      const updated = { ...labelPositions };
      newCountries.forEach((d) => {
        const center = getCountryCenter(d.country);
        if (center) updated[d.country] = { x: center.x, y: center.y - 35 };
      });
      setLabelPositions(resolveOverlaps(updated, data, badgeScale, badgePadding));
    }
  }, [data, geoData, getCountryCenter, labelPositions, badgeScale, badgePadding]);

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const getOpacity = (val) => (val / maxVal) * 0.8 + 0.2;

  const valueMap = {};
  data.forEach((d) => {
    const info = COUNTRY_DB[d.country];
    if (info) valueMap[info.id] = d.value;
  });

  const updateData = (index, field, value) => {
    setData((prev) =>
      prev.map((d, i) => (i === index ? { ...d, [field]: field === "value" ? Number(value) || 0 : value } : d)),
    );
  };

  const addRow = () => setData((prev) => [...prev, { country: "", value: 0 }]);
  const removeRow = (index) => setData((prev) => prev.filter((_, i) => i !== index));

  const handleLabelDrag = useCallback(
    (country) => (x, y) => {
      setLabelPositions((prev) => ({ ...prev, [country]: { x, y } }));
    },
    [],
  );

  const handleResolveOverlaps = () => {
    setLabelPositions((prev) => resolveOverlaps({ ...prev }, data, badgeScale, badgePadding));
  };

  const handleCopyPositions = () => {
    const lines = data
      .filter((d) => labelPositions[d.country])
      .map(
        (d) =>
          `  "${d.country}": { x: ${Math.round(labelPositions[d.country].x)}, y: ${Math.round(labelPositions[d.country].y)} },`,
      );
    const output = `const INITIAL_POSITIONS = {\n${lines.join("\n")}\n};`;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const exportSVG = () => {
    const svgEl = svgRef.current;
    if (!svgEl) return;
    let svgStr = new XMLSerializer().serializeToString(svgEl);
    svgStr = svgStr.replace(/cursor: ?[a-z-]*/g, "");
    const blob = new Blob([svgStr], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "choropleth_map.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPNG = () => {
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const svgStr = new XMLSerializer().serializeToString(svgEl);
    const canvas = document.createElement("canvas");
    const scale = 3;
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    ctx.scale(scale, scale);
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = BG_COLOR;
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = "choropleth_map.png";
      a.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgStr)))}`;
  };

  const inputStyle = {
    width: "100%",
    padding: "5px 7px",
    border: "1px solid #e5e5e5",
    borderRadius: 5,
    fontSize: 12,
    fontFamily: "'DM Sans', sans-serif",
    boxSizing: "border-box"
  };

  return (
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        display: "flex",
        height: "100vh",
        background: "#f8f7f4",
        color: "#031A42"
      }}
    >
      <div
        style={{
          width: 270,
          padding: "14px 12px",
          borderRight: "1px solid #e0ddd5",
          overflowY: "auto",
          background: "#fff",
          flexShrink: 0
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 14, color: "#031A42", letterSpacing: -0.3 }}>
          Bong Map Tool
        </div>

        <div style={{ marginBottom: 10 }}>
          <div
            style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#bbb", marginBottom: 2 }}
          >
            Titulo
          </div>
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <div
            style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#bbb", marginBottom: 2 }}
          >
            Fuente
          </div>
          <input value={source} onChange={(e) => setSource(e.target.value)} style={inputStyle} />
        </div>

        <div
          style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#bbb", marginBottom: 6 }}
        >
          Controles visuales
        </div>
        <div style={{ background: "#fafaf8", borderRadius: 8, padding: "10px 10px 2px", marginBottom: 6, border: "1px solid #f0ede5" }}>
          <Slider label="Escala mapa" value={mapScale} onChange={setMapScale} min={80} max={400} step={5} unit="" />
          <Slider label="Stroke mapa" value={strokeWidth} onChange={setStrokeWidth} min={0} max={2} step={0.1} unit="px" />
          <Slider label="Tamano %" value={pctSize} onChange={setPctSize} min={6} max={28} step={1} unit="px" />
          <details style={{ marginBottom: 8 }}>
            <summary
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: "#666",
                cursor: "pointer",
                listStyle: "none",
                marginBottom: 8
              }}
            >
              Ajustes badge
            </summary>
            <Slider label="Escala badge" value={badgeScale} onChange={setBadgeScale} min={0.6} max={1.4} step={0.05} unit="x" />
            <Slider label="Padding badge" value={badgePadding} onChange={setBadgePadding} min={-2} max={10} step={1} unit="px" />
            <Slider label="Escala bandera" value={flagScale} onChange={setFlagScale} min={0.6} max={1.4} step={0.05} unit="x" />
            <Slider label="Radio badge" value={badgeRadius} onChange={setBadgeRadius} min={2} max={14} step={1} unit="px" />
            <Slider label="Stroke badge" value={badgeStroke} onChange={setBadgeStroke} min={0} max={2} step={0.1} unit="px" />
          </details>
          <Slider label="Linea conector" value={connectorStroke} onChange={setConnectorStroke} min={0} max={2} step={0.1} unit="px" />
        </div>

        <button
          onClick={() => setMapOffset({ x: 0, y: 0 })}
          style={{
            width: "100%",
            padding: "5px",
            border: "1px solid #e0e0e0",
            borderRadius: 5,
            background: "#fafaf8",
            fontSize: 9,
            fontWeight: 600,
            color: "#666",
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            marginBottom: 4
          }}
        >
          Reset posicion mapa
        </button>

        <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>
          <button
            onClick={handleResolveOverlaps}
            style={{
              flex: 1,
              padding: "5px",
              border: "1px solid #e0e0e0",
              borderRadius: 5,
              background: "#fafaf8",
              fontSize: 9,
              fontWeight: 600,
              color: "#666",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif"
            }}
          >
            Resolver overlap
          </button>
          <button
            onClick={handleCopyPositions}
            style={{
              flex: 1,
              padding: "5px",
              border: "1px solid #e0e0e0",
              borderRadius: 5,
              background: copied ? "#2D8035" : "#fafaf8",
              fontSize: 9,
              fontWeight: 600,
              color: copied ? "white" : "#666",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.2s"
            }}
          >
            {copied ? "Copiado" : "Copiar posiciones"}
          </button>
        </div>

        <div
          style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#bbb", marginBottom: 6 }}
        >
          Datos
        </div>
        <div style={{ display: "flex", gap: 3, marginBottom: 3, padding: "0 2px" }}>
          <div style={{ flex: 1, fontSize: 8, fontWeight: 700, color: "#ccc" }}>PAIS</div>
          <div style={{ width: 40, fontSize: 8, fontWeight: 700, color: "#ccc" }}>%</div>
          <div style={{ width: 18 }} />
        </div>

        {data.map((d, i) => {
          const info = COUNTRY_DB[d.country];
          return (
            <div key={`${d.country}-${i}`} style={{ display: "flex", gap: 3, marginBottom: 2, alignItems: "center" }}>
              {info ? (
                <img
                  src={flagUrl(info.icon, flagData)}
                  alt=""
                  style={{ width: 18, height: 14, borderRadius: 2, objectFit: "cover", flexShrink: 0 }}
                />
              ) : (
                <div style={{ width: 18, height: 14, borderRadius: 2, background: "#eee", flexShrink: 0 }} />
              )}
              <input
                value={d.country}
                onChange={(e) => updateData(i, "country", e.target.value)}
                placeholder="Pais"
                style={{
                  flex: 1,
                  padding: "4px 5px",
                  border: "1px solid #eee",
                  borderRadius: 4,
                  fontSize: 11,
                  fontFamily: "'DM Sans', sans-serif",
                  minWidth: 0
                }}
              />
              <input
                type="number"
                value={d.value}
                onChange={(e) => updateData(i, "value", e.target.value)}
                style={{
                  width: 40,
                  padding: "4px 4px",
                  border: "1px solid #eee",
                  borderRadius: 4,
                  fontSize: 11,
                  fontFamily: "'DM Sans', sans-serif",
                  textAlign: "right"
                }}
              />
              <button
                onClick={() => removeRow(i)}
                style={{
                  width: 18,
                  height: 22,
                  border: "none",
                  background: "transparent",
                  color: "#ccc",
                  fontSize: 13,
                  cursor: "pointer",
                  padding: 0,
                  lineHeight: 1
                }}
              >
                x
              </button>
            </div>
          );
        })}

        <button
          onClick={addRow}
          style={{
            width: "100%",
            padding: "4px",
            border: "1px dashed #ddd",
            borderRadius: 4,
            background: "transparent",
            fontSize: 10,
            color: "#bbb",
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            marginTop: 3,
            marginBottom: 14
          }}
        >
          + Agregar pais
        </button>

        <div style={{ display: "flex", gap: 4 }}>
          <button
            onClick={exportSVG}
            style={{
              flex: 1,
              padding: "8px",
              border: "none",
              borderRadius: 6,
              background: "#4086FF",
              color: "white",
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif"
            }}
          >
            Exportar SVG
          </button>
          <button
            onClick={exportPNG}
            style={{
              flex: 1,
              padding: "8px",
              border: "none",
              borderRadius: 6,
              background: "#2D8035",
              color: "white",
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif"
            }}
          >
            Exportar PNG
          </button>
        </div>

        <button
          onClick={() => setIncludeMeta((prev) => !prev)}
          style={{
            width: "100%",
            marginTop: 8,
            padding: "8px 10px",
            border: "1px solid #e0e0e0",
            borderRadius: 8,
            background: "#fafaf8",
            color: "#666",
            cursor: "pointer",
            fontSize: 10,
            fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <span>Incluir titulo y fuente</span>
          <span
            style={{
              width: 34,
              height: 20,
              borderRadius: 999,
              background: includeMeta ? "#4086FF" : "#d7d7d7",
              position: "relative",
              transition: "background 0.2s"
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 2,
                left: includeMeta ? 16 : 2,
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: "#fff",
                transition: "left 0.2s"
              }}
            />
          </span>
        </button>

        <div style={{ fontSize: 8, color: "#ccc", marginTop: 8, lineHeight: 1.5 }}>
          Banderas: Emoji One v1 (CC BY-SA 4.0). Arrastra el mapa para panear y las etiquetas para reposicionar.
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: 14 }}>
        {loading && <div style={{ fontSize: 13, color: "#999" }}>Cargando mapa...</div>}
        {error && <div style={{ fontSize: 13, color: "#e53e3e" }}>{error}</div>}
        {geoData && (
          <svg
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`}
            style={{
              width: "100%",
              maxHeight: "100%",
              background: BG_COLOR,
              borderRadius: 6,
              cursor: mapDragging ? "grabbing" : "default"
            }}
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            onMouseDown={onMapMouseDown}
          >
            <g>
              {geoData.features.map((feature, i) => {
                const id = String(feature.id).padStart(3, "0");
                const val = valueMap[id];
                const hasData = val !== undefined;
                return (
                  <path
                    key={`feature-${i}`}
                    d={pathGenerator(feature) || ""}
                    fill={hasData ? BASE_COLOR_HEX : NO_DATA_COLOR}
                    fillOpacity={hasData ? getOpacity(val) : 1}
                    stroke="white"
                    strokeWidth={strokeWidth}
                    style={{ cursor: "grab" }}
                  />
                );
              })}
            </g>

            <g style={{ pointerEvents: "none" }}>
              {data.map((d, i) => {
                const info = COUNTRY_DB[d.country];
                const pos = labelPositions[d.country];
                if (!info || !pos) return null;
                const center = getCountryCenter(d.country);
                if (!center) return null;
                const opacity = getOpacity(d.value);
                const useWhite = shouldUseWhiteText(opacity);
                const pctColor = useWhite ? "white" : "#003DA5";
                return (
                  <g key={`conn-${d.country}-${i}`}>
                    {connectorStroke > 0 && (
                      <line
                        x1={pos.x}
                        y1={pos.y}
                        x2={center.x}
                        y2={center.y}
                        stroke="#7a8ba8"
                        strokeWidth={connectorStroke}
                        strokeDasharray="2,2"
                        opacity={0.4}
                      />
                    )}
                    <text
                      x={center.x}
                      y={center.y}
                      fontSize={pctSize}
                      fontWeight={800}
                      fill={pctColor}
                      fontFamily="'DM Sans', sans-serif"
                      textAnchor="middle"
                      dominantBaseline="central"
                    >
                      {d.value}%
                    </text>
                  </g>
                );
              })}
            </g>

            {includeMeta && (
              <>
                <rect x={0} y={0} width={width} height={52} fill={BG_COLOR} opacity={0.92} />
                <text
                  x={40}
                  y={36}
                  fontSize={16}
                  fontWeight={700}
                  fill="#003DA5"
                  fontFamily="'DM Sans', sans-serif"
                  style={{ pointerEvents: "none" }}
                >
                  {title}
                </text>

                <rect x={0} y={height - 30} width={width} height={30} fill={BG_COLOR} opacity={0.85} />
                <text
                  x={width - 40}
                  y={height - 14}
                  fontSize={10}
                  fill="#999"
                  fontFamily="'DM Sans', sans-serif"
                  textAnchor="end"
                  style={{ pointerEvents: "none" }}
                >
                  {source}
                </text>
              </>
            )}

            <g>
              {data.map((d, i) => {
                const info = COUNTRY_DB[d.country];
                const pos = labelPositions[d.country];
                if (!info || !pos) return null;
                return (
                  <g
                    key={`badge-${d.country}-${i}`}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <BadgeDraggable
                      country={d.country}
                      icon={info.icon}
                      flagData={flagData}
                      badgeRadius={badgeRadius}
                      badgeStroke={badgeStroke}
                      badgeScale={badgeScale}
                      badgePadding={badgePadding}
                      flagScale={flagScale}
                      onDrag={handleLabelDrag(d.country)}
                      posX={pos.x}
                      posY={pos.y}
                    />
                  </g>
                );
              })}
            </g>
          </svg>
        )}
      </div>
    </div>
  );
}
