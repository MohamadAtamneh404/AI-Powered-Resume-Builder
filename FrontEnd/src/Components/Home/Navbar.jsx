import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "../../Context/UserContext";
import ThemeToggle from "../../Context/ThemeToggle";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useUser();

  const navLinks = [
    { name: "templates", href: "#templates" },
    { name: "ats scanner", href: "/create-resume" },
    { name: "bullet rewriter", href: "#features" },
    { name: "pricing", href: "#cta" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 py-6 md:py-10 bg-gradient-to-b from-[#f1f1f1]/80 dark:from-[#0f0f12]/90 to-transparent backdrop-blur-[2px] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-12 items-center">
        {/* Left: Cols 1-3 */}
        <div className="col-span-6 md:col-span-3 flex items-center gap-2.5">
          <Link to="/" className="flex items-center gap-2.5 group">
            {/* Geometric Clover / Flower SVG icon */}
            <svg
              className="w-5 h-5 md:w-6 md:h-6 fill-[#1a1a1a] dark:fill-white transition-transform duration-300 group-hover:rotate-45"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2C9.79 2 8 3.79 8 6c0 1.25.57 2.36 1.46 3.09C8.36 9.57 7.25 9 6 9c-2.21 0-4 1.79-4 4s1.79 4 4 4c1.25 0 2.36-.57 3.09-1.46C9.57 16.36 9 17.47 9 18.72 9 20.93 10.79 22.72 13 22.72s4-1.79 4-4c0-1.25-.57-2.36-1.46-3.09 1.1-.48 2.21-1.05 3.46-1.05 2.21 0 4-1.79 4-4s-1.79-4-4-4c-1.25 0-2.36.57-3.09 1.46C15.43 8.36 16 7.25 16 6c0-2.21-1.79-4-4-4zm0 2c1.1 0 2 .9 2 2 0 1.1-.9 2-2 2s-2-.9-2-2c0-1.1.9-2 2-2zM6 11c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm7 9.72c-1.1 0-2-.9-2-2 0-1.1.9-2 2-2s2 .9 2 2c0 1.1-.9 2-2 2zm5-7.72c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z" />
            </svg>
            <span className="font-['Outfit'] text-xl font-bold tracking-tight text-[#1a1a1a] dark:text-white lowercase">
              resu<span className="text-[#8e8e8e]">·</span>ai
            </span>
          </Link>
        </div>

        {/* Center: Cols 4-9 (Desktop only) */}
        <nav className="hidden md:flex md:col-span-6 items-center justify-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-xs lg:text-sm font-medium lowercase text-[#8e8e8e] hover:text-[#1a1a1a] dark:hover:text-white transition-colors tracking-wide"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right: Cols 10-12 */}
        <div className="col-span-6 md:col-span-3 flex items-center justify-end gap-3 md:gap-4">
          <ThemeToggle />

          {user ? (
            <>
              <Link
                to="/dashboard"
                className="hidden sm:inline-block text-xs lg:text-sm font-medium lowercase text-[#1a1a1a] dark:text-zinc-200 hover:opacity-75 transition-opacity"
              >
                dashboard
              </Link>
              <button
                onClick={async () => {
                  await logout();
                  navigate("/login");
                }}
                className="bg-[#1a1a1a] text-white hover:bg-black dark:bg-[#9fff00] dark:text-black dark:hover:bg-[#8fee00] text-xs lg:text-sm font-medium px-5 py-2.5 rounded-full transition-all duration-200 hover:scale-[1.02] shadow-sm flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <span>sign out</span>
                <span className="text-xs">→</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden sm:inline-block text-xs lg:text-sm font-medium lowercase text-[#1a1a1a] dark:text-zinc-200 hover:opacity-75 transition-opacity"
              >
                sign in
              </Link>
              <button
                onClick={() => navigate("/register")}
                className="bg-[#1a1a1a] text-white hover:bg-black dark:bg-[#9fff00] dark:text-black dark:hover:bg-[#8fee00] text-xs lg:text-sm font-medium px-5 py-2.5 rounded-full transition-all duration-200 hover:scale-[1.02] shadow-sm flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <span>get started</span>
                <span className="text-xs">→</span>
              </button>
            </>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1.5 focus:outline-none z-50"
            aria-label="Toggle Menu"
          >
            <motion.span
              animate={
                mobileMenuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }
              }
              className="w-5 h-0.5 bg-[#1a1a1a] dark:bg-white block rounded-full origin-center transition-transform"
            />
            <motion.span
              animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
              className="w-5 h-0.5 bg-[#1a1a1a] dark:bg-white block rounded-full transition-opacity"
            />
            <motion.span
              animate={
                mobileMenuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }
              }
              className="w-5 h-0.5 bg-[#1a1a1a] dark:bg-white block rounded-full origin-center transition-transform"
            />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden overflow-hidden bg-[#EDEEF5]/95 dark:bg-[#0f0f12]/95 backdrop-blur-xl border-b border-black/[0.06] dark:border-white/[0.08] px-8 py-6"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-medium lowercase text-[#1a1a1a] dark:text-zinc-100 hover:text-[#8e8e8e] transition-colors py-1"
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.08] flex flex-col gap-3">
                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm font-medium lowercase text-[#1a1a1a] dark:text-zinc-200 py-1"
                    >
                      dashboard
                    </Link>
                    <button
                      onClick={async () => {
                        setMobileMenuOpen(false);
                        await logout();
                        navigate("/login");
                      }}
                      className="bg-[#1a1a1a] dark:bg-[#9fff00] text-white dark:text-black text-center text-sm font-medium py-2.5 rounded-full mt-1 cursor-pointer"
                    >
                      sign out →
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm font-medium lowercase text-[#1a1a1a] dark:text-zinc-200 py-1"
                    >
                      sign in
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="bg-[#1a1a1a] dark:bg-[#9fff00] text-white dark:text-black text-center text-sm font-medium py-2.5 rounded-full mt-1 cursor-pointer"
                    >
                      get started →
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
