import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../services/firebase";
import api from "../../services/api";
import { UserContext } from "../../Context/UserContext";
import Modal from "./Modal.jsx";
import VerifyEmailContent from "./VerifyEmailPage.jsx";
import Logo from "../common/Logo";

import manAvatar from "../../assets/man.png";
import womanAvatar from "../../assets/woman.png";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [gender, setGender] = useState("other");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  const [isVerificationModalOpen, setVerificationModalOpen] = useState(false);
  const [emailToVerify, setEmailToVerify] = useState("");

  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  const isValidEmailFormat = (email) => {
    const emailRegex =
      /^[^s@]+@[^s@]+.(com|org|net|io|co\.il|gov|edu|me|tech)$/i;
    return emailRegex.test(email);
  };

  const validateName = () => {
    if (!name) {
      setNameError("Name is required");
      return false;
    }
    setNameError("");
    return true;
  };

  const validateEmail = () => {
    if (!email) {
      setEmailError("Email is required");
      return false;
    }
    if (!isValidEmailFormat(email)) {
      setEmailError("Invalid email format");
      return false;
    }
    setEmailError("");
    return true;
  };

  const isValidPassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar
    );
  };

  const validatePassword = () => {
    if (!password) {
      setPasswordError("Password is required");
      return false;
    }
    if (!isValidPassword(password)) {
      setPasswordError(
        "Password must be 8+ characters and include uppercase, lowercase, a number, and a special character.",
      );
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();

    if (!isNameValid || !isEmailValid || !isPasswordValid) return;

    setLoading(true);
    setError("");

    try {
      let photo = "";
      if (photoFile) {
        photo = await toBase64(photoFile);
      }

      // Create Firebase User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Optionally update Firebase profile
      await updateProfile(userCredential.user, {
        displayName: name,
        photoURL: photo || (gender === "female" ? womanAvatar : manAvatar)
      });

      // Still create the user record in your own MongoDB backend 
      // (auth middleware will let it pass or we can make a public register route that accepts uid)
      // Actually, since we're replacing the backend auth, we'll create the user via api 
      // after they have a valid token!
      const token = await userCredential.user.getIdToken();
      localStorage.setItem("token", token);
      
      await api.post("/users/register", {
        fullName: name,
        email,
        password, // not strictly needed anymore, but keeps schema happy for now
        gender,
        photo,
        uid: userCredential.user.uid
      });

      // Navigate straight to dashboard since email verification is handled by Firebase (if configured)
      navigate("/Dashboard");
    } catch (err) {
      setError(err.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base selection:bg-brand-green selection:text-black flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans text-zinc-900">
      <div className="w-full max-w-md bg-white rounded-3xl border border-black/[0.06] p-8 sm:p-10 shadow-sm relative z-10">
        <div className="flex justify-center mb-8">
          <Link
            to="/"
            className="inline-block transition-transform hover:scale-105"
          >
            <Logo size="lg" />
          </Link>
        </div>

        <h2 className="font-['Outfit'] text-3xl font-bold text-[#1a1a1a] mb-2 text-center">
          Create Account
        </h2>
        <p className="text-[#8e8e8e] text-sm text-center mb-8">
          Sign up to start building your AI Resume
        </p>

        {error && (
          <p className="text-red-500 text-center mb-4 text-xs font-semibold">
            {error}
          </p>
        )}

        <form className="space-y-5" onSubmit={handleSignUp}>
          <div>
            <label className="block text-xs font-medium text-[#8e8e8e] mb-1.5 uppercase tracking-wider font-mono">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              id="signup-name"
              autoComplete="name"
              placeholder="Your Name"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#EDEEF5]/60 border border-black/[0.08] text-[#1a1a1a] placeholder:text-zinc-400 focus:outline-none focus:border-[#1a1a1a] focus:ring-1 focus:ring-black/10 transition"
              value={name}
              onChange={(e) => {
                const value = e.target.value;
                setName(value);
                if (!value) setNameError("Name is required");
                else setNameError("");
              }}
              required
            />
            {nameError && (
              <p className="text-red-500 text-xs mt-1">{nameError}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8e8e8e] mb-1.5 uppercase tracking-wider font-mono">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="signup-email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#EDEEF5]/60 border border-black/[0.08] text-[#1a1a1a] placeholder:text-zinc-400 focus:outline-none focus:border-[#1a1a1a] focus:ring-1 focus:ring-black/10 transition"
              value={email}
              onChange={(e) => {
                const value = e.target.value;
                setEmail(value);
                if (!value) setEmailError("Email is required");
                else if (!isValidEmailFormat(value))
                  setEmailError("Invalid email format");
                else setEmailError("");
              }}
              required
            />
            {emailError && (
              <p className="text-red-500 text-xs mt-1">{emailError}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8e8e8e] mb-1.5 uppercase tracking-wider font-mono">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="signup-password"
              autoComplete="new-password"
              placeholder="********"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#EDEEF5]/60 border border-black/[0.08] text-[#1a1a1a] placeholder:text-zinc-400 focus:outline-none focus:border-[#1a1a1a] focus:ring-1 focus:ring-black/10 transition"
              value={password}
              onChange={(e) => {
                const value = e.target.value;
                setPassword(value);
                if (!value) setPasswordError("Password is required");
                else if (!isValidPassword(value))
                  setPasswordError(
                    "Password must be 8+ characters with uppercase, lowercase, number, and special character.",
                  );
                else setPasswordError("");
              }}
              required
            />
            {passwordError && (
              <p className="text-red-500 text-xs mt-1">{passwordError}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8e8e8e] mb-1.5 uppercase tracking-wider font-mono">
              Gender
            </label>
            <select
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#EDEEF5]/60 border border-black/[0.08] text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] focus:ring-1 focus:ring-black/10 cursor-pointer"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Prefer not to say</option>
            </select>
            <div className="flex items-center gap-3 mt-2 text-xs text-[#8e8e8e]">
              <span>Default avatar:</span>
              <img
                src={manAvatar}
                alt="Male"
                className="h-5 w-5 rounded-full"
              />
              <img
                src={womanAvatar}
                alt="Female"
                className="h-5 w-5 rounded-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8e8e8e] mb-1.5 uppercase tracking-wider font-mono">
              Photo (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              className="w-full text-xs text-[#8e8e8e]"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setPhotoFile(file || null);
                if (file) {
                  const url = URL.createObjectURL(file);
                  setPhotoPreview(url);
                } else {
                  setPhotoPreview("");
                }
              }}
            />
            {photoPreview && (
              <div className="mt-2">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="h-12 w-12 rounded-full object-cover border border-black/[0.08]"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1a1a1a] hover:bg-black text-white font-medium py-3.5 px-6 rounded-full shadow-sm transition hover:scale-[1.01] cursor-pointer mt-2 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account →"}
          </button>
        </form>

        <p className="text-[#8e8e8e] text-center mt-6 text-xs">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#1a1a1a] font-semibold underline underline-offset-4"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
