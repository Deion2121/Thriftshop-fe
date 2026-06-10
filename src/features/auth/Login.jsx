import React, { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { authService } from "./AuthServices";
import logo from "../../assets/flogo.png";
import clip from "../../assets/clip.mp4";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const canSubmit = useMemo(
    () => email.trim().length > 0 && password.length > 0 && !loading,
    [email, loading, password]
  );

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!canSubmit) return;

    setLoading(true);
    setError("");

    try {
      const res = await authService.login({
        email: email.trim(),
        password,
      });

      if (!res?.user) {
        throw new Error("Invalid login response from server");
      }

      login(res.user);
      navigate(res.user.role === "admin" ? "/admin" : "/");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-black text-white lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden lg:block">
        <video
          src={clip}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative z-10 flex h-full flex-col justify-between p-10">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex w-fit items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-white/80 transition hover:text-white"
          >
            <ArrowLeft size={15} /> Back to shop
          </button>

          <div className="max-w-xl pb-8">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">Admin and member access</p>
            <h1 className="mt-4 text-6xl font-black uppercase leading-[0.9] tracking-tight">
              Sign in to JThrift
            </h1>
            <p className="mt-5 text-sm leading-7 text-white/70">
              Manage inventory, continue shopping, and keep your thrift finds ready across sessions.
            </p>
          </div>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between">
            <button type="button" onClick={() => navigate("/")} className="lg:hidden">
              <ArrowLeft size={22} />
            </button>
            <img src={logo} alt="JThrift" className="h-12" />
          </div>

          <div className="border border-white/10 bg-white p-6 text-black shadow-2xl sm:p-8">
            <div className="mb-8">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">Welcome back</p>
              <h2 className="mt-2 text-3xl font-black uppercase tracking-tight">Log In</h2>
              <p className="mt-2 text-sm text-gray-500">Use your account details to continue.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <label className="block">
                <span className="text-xs font-black uppercase tracking-widest text-gray-500">Email Address</span>
                <div className="mt-2 flex h-12 items-center border border-gray-200 px-3 focus-within:border-black">
                  <Mail size={17} className="mr-3 text-gray-400" />
                  <input
                    type="email"
                    placeholder="sample@example.com"
                    className="h-full w-full bg-transparent text-sm outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-xs font-black uppercase tracking-widest text-gray-500">Password</span>
                <div className="mt-2 flex h-12 items-center border border-gray-200 px-3 focus-within:border-black">
                  <Lock size={17} className="mr-3 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="h-full w-full bg-transparent text-sm outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="text-gray-400 transition hover:text-black"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </label>

              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex h-12 w-full items-center justify-center gap-3 bg-black text-xs font-black uppercase tracking-[0.25em] text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign In"} {!loading && <ArrowRight size={15} />}
              </button>

              <button
                type="button"
                onClick={() => navigate("/register")}
                className="h-12 w-full border border-black text-xs font-black uppercase tracking-[0.25em] transition hover:bg-black hover:text-white"
              >
                Create Account
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-white/45">
            Copyright 2026 JThrift. All rights reserved.
          </p>
        </div>
      </section>
    </main>
  );
};

export default Login;
