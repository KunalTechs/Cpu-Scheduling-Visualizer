import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Zap, BarChart3, Layers, Activity, Shield, GitBranch, Clock } from 'lucide-react';

const features = [
  {
    title: "C++ Scheduling Engine",
    desc: "A custom high-concurrency execution core built in C++ with Drogon, delivering nanosecond-precision process simulation far beyond what JavaScript runtimes can offer.",
    icon: <Cpu className="text-red-500" size={28} />,
    border: "group-hover:border-red-500/50",
    tag: "Core Engine"
  },
  {
    title: "7 Scheduling Algorithms",
    desc: "FCFS, Round Robin, SJF, SRTF, Priority (Preemptive & Non-Preemptive), and HRRN — all implemented with full preemption logic and configurable parameters.",
    icon: <GitBranch className="text-blue-500" size={28} />,
    border: "group-hover:border-blue-500/50",
    tag: "Algorithms"
  },
  {
    title: "Real-Time Gantt Charts",
    desc: "Professional-grade animated timelines showing exact CPU context switches, idle periods, and process execution windows rendered frame-by-frame.",
    icon: <BarChart3 className="text-pink-500" size={28} />,
    border: "group-hover:border-pink-500/50",
    tag: "Visualization"
  },
  {
    title: "Algorithm Benchmarking",
    desc: "Run all 7 algorithms simultaneously on the same process set and compare average wait time, turnaround time, and CPU utilization side-by-side.",
    icon: <Zap className="text-orange-500" size={28} />,
    border: "group-hover:border-orange-500/50",
    tag: "Benchmark"
  },
  {
    title: "Session History",
    desc: "Every simulation is archived to MongoDB Atlas with full process data, timeline, and stats. Restore any past session in one click and continue from where you left off.",
    icon: <Clock className="text-emerald-500" size={28} />,
    border: "group-hover:border-emerald-500/50",
    tag: "Persistence"
  },
  {
    title: "Secure JWT Auth",
    desc: "Cookie-based JWT authentication with HttpOnly, SameSite=None, and Secure flags — protecting your simulation history with production-grade session management.",
    icon: <Shield className="text-purple-500" size={28} />,
    border: "group-hover:border-purple-500/50",
    tag: "Security"
  },
  {
    title: "Priority Modes",
    desc: "Switch between higher-is-better and lower-is-better priority modes on the fly. Both preemptive and non-preemptive variants respond instantly to your configuration.",
    icon: <Layers className="text-cyan-500" size={28} />,
    border: "group-hover:border-cyan-500/50",
    tag: "Configuration"
  },
  {
    title: "Per-Process Diagnostics",
    desc: "Detailed execution reports for every process — arrival time, burst time, wait time, turnaround time, and CPU efficiency percentage with animated progress bars.",
    icon: <Activity className="text-yellow-500" size={28} />,
    border: "group-hover:border-yellow-500/50",
    tag: "Analytics"
  }
];

const Features = () => {
  return (
    <section className="py-16 sm:py-24 bg-black relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Header */}
        <div className="mb-12 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 text-zinc-500 font-bold tracking-[0.2em] uppercase text-xs mb-4"
          >
            <Activity size={16} /> Technical Specifications
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-white tracking-tighter italic leading-none">
            Built for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-pink-500 to-blue-500">
              Performance.
            </span>
          </h2>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className={`group relative p-6 sm:p-8 rounded-[2rem] bg-zinc-900/30 border border-white/5 transition-all duration-500 ${f.border} hover:bg-zinc-900/50`}
            >
              {/* Tag */}
              <span className="inline-block text-[9px] font-black uppercase tracking-widest text-zinc-600 border border-zinc-800 px-2 py-0.5 rounded-full mb-4">
                {f.tag}
              </span>

              <div className="relative z-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-black flex items-center justify-center mb-4 sm:mb-6 border border-white/5 group-hover:scale-110 transition-transform duration-500 shadow-xl">
                  {f.icon}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-2 sm:mb-3 tracking-tight italic">
                  {f.title}
                </h3>
                <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed font-medium group-hover:text-zinc-300 transition-colors">
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