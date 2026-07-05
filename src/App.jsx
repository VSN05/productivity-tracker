import { useState, useEffect, useRef } from "react";

const CATS = [
  { id:"college", label:"College Study", sub:"Lectures & exams",   icon:"🎓", c:"#6366F1", bg:"rgba(99,102,241,0.12)",  border:"rgba(99,102,241,0.35)",  glow:"rgba(99,102,241,0.25)",  grad:"#4F46E5,#6366F1" },
  { id:"learning",label:"Learning",      sub:"Self-improvement",   icon:"📖", c:"#F59E0B", bg:"rgba(245,158,11,0.1)",   border:"rgba(245,158,11,0.35)",  glow:"rgba(245,158,11,0.2)",   grad:"#D97706,#F59E0B" },
  { id:"exercise", label:"Exercise",     sub:"Health & fitness",   icon:"⚡", c:"#10B981", bg:"rgba(16,185,129,0.1)",   border:"rgba(16,185,129,0.35)",  glow:"rgba(16,185,129,0.2)",   grad:"#059669,#10B981" },
  { id:"work",     label:"Work",         sub:"Projects & tasks",   icon:"💼", c:"#EC4899", bg:"rgba(236,72,153,0.1)",   border:"rgba(236,72,153,0.35)",  glow:"rgba(236,72,153,0.2)",   grad:"#DB2777,#EC4899" },
  { id:"break",    label:"Break",        sub:"Rest & leisure",     icon:"☕", c:"#94A3B8", bg:"rgba(148,163,184,0.1)",  border:"rgba(148,163,184,0.3)",  glow:"rgba(148,163,184,0.15)", grad:"#64748B,#94A3B8" },
  { id:"other",    label:"Other",        sub:"Anything else",      icon:"📌", c:"#F472B6", bg:"rgba(244,114,182,0.1)",  border:"rgba(244,114,182,0.3)",  glow:"rgba(244,114,182,0.15)", grad:"#EC4899,#F472B6" },
];

const GOAL = 480;
function fmt(m){if(!m)return"0m";const h=Math.floor(m/60),r=m%60;return h?(r?`${h}h ${r}m`:`${h}h`):`${r}m`;}
function clk(d){return d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});}
function dstr(d){return d.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});}
function hourLabel(h){const ampm=h>=12?"PM":"AM";const h12=h%12||12;return`${h12}:00 ${ampm}`;}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#080810;--sur:#0C0C16;--sur2:#12121E;--sur3:rgba(255,255,255,0.04);
  --b1:rgba(255,255,255,0.07);--b2:rgba(255,255,255,0.12);
  --t1:#F0F0F8;--t2:rgba(255,255,255,0.5);--t3:rgba(255,255,255,0.3);--t4:rgba(255,255,255,0.18);
  --accent:#6366F1;--accent2:#8B5CF6;--accent3:#EC4899;
}
body{background:var(--bg);color:var(--t1);font-family:'Sora',sans-serif;min-height:100vh;overflow-x:hidden;}
.mono{font-family:'JetBrains Mono',monospace;}
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
.hdr{display:flex;justify-content:space-between;align-items:center;padding:28px 22px 0;}
.logo{display:flex;align-items:center;gap:10px;}
.logo-gem{width:32px;height:32px;border-radius:11px;background:linear-gradient(135deg,#6366F1,#8B5CF6,#EC4899);display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 0 24px rgba(99,102,241,0.55),0 0 48px rgba(99,102,241,0.2);animation:gemG 3s ease-in-out infinite;}
@keyframes gemG{0%,100%{box-shadow:0 0 24px rgba(99,102,241,0.55),0 0 48px rgba(99,102,241,0.2)}50%{box-shadow:0 0 32px rgba(139,92,246,0.7),0 0 64px rgba(139,92,246,0.3)}}
.logo-name{font-size:17px;font-weight:800;letter-spacing:-0.04em;background:linear-gradient(135deg,#fff 0%,rgba(255,255,255,0.65) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.clk-pill{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.06);border:1px solid var(--b1);border-radius:22px;padding:8px 16px;backdrop-filter:blur(20px);box-shadow:inset 0 1px 0 rgba(255,255,255,0.08);}
.clk-pill .t{font-size:14px;font-weight:600;}
.live-dot{width:7px;height:7px;border-radius:50%;background:#10B981;box-shadow:0 0 8px #10B981;animation:blink 2s ease infinite;}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0.25}}
.hero{padding:28px 22px 0;}
.hero-lbl{font-size:11px;font-weight:600;color:var(--t3);text-transform:uppercase;letter-spacing:0.15em;margin-bottom:8px;}
.hero-t{font-size:72px;font-weight:800;letter-spacing:-0.05em;line-height:1;background:linear-gradient(135deg,#FFFFFF 0%,rgba(255,255,255,0.5) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:8px;}
.hero-sub{font-size:13px;color:var(--t3);font-weight:300;margin-bottom:22px;}
.goal-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;}
.goal-lbl{font-size:12px;color:var(--t4);}
.goal-val{font-size:12px;font-weight:700;color:var(--accent);font-family:'JetBrains Mono',monospace;}
.goal-track{height:6px;border-radius:99px;background:rgba(255,255,255,0.07);overflow:hidden;position:relative;}
.goal-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,#6366F1,#8B5CF6,#EC4899);position:relative;transition:width 1.2s cubic-bezier(0.4,0,0.2,1);}
.goal-fill::after{content:'';position:absolute;right:0;top:-2px;width:10px;height:10px;border-radius:50%;background:#EC4899;box-shadow:0 0 10px #EC4899;}
.mini-stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:20px 22px 0;}
.mstat{background:var(--sur3);border:1px solid var(--b1);border-radius:16px;padding:16px 12px;position:relative;overflow:hidden;transition:all 0.2s;}
.mstat::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent);}
.mstat:hover{border-color:var(--b2);}
.mstat-v{font-size:22px;font-weight:700;font-family:'JetBrains Mono',monospace;letter-spacing:-0.03em;margin-bottom:4px;}
.mstat-l{font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:0.12em;}
.nav{display:flex;background:rgba(255,255,255,0.04);border:1px solid var(--b1);border-radius:18px;padding:4px;margin:20px 22px 0;gap:3px;}
.nb{flex:1;padding:10px 2px;border:none;background:none;cursor:pointer;font-family:'Sora',sans-serif;font-size:11px;font-weight:500;color:var(--t3);border-radius:14px;transition:all 0.25s;letter-spacing:0.03em;}
.nb.on{background:rgba(255,255,255,0.1);color:#fff;border:1px solid rgba(255,255,255,0.13);box-shadow:0 2px 14px rgba(0,0,0,0.35);}
.page{padding:20px 22px 40px;flex:1;}
.act-card{border-radius:22px;padding:22px;margin-bottom:18px;border:1px solid;position:relative;overflow:hidden;transition:all 0.3s;}
.act-card::before{content:'';position:absolute;top:0;left:-100%;width:200%;height:1px;animation:scan 3s linear infinite;}
@keyframes scan{to{left:100%}}
.live-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.3);border-radius:20px;padding:5px 11px;margin-bottom:14px;}
.live-badge span{font-size:10px;font-weight:700;color:#10B981;text-transform:uppercase;letter-spacing:0.12em;}
.timer-big{font-family:'JetBrains Mono',monospace;font-size:56px;font-weight:700;letter-spacing:-0.02em;line-height:1;margin-bottom:6px;}
.btn-stop{padding:10px 24px;background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.3);border-radius:11px;color:#F87171;font-family:'Sora',sans-serif;font-size:12px;font-weight:700;cursor:pointer;letter-spacing:0.06em;text-transform:uppercase;transition:all 0.2s;margin-top:14px;}
.btn-stop:hover{background:rgba(239,68,68,0.22);}
.sec-lbl{font-size:11px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:0.15em;margin-bottom:14px;}
.cat-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;}
.ccard{border-radius:20px;padding:18px 16px;border:1px solid var(--b1);background:var(--sur3);cursor:pointer;text-align:left;font-family:'Sora',sans-serif;transition:all 0.25s cubic-bezier(0.4,0,0.2,1);position:relative;overflow:hidden;}
.ccard:hover{transform:translateY(-3px);border-color:var(--b2);}
.ccard.sel{transform:translateY(-3px);}
.ccard-icon{width:42px;height:42px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:12px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.09);}
.ccard-name{font-size:13px;font-weight:700;color:var(--t1);margin-bottom:3px;}
.ccard-sub{font-size:10px;color:var(--t3);}
.ccard-sel{position:absolute;top:12px;right:12px;width:9px;height:9px;border-radius:50%;}
.inp{width:100%;padding:15px 17px;background:rgba(255,255,255,0.05);border:1px solid var(--b1);border-radius:15px;font-family:'Sora',sans-serif;font-size:14px;color:var(--t1);outline:none;transition:all 0.2s;margin-bottom:13px;}
.inp:focus{border-color:rgba(99,102,241,0.5);background:rgba(99,102,241,0.06);box-shadow:0 0 0 3px rgba(99,102,241,0.1);}
.inp::placeholder{color:rgba(255,255,255,0.18);}
.btn-p{width:100%;padding:17px;border:none;border-radius:17px;font-family:'Sora',sans-serif;font-size:14px;font-weight:700;cursor:pointer;letter-spacing:0.03em;background:linear-gradient(135deg,#6366F1 0%,#8B5CF6 50%,#A855F7 100%);color:#fff;position:relative;overflow:hidden;box-shadow:0 4px 24px rgba(99,102,241,0.4),inset 0 1px 0 rgba(255,255,255,0.2);transition:all 0.2s;}
.btn-p::before{content:'';position:absolute;top:0;left:-100%;width:80px;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent);animation:shine 3.5s ease infinite;}
@keyframes shine{0%{left:-100%}45%,100%{left:200%}}
.btn-p:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(99,102,241,0.5);}
.btn-p:disabled{opacity:0.3;cursor:not-allowed;transform:none;box-shadow:none;}
.btn-s{width:100%;padding:14px;border-radius:13px;font-family:'Sora',sans-serif;font-size:13px;font-weight:500;cursor:pointer;background:rgba(255,255,255,0.07);color:var(--t1);border:1px solid var(--b2);transition:all 0.2s;margin-top:10px;}
.btn-s:hover{border-color:rgba(255,255,255,0.22);}
.log-row{display:flex;align-items:center;justify-content:space-between;padding:14px;border-radius:15px;background:var(--sur3);border:1px solid var(--b1);margin-bottom:8px;transition:all 0.2s;}
.log-row:hover{border-color:var(--b2);background:rgba(255,255,255,0.06);}
.log-ico{width:40px;height:40px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;}
.stat-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:20px;}
.sbox{background:var(--sur3);border:1px solid var(--b1);border-radius:18px;padding:18px 12px;position:relative;overflow:hidden;}
.sbox::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent);}
.sbox-v{font-size:23px;font-weight:700;font-family:'JetBrains Mono',monospace;letter-spacing:-0.03em;margin-bottom:4px;}
.sbox-l{font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:0.12em;}
.bk-card{background:var(--sur3);border:1px solid var(--b1);border-radius:20px;padding:20px;margin-bottom:20px;}
.bk-row{margin-bottom:18px;}
.bk-row:last-child{margin-bottom:0;}
.bk-info{display:flex;justify-content:space-between;align-items:center;margin-bottom:9px;}
.bk-name{font-size:13px;font-weight:600;display:flex;align-items:center;gap:9px;}
.bk-meta{font-size:12px;font-family:'JetBrains Mono',monospace;font-weight:600;}
.prog-bg{height:6px;background:rgba(255,255,255,0.06);border-radius:99px;overflow:hidden;}
.prog-fill{height:100%;border-radius:99px;position:relative;transition:width 1s cubic-bezier(0.4,0,0.2,1);}
.prog-fill::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.2));border-radius:99px;}
.div{height:1px;background:var(--b1);margin:22px 0;}
.share-box{background:var(--sur3);border:1px solid var(--b1);border-radius:20px;padding:24px;text-align:center;margin-top:14px;position:relative;overflow:hidden;}
.share-box::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(99,102,241,0.7),rgba(236,72,153,0.7),transparent);}
.code-big{font-family:'JetBrains Mono',monospace;font-size:40px;font-weight:700;letter-spacing:10px;background:linear-gradient(135deg,#6366F1,#A855F7,#EC4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin:12px 0;}
.code-inp{width:100%;padding:18px;background:rgba(255,255,255,0.05);border:1px solid var(--b1);border-radius:16px;font-family:'JetBrains Mono',monospace;font-size:30px;font-weight:700;letter-spacing:12px;color:var(--t1);text-align:center;outline:none;margin-bottom:12px;transition:all 0.2s;}
.code-inp:focus{border-color:rgba(99,102,241,0.5);box-shadow:0 0 0 3px rgba(99,102,241,0.1);}
.code-inp::placeholder{color:rgba(255,255,255,0.15);letter-spacing:4px;}
.vs-card{background:var(--sur3);border:1px solid var(--b1);border-radius:20px;padding:22px;position:relative;overflow:hidden;}
.vs-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,rgba(99,102,241,0.6),rgba(236,72,153,0.6));}
.vs-nums{display:flex;align-items:center;justify-content:space-around;padding:8px 0 16px;}
.vs-n{font-size:32px;font-weight:700;font-family:'JetBrains Mono',monospace;letter-spacing:-0.02em;}
.empty{text-align:center;padding:48px 0;}
.empty-ico{font-size:48px;margin-bottom:14px;}
.empty-title{font-size:16px;font-weight:600;margin-bottom:6px;}
.empty-sub{font-size:13px;color:var(--t3);}
.fade{animation:fadeUp 0.35s cubic-bezier(0.4,0,0.2,1);}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}

/* Notification banner */
.notif-banner{position:fixed;top:0;left:0;right:0;z-index:999;background:linear-gradient(135deg,rgba(99,102,241,0.95),rgba(139,92,246,0.95));backdrop-filter:blur(20px);padding:16px 20px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 4px 30px rgba(99,102,241,0.4);animation:slideDown 0.4s cubic-bezier(0.4,0,0.2,1);}
@keyframes slideDown{from{transform:translateY(-100%)}to{transform:translateY(0)}}
.notif-text{font-size:13px;font-weight:600;color:#fff;}
.notif-sub{font-size:11px;color:rgba(255,255,255,0.7);margin-top:2px;}
.notif-btn{padding:8px 16px;background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.3);border-radius:8px;color:#fff;font-family:'Sora',sans-serif;font-size:12px;font-weight:600;cursor:pointer;flex-shrink:0;}

/* Hour log modal */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(8px);z-index:1000;display:flex;align-items:flex-end;justify-content:center;animation:fadeIn 0.3s ease;}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.modal{background:#13131E;border:1px solid rgba(255,255,255,0.1);border-radius:28px 28px 0 0;padding:28px 22px 40px;width:100%;max-width:430px;animation:slideUp 0.4s cubic-bezier(0.4,0,0.2,1);}
@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
.modal-handle{width:40px;height:4px;border-radius:99px;background:rgba(255,255,255,0.15);margin:0 auto 20px;}
.modal-title{font-size:18px;font-weight:700;margin-bottom:4px;}
.modal-sub{font-size:13px;color:var(--t3);margin-bottom:20px;}

/* Hour timeline */
.hour-timeline{display:flex;flex-direction:column;gap:6px;margin-bottom:20px;max-height:340px;overflow-y:auto;}
.hour-row{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;background:var(--sur3);border:1px solid var(--b1);}
.hour-time{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--t3);min-width:56px;font-weight:500;}
.hour-cat{font-size:12px;font-weight:500;flex:1;}
.hour-note{font-size:11px;color:var(--t3);max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}

/* Analysis card */
.analysis-card{background:var(--sur3);border:1px solid rgba(99,102,241,0.3);border-radius:20px;padding:20px;position:relative;overflow:hidden;}
.analysis-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(99,102,241,0.7),rgba(236,72,153,0.7),transparent);}
.analysis-text{font-size:13px;line-height:1.75;color:rgba(255,255,255,0.85);white-space:pre-wrap;}
.analysis-section{margin-bottom:16px;}
.analysis-heading{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:8px;}

/* Notif permission card */
.perm-card{background:linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.1));border:1px solid rgba(99,102,241,0.25);border-radius:20px;padding:20px;margin-bottom:20px;text-align:center;}
.perm-icon{font-size:36px;margin-bottom:10px;}
.perm-title{font-size:15px;font-weight:700;margin-bottom:6px;}
.perm-sub{font-size:12px;color:var(--t3);margin-bottom:16px;line-height:1.6;}
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
  const [hourLogs, setHourLogs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalHour, setModalHour] = useState(null);
  const [modalCat, setModalCat] = useState(null);
  const [modalNote, setModalNote] = useState("");
  const [notifPerm, setNotifPerm] = useState("default");
  const [analysis, setAnalysis] = useState("");
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerHour, setBannerHour] = useState(null);
  const timer = useRef(null);
  const notifCheckRef = useRef(null);

  // Load saved data
  useEffect(() => {
    try {
      const s = localStorage.getItem("fs"); if (s) setSessions(JSON.parse(s));
      const h = localStorage.getItem("fh"); if (h) setHourLogs(JSON.parse(h));
      const a = localStorage.getItem("fa"); if (a) setAnalysis(a);
    } catch {}
    setNotifPerm(Notification.permission);
  }, []);

  useEffect(() => { try { localStorage.setItem("fs", JSON.stringify(sessions)); } catch {} }, [sessions]);
  useEffect(() => { try { localStorage.setItem("fh", JSON.stringify(hourLogs)); } catch {} }, [hourLogs]);

  // Clock
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);

  // Session timer
  useEffect(() => {
    if (active) { timer.current = setInterval(() => setElapsed(Math.floor((Date.now() - active.startTime) / 1000)), 1000); }
    else { clearInterval(timer.current); setElapsed(0); }
    return () => clearInterval(timer.current);
  }, [active]);

  // Hourly notification check — runs every 60 seconds
  useEffect(() => {
    function checkHour() {
      const n = new Date();
      const h = n.getHours();
      const mins = n.getMinutes();
      // Fire at the top of each hour between 9 AM and 11 PM
      if (h >= 9 && h <= 23 && mins === 0) {
        const prevHour = h - 1;
        const alreadyLogged = hourLogs.some(l => l.hour === prevHour && l.date === n.toDateString());
        if (!alreadyLogged) {
          triggerHourCheck(prevHour);
        }
      }
    }
    notifCheckRef.current = setInterval(checkHour, 60000);
    return () => clearInterval(notifCheckRef.current);
  }, [hourLogs]);

  function triggerHourCheck(hour) {
    // Show in-app banner
    setBannerHour(hour);
    setShowBanner(true);
    // Send push notification if permitted
    if (Notification.permission === "granted") {
      const h = hour % 12 || 12;
      const ampm = hour >= 12 ? "PM" : "AM";
      const h2 = (hour + 1) % 12 || 12;
      new Notification("⏱ Focusly Check-in", {
        body: `What did you do ${h}:00–${h2}:00 ${ampm}? Tap to log it.`,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: "hourly-check",
        renotify: true,
      });
    }
  }

  // For testing — simulate an hour check (remove in production)
  function testHourCheck() {
    triggerHourCheck(new Date().getHours() - 1 >= 0 ? new Date().getHours() - 1 : 0);
  }

  async function requestNotifPermission() {
    const perm = await Notification.requestPermission();
    setNotifPerm(perm);
    if (perm === "granted") {
      new Notification("✦ Focusly", { body: "Hourly check-ins enabled! You'll be reminded every hour 9AM–11PM.", icon: "/icon-192.png" });
    }
  }

  function openHourModal(hour) {
    setModalHour(hour);
    setModalCat(null);
    setModalNote("");
    setShowModal(true);
    setShowBanner(false);
  }

  function saveHourLog() {
    if (!modalCat) return;
    const entry = { hour: modalHour, date: new Date().toDateString(), category: modalCat, note: modalNote, loggedAt: Date.now() };
    setHourLogs(p => [...p.filter(l => !(l.hour === modalHour && l.date === new Date().toDateString())), entry]);
    setShowModal(false);
  }

  async function analyseDay() {
    if (hourLogs.length === 0 && sessions.length === 0) return alert("Log some hours first!");
    setAnalysisLoading(true);
    const today = new Date().toDateString();
    const todayLogs = hourLogs.filter(l => l.date === today).sort((a,b) => a.hour - b.hour);
    const todaySessions = sessions;

    const prompt = `You are a personal productivity coach analysing a student's day. Be warm, specific, and actionable.

HOURLY LOG (what they did each hour):
${todayLogs.map(l => {
  const cat = CATS.find(c => c.id === l.category);
  return `${hourLabel(l.hour)}–${hourLabel(l.hour+1)}: ${cat?.label}${l.note ? ` — "${l.note}"` : ""}`;
}).join("\n") || "No hourly logs yet"}

TRACKED SESSIONS:
${todaySessions.map(s => {
  const cat = CATS.find(c => c.id === s.category);
  return `${cat?.label}: ${fmt(s.duration)}${s.note ? ` ("${s.note}")` : ""}`;
}).join("\n") || "No sessions tracked"}

TOTAL TRACKED TIME: ${fmt(totalMins)}
GOAL: 8 hours

Please analyse their day across these 4 areas. Use this exact format with these headers:

📊 PRODUCTIVITY SCORE
Give a score out of 10 and explain briefly why.

🎯 HOW YOU SPENT YOUR DAY
Describe their time distribution. Note which hours were productive vs wasted. Be specific.

🎓 GOAL ALIGNMENT
Are they spending enough time on college, learning, work, exercise? What's missing or unbalanced?

💡 3 IMPROVEMENTS FOR TOMORROW
Give 3 specific, actionable tips based on their actual pattern today. Make them realistic and encouraging.

Keep the whole response under 350 words. Be direct, warm, and motivating — like a coach who genuinely cares.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "Could not generate analysis.";
      setAnalysis(text);
      try { localStorage.setItem("fa", text); } catch {}
    } catch { alert("Analysis failed. Check your connection."); }
    setAnalysisLoading(false);
  }

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
  const todayHourLogs = hourLogs.filter(l => l.date === new Date().toDateString()).sort((a,b) => a.hour - b.hour);

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

      {/* In-app notification banner */}
      {showBanner && (
        <div className="notif-banner">
          <div>
            <div className="notif-text">⏱ Hour Check-in</div>
            <div className="notif-sub">What did you do {hourLabel(bannerHour)}–{hourLabel(bannerHour+1)}?</div>
          </div>
          <div style={{ display:"flex", gap:"8px" }}>
            <button className="notif-btn" onClick={() => openHourModal(bannerHour)}>Log it</button>
            <button className="notif-btn" style={{ background:"rgba(255,255,255,0.08)" }} onClick={() => setShowBanner(false)}>Later</button>
          </div>
        </div>
      )}

      {/* Hour log modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-handle" />
            <div className="modal-title">What did you do?</div>
            <div className="modal-sub">{hourLabel(modalHour)} – {hourLabel(modalHour + 1)}</div>
            <div className="cat-grid" style={{ marginBottom:"14px" }}>
              {CATS.map(c => (
                <div key={c.id} className={`ccard${modalCat===c.id?" sel":""}`}
                  onClick={() => setModalCat(c.id)}
                  style={modalCat===c.id ? { background:c.bg, borderColor:c.border, boxShadow:`0 6px 24px ${c.glow}` } : {}}>
                  <div className="ccard-icon">{c.icon}</div>
                  <div className="ccard-name">{c.label}</div>
                  {modalCat===c.id && <div className="ccard-sel" style={{ background:c.c, boxShadow:`0 0 10px ${c.c}` }} />}
                </div>
              ))}
            </div>
            <input className="inp" value={modalNote} onChange={e => setModalNote(e.target.value)} placeholder="Add details... (optional)" />
            <button className="btn-p" onClick={saveHourLog} disabled={!modalCat}>Save Log</button>
          </div>
        </div>
      )}

      <div className="wrap" style={{ paddingTop: showBanner ? "72px" : "0" }}>
        {/* Header */}
        <div className="hdr">
          <div className="logo">
            <div className="logo-gem">✦</div>
            <span className="logo-name">Focusly</span>
          </div>
          <div className="clk-pill">
            <div className="live-dot" />
            <span className="mono t">{clk(now)}</span>
            <span style={{ fontSize:"11px", color:"rgba(255,255,255,0.3)", marginLeft:"4px" }}>{dstr(now)}</span>
          </div>
        </div>

        {/* Hero */}
        <div className="hero">
          <div className="hero-lbl">Today's focus</div>
          <div className="hero-t">{fmt(totalMins)}</div>
          <div className="hero-sub">{sessions.length} session{sessions.length!==1?"s":""} · Goal: 8 hours</div>
          <div className="goal-row">
            <span className="goal-lbl">Daily goal progress</span>
            <span className="goal-val">{goalPct}%</span>
          </div>
          <div className="goal-track"><div className="goal-fill" style={{ width:`${goalPct}%` }} /></div>
        </div>

        {/* Mini stats */}
        <div className="mini-stats">
          <div className="mstat"><div className="mstat-v" style={{ color:"#818CF8" }}>{sessions.length}</div><div className="mstat-l">Sessions</div></div>
          <div className="mstat"><div className="mstat-v" style={{ color:"#10B981" }}>{todayHourLogs.length}</div><div className="mstat-l">Hours logged</div></div>
          <div className="mstat"><div className="mstat-v" style={{ color: goalPct>=100?"#10B981":"#F59E0B" }}>{goalPct}%</div><div className="mstat-l">Goal</div></div>
        </div>

        {/* Nav */}
        <div className="nav">
          {[["track","Track"],["hours","Hours"],["analyse","Analyse"],["friend","Friends"]].map(([v,l]) => (
            <button key={v} className={`nb${view===v?" on":""}`} onClick={() => setView(v)}>{l}</button>
          ))}
        </div>

        <div className="page">

          {/* ── TRACK ── */}
          {view==="track" && <div className="fade">
            {active && (
              <div className="act-card" style={{ background:ac?.bg, borderColor:ac?.border, boxShadow:`0 8px 40px ${ac?.glow}` }}>
                <div className="live-badge"><div className="live-dot" /><span>Live Session</span></div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
                  <div>
                    <div style={{ fontSize:"24px", marginBottom:"6px" }}>{ac?.icon}</div>
                    <div style={{ fontSize:"19px", fontWeight:"700" }}>{ac?.label}</div>
                    {active.note && <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.4)", marginTop:"5px" }}>{active.note}</div>}
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div className="timer-big" style={{ color:ac?.c }}>{String(em).padStart(2,"0")}:{String(es).padStart(2,"0")}</div>
                    <button className="btn-stop" onClick={stopSession}>End Session</button>
                  </div>
                </div>
              </div>
            )}
            {!active && <>
              <div className="sec-lbl">Choose activity</div>
              <div className="cat-grid">
                {CATS.map(c => (
                  <div key={c.id} className={`ccard${sel===c.id?" sel":""}`} onClick={() => setSel(c.id)}
                    style={sel===c.id ? { background:c.bg, borderColor:c.border, boxShadow:`0 8px 32px ${c.glow}` } : {}}>
                    <div className="ccard-icon">{c.icon}</div>
                    <div className="ccard-name">{c.label}</div>
                    <div className="ccard-sub">{c.sub}</div>
                    {sel===c.id && <div className="ccard-sel" style={{ background:c.c, boxShadow:`0 0 10px ${c.c}` }} />}
                  </div>
                ))}
              </div>
              <input className="inp" value={note} onChange={e => setNote(e.target.value)} placeholder="What are you working on? (optional)" />
              <button className="btn-p" onClick={startSession} disabled={!sel}>{sel?`✦  Begin ${CATS.find(c=>c.id===sel)?.label}`:"Select an activity first"}</button>
            </>}
            {sessions.length>0 && <div style={{ marginTop:"28px" }}>
              <div className="sec-lbl">Today's sessions</div>
              {[...sessions].reverse().map(s => {
                const cat=CATS.find(c=>c.id===s.category);
                return (
                  <div key={s.id} className="log-row">
                    <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                      <div className="log-ico" style={{ background:cat?.bg, border:`1px solid ${cat?.border}` }}>{cat?.icon}</div>
                      <div>
                        <div style={{ fontSize:"13px", fontWeight:"600" }}>{cat?.label}</div>
                        {s.note && <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.3)", marginTop:"3px" }}>{s.note}</div>}
                      </div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                      <span className="mono" style={{ fontSize:"13px", fontWeight:"600", color:cat?.c }}>{fmt(s.duration)}</span>
                      <button onClick={() => setSessions(p=>p.filter(x=>x.id!==s.id))} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.2)", cursor:"pointer", fontSize:"18px" }}>×</button>
                    </div>
                  </div>
                );
              })}
            </div>}
            {sessions.length===0&&!active && <div className="empty"><div className="empty-ico">🎯</div><div className="empty-title">Ready to focus?</div><div className="empty-sub">Pick an activity above and start your first session</div></div>}
          </div>}

          {/* ── HOURS ── */}
          {view==="hours" && <div className="fade">
            {/* Notification permission */}
            {notifPerm!=="granted" && (
              <div className="perm-card">
                <div className="perm-icon">🔔</div>
                <div className="perm-title">Enable Hourly Reminders</div>
                <div className="perm-sub">Get notified every hour from 9 AM to 11 PM to log what you did. Builds a complete picture of your day.</div>
                <button className="btn-p" onClick={requestNotifPermission}>Enable Notifications</button>
              </div>
            )}
            {notifPerm==="granted" && (
              <div style={{ background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.25)", borderRadius:"14px", padding:"14px 16px", marginBottom:"20px", display:"flex", alignItems:"center", gap:"10px" }}>
                <div className="live-dot" />
                <div>
                  <div style={{ fontSize:"13px", fontWeight:"600", color:"#10B981" }}>Reminders Active</div>
                  <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.4)", marginTop:"2px" }}>You'll be notified every hour, 9 AM – 11 PM</div>
                </div>
              </div>
            )}

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"14px" }}>
              <div className="sec-lbl" style={{ margin:0 }}>Today's hours</div>
              <button onClick={testHourCheck} style={{ fontSize:"11px", color:"rgba(255,255,255,0.3)", background:"none", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"8px", padding:"5px 10px", cursor:"pointer", fontFamily:"'Sora',sans-serif" }}>Test check-in</button>
            </div>

            {/* Hour grid — 9 AM to 11 PM */}
            <div style={{ display:"flex", flexDirection:"column", gap:"6px", marginBottom:"20px" }}>
              {Array.from({ length:15 }, (_,i) => i+9).map(h => {
                const log = todayHourLogs.find(l => l.hour===h);
                const cat = log ? CATS.find(c=>c.id===log.category) : null;
                const isPast = new Date().getHours() > h;
                const isCurrent = new Date().getHours() === h;
                return (
                  <div key={h} onClick={() => openHourModal(h)} className="log-row" style={{ cursor:"pointer", opacity: isPast||isCurrent ? 1 : 0.4, borderColor: isCurrent ? "rgba(99,102,241,0.4)" : log ? cat?.border : "var(--b1)", background: isCurrent ? "rgba(99,102,241,0.06)" : "var(--sur3)" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                      <div className="log-ico" style={{ background: log ? cat?.bg : "rgba(255,255,255,0.04)", border:`1px solid ${log ? cat?.border : "rgba(255,255,255,0.07)"}`, fontSize:"16px" }}>
                        {log ? cat?.icon : isCurrent ? "⬤" : "○"}
                      </div>
                      <div>
                        <div style={{ fontSize:"12px", fontWeight:"600", color: isCurrent ? "#818CF8" : "var(--t1)" }}>{hourLabel(h)} – {hourLabel(h+1)}</div>
                        <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.3)", marginTop:"2px" }}>{log ? (log.note || cat?.label) : isCurrent ? "Now — tap to log" : isPast ? "Not logged" : "Upcoming"}</div>
                      </div>
                    </div>
                    {log ? <span style={{ fontSize:"11px", color:cat?.c, fontWeight:"600" }}>{cat?.label}</span>
                      : isPast ? <span style={{ fontSize:"18px", color:"rgba(255,255,255,0.15)" }}>+</span>
                      : null}
                  </div>
                );
              })}
            </div>
          </div>}

          {/* ── ANALYSE ── */}
          {view==="analyse" && <div className="fade">
            <div style={{ marginBottom:"20px" }}>
              <div className="sec-lbl">AI Day Analysis</div>
              <p style={{ fontSize:"13px", color:"rgba(255,255,255,0.4)", lineHeight:"1.7", marginBottom:"18px" }}>
                Claude analyses your hourly logs and sessions to understand how you're spending your time, whether it aligns with your goals, and how to improve tomorrow.
              </p>
              <button className="btn-p" onClick={analyseDay} disabled={analysisLoading}>
                {analysisLoading ? "Analysing your day…" : "✦  Analyse My Day"}
              </button>
            </div>

            {analysisLoading && (
              <div style={{ textAlign:"center", padding:"32px 0" }}>
                <div style={{ fontSize:"36px", marginBottom:"12px", animation:"spin 2s linear infinite" }}>✦</div>
                <div style={{ fontSize:"13px", color:"rgba(255,255,255,0.4)" }}>Claude is reading your day…</div>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
            )}

            {analysis && !analysisLoading && (
              <div className="analysis-card fade">
                <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.14em", marginBottom:"14px" }}>
                  Today's Analysis · {new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"})}
                </div>
                <div className="analysis-text">{analysis}</div>
              </div>
            )}

            {!analysis && !analysisLoading && (
              <div className="empty">
                <div className="empty-ico">🧠</div>
                <div className="empty-title">Ready to reflect?</div>
                <div className="empty-sub">Log at least a few hours in the Hours tab, then hit Analyse to get your personalised AI feedback</div>
              </div>
            )}

            <div className="div" />
            <div className="sec-lbl">Today's quick stats</div>
            <div className="stat-grid">
              <div className="sbox"><div className="sbox-v" style={{ background:"linear-gradient(135deg,#6366F1,#8B5CF6)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>{fmt(totalMins)}</div><div className="sbox-l">Tracked</div></div>
              <div className="sbox"><div className="sbox-v">{todayHourLogs.length}</div><div className="sbox-l">Hours logged</div></div>
              <div className="sbox"><div className="sbox-v" style={{ color: goalPct>=100?"#10B981":"#F0F0F8" }}>{goalPct}%</div><div className="sbox-l">Goal</div></div>
            </div>
          </div>}

          {/* ── FRIENDS ── */}
          {view==="friend" && <div className="fade">
            <div className="sec-lbl">Enter friend's code</div>
            <input className="code-inp" value={friendIn} onChange={e => setFriendIn(e.target.value.toUpperCase())} placeholder="A1B2C3" maxLength={6} />
            <button className="btn-p" onClick={() => loadFriend(friendIn)} disabled={loading} style={{ marginBottom:"20px" }}>{loading?"Loading…":"View Friend's Day"}</button>

            <div className="div" />
            <div className="sec-lbl">Share your day</div>

            {byCat.filter(c=>c.mins>0).length>0 && <>
              <div className="bk-card">
                {byCat.sort((a,b)=>b.mins-a.mins).map(c => {
                  const pct=totalMins?Math.round((c.mins/totalMins)*100):0;
                  return (
                    <div key={c.id} className="bk-row">
                      <div className="bk-info">
                        <div className="bk-name"><span>{c.icon}</span>{c.label}</div>
                        <div className="bk-meta" style={{ color:c.c }}>{fmt(c.mins)}<span style={{ color:"rgba(255,255,255,0.25)", fontWeight:"400" }}> · {pct}%</span></div>
                      </div>
                      <div className="prog-bg"><div className="prog-fill" style={{ width:`${pct}%`, background:`linear-gradient(90deg,${c.grad})` }} /></div>
                    </div>
                  );
                })}
              </div>
              <button className="btn-p" onClick={generateShare} disabled={loading}>{loading?"Generating…":"✦  Generate Share Code"}</button>
              {shareCode && <div className="share-box">
                <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.14em" }}>Your code</div>
                <div className="code-big">{shareCode}</div>
                <button className="btn-s" onClick={() => copy(shareCode)}>{copyMsg||"Copy code"}</button>
              </div>}
            </>}

            {friendData && <div className="fade" style={{ marginTop:"24px" }}>
              <div className="div" />
              <div className="stat-grid">
                <div className="sbox"><div className="sbox-v" style={{ color:"#EC4899" }}>{fmt(friendData.total)}</div><div className="sbox-l">Friend</div></div>
                <div className="sbox"><div className="sbox-v" style={{ color:"#818CF8" }}>{fmt(totalMins)}</div><div className="sbox-l">You</div></div>
                <div className="sbox"><div className="sbox-v" style={{ color:totalMins>=friendData.total?"#10B981":"#F87171" }}>{totalMins>=friendData.total?"+":"-"}{fmt(Math.abs(totalMins-friendData.total))}</div><div className="sbox-l">{totalMins>=friendData.total?"Ahead":"Behind"}</div></div>
              </div>
              <div className="vs-card">
                <div className="vs-nums">
                  <div style={{ textAlign:"center" }}><div className="vs-n" style={{ color:"#818CF8" }}>{fmt(totalMins)}</div><div style={{ fontSize:"11px", color:"rgba(255,255,255,0.3)", marginTop:"6px", textTransform:"uppercase", letterSpacing:"0.12em" }}>You</div></div>
                  <div style={{ fontSize:"20px", color:"rgba(255,255,255,0.12)", fontWeight:"300" }}>vs</div>
                  <div style={{ textAlign:"center" }}><div className="vs-n" style={{ color:"#EC4899" }}>{fmt(friendData.total)}</div><div style={{ fontSize:"11px", color:"rgba(255,255,255,0.3)", marginTop:"6px", textTransform:"uppercase", letterSpacing:"0.12em" }}>Friend</div></div>
                </div>
                <div style={{ borderTop:"1px solid rgba(255,255,255,0.07)", paddingTop:"14px", fontSize:"13px", color:"rgba(255,255,255,0.4)", textAlign:"center", fontStyle:"italic" }}>
                  {totalMins>friendData.total?`🔥 You're ahead by ${fmt(totalMins-friendData.total)}`:totalMins<friendData.total?`⚡ Friend leads by ${fmt(friendData.total-totalMins)}`:"🤝 You're perfectly tied!"}
                </div>
              </div>
            </div>}
          </div>}

        </div>
      </div>
    </div>
  );
}
