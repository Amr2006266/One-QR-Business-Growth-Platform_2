import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCode, Star, BarChart3, TrendingUp, Users, Link, Gift,
  Settings, LogOut, Bell, Plus, Edit3, Eye, Download, Copy,
  MapPin, Phone, Instagram, Facebook, Globe, MessageCircle,
  ChevronRight, ArrowUpRight, CheckCircle2, AlertCircle,
  Zap, Music2, Calendar, Clock, MoreHorizontal, Trash2,
  Shield, CreditCard, ChevronDown, Home, PieChart,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell,
} from "recharts";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const WEEKLY_SCANS = [
  { day: "Mon", scans: 42, clicks: 65 },
  { day: "Tue", scans: 58, clicks: 87 },
  { day: "Wed", scans: 45, clicks: 71 },
  { day: "Thu", scans: 72, clicks: 105 },
  { day: "Fri", scans: 88, clicks: 132 },
  { day: "Sat", scans: 94, clicks: 141 },
  { day: "Sun", scans: 61, clicks: 95 },
];

const LINK_CLICKS = [
  { name: "Google Review", clicks: 1240, color: "#f59e0b", pct: 32 },
  { name: "Google Maps", clicks: 876, color: "#3b82f6", pct: 23 },
  { name: "WhatsApp", clicks: 562, color: "#22c55e", pct: 15 },
  { name: "Instagram", clicks: 445, color: "#a855f7", pct: 12 },
  { name: "Facebook", clicks: 320, color: "#2563eb", pct: 8 },
  { name: "Other", clicks: 387, color: "#94a3b8", pct: 10 },
];

const SOCIAL_LINKS = [
  { id: "1", platform: "Google Review", icon: <Star className="w-4 h-4 text-yellow-500" />, bg: "bg-yellow-50", clicks: 1240, isActive: true },
  { id: "2", platform: "Google Maps", icon: <MapPin className="w-4 h-4 text-blue-500" />, bg: "bg-blue-50", clicks: 876, isActive: true },
  { id: "3", platform: "WhatsApp", icon: <MessageCircle className="w-4 h-4 text-green-500" />, bg: "bg-green-50", clicks: 562, isActive: true },
  { id: "4", platform: "Instagram", icon: <Instagram className="w-4 h-4 text-purple-500" />, bg: "bg-purple-50", clicks: 445, isActive: true },
  { id: "5", platform: "Facebook", icon: <Facebook className="w-4 h-4 text-blue-600" />, bg: "bg-blue-50", clicks: 320, isActive: true },
  { id: "6", platform: "TikTok", icon: <Music2 className="w-4 h-4 text-gray-800" />, bg: "bg-gray-50", clicks: 280, isActive: false },
  { id: "7", platform: "Website", icon: <Globe className="w-4 h-4 text-slate-600" />, bg: "bg-slate-50", clicks: 210, isActive: true },
];

const OFFERS = [
  { id: "1", emoji: "🎁", title: "Buy 1 Get 1 Free", desc: "On all specialty drinks", expiresAt: "Tonight", isActive: true },
  { id: "2", emoji: "☕", title: "Free Coffee with Cake", desc: "Any cake slice + Americano", expiresAt: "This week", isActive: true },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { key: "overview", icon: <Home className="w-5 h-5" />, label: "Overview" },
  { key: "analytics", icon: <BarChart3 className="w-5 h-5" />, label: "Analytics" },
  { key: "profile", icon: <QrCode className="w-5 h-5" />, label: "My QR & Profile" },
  { key: "links", icon: <Link className="w-5 h-5" />, label: "Links" },
  { key: "offers", icon: <Gift className="w-5 h-5" />, label: "Offers" },
  { key: "settings", icon: <Settings className="w-5 h-5" />, label: "Settings" },
];

function Sidebar({ active, onNav, onSignOut }: { active: string; onNav: (k: string) => void; onSignOut?: () => void }) {
  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-100 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl brand-gradient flex items-center justify-center shadow-md shadow-green-500/30">
            <QrCode className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">
            One<span className="text-gradient-green">QR</span>
          </span>
        </div>
      </div>

      {/* Business pill */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3 bg-green-50 rounded-xl px-3 py-2.5">
          <div className="w-9 h-9 brand-gradient rounded-xl flex items-center justify-center text-xl">☕</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">Brew House Cairo</p>
            <p className="text-xs text-green-600 font-medium">Pro Plan</p>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => onNav(item.key)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
              active === item.key
                ? "brand-gradient text-white shadow-lg shadow-green-500/25"
                : "text-gray-600 hover:bg-green-50 hover:text-green-700"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 space-y-1">
        <div className="px-3 py-3 bg-green-50 rounded-xl">
          <p className="text-xs font-bold text-green-800 mb-0.5">Subscription Active</p>
          <p className="text-xs text-green-600">Renews Oct 30, 2025</p>
        </div>
        <button onClick={onSignOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors">
          <LogOut className="w-5 h-5" /> Sign Out
        </button>
      </div>
    </aside>
  );
}

// ─── Header ────────────────────────────────────────────────────────────────────
function DashboardHeader({ title, onPreview }: { title: string; onPreview: () => void }) {
  return (
    <div className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
      <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      <div className="flex items-center gap-3">
        <button className="relative p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-xl transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full" />
        </button>
        <button
          onClick={onPreview}
          className="flex items-center gap-2 text-sm font-semibold text-green-700 bg-green-50 border border-green-200 px-4 py-2 rounded-xl hover:bg-green-100 transition-colors"
        >
          <Eye className="w-4 h-4" /> Preview Profile
        </button>
        <div className="w-9 h-9 rounded-xl brand-gradient flex items-center justify-center text-white text-sm font-bold">
          A
        </div>
      </div>
    </div>
  );
}

// ─── Overview Tab ──────────────────────────────────────────────────────────────
function OverviewTab() {
  const stats = [
    {
      label: "Total QR Scans",
      value: "2,847",
      change: "+23%",
      positive: true,
      icon: <QrCode className="w-5 h-5 text-green-600" />,
      bg: "brand-gradient-soft",
    },
    {
      label: "Link Clicks",
      value: "4,830",
      change: "+18%",
      positive: true,
      icon: <TrendingUp className="w-5 h-5 text-blue-600" />,
      bg: "bg-blue-50",
    },
    {
      label: "Google Reviews",
      value: "248",
      change: "+12 this month",
      positive: true,
      icon: <Star className="w-5 h-5 text-yellow-500" />,
      bg: "bg-yellow-50",
    },
    {
      label: "Avg. Rating",
      value: "4.9 ★",
      change: "↑ 0.1 pts",
      positive: true,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-green-200 hover:shadow-lg hover:shadow-green-50 transition-all"
          >
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              {s.icon}
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            <span className={`text-xs font-semibold mt-1 inline-block ${s.positive ? "text-green-600" : "text-red-500"}`}>
              {s.change}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-900">Weekly Activity</h3>
              <p className="text-sm text-gray-500 mt-0.5">QR Scans & Link Clicks</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> Scans
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-400 inline-block" /> Clicks
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={WEEKLY_SCANS}>
              <defs>
                <linearGradient id="scansGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="clicksGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "white",
                  border: "1px solid #d1fae5",
                  borderRadius: "12px",
                  fontSize: "12px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                }}
              />
              <Area type="monotone" dataKey="scans" stroke="#22c55e" strokeWidth={2.5} fill="url(#scansGrad)" />
              <Area type="monotone" dataKey="clicks" stroke="#60a5fa" strokeWidth={2.5} fill="url(#clicksGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top links pie */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-1">Top Links</h3>
          <p className="text-sm text-gray-500 mb-5">Click distribution</p>
          <div className="flex justify-center mb-4">
            <RechartsPieChart width={140} height={140}>
              <Pie data={LINK_CLICKS} cx={70} cy={70} innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="clicks">
                {LINK_CLICKS.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
            </RechartsPieChart>
          </div>
          <div className="space-y-2">
            {LINK_CLICKS.slice(0, 4).map((l) => (
              <div key={l.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: l.color }} />
                  <span className="text-xs text-gray-600 truncate max-w-[90px]">{l.name}</span>
                </div>
                <span className="text-xs font-bold text-gray-900">{l.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Recent Activity</h3>
          <button className="text-xs text-green-600 font-semibold hover:underline">View All</button>
        </div>
        <div className="divide-y divide-gray-50">
          {[
            { icon: <Star className="w-4 h-4 text-yellow-500" />, bg: "bg-yellow-50", text: "New 5-star Google Review", time: "2 min ago" },
            { icon: <QrCode className="w-4 h-4 text-green-600" />, bg: "bg-green-50", text: "QR Code scanned × 8", time: "15 min ago" },
            { icon: <Instagram className="w-4 h-4 text-purple-500" />, bg: "bg-purple-50", text: "Instagram link clicked × 3", time: "1 hour ago" },
            { icon: <MapPin className="w-4 h-4 text-blue-500" />, bg: "bg-blue-50", text: "Maps direction opened × 5", time: "2 hours ago" },
          ].map((a, i) => (
            <div key={i} className="px-6 py-3.5 flex items-center gap-3 hover:bg-gray-50/50 transition-colors">
              <div className={`w-8 h-8 ${a.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>{a.icon}</div>
              <p className="flex-1 text-sm text-gray-700">{a.text}</p>
              <span className="text-xs text-gray-400">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── QR Profile Tab ────────────────────────────────────────────────────────────
function QRProfileTab() {
  const [copied, setCopied] = useState(false);
  const profileUrl = "oneqr.app/b/brewhousecairo";

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* QR Code */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 flex flex-col items-center">
          <h3 className="font-bold text-gray-900 mb-6">Your QR Code</h3>
          {/* Fake QR */}
          <div className="w-48 h-48 bg-white border-4 border-green-500 rounded-2xl p-3 shadow-xl shadow-green-500/10 relative">
            <div className="w-full h-full grid grid-cols-7 gap-0.5">
              {Array.from({ length: 49 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-sm"
                  style={{
                    background: [0,1,2,3,4,5,6,7,13,14,20,21,27,28,34,35,41,42,43,44,45,46,47,48,
                      8,12,15,19,22,26,29,33,36,40,16,23,30,17,24,10,18,25,32,39,11,9].includes(i)
                      ? "#15803d" : "transparent"
                  }}
                />
              ))}
            </div>
            {/* Center logo */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 brand-gradient rounded-xl flex items-center justify-center text-white shadow-lg">
                <QrCode className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-6 bg-gray-50 rounded-xl px-4 py-2.5 w-full">
            <Globe className="w-4 h-4 text-gray-400" />
            <span className="flex-1 text-sm text-gray-600 truncate">{profileUrl}</span>
            <button onClick={handleCopy} className="text-green-600 hover:text-green-700">
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex gap-3 mt-4 w-full">
            <button className="flex-1 flex items-center justify-center gap-2 brand-gradient text-white text-sm font-semibold py-2.5 rounded-xl">
              <Download className="w-4 h-4" /> Download PNG
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-200 transition-colors">
              <Eye className="w-4 h-4" /> Preview
            </button>
          </div>
        </div>

        {/* Profile edit */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-gray-900">Business Profile</h3>
            <button className="flex items-center gap-1.5 text-sm text-green-600 font-semibold hover:underline">
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
          </div>

          {[
            { label: "Business Name", value: "Brew House Cairo" },
            { label: "Category", value: "Café" },
            { label: "Phone", value: "+20 100 123 4567" },
            { label: "Address", value: "42 Tahrir Square, Cairo" },
            { label: "Google Maps URL", value: "maps.google.com/..." },
            { label: "Google Review URL", value: "g.page/r/..." },
          ].map((f) => (
            <div key={f.label} className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{f.label}</label>
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5">
                <span className="text-sm text-gray-700 truncate">{f.value}</span>
                <Edit3 className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Links Tab ────────────────────────────────────────────────────────────────
function LinksTab() {
  const [links, setLinks] = useState(SOCIAL_LINKS);

  const toggleLink = (id: string) => {
    setLinks(prev => prev.map(l => l.id === id ? { ...l, isActive: !l.isActive } : l));
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900">Your Links</h3>
          <p className="text-sm text-gray-500">Manage links shown on your QR profile</p>
        </div>
        <button className="brand-gradient text-white text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-green-500/20">
          <Plus className="w-4 h-4" /> Add Link
        </button>
      </div>

      <div className="space-y-3">
        {links.map((link, i) => (
          <motion.div
            key={link.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-white rounded-2xl border p-4 flex items-center gap-4 ${
              link.isActive ? "border-gray-100" : "border-gray-100 opacity-60"
            }`}
          >
            <div className={`w-10 h-10 ${link.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              {link.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm">{link.platform}</p>
              <p className="text-xs text-gray-500">{link.clicks.toLocaleString()} clicks total</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleLink(link.id)}
                className={`w-10 h-5 rounded-full transition-all duration-200 ${
                  link.isActive ? "bg-green-500" : "bg-gray-200"
                } relative`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${
                  link.isActive ? "left-5" : "left-0.5"
                }`} />
              </button>
              <button className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                <Edit3 className="w-4 h-4" />
              </button>
              <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Offers Tab ────────────────────────────────────────────────────────────────
function OffersTab() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900">Active Offers</h3>
          <p className="text-sm text-gray-500">Promotions visible on your QR profile</p>
        </div>
        <button className="brand-gradient text-white text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-green-500/20">
          <Plus className="w-4 h-4" /> New Offer
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {OFFERS.map((offer, i) => (
          <motion.div
            key={offer.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-4xl">{offer.emoji}</div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-green-700">Active</span>
              </div>
            </div>
            <h4 className="font-bold text-amber-900">{offer.title}</h4>
            <p className="text-sm text-amber-700 mt-1">{offer.desc}</p>
            <div className="flex items-center gap-1.5 mt-3">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs text-amber-600 font-medium">Expires: {offer.expiresAt}</span>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="flex-1 text-xs font-semibold py-2 bg-white border border-amber-200 text-amber-800 rounded-xl hover:bg-amber-50 transition-colors">
                Edit
              </button>
              <button className="flex-1 text-xs font-semibold py-2 bg-red-50 border border-red-100 text-red-600 rounded-xl hover:bg-red-100 transition-colors">
                Deactivate
              </button>
            </div>
          </motion.div>
        ))}

        {/* Add offer card */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.02 }}
          className="border-2 border-dashed border-green-200 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 text-green-400 hover:border-green-400 hover:text-green-600 hover:bg-green-50 transition-all"
        >
          <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
            <Plus className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-sm text-green-700">Add New Offer</p>
            <p className="text-xs text-green-500 mt-0.5">Create a promotion for customers</p>
          </div>
        </motion.button>
      </div>
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────
function SettingsTab() {
  return (
    <div className="p-8 space-y-6 max-w-2xl">
      <h3 className="font-bold text-gray-900">Account Settings</h3>

      {/* Subscription */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              <h4 className="font-bold text-green-900">Pro Plan</h4>
            </div>
            <p className="text-sm text-green-700 mt-1">Renews October 30, 2025</p>
          </div>
          <button className="text-sm font-semibold text-green-700 bg-white border border-green-200 px-4 py-2 rounded-xl hover:bg-green-50 transition-colors">
            Manage
          </button>
        </div>
      </div>

      {/* Profile settings */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h4 className="font-semibold text-gray-900">Profile</h4>
        </div>
        {[
          { label: "Business Name", value: "Brew House Cairo" },
          { label: "Email", value: "owner@brewhousecairo.com" },
          { label: "Phone", value: "+20 100 123 4567" },
        ].map((f) => (
          <div key={f.label} className="px-5 py-3.5 border-b border-gray-50 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
            <div>
              <p className="text-xs text-gray-500">{f.label}</p>
              <p className="text-sm font-medium text-gray-900">{f.value}</p>
            </div>
            <Edit3 className="w-4 h-4 text-gray-300" />
          </div>
        ))}
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h4 className="font-semibold text-gray-900">Notifications</h4>
        </div>
        {[
          { label: "New Google Review", sub: "Get notified on each new review" },
          { label: "Weekly Analytics Report", sub: "Summary every Monday" },
          { label: "Subscription Reminders", sub: "30 days before renewal" },
        ].map((n, i) => (
          <div key={n.label} className="px-5 py-3.5 border-b border-gray-50 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">{n.label}</p>
              <p className="text-xs text-gray-500">{n.sub}</p>
            </div>
            <button className={`w-10 h-5 rounded-full relative transition-all duration-200 ${i < 2 ? "bg-green-500" : "bg-gray-200"}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${i < 2 ? "left-5" : "left-0.5"}`} />
            </button>
          </div>
        ))}
      </div>

      {/* Danger zone */}
      <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
        <h4 className="font-bold text-red-800 mb-1">Danger Zone</h4>
        <p className="text-sm text-red-600 mb-4">Irreversible actions — be careful!</p>
        <div className="flex gap-3">
          <button className="text-sm font-semibold text-red-700 bg-white border border-red-200 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors">
            Cancel Subscription
          </button>
          <button className="text-sm font-semibold text-red-700 bg-white border border-red-200 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function BusinessDashboard({ onNavigate, onSignOut }: { onNavigate?: (page: string) => void; onSignOut?: () => void }) {
  const [activeTab, setActiveTab] = useState("overview");

  const tabTitles: Record<string, string> = {
    overview: "Overview",
    analytics: "Analytics",
    profile: "My QR & Profile",
    links: "Links",
    offers: "Offers",
    settings: "Settings",
  };

  const handlePreview = () => {
    if (onNavigate) onNavigate("profile");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar active={activeTab} onNav={setActiveTab} onSignOut={onSignOut} />

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader title={tabTitles[activeTab] || "Dashboard"} onPreview={handlePreview} />

        <div className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "overview" && <OverviewTab />}
              {activeTab === "analytics" && <OverviewTab />}
              {activeTab === "profile" && <QRProfileTab />}
              {activeTab === "links" && <LinksTab />}
              {activeTab === "offers" && <OffersTab />}
              {activeTab === "settings" && <SettingsTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
