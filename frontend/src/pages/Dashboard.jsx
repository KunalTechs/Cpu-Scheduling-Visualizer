import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Play,
  RotateCcw,
  Settings2,
  BarChart3,
  User,
} from "lucide-react";
import ProcessForm from "../components/ProcessForm";
import ProcessTable from "../components/ProcessTable";
import GanttChart from "../components/GanttChart";
import ComparisonTable from "../components/ComparisonTable";

const Dashboard = () => {
  // --- USER STATE ---
  const [username, setUsername] = useState("Developer");

  // --- EXISTING STATES ---
  const [algorithm, setAlgorithm] = useState("RR");
  const [priorityMode, setPriorityMode] = useState("lower");
  const [quantum, setQuantum] = useState(2);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processes, setProcesses] = useState([]);
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState([]);
  const [formData, setFormData] = useState({
    id: "",
    arrival: "",
    burst: "",
    priority: "",
  });

  // --- LOGS & COMPARISON ---
  const [logs, setLogs] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [selectedAlgos, setSelectedAlgos] = useState(["FCFS", "RR"]);
  const [isEditing, setIsEditing] = useState(null);

  // --- EFFECT: FETCH USERNAME ---
  useEffect(() => {
    const getSession = async () => {
      try {
        const response = await fetch("http://localhost:8081/api/check", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          // Assuming C++ returns { "username": "YourName" }
          if (data.username) setUsername(data.username);
        }
      } catch (err) {
        addLog("Auth: Operating in Local/Guest mode.");
      }
    };
    getSession();
  }, []);

  const availableAlgos = [
    { id: "FCFS", label: "FCFS" },
    { id: "RR", label: "Round Robin" },
    { id: "SJF", label: "SJF (Non-P)" },
    { id: "SRTF", label: "SRTF (Preemptive)" },
    { id: "P-NP", label: "Priority (Non-P)" },
    { id: "P-P", label: "Priority (Preemptive)" },
    { id: "HRRN", label: "HRRN" },
  ];

  const addLog = (message) => {
    const time = new Date().toLocaleTimeString([], {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setLogs((prev) => [`[${time}] ${message}`, ...prev].slice(0, 50));
  };

  // --- LOGIC: START SIMULATION ---
  const startSimulation = async () => {
    if (processes.length === 0) return;
    addLog(`Initiating ${algorithm} execution...`);

    try {
      const payload = {
        algorithm,
        quantum: parseInt(quantum),
        priorityMode,
        processes: processes.map((p) => ({
          id: p.id,
          arrival: parseInt(p.arrival),
          burst: parseInt(p.burst),
          priority: parseInt(p.priority) || 0,
        })),
      };

      const response = await fetch("http://localhost:8081/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        addLog(`Kernel Error: ${errorText}`);
        return;
      }

      const data = await response.json();
      if (data.status === "success") {
        setResults(data.timeline);
        setStats(data.processes);
        addLog(`Simulation successful. Dispatching timeline.`);
      }
    } catch (error) {
      addLog("Critical: Lost connection to C++ Kernel.");
    }
  };

  // --- LOGIC: COMPARE ALGORITHMS ---
  const handleCompare = async () => {
    if (processes.length === 0) return alert("Please add processes first");
    addLog(`Benchmarking ${selectedAlgos.length} algorithms...`);

    try {
      const response = await fetch("http://localhost:8081/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          processes,
          algorithms: selectedAlgos,
          quantum: parseInt(quantum),
          priorityMode: priorityMode,
        }),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setComparisonData(data);
        addLog("Comparison matrix generated.");
      }
    } catch (error) {
      addLog("Kernel Error: Benchmark failed.");
    }
  };

  const handleEditClick = (process) => {
    setFormData({
      id: process.id,
      arrival: process.arrival.toString(),
      burst: process.burst.toString(),
      priority: process.priority.toString(),
    });
    setIsEditing(process.id);
    setIsModalOpen(true);
  };

  const handleAddProcess = (e) => {
    e.preventDefault();
    const arrival = parseInt(formData.arrival) || 0;
    const burst = parseInt(formData.burst) || 1;
    if (arrival < 0 || burst <= 0) return alert("Invalid Input");

    const newProcess = {
      id: formData.id,
      arrival,
      burst,
      priority: parseInt(formData.priority) || 1,
    };

    if (isEditing) {
      setProcesses(processes.map((p) => (p.id === isEditing ? newProcess : p)));
      addLog(`Kernel Interrupt: Process ${isEditing} modified.`);
      setIsEditing(null);
    } else {
      setProcesses([...processes, newProcess]);
      addLog(`Process ${newProcess.id} queued.`);
    }

    setFormData({ id: "", arrival: "", burst: "", priority: "" });
    setIsModalOpen(false);
  };

  // --- UI: STATS SUMMARY ---
  const StatsSummary = ({ stats, timeline }) => {
    if (!stats || stats.length === 0 || !timeline || timeline.length === 0)
      return null;

    const avgWait = (
      stats.reduce((acc, p) => acc + p.wait, 0) / stats.length
    ).toFixed(2);
    const avgTat = (
      stats.reduce((acc, p) => acc + p.tat, 0) / stats.length
    ).toFixed(2);

    const idleTime = timeline
      .filter((block) => block.id === "IDLE")
      .reduce((acc, block) => acc + (block.end - block.start), 0);

    const totalTime = timeline[timeline.length - 1].end;
    const utilization =
      totalTime > 0
        ? (((totalTime - idleTime) / totalTime) * 100).toFixed(1)
        : 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full"
      >
        {[
          { label: "Avg. Waiting", value: `${avgWait}ms`, color: "text-blue-500" },
          { label: "Avg. Turnaround", value: `${avgTat}ms`, color: "text-purple-500" },
          { label: "CPU Idle Time", value: `${idleTime}ms`, color: "text-red-500" },
          { label: "CPU Utilization", value: `${utilization}%`, color: "text-emerald-500" },
        ].map((s, i) => (
          <div key={i} className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
            <p className="text-[8px] font-black uppercase text-zinc-500 tracking-widest mb-1">{s.label}</p>
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* --- DYNAMIC HEADER --- */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-zinc-900 pb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">
                Kernel_Status: <span className="text-zinc-300">Ready</span>
              </span>
            </div>
            <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
              Welcome,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-emerald-500 to-emerald-400">
                {username}
              </span>
            </h1>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setProcesses([]);
                setResults([]);
                setStats([]);
                setLogs([]);
                setComparisonData(null);
              }}
              className="px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-zinc-800 transition-all text-zinc-400"
            >
              <RotateCcw size={16} /> Reset
            </button>
            <button
              onClick={startSimulation}
              className="px-8 py-3 bg-white text-black rounded-xl font-black flex items-center gap-2 hover:bg-blue-500 hover:text-white transition-all active:scale-95 shadow-xl shadow-white/5"
            >
              <Play size={16} /> Run Simulation
            </button>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* SIDEBAR */}
          <div className="lg:col-span-1 space-y-6">
            <section className="p-6 rounded-[2rem] bg-zinc-900/30 border border-zinc-800 space-y-6">
              <div className="flex items-center gap-2 text-zinc-500 font-black uppercase text-[10px] tracking-[0.2em]">
                <Settings2 size={14} /> Scheduler_Config
              </div>
              <div className="space-y-4">
                <select
                  value={algorithm}
                  onChange={(e) => setAlgorithm(e.target.value)}
                  className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-white font-bold outline-none appearance-none cursor-pointer"
                >
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
                    <div className="flex justify-between text-[10px] font-black uppercase text-zinc-500">
                      <span>Quantum</span>
                      <span className="text-blue-500">{quantum}ms</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="15"
                      value={quantum}
                      onChange={(e) => setQuantum(e.target.value)}
                      className="w-full accent-blue-500 h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </section>

            <section className="p-6 rounded-[2rem] bg-zinc-900/30 border border-zinc-800 space-y-4">
              <div className="flex items-center gap-2 text-zinc-500 font-black uppercase text-[10px] tracking-[0.2em]">
                <BarChart3 size={14} /> Multi_Algo_Benchmark
              </div>
              <div className="flex flex-wrap gap-2">
                {availableAlgos.map((a) => (
                  <button
                    key={a.id}
                    onClick={() =>
                      selectedAlgos.includes(a.id)
                        ? setSelectedAlgos(selectedAlgos.filter((x) => x !== a.id))
                        : setSelectedAlgos([...selectedAlgos, a.id])
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
              onDelete={(id) => {
                setProcesses(processes.filter((p) => p.id !== id));
                addLog(`Process ${id} purged.`);
              }}
              onEdit={handleEditClick}
              onOpenModal={() => {
                setIsEditing(null);
                setFormData({ id: "", arrival: "", burst: "", priority: "" });
                setIsModalOpen(true);
              }}
              priorityMode={priorityMode}
            />
          </div>

          {/* MAIN PANEL */}
          <div className="lg:col-span-2 space-y-8">
            <AnimatePresence mode="wait">
              {results.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  <div className="rounded-[2.5rem] bg-zinc-900/20 border border-zinc-800 overflow-hidden shadow-2xl">
                    <GanttChart data={results} />
                  </div>
                  <StatsSummary stats={stats} timeline={results} />
                  {comparisonData && <ComparisonTable data={comparisonData} />}
                  <div className="p-8 rounded-[2.5rem] bg-zinc-900/20 border border-zinc-800 shadow-xl">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] italic mb-6 px-2">
                      Detailed_Execution_Report
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-separate border-spacing-y-2">
                        <thead>
                          <tr className="text-zinc-600 text-[9px] font-black uppercase tracking-widest px-4">
                            <th className="px-6 py-2">Process_ID</th>
                            <th className="px-6 py-2">Completion</th>
                            <th className="px-6 py-2">Wait_Time</th>
                            <th className="px-6 py-2 text-right">Turnaround</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.map((s) => (
                            <tr key={s.id} className="group bg-zinc-900/40 hover:bg-blue-500/5 border border-zinc-800 transition-all">
                              <td className="px-6 py-4 rounded-l-2xl border-l border-y border-zinc-800 group-hover:border-blue-500/30">
                                <span className="text-sm font-black text-blue-500 italic">#{s.id}</span>
                              </td>
                              <td className="px-6 py-4 border-y border-zinc-800 group-hover:border-blue-500/30 text-sm font-bold text-zinc-300">{s.completion}ms</td>
                              <td className="px-6 py-4 border-y border-zinc-800 group-hover:border-blue-500/30 text-sm font-black text-red-500/80">{s.wait}ms</td>
                              <td className="px-6 py-4 rounded-r-2xl border-r border-y border-zinc-800 group-hover:border-blue-500/30 text-right text-sm font-black text-emerald-500/80">{s.tat}ms</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full min-h-[600px] rounded-[3rem] border border-zinc-800 border-dashed flex flex-col items-center justify-center space-y-4 bg-zinc-900/5">
                  <Activity className="text-zinc-800 animate-pulse" size={48} />
                  <p className="text-zinc-600 font-black uppercase tracking-[0.3em] text-[10px] italic">Awaiting_Kernel_Input</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <ProcessForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsEditing(null);
        }}
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
