import { useState, useEffect, useRef } from "react";

const CATEGORIES = [
  { id: "deep", label: "Deep Work", color: "#00D4AA", icon: "🧠" },
  { id: "meetings", label: "Meetings", color: "#FF6B6B", icon: "📞" },
  { id: "learning", label: "Learning", color: "#FFD93D", icon: "📚" },
  { id: "admin", label: "Admin", color: "#A29BFE", icon: "📋" },
  { id: "exercise", label: "Exercise", color: "#55EFC4", icon: "💪" },
  { id: "creative", label: "Creative", color: "#FD79A8", icon: "🎨" },
];

function formatTime(mins) {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function formatClock(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export default function App() {
  const [view, setView] = useState("track");
  const [sessions, setSessions] = useState([]);
  const [active, setActive] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [note, setNote] = useState("");
  const [selectedCat, setSelectedCat] = useState(null);
  const [friendData, setFriendData] = useState(null);
  const [shareCode, setShareCode] = useState("");
  const [friendInput, setFriendInput] = useState("");
  const [copyMsg, setCopyMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(new Date());
  const timerRef = useRef(null);

  // Load saved sessions from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("prod_sessions");
      if (saved) setSessions(JSON.parse(saved));
    } catch {}
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("prod_sessions", JSON.stringify(sessions));
    } catch {}
  }, [sessions]);

  // Clock tick
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Timer tick
  useEffect(() => {
    if (active) {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - active.startTime) / 1000));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setElapsed(0);
    }
    return () => clearInterval(timerRef.current);
  }, [active]);

  function startSession() {
    if (!selectedCat) return;
    setActive({ category: selectedCat, startTime: Date.now(), note });
  }

  function stopSession() {
    if (!active) return;
    const mins = Math.max(1, Math.round(elapsed / 60));
    setSessions((prev) => [
      ...prev,
      {
        id: Date.now(),
        category: active.category,
        startTime: active.startTime,
        endTime: Date.now(),
        duration: mins,
        note: active.note,
      },
    ]);
    setActive(null);
    setNote("");
    setSelectedCat(null);
  }

  function deleteSession(id) {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  const totalMins = sessions.reduce((a, s) => a + s.duration, 0);
  const byCategory = CATEGORIES.map((c) => ({
    ...c,
    mins: sessions.filter((s) => s.category === c.id).reduce((a, s) => a + s.duration, 0),
  })).filter((c) => c.mins > 0);

  // Generate share code via MongoDB API
  async function generateShare() {
    setLoading(true);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessions, total: totalMins }),
      });
      const data = await res.json();
      setShareCode(data.code);
    } catch (e) {
      alert("Failed to generate code. Check your internet connection.");
    }
    setLoading(false);
  }

  // Load friend's data by 6-char code
  async function loadFriendCode(code) {
    if (!code.trim()) return alert("Please enter a code.");
    setLoading(true);
    try {
      const res = await fetch(`/api/share?code=${code.trim()}`);
      if (!res.ok) return alert("Code not found. Check and try again.");
      const data = await res.json();
      setFriendData(data);
    } catch (e) {
      alert("Failed to load. Check your internet connection.");
    }
    setLoading(false);
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyMsg("Copied!");
      setTimeout(() => setCopyMsg(""), 2000);
    } catch {
      setCopyMsg("Copy manually");
    }
  }

  const elapsedMins = Math.floor(elapsed / 60);
  const elapsedSecs = elapsed % 60;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0A0F",
      color: "#E8E8F0",
      fontFamily: "'DM Mono', 'Courier New', monospace",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background grid */}
      <div style={{
        position: "fixed", inset: 0, opacity: 0.04,
        backgroundImage: "linear-gradient(#00D4AA 1px, transparent 1px), linear-gradient(90deg, #00D4AA 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        pointerEvents: "none",
      }} />

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 24px 16px",
        borderBottom: "1px solid rgba(0,212,170,0.15)",
      }}>
        <div>
          <div style={{ fontSize: "11px", color: "#00D4AA", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "2px" }}>
            Daily Tracker
          </div>
          <div style={{ fontSize: "13px", color: "#888", letterSpacing: "1px" }}>
            {formatDate(now)}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "#00D4AA", letterSpacing: "2px" }}>
            {formatClock(now)}
          </div>
          <div style={{ fontSize: "12px", color: "#555" }}>
            {formatTime(totalMins)} logged today
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ display: "flex", padding: "12px 24px", gap: "8px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        {[["track", "⏱ Track"], ["summary", "📊 Summary"], ["friend", "👥 Friend"]].map(([v, label]) => (
          <button key={v} onClick={() => setView(v)} style={{
            padding: "7px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "12px",
            letterSpacing: "0.5px", fontFamily: "inherit",
            background: view === v ? "#00D4AA" : "rgba(255,255,255,0.05)",
            color: view === v ? "#0A0A0F" : "#888",
            fontWeight: view === v ? "700" : "400",
            transition: "all 0.2s",
          }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ padding: "20px 24px", maxWidth: "600px", margin: "0 auto" }}>

        {/* TRACK VIEW */}
        {view === "track" && (
          <div>
            {active && (
              <div style={{
                background: "rgba(0,212,170,0.08)", border: "1px solid rgba(0,212,170,0.3)",
                borderRadius: "12px", padding: "20px", marginBottom: "20px",
                animation: "pulse 2s infinite",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "11px", color: "#00D4AA", letterSpacing: "2px", marginBottom: "4px" }}>ACTIVE SESSION</div>
                    <div style={{ fontSize: "16px", fontWeight: "600" }}>
                      {CATEGORIES.find(c => c.id === active.category)?.icon} {CATEGORIES.find(c => c.id === active.category)?.label}
                    </div>
                    {active.note && <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>{active.note}</div>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "32px", color: "#00D4AA", fontWeight: "bold", letterSpacing: "2px" }}>
                      {String(elapsedMins).padStart(2, "0")}:{String(elapsedSecs).padStart(2, "0")}
                    </div>
                    <button onClick={stopSession} style={{
                      marginTop: "8px", padding: "6px 16px", background: "#FF6B6B",
                      border: "none", borderRadius: "6px", color: "white", cursor: "pointer",
                      fontSize: "12px", fontFamily: "inherit", fontWeight: "600",
                    }}>
                      STOP
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!active && (
              <>
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "11px", color: "#888", letterSpacing: "2px", marginBottom: "10px" }}>SELECT CATEGORY</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    {CATEGORIES.map((c) => (
                      <button key={c.id} onClick={() => setSelectedCat(c.id)} style={{
                        padding: "12px", borderRadius: "10px", cursor: "pointer",
                        border: `1px solid ${selectedCat === c.id ? c.color : "rgba(255,255,255,0.07)"}`,
                        background: selectedCat === c.id ? `${c.color}18` : "rgba(255,255,255,0.02)",
                        color: selectedCat === c.id ? c.color : "#888",
                        fontFamily: "inherit", fontSize: "13px", textAlign: "left",
                        transition: "all 0.2s",
                      }}>
                        <span style={{ marginRight: "8px" }}>{c.icon}</span>{c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "11px", color: "#888", letterSpacing: "2px", marginBottom: "8px" }}>WHAT ARE YOU DOING? (optional)</div>
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Writing report, Reading chapter 3..."
                    style={{
                      width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px",
                      color: "#E8E8F0", fontFamily: "inherit", fontSize: "13px", boxSizing: "border-box",
                      outline: "none",
                    }}
                  />
                </div>

                <button onClick={startSession} disabled={!selectedCat} style={{
                  width: "100%", padding: "14px", background: selectedCat ? "#00D4AA" : "#1a1a2e",
                  border: "none", borderRadius: "10px", color: selectedCat ? "#0A0A0F" : "#333",
                  fontSize: "14px", fontWeight: "700", letterSpacing: "2px", cursor: selectedCat ? "pointer" : "not-allowed",
                  fontFamily: "inherit", transition: "all 0.2s",
                }}>
                  START SESSION
                </button>
              </>
            )}

            {sessions.length > 0 && (
              <div style={{ marginTop: "28px" }}>
                <div style={{ fontSize: "11px", color: "#888", letterSpacing: "2px", marginBottom: "12px" }}>TODAY'S LOG</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[...sessions].reverse().map((s) => {
                    const cat = CATEGORIES.find(c => c.id === s.category);
                    return (
                      <div key={s.id} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "12px 14px", borderRadius: "8px",
                        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "18px" }}>{cat?.icon}</span>
                          <div>
                            <div style={{ fontSize: "13px", color: cat?.color }}>{cat?.label}</div>
                            {s.note && <div style={{ fontSize: "11px", color: "#666", marginTop: "2px" }}>{s.note}</div>}
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ fontSize: "13px", color: "#E8E8F0", fontWeight: "600" }}>{formatTime(s.duration)}</span>
                          <button onClick={() => deleteSession(s.id)} style={{
                            background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: "14px",
                            padding: "2px 6px", borderRadius: "4px",
                          }}>✕</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUMMARY VIEW */}
        {view === "summary" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
              <div style={{ padding: "20px", background: "rgba(0,212,170,0.08)", border: "1px solid rgba(0,212,170,0.2)", borderRadius: "12px" }}>
                <div style={{ fontSize: "11px", color: "#00D4AA", letterSpacing: "2px", marginBottom: "6px" }}>TOTAL TIME</div>
                <div style={{ fontSize: "30px", fontWeight: "bold", color: "#00D4AA" }}>{formatTime(totalMins)}</div>
              </div>
              <div style={{ padding: "20px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px" }}>
                <div style={{ fontSize: "11px", color: "#888", letterSpacing: "2px", marginBottom: "6px" }}>SESSIONS</div>
                <div style={{ fontSize: "30px", fontWeight: "bold" }}>{sessions.length}</div>
              </div>
            </div>

            {byCategory.length === 0 && (
              <div style={{ textAlign: "center", color: "#555", padding: "40px", fontSize: "13px" }}>
                No sessions yet. Start tracking!
              </div>
            )}

            {byCategory.length > 0 && (
              <>
                <div style={{ fontSize: "11px", color: "#888", letterSpacing: "2px", marginBottom: "12px" }}>BREAKDOWN</div>
                {byCategory.sort((a, b) => b.mins - a.mins).map((c) => {
                  const pct = totalMins ? Math.round((c.mins / totalMins) * 100) : 0;
                  return (
                    <div key={c.id} style={{ marginBottom: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ fontSize: "13px" }}>{c.icon} {c.label}</span>
                        <span style={{ fontSize: "13px", color: c.color }}>{formatTime(c.mins)} · {pct}%</span>
                      </div>
                      <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: c.color, borderRadius: "3px", transition: "width 0.6s ease" }} />
                      </div>
                    </div>
                  );
                })}

                <div style={{ marginTop: "28px" }}>
                  <div style={{ fontSize: "11px", color: "#888", letterSpacing: "2px", marginBottom: "12px" }}>SHARE YOUR DAY</div>
                  <button onClick={generateShare} disabled={loading} style={{
                    width: "100%", padding: "13px", background: "rgba(0,212,170,0.1)",
                    border: "1px solid rgba(0,212,170,0.3)", borderRadius: "10px",
                    color: "#00D4AA", fontSize: "13px", fontWeight: "600", cursor: "pointer",
                    fontFamily: "inherit", letterSpacing: "1px",
                  }}>
                    {loading ? "GENERATING..." : "GENERATE SHARE CODE"}
                  </button>

                  {shareCode && (
                    <div style={{ marginTop: "12px" }}>
                      <div style={{
                        padding: "20px", background: "rgba(0,212,170,0.08)",
                        border: "1px solid rgba(0,212,170,0.3)", borderRadius: "10px",
                        textAlign: "center",
                      }}>
                        <div style={{ fontSize: "11px", color: "#888", letterSpacing: "2px", marginBottom: "8px" }}>YOUR CODE</div>
                        <div style={{ fontSize: "36px", fontWeight: "bold", color: "#00D4AA", letterSpacing: "8px" }}>
                          {shareCode}
                        </div>
                      </div>
                      <button onClick={() => copyToClipboard(shareCode)} style={{
                        marginTop: "8px", width: "100%", padding: "10px",
                        background: "#00D4AA", border: "none", borderRadius: "8px",
                        color: "#0A0A0F", fontSize: "13px", fontWeight: "700", cursor: "pointer",
                        fontFamily: "inherit",
                      }}>
                        {copyMsg || "📋 COPY CODE"}
                      </button>
                      <div style={{ fontSize: "11px", color: "#555", marginTop: "8px", textAlign: "center" }}>
                        Share this 6-letter code with your friend on WhatsApp
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* FRIEND VIEW */}
        {view === "friend" && (
          <div>
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "11px", color: "#888", letterSpacing: "2px", marginBottom: "8px" }}>ENTER FRIEND'S CODE</div>
              <input
                value={friendInput}
                onChange={(e) => setFriendInput(e.target.value.toUpperCase())}
                placeholder="e.g. X7K2PQ"
                maxLength={6}
                style={{
                  width: "100%", padding: "16px", background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px",
                  color: "#E8E8F0", fontFamily: "inherit", fontSize: "24px",
                  letterSpacing: "8px", outline: "none", boxSizing: "border-box",
                  textAlign: "center",
                }}
              />
              <button onClick={() => loadFriendCode(friendInput)} disabled={loading} style={{
                marginTop: "8px", width: "100%", padding: "13px",
                background: "#A29BFE", border: "none", borderRadius: "10px",
                color: "#0A0A0F", fontSize: "13px", fontWeight: "700", cursor: "pointer",
                fontFamily: "inherit", letterSpacing: "1px",
              }}>
                {loading ? "LOADING..." : "LOAD FRIEND'S DATA"}
              </button>
            </div>

            {friendData && (
              <div>
                <div style={{ fontSize: "11px", color: "#A29BFE", letterSpacing: "2px", marginBottom: "16px" }}>
                  FRIEND'S SUMMARY — {friendData.date}
                </div>
                <div style={{ padding: "16px", background: "rgba(162,155,254,0.08)", border: "1px solid rgba(162,155,254,0.2)", borderRadius: "12px", marginBottom: "20px" }}>
                  <div style={{ fontSize: "11px", color: "#888", marginBottom: "4px" }}>TOTAL PRODUCTIVE TIME</div>
                  <div style={{ fontSize: "28px", fontWeight: "bold", color: "#A29BFE" }}>{formatTime(friendData.total)}</div>
                  <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>{friendData.sessions?.length} sessions</div>
                </div>

                <div style={{ fontSize: "11px", color: "#888", letterSpacing: "2px", marginBottom: "12px" }}>THEIR SESSIONS</div>
                {friendData.sessions?.map((s, i) => {
                  const cat = CATEGORIES.find(c => c.id === s.category);
                  return (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "12px 14px", borderRadius: "8px", marginBottom: "8px",
                      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "18px" }}>{cat?.icon}</span>
                        <div>
                          <div style={{ fontSize: "13px", color: cat?.color }}>{cat?.label}</div>
                          {s.note && <div style={{ fontSize: "11px", color: "#666", marginTop: "2px" }}>{s.note}</div>}
                        </div>
                      </div>
                      <span style={{ fontSize: "13px", fontWeight: "600" }}>{formatTime(s.duration)}</span>
                    </div>
                  );
                })}

                <div style={{ marginTop: "24px", padding: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px" }}>
                  <div style={{ fontSize: "11px", color: "#888", letterSpacing: "2px", marginBottom: "12px" }}>YOU VS FRIEND</div>
                  <div style={{ display: "flex", justifyContent: "space-around" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "24px", fontWeight: "bold", color: "#00D4AA" }}>{formatTime(totalMins)}</div>
                      <div style={{ fontSize: "11px", color: "#888", marginTop: "4px" }}>YOU</div>
                    </div>
                    <div style={{ fontSize: "24px", color: "#555", alignSelf: "center" }}>vs</div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "24px", fontWeight: "bold", color: "#A29BFE" }}>{formatTime(friendData.total)}</div>
                      <div style={{ fontSize: "11px", color: "#888", marginTop: "4px" }}>FRIEND</div>
                    </div>
                  </div>
                  <div style={{ marginTop: "12px", textAlign: "center", fontSize: "12px", color: "#666" }}>
                    {totalMins > friendData.total
                      ? `🔥 You're ahead by ${formatTime(totalMins - friendData.total)}!`
                      : totalMins < friendData.total
                      ? `⚡ Friend is ahead by ${formatTime(friendData.total - totalMins)}. Keep going!`
                      : "🤝 You're tied!"}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0,212,170,0.15); }
          50% { box-shadow: 0 0 20px 4px rgba(0,212,170,0.1); }
        }
        input::placeholder, textarea::placeholder { color: #444; }
        button:hover { opacity: 0.85; }
      `}</style>
    </div>
  );
}
