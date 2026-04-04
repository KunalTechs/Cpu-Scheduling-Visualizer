import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Cpu, Plus, Layers, Hash, Settings2, Zap } from 'lucide-react';

const ProcessTable = ({ processes, onDelete, onEdit, onOpenModal, priorityMode }) => {
  return (
    <section className="p-6 rounded-[2.5rem] bg-zinc-900/30 border border-zinc-800 backdrop-blur-sm shadow-2xl h-fit overflow-hidden relative">
      
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <Cpu className="text-blue-500" size={18} />
          </div>
          <div>
            <h2 className="font-black italic uppercase tracking-tighter text-sm text-white">
              Ready_Queue
            </h2>
            {/* 🟢 PRIORITY LOGIC CHIP */}
            <div className="flex items-center gap-2 mt-1">
               <span className="flex h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
               <p className="text-[7px] font-black text-purple-400 uppercase tracking-[0.2em]">
                 Logic: {priorityMode === 'lower' ? 'Lower_Value = High' : 'Higher_Value = High'}
               </p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={onOpenModal} 
          className="group flex items-center gap-2 px-4 py-2 bg-white text-black rounded-xl hover:bg-blue-500 hover:text-white transition-all duration-300 active:scale-95 shadow-lg shadow-white/5"
        >
          <span className="text-[10px] font-black uppercase">Add_Job</span>
          <Plus size={14} className="group-hover:rotate-90 transition-transform" />
        </button>
      </div>

      {/* Stats Mini Bar */}
      <div className="flex gap-4 mb-6 px-1">
          <div className="text-[9px] font-bold text-zinc-600 uppercase">
             Buffer: <span className="text-zinc-300">{processes.length} Processes</span>
          </div>
          <div className="h-3 w-[1px] bg-zinc-800" />
          <div className="text-[9px] font-bold text-zinc-600 uppercase">
             State: <span className="text-emerald-500 italic font-black">Verified</span>
          </div>
      </div>

      {/* List Container */}
      <div className="relative z-10">
        <AnimatePresence mode="popLayout">
          {processes.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center border border-dashed border-zinc-800 rounded-3xl bg-black/20"
            >
              <Layers className="mx-auto text-zinc-800 mb-3" size={32} />
              <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">
                Buffer_Empty
              </p>
            </motion.div>
          ) : (
            <div className="space-y-2 max-h-[440px] overflow-y-auto pr-2 custom-scrollbar">
              {processes.map((p, index) => (
                <motion.div 
                  key={p.id} 
                  layout
                  initial={{ x: -20, opacity: 0 }} 
                  animate={{ x: 0, opacity: 1 }} 
                  exit={{ x: 50, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="group relative p-4 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl flex items-center justify-between hover:bg-zinc-800/40 hover:border-blue-500/30 transition-all duration-300"
                >
                  {/* Subtle Background Index */}
                  <div className="absolute -right-2 -bottom-2 text-4xl font-black italic text-white/[0.02] select-none group-hover:text-blue-500/5 transition-colors">
                    {index + 1}
                  </div>

                  <div className="flex items-center gap-5 relative z-10">
                    {/* ID Hex Badge */}
                    <div className="flex flex-col items-center justify-center h-10 w-10 rounded-xl bg-black border border-zinc-800 group-hover:border-blue-500/50 transition-colors shadow-inner">
                       <Hash className="text-zinc-700 group-hover:text-blue-500" size={10} />
                       <span className="text-sm font-black text-white italic -mt-1">{p.id}</span>
                    </div>

                    {/* Meta Data Points */}
                    <div className="flex gap-4 items-center">
                      <div className="flex flex-col">
                        <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">Arrival</span>
                        <span className="text-[11px] font-black text-zinc-300 font-mono">{p.arrival}ms</span>
                      </div>
                      <div className="h-4 w-[1px] bg-zinc-800" />
                      <div className="flex flex-col">
                        <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">Burst</span>
                        <span className="text-[11px] font-black text-emerald-500 font-mono">{p.burst}ms</span>
                      </div>
                      <div className="h-4 w-[1px] bg-zinc-800" />
                      <div className="flex flex-col">
                        <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">Priority</span>
                        <span className="text-[11px] font-black text-purple-500 font-mono">{p.priority}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Group */}
                  <div className="flex gap-2 relative z-10 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button 
                      onClick={() => onEdit(p)} 
                      className="p-2 rounded-xl bg-black border border-zinc-800 text-zinc-500 hover:text-blue-400 hover:border-blue-500/40 transition-all active:scale-90"
                      title="Edit Parameters"
                    >
                      <Settings2 size={14}/>
                    </button>
                    <button 
                      onClick={() => onDelete(p.id)} 
                      className="p-2 rounded-xl bg-black border border-zinc-800 text-zinc-500 hover:text-red-500 hover:border-red-500/40 transition-all active:scale-90"
                      title="Purge Process"
                    >
                      <Trash2 size={14}/>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative Glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none" />
    </section>
  );
};

export default ProcessTable;