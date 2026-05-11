import { useState, useEffect, useRef } from "react";

const CATS = [
  { id:"college", label:"College Study", sub:"Lectures & exams",   icon:"🎓", c:"#6366F1", bg:"rgba(99,102,241,0.12)",  border:"rgba(99,102,241,0.35)",  glow:"rgba(99,102,241,0.25)",  grad:"#4F46E5,#6366F1" },
  { id:"learning",label:"Learning",      sub:"Self-improvement",   icon:"📖", c:"#F59E0B", bg:"rgba(245,158,11,0.1)",  border:"rgba(245,158,11,0.35)",  glow:"rgba(245,158,11,0.2)",   grad:"#D97706,#F59E0B" },
  { id:"exercise", label:"Exercise",     sub:"Health & fitness",   icon:"⚡", c:"#10B981", bg:"rgba(16,185,129,0.1)",  border:"rgba(16,185,129,0.35)",  glow:"rgba(16,185,129,0.2)",   grad:"#059669,#10B981" },
  { id:"work",     label:"Work",         sub:"Projects & tasks",   icon:"💼", c:"#EC4899", bg:"rgba(236,72,153,0.1)",  border:"rgba(236,72,153,0.35)",  glow:"rgba(236,72,153,0.2)",   grad:"#DB2777,#EC4899" },
];

const GOAL = 480;
function fmt(m){if(!m)return"0m";const h=Math.floor(m/60),r=m%60;return h?(r?`${h}h ${r}m`:`${h}h`):`${r}m`;}
function clk(d){return d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});}
function dstr(d){return d.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#080810; --sur:#0C0C16; --sur2:#12121E; --sur3:rgba(255,255,255,0.04);
  --b1:rgba(255,255,255,0.07); --b2:rgba(255,255,255,0.12);
  --t1:#F0F0F8; --t2:rgba(255,255,255,0.5); --t3:rgba(255,255,255,0.3); --t4:rgba(255,255,255,0.18);
  --accent:#6366F1; --accent2:#8B5CF6; --accent3:#EC4899;
}
body{background:var(--bg);color:var(--t1);font-family:'Sora',sans-serif;min-height:100vh;overflow-x:hidden;}
.mono{font-family:'JetBrains Mono',monospace;}

/* Aurora */
.orb{position:fixed;border-radius:50%;pointer-events:none;z-index:0;}
.orb1{width:700px;height:700px;background:radial-gradient(circle,rgba(99,102,241,0.16) 0%,transparent 65%);top:-300px;left:-250px;animation:o1 9s ease-in-out infinite;}
.orb2{width:550px;height:550px;background:radial-gradient(circle,rgba(168,85,247,0.12) 0%,transparent 65%);top:200px;right:-220px;animation:o2 11s ease-in-out infinite;}
.orb3{width:450px;height:450px;background:radial-gradient(circle,rgba(236,72,153,0.09) 0%,transparent 65%);bottom:0;left:-100px;animation:o3 13s ease-in-out infinite;}
@keyframes o1{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(50px,40px) scale(1.08)}66%{transform:translate(-20px,60px) scale(0.96)}}
@keyframes o2{0%,100%{transform:translate(0,0)}50%{transform:translate(-40px,50px) scale(1.06)}}
@keyframes o3{0%,100%{transform:translate(0,0)}40%{transform:translate(40px,-30px) scale(1.04)}80%{transform:translate(-15px,25px)}}

.grid-bg{position:fixed;inset:0;pointer-events:none;z-index:0;opacity:0.025;background-image:linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px);background-size:50px 50px;}
.noise{position:fixed;inset:0;pointer-events:none;z-index:1;opacity:0.035;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");background-size:250px;}

.wrap{position:relative;z-index:10;max-width:430px;margin:0 auto;min-height:100vh;display:flex;flex-direction:column;}

/* Header */
.hdr{display:flex;justify-content:space-between;align-items:center;padding:28px 22px 0;}
.logo{display:flex;align-items:center;gap:10px;}
.logo-gem{width:32px;height:32px;border-radius:11px;background:linear-gradient(135deg,#6366F1,#8B5CF6,#EC4899);display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 0 24px rgba(99,102,241,0.55),0 0 48px rgba(99,102,241,0.2);animation:gemG 3s ease-in-out infinite;}
@keyframes gemG{0%,100%{box-shadow:0 0 24px rgba(99,102,241,0.55),0 0 48px rgba(99,102,241,0.2)}50%{box-shadow:0 0 32px rgba(139,92,246,0.7),0 0 64px rgba(139,92,246,0.3)}}
.logo-name{font-size:17px;font-weight:800;letter-spacing:-0.04em;background:linear-gradient(135deg,#fff 0%,rgba(255,255,255,0.65) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.clk-pill{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.06);border:1px solid var(--b1);border-radius:22px;padding:8px 16px;backdrop-filter:blur(20px);box-shadow:inset 0 1px 0 rgba(255,255,255,0.08);}
.clk-pill .t{font-size:14px;font-weight:600;}
.live-dot{width:7px;height:7px;border-radius:50%;background:#10B981;box-shadow:0 0 8px #10B981;animation:blink 2s ease infinite;}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0.25}}

/* Hero */
.hero{padding:28px 22px 0;}
.hero-lbl{font-size:11px;font-weight:600;color:var(--t3);text-transform:uppercase;letter-spacing:0.15em;margin-bottom:8px;}
.hero-t{font-size:76px;font-weight:800;letter-spacing:-0.05em;line-height:1;background:linear-gradient(135deg,#FFFFFF 0%,rgba(255,255,255,0.5) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:8px;}
.hero-sub{font-size:13px;color:var(--t3);font-weight:300;margin-bottom:22px;}
.goal-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;}
.goal-lbl{font-size:12px;color:var(--t4);}
.goal-val{font-size:12px;font-weight:700;color:var(--accent);font-family:'JetBrains Mono',monospace;}
.goal-track{height:6px;border-radius:99px;background:rgba(255,255,255,0.07);overflow:hidden;position:relative;}
.goal-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,#6366F1,#8B5CF6,#EC4899);position:relative;transition:width 1.2s cubic-bezier(0.4,0,0.2,1);}
.goal-fill::after{content:'';position:absolute;right:0;top:-2px;width:10px;height:10px;border-radius:50%;background:#EC4899;box-shadow:0 0 10px #EC4899;}

/* Mini stats */
.mini-stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:20px 22px 0;}
.mstat{background:var(--sur3);border:1px solid var(--b1);border-radius:16px;padding:16px 12px;position:relative;overflow:hidden;transition:all 0.2s;}
.mstat::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent);}
.mstat:hover{border-color:var(--b2);}
.mstat-v{font-size:22px;font-weight:700;font-family:'JetBrains Mono',monospace;letter-spacing:-0.03em;margin-bottom:4px;}
.mstat-l{font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:0.12em;}

/* Nav */
.nav{display:flex;background:rgba(255,255,255,0.04);border:1px solid var(--b1);border-radius:18px;padding:4px;margin:20px 22px 0;gap:3px;}
.nb{flex:1;padding:11px 4px;border:none;background:none;cursor:pointer;font-family:'Sora',sans-serif;font-size:12px;font-weight:500;color:var(--t3);border-radius:14px;transition:all 0.25s;letter-spacing:0.04em;}
.nb.on{background:rgba(255,255,255,0.1);color:#fff;border:1px solid rgba(255,255,255,0.13);box-shadow:0 2px 14px rgba(0,0,0,0.35);}

/* Page */
.page{padding:20px 22px 40px;flex:1;}

/* Active session */
.act-card{border-radius:22px;padding:22px;margin-bottom:18px;border:1px solid;position:relative;overflow:hidden;transition:all 0.3s;}
.act-card::before{content:'';position:absolute;top:0;left:-100%;width:200%;height:1px;animation:scan 3s linear infinite;}
@keyframes scan{to{left:100%}}
.act-card::after{content:'';position:absolute;inset:0;border-radius:22px;pointer-events:none;}
.live-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.3);border-radius:20px;padding:5px 11px;margin-bottom:14px;}
.live-badge span{font-size:10px;font-weight:700;color:#10B981;text-transform:uppercase;letter-spacing:0.12em;}
.timer-big{font-family:'JetBrains Mono',monospace;font-size:56px;font-weight:700;letter-spacing:-0.02em;line-height:1;margin-bottom:6px;}
.btn-stop{padding:10px 24px;background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.3);border-radius:11px;color:#F87171;font-family:'Sora',sans-serif;font-size:12px;font-weight:700;cursor:pointer;letter-spacing:0.06em;text-transform:uppercase;transition:all 0.2s;margin-top:14px;}
.btn-stop:hover{background:rgba(239,68,68,0.22);}

/* Cat grid */
.sec-lbl{font-size:11px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:0.15em;margin-bottom:14px;}
.cat-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;}
.ccard{border-radius:20px;padding:18px 16px;border:1px solid var(--b1);background:var(--sur3);cursor:pointer;text-align:left;font-family:'Sora',sans-serif;transition:all 0.25s cubic-bezier(0.4,0,0.2,1);position:relative;overflow:hidden;}
.ccard:hover{transform:translateY(-3px);border-color:var(--b2);}
.ccard.sel{transform:translateY(-3px);}
.ccard-icon{width:42px;height:42px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:12px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.09);}
.ccard-name{font-size:13px;font-weight:700;color:var(--t1);margin-bottom:3px;}
.ccard-sub{font-size:10px;color:var(--t3);}
.ccard-sel{position:absolute;top:12px;right:12px;width:9px;height:9px;border-radius:50%;}

/* Input */
.inp{width:100%;padding:15px 17px;background:rgba(255,255,255,0.05);border:1px solid var(--b1);border-radius:15px;font-family:'Sora',sans-serif;font-size:14px;color:var(--t1);outline:none;transition:all 0.2s;margin-bottom:13px;}
.inp:focus{border-color:rgba(99,102,241,0.5);background:rgba(99,102,241,0.06);box-shadow:0 0 0 3px rgba(99,102,241,0.1);}
.inp::placeholder{color:rgba(255,255,255,0.18);}

/* Primary button */
.btn-p{width:100%;padding:17px;border:none;border-radius:17px;font-family:'Sora',sans-serif;font-size:14px;font-weight:700;cursor:pointer;letter-spacing:0.03em;background:linear-gradient(135deg,#6366F1 0%,#8B5CF6 50%,#A855F7 100%);color:#fff;position:relative;overflow:hidden;box-shadow:0 4px 24px rgba(99,102,241,0.4),inset 0 1px 0 rgba(255,255,255,0.2);transition:all 0.2s;}
.btn-p::before{content:'';position:absolute;top:0;left:-100%;width:80px;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent);animation:shine 3.5s ease infinite;}
@keyframes shine{0%{left:-100%}45%,100%{left:200%}}
.btn-p:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(99,102,241,0.5);}
.btn-p:disabled{opacity:0.3;cursor:not-allowed;transform:none;box-shadow:none;}

/* Secondary button */
.btn-s{width:100%;padding:14px;border-radius:13px;font-family:'Sora',sans-serif;font-size:13px;font-weight:500;cursor:pointer;background:rgba(255,255,255,0.07);color:var(--t1);border:1px solid var(--b2);transition:all 0.2s;margin-top:10px;}
.btn-s:hover{border-color:rgba(255,255,255,0.22);}

/* Log rows */
.log-row{display:flex;align-items:center;justify-content:space-between;padding:14px;border-radius:15px;background:var(--sur3);border:1px solid var(--b1);margin-bottom:8px;transition:all 0.2s;}
.log-row:hover{border-color:var(--b2);background:rgba(255,255,255,0.06);}
.log-ico{width:40px;height:40px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;}

/* Stats */
.stat-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:20px;}
.sbox{background:var(--sur3);border:1px solid var(--b1);border-radius:18px;padding:18px 12px;position:relative;overflow:hidden;}
.sbox::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent);}
.sbox-v{font-size:23px;font-weight:700;font-family:'JetBrains Mono',monospace;letter-spacing:-0.03em;margin-bottom:4px;}
.sbox-l{font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:0.12em;}

/* Breakdown */
.bk-card{background:var(--sur3);border:1px solid var(--b1);border-radius:20px;padding:20px;margin-bottom:20px;}
.bk-row{margin-bottom:18px;}
.bk-row:last-child{margin-bottom:0;}
.bk-info{display:flex;justify-content:space-between;align-items:center;margin-bottom:9px;}
.bk-name{font-size:13px;font-weight:600;display:flex;align-items:center;gap:9px;}
.bk-meta{font-size:12px;font-family:'JetBrains Mono',monospace;font-weight:600;}
.prog-bg{height:6px;background:rgba(255,255,255,0.06);border-radius:99px;overflow:hidden;}
.prog-fill{height:100%;border-radius:99px;position:relative;transition:width 1s cubic-bezier(0.4,0,0.2,1);}
.prog-fill::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.2));border-radius:99px;}

/* Divider */
.div{height:1px;background:var(--b1);margin:22px 0;}

/* Share box */
.share-box{background:var(--sur3);border:1px solid var(--b1);border-radius:20px;padding:24px;text-align:center;margin-top:14px;position:relative;overflow:hidden;}
.share-box::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(99,102,241,0.7),rgba(236,72,153,0.7),transparent);}
.code-big{font-family:'JetBrains Mono',monospace;font-size:40px;font-weight:700;letter-spacing:10px;background:linear-gradient(135deg,#6366F1,#A855F7,#EC4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin:12px 0;}

/* Friend code input */
.code-inp{width:100%;padding:18px;background:rgba(255,255,255,0.05);border:1px solid var(--b1);border-radius:16px;font-family:'JetBrains Mono',monospace;font-size:30px;font-weight:700;letter-spacing:12px;color:var(--t1);text-align:center;outline:none;margin-bottom:12px;transition:all 0.2s;}
.code-inp:focus{border-color:rgba(99,102,241,0.5);box-shadow:0 0 0 3px rgba(99,102,241,0.1);}
.code-inp::placeholder{color:rgba(255,255,255,0.15);letter-spacing:4px;}

/* VS card */
.vs-card{background:var(--sur3);border:1px solid var(--b1);border-radius:20px;padding:22px;position:relative;overflow:hidden;}
.vs-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,rgba(99,102,241,0.6),rgba(236,72,153,0.6));}
.vs-nums{display:flex;align-items:center;justify-content:space-around;padding:8px 0 16px;}
.vs-n{font-size:32px;font-weight:700;font-family:'JetBrains Mono',monospace;letter-spacing:-0.02em;}

/* Empty state */
.empty{text-align:center;padding:48px 0;}
.empty-ico{font-size:48px;margin-bottom:14px;}
.empty-title{font-size:16px;font-weight:600;margin-bottom:6px;}
.empty-sub{font-size:13px;color:var(--t3);}

/* Fade */
.fade{animation:fadeUp 0.35s cubic-bezier(0.4,0,0.2,1);}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
`;

export default function App() {
  const [view, setView] = useState("track");
  const [sessions, setSessions] = useState([]);
  const [active, setActive] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [note, setNote] = useState("");
  const [sel, setSel] = useState(null);
  const [friendData, setFriendData] = useState(null);
  const [shareCode, setShareCode] = useState("");
  const [friendIn, setFriendIn] = useState("");
  const [copyMsg, setCopyMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(new Date());
  const timer = useRef(null);

  useEffect(() => { try { const s = localStorage.getItem("fs"); if (s) setSessions(JSON.parse(s)); } catch {} }, []);
  useEffect(() => { try { localStorage.setItem("fs", JSON.stringify(sessions)); } catch {} }, [sessions]);
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);
  useEffect(() => {
    if (active) { timer.current = setInterval(() => setElapsed(Math.floor((Date.now() - active.startTime) / 1000)), 1000); }
    else { clearInterval(timer.current); setElapsed(0); }
    return () => clearInterval(timer.current);
  }, [active]);

  function startSession() {
    if (!sel) return;
    setActive({ category: sel, startTime: Date.now(), note });
  }
  function stopSession() {
    if (!active) return;
    const mins = Math.max(1, Math.round(elapsed / 60));
    setSessions(p => [...p, { id: Date.now(), category: active.category, startTime: active.startTime, duration: mins, note: active.note }]);
    setActive(null); setNote(""); setSel(null);
  }

  const totalMins = sessions.reduce((a, s) => a + s.duration, 0);
  const goalPct = Math.min(100, Math.round((totalMins / GOAL) * 100));
  const longestMins = sessions.length ? Math.max(...sessions.map(s => s.duration)) : 0;
  const byCat = CATS.map(c => ({ ...c, mins: sessions.filter(s => s.category === c.id).reduce((a, s) => a + s.duration, 0) }));
  const ac = active ? CATS.find(c => c.id === active.category) : null;
  const em = Math.floor(elapsed / 60), es = elapsed % 60;

  async function generateShare() {
    setLoading(true);
    try {
      const r = await fetch("/api/share", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessions, total: totalMins }) });
      setShareCode((await r.json()).code);
    } catch { alert("Connection error."); }
    setLoading(false);
  }

  async function loadFriend(code) {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/share?code=${code.trim()}`);
      if (!r.ok) return alert("Code not found.");
      setFriendData(await r.json());
    } catch { alert("Connection error."); }
    setLoading(false);
  }

  async function copy(t) {
    try { await navigator.clipboard.writeText(t); setCopyMsg("Copied!"); setTimeout(() => setCopyMsg(""), 2000); }
    catch { setCopyMsg("Copy manually"); }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#080810" }}>
      <style>{CSS}</style>
      <div className="orb orb1" /><div className="orb orb2" /><div className="orb orb3" />
      <div className="grid-bg" /><div className="noise" />

      <div className="wrap">
        {/* Header */}
        <div className="hdr">
          <div className="logo">
            <div className="logo-gem">✦</div>
            <span className="logo-name">Focusly</span>
          </div>
          <div className="clk-pill">
            <div className="live-dot" />
            <span className="mono t">{clk(now)}</span>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginLeft: "4px" }}>{dstr(now)}</span>
          </div>
        </div>

        {/* Hero */}
        <div className="hero">
          <div className="hero-lbl">Today's focus</div>
          <div className="hero-t">{fmt(totalMins)}</div>
          <div className="hero-sub">{sessions.length} session{sessions.length !== 1 ? "s" : ""} · Goal: 8 hours</div>
          <div className="goal-row">
            <span className="goal-lbl">Daily goal progress</span>
            <span className="goal-val">{goalPct}%</span>
          </div>
          <div className="goal-track"><div className="goal-fill" style={{ width: `${goalPct}%` }} /></div>
        </div>

        {/* Mini stats */}
        <div className="mini-stats">
          <div className="mstat"><div className="mstat-v" style={{ color: "#818CF8" }}>{sessions.length}</div><div className="mstat-l">Sessions</div></div>
          <div className="mstat"><div className="mstat-v" style={{ color: "#10B981" }}>{fmt(longestMins)}</div><div className="mstat-l">Longest</div></div>
          <div className="mstat"><div className="mstat-v" style={{ color: goalPct >= 100 ? "#10B981" : "#F59E0B" }}>{goalPct}%</div><div className="mstat-l">Goal</div></div>
        </div>

        {/* Nav */}
        <div className="nav">
          {[["track","Track"],["summary","Summary"],["friend","Friends"]].map(([v,l]) => (
            <button key={v} className={`nb${view===v?" on":""}`} onClick={() => setView(v)}>{l}</button>
          ))}
        </div>

        <div className="page">

          {/* ── TRACK ── */}
          {view === "track" && <div className="fade">
            {active && (
              <div className="act-card" style={{ background: ac?.bg, borderColor: ac?.border, boxShadow: `0 8px 40px ${ac?.glow}` }}>
                <style>{`.act-card::before{background:linear-gradient(90deg,transparent,${ac?.c}99,${ac?.c}99,transparent);}`}</style>
                <div className="live-badge"><div className="live-dot" /><span>Live Session</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <div style={{ fontSize: "24px", marginBottom: "6px" }}>{ac?.icon}</div>
                    <div style={{ fontSize: "19px", fontWeight: "700", color: "#F0F0F8" }}>{ac?.label}</div>
                    {active.note && <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "5px" }}>{active.note}</div>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="timer-big" style={{ color: ac?.c }}>{String(em).padStart(2,"0")}:{String(es).padStart(2,"0")}</div>
                    <button className="btn-stop" onClick={stopSession}>End Session</button>
                  </div>
                </div>
              </div>
            )}

            {!active && <>
              <div className="sec-lbl">Choose activity</div>
              <div className="cat-grid">
                {CATS.map(c => (
                  <div key={c.id} className={`ccard${sel===c.id?" sel":""}`}
                    onClick={() => setSel(c.id)}
                    style={sel===c.id ? { background: c.bg, borderColor: c.border, boxShadow: `0 8px 32px ${c.glow}` } : {}}>
                    <div className="ccard-icon">{c.icon}</div>
                    <div className="ccard-name">{c.label}</div>
                    <div className="ccard-sub">{c.sub}</div>
                    {sel===c.id && <div className="ccard-sel" style={{ background: c.c, boxShadow: `0 0 10px ${c.c}` }} />}
                  </div>
                ))}
              </div>
              <input className="inp" value={note} onChange={e => setNote(e.target.value)} placeholder="What are you working on? (optional)" />
              <button className="btn-p" onClick={startSession} disabled={!sel}>
                {sel ? `✦  Begin ${CATS.find(c=>c.id===sel)?.label}` : "Select an activity first"}
              </button>
            </>}

            {sessions.length > 0 && <div style={{ marginTop: "28px" }}>
              <div className="sec-lbl">Today's log</div>
              {[...sessions].reverse().map(s => {
                const cat = CATS.find(c => c.id === s.category);
                return (
                  <div key={s.id} className="log-row">
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div className="log-ico" style={{ background: cat?.bg, border: `1px solid ${cat?.border}` }}>{cat?.icon}</div>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: "600" }}>{cat?.label}</div>
                        {s.note && <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "3px" }}>{s.note}</div>}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span className="mono" style={{ fontSize: "13px", fontWeight: "600", color: cat?.c }}>{fmt(s.duration)}</span>
                      <button onClick={() => setSessions(p => p.filter(x=>x.id!==s.id))} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", cursor: "pointer", fontSize: "18px" }}>×</button>
                    </div>
                  </div>
                );
              })}
            </div>}

            {sessions.length === 0 && !active && (
              <div className="empty">
                <div className="empty-ico">🎯</div>
                <div className="empty-title">Ready to focus?</div>
                <div className="empty-sub">Pick an activity above and start your first session of the day</div>
              </div>
            )}
          </div>}

          {/* ── SUMMARY ── */}
          {view === "summary" && <div className="fade">
            <div className="stat-grid">
              <div className="sbox"><div className="sbox-v" style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{fmt(totalMins)}</div><div className="sbox-l">Total</div></div>
              <div className="sbox"><div className="sbox-v">{sessions.length}</div><div className="sbox-l">Sessions</div></div>
              <div className="sbox"><div className="sbox-v" style={{ color: goalPct >= 100 ? "#10B981" : "#F0F0F8" }}>{goalPct}%</div><div className="sbox-l">Goal</div></div>
            </div>

            {byCat.filter(c=>c.mins>0).length === 0
              ? <div className="empty"><div className="empty-ico">📊</div><div className="empty-title">Nothing yet</div><div className="empty-sub">Complete sessions to see your breakdown</div></div>
              : <>
                <div className="sec-lbl">Breakdown</div>
                <div className="bk-card">
                  {byCat.sort((a,b)=>b.mins-a.mins).map(c => {
                    const pct = totalMins ? Math.round((c.mins/totalMins)*100) : 0;
                    return (
                      <div key={c.id} className="bk-row">
                        <div className="bk-info">
                          <div className="bk-name"><span>{c.icon}</span>{c.label}</div>
                          <div className="bk-meta" style={{ color: c.c }}>{fmt(c.mins)}<span style={{ color: "rgba(255,255,255,0.25)", fontWeight: "400" }}> · {pct}%</span></div>
                        </div>
                        <div className="prog-bg"><div className="prog-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg,${c.grad})` }} /></div>
                      </div>
                    );
                  })}
                </div>

                <div className="div" />
                <div className="sec-lbl">Share your day</div>
                <button className="btn-p" onClick={generateShare} disabled={loading}>{loading ? "Generating…" : "✦  Generate Share Code"}</button>
                {shareCode && <div className="share-box">
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.14em" }}>Your code</div>
                  <div className="code-big">{shareCode}</div>
                  <button className="btn-s" onClick={() => copy(shareCode)}>{copyMsg || "Copy code"}</button>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", marginTop: "10px" }}>Share this 6-character code with your friend</div>
                </div>}
              </>
            }
          </div>}

          {/* ── FRIENDS ── */}
          {view === "friend" && <div className="fade">
            <div className="sec-lbl">Enter friend's code</div>
            <input className="code-inp" value={friendIn} onChange={e => setFriendIn(e.target.value.toUpperCase())} placeholder="A1B2C3" maxLength={6} />
            <button className="btn-p" onClick={() => loadFriend(friendIn)} disabled={loading} style={{ marginBottom: "24px" }}>{loading ? "Loading…" : "View Friend's Day"}</button>

            {!friendData && <div className="empty">
              <div className="empty-ico">👥</div>
              <div className="empty-title">Compare with a friend</div>
              <div className="empty-sub">Ask them to generate a code from the Summary tab and share it with you</div>
            </div>}

            {friendData && <div className="fade">
              <div className="stat-grid" style={{ marginBottom: "20px" }}>
                <div className="sbox"><div className="sbox-v" style={{ color: "#EC4899" }}>{fmt(friendData.total)}</div><div className="sbox-l">Friend</div></div>
                <div className="sbox"><div className="sbox-v" style={{ color: "#818CF8" }}>{fmt(totalMins)}</div><div className="sbox-l">You</div></div>
                <div className="sbox">
                  <div className="sbox-v" style={{ color: totalMins >= friendData.total ? "#10B981" : "#F87171" }}>
                    {totalMins >= friendData.total ? "+" : "-"}{fmt(Math.abs(totalMins - friendData.total))}
                  </div>
                  <div className="sbox-l">{totalMins >= friendData.total ? "Ahead" : "Behind"}</div>
                </div>
              </div>

              <div className="sec-lbl">Their sessions</div>
              {friendData.sessions?.map((s,i) => {
                const cat = CATS.find(c => c.id === s.category);
                return (
                  <div key={i} className="log-row">
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div className="log-ico" style={{ background: cat?.bg || "rgba(255,255,255,0.06)", border: `1px solid ${cat?.border || "rgba(255,255,255,0.1)"}` }}>{cat?.icon || "📌"}</div>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: "600" }}>{cat?.label || s.category}</div>
                        {s.note && <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "3px" }}>{s.note}</div>}
                      </div>
                    </div>
                    <span className="mono" style={{ fontSize: "13px", fontWeight: "600", color: cat?.c }}>{fmt(s.duration)}</span>
                  </div>
                );
              })}

              <div className="div" />
              <div className="sec-lbl">Head to head</div>
              <div className="vs-card">
                <div className="vs-nums">
                  <div style={{ textAlign: "center" }}>
                    <div className="vs-n" style={{ color: "#818CF8" }}>{fmt(totalMins)}</div>
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "6px", textTransform: "uppercase", letterSpacing: "0.12em" }}>You</div>
                  </div>
                  <div style={{ fontSize: "20px", color: "rgba(255,255,255,0.12)", fontWeight: "300" }}>vs</div>
                  <div style={{ textAlign: "center" }}>
                    <div className="vs-n" style={{ color: "#EC4899" }}>{fmt(friendData.total)}</div>
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "6px", textTransform: "uppercase", letterSpacing: "0.12em" }}>Friend</div>
                  </div>
                </div>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "14px", fontSize: "13px", color: "rgba(255,255,255,0.4)", textAlign: "center", fontStyle: "italic" }}>
                  {totalMins > friendData.total ? `🔥 You're ahead by ${fmt(totalMins - friendData.total)}` : totalMins < friendData.total ? `⚡ Friend leads by ${fmt(friendData.total - totalMins)}` : "🤝 You're perfectly tied!"}
                </div>
              </div>
            </div>}
          </div>}

        </div>
      </div>
    </div>
  );
}
