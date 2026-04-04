import React from "react";
import { motion } from "framer-motion";
import { Trophy, Timer, Zap, Activity } from "lucide-react";

const ComparisonTable = ({ data, priorityMode }) => {
  if (!data || data.length === 0) return null;

  const getProcessColor = (id) => {
    if (id === "IDLE") return "bg-zinc-900 border-zinc-800 text-zinc-600";
    const colors = [
      "bg-blue-500/20 border-blue-500/40 text-blue-400 shadow-[inset_0_0_10px_rgba(59,130,246,0.1)]",
      "bg-purple-500/20 border-purple-500/40 text-purple-400 shadow-[inset_0_0_10px_rgba(168,85,247,0.1)]",
      "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]",
      "bg-orange-500/20 border-orange-500/40 text-orange-400 shadow-[inset_0_0_10px_rgba(249,115,22,0.1)]",
      "bg-pink-500/20 border-pink-500/40 text-pink-400 shadow-[inset_0_0_10px_rgba(236,72,153,0.1)]",
      "bg-cyan-500/20 border-cyan-500/40 text-cyan-400 shadow-[inset_0_0_10px_rgba(6,182,212,0.1)]",
    ];
    const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const sortedData = [...data].sort((a, b) => a.avgWait - b.avgWait);

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mt-12 space-y-6">
      <div className="flex items-center gap-4 px-6">
        <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
          <Activity className="text-blue-500" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none">Kernel_Benchmark_Matrix</h2>
          <p className="text-[9px] font-bold text-purple-500 uppercase tracking-[0.3em] mt-1">
              Logic: {priorityMode === 'lower' ? 'Lower_Value = High_Pri' : 'Higher_Value = High_Pri'}
            </p>
          <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.3em] mt-1">Visual Efficiency Comparison</p>
        </div>
      </div>

      <div className="grid gap-4">
        {sortedData.map((algo, i) => (
          <motion.div
            key={algo.algorithm}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`group relative overflow-hidden p-6 rounded-[2.5rem] border transition-all duration-500 ${
              i === 0 ? "bg-gradient-to-br from-blue-600/10 to-transparent border-blue-500/40 shadow-2xl" : "bg-zinc-900/20 border-zinc-800"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
              <div className="flex items-center gap-6">
                <span className={`text-3xl font-black italic ${i === 0 ? "text-blue-500" : "text-zinc-800"}`}>0{i + 1}</span>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-black text-lg uppercase text-white tracking-tight">{algo.algorithm}</h4>
                    {i === 0 && <span className="text-[8px] font-black bg-blue-500 text-white px-2 py-0.5 rounded-full uppercase italic tracking-tighter">Optimized_Kernel</span>}
                  </div>
                  <div className="flex gap-4 text-[10px] font-mono text-zinc-500 font-bold">
                    <div className="flex items-center gap-1"><Timer size={10}/> WAIT: <span className="text-zinc-300">{algo.avgWait}ms</span></div>
                    <div className="flex items-center gap-1"><Zap size={10}/> TAT: <span className="text-zinc-300">{algo.avgTat}ms</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* 📊 UPDATED MINI GANTT CHART */}
            <div className="h-20 w-full bg-black/40 rounded-2xl border border-zinc-800/50 flex overflow-hidden p-1.5 gap-[2px]">
              {algo.timeline?.map((block, idx) => {
                const duration = block.end - block.start;
                const colorClass = getProcessColor(block.id);
                
                return (
                  <div 
                    key={idx}
                    className={`h-full rounded-lg border flex flex-col items-center justify-center relative group/block transition-all hover:brightness-125 hover:scale-y-[1.02] ${colorClass}`}
                    style={{ flexGrow: duration, minWidth: duration > 0 ? `${Math.max(duration * 5, 30)}px` : '0px' }}
                  >
                    {/* Data Display */}
                    <div className="flex flex-col items-center leading-none pointer-events-none overflow-hidden px-1">
                      <span className="text-[10px] font-black uppercase">{block.id === "IDLE" ? "—" : block.id}</span>
                      <span className="text-[8px] font-mono opacity-60 mt-1 font-bold">{duration}ms</span>
                    </div>

                    {/* Tooltip Overlay */}
                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 px-3 py-2 bg-zinc-900 border border-zinc-700 text-white rounded-xl opacity-0 group-hover/block:opacity-100 transition-all pointer-events-none z-50 shadow-2xl scale-90 group-hover/block:scale-100 min-w-[100px]">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{block.id}</span>
                        <div className="h-[1px] w-full bg-zinc-800" />
                        <span className="text-[9px] font-mono whitespace-nowrap">{block.start}ms → {block.end}ms</span>
                        <span className="text-[9px] font-black text-emerald-500 italic">Duration: {duration}ms</span>
                      </div>
                      <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 border-r border-b border-zinc-700 rotate-45" />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between mt-3 px-2 text-[8px] font-black text-zinc-700 uppercase tracking-[0.2em]">
               <span>Sequence_Start</span>
               <span>Kernel_Time_Limit: {algo.timeline?.[algo.timeline.length - 1]?.end}ms</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ComparisonTable;