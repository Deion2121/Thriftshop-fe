import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { otpService } from "./AuthServices";
import { ArrowLeft, ArrowRight, Lock, Mail, Shield } from "lucide-react";
import logo from "../../assets/flogo.png";
import clip from "../../assets/clip.mp4";

const Register = () => {
  const [step, setStep] = useState("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await otpService.sendOtp(email.trim());
      setStep("otp");
      startCooldown();
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const startCooldown = () => {
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp.trim() || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const registerRes = await otpService.registerWithOtp(email.trim(), password, otp.trim());

      const loginRes = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/users/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      if (!loginRes.ok) {
        throw new Error("Account created, but auto-login failed");
      }

      const loginData = await loginRes.json();
      login(loginData.user);
      navigate("/");
    } catch (err) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setError("");

    try {
      await otpService.sendOtp(email.trim());
      setOtp("");
      startCooldown();
    } catch (err) {
      setError(err.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCredentials = () => {
    setStep("credentials");
    setOtp("");
    setError("");
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

          <div className="max-w-xl pb-80">
            <h1 className="mb-9 text-4xl font-black uppercase leading-[0.9] tracking-tight">
              Sign up to 
            </h1>
            <h2 className="mt-12 text-8xl text-center font-serif text-slate-400 uppercase leading-0 tracking-tight">
              JThrift 
            </h2>
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
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">
                {step === "credentials" ? "New account" : "Verify email"}
              </p>
              <h2 className="mt-2 text-3xl font-black uppercase tracking-tight">
                {step === "credentials" ? "Register" : "Enter OTP"}
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                {step === "credentials"
                  ? "Use a real email and a password with at least 8 characters."
                  : `We sent a 6-digit code to ${email}.`}
              </p>
            </div>

            {error && (
              <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {step === "credentials" ? (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <label className="block">
                  <span className="text-xs font-black uppercase tracking-widest text-gray-500">Email Address</span>
                  <div className="mt-2 flex h-12 items-center border border-gray-200 px-3 focus-within:border-black">
                    <Mail size={17} className="mr-3 text-gray-400" />
                    <input
                      type="email"
                      placeholder="sample@example.com"
                      className="h-full w-full bg-transparent text-sm text-gray-700 outline-none"
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
                      type="password"
                      placeholder="Minimum 8 characters"
                      className="h-full w-full bg-transparent text-sm text-gray-700 outline-none"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      minLength={8}
                      required
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="text-xs font-black uppercase tracking-widest text-gray-500">Confirm Password</span>
                  <div className="mt-2 flex h-12 items-center border border-gray-200 px-3 focus-within:border-black">
                    <Lock size={17} className="mr-3 text-gray-400" />
                    <input
                      type="password"
                      placeholder="Repeat password"
                      className="h-full w-full bg-transparent text-sm outline-none"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      minLength={8}
                      required
                    />
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-12 w-full items-center justify-center gap-3 bg-black text-xs font-black uppercase tracking-[0.25em] text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send OTP"} {!loading && <ArrowRight size={15} />}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="h-12 w-full border border-black text-xs font-black uppercase tracking-[0.25em] transition hover:bg-black hover:text-white"
                >
                  Back to Login
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <label className="block">
                  <span className="text-xs font-black uppercase tracking-widest text-gray-500">Verification Code</span>
                  <div className="mt-2 flex h-14 items-center border border-gray-200 px-4 focus-within:border-black">
                    <Shield size={20} className="mr-3 text-gray-400" />
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      className="h-full w-full bg-transparent text-2xl font-bold tracking-[0.5em] outline-none"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      required
                    />
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-12 w-full items-center justify-center gap-3 bg-black text-xs font-black uppercase tracking-[0.25em] text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify & Create Account"} {!loading && <ArrowRight size={15} />}
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading || resendCooldown > 0}
                  className="h-12 w-full border border-gray-300 text-xs font-black uppercase tracking-[0.25em] text-gray-600 transition hover:border-black hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : "Resend OTP"}
                </button>

                <button
                  type="button"
                  onClick={handleBackToCredentials}
                  className="h-12 w-full border border-black text-xs font-black uppercase tracking-[0.25em] transition hover:bg-black hover:text-white"
                >
                  Back
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Register;
