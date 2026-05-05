// App.jsx — GameMind AI · drop-in single-file component
// Stack: React 18 + Tailwind CSS + react-markdown + remark-gfm
//
// Install:
//   npm i react-markdown remark-gfm
// Tailwind: bu dosya sadece Tailwind class'ları kullanıyor; tailwind.config.js
// içinde bir özel renk/font eklemen gerekmiyor.
//
// Entry (örnek main.jsx):
//   import React from "react";
//   import ReactDOM from "react-dom/client";
//   import "./index.css"; // Tailwind base/components/utilities
//   import App from "./App";
//   ReactDOM.createRoot(document.getElementById("root")).render(<App />);
//
// Backend: POST http://localhost:8000/recommend  →  { route, answer }

import React, { useState, useEffect, useRef, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ---------------- Config ----------------
const API_URL = "http://localhost:8000/recommend";

const PRESET_COLORS = [
  { name: "Indigo",  hex: "#6366f1" },
  { name: "Violet",  hex: "#a855f7" },
  { name: "Emerald", hex: "#10b981" },
  { name: "Crimson", hex: "#ef4444" },
  { name: "Gold",    hex: "#f59e0b" },
  { name: "Pink",    hex: "#ec4899" },
];

const QUICK_CHIPS = [
  "I want a relaxing game after work",
  "Recommend something like The Witcher 3",
  "What are the latest games in 2026?",
  "A challenging RPG with deep story",
];

const GENRES = [
  { key: "action",   label: "Aksiyon",  icon: "⚔️", q: "Recommend a high-energy action game I can play tonight" },
  { key: "rpg",      label: "RPG",      icon: "🛡️", q: "Recommend a deep RPG with great story and characters" },
  { key: "mmo",      label: "MMORPG",   icon: "🌐", q: "Recommend an MMORPG with a healthy active community in 2026" },
  { key: "strategy", label: "Strateji", icon: "♟️", q: "Recommend a strategy game with deep mechanics" },
  { key: "indie",    label: "Indie",    icon: "🌱", q: "Recommend a charming indie game I might have missed" },
  { key: "horror",   label: "Korku",    icon: "👻", q: "Recommend a genuinely scary horror game" },
  { key: "racing",   label: "Yarış",    icon: "🏎️", q: "Recommend a racing game with great feel" },
  { key: "coop",     label: "Co-op",    icon: "🤝", q: "Recommend a co-op game to play with one friend" },
];

const POPULAR = [
  {
    title: "Elden Ring",
    genre: "Aksiyon RPG",
    tag: "🔥 #1 Trending",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg",
  },
  {
    title: "Hades II",
    genre: "Roguelite",
    tag: "🏆 Critical Hit",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1145350/header.jpg",
  },
  {
    title: "Black Myth: Wukong",
    genre: "Aksiyon RPG",
    tag: "🌸 Most Anticipated",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/2358720/header.jpg",
  },
  {
    title: "Baldur's Gate 3",
    genre: "RPG",
    tag: "✨ GOTY 2023",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/header.jpg",
  },
  {
    title: "Cyberpunk 2077",
    genre: "Açık Dünya RPG",
    tag: "🌌 Sci-Fi Hit",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg",
  },
  {
    title: "Frostpunk 2",
    genre: "Strateji",
    tag: "❄️ Strategy Hit",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1601580/header.jpg",
  },
];

// ---------------- Mascot ----------------
function shade(hex, amt) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const target = amt >= 0 ? 255 : 0;
  const k = Math.abs(amt);
  const mix = c => Math.round(c + (target - c) * k);
  return "#" + [mix(r), mix(g), mix(b)].map(v => v.toString(16).padStart(2, "0")).join("");
}

function Mascot({ color = "#6366f1", size = 240 }) {
  const [blink, setBlink] = useState(false);
  const [mouth, setMouth] = useState("smile");

  useEffect(() => {
    let alive = true;
    const loop = () => {
      const wait = 2200 + Math.random() * 2400;
      setTimeout(() => {
        if (!alive) return;
        setBlink(true);
        setTimeout(() => alive && setBlink(false), 130);
        if (Math.random() < 0.3) {
          setTimeout(() => alive && setBlink(true), 280);
          setTimeout(() => alive && setBlink(false), 410);
        }
        loop();
      }, wait);
    };
    loop();
    const m = setInterval(() => {
      const r = Math.random();
      setMouth(r < 0.6 ? "smile" : r < 0.85 ? "smirk" : "o");
    }, 3800);
    return () => { alive = false; clearInterval(m); };
  }, []);

  const dark = shade(color, -0.32);
  const darker = shade(color, -0.55);
  const light = shade(color, 0.18);
  const hl = shade(color, 0.55);

  return (
    <div className="relative animate-[float_4.6s_ease-in-out_infinite] drop-shadow-[0_20px_30px_rgba(0,0,0,0.45)]" style={{ width: size }}>
      <svg viewBox="0 0 320 230" width={size} height={size * 0.72} aria-hidden="true">
        <defs>
          <radialGradient id="m-body" cx="50%" cy="35%" r="75%">
            <stop offset="0%" stopColor={light} />
            <stop offset="55%" stopColor={color} />
            <stop offset="100%" stopColor={dark} />
          </radialGradient>
          <radialGradient id="m-face" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#1a1530" />
            <stop offset="100%" stopColor="#0a0717" />
          </radialGradient>
        </defs>
        <ellipse cx="62" cy="155" rx="58" ry="62" fill="url(#m-body)" />
        <ellipse cx="258" cy="155" rx="58" ry="62" fill="url(#m-body)" />
        <rect x="50" y="60" width="220" height="130" rx="62" fill="url(#m-body)" />
        <circle cx="160" cy="46" r="8" fill={darker} />
        <rect x="157" y="44" width="6" height="22" fill={darker} />
        <rect x="92" y="86" width="136" height="84" rx="28" fill="url(#m-face)" />
        <rect x="92" y="86" width="136" height="84" rx="28" fill="none" stroke={hl} strokeOpacity="0.25" strokeWidth="1.5" />
        {blink ? (
          <>
            <rect x="116" y="124" width="22" height="3" rx="1.5" fill="#fff" />
            <rect x="182" y="124" width="22" height="3" rx="1.5" fill="#fff" />
          </>
        ) : (
          <>
            <circle cx="127" cy="124" r="11" fill="#fff" />
            <circle cx="130" cy="126" r="5" fill="#0a0717" />
            <circle cx="132" cy="123" r="1.6" fill="#fff" />
            <circle cx="193" cy="124" r="11" fill="#fff" />
            <circle cx="196" cy="126" r="5" fill="#0a0717" />
            <circle cx="198" cy="123" r="1.6" fill="#fff" />
          </>
        )}
        {mouth === "smile" && <path d="M148 148 Q160 158 172 148" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" fill="none" />}
        {mouth === "smirk" && <path d="M148 150 Q156 156 172 150" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" fill="none" />}
        {mouth === "o" && <ellipse cx="160" cy="152" rx="4" ry="5" fill="#fff" />}
        <ellipse cx="112" cy="142" rx="7" ry="4" fill={hl} opacity="0.45" />
        <ellipse cx="208" cy="142" rx="7" ry="4" fill={hl} opacity="0.45" />
        <g transform="translate(58 155)">
          <rect x="-4" y="-14" width="8" height="28" rx="2" fill={darker} />
          <rect x="-14" y="-4" width="28" height="8" rx="2" fill={darker} />
        </g>
        <g transform="translate(262 155)">
          <circle cx="0" cy="-12" r="4.5" fill={hl} />
          <circle cx="12" cy="0" r="4.5" fill={hl} />
          <circle cx="0" cy="12" r="4.5" fill={hl} />
          <circle cx="-12" cy="0" r="4.5" fill={hl} />
        </g>
        <circle cx="160" cy="78" r="2.5" fill="#7CFFB2" opacity="0.9">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2.4s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}

// ---------------- Cover art ----------------
function GameCover({ image, title }) {
  return (
    <div className="relative w-full h-full overflow-hidden">
      <img
        src={image}
        alt={title}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        onError={(e) => {
          // Resim yüklenemezse placeholder göster
          e.currentTarget.style.display = "none";
          e.currentTarget.parentElement.style.background =
            "linear-gradient(135deg, #1e1b4b, #6366f1)";
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
    </div>
  );
}

// ---------------- Atmosphere ----------------
function StarField() {
  const stars = useMemo(() => Array.from({ length: 60 }).map(() => ({
    x: Math.random() * 100, y: Math.random() * 100,
    s: Math.random() * 1.6 + 0.4, d: Math.random() * 4 + 2,
    a: Math.random() * 0.6 + 0.2,
  })), []);
  return (
    <svg className="absolute inset-0 w-full h-full opacity-60" preserveAspectRatio="none" viewBox="0 0 100 100">
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.s * 0.12} fill="white" opacity={s.a}>
          <animate attributeName="opacity" values={`${s.a};${s.a * 0.2};${s.a}`} dur={`${s.d}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
}

function Petals() {
  const petals = useMemo(() => Array.from({ length: 14 }).map(() => ({
    left: Math.random() * 100, delay: Math.random() * 18,
    dur: 22 + Math.random() * 18, size: 6 + Math.random() * 14,
    hue: Math.random() < 0.5 ? 300 : 200, opacity: 0.18 + Math.random() * 0.22,
  })), []);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {petals.map((p, i) => (
        <span key={i}
          className="absolute -top-5 rounded-full blur-[1px] animate-[drift_30s_linear_infinite]"
          style={{
            left: `${p.left}%`,
            animationDelay: `-${p.delay}s`,
            animationDuration: `${p.dur}s`,
            width: p.size, height: p.size,
            background: `radial-gradient(circle, hsl(${p.hue} 70% 70%), transparent 70%)`,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
}

// ---------------- Markdown card overrides ----------------
const mdComponents = {
  h2: ({ children, ...props }) => (
    <h3 className="flex items-center gap-3 text-xl font-semibold tracking-tight text-white mb-3 mt-0" {...props}>
      {children}
    </h3>
  ),
  p: ({ children }) => <p className="text-[14.5px] leading-[1.6] text-slate-200 my-2">{children}</p>,
  strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
  em: ({ children }) => <em className="text-white italic">{children}</em>,
  code: ({ children }) => <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">{children}</code>,
};

// Wraps each ## heading section in a card
function MarkdownAnswer({ answer }) {
  const sections = useMemo(() => {
    const parts = answer.split(/(?=^## )/m);
    const intro = parts[0]?.startsWith("## ") ? "" : parts.shift();
    return { intro: intro?.trim() || "", cards: parts };
  }, [answer]);

  return (
    <div className="flex flex-col gap-4">
      {sections.intro && (
        <div className="text-base leading-relaxed text-slate-200 max-w-3xl">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{sections.intro}</ReactMarkdown>
        </div>
      )}
      {sections.cards.map((md, i) => (
        <article
          key={i}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-indigo-950/70 to-slate-950/70 p-6 backdrop-blur-md shadow-2xl transition hover:-translate-y-0.5 hover:border-indigo-400/60"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-indigo-400 to-transparent opacity-70" />
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{md}</ReactMarkdown>
        </article>
      ))}
    </div>
  );
}

// ---------------- Route badge ----------------
function RouteBadge({ route }) {
  const map = {
    rag:  { icon: "📚", label: "RAG",  color: "from-indigo-400 to-violet-400",    desc: "Knowledge base lookup" },
    web:  { icon: "🌐", label: "WEB",  color: "from-cyan-400 to-blue-400",        desc: "Live web search" },
    both: { icon: "🔀", label: "BOTH", color: "from-emerald-400 to-teal-400",     desc: "Hybrid: KB + web" },
  };
  const r = map[route] || map.rag;
  return (
    <div title={`Agent answered using: ${r.desc}`}
      className={`inline-flex items-center gap-2 rounded-full border bg-gradient-to-r ${r.color} bg-clip-padding px-3.5 py-1.5 font-mono text-xs tracking-wide text-white border-white/30 cursor-help shadow-lg`}>
      <span className="text-sm">{r.icon}</span>
      <span>Route · {r.label}</span>
    </div>
  );
}

// ---------------- App ----------------
export default function App() {
  const [mascotColor, setMascotColor] = useState("#6366f1");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [thinkSeconds, setThinkSeconds] = useState(0);
  const [lastQuery, setLastQuery] = useState("");
  const [activeGenre, setActiveGenre] = useState(null);

  const abortRef = useRef(null);
  const tickRef  = useRef(null);
  const resultRef = useRef(null);

  useEffect(() => {
    if (status === "loading") {
      setThinkSeconds(0);
      tickRef.current = setInterval(() => setThinkSeconds(s => s + 1), 1000);
    } else {
      clearInterval(tickRef.current);
    }
    return () => clearInterval(tickRef.current);
  }, [status]);

  async function submit(text) {
    const q = (text ?? query).trim();
    if (!q) return;
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setStatus("loading");
    setResult(null);
    setErrorMsg("");
    setLastQuery(q);

    setTimeout(() => resultRef.current?.scrollIntoView?.({ behavior: "smooth", block: "start" }), 200);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResult(data);
      setStatus("success");
    } catch (e) {
      if (e.name === "AbortError") return;
      setErrorMsg("Backend bağlantısı kurulamadı, lütfen fastapi sunucusunu başlatın.");
      setStatus("error");
    }
  }

  const handleChip   = (text) => { setQuery(text); submit(text); };
  const handleGenre  = (g)    => { setActiveGenre(g.key); setQuery(g.q); submit(g.q); };
  const handleGameClick = (g) => { const t = `Recommend something like ${g.title}`; setQuery(t); submit(t); };

  return (
    <div className="relative min-h-screen text-white font-sans" style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
      {/* Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0"
          style={{
            background: `
              radial-gradient(1400px 900px at 15% -5%, rgba(124, 58, 237, 0.55), transparent 55%),
              radial-gradient(1100px 800px at 95% 20%, rgba(56, 189, 248, 0.45), transparent 55%),
              radial-gradient(900px 700px at 50% 100%, rgba(236, 72, 153, 0.40), transparent 60%),
              linear-gradient(180deg, #1a1235 0%, #100a25 50%, #0a0718 100%)
            `,
          }}
        />
        <div className="absolute -left-48 top-24 h-[800px] w-[800px] rounded-full mix-blend-screen blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(139, 92, 246, 0.6), transparent 70%)", animation: "auroraA 24s ease-in-out infinite" }} />
        <div className="absolute -right-32 top-96 h-[700px] w-[700px] rounded-full mix-blend-screen blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(56, 189, 248, 0.5), transparent 70%)", animation: "auroraB 30s ease-in-out infinite" }} />
        <StarField />
        <Petals />
      </div>

      <div className="relative z-10 mx-auto max-w-[1320px] px-6 pt-6 pb-16 md:px-8">
        {/* Top bar */}
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-7 w-7 rounded-lg shadow-[0_0_24px_rgba(139,92,246,0.45)]"
                 style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899)" }}>
              <div className="absolute inset-1.5 rounded opacity-70"
                   style={{ background: "radial-gradient(circle at 35% 35%, white, transparent 50%)" }} />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              GameMind<span className="font-medium text-slate-400">.ai</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/60 px-3 py-1.5 font-mono text-[11px] text-slate-200 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse" />
              agent online
            </span>
            <span className="hidden md:inline-block rounded border border-dashed border-white/15 px-2.5 py-1.5 font-mono text-[11px] text-slate-400">
              POST /recommend
            </span>
          </div>
        </header>

        {/* HERO */}
        <section className="mb-8 grid grid-cols-1 gap-7 rounded-3xl border border-white/10 bg-gradient-to-b from-indigo-950/55 to-slate-950/55 p-7 backdrop-blur-xl shadow-2xl lg:grid-cols-[260px_1fr_220px]">
          <div className="grid place-items-center">
            <Mascot color={mascotColor} size={240} />
          </div>

          <div className="flex flex-col gap-3.5 min-w-0">
            <div className="relative max-w-[520px] self-start rounded-2xl bg-stone-100 px-5 py-3.5 text-[17px] font-medium leading-snug text-slate-900 shadow-2xl">
              <p className="m-0">Bugün ne tarzda oyun oynamak istiyorsun?</p>
              <span className="absolute -left-2.5 top-5 h-5 w-5 bg-stone-100"
                    style={{ clipPath: "polygon(100% 0, 100% 100%, 0 50%)" }} />
            </div>

            {/* SEARCH */}
            <div className={`grid grid-cols-[auto_1fr_auto] items-start gap-3 rounded-2xl border bg-slate-950/85 px-4 py-3.5 backdrop-blur shadow-2xl transition
              ${status === "loading" ? "border-indigo-400" : "border-white/10 focus-within:border-indigo-400 focus-within:shadow-[0_0_0_4px_rgba(99,102,241,0.18)]"}`}>
              <div className="pt-2 font-mono text-[15px] font-semibold text-indigo-400">›_</div>
              <textarea
                rows={3}
                placeholder="Bugün ne tarzda oyun oynamak istiyorsun? Örn: Stres atmak için hızlı bir aksiyon..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
                disabled={status === "loading"}
                className="w-full resize-none bg-transparent text-base font-medium leading-relaxed text-white placeholder:text-slate-500 outline-none min-h-[72px] max-h-[200px]"
              />
              <button
                onClick={() => submit()}
                disabled={status === "loading" || !query.trim()}
                className="self-end inline-flex items-center gap-2.5 rounded-xl border-0 px-4 py-2.5 font-semibold text-sm text-white whitespace-nowrap shadow-[0_12px_24px_-10px_rgba(99,102,241,0.45),inset_0_1px_0_rgba(255,255,255,0.3)] transition enabled:hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(180deg, #818cf8, #6366f1)" }}
              >
                {status === "loading" ? (
                  <>
                    <SpinnerBars />
                    <span>Düşünüyor… 🤖</span>
                    <span className="font-mono text-[11px] opacity-75">{thinkSeconds}s</span>
                  </>
                ) : (
                  <>
                    <span>Öner</span>
                    <span className="font-mono text-[11px] rounded bg-black/25 px-1.5 py-0.5">⏎</span>
                  </>
                )}
              </button>
            </div>

            {/* GENRES */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-500 mr-1">tür:</span>
              {GENRES.map(g => (
                <button
                  key={g.key}
                  onClick={() => handleGenre(g)}
                  disabled={status === "loading"}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition disabled:opacity-50 backdrop-blur
                    ${activeGenre === g.key
                      ? "border border-indigo-400 bg-indigo-500/20 text-white shadow-[0_0_0_1px_rgba(129,140,248,0.6),0_8px_18px_-8px_rgba(99,102,241,0.45)]"
                      : "border border-white/10 bg-slate-900/55 text-slate-200 hover:-translate-y-0.5 hover:border-indigo-400 hover:bg-indigo-500/15 hover:text-white"}`}
                >
                  <span className="text-sm">{g.icon}</span>{g.label}
                </button>
              ))}
            </div>

            {/* QUICK CHIPS */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-500 mr-1">öneri:</span>
              {QUICK_CHIPS.map(c => (
                <button
                  key={c}
                  onClick={() => handleChip(c)}
                  disabled={status === "loading"}
                  className="inline-flex items-center gap-2 rounded-lg border border-dashed border-white/20 bg-slate-900/45 px-3 py-2 text-[13px] font-medium text-slate-200 transition disabled:opacity-50 enabled:hover:-translate-y-0.5 enabled:hover:border-solid enabled:hover:border-indigo-400 enabled:hover:bg-indigo-500/15 enabled:hover:text-white"
                >
                  <span>{c}</span>
                  <span className="text-[11px] text-slate-500">↗</span>
                </button>
              ))}
            </div>
          </div>

          {/* COLOR */}
          <div className="flex flex-col gap-2.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">MASCOT</span>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c.hex}
                  title={c.name}
                  aria-label={c.name}
                  onClick={() => setMascotColor(c.hex)}
                  className={`relative aspect-square w-full rounded-lg border-2 transition cursor-pointer
                    ${mascotColor.toLowerCase() === c.hex.toLowerCase() ? "border-white" : "border-transparent"}
                    hover:-translate-y-0.5`}
                  style={{
                    background: c.hex,
                    boxShadow: `0 4px 14px -4px ${c.hex}, inset 0 0 0 1px rgba(255,255,255,0.18)`,
                  }}
                >
                  {mascotColor.toLowerCase() === c.hex.toLowerCase() && (
                    <span className="absolute inset-0 grid place-items-center font-bold text-white drop-shadow-md">✓</span>
                  )}
                </button>
              ))}
              <label
                title="Custom color"
                className="relative aspect-square grid place-items-center rounded-lg border-2 border-transparent cursor-pointer text-lg font-bold text-white"
                style={{ background: "linear-gradient(135deg, #ff6b6b, #feca57, #48dbfb, #a55eea)" }}
              >
                <input
                  type="color"
                  value={mascotColor}
                  onChange={e => setMascotColor(e.target.value)}
                  className="absolute opacity-0 pointer-events-none"
                />
                <span>+</span>
              </label>
            </div>
          </div>
        </section>

        {/* RESULT */}
        <section ref={resultRef} className="mb-14 min-h-[200px]">
          {status === "idle" && (
            <div className="relative rounded-2xl border border-dashed border-white/15 bg-slate-900/30 p-12 text-center text-slate-300 backdrop-blur">
              <Corners />
              <span className="mb-3 block font-mono text-[11px] text-slate-500">// idle · awaiting query</span>
              <p className="m-0 mx-auto max-w-[520px] text-base leading-relaxed">
                Bir tür seç, hazır öneriye tıkla, ya da kendi ruh halini yaz — agent senin için bir oyun bulacak.
              </p>
            </div>
          )}

          {status === "loading" && (
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-7 backdrop-blur">
              <div className="mb-4">
                <span className="font-mono text-[11px] tracking-wider text-slate-500">QUERY</span>
                <p className="mt-1 italic text-lg text-slate-200">"{lastQuery}"</p>
              </div>
              <div className="mb-5 flex flex-col gap-2.5">
                <Step label="Routing query" active={thinkSeconds < 2} done={thinkSeconds >= 2} />
                <Step label="Retrieving sources" active={thinkSeconds >= 2 && thinkSeconds < 4} done={thinkSeconds >= 4} />
                <Step label="Composing response" active={thinkSeconds >= 4} done={false} />
              </div>
              <div className="flex flex-col gap-3.5">
                <Skel className="h-7 w-32" />
                <Skel className="h-3.5 w-3/4" />
                <Skel className="h-24 w-full" />
                <Skel className="h-24 w-full" />
              </div>
              <p className="mt-4 text-right font-mono text-[11px] text-slate-500">agent is thinking · {thinkSeconds}s elapsed</p>
            </div>
          )}

          {status === "error" && (
            <div className="grid grid-cols-1 gap-5 rounded-2xl border border-red-500/60 bg-gradient-to-b from-red-900/40 to-red-950/40 p-7 backdrop-blur md:grid-cols-[auto_1fr]">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-red-500 font-mono text-2xl font-extrabold text-white shadow-[0_0_24px_rgba(239,68,68,0.5)]">!</div>
              <div>
                <span className="font-mono text-[11px] tracking-wider text-red-300">ERR · NETWORK</span>
                <h3 className="mt-1.5 mb-2 text-lg">{errorMsg}</h3>
                <p className="mb-4 text-sm leading-relaxed text-slate-200">
                  The agent couldn't reach the recommendation service. Make sure the FastAPI server is running on{" "}
                  <code className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-xs">localhost:8000</code>, then try again.
                </p>
                <div className="flex gap-2.5">
                  <button onClick={() => submit(lastQuery)} className="rounded-lg px-4 py-2.5 text-sm font-medium text-white transition hover:-translate-y-0.5"
                          style={{ background: "linear-gradient(180deg, #818cf8, #6366f1)" }}>↻ Retry</button>
                  <button onClick={() => setStatus("idle")} className="rounded-lg border border-white/15 bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800">Dismiss</button>
                </div>
              </div>
            </div>
          )}

          {status === "success" && result && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3.5">
                <RouteBadge route={result.route} />
                <span className="font-mono text-xs italic text-slate-500">re: "{lastQuery}"</span>
              </div>
              <MarkdownAnswer answer={result.answer} />
              <div className="border-t border-dashed border-white/10 pt-2 text-right font-mono text-[11px] text-slate-500">
                ✓ response complete · {result.route.toUpperCase()} route
              </div>
            </div>
          )}
        </section>

        {/* POPULAR */}
        <section>
          <header className="mb-5 flex items-end justify-between gap-4 border-b border-dashed border-white/10 pb-4">
            <div>
              <h2 className="m-0 text-2xl font-semibold tracking-tight">🎮 Bu sıralar en popüler oyunlar</h2>
              <p className="mt-1 text-sm text-slate-400">Tıkla ve agent benzerlerini önerebilsin.</p>
            </div>
            <span className="whitespace-nowrap font-mono text-[11px] uppercase tracking-wider text-slate-500">
              trending · week 18 · 2026
            </span>
          </header>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {POPULAR.map(g => (
              <button
                key={g.title}
                onClick={() => handleGameClick(g)}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 text-left backdrop-blur transition hover:-translate-y-1.5"
                style={{
                }}
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                <GameCover image={g.image} title={g.title} />
                <div className="pointer-events-none absolute -top-1/2 -left-1/2 h-[200%] w-[200%] -translate-x-full transition-transform duration-700 group-hover:translate-x-full"
                       style={{ background: "linear-gradient(120deg, transparent 40%, rgba(255,255,255,0.22) 50%, transparent 60%)" }} />
                  <span className="absolute bottom-2.5 left-2.5 rounded-full border border-white/15 bg-black/65 px-2.5 py-1 font-mono text-[10.5px] tracking-wide text-white backdrop-blur">
                    {g.tag}
                  </span>
                </div>
                <div className="flex flex-col gap-1 px-4 pt-3.5 pb-1">
                  <h3 className="m-0 text-base font-semibold leading-snug tracking-tight text-white">{g.title}</h3>
                  <span className="text-xs text-slate-400">{g.genre}</span>
                </div>
                <span className="px-4 pb-3.5 pt-2 font-mono text-[11px] text-slate-500 transition-colors"
                      style={{ color: undefined }}>
                  benzerini öner →
                </span>
              </button>
            ))}
          </div>
        </section>

        <footer className="mt-14 flex justify-between border-t border-dashed border-white/10 pt-6 font-mono text-[11px] tracking-wide text-slate-500">
          <span>GameMind AI · agentic recommender</span>
          <span>frontend · React + Tailwind</span>
        </footer>
      </div>

      {/* Local keyframes */}
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes drift {
          0%   { transform: translate(0, -40px) rotate(0); }
          50%  { transform: translate(40px, 50vh) rotate(180deg); }
          100% { transform: translate(-30px, 110vh) rotate(360deg); }
        }
        @keyframes auroraA { 0%,100% { transform: translate(0,0) scale(1); opacity:.7;} 50% { transform: translate(80px,-50px) scale(1.15); opacity:.55; } }
        @keyframes auroraB { 0%,100% { transform: translate(0,0) scale(1); opacity:.6;} 50% { transform: translate(-60px,40px) scale(1.12); opacity:.45; } }
      `}</style>
    </div>
  );
}

// ---------------- Small bits ----------------
function SpinnerBars() {
  return (
    <span className="inline-flex items-center gap-[3px]">
      {[0, 0.12, 0.24, 0.36].map((d, i) => (
        <span key={i} className="block h-3 w-1 rounded-sm bg-white"
          style={{ animation: `bars 1s ease-in-out ${d}s infinite` }} />
      ))}
      <style>{`@keyframes bars { 0%,40%,100% { transform: scaleY(0.5); } 20% { transform: scaleY(1); } }`}</style>
    </span>
  );
}

function Step({ label, active, done }) {
  return (
    <div className={`flex items-center gap-3 rounded-lg px-3 py-2 ${active || done ? "" : "opacity-70"}`}>
      <span className={`block h-2 w-2 rounded-full transition
        ${done ? "bg-emerald-400" : active ? "bg-indigo-400 shadow-[0_0_12px_rgba(129,140,248,0.5)] animate-pulse" : "bg-slate-600"}`} />
      <span className={`font-mono text-xs ${active || done ? "text-white" : "text-slate-400"}`}>{label}</span>
      {active && (
        <span className="relative h-0.5 flex-1 overflow-hidden rounded-sm bg-white/10">
          <span className="absolute inset-0 -translate-x-full"
                style={{ background: "linear-gradient(90deg, transparent, #818cf8, transparent)", animation: "shimmer 1.4s ease-in-out infinite" }} />
          <style>{`@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}</style>
        </span>
      )}
    </div>
  );
}

function Skel({ className = "" }) {
  return (
    <div className={`rounded-lg ${className}`}
      style={{
        background: "linear-gradient(90deg, #1f1d3a, #2c2950, #1f1d3a)",
        backgroundSize: "200% 100%",
        animation: "skel 1.6s ease-in-out infinite",
      }}>
      <style>{`@keyframes skel { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
    </div>
  );
}

function Corners() {
  const base = "absolute h-3.5 w-3.5 border-2 border-indigo-400";
  return (
    <>
      <div className={`${base} -left-0.5 -top-0.5 border-r-0 border-b-0`} />
      <div className={`${base} -right-0.5 -top-0.5 border-l-0 border-b-0`} />
      <div className={`${base} -left-0.5 -bottom-0.5 border-r-0 border-t-0`} />
      <div className={`${base} -right-0.5 -bottom-0.5 border-l-0 border-t-0`} />
    </>
  );
}
