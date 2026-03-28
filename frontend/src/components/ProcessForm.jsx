import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Hash, Clock, Zap, Star } from 'lucide-react';

const ProcessForm = ({ isOpen, onClose, formData, setFormData, onSubmit, algorithm }) => {
  
  // Logic: Priority input only shows for Priority-based or SRTF algorithms
  const showPriority = algorithm.includes("Priority") || algorithm === "SRTF";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden"
          >
            {/* Design Grid Overlay */}
            <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

            <div className="relative z-10">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black italic tracking-tighter text-white">NEW <span className="text-blue-500">PROCESS</span></h2>
                <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={onSubmit} className="space-y-6">
                {/* Process ID */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 flex items-center gap-2">
                    <Hash size={12}/> Process ID
                  </label>
                  <input 
                    required 
                    value={formData.id} 
                    onChange={(e) => setFormData({...formData, id: e.target.value})} 
                    type="text" 
                    placeholder="e.g. P1" 
                    className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-white focus:border-blue-500 outline-none transition-all" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Arrival Time */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 flex items-center gap-2">
                      <Clock size={12}/> Arrival
                    </label>
                    <input 
                      value={formData.arrival} 
                      onChange={(e) => setFormData({...formData, arrival: e.target.value})} 
                      type="number" 
                      placeholder="0" 
                      className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-white focus:border-blue-500 outline-none" 
                    />
                  </div>
                  {/* Burst Time */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 flex items-center gap-2">
                      <Zap size={12}/> Burst
                    </label>
                    <input 
                      required 
                      value={formData.burst} 
                      onChange={(e) => setFormData({...formData, burst: e.target.value})} 
                      type="number" 
                      placeholder="5" 
                      className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-white focus:border-blue-500 outline-none" 
                    />
                  </div>
                </div>

                {/* Conditional Priority Field */}
                {showPriority && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    className="space-y-2"
                  >
                    <label className="text-[10px] uppercase font-bold text-zinc-500 flex items-center gap-2">
                      <Star size={12}/> Priority Level
                    </label>
                    <input 
                      value={formData.priority} 
                      onChange={(e) => setFormData({...formData, priority: e.target.value})} 
                      type="number" 
                      placeholder="1" 
                      className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-white focus:border-pink-500 outline-none" 
                    />
                  </motion.div>
                )}

                <button 
                  type="submit" 
                  className="w-full py-5 bg-white text-black rounded-2xl font-black text-lg hover:bg-blue-600 hover:text-white transition-all shadow-xl active:scale-95"
                >
                  ADD TO QUEUE
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProcessForm;