import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Zap, BarChart3, Layers, Activity } from 'lucide-react';

const features = [
  {
    title: "C++ Scheduling Engine",
    desc: "High-concurrency backend for nanosecond-precision process simulation.",
    icon: <Cpu className="text-red-500" />,
    border: "group-hover:border-red-500/50"
  },
  {
    title: "Round Robin (RR)",
    desc: "Dynamic time-quantum slicing with preemption logic for interactive tasks.",
    icon: <Zap className="text-blue-500" />,
    border: "group-hover:border-blue-500/50"
  },
  {
    title: "Multilevel Queue",
    desc: "Hierarchical scheduling lanes with independent priority-based execution.",
    icon: <Layers className="text-orange-500" />,
    border: "group-hover:border-orange-500/50"
  },
  {
    title: "Gantt Chart Visuals",
    desc: "Professional-grade timelines showing exactly how the CPU switches tasks.",
    icon: <BarChart3 className="text-pink-500" />,
    border: "group-hover:border-pink-500/50"
  }
];

const Features = () => {
  return (
    <section className="py-24 bg-black relative">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 text-zinc-500 font-bold tracking-[0.2em] uppercase text-xs mb-4"
          >
            <Activity size={16} /> Technical Specifications
          </motion.div>
          
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic leading-none">
            Built for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-pink-500 to-blue-500">
              Performance.
            </span>
          </h2>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`group relative p-8 rounded-[2rem] bg-zinc-900/30 border border-white/5 transition-all duration-500 ${f.border} hover:bg-zinc-900/50`}
            >
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-transform duration-500 shadow-xl">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-tight italic">
                  {f.title}
                </h3>
                <p className="text-zinc-500 text-sm leading-relaxed font-medium group-hover:text-zinc-300 transition-colors">
                  {f.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;