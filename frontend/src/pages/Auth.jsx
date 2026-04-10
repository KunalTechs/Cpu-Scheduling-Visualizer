import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../app/authSlice";
import { API_BASE } from "../config";

const Auth = ({ mode = "login" }) => {
  const dispatch = useDispatch();

  const [isLogin, setIsLogin] = useState(mode === "login");
  const [formData, setFormData] = useState({ username: "", password: "", email: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLogin(mode === "login");
    setError("");
  }, [mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const endpoint = isLogin ? "/login" : "/register";
    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : { email: formData.email, username: formData.username, password: formData.password };

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (response.ok) {
        if (isLogin) {
          const data = await response.json();
          dispatch(loginSuccess({ username: data.username, email: data.email }));
          window.location.href = "/dashboard";
        } else {
          setIsLogin(true);
          setFormData({ username: "", password: "", email: "" });
          setError("✓ Account created — please sign in");
        }
      } else {
        const errorData = await response.text();
        setError(errorData || "Authentication failed. Please try again.");
      }
    } catch (err) {
      console.error("Auth Error:", err);
      setError("Cannot reach server. Check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 sm:p-6 relative overflow-hidden text-white">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-zinc-950/50 backdrop-blur-2xl border border-zinc-800 p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-2xl">

          {/* Header */}
          <div className="text-center mb-6 sm:mb-10">
            <motion.div
              key={isLogin ? "login-icon" : "reg-icon"}
              initial={{ scale: 0.5, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              className="inline-flex p-3 sm:p-4 bg-zinc-900 rounded-2xl border border-zinc-800 mb-3 sm:mb-4 text-blue-500"
            >
              {isLogin ? <ShieldCheck size={28} /> : <Zap size={28} />}
            </motion.div>
            <h2 className="text-2xl sm:text-3xl font-black italic tracking-tighter text-white uppercase">
              {isLogin ? "Kernel " : "Create "}
              <span className="text-blue-500">{isLogin ? "Access" : "Account"}</span>
            </h2>
          </div>

          {/* Error / Success */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className={`mb-5 px-4 py-3 rounded-2xl text-xs font-bold text-center border ${
                  error.startsWith("✓")
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : "bg-red-500/10 border-red-500/20 text-red-400"
                }`}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">

            {/* Email */}
            <div className="relative group">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors"
                size={16}
              />
              <input
                type="email"
                required
                placeholder="EMAIL ADDRESS"
                value={formData.email}
                className="w-full bg-black border border-zinc-800 p-3.5 sm:p-4 pl-11 sm:pl-12 rounded-2xl text-white text-xs font-bold outline-none focus:border-blue-500 transition-all placeholder:text-zinc-700"
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>

            {/* Username — register only */}
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative group overflow-hidden"
                >
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors"
                    size={16}
                  />
                  <input
                    type="text"
                    required={!isLogin}
                    placeholder="CHOOSE USERNAME"
                    value={formData.username}
                    className="w-full bg-black border border-zinc-800 p-3.5 sm:p-4 pl-11 sm:pl-12 rounded-2xl text-white text-xs font-bold outline-none focus:border-blue-500 transition-all placeholder:text-zinc-700"
                    onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Password */}
            <div className="relative group">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors"
                size={16}
              />
              <input
                type="password"
                required
                placeholder="PASSWORD"
                value={formData.password}
                className="w-full bg-black border border-zinc-800 p-3.5 sm:p-4 pl-11 sm:pl-12 rounded-2xl text-white text-xs font-bold outline-none focus:border-blue-500 transition-all placeholder:text-zinc-700"
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 sm:py-4 bg-white text-black rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all mt-4 sm:mt-6 shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="animate-pulse">Processing...</span>
              ) : (
                <>
                  {isLogin ? "INITIALIZE SESSION" : "REGISTER USER"}
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setIsLogin((prev) => !prev);
              setError("");
              setFormData({ username: "", password: "", email: "" });
            }}
            className="w-full mt-6 sm:mt-8 text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-widest transition-colors"
          >
            {isLogin ? "Don't have an account? Create one" : "Already registered? Sign in"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;