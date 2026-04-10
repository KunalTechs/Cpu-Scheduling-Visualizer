import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Hash, Clock, Zap, Star, Edit3, Plus, Terminal, Cpu } from "lucide-react";

const ProcessForm = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  algorithm,
  isEditing,
  priorityMode,
  setPriorityMode,
}) => {
  const showPriority = algorithm.includes("P-") || algorithm === "Priority";

  const inputBase =
    "w-full bg-black/50 border border-zinc-800 p-3 sm:p-4 rounded-2xl text-white outline-none transition-all duration-300 font-mono text-sm group-hover:border-zinc-600 focus:ring-1";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-[12px]"
          >
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[120px] opacity-20 pointer-events-none ${isEditing ? "bg-orange-500" : "bg-blue-600"}`}
            />
          </motion.div>

          {/* Modal — slides up from bottom on mobile, scales in on desktop */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
            className="relative w-full sm:max-w-[480px] bg-zinc-950 border border-zinc-800 rounded-t-[2rem] sm:rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col sm:motion-safe:animate-none"
            style={{}}
          >
            {/* On desktop override to scale animation */}
            <div className="relative z-10 px-6 sm:px-10 pt-6 sm:pt-10 pb-4 sm:pb-6 flex justify-between items-start">
              {/* Mobile drag handle */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-zinc-700 rounded-full sm:hidden" />

              <div className="space-y-1 mt-2 sm:mt-0">
                <div className="flex items-center gap-2">
                  <span className={`flex h-2 w-2 rounded-full animate-pulse ${isEditing ? "bg-orange-500" : "bg-blue-500"}`} />
                  <span className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em]">Kernel_Input_Active</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black italic tracking-tighter text-white uppercase flex items-center gap-2 sm:gap-3">
                  {isEditing
                    ? <Edit3 size={22} className="text-orange-500" />
                    : <Terminal size={22} className="text-blue-500" />}
                  {isEditing ? "Update" : "Init"}_
                  <span className={isEditing ? "text-orange-500" : "text-blue-500"}>Process</span>
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-zinc-900 rounded-full text-zinc-500 hover:text-white border border-zinc-800 transition-all hover:scale-110 active:scale-90 mt-2 sm:mt-0"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative z-10 px-6 sm:px-10 pb-6 sm:pb-10 overflow-y-auto max-h-[80vh] sm:max-h-none">
              <form onSubmit={onSubmit} className="space-y-5 sm:space-y-8">
                {/* ID */}
                <div className="group relative">
                  <label className="text-[9px] uppercase font-black tracking-widest text-zinc-500 flex items-center gap-2 mb-2 ml-1">
                    <Hash size={10} /> Global_Unique_ID
                  </label>
                  <input
                    required
                    disabled={!!isEditing}
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className={`${inputBase} ${isEditing ? "opacity-30 cursor-not-allowed grayscale" : "focus:ring-blue-500/50 focus:border-blue-500"}`}
                    placeholder="PROCESS_ID"
                  />
                </div>

                {/* Arrival + Burst */}
                <div className="grid grid-cols-2 gap-3 sm:gap-6">
                  <div className="group space-y-2">
                    <label className="text-[9px] uppercase font-black tracking-widest text-zinc-500 flex items-center gap-2 ml-1">
                      <Clock size={10} /> Arrival
                    </label>
                    <input
                      type="number" min="0"
                      value={formData.arrival}
                      onChange={(e) => setFormData({ ...formData, arrival: e.target.value })}
                      placeholder="0"
                      className={`${inputBase} focus:ring-blue-500/50 focus:border-blue-500`}
                    />
                  </div>
                  <div className="group space-y-2">
                    <label className="text-[9px] uppercase font-black tracking-widest text-zinc-500 flex items-center gap-2 ml-1">
                      <Zap size={10} /> Burst
                    </label>
                    <input
                      type="number" min="1" required
                      value={formData.burst}
                      onChange={(e) => setFormData({ ...formData, burst: e.target.value })}
                      placeholder="1"
                      className={`${inputBase} text-emerald-400 focus:ring-emerald-500/50 focus:border-emerald-500`}
                    />
                  </div>
                </div>

                {/* Priority */}
                <AnimatePresence>
                  {showPriority && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group p-4 sm:p-5 bg-purple-500/5 border border-purple-500/20 rounded-2xl sm:rounded-3xl space-y-3 sm:space-y-4"
                    >
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <label className="text-[9px] uppercase font-black tracking-widest text-purple-500 flex items-center gap-2">
                          <Star size={10} className="fill-current" /> Priority_Logic
                        </label>
                        <div className="flex bg-black border border-zinc-800 rounded-lg p-1">
                          <button
                            type="button"
                            onClick={() => setPriorityMode("lower")}
                            className={`px-2 py-1 text-[7px] font-black rounded transition-all ${priorityMode === "lower" ? "bg-purple-600 text-white" : "text-zinc-600 hover:text-zinc-400"}`}
                          >
                            LOWER=HIGH
                          </button>
                          <button
                            type="button"
                            onClick={() => setPriorityMode("higher")}
                            className={`px-2 py-1 text-[7px] font-black rounded transition-all ${priorityMode === "higher" ? "bg-purple-600 text-white" : "text-zinc-600 hover:text-zinc-400"}`}
                          >
                            HIGHER=HIGH
                          </button>
                        </div>
                      </div>
                      <input
                        type="number" min="0"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="w-full bg-black/50 border border-purple-500/30 p-3 rounded-xl text-purple-400 focus:border-purple-500 outline-none font-mono text-xs"
                        placeholder={priorityMode === "lower" ? "0 = max priority" : "10+ = max priority"}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <button
                  type="submit"
                  className={`group relative w-full py-4 sm:py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] transition-all overflow-hidden active:scale-[0.98] ${isEditing ? "bg-orange-600 text-white hover:bg-orange-500" : "bg-blue-600 text-white hover:bg-blue-500"}`}
                >
                  <div className="relative z-10 flex items-center justify-center gap-3">
                    {isEditing ? <Cpu size={14} /> : <Plus size={14} />}
                    {isEditing ? "Commit_Change" : "Inject_Into_Kernel"}
                  </div>
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
                  />
                </button>
              </form>
            </div>

            <div className="bg-zinc-900/50 border-t border-zinc-800 px-6 sm:px-10 py-3 flex justify-between items-center">
              <span className="text-[7px] text-zinc-600 font-black uppercase tracking-widest">
                Mode: {priorityMode.toUpperCase()}
              </span>
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-zinc-800 rounded-full" />
                <div className="w-1 h-1 bg-zinc-800 rounded-full" />
                <div className="w-1 h-1 bg-zinc-700 rounded-full" />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProcessForm;
