import React, { useState } from "react";
import { motion } from "framer-motion";
import { Activity, Play, RotateCcw, Settings2 } from "lucide-react";
import ProcessForm from "../components/ProcessForm";
import ProcessTable from "../components/ProcessTable";

const Dashboard = () => {

  const [algorithm, setAlgorithm] = useState("RR");
  const [priorityMode, setPriorityMode] = useState("lower"); // "lower" or "higher"
  const [quantum, setQuantum] = useState(2);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processes, setProcesses] = useState([]);
  const [formData, setFormData] = useState({
    id: "",
    arrival: "",
    burst: "",
    priority: "",
  });

  const handleAddProcess = (e) => {
    e.preventDefault();
    const newProcess = {
      ...formData,
      arrival: parseInt(formData.arrival) || 0,
      burst: parseInt(formData.burst) || 0,
      priority: parseInt(formData.priority) || 1,
    };
    setProcesses([...processes, newProcess]);
    setFormData({ id: "", arrival: "", burst: "", priority: "" });
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <h1 className="text-4xl font-black italic tracking-tighter">
            PROCESS{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500">
              CONTROL
            </span>
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => setProcesses([])}
              className="px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-xl font-bold text-sm flex items-center gap-2"
            >
              <RotateCcw size={16} /> Reset
            </button>
            <button className="px-8 py-3 bg-white text-black rounded-xl font-black flex items-center gap-2 active:scale-95">
              <Play size={16} /> Start
            </button>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            {/* Scheduler Settings */}
            {/* Scheduler Configuration Panel */}
            <section className="p-8 rounded-[2rem] bg-zinc-900/30 border border-zinc-800 space-y-6">
              <div className="flex items-center gap-3 text-zinc-400 font-bold uppercase tracking-widest text-[10px]">
                <Settings2 size={16} /> Scheduler Configuration
              </div>

              {/* Algorithm Selection */}
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
                  <option value="SJF">SJF (Non-Preemptive)</option>
                  <option value="SRTF">SRTF (Preemptive)</option>
                  <option value="P-NP">Priority (Non-Preemptive)</option>
                  <option value="P-P">Priority (Preemptive)</option>
                </select>
              </div>

              {/* DYNAMIC: Time Quantum (RR Only) */}
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

              {/* DYNAMIC: Priority Mode (Priority & SRTF Only) */}
              {(algorithm.includes("Priority") || algorithm === "SRTF") && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 pt-2"
                >
                  <label className="text-[10px] text-zinc-600 uppercase font-bold">
                    Priority Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-black rounded-xl border border-zinc-800">
                    <button
                      onClick={() => setPriorityMode("lower")}
                      className={`py-2 text-[10px] font-black rounded-lg transition-all ${priorityMode === "lower" ? "bg-zinc-800 text-white shadow-xl" : "text-zinc-600 hover:text-zinc-400"}`}
                    >
                      LOWER = HIGH
                    </button>
                    <button
                      onClick={() => setPriorityMode("higher")}
                      className={`py-2 text-[10px] font-black rounded-lg transition-all ${priorityMode === "higher" ? "bg-zinc-800 text-white shadow-xl" : "text-zinc-600 hover:text-zinc-400"}`}
                    >
                      HIGHER = HIGH
                    </button>
                  </div>
                  <p className="text-[9px] text-zinc-700 italic text-center px-2">
                    {priorityMode === "lower"
                      ? "Unix/Linux Style: 0 is top priority."
                      : "Windows Style: Larger value is top priority."}
                  </p>
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

          <div className="lg:col-span-2 min-h-[500px] rounded-[2.5rem] bg-zinc-900/20 border border-zinc-800 flex items-center justify-center">
            <p className="text-zinc-700 font-bold uppercase tracking-widest text-xs italic">
              Awaiting Visualization Data
            </p>
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
