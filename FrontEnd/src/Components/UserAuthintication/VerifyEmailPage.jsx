import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const VerifyEmailContent = ({ email, onClose, setUser }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) return setError("Email not found.");

    setLoading(true);
    try {
      const res = await api.post("/users/verify-email", {
        email,
        verificationCode: code,
      });
      const { token, message: successMessage } = res.data;

      setMessage(successMessage + " Logging you in...");

      // --- Start Auto-Login Logic ---
      localStorage.setItem("token", token); // Save token

      // Fetch full user info using the new token
      const userRes = await api.get("/users/me");

      setUser(userRes.data); // Set user in global context

      // Close modal and navigate to dashboard after a short delay
      setTimeout(() => {
        onClose();
        navigate("/Dashboard");
      }, 2000);
      // --- End Auto-Login Logic ---
    } catch (err) {
      setError(
        err.response?.data?.message || "Verification failed. Please try again.",
      );
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-white text-center mb-4">
        Verify Your Email
      </h2>
      <p className="text-gray-400 text-center mb-6">
        Enter the code sent to <span className="font-medium">{email}</span>.
      </p>

      {error && <p className="text-red-500 text-center mb-3">{error}</p>}
      {message && <p className="text-green-500 text-center mb-3">{message}</p>}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Verification Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          disabled={loading || !!message}
          className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-[#9fff00]"
        />
        <button
          type="submit"
          disabled={loading || !!message}
          className="w-full py-2 rounded-lg bg-[#1a1a1a] dark:bg-[#9fff00] hover:bg-[#1a1a1a] dark:bg-[#9fff00] text-white font-semibold transition flex justify-center items-center"
        >
          {loading ? "Verifying..." : "Verify & Log In"}
        </button>
      </form>
    </>
  );
};

export default VerifyEmailContent;
