import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Hash,
  Clock,
  Zap,
  Star,
  Edit3,
  Plus,
  Terminal,
  Cpu,
} from "lucide-react";

const ProcessForm = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  algorithm,
  isEditing,
  priorityMode,
  setPriorityMode, // 👈 Hooked up setter
}) => {
  const showPriority = algorithm.includes("P-") || algorithm === "Priority";

  const inputBase =
    "w-full bg-black/50 border border-zinc-800 p-4 rounded-2xl text-white outline-none transition-all duration-300 font-mono text-sm group-hover:border-zinc-600 focus:ring-1";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-[12px]"
          >
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 pointer-events-none ${isEditing ? "bg-orange-500" : "bg-blue-600"}`}
            />
          </motion.div>

          <motion.div
            initial={{ scale: 0.95, opacity: 0, rotateX: 15 }}
            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
            exit={{ scale: 0.95, opacity: 0, rotateX: -15 }}
            transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
            className="relative w-full max-w-[480px] bg-zinc-950 border border-zinc-800 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
          >
            <div className="relative z-10 px-10 pt-10 pb-6 flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`flex h-2 w-2 rounded-full animate-pulse ${isEditing ? "bg-orange-500 shadow-[0_0_8px_#f97316]" : "bg-blue-500 shadow-[0_0_8px_#3b82f6]"}`} />
                  <span className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em]">Kernel_Input_Active</span>
                </div>
                <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase flex items-center gap-3">
                  {isEditing ? <Edit3 size={28} className="text-orange-500" /> : <Terminal size={28} className="text-blue-500" />}
                  {isEditing ? "Update" : "Initialize"}_<span className={isEditing ? "text-orange-500" : "text-blue-500"}>Process</span>
                </h2>
              </div>
              <button onClick={onClose} className="p-2 bg-zinc-900 rounded-full text-zinc-500 hover:text-white border border-zinc-800 transition-all hover:scale-110 active:scale-90"><X size={20} /></button>
            </div>

            <div className="relative z-10 px-10 pb-10">
              <form onSubmit={onSubmit} className="space-y-8">
                <div className="group relative">
                  <label className="text-[9px] uppercase font-black tracking-widest text-zinc-500 flex items-center gap-2 mb-2 ml-1">
                    <Hash size={10} /> Global_Unique_ID
                  </label>
                  <input required disabled={!!isEditing} value={formData.id} onChange={(e) => setFormData({ ...formData, id: e.target.value })} className={`${inputBase} ${isEditing ? "opacity-30 cursor-not-allowed grayscale" : "focus:ring-blue-500/50 focus:border-blue-500"}`} placeholder="PROCESS_HEX_ID" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="group space-y-2">
                    <label className="text-[9px] uppercase font-black tracking-widest text-zinc-500 flex items-center gap-2 ml-1">
                      <Clock size={10} /> Arrival_Time
                    </label>
                    <input type="number" min="0" value={formData.arrival} onChange={(e) => setFormData({ ...formData, arrival: e.target.value })} placeholder="0" className={`${inputBase} focus:ring-blue-500/50 focus:border-blue-500`} />
                  </div>

                  <div className="group space-y-2">
                    <label className="text-[9px] uppercase font-black tracking-widest text-zinc-500 flex items-center gap-2 ml-1">
                      <Zap size={10} /> Burst_Load
                    </label>
                    <input type="number" min="1" required value={formData.burst} onChange={(e) => setFormData({ ...formData, burst: e.target.value })} placeholder="1" className={`${inputBase} text-emerald-400 focus:ring-emerald-500/50 focus:border-emerald-500`} />
                  </div>
                </div>

                <AnimatePresence>
                  {showPriority && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="group p-5 bg-purple-500/5 border border-purple-500/20 rounded-3xl space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-[9px] uppercase font-black tracking-widest text-purple-500 flex items-center gap-2">
                          <Star size={10} className="fill-current" /> Priority_Logic
                        </label>
                        
                        {/* 🟢 INTERACTIVE TOGGLE BUTTONS */}
                        <div className="flex bg-black border border-zinc-800 rounded-lg p-1">
                          <button
                            type="button"
                            onClick={() => setPriorityMode("lower")}
                            className={`px-2 py-1 text-[7px] font-black rounded transition-all ${priorityMode === 'lower' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-zinc-600 hover:text-zinc-400'}`}
                          >
                            LOWER=HIGH
                          </button>
                          <button
                            type="button"
                            onClick={() => setPriorityMode("higher")}
                            className={`px-2 py-1 text-[7px] font-black rounded transition-all ${priorityMode === 'higher' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-zinc-600 hover:text-zinc-400'}`}
                          >
                            HIGHER=HIGH
                          </button>
                        </div>
                      </div>

                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          value={formData.priority}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                          className="w-full bg-black/50 border border-purple-500/30 p-3 rounded-xl text-purple-400 focus:border-purple-500 outline-none transition-all font-mono text-xs"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-bold text-zinc-600 uppercase italic pointer-events-none tracking-tighter">
                          {priorityMode === 'lower' ? 'Aim for 0 for max pri' : 'Aim for 10+ for max pri'}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button type="submit" className={`group relative w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] transition-all overflow-hidden active:scale-[0.98] ${isEditing ? "bg-orange-600 text-white hover:bg-orange-500" : "bg-blue-600 text-white hover:bg-blue-500"}`}>
                  <div className="relative z-10 flex items-center justify-center gap-3">{isEditing ? <Cpu size={14} /> : <Plus size={14} />} {isEditing ? "Commit_System_Change" : "Inject_Into_Kernel"}</div>
                  <motion.div initial={{ x: "-100%" }} animate={{ x: "100%" }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                </button>
              </form>
            </div>

            <div className="bg-zinc-900/50 border-t border-zinc-800 px-10 py-3 flex justify-between items-center">
              <span className="text-[7px] text-zinc-600 font-black uppercase tracking-widest">Protocol: 0x224B_PR_MODE_{priorityMode.toUpperCase()}</span>
              <div className="flex gap-1"><div className="w-1 h-1 bg-zinc-800 rounded-full" /><div className="w-1 h-1 bg-zinc-800 rounded-full" /><div className="w-1 h-1 bg-zinc-700 rounded-full" /></div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProcessForm;
