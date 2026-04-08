import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "../app/authSlice";
import {
  Activity, Play, RotateCcw, Settings2, BarChart3, Database, Archive, Trash2
} from "lucide-react";
import ProcessForm from "../components/ProcessForm";
import ProcessTable from "../components/ProcessTable";
import GanttChart from "../components/GanttChart";
import ComparisonTable from "../components/ComparisonTable";
import HistoryPanel from "../components/HistoryPanel";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // --- LOCAL STATE ---
  const [algorithm, setAlgorithm] = useState("RR");
  const [priorityMode, setPriorityMode] = useState("lower");
  const [quantum, setQuantum] = useState(2);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processes, setProcesses] = useState([]);
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState([]);
  const [formData, setFormData] = useState({ id: "", arrival: "", burst: "", priority: "" });
  const [logs, setLogs] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [selectedAlgos, setSelectedAlgos] = useState(["FCFS", "RR"]);
  const [isEditing, setIsEditing] = useState(null);
  const [history, setHistory] = useState([]);

  const addLog = useCallback((message) => {
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLogs((prev) => [`[${time}] ${message}`, ...prev].slice(0, 50));
  }, []);

  // --- 1. DATA FETCHING ---
  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:8081/api/history", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setHistory(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      addLog("History: Local database offline.");
    }
  }, [addLog]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:8081/api/check", { credentials: "include" });
        if (response.ok) {
          const data = await response.json();
          dispatch(loginSuccess({ username: data.username, email: data.email }));
        }
      } catch (err) {
        addLog("Auth: Operating in Guest mode.");
      }
    };
    checkAuth();
    fetchHistory();
  }, [dispatch, fetchHistory, addLog]);

  // --- 2. ARCHIVE & RESTORE ---
const saveToHistory = async () => {
  if (results.length === 0) return;
  addLog("Archiving simulation and benchmarks...");

  const payload = JSON.parse(JSON.stringify({
    algorithm,
    processes,
    timeline: results,
    stats, 
    priorityMode,
    // 🟢 ADD THIS: Save the comparison results if they exist
    comparisonData: comparisonData || null, 
    avgWait: stats.length > 0 ? (stats.reduce((acc, p) => acc + p.wait, 0) / stats.length).toFixed(2) : 0,
  }));

  try {
    const res = await fetch("http://localhost:8081/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });
    if (res.ok) {
      addLog("Archive Success: Full session stored.");
      fetchHistory();
    }
  } catch (err) { addLog("Archive Error: Could not reach MongoDB."); }
};

  const clearAllHistory = async () => {
    if (!window.confirm("Clear all archived simulations?")) return;
    try {
      const res = await fetch("http://localhost:8081/api/history", { method: "DELETE", credentials: "include" });
      if (res.ok) {
        addLog("Archive Purged.");
        fetchHistory();
      }
    } catch (err) { addLog("Purge Failed."); }
  };

 const restoreSession = (session) => {
  const data = session.simulation_results;
  if (!data?.algorithm) return addLog("Restore Error.");

  setAlgorithm(data.algorithm);
  setProcesses(data.processes || []);
  setResults(data.timeline || []);
  setStats(data.stats || []);
  setPriorityMode(data.priorityMode || "lower");

  // 🟢 ADD THIS: Restore the benchmark table if it was saved
  setComparisonData(data.comparisonData || null);

  addLog(`Kernel Restored: ${data.algorithm} session loaded.`);
};

  // --- 3. LOGIC HANDLERS ---
  const startSimulation = async () => {
    if (processes.length === 0) return;
    addLog(`Executing ${algorithm}...`);
    try {
      const response = await fetch("http://localhost:8081/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          algorithm,
          quantum: parseInt(quantum),
          priorityMode,
          processes: processes.map((p) => ({ ...p, arrival: parseInt(p.arrival), burst: parseInt(p.burst), priority: parseInt(p.priority) || 0 })),
        }),
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setResults(data.timeline);
        setStats(data.processes);
        addLog("Simulation Success.");
      }
    } catch (error) { addLog("Kernel Connection Failed."); }
  };

  const handleCompare = async () => {
    try {
      const response = await fetch("http://localhost:8081/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ processes, algorithms: selectedAlgos, quantum: parseInt(quantum), priorityMode }),
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setComparisonData(data);
        addLog("Benchmarks updated.");
      }
    } catch (error) { addLog("Benchmark failed."); }
  };

  const handleEditClick = (p) => {
    setFormData({ id: p.id, arrival: p.arrival.toString(), burst: p.burst.toString(), priority: p.priority.toString() });
    setIsEditing(p.id);
    setIsModalOpen(true);
  };

  const handleAddProcess = (e) => {
    e.preventDefault();
    const newProcess = { id: formData.id, arrival: parseInt(formData.arrival) || 0, burst: parseInt(formData.burst) || 1, priority: parseInt(formData.priority) || 1 };
    if (isEditing) {
      setProcesses(processes.map((p) => (p.id === isEditing ? newProcess : p)));
      setIsEditing(null);
    } else {
      setProcesses([...processes, newProcess]);
    }
    setFormData({ id: "", arrival: "", burst: "", priority: "" });
    setIsModalOpen(false);
  };

  const availableAlgos = [
    { id: "FCFS", label: "FCFS" }, { id: "RR", label: "Round Robin" },
    { id: "SJF", label: "SJF (Non-P)" }, { id: "SRTF", label: "SRTF (Preemptive)" },
    { id: "P-NP", label: "Priority (Non-P)" }, { id: "P-P", label: "Priority (Preemptive)" },
    { id: "HRRN", label: "HRRN" },
  ];

  // --- 4. SUB-COMPONENTS ---
  const StatsSummary = ({ stats, timeline }) => {
    if (!stats?.length || !timeline?.length) return null;
    const avgWait = (stats.reduce((acc, p) => acc + (p.wait || 0), 0) / stats.length).toFixed(2);
    const avgTat = (stats.reduce((acc, p) => acc + (p.tat || 0), 0) / stats.length).toFixed(2);
    const idleTime = timeline.filter((block) => block.id === "IDLE").reduce((acc, block) => acc + (block.end - block.start), 0);
    const totalTime = timeline[timeline.length - 1].end;
    const utilization = totalTime > 0 ? (((totalTime - idleTime) / totalTime) * 100).toFixed(1) : 0;

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
        {[
          { label: "Avg. Waiting", value: `${avgWait}ms`, color: "text-blue-500" },
          { label: "Avg. Turnaround", value: `${avgTat}ms`, color: "text-purple-500" },
          { label: "CPU Idle Time", value: `${idleTime}ms`, color: "text-red-500" },
          { label: "CPU Utilization", value: `${utilization}%`, color: "text-emerald-500" },
        ].map((s, i) => (
          <div key={i} className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl shadow-sm">
            <p className="text-[8px] font-black uppercase text-zinc-500 tracking-widest mb-1">{s.label}</p>
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </motion.div>
    );
  };

  const currentUsername = user?.username || "Developer";

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12 px-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-zinc-900 pb-8">
          <div className="space-y-1">
            <h1 className="text-5xl font-black italic uppercase leading-none">
              Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-emerald-400">{currentUsername}</span>
            </h1>
          </div>

          <div className="flex gap-4">
            {isAuthenticated && (
              <>
                {results.length > 0 && (
                  <button onClick={saveToHistory} className="px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-500 hover:text-white transition-all">
                    <Database size={16} /> Archive_Run
                  </button>
                )}
                {history.length > 0 && (
                  <button onClick={clearAllHistory} className="px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all">
                    <Trash2 size={16} />
                  </button>
                )}
              </>
            )}
            <button onClick={() => { setProcesses([]); setResults([]); setStats([]); setComparisonData(null); }} className="px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-xl font-bold text-zinc-400">
              <RotateCcw size={16} /> Reset
            </button>
            <button onClick={startSimulation} className="px-8 py-3 bg-white text-black rounded-xl font-black hover:bg-blue-500 hover:text-white transition-all active:scale-95 shadow-xl">
              <Play size={16} /> Run Simulation
            </button>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <section className="p-6 rounded-[2rem] bg-zinc-900/30 border border-zinc-800 space-y-6">
              <div className="flex items-center gap-2 text-zinc-500 font-black uppercase text-[10px] tracking-widest"><Settings2 size={14} /> Scheduler_Config</div>
              <div className="space-y-4">
                <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-white font-bold outline-none cursor-pointer">
                  <option value="FCFS">First Come First Served</option>
                  <option value="RR">Round Robin</option>
                  <option value="HRRN">Highest Response Ratio Next</option>
                  <option value="SJF">SJF (Non-Preemptive)</option>
                  <option value="SRTF">SRTF (Preemptive)</option>
                  <option value="P-NP">Priority (Non-Preemptive)</option>
                  <option value="P-P">Priority (Preemptive)</option>
                </select>
                {algorithm === "RR" && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase text-zinc-500"><span>Quantum</span><span className="text-blue-500">{quantum}ms</span></div>
                    <input type="range" min="1" max="15" value={quantum} onChange={(e) => setQuantum(e.target.value)} className="w-full accent-blue-500 h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer" />
                  </div>
                )}
              </div>
            </section>

            <HistoryPanel history={history} onRestore={restoreSession} onRefresh={fetchHistory} />

            <section className="p-6 rounded-[2rem] bg-zinc-900/30 border border-zinc-800 space-y-4">
              <div className="flex items-center gap-2 text-zinc-500 font-black uppercase text-[10px] tracking-widest"><BarChart3 size={14} /> Benchmarking</div>
              <div className="flex flex-wrap gap-2">
                {availableAlgos.map((a) => (
                  <button key={a.id} onClick={() => selectedAlgos.includes(a.id) ? setSelectedAlgos(selectedAlgos.filter((x) => x !== a.id)) : setSelectedAlgos([...selectedAlgos, a.id])} className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase transition-all border ${selectedAlgos.includes(a.id) ? "bg-blue-500 border-blue-400 text-white" : "bg-black border-zinc-800 text-zinc-600"}`}>{a.id}</button>
                ))}
              </div>
              <button onClick={handleCompare} className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Execute Benchmark</button>
            </section>

            <ProcessTable processes={processes} onDelete={(id) => setProcesses(processes.filter((p) => p.id !== id))} onEdit={handleEditClick} onOpenModal={() => { setIsEditing(null); setFormData({ id: "", arrival: "", burst: "", priority: "" }); setIsModalOpen(true); }} priorityMode={priorityMode} />
          </div>

          <div className="lg:col-span-2 space-y-8">
            <AnimatePresence mode="wait">
              {results.length > 0 ? (
                <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                  <div className="rounded-[2.5rem] bg-zinc-900/20 border border-zinc-800 overflow-hidden shadow-2xl">
                    <GanttChart data={results} />
                  </div>
                  <StatsSummary stats={stats} timeline={results} />
                  {comparisonData && <ComparisonTable data={comparisonData} priorityMode={priorityMode} />}
                  
                  {/* Detailed Execution Report Table restored here */}
                  <div className="p-8 rounded-[2.5rem] bg-zinc-900/20 border border-zinc-800 shadow-xl">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic mb-6">Detailed_Execution_Report</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-separate border-spacing-y-2">
                        <thead>
                          <tr className="text-zinc-600 text-[9px] font-black uppercase tracking-widest">
                            <th className="px-6 py-2">Process_ID</th>
                            <th className="px-6 py-2">Completion</th>
                            <th className="px-6 py-2">Wait_Time</th>
                            <th className="px-6 py-2 text-right">Turnaround</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.map((s) => (
                            <tr key={s.id} className="group bg-zinc-900/40 hover:bg-blue-500/5 border border-zinc-800 transition-all">
                              <td className="px-6 py-4 rounded-l-2xl border-l border-y border-zinc-800">
                                <span className="text-sm font-black text-blue-500 italic">#{s.id}</span>
                              </td>
                              <td className="px-6 py-4 border-y border-zinc-800 text-sm font-bold text-zinc-300">{s.completion}ms</td>
                              <td className="px-6 py-4 border-y border-zinc-800 text-sm font-black text-red-500/80">{s.wait}ms</td>
                              <td className="px-6 py-4 rounded-r-2xl border-r border-y border-zinc-800 text-right text-sm font-black text-emerald-500/80">{s.tat}ms</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div key="empty" className="h-full min-h-[600px] rounded-[3rem] border border-zinc-800 border-dashed flex flex-col items-center justify-center space-y-4 bg-zinc-900/5">
                  <Archive className="text-zinc-800 animate-pulse" size={48} />
                  <p className="text-zinc-600 font-black uppercase tracking-[0.3em] text-[10px] italic">Awaiting_Kernel_Simulation</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <ProcessForm isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setIsEditing(null); }} formData={formData} setFormData={setFormData} onSubmit={handleAddProcess} algorithm={algorithm} isEditing={isEditing} priorityMode={priorityMode} setPriorityMode={setPriorityMode} />
    </div>
  );
};

export default Dashboard;
