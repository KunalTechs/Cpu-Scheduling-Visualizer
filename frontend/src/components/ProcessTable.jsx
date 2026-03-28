import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, Cpu, Plus } from 'lucide-react';

const ProcessTable = ({ processes, onDelete, onOpenModal }) => {
  return (
    <section className="p-8 rounded-[2rem] bg-zinc-900/30 border border-zinc-800 h-fit">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3 text-zinc-400">
          <Cpu size={18} />
          <h2 className="font-bold uppercase tracking-widest text-xs">Ready Queue</h2>
        </div>
        <button onClick={onOpenModal} className="p-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors text-white">
          <Plus size={16} />
        </button>
      </div>

      {processes.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-600 text-sm font-medium">
          No processes added.
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {processes.map((p) => (
            <motion.div 
              key={p.id} 
              initial={{ x: -10, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }} 
              className="p-4 bg-black border border-zinc-800 rounded-xl flex items-center justify-between group hover:border-zinc-600 transition-all"
            >
              <div className="flex items-center gap-4">
                <span className="text-blue-500 font-black italic">{p.id}</span>
                <div className="text-[10px] text-zinc-500 flex gap-3 uppercase font-bold tracking-tighter">
                  <span>Arr: {p.arrival}</span>
                  <span>Brs: {p.burst}</span>
                  <span>Pri: {p.priority}</span>
                </div>
              </div>
              <button onClick={() => onDelete(p.id)} className="text-zinc-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                <Trash2 size={14}/>
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ProcessTable;