import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  History, 
  LayoutGrid, 
  Clock,
  Trash2,
  Calendar,
  Layers,
  ChevronRight
} from "lucide-react";
import { API_BASE } from "../config";

const HistoryPanel = ({ history, onRestore, onRefresh }) => {

  const handleDelete = async (e, id) => {
    e.stopPropagation(); 
    if (!window.confirm("Delete this simulation?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/history/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (res.ok) onRefresh(); 
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <section className="p-6 rounded-[2.5rem] bg-zinc-950 border border-zinc-800 space-y-6 relative overflow-hidden">
      {/* Background Glow — opacity only, no blur */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/5 pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-800 rounded-xl border border-zinc-700">
            <History size={16} className="text-blue-500" />
          </div>
          <div>
            <h2 className="text-xs font-black text-white uppercase tracking-widest">History_Log</h2>
            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter">System_Archives</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-full text-[9px] font-mono text-blue-400 shadow-inner">
          {history.length} Sessions
        </div>
      </div>

      <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 relative z-10">
        <AnimatePresence mode="popLayout">
          {history.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="py-12 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-[2rem] bg-zinc-900"
            >
              <Layers className="text-zinc-800 mb-2" size={32} />
              <p className="text-[10px] font-black text-zinc-600 uppercase italic tracking-widest">
                No Archives Found
              </p>
            </motion.div>
          ) : (
            history.map((session, idx) => {
              const algo = session.simulation_results?.algorithm || session.algorithm;
              const isBenchmark = !!session.simulation_results?.comparisonData;
              
              return (
                <motion.div 
                  key={session._id?.$oid || idx}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group relative"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onRestore(session)}
                    className="w-full p-5 bg-zinc-900 border border-zinc-800 group-hover:border-blue-500/40 rounded-[1.8rem] text-left transition-all relative overflow-hidden"
                  >
                    {/* Vertical Accent Line */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-black text-white uppercase italic tracking-tight">
                            {algo}
                          </span>
                          {isBenchmark && (
                            <span className="text-[7px] bg-blue-950 text-blue-400 px-2 py-0.5 rounded-full border border-blue-800 font-black uppercase tracking-widest">
                              Benchmarked
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-500 font-mono text-[8px]">
                          <Calendar size={10} />
                          {session.timestamp?.$date ? formatDate(session.timestamp.$date) : "Recent"}
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-zinc-700 group-hover:text-blue-500 transition-colors" />
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="space-y-1">
                        <p className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">Load</p>
                        <div className="flex items-center gap-1.5 text-xs font-black text-zinc-300">
                          <LayoutGrid size={12} className="text-zinc-500" />
                          {session.simulation_results?.processes?.length || session.processes?.length || 0}
                        </div>
                      </div>
                      
                      <div className="w-[1px] h-6 bg-zinc-800" />

                      <div className="space-y-1">
                        <p className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">Latency</p>
                        <div className="flex items-center gap-1.5 text-xs font-black text-emerald-400">
                          <Clock size={12} className="text-emerald-500" />
                          {session.simulation_results?.avgWait || session.avgWait || 0}<span className="text-[8px] ml-0.5">ms</span>
                        </div>
                      </div>
                    </div>
                  </motion.button>

                  {/* Delete Button */}
                  <button 
                    onClick={(e) => handleDelete(e, session._id?.$oid)}
                    className="absolute top-5 right-10 z-20 p-2 text-zinc-700 hover:text-red-500 hover:bg-red-950 rounded-xl transition-all opacity-0 group-hover:opacity-100 active:scale-90"
                    title="Delete Archive"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default HistoryPanel;
