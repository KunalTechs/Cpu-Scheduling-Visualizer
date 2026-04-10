import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Zap, BarChart3, Layers, Activity, Shield, GitBranch, Clock } from 'lucide-react';

const features = [
  {
    title: "Pick Your Algorithm",
    desc: "Choose from 7 real CPU scheduling algorithms — FCFS, Round Robin, SJF, SRTF, Priority (both modes), and HRRN. Switch instantly and re-run to see how each one handles your processes differently.",
    icon: <GitBranch className="text-blue-500" size={28} />,
    border: "group-hover:border-blue-500/50",
    tag: "Get Started"
  },
  {
    title: "Add Your Processes",
    desc: "Define your own process set with custom arrival times, burst times, and priorities. Add, edit, or remove processes at any time before running the simulation.",
    icon: <Cpu className="text-red-500" size={28} />,
    border: "group-hover:border-red-500/50",
    tag: "Input"
  },
  {
    title: "Watch It Execute",
    desc: "Hit Execute and watch an animated Gantt chart build itself in real time — showing exactly when each process runs, when the CPU goes idle, and how long each one takes.",
    icon: <BarChart3 className="text-pink-500" size={28} />,
    border: "group-hover:border-pink-500/50",
    tag: "Visualization"
  },
  {
    title: "Understand the Numbers",
    desc: "Every simulation gives you per-process stats — wait time, turnaround time, arrival, burst, and a CPU efficiency score — so you can understand exactly what the scheduler did and why.",
    icon: <Activity className="text-yellow-500" size={28} />,
    border: "group-hover:border-yellow-500/50",
    tag: "Results"
  },
  {
    title: "Compare All Algorithms",
    desc: "Not sure which algorithm is best for your workload? Run a benchmark — select multiple algorithms and compare their average wait time and turnaround time side by side on the same process set.",
    icon: <Zap className="text-orange-500" size={28} />,
    border: "group-hover:border-orange-500/50",
    tag: "Benchmark"
  },
  {
    title: "Save & Revisit Sessions",
    desc: "Archive any simulation to your account history and restore it later in one click. Your processes, results, and Gantt chart come back exactly as you left them.",
    icon: <Clock className="text-emerald-500" size={28} />,
    border: "group-hover:border-emerald-500/50",
    tag: "History"
  },
  {
    title: "Priority Control",
    desc: "Running a priority-based algorithm? Toggle between lower-is-better and higher-is-better priority modes directly from the process form — no restart needed.",
    icon: <Layers className="text-cyan-500" size={28} />,
    border: "group-hover:border-cyan-500/50",
    tag: "Configuration"
  },
  {
    title: "Your Data, Only Yours",
    desc: "Create a free account and your simulation history is private to you. Sessions are saved per-user so you can log in from any device and pick up where you left off.",
    icon: <Shield className="text-purple-500" size={28} />,
    border: "group-hover:border-purple-500/50",
    tag: "Account"
  }
];

const Features = () => {
  return (
    <section className="py-16 sm:py-24 bg-black relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">

        <div className="mb-12 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 text-zinc-500 font-bold tracking-[0.2em] uppercase text-xs mb-4"
          >
            <Activity size={16} /> What You Can Do
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-white tracking-tighter italic leading-none">
            Everything you <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-pink-500 to-blue-500">
              need to simulate.
            </span>
          </h2>
        </div>

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