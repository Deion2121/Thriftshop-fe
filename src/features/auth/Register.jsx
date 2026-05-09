import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { authService } from "./AuthServices";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await authService.register({
        email: email.trim(),
        password,
      });

      const res = await authService.login({
        email: email.trim(),
        password,
      });

      if (!res?.token || !res?.user) {
        throw new Error("Account created, but login failed");
      }

      login(res.user, res.token);
      navigate("/");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden px-4">
      <div className="absolute w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl top-10 left-10" />
      <div className="absolute w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl bottom-10 right-10" />

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[420px] p-8 sm:p-10 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-wide text-black">Create Account</h1>
          <p className="mt-2 text-sm text-gray-500">Join JThrift and start shopping.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-600">Email Address</label>
            <input
              type="email"
              placeholder="sample@example.com"
              className="w-full mt-2 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Password</label>
            <input
              type="password"
              placeholder="Minimum 6 characters"
              className="w-full mt-2 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Confirm Password</label>
            <input
              type="password"
              placeholder="Repeat password"
              className="w-full mt-2 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 rounded-xl bg-black text-white font-semibold hover:bg-yellow-500 hover:text-black transition duration-300 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full py-3 rounded-xl border border-black text-black font-semibold hover:bg-black hover:text-white transition duration-300"
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
