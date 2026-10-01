import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCode, Star, MapPin, Instagram, Facebook, Globe, MessageCircle,
  Phone, Share2, ChevronRight, Check, Heart, ExternalLink,
  Music2, Youtube, Twitter, Copy, Gift, Clock, Navigation
} from "lucide-react";

interface SocialLink {
  platform: string;
  label: string;
  url: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  clicks: number;
}

interface Offer {
  id: string;
  emoji: string;
  title: string;
  description: string;
  expiresAt?: string;
}

const MOCK_BUSINESS = {
  name: "Brew House Cairo",
  description: "Premium coffee & artisan bakes in the heart of Cairo. Est. 2019.",
  category: "Café",
  phone: "+20 100 123 4567",
  address: "42 Tahrir Square, Downtown Cairo",
  rating: 4.9,
  reviewCount: 248,
  primaryColor: "#16a34a",
  logoEmoji: "☕",
  coverGradient: "linear-gradient(135deg, #15803d 0%, #22c55e 60%, #86efac 100%)",
};

const MOCK_LINKS: SocialLink[] = [
  {
    platform: "google_review",
    label: "Leave Google Review",
    url: "#",
    icon: <Star className="w-5 h-5" />,
    color: "text-white",
    bgColor: "bg-gradient-to-r from-yellow-400 to-orange-400",
    clicks: 1240,
  },
  {
    platform: "google_maps",
    label: "Get Directions",
    url: "#",
    icon: <Navigation className="w-5 h-5" />,
    color: "text-white",
    bgColor: "bg-gradient-to-r from-blue-500 to-blue-600",
    clicks: 876,
  },
  {
    platform: "whatsapp",
    label: "Chat on WhatsApp",
    url: "#",
    icon: <MessageCircle className="w-5 h-5" />,
    color: "text-white",
    bgColor: "bg-gradient-to-r from-green-500 to-emerald-500",
    clicks: 562,
  },
  {
    platform: "instagram",
    label: "@brewhousecairo",
    url: "#",
    icon: <Instagram className="w-5 h-5" />,
    color: "text-white",
    bgColor: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400",
    clicks: 445,
  },
  {
    platform: "facebook",
    label: "Follow on Facebook",
    url: "#",
    icon: <Facebook className="w-5 h-5" />,
    color: "text-white",
    bgColor: "bg-blue-600",
    clicks: 320,
  },
  {
    platform: "tiktok",
    label: "@brewhousecairo",
    url: "#",
    icon: <Music2 className="w-5 h-5" />,
    color: "text-white",
    bgColor: "bg-gray-900",
    clicks: 280,
  },
  {
    platform: "website",
    label: "Visit Our Website",
    url: "#",
    icon: <Globe className="w-5 h-5" />,
    color: "text-white",
    bgColor: "bg-gradient-to-r from-slate-600 to-slate-700",
    clicks: 210,
  },
  {
    platform: "phone",
    label: "Call Us Now",
    url: "#",
    icon: <Phone className="w-5 h-5" />,
    color: "text-white",
    bgColor: "bg-gradient-to-r from-green-600 to-green-700",
    clicks: 195,
  },
];

const MOCK_OFFERS: Offer[] = [
  {
    id: "1",
    emoji: "🎁",
    title: "Buy 1 Get 1 Free",
    description: "On all specialty drinks — today only!",
    expiresAt: "Today at midnight",
  },
  {
    id: "2",
    emoji: "☕",
    title: "Free Coffee with Cake",
    description: "Order any cake slice and get a free Americano.",
    expiresAt: "This week",
  },
];

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
      <span className="font-bold text-gray-800">{rating}</span>
      <span className="text-gray-400 text-sm">({count} reviews)</span>
    </div>
  );
}

function LinkButton({ link, index }: { link: SocialLink; index: number }) {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(true);
    setTimeout(() => setClicked(false), 1200);
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.4 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={handleClick}
      className={`w-full ${link.bgColor} rounded-2xl px-5 py-4 flex items-center gap-4 shadow-lg hover:shadow-xl transition-all duration-200 relative overflow-hidden`}
    >
      {/* Shimmer on click */}
      <AnimatePresence>
        {clicked && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-white/20"
            style={{ transform: "skewX(-20deg)" }}
          />
        )}
      </AnimatePresence>

      <div className={`w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center ${link.color} flex-shrink-0`}>
        {link.icon}
      </div>
      <span className={`flex-1 text-left font-semibold text-sm ${link.color}`}>
        {link.label}
      </span>
      <div className={`${link.color} opacity-60`}>
        {clicked ? <Check className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </div>
    </motion.button>
  );
}

function OfferCard({ offer, index }: { offer: Offer; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 * index }}
      className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3"
    >
      <div className="text-3xl flex-shrink-0">{offer.emoji}</div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-amber-900 text-sm">{offer.title}</h4>
        <p className="text-amber-700 text-xs mt-0.5">{offer.description}</p>
        {offer.expiresAt && (
          <div className="flex items-center gap-1 mt-1.5">
            <Clock className="w-3 h-3 text-amber-500" />
            <span className="text-xs text-amber-500 font-medium">Expires: {offer.expiresAt}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function BusinessProfilePage() {
  const [shareClicked, setShareClicked] = useState(false);
  const [activeTab, setActiveTab] = useState<"links" | "offers">("links");

  const handleShare = () => {
    setShareClicked(true);
    setTimeout(() => setShareClicked(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Phone-width container for mobile feel */}
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-2xl shadow-gray-200/50 relative">
        {/* Cover / Hero */}
        <div
          className="relative h-52 overflow-hidden"
          style={{ background: MOCK_BUSINESS.coverGradient }}
        >
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full" />

          {/* Share + Powered by */}
          <div className="absolute top-4 right-4 left-4 flex justify-between items-start">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-white" />
              <span className="text-white text-xs font-semibold">OneQR</span>
            </div>
            <button
              onClick={handleShare}
              className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center"
            >
              {shareClicked ? (
                <Check className="w-4 h-4 text-white" />
              ) : (
                <Share2 className="w-4 h-4 text-white" />
              )}
            </button>
          </div>

          {/* Business name at bottom */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
            <div className="flex items-end gap-3">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center text-3xl flex-shrink-0">
                {MOCK_BUSINESS.logoEmoji}
              </div>
              <div>
                <p className="text-white/80 text-xs font-medium">{MOCK_BUSINESS.category}</p>
                <h1 className="text-white font-extrabold text-xl leading-tight">{MOCK_BUSINESS.name}</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="px-5 pt-4 pb-2">
          <StarRating rating={MOCK_BUSINESS.rating} count={MOCK_BUSINESS.reviewCount} />
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">{MOCK_BUSINESS.description}</p>

          {/* Address */}
          <div className="flex items-center gap-2 mt-3">
            <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-sm text-gray-600">{MOCK_BUSINESS.address}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5 mt-4">
          <div className="flex bg-gray-100 rounded-2xl p-1">
            {[
              { key: "links", label: "Links & Actions" },
              { key: "offers", label: `Offers (${MOCK_OFFERS.length})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as "links" | "offers")}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  activeTab === tab.key
                    ? "bg-white text-green-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-5 pt-4 pb-10 space-y-3">
          <AnimatePresence mode="wait">
            {activeTab === "links" ? (
              <motion.div
                key="links"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-3"
              >
                {/* Featured action — Google Review */}
                <div className="mb-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">⭐ Featured Action</p>
                  <LinkButton link={MOCK_LINKS[0]} index={0} />
                </div>

                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider pt-1">Quick Actions</p>
                {MOCK_LINKS.slice(1, 3).map((link, i) => (
                  <LinkButton key={link.platform} link={link} index={i + 1} />
                ))}

                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider pt-1">Social Media</p>
                {MOCK_LINKS.slice(3, 6).map((link, i) => (
                  <LinkButton key={link.platform} link={link} index={i + 3} />
                ))}

                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider pt-1">More</p>
                {MOCK_LINKS.slice(6).map((link, i) => (
                  <LinkButton key={link.platform} link={link} index={i + 6} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="offers"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                <p className="text-sm text-gray-500">🎉 Exclusive offers just for you!</p>
                {MOCK_OFFERS.map((offer, i) => (
                  <OfferCard key={offer.id} offer={offer} index={i} />
                ))}
                {MOCK_OFFERS.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <Gift className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No active offers right now</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Powered by footer */}
        <div className="px-5 py-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            Powered by{" "}
            <span className="font-bold text-green-600">OneQR</span>
            {" "}· Create your own{" "}
            <span className="text-green-600 font-semibold cursor-pointer hover:underline">free page →</span>
          </p>
        </div>
      </div>
    </div>
  );
}
