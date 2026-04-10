import React from "react";
import { motion } from "framer-motion";

const GanttChart = ({ data }) => {
  if (!data || data.length === 0) return null;
  const totalTime = data[data.length - 1].end;

  return (
    <div className="w-full p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 bg-zinc-950 rounded-[2rem] border border-zinc-800 shadow-2xl">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-base sm:text-xl font-black italic tracking-tighter text-white uppercase">
            Live Timeline
          </h3>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
            CPU Execution sequence
          </p>
        </div>
        <div className="text-right">
          <span className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            {totalTime}ms
          </span>
          <p className="text-[10px] text-zinc-600 font-bold uppercase">Total Cycles</p>
        </div>
      </div>

      {/* Main Chart */}
      <div className="overflow-x-auto">
        <div className="relative h-24 sm:h-32 min-w-[400px] w-full bg-black rounded-3xl border-2 border-zinc-900 flex overflow-hidden group/chart shadow-[0_0_50px_-12px_rgba(59,130,246,0.2)]">
          {data.map((block, index) => {
            const isIdle = block.id === "IDLE";
            const duration = block.end - block.start;
            const widthPercent = (duration / totalTime) * 100;
            const blockColor = isIdle
              ? "#27272a"
              : `hsl(${(index * 137.5) % 360}, 70%, 50%)`;

            return (
              <motion.div
                key={index}
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: `${widthPercent}%`, opacity: 1 }}
                transition={{ duration: 0.8, ease: "circOut", delay: index * 0.05 }}
                className={`relative h-full border-r border-white/5 flex flex-col items-center justify-center group cursor-crosshair ${isIdle ? "opacity-40" : ""}`}
                style={{
                  backgroundColor: `${blockColor}${isIdle ? "30" : "15"}`,
                  backgroundImage: isIdle
                    ? `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)`
                    : "none",
                }}
              >
                {!isIdle && (
                  <div
                    className="absolute top-0 left-0 w-full h-1"
                    style={{ backgroundColor: blockColor, boxShadow: `0 0 15px ${blockColor}` }}
                  />
                )}
                <span
                  className={`font-black text-xs sm:text-lg ${isIdle ? "text-zinc-600" : ""}`}
                  style={{ color: isIdle ? "" : blockColor }}
                >
                  {isIdle ? "IDLE" : block.id}
                </span>
                <span className="text-[8px] font-bold text-zinc-500 mt-1">{duration}ms</span>

                {/* Tooltip */}
                <div className="hidden sm:block absolute -top-16 opacity-0 group-hover:opacity-100 transition-all duration-300 z-50 pointer-events-none translate-y-2 group-hover:translate-y-0">
                  <div className="bg-zinc-900 border border-zinc-700 p-2 rounded-lg shadow-2xl">
                    <p className="text-[10px] font-black text-white">
                      {isIdle ? "CPU Sleeping" : `${block.id} Execution`}
                    </p>
                    <p className="text-[8px] text-zinc-400">
                      Range: {block.start}ms — {block.end}ms
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Time Axis */}
      <div className="flex justify-between px-2 pt-2 border-t border-zinc-900">
        <span className="text-[10px] font-black text-zinc-700">0ms</span>
        <span className="text-[10px] font-black text-zinc-700">{Math.floor(totalTime / 2)}ms</span>
        <span className="text-[10px] font-black text-zinc-700">{totalTime}ms</span>
      </div>
    </div>
  );
};

export default GanttChart;