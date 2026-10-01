import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCode, Eye, EyeOff, ArrowRight, Chrome, Smartphone,
  CheckCircle2, Sparkles, Star, Users, Globe, Shield,
} from "lucide-react";

type AuthMode = "login" | "register";

function SocialAuthButton({
  provider,
  icon,
  label,
  onClick,
}: {
  provider: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 bg-white py-3.5 rounded-2xl text-sm font-semibold text-gray-700 hover:text-green-800 transition-all duration-200 disabled:opacity-60"
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
      ) : (
        icon
      )}
      {loading ? "Connecting..." : label}
    </button>
  );
}

// Google icon SVG
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

// Apple icon SVG
const AppleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.15-2.22 1.3-2.2 3.88.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.64M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

export default function AuthPage({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = onNavigate ?? (() => {});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get("auth_error");
    if (authError) {
      setErrorMessage(authError === "provider_not_configured"
        ? "This sign-in provider is not configured yet."
        : "Sign-in could not be completed. Please try again.");
      window.history.replaceState({}, "", window.location.pathname);
      return;
    }

    if (params.get("auth") === "success") {
      window.history.replaceState({}, "", window.location.pathname);
      setLoading(true);
      fetch("/api/auth/me", { credentials: "same-origin" })
        .then((response) => {
          if (!response.ok) throw new Error("Session could not be verified");
          setSuccess(true);
          window.setTimeout(() => navigate("dashboard"), 500);
        })
        .catch(() => setErrorMessage("Sign-in could not be completed. Please try again."))
        .finally(() => setLoading(false));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch(`/api/auth/${mode === "register" ? "register" : "login"}`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Unable to sign in.");
      setSuccess(true);
      window.setTimeout(() => navigate("dashboard"), 500);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col brand-gradient relative overflow-hidden">
        {/* Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="absolute inset-0 dot-pattern opacity-20" />

        <div className="relative z-10 flex flex-col justify-between p-12 h-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold text-white">OneQR</span>
          </div>

          {/* Main content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
                Your Business.<br />
                One QR Code.<br />
                <span className="text-green-200">Unlimited Growth.</span>
              </h2>
              <p className="text-green-100 text-lg leading-relaxed mb-8">
                Turn every customer scan into a review, a follow, or a sale.
              </p>

              {/* Feature pills */}
              <div className="space-y-3">
                {[
                  { icon: <Star className="w-4 h-4" />, text: "Boost Google Reviews instantly" },
                  { icon: <Users className="w-4 h-4" />, text: "Connect all social channels" },
                  { icon: <Globe className="w-4 h-4" />, text: "Analytics & growth insights" },
                  { icon: <Shield className="w-4 h-4" />, text: "Enterprise-grade security" },
                ].map((f) => (
                  <div key={f.text} className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center text-white">
                      {f.icon}
                    </div>
                    <span className="text-white/90 text-sm font-medium">{f.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Testimonial */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
            <div className="flex gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-300 text-yellow-300" />
              ))}
            </div>
            <p className="text-white/90 text-sm italic leading-relaxed">
              "OneQR doubled our Google reviews in one month! Customers love how easy it is to leave feedback."
            </p>
            <p className="text-green-200 text-xs mt-2 font-semibold">— Ahmed K., Café Owner · Cairo</p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex items-center justify-center p-6 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div className="w-9 h-9 rounded-xl brand-gradient flex items-center justify-center shadow-lg shadow-green-500/30">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">One<span className="text-gradient-green">QR</span></span>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 p-8">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-extrabold text-gray-900">
                {mode === "login" ? "Welcome back" : "Get started free"}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {mode === "login"
                  ? "Sign in to your OneQR dashboard"
                  : "Create your account in 30 seconds"}
              </p>
            </div>

            {/* Success state */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-8 text-center"
                >
                  <div className="w-16 h-16 brand-gradient rounded-full flex items-center justify-center shadow-xl shadow-green-500/30 mb-4">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">You're in!</h3>
                  <p className="text-gray-500 text-sm mt-1">Redirecting to your dashboard…</p>
                </motion.div>
              )}
            </AnimatePresence>

            {!success && (
              <>
                {/* Social auth */}
                <div className="space-y-3 mb-6">
                  <SocialAuthButton
                    provider="google"
                    icon={<GoogleIcon />}
                    label="Continue with Google"
                    onClick={() => window.location.assign("/api/auth/google")}
                  />
                  <SocialAuthButton
                    provider="apple"
                    icon={<AppleIcon />}
                    label="Continue with Apple"
                    onClick={() => window.location.assign("/api/auth/apple")}
                  />
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 font-medium">or with email</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Email form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === "register" && (
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Your Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                        placeholder="Your name"
                        required
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
                      />
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                      placeholder="you@business.com"
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Password</label>
                    <div className="relative">
                      <input
                        type={showPass ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete={mode === "login" ? "current-password" : "new-password"}
                        minLength={mode === "register" ? 12 : undefined}
                        placeholder="••••••••"
                        required
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPass ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                      </button>
                    </div>
                  </div>

                  {mode === "login" && (
                    <p className="text-xs text-gray-500">Use the provider you registered with, or sign in with your email and password.</p>
                  )}

                  {errorMessage && <p role="alert" className="text-sm font-medium text-red-600">{errorMessage}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full brand-gradient text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:scale-100"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        {mode === "login" ? "Sign In" : "Create Free Account"}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Toggle mode */}
                <p className="text-center text-sm text-gray-500 mt-5">
                  {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                  <button
                    onClick={() => setMode(mode === "login" ? "register" : "login")}
                    className="text-green-600 font-bold hover:underline"
                  >
                    {mode === "login" ? "Sign up free" : "Sign in"}
                  </button>
                </p>

                {mode === "register" && (
                  <p className="text-center text-xs text-gray-400 mt-3">
                    By signing up, you agree to our{" "}
                    <span className="text-green-600 cursor-pointer hover:underline">Terms</span> &{" "}
                    <span className="text-green-600 cursor-pointer hover:underline">Privacy Policy</span>
                  </p>
                )}
              </>
            )}
          </div>

          {/* Back to home */}
          <button
            onClick={() => navigate("landing")}
            className="mt-6 mx-auto flex items-center gap-2 text-sm text-gray-500 hover:text-green-600 transition-colors"
          >
            ← Back to homepage
          </button>
        </motion.div>
      </div>
    </div>
  );
}
