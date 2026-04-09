import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  Play, RotateCcw, Settings2, BarChart3,
  Database, Archive, Trash2, Cpu, Terminal, Activity
} from "lucide-react";

import ProcessForm from "../components/ProcessForm";
import ProcessTable from "../components/ProcessTable";
import GanttChart from "../components/GanttChart";
import ComparisonTable from "../components/ComparisonTable";
import HistoryPanel from "../components/HistoryPanel";
import { loginSuccess, logout, setAuthChecked } from "../app/authSlice";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isCheckingAuth } = useSelector((state) => state.auth);

  // Per-user storage key helper 
  const sk = (key, email) => `sched_${email || "guest"}_${key}`;

  // --- 1. SIMULATION STATE ---
  // All state starts EMPTY — loaded after auth resolves and we know the user's email.
  const [algorithm, setAlgorithm] = useState("RR");
  const [priorityMode, setPriorityMode] = useState("lower");
  const [quantum, setQuantum] = useState(2);
  const [processes, setProcesses] = useState([]);
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);

  // --- 2. UI STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [formData, setFormData] = useState({ id: "", arrival: "", burst: "", priority: "" });
  const [selectedAlgos, setSelectedAlgos] = useState(["FCFS", "RR", "SJF"]);
  const [history, setHistory] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);

  // --- 3. HELPERS ---
  const addLog = useCallback((msg) => {
    const time = new Date().toLocaleTimeString([], {
      hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit"
    });
    setLogs((prev) => [`[${time}] ${msg}`, ...prev].slice(0, 20));
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:8081/api/history", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setHistory(Array.isArray(data) ? data : []);
      }
    } catch { addLog("Failed to fetch history"); }
  }, []);

  // --- 4. AUTH VERIFY + LOAD USER DATA ---
  // Single effect that verifies auth AND loads localStorage.
  // Only reads localStorage after we confirm the user's email from the server.
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const res = await fetch("http://localhost:8081/api/check", { credentials: "include" });

        if (res.ok) {
          const data = await res.json();
          const email = data.email;

          dispatch(loginSuccess({ username: data.username, email }));

          // Now we know who the user is — load THEIR data safely
          try {
            const p  = JSON.parse(localStorage.getItem(sk("processes", email)));
            const r  = JSON.parse(localStorage.getItem(sk("results", email)));
            const st = JSON.parse(localStorage.getItem(sk("stats", email)));
            const cd = JSON.parse(localStorage.getItem(sk("comparison", email)));
            const al = localStorage.getItem(sk("algo", email));
            const qu = parseInt(localStorage.getItem(sk("quantum", email)));
            const pm = localStorage.getItem(sk("prio_mode", email));

            if (p)  setProcesses(p);
            if (r)  setResults(r);
            if (st) setStats(st);
            if (cd) setComparisonData(cd);
            if (al) setAlgorithm(al);
            if (qu) setQuantum(qu);
            if (pm) setPriorityMode(pm);
          } catch { /* corrupted storage — start fresh */ }

          fetchHistory();
        } else {
          // Cookie expired — clear Redux and state
          dispatch(logout());
          setProcesses([]); setResults([]); setStats([]); setComparisonData(null);
        }
      } catch {
        addLog("Server offline — running in guest mode");
      } finally {
        dispatch(setAuthChecked());
      }
    };

    verifyAuth();
  }, [dispatch, fetchHistory, addLog]);

  // --- 5. SYNC TO LOCALSTORAGE (per-user, only when email is known) ---
  const userEmail = user?.email;

  useEffect(() => {
    if (!userEmail) return;
    localStorage.setItem(sk("processes", userEmail), JSON.stringify(processes));
  }, [processes, userEmail]);

  useEffect(() => {
    if (!userEmail) return;
    localStorage.setItem(sk("results", userEmail), JSON.stringify(results));
  }, [results, userEmail]);

  useEffect(() => {
    if (!userEmail) return;
    localStorage.setItem(sk("stats", userEmail), JSON.stringify(stats));
  }, [stats, userEmail]);

  useEffect(() => {
    if (!userEmail) return;
    localStorage.setItem(sk("comparison", userEmail), JSON.stringify(comparisonData));
  }, [comparisonData, userEmail]);

  useEffect(() => {
    if (!userEmail) return;
    localStorage.setItem(sk("algo", userEmail), algorithm);
  }, [algorithm, userEmail]);

  useEffect(() => {
    if (!userEmail) return;
    localStorage.setItem(sk("quantum", userEmail), quantum);
  }, [quantum, userEmail]);

  useEffect(() => {
    if (!userEmail) return;
    localStorage.setItem(sk("prio_mode", userEmail), priorityMode);
  }, [priorityMode, userEmail]);

  // --- 6. API HANDLERS ---
  const startSimulation = async () => {
    if (processes.length === 0) return addLog("No processes defined");
    setIsSimulating(true);
    addLog(`Running ${algorithm}...`);
    try {
      const res = await fetch("http://localhost:8081/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          algorithm,
          quantum: parseInt(quantum),
          priorityMode,
          processes: processes.map((p) => ({
            ...p,
            arrival: parseInt(p.arrival),
            burst: parseInt(p.burst),
            priority: parseInt(p.priority) || 0,
          })),
        }),
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data.timeline);
        setStats(data.processes);
        addLog("Simulation complete");
      } else {
        addLog("Simulation failed — check server");
      }
    } catch { addLog("Cannot reach server"); }
    finally { setIsSimulating(false); }
  };

  const handleCompare = async () => {
    if (processes.length === 0) return addLog("No processes to benchmark");
    addLog("Running algorithm comparison...");
    try {
      const res = await fetch("http://localhost:8081/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          processes, algorithms: selectedAlgos,
          quantum: parseInt(quantum), priorityMode,
        }),
        credentials: "include",
      });
      if (res.ok) {
        setComparisonData(await res.json());
        addLog("Benchmark complete");
      }
    } catch { addLog("Benchmark failed"); }
  };

  const saveToHistory = async () => {
    if (results.length === 0) return;
    addLog("Archiving session...");
    try {
      const res = await fetch("http://localhost:8081/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          algorithm, processes, timeline: results, stats, priorityMode,
          comparisonData: comparisonData || null,
          avgWait: stats.length > 0
            ? (stats.reduce((acc, p) => acc + p.wait, 0) / stats.length).toFixed(2)
            : 0,
        }),
        credentials: "include",
      });
      if (res.ok) { addLog("Session archived successfully"); fetchHistory(); }
    } catch { addLog("Archive failed"); }
  };

  const clearAllHistory = async () => {
    if (!window.confirm("Clear all archived simulations?")) return;
    try {
      const res = await fetch("http://localhost:8081/api/history", {
        method: "DELETE", credentials: "include",
      });
      if (res.ok) { addLog("History cleared"); fetchHistory(); }
    } catch { addLog("Clear failed"); }
  };

  const restoreSession = (session) => {
    const data = session.simulation_results;
    if (!data?.algorithm) return addLog("Invalid session — cannot restore");
    setAlgorithm(data.algorithm);
    setProcesses(data.processes || []);
    setResults(data.timeline || []);
    setStats(data.stats || []);
    setPriorityMode(data.priorityMode || "lower");
    setComparisonData(data.comparisonData || null);
    addLog(`Session restored — ${data.algorithm}`);
  };

  const handleReset = () => {
    if (!window.confirm("Reset workspace? This clears your saved data.")) return;
    setProcesses([]); setResults([]); setStats([]); setComparisonData(null);
  
    if (userEmail) {
      ["processes", "results", "stats", "comparison", "algo", "quantum", "prio_mode"]
        .forEach((k) => localStorage.removeItem(sk(k, userEmail)));
    }
    addLog("Workspace reset");
  };

  const handleAddProcess = (e) => {
    e.preventDefault();
    const p = {
      id: formData.id,
      arrival: parseInt(formData.arrival) || 0,
      burst: parseInt(formData.burst) || 1,
      priority: parseInt(formData.priority) || 1,
    };
    if (isEditing) {
      setProcesses((prev) => prev.map((x) => (x.id === isEditing ? p : x)));
      setIsEditing(null);
    } else {
      setProcesses((prev) => [...prev, p]);
    }
    setFormData({ id: "", arrival: "", burst: "", priority: "" });
    setIsModalOpen(false);
    addLog(`Process ${p.id} ${isEditing ? "updated" : "added"}`);
  };

  const availableAlgos = [
    { id: "FCFS" }, { id: "RR" }, { id: "SJF" },
    { id: "SRTF" }, { id: "P-NP" }, { id: "P-P" }, { id: "HRRN" },
  ];

  // --- 7. DERIVED METRICS ---
  const MetricCard = ({ label, value, color }) => (
    <div className="p-5 bg-zinc-900/40 border border-zinc-800 rounded-[1.5rem]">
      <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">{label}</p>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
    </div>
  );

  const avgWait = stats.length > 0
    ? (stats.reduce((a, b) => a + b.wait, 0) / stats.length).toFixed(2) : 0;
  const avgTat = stats.length > 0
    ? (stats.reduce((a, b) => a + b.tat, 0) / stats.length).toFixed(2) : 0;
  const idleTime = results
    .filter((b) => b.id === "IDLE")
    .reduce((a, b) => a + (b.end - b.start), 0);
  const totalTime = results.length > 0 ? results[results.length - 1].end : 1;
  const utilization = (((totalTime - idleTime) / totalTime) * 100).toFixed(1);

  // --- 8. AUTH GATE ---
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <Cpu size={32} className="text-blue-500 animate-pulse mx-auto" />
          <p className="text-zinc-600 font-black uppercase tracking-[0.4em] text-xs">
            Initializing_Kernel...
          </p>
        </div>
      </div>
    );
  }

  // --- 9. RENDER ---
  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-12 px-6">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* HEADER */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-zinc-900 pb-10">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-blue-500">
              <Cpu size={18} className="animate-pulse" />
              <span className="text-[10px] font-mono font-bold tracking-[0.5em] uppercase opacity-70">
                Scheduler_Protocol_v2.0
              </span>
            </div>
            <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none">
              Welcome,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                {user?.username || "Guest_Dev"}
              </span>
            </h1>
          </div>

          <div className="flex flex-wrap gap-4">
            {isAuthenticated && (
              <>
                <button
                  onClick={saveToHistory}
                  disabled={results.length === 0}
                  className="px-6 py-4 rounded-2xl font-black flex items-center gap-3 border transition-all disabled:opacity-20 bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white"
                >
                  <Database size={16} /> Archive_Run
                </button>
                {history.length > 0 && (
                  <button
                    onClick={clearAllHistory}
                    className="px-4 py-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-bold hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </>
            )}
            <button
              onClick={handleReset}
              className="px-6 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl font-bold text-zinc-400 hover:bg-zinc-800 transition-all flex items-center gap-3"
            >
              <RotateCcw size={16} /> Reset
            </button>
            <button
              onClick={startSimulation}
              disabled={isSimulating}
              className="px-10 py-4 bg-white text-black rounded-2xl font-black hover:bg-blue-500 hover:text-white transition-all active:scale-95 shadow-2xl flex items-center gap-3"
            >
              {isSimulating ? <Activity className="animate-spin" size={16} /> : <Play size={16} />}
              Execute_Kernel
            </button>
          </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-10">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-4 space-y-8">

            <section className="p-8 rounded-[2.5rem] bg-zinc-900/20 border border-zinc-800/50 space-y-8">
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
                <Settings2 size={14} className="text-blue-500" /> Config_Stack
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">
                    Scheduling_Logic
                  </label>
                  <select
                    value={algorithm}
                    onChange={(e) => setAlgorithm(e.target.value)}
                    className="w-full bg-black border border-zinc-800 p-5 rounded-2xl text-sm font-bold focus:border-blue-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="FCFS">First Come First Served</option>
                    <option value="RR">Round Robin (Quantum)</option>
                    <option value="SJF">Shortest Job First</option>
                    <option value="SRTF">Shortest Remaining Time</option>
                    <option value="P-NP">Priority (Non-Preemptive)</option>
                    <option value="P-P">Priority (Preemptive)</option>
                    <option value="HRRN">Highest Response Ratio</option>
                  </select>
                </div>

                {algorithm === "RR" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="p-6 bg-black/40 rounded-2xl border border-zinc-800/50 space-y-4"
                  >
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                      <span className="text-zinc-500">Quantum_Burst</span>
                      <span className="text-blue-500 text-lg font-black">{quantum}ms</span>
                    </div>
                    <input
                      type="range" min="1" max="20" value={quantum}
                      onChange={(e) => setQuantum(e.target.value)}
                      className="w-full accent-blue-500 h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer"
                    />
                  </motion.div>
                )}
              </div>
            </section>

            <HistoryPanel
              history={history}
              onRefresh={fetchHistory}
              onRestore={restoreSession}
            />

            <section className="p-6 rounded-[2rem] bg-zinc-900/30 border border-zinc-800 space-y-4">
              <div className="flex items-center gap-2 text-zinc-500 font-black uppercase text-[10px] tracking-widest">
                <BarChart3 size={14} className="text-blue-500" /> Benchmarking
              </div>
              <div className="flex flex-wrap gap-2">
                {availableAlgos.map((a) => (
                  <button
                    key={a.id}
                    onClick={() =>
                      setSelectedAlgos((prev) =>
                        prev.includes(a.id)
                          ? prev.filter((x) => x !== a.id)
                          : [...prev, a.id]
                      )
                    }
                    className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase transition-all border ${
                      selectedAlgos.includes(a.id)
                        ? "bg-blue-500 border-blue-400 text-white"
                        : "bg-black border-zinc-800 text-zinc-600"
                    }`}
                  >
                    {a.id}
                  </button>
                ))}
              </div>
              <button
                onClick={handleCompare}
                className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Execute Benchmark
              </button>
            </section>

            <ProcessTable
              processes={processes}
              onDelete={(id) => setProcesses((prev) => prev.filter((p) => p.id !== id))}
              onEdit={(p) => {
                setFormData({
                  id: p.id,
                  arrival: p.arrival.toString(),
                  burst: p.burst.toString(),
                  priority: p.priority.toString(),
                });
                setIsEditing(p.id);
                setIsModalOpen(true);
              }}
              onOpenModal={() => {
                setIsEditing(null);
                setFormData({ id: "", arrival: "", burst: "", priority: "" });
                setIsModalOpen(true);
              }}
              priorityMode={priorityMode}
            />
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-8 space-y-10">
            <AnimatePresence mode="wait">
              {results.length > 0 ? (
                <motion.div
                  key="viz"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-10"
                >
                  <div className="p-1 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-[3rem] shadow-2xl">
                    <div className="bg-black rounded-[2.9rem] overflow-hidden relative">
                      <div className="absolute top-6 left-8 flex items-center gap-3 z-10">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">
                          Hardware_Timeline_Analysis
                        </span>
                      </div>
                      <GanttChart data={results} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <MetricCard label="Avg. Wait Time"  value={`${avgWait}ms`}    color="text-blue-400" />
                    <MetricCard label="Avg. Turnaround" value={`${avgTat}ms`}     color="text-purple-400" />
                    <MetricCard label="CPU Idle Time"   value={`${idleTime}ms`}   color="text-red-400" />
                    <MetricCard label="Utilization"     value={`${utilization}%`} color="text-emerald-400" />
                  </div>

                  {comparisonData && (
                    <ComparisonTable data={comparisonData} priorityMode={priorityMode} />
                  )}

                  <div className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                      <Terminal size={16} className="text-blue-500" />
                      <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">
                        Execution_Diagnostic_Report
                      </h3>
                    </div>
                    <div className="grid gap-4">
                      {stats.map((s, idx) => {
                        const efficiency = s.tat > 0
                          ? ((s.burst / s.tat) * 100).toFixed(1) : 0;
                        return (
                          <motion.div
                            key={s.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0, transition: { delay: idx * 0.05 } }}
                            className="group bg-zinc-900/30 border border-zinc-800/80 hover:border-blue-500/40 rounded-[2rem] p-6 transition-all"
                          >
                            <div className="grid grid-cols-12 gap-6 items-center">
                              <div className="col-span-2 flex flex-col items-center border-r border-zinc-800">
                                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">ID</span>
                                <span className="text-2xl font-black text-white italic group-hover:text-blue-400 transition-colors">
                                  #{s.id}
                                </span>
                              </div>
                              <div className="col-span-7 grid grid-cols-4 gap-2 text-center">
                                {[
                                  { label: "Arrival",    value: `${s.arrival}ms`, color: "text-zinc-200" },
                                  { label: "Burst",      value: `${s.burst}ms`,   color: "text-zinc-200" },
                                  { label: "Wait",       value: `${s.wait}ms`,    color: "text-red-400" },
                                  { label: "Turnaround", value: `${s.tat}ms`,     color: "text-emerald-400" },
                                ].map(({ label, value, color }) => (
                                  <div key={label} className="flex flex-col">
                                    <span className="text-[8px] font-bold text-zinc-500 uppercase">{label}</span>
                                    <span className={`font-mono font-bold ${color}`}>{value}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="col-span-3 space-y-2">
                                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                                  <span className="text-zinc-600">Efficiency</span>
                                  <span className="text-emerald-400 italic">{efficiency}%</span>
                                </div>
                                <div className="w-full bg-black h-1.5 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(efficiency, 100)}%` }}
                                    className="h-full bg-emerald-500 rounded-full"
                                  />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div
                  key="empty"
                  className="h-[700px] rounded-[4rem] border border-zinc-900 border-dashed flex flex-col items-center justify-center space-y-6 bg-zinc-950/20"
                >
                  <div className="p-8 rounded-full bg-zinc-900/30 border border-zinc-800">
                    <Archive className="text-zinc-800 animate-pulse" size={56} />
                  </div>
                  <div className="text-center space-y-3">
                    <p className="text-zinc-500 font-black uppercase tracking-[0.5em] text-sm italic">
                      System_Idle_State
                    </p>
                    <p className="text-[11px] text-zinc-700 font-mono tracking-wider">
                      Awaiting process stream for hardware simulation.
                    </p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* FLOATING ACTIVITY LOG */}
      <div className="fixed bottom-8 right-8 w-80 z-50">
        <div className="bg-zinc-900/90 backdrop-blur-2xl border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="px-5 py-3 border-b border-zinc-800 bg-black/40 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Terminal size={12} className="text-blue-500" />
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Activity_Log</span>
            </div>
            <div className="flex gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
          <div className="p-5 h-36 overflow-y-auto font-mono text-[10px] space-y-1.5">
            {logs.map((log, i) => (
              <div key={i} className={`flex gap-2 ${i === 0 ? "text-blue-400" : "text-zinc-600"}`}>
                <span className="opacity-50 shrink-0">{log.split(" ")[0]}</span>
                <span className="font-bold">{log.split(" ").slice(1).join(" ")}</span>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-zinc-800 italic">No activity yet...</div>
            )}
          </div>
        </div>
      </div>

      <ProcessForm
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setIsEditing(null); }}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleAddProcess}
        algorithm={algorithm}
        isEditing={isEditing}
        priorityMode={priorityMode}
        setPriorityMode={setPriorityMode}
      />
    </div>
  );
};

export default Dashboard;

