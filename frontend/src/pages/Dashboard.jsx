import React, { useState } from "react";
import { motion } from "framer-motion";
import { Activity, Play, RotateCcw, Settings2 } from "lucide-react";
import ProcessForm from "../components/ProcessForm";
import ProcessTable from "../components/ProcessTable";
import GanttChart from "../components/GanttChart";

const Dashboard = () => {
  const [algorithm, setAlgorithm] = useState("RR");
  const [priorityMode, setPriorityMode] = useState("lower");
  const [quantum, setQuantum] = useState(2);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processes, setProcesses] = useState([]);
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState([]); // ✅ NEW: Stores calculated stats from C++
  const [formData, setFormData] = useState({
    id: "",
    arrival: "",
    burst: "",
    priority: "",
  });

  const startSimulation = async () => {
    if (processes.length === 0) return;

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

      // 🛑 CRITICAL: Handle errors BEFORE calling .json()
      // This prevents the "Unexpected token M" error
      if (!response.ok) {
        const errorText = await response.text();
        alert(`Simulation Error: ${errorText}`);
        return;
      }

      const data = await response.json();
      console.log("Kernel Response:", data);

      if (data.status === "success") {
        setResults(data.timeline);
        setStats(data.processes);
      }
    } catch (error) {
      console.error("Kernel Error:", error);
    }
  };

  const handleAddProcess = (e) => {
    e.preventDefault();

    // 1. Parse and Validate
    const arrival = parseInt(formData.arrival) || 0;
    const burst = parseInt(formData.burst) || 1;
    const priority = parseInt(formData.priority) || 1;

    // 2. The Logic Guard
    if (arrival < 0 || burst <= 0) {
      alert(
        "Invalid Input: Arrival must be 0 or greater, and Burst must be at least 1.",
      );
      return;
    }

    // 3. Add to state if valid
    const newProcess = {
      id: formData.id,
      arrival,
      burst,
      priority,
    };

    setProcesses([...processes, newProcess]);
    setFormData({ id: "", arrival: "", burst: "", priority: "" });
    setIsModalOpen(false);
  };

  // Statistics card
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full px-6"
      >
        {[
          {
            label: "Avg. Waiting",
            value: `${avgWait}ms`,
            color: "text-blue-500",
            sub: "Queue Delay",
          },
          {
            label: "Avg. Turnaround",
            value: `${avgTat}ms`,
            color: "text-purple-500",
            sub: "Total Cycle",
          },
          {
            label: "CPU Idle Time",
            value: `${idleTime}ms`,
            color: "text-red-500",
            sub: "System Inactive",
          },
          {
            label: "Utilization",
            value: `${utilization}%`,
            color: "text-emerald-500",
            sub: "Kernel Efficiency",
          },
        ].map((s, i) => (
          <div
            key={i}
            className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl shadow-xl group hover:border-zinc-700 transition-all"
          >
            <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest mb-1">
              {s.label}
            </p>
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[8px] font-bold text-zinc-600 uppercase mt-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {s.sub}
            </p>
          </div>
        ))}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <h1 className="text-4xl font-black italic tracking-tighter">
            PROCESS{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500">
              CONTROL
            </span>
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setProcesses([]);
                setResults([]);
                setStats([]);
              }}
              className="px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-xl font-bold text-sm flex items-center gap-2"
            >
              <RotateCcw size={16} /> Reset
            </button>
            <button
              onClick={startSimulation}
              className="px-8 py-3 bg-white text-black rounded-xl font-black flex items-center gap-2 active:scale-95 transition-all hover:bg-blue-600 hover:text-white"
            >
              <Play size={16} /> Start
            </button>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* SIDEBAR: INPUTS */}
          <div className="lg:col-span-1 space-y-8">
            <section className="p-8 rounded-[2rem] bg-zinc-900/30 border border-zinc-800 space-y-6 shadow-2xl">
              <div className="flex items-center gap-3 text-zinc-400 font-bold uppercase tracking-widest text-[10px]">
                <Settings2 size={16} /> Scheduler Configuration
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-zinc-600 uppercase font-bold tracking-tighter">
                  Execution Strategy
                </label>
                <select
                  value={algorithm}
                  onChange={(e) => setAlgorithm(e.target.value)}
                  className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-white font-bold outline-none focus:border-blue-500 transition-all cursor-pointer appearance-none"
                >
                  <option value="FCFS">First Come First Served</option>
                  <option value="RR">Round Robin</option>
                  <option value="HRRN">Highest Response Ratio Next</option>
                  <option value="SJF">SJF (Non-Preemptive)</option>
                  <option value="SRTF">SRTF (Preemptive)</option>
                  <option value="P-NP">Priority (Non-Preemptive)</option>
                  <option value="P-P">Priority (Preemptive)</option>
                </select>
              </div>

              {/* 1. ROUND ROBIN SETTINGS */}
              {algorithm === "RR" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 pt-2"
                >
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] text-zinc-600 uppercase font-bold">
                      Time Quantum
                    </label>
                    <span className="text-blue-500 font-black italic text-sm">
                      {quantum}ms
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={quantum}
                    onChange={(e) => setQuantum(e.target.value)}
                    className="w-full h-1.5 bg-black rounded-lg appearance-none cursor-pointer accent-blue-500 border border-zinc-800"
                  />
                </motion.div>
              )}

              {/* 2. PRIORITY MODE SETTINGS */}
              {(algorithm === "P-NP" || algorithm === "P-P") && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 pt-2"
                >
                  <label className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">
                    Priority Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-black rounded-xl border border-zinc-800">
                    <button
                      onClick={() => setPriorityMode("lower")}
                      type="button"
                      className={`py-2 text-[10px] font-black rounded-lg transition-all ${
                        priorityMode === "lower"
                          ? "bg-zinc-800 text-white shadow-xl"
                          : "text-zinc-600 hover:text-zinc-400"
                      }`}
                    >
                      LOWER = HIGH
                    </button>
                    <button
                      onClick={() => setPriorityMode("higher")}
                      type="button"
                      className={`py-2 text-[10px] font-black rounded-lg transition-all ${
                        priorityMode === "higher"
                          ? "bg-zinc-800 text-white shadow-xl"
                          : "text-zinc-600 hover:text-zinc-400"
                      }`}
                    >
                      HIGHER = HIGH
                    </button>
                  </div>
                </motion.div>
              )}
            </section>
            <ProcessTable
              processes={processes}
              onDelete={(id) =>
                setProcesses(processes.filter((p) => p.id !== id))
              }
              onOpenModal={() => setIsModalOpen(true)}
            />
          </div>

          {/* MAIN PANEL: VISUALIZATION & STATS */}
          <div className="lg:col-span-2 space-y-8">
            {results.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                {/* 1. GANTT CHART */}
                <div className="rounded-[2.5rem] bg-zinc-900/20 border border-zinc-800 overflow-hidden">
                  <GanttChart data={results} />
                </div>

                {/* 2. STATS SUMMARY CARDS */}
                <StatsSummary stats={stats} timeline={results} />

                {/* 3. DETAILED RESULTS TABLE */}
                <div className="p-6 rounded-[2rem] bg-zinc-900/20 border border-zinc-800">
                  <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 px-2">
                    Detailed Kernel Output
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="text-zinc-600 text-[10px] font-black uppercase border-b border-zinc-800">
                        <tr>
                          <th className="px-4 py-3">ID</th>
                          <th className="px-4 py-3">Completion</th>
                          <th className="px-4 py-3">Waiting</th>
                          <th className="px-4 py-3">Turnaround</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900/50">
                        {stats.map((s) => (
                          <tr
                            key={s.id}
                            className="text-sm font-bold hover:bg-white/5 transition-colors"
                          >
                            <td className="px-4 py-4 text-blue-400">
                              # {s.id}
                            </td>
                            <td className="px-4 py-4">{s.completion}ms</td>
                            <td className="px-4 py-4 text-red-500">
                              {s.wait}ms
                            </td>
                            <td className="px-4 py-4 text-emerald-500">
                              {s.tat}ms
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full min-h-[500px] rounded-[2.5rem] bg-zinc-900/20 border border-zinc-800 border-dashed flex flex-col items-center justify-center space-y-4">
                <Activity className="text-zinc-800" size={48} />
                <p className="text-zinc-700 font-bold uppercase tracking-widest text-[10px] italic text-center">
                  Awaiting Kernel Instructions <br />{" "}
                  <span className="text-[8px] opacity-50">
                    Press Start to Simulate
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ProcessForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleAddProcess}
        algorithm={algorithm}
      />
    </div>
  );
};

export default Dashboard;
