import { useMemo, useState, useRef, useEffect, useContext } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../Context/UserContext";
import ThemeToggle from "../../Context/ThemeToggle";
import manAvatar from "../../assets/man.png";
import womanAvatar from "../../assets/woman.png";
import {
  Shield,
  Sparkles,
  LogOut,
  Settings as SettingsIcon,
  LayoutDashboard,
  Briefcase,
  FileText,
} from "lucide-react";

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isEditor = location.pathname.toLowerCase().startsWith("/create-resume");

  const navItems = useMemo(
    () => [
      {
        label: "Dashboard",
        href: "/Dashboard",
        icon: <LayoutDashboard size={15} />,
      },
      {
        label: "Job Tracker",
        href: "/JobTracker",
        icon: <Briefcase size={15} />,
      },
      {
        label: "Create Resume",
        href: "/create-resume",
        icon: <Sparkles size={15} />,
      },
      {
        label: "Templates",
        href: "/resume-examples",
        icon: <FileText size={15} />,
      },
      {
        label: "Settings",
        href: "/settings",
        icon: <SettingsIcon size={15} />,
      },
    ],
    [],
  );

  return (
    <div
      className={`min-h-screen bg-bg-base text-zinc-900 dark:bg-[#0f0f12] dark:text-zinc-100 selection:bg-brand-green selection:text-black font-sans transition-colors duration-200 ${
        isEditor ? "h-screen flex flex-col overflow-hidden" : ""
      }`}
    >
      {/* Top Floating Architectural Glass Nav */}
      <header className="sticky top-0 z-40 w-full py-3 px-4 sm:px-8 bg-gradient-to-b from-[#EDEEF5]/95 to-[#EDEEF5]/70 dark:from-[#0f0f12]/95 dark:to-[#0f0f12]/70 backdrop-blur-md border-b border-black/[0.05] dark:border-white/[0.08] shrink-0 transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo with Geometric Clover */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <svg
              className="w-5 h-5 fill-[#1a1a1a] dark:fill-white transition-transform duration-300 group-hover:rotate-45"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2C9.79 2 8 3.79 8 6c0 1.25.57 2.36 1.46 3.09C8.36 9.57 7.25 9 6 9c-2.21 0-4 1.79-4 4s1.79 4 4 4c1.25 0 2.36-.57 3.09-1.46C9.57 16.36 9 17.47 9 18.72 9 20.93 10.79 22.72 13 22.72s4-1.79 4-4c0-1.25-.57-2.36-1.46-3.09 1.1-.48 2.21-1.05 3.46-1.05 2.21 0 4-1.79 4-4s-1.79-4-4-4c-1.25 0-2.36.57-3.09 1.46C15.43 8.36 16 7.25 16 6c0-2.21-1.79-4-4-4zm0 2c1.1 0 2 .9 2 2 0 1.1-.9 2-2 2s-2-.9-2-2c0-1.1.9-2 2-2zM6 11c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm7 9.72c-1.1 0-2-.9-2-2 0-1.1.9-2 2-2s2 .9 2 2c0 1.1-.9 2-2 2zm5-7.72c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z" />
            </svg>
            <span className="font-['Outfit'] text-lg font-bold tracking-tight text-[#1a1a1a] dark:text-white lowercase">
              resu<span className="text-[#8e8e8e]">·</span>ai
            </span>
          </Link>

          {/* Center Pill Links */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-full border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
            {navItems.map((item) => {
              const active =
                location.pathname.toLowerCase() === item.href.toLowerCase();
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                    active
                      ? "bg-[#1a1a1a] text-white dark:bg-white dark:text-black shadow-xs font-semibold"
                      : "text-[#8e8e8e] dark:text-zinc-400 hover:text-[#1a1a1a] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Actions & User Profile */}
          <div className="flex items-center gap-2.5">
            <ThemeToggle />

            {!isEditor && (
              <button
                onClick={() => navigate("/create-resume")}
                className="hidden sm:flex items-center gap-1.5 bg-[#9fff00] hover:bg-[#8ee600] text-[#1a1a1a] font-semibold text-xs px-3.5 py-1.5 rounded-full shadow-xs transition-all duration-200 hover:scale-[1.02] cursor-pointer"
              >
                <Sparkles size={13} />
                <span>New Resume</span>
              </button>
            )}
            <UserDropdown />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      {isEditor ? (
        <main className="flex-1 w-full overflow-hidden flex flex-col">
          {children}
        </main>
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 pb-24 md:pb-6">
          {children}
        </main>
      )}

      {/* Mobile Bottom Navigation Bar (Casey's Thumb Zone) */}
      {!isEditor && (
        <nav
          aria-label="Mobile navigation"
          className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0f0f12]/95 backdrop-blur-md border-t border-black/[0.08] dark:border-white/[0.08] flex md:hidden items-center justify-around py-2 px-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-lg transition-colors"
        >
          {navItems.map((item) => {
            const active =
              location.pathname.toLowerCase() === item.href.toLowerCase();
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl min-w-[54px] text-[10px] font-medium transition-colors ${
                  active
                    ? "text-[#1a1a1a] dark:text-white font-semibold"
                    : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}
              >
                <div
                  className={`p-1 rounded-lg transition-colors ${
                    active
                      ? "bg-black/[0.06] dark:bg-white/[0.1] text-brand-green-dark dark:text-brand-green"
                      : ""
                  }`}
                >
                  {item.icon}
                </div>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}

function UserDropdown() {
  const { user, setUser, logout } = useContext(UserContext);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onDocClick = (e) => {
      if (!open) return;
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const handleLogout = async () => {
    try {
      if (logout) {
        await logout();
      }
      localStorage.removeItem("token");
      setUser?.(null);
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      navigate("/login");
    }
  };

  const genderNorm = (user?.gender || "").toString().trim().toLowerCase();
  const defaultAvatar = genderNorm === "female" ? womanAvatar : manAvatar;

  const formatPhoto = (photo) => {
    if (!photo) return null;
    return photo.startsWith("data:") ? photo : `data:image/png;base64,${photo}`;
  };

  let avatarSrc =
    user?.photo && user.photo.trim() !== ""
      ? formatPhoto(user.photo)
      : defaultAvatar;

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 p-1 pl-2.5 rounded-full bg-white dark:bg-zinc-900 border border-black/[0.08] dark:border-white/[0.1] hover:border-black/[0.18] dark:hover:border-white/[0.2] transition-all shadow-xs focus:outline-none"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="text-xs font-medium text-[#1a1a1a] dark:text-zinc-100 max-w-[100px] truncate hidden sm:inline">
          {user?.fullName || "My Account"}
        </span>
        <div className="h-7 w-7 rounded-full overflow-hidden bg-gray-100 dark:bg-zinc-800 border border-black/[0.06] dark:border-white/[0.1]">
          <img
            src={avatarSrc}
            alt="User avatar"
            className="h-full w-full object-cover"
            onError={(e) => {
              e.target.src = defaultAvatar;
            }}
          />
        </div>
      </button>

      {open && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-zinc-900 border border-black/[0.08] dark:border-white/[0.1] shadow-lg dark:shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
          role="menu"
        >
          <div className="px-4 py-2.5 border-b border-black/[0.06] dark:border-white/[0.08]">
            <p className="text-xs font-semibold text-[#1a1a1a] dark:text-zinc-100 truncate font-['Outfit']">
              {user?.fullName || "Active Candidate"}
            </p>
            <p className="text-[11px] text-[#8e8e8e] dark:text-zinc-400 truncate mt-0.5">
              {user?.email || ""}
            </p>
          </div>

          <div className="py-1">
            <button
              onClick={() => {
                setOpen(false);
                navigate("/Dashboard");
              }}
              className="w-full text-left px-4 py-2 text-xs text-[#1a1a1a] dark:text-zinc-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] flex items-center gap-2 transition-colors"
            >
              <LayoutDashboard
                size={14}
                className="text-[#8e8e8e] dark:text-zinc-400"
              />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => {
                setOpen(false);
                navigate("/settings");
              }}
              className="w-full text-left px-4 py-2 text-xs text-[#1a1a1a] dark:text-zinc-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] flex items-center gap-2 transition-colors"
            >
              <SettingsIcon
                size={14}
                className="text-[#8e8e8e] dark:text-zinc-400"
              />
              <span>Settings</span>
            </button>
          </div>

          <div className="border-t border-black/[0.06] dark:border-white/[0.08] pt-1 mt-1">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-2 font-medium transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
