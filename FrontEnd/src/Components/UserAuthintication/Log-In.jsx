import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../services/firebase";
import api from "../../services/api";
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

  const handleLogin = async (e) => {
    e.preventDefault();
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();

    if (!isEmailValid || !isPasswordValid) return;

    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Firebase auth listener in UserContext handles the rest
      navigate("/Dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base selection:bg-brand-green selection:text-black flex items-center justify-center relative overflow-hidden font-sans text-zinc-900">
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[10%] left-[20%] w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, -100, 0], y: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[10%] right-[20%] w-[350px] h-[350px] bg-indigo-600/20 rounded-full blur-[100px]"
        />
      </div>

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
              className="w-full relative group py-3.5 mt-2 rounded-xl bg-white text-black font-semibold flex justify-center items-center overflow-hidden transition-all hover:bg-slate-200 active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="animate-spin text-slate-600" size={20} />
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
              className="text-[#1a1a1a]  hover:text-purple-400 transition-colors"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
