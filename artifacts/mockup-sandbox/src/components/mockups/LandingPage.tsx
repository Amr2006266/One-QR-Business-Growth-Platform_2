import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCode, Star, MapPin, Instagram, Facebook, Globe, MessageCircle,
  Zap, BarChart3, Shield, ArrowRight, Check, ChevronDown,
  Phone, TrendingUp, Users, Sparkles, Play, Menu, X,
  Music2, Youtube, Twitter
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.4, 0.25, 1] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

// ─── Nav ─────────────────────────────────────────────────────────────────────
function Navbar({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/90 backdrop-blur-xl shadow-sm border-b border-green-100" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl brand-gradient flex items-center justify-center shadow-lg shadow-green-500/30">
              <QrCode className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              One<span className="text-gradient-green">QR</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {["Features", "How It Works", "Pricing", "About"].map((item) => (
              <button
                key={item}
                className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors"
              >
                {item}
              </button>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => onNavigate("auth")}
              className="text-sm font-semibold text-gray-700 hover:text-green-600 transition-colors px-4 py-2"
            >
              Sign In
            </button>
            <button
              onClick={() => onNavigate("auth")}
              className="brand-gradient text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:scale-105 transition-all duration-200"
            >
              Get Started Free
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-green-100 px-4 py-4 space-y-3"
          >
            {["Features", "How It Works", "Pricing"].map((item) => (
              <button key={item} className="block w-full text-left text-sm font-medium text-gray-700 py-2">
                {item}
              </button>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              <button onClick={() => onNavigate("auth")} className="w-full text-sm font-semibold py-2.5 border border-green-200 text-green-700 rounded-xl">
                Sign In
              </button>
              <button onClick={() => onNavigate("auth")} className="w-full brand-gradient text-white text-sm font-semibold py-2.5 rounded-xl">
                Get Started Free
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <section className="relative min-h-screen hero-gradient dot-pattern overflow-hidden flex items-center">
      {/* Decorative blobs */}
      <div className="absolute top-20 right-0 w-96 h-96 rounded-full bg-green-300/20 blur-3xl -z-0 float-animation" />
      <div className="absolute bottom-20 left-0 w-80 h-80 rounded-full bg-green-200/30 blur-3xl -z-0" style={{ animationDelay: "1.5s" }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            {/* Badge */}
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-green-600" />
              <span className="text-xs font-semibold text-green-700">Smart QR Business Platform</span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl lg:text-6xl xl:text-7xl font-extrabold text-gray-900 leading-tight mb-6">
              One QR.<br />
              <span className="text-gradient-green">Every</span>thing<br />
              Your Business.
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg text-gray-600 leading-relaxed mb-8 max-w-lg">
              Turn one QR code into your complete digital storefront — Google Reviews,
              Social Media, Maps, Offers, and more. No tech skills needed.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 mb-12">
              <button
                onClick={() => onNavigate("auth")}
                className="brand-gradient text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
              >
                Create Your QR Free <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate("profile")}
                className="flex items-center justify-center gap-2 text-gray-700 font-semibold px-8 py-4 rounded-2xl border-2 border-gray-200 hover:border-green-300 hover:text-green-700 transition-all duration-200 bg-white/70 backdrop-blur-sm"
              >
                <Play className="w-4 h-4 text-green-600" /> See Demo
              </button>
            </motion.div>

            {/* Social proof */}
            <motion.div variants={fadeUp} className="flex items-center gap-6">
              <div className="flex -space-x-2">
                {["#4ade80", "#22c55e", "#16a34a", "#15803d", "#166534"].map((color, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: color }}
                  >
                    {["A", "B", "C", "D", "E"][i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="ml-1 text-sm font-bold text-gray-900">4.9</span>
                </div>
                <p className="text-xs text-gray-500">Trusted by 2,400+ businesses</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right — Phone mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
            className="flex justify-center lg:justify-end"
          >
            <PhoneMockup onNavigate={onNavigate} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function PhoneMockup({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <div className="relative">
      {/* Glow */}
      <div className="absolute inset-0 brand-gradient rounded-[3rem] blur-2xl opacity-20 scale-90" />

      {/* Phone frame */}
      <div className="relative w-72 bg-gray-900 rounded-[3rem] p-3 shadow-2xl shadow-green-500/20 qr-scan-animation">
        <div className="bg-white rounded-[2.4rem] overflow-hidden">
          {/* Status bar */}
          <div className="bg-white px-6 pt-3 pb-1 flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-800">9:41</span>
            <div className="flex gap-1">
              <div className="w-3 h-1.5 bg-gray-800 rounded-sm" />
              <div className="w-1 h-1.5 bg-gray-800 rounded-sm" />
            </div>
          </div>

          {/* Cover */}
          <div className="relative h-28 brand-gradient flex items-end px-5 pb-3">
            <div className="absolute top-3 right-5 w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">☕</span>
            </div>
            <div>
              <p className="text-white/70 text-xs">Welcome to</p>
              <h3 className="text-white font-bold text-lg leading-tight">Brew House Cairo</h3>
            </div>
          </div>

          {/* Profile content */}
          <div className="bg-white px-4 pt-4 pb-6 space-y-3">
            {/* Rating */}
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-xs font-bold text-gray-700">4.9</span>
              <span className="text-xs text-gray-400">(248 reviews)</span>
            </div>

            {/* Action buttons */}
            <button className="w-full py-2.5 brand-gradient text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-500/30">
              <Star className="w-3.5 h-3.5" /> Leave Google Review ⭐
            </button>

            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: <MapPin className="w-3.5 h-3.5" />, label: "Maps", color: "bg-blue-50 text-blue-600" },
                { icon: <Phone className="w-3.5 h-3.5" />, label: "Call", color: "bg-green-50 text-green-600" },
                { icon: <MessageCircle className="w-3.5 h-3.5" />, label: "WhatsApp", color: "bg-emerald-50 text-emerald-600" },
              ].map(({ icon, label, color }) => (
                <div key={label} className={`${color} rounded-xl py-2 flex flex-col items-center gap-1`}>
                  {icon}
                  <span className="text-xs font-semibold">{label}</span>
                </div>
              ))}
            </div>

            {/* Social row */}
            <div className="flex items-center gap-2 justify-center pt-1">
              {[
                { icon: <Instagram className="w-4 h-4" />, color: "bg-gradient-to-br from-purple-500 to-pink-500" },
                { icon: <Facebook className="w-4 h-4" />, color: "bg-blue-600" },
                { icon: <Music2 className="w-4 h-4" />, color: "bg-gray-900" },
                { icon: <Youtube className="w-4 h-4" />, color: "bg-red-600" },
              ].map(({ icon, color }, i) => (
                <div key={i} className={`${color} text-white w-8 h-8 rounded-xl flex items-center justify-center shadow-sm`}>
                  {icon}
                </div>
              ))}
            </div>

            {/* Offer badge */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-center gap-2">
              <span className="text-lg">🎁</span>
              <div>
                <p className="text-xs font-bold text-amber-800">Today's Offer</p>
                <p className="text-xs text-amber-600">Buy 1 Get 1 Free on all drinks!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badges */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 3, delay: 0.5 }}
        className="absolute -right-8 top-20 glass-card rounded-2xl px-3 py-2 shadow-xl"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-800">New Review!</p>
            <p className="text-xs text-gray-500">★★★★★ Loved it</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 3.5, delay: 1 }}
        className="absolute -left-10 bottom-24 glass-card rounded-2xl px-3 py-2 shadow-xl"
      >
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-xs font-bold text-gray-800">+47 scans today</p>
            <p className="text-xs text-green-600">↑ 23% vs yesterday</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────
function StatsSection() {
  const stats = [
    { value: "2,400+", label: "Active Businesses", icon: <Users className="w-5 h-5 text-green-600" /> },
    { value: "1.2M+", label: "QR Scans", icon: <QrCode className="w-5 h-5 text-green-600" /> },
    { value: "340K+", label: "Google Reviews", icon: <Star className="w-5 h-5 text-green-600" /> },
    { value: "99.9%", label: "Uptime", icon: <Shield className="w-5 h-5 text-green-600" /> },
  ];

  return (
    <section className="py-12 bg-white border-y border-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="flex justify-center mb-2">{s.icon}</div>
              <p className="text-3xl font-extrabold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────
function FeaturesSection() {
  const features = [
    {
      icon: <QrCode className="w-6 h-6 text-green-600" />,
      title: "One QR Code",
      desc: "Single code links to Google Reviews, social media, maps, and more. Print once, use everywhere.",
      bg: "brand-gradient-soft",
    },
    {
      icon: <Star className="w-6 h-6 text-yellow-500" />,
      title: "Google Review Boost",
      desc: "One tap to leave a review. Guide customers directly to your Google review page.",
      bg: "bg-yellow-50",
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-blue-600" />,
      title: "Smart Analytics",
      desc: "See scan counts, popular links, and engagement trends in real-time.",
      bg: "bg-blue-50",
    },
    {
      icon: <MapPin className="w-6 h-6 text-red-500" />,
      title: "Google Maps Ready",
      desc: "Customers find you instantly with one-tap navigation to your location.",
      bg: "bg-red-50",
    },
    {
      icon: <Zap className="w-6 h-6 text-purple-600" />,
      title: "Live Offers",
      desc: "Push special offers and promotions directly to customers who scan your code.",
      bg: "bg-purple-50",
    },
    {
      icon: <Shield className="w-6 h-6 text-green-700" />,
      title: "Secure & Reliable",
      desc: "Enterprise-grade security with 99.9% uptime. Your business never goes offline.",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-1.5 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs font-semibold text-green-700">Everything You Need</span>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
            Built for <span className="text-gradient-green">Local Business</span> Growth
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-gray-500 max-w-2xl mx-auto">
            OneQR combines everything your business needs into one powerful QR experience.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group p-6 rounded-2xl border border-gray-100 bg-white hover:border-green-200 hover:shadow-xl hover:shadow-green-50 transition-all duration-300"
            >
              <div className={`w-12 h-12 ${f.bg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
function HowItWorksSection({ onNavigate }: { onNavigate: (page: string) => void }) {
  const steps = [
    {
      num: "01",
      title: "Create Your Profile",
      desc: "Sign up and build your digital business profile in under 5 minutes.",
      icon: <Users className="w-6 h-6" />,
    },
    {
      num: "02",
      title: "Get Your QR Code",
      desc: "Download your unique QR code and place it anywhere — tables, doors, packaging.",
      icon: <QrCode className="w-6 h-6" />,
    },
    {
      num: "03",
      title: "Customers Scan & Engage",
      desc: "Customers scan once and access all your channels — reviews, maps, social, and more.",
      icon: <Phone className="w-6 h-6" />,
    },
    {
      num: "04",
      title: "Watch Your Business Grow",
      desc: "Track engagement, gather reviews, and optimize your customer experience.",
      icon: <TrendingUp className="w-6 h-6" />,
    },
  ];

  return (
    <section className="py-24 hero-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-green-100 border border-green-200 rounded-full px-4 py-1.5 mb-4">
            <Zap className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs font-semibold text-green-700">Simple & Fast</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
            Up & Running in <span className="text-gradient-green">Minutes</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            No technical knowledge needed. Set up your OneQR profile and start growing today.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative text-center"
            >
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-green-200 z-0" />
              )}
              <div className="relative z-10">
                <div className="w-16 h-16 brand-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/25 text-white">
                  {step.icon}
                </div>
                <div className="text-xs font-black text-green-400 mb-1">{step.num}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => onNavigate("auth")}
            className="brand-gradient text-white font-bold px-10 py-4 rounded-2xl shadow-xl shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105 transition-all duration-200 inline-flex items-center gap-2"
          >
            Start for Free <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────────
function PricingSection({ onNavigate }: { onNavigate: (page: string) => void }) {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      desc: "Perfect to get started",
      features: [
        "1 QR Code",
        "Digital business profile",
        "Social media links",
        "Google Maps integration",
        "Basic customization",
      ],
      cta: "Start Free",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$12",
      period: "/month",
      desc: "For growing businesses",
      features: [
        "Everything in Free",
        "Advanced analytics dashboard",
        "5 QR Codes",
        "Custom branding & colors",
        "Live offers & promotions",
        "Priority support",
      ],
      cta: "Start Pro Trial",
      highlighted: true,
    },
    {
      name: "Business",
      price: "$39",
      period: "/month",
      desc: "For multiple locations",
      features: [
        "Everything in Pro",
        "Unlimited QR Codes",
        "Multiple branches",
        "Team management",
        "AI business insights",
        "API integrations",
        "Dedicated support",
      ],
      cta: "Contact Sales",
      highlighted: false,
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-1.5 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs font-semibold text-green-700">Simple Pricing</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
            Plans That <span className="text-gradient-green">Scale With You</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Start free, upgrade when you're ready. No contracts, cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-3xl p-8 ${
                plan.highlighted
                  ? "brand-gradient text-white shadow-2xl shadow-green-500/30 scale-105"
                  : "bg-white border-2 border-gray-100 hover:border-green-200"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-black px-4 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}
              <div className="mb-6">
                <h3 className={`text-lg font-bold mb-1 ${plan.highlighted ? "text-white" : "text-gray-900"}`}>
                  {plan.name}
                </h3>
                <p className={`text-xs mb-4 ${plan.highlighted ? "text-green-100" : "text-gray-500"}`}>{plan.desc}</p>
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-extrabold ${plan.highlighted ? "text-white" : "text-gray-900"}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm ${plan.highlighted ? "text-green-100" : "text-gray-500"}`}>{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      plan.highlighted ? "bg-white/20" : "bg-green-50"
                    }`}>
                      <Check className={`w-3 h-3 ${plan.highlighted ? "text-white" : "text-green-600"}`} />
                    </div>
                    <span className={`text-sm ${plan.highlighted ? "text-green-50" : "text-gray-600"}`}>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => onNavigate("auth")}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                  plan.highlighted
                    ? "bg-white text-green-700 hover:bg-green-50 shadow-lg"
                    : "brand-gradient text-white hover:shadow-lg hover:shadow-green-500/25"
                }`}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Banner ────────────────────────────────────────────────────────────────
function CTABanner({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative brand-gradient rounded-3xl p-12 text-center overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4" />

          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <QrCode className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl font-extrabold text-white mb-4">
              Ready to Grow Your Business?
            </h2>
            <p className="text-green-100 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of businesses already using OneQR to connect with customers and grow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onNavigate("auth")}
                className="bg-white text-green-700 font-bold px-10 py-4 rounded-2xl hover:bg-green-50 hover:scale-105 transition-all duration-200 shadow-xl inline-flex items-center gap-2"
              >
                Create Free Account <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate("profile")}
                className="border-2 border-white/30 text-white font-bold px-10 py-4 rounded-2xl hover:bg-white/10 transition-all duration-200"
              >
                View Demo Profile
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl brand-gradient flex items-center justify-center">
                <QrCode className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">One<span className="text-green-400">QR</span></span>
            </div>
            <p className="text-sm leading-relaxed">
              The smart QR business growth platform for local businesses.
            </p>
          </div>

          {[
            { title: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
            { title: "Company", links: ["About", "Blog", "Careers", "Press"] },
            { title: "Support", links: ["Help Center", "Contact", "Privacy", "Terms"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-white font-semibold mb-4 text-sm">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <button className="text-sm hover:text-green-400 transition-colors">{link}</button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm">© 2025 OneQR. All rights reserved.</p>
          <p className="text-sm text-green-500">Built with ❤️ for local businesses</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Landing Page ─────────────────────────────────────────────────────────
export default function LandingPage({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const navigate = onNavigate ?? (() => {});

  return (
    <div className="min-h-screen">
      <Navbar onNavigate={navigate} />
      <Hero onNavigate={navigate} />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection onNavigate={navigate} />
      <PricingSection onNavigate={navigate} />
      <CTABanner onNavigate={navigate} />
      <Footer />
    </div>
  );
}
