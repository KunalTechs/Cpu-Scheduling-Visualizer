import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Terminal, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const CallToAction = () => {
  return (
    <section className="py-16 sm:py-24 bg-black relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative p-8 sm:p-12 md:p-20 rounded-[2rem] sm:rounded-[3rem] bg-indigo-900/10 border border-white/5 overflow-hidden group shadow-2xl"
        >
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:40px_40px]" />

          <div className="relative z-10 text-center flex flex-col items-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-black border border-white/10 flex items-center justify-center mb-6 sm:mb-8 shadow-inner">
              <Terminal className="text-blue-500" size={24} />
            </div>

            <h2 className="text-3xl sm:text-5xl md:text-7xl font-black text-white mb-4 sm:mb-6 tracking-tighter italic leading-none">
              Ready to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-pink-500">
                Benchmark?
              </span>
            </h2>

            <p className="text-zinc-500 text-base sm:text-lg md:text-xl mb-8 sm:mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
              Join developers visualizing complex C++ scheduling logic in real-time.
              Deploy your processes and watch the kernel take control.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-white text-black hover:bg-blue-500 hover:text-white rounded-2xl font-black text-lg sm:text-xl transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Launch Simulator <Zap size={18} className="fill-current" />
              </Link>

              <button className="text-zinc-400 font-bold flex items-center gap-2 hover:text-pink-600 transition-colors group text-sm sm:text-base">
                View Source Code
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToAction;