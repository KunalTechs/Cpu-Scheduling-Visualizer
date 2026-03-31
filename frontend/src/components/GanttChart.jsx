import React from "react";
import { motion } from "framer-motion";

const GanttChart = ({ data }) => {
  if (!data || data.length === 0) return null;
  const totalTime = data[data.length - 1].end;

  return (
    <div className="w-full p-6 lg:p-10 space-y-8 bg-zinc-950/50 rounded-[2rem] border border-zinc-800/50 shadow-2xl">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-xl font-black italic tracking-tighter text-white">LIVE TIMELINE</h3>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">CPU Execution sequence</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            {totalTime}ms
          </span>
          <p className="text-[10px] text-zinc-600 font-bold uppercase">Total Cycles</p>
        </div>
      </div>

      <div className="relative h-32 w-full bg-black rounded-3xl border-2 border-zinc-900 flex overflow-hidden group/chart shadow-[0_0_50px_-12px_rgba(59,130,246,0.2)]">
        {data.map((block, index) => {
          const duration = block.end - block.start;
          const widthPercent = (duration / totalTime) * 100;
          const color = `hsl(${(index * 137.5) % 360}, 75%, 60%)`;

          return (
            <motion.div
              key={index}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: `${widthPercent}%`, opacity: 1 }}
              transition={{ duration: 0.8, ease: "circOut", delay: index * 0.05 }}
              className="relative h-full border-r border-white/5 flex flex-col items-center justify-center group cursor-crosshair"
              style={{ backgroundColor: `${color}15` }} // Translucent background
            >
              {/* Glowing Top Bar */}
              <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: color, boxShadow: `0 0 15px ${color}` }} />
              
              <span className="font-black text-lg" style={{ color: color }}>{block.id}</span>
              <span className="text-[8px] font-bold text-zinc-500 mt-1">{duration}ms</span>

              {/* Enhanced Tooltip */}
              <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-all duration-300 z-50 pointer-events-none">
                <div className="bg-zinc-900 border border-zinc-700 p-2 rounded-lg shadow-2xl backdrop-blur-md">
                  <p className="text-[10px] font-black text-white">{block.id} Details</p>
                  <p className="text-[8px] text-zinc-400">Start: {block.start}ms | End: {block.end}ms</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Time Axis Labels */}
      <div className="flex justify-between px-2 pt-2 border-t border-zinc-900">
        <span className="text-[10px] font-black text-zinc-700">0ms</span>
        <div className="h-1 w-px bg-zinc-800" />
        <span className="text-[10px] font-black text-zinc-700">{Math.floor(totalTime/2)}ms</span>
        <div className="h-1 w-px bg-zinc-800" />
        <span className="text-[10px] font-black text-zinc-700">{totalTime}ms</span>
      </div>
    </div>
  );
};

export default GanttChart;