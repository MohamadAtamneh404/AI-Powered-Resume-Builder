import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../services/firebase";
import { UserContext } from "../../Context/UserContext";
import Logo from "../common/Logo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = () => {
    if (!email) {
      setEmailError("Email is required");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePassword = () => {
    if (!password) {
      setPasswordError("Password is required");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const { loginAsDemo } = useContext(UserContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (email && password) {
        await signInWithEmailAndPassword(auth, email, password);
        navigate("/Dashboard");
        setLoading(false);
        return;
      }
    } catch (err) {
      const msg = err.code === "auth/invalid-credential" || err.code === "auth/wrong-password"
        ? "Invalid email or password. Please try again."
        : (err.message || "Failed to sign in. Please check your credentials.");
      setError(msg);
      setLoading(false);
      return;
    }
    if (loginAsDemo) {
      loginAsDemo();
    }
    navigate("/Dashboard");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-bg-base selection:bg-brand-green selection:text-black flex items-center justify-center relative overflow-hidden font-sans text-zinc-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md p-8 sm:p-10"
      >
        <div className="flex justify-center mb-10">
          <Link
            to="/"
            className="inline-block transition-transform hover:scale-105"
          >
            <Logo size="lg" />
          </Link>
        </div>

        <div className="bg-white border border-black/[0.06] rounded-3xl p-8 sm:p-10 shadow-sm relative overflow-hidden">
          {/* Subtle top glare */}

          <div className="text-center mb-8">
            <h2 className="font-['Outfit'] text-3xl font-bold text-[#1a1a1a] mb-2">
              Welcome Back
            </h2>
            <p className="text-[#8e8e8e] text-sm">
              Sign in to continue to your dashboard
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl mb-6 text-center"
            >
              {error}
            </motion.div>
          )}

          <button
            type="button"
            onClick={() => {
              if (loginAsDemo) loginAsDemo();
              navigate("/Dashboard");
            }}
            className="w-full mb-5 py-3 px-4 bg-[#1a1a1a] dark:bg-white text-white dark:text-zinc-900 rounded-xl font-medium text-sm hover:opacity-90 transition flex items-center justify-center gap-2 shadow-sm"
          >
            🚀 Enter Demo Mode (Instant Access)
          </button>

          <div className="relative flex py-1 items-center mb-5">
            <div className="flex-grow border-t border-black/[0.08] dark:border-white/[0.08]"></div>
            <span className="flex-shrink mx-3 text-[11px] text-[#8e8e8e] uppercase font-mono tracking-wider">
              or sign in with email
            </span>
            <div className="flex-grow border-t border-black/[0.08] dark:border-white/[0.08]"></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-[#8e8e8e] mb-1.5 uppercase tracking-wider font-mono">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  id="login-email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-3.5 rounded-xl bg-[#EDEEF5]/60 border transition-all outline-none focus:ring-1 text-[#1a1a1a] ${
                    emailError
                      ? "border-red-500/50 focus:ring-red-500/20"
                      : "border-black/[0.08] focus:border-[#1a1a1a] focus:ring-black/10"
                  } text-[#1a1a1a] placeholder:text-zinc-400`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={validateEmail}
                  disabled={loading}
                />
              </div>
              {emailError && (
                <p className="text-red-400 text-xs mt-1.5 ml-1">{emailError}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8e8e8e] mb-1.5 uppercase tracking-wider font-mono">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  name="password"
                  id="login-password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-3.5 rounded-xl bg-[#EDEEF5]/60 border transition-all outline-none focus:ring-1 text-[#1a1a1a] ${
                    passwordError
                      ? "border-red-500/50 focus:ring-red-500/20"
                      : "border-black/[0.08] focus:border-[#1a1a1a] focus:ring-black/10"
                  } placeholder:text-zinc-400`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={validatePassword}
                  disabled={loading}
                />
              </div>
              {passwordError && (
                <p className="text-red-400 text-xs mt-1.5 ml-1">
                  {passwordError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative group py-3.5 mt-2 rounded-xl bg-[#1a1a1a] hover:bg-black text-white dark:bg-[#9fff00] dark:hover:bg-[#8fee00] dark:text-black font-semibold flex justify-center items-center overflow-hidden transition-all shadow-md active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin text-white dark:text-black" size={20} />
              ) : (
                <span className="flex items-center gap-2">
                  Sign In{" "}
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </span>
              )}
            </button>
          </form>

          <p className="text-slate-400 text-sm text-center mt-8">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-[#1a1a1a] font-semibold hover:underline decoration-[#9fff00] decoration-2 underline-offset-4 transition-all"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
