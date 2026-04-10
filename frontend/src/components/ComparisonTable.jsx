import React from "react";
import { motion } from "framer-motion";
import { Trophy, Timer, Zap, Activity } from "lucide-react";

const ComparisonTable = ({ data, priorityMode }) => {
  if (!data || data.length === 0) return null;

  const getProcessColor = (id) => {
    if (id === "IDLE") return "bg-zinc-900 border-zinc-800 text-zinc-600";
    const colors = [
      "bg-blue-500/20 border-blue-500/40 text-blue-400",
      "bg-purple-500/20 border-purple-500/40 text-purple-400",
      "bg-emerald-500/20 border-emerald-500/40 text-emerald-400",
      "bg-orange-500/20 border-orange-500/40 text-orange-400",
      "bg-pink-500/20 border-pink-500/40 text-pink-400",
      "bg-cyan-500/20 border-cyan-500/40 text-cyan-400",
    ];
    const index = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const sortedData = [...data].sort((a, b) => a.avgWait - b.avgWait);

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mt-8 sm:mt-12 space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3 sm:gap-4 px-2 sm:px-6">
        <div className="p-2 sm:p-3 bg-blue-500/10 rounded-xl sm:rounded-2xl border border-blue-500/20 shrink-0">
          <Activity className="text-blue-500" size={18} />
        </div>
        <div>
          <h2 className="text-lg sm:text-2xl font-black italic uppercase tracking-tighter text-white leading-none">
            Kernel_Benchmark_Matrix
          </h2>
          <p className="text-[9px] font-bold text-purple-500 uppercase tracking-[0.2em] mt-1">
            Logic: {priorityMode === "lower" ? "Lower_Value = High_Pri" : "Higher_Value = High_Pri"}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4">
        {sortedData.map((algo, i) => (
          <motion.div
            key={algo.algorithm}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`group relative overflow-hidden p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2.5rem] border transition-all duration-500 ${
              i === 0
                ? "bg-gradient-to-br from-blue-600/10 to-transparent border-blue-500/40 shadow-2xl"
                : "bg-zinc-900/20 border-zinc-800"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6 mb-4 sm:mb-6">
              <div className="flex items-center gap-4 sm:gap-6">
                <span className={`text-2xl sm:text-3xl font-black italic ${i === 0 ? "text-blue-500" : "text-zinc-800"}`}>
                  0{i + 1}
                </span>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-black text-base sm:text-lg uppercase text-white tracking-tight">
                      {algo.algorithm}
                    </h4>
                    {i === 0 && (
                      <span className="text-[8px] font-black bg-blue-500 text-white px-2 py-0.5 rounded-full uppercase italic tracking-tighter">
                        Optimized
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 text-[10px] font-mono text-zinc-500 font-bold">
                    <div className="flex items-center gap-1">
                      <Timer size={10} /> WAIT: <span className="text-zinc-300">{algo.avgWait}ms</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap size={10} /> TAT: <span className="text-zinc-300">{algo.avgTat}ms</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mini Gantt — scrollable on mobile */}
            <div className="overflow-x-auto">
              <div className="h-16 sm:h-20 min-w-[300px] w-full bg-black/40 rounded-xl sm:rounded-2xl border border-zinc-800/50 flex overflow-hidden p-1 sm:p-1.5 gap-[2px]">
                {algo.timeline?.map((block, idx) => {
                  const duration = block.end - block.start;
                  const colorClass = getProcessColor(block.id);
                  return (
                    <div
                      key={idx}
                      className={`h-full rounded-lg border flex flex-col items-center justify-center relative group/block transition-all hover:brightness-125 ${colorClass}`}
                      style={{
                        flexGrow: duration,
                        minWidth: duration > 0 ? `${Math.max(duration * 4, 24)}px` : "0px",
                      }}
                    >
                      <span className="text-[9px] font-black uppercase">{block.id === "IDLE" ? "—" : block.id}</span>
                      <span className="text-[7px] font-mono opacity-60 mt-0.5">{duration}ms</span>

                      {/* Tooltip */}
                      <div className="hidden sm:block absolute -top-14 left-1/2 -translate-x-1/2 px-3 py-2 bg-zinc-900 border border-zinc-700 text-white rounded-xl opacity-0 group-hover/block:opacity-100 transition-all pointer-events-none z-50 shadow-2xl min-w-[90px]">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[10px] font-black text-blue-400 uppercase">{block.id}</span>
                          <span className="text-[9px] font-mono whitespace-nowrap">{block.start}ms → {block.end}ms</span>
                        </div>
                        <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 border-r border-b border-zinc-700 rotate-45" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between mt-2 sm:mt-3 px-1 sm:px-2 text-[8px] font-black text-zinc-700 uppercase tracking-[0.1em] sm:tracking-[0.2em]">
              <span>Start</span>
              <span>End: {algo.timeline?.[algo.timeline.length - 1]?.end}ms</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ComparisonTable;